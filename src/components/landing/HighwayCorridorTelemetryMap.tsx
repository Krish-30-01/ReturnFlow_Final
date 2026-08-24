import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface RoutePin {
  id: string;
  name: string;
  hub: string;
  x: number;
  y: number;
  type: 'origin' | 'destination' | 'hub';
}

interface CorridorRoute {
  id: string;
  name: string;
  highway: string;
  from: string;
  to: string;
  distanceKm: number;
  pathD: string;
  truckPos: { progress: number; speed: number; plate: string; vehicle: string; capacityFill: string; driver: string };
  matchBadge: string;
  color: string;
}

const CORRIDOR_ROUTES: CorridorRoute[] = [
  {
    id: 'HYD-BLR',
    name: 'Hyderabad ↔ Bangalore Corridor',
    highway: 'NH44',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    distanceKm: 569,
    pathD: 'M 220 70 Q 190 140 170 200 T 150 310',
    truckPos: {
      progress: 0.58,
      speed: 58,
      plate: 'TS-07-EA-9912',
      vehicle: 'TATA Signa 30T',
      capacityFill: '85% Backhaul Full',
      driver: 'Rajesh Kumar'
    },
    matchBadge: '94% Match · Apex Retail (2,500 Kg)',
    color: '#0D9488' // Brand Teal
  },
  {
    id: 'HYD-WAR',
    name: 'Hyderabad ↔ Warangal Corridor',
    highway: 'NH163',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal (Industrial Area)',
    distanceKm: 148,
    pathD: 'M 220 70 Q 280 65 350 55',
    truckPos: {
      progress: 0.72,
      speed: 62,
      plate: 'TS-09-UB-4421',
      vehicle: 'TATA 407 (4T)',
      capacityFill: '400 Kg Return Matched',
      driver: 'Rajesh Kumar'
    },
    matchBadge: '96% Match · Display Fixtures',
    color: '#BA7517' // Brand Amber
  },
  {
    id: 'VIJ-HYD',
    name: 'Hyderabad ↔ Vijayawada Corridor',
    highway: 'NH65',
    from: 'Hyderabad (L.B. Nagar)',
    to: 'Vijayawada (Auto Nagar)',
    distanceKm: 275,
    pathD: 'M 220 70 Q 290 120 360 170',
    truckPos: {
      progress: 0.40,
      speed: 52,
      plate: 'TS-11-FA-2083',
      vehicle: 'Ashok Leyland 14T',
      capacityFill: '6,500 Kg Available',
      driver: 'Suresh V.'
    },
    matchBadge: '88% Match · FMCG Groceries',
    color: '#2563EB' // Royal Blue
  }
];

const PINS: RoutePin[] = [
  { id: 'hyd', name: 'Hyderabad Hub', hub: 'Shamshabad / Uppal', x: 220, y: 70, type: 'origin' },
  { id: 'war', name: 'Warangal Industrial', hub: 'Kazipet / Hanamkonda', x: 350, y: 55, type: 'destination' },
  { id: 'blr', name: 'Bangalore Terminal', hub: 'Peenya / Electronic City', x: 150, y: 310, type: 'destination' },
  { id: 'vij', name: 'Vijayawada Hub', hub: 'Auto Nagar Terminal', x: 360, y: 170, type: 'destination' }
];

