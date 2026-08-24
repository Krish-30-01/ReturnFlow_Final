import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Activity, IndianRupee, Truck, Package, Leaf, TrendingUp } from 'lucide-react';
import { Trip, LoadRequest, Booking } from '../../types/logistics';

interface AdminDashboardProps {
  trips: Trip[];
  loads: LoadRequest[];
  bookings: Booking[];
  onNavigate: (page: string) => void;
}

// Avoided empty-run emission factor for commercial HDVs (kg CO2e per tonne-km).
const AVOIDED_EMISSION_KG_PER_TON_KM = 0.0811;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ trips, loads, bookings, onNavigate }) => {
  const gmv = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const platformRevenue = bookings.reduce((sum, b) => sum + b.platformFee, 0);
  const escrowHeld = bookings
    .filter((b) => b.escrowStatus === 'Held in Escrow')
    .reduce((sum, b) => sum + b.basePrice, 0);
  const takeRate = gmv > 0 ? ((platformRevenue / gmv) * 100).toFixed(1) : '0.0';

  // CO2 avoided from completed + in-progress bookings
  const co2SavedKg = Math.round(
    bookings.reduce((sum, b) => {
      const approxKm = b.corridor.includes('BLR') ? 570 : b.corridor.includes('WAR') ? 150 : 280;
      return sum + (b.weightKg / 1000) * approxKm * AVOIDED_EMISSION_KG_PER_TON_KM;
    }, 0)
  );

  // Corridor marketplace depth
  const corridorMap = new Map<string, { corridor: string; loads: number; trips: number }>();
  loads.forEach((l) => {
    const entry = corridorMap.get(l.corridor) || { corridor: l.corridor, loads: 0, trips: 0 };
    entry.loads += 1;
    corridorMap.set(l.corridor, entry);
  });
  trips.forEach((t) => {
    const entry = corridorMap.get(t.corridor) || { corridor: t.corridor, loads: 0, trips: 0 };
    entry.trips += 1;
    corridorMap.set(t.corridor, entry);
  });
  const corridorData = Array.from(corridorMap.values()).sort((a, b) => b.loads + b.trips - (a.loads + a.trips));

  // Cumulative GMV timeline
  const sortedBookings = [...bookings].sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));
  let running = 0;
  const gmvTimeline = sortedBookings.map((b) => {
    running += b.totalPrice;
    return { date: b.bookingDate.slice(5), gmv: Math.round(running) };
  });

  // Load status split
  const statusColors: Record<string, string> = {
    Searching: '#BA7517',
    Matched: '#0D9488',
    Booked: '#042C53',
    Delivered: '#1D9E75'
  };
  const statusData = ['Searching', 'Matched', 'Booked', 'Delivered']
    .map((s) => ({ name: s, value: loads.filter((l) => l.status === s).length }))
    .filter((d) => d.value > 0);

  const kpiCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    sub: string,
    color: string
  ) => (
    <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: `${color}1A`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{sub}</div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Platform Operations Console</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Live marketplace health across all corridors — GMV, liquidity, take-rate and emissions impact.
        </p>
      </div>

      {/* KPI row */}
      <div className="admin-kpi-grid">
        {kpiCard(<IndianRupee size={22} />, 'Platform GMV', `₹${gmv.toLocaleString()}`, `${bookings.length} total bookings`, '#042C53')}
        {kpiCard(<TrendingUp size={22} />, 'Take Rate', `${takeRate}%`, `₹${platformRevenue.toLocaleString()} platform fee earned`, '#1D9E75')}
        {kpiCard(<Activity size={22} />, 'Escrow Held', `₹${escrowHeld.toLocaleString()}`, 'Funds protected mid-shipment', '#BA7517')}
        {kpiCard(
          <Leaf size={22} />,
          'CO₂ Avoided',
          `${co2SavedKg.toLocaleString()} kg`,
          'vs. empty return running baseline',
          '#16A34A'
        )}
      </div>

      {/* Supply / demand counters */}
      <div className="admin-kpi-grid admin-supply-grid" style={{ marginTop: '16px' }}>
        {kpiCard(<Truck size={22} />, 'Active Return Trips', String(trips.filter((t) => t.status === 'active').length), `${trips.reduce((s, t) => s + Math.max(0, t.totalCapacityKg - t.bookedCapacityKg), 0).toLocaleString()} kg spare capacity`, '#1D9E75')}
        {kpiCard(<Package size={22} />, 'Live Load Requests', String(loads.filter((l) => l.status === 'Searching').length), `${loads.length} total consignments`, '#BA7517')}
      </div>

      {/* Corridor chart + status donut */}
      <div className="admin-charts-row" style={{ marginTop: '24px', display: 'grid', gap: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
            Marketplace Liquidity by Corridor
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={corridorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="corridor" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="trips" name="Return Trips (Supply)" fill="#1D9E75" radius={[6, 6, 0, 0]} />
              <Bar dataKey="loads" name="Load Requests (Demand)" fill="#BA7517" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
            Consignment Status Split
          </h3>
          {statusData.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No consignments posted yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={statusColors[d.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* GMV growth */}
      {gmvTimeline.length > 0 && (
        <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Cumulative GMV</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={gmvTimeline}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'GMV']} />
              <Area type="monotone" dataKey="gmv" stroke="#1D9E75" strokeWidth={2.5} fill="url(#gmvGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Live marketplace board */}
      <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Live Order Book</h3>
          <button onClick={() => onNavigate('matches')} className="btn-outline-navy btn-sm">
            Open Match Feed
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Corridor</th>
                <th>Weight</th>
                <th>Driver</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '18px' }}>
                    No bookings yet — book a match to populate the order book.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} onClick={() => onNavigate('tracking')} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{b.id}</td>
                    <td>{b.from.split('(')[0].trim()} → {b.to.split('(')[0].trim()}</td>
                    <td>{b.weightKg.toLocaleString()} kg</td>
                    <td>{b.driverName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>₹{b.totalPrice.toLocaleString()}</td>
                    <td>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: b.status === 'Delivered' ? 'rgba(29,158,117,0.12)' : 'rgba(186,117,23,0.12)',
                          color: b.status === 'Delivered' ? '#166534' : '#92400E'
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
