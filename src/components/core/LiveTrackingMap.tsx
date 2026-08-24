import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MessageSquare,
  Navigation,
  ShieldCheck,
  FastForward,
  Star,
  Route,
  Gauge,
  Timer,
  ArrowLeft,
  Signal
} from 'lucide-react';
import { Booking, ShipmentStatus } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';

interface LiveTrackingMapProps {
  booking: Booking;
  onAdvanceStatus: (bookingId: string) => void;
  onOpenChat: () => void;
  onBack: () => void;
}

const STEPPER_STAGES: ShipmentStatus[] = ['Booked', 'Picked Up', 'In Transit', 'Delivered'];

/* SVG path for the highway corridor curve */
const ROUTE_PATH = 'M 40 160 C 140 160, 180 40, 260 80 S 360 140, 440 50';

/**
 * Helper: get point coordinates on a cubic bézier SVG path at a given t [0,1].
 * We use an invisible <path> element and getPointAtLength for accurate positioning.
 */
function usePathPoint(pathD: string, progress: number) {
  const [point, setPoint] = useState({ x: 40, y: 160 });
  const pathRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!pathRef.current) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      svg.appendChild(path);
      svg.style.position = 'absolute';
      svg.style.width = '0';
      svg.style.height = '0';
      svg.style.overflow = 'hidden';
      svg.style.pointerEvents = 'none';
      document.body.appendChild(svg);
      pathRef.current = path;
      svgRef.current = svg;
    }

    const path = pathRef.current;
    if (path) {
      const totalLength = path.getTotalLength();
      const t = Math.min(Math.max(progress / 100, 0), 1);
      const p = path.getPointAtLength(totalLength * t);
      setPoint({ x: p.x, y: p.y });
    }
  }, [pathD, progress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (svgRef.current && svgRef.current.parentNode) {
        svgRef.current.parentNode.removeChild(svgRef.current);
      }
    };
  }, []);

  return point;
}

/**
 * ETA Countdown — live ticking timer that counts down from etaMinutes
 */
const EtaCountdown: React.FC<{ etaMinutes: number }> = ({ etaMinutes }) => {
  const [seconds, setSeconds] = useState(etaMinutes * 60);

  useEffect(() => {
    setSeconds(etaMinutes * 60);
  }, [etaMinutes]);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Timer size={18} color="#1D9E75" />
      <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
        {hrs > 0 && (
          <>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#5DCAA5',
              lineHeight: 1,
              letterSpacing: '-1px'
            }}>{pad(hrs)}</span>
            <span style={{ fontSize: '0.75rem', color: '#9DA4B0', fontWeight: 600 }}>h</span>
          </>
        )}
        <span style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: '#5DCAA5',
          lineHeight: 1,
          letterSpacing: '-1px'
        }}>{pad(mins)}</span>
        <span style={{ fontSize: '0.75rem', color: '#9DA4B0', fontWeight: 600 }}>m</span>
        <span style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: seconds <= 300 ? '#D85A30' : '#5DCAA5',
          lineHeight: 1,
          letterSpacing: '-1px',
          transition: 'color 0.3s ease'
        }}>{pad(secs)}</span>
        <span style={{ fontSize: '0.75rem', color: '#9DA4B0', fontWeight: 600 }}>s</span>
      </div>
    </div>
  );
};

/**
 * Animated pulsing ring for the truck marker on the map
 */
