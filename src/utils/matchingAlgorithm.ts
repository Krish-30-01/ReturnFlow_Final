import { Trip, LoadRequest, MatchResult } from '../types/logistics';

export interface CorridorData {
  id: string;
  name: string;
  highway: string;
  distanceKm: number;
  cities: { name: string; lat: number; lng: number }[];
  forwardDemandTonsPerDay: number;
  returnDemandTonsPerDay: number;
  emptyReturnRate: number; // e.g. 0.42 = 42% empty backhaul without platform
}

export const CORRIDORS: Record<string, CorridorData> = {
  'HYD-WAR': {
    id: 'HYD-WAR',
    name: 'Hyderabad — Warangal Corridor',
    highway: 'NH163',
    distanceKm: 148,
    cities: [
      { name: 'Hyderabad (Uppal Hub)', lat: 17.3984, lng: 78.5583 },
      { name: 'Bhongir', lat: 17.5108, lng: 78.8891 },
      { name: 'Jangaon', lat: 17.7277, lng: 79.1558 },
      { name: 'Kazipet Junction', lat: 17.9784, lng: 79.5255 },
      { name: 'Warangal Industrial Area', lat: 17.9689, lng: 79.5941 }
    ],
    forwardDemandTonsPerDay: 480,
    returnDemandTonsPerDay: 320,
    emptyReturnRate: 0.44
  },
  'HYD-BLR': {
    id: 'HYD-BLR',
    name: 'Hyderabad — Bangalore Corridor',
    highway: 'NH44',
    distanceKm: 569,
    cities: [
      { name: 'Hyderabad (Shamshabad Logistics Park)', lat: 17.2403, lng: 78.4294 },
      { name: 'Jadcherla', lat: 16.7663, lng: 78.1408 },
      { name: 'Kurnool Tollway', lat: 15.8281, lng: 78.0373 },
      { name: 'Anantapur Hub', lat: 14.6819, lng: 77.6006 },
      { name: 'Chikkaballapur', lat: 13.4325, lng: 77.7275 },
      { name: 'Bangalore (Peenya / Electronic City)', lat: 12.9716, lng: 77.5946 }
    ],
    forwardDemandTonsPerDay: 1250,
    returnDemandTonsPerDay: 980,
    emptyReturnRate: 0.38
  },
  'DEL-BLR': {
    id: 'DEL-BLR',
    name: 'Delhi — Bangalore Grand Corridor',
    highway: 'NH44',
    distanceKm: 2150,
    cities: [
      { name: 'Delhi NCR (Kundli Logistics Hub)', lat: 28.7041, lng: 77.1025 },
      { name: 'Agra', lat: 27.1767, lng: 78.0081 },
      { name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
      { name: 'Nagpur Logistics Hub', lat: 21.1458, lng: 79.0882 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 }
    ],
    forwardDemandTonsPerDay: 2400,
    returnDemandTonsPerDay: 1700,
    emptyReturnRate: 0.46
  },
  'MUM-PUN': {
    id: 'MUM-PUN',
    name: 'Mumbai — Pune — Kolhapur Expressway',
    highway: 'NH48',
    distanceKm: 230,
    cities: [
      { name: 'Mumbai (JNPT Navi Mumbai)', lat: 18.9498, lng: 72.9515 },
      { name: 'Panvel', lat: 18.9894, lng: 73.1175 },
      { name: 'Lonavala Ghats', lat: 18.7557, lng: 73.4091 },
      { name: 'Pune (Chakan Auto Cluster)', lat: 18.7583, lng: 73.8567 }
    ],
    forwardDemandTonsPerDay: 1800,
    returnDemandTonsPerDay: 1450,
    emptyReturnRate: 0.35
  },
  'VIJ-HYD': {
    id: 'VIJ-HYD',
    name: 'Vijayawada — Hyderabad Corridor',
    highway: 'NH65',
    distanceKm: 275,
    cities: [
      { name: 'Vijayawada Auto Nagar', lat: 16.5062, lng: 80.6480 },
      { name: 'Nandigama', lat: 16.7725, lng: 80.2925 },
      { name: 'Suryapet Hub', lat: 17.1439, lng: 79.6239 },
      { name: 'Nalgonda Bypass', lat: 17.0577, lng: 79.2684 },
      { name: 'Hyderabad (L.B. Nagar)', lat: 17.3512, lng: 78.5522 }
    ],
    forwardDemandTonsPerDay: 620,
    returnDemandTonsPerDay: 540,
    emptyReturnRate: 0.40
  }
};

/**
 * City keywords mapped to corridors for auto-detection.
 * When a user types "Warangal" we know it's on HYD-WAR, not HYD-BLR.
 */
const CITY_CORRIDOR_MAP: { keyword: string; corridors: string[] }[] = [
  // HYD-WAR corridor cities
  { keyword: 'warangal', corridors: ['HYD-WAR'] },
  { keyword: 'kazipet', corridors: ['HYD-WAR'] },
  { keyword: 'jangaon', corridors: ['HYD-WAR'] },
  { keyword: 'bhongir', corridors: ['HYD-WAR'] },
  // HYD-BLR corridor cities
  { keyword: 'bangalore', corridors: ['HYD-BLR', 'DEL-BLR'] },
  { keyword: 'bengaluru', corridors: ['HYD-BLR', 'DEL-BLR'] },
  { keyword: 'peenya', corridors: ['HYD-BLR'] },
  { keyword: 'electronic city', corridors: ['HYD-BLR'] },
  { keyword: 'kurnool', corridors: ['HYD-BLR'] },
  { keyword: 'anantapur', corridors: ['HYD-BLR'] },
  { keyword: 'jadcherla', corridors: ['HYD-BLR'] },
  { keyword: 'chikkaballapur', corridors: ['HYD-BLR'] },
  // DEL-BLR corridor cities
  { keyword: 'delhi', corridors: ['DEL-BLR'] },
  { keyword: 'kundli', corridors: ['DEL-BLR'] },
  { keyword: 'agra', corridors: ['DEL-BLR'] },
  { keyword: 'gwalior', corridors: ['DEL-BLR'] },
  { keyword: 'nagpur', corridors: ['DEL-BLR'] },
  // MUM-PUN corridor cities
  { keyword: 'mumbai', corridors: ['MUM-PUN'] },
  { keyword: 'jnpt', corridors: ['MUM-PUN'] },
  { keyword: 'navi mumbai', corridors: ['MUM-PUN'] },
  { keyword: 'panvel', corridors: ['MUM-PUN'] },
  { keyword: 'lonavala', corridors: ['MUM-PUN'] },
  { keyword: 'pune', corridors: ['MUM-PUN'] },
  { keyword: 'chakan', corridors: ['MUM-PUN'] },
  // VIJ-HYD corridor cities
  { keyword: 'vijayawada', corridors: ['VIJ-HYD'] },
  { keyword: 'nandigama', corridors: ['VIJ-HYD'] },
  { keyword: 'suryapet', corridors: ['VIJ-HYD'] },
  { keyword: 'nalgonda', corridors: ['VIJ-HYD'] },
  // Hyderabad is a hub — appears in multiple corridors
  { keyword: 'hyderabad', corridors: ['HYD-WAR', 'HYD-BLR', 'VIJ-HYD', 'DEL-BLR'] },
  { keyword: 'shamshabad', corridors: ['HYD-BLR'] },
  { keyword: 'uppal', corridors: ['HYD-WAR'] },
  { keyword: 'l.b. nagar', corridors: ['VIJ-HYD'] },
  { keyword: 'lb nagar', corridors: ['VIJ-HYD'] },
];

/**
 * Auto-detects the best corridor for a given origin → destination pair.
 * Returns the corridor ID (e.g. 'HYD-WAR') or '' if no match found.
 */
export function detectCorridor(from: string, to: string): string {
  const normFrom = from.toLowerCase();
  const normTo = to.toLowerCase();

  // Find corridors that contain the origin city
  const fromCorridors = new Set<string>();
  for (const entry of CITY_CORRIDOR_MAP) {
    if (normFrom.includes(entry.keyword)) {
      entry.corridors.forEach((c) => fromCorridors.add(c));
    }
  }

  // Find corridors that contain the destination city
  const toCorridors = new Set<string>();
  for (const entry of CITY_CORRIDOR_MAP) {
    if (normTo.includes(entry.keyword)) {
      entry.corridors.forEach((c) => toCorridors.add(c));
    }
  }

  // The correct corridor is the intersection — both cities must be on the SAME corridor
  const intersection = [...fromCorridors].filter((c) => toCorridors.has(c));

  if (intersection.length === 1) return intersection[0];

  // If multiple corridors match (e.g. Hyderabad→Bangalore matches both HYD-BLR and DEL-BLR),
  // prefer the more specific/shorter corridor
  if (intersection.length > 1) {
    // Prefer corridors where neither city is "Hyderabad" hub overlap — i.e. prefer the direct route
    const directCorridors = intersection.filter((c) => {
      const corridor = CORRIDORS[c];
      return corridor && corridor.distanceKm < 1000;
    });
    return directCorridors.length > 0 ? directCorridors[0] : intersection[0];
  }

  return '';
}

/**
 * Checks if two corridors are geographically compatible for matching.
 * Two corridors are compatible if they share the same ID or if one is a
 * sub-corridor of the other (e.g., HYD-BLR is a segment of DEL-BLR).
 */
function areCorridorsCompatible(corridorA: string, corridorB: string): boolean {
  if (corridorA === corridorB) return true;

  // DEL-BLR passes through Hyderabad and Bangalore, so it overlaps with HYD-BLR
  const OVERLAPPING_CORRIDORS: Record<string, string[]> = {
    'DEL-BLR': ['HYD-BLR'],
    'HYD-BLR': ['DEL-BLR'],
  };

  const overlaps = OVERLAPPING_CORRIDORS[corridorA];
  return overlaps ? overlaps.includes(corridorB) : false;
}

/**
 * Calculates a match score (0-100) between a Truck Trip and a Load Request.
 * Only produces meaningful scores when the truck and load are on the same or
 * overlapping corridors. Geographically incompatible matches are rejected.
 */
export function calculateMatchScore(trip: Trip, load: LoadRequest): MatchResult {
  const availableCapacity = trip.totalCapacityKg - trip.bookedCapacityKg;
  const loadWeight = load.weightUnit === 'CBM' ? load.weight * 250 : load.weight; // approx 250kg per CBM

  // Determine the load's corridor (use explicit if set, otherwise auto-detect)
  const loadCorridor = load.corridor || detectCorridor(load.from, load.to);
  const tripCorridor = trip.corridor || detectCorridor(trip.from, trip.to);

  // 1. Route overlap score (0 - 40 points)
  // Geographic corridor compatibility is the PRIMARY filter
  let routeOverlapScore = 0;
  const corridorsMatch = tripCorridor && loadCorridor && areCorridorsCompatible(tripCorridor, loadCorridor);

  if (corridorsMatch) {
    // Same corridor — now check if cities align precisely
    const normTripFrom = trip.from.toLowerCase();
    const normTripTo = trip.to.toLowerCase();
    const normLoadFrom = load.from.toLowerCase();
    const normLoadTo = load.to.toLowerCase();

    if (
      (normTripFrom.includes(normLoadFrom) || normLoadFrom.includes(normTripFrom)) &&
      (normTripTo.includes(normLoadTo) || normLoadTo.includes(normTripTo))
    ) {
      routeOverlapScore = 40; // Perfect city-level match on same corridor
    } else if (tripCorridor === loadCorridor) {
      routeOverlapScore = 32; // Same corridor, different pickup/drop cities (minor detour)
    } else {
      routeOverlapScore = 24; // Overlapping corridors (e.g. HYD-BLR segment of DEL-BLR)
    }
  } else {
    // Different corridor entirely — this match should NOT happen
    // Give a very low score so it sinks to the bottom or gets filtered out
    routeOverlapScore = 2;
  }

  // 2. Capacity Score (0 - 30 points)
  let capacityScore = 0;
  if (availableCapacity >= loadWeight) {
    const utilization = loadWeight / availableCapacity;
    if (utilization >= 0.7) {
      capacityScore = 30; // Excellent utilization
    } else if (utilization >= 0.3) {
      capacityScore = 25;
    } else {
      capacityScore = 18;
    }
  } else {
    capacityScore = 5; // Under-capacity
  }

  // 3. Time Window Score (0 - 20 points)
  let timeWindowScore = 18;
  if (trip.departureDate === load.date) {
    timeWindowScore = 20;
  } else {
    timeWindowScore = 14;
  }

  // 4. Price Score (0 - 10 points)
  let priceScore = 8;
  if (load.budget >= trip.minPrice) {
    priceScore = 10;
  } else {
    priceScore = 6;
  }

  const rawScore = routeOverlapScore + capacityScore + timeWindowScore + priceScore;
  const matchScore = Math.min(99, Math.max(10, rawScore));

  // Pricing Model: Split fuel & backhaul efficiency discount
  const baseRatePerKg = trip.minPrice ? trip.minPrice / Math.max(100, availableCapacity) : 2.5;
  const estimatedCost = Math.max(1200, Math.round(loadWeight * baseRatePerKg * 1.15));
  const marketPrice = Math.round(estimatedCost * 1.42); // 30-40% higher standard one-way freight
  const savingsPercentage = Math.round(((marketPrice - estimatedCost) / marketPrice) * 100);
  const co2SavedKg = Math.round((loadWeight / 1000) * 85); // 85kg CO2 saved per ton by eliminating deadhead miles

  let explanation = '';
  if (!corridorsMatch) {
    explanation = `⚠ Low corridor alignment — truck is on ${tripCorridor || 'unknown'} corridor but load needs ${loadCorridor || 'unknown'} corridor. Not recommended.`;
  } else if (matchScore >= 90) {
    explanation = `Optimal backhaul match! Same day schedule, exact route corridor (${tripCorridor}), and high capacity efficiency. Saves ₹${(marketPrice - estimatedCost).toLocaleString()} vs one-way booking.`;
  } else if (matchScore >= 75) {
    explanation = `Strong partial load compatibility on ${tripCorridor} corridor. Pickup location aligns with driver's primary transit route with minimal detour.`;
  } else {
    explanation = `Moderate alignment along ${tripCorridor || 'active'} corridor. Truck has ${availableCapacity.toLocaleString()} Kg spare capacity for return leg.`;
  }

  return {
    id: `match-${trip.id}-${load.id}`,
    trip,
    load,
    matchScore,
    routeOverlapScore,
    capacityScore,
    timeWindowScore,
    priceScore,
    calculatedPrice: estimatedCost,
    marketPrice,
    savingsPercentage,
    co2SavedKg,
    explanation
  };
}

