import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, Truck, Store } from 'lucide-react';

interface PricingSectionProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPersona }) => {
  const [activeTab, setActiveTab] = useState<'driver' | 'customer'>('driver');

  return (
    <section className="pricing-section" style={{ padding: '64px 0 80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
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
            TRANSPARENT ECONOMICS
          </div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>
            Simple, Honest Freight Pricing
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            No hidden brokerage fees, no delayed payouts. Choose your role to explore rates.
          </p>

          {/* Persona Toggle */}
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-pill)',
              marginTop: '24px',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              onClick={() => setActiveTab('driver')}
              id="pricing-tab-driver"
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: activeTab === 'driver' ? 'var(--brand-teal)' : 'transparent',
                color: activeTab === 'driver' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--dur-snap) var(--ease-out)'
              }}
            >
              <Truck size={16} />
              <span>For Drivers</span>
            </button>

            <button
              onClick={() => setActiveTab('customer')}
              id="pricing-tab-customer"
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: activeTab === 'customer' ? 'var(--brand-amber)' : 'transparent',
                color: activeTab === 'customer' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--dur-snap) var(--ease-out)'
              }}
            >
              <Store size={16} />
              <span>For Retailers</span>
            </button>
          </div>
        </div>

        {/* Dynamic Pricing Content */}
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {activeTab === 'driver' ? (
            /* DRIVER PRICING CARD */
            <div
              className="card animate-fade-in"
              style={{
                maxWidth: '520px',
                margin: '0 auto',
                padding: '36px',
                border: '1.5px solid var(--brand-teal)',
                boxShadow: 'var(--shadow-md)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--brand-teal-light)',
                    color: 'var(--brand-teal)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  STANDARD DRIVER PLAN
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Zero Subscription</span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      color: 'var(--brand-teal)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    2.5%
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>per completed backhaul</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  No upfront cost, no minimum tonnage commitment. We only earn when you get paid.
                </p>
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: '16px 0',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {[
                  'Instant UPI / Bank settlement upon delivery confirmation',
                  'Real-time backhaul match notifications along active corridors',
                  'Full live GPS telemetry and automated checkpoint logging',
                  '24/7 dedicated transporter roadside assistance & support'
                ].map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9375rem' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--brand-teal-light)',
                        color: 'var(--brand-teal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                className="btn-primary-teal"
                onClick={() => onSelectPersona('driver')}
                style={{ width: '100%', height: '48px' }}
              >
                <span>Start Earning as Driver</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* RETAILER PRICING: STARTER & PREMIUM */
            <div
              className="animate-fade-in"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}
            >
              {/* Starter Tier */}
              <div
                className="card"
                style={{
                  padding: '32px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    STARTER (PAY PER LOAD)
                  </span>

                  <div style={{ margin: '16px 0 20px' }}>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'var(--brand-navy)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      ₹80 min + ₹8/km
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Best for occasional shipments and dynamic branch replenishment.
                    </p>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      'Access to all active return freight corridors',
                      'Instant match engine with transparent rating reviews',
                      'Standard cargo escrow protection up to ₹2 Lakhs',
                      'Live GPS checkpoint tracking updates'
                    ].map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <Check size={16} color="#BA7517" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="btn-outline-amber"
                  onClick={() => onSelectPersona('customer')}
                  style={{ width: '100%', height: '44px' }}
                >
                  <span>Post First Load</span>
                </button>
              </div>

              {/* Premium Tier */}
              <div
                className="card"
                style={{
                  padding: '32px',
                  border: '2px solid var(--brand-navy)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--surface-2)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    backgroundColor: 'var(--brand-amber)',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>HIGH-VOLUME REBATE</span>
                </div>

                <div>
                  <span
                    style={{
                      backgroundColor: 'var(--brand-amber-light)',
                      color: 'var(--brand-amber)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    PREMIUM ENTERPRISE
                  </span>

                  <div style={{ margin: '16px 0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '2.25rem',
                          fontWeight: 700,
                          color: 'var(--brand-navy)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        ₹4,999
                      </span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/ month</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Unlimited shipments up to 500 Kg each, prioritized return matching.
                    </p>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      'Unlimited loads up to 500 Kg with priority matching',
                      'Dedicated account manager & dispatch coordination',
                      'Extended insurance coverage up to ₹10 Lakhs',
                      'Predictive booking alerts for recurring routes',
                      'Monthly consolidated GST tax invoicing'
                    ].map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <Check size={16} color="#BA7517" />
                        <span style={{ fontWeight: idx < 2 ? 600 : 400 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="btn-primary-amber"
                  onClick={() => onSelectPersona('customer')}
                  style={{ width: '100%', height: '44px' }}
                >
                  <span>Get Premium Access</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
