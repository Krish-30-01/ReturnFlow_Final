import React from 'react';
import { Wallet, Route, Package, CheckCircle2, Download, Info } from 'lucide-react';
import { EarningsRecord } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { useCountUp } from '../../hooks/useCountUp';

interface DriverEarningsProps {
  earnings: EarningsRecord[];
  onNavigate: (page: string) => void;
}

function downloadGstCsv(earnings: EarningsRecord[]) {
  const header = 'Date,Route,Corridor,Loads,Weight (Kg),Gross Amount (₹),Escrow Fee (₹),Net Amount (₹),Status,Reference';
  const rows = earnings.map(e => [e.date, `"${e.route}"`, e.corridor, e.loadsCount, e.weightKg, e.amount, e.escrowFeeDeducted, e.amount - e.escrowFeeDeducted, e.status, e.payoutReference].join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ReturnFlow_Earnings_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const DriverEarnings: React.FC<DriverEarningsProps> = ({ earnings }) => {
  const totalAmount = earnings.reduce((s, e) => s + e.amount, 0);
  const totalTrips = earnings.length;
  const totalLoads = earnings.reduce((s, e) => s + (e.loadsCount || 1), 0);

  const thisMonth = useCountUp(totalAmount, 1500, 0);
  const trips = useCountUp(totalTrips, 1200, 0);
  const loads = useCountUp(totalLoads, 1300, 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>Earnings & Instant Settlements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Direct-to-Bank UPI disbursements. All return backhaul revenue is protected via escrow.</p>
        </div>
        <button className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => downloadGstCsv(earnings)} disabled={earnings.length === 0} title="Download CSV ledger">
          <Download size={15} /><span>Download GST Statement</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: <Wallet size={20} />, label: 'This Month Net Earnings', value: formatCurrency(thisMonth), sub: '100% Backhaul profit on zero additional fuel' },
          { icon: <Route size={20} />, label: 'Completed Corridors', value: String(trips), sub: 'Across NH44, NH163 & NH48 highways' },
          { icon: <Package size={20} />, label: 'Shipper Consignments', value: String(loads), sub: `Average rating 4.9 ★ across ${totalLoads} consignments` },
        ].map((card, i) => (
          <div key={i} className="card card-teal" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</span>
            </div>
            <div className="stat-number gradient-stat-teal" style={{ fontSize: '2rem' }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="card card-teal" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>Recent Settlement Ledger</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', fontWeight: 600 }}>UPI / NEFT Settlement on Delivery</span>
        </div>
        {earnings.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">💰</div><div className="empty-state-title">No earnings yet</div><p className="empty-state-desc">Complete your first backhaul delivery to start seeing earnings here.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {earnings.map(record => (
              <div key={record.id} style={{ padding: '16px 20px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>{record.route}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {record.date} · {record.loadsCount} Consignment ({formatWeight(record.weightKg)}) · Ref: <span className="mono-text">{record.payoutReference}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>+{formatCurrency(record.amount)}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Escrow fee (-{formatCurrency(record.escrowFeeDeducted)})
                      <span title="This 2.5% covers escrow hold & UPI disbursement." style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}><Info size={11} color="var(--text-tertiary)" /></span>
                    </div>
                  </div>
                  <span style={{ backgroundColor: record.status === 'Settled' ? 'var(--brand-teal-light)' : 'var(--brand-amber-light)', color: record.status === 'Settled' ? 'var(--brand-teal)' : 'var(--brand-amber)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /><span>{record.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
