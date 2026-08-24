import { resolveLocation, validateLocationString } from '../src/services/geocodingService';
import { calculateMatchScore } from '../src/utils/matchingAlgorithm';
import { Trip, LoadRequest } from '../src/types/logistics';

console.log('=== 1. TESTING LOCATION RESOLUTION & VALIDATION ===');

const testCities = [
  'Hyderabad (Shamshabad)',
  'Bangalore (Peenya)',
  'Delhi (Kundli)',
  'Mumbai (JNPT)',
  'Pune (Chakan)',
  'Chennai (Guindy)',
  'Coimbatore',
  'Kolkata',
  'Jaipur',
  'Ahmedabad'
];

for (const city of testCities) {
  const res = resolveLocation(city);
  console.log(`[RESOLVED] "${city}" -> lat: ${res?.lat}, lng: ${res?.lng}, city: ${res?.city}`);
  if (!res || isNaN(res.lat) || isNaN(res.lng)) {
    throw new Error(`Failed to resolve coordinates for ${city}`);
  }
}

// Test invalid location
const invalid = validateLocationString('Fakeland Unobtainium 123');
console.log('[VALIDATION TEST] Invalid location error:', invalid.error);
if (invalid.isValid) throw new Error('Invalid location should fail validation');

console.log('\n=== 2. TESTING 3 NEW CITY PAIRS (NOT IN DEMO DATA) ===');

// Pair 1: Hyderabad -> Delhi (~1450 km)
const tripHydDel: Trip = {
  id: 'trip-hyd-del',
  driverId: 'drv-1',
  driverName: 'Suresh Verma',
  driverRating: 4.9,
  driverAvatarText: 'SV',
  driverPhone: '+91 98765 43210',
  vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
  vehiclePlate: 'TS-08-AB-1234',
  from: 'Hyderabad',
  to: 'Delhi',
  corridor: 'HYD-DEL',
  departureDate: '2026-08-25',
  departureTimeWindow: '06:00 AM',
  totalCapacityKg: 20000,
  bookedCapacityKg: 0,
  preferredLoadType: 'FMCG & Industrial',
  minPrice: 45000,
  isReturnTrip: true,
  status: 'active',
  bookedLoads: []
};

const loadHydDel: LoadRequest = {
  id: 'load-hyd-del',
  customerId: 'cust-1',
  customerName: 'Delhi Trade Hub',
  customerCompany: 'North India Logistics',
  customerPhone: '+91 99999 11111',
  from: 'Hyderabad',
  to: 'Delhi',
  corridor: 'HYD-DEL',
  date: '2026-08-25',
  timeWindow: '06:00 AM',
  weight: 12000,
  weightUnit: 'Kg',
  goodsType: 'Pharmaceuticals & FMCG',
  budget: 50000,
  status: 'Searching',
  createdAt: 'Now'
};

const matchHydDel = calculateMatchScore(tripHydDel, loadHydDel);
console.log(`[PAIR 1: HYD -> DEL] Overlap: ${matchHydDel.routeOverlapScore}%, Score: ${matchHydDel.matchScore}%, Price: ₹${matchHydDel.calculatedPrice}`);
console.log(`  Insight: ${matchHydDel.explanation}`);
if (matchHydDel.matchScore < 90 || matchHydDel.routeOverlapScore < 95) {
  throw new Error('Hyderabad -> Delhi should produce ~100% overlap and score >= 90');
}

// Pair 2: Mumbai -> Pune (~150 km)
const tripMumPun: Trip = {
  id: 'trip-mum-pun',
  driverId: 'drv-2',
  driverName: 'Amit Patil',
  driverRating: 4.8,
  driverAvatarText: 'AP',
  driverPhone: '+91 98220 12345',
  vehicleType: 'TATA 407 (4-Ton Commercial)',
  vehiclePlate: 'MH-12-DE-5678',
  from: 'Mumbai (JNPT)',
  to: 'Pune (Chakan)',
  corridor: 'MUM-PUN',
  departureDate: '2026-08-25',
  departureTimeWindow: '08:00 AM',
  totalCapacityKg: 4000,
  bookedCapacityKg: 0,
  preferredLoadType: 'Auto Components',
  minPrice: 3200,
  isReturnTrip: true,
  status: 'active',
  bookedLoads: []
};

const loadMumPun: LoadRequest = {
  id: 'load-mum-pun',
  customerId: 'cust-2',
  customerName: 'Chakan Auto Corp',
  customerCompany: 'Chakan Auto',
  customerPhone: '+91 98230 55555',
  from: 'Mumbai (JNPT)',
  to: 'Pune (Chakan)',
  corridor: 'MUM-PUN',
  date: '2026-08-25',
  timeWindow: '08:00 AM',
  weight: 2500,
  weightUnit: 'Kg',
  goodsType: 'Auto Parts',
  budget: 3500,
  status: 'Searching',
  createdAt: 'Now'
};

const matchMumPun = calculateMatchScore(tripMumPun, loadMumPun);
console.log(`[PAIR 2: MUM -> PUN] Overlap: ${matchMumPun.routeOverlapScore}%, Score: ${matchMumPun.matchScore}%, Price: ₹${matchMumPun.calculatedPrice}`);
console.log(`  Insight: ${matchMumPun.explanation}`);
if (matchMumPun.matchScore < 90 || matchMumPun.routeOverlapScore < 95) {
  throw new Error('Mumbai -> Pune should produce ~100% overlap and score >= 90');
}

