import React, { useState } from 'react';
import { Truck, PlusCircle, ArrowRight, Eye, Edit2, XCircle, TrendingUp, Calendar, CheckCircle, AlertCircle, PackageCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trip, EarningsRecord, Booking, BOOKING_STATUS } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { useCountUp } from '../../hooks/useCountUp';
import { AppUser } from '../../services/authService';

interface DriverDashboardProps {
  trips: Trip[]; bookings?: Booking[]; earnings: EarningsRecord[];
  driverId?: string; authUser?: AppUser | null;
  onNavigate: (page: string) => void; onSelectTrip: (tripId: string) => void;
  onSelectBooking?: (bookingId: string) => void; onCancelTrip?: (tripId: string) => void;
  onAcceptBooking?: (bookingId: string) => void; onDeclineBooking?: (bookingId: string) => void;
}

const REVENUE_TREND_DATA = [
  { date: '01 Aug', revenue: 12400, loads: 2 }, { date: '05 Aug', revenue: 18200, loads: 3 },
  { date: '09 Aug', revenue: 14800, loads: 2 }, { date: '13 Aug', revenue: 24500, loads: 4 },
  { date: '17 Aug', revenue: 28900, loads: 5 }, { date: '20 Aug', revenue: 34200, loads: 6 },
];

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ trips, bookings = [], earnings, driverId, authUser, onNavigate, onSelectTrip, onSelectBooking, onCancelTrip, onAcceptBooking, onDeclineBooking }) => {
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const pendingBookings = bookings.filter(b => b.status === BOOKING_STATUS.PENDING_DRIVER_ACCEPTANCE && (!driverId || b.driverId === driverId || b.driverId === 'drv-rajesh'));
  const activeBookings = bookings.filter(b => {
    const activeStatuses: string[] = [BOOKING_STATUS.AWAITING_PAYMENT, BOOKING_STATUS.BOOKED, BOOKING_STATUS.PICKED_UP, BOOKING_STATUS.IN_TRANSIT];
    return activeStatuses.includes(b.status) && (!driverId || b.driverId === driverId || b.driverId === 'drv-rajesh');
  });
  const activeTrips = trips.filter(t => t.status === 'active');
  const thisMonthRaw = earnings.reduce((acc, curr) => acc + curr.amount, 0);
  const thisMonthAnimated = useCountUp(thisMonthRaw, 1600, 0);

  const showActionToast = (msg: string) => { setActionToast(msg); setTimeout(() => setActionToast(null), 3500); };

  return (
    <div className="animate-fade-in">
      {actionToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, background: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(29,158,117,0.4)', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', animation: 'fadeIn 0.2s ease-out' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1D9E75', flexShrink: 0 }} /><span>{actionToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>Welcome, {authUser?.name?.split(' ')[0] || 'Driver'}!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Fleet ID: <span className="mono-text" style={{ fontWeight: 600 }}>{authUser?.id?.toUpperCase() || 'FLT-HYD-0001'}</span></p>
        </div>
        <button className="btn-primary-teal" onClick={() => onNavigate('driver-post-trip')} id="dashboard-post-trip-btn"><PlusCircle size={18} /><span>Post Return Trip</span></button>
      </div>

      {/* Pending Bookings */}
      {pendingBookings.length > 0 ? (
        <div className="card animate-fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-card)', backgroundColor: 'var(--surface-3)', border: '2px solid var(--brand-amber)', marginBottom: '28px', boxShadow: '0 4px 16px rgba(186,117,23,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--brand-amber-light)', color: 'var(--brand-amber)' }}><AlertCircle size={20} /></div>
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>Pending Load Requests — Action Required ({pendingBookings.length})</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Shippers have requested to book capacity on your return trips.</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingBookings.map(b => (
              <div key={b.id} style={{ padding: '16px 20px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--brand-navy)' }}>{b.from} → {b.to}</span>
                    <span className="status-pill status-searching" style={{ fontSize: '0.6875rem' }}><span className="status-dot-pulse" /><span>Pending Acceptance</span></span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Shipper: <strong>{b.customerName}</strong> ({b.customerCompany}) · {b.goodsType} (<strong>{formatWeight(b.weightKg)}</strong>)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Corridor: <strong>{b.corridor}</strong> · Driver Payout: <strong style={{ color: 'var(--brand-teal)' }}>{formatCurrency(b.basePrice)}</strong></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button className="btn-primary-teal btn-sm" id={`accept-booking-btn-${b.id}`} onClick={e => { e.stopPropagation(); onAcceptBooking?.(b.id); showActionToast(`Accepted booking #${b.id}.`); }} style={{ height: '36px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} /><span>Accept Request</span>
                  </button>
                  <button className="btn-outline-navy btn-sm" id={`decline-booking-btn-${b.id}`} onClick={e => { e.stopPropagation(); onDeclineBooking?.(b.id); showActionToast(`Declined booking #${b.id}.`); }} style={{ height: '36px', padding: '0 16px', color: 'var(--brand-coral)', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={15} /><span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card animate-fade-in" style={{ padding: '16px 20px', borderRadius: 'var(--radius-card)', backgroundColor: 'var(--surface-3)', border: '1px dashed var(--border-color)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)' }}><PackageCheck size={18} /></div>
          <div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>Pending Load Requests (0)</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>When a retailer requests to book capacity on your return trips, Accept/Decline buttons appear here in real time.</p>
          </div>
        </div>
      )}

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <div className="card card-teal animate-fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-card)', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <PackageCheck size={20} color="#1D9E75" />
            <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>Active Freight Manifests ({activeBookings.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeBookings.map(b => (
              <div key={b.id} onClick={() => { onSelectBooking?.(b.id); onNavigate('tracking'); }} className="card-hoverable" style={{ padding: '16px 20px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--brand-navy)' }}>{b.from} → {b.to}</span>
                    <span className="status-pill status-in-transit" style={{ fontSize: '0.6875rem' }}><span className="status-dot-pulse" /><span>{b.status} (Escrow Secured)</span></span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Shipper: {b.customerName} · {b.goodsType} ({formatWeight(b.weightKg)})</div>
                </div>
                <button className="btn-outline-teal btn-sm" onClick={e => { e.stopPropagation(); onSelectBooking?.(b.id); onNavigate('tracking'); }} style={{ height: '34px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} /><span>Live Tracking</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Trips Card */}
        <div className="card card-teal" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={20} color="#1D9E75" />
              <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>Upcoming Return Trips ({activeTrips.length})</h3>
            </div>
            <button className="btn-outline-navy btn-sm" onClick={() => onNavigate('driver-post-trip')} style={{ fontSize: '0.8125rem' }}>+ New Trip</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeTrips.length === 0 && (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon">🚛</div>
                <div className="empty-state-title">No active return trips</div>
                <p className="empty-state-desc">Post your first return trip to start earning on empty miles.</p>
                <button className="btn-primary-teal btn-sm" onClick={() => onNavigate('driver-post-trip')}>Post Return Trip</button>
              </div>
            )}
            {activeTrips.map(trip => {
              const isHovered = hoveredTripId === trip.id;
              const capacityUtilization = Math.round((trip.bookedCapacityKg / trip.totalCapacityKg) * 100);
              return (
                <div key={trip.id} className="card-hoverable" onMouseEnter={() => setHoveredTripId(trip.id)} onMouseLeave={() => setHoveredTripId(null)}
                  onClick={() => { onSelectTrip(trip.id); onNavigate('driver-trip-details'); }}
                  style={{ padding: '18px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: isHovered ? '1.5px solid var(--brand-teal)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'all 200ms var(--ease-out)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--brand-navy)' }}>{trip.from} → {trip.to}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /><span>{trip.departureDate} · {trip.departureTimeWindow}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button className="btn-outline-teal btn-sm" onClick={e => { e.stopPropagation(); onSelectTrip(trip.id); onNavigate('driver-trip-details'); }} style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} title="View Trip">
                        <Eye size={13} /><span>View</span>
                      </button>
                      <button className="btn-outline-navy btn-sm" onClick={e => { e.stopPropagation(); onSelectTrip(trip.id); onNavigate('driver-post-trip'); }} style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} title="Edit Trip">
                        <Edit2 size={13} /><span>Edit</span>
                      </button>
                      <button className="btn-outline-navy btn-sm" onClick={e => { e.stopPropagation(); onCancelTrip?.(trip.id); showActionToast(`Trip #${trip.id} cancelled.`); }} style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', color: 'var(--brand-coral)', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }} title="Cancel Trip">
                        <XCircle size={13} /><span>Cancel</span>
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'var(--surface-3)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--brand-navy)', fontWeight: 600 }}>{trip.vehicleType.split(' ').slice(0, 2).join(' ')}</span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--surface-3)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Cap: {formatWeight(trip.totalCapacityKg)}</span>
                      <span className="status-pill status-in-transit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="status-dot-pulse" />
                        <span>{trip.bookedLoads.length > 0 ? `${trip.bookedLoads.length} Load(s) Booked (${capacityUtilization}% Full)` : 'Searching for Backhaul'}</span>
                      </span>
                    </div>
                    <span className="driver-payout-badge" title="Driver Net Earnings Payout"><span className="payout-label">Payout:</span><span className="payout-amount">{formatCurrency(trip.minPrice)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="card card-teal" style={{ padding: '24px', borderRadius: 'var(--radius-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>This Month Earnings (Return Legs)</span>
              <span style={{ backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)', padding: '3px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> +32% vs last mo
              </span>
            </div>
            <div className="stat-number gradient-stat-teal" style={{ fontSize: '2.25rem', marginBottom: '16px' }}>{formatCurrency(thisMonthAnimated)}</div>
            <div style={{ margin: '16px 0 24px', background: 'var(--surface-2)', padding: '16px 12px 6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>30-Day Revenue Trend (₹)</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>Live Corridor Feed</span>
              </div>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_TREND_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="driverRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={val => `₹${val / 1000}k`} />
                    <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                      <div className="chart-tooltip-animated" style={{ background: '#0F172A', border: '1px solid rgba(29,158,117,0.4)', borderRadius: '8px', padding: '8px 12px', color: '#FFFFFF', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                        <div style={{ color: '#94A3B8', marginBottom: '2px' }}>{label}</div>
                        <div style={{ color: '#1D9E75', fontWeight: 'bold', fontSize: '13px' }}>{formatCurrency(payload[0].value as number)}</div>
                      </div>
                    ) : null} />
                    <Area type="monotone" dataKey="revenue" stroke="#1D9E75" strokeWidth={2.5} fillOpacity={1} fill="url(#driverRevenueGrad)" dot={{ r: 3, fill: '#1D9E75', strokeWidth: 1.5, stroke: '#FFFFFF' }} activeDot={{ r: 5, fill: '#1D9E75', stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive animationDuration={1400} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn-primary-teal" onClick={() => onNavigate('driver-earnings')} style={{ flex: 1, height: '40px', fontSize: '0.875rem' }}>
              <ArrowRight size={16} /><span>Full Earnings Ledger</span>
            </button>
            <button className="btn-outline-teal btn-sm" onClick={() => onNavigate('driver-post-trip')} style={{ height: '40px', padding: '0 16px' }}>
              <PlusCircle size={16} /><span>New Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