const TruckPulse: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g>
    {/* Outer pulsing ring */}
    <circle cx={cx} cy={cy} r="22" fill="none" stroke="#1D9E75" strokeWidth="2" opacity="0.3">
      <animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* Mid ring */}
    <circle cx={cx} cy={cy} r="18" fill="none" stroke="#1D9E75" strokeWidth="1.5" opacity="0.5">
      <animate attributeName="r" values="18;24;18" dur="2s" begin="0.3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" begin="0.3s" repeatCount="indefinite" />
    </circle>
    {/* Core dot */}
    <circle cx={cx} cy={cy} r="14" fill="#1D9E75" />
    <circle cx={cx} cy={cy} r="14" fill="url(#truckGlow)" />
    <text x={cx - 7} y={cy + 5} fill="#FFFFFF" fontSize="13" fontWeight="bold">🚛</text>
  </g>
);

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  booking,
  onAdvanceStatus,
  onOpenChat,
  onBack
}) => {
  const [callActive, setCallActive] = useState(false);
  const [markerProgress, setMarkerProgress] = useState(0);

  const currentStageIndex = STEPPER_STAGES.indexOf(booking.status);

  // Animate marker to current progress
  useEffect(() => {
    const target = booking.telemetry.progressPercent;
    const start = markerProgress;
    const startTime = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setMarkerProgress(start + (target - start) * eased);
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [booking.telemetry.progressPercent]);

  const truckPoint = usePathPoint(ROUTE_PATH, markerProgress);

  const handleCallDriver = () => {
    setCallActive(true);
    setTimeout(() => setCallActive(false), 4000);
  };

  const getStatusCaption = () => {
    switch (booking.status) {
      case 'Booked':
        return 'Booking confirmed. Escrow secured. Vehicle preparing for pickup at origin warehouse.';
      case 'Picked Up':
        return 'Consignment loaded at dock. Verified weight & e-waybill attached. Departure initiated.';
      case 'In Transit':
        return `Truck en route on ${booking.corridor} corridor. Speed: ${booking.telemetry.currentSpeedKmh} km/h. ETA ~${booking.telemetry.etaMinutes} mins.`;
      case 'Delivered':
        return 'Destination dock check-in verified. Proof of delivery uploaded. Escrow settlement released to driver!';
      default:
        return 'Active shipment tracking.';
    }
  };

  return (
    <div className="live-tracking-view animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn-outline-navy btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
      >
        <ArrowLeft size={15} />
        <span>Back to Dashboard</span>
      </button>

      {/* Top Status Stepper */}
      <div
        className="card"
        style={{
          padding: '24px 32px',
          borderRadius: 'var(--radius-card)',
          marginBottom: '24px',
          backgroundColor: 'var(--surface-2)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Background Connecting Bar */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '5%',
              right: '5%',
              height: '3px',
              backgroundColor: 'var(--bg-secondary)',
              zIndex: 0
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(currentStageIndex / (STEPPER_STAGES.length - 1)) * 100}%`,
                backgroundColor: 'var(--brand-teal)',
                transition: 'width 0.5s ease-out'
              }}
            />
          </div>

          {STEPPER_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stage}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 1,
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent
                      ? 'var(--brand-teal)'
                      : isCompleted
                      ? 'var(--brand-teal-light)'
                      : 'var(--surface-2)',
                    border: isCurrent
                      ? '3px solid var(--brand-teal-light)'
                      : isCompleted
                      ? '2px solid var(--brand-teal)'
                      : '2px solid var(--border-color)',
                    color: isCurrent ? '#FFFFFF' : isCompleted ? 'var(--brand-teal)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(29, 158, 117, 0.2)' : 'none'
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--brand-navy)' : 'var(--text-secondary)'
                  }}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Stage Caption */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-3)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-navy)' }}>
            <Navigation size={16} color="#1D9E75" />
            <span>{getStatusCaption()}</span>
          </div>

          {/* Advance Simulation Step Action */}
          {booking.status !== 'Delivered' && (
            <button
              onClick={() => onAdvanceStatus(booking.id)}
              className="btn-outline-teal btn-sm"
              title="Simulate next live status transition along corridor"
              style={{ fontSize: '0.75rem', padding: '4px 10px', height: '28px' }}
            >
              <FastForward size={13} />
              <span>Simulate Next Transit Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Map Visualization & Telemetry Checkpoints */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Left: Vector Interactive Route Map */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-sm)',
            minHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#1E232B',
            color: '#FFFFFF'
          }}
        >
          {/* Top HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#9DA4B0', textTransform: 'uppercase' }}>
                <Signal size={12} color="#1D9E75" />
                LIVE GPS TELEMETRY (4G ACTIVE)
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                {booking.from} → {booking.to}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#1D9E75', marginTop: '2px' }}>
                Highway Corridor: <strong>{booking.corridor}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#5DCAA5' }}>
                {booking.telemetry.currentSpeedKmh} KM/H
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9DA4B0' }}>
                Progress: <strong>{booking.telemetry.progressPercent}%</strong>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Highway Canvas / Map Visualizer */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              margin: '16px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 480 200" style={{ overflow: 'visible' }}>
              {/* Defs for gradients & filters */}
              <defs>
                {/* Grid Background Pattern */}
                <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </pattern>

                {/* Glow filter for the active route */}
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Radial glow for truck marker */}
                <radialGradient id="truckGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
                </radialGradient>

                {/* Active route gradient */}
                <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1D9E75" />
                  <stop offset="100%" stopColor="#5DCAA5" />
                </linearGradient>
              </defs>

              <rect width="480" height="200" fill="url(#mapGrid)" rx="8" />

              {/* Highway Corridor Line (background — full route) */}
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Dashed road center marking */}
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* Active Completed Corridor Glow */}
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="url(#activeRouteGrad)"
                strokeWidth="4"
                strokeDasharray="480"
                strokeDashoffset={480 - (480 * markerProgress) / 100}
                strokeLinecap="round"
                filter="url(#routeGlow)"
                style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
              />

              {/* Pickup Pin */}
              <circle cx="40" cy="160" r="8" fill="#1D9E75" />
              <circle cx="40" cy="160" r="14" fill="none" stroke="#1D9E75" opacity="0.5" />
              <text x="10" y="190" fill="#FFFFFF" fontSize="10" fontWeight="bold">Origin</text>

              {/* Drop Pin */}
              <circle cx="440" cy="50" r="8" fill="#BA7517" />
              <circle cx="440" cy="50" r="14" fill="none" stroke="#BA7517" opacity="0.5" />
              <text x="400" y="30" fill="#FFFFFF" fontSize="10" fontWeight="bold">Destination</text>

              {/* Intermediate Checkpoints */}
              {booking.telemetry.checkpoints.map((cp, i) => {
                const cpProgress = ((i + 1) / (booking.telemetry.checkpoints.length + 1)) * 100;
                const opacity = cpProgress <= markerProgress ? 1 : 0.4;
                return (
                  <g key={i}>
                    <circle
                      cx={40 + (cpProgress / 100) * 400}
                      cy={160 - Math.sin((cpProgress / 100) * Math.PI) * 90}
                      r="5"
                      fill={cp.completed ? '#1D9E75' : '#FFFFFF'}
                      opacity={opacity}
                    />
                    {cp.completed && (
                      <text
                        x={40 + (cpProgress / 100) * 400}
                        y={160 - Math.sin((cpProgress / 100) * Math.PI) * 90 - 10}
                        fill="#9DA4B0"
                        fontSize="8"
                        textAnchor="middle"
                      >
                        {cp.name.split(' ').slice(0, 2).join(' ')}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Animated Truck Marker — positioned on the SVG path */}
              <TruckPulse cx={truckPoint.x} cy={truckPoint.y} />
            </svg>
          </div>

          {/* Bottom Map Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#9DA4B0', zIndex: 2 }}>
            <div>Location: <strong>{booking.telemetry.currentLocationName}</strong></div>
            <div>Updated: <strong>{booking.telemetry.lastUpdated}</strong></div>
          </div>
        </div>

        {/* Right: ETA + Checkpoints & Consignment Summary */}
        <div
          className="card"
          style={{
            padding: '0',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* ETA Countdown Banner */}
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: '#1E232B',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#9DA4B0', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '4px' }}>
                Estimated Time of Arrival
              </div>
              <EtaCountdown etaMinutes={booking.telemetry.etaMinutes} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <Gauge size={16} color="#5DCAA5" />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginTop: '2px' }}>
                  {booking.telemetry.currentSpeedKmh}
                </div>
                <div style={{ fontSize: '0.5625rem', color: '#9DA4B0' }}>KM/H</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Route size={16} color="#5DCAA5" />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginTop: '2px' }}>
                  {booking.telemetry.progressPercent}%
                </div>
                <div style={{ fontSize: '0.5625rem', color: '#9DA4B0' }}>DONE</div>
              </div>
            </div>
          </div>

          {/* Checkpoints Timeline */}
          <div style={{ padding: '20px 24px', flex: 1 }}>
            <h3 style={{ fontSize: '1.0625rem', color: 'var(--brand-navy)', marginBottom: '16px' }}>
              Corridor Checkpoints Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {booking.telemetry.checkpoints.map((cp, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '0.875rem'
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: cp.completed ? 'var(--brand-teal)' : 'var(--bg-secondary)',
                      color: cp.completed ? '#FFFFFF' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    {cp.completed ? '✓' : i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: cp.completed ? 600 : 400, color: 'var(--brand-navy)' }}>
                      {cp.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cp.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Consignment Facts */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.8125rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cargo:</span>
                <span style={{ fontWeight: 600 }}>{booking.goodsType} ({formatWeight(booking.weightKg)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Escrow Status:</span>
                <span style={{ fontWeight: 700, color: 'var(--brand-teal)' }}>{booking.escrowStatus} ({formatCurrency(booking.totalPrice)})</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-light)' }}>
            <ShieldCheck size={14} color="#1D9E75" />
            <span>Escrow is automatically settled to driver upon final delivery pin check.</span>
          </div>
        </div>
      </div>

      {/* Driver Contact Card — Full Width */}
      <div
        className="card"
        style={{
          padding: '0',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch'
          }}
        >
          {/* Driver Identity Panel */}
          <div
            style={{
              flex: '1 1 300px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-teal)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(29, 158, 117, 0.3)'
              }}
            >
              {booking.driverAvatar}
            </div>

            <div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1.0625rem' }}>
                {booking.driverName}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Driver Partner · <Star size={12} fill="#BA7517" color="#BA7517" style={{ verticalAlign: 'middle' }} /> {booking.driverRating}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Phone: <strong>{booking.driverPhone}</strong>
              </div>
            </div>
          </div>

          {/* Vehicle Details Panel */}
          <div
            style={{
              flex: '1 1 250px',
              padding: '24px',
              borderLeft: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.5px', fontWeight: 600 }}>
              Vehicle Info
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
              {booking.vehicleType}
            </div>
            <div style={{
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-3)',
              padding: '4px 10px',
              borderRadius: '6px',
              display: 'inline-block',
              width: 'fit-content'
            }}>
              {booking.vehiclePlate}
            </div>
          </div>

          {/* Contact Actions Panel */}
          <div
            style={{
              flex: '0 0 auto',
              padding: '24px',
              borderLeft: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {callActive ? (
              <div
                style={{
                  backgroundColor: 'var(--brand-teal-light)',
                  color: 'var(--brand-teal)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Phone size={16} className="pulsing-dot" />
                Calling {booking.driverPhone}...
              </div>
            ) : (
              <button
                className="btn-outline-teal"
                onClick={handleCallDriver}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Call driver directly"
              >
                <Phone size={20} />
              </button>
            )}

            <button
              className="btn-primary-teal"
              onClick={onOpenChat}
              style={{ height: '48px', padding: '0 24px' }}
            >
              <MessageSquare size={18} />
              <span>Open In-App Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
