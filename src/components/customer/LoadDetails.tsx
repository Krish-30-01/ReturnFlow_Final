import React from 'react';
import { ArrowLeft, Edit3, Star } from 'lucide-react';
import { LoadRequest, Trip } from '../../types/logistics';
import { formatCurrency } from '../../utils/formatting';

interface LoadDetailsProps {
  load: LoadRequest;
  matchedTrip?: Trip;
  onBack: () => void;
  onBrowseMatches: (loadId: string) => void;
  onNavigateToTracking: () => void;
}

export const LoadDetails: React.FC<LoadDetailsProps> = ({
  load,
  matchedTrip,
  onBack,
  onBrowseMatches,
  onNavigateToTracking
}) => {
  const isBooked = load.status === 'Booked' || load.status === 'In Transit' || load.status === 'Delivered';

  return (
    <div className="load-details-view animate-fade-in" style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to Loads</span>
        </button>

        <button
          className="btn-outline-navy btn-sm"
          disabled={isBooked}
          title={isBooked ? "Can't edit after booking is confirmed" : "Edit consignment details"}
          style={{ opacity: isBooked ? 0.5 : 1, cursor: isBooked ? 'not-allowed' : 'pointer' }}
        >
          <Edit3 size={16} />
          <span>Edit Request</span>
        </button>
      </div>

      {/* Main Card */}
      <div
        className="card card-amber"
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '28px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Consignment Request Details
            </div>
            <h2 style={{ fontSize: '1.625rem', color: 'var(--brand-navy)', marginTop: '4px' }}>
              {load.from} → {load.to}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Ref: <strong className="mono-text">#{load.id.toUpperCase()}</strong> · Created: {load.createdAt}
            </div>
          </div>

          <div>
            {load.status === 'Searching' && (
              <span className="status-pill status-searching" style={{ fontSize: '0.8125rem' }}>
                <span className="status-dot-pulse" />
                <span>Searching</span>
              </span>
            )}
            {(load.status === 'Booked' || load.status === 'In Transit') && (
              <span className="status-pill status-in-transit" style={{ fontSize: '0.8125rem' }}>
                <span className="status-dot-pulse" />
                <span>{load.status}</span>
              </span>
            )}
            {load.status === 'Delivered' && (
              <span className="status-pill status-delivered" style={{ fontSize: '0.8125rem' }}>
                <span className="status-dot-static" style={{ color: 'var(--brand-teal)' }} />
                <span>Delivered</span>
              </span>
            )}
          </div>
        </div>

        {/* Facts List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Cargo Type & Weight</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--brand-navy)', marginTop: '2px' }}>
              {load.goodsType} ({load.weight} {load.weightUnit})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Scheduled Pickup Window</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--brand-navy)', marginTop: '2px' }}>
              {load.date} · {load.timeWindow}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Budget Allocation</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {formatCurrency(load.budget)}
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {load.specialInstructions && (
          <div style={{ padding: '16px', backgroundColor: 'var(--surface-3)', borderRadius: '8px', marginBottom: '28px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Special Handling Notes:</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '4px' }}>{load.specialInstructions}</div>
          </div>
        )}

        {/* Matched Driver Summary Strip if Booked */}
        {isBooked ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--brand-teal-light)',
              borderRadius: '12px',
              border: '1px solid rgba(29, 158, 117, 0.3)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {matchedTrip?.driverAvatarText || 'RK'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1rem' }}>
                    {matchedTrip?.driverName || 'Rajesh Kumar'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#BA7517', fontSize: '0.8125rem' }}>
                    <Star size={14} fill="#BA7517" />
                    <span>{matchedTrip?.driverRating || 4.9}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Vehicle: <strong>{matchedTrip?.vehicleType || 'TATA Signa 3523'} ({matchedTrip?.vehiclePlate || 'TS-07-EA-9912'})</strong> · Verified Fleet
                </div>
              </div>
            </div>

            <button className="btn-primary-teal" onClick={onNavigateToTracking} style={{ height: '40px' }}>
              <span>Open Live Corridor Map</span>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn-primary-amber"
              onClick={() => onBrowseMatches(load.id)}
              style={{ padding: '12px 28px', height: '48px', fontSize: '1rem' }}
            >
              <span>Find &amp; Browse Backhaul Matches</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
