import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, ShieldCheck, ArrowRight, Store, IndianRupee } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

interface StepData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  metric: string;
  metricLabel: string;
}

const STEPS: StepData[] = [
  {
    id: 1,
    title: 'Select Route',
    subtitle: 'Post forward or return capacity',
    description: 'You select your corridor (e.g. Hyderabad → Warangal or Delhi → Bangalore) and specify available return tonnage in under 60 seconds.',
    metric: '30+ Tons',
    metricLabel: 'Corridor Capacity Analyzed'
  },
  {
    id: 2,
    title: 'Match Instantly',
    subtitle: 'Bidirectional AI calculation',
    description: 'Our engine scans active regional retailer requests along your transit line, computing route overlap, time windows, and instant match scores.',
    metric: '2.1 Sec',
    metricLabel: 'Average Match Computation'
  },
  {
    id: 3,
    title: 'Confirm Booking',
    subtitle: 'Locked escrow & guaranteed terms',
    description: 'You confirm cargo specifications, pickup docks, and transparent freight pricing with funds secured in tamper-proof escrow before departure.',
    metric: '100%',
    metricLabel: 'Escrow Payment Protection'
  },
  {
    id: 4,
    title: 'Track & Earn',
    subtitle: 'Live GPS telemetry & instant payout',
    description: 'Track shipment progress in real time across corridor checkpoints. The moment delivery is confirmed, funds instantly settle into your account.',
    metric: '₹28,450+',
    metricLabel: 'Avg Monthly Backhaul Unlocked'
  }
];

export const HowItWorksStepper: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [headerRef, headerInView] = useInView<HTMLDivElement>();
  const [contentRef, contentInView] = useInView<HTMLDivElement>(0.1);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleManualStepSelect = (stepId: number) => {
    setActiveStep(stepId);
    setIsAutoPlaying(false);
    // Resume auto-play after 12s idle
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  return (
    <section className="how-it-works-section" style={{ padding: '64px 0', backgroundColor: 'var(--surface-3)' }}>
      <div className="container">
        {/* Section Title */}
        <div
          ref={headerRef}
          className={`scroll-fade-up${headerInView ? ' in-view' : ''}`}
          style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}
        >
          <div className="eyebrow-pill eyebrow-pill-teal" style={{ marginBottom: '12px' }}>
            <Cpu size={13} />
            <span>HOW IT WORKS</span>
          </div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>
            Demystifying the Backhaul Matching Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            From listing spare tonnage to automated escrow payout in 4 seamless stages.
          </p>
        </div>

        {/* Stepper Container */}
        <div
          ref={contentRef}
          className={`scroll-fade-up${contentInView ? ' in-view' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'center',
            transitionDelay: '100ms',
          }}
        >
          {/* Left Column: Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isPast = activeStep > step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => handleManualStepSelect(step.id)}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-card)',
                    cursor: 'pointer',
                    transition: 'all var(--dur-base) var(--ease-out)',
                    backgroundColor: isActive ? 'var(--surface-2)' : 'transparent',
                    border: isActive ? '1.5px solid var(--brand-teal)' : '1px solid var(--border-color)',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Step Number Dot */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        flexShrink: 0,
                        backgroundColor: isActive
                          ? 'var(--brand-teal)'
                          : isPast
                          ? 'var(--brand-teal-light)'
                          : 'var(--bg-secondary)',
                        color: isActive
                          ? '#FFFFFF'
                          : isPast
                          ? 'var(--brand-teal)'
                          : 'var(--text-secondary)'
                      }}
                    >
                      {isPast ? '✓' : step.id}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3
                          style={{
                            fontSize: '1.125rem',
                            color: isActive ? 'var(--brand-navy)' : 'var(--text-primary)',
                            fontWeight: 600
                          }}
                        >
                          {step.title}
                        </h3>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--brand-teal)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
                          lineHeight: 1.5
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Interactive Visualization */}
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Stat Ribbon */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Stage {activeStep} of 4
                </span>
                <h4 style={{ color: 'var(--brand-navy)', fontSize: '1.25rem' }}>{STEPS[activeStep - 1].title}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--brand-teal)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {STEPS[activeStep - 1].metric}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {STEPS[activeStep - 1].metricLabel}
                </div>
              </div>
            </div>

            {/* Stage Visualizations */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeStep === 1 && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '24px',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PRIMARY FORWARD LEG</div>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Hyderabad (Shamshabad)</div>
                      </div>
                      <ArrowRight color="#1D9E75" size={24} />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DESTINATION</div>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Bangalore (Peenya Hub)</div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'var(--surface-2)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1.5px dashed var(--brand-teal)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-teal)' }}>
                        Monetizable Return Capacity:
                      </span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-navy)' }}>
                        12,500 Kg (12.5 Tons)
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Corridor: <strong>NH44 Freight Expressway</strong> (569 Km)
                  </p>
                </div>
              )}

              {activeStep === 2 && (
                <div style={{ width: '100%' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                        Corridor Demand Scanned
                      </span>
                      <span className="match-score-badge match-high">94% Backhaul Fit</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div
                        style={{
                          background: 'var(--surface-2)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Store size={16} color="#BA7517" />
                          <span style={{ fontSize: '0.875rem' }}>Apex Retail: 400 Kg Fixtures</span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-teal)' }}>+₹2,300</span>
                      </div>

                      <div
                        style={{
                          background: 'var(--surface-2)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Store size={16} color="#BA7517" />
                          <span style={{ fontSize: '0.875rem' }}>Deccan Grocers: 2.5 Tons Spices</span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-teal)' }}>+₹8,800</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border-color)',
                      padding: '20px',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <ShieldCheck size={22} color="#1D9E75" />
                      <h5 style={{ color: 'var(--brand-navy)', margin: 0 }}>Escrow Agreement #RET-8849</h5>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                      <span>Calculated Freight Base:</span>
                      <span className="mono-text" style={{ fontWeight: 600 }}>₹7,800</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                      <span>Platform Fee (8% on shipper):</span>
                      <span className="mono-text" style={{ fontWeight: 600 }}>₹624</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                      <span>Escrow Disbursement (2.5%):</span>
                      <span className="mono-text" style={{ fontWeight: 600 }}>₹195</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, fontSize: '1rem', color: 'var(--brand-navy)' }}>
                      <span>Total Held in Escrow:</span>
                      <span className="mono-text" style={{ color: 'var(--brand-teal)' }}>₹7,995</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-teal-light) 0%, var(--brand-amber-light) 100%)',
                      padding: '24px',
                      borderRadius: '12px',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <CheckCircle2 size={24} color="#1D9E75" />
                      <span style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1.125rem' }}>
                        Delivery Verified & Settled
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
                      GPS geofence confirmed dock arrival at 11:15 AM.
                    </p>
                    <div
                      style={{
                        background: '#FFFFFF',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <IndianRupee size={16} color="#1D9E75" />
                      <span style={{ fontWeight: 700, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>
                        ₹7,800 Transferred to Driver UPI
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '2px',
                marginTop: '20px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(activeStep / 4) * 100}%`,
                  backgroundColor: 'var(--brand-teal)',
                  transition: 'width var(--dur-base) var(--ease-out)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
