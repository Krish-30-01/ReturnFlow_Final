import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  ArrowRight,
  Eye,
  Edit2,
  XCircle,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { LoadRequest } from '../../types/logistics';
import { formatCurrency } from '../../utils/formatting';
import { useCountUp } from '../../hooks/useCountUp';

interface CustomerDashboardProps {
  loads: LoadRequest[];
  onNavigate: (page: string) => void;
  onSelectLoad: (loadId: string) => void;
  onBrowseMatches: (loadId: string) => void;
  onCancelLoad?: (loadId: string) => void;
}

const SAVINGS_TREND_DATA = [
  { month: 'Apr', savings: 14200, discountPct: 32 },
  { month: 'May', savings: 22800, discountPct: 35 },
  { month: 'Jun', savings: 19400, discountPct: 33 },
  { month: 'Jul', savings: 31500, discountPct: 38 },
  { month: 'Aug', savings: 42800, discountPct: 39 }
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  loads,
  onNavigate,
  onSelectLoad,
  onBrowseMatches,
  onCancelLoad
}) => {
  const [hoveredLoadId, setHoveredLoadId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const activeLoads = loads.filter((l) => l.status !== 'Delivered');
  const deliveredLoads = loads.filter((l) => l.status === 'Delivered');
  const savingsPercent = useCountUp(34.8, 1600, 1);

  const handleCancelLoad = (e: React.MouseEvent, loadId: string) => {
    e.stopPropagation();
    if (onCancelLoad) {
      onCancelLoad(loadId);
    }
    setFeedbackToast(`Consignment #${loadId} cancelled successfully.`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleEditLoad = (e: React.MouseEvent, loadId: string) => {
    e.stopPropagation();
    onSelectLoad(loadId);
    onNavigate('customer-post-load');
  };

  return (
    <div className="customer-dashboard-view animate-fade-in">
      {/* Action Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white border border-[#BA7517]/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-[#BA7517] animate-ping" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
            Welcome, Priya!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Company: <strong style={{ color: 'var(--brand-navy)' }}>Apex Retail Networks Pvt Ltd</strong> · Regional Logistics Hub
          </p>
        </div>

        <button
          className="btn-primary-amber"
          onClick={() => onNavigate('customer-post-load')}
          id="dashboard-post-load-btn"
        >
          <PlusCircle size={18} />
          <span>Post Load Request</span>
        </button>
      </div>

      {/* 2-Column Grid (60 / 40) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Left Column: Active Load Requests Card with Hover Quick-Actions */}
        <div style={{ flex: '1 1 60%' }}>
          <div
            className="card card-amber"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={20} color="#BA7517" />
                <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>
                  Active Load Requests ({activeLoads.length})
                </h3>
              </div>
              <button
                className="btn-outline-navy btn-sm"
                onClick={() => onNavigate('customer-post-load')}
                style={{ fontSize: '0.8125rem' }}
              >
                + Post Load
              </button>
            </div>

            {/* Loads List with Hover Quick-Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeLoads.map((load) => {
                const isSearching = load.status === 'Searching';
                const isHovered = hoveredLoadId === load.id;

                return (
                  <div
                    key={load.id}
                    className="card-hoverable"
                    onMouseEnter={() => setHoveredLoadId(load.id)}
                    onMouseLeave={() => setHoveredLoadId(null)}
                    onClick={() => {
                      onSelectLoad(load.id);
                      if (isSearching) {
                        onBrowseMatches(load.id);
                      } else {
                        onNavigate('tracking');
                      }
                    }}
                    style={{
                      padding: '18px',
                      backgroundColor: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: isHovered ? '1.5px solid var(--brand-amber)' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 200ms var(--ease-out)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                          {load.from} → {load.to}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {load.date} · {load.goodsType} · <strong>{load.weight} {load.weightUnit}</strong>
                        </div>
                      </div>

                      {/* Quick-Action Button Row (Revealed on Hover) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'opacity 180ms ease, transform 180ms ease',
                          opacity: 1,
                          transform: isHovered ? 'translateY(0)' : 'translateY(1px)'
                        }}
                      >
                        {isSearching ? (
                          <button
                            className="btn-primary-amber btn-sm"
                            onClick={(e) => { e.stopPropagation(); onSelectLoad(load.id); onBrowseMatches(load.id); }}
                            style={{ height: '30px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Browse Matched Backhaul Trucks"
                          >
                            <span>Find Matches</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button
                            className="btn-outline-teal btn-sm"
                            onClick={(e) => { e.stopPropagation(); onSelectLoad(load.id); onNavigate('tracking'); }}
                            style={{ height: '30px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Live GPS Corridor Tracking"
                          >
                            <Eye size={13} />
                            <span>Live Track</span>
                          </button>
                        )}

                        <button
                          className="btn-outline-navy btn-sm"
                          onClick={(e) => handleEditLoad(e, load.id)}
                          style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Payload / Destination"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          className="btn-outline-navy btn-sm"
                          onClick={(e) => handleCancelLoad(e, load.id)}
                          style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', color: 'var(--brand-coral)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Cancel Consignment Request"
                        >
                          <XCircle size={13} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                      {/* Status Row with Live Pulse Dots */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isSearching ? (
                          <span className="status-pill status-searching" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-dot-pulse" />
                            <span>Searching for Return Trucks</span>
                          </span>
                        ) : (
                          <span className="status-pill status-in-transit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-dot-pulse" />
                            <span>{load.status} (In Transit)</span>
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>
                        Budget: {formatCurrency(load.budget)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Recharts Savings Chart & Recent Deliveries */}
        <div style={{ flex: '1 1 40%' }}>
          <div
            className="card card-amber"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>
                  Backhaul Cost Savings
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingDown size={14} /> -38% vs Spot Rates
                </span>
              </div>

              {/* Interactive Recharts Savings Area Chart */}
              <div style={{ margin: '0 0 20px', background: 'var(--surface-2)', padding: '16px 12px 6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Cumulative Shipper Savings (₹)
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--brand-amber)', fontFamily: 'var(--font-mono)' }}>
                    Avg {savingsPercent}% Cut
                  </span>
                </div>

                <div style={{ width: '100%', height: 130 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SAVINGS_TREND_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="customerSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#BA7517" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#BA7517" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="chart-tooltip-animated" style={{ background: '#0F172A', border: '1px solid rgba(186,117,23,0.4)', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', color: '#FFFFFF', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                <div style={{ color: '#94A3B8', marginBottom: '2px' }}>{label} 2026</div>
                                <div style={{ color: '#BA7517', fontWeight: 'bold', fontSize: '13px' }}>Saved {formatCurrency(payload[0].value as number)}</div>
                                <div style={{ color: '#E2E8F0', marginTop: '2px', fontSize: '10px' }}>{payload[0].payload.discountPct}% Discount vs Brokers</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        stroke="#BA7517"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#customerSavingsGrad)"
                        dot={{ r: 3, fill: '#BA7517', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                        activeDot={{ r: 5, fill: '#BA7517', stroke: '#FFFFFF', strokeWidth: 2 }}
                        isAnimationActive={true}
                        animationDuration={1400}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Delivered Bookings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deliveredLoads.map((dl) => (
                  <div
                    key={dl.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--surface-3)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.875rem' }}>
                        {dl.from} → {dl.to}
                      </div>
                      <span className="status-pill status-delivered" style={{ fontSize: '0.6875rem' }}>
                        <span className="status-dot-static" style={{ color: 'var(--brand-teal)' }} />
                        <span>Delivered</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {dl.date} · {dl.goodsType} ({dl.weight} {dl.weightUnit})
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)', marginTop: '3px', fontWeight: 600 }}>
                      Saved ₹1,800 vs standalone spot freight
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Button */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
              <button
                className="btn-primary-amber"
                onClick={() => onNavigate('customer-post-load')}
                style={{ width: '100%', height: '44px', fontSize: '0.875rem' }}
              >
                <PlusCircle size={18} />
                <span>Post New Consignment Request</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
