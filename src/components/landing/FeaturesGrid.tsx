import React from 'react';
import { Route, TrendingUp, Lock, ShieldCheck, Navigation, Receipt } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

const FEATURES = [
  { id: 1, title: 'Real-time Route Matching', description: 'Instant corridor alignment algorithms match spare truck capacity with regional retailer orders along exact highway vectors.', icon: <Route size={22} />, iconBg: 'var(--brand-teal-light)', iconColor: 'var(--brand-teal)', badge: 'LIVE' as const },
  { id: 2, title: 'Predictive Demand Forecasting', description: 'Corridor-level heuristics estimate freight imbalances on return legs, adjusting capacity alerts and pricing split dynamically.', icon: <TrendingUp size={22} />, iconBg: 'var(--brand-teal-light)', iconColor: 'var(--brand-teal)', badge: 'BETA' as const },
  { id: 3, title: 'Secure Payment Escrow', description: 'Retailer funds remain safely locked until destination dock check-in, eliminating payment delays and bad debt.', icon: <Lock size={22} />, iconBg: 'rgba(4,44,83,0.1)', iconColor: 'var(--brand-navy)', badge: 'NEW' as const },
  { id: 4, title: 'Driver Verification & Checks', description: 'Vehicle RC, fitness certificate, insurance, and driver license checks — verified against government transport records before onboarding.', icon: <ShieldCheck size={22} />, iconBg: 'rgba(4,44,83,0.1)', iconColor: 'var(--brand-navy)', badge: undefined },
  { id: 5, title: 'GPS Tracking & Live Updates', description: 'Real-time telemetry, geofence status transitions, and corridor speed monitoring accessible by both driver and shipper.', icon: <Navigation size={22} />, iconBg: 'var(--brand-teal-light)', iconColor: 'var(--brand-teal)', badge: 'LIVE' as const },
  { id: 6, title: 'Automated Invoice & Settlement', description: 'GST e-waybill record generation and UPI/NEFT payout initiation upon dual-confirmed proof-of-delivery.', icon: <Receipt size={22} />, iconBg: 'var(--brand-amber-light)', iconColor: 'var(--brand-amber)', badge: 'NEW' as const },
];

export const FeaturesGrid: React.FC = () => {
  const [headerRef, headerInView] = useInView<HTMLDivElement>();
  const [gridRef, gridInView] = useInView<HTMLDivElement>(0.1);

  return (
    <section style={{ padding: '64px 0' }}>
      <div className="container">
        <div ref={headerRef} className={`scroll-fade-up${headerInView ? ' in-view' : ''}`} style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <div className="eyebrow-pill eyebrow-pill-navy" style={{ marginBottom: '12px' }}>ENTERPRISE LOGISTICS INFRASTRUCTURE</div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>Built for Scale, Trust, and High Velocity</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Proprietary tech designed to handle the complexity of 30+ ton cross-state highway logistics.</p>
        </div>
        <div ref={gridRef} className={`scroll-stagger-children${gridInView ? ' in-view' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {FEATURES.map((feat, idx) => (
            <div key={feat.id} className="card card-hoverable" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', '--stagger-index': idx } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: feat.iconBg, color: feat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.6s ease-in-out' }} className="feature-icon">{feat.icon}</div>
                {feat.badge && (
                  <span className={feat.badge === 'BETA' ? 'micro-badge-beta' : 'micro-badge-new'} style={{ marginLeft: 0, fontSize: '0.5625rem', padding: '3px 7px', ...(feat.badge === 'LIVE' ? { background: 'var(--brand-teal)', color: '#fff' } : {}) }}>
                    {feat.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', marginBottom: '8px', fontWeight: 600 }}>{feat.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
