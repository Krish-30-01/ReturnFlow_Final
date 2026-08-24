import React from 'react';
import { Package, Wallet, Users, CheckCircle } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

const MetricCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  accent: 'teal' | 'amber';
  index: number;
}> = ({ icon, iconBg, iconColor, value, label, accent, index }) => (
  <div
    className={`card card-${accent} card-hoverable animate-fade-in`}
    style={{
      borderRadius: 'var(--radius-card)',
      padding: '28px 24px',
      textAlign: 'center',
      animationDelay: `${index * 80}ms`,
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 14px',
        boxShadow: `0 4px 12px ${iconColor}22`,
      }}
    >
      {icon}
    </div>
    <div
      className={`stat-number gradient-stat-${accent}`}
      style={{
        fontSize: '2.25rem',
        fontWeight: 800
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

export const MetricsKpiSection: React.FC = () => {
  const tons    = useCountUp(2.3, 1800, 1);
  const valueCr = useCountUp(420, 1800, 0);
  const drivers = useCountUp(15, 1800, 0);
  const onTime  = useCountUp(98.2, 1800, 1);

  return (
    <section
      className="metrics-kpi-section"
      style={{
        backgroundColor: 'var(--brand-teal-light)',
        borderTop: '1px solid rgba(4, 44, 83, 0.10)',
        borderBottom: '1px solid rgba(4, 44, 83, 0.10)',
        padding: '56px 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          <MetricCard
            index={0}
            accent="teal"
            icon={<Package size={22} />}
            iconBg="var(--brand-teal-light)"
            iconColor="var(--brand-teal)"
            value={`${tons}M`}
            label="Tons Cargo Transported"
          />
          <MetricCard
            index={1}
            accent="amber"
            icon={<Wallet size={22} />}
            iconBg="var(--brand-amber-light)"
            iconColor="var(--brand-amber)"
            value={`₹${valueCr}Cr`}
            label="Value Unlocked for Drivers"
          />
          <MetricCard
            index={2}
            accent="teal"
            icon={<Users size={22} />}
            iconBg="var(--brand-teal-light)"
            iconColor="var(--brand-teal)"
            value={`${drivers}K+`}
            label="Active Driver Partners"
          />
          <MetricCard
            index={3}
            accent="teal"
            icon={<CheckCircle size={22} />}
            iconBg="var(--brand-teal-light)"
            iconColor="var(--brand-teal)"
            value={`${onTime}%`}
            label="On-Time Delivery Rate"
          />
        </div>
      </div>
    </section>
  );
};
