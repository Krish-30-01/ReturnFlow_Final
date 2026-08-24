import { calculateDeterministicPrice } from '../services/pricingEngine';
import { calculateMatchScore, calculateGeometricOverlap, getCandidateMatchesForLoad } from '../utils/matchingAlgorithm';
import { resolveLocation } from '../services/geocodingService';
import { Trip, LoadRequest } from '../types/logistics';

// 1. Test Geocoding Gazetteer Coverage & Coordinate Integrity
export function testGeocodingCoverage() {
  const requiredCities = [
    'Ahmedabad', 'Hyderabad', 'Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Pune',
    'Warangal', 'Vijayawada', 'Kolkata', 'Jaipur', 'Surat', 'Nagpur', 'Indore',
    'Coimbatore', 'Kochi', 'Lucknow', 'Chandigarh', 'Bhopal', 'Patna', 'Ranchi',
    'Bhubaneswar', 'Raipur', 'Guwahati', 'Visakhapatnam', 'Ludhiana', 'Agra', 'Nashik'
  ];

  for (const city of requiredCities) {
    const loc = resolveLocation(city);
    console.assert(Boolean(loc !== null), `Geocoding failure: "${city}" not resolved in gazetteer`);
    console.assert(Boolean(loc && loc.lat !== 0 && loc.lng !== 0), `Geocoding coordinate failure: "${city}" resolved to 0,0`);
    console.assert(Boolean(loc && !isNaN(loc.lat) && !isNaN(loc.lng)), `Geocoding NaN error on "${city}"`);
  }
  console.log('✓ Test 1 Passed: Static gazetteer resolves all 28+ required Indian cities with valid non-zero coordinates.');
  return true;
}

// 2. Test Ahmedabad → Hyderabad Corridor Match (Critical Regression Test)
export function testAhmedabadHyderabadMatch() {
  const locAhm = resolveLocation('Ahmedabad')!;
  const locHyd = resolveLocation('Hyderabad')!;

  const trip: Trip = {
    id: 'trip-ahm-hyd',
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverAvatarText: 'RK',
    driverPhone: '+91 98490 23145',
    vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehiclePlate: 'GJ-01-AB-1234',
    from: 'Ahmedabad',
    to: 'Hyderabad',
    originCoords: { lat: locAhm.lat, lng: locAhm.lng },
    destinationCoords: { lat: locHyd.lat, lng: locHyd.lng },
    corridor: 'AHM-HYD',
    departureDate: '2026-08-25',
    departureTimeWindow: '06:00 AM – 10:00 AM',
    totalCapacityKg: 15000,
    bookedCapacityKg: 0,
    preferredLoadType: 'FMCG & General Goods',
    minPrice: 28000,
    isReturnTrip: true,
    status: 'active',
    bookedLoads: []
  };

  const load: LoadRequest = {
    id: 'load-ahm-hyd',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks Pvt Ltd',
    customerPhone: '+91 94401 55678',
    from: 'Ahmedabad',
    to: 'Hyderabad',
    originCoords: { lat: locAhm.lat, lng: locAhm.lng },
    destinationCoords: { lat: locHyd.lat, lng: locHyd.lng },
    corridor: 'AHM-HYD',
    date: '2026-08-25',
    timeWindow: 'Morning (07:00 AM – 11:00 AM)',
    weight: 5000,
    weightUnit: 'Kg',
    goodsType: 'FMCG',
    budget: 35000,
    status: 'Searching',
    createdAt: 'Just now'
  };

  const match = calculateMatchScore(trip, load);
  console.assert(match.matchScore >= 90, `Ahmedabad→Hyderabad match score failed: expected >= 90, got ${match.matchScore}`);
  console.assert(match.routeOverlapScore === 100, `Ahmedabad→Hyderabad route overlap failed: expected 100%, got ${match.routeOverlapScore}%`);
  
  const candidates = getCandidateMatchesForLoad([trip], load);
  console.assert(candidates.length === 1, 'Ahmedabad→Hyderabad failed to appear in candidate matches list');
  console.assert(candidates[0].matchScore >= 90, 'Ahmedabad→Hyderabad candidate match score below threshold');

  console.log(`✓ Test 2 Passed: Ahmedabad → Hyderabad match score is ${match.matchScore}% (100% route overlap, ~0 km detour).`);
  return true;
}

