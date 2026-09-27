import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Star, Truck, Package } from 'lucide-react';
import { MatchResult, Booking, PaymentMethod } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';

interface BookingConfirmationProps {
  match: MatchResult; existingBooking?: Booking;
  onRequestBooking: (match: MatchResult) => void;
  onConfirmPayment: (match: MatchResult, method: PaymentMethod) => void;
  onBack: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ match, existingBooking, onRequestBooking, onConfirmPayment, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [busy, setBusy] = useState(false);

  const weightKg = match.load.weightUnit === 'CBM' ? match.load.weight * 250 : match.load.weight;
  const basePrice = match.calculatedPrice;
  const platformFee = Math.round(basePrice * 0.08);
  const insuranceFee = 150;
  const total = basePrice + platformFee + insuranceFee;

  // Status-driven — never allow payment before driver accepts.
  // existingBooking must be the booking for THIS load (resolved in App.tsx),
  // not just whatever selectedBookingId happens to be.
  const bookingStatus = existingBooking?.status;
  const isPendingDriver = bookingStatus === 'Pending Driver Acceptance';
  const isAwaitingPayment = bookingStatus === 'Awaiting Payment';
  const isPaid = bookingStatus === 'Booked' || bookingStatus === 'Picked Up' || bookingStatus === 'In Transit' || bookingStatus === 'Delivered';
  const hasRequested = !!existingBooking;

  const handleRequest = () => {
    if (busy || hasRequested) return;
    setBusy(true);
    try {
      onRequestBooking(match);
    } finally {
      // createPendingBooking navigates away to dashboard; keep busy until unmount
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', margin: 0 }}>Booking Confirmation</h1>
        <div />
      </div>

      <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        {/* Driver Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: 'var(--surface-3)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--brand-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>{match.trip.driverAvatarText}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1.0625rem' }}>{match.trip.driverName}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#BA7517' }}><Star size={14} fill="#BA7517" /><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{match.trip.driverRating}</span></div>
              <span className="status-pill status-in-transit" style={{ fontSize: '0.6875rem' }}><span className="status-dot-pulse" /><span>Verified Driver</span></span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <Truck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {match.trip.vehicleType} · Plate: <strong className="mono-text">{match.trip.vehiclePlate}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Match Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>{match.matchScore}%</div>
          </div>
        </div>

        {/* Route & Cargo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            ['Route', `${match.load.from} → ${match.load.to}`],
            ['Corridor', match.trip.corridor],
            ['Departure', `${match.trip.departureDate} · ${match.trip.departureTimeWindow}`],
            ['Cargo', match.load.goodsType],
            ['Weight', formatWeight(weightKg)],
            ['Driver Contact', match.trip.driverPhone],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--brand-navy)' }}>{value}</div>
            </div>
          ))}
        </div>

        {match.load.specialInstructions && (
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--brand-amber-light)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(186,117,23,0.2)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Package size={16} color="var(--brand-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--brand-navy)', margin: 0 }}>{match.load.specialInstructions}</p>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div style={{ backgroundColor: 'var(--surface-3)', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <ShieldCheck size={18} color="#1D9E75" />
            <h4 style={{ color: 'var(--brand-navy)', margin: 0 }}>Pricing Breakdown</h4>
          </div>
          {[
            ['Base Freight', formatCurrency(basePrice)],
            ['Platform Fee (8%)', formatCurrency(platformFee)],
            ['Cargo Insurance', formatCurrency(insuranceFee)],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span className="mono-text" style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--brand-navy)' }}>
            <span>Total (All-In)</span>
            <span className="mono-text" style={{ color: 'var(--brand-teal)', fontSize: '1.25rem' }}>{formatCurrency(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>vs spot rate: <span style={{ textDecoration: 'line-through' }}>{formatCurrency(match.marketPrice)}</span> &nbsp; <span style={{ color: 'var(--brand-teal)', fontWeight: 700 }}>Save {match.savingsPercentage}%</span></span>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>Payment Method for Escrow</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(['UPI', 'Card', 'Wallet'] as PaymentMethod[]).map(m => (
              <button key={m} type="button" onClick={() => setPaymentMethod(m)} style={{ flex: 1, minWidth: '100px', padding: '10px 16px', borderRadius: '8px', border: `2px solid ${paymentMethod === m ? 'var(--brand-teal)' : 'var(--border-color)'}`, backgroundColor: paymentMethod === m ? 'var(--brand-teal-light)' : 'var(--surface-2)', color: paymentMethod === m ? 'var(--brand-teal)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>{m}</button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onBack} className="btn-outline-navy" style={{ flex: 1, height: '48px' }}>Go Back</button>
          {!hasRequested ? (
            <button onClick={handleRequest} disabled={busy} className="btn-primary-teal" style={{ flex: 2, height: '48px', opacity: busy ? 0.7 : 1 }}>
              <ShieldCheck size={18} /><span>{busy ? 'Sending…' : 'Send Booking Request to Driver'}</span>
            </button>
          ) : isPendingDriver ? (
            <div style={{ flex: 2, padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--brand-amber-light)', border: '1px solid rgba(186,117,23,0.3)', fontSize: '0.875rem', color: 'var(--brand-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot-pulse" />
              <span>Request sent — waiting for driver to accept. Payment unlocks after acceptance.</span>
            </div>
          ) : isAwaitingPayment ? (
            <button onClick={() => onConfirmPayment(match, paymentMethod)} className="btn-primary-teal" style={{ flex: 2, height: '48px' }}>
              <ShieldCheck size={18} /><span>Confirm & Proceed to Payment</span>
            </button>
          ) : isPaid ? (
            <div style={{ flex: 2, padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--brand-teal-light)', border: '1px solid rgba(29,158,117,0.3)', fontSize: '0.875rem', color: 'var(--brand-teal)', fontWeight: 600 }}>
              Already paid — escrow locked. Open Live Tracking from dashboard.
            </div>
          ) : (
            <button onClick={handleRequest} disabled={busy} className="btn-primary-teal" style={{ flex: 2, height: '48px' }}>
              <ShieldCheck size={18} /><span>Send Booking Request to Driver</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
