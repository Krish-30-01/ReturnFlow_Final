import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

const TESTIMONIALS = [
  { id: 1, quote: "Increased income by 28% in 3 months. Perfect for routes I was already running between Hyderabad and Bangalore anyway.", author: "Rajesh Kumar", role: "Fleet Owner, 12 Heavy Commercial Trucks", initials: "RK", persona: 'driver' as const, stars: 5 },
  { id: 2, quote: "Cut shipping costs from ₹5,000 to ₹3,200 per pallet. Game-changer for margins and we get live GPS checkpoint tracking.", author: "Priya Sharma", role: "Retail Logistics Manager, Apex Retail Hubs", initials: "PS", persona: 'customer' as const, stars: 5 },
  { id: 3, quote: "Payments are instant via UPI. No more waiting 30 to 45 days for invoice approvals. Verified shippers every single trip.", author: "Amit Patel", role: "Independent Driver, Mumbai–Pune Transit", initials: "AP", persona: 'driver' as const, stars: 5 },
];

export const TestimonialsCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [headerRef, headerInView] = useInView<HTMLDivElement>();
  const [carouselRef, carouselInView] = useInView<HTMLDivElement>(0.1);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => { setActiveIndex(prev => (prev + 1) % TESTIMONIALS.length); setContentKey(k => k + 1); }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goTo = (idx: number) => { setActiveIndex(idx); setContentKey(k => k + 1); };

  return (
    <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '64px 0' }}>
      <div className="container">
        <div ref={headerRef} className={`scroll-fade-up${headerInView ? ' in-view' : ''}`} style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>PROVEN ON INDIAN HIGHWAYS</div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '12px' }}>Trusted by Transporters & Retailers Alike</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Real impact delivered across 15,000+ driver partners and 400+ regional distribution hubs.</p>
        </div>

        <div ref={carouselRef} className={`scroll-fade-up${carouselInView ? ' in-view' : ''}`} style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', transitionDelay: '100ms' }}>
          <div className="card" style={{ padding: '40px', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-md)', position: 'relative' }}
            onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div style={{ position: 'absolute', top: '24px', right: '32px', opacity: 0.15 }}><Quote size={56} color="#042C53" /></div>

            <div key={contentKey} className="testimonial-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(TESTIMONIALS[activeIndex].stars)].map((_, i) => <Star key={i} size={18} fill="#BA7517" color="#BA7517" />)}
              </div>
              <p className="editorial-serif" style={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--text-navy)', lineHeight: 1.6, flex: 1 }}>
                "{TESTIMONIALS[activeIndex].quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: TESTIMONIALS[activeIndex].persona === 'driver' ? 'var(--brand-teal)' : 'var(--brand-amber)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0 }}>
                  {TESTIMONIALS[activeIndex].initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>{TESTIMONIALS[activeIndex].author}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{TESTIMONIALS[activeIndex].role}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '0 8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TESTIMONIALS.map((_, idx) => (
                <button key={idx} onClick={() => goTo(idx)} style={{ width: idx === activeIndex ? '28px' : '10px', height: '10px', borderRadius: '5px', backgroundColor: idx === activeIndex ? 'var(--brand-teal)' : 'var(--border-color)', transition: 'all var(--dur-snap) var(--ease-out)', padding: 0, border: 'none' }} aria-label={`Go to slide ${idx + 1}`} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(activeIndex === 0 ? TESTIMONIALS.length - 1 : activeIndex - 1)} className="btn-outline-navy btn-sm" style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }} aria-label="Previous"><ChevronLeft size={20} /></button>
              <button onClick={() => goTo((activeIndex + 1) % TESTIMONIALS.length)} className="btn-outline-navy btn-sm" style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }} aria-label="Next"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