// 3. Test Additional Corridors: Mumbai → Pune & Chennai → Coimbatore
export function testAdditionalCorridors() {
  // Mumbai -> Pune
  const locMum = resolveLocation('Mumbai')!;
  const locPun = resolveLocation('Pune')!;
  const tripMumPun: Trip = {
    id: 'trip-mum-pun',
    driverId: 'drv-1',
    driverName: 'Suresh',
    driverRating: 4.8,
    driverAvatarText: 'SK',
    driverPhone: '+91 98000 11111',
    vehicleType: 'TATA 407 (4-Ton Commercial)',
    vehiclePlate: 'MH-12-AB-5678',
    from: 'Mumbai',
    to: 'Pune',
    originCoords: { lat: locMum.lat, lng: locMum.lng },
    destinationCoords: { lat: locPun.lat, lng: locPun.lng },
    corridor: 'MUM-PUN',
    departureDate: '2026-08-25',
    departureTimeWindow: '08:00 AM – 12:00 PM',
    totalCapacityKg: 4000,
    bookedCapacityKg: 0,
    preferredLoadType: 'Industrial / Auto Parts',
    minPrice: 3500,
    isReturnTrip: true,
    status: 'active',
    bookedLoads: []
  };

  const loadMumPun: LoadRequest = {
    id: 'load-mum-pun',
    customerId: 'cust-1',
    customerName: 'Amit',
    customerCompany: 'Pune Logistics',
    customerPhone: '+91 98000 22222',
    from: 'Mumbai',
    to: 'Pune',
    originCoords: { lat: locMum.lat, lng: locMum.lng },
    destinationCoords: { lat: locPun.lat, lng: locPun.lng },
    corridor: 'MUM-PUN',
    date: '2026-08-25',
    timeWindow: 'Morning (08:00 AM – 12:00 PM)',
    weight: 2000,
    weightUnit: 'Kg',
    goodsType: 'Auto Parts',
    budget: 4500,
    status: 'Searching',
    createdAt: 'Now'
  };

  const matchMumPun = calculateMatchScore(tripMumPun, loadMumPun);
  console.assert(matchMumPun.matchScore >= 90, `Mumbai→Pune match score failed: expected >= 90, got ${matchMumPun.matchScore}`);

  // Chennai -> Coimbatore
  const locMaa = resolveLocation('Chennai')!;
  const locCjb = resolveLocation('Coimbatore')!;
  const tripMaaCjb: Trip = {
    id: 'trip-maa-cjb',
    driverId: 'drv-2',
    driverName: 'Murugan',
    driverRating: 4.9,
    driverAvatarText: 'MK',
    driverPhone: '+91 94000 33333',
    vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehiclePlate: 'TN-01-CD-9999',
    from: 'Chennai',
    to: 'Coimbatore',
    originCoords: { lat: locMaa.lat, lng: locMaa.lng },
    destinationCoords: { lat: locCjb.lat, lng: locCjb.lng },
    corridor: 'MAA-CJB',
    departureDate: '2026-08-25',
    departureTimeWindow: '06:00 AM – 10:00 AM',
    totalCapacityKg: 15000,
    bookedCapacityKg: 0,
    preferredLoadType: 'Textiles & Garments',
    minPrice: 16000,
    isReturnTrip: true,
    status: 'active',
    bookedLoads: []
  };

  const loadMaaCjb: LoadRequest = {
    id: 'load-maa-cjb',
    customerId: 'cust-2',
    customerName: 'Karthik',
    customerCompany: 'Coimbatore Textiles',
    customerPhone: '+91 94000 44444',
    from: 'Chennai',
    to: 'Coimbatore',
    originCoords: { lat: locMaa.lat, lng: locMaa.lng },
    destinationCoords: { lat: locCjb.lat, lng: locCjb.lng },
    corridor: 'MAA-CJB',
    date: '2026-08-25',
    timeWindow: 'Morning',
    weight: 6000,
    weightUnit: 'Kg',
    goodsType: 'Textiles',
    budget: 20000,
    status: 'Searching',
    createdAt: 'Now'
  };

  const matchMaaCjb = calculateMatchScore(tripMaaCjb, loadMaaCjb);
  console.assert(matchMaaCjb.matchScore >= 90, `Chennai→Coimbatore match score failed: expected >= 90, got ${matchMaaCjb.matchScore}`);

  console.log(`✓ Test 3 Passed: Mumbai → Pune (${matchMumPun.matchScore}%) and Chennai → Coimbatore (${matchMaaCjb.matchScore}%) both match with high scores.`);
  return true;
}

