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
import { LoadRequest, Booking, BOOKING_STATUS } from '../../types/logistics';
import { formatCurrency } from '../../utils/formatting';
import { useCountUp } from '../../hooks/useCountUp';
import { AppUser } from '../../services/authService';

interface CustomerDashboardProps {
  loads: LoadRequest[];
  bookings?: Booking[];
  authUser?: AppUser | null;
  onNavigate: (page: string) => void;
  onSelectLoad: (loadId: string) => void;
  onBrowseMatches: (loadId: string) => void;
  onPayBooking?: (bookingId: string) => void;
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
  bookings = [],
  authUser,
  onNavigate,
  onSelectLoad,
  onBrowseMatches,
  onPayBooking,
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
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
          background: '#0F172A', color: '#FFFFFF',
          border: '1px solid rgba(186,117,23,0.4)',
          padding: '12px 16px', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.875rem', fontFamily: 'var(--font-mono)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#BA7517', flexShrink: 0 }} />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
            Welcome, {authUser?.name?.split(' ')[0] || 'Shipper'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {authUser?.company ? <><strong style={{ color: 'var(--brand-navy)' }}>{authUser.company}</strong> · </> : ''}Regional Logistics Hub
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
                  Active Consignment Requests ({activeLoads.length})
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
              {activeLoads.length === 0 && (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <div className="empty-state-icon">📦</div>
                  <div className="empty-state-title">No active consignments</div>
                  <p className="empty-state-desc">Post your first load request to match with returning trucks at 35% lower rates.</p>
                  <button className="btn-primary-amber btn-sm" onClick={() => onNavigate('customer-post-load')}>
                    Post Load Request
                  </button>
                </div>
              )}
              {activeLoads.map((load) => {
                const isSearching = load.status === BOOKING_STATUS.SEARCHING;
                const isPendingAcceptance = load.status === BOOKING_STATUS.PENDING_DRIVER_ACCEPTANCE;
                const isAwaitingPayment = load.status === BOOKING_STATUS.AWAITING_PAYMENT;
                const isHovered = hoveredLoadId === load.id;
                const relatedBooking = bookings.find((b) => b.loadId === load.id || b.id === load.bookingId);

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
                      } else if (isAwaitingPayment && (load.bookingId || relatedBooking)) {
                        onPayBooking?.(load.bookingId || relatedBooking!.id);
                      } else {
                        onNavigate('tracking');
                      }
                    }}
                    style={{
                      padding: '18px',
                      backgroundColor: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: isAwaitingPayment
                        ? '2px solid var(--brand-teal)'
                        : isHovered
                        ? '1.5px solid var(--brand-amber)'
                        : '1px solid var(--border-color)',
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
                        {isSearching && (
                          <button
                            className="btn-primary-amber btn-sm"
                            onClick={(e) => { e.stopPropagation(); onSelectLoad(load.id); onBrowseMatches(load.id); }}
                            style={{ height: '30px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Browse Matched Backhaul Trucks"
                          >
                            <span>Find Matches</span>
                            <ArrowRight size={13} />
                          </button>
                        )}

                        {isPendingAcceptance && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--brand-amber)',
                              fontWeight: 600,
                              backgroundColor: 'var(--brand-amber-light)',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            Awaiting Driver
                          </span>
                        )}

                        {isAwaitingPayment && (
                          <button
                            className="btn-primary-teal btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetId = load.bookingId || relatedBooking?.id;
                              if (targetId) onPayBooking?.(targetId);
                            }}
                            style={{ height: '32px', padding: '4px 12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                            title="Driver Accepted — Pay & Lock Escrow"
                            id={`pay-securely-btn-${load.id}`}
                          >
                            <span>Pay Securely</span>
                            <ArrowRight size={14} />
                          </button>
                        )}

                        {!isSearching && !isPendingAcceptance && !isAwaitingPayment && (
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
                        {isSearching && (
                          <span className="status-pill status-searching" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-dot-pulse" />
                            <span>Searching for Return Trucks</span>
                          </span>
                        )}
                        {isPendingAcceptance && (
                          <span className="status-pill status-searching" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-dot-pulse" />
                            <span>Pending Driver Acceptance (No payment charged)</span>
                          </span>
                        )}
                        {isAwaitingPayment && (
                          <span className="status-pill status-in-transit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)' }}>
                            <span className="status-dot-pulse" />
                            <span>Driver Accepted! Ready for Payment</span>
                          </span>
                        )}
                        {!isSearching && !isPendingAcceptance && !isAwaitingPayment && (
                          <span className="status-pill status-in-transit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-dot-pulse" />
                            <span>{load.status} (Escrow Secured)</span>
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>
                        {relatedBooking
                          ? <>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, marginRight: '4px' }}>Total Charge:</span>
                              {formatCurrency(relatedBooking.totalPrice)}
                            </>
                          : <>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, marginRight: '4px' }}>Budget:</span>
                              {formatCurrency(load.budget)}
                            </>
                        }
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
                      {(() => {
                        const relB = bookings.find((b) => b.loadId === dl.id);
                        if (relB) {
                          const saved = relB.marketPrice
                            ? relB.marketPrice - relB.totalPrice
                            : 0;
                          return saved > 0
                            ? `Saved ${formatCurrency(saved)} vs spot rate · Paid ${formatCurrency(relB.totalPrice)}`
                            : `Paid ${formatCurrency(relB.totalPrice)} (backhaul rate)`;
                        }
                        return 'Backhaul rate applied';
                      })()}
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
