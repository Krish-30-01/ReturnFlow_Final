import React, { useState, useEffect } from 'react';
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
import { isLiveBackend } from '../../services/supabaseClient';
import { Booking, ShipmentStatus } from '../../types/logistics';
import { formatCurrency, formatWeight } from '../../utils/formatting';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path (broken in Vite/webpack bundlers)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom truck marker icon
const truckIcon = L.divIcon({
  html: `<div style="
    background: #1D9E75;
    border: 3px solid #fff;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 0 4px rgba(29,158,117,0.3), 0 4px 12px rgba(0,0,0,0.4);
    animation: truckPulse 2s ease-in-out infinite;
  ">🚛</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const originIcon = L.divIcon({
  html: `<div style="
    background: #1D9E75;
    border: 3px solid #fff;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destIcon = L.divIcon({
  html: `<div style="
    background: #BA7517;
    border: 3px solid #fff;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/**
 * Inner component that re-centres the map whenever the truck position changes.
 */
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(position, { animate: true, duration: 1.2 });
  }, [position, map]);
  return null;
}

interface LiveTrackingMapProps {
  booking: Booking;
  currentPersona?: 'driver' | 'customer' | 'admin' | 'guest';
  onAdvanceStatus: (bookingId: string) => void;
  onConfirmDelivery?: (bookingId: string, role: 'driver' | 'customer') => void;
  onCancelBooking?: (bookingId: string, reason?: string) => void;
  onOpenChat: () => void;
  onBack: () => void;
}

const STEPPER_STAGES: ShipmentStatus[] = ['Booked', 'Picked Up', 'In Transit', 'Delivered'];

/**
 * Interpolates a position along an array of [lat,lng] waypoints at a given
 * progress percentage (0–100). Used to animate the truck marker.
 */
function interpolatePosition(
  coords: [number, number][],
  progress: number
): [number, number] {
  if (!coords || coords.length === 0) return [17.3850, 78.4867];
  if (coords.length === 1) return coords[0];
  if (progress <= 0) return coords[0];
  if (progress >= 100) return coords[coords.length - 1];

  const t = progress / 100;
  const segCount = coords.length - 1;
  const rawSeg = t * segCount;
  const segIdx = Math.min(Math.floor(rawSeg), segCount - 1);
  const segT = rawSeg - segIdx;

  const [lat1, lng1] = coords[segIdx];
  const [lat2, lng2] = coords[segIdx + 1];
  return [lat1 + (lat2 - lat1) * segT, lng1 + (lng2 - lng1) * segT];
}

/**
 * ETA Countdown — live ticking timer.
 * Stops counting when booking is cancelled or delivered.
 */
const EtaCountdown: React.FC<{ etaMinutes: number; active: boolean }> = ({ etaMinutes, active }) => {
  const [seconds, setSeconds] = useState(etaMinutes * 60);

  useEffect(() => {
    setSeconds(etaMinutes * 60);
  }, [etaMinutes]);

  useEffect(() => {
    // Bug 1 fix: only tick when the booking is in an active transit state.
    // If active is false (cancelled / delivered) the interval is never created.
    if (!active || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [active, seconds]);

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

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  booking,
  currentPersona = 'customer',
  onAdvanceStatus,
  onConfirmDelivery,
  onCancelBooking,
  onOpenChat,
  onBack
}) => {
  const [callActive, setCallActive] = useState(false);
  const [markerProgress, setMarkerProgress] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const currentStageIndex = STEPPER_STAGES.indexOf(booking.status);

  // These must be declared before any useEffect that references them
  const isDelivered = booking.status === 'Delivered';
  const isCancelled = booking.status === 'Cancelled';
  const isActiveTransit = !isCancelled && !isDelivered;

  // Bug 13 fix: guard against null/missing telemetry before any array operations.
  const routeCoords: [number, number][] = (
    booking.telemetry?.routeCoordinates as [number, number][] | undefined
  ) ?? [[17.3850, 78.4867], [17.9689, 79.5941]];

  // Bug 12 fix: cancel the previous animation frame on every new effect run.
  // Bug 1 fix: skip animation entirely when booking is cancelled or delivered.
  useEffect(() => {
    if (!isActiveTransit) return; // no animation needed for terminal states
    const target = booking.telemetry?.progressPercent ?? 0;
    const start = markerProgress;
    const startTime = performance.now();
    const duration = 1200;
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setMarkerProgress(start + (target - start) * eased);
      if (t < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [booking.telemetry?.progressPercent, isActiveTransit]); // eslint-disable-line react-hooks/exhaustive-deps
  const truckPos = interpolatePosition(routeCoords, markerProgress);

  // Split route into completed (green) and remaining (dim) segments
  const completedIdx = Math.floor((markerProgress / 100) * (routeCoords.length - 1));
  const completedPath: [number, number][] = [...routeCoords.slice(0, completedIdx + 1), truckPos];
  const remainingPath: [number, number][] = [truckPos, ...routeCoords.slice(completedIdx + 1)];

  const mapCenter: [number, number] = routeCoords.length > 0
    ? [routeCoords.reduce((s, c) => s + c[0], 0) / routeCoords.length,
       routeCoords.reduce((s, c) => s + c[1], 0) / routeCoords.length]
    : [17.3850, 78.4867];

  const handleCallDriver = () => {
    setCallActive(true);
    setTimeout(() => setCallActive(false), 4000);
  };

  const getStatusCaption = () => {
    if (booking.status === 'Cancelled') {
      return `Shipment cancelled. Escrow refund of ${formatCurrency(booking.totalPrice)} processed.`;
    }
    switch (booking.status) {
      case 'Booked':
        return 'Booking confirmed. Escrow secured. Vehicle preparing for pickup at origin warehouse.';
      case 'Picked Up':
        return 'Consignment loaded at dock. Verified weight & e-waybill attached. Departure initiated.';
      case 'In Transit':
        return `Truck en route on ${booking.corridor} corridor. Speed: ${booking.telemetry.currentSpeedKmh} km/h. ETA ~${booking.telemetry.etaMinutes} mins.`;
      case 'Delivered':
        return 'Two-sided delivery verified! Escrow settlement released to driver.';
      default:
        return 'Active shipment tracking.';
    }
  };

  const driverPayout = Math.round(booking.basePrice * 0.975);

  return (
    <div className="live-tracking-view animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Top Bar with Back and Cancellation Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <button
          onClick={onBack}
          className="btn-outline-navy btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>

        {!isDelivered && !isCancelled && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="btn-outline-navy btn-sm"
            style={{ color: 'var(--brand-coral)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            id="cancel-shipment-refund-btn"
          >
            <span>Cancel Shipment &amp; Refund Escrow</span>
          </button>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.25rem', marginBottom: '8px' }}>
              Confirm Shipment Cancellation &amp; Refund
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to cancel booking #{booking.id}? Funds held in escrow ({formatCurrency(booking.totalPrice)}) will be immediately marked <strong>Refunded</strong>, and driver payload capacity will be restored.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-outline-navy"
                onClick={() => setShowCancelConfirm(false)}
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}
              >
                Go Back
              </button>
              <button
                className="btn-primary-coral"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancelBooking?.(booking.id, 'User requested cancellation');
                }}
                style={{ padding: '8px 18px', fontSize: '0.875rem', backgroundColor: 'var(--brand-coral)', color: '#FFFFFF' }}
                id="confirm-cancel-refund-btn"
              >
                Confirm &amp; Refund Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Sided Delivery Verification Strip (CRITICAL) */}
      <div
        className="card animate-fade-in"
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-card)',
          marginBottom: '24px',
          backgroundColor: isDelivered
            ? 'var(--brand-teal-light)'
            : isCancelled
            ? 'var(--brand-coral-light)'
            : 'var(--surface-3)',
          border: isDelivered
            ? '1.5px solid var(--brand-teal)'
            : isCancelled
            ? '1.5px solid var(--brand-coral)'
            : '1.5px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isDelivered ? 'var(--brand-teal)' : isCancelled ? 'var(--brand-coral)' : 'var(--brand-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TWO-SIDED ESCROW RELEASE PROTOCOL
            </div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', margin: '2px 0 0' }}>
              {isDelivered
                ? 'Consignment Delivered & Escrow Settled'
                : isCancelled
                ? 'Shipment Cancelled — Escrow Refunded'
                : 'Delivery Verification Required Before Payout'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: isDelivered ? 'var(--brand-teal)' : isCancelled ? 'var(--brand-coral)' : 'var(--surface-2)',
                color: isDelivered || isCancelled ? '#FFFFFF' : 'var(--brand-navy)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              Escrow: {booking.escrowStatus} ({formatCurrency(booking.totalPrice)})
            </span>
          </div>
        </div>

        {/* Confirmation State Badges & Interactive Buttons */}
        {!isCancelled && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            {/* Driver Side Confirmation */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: '8px',
                border: booking.driverConfirmedDelivery ? '1.5px solid var(--brand-teal)' : '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  1. DRIVER CONFIRMATION
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: booking.driverConfirmedDelivery ? 'var(--brand-teal)' : 'var(--text-primary)', marginTop: '2px' }}>
                  {booking.driverConfirmedDelivery ? '✓ Marked as Delivered' : 'Pending Driver Drop-off'}
                </div>
                {booking.driverConfirmedAt && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    Confirmed: {new Date(booking.driverConfirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {!booking.driverConfirmedDelivery && (currentPersona === 'driver' || currentPersona === 'admin') && (
                <button
                  className="btn-primary-teal btn-sm"
                  onClick={() => onConfirmDelivery?.(booking.id, 'driver')}
                  id="driver-confirm-delivery-btn"
                  style={{ height: '34px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                >
                  Mark Delivered
                </button>
              )}
            </div>

            {/* Retailer Side Confirmation */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: '8px',
                border: booking.retailerConfirmedDelivery ? '1.5px solid var(--brand-teal)' : '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  2. RETAILER CONFIRMATION
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: booking.retailerConfirmedDelivery ? 'var(--brand-teal)' : 'var(--text-primary)', marginTop: '2px' }}>
                  {booking.retailerConfirmedDelivery ? '✓ Goods Confirmed Received' : 'Pending Retailer Receipt'}
                </div>
                {booking.retailerConfirmedAt && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    Confirmed: {new Date(booking.retailerConfirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {!booking.retailerConfirmedDelivery && (currentPersona === 'customer' || currentPersona === 'admin') && (
                <button
                  className="btn-primary-amber btn-sm"
                  onClick={() => onConfirmDelivery?.(booking.id, 'customer')}
                  id="retailer-confirm-received-btn"
                  style={{ height: '34px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                >
                  Confirm Received
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Status Explainer */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color={isDelivered ? '#1D9E75' : '#BA7517'} style={{ flexShrink: 0 }} />
          <span>
            {isDelivered
              ? `Settlement complete! ₹${driverPayout.toLocaleString()} released to driver ${booking.driverName}.`
              : booking.driverConfirmedDelivery && !booking.retailerConfirmedDelivery
              ? `Driver confirmed delivery. Escrow payout is safely locked until retailer confirms receipt.`
              : !booking.driverConfirmedDelivery && booking.retailerConfirmedDelivery
              ? `Retailer confirmed receipt. Escrow payout is safely locked until driver marks delivery.`
              : `Escrow funds (${formatCurrency(booking.totalPrice)}) remain strictly locked until BOTH parties confirm delivery.`}
          </span>
        </div>
      </div>

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
                width: `${(Math.max(0, currentStageIndex) / (STEPPER_STAGES.length - 1)) * 100}%`,
                backgroundColor: 'var(--brand-teal)',
                transition: 'width 0.5s ease-out'
              }}
            />
          </div>

          {STEPPER_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || isDelivered;
            const isCurrent = idx === currentStageIndex && !isDelivered;

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

          {/* Advance Simulation Step Action — only visible to driver/admin */}
          {booking.status !== 'Delivered' && booking.status !== 'Cancelled' && (currentPersona === 'driver' || currentPersona === 'admin') && (
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
                <Signal size={12} color={isCancelled ? '#D85A30' : isLiveBackend && booking.telemetry.currentSpeedKmh > 0 ? '#1D9E75' : '#9DA4B0'} />
                {isCancelled
                  ? 'TRACKING STOPPED — SHIPMENT CANCELLED'
                  : isLiveBackend && booking.telemetry.currentSpeedKmh > 0
                  ? 'LIVE GPS TRACKING (4G ACTIVE)'
                  : 'SIMULATED ROUTE TRACKING (DEMO)'}
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

          {/* ── Real Leaflet / OpenStreetMap Interactive Map ── */}
          <style>{`
            @keyframes truckPulse {
              0%, 100% { box-shadow: 0 0 0 4px rgba(29,158,117,0.35), 0 4px 12px rgba(0,0,0,0.4); }
              50% { box-shadow: 0 0 0 10px rgba(29,158,117,0.1), 0 4px 12px rgba(0,0,0,0.4); }
            }
            .leaflet-container { border-radius: 10px; }
          `}</style>
          <div style={{ position: 'relative', width: '100%', height: '260px', margin: '16px 0', borderRadius: '10px', overflow: 'hidden' }}>
            <MapContainer
              center={mapCenter}
              zoom={routeCoords.length > 2 ? 8 : 10}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              {/* Dark OSM tile layer — matches the existing dark card theme */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Remaining (dim) path */}
              {remainingPath.length > 1 && (
                <Polyline
                  positions={remainingPath}
                  pathOptions={{ color: 'rgba(255,255,255,0.18)', weight: 5, lineCap: 'round', lineJoin: 'round' }}
                />
              )}

              {/* Completed (glowing teal) path */}
              {completedPath.length > 1 && (
                <Polyline
                  positions={completedPath}
                  pathOptions={{ color: '#1D9E75', weight: 5, lineCap: 'round', lineJoin: 'round' }}
                />
              )}

              {/* Origin pin */}
              {routeCoords.length > 0 && (
                <Marker position={routeCoords[0]} icon={originIcon}>
                  <Popup>{booking.from}</Popup>
                </Marker>
              )}

              {/* Destination pin */}
              {routeCoords.length > 1 && (
                <Marker position={routeCoords[routeCoords.length - 1]} icon={destIcon}>
                  <Popup>{booking.to}</Popup>
                </Marker>
              )}

              {/* Animated truck marker */}
              <Marker position={truckPos} icon={truckIcon}>
                <Popup>
                  🚛 {booking.driverName}<br />
                  Speed: {booking.telemetry.currentSpeedKmh} km/h<br />
                  {booking.telemetry.currentLocationName}
                </Popup>
              </Marker>

              {/* Auto-pan map to follow truck */}
              <MapRecenter position={truckPos} />
            </MapContainer>

            {/* HUD overlay — speed & progress badge */}
            <div style={{
              position: 'absolute', top: '10px', right: '10px', zIndex: 1000,
              background: 'rgba(18,24,32,0.88)', backdropFilter: 'blur(6px)',
              borderRadius: '8px', padding: '8px 14px',
              display: 'flex', gap: '16px', alignItems: 'center',
              border: '1px solid rgba(29,158,117,0.3)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#5DCAA5' }}>
                  {booking.telemetry.currentSpeedKmh}
                </div>
                <div style={{ fontSize: '0.5625rem', color: '#9DA4B0', textTransform: 'uppercase' }}>km/h</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#5DCAA5' }}>
                  {booking.telemetry.progressPercent}%
                </div>
                <div style={{ fontSize: '0.5625rem', color: '#9DA4B0', textTransform: 'uppercase' }}>done</div>
              </div>
            </div>
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
              backgroundColor: isCancelled ? '#1C1010' : '#1E232B',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#9DA4B0', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '4px' }}>
                {isCancelled ? 'Shipment Status' : 'Estimated Time of Arrival'}
              </div>
              {/* Bug 1 fix: show static cancelled message — no timer */}
              {isCancelled ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Timer size={18} color="#D85A30" />
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#D85A30' }}>
                    Trip Cancelled — ETA N/A
                  </span>
                </div>
              ) : (
                <EtaCountdown etaMinutes={booking.telemetry.etaMinutes} active={isActiveTransit} />
              )}
            </div>
            {!isCancelled && (
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
            )}
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
