import React, { useState } from 'react';
import { ArrowLeft, Star, ArrowRight, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { MatchResult, PaymentMethod } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { calculateBackhaulPricing } from '../../services/pricingEngine';
import { calculateDistanceAndDuration } from '../../services/routingEngine';

interface BookingConfirmationProps {
  match: MatchResult;
  onConfirm: (match: MatchResult, method: PaymentMethod) => void;
  onBack: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ match, onConfirm, onBack }) => {
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

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px 0 48px' }} className="animate-fade-in">
      <button
        onClick={onBack}
        className="btn-outline-navy btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
      >
        <ArrowLeft size={15} />
        <span>Back to Matches</span>
      </button>

      <div
        className="card"
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase' }}>
            Review Backhaul Reservation
          </span>
          <h2 style={{ fontSize: '1.375rem', color: 'var(--brand-navy)', marginTop: '2px' }}>
            {match.load.from} → {match.load.to}
          </h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Departure: {match.trip.departureDate} ({match.trip.departureTimeWindow})
          </div>
        </div>

        {/* Driver & Vehicle Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px',
            backgroundColor: 'var(--surface-3)',
            borderRadius: '8px',
            marginBottom: '20px'
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
            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>Tomorrow, 08:00 AM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Est. Destination Delivery:</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>Tomorrow, 06:00 PM</span>
          </div>
        </div>

        {/* Total Price Header */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--brand-teal-light)',
            borderRadius: '8px',
            border: '1px solid rgba(29, 158, 117, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-teal)' }}>TOTAL ESCROW CHARGE</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-navy)' }}>Includes GST & Transit Insurance</div>
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--brand-teal)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {formatCurrency(totalAmount)}
          </div>
        </div>

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

        {/* Submit Action */}
        <button
          className="btn-primary-teal"
          onClick={() => onConfirm(match, selectedMethod)}
          id="confirm-and-pay-btn"
          style={{ width: '100%', height: '48px', fontSize: '1rem' }}
        >
          <span>Confirm & Proceed to Escrow Payment</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