// Pair 3: Chennai -> Coimbatore (~500 km)
const tripMaaCjb: Trip = {
  id: 'trip-maa-cjb',
  driverId: 'drv-3',
  driverName: 'Murugan Swamy',
  driverRating: 4.9,
  driverAvatarText: 'MS',
  driverPhone: '+91 94440 98765',
  vehicleType: 'Eicher Pro 6028 (16-Ton)',
  vehiclePlate: 'TN-01-AX-4321',
  from: 'Chennai',
  to: 'Coimbatore',
  corridor: 'MAA-CJB',
  departureDate: '2026-08-25',
  departureTimeWindow: '05:00 AM',
  totalCapacityKg: 10000,
  bookedCapacityKg: 0,
  preferredLoadType: 'Textile Machinery',
  minPrice: 14000,
  isReturnTrip: true,
  status: 'active',
  bookedLoads: []
};

const loadMaaCjb: LoadRequest = {
  id: 'load-maa-cjb',
  customerId: 'cust-3',
  customerName: 'Kovai Textiles',
  customerCompany: 'Kovai Mills Ltd',
  customerPhone: '+91 94430 11223',
  from: 'Chennai',
  to: 'Coimbatore',
  corridor: 'MAA-CJB',
  date: '2026-08-25',
  timeWindow: '05:00 AM',
  weight: 6000,
  weightUnit: 'Kg',
  goodsType: 'Textile Raw Materials',
  budget: 15500,
  status: 'Searching',
  createdAt: 'Now'
};

const matchMaaCjb = calculateMatchScore(tripMaaCjb, loadMaaCjb);
console.log(`[PAIR 3: MAA -> CJB] Overlap: ${matchMaaCjb.routeOverlapScore}%, Score: ${matchMaaCjb.matchScore}%, Price: ₹${matchMaaCjb.calculatedPrice}`);
console.log(`  Insight: ${matchMaaCjb.explanation}`);
if (matchMaaCjb.matchScore < 90 || matchMaaCjb.routeOverlapScore < 95) {
  throw new Error('Chennai -> Coimbatore should produce ~100% overlap and score >= 90');
}

console.log('\n=== 3. TESTING CROSS-CORRIDOR ISOLATION ===');

// Check that Chennai->Coimbatore trip has ZERO overlap for Hyderabad->Delhi load
const crossMatch = calculateMatchScore(tripMaaCjb, loadHydDel);
console.log(`[CROSS CHECK] Chennai->Coimbatore vs Hyderabad->Delhi: Overlap = ${crossMatch.routeOverlapScore}%, Score = ${crossMatch.matchScore}%`);
if (crossMatch.routeOverlapScore > 0 || crossMatch.matchScore > 0) {
  throw new Error('Cross-corridor matching should produce 0% overlap and 0 score');
}

// Check that Hyderabad->Bangalore vs Hyderabad->Warangal produces ZERO overlap
const tripHydWar: Trip = {
  id: 'trip-hyd-war',
  driverId: 'drv-4',
  driverName: 'Rajesh Kumar',
  driverRating: 4.9,
  driverAvatarText: 'RK',
  driverPhone: '+91 98490 23145',
  vehicleType: 'TATA 407',
  vehiclePlate: 'TS-09-UB-4421',
  from: 'Hyderabad (Uppal)',
  to: 'Warangal Industrial Zone',
  corridor: 'HYD-WAR',
  departureDate: '2026-08-25',
  departureTimeWindow: '06:00 AM',
  totalCapacityKg: 4000,
  bookedCapacityKg: 0,
  preferredLoadType: 'General',
  minPrice: 1500,
  isReturnTrip: true,
  status: 'active',
  bookedLoads: []
};

const loadHydBlr: LoadRequest = {
  id: 'load-hyd-blr',
  customerId: 'cust-4',
  customerName: 'Priya Sharma',
  customerCompany: 'Apex Retail',
  customerPhone: '+91 94401 55678',
  from: 'Hyderabad (Shamshabad)',
  to: 'Bangalore (Peenya)',
  corridor: 'HYD-BLR',
  date: '2026-08-25',
  timeWindow: '06:00 AM',
  weight: 2500,
  weightUnit: 'Kg',
  goodsType: 'FMCG',
  budget: 10000,
  status: 'Searching',
  createdAt: 'Now'
};

const crossMatchHydWarVsBlr = calculateMatchScore(tripHydWar, loadHydBlr);
console.log(`[CROSS CHECK] Hyderabad->Warangal vs Hyderabad->Bangalore: Overlap = ${crossMatchHydWarVsBlr.routeOverlapScore}%, Score = ${crossMatchHydWarVsBlr.matchScore}%`);
if (crossMatchHydWarVsBlr.routeOverlapScore > 0 || crossMatchHydWarVsBlr.matchScore > 0) {
  throw new Error('Warangal trip vs Bangalore load should produce 0% overlap and 0 score');
}

console.log('\n=== ALL GEOMETRIC MATCHING TESTS PASSED PERFECTLY! ===\n');
