import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, TrendingDown, Truck, Package, Zap, RotateCcw } from 'lucide-react';
import { CORRIDORS } from '../../services/routingEngine';
import { calculateBackhaulPricing } from '../../services/pricingEngine';

interface LiveSavingsCalculatorProps {
  onSelectPersona: (persona: 'driver' | 'customer') => void;
}

// Animated number hook — counts from prev to next value
function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

const CORRIDOR_OPTIONS = Object.entries(CORRIDORS).map(([key, c]) => ({
  key,
  label: `${c.name.split('—')[0].trim()} → ${c.name.split('—')[1]?.trim() ?? ''}`,
  shortLabel: key,
  distanceKm: c.distanceKm,
  highway: c.highway,
  emptyReturnRate: c.emptyReturnRate,
}));

const VEHICLE_OPTIONS = [
  { value: 'TATA 407 (4-Ton Commercial)', label: '4-Ton LCV', maxKg: 4000 },
  { value: 'Ashok Leyland 3118 (14-Ton Heavy)', label: '14-Ton MCV', maxKg: 14000 },
  { value: 'TATA Signa 3523.TK (30-Ton Multi-Axle)', label: '30-Ton HCV', maxKg: 30000 },
  { value: 'BharatBenz 3528R (35-Ton Multi-Axle)', label: '35-Ton HCV', maxKg: 35000 },
];

