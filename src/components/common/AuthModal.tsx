import React, { useState } from 'react';
import { X, Truck, Store, Mail, Lock, User as UserIcon, Phone, Building2, ShieldCheck } from 'lucide-react';
import { isLiveBackend } from '../../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  initialRole: 'driver' | 'customer';
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (input: { email: string; password: string; name: string; phone?: string; company?: string; role: 'driver' | 'customer' }) => Promise<void>;
  onDemoContinue: (role: 'driver' | 'customer' | 'admin') => void;
}

type Mode = 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialRole, onClose, onSignIn, onSignUp, onDemoContinue }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<'driver' | 'customer'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const roleColor = role === 'driver' ? 'var(--brand-teal)' : 'var(--brand-amber)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await onSignIn(email.trim(), password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setBusy(false);
          return;
        }
        await onSignUp({ email: email.trim(), password, name: name.trim(), phone: phone.trim() || undefined, company: company.trim() || undefined, role });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputWrap: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '10px 12px',
    backgroundColor: 'var(--surface-3)'
  };
  const inputStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    flex: 1,
    fontSize: '0.875rem'
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 12, 27, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in auth-modal-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--surface-2)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          padding: '28px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              One platform for return-trip backhaul freight.
            </p>
          </div>
          <button onClick={onClose} className="btn-outline-navy btn-sm" style={{ width: '30px', height: '30px', padding: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          {([
            { key: 'driver' as const, label: 'Truck Driver / Fleet', icon: <Truck size={16} /> },
            { key: 'customer' as const, label: 'Retailer / Shipper', icon: <Store size={16} /> }
          ]).map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 10px',
                borderRadius: '12px',
                border: `2px solid ${role === r.key ? roleColor : 'var(--border-color)'}`,
                backgroundColor: role === r.key ? (r.key === 'driver' ? 'rgba(29,158,117,0.08)' : 'rgba(186,117,23,0.08)') : 'transparent',
                color: role === r.key ? roleColor : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        {/* Toggle sign in / sign up */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }}
        >
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: mode === m ? 'var(--surface-2)' : 'transparent',
                color: mode === m ? 'var(--brand-navy)' : 'var(--text-secondary)',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <>
              <div style={inputWrap}>
                <UserIcon size={16} color="var(--text-secondary)" />
                <input style={inputStyle} placeholder={role === 'driver' ? 'Full name (e.g. Rajesh Kumar)' : 'Full name (e.g. Priya Sharma)'} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: company !== undefined ? '1fr 1fr' : '1fr', gap: '12px' }}>
                <div style={inputWrap}>
                  <Phone size={16} color="var(--text-secondary)" />
                  <input style={inputStyle} placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                {role === 'customer' && (
                  <div style={inputWrap}>
                    <Building2 size={16} color="var(--text-secondary)" />
                    <input style={inputStyle} placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                )}
              </div>
            </>
          )}

          <div style={inputWrap}>
            <Mail size={16} color="var(--text-secondary)" />
            <input style={inputStyle} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div style={inputWrap}>
            <Lock size={16} color="var(--text-secondary)" />
            <input style={inputStyle} type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#B91C1C', borderRadius: '10px', padding: '10px 12px', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary"
            style={{
              marginTop: '4px',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              cursor: busy ? 'wait' : 'pointer',
              background: 'linear-gradient(135deg, #1D9E75 0%, #042C53 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9375rem'
            }}
          >
            {busy ? 'Please wait…' : mode === 'signin' ? `Sign In as ${role === 'driver' ? 'Driver' : 'Shipper'}` : `Create ${role === 'driver' ? 'Driver' : 'Shipper'} Account`}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0 12px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
          <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          OR
          <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Demo bypass */}
        <button
          type="button"
          onClick={() => onDemoContinue(role)}
          className="btn-outline-navy"
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.8438rem'
          }}
        >
          <ShieldCheck size={16} />
          Continue as demo {role} user
        </button>

        <p style={{ margin: '14px 0 0', fontSize: '0.6875rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          {isLiveBackend
            ? 'Secured by Supabase Auth · passwords are never stored by ReturnFlow.'
            : 'Offline demo mode — credentials stay in this browser only.'}
        </p>
      </div>
    </div>
  );
};
