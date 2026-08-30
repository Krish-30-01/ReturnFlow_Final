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
    <section className="hero-section" style={{ padding: '64px 0 48px', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
      {/* Background soft gradient accents */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '48px'
          }}
        >
          {/* Left Column */}
          <div
            ref={leftRef}
            className={`scroll-slide-left${leftInView ? ' in-view' : ''}`}
            style={{ maxWidth: '640px' }}
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
                <span>Vahan-Verified Fleet Registry</span>
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
                : <div><HighwayCorridorTelemetryMap /></div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

