import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { calculateBackhaulPricing } from './pricingEngine';
import { calculateDistanceAndDuration } from './routingEngine';
import { Trip, LoadRequest, Booking, EarningsRecord, ShipmentStatus } from '../types/logistics';

// ---------------------------------------------------------------------------
// Live vs Demo backend detection
// Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env to go live.
// Without them (or on any Supabase error) the app falls back to a local
// localStorage-backed demo database seeded with realistic sample data.
// ---------------------------------------------------------------------------

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isLiveBackend =
  /^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)\/?$/i.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20;

// HMR-safe singleton: cache the client on globalThis so Vite hot-reloads
// reuse the same instance instead of spawning duplicate GoTrueClient instances.
const globalForSupabase = globalThis as unknown as { __returnflowSupabaseClient?: SupabaseClient };

export const supabase: SupabaseClient | null = isLiveBackend
  ? (globalForSupabase.__returnflowSupabaseClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } }
    }))
  : null;

// ---------------------------------------------------------------------------
// Database row shapes (snake_case, mirror of supabase/schema.sql)
// ---------------------------------------------------------------------------

interface DbTripRow {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_rating: number;
  driver_avatar_text: string;
  driver_phone: string;
  origin: string;
  destination: string;
  origin_lat: number | null;
  origin_lng: number | null;
  dest_lat: number | null;
  dest_lng: number | null;
  corridor: string;
  vehicle: string;
  vehicle_plate: string;
  capacity: number;
  booked_capacity: number;
  departure_date: string;
  time_window: string;
  payout: number;
  preferred_load_type?: string | null;
  status: string;
  notes?: string | null;
}

interface DbLoadRow {
  id: string;
  retailer_id: string;
  retailer_name: string;
  retailer_company: string;
  retailer_phone: string;
  origin: string;
  destination: string;
  origin_lat: number | null;
  origin_lng: number | null;
  dest_lat: number | null;
  dest_lng: number | null;
  corridor: string;
  cargo_type: string;
  weight: number;
  weight_unit: string;
  budget: number;
  time_window: string;
  departure_date: string;
  special_instructions?: string | null;
  status: string;
  matched_trip_id: string | null;
  booking_id: string | null;
}

interface DbBookingRow {
  id: string;
  trip_id: string;
  load_id: string;
  booking_date: string;
  driver_id: string;
  driver_name: string;
  driver_rating: number;
  driver_phone: string;
  driver_avatar: string;
  vehicle_type: string;
  vehicle_plate: string;
  customer_id: string;
  customer_name: string;
  customer_company: string;
  customer_phone: string;
  origin: string;
  destination: string;
  corridor: string;
  goods_type: string;
  weight_kg: number;
  special_instructions?: string | null;
  base_price: number;
  platform_fee: number;
  insurance_fee: number;
  total_price: number;
  payment_method: string;
  escrow_status: string;
  status: string;
  estimated_pickup?: string | null;
  estimated_delivery?: string | null;
  telemetry: Booking['telemetry'];
}

interface DbEarningRow {
  id: string;
  date_label: string;
  route: string;
  corridor: string;
  loads_count: number;
  weight_kg: number;
  amount: number;
  escrow_fee_deducted: number;
  status: string;
  payout_reference: string;
}

// Row mappers (DB snake_case <-> app camelCase)

function coords(lat: number | null | undefined, lng: number | null | undefined) {
  return lat != null && lng != null ? { lat, lng } : undefined;
}

function mapTripRow(t: DbTripRow): Trip {
  return {
    id: t.id,
    driverId: t.driver_id,
    driverName: t.driver_name,
    driverRating: t.driver_rating,
    driverAvatarText: t.driver_avatar_text,
    driverPhone: t.driver_phone,
    vehicleType: t.vehicle,
    vehiclePlate: t.vehicle_plate,
    from: t.origin,
    to: t.destination,
    originCoords: coords(t.origin_lat, t.origin_lng),
    destinationCoords: coords(t.dest_lat, t.dest_lng),
    corridor: t.corridor,
    departureDate: t.departure_date,
    departureTimeWindow: t.time_window,
    totalCapacityKg: t.capacity,
    bookedCapacityKg: t.booked_capacity,
    preferredLoadType: t.preferred_load_type || 'FMCG & General Goods',
    minPrice: t.payout,
    isReturnTrip: true,
    status: (t.status === 'completed' || t.status === 'in_transit' ? t.status : 'active') as Trip['status'],
    notes: t.notes || '',
    bookedLoads: []
  };
}

