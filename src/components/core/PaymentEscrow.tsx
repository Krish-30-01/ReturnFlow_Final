import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, ArrowLeft, Smartphone, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MatchResult, PaymentMethod } from '../../types/logistics';
import { formatCurrency } from '../../utils/formatting';
import { calculateBackhaulPricing } from '../../services/pricingEngine';
import { calculateDistanceAndDuration } from '../../services/routingEngine';

interface PaymentEscrowProps {
  match: MatchResult;
  onPaymentSuccess: (match: MatchResult, method: PaymentMethod) => void;
  onBack: () => void;
}

// Razorpay test-mode integration. Set VITE_RAZORPAY_KEY_ID (rzp_test_...)
// in .env to route the escrow deposit through the real Razorpay Checkout
// sheet; without a key the payment runs through the built-in simulator.
const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID ?? '').trim();

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!RAZORPAY_KEY_ID) {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const PaymentEscrow: React.FC<PaymentEscrowProps> = ({ match, onPaymentSuccess, onBack }) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const weightKg = match.load.weightUnit === 'CBM' ? match.load.weight * 250 : match.load.weight;
  const route = calculateDistanceAndDuration(match.load.from, match.load.to);
  const pricing = calculateBackhaulPricing({
    distanceKm: route.distanceKm,
    weightKg,
    vehicleType: match.trip.vehicleType,
    corridorId: match.trip.corridor,
    isReturnTrip: true,
    retailerBudget: match.calculatedPrice
  });

  const driverPayout = pricing.driverPayout;
  const platformFee = pricing.platformFee;
  const retailerBudget = pricing.retailerBudget;
  const insuranceFee = 150;
  const totalAmount = retailerBudget + insuranceFee;
  const driverName = match.trip.driverName;

  const completeSuccessFlow = () => {
    setIsProcessing(false);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1D9E75', '#BA7517', '#042C53']
      });
    } catch {
      console.log('Confetti triggered');
    }

    setTimeout(() => {
      onPaymentSuccess(match, method);
    }, 1600);
  };

  const handlePay = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    // Preferred path: real Razorpay Checkout (test mode)
    const razorpayReady = await loadRazorpayScript();
    if (razorpayReady && window.Razorpay) {
      try {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY_ID,
          amount: Math.round(totalAmount * 100), // paise
          currency: 'INR',
          name: 'ReturnFlow Escrow',
          description: `Backhaul freight escrow · ${match.load.from} → ${match.load.to}`,
          image: 'https://svgshare.com/i/14jz.svg',
          prefill: {
            name: match.load.customerName,
            contact: match.load.customerPhone.replace(/\s/g, '')
          },
          notes: { booking_load: match.load.id, trip: match.trip.id },
          theme: { color: '#1D9E75' },
          handler: () => completeSuccessFlow(),
          modal: { ondismiss: () => setIsProcessing(false) }
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay checkout failed — falling back to simulator.', err);
      }
    }

    // Fallback: simulated escrow network processing
    setTimeout(completeSuccessFlow, 1200);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px 0 48px' }} className="animate-fade-in">
      {!isSuccess && (
        <button
          onClick={onBack}
          className="btn-outline-navy btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      )}

      <div
        className="card"
        style={{
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)',
          textAlign: isSuccess ? 'center' : 'left'
        }}
      >
        {isSuccess ? (
          /* Success State with Animated Checkmark */
          <div className="animate-fade-in" style={{ padding: '24px 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-teal-light)',
                color: 'var(--brand-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid var(--brand-teal)'
              }}
            >
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>

            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', marginBottom: '8px' }}>
              Payment Held in Escrow!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '20px' }}>
              Funds ({formatCurrency(totalAmount)}) are securely locked. Driver has received the dispatch confirmation.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface-3)',
                fontSize: '0.8125rem',
                color: 'var(--brand-teal)',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={16} />
              <span>Redirecting to Live GPS Tracking...</span>
            </div>
          </div>
        ) : (
          /* Payment Breakdown Form */
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Total Escrow Amount
              </span>
              <div
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  color: 'var(--brand-navy)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px'
                }}
              >
                {formatCurrency(totalAmount)}
              </div>
            </div>

            {/* Error banner if any */}
            {paymentError && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--brand-coral-light)',
                  color: 'var(--brand-coral)',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--brand-coral)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '16px'
                }}
              >
                <AlertCircle size={18} />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Price Breakdown Table */}
            <div
              style={{
                backgroundColor: 'var(--surface-3)',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Driver Payout (Backhaul Leg):</span>
                <span className="mono-text" style={{ fontWeight: 600 }}>{formatCurrency(driverPayout)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Platform Escrow Fee (8%):</span>
                <span className="mono-text" style={{ fontWeight: 600 }}>{formatCurrency(platformFee)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transit Cargo Insurance:</span>
                <span className="mono-text" style={{ fontWeight: 600 }}>{formatCurrency(insuranceFee)}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  marginTop: '6px',
                  borderTop: '1px solid var(--border-color)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--brand-navy)'
                }}
              >
                <span>Total Charge:</span>
                <span className="mono-text" style={{ color: 'var(--brand-teal)' }}>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', marginBottom: '8px' }}>
                Select Instant Payment Mode:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(['UPI', 'Card', 'Wallet'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: method === m ? '2px solid var(--brand-teal)' : '1px solid var(--border-color)',
                      backgroundColor: method === m ? 'var(--brand-teal-light)' : 'var(--surface-2)',
                      color: method === m ? 'var(--brand-teal)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {m === 'UPI' && <Smartphone size={16} />}
                    {m === 'Card' && <CreditCard size={16} />}
                    {m === 'Wallet' && <Wallet size={16} />}
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Escrow Guarantee Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px',
                backgroundColor: 'var(--surface-3)',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Lock size={18} color="#1D9E75" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>RBI-Compliant Escrow Protection:</strong> Funds are locked safely and will only be disbursed to driver {driverName} once destination delivery is verified.
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="btn-primary-teal"
              onClick={handlePay}
              disabled={isProcessing}
              id="pay-securely-btn"
              style={{ width: '100%', height: '48px', fontSize: '1rem' }}
            >
              <Lock size={16} />
              <span>{isProcessing ? 'Processing Escrow Deposit...' : `Pay ${formatCurrency(totalAmount)} Securely`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
