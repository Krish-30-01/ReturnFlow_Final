import React, { useState } from 'react';
import { X, Cpu, TrendingUp, IndianRupee, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { CORRIDORS } from '../../services/routingEngine';

interface MatchingEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchingEngineModal: React.FC<MatchingEngineModalProps> = ({ isOpen, onClose }) => {
  const [selectedCorridorKey, setSelectedCorridorKey] = useState<string>('HYD-WAR');
  const [truckCapacityTons, setTruckCapacityTons] = useState<number>(30);
  const [forwardFilledTons, setForwardFilledTons] = useState<number>(20);

  if (!isOpen) return null;

  const currentCorridor = CORRIDORS[selectedCorridorKey] || CORRIDORS['HYD-WAR'];
  const spareReturnTons = truckCapacityTons - (truckCapacityTons - 15); // e.g. 15 tons spare return
  const standardFuelCost = Math.round(currentCorridor.distanceKm * 28); // approx ₹28/km diesel for 30-ton
  const standaloneReturnIncome = 0; // standard empty deadhead = ₹0
  const returnFlowBackhaulIncome = Math.round(currentCorridor.distanceKm * 18 * (spareReturnTons / 10));
  const retailerSavings = Math.round(returnFlowBackhaulIncome * 0.35);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 44, 83, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          backgroundColor: 'var(--surface-2)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--brand-teal-light)',
                color: 'var(--brand-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cpu size={24} />
            </div>
            <div>
              <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.25rem', margin: 0 }}>
                Bidirectional Matching Engine Architecture
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                Corridor Economics & Capacity Optimization Simulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline-navy btn-sm"
            style={{ width: '36px', height: '36px', padding: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Corridor Selector Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Select Commercial Freight Corridor:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(CORRIDORS).map(([key, corr]) => (
              <button
                key={key}
                onClick={() => setSelectedCorridorKey(key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: selectedCorridorKey === key ? 'var(--brand-navy)' : 'var(--bg-secondary)',
                  color: selectedCorridorKey === key ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)'
                }}
              >
                {corr.highway} · {corr.name.split(' ')[0]} → {corr.name.split(' ')[2]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Simulation Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            backgroundColor: 'var(--surface-3)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '28px',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* Corridor Stats */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Corridor Profile
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '4px' }}>
              {currentCorridor.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Highway: <strong>{currentCorridor.highway}</strong> ({currentCorridor.distanceKm} Km)
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-coral)', marginTop: '8px' }}>
              Typical Deadhead Empty Backhaul: <strong>{(currentCorridor.emptyReturnRate * 100).toFixed(0)}%</strong>
            </div>
          </div>

          {/* Traditional One-Way */}
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Traditional Dispatch
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-coral)', marginTop: '4px' }}>
              ₹0 Backhaul
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Return Fuel Wasted: ₹{standardFuelCost.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              100% Deadhead empty truck loss
            </div>
          </div>

          {/* ReturnFlow Platform Impact */}
          <div
            style={{
              backgroundColor: 'var(--brand-teal-light)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(29, 158, 117, 0.3)'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase' }}>
              ReturnFlow Monetization
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--brand-teal)',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px'
              }}
            >
              +₹{returnFlowBackhaulIncome.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-navy)', fontWeight: 600, marginTop: '2px' }}>
              Net Profit on Same Fuel Spend
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', marginTop: '6px' }}>
              Retailer saves ~₹{retailerSavings.toLocaleString()} (35% rebate)
            </div>
          </div>
        </div>

        {/* 4 Pillars of Algorithm Explanation */}
        <h4 style={{ color: 'var(--brand-navy)', marginBottom: '16px' }}>How the Match Score (0–100%) is Derived</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--brand-teal)' }}>1. Corridor Alignment (40%)</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Waypoint vector analysis along national highways with sub-5km detour thresholds.
            </p>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--brand-teal)' }}>2. Capacity Density (30%)</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Optimizes payload weight/volume ratios so trucks run at 85%+ total payload capacity.
            </p>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--brand-teal)' }}>3. Time Window (20%)</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Aligns scheduled unloading dock availability with driver statutory rest stops.
            </p>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--brand-teal)' }}>4. Shared Economics (10%)</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Splits fixed corridor fuel costs across both legs, delivering double-digit shipper discounts.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button className="btn-primary-teal" onClick={onClose}>
            <span>Got It — Continue to Platform</span>
          </button>
        </div>
      </div>
    </div>
  );
};
