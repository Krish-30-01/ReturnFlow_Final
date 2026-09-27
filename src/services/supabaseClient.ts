import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Trip, LoadRequest, Booking, EarningsRecord, ShipmentStatus, PaymentMethod, BOOKING_STATUS } from '../types/logistics';
import { calculateDistanceAndDuration } from './routingEngine';
import { calculateBackhaulPricing } from './pricingEngine';
import { SEED_TRIPS, SEED_LOADS, SEED_BOOKINGS, SEED_EARNINGS } from './seedService';

// ---------------------------------------------------------------------------
// Live vs Demo backend detection
// ---------------------------------------------------------------------------
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// A valid Supabase anon key is always a JWT (starts with eyJ and is 150+ chars)
const isValidJwtKey = (key: string) => key.startsWith('eyJ') && key.length > 100;

export const isLiveBackend =
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  /^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)\/?$/i.test(SUPABASE_URL) &&
  isValidJwtKey(SUPABASE_ANON_KEY);

const globalForSupabase = globalThis as unknown as { __rfSupabaseClient?: SupabaseClient };

export const supabase: SupabaseClient | null = (() => {
  if (!isLiveBackend) return null;
  try {
    return (globalForSupabase.__rfSupabaseClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    }));
  } catch (err) {
    console.warn('[ReturnFlow] Supabase client init failed, falling back to demo mode:', err);
    return null;
  }
})();

// ---------------------------------------------------------------------------
// Demo In-Memory + LocalStorage Backend
// ---------------------------------------------------------------------------
const DB_STORAGE_KEY = 'returnflow_supabase_db_v6';
const CHANNEL_NAME = 'returnflow_supabase_realtime_v1';

interface DemoDatabase {
  trips: Trip[];
  loads: LoadRequest[];
  bookings: Booking[];
  earnings: EarningsRecord[];
}

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch { /* ignore */ }

function loadDemoDB(): DemoDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDatabase;
      if (parsed.trips && parsed.loads) return parsed;
    }
  } catch { /* ignore */ }
  return { trips: SEED_TRIPS, loads: SEED_LOADS, bookings: SEED_BOOKINGS, earnings: SEED_EARNINGS };
}

function saveDemoDB(db: DemoDatabase) {
  try { localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db)); } catch { /* ignore */ }
}

type ChangeCallback = (payload: { table: string; eventType: string; record: unknown }) => void;
const listeners = new Set<ChangeCallback>();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event: MessageEvent) => {
    listeners.forEach(cb => cb(event.data as { table: string; eventType: string; record: unknown }));
  };
}

function notifyRealtime(table: string, eventType: string, record: unknown) {
  const payload = { table, eventType, record };
  if (broadcastChannel) broadcastChannel.postMessage(payload);
  listeners.forEach(cb => cb(payload));
}

// ---------------------------------------------------------------------------
// Booking status progression
// ---------------------------------------------------------------------------
function computeAdvancedBooking(b: Booking): Booking {
  let nextStatus = b.status;
  let progress = b.telemetry.progressPercent;
  let speed = b.telemetry.currentSpeedKmh;

  if (b.status === 'Booked') { nextStatus = 'Picked Up'; progress = 25; speed = 35; }
  else if (b.status === 'Picked Up') { nextStatus = 'In Transit'; progress = 65; speed = 58; }
  else if (b.status === 'In Transit') { nextStatus = 'Delivered'; progress = 100; speed = 0; }

  const checkpoints = b.telemetry.checkpoints.map((cp, idx) => {
    if (nextStatus === 'Delivered') return { ...cp, completed: true };
    if (nextStatus === 'In Transit' && idx <= 2) return { ...cp, completed: true };
    if (nextStatus === 'Picked Up' && idx <= 1) return { ...cp, completed: true };
    return cp;
  });

  return { ...b, status: nextStatus, telemetry: { ...b.telemetry, progressPercent: progress, currentSpeedKmh: speed, checkpoints } };
}

