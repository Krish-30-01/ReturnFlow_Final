import React, { useState } from 'react';
import { Truck, Store, ArrowRight, ShieldCheck, Zap, Calculator, Map } from 'lucide-react';
import { HighwayCorridorTelemetryMap } from './HighwayCorridorTelemetryMap';
import { LiveSavingsCalculator } from './LiveSavingsCalculator';
import { useInView } from '../../hooks/useInView';

interface HeroSectionProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
  onExploreMatching: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectPersona, onExploreMatching }) => {
  const [leftRef, leftInView]   = useInView<HTMLDivElement>(0.1);
  const [rightRef, rightInView] = useInView<HTMLDivElement>(0.1);
  const [rightTab, setRightTab] = useState<'calculator' | 'map'>('calculator');

  return (
    <section className="hero-section" style={{ padding: '64px 0 24px', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
      {/* Stripe-style gradient mesh backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Mesh blob 1 — teal top-right */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-40px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,158,117,0.18) 0%, rgba(2,132,199,0.09) 45%, transparent 70%)',
          filter: 'blur(48px)',
        }} />
        {/* Mesh blob 2 — amber mid-left */}
        <div style={{
          position: 'absolute', top: '30%', left: '-80px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(186,117,23,0.12) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }} />
        {/* Mesh blob 3 — navy bottom center */}
        <div style={{
          position: 'absolute', bottom: '-60px', left: '35%',
          width: '440px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(4,44,83,0.08) 0%, transparent 70%)',
          filter: 'blur(36px)',
        }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'flex-start',
            gap: '48px'
          }}
        >
          {/* Left Column */}
          <div
            ref={leftRef}
            className={`scroll-slide-left${leftInView ? ' in-view' : ''}`}
            style={{ maxWidth: '640px', paddingTop: '12px' }}
          >
            {/* Top Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--brand-teal-light)',
                color: 'var(--brand-teal)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '20px',
                border: '1px solid rgba(13, 148, 136, 0.2)'
              }}
            >
              <Zap size={14} />
              <span>Bidirectional Commercial Freight Platform</span>
            </div>

            {/* Headline H1 */}
            <h1
              style={{
                color: 'var(--text-navy)',
                marginBottom: '16px',
                lineHeight: 1.12,
                fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                fontWeight: 800
              }}
            >
              Monetize Every Return Mile with <span className="gradient-headline-teal">Dynamic Load Matching</span>
            </h1>

            {/* Subheadline */}
            <p
              className="lead"
              style={{
                fontSize: '1.125rem',
                color: 'var(--text-secondary)',
                marginBottom: '28px',
                lineHeight: 1.6
              }}
            >
              Commercial trucks run over 40% of return journeys empty. ReturnFlow connects spare return capacity with regional retailers across high-density corridors — turning deadhead miles into predictable profit margins.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '32px'
              }}
            >
              <button
                className="btn-primary-teal"
                onClick={() => onSelectPersona('driver')}
                id="hero-driver-cta"
                style={{ fontSize: '1rem', padding: '12px 24px', borderRadius: '8px' }}
              >
                <Truck size={20} />
                <span>I'm a Driver / Carrier</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn-outline-amber"
                onClick={() => onSelectPersona('customer')}
                id="hero-retailer-cta"
                style={{ fontSize: '1rem', padding: '12px 24px', borderRadius: '8px' }}
              >
                <Store size={20} />
                <span>I'm a Retailer / Shipper</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #E2E8F0',
                fontSize: '0.8125rem',
                color: '#64748B'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#0D9488" />
                <span>₹10L Freight Escrow Protection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#0D9488" />
                <span>Fleet & RC Document Verified</span>
              </div>
              <div
                onClick={onExploreMatching}
                style={{
                  color: '#0D9488',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Explore Matching Engine Live →
              </div>
            </div>
          </div>

          {/* Right Column — Tab toggle: Calculator | Live Map */}
          <div
            ref={rightRef}
            className={`scroll-fade-up${rightInView ? ' in-view' : ''}`}
            style={{ position: 'relative', transitionDelay: '150ms' }}
          >
            {/* Tab switcher pill — sits inside the card so there's no orphan gap */}
            <div style={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px 20px 0 0',
              borderBottom: 'none',
              padding: '12px 20px 0',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <div style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '3px',
                gap: '2px'
              }}>
                {([
                  { key: 'calculator', icon: <Calculator size={13} />, label: 'Savings Calculator' },
                  { key: 'map',        icon: <Map size={13} />,        label: 'Live Corridor Map'  },
                ] as const).map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setRightTab(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 180ms var(--ease-out)',
                      backgroundColor: rightTab === key ? 'var(--surface-2)' : 'transparent',
                      color: rightTab === key ? 'var(--brand-teal)' : 'var(--text-secondary)',
                      boxShadow: rightTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel — fade-swap between the two views */}
            <div key={rightTab} className="animate-fade-in-scale" style={{
              borderRadius: '0 0 20px 20px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              borderTop: 'none',
            }}>
              {rightTab === 'calculator'
                ? <LiveSavingsCalculator onSelectPersona={onSelectPersona} />
                : (
                  /* Linear-style dark terminal frame for the map */
                  <div className="terminal-frame" style={{ borderRadius: '0 0 20px 20px' }}>
                    <div className="terminal-frame-topbar">
                      <div className="terminal-frame-dots">
                        <span style={{ background: '#FF5F57' }} />
                        <span style={{ background: '#FEBC2E' }} />
                        <span style={{ background: '#28C840' }} />
                      </div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#868685', fontFamily: 'var(--font-mono)', letterSpacing: '0.4px' }}>
                        LIVE · NH CORRIDOR TELEMETRY
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#28C840', boxShadow: '0 0 6px #28C840' }} />
                        <span style={{ fontSize: '0.6rem', color: '#868685', fontFamily: 'var(--font-mono)' }}>CONNECTED</span>
                      </div>
                    </div>
                    <HighwayCorridorTelemetryMap />
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

