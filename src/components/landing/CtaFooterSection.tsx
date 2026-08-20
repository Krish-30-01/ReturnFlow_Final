import React from 'react';
import { Truck, Store, ArrowRight, ShieldCheck, Award } from 'lucide-react';

interface CtaFooterSectionProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
  onExploreMatching: () => void;
}

export const CtaFooterSection: React.FC<CtaFooterSectionProps> = ({ onSelectPersona, onExploreMatching }) => {
  return (
    <div>
      {/* Banner Section */}
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
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.15)',
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

            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.125rem', marginBottom: '36px', lineHeight: 1.6 }}>
              Join thousands of heavy vehicle drivers and regional retailers profiting from automated return capacity matching today.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '16px'
              }}
            >
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
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
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
                  gap: '8px'
                }}
              >
                <Store size={20} color="#BA7517" />
                <span>I'm a Retailer — Book Capacity</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer
        style={{
          backgroundColor: '#042C53',
          color: 'rgba(255, 255, 255, 0.8)',
          padding: '56px 0 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              marginBottom: '48px'
            }}
          >
            {/* Col 1 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#1D9E75',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  RF
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                  ReturnFlow
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                The intelligent backhaul freight marketplace converting deadhead commercial truck journeys into high-yield logistics corridor capacity.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                For Drivers
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                <li><a onClick={() => onSelectPersona('driver')} style={{ color: 'inherit', cursor: 'pointer' }}>Post Return Capacity</a></li>
                <li><a onClick={() => onSelectPersona('driver')} style={{ color: 'inherit', cursor: 'pointer' }}>Earnings & UPI Payouts</a></li>
                <li><a onClick={() => onSelectPersona('driver')} style={{ color: 'inherit', cursor: 'pointer' }}>Corridor Fuel Savings</a></li>
                <li><a onClick={onExploreMatching} style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 600 }}>Live Match Simulator</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                For Retailers
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                <li><a onClick={() => onSelectPersona('customer')} style={{ color: 'inherit', cursor: 'pointer' }}>Post Load Request</a></li>
                <li><a onClick={() => onSelectPersona('customer')} style={{ color: 'inherit', cursor: 'pointer' }}>Escrow Guarantee</a></li>
                <li><a onClick={() => onSelectPersona('customer')} style={{ color: 'inherit', cursor: 'pointer' }}>Corridor Rate Calculator</a></li>
                <li><a onClick={() => onSelectPersona('customer')} style={{ color: 'inherit', cursor: 'pointer' }}>Enterprise Bulk Tonnage</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Security & Compliance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#1D9E75" />
                  <span>Vahan RC & DL API Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#1D9E75" />
                  <span>RBI Compliant Escrow Trust</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#1D9E75" />
                  <span>ISO 27001 Certified Platform</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <div>© 2026 ReturnFlow Freight Intelligence Technologies. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Carriage</span>
              <span>GST Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