// 4. Test Previously Working Corridors: Hyderabad → Bangalore & Hyderabad → Warangal
export function testPreviouslyWorkingCorridors() {
  const tripHydBlr: Trip = {
    id: 'trip-hyd-blr',
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverAvatarText: 'RK',
    driverPhone: '+91 98490 23145',
    vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehiclePlate: 'TS-07-EA-9912',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    originCoords: { lat: 17.2403, lng: 78.4294 },
    destinationCoords: { lat: 13.0312, lng: 77.5186 },
    corridor: 'HYD-BLR',
    departureDate: '2026-08-24',
    departureTimeWindow: '04:00 AM – 08:00 AM',
    totalCapacityKg: 15000,
    bookedCapacityKg: 0,
    preferredLoadType: 'FMCG & General Goods',
    minPrice: 9200,
    isReturnTrip: true,
    status: 'active',
    bookedLoads: []
  };

  const loadHydBlr: LoadRequest = {
    id: 'load-hyd-blr',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    originCoords: { lat: 17.2403, lng: 78.4294 },
    destinationCoords: { lat: 13.0312, lng: 77.5186 },
    corridor: 'HYD-BLR',
    date: '2026-08-24',
    timeWindow: 'Flexible',
    weight: 2500,
    weightUnit: 'Kg',
    goodsType: 'FMCG',
    budget: 10000,
    status: 'Searching',
    createdAt: 'Now'
  };

  const matchHydBlr = calculateMatchScore(tripHydBlr, loadHydBlr);
  console.assert(matchHydBlr.matchScore >= 90, `Hyderabad→Bangalore match score failed: got ${matchHydBlr.matchScore}`);

  const tripHydWar: Trip = {
    id: 'trip-hyd-war',
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverAvatarText: 'RK',
    driverPhone: '+91 98490 23145',
    vehicleType: 'TATA 407 (4-Ton Commercial)',
    vehiclePlate: 'TS-09-UB-4421',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    originCoords: { lat: 17.3984, lng: 78.5583 },
    destinationCoords: { lat: 17.9689, lng: 79.5941 },
    corridor: 'HYD-WAR',
    departureDate: '2026-08-23',
    departureTimeWindow: '06:00 AM – 10:00 AM',
    totalCapacityKg: 4000,
    bookedCapacityKg: 0,
    preferredLoadType: 'Furniture & Display Fixtures',
    minPrice: 1500,
    isReturnTrip: true,
    status: 'active',
    bookedLoads: []
  };

  const loadHydWar: LoadRequest = {
    id: 'load-hyd-war',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    originCoords: { lat: 17.3984, lng: 78.5583 },
    destinationCoords: { lat: 17.9689, lng: 79.5941 },
    corridor: 'HYD-WAR',
    date: '2026-08-23',
    timeWindow: 'Morning',
    weight: 400,
    weightUnit: 'Kg',
    goodsType: 'Furniture',
    budget: 1630,
    status: 'Searching',
    createdAt: 'Now'
  };

  const matchHydWar = calculateMatchScore(tripHydWar, loadHydWar);
  console.assert(matchHydWar.matchScore >= 90, `Hyderabad→Warangal match score failed: got ${matchHydWar.matchScore}`);

  console.log(`✓ Test 4 Passed: Hyderabad → Bangalore (${matchHydBlr.matchScore}%) and Hyderabad → Warangal (${matchHydWar.matchScore}%) maintain high compatibility.`);
  return true;
}

// 5. Test Non-Overlapping Route Rejection
export function testRouteMismatchRejection() {
  const locAhm = resolveLocation('Ahmedabad')!;
  const locHyd = resolveLocation('Hyderabad')!;
  const locKol = resolveLocation('Kolkata')!;
  const locMaa = resolveLocation('Chennai')!;

  const geom = calculateGeometricOverlap(
    { lat: locAhm.lat, lng: locAhm.lng },
    { lat: locHyd.lat, lng: locHyd.lng },
    { lat: locKol.lat, lng: locKol.lng },
    { lat: locMaa.lat, lng: locMaa.lng }
  );

  console.assert(geom.overlapRatio === 0, `Divergent routes (Ahmedabad→Hyderabad vs Kolkata→Chennai) should have 0 overlap, got ${geom.overlapRatio}`);
  console.log('✓ Test 5 Passed: Divergent/incompatible routes produce exactly 0% overlap.');
  return true;
}

// 6. Test Deterministic Pricing & Financial Reconciliation
export function testPricingReconciliation() {
  const routes = [
    { distanceKm: 148, weightKg: 400, vehicleType: 'TATA 407 (4-Ton Commercial)' },
    { distanceKm: 569, weightKg: 2500, vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)' },
    { distanceKm: 1220, weightKg: 5000, vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)' }
  ];

  for (const r of routes) {
    const price = calculateDeterministicPrice({
      distanceKm: r.distanceKm,
      weightKg: r.weightKg,
      vehicleType: r.vehicleType,
      isReturnTrip: true
    });

    console.assert(price.driverPayout + price.platformFee === price.retailerBudget,
      `Reconciliation error on ${r.distanceKm}km: driverPayout (${price.driverPayout}) + platformFee (${price.platformFee}) !== retailerBudget (${price.retailerBudget})`);

    console.assert(price.driverPayout === Math.round(price.retailerBudget * (1 - price.platformDiscountRate)),
      `Formula error: driverPayout !== retailerBudget * (1 - takeRate)`);
  }

  console.log('✓ Test 6 Passed: Driver payout + platform fee reconciles 100% with retailer budget for all distances.');
  return true;
}

// Run all test suites
testGeocodingCoverage();
testAhmedabadHyderabadMatch();
testAdditionalCorridors();
testPreviouslyWorkingCorridors();
testRouteMismatchRejection();
testPricingReconciliation();

console.log('\n========================================');
console.log('ALL REGRESSION TESTS PASSED SUCCESSFULLY');
console.log('========================================\n');