function mapLoadRow(l: DbLoadRow): LoadRequest {
  return {
    id: l.id,
    customerId: l.retailer_id,
    customerName: l.retailer_name,
    customerCompany: l.retailer_company,
    customerPhone: l.retailer_phone,
    from: l.origin,
    to: l.destination,
    originCoords: coords(l.origin_lat, l.origin_lng),
    destinationCoords: coords(l.dest_lat, l.dest_lng),
    corridor: l.corridor,
    date: l.departure_date,
    timeWindow: l.time_window,
    weight: l.weight,
    weightUnit: l.weight_unit as 'Kg' | 'CBM',
    goodsType: l.cargo_type,
    budget: l.budget,
    specialInstructions: l.special_instructions || undefined,
    status: l.status as ShipmentStatus,
    matchedTripId: l.matched_trip_id || undefined,
    bookingId: l.booking_id || undefined,
    createdAt: 'Recently'
  };
}

function mapBookingRow(b: DbBookingRow): Booking {
  return {
    id: b.id,
    tripId: b.trip_id,
    loadId: b.load_id,
    bookingDate: b.booking_date,
    driverId: b.driver_id,
    driverName: b.driver_name,
    driverRating: b.driver_rating,
    driverPhone: b.driver_phone,
    driverAvatar: b.driver_avatar,
    vehicleType: b.vehicle_type,
    vehiclePlate: b.vehicle_plate,
    customerId: b.customer_id,
    customerName: b.customer_name,
    customerCompany: b.customer_company,
    customerPhone: b.customer_phone,
    from: b.origin,
    to: b.destination,
    corridor: b.corridor,
    goodsType: b.goods_type,
    weightKg: b.weight_kg,
    specialInstructions: b.special_instructions || undefined,
    basePrice: b.base_price,
    platformFee: b.platform_fee,
    insuranceFee: b.insurance_fee,
    totalPrice: b.total_price,
    paymentMethod: b.payment_method as Booking['paymentMethod'],
    escrowStatus: b.escrow_status as Booking['escrowStatus'],
    status: b.status as ShipmentStatus,
    estimatedPickup: b.estimated_pickup || '',
    estimatedDelivery: b.estimated_delivery || '',
    telemetry: b.telemetry
  };
}

function bookingToDb(b: Booking): DbBookingRow {
  return {
    id: b.id,
    trip_id: b.tripId,
    load_id: b.loadId,
    booking_date: b.bookingDate,
    driver_id: b.driverId,
    driver_name: b.driverName,
    driver_rating: b.driverRating,
    driver_phone: b.driverPhone,
    driver_avatar: b.driverAvatar,
    vehicle_type: b.vehicleType,
    vehicle_plate: b.vehiclePlate,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_company: b.customerCompany,
    customer_phone: b.customerPhone,
    origin: b.from,
    destination: b.to,
    corridor: b.corridor,
    goods_type: b.goodsType,
    weight_kg: b.weightKg,
    special_instructions: b.specialInstructions || null,
    base_price: b.basePrice,
    platform_fee: b.platformFee,
    insurance_fee: b.insuranceFee,
    total_price: b.totalPrice,
    payment_method: b.paymentMethod,
    escrow_status: b.escrowStatus,
    status: b.status,
    estimated_pickup: b.estimatedPickup,
    estimated_delivery: b.estimatedDelivery,
    telemetry: b.telemetry
  };
}

function earningToDb(e: EarningsRecord): DbEarningRow {
  return {
    id: e.id,
    date_label: e.date,
    route: e.route,
    corridor: e.corridor,
    loads_count: e.loadsCount,
    weight_kg: e.weightKg,
    amount: e.amount,
    escrow_fee_deducted: e.escrowFeeDeducted,
    status: e.status,
    payout_reference: e.payoutReference
  };
}

function mapEarningRow(e: DbEarningRow): EarningsRecord {
  return {
    id: e.id,
    date: e.date_label,
    route: e.route,
    corridor: e.corridor,
    loadsCount: e.loads_count,
    weightKg: e.weight_kg,
    amount: e.amount,
    escrowFeeDeducted: e.escrow_fee_deducted,
    status: e.status as EarningsRecord['status'],
    payoutReference: e.payout_reference
  };
}

