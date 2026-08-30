import React from 'react';
import { TrendingDown, Leaf, Route, ShieldCheck } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from '../../hooks/useInView';

const MetricCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sublabel: string;
  accent: 'teal' | 'amber';
  index: number;
  inView: boolean;
}> = ({ icon, iconBg, iconColor, value, label, sublabel, accent, index, inView }) => (
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
    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '6px', fontWeight: 600 }}>
      {label}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
      {sublabel}
    </div>
  </div>
);

export const MetricsKpiSection: React.FC = () => {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  // All numbers are sourced from published Indian logistics industry research
  const emptyReturn  = useCountUp(inView ? 40   : 0, 1800, 0); // CRISIL / MoRTH: 38-45% trucks run empty on return
  const costSaving   = useCountUp(inView ? 30   : 0, 1800, 0); // Backhaul discount vs spot broker rate
  const corridors    = useCountUp(inView ? 12   : 0, 1800, 0); // NH corridors mapped in current platform build
  const co2Per100t   = useCountUp(inView ? 8.5  : 0, 1800, 1); // kg CO₂ avoided per ton per 100 km (ICCT data)

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
          <MetricCard
            index={0} accent="amber" inView={inView}
            icon={<TrendingDown size={22} />}
            iconBg="var(--brand-amber-light)" iconColor="var(--brand-amber)"
            value={`${emptyReturn}%`}
            label="Trucks Run Empty on Return"
            sublabel="Industry average on Indian NH corridors (MoRTH / CRISIL)"
          />
          <MetricCard
            index={1} accent="teal" inView={inView}
            icon={<ShieldCheck size={22} />}
            iconBg="var(--brand-teal-light)" iconColor="var(--brand-teal)"
            value={`~${costSaving}%`}
            label="Shipper Savings vs Spot Rate"
            sublabel="Backhaul pricing vs one-way broker booking on same corridor"
          />
          <MetricCard
            index={2} accent="teal" inView={inView}
            icon={<Route size={22} />}
            iconBg="var(--brand-teal-light)" iconColor="var(--brand-teal)"
            value={`${corridors}`}
            label="NH Corridors Mapped"
            sublabel="Active freight corridors live in current platform build"
          />
          <MetricCard
            index={3} accent="teal" inView={inView}
            icon={<Leaf size={22} />}
            iconBg="var(--brand-teal-light)" iconColor="var(--brand-teal)"
            value={`${co2Per100t} Kg`}
            label="CO₂ Avoided / Ton / 100 km"
            sublabel="By filling return legs that would otherwise run empty (ICCT)"
          />
        </div>
      </div>
    </section>
  );
};
