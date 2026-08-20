import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: {
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        backgroundColor: 'var(--surface-2)',
        color: 'var(--text-primary)',
        padding: '14px 20px',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-lg)',
        border: `1.5px solid ${
          isSuccess ? 'var(--brand-teal)' : isWarning ? 'var(--brand-coral)' : 'var(--brand-navy)'
        }`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        maxWidth: '420px'
      }}
    >
      {isSuccess && <CheckCircle2 size={20} color="#1D9E75" />}
      {isWarning && <AlertCircle size={20} color="#D85A30" />}
      {!isSuccess && !isWarning && <Info size={20} color="#042C53" />}
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.text}</span>
    </div>
  );
};