// ---------------------------------------------------------------------------
// Seed data with realistic commercial freight pricing and verified coordinates
// ---------------------------------------------------------------------------

const SEED_TRIPS = [
  {
    id: 'trip-101',
    driver_id: 'drv-rajesh',
    driver_name: 'Rajesh Kumar',
    driver_rating: 4.9,
    driver_avatar_text: 'RK',
    driver_phone: '+91 98490 23145',
    origin: 'Hyderabad (Uppal)',
    destination: 'Warangal Industrial Zone',
    origin_lat: 17.3984,
    origin_lng: 78.5583,
    dest_lat: 17.9689,
    dest_lng: 79.5941,
    corridor: 'HYD-WAR',
    vehicle: 'TATA 407 (4-Ton Commercial)',
    vehicle_plate: 'TS-09-UB-4421',
    capacity: 4000,
    booked_capacity: 400,
    departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time_window: '06:00 AM – 10:00 AM',
    payout: 1500, // 148 km, 400 kg backhaul
    status: 'active',
    notes: 'Returning from Uppal warehouse delivery. Flatbed with waterproof tarpaulin ready.',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'trip-102',
    driver_id: 'drv-rajesh',
    driver_name: 'Rajesh Kumar',
    driver_rating: 4.9,
    driver_avatar_text: 'RK',
    driver_phone: '+91 98490 23145',
    origin: 'Hyderabad (Shamshabad)',
    destination: 'Bangalore (Peenya)',
    origin_lat: 17.2403,
    origin_lng: 78.4294,
    dest_lat: 13.0312,
    dest_lng: 77.5186,
    corridor: 'HYD-BLR',
    vehicle: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehicle_plate: 'TS-07-EA-9912',
    capacity: 15000,
    booked_capacity: 2500,
    departure_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time_window: '04:00 AM – 08:00 AM',
    payout: 9200, // 569 km, 2500 kg backhaul
    status: 'active',
    notes: 'Scheduled backhaul return to Bangalore depot. GPS verified, dual drivers.',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const SEED_LOADS = [
  {
    id: 'load-201',
    retailer_id: 'cust-priya',
    retailer_name: 'Priya Sharma',
    retailer_company: 'Apex Retail Networks Pvt Ltd',
    retailer_phone: '+91 94401 55678',
    origin: 'Hyderabad (Uppal)',
    destination: 'Warangal Industrial Zone',
    origin_lat: 17.3984,
    origin_lng: 78.5583,
    dest_lat: 17.9689,
    dest_lng: 79.5941,
    corridor: 'HYD-WAR',
    cargo_type: 'Furniture & Display Fixtures',
    weight: 400,
    weight_unit: 'Kg',
    budget: 1630, // derived from driver payout 1500 / (1 - 0.08) = 1630
    time_window: 'Morning (07:00 AM – 11:00 AM)',
    departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    special_instructions: 'Handle with care, bubble wrapped display counters for retail store opening.',
    status: 'Searching',
    matched_trip_id: null,
    booking_id: null,
    created_at: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'load-202',
    retailer_id: 'cust-priya',
    retailer_name: 'Priya Sharma',
    retailer_company: 'Apex Retail Networks Pvt Ltd',
    retailer_phone: '+91 94401 55678',
    origin: 'Hyderabad (Shamshabad)',
    destination: 'Bangalore (Peenya)',
    origin_lat: 17.2403,
    origin_lng: 78.4294,
    dest_lat: 13.0312,
    dest_lng: 77.5186,
    corridor: 'HYD-BLR',
    cargo_type: 'FMCG Packaged Goods',
    weight: 2500,
    weight_unit: 'Kg',
    budget: 10000, // derived from driver payout 9200 / (1 - 0.08) = 10000
    time_window: 'Flexible',
    departure_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    special_instructions: 'Palletized cartons. Forklift available at Bangalore dock.',
    status: 'Booked',
    matched_trip_id: 'trip-102',
    booking_id: 'book-301',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];


// Completed trips whose SUM equals Driver's realistic monthly earnings
const SEED_EARNINGS: EarningsRecord[] = [
  {
    id: 'earn-501',
    date: '18 Aug 2026',
    route: 'Warangal → Hyderabad (Backhaul)',
    corridor: 'HYD-WAR',
    loadsCount: 1,
    weightKg: 850,
    amount: 2850,
    escrowFeeDeducted: 71,
    status: 'Settled',
    payoutReference: 'UPI-RETURN-883912'
  },
  {
    id: 'earn-502',
    date: '14 Aug 2026',
    route: 'Bangalore → Hyderabad (Backhaul)',
    corridor: 'HYD-BLR',
    loadsCount: 2,
    weightKg: 2200,
    amount: 8400,
    escrowFeeDeducted: 210,
    status: 'Settled',
    payoutReference: 'UPI-RETURN-772190'
  },
  {
    id: 'earn-503',
    date: '09 Aug 2026',
    route: 'Vijayawada → Hyderabad (Backhaul)',
    corridor: 'VIJ-HYD',
    loadsCount: 1,
    weightKg: 1100,
    amount: 3950,
    escrowFeeDeducted: 98,
    status: 'Settled',
    payoutReference: 'UPI-RETURN-661023'
  },
  {
    id: 'earn-504',
    date: '04 Aug 2026',
    route: 'Anantapur → Bangalore (Backhaul)',
    corridor: 'HYD-BLR',
    loadsCount: 1,
    weightKg: 1800,
    amount: 5200,
    escrowFeeDeducted: 130,
    status: 'Settled',
    payoutReference: 'UPI-RETURN-550914'
  }
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'book-301',
    tripId: 'trip-102',
    loadId: 'load-202',
    bookingDate: new Date().toISOString().split('T')[0],
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverPhone: '+91 98490 23145',
    driverAvatar: 'RK',
    vehicleType: 'TATA Signa 3523.TK (30-Ton)',
    vehiclePlate: 'TS-07-EA-9912',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    corridor: 'HYD-BLR',
    goodsType: 'FMCG Packaged Goods',
    weightKg: 2500,
    specialInstructions: 'Palletized cartons. Forklift at dock.',
    basePrice: 9200,
    platformFee: 800,
    insuranceFee: 150,
    totalPrice: 10150,
    paymentMethod: 'UPI',
    escrowStatus: 'Held in Escrow',
    status: 'In Transit',
    estimatedPickup: 'Tomorrow, 06:30 AM',
    estimatedDelivery: 'Tomorrow, 04:00 PM',
    telemetry: {
      currentLat: 15.8281,
      currentLng: 78.0373,
      currentSpeedKmh: 58,
      currentLocationName: 'Kurnool Bypass Highway (NH44)',
      nextStopName: 'Anantapur Tollway Hub (142 km remaining)',
      etaMinutes: 185,
      lastUpdated: 'Just now (Live GPS 4G)',
      progressPercent: 54,
      routeCoordinates: [
        [17.2403, 78.4294],
        [16.7663, 78.1408],
        [15.8281, 78.0373],
        [14.6819, 77.6006],
        [13.4325, 77.7275],
        [12.9716, 77.5946]
      ],
      checkpoints: [
        { name: 'Shamshabad Logistics Hub (Pickup)', lat: 17.2403, lng: 78.4294, time: '06:45 AM', completed: true },
        { name: 'Jadcherla Tollway', lat: 16.7663, lng: 78.1408, time: '08:20 AM', completed: true },
        { name: 'Kurnool Tollway Hub', lat: 15.8281, lng: 78.0373, time: '11:15 AM (Live)', completed: true },
        { name: 'Anantapur Bypass', lat: 14.6819, lng: 77.6006, time: '02:30 PM (Est.)', completed: false },
        { name: 'Bangalore Peenya Terminal (Drop)', lat: 12.9716, lng: 77.5946, time: '07:15 PM (Est.)', completed: false }
      ]
    }
  }
];

// ---------------------------------------------------------------------------
// DEMO BACKEND — In-Memory & LocalStorage backed table store
// ---------------------------------------------------------------------------

// Real-time broadcast channel for cross-portal synchronization
const CHANNEL_NAME = 'returnflow_supabase_realtime_v1';
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

const DB_STORAGE_KEY = 'returnflow_supabase_db_v5';

interface DatabaseSchema {
  trips: typeof SEED_TRIPS;
  load_requests: typeof SEED_LOADS;
  earnings: EarningsRecord[];
  bookings: Booking[];
}

function loadDatabase(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.trips && parsed.load_requests && parsed.earnings) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load database from storage', e);
  }
  return {
    trips: SEED_TRIPS,
    load_requests: SEED_LOADS,
    earnings: SEED_EARNINGS,
    bookings: SEED_BOOKINGS
  };
}