export const HighwayCorridorTelemetryMap: React.FC = () => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('HYD-BLR');
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimTick((prev) => (prev + 1) % 1000);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const activeCorridor = CORRIDOR_ROUTES.find((c) => c.id === selectedCorridorId) || CORRIDOR_ROUTES[0];

  // Calculate animated truck position along active corridor path
  // Approximate positions based on cubic bézier paths
  const getTruckCoordinates = (corridorId: string, tick: number) => {
    if (corridorId === 'HYD-BLR') {
      // Path: M 220 70 -> 170 200 -> 150 310
      const t = ((tick * 0.003 + 0.35) % 1);
      const x = 220 * (1 - t) * (1 - t) + 2 * 185 * (1 - t) * t + 150 * t * t;
      const y = 70 * (1 - t) * (1 - t) + 2 * 170 * (1 - t) * t + 310 * t * t;
      return { x, y };
    } else if (corridorId === 'HYD-WAR') {
      // Path: M 220 70 -> 350 55
      const t = ((tick * 0.005 + 0.6) % 1);
      const x = 220 + (350 - 220) * t;
      const y = 70 + (55 - 70) * t;
      return { x, y };
    } else {
      // Path: M 220 70 -> 360 170
      const t = ((tick * 0.004 + 0.2) % 1);
      const x = 220 + (360 - 220) * t;
      const y = 70 + (170 - 70) * t;
      return { x, y };
    }
  };

  const truckPos1 = getTruckCoordinates('HYD-BLR', animTick);
  const truckPos2 = getTruckCoordinates('HYD-WAR', animTick);
  const truckPos3 = getTruckCoordinates('VIJ-HYD', animTick);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: '#0B132B',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(13, 148, 136, 0.3)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        color: '#FFFFFF'
      }}
    >
      {/* Top Header HUD Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              animation: 'pulse 1.5s infinite'
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.8px', color: '#94A3B8', textTransform: 'uppercase' }}>
            Live Corridor Telemetry · Backhaul GPS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              backgroundColor: 'rgba(13, 148, 136, 0.2)',
              color: '#2DD4BF',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontWeight: 600,
              border: '1px solid rgba(13, 148, 136, 0.4)'
            }}
          >
            3 Active Backhaul Routes
          </span>
        </div>
      </div>

      {/* Corridor Selector Pill Tabs */}
      <div
        style={{
          position: 'absolute',
          top: '52px',
          left: '14px',
          display: 'flex',
          gap: '6px',
          zIndex: 10
        }}
      >
        {CORRIDOR_ROUTES.map((corr) => {
          const isSelected = corr.id === selectedCorridorId;
          return (
            <button
              key={corr.id}
              onClick={() => setSelectedCorridorId(corr.id)}
              style={{
                fontSize: '0.6875rem',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.3)' : 'rgba(30, 41, 59, 0.7)',
                color: isSelected ? '#5EEAD4' : '#94A3B8',
                border: isSelected ? '1px solid #0D9488' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: corr.color }} />
              <span>{corr.highway}</span>
            </button>
          );
        })}
      </div>

      {/* Main SVG Vector Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 460 350"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="heroMapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
            </pattern>

            {/* Glowing route filters */}
            <filter id="glowTeal" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="460" height="350" fill="url(#heroMapGrid)" />

          {/* Stylized Regional Highway Outlines (Background Paths with subtle animated flow) */}
          <path
            d="M 220 70 Q 190 140 170 200 T 150 310"
            fill="none"
            stroke="rgba(13, 148, 136, 0.2)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 220 70 Q 190 140 170 200 T 150 310"
            fill="none"
            stroke="rgba(13, 148, 136, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            className="route-flow-line"
            strokeLinecap="round"
          />

          <path
            d="M 220 70 Q 280 65 350 55"
            fill="none"
            stroke="rgba(186, 117, 23, 0.2)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 220 70 Q 280 65 350 55"
            fill="none"
            stroke="rgba(186, 117, 23, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            className="route-flow-line"
            strokeLinecap="round"
          />

          <path
            d="M 220 70 Q 290 120 360 170"
            fill="none"
            stroke="rgba(37, 99, 235, 0.2)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 220 70 Q 290 120 360 170"
            fill="none"
            stroke="rgba(37, 99, 235, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            className="route-flow-line"
            strokeLinecap="round"
          />

          {/* Active Highlighted Corridor Path with Glow */}
          <path
            d={activeCorridor.pathD}
            fill="none"
            stroke={activeCorridor.color}
            strokeWidth="4"
            strokeLinecap="round"
            filter={activeCorridor.id === 'HYD-BLR' ? 'url(#glowTeal)' : 'url(#glowAmber)'}
          />

          {/* Active Corridor Bright Flowing Telemetry Dash Line */}
          <path
            d={activeCorridor.pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="8 10"
            className="route-flow-line"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Corridor Highway Labels on Map */}
          <text x="160" y="210" fill="#2DD4BF" fontSize="10" fontWeight="700" opacity="0.8">NH44 (569 km)</text>
          <text x="270" y="50" fill="#FBBF24" fontSize="10" fontWeight="700" opacity="0.8">NH163 (148 km)</text>
          <text x="290" y="150" fill="#60A5FA" fontSize="10" fontWeight="700" opacity="0.8">NH65 (275 km)</text>

          {/* Labeled City Pins */}
          {PINS.map((pin) => {
            const isOrigin = pin.type === 'origin';
            const pinColor = isOrigin ? '#10B981' : pin.id === 'war' ? '#F59E0B' : pin.id === 'blr' ? '#0D9488' : '#3B82F6';

            return (
              <g key={pin.id} transform={`translate(${pin.x}, ${pin.y})`}>
                {/* Outer pulsing ring */}
                <circle cx="0" cy="0" r="14" fill="none" stroke={pinColor} strokeWidth="1.5" opacity="0.3">
                  <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* Inner pin point */}
                <circle cx="0" cy="0" r="5.5" fill={pinColor} stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Pin Text Label */}
                <rect
                  x={pin.x > 300 ? -90 : pin.x < 180 ? 10 : -45}
                  y={pin.y > 250 ? -28 : 10}
                  width="85"
                  height="22"
                  rx="4"
                  fill="rgba(15, 23, 42, 0.88)"
                  stroke="rgba(255, 255, 255, 0.12)"
                />
                <text
                  x={pin.x > 300 ? -47 : pin.x < 180 ? 52 : -2}
                  y={pin.y > 250 ? -14 : 24}
                  fill="#F8FAFC"
                  fontSize="8.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {pin.name}
                </text>
              </g>
            );
          })}

          {/* Animated Truck 1 on NH44 */}
          <g transform={`translate(${truckPos1.x}, ${truckPos1.y})`}>
            <circle cx="0" cy="0" r="14" fill="rgba(13, 148, 136, 0.35)" />
            <circle cx="0" cy="0" r="8" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="-4.5" y="3.5" fontSize="8" fill="#FFFFFF">🚛</text>
            {selectedCorridorId === 'HYD-BLR' && (
              <g transform="translate(14, -12)">
                <rect width="130" height="26" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#0D9488" strokeWidth="1" />
                <text x="6" y="11" fill="#5EEAD4" fontSize="7.5" fontWeight="700">TS-07-EA-9912 · 58 km/h</text>
                <text x="6" y="21" fill="#94A3B8" fontSize="7">85% Backhaul Full (2.5T Load)</text>
              </g>
            )}
          </g>

          {/* Animated Truck 2 on NH163 */}
          <g transform={`translate(${truckPos2.x}, ${truckPos2.y})`}>
            <circle cx="0" cy="0" r="14" fill="rgba(186, 117, 23, 0.35)" />
            <circle cx="0" cy="0" r="8" fill="#BA7517" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="-4.5" y="3.5" fontSize="8" fill="#FFFFFF">🚛</text>
            {selectedCorridorId === 'HYD-WAR' && (
              <g transform="translate(14, -12)">
                <rect width="125" height="26" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#BA7517" strokeWidth="1" />
                <text x="6" y="11" fill="#FDE68A" fontSize="7.5" fontWeight="700">TS-09-UB-4421 · 62 km/h</text>
                <text x="6" y="21" fill="#94A3B8" fontSize="7">400 Kg Return Matched</text>
              </g>
            )}
          </g>

          {/* Animated Truck 3 on NH65 */}
          <g transform={`translate(${truckPos3.x}, ${truckPos3.y})`}>
            <circle cx="0" cy="0" r="14" fill="rgba(37, 99, 235, 0.35)" />
            <circle cx="0" cy="0" r="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="-4.5" y="3.5" fontSize="8" fill="#FFFFFF">🚛</text>
          </g>
        </svg>
      </div>

      {/* Bottom Corridor Telemetry Status Bar */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
              {activeCorridor.from} → {activeCorridor.to}
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8', fontFamily: 'monospace' }}>
              ({activeCorridor.highway} · {activeCorridor.distanceKm} km)
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#5EEAD4', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={11} />
            <span>Active Return Match: <strong>{activeCorridor.matchBadge}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399', fontFamily: 'monospace' }}>
              {activeCorridor.truckPos.capacityFill}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              Fleet: {activeCorridor.truckPos.plate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
