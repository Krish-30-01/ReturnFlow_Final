import { supabase as supabaseAuth } from './supabaseClient';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
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

export interface AuthResult {
  user: AppUser;
  needsEmailConfirmation?: boolean;
}

const DEMO_SESSION_KEY = 'returnflow_demo_session_v1';

function readDemoSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (raw) return JSON.parse(raw) as AppUser;
  } catch { /* ignore */ }
  return null;
}

function writeDemoSession(user: AppUser | null) {
  try {
    if (user) localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(DEMO_SESSION_KEY);
  } catch { /* ignore */ }
}

const DEMO_CREDENTIALS: Record<string, { password: string; user: AppUser }> = {
  'driver@returnflow.in': {
    password: 'driver123',
    user: { id: 'drv-rajesh', email: 'driver@returnflow.in', name: 'Rajesh Kumar', phone: '+91 98490 23145', role: 'driver' }
  },
  'shipper@returnflow.in': {
    password: 'shipper123',
    user: { id: 'cust-priya', email: 'shipper@returnflow.in', name: 'Priya Sharma', company: 'Apex Retail Networks Pvt Ltd', phone: '+91 94401 55678', role: 'customer' }
  },
  'admin@returnflow.in': {
    password: 'admin123',
    user: { id: 'admin-ops', email: 'admin@returnflow.in', name: 'Platform Ops', role: 'customer' }
  },
};

// Reuses the singleton from supabaseClient.ts (avoids duplicate GoTrueClient warning).
// Demo credentials below are demo-mode only (used when no live backend is configured).

export const authService = {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    if (supabaseAuth) {
      const { data, error } = await supabaseAuth.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            phone: input.phone ?? '',
            company: input.company ?? '',
            role: input.role,
          }
        }
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Sign-up failed — no user returned');

      const needsConfirmation = !data.session;
      const user: AppUser = {
        id: data.user.id,
        email: input.email,
        name: input.name,
        phone: input.phone,
        company: input.company,
        role: input.role,
      };
      if (!needsConfirmation) writeDemoSession(user);
      return { user, needsEmailConfirmation: needsConfirmation };
    }

    // Demo mode
    const user: AppUser = {
      id: `user-${Date.now()}`,
      email: input.email,
      name: input.name,
      phone: input.phone,
      company: input.company,
      role: input.role,
    };
    writeDemoSession(user);
    return { user };
  },

  async signIn(email: string, password: string): Promise<AppUser> {
    if (supabaseAuth) {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Sign-in failed');
      const meta = data.user.user_metadata as Record<string, string> | undefined;
      const user: AppUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        name: meta?.name ?? email.split('@')[0],
        phone: meta?.phone,
        company: meta?.company,
        role: (meta?.role as 'driver' | 'customer') ?? 'customer',
      };
      writeDemoSession(user);
      return user;
    }

    // Demo mode
    const record = DEMO_CREDENTIALS[email.toLowerCase()];
    if (!record || record.password !== password) {
      throw new Error('Invalid email or password. Use demo credentials or continue as demo user.');
    }
    writeDemoSession(record.user);
    return record.user;
  },

  async signOut(): Promise<void> {
    writeDemoSession(null);
    if (supabaseAuth) {
      await supabaseAuth.auth.signOut().catch(() => {});
    }
  },

  async getSessionUser(): Promise<AppUser | null> {
    if (supabaseAuth) {
      const { data } = await supabaseAuth.auth.getSession().catch(() => ({ data: { session: null } }));
      if (data.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata as Record<string, string> | undefined;
        return {
          id: u.id,
          email: u.email ?? '',
          name: meta?.name ?? u.email ?? '',
          phone: meta?.phone,
          company: meta?.company,
          role: (meta?.role as 'driver' | 'customer') ?? 'customer',
        };
      }
    }
    return readDemoSession();
  }
};
