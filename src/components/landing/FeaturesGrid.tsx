import React from 'react';
import { Route, TrendingUp, Lock, ShieldCheck, Navigation, Receipt } from 'lucide-react';

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  category: 'logistics' | 'security' | 'settlement';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: 'Real-time Route Matching',
    description: 'Instant corridor alignment algorithms match spare truck capacity with regional retailer orders along exact highway vectors.',
    category: 'logistics',
    icon: <Route size={22} />,
    iconBg: 'var(--brand-teal-light)',
    iconColor: 'var(--brand-teal)'
  },
  {
    id: 2,
    title: 'Predictive Demand Forecasting',
    description: 'Corridor-level AI estimates freight imbalances on return legs, adjusting capacity alerts and pricing split dynamically.',
    category: 'logistics',
    icon: <TrendingUp size={22} />,
    iconBg: 'var(--brand-teal-light)',
    iconColor: 'var(--brand-teal)'
  },
  {
    id: 3,
    title: 'Secure Payment Escrow',
    description: 'Retailer funds remain safely locked until destination dock check-in, eliminating payment delays and bad debt.',
    category: 'security',
    icon: <Lock size={22} />,
    iconBg: 'rgba(4, 44, 83, 0.1)',
    iconColor: 'var(--brand-navy)'
  },
  {
    id: 4,
    title: 'Driver Verification & Checks',
    description: 'Direct Vahan and Sarathi API verification on commercial vehicle RC, insurance, fitness certificates, and driver licenses.',
    category: 'security',
    icon: <ShieldCheck size={22} />,
    iconBg: 'rgba(4, 44, 83, 0.1)',
    iconColor: 'var(--brand-navy)'
  },
  {
    id: 5,
    title: 'GPS Tracking & Live Updates',
    description: 'Real-time telemetry, geofence status transitions, and corridor speed monitoring accessible by both driver and shipper.',
    category: 'logistics',
    icon: <Navigation size={22} />,
    iconBg: 'var(--brand-teal-light)',
    iconColor: 'var(--brand-teal)'
  },
  {
    id: 6,
    title: 'Automated Invoice & Settlement',
    description: 'Instant GST-compliant e-waybill generation and automated UPI/NEFT disbursements within seconds of proof-of-delivery.',
    category: 'settlement',
    icon: <Receipt size={22} />,
    iconBg: 'var(--brand-amber-light)',
    iconColor: 'var(--brand-amber)'
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="features-grid-section" style={{ padding: '64px 0' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}
          >
            ENTERPRISE LOGISTICS INFRASTRUCTURE
          </div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>
            Built for Scale, Trust, and High Velocity
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Proprietary tech designed to handle the complexity of 30+ ton cross-state highway logistics.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}
        >
          {FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="card card-hoverable"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all var(--dur-base) var(--ease-out)'
              }}
            >
              {/* Icon Container with hover spin */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: feat.iconBg,
                  color: feat.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.6s ease-in-out'
                }}
                className="feature-icon"
              >
                {feat.icon}
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    color: 'var(--brand-navy)',
                    marginBottom: '8px',
                    fontWeight: 600
                  }}
                >
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
