import React, { useState } from 'react';
import {
  Truck,
  PlusCircle,
  ArrowRight,
  Eye,
  Edit2,
  XCircle,
  TrendingUp,
  Calendar,
  Layers
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
import { Trip, EarningsRecord } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { useCountUp } from '../../hooks/useCountUp';

interface DriverDashboardProps {
  trips: Trip[];
  earnings: EarningsRecord[];
  onNavigate: (page: string) => void;
  onSelectTrip: (tripId: string) => void;
}

const REVENUE_TREND_DATA = [
  { date: '01 Aug', revenue: 12400, loads: 2 },
  { date: '05 Aug', revenue: 18200, loads: 3 },
  { date: '09 Aug', revenue: 14800, loads: 2 },
  { date: '13 Aug', revenue: 24500, loads: 4 },
  { date: '17 Aug', revenue: 28900, loads: 5 },
  { date: '20 Aug', revenue: 34200, loads: 6 }
];

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  trips,
  earnings,
  onNavigate,
  onSelectTrip
}) => {
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  const [tripList, setTripList] = useState<Trip[]>(trips);
  const [cancelledToast, setCancelledToast] = useState<string | null>(null);

  const activeTrips = tripList.filter((t) => t.status === 'active');
  const thisMonthRaw = earnings.reduce((acc, curr) => acc + curr.amount, 0) + 28450;
  const thisMonthAnimated = useCountUp(thisMonthRaw, 1600, 0);

  const handleCancelTrip = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    setTripList((prev) => prev.filter((t) => t.id !== tripId));
    setCancelledToast(`Trip #${tripId} successfully cancelled.`);
    setTimeout(() => setCancelledToast(null), 3500);
  };

  const handleEditTrip = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    onSelectTrip(tripId);
    onNavigate('driver-post-trip');
  };

  return (
    <div className="driver-dashboard-view animate-fade-in">
      {/* Action Toast Feedback */}
      {cancelledToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white border border-[#1D9E75]/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-ping" />
          <span>{cancelledToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
            Welcome, Rajesh!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Fleet ID: <span className="mono-text" style={{ fontWeight: 600 }}>FLT-HYD-9912</span> · 12 Commercial Vehicles Verified
          </p>
        </div>

        <button
          className="btn-primary-teal"
          onClick={() => onNavigate('driver-post-trip')}
          id="dashboard-post-trip-btn"
        >
          <PlusCircle size={18} />
          <span>Post Return Trip</span>
        </button>
      </div>

      {/* 2-Column Operational Grid (60 / 40) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Left Column: Upcoming Return Trips Card */}
        <div style={{ flex: '1 1 60%' }}>
          <div
            className="card card-teal"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={20} color="#1D9E75" />
                <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>
                  Upcoming Return Trips ({activeTrips.length})
                </h3>
              </div>
              <button
                className="btn-outline-navy btn-sm"
                onClick={() => onNavigate('driver-post-trip')}
                style={{ fontSize: '0.8125rem' }}
              >
                + New Trip
              </button>
            </div>

            {/* Trips List with Hover Quick-Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeTrips.map((trip) => {
                const bookedLoadsCount = trip.bookedLoads.length;
                const capacityUtilization = Math.round((trip.bookedCapacityKg / trip.totalCapacityKg) * 100);
                const isHovered = hoveredTripId === trip.id;

                return (
                  <div
                    key={trip.id}
                    className="card-hoverable group"
                    onMouseEnter={() => setHoveredTripId(trip.id)}
                    onMouseLeave={() => setHoveredTripId(null)}
                    onClick={() => { onSelectTrip(trip.id); onNavigate('driver-trip-details'); }}
                    style={{
                      padding: '18px',
                      backgroundColor: 'var(--surface-3)',
                      borderRadius: 'var(--radius-md)',
                      border: isHovered ? '1.5px solid var(--brand-teal)' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 200ms var(--ease-out)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                          {trip.from} → {trip.to}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          <span>{trip.departureDate} · {trip.departureTimeWindow}</span>
                        </div>
                      </div>

                      {/* Quick-Action Button Row (Revealed on Hover) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'opacity 180ms ease, transform 180ms ease',
                          opacity: isHovered ? 1 : 0.85,
                          transform: isHovered ? 'translateY(0)' : 'translateY(1px)'
                        }}
                      >
                        <button
                          className="btn-outline-teal btn-sm"
                          onClick={(e) => { e.stopPropagation(); onSelectTrip(trip.id); onNavigate('driver-trip-details'); }}
                          style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="View Trip Breakdown"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        <button
                          className="btn-outline-navy btn-sm"
                          onClick={(e) => handleEditTrip(e, trip.id)}
                          style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Route / Capacity"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          className="btn-outline-navy btn-sm"
                          onClick={(e) => handleCancelTrip(e, trip.id)}
                          style={{ padding: '4px 10px', height: '30px', fontSize: '0.75rem', color: 'var(--brand-coral)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Cancel Trip"
                        >
                          <XCircle size={13} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    {/* Badges Row with Live Tracking Pulse Dot */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--surface-2)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          color: 'var(--brand-navy)',
                          fontWeight: 600
                        }}
                      >
                        {trip.vehicleType.split(' ')[0]} {trip.vehicleType.split(' ')[1]}
                      </span>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--surface-2)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        Cap: {formatWeight(trip.totalCapacityKg)}
                      </span>

                      {/* Status Pill with Live Pulse Dot */}
                      <span className="status-pill status-in-transit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D9E75]"></span>
                        </span>
                        <span>
                          {bookedLoadsCount > 0
                            ? `${bookedLoadsCount} Load${bookedLoadsCount > 1 ? 's' : ''} Booked (${capacityUtilization}% Full)`
                            : 'Searching for Backhaul'}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Earnings & Interactive Recharts Area Chart */}
        <div style={{ flex: '1 1 40%' }}>
          <div
            className="card card-teal"
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
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  This Month Earnings (Return Legs)
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--brand-teal-light)',
                    color: 'var(--brand-teal)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <TrendingUp size={12} /> +32% vs last mo
                </span>
              </div>

              <div
                className="stat-number"
                style={{
                  fontSize: '2.25rem',
                  color: 'var(--brand-teal)',
                  marginBottom: '16px'
                }}
              >
                {formatCurrency(thisMonthAnimated)}
              </div>

              {/* Interactive Recharts Area Chart with Tooltip */}
              <div style={{ margin: '16px 0 24px', background: 'var(--surface-3)', padding: '16px 12px 6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    30-Day Revenue Trend (₹)
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>
                    Live Corridor Feed
                  </span>
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
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div style={{ background: '#0F172A', border: '1px solid rgba(29,158,117,0.4)', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', color: '#FFFFFF', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                <div style={{ color: '#94A3B8', marginBottom: '2px' }}>{label}</div>
                                <div style={{ color: '#1D9E75', fontWeight: 'bold', fontSize: '13px' }}>{formatCurrency(payload[0].value as number)}</div>
                                <div style={{ color: '#E2E8F0', marginTop: '2px', fontSize: '10px' }}>{payload[0].payload.loads} Return Consignments</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#1D9E75" strokeWidth={2.5} fillOpacity={1} fill="url(#driverRevenueGrad)" dot={{ r: 3, fill: '#1D9E75', strokeWidth: 1.5, stroke: '#FFFFFF' }} activeDot={{ r: 5, fill: '#1D9E75', stroke: '#FFFFFF', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                className="btn-primary-teal"
                onClick={() => onNavigate('driver-post-trip')}
                style={{ flex: 1, height: '40px', fontSize: '0.875rem' }}
              >
                <span>Post Trip</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn-outline-navy"
                onClick={() => onNavigate('driver-earnings')}
                style={{ flex: 1, height: '40px', fontSize: '0.875rem' }}
              >
                <span>Payouts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
