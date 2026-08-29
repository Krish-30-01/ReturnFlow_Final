import React from 'react';
import { ArrowLeft, Edit3, Package } from 'lucide-react';
import { Trip } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';

interface TripDetailsProps {
  trip: Trip;
  onBack: () => void;
  onNavigateToTracking?: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ trip, onBack, onNavigateToTracking: _onNavigateToTracking }) => {
  const percentBooked = Math.min(100, Math.round((trip.bookedCapacityKg / trip.totalCapacityKg) * 100));
  const availableKg = trip.totalCapacityKg - trip.bookedCapacityKg;

  return (
    <div className="trip-details-view animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          className="btn-outline-navy btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <button className="btn-outline-teal btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Edit3 size={16} />
          <span>Edit Trip Listing</span>
        </button>
      </div>

      {/* Main Single Card with 2-Column Body */}
      <div
        className="card card-teal"
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Card Header */}
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
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Scheduled Return Backhaul Route
            </div>
            <h2 style={{ fontSize: '1.625rem', color: 'var(--brand-navy)', marginTop: '4px' }}>
              {trip.from} → {trip.to}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Corridor ID: <strong className="mono-text">{trip.corridor}</strong> · Trip Ref: #{trip.id.toUpperCase()}
            </div>
          </div>

          <span className="status-pill status-in-transit" style={{ fontSize: '0.8125rem' }}>
            <span className="status-dot-pulse" />
            <span>{trip.bookedLoads.length > 0 ? 'Active Backhaul Booking' : 'Searching for Shippers'}</span>
          </span>
        </div>

        {/* 2-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}
        >
          {/* Left Column: Trip Facts */}
          <div>
            <h3 style={{ fontSize: '1.0625rem', color: 'var(--brand-navy)', marginBottom: '16px' }}>
              Trip Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Departure Schedule</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {trip.departureDate} ({trip.departureTimeWindow})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vehicle & Plate</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>
                  {trip.vehicleType} ({trip.vehiclePlate})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Rated Capacity</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {formatWeight(trip.totalCapacityKg)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Preferred Cargo Type</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {trip.preferredLoadType}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Reserve Price (₹)</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(trip.minPrice)}
                </span>
              </div>

              {trip.notes && (
                <div style={{ padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Driver Notes:</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>{trip.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Capacity Fill Bar & Booked Loads */}
          <div>
            <h3 style={{ fontSize: '1.0625rem', color: 'var(--brand-navy)', marginBottom: '16px' }}>
              Capacity Utilization & Booked Cargo
            </h3>

            {/* Horizontal Capacity Bar */}
            <div
              style={{
                backgroundColor: 'var(--surface-3)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  Payload Fill Rate
                </span>
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--brand-teal)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {percentBooked}% ({formatWeight(trip.bookedCapacityKg)} / {formatWeight(trip.totalCapacityKg)})
                </span>
              </div>

              {/* Bar Track */}
              <div
                style={{
                  height: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: `${percentBooked}%`,
                    height: '100%',
                    backgroundColor: 'var(--brand-teal)',
                    borderRadius: '6px',
                    transition: 'width 0.8s ease-out'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <span>Remaining Spare: <strong>{formatWeight(availableKg)}</strong></span>
                <span>Fuel Cost Split: <strong>100% Monetized</strong></span>
              </div>
            </div>

            {/* Booked Loads List */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-navy)', marginBottom: '10px' }}>
                Matched & Booked Shipper Consignments ({trip.bookedLoads.length}):
              </div>

              {trip.bookedLoads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--surface-3)', borderRadius: '8px' }}>
                  <Package size={24} color="var(--text-secondary)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    No loads booked yet. The matching engine is actively scanning regional shippers along this corridor.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {trip.bookedLoads.map((load) => (
                    <div
                      key={load.id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.875rem' }}>
                          {load.from} → {load.to}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {load.shipperName} · {load.goodsType} · <strong>{formatWeight(load.weightKg)}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>
                          +{formatCurrency(load.price)}
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)' }}>In Escrow</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
