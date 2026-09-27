import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { MatchResult, PaymentMethod } from '../../types/logistics';
import { formatCurrency } from '../../utils/formatting';
import confetti from 'canvas-confetti';

interface PaymentEscrowProps {
  match: MatchResult;
  onPaymentSuccess: (match: MatchResult, method: PaymentMethod) => void;
  onBack: () => void;
}

export const PaymentEscrow: React.FC<PaymentEscrowProps> = ({ match, onPaymentSuccess, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const total = match.calculatedPrice + Math.round(match.calculatedPrice * 0.08) + 150;

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    setDone(true);

    // Confetti celebration
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#1D9E75', '#BA7517', '#042C53', '#2DD4BF'] });

    setTimeout(() => onPaymentSuccess(match, paymentMethod), 1200);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', margin: 0 }}>Secure Payment Escrow</h1>
        <div />
      </div>

      <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div className="checkmark-pop" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={64} color="#1D9E75" style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ color: 'var(--brand-navy)', marginBottom: '8px' }}>Payment Secured!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>₹{total.toLocaleString()} locked in escrow. Activating live tracking…</p>
          </div>
        ) : (
          <>
            {/* Escrow info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--brand-teal-light)', borderRadius: '10px', marginBottom: '24px', border: '1px solid rgba(29,158,117,0.25)' }}>
              <Lock size={22} color="#1D9E75" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>RBI-Compliant Freight Escrow</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Funds are held securely — only released on confirmed delivery. Full refund if cancelled.</div>
              </div>
            </div>

            {/* Route summary */}
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: 'var(--surface-3)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '4px' }}>{match.load.from} → {match.load.to}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{match.trip.driverName} · {match.trip.vehicleType} · {match.load.goodsType} ({match.load.weight} {match.load.weightUnit})</div>
            </div>

            {/* Amount */}
            <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', backgroundColor: 'var(--surface-3)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Amount to Lock in Escrow</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(total)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>₹{match.calculatedPrice.toLocaleString()} freight + 8% platform fee + ₹150 insurance</div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>Choose Payment Method</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['UPI', 'Card', 'Wallet'] as PaymentMethod[]).map(m => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m)} style={{ flex: 1, padding: '14px 10px', borderRadius: '10px', border: `2px solid ${paymentMethod === m ? 'var(--brand-teal)' : 'var(--border-color)'}`, backgroundColor: paymentMethod === m ? 'var(--brand-teal-light)' : 'var(--surface-2)', color: paymentMethod === m ? 'var(--brand-teal)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 150ms ease' }}>
                    {m === 'UPI' ? '📱 UPI' : m === 'Card' ? '💳 Card' : '🏦 Bank'}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handlePay} disabled={processing} className="btn-primary-teal" style={{ width: '100%', height: '52px', fontSize: '1rem', opacity: processing ? 0.8 : 1 }}>
              <ShieldCheck size={20} />
              <span>{processing ? 'Processing Payment...' : `Lock ${formatCurrency(total)} in Escrow via ${paymentMethod}`}</span>
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
              Your payment is encrypted and protected. Funds only release on confirmed delivery.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