function persistDatabase(db: DatabaseSchema) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to persist database', e);
  }
}

// Event Listeners for Supabase Realtime
type TableChangeCallback = (payload: { table: string; eventType: 'INSERT' | 'UPDATE' | 'DELETE'; record: unknown }) => void;
const listeners = new Set<TableChangeCallback>();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    listeners.forEach((callback) => callback(event.data));
  };
}

function notifyRealtime(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', record: unknown) {
  const payload = { table, eventType, record };
  if (broadcastChannel) {
    broadcastChannel.postMessage(payload);
  }
  listeners.forEach((callback) => callback(payload));
}

function warnFallback(method: string, err: unknown) {
  console.warn(`Supabase ${method} failed — falling back to demo data.`, err);
}

// Insert the seed dataset into the live Supabase tables
async function seedLiveTables() {
  if (!supabase) return;
  const sb = supabase;
  const now = new Date().toISOString();
  await sb.from('trips').insert(SEED_TRIPS.map((t) => ({ ...t })));
  await sb.from('load_requests').insert(SEED_LOADS.map((l) => ({ ...l })));
  await sb.from('earnings').insert(SEED_EARNINGS.map((e) => ({ ...earningToDb(e), created_at: now })));
  await sb.from('bookings').insert(SEED_BOOKINGS.map((b) => ({ ...bookingToDb(b), created_at: now })));
}

