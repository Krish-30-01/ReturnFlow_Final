import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MessageSquare, CheckCircle2, XCircle, Navigation, Phone } from 'lucide-react';
import { Booking, Persona } from '../../types/logistics';
import { formatCurrency } from '../../utils/formatting';

interface LiveTrackingMapProps {
  booking: Booking; currentPersona: Persona;
  onAdvanceStatus: (bookingId: string) => void;
  onConfirmDelivery: (bookingId: string, role: 'driver' | 'customer') => void;
  onCancelBooking: (bookingId: string, reason?: string) => void;
  onOpenChat: () => void; onBack: () => void;
}

// Leaflet via react-leaflet — correct CSS import fixes the old "map not in position" bug
// (Leaflet panes/tiles are absolutely positioned; without leaflet.css they scatter).
// Tile API key: set VITE_MAPTILER_KEY to use MapTiler premium tiles, else free CARTO Voyager (no key).
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';

// Free OpenStreetMap tiles — no API key required
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Invalidates size after mount + on container resize (card layout changes otherwise offset tiles)
const FixMapSize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    const ro = new ResizeObserver(() => map.invalidateSize());
    const el = map.getContainer();
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [map]);
  return null;
};

const FitToRoute: React.FC<{ line: L.LatLngExpression[] }> = ({ line }) => {
  const map = useMap();
  useEffect(() => {
    if (line.length > 1) map.fitBounds(L.latLngBounds(line as L.LatLng[]), { padding: [48, 48] });
    else if (line.length === 1) map.setView(line[0] as L.LatLng, 8);
  }, [map, line]);
  return null;
};

