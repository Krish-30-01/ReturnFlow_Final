import { supabase, isLiveBackend } from './supabaseClient';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  role: 'driver' | 'customer';
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  role: 'driver' | 'customer';
}

interface AuthResult {
  user: AppUser;
  needsEmailConfirmation: boolean;
}

// Fallback local session used when the app runs without a live backend,
// so the auth UX still works end-to-end in offline demo mode.
const DEMO_SESSION_KEY = 'returnflow_demo_session_v1';

function readDemoSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function writeDemoSession(user: AppUser | null) {
  try {
    if (user) localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // storage unavailable — ignore
  }
}

function mapSupabaseUser(raw: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AppUser {
  const meta = raw.user_metadata ?? {};
  return {
    id: raw.id,
    email: raw.email ?? '',
    name: (meta.name as string) || (raw.email ?? 'User').split('@')[0],
    company: meta.company as string | undefined,
    phone: meta.phone as string | undefined,
    role: meta.role === 'driver' ? 'driver' : 'customer'
  };
}

export const authService = {
  isLive: () => isLiveBackend && !!supabase,

  async signUp(input: SignUpInput): Promise<AuthResult> {
    if (!supabase || !isLiveBackend) {
      const user: AppUser = {
        id: input.role === 'driver' ? `drv-local-${Date.now()}` : `cust-local-${Date.now()}`,
        email: input.email,
        name: input.name,
        company: input.company,
        phone: input.phone,
        role: input.role
      };
      writeDemoSession(user);
      return { user, needsEmailConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name, phone: input.phone, company: input.company, role: input.role } }
    });
    if (error) throw new Error(error.message);

    if (data.user && data.session) {
      return { user: mapSupabaseUser(data.user), needsEmailConfirmation: false };
    }
    // Email confirmation pending — no active session yet
    return {
      user: {
        id: data.user?.id ?? `pending-${Date.now()}`,
        email: input.email,
        name: input.name,
        company: input.company,
        phone: input.phone,
        role: input.role
      },
      needsEmailConfirmation: true
    };
  },

  async signIn(email: string, password: string): Promise<AppUser> {
    if (!supabase || !isLiveBackend) {
      const existing = readDemoSession();
      const user: AppUser =
        existing && existing.email.toLowerCase() === email.toLowerCase()
          ? existing
          : {
              id: `local-${Date.now()}`,
              email,
              name: email.split('@')[0],
              role: 'customer'
            };
      writeDemoSession(user);
      return user;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign-in failed. Please try again.');
    return mapSupabaseUser(data.user);
  },

  async signOut(): Promise<void> {
    writeDemoSession(null);
    if (supabase && isLiveBackend) {
      await supabase.auth.signOut();
    }
  },

  async getSessionUser(): Promise<AppUser | null> {
    if (supabase && isLiveBackend) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) return mapSupabaseUser(data.session.user);
      } catch (err) {
        console.warn('Session restore failed', err);
      }
    }
    return readDemoSession();
  }
};