// Auto-seed once when every live table is empty, so both portals always
// start with a couple of active trips / load requests instead of blank screens.
let ensureSeededPromise: Promise<void> | null = null;

function ensureLiveSeeded(): Promise<void> {
  const sb = supabase;
  if (!sb) return Promise.resolve();
  if (!ensureSeededPromise) {
    ensureSeededPromise = (async () => {
      try {
        const [trips, loads, bookings, earnings] = await Promise.all([
          sb.from('trips').select('id').limit(1),
          sb.from('load_requests').select('id').limit(1),
          sb.from('bookings').select('id').limit(1),
          sb.from('earnings').select('id').limit(1)
        ]);
        const allEmpty =
          !trips.error && !loads.error && !bookings.error && !earnings.error &&
          (trips.data?.length ?? 0) === 0 &&
          (loads.data?.length ?? 0) === 0 &&
          (bookings.data?.length ?? 0) === 0 &&
          (earnings.data?.length ?? 0) === 0;
        if (allEmpty) await seedLiveTables();
      } catch (err) {
        console.warn('Auto-seed check skipped', err);
      }
    })();
  }
  return ensureSeededPromise;
}

// Shared booking-status progression used by both live and demo paths
function computeAdvancedBooking(b: Booking): Booking {
  let nextStatus = b.status;
  let progress = b.telemetry.progressPercent;
  let speed = b.telemetry.currentSpeedKmh;

  if (b.status === 'Booked') {
    nextStatus = 'Picked Up';
    progress = 25;
    speed = 35;
  } else if (b.status === 'Picked Up') {
    nextStatus = 'In Transit';
    progress = 65;
    speed = 58;
  } else if (b.status === 'In Transit') {
    nextStatus = 'Delivered';
    progress = 100;
    speed = 0;
  }

  const checkpoints = b.telemetry.checkpoints.map((cp, idx) => {
    if (nextStatus === 'Delivered') return { ...cp, completed: true };
    if (nextStatus === 'In Transit' && idx <= 2) return { ...cp, completed: true };
    if (nextStatus === 'Picked Up' && idx <= 1) return { ...cp, completed: true };
    return cp;
  });

  return {
    ...b,
    status: nextStatus,
    escrowStatus: nextStatus === 'Delivered' ? 'Settled to Driver' : b.escrowStatus,
    telemetry: {
      ...b.telemetry,
      progressPercent: progress,
      currentSpeedKmh: speed,
      checkpoints
    }
  };
}

// ---------------------------------------------------------------------------
// SupabaseService — live when configured, demo otherwise
// ---------------------------------------------------------------------------