const MapComponent: React.FC<{ booking: Booking }> = ({ booking }) => {
  const { currentLat, currentLng, routeCoordinates, checkpoints } = booking.telemetry;

  // Seed stores [lat,lng] — Leaflet's native order, no conversion needed
  const line: L.LatLngExpression[] = (routeCoordinates?.length
    ? routeCoordinates
    : [[currentLat, currentLng]]
  ) as L.LatLngExpression[];
  const center: L.LatLngExpression = [currentLat, currentLng];

  const truckIcon = React.useMemo(() => L.divIcon({
    html: `<div style="background:#1D9E75;color:#fff;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(29,158,117,0.45);border:2px solid #fff;">🚛 ${booking.vehiclePlate}</div>`,
    className: 'rf-truck-marker', iconSize: [0, 0], iconAnchor: [0, 12],
  }), [booking.vehiclePlate]);

  const cpIcon = React.useCallback((completed: boolean, i: number) => L.divIcon({
    html: `<div style="background:${completed ? '#1D9E75' : '#94A3B8'};color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);">${i + 1}</div>`,
    className: 'rf-cp-marker', iconSize: [22, 22], iconAnchor: [11, 11],
  }), []);

  const dotIcon = React.useCallback((color: string) => L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.35);"></div>`,
    className: 'rf-dot-marker', iconSize: [14, 14], iconAnchor: [7, 7],
  }), []);

  // key on booking.id only — NOT whole booking object (avoids remount loop)
  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden', borderRadius: '0 0 var(--radius-card) var(--radius-card)', backgroundColor: 'var(--bg-secondary)' }}>
      <MapContainer
        key={booking.id}
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        attributionControl
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
        <FixMapSize />
        <FitToRoute line={line} />
        {line.length > 1 && (
          <Polyline positions={line} pathOptions={{ color: '#1D9E75', weight: 4, opacity: 0.9, dashArray: '8,6' }} />
        )}
        <Marker position={center} icon={truckIcon} />
        {line.length > 1 && (
          <>
            <Marker position={line[0]} icon={dotIcon('#042C53')} />
            <Marker position={line[line.length - 1]} icon={dotIcon('#D85A30')} />
          </>
        )}
        {checkpoints?.map((cp, i) => (
          <Marker key={`${cp.name}-${i}`} position={[cp.lat, cp.lng]} icon={cpIcon(cp.completed, i)}>
            <Popup><b>{cp.name}</b><br />{cp.time}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ booking, currentPersona, onAdvanceStatus, onConfirmDelivery, onCancelBooking, onOpenChat, onBack }) => {
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const { telemetry, status } = booking;
  const isDriver = currentPersona === 'driver';
  const isAdmin = currentPersona === 'admin';
  const canAdvance = (isDriver || isAdmin) && ['Booked', 'Picked Up', 'In Transit'].includes(status);
  const isDelivered = status === 'Delivered';

  // ETA display
  const etaH = Math.floor(telemetry.etaMinutes / 60);
  const etaM = telemetry.etaMinutes % 60;
  const etaStr = telemetry.etaMinutes > 0 ? `${etaH > 0 ? `${etaH}h ` : ''}${etaM}m` : 'Arrived';

  const STAGE_ORDER = ['Booked', 'Picked Up', 'In Transit', 'Delivered'];
  const currentStageIdx = STAGE_ORDER.indexOf(status);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onBack} className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', margin: 0 }}>Live Shipment Tracking</h1>
        <button onClick={onOpenChat} className="btn-outline-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={16} /><span>Chat</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Map */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-card)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} color="#1D9E75" />
                <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{booking.from} → {booking.to}</span>
              </div>
              <span className={`status-pill ${isDelivered ? 'status-delivered' : 'status-in-transit'}`} style={{ fontSize: '0.75rem' }}>
                {isDelivered ? <span className="status-dot-static" style={{ color: 'var(--brand-teal)' }} /> : <span className="status-dot-pulse" />}
                <span>{status}</span>
              </span>
            </div>
            <MapComponent booking={booking} />
          </div>
        </div>

        {/* Progress & ETA */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--brand-navy)', marginBottom: '20px', fontSize: '1rem' }}>Shipment Progress</h3>

          {/* Progress bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Progress</span>
              <span className="mono-text" style={{ fontWeight: 700, color: 'var(--brand-teal)' }}>{telemetry.progressPercent}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${telemetry.progressPercent}%`, height: '100%', backgroundColor: 'var(--brand-teal)', borderRadius: '5px', transition: 'width 0.6s ease-out' }} />
            </div>
          </div>

          {/* ETA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--surface-3)', borderRadius: '8px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ETA</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>{etaStr}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Speed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>{telemetry.currentSpeedKmh} km/h</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Current Location:</div>
          <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.9375rem', marginBottom: '16px' }}>{telemetry.currentLocationName}</div>

          {/* Stage Stepper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {STAGE_ORDER.map((stage, i) => {
              const isDone = i <= currentStageIdx;
              const isCurrent = i === currentStageIdx;
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isDone ? 'var(--brand-teal)' : 'var(--bg-secondary)', color: isDone ? '#FFFFFF' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, border: isCurrent ? '2px solid var(--brand-teal)' : 'none' }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--brand-teal)' : isDone ? 'var(--brand-navy)' : 'var(--text-secondary)' }}>{stage}</span>
                  {isCurrent && !isDelivered && <span className="status-dot-pulse" style={{ color: 'var(--brand-teal)', marginLeft: 'auto' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Card & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--brand-navy)', marginBottom: '16px', fontSize: '1rem' }}>Driver Details</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--brand-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>{booking.driverAvatar}</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{booking.driverName}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{booking.vehicleType}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{booking.vehiclePlate}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onOpenChat} className="btn-outline-teal btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <MessageSquare size={14} /><span>Chat</span>
              </button>
              <a href={`tel:${booking.driverPhone}`} style={{ flex: 1 }}>
                <button className="btn-outline-navy btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Phone size={14} /><span>Call</span>
                </button>
              </a>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--brand-navy)', marginBottom: '12px', fontSize: '1rem' }}>Escrow Status</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Amount Held</span>
              <span style={{ fontWeight: 700, color: 'var(--brand-teal)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(booking.basePrice)}</span>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: booking.escrowStatus === 'Held in Escrow' ? 'var(--brand-teal-light)' : 'var(--bg-secondary)', color: booking.escrowStatus === 'Held in Escrow' ? 'var(--brand-teal)' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
              {booking.escrowStatus}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {canAdvance && (
              <button onClick={() => onAdvanceStatus(booking.id)} className="btn-primary-teal" style={{ width: '100%', height: '44px', fontSize: '0.875rem' }}>
                <Navigation size={16} /><span>Simulate Next Transit Stage</span>
              </button>
            )}
            {!isDelivered && (
              <button onClick={() => onConfirmDelivery(booking.id, isDriver ? 'driver' : 'customer')} className="btn-outline-teal" style={{ width: '100%', height: '44px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--brand-teal)" />
                <span>Confirm {isDriver ? 'Delivery' : 'Receipt'}</span>
              </button>
            )}
            {['Booked', 'Picked Up'].includes(status) && (
              <>
                {!showCancelConfirm ? (
                  <button onClick={() => setShowCancelConfirm(true)} className="btn-outline-navy" style={{ width: '100%', height: '40px', fontSize: '0.875rem', color: 'var(--brand-coral)', borderColor: 'rgba(216,90,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <XCircle size={16} /><span>Cancel Booking</span>
                  </button>
                ) : (
                  <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(216,90,48,0.06)', border: '1px solid rgba(216,90,48,0.25)' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--brand-coral)', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>
                      Are you sure you want to cancel this booking?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowCancelConfirm(false)} className="btn-outline-navy" style={{ flex: 1, height: '36px', fontSize: '0.8125rem' }}>
                        Keep Booking
                      </button>
                      <button onClick={() => { setShowCancelConfirm(false); onCancelBooking(booking.id, 'Cancelled by user'); }} style={{ flex: 1, height: '36px', fontSize: '0.8125rem', fontWeight: 600, backgroundColor: 'var(--brand-coral)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {isDelivered && (
              <div style={{ padding: '16px', backgroundColor: 'var(--brand-teal-light)', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(29,158,117,0.25)' }}>
                <CheckCircle2 size={28} color="#1D9E75" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Delivered!</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Escrow payment is being settled.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
