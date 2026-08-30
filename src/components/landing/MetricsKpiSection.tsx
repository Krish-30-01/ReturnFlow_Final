import React from 'react';
import { Package, Wallet, Users, CheckCircle } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from '../../hooks/useInView';

const MetricCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  accent: 'teal' | 'amber';
  index: number;
  inView: boolean;
}> = ({ icon, iconBg, iconColor, value, label, accent, index, inView }) => (
  <div
    className={`card card-hoverable scroll-fade-up${inView ? ' in-view' : ''}`}
    style={{
      borderRadius: 'var(--radius-card)',
      padding: '28px 24px',
      textAlign: 'center',
      transitionDelay: `${index * 100}ms`,
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
      style={{ fontSize: '2.25rem', fontWeight: 800 }}
    >
      {value}
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

export const MetricsKpiSection: React.FC = () => {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  // Only start counting once the section is on screen
  const tons    = useCountUp(inView ? 2.3  : 0, 1800, 1);
  const valueCr = useCountUp(inView ? 420  : 0, 1800, 0);
  const drivers = useCountUp(inView ? 15   : 0, 1800, 0);
  const onTime  = useCountUp(inView ? 98.2 : 0, 1800, 1);

  return (
    <section
      ref={sectionRef}
      className="metrics-kpi-section"
      style={{
        backgroundColor: 'var(--metrics-bg, var(--brand-teal-light))',
        borderTop: '1px solid var(--metrics-border, rgba(4,44,83,0.10))',
        borderBottom: '1px solid var(--metrics-border, rgba(4,44,83,0.10))',
        padding: '56px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mesh accent — only visible in dark mode */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px', width: '400px', height: '400px',
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 65%)',
        filter: 'blur(50px)',
      }} />
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          <MetricCard index={0} accent="teal"  inView={inView} icon={<Package size={22} />}    iconBg="var(--brand-teal-light)"  iconColor="var(--brand-teal)"  value={`${tons}M`}      label="Tons Cargo Transported" />
          <MetricCard index={1} accent="amber" inView={inView} icon={<Wallet size={22} />}     iconBg="var(--brand-amber-light)" iconColor="var(--brand-amber)" value={`₹${valueCr}Cr`} label="Value Unlocked for Drivers" />
          <MetricCard index={2} accent="teal"  inView={inView} icon={<Users size={22} />}      iconBg="var(--brand-teal-light)"  iconColor="var(--brand-teal)"  value={`${drivers}K+`}  label="Active Driver Partners" />
          <MetricCard index={3} accent="teal"  inView={inView} icon={<CheckCircle size={22} />} iconBg="var(--brand-teal-light)" iconColor="var(--brand-teal)"  value={`${onTime}%`}    label="On-Time Delivery Rate" />
        </div>
      </div>
    </section>
  );
};