export const LiveSavingsCalculator: React.FC<LiveSavingsCalculatorProps> = ({ onSelectPersona }) => {
  const [corridorKey, setCorridorKey] = useState('HYD-BLR');
  const [vehicleIdx, setVehicleIdx] = useState(2); // 30-Ton default
  const [weightKg, setWeightKg] = useState(8000);
  const [activeTab, setActiveTab] = useState<'driver' | 'shipper'>('shipper');
  const [hasInteracted, setHasInteracted] = useState(false);

  const corridor = CORRIDORS[corridorKey];
  const vehicle = VEHICLE_OPTIONS[vehicleIdx];

  // Clamp weight to vehicle max when vehicle changes
  useEffect(() => {
    setWeightKg((w) => Math.min(w, vehicle.maxKg));
  }, [vehicleIdx, vehicle.maxKg]);

  const pricing = useMemo(() =>
    calculateBackhaulPricing({
      distanceKm: corridor.distanceKm,
      weightKg,
      vehicleType: vehicle.value,
      corridorId: corridorKey,
      isReturnTrip: true,
    }),
    [corridor.distanceKm, weightKg, vehicle.value, corridorKey]
  );

  // Driver view: how much they earn on the return leg
  const driverEarning = pricing.driverPayout;
  const driverFuelCost = Math.round(corridor.distanceKm * 28); // ₹28/km diesel estimate
  const driverNetExtra = Math.max(0, driverEarning - Math.round(driverFuelCost * 0.15)); // fuel already paid forward

  // Shipper view: how much they save vs spot market
  const shipperPays = pricing.retailerBudget + 150;
  const shipperSpotRate = pricing.marketPrice;
  const shipperSaves = Math.max(0, shipperSpotRate - shipperPays);
  const shipperSavePct = pricing.savingsPercentage;

  // Animated numbers
  const animDriverEarning = useAnimatedNumber(driverEarning, 500);
  const animShipperSaves = useAnimatedNumber(shipperSaves, 500);
  const animShipperPays = useAnimatedNumber(shipperPays, 500);
  const animSpotRate = useAnimatedNumber(shipperSpotRate, 500);

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 20px 48px -8px rgba(4,44,83,0.14), 0 4px 12px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle teal glow in top-right corner */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Zap size={15} color="var(--brand-teal)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Live Savings Calculator
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Real numbers from our pricing engine
          </p>
        </div>
        {hasInteracted && (
          <button
            onClick={() => { setCorridorKey('HYD-BLR'); setVehicleIdx(2); setWeightKg(8000); setHasInteracted(false); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            title="Reset"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Tab switcher — Driver vs Shipper */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '10px', padding: '3px',
        marginBottom: '22px',
        border: '1px solid var(--border-color)'
      }}>
        {(['shipper', 'driver'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 0',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 200ms var(--ease-out)',
              backgroundColor: activeTab === tab
                ? (tab === 'driver' ? 'var(--brand-teal)' : 'var(--brand-amber)')
                : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            {tab === 'driver' ? <Truck size={14} /> : <Package size={14} />}
            {tab === 'driver' ? 'I\'m a Driver' : 'I\'m a Shipper'}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '22px' }}>

        {/* Corridor selector */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Route Corridor
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CORRIDOR_OPTIONS.map((c) => (
              <button
                key={c.key}
                onClick={() => { setCorridorKey(c.key); setHasInteracted(true); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: corridorKey === c.key
                    ? '1.5px solid var(--brand-teal)'
                    : '1px solid var(--border-color)',
                  backgroundColor: corridorKey === c.key ? 'var(--brand-teal-light)' : 'var(--surface-3)',
                  color: corridorKey === c.key ? 'var(--brand-teal)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {c.shortLabel}
                <span style={{ marginLeft: '4px', opacity: 0.7 }}>{c.distanceKm}km</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle type */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Vehicle Class
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {VEHICLE_OPTIONS.map((v, i) => (
              <button
                key={v.value}
                onClick={() => { setVehicleIdx(i); setHasInteracted(true); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: vehicleIdx === i
                    ? '1.5px solid var(--brand-teal)'
                    : '1px solid var(--border-color)',
                  backgroundColor: vehicleIdx === i ? 'var(--brand-teal-light)' : 'var(--surface-3)',
                  color: vehicleIdx === i ? 'var(--brand-teal)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Load Weight
            </label>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>
              {(weightKg / 1000).toFixed(1)} Tons
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={vehicle.maxKg}
            step={500}
            value={weightKg}
            onChange={(e) => { setWeightKg(Number(e.target.value)); setHasInteracted(true); }}
            style={{ width: '100%', accentColor: 'var(--brand-teal)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            <span>500 Kg</span>
            <span>{(vehicle.maxKg / 1000).toFixed(0)} Tons max</span>
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div
        key={`${corridorKey}-${vehicleIdx}-${weightKg}-${activeTab}`}
        style={{
          backgroundColor: activeTab === 'driver' ? 'rgba(29,158,117,0.06)' : 'rgba(186,117,23,0.06)',
          border: `1.5px solid ${activeTab === 'driver' ? 'rgba(29,158,117,0.2)' : 'rgba(186,117,23,0.2)'}`,
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '18px',
          animation: 'fadeInScale 0.3s var(--ease-out) both',
        }}
      >
        {activeTab === 'shipper' ? (
          <>
            {/* Shipper result */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                  You Pay (All-In)
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                  {fmt(animShipperPays)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                  vs spot rate{' '}
                  <span style={{ textDecoration: 'line-through' }}>{fmt(animSpotRate)}</span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--brand-amber-light)',
                border: '1px solid rgba(186,117,23,0.25)',
                borderRadius: '12px',
                padding: '12px 16px',
                textAlign: 'center',
                minWidth: '110px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginBottom: '2px' }}>
                  <TrendingDown size={14} color="var(--brand-amber)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase' }}>You Save</span>
                </div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--brand-amber)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                  {fmt(animShipperSaves)}
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-amber)', marginTop: '2px' }}>
                  {shipperSavePct}% off broker
                </div>
              </div>
            </div>

            {/* Mini breakdown */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(186,117,23,0.15)', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Freight: <strong style={{ color: 'var(--brand-navy)' }}>{fmt(pricing.driverPayout)}</strong></span>
              <span>Platform fee: <strong style={{ color: 'var(--brand-navy)' }}>{fmt(pricing.platformFee)}</strong></span>
              <span>Insurance: <strong style={{ color: 'var(--brand-navy)' }}>₹150</strong></span>
              <span style={{ marginLeft: 'auto', color: 'var(--brand-teal)', fontWeight: 600 }}>
                {corridor.distanceKm} km · {corridor.highway}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Driver result */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                  You Earn (Return Leg)
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                  {fmt(animDriverEarning)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                  on a trip you were already taking
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--brand-teal-light)',
                border: '1px solid rgba(29,158,117,0.25)',
                borderRadius: '12px',
                padding: '12px 16px',
                textAlign: 'center',
                minWidth: '110px'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase', marginBottom: '2px' }}>Net Extra</div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                  {fmt(animDriverEarning)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)', marginTop: '2px', fontWeight: 600 }}>
                  pure backhaul profit
                </div>
              </div>
            </div>

            {/* Empty return context */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(29,158,117,0.15)', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Platform fee: <strong style={{ color: 'var(--brand-navy)' }}>2.5%</strong> (drivers only)</span>
              <span>Empty return cost saved: <strong style={{ color: 'var(--brand-teal)' }}>{fmt(driverFuelCost)}</strong></span>
              <span style={{ marginLeft: 'auto', color: 'var(--brand-teal)', fontWeight: 600 }}>
                {Math.round(corridor.emptyReturnRate * 100)}% trucks on this corridor run empty
              </span>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <button
        className={activeTab === 'driver' ? 'btn-primary-teal' : 'btn-primary-amber'}
        onClick={() => onSelectPersona(activeTab === 'driver' ? 'driver' : 'customer')}
        style={{ width: '100%', height: '46px', fontSize: '0.9375rem' }}
      >
        <span>{activeTab === 'driver' ? 'Start Earning on Return Trips' : 'Book at This Rate Now'}</span>
        <ArrowRight size={17} />
      </button>

      {/* Small disclaimer */}
      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '10px', lineHeight: 1.4 }}>
        Prices computed live from our corridor pricing engine · Actual rates may vary ±10% by date
      </p>
    </div>
  );
};