export const SupabaseService = {
  // Subscription helper (local listeners + postgres_changes channel when live)
  subscribe(callback: TableChangeCallback, onStatus?: (connected: boolean) => void) {
    listeners.add(callback);

    let removeChannel = () => {};
    if (supabase) {
      const TABLES = ['trips', 'load_requests', 'bookings', 'earnings'];
      let channel = supabase.channel('returnflow-db-changes');
      for (const table of TABLES) {
        channel = channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => callback({ table, eventType: 'UPDATE', record: null })
        );
      }
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') onStatus?.(true);
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') onStatus?.(false);
      });
      removeChannel = () => {
        void supabase.removeChannel(channel);
      };
    } else {
      // Demo backend is always "connected" via BroadcastChannel
      onStatus?.(true);
    }

    return () => {
      listeners.delete(callback);
      removeChannel();
    };
  },

  // Trips CRUD
  async getTrips(): Promise<Trip[]> {
    if (supabase) {
      try {
        await ensureLiveSeeded();
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return (data as unknown as DbTripRow[]).map(mapTripRow);
        throw error;
      } catch (err) {
        warnFallback('getTrips', err);
      }
    }
    return loadDatabase().trips.map((t) => mapTripRow(t as unknown as DbTripRow));
  },

  async insertTrip(tripInput: {
    from: string;
    to: string;
    originCoords?: { lat: number; lng: number };
    destinationCoords?: { lat: number; lng: number };
    corridor?: string;
    departureDate: string;
    departureTimeWindow: string;
    vehicleType: string;
    vehiclePlate: string;
    totalCapacityKg: number;
    preferredLoadType?: string;
    minPrice?: number;
    notes?: string;
    driverIdentity?: { id: string; name: string; rating?: number; avatarText?: string; phone?: string };
  }): Promise<Trip> {
    const route = calculateDistanceAndDuration(tripInput.from, tripInput.to, tripInput.corridor);
    const originCoords = tripInput.originCoords || route.originCoords;
    const destinationCoords = tripInput.destinationCoords || route.destinationCoords;
    const pricing = calculateBackhaulPricing({
      distanceKm: route.distanceKm,
      weightKg: tripInput.totalCapacityKg,
      vehicleType: tripInput.vehicleType,
      corridorId: route.corridorId,
      isReturnTrip: true
    });

    const driverPayout = tripInput.minPrice || pricing.driverPayout;
    const drv = tripInput.driverIdentity;
    const newDbTrip: DbTripRow = {
      id: `trip-${Date.now()}`,
      driver_id: drv?.id || 'drv-rajesh',
      driver_name: drv?.name || 'Rajesh Kumar',
      driver_rating: drv?.rating ?? 4.9,
      driver_avatar_text: drv?.avatarText || (drv?.name || 'Rajesh Kumar').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      driver_phone: drv?.phone || '+91 98490 23145',
      origin: tripInput.from,
      destination: tripInput.to,
      origin_lat: originCoords?.lat ?? null,
      origin_lng: originCoords?.lng ?? null,
      dest_lat: destinationCoords?.lat ?? null,
      dest_lng: destinationCoords?.lng ?? null,
      corridor: route.corridorId,
      vehicle: tripInput.vehicleType,
      vehicle_plate: tripInput.vehiclePlate,
      capacity: tripInput.totalCapacityKg,
      booked_capacity: 0,
      departure_date: tripInput.departureDate,
      time_window: tripInput.departureTimeWindow,
      payout: driverPayout,
      preferred_load_type: tripInput.preferredLoadType || 'FMCG & General Goods',
      status: 'active',
      notes: tripInput.notes || ''
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .insert({ ...newDbTrip, created_at: new Date().toISOString() })
          .select()
          .single();
        if (!error && data) {
          notifyRealtime('trips', 'INSERT', data);
          return mapTripRow(data as unknown as DbTripRow);
        }
        throw error;
      } catch (err) {
        warnFallback('insertTrip', err);
      }
    }

    // Demo path
    const db = loadDatabase();
    db.trips.unshift({ ...newDbTrip, created_at: new Date().toISOString() } as (typeof SEED_TRIPS)[number]);
    persistDatabase(db);

    notifyRealtime('trips', 'INSERT', newDbTrip);

    return mapTripRow(newDbTrip);
  },

  async deleteTrip(tripId: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('trips').delete().eq('id', tripId);
        if (!error) {
          notifyRealtime('trips', 'DELETE', { id: tripId });
          return;
        }
        throw error;
      } catch (err) {
        warnFallback('deleteTrip', err);
      }
    }
    const db = loadDatabase();
    db.trips = db.trips.filter((t) => t.id !== tripId);
    persistDatabase(db);
    notifyRealtime('trips', 'DELETE', { id: tripId });
  },

  // Load Requests CRUD
  async getLoadRequests(): Promise<LoadRequest[]> {
    if (supabase) {
      try {
        await ensureLiveSeeded();
        const { data, error } = await supabase
          .from('load_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return (data as unknown as DbLoadRow[]).map(mapLoadRow);
        throw error;
      } catch (err) {
        warnFallback('getLoadRequests', err);
      }
    }
    return loadDatabase().load_requests.map((l) => mapLoadRow(l as unknown as DbLoadRow));
  },

  async insertLoadRequest(loadInput: {
    from: string;
    to: string;
    originCoords?: { lat: number; lng: number };
    destinationCoords?: { lat: number; lng: number };
    corridor?: string;
    date: string;
    timeWindow: string;
    weight: number;
    weightUnit: 'Kg' | 'CBM';
    goodsType: string;
    budget?: number;
    specialInstructions?: string;
    retailerIdentity?: { id: string; name: string; company?: string; phone?: string };
  }): Promise<LoadRequest> {
    const route = calculateDistanceAndDuration(loadInput.from, loadInput.to, loadInput.corridor);
    const originCoords = loadInput.originCoords || route.originCoords;
    const destinationCoords = loadInput.destinationCoords || route.destinationCoords;
    const weightKg = loadInput.weightUnit === 'CBM' ? loadInput.weight * 250 : loadInput.weight;
    const pricing = calculateBackhaulPricing({
      distanceKm: route.distanceKm,
      weightKg,
      corridorId: route.corridorId,
      isReturnTrip: true
    });

    const retailerBudget = loadInput.budget || pricing.retailerBudget;
    const ret = loadInput.retailerIdentity;
    const newDbLoad: DbLoadRow = {
      id: `load-${Date.now()}`,
      retailer_id: ret?.id || 'cust-priya',
      retailer_name: ret?.name || 'Priya Sharma',
      retailer_company: ret?.company || 'Apex Retail Networks Pvt Ltd',
      retailer_phone: ret?.phone || '+91 94401 55678',
      origin: loadInput.from,
      destination: loadInput.to,
      origin_lat: originCoords?.lat ?? null,
      origin_lng: originCoords?.lng ?? null,
      dest_lat: destinationCoords?.lat ?? null,
      dest_lng: destinationCoords?.lng ?? null,
      corridor: route.corridorId,
      cargo_type: loadInput.goodsType,
      weight: loadInput.weight,
      weight_unit: loadInput.weightUnit,
      budget: retailerBudget,
      time_window: loadInput.timeWindow,
      departure_date: loadInput.date,
      special_instructions: loadInput.specialInstructions || '',
      status: 'Searching',
      matched_trip_id: null,
      booking_id: null
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('load_requests')
          .insert({ ...newDbLoad, created_at: new Date().toISOString() })
          .select()
          .single();
        if (!error && data) {
          notifyRealtime('load_requests', 'INSERT', data);
          return mapLoadRow(data as unknown as DbLoadRow);
        }
        throw error;
      } catch (err) {
        warnFallback('insertLoadRequest', err);
      }
    }

    // Demo path
    const db = loadDatabase();
    db.load_requests.unshift({ ...newDbLoad, created_at: new Date().toISOString() } as (typeof SEED_LOADS)[number]);
    persistDatabase(db);

    notifyRealtime('load_requests', 'INSERT', newDbLoad);

    return mapLoadRow(newDbLoad);
  },

  async deleteLoadRequest(loadId: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('load_requests').delete().eq('id', loadId);
        if (!error) {
          notifyRealtime('load_requests', 'DELETE', { id: loadId });
          return;
        }
        throw error;
      } catch (err) {
        warnFallback('deleteLoadRequest', err);
      }
    }
    const db = loadDatabase();
    db.load_requests = db.load_requests.filter((l) => l.id !== loadId);
    persistDatabase(db);
    notifyRealtime('load_requests', 'DELETE', { id: loadId });
  },

  // Earnings queries
  async getEarnings(): Promise<EarningsRecord[]> {
    if (supabase) {
      try {
        await ensureLiveSeeded();
        const { data, error } = await supabase
          .from('earnings')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) return (data as unknown as DbEarningRow[]).map(mapEarningRow);
        throw error;
      } catch (err) {
        warnFallback('getEarnings', err);
      }
    }
    return loadDatabase().earnings;
  },

  // Bookings queries
  async getBookings(): Promise<Booking[]> {
    if (supabase) {
      try {
        await ensureLiveSeeded();
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return (data as unknown as DbBookingRow[]).map(mapBookingRow);
        throw error;
      } catch (err) {
        warnFallback('getBookings', err);
      }
    }
    return loadDatabase().bookings;
  },

  async insertBooking(newBooking: Booking, newEarnings: EarningsRecord): Promise<void> {
    if (supabase) {
      try {
        const { error: bookingError } = await supabase.from('bookings').insert(bookingToDb(newBooking));
        if (bookingError) throw bookingError;

        const { error: earningsError } = await supabase.from('earnings').insert(earningToDb(newEarnings));
        if (earningsError) throw earningsError;

        const { error: loadUpdateError } = await supabase
          .from('load_requests')
          .update({ status: 'Booked', matched_trip_id: newBooking.tripId, booking_id: newBooking.id })
          .eq('id', newBooking.loadId);
        if (loadUpdateError) throw loadUpdateError;

        const { data: tripData, error: tripFetchError } = await supabase
          .from('trips')
          .select('booked_capacity')
          .eq('id', newBooking.tripId)
          .single();
        if (tripFetchError) throw tripFetchError;

        const currentBooked = (tripData as { booked_capacity: number }).booked_capacity || 0;
        const { error: tripUpdateError } = await supabase
          .from('trips')
          .update({ booked_capacity: currentBooked + newBooking.weightKg })
          .eq('id', newBooking.tripId);
        if (tripUpdateError) throw tripUpdateError;

        notifyRealtime('bookings', 'INSERT', newBooking);
        return;
      } catch (err) {
        warnFallback('insertBooking', err);
      }
    }

    // Demo path
    const db = loadDatabase();
    db.bookings.unshift(newBooking);
    db.earnings.unshift(newEarnings);

    db.load_requests = db.load_requests.map((l) => {
      if (l.id === newBooking.loadId) {
        return { ...l, status: 'Booked', matched_trip_id: newBooking.tripId, booking_id: newBooking.id };
      }
      return l;
    });

    db.trips = db.trips.map((t) => {
      if (t.id === newBooking.tripId) {
        return { ...t, booked_capacity: t.booked_capacity + newBooking.weightKg };
      }
      return t;
    });

    persistDatabase(db);
    notifyRealtime('bookings', 'INSERT', newBooking);
  },

  async advanceBookingStatus(bookingId: string): Promise<Booking[]> {
    if (supabase) {
      try {
        const { data: rows, error: fetchError } = await supabase.from('bookings').select('*');
        if (fetchError) throw fetchError;

        const target = (rows as unknown as DbBookingRow[]).map(mapBookingRow).find((b) => b.id === bookingId);
        if (target) {
          const advanced = computeAdvancedBooking(target);
          const { error: updateError } = await supabase
            .from('bookings')
            .upsert(bookingToDb(advanced));
          if (updateError) throw updateError;
          notifyRealtime('bookings', 'UPDATE', { id: bookingId });
        }

        const { data: refreshed, error: refreshError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (refreshError) throw refreshError;
        return (refreshed as unknown as DbBookingRow[]).map(mapBookingRow);
      } catch (err) {
        warnFallback('advanceBookingStatus', err);
      }
    }

    // Demo path
    const db = loadDatabase();
    db.bookings = db.bookings.map((b) => (b.id === bookingId ? computeAdvancedBooking(b) : b));

    persistDatabase(db);
    notifyRealtime('bookings', 'UPDATE', { id: bookingId });
    return db.bookings;
  },

  resetToSeed(): void {
    // Live mode: wipe tables and re-seed so both modes behave identically.
    if (supabase) {
      void (async () => {
        try {
          await Promise.all([
            supabase.from('trips').delete().neq('id', '__none__'),
            supabase.from('load_requests').delete().neq('id', '__none__'),
            supabase.from('bookings').delete().neq('id', '__none__'),
            supabase.from('earnings').delete().neq('id', '__none__')
          ]);
          await seedLiveTables();
          notifyRealtime('system', 'UPDATE', { action: 'reset' });
        } catch (err) {
          warnFallback('resetToSeed (live)', err);
        }
      })();
      return;
    }

    localStorage.removeItem(DB_STORAGE_KEY);
    const db = {
      trips: SEED_TRIPS,
      load_requests: SEED_LOADS,
      earnings: SEED_EARNINGS,
      bookings: SEED_BOOKINGS
    };
    persistDatabase(db);
    notifyRealtime('system', 'UPDATE', { action: 'reset' });
  }
};
