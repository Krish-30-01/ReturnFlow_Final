import React, { useState, useMemo } from 'react';
import { ArrowRight, Truck, Store, IndianRupee } from 'lucide-react';
import { calculateDistanceAndDuration } from '../../services/routingEngine';
import { calculateBackhaulPricing } from '../../services/pricingEngine';
import { useCountUp } from '../../hooks/useCountUp';

interface LiveSavingsCalculatorProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
}

export const LiveSavingsCalculator: React.FC<LiveSavingsCalculatorProps> = ({ onSelectPersona }) => {
  const [from, setFrom] = useState('Hyderabad');
  const [to, setTo] = useState('Bangalore');
  const [weight, setWeight] = useState(1000);

  const pricing = useMemo(() => {
    try {
      const route = calculateDistanceAndDuration(from, to);
      if (route.distanceKm <= 0) return null;
      return { ...calculateBackhaulPricing({ distanceKm: route.distanceKm, weightKg: weight, isReturnTrip: true }), distanceKm: route.distanceKm, corridorName: route.corridorName };
    } catch { return null; }
  }, [from, to, weight]);

  const animatedSavings = useCountUp(pricing ? pricing.marketPrice - pricing.retailerBudget : 0, 1200, 0);
  const animatedPrice = useCountUp(pricing?.retailerBudget ?? 0, 1000, 0);
  const animatedMarket = useCountUp(pricing?.marketPrice ?? 0, 1000, 0);

  // Derive percentage live from the animated values so it's always in sync
  const displayPct = animatedMarket > 0 ? Math.round(((animatedMarket - animatedPrice) / animatedMarket) * 100) : 0;

  return (
    <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 20px 20px', overflow: 'hidden' }}>
      {/* Header strip */}
      <div style={{ backgroundColor: 'var(--brand-teal-light)', padding: '12px 20px', borderBottom: '1px solid rgba(29,158,117,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IndianRupee size={16} color="var(--brand-teal)" />
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-teal)' }}>Live Backhaul Savings Calculator</span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Pickup City</label>
            <input className="form-input" value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g. Hyderabad" style={{ height: '38px', fontSize: '0.875rem' }} />
          </div>
          <ArrowRight size={18} color="var(--brand-teal)" style={{ marginTop: '18px', flexShrink: 0 }} />
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>Drop City</label>
            <input className="form-input" value={to} onChange={e => setTo(e.target.value)} placeholder="e.g. Bangalore" style={{ height: '38px', fontSize: '0.875rem' }} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Shipment Weight</span>
            <span className="mono-text" style={{ color: 'var(--brand-navy)' }}>{weight.toLocaleString()} Kg</span>
          </label>
          <input type="range" min={100} max={15000} step={100} value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand-teal)' }} />
        </div>

        {pricing ? (
          <div style={{ backgroundColor: 'var(--surface-3)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
            {/* Route info */}
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              {pricing.corridorName} · {pricing.distanceKm} km · {weight.toLocaleString()} Kg
            </div>

            {/* Price comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>Broker Spot Rate</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>₹{animatedMarket.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--brand-teal-light)', borderRadius: '8px', border: '1px solid rgba(29,158,117,0.3)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)', fontWeight: 600, marginBottom: '2px' }}>ReturnFlow Rate</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>₹{animatedPrice.toLocaleString()}</div>
              </div>
            </div>

            {/* Savings pill */}
            <div style={{ textAlign: 'center', backgroundColor: '#042C53', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>You Save</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1D9E75', fontFamily: 'var(--font-mono)' }}>₹{animatedSavings.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: '#2DD4BF', fontWeight: 600 }}>{displayPct}% below spot rate</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.875rem', backgroundColor: 'var(--surface-3)', borderRadius: '12px' }}>
            Enter pickup and drop cities to see live savings
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
          <button className="btn-primary-teal btn-sm" onClick={() => onSelectPersona('driver')} style={{ height: '38px', fontSize: '0.8125rem' }}>
            <Truck size={14} /><span>I'm a Driver</span>
          </button>
          <button className="btn-primary-amber btn-sm" onClick={() => onSelectPersona('customer')} style={{ height: '38px', fontSize: '0.8125rem' }}>
            <Store size={14} /><span>I'm a Shipper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
