import React from 'react';
import { Truck, Store, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

interface CtaFooterSectionProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
  onExploreMatching: () => void;
}

export const CtaFooterSection: React.FC<CtaFooterSectionProps> = ({ onSelectPersona, onExploreMatching }) => {
  const [bannerRef, bannerInView] = useInView<HTMLDivElement>(0.1);
  const [footerRef, footerInView] = useInView<HTMLDivElement>(0.05);

  return (
    <div>
      {/* CTA Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1D9E75 0%, #042C53 100%)',
          padding: '80px 0',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            ref={bannerRef}
            className={`scroll-fade-up${bannerInView ? ' in-view' : ''}`}
            style={{ maxWidth: '720px', margin: '0 auto' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '24px'
              }}
            >
              <Award size={16} />
              <span>India's Leading Bidirectional Freight Intelligence Network</span>
            </div>

            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: '16px', lineHeight: 1.2 }}>
              Ready to Optimize Your Logistics?
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem', marginBottom: '36px', lineHeight: 1.6 }}>
              Join thousands of heavy vehicle drivers and regional retailers profiting from automated return capacity matching today.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              <button
                onClick={() => onSelectPersona('driver')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#042C53',
                  padding: '14px 28px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 180ms ease, box-shadow 180ms ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
                }}
              >
                <Truck size={20} color="#1D9E75" />
                <span>I'm a Driver — Sign Up Free</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onSelectPersona('customer')}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #FFFFFF',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 180ms ease'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <Store size={20} color="#BA7517" />
                <span>I'm a Retailer — Book Capacity</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#042C53',
          color: 'rgba(255,255,255,0.8)',
          padding: '56px 0 28px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="container">
          {/* Footer columns with stagger animation */}
          <div
            ref={footerRef}
            className={`scroll-stagger-children${footerInView ? ' in-view' : ''}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              marginBottom: '48px'
            }}
          >
            {/* Col 1 — Brand */}
            <div style={{ '--stagger-index': 0 } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1D9E75', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  RF
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                  ReturnFlow
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                The intelligent backhaul freight marketplace converting deadhead commercial truck journeys into high-yield logistics corridor capacity.
              </p>
            </div>

            {/* Col 2 — For Drivers */}
            <div style={{ '--stagger-index': 1 } as React.CSSProperties}>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                For Drivers
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                {['Post Return Capacity', 'Earnings & UPI Payouts', 'Corridor Fuel Savings'].map(label => (
                  <li key={label}>
                    <a
                      onClick={() => onSelectPersona('driver')}
                      style={{ color: 'inherit', cursor: 'pointer', transition: 'color 150ms ease' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#1D9E75')}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    onClick={onExploreMatching}
                    style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Live Match Simulator
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 — For Retailers */}
            <div style={{ '--stagger-index': 2 } as React.CSSProperties}>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                For Retailers
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                {['Post Load Request', 'Escrow Guarantee', 'Corridor Rate Calculator', 'Enterprise Bulk Tonnage'].map(label => (
                  <li key={label}>
                    <a
                      onClick={() => onSelectPersona('customer')}
                      style={{ color: 'inherit', cursor: 'pointer', transition: 'color 150ms ease' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#BA7517')}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Platform */}
            <div style={{ '--stagger-index': 3 } as React.CSSProperties}>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Platform
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                {[
                  { label: 'How It Works', action: () => {} },
                  { label: 'Pricing & Fees', action: () => {} },
                  { label: 'Match Engine', action: onExploreMatching },
                  { label: 'Ops Admin', action: () => {} },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <a
                      onClick={action}
                      style={{ color: 'inherit', cursor: 'pointer', transition: 'color 150ms ease' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#1D9E75')}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5 — Security */}
            <div style={{ '--stagger-index': 4 } as React.CSSProperties}>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Security & Compliance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                {['RC & DL Document Verified', 'RBI-Compliant Escrow Trust', 'End-to-End Encrypted Platform'].map(label => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#1D9E75" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer bottom bar */}
          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.5)'
            }}
          >
            <div>© 2026 ReturnFlow Freight Intelligence Technologies. All rights reserved.</div>

            {/* Social icons row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {[
                { label: 'GitHub', icon: '⌥', href: 'https://github.com/Krish-30-01/ReturnFlow_Final' },
                { label: 'LinkedIn', icon: 'in', href: '#' },
                { label: 'Twitter', icon: '𝕏', href: '#' },
              ].map(({ label, icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.75rem', fontWeight: 700,
                    transition: 'background 150ms ease, color 150ms ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(29,158,117,0.25)';
                    (e.currentTarget as HTMLElement).style.color = '#1D9E75';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy Policy', 'Terms of Carriage', 'GST Compliance'].map(label => (
                <span key={label} style={{ cursor: 'pointer', transition: 'color 150ms ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                  onMouseLeave={e => (e.currentTarget.style.color = '')}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
