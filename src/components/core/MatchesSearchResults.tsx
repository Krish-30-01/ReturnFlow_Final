import React, { useState } from 'react';
import { Star, Truck, ArrowRight, SlidersHorizontal, ArrowLeft, Leaf, BarChart3 } from 'lucide-react';
import { MatchResult, LoadRequest } from '../../types/logistics';
import { formatCurrency, formatWeight, getMatchScoreClass } from '../../utils/formatting';
import { AnimatedProgressRing } from '../common/AnimatedProgressRing';

interface MatchesSearchResultsProps {
  matches: MatchResult[];
  activeLoad?: LoadRequest;
  onSelectMatch: (match: MatchResult) => void;
  onBack: () => void;
}

export const MatchesSearchResults: React.FC<MatchesSearchResultsProps> = ({
  matches,
  activeLoad: _activeLoad,
  onSelectMatch,
  onBack
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [minScore, setMinScore] = useState(40);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [expandedScoreCard, setExpandedScoreCard] = useState<string | null>(null);

  const filteredMatches = matches.filter(
    (m) => m.matchScore >= minScore && m.calculatedPrice <= maxPrice
  );

  return (
    <div className="matches-results-view animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            onClick={onBack}
            className="btn-outline-navy btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Dashboard</span>
          </button>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
            Best Backhaul Matches for You
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Ranked by corridor overlap, spare capacity density, and schedule compatibility.
          </p>
        </div>

        {/* Filter Toggle */}
        <button
          className="btn-outline-navy"
          onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <SlidersHorizontal size={16} />
          <span>Filters &amp; Thresholds</span>
        </button>
      </div>

      {/* Slide-down Filter Panel */}
      {filterDrawerOpen && (
        <div
          className="card"
          style={{
            padding: '20px',
            backgroundColor: 'var(--surface-3)',
            marginBottom: '24px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                Minimum Match Score: <strong>{minScore}%</strong>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-teal)' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                Max Budget Filter: <strong>{formatCurrency(maxPrice)}</strong>
              </label>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-amber)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Matches List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredMatches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <Truck size={40} color="var(--text-secondary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: 'var(--brand-navy)', marginBottom: '8px' }}>No matches found with current filters</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your match score or budget filter.</p>
          </div>
        ) : (
          filteredMatches.map((match, idx) => {
            const scoreMeta = getMatchScoreClass(match.matchScore);
            const remainingSpareKg = match.trip.totalCapacityKg - match.trip.bookedCapacityKg;
            const isExpanded = expandedScoreCard === match.id;

            return (
              <div
                key={match.id}
                className="card card-hoverable animate-fade-in"
                style={{
                  padding: '0',
                  borderRadius: 'var(--radius-card)',
                  border: match.matchScore >= 90 ? '1.5px solid var(--brand-teal)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  animationDelay: `${idx * 130}ms`,
                  animationFillMode: 'both',
                  overflow: 'hidden'
                }}
              >
                {/* Main Card Layout — Ring on left, details on right */}
                <div style={{
                  display: 'flex',
                  gap: '0',
                  alignItems: 'stretch'
                }}>
                  {/* Left: Circular Score Ring Panel */}
                  <div
                    onClick={() => setExpandedScoreCard(isExpanded ? null : match.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 20px',
                      minWidth: '120px',
                      backgroundColor: match.matchScore >= 90
                        ? 'rgba(29, 158, 117, 0.04)'
                        : match.matchScore >= 70
                          ? 'rgba(186, 117, 23, 0.04)'
                          : 'rgba(216, 90, 48, 0.04)',
                      borderRight: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background-color 200ms ease'
                    }}
                    title="Click to see score breakdown"
                  >
                    <AnimatedProgressRing
                      score={match.matchScore}
                      size={76}
                      strokeWidth={5}
                      label={scoreMeta.label.split(' ')[0]}
                    />
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.625rem',
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <BarChart3 size={10} />
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                    </div>
                  </div>

                  {/* Right: Route, Price, Driver Info */}
                  <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Top Row: Route & Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', margin: 0 }}>
                          {match.trip.from} → {match.trip.to}
                        </h3>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Departure: <strong>{match.trip.departureDate}</strong> ({match.trip.departureTimeWindow}) · Corridor: <strong>{match.trip.corridor}</strong>
                        </div>
                      </div>

                      {/* Price & Savings */}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--brand-navy)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {formatCurrency(match.calculatedPrice)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                          <span style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {formatCurrency(match.marketPrice)}
                          </span>
                          <span
                            style={{
                              backgroundColor: 'var(--brand-amber-light)',
                              color: 'var(--brand-amber)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.6875rem',
                              fontWeight: 700
                            }}
                          >
                            Save {match.savingsPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explanation Strip */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border-light)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.45
                      }}
                    >
                      <strong style={{ color: 'var(--brand-teal)' }}>Match Insight:</strong> {match.explanation}
                    </div>

                    {/* Driver & Truck Details Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-teal)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem'
                          }}
                        >
                          {match.trip.driverAvatarText}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.875rem' }}>
                              {match.trip.driverName}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#BA7517', fontSize: '0.75rem' }}>
                              <Star size={13} fill="#BA7517" />
                              <span>{match.trip.driverRating}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Vehicle: {match.trip.vehicleType} · Remaining: <strong>{formatWeight(remainingSpareKg)}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--brand-teal)' }}>
                          <Leaf size={14} />
                          <span>{match.co2SavedKg} Kg CO₂ Saved</span>
                        </div>

                        <button
                          className="btn-primary-teal"
                          onClick={() => onSelectMatch(match)}
                          id={`book-match-btn-${idx}`}
                          style={{ height: '40px', padding: '0 20px', fontSize: '0.875rem' }}
                        >
                          <span>Book Capacity</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Score Breakdown Drawer */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-light)',
                      padding: '16px 24px',
                      backgroundColor: 'var(--surface-2)',
                      animation: 'fadeIn 0.25s ease-out'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                      Match Compatibility Factor Breakdown
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {[
                        { label: 'Route Overlap (35%)', value: match.routeOverlapScore, icon: '🛣️' },
                        { label: 'Capacity Fit (25%)', value: match.capacityScore, icon: '📦' },
                        { label: 'Schedule Alignment (20%)', value: match.timeWindowScore, icon: '⏱️' },
                        { label: 'Detour Efficiency (15%)', value: match.priceScore, icon: '📍' },
                      ].map((dim) => (
                        <div
                          key={dim.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <AnimatedProgressRing
                            score={dim.value}
                            size={42}
                            strokeWidth={3.5}
                          />
                          <div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                              {dim.icon} {dim.label}
                            </div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-navy)' }}>
                              {dim.value}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
