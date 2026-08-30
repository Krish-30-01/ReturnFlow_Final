import React, { useState } from 'react';
import { ArrowLeft, Star, ArrowRight, CreditCard, Wallet, Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { MatchResult, PaymentMethod, Booking } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { calculateBackhaulPricing } from '../../services/pricingEngine';
import { calculateDistanceAndDuration } from '../../services/routingEngine';

interface BookingConfirmationProps {
  match: MatchResult;
  existingBooking?: Booking | null;
  onRequestBooking?: (match: MatchResult) => void;
  onConfirmPayment?: (match: MatchResult, method: PaymentMethod) => void;
  onBack: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  match,
  existingBooking,
  onRequestBooking,
  onConfirmPayment,
  onBack
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');

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

  const insuranceFee = 150;
  const totalAmount = pricing.retailerBudget + insuranceFee;

  const isAwaitingPayment = existingBooking?.status === 'Awaiting Payment';

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px 0 48px' }} className="animate-fade-in">
      <button
        onClick={onBack}
        className="btn-outline-navy btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
      >
        <ArrowLeft size={15} />
        <span>Back</span>
      </button>

      <div
        className="card"
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)',
          position: 'sticky',
          top: '80px',
        }}
      >
        {/* Header */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {isAwaitingPayment ? (
              <span className="status-pill status-in-transit" style={{ fontSize: '0.75rem' }}>
                <span className="status-dot-pulse" />
                <span>Driver Accepted — Ready for Payment</span>
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase' }}>
                Step 1: Request Driver Acceptance
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.375rem', color: 'var(--brand-navy)', marginTop: '2px' }}>
            {match.load.from} → {match.load.to}
          </h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Departure: {match.trip.departureDate} ({match.trip.departureTimeWindow}) · Corridor: {match.trip.corridor}
          </div>
        </div>

        {/* Notice Strip */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: isAwaitingPayment ? 'var(--brand-teal-light)' : 'var(--surface-3)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.8125rem',
            color: 'var(--text-primary)'
          }}
        >
          {isAwaitingPayment ? (
            <>
              <ShieldCheck size={18} color="#1D9E75" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Driver Accepted:</strong> Driver {match.trip.driverName} has confirmed availability. Review pricing below and proceed to lock escrow funds.
              </div>
            </>
          ) : (
            <>
              <Clock size={18} color="#BA7517" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Two-Sided Safety:</strong> Submitting reserves your capacity on the vehicle. <strong>No payment is charged</strong> until driver {match.trip.driverName} explicitly accepts.
              </div>
            </>
          )}
        </div>

        {/* Driver & Vehicle Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px',
            backgroundColor: 'var(--surface-2)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-teal)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}
            >
              {match.trip.driverAvatarText}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>
                  {match.trip.driverName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#BA7517', fontSize: '0.75rem' }}>
                  <Star size={13} fill="#BA7517" />
                  <span>{match.trip.driverRating}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {match.trip.vehicleType} · <strong className="mono-text">{match.trip.vehiclePlate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Cargo & Times Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Consignment:</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{match.load.goodsType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Reserved Payload:</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{formatWeight(weightKg)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Est. Pickup:</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
              {match.trip.departureDate}, {match.trip.departureTimeWindow.split('–')[0].trim()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Est. Delivery:</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
              {match.trip.departureDate} (same-day) · ETA ~8–12 hrs
            </span>
          </div>
        </div>

        {/* Compact total header — full breakdown shown below */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--brand-teal-light)',
            borderRadius: '8px',
            border: '1px solid rgba(29, 158, 117, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-teal)' }}>
            All-In Total (see breakdown below)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(totalAmount)}
          </div>
        </div>

        {/* Price Breakdown — always visible before any action */}
        <div
          style={{
            backgroundColor: 'var(--surface-3)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Price Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Backhaul Freight (Driver Payout)</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(pricing.driverPayout)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Platform Fee (8%)</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(pricing.platformFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transit Cargo Insurance</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(insuranceFee)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                marginTop: '4px',
                borderTop: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              <span style={{ color: 'var(--brand-navy)' }}>Total You Pay</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-teal)' }}>{formatCurrency(totalAmount)}</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '2px', textAlign: 'right' }}>
              Spot market equivalent: <span style={{ textDecoration: 'line-through' }}>{formatCurrency(Math.round(totalAmount * 1.42))}</span>
              <span style={{ color: 'var(--brand-amber)', fontWeight: 700, marginLeft: '6px' }}>~{Math.round(((Math.round(totalAmount * 1.42) - totalAmount) / Math.round(totalAmount * 1.42)) * 100)}% saved</span>
            </div>
          </div>
        </div>

        {isAwaitingPayment ? (
          <>
            {/* Payment Method Segmented Control */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', marginBottom: '8px' }}>
                Select Escrow Payment Method:
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '4px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {(['UPI', 'Card', 'Wallet'] as PaymentMethod[]).map((method) => {
                  const isActive = selectedMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isActive ? 'var(--brand-teal)' : 'transparent',
                        color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease-out'
                      }}
                    >
                      {method === 'UPI' && <Smartphone size={14} />}
                      {method === 'Card' && <CreditCard size={14} />}
                      {method === 'Wallet' && <Wallet size={14} />}
                      <span>{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pay Action */}
            <button
              className="btn-primary-teal"
              onClick={() => onConfirmPayment?.(match, selectedMethod)}
              id="confirm-and-pay-btn"
              style={{ width: '100%', height: '48px', fontSize: '1rem' }}
            >
              <span>Proceed to Pay {formatCurrency(totalAmount)} Securely</span>
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          /* Request Booking Action */
          <button
            className="btn-primary-teal"
            onClick={() => onRequestBooking?.(match)}
            id="submit-booking-request-btn"
            style={{ width: '100%', height: '48px', fontSize: '1rem' }}
          >
            <span>Request Booking (Pending Driver Acceptance)</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