// ---------------------------------------------------------------------------
// SupabaseService
// ---------------------------------------------------------------------------
export const SupabaseService = {
  subscribe(callback: ChangeCallback, onStatus?: (connected: boolean) => void) {
    listeners.add(callback);
    let removeChannel = () => {};

    if (supabase) {
      const TABLES = ['trips', 'load_requests', 'bookings', 'earnings'];
      let channel = supabase.channel('returnflow-db-changes');
      for (const table of TABLES) {
        channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () =>
          callback({ table, eventType: 'UPDATE', record: null })
        );
      }
      channel.subscribe(status => {
        if (status === 'SUBSCRIBED') onStatus?.(true);
        else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) onStatus?.(false);
      });
      removeChannel = () => { void supabase.removeChannel(channel); };
    } else {
      onStatus?.(true);
    }

    return () => { listeners.delete(callback); removeChannel(); };
  },

  async getTrips(): Promise<Trip[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          // Map DB column names → Trip field names
          return (data as Record<string, unknown>[]).map(row => ({
            id: row.id as string,
            driverId: (row.driver_id ?? row.driverId) as string,
            driverName: (row.driver_name ?? row.driverName) as string,
            driverRating: (row.driver_rating ?? row.driverRating ?? 4.5) as number,
            driverAvatarText: (row.driver_avatar_text ?? row.driverAvatarText ?? 'DR') as string,
            driverPhone: (row.driver_phone ?? row.driverPhone ?? '') as string,
            vehicleType: (row.vehicle ?? row.vehicleType) as string,
            vehiclePlate: (row.vehicle_plate ?? row.vehiclePlate) as string,
            from: (row.origin ?? row.from) as string,
            to: (row.destination ?? row.to) as string,
            originCoords: row.origin_lat != null ? { lat: row.origin_lat as number, lng: row.origin_lng as number } : undefined,
            destinationCoords: row.dest_lat != null ? { lat: row.dest_lat as number, lng: row.dest_lng as number } : undefined,
            corridor: (row.corridor ?? '') as string,
            departureDate: (row.departure_date ?? row.departureDate) as string,
            departureTimeWindow: (row.time_window ?? row.departureTimeWindow) as string,
            totalCapacityKg: (row.capacity ?? row.totalCapacityKg) as number,
            bookedCapacityKg: (row.booked_capacity ?? row.bookedCapacityKg ?? 0) as number,
            preferredLoadType: (row.preferred_load_type ?? row.preferredLoadType ?? 'General') as string,
            minPrice: (row.payout ?? row.minPrice ?? 0) as number,
            isReturnTrip: true,
            status: (['active', 'in_transit', 'completed', 'cancelled'].includes(row.status as string) ? row.status : 'active') as Trip['status'],
            notes: (row.notes ?? '') as string,
            bookedLoads: [],
          }));
        }
        throw error;
      } catch { /* fallback */ }
    }
    return loadDemoDB().trips;
  },

  async insertTrip(input: {
    from: string; to: string;
    originCoords?: { lat: number; lng: number };
    destinationCoords?: { lat: number; lng: number };
    corridor?: string;
    departureDate: string; departureTimeWindow: string;
    vehicleType: string; vehiclePlate: string;
    totalCapacityKg: number; preferredLoadType?: string;
    minPrice?: number; notes?: string;
    driverIdentity?: { id: string; name: string; rating?: number; avatarText?: string; phone?: string };
  }): Promise<Trip> {
    const route = calculateDistanceAndDuration(input.from, input.to, input.corridor);
    const pricing = calculateBackhaulPricing({ distanceKm: route.distanceKm, weightKg: input.totalCapacityKg, vehicleType: input.vehicleType, corridorId: route.corridorId, isReturnTrip: true });
    const drv = input.driverIdentity;
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      driverId: drv?.id ?? 'drv-rajesh',
      driverName: drv?.name ?? 'Rajesh Kumar',
      driverRating: drv?.rating ?? 4.9,
      driverAvatarText: drv?.avatarText ?? (drv?.name ?? 'RK').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      driverPhone: drv?.phone ?? '+91 98490 23145',
      vehicleType: input.vehicleType,
      vehiclePlate: input.vehiclePlate,
      from: input.from,
      to: input.to,
      originCoords: input.originCoords ?? route.originCoords,
      destinationCoords: input.destinationCoords ?? route.destinationCoords,
      corridor: route.corridorId,
      departureDate: input.departureDate,
      departureTimeWindow: input.departureTimeWindow,
      totalCapacityKg: input.totalCapacityKg,
      bookedCapacityKg: 0,
      preferredLoadType: input.preferredLoadType ?? 'FMCG & General Goods',
      minPrice: input.minPrice ?? pricing.driverPayout,
      isReturnTrip: true,
      status: 'active',
      notes: input.notes ?? '',
      bookedLoads: []
    };

    if (supabase) {
      try {
        await supabase.from('trips').insert({
          id: newTrip.id, driver_id: newTrip.driverId, driver_name: newTrip.driverName,
          driver_rating: newTrip.driverRating, driver_avatar_text: newTrip.driverAvatarText,
          driver_phone: newTrip.driverPhone, origin: newTrip.from, destination: newTrip.to,
          origin_lat: newTrip.originCoords?.lat ?? null, origin_lng: newTrip.originCoords?.lng ?? null,
          dest_lat: newTrip.destinationCoords?.lat ?? null, dest_lng: newTrip.destinationCoords?.lng ?? null,
          corridor: newTrip.corridor, vehicle: newTrip.vehicleType, vehicle_plate: newTrip.vehiclePlate,
          capacity: newTrip.totalCapacityKg, booked_capacity: 0,
          departure_date: newTrip.departureDate, time_window: newTrip.departureTimeWindow,
          payout: newTrip.minPrice, preferred_load_type: newTrip.preferredLoadType,
          status: 'active', notes: newTrip.notes ?? ''
        });
        return newTrip;
      } catch { /* fallback */ }
    }

    const db = loadDemoDB();
    db.trips.unshift(newTrip);
    saveDemoDB(db);
    notifyRealtime('trips', 'INSERT', newTrip);
    return newTrip;
  },

  async getLoadRequests(): Promise<LoadRequest[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('load_requests').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return (data as Record<string, unknown>[]).map(row => ({
            id: row.id as string,
            customerId: (row.retailer_id ?? row.customerId) as string,
            customerName: (row.retailer_name ?? row.customerName) as string,
            customerCompany: (row.retailer_company ?? row.customerCompany ?? '') as string,
            customerPhone: (row.retailer_phone ?? row.customerPhone ?? '') as string,
            from: (row.origin ?? row.from) as string,
            to: (row.destination ?? row.to) as string,
            originCoords: row.origin_lat != null ? { lat: row.origin_lat as number, lng: row.origin_lng as number } : undefined,
            destinationCoords: row.dest_lat != null ? { lat: row.dest_lat as number, lng: row.dest_lng as number } : undefined,
            corridor: (row.corridor ?? '') as string,
            date: (row.departure_date ?? row.date) as string,
            timeWindow: (row.time_window ?? row.timeWindow) as string,
            weight: (row.weight) as number,
            weightUnit: (row.weight_unit ?? row.weightUnit ?? 'Kg') as 'Kg' | 'CBM',
            goodsType: (row.cargo_type ?? row.goodsType) as string,
            budget: (row.budget) as number,
            specialInstructions: (row.special_instructions ?? row.specialInstructions ?? '') as string,
            status: (row.status ?? 'Searching') as LoadRequest['status'],
            matchedTripId: (row.matched_trip_id ?? row.matchedTripId) as string | undefined,
            bookingId: (row.booking_id ?? row.bookingId) as string | undefined,
            createdAt: 'Recently',
          }));
        }
        throw error;
      } catch { /* fallback */ }
    }
    return loadDemoDB().loads;
  },

  async insertLoadRequest(input: {
    from: string; to: string;
    originCoords?: { lat: number; lng: number };
    destinationCoords?: { lat: number; lng: number };
    corridor: string; date: string; timeWindow: string;
    weight: number; weightUnit: 'Kg' | 'CBM';
    goodsType: string; budget: number; specialInstructions?: string;
    retailerIdentity?: { id: string; name: string; company?: string; phone?: string };
  }): Promise<LoadRequest> {
    const ret = input.retailerIdentity;
    const newLoad: LoadRequest = {
      id: `load-${Date.now()}`,
      customerId: ret?.id ?? 'cust-priya',
      customerName: ret?.name ?? 'Priya Sharma',
      customerCompany: ret?.company ?? 'Apex Retail Networks Pvt Ltd',
      customerPhone: ret?.phone ?? '+91 94401 55678',
      from: input.from, to: input.to,
      originCoords: input.originCoords,
      destinationCoords: input.destinationCoords,
      corridor: input.corridor,
      date: input.date, timeWindow: input.timeWindow,
      weight: input.weight, weightUnit: input.weightUnit,
      goodsType: input.goodsType, budget: input.budget,
      specialInstructions: input.specialInstructions,
      status: 'Searching',
      createdAt: 'Just now'
    };

    if (supabase) {
      try {
        await supabase.from('load_requests').insert({
          id: newLoad.id, retailer_id: newLoad.customerId, retailer_name: newLoad.customerName,
          retailer_company: newLoad.customerCompany, retailer_phone: newLoad.customerPhone,
          origin: newLoad.from, destination: newLoad.to,
          origin_lat: newLoad.originCoords?.lat ?? null, origin_lng: newLoad.originCoords?.lng ?? null,
          dest_lat: newLoad.destinationCoords?.lat ?? null, dest_lng: newLoad.destinationCoords?.lng ?? null,
          corridor: newLoad.corridor, cargo_type: newLoad.goodsType,
          weight: newLoad.weight, weight_unit: newLoad.weightUnit,
          budget: newLoad.budget, time_window: newLoad.timeWindow,
          departure_date: newLoad.date, special_instructions: newLoad.specialInstructions ?? '',
          status: 'Searching'
        });
        return newLoad;
      } catch { /* fallback */ }
    }

    const db = loadDemoDB();
    db.loads.unshift(newLoad);
    saveDemoDB(db);
    notifyRealtime('load_requests', 'INSERT', newLoad);
    return newLoad;
  },

  async getBookings(): Promise<Booking[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return (data as Record<string, unknown>[]).map(row => {
            const telemetry = (row.telemetry as Booking['telemetry']) ?? {
              currentLat: 17.385, currentLng: 78.4867, currentSpeedKmh: 0,
              currentLocationName: 'Unknown', nextStopName: '', etaMinutes: 0,
              lastUpdated: 'Unknown', progressPercent: 0, routeCoordinates: [], checkpoints: []
            };
            return {
              id: row.id as string,
              tripId: (row.trip_id ?? row.tripId) as string,
              loadId: (row.load_id ?? row.loadId) as string,
              bookingDate: (row.booking_date ?? row.bookingDate) as string,
              driverId: (row.driver_id ?? row.driverId) as string,
              driverName: (row.driver_name ?? row.driverName) as string,
              driverRating: Number(row.driver_rating ?? row.driverRating ?? 4.5),
              driverPhone: (row.driver_phone ?? row.driverPhone ?? '') as string,
              driverAvatar: (row.driver_avatar ?? row.driverAvatar ?? 'DR') as string,
              vehicleType: (row.vehicle_type ?? row.vehicleType ?? '') as string,
              vehiclePlate: (row.vehicle_plate ?? row.vehiclePlate ?? '') as string,
              customerId: (row.customer_id ?? row.customerId) as string,
              customerName: (row.customer_name ?? row.customerName) as string,
              customerCompany: (row.customer_company ?? row.customerCompany ?? '') as string,
              customerPhone: (row.customer_phone ?? row.customerPhone ?? '') as string,
              from: (row.origin ?? row.from) as string,
              to: (row.destination ?? row.to) as string,
              corridor: (row.corridor ?? '') as string,
              goodsType: (row.goods_type ?? row.goodsType ?? '') as string,
              weightKg: Number(row.weight_kg ?? row.weightKg ?? 0),
              specialInstructions: (row.special_instructions ?? row.specialInstructions ?? '') as string,
              basePrice: Number(row.base_price ?? row.basePrice ?? 0),
              platformFee: Number(row.platform_fee ?? row.platformFee ?? 0),
              insuranceFee: Number(row.insurance_fee ?? row.insuranceFee ?? 0),
              totalPrice: Number(row.total_price ?? row.totalPrice ?? 0),
              paymentMethod: (row.payment_method ?? row.paymentMethod ?? 'UPI') as Booking['paymentMethod'],
              escrowStatus: (row.escrow_status ?? row.escrowStatus ?? 'Unfunded') as Booking['escrowStatus'],
              status: (row.status ?? 'Pending Driver Acceptance') as Booking['status'],
              estimatedPickup: (row.estimated_pickup ?? row.estimatedPickup ?? '') as string,
              estimatedDelivery: (row.estimated_delivery ?? row.estimatedDelivery ?? '') as string,
              telemetry,
              driverConfirmedDelivery: (row.driver_confirmed_delivery ?? row.driverConfirmedDelivery) as boolean | undefined,
              retailerConfirmedDelivery: (row.retailer_confirmed_delivery ?? row.retailerConfirmedDelivery) as boolean | undefined,
              driverConfirmedAt: (row.driver_confirmed_at ?? row.driverConfirmedAt) as string | undefined,
              retailerConfirmedAt: (row.retailer_confirmed_at ?? row.retailerConfirmedAt) as string | undefined,
              cancelledAt: (row.cancelled_at ?? row.cancelledAt) as string | undefined,
              cancelledBy: (row.cancelled_by ?? row.cancelledBy) as Booking['cancelledBy'],
              cancellationReason: (row.cancellation_reason ?? row.cancellationReason) as string | undefined,
            } as Booking;
          });
        }
        throw error;
      } catch { /* fallback */ }
    }
    return loadDemoDB().bookings;
  },

  async insertPendingBooking(booking: Booking): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('bookings').upsert({ ...booking, origin: booking.from, destination: booking.to });
        return;
      } catch { /* fallback */ }
    }
    const db = loadDemoDB();
    db.bookings = [booking, ...db.bookings.filter(b => b.id !== booking.id)];
    saveDemoDB(db);
    notifyRealtime('bookings', 'INSERT', booking);
  },

  async acceptBooking(bookingId: string): Promise<void> {
    if (supabase) {
      try { await supabase.from('bookings').update({ status: 'Awaiting Payment' }).eq('id', bookingId); return; }
      catch { /* fallback */ }
    }
    const db = loadDemoDB();
    db.bookings = db.bookings.map(b => b.id === bookingId ? { ...b, status: 'Awaiting Payment' as ShipmentStatus } : b);
    saveDemoDB(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
  },

  async declineBooking(bookingId: string): Promise<void> {
    if (supabase) {
      try { await supabase.from('bookings').update({ status: 'Declined' }).eq('id', bookingId); return; }
      catch { /* fallback */ }
    }
    const db = loadDemoDB();
    db.bookings = db.bookings.map(b => b.id === bookingId ? { ...b, status: 'Declined' as ShipmentStatus } : b);
    saveDemoDB(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
  },

  async payBooking(bookingId: string, paymentMethod: PaymentMethod, earningsRecord: EarningsRecord): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('bookings').update({ status: 'Booked', escrow_status: 'Held in Escrow', payment_method: paymentMethod }).eq('id', bookingId);
        await supabase.from('earnings').insert({ id: earningsRecord.id, date_label: earningsRecord.date, route: earningsRecord.route, corridor: earningsRecord.corridor, loads_count: earningsRecord.loadsCount, weight_kg: earningsRecord.weightKg, amount: earningsRecord.amount, escrow_fee_deducted: earningsRecord.escrowFeeDeducted, status: earningsRecord.status, payout_reference: earningsRecord.payoutReference });
        return;
      } catch { /* fallback */ }
    }
    const db = loadDemoDB();
    db.bookings = db.bookings.map(b => b.id === bookingId ? { ...b, status: 'Booked' as ShipmentStatus, escrowStatus: 'Held in Escrow' as const, paymentMethod } : b);
    db.earnings = [earningsRecord, ...db.earnings];
    saveDemoDB(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
  },

  async confirmDelivery(bookingId: string, role: 'driver' | 'customer'): Promise<Booking[]> {
    const now = new Date().toISOString();
    const updatePayload = role === 'driver'
      ? { driver_confirmed_delivery: true, driver_confirmed_at: now }
      : { retailer_confirmed_delivery: true, retailer_confirmed_at: now };

    if (supabase) {
      try {
        // Fetch current booking to check if both parties have confirmed
        const { data: current } = await supabase.from('bookings').select('driver_confirmed_delivery,retailer_confirmed_delivery').eq('id', bookingId).single();
        const driverConfirmed = role === 'driver' ? true : !!(current as Record<string, unknown>)?.driver_confirmed_delivery;
        const retailerConfirmed = role === 'customer' ? true : !!(current as Record<string, unknown>)?.retailer_confirmed_delivery;
        const bothConfirmed = driverConfirmed && retailerConfirmed;
        const finalPayload = bothConfirmed
          ? { ...updatePayload, status: 'Delivered', escrow_status: 'Settled to Driver' }
          : updatePayload;
        await supabase.from('bookings').update(finalPayload).eq('id', bookingId);
      } catch { /* fallback to demo */ }
    }

    const db = loadDemoDB();
    db.bookings = db.bookings.map(b => {
      if (b.id !== bookingId) return b;
      const updated = { ...b, ...(role === 'driver' ? { driverConfirmedDelivery: true, driverConfirmedAt: now } : { retailerConfirmedDelivery: true, retailerConfirmedAt: now }) };
      const bothConfirmed = updated.driverConfirmedDelivery && updated.retailerConfirmedDelivery;
      if (bothConfirmed) return { ...updated, status: 'Delivered' as ShipmentStatus, escrowStatus: 'Settled to Driver' as const };
      return updated;
    });
    saveDemoDB(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
    return db.bookings;
  },

  async cancelBooking(bookingId: string, cancelledBy: 'driver' | 'customer', reason?: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('bookings').update({
          status: 'Cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelledBy,
          cancellation_reason: reason ?? '',
        }).eq('id', bookingId);
      } catch { /* fallback */ }
    }
    const db = loadDemoDB();
    db.bookings = db.bookings.map(b => b.id !== bookingId ? b : {
      ...b, status: 'Cancelled' as ShipmentStatus, cancelledAt: new Date().toISOString(), cancelledBy, cancellationReason: reason
    });
    saveDemoDB(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
  },

  async advanceBookingStatus(bookingId: string): Promise<Booking[]> {
    const db = loadDemoDB();
    db.bookings = db.bookings.map(b => b.id === bookingId ? computeAdvancedBooking(b) : b);
    const advanced = db.bookings.find(b => b.id === bookingId);

    if (supabase && advanced) {
      try {
        await supabase.from('bookings').update({
          status: advanced.status,
          telemetry: advanced.telemetry,
        }).eq('id', bookingId);
      } catch { /* fallback */ }
    }

    saveDemoDB(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
    return db.bookings;
  },

  async getEarnings(): Promise<EarningsRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('earnings').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return (data as Record<string, unknown>[]).map(row => ({
            id: row.id as string,
            date: (row.date_label ?? row.date) as string,
            route: (row.route ?? '') as string,
            corridor: (row.corridor ?? '') as string,
            loadsCount: (row.loads_count ?? row.loadsCount ?? 1) as number,
            weightKg: (row.weight_kg ?? row.weightKg ?? 0) as number,
            amount: (row.amount ?? 0) as number,
            escrowFeeDeducted: (row.escrow_fee_deducted ?? row.escrowFeeDeducted ?? 0) as number,
            status: (row.status ?? 'In Escrow') as EarningsRecord['status'],
            payoutReference: (row.payout_reference ?? row.payoutReference ?? '') as string,
          }));
        }
      } catch { /* fallback */ }
    }
    return loadDemoDB().earnings;
  },

  async deleteTrip(tripId: string): Promise<void> {
    if (supabase) { try { await supabase.from('trips').delete().eq('id', tripId); return; } catch { /* fallback */ } }
    const db = loadDemoDB();
    db.trips = db.trips.filter(t => t.id !== tripId);
    saveDemoDB(db);
  },

  async deleteLoadRequest(loadId: string): Promise<void> {
    if (supabase) { try { await supabase.from('load_requests').delete().eq('id', loadId); return; } catch { /* fallback */ } }
    const db = loadDemoDB();
    db.loads = db.loads.filter(l => l.id !== loadId);
    saveDemoDB(db);
  },

  async resetToSeed(): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('bookings').delete().neq('id', '');
        await supabase.from('load_requests').delete().neq('id', '');
        await supabase.from('trips').delete().neq('id', '');
        await supabase.from('earnings').delete().neq('id', '');
      } catch { /* ignore */ }
    }
    saveDemoDB({ trips: SEED_TRIPS, loads: SEED_LOADS, bookings: SEED_BOOKINGS, earnings: SEED_EARNINGS });
    notifyRealtime('trips', 'INSERT', null);
  }
};
