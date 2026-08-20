import React from 'react';
import { Truck, Store, CheckCircle, ArrowRight, ShieldCheck, Zap, TrendingUp, Clock } from 'lucide-react';

interface DualPersonaSectionProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
}

export const DualPersonaSection: React.FC<DualPersonaSectionProps> = ({ onSelectPersona }) => {
  return (
    <section className="dual-persona-section" style={{ padding: '48px 0 64px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}
          >
            Tailored For Both Freight Sides
          </div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>
            Two Specialized Gateways, One Shared Economy
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
            Whether you command a 10-truck fleet or operate regional retail outlets, ReturnFlow eliminates friction on both ends of the freight line.
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px'
          }}
        >
          {/* Card A: For Drivers */}
          <div
            className="card card-hoverable"
            style={{
              borderTop: '4px solid var(--brand-teal)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              {/* Header Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--brand-teal-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-teal)'
                  }}
                >
                  <Truck size={32} />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--brand-teal)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    For Truck Owners & Fleet Drivers
                  </span>
                  <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', marginTop: '2px' }}>
                    Earn on Every Return
                  </h3>
                </div>
              </div>

              <p style={{ fontWeight: 500, color: 'var(--brand-navy)', marginBottom: '16px' }}>
                Turn empty return miles into predictable revenue.
              </p>

              {/* Bullet points */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle size={18} color="#1D9E75" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    <strong>Monetize 40% more capacity</strong> on return journeys without altering your scheduled route corridors.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle size={18} color="#1D9E75" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    <strong>Real-time matching</strong> with pre-verified regional retail shippers ready for instant loading.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle size={18} color="#1D9E75" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    <strong>Instant Escrow settlements</strong> deposited to your UPI/bank directly upon confirmed delivery.
                  </span>
                </li>
              </ul>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--brand-teal-light)',
                    color: 'var(--brand-teal)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Zap size={12} /> Fast Matching
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--brand-teal-light)',
                    color: 'var(--brand-teal)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <TrendingUp size={12} /> Auto Routing
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--brand-teal-light)',
                    color: 'var(--brand-teal)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={12} /> Secure Payments
                </span>
              </div>
            </div>

            <button
              className="btn-primary-teal"
              onClick={() => onSelectPersona('driver')}
              id="dual-driver-cta"
              style={{ width: '100%', height: '44px' }}
            >
              <span>Join as Driver Partner</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Card B: For Retailers */}
          <div
            className="card card-hoverable"
            style={{
              borderTop: '4px solid var(--brand-amber)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              {/* Header Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--brand-amber-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-amber)'
                  }}
                >
                  <Store size={32} />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--brand-amber)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    For Retailers & B2B Shippers
                  </span>
                  <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', marginTop: '2px' }}>
                    Save 35% on Shipping
                  </h3>
                </div>
              </div>

              <p style={{ fontWeight: 500, color: 'var(--brand-navy)', marginBottom: '16px' }}>
                Access cross-state freight corridors affordably.
              </p>

              {/* Bullet points */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle size={18} color="#BA7517" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    <strong>Connect with active commercial routes</strong> passing right by your pickup hub daily.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle size={18} color="#BA7517" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    <strong>Predictable, transparent backhaul pricing</strong> with zero hidden broker commissions.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle size={18} color="#BA7517" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    <strong>Live GPS corridor tracking</strong> with automated checkpoint telemetry from dock to door.
                  </span>
                </li>
              </ul>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--brand-amber-light)',
                    color: 'var(--brand-amber)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <TrendingUp size={12} /> 35% Price Cut
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--brand-amber-light)',
                    color: 'var(--brand-amber)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={12} /> Flexible Schedule
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--brand-amber-light)',
                    color: 'var(--brand-amber)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={12} /> Live Tracking
                </span>
              </div>
            </div>

            <button
              className="btn-primary-amber"
              onClick={() => onSelectPersona('customer')}
              id="dual-retailer-cta"
              style={{ width: '100%', height: '44px' }}
            >
              <span>Join as Business Retailer</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
