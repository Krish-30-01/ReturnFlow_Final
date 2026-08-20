import React from 'react';
import { Wallet, Route, Package, CheckCircle2, ArrowUpRight, ShieldCheck, Download, IndianRupee } from 'lucide-react';
import { EarningsRecord } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { useCountUp } from '../../hooks/useCountUp';

interface DriverEarningsProps {
  earnings: EarningsRecord[];
  onNavigate: (page: string) => void;
}

export const DriverEarnings: React.FC<DriverEarningsProps> = ({ earnings, onNavigate }) => {
  const targetThisMonth = earnings.reduce((sum, e) => sum + e.amount, 0) + 28450;
  const targetTrips = 14;
  const targetLoads = 32;

  const thisMonth = useCountUp(targetThisMonth, 1500, 0);
  const trips = useCountUp(targetTrips, 1200, 0);
  const loads = useCountUp(targetLoads, 1300, 0);

  return (
    <div className="driver-earnings-view animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
            Earnings & Instant Settlements
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Direct-to-Bank UPI disbursements. All return backhaul revenue is protected via escrow.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={15} />
            <span>Download GST Statement</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        {/* Card 1: This Month */}
        <div className="card card-teal" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-teal-light)',
                color: 'var(--brand-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Wallet size={20} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              This Month Net Earnings
            </span>
          </div>
          <div className="stat-number" style={{ fontSize: '2rem', color: 'var(--brand-teal)' }}>
            {formatCurrency(thisMonth)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            100% Backhaul profit on zero additional fuel
          </div>
        </div>

        {/* Card 2: Completed Trips */}
        <div className="card card-teal" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-teal-light)',
                color: 'var(--brand-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Route size={20} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Completed Corridors
            </span>
          </div>
          <div className="stat-number" style={{ fontSize: '2rem', color: 'var(--brand-teal)' }}>
            {trips}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Across NH44, NH163 & NH48 highways
          </div>
        </div>

        {/* Card 3: Loads Delivered */}
        <div className="card card-teal" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-teal-light)',
                color: 'var(--brand-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={20} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Shipper Consignments
            </span>
          </div>
          <div className="stat-number" style={{ fontSize: '2rem', color: 'var(--brand-teal)' }}>
            {loads}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Average rating 4.9 ★ across 32 retailers
          </div>
        </div>
      </div>

      {/* Reverse-Chronological Earnings History Card */}
      <div
        className="card"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: 0 }}>
            Recent Settlement Ledger
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', fontWeight: 600 }}>
            Automated UPI / NEFT Payouts
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {earnings.map((record) => (
            <div
              key={record.id}
              className="card-hoverable"
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--surface-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>
                  {record.route}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {record.date} · {record.loadsCount} Consignment ({formatWeight(record.weightKg)}) · Ref: <span className="mono-text">{record.payoutReference}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--brand-teal)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    +{formatCurrency(record.amount)}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                    Platform fee 2.5% (-{formatCurrency(record.escrowFeeDeducted)})
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: record.status === 'Settled' ? 'var(--brand-teal-light)' : 'var(--brand-amber-light)',
                    color: record.status === 'Settled' ? 'var(--brand-teal)' : 'var(--brand-amber)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>{record.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
