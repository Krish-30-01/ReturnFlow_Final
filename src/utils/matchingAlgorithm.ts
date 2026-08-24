import { Trip, LoadRequest, MatchResult } from '../types/logistics';
import { calculateBackhaulPricing } from '../services/pricingEngine';
import {
  haversineDistanceKm,
  estimateRoadDistanceKm,
  generateCorridorCode
} from '../services/routingEngine';
import { resolveLocation, ResolvedLocation } from '../services/geocodingService';

/**
 * Tunable multi-factor scoring weights (Must sum to 1.0).
 */
export const MATCH_WEIGHTS = {
  CORRIDOR_OVERLAP: 0.35,      // 35% weight: Route alignment along highway geometry
  CAPACITY_FIT: 0.25,          // 25% weight: Payload vs spare capacity efficiency
  SCHEDULE_COMPATIBILITY: 0.20, // 20% weight: Departure & pickup window alignment
  DETOUR_COST: 0.15,           // 15% weight: Detour mileage & time penalty
  RELIABILITY: 0.05            // 5% weight: Driver on-time delivery rating
};

export interface GeometricOverlapResult {
  overlapRatio: number;      // 0.0 to 1.0
  overlapPercent: number;    // 0 to 100
  extraDetourKm: number;     // extra detour in km
  pickupDetourKm: number;    // km distance from trip path to pickup
  dropDetourKm: number;      // km distance from trip path to drop
  directionCosine: number;   // -1.0 to 1.0 directional alignment
  description: string;
}

/**
 * Converts spherical lat/lng coordinates to local flat projection in kilometers
 * around a reference centroid for precise planar geometry calculations.
 */
function toLocalPlaneKm(
  point: { lat: number; lng: number },
  refLat: number
): { x: number; y: number } {
  const R = 6371; // Earth radius in km
  const rad = Math.PI / 180;
  const x = point.lng * rad * R * Math.cos(refLat * rad);
  const y = point.lat * rad * R;
  return { x, y };
}

/**
 * Resolves coordinate objects for a Trip or LoadRequest safely.
 */
export function getCoordinates(
  entity: { from: string; to: string; originCoords?: { lat: number; lng: number }; destinationCoords?: { lat: number; lng: number } }
): { origin: { lat: number; lng: number }; destination: { lat: number; lng: number }; originLoc: ResolvedLocation | null; destLoc: ResolvedLocation | null } {
  let origin = entity.originCoords;
  let destination = entity.destinationCoords;
  let originLoc: ResolvedLocation | null = null;
  let destLoc: ResolvedLocation | null = null;

  if (!origin || isNaN(origin.lat) || isNaN(origin.lng) || (origin.lat === 0 && origin.lng === 0)) {
    originLoc = resolveLocation(entity.from);
    origin = originLoc ? { lat: originLoc.lat, lng: originLoc.lng } : { lat: 17.3850, lng: 78.4867 };
  }

  if (!destination || isNaN(destination.lat) || isNaN(destination.lng) || (destination.lat === 0 && destination.lng === 0)) {
    destLoc = resolveLocation(entity.to);
    destination = destLoc ? { lat: destLoc.lat, lng: destLoc.lng } : { lat: 12.9716, lng: 77.5946 };
  }

  return { origin, destination, originLoc, destLoc };
}

/**
 * Generic pure geometric route overlap & detour engine.
 * Works for ANY valid coordinate pairs across India without hardcoded city rules.
 */
export function calculateGeometricOverlap(
  tripOrigin: { lat: number; lng: number },
  tripDest: { lat: number; lng: number },
  loadOrigin: { lat: number; lng: number },
  loadDest: { lat: number; lng: number }
): GeometricOverlapResult {
  // 1. Check exact / near-identical origin & destination coordinates (city-center / hub radius <= 15 km)
  const originDist = haversineDistanceKm(tripOrigin, loadOrigin);
  const destDist = haversineDistanceKm(tripDest, loadDest);

  if (originDist <= 15 && destDist <= 15) {
    return {
      overlapRatio: 1.0,
      overlapPercent: 100,
      extraDetourKm: 0,
      pickupDetourKm: Math.round(originDist),
      dropDetourKm: Math.round(destDist),
      directionCosine: 1.0,
      description: '100% direct corridor overlap (0 km detour)'
    };
  }

  // Reference latitude for local equirectangular metric projection
  const refLat = (tripOrigin.lat + tripDest.lat + loadOrigin.lat + loadDest.lat) / 4;

  const tO = toLocalPlaneKm(tripOrigin, refLat);
  const tD = toLocalPlaneKm(tripDest, refLat);
  const lO = toLocalPlaneKm(loadOrigin, refLat);
  const lD = toLocalPlaneKm(loadDest, refLat);

  // Vector representations in kilometers
  const vTrip = { x: tD.x - tO.x, y: tD.y - tO.y };
  const vLoad = { x: lD.x - lO.x, y: lD.y - lO.y };

  const lenTrip = Math.sqrt(vTrip.x * vTrip.x + vTrip.y * vTrip.y);
  const lenLoad = Math.sqrt(vLoad.x * vLoad.x + vLoad.y * vLoad.y);

  if (lenTrip < 2 || lenLoad < 2) {
    return {
      overlapRatio: 0,
      overlapPercent: 0,
      extraDetourKm: 100,
      pickupDetourKm: 50,
      dropDetourKm: 50,
      directionCosine: 0,
      description: 'Insufficient route distance for corridor matching'
    };
  }

  // 1. DIRECTIONAL ALIGNMENT (Cosine of angle between vectors)
  const dotProduct = vTrip.x * vLoad.x + vTrip.y * vLoad.y;
  const directionCosine = dotProduct / (lenTrip * lenLoad);

  // If moving in opposite directions or perpendicular, overlap is 0
  if (directionCosine <= 0.1) {
    return {
      overlapRatio: 0,
      overlapPercent: 0,
      extraDetourKm: 200,
      pickupDetourKm: Math.round(originDist),
      dropDetourKm: Math.round(destDist),
      directionCosine,
      description: 'Incompatible direction: Routes diverge or travel in opposite directions'
    };
  }

  // 2. PROJECTION ONTO TRIP SEGMENT
  // t = 0 is trip origin, t = 1 is trip destination
  const tripSq = lenTrip * lenTrip;
  const tPickup = ((lO.x - tO.x) * vTrip.x + (lO.y - tO.y) * vTrip.y) / tripSq;
  const tDrop = ((lD.x - tO.x) * vTrip.x + (lD.y - tO.y) * vTrip.y) / tripSq;

  // Closest points on trip line
  const projPickup = { x: tO.x + tPickup * vTrip.x, y: tO.y + tPickup * vTrip.y };
  const projDrop = { x: tO.x + tDrop * vTrip.x, y: tO.y + tDrop * vTrip.y };

  const pickupDetourKm = Math.sqrt(Math.pow(lO.x - projPickup.x, 2) + Math.pow(lO.y - projPickup.y, 2));
  const dropDetourKm = Math.sqrt(Math.pow(lD.x - projDrop.x, 2) + Math.pow(lD.y - projDrop.y, 2));

  // Acceptable cross-track detour radius (15-25 km)
  // Max allowable cross-track distance from transit line (60 km with graceful penalty)
  if (pickupDetourKm > 60 || dropDetourKm > 60) {
    return {
      overlapRatio: 0,
      overlapPercent: 0,
      extraDetourKm: Math.round(pickupDetourKm + dropDetourKm),
      pickupDetourKm: Math.round(pickupDetourKm),
      dropDetourKm: Math.round(dropDetourKm),
      directionCosine,
      description: `Excessive route deviation (pickup: ${Math.round(pickupDetourKm)} km, drop: ${Math.round(dropDetourKm)} km away from corridor)`
    };
  }

  // Check that pickup happens before drop along trip progression
  if (tDrop < tPickup - 0.05) {
    return {
      overlapRatio: 0,
      overlapPercent: 0,
      extraDetourKm: 150,
      pickupDetourKm: Math.round(pickupDetourKm),
      dropDetourKm: Math.round(dropDetourKm),
      directionCosine,
      description: 'Reverse transit sequence: Load drop occurs behind pickup point'
    };
  }

  // 3. LONGITUDINAL SHARED SEGMENT OVERLAP
  const startOverlap = Math.max(0, Math.min(1, tPickup));
  const endOverlap = Math.max(0, Math.min(1, tDrop));
  const sharedDistanceKm = Math.max(0, (endOverlap - startOverlap) * lenTrip);

  // Ratio of load's route that lies within the driver's transit leg
  const baseCoverageRatio = Math.min(1.0, sharedDistanceKm / Math.max(10, lenLoad));

  // Cross-track detour penalty (1.0 for <= 15 km detour, degrades gracefully up to 60 km)
  const avgCrossTrackKm = (pickupDetourKm + dropDetourKm) / 2;
  const detourPenalty = avgCrossTrackKm <= 15
    ? 1.0
    : Math.max(0, 1.0 - ((avgCrossTrackKm - 15) / 45));

  // Final generic geometric overlap ratio (0.0 to 1.0)
  const overlapRatio = Math.min(1.0, Math.max(0, baseCoverageRatio * directionCosine * detourPenalty));
  const overlapPercent = Math.round(overlapRatio * 100);

  // 4. EXACT ROAD DETOUR ESTIMATION
  const directTripRoadKm = estimateRoadDistanceKm(tripOrigin, tripDest);
  const toPickupRoadKm = estimateRoadDistanceKm(tripOrigin, loadOrigin);
  const loadRoadKm = estimateRoadDistanceKm(loadOrigin, loadDest);
  const fromDropRoadKm = estimateRoadDistanceKm(loadDest, tripDest);

  const totalDetourTripKm = toPickupRoadKm + loadRoadKm + fromDropRoadKm;
  const extraDetourKm = Math.max(0, totalDetourTripKm - directTripRoadKm);

  let description = '';
  if (overlapPercent >= 90) {
    description = `${overlapPercent}% direct corridor overlap with ~${extraDetourKm} km route detour`;
  } else if (overlapPercent >= 60) {
    description = `${overlapPercent}% corridor sub-segment coverage along transit path (~${extraDetourKm} km detour)`;
  } else {
    description = `${overlapPercent}% partial corridor alignment (~${extraDetourKm} km detour)`;
  }

  return {
    overlapRatio,
    overlapPercent,
    extraDetourKm,
    pickupDetourKm: Math.round(pickupDetourKm),
    dropDetourKm: Math.round(dropDetourKm),
    directionCosine,
    description
  };
}

/**
 * Evaluates candidate trips and outputs a normalized 0-100 compatibility score
 * using purely generic coordinate geometry.
 */
export function calculateMatchScore(trip: Trip, load: LoadRequest): MatchResult {
  const tripCoords = getCoordinates(trip);
  const loadCoords = getCoordinates(load);

  const loadWeight = load.weightUnit === 'CBM' ? load.weight * 250 : load.weight;
  const availableCapacity = Math.max(0, trip.totalCapacityKg - trip.bookedCapacityKg);

  // 1. GEOMETRIC CORRIDOR OVERLAP FACTOR (0.0 to 1.0)
  const geom = calculateGeometricOverlap(
    tripCoords.origin,
    tripCoords.destination,
    loadCoords.origin,
    loadCoords.destination
  );
  const fCorridorOverlap = geom.overlapRatio;

  // 2. CAPACITY FIT FACTOR (0.0 to 1.0)
  let fCapacityFit = 0;
  let utilizationPct = 0;
  if (availableCapacity <= 0) {
    fCapacityFit = 0.05;
  } else if (availableCapacity < loadWeight) {
    fCapacityFit = Math.max(0.1, (availableCapacity / loadWeight) * 0.4);
    utilizationPct = Math.round((loadWeight / availableCapacity) * 100);
  } else {
    const utilization = loadWeight / availableCapacity;
    utilizationPct = Math.round(utilization * 100);
    if (utilization >= 0.5 && utilization <= 0.95) {
      fCapacityFit = 0.90 + 0.10 * ((utilization - 0.5) / 0.45);
    } else if (utilization >= 0.2 && utilization < 0.5) {
      fCapacityFit = 0.75 + 0.15 * ((utilization - 0.2) / 0.3);
    } else if (utilization > 0.95) {
      fCapacityFit = 0.85;
    } else {
      fCapacityFit = 0.50 + 0.25 * (utilization / 0.2);
    }
  }
  fCapacityFit = Math.min(1.0, Math.max(0, fCapacityFit));

  // 3. SCHEDULE COMPATIBILITY FACTOR (0.0 to 1.0)
  let fSchedule = 0.90;
  let scheduleDiffDays = 0;
  if (trip.departureDate && load.date) {
    const tripTime = new Date(trip.departureDate).getTime();
    const loadTime = new Date(load.date).getTime();
    scheduleDiffDays = Math.round(Math.abs(tripTime - loadTime) / 86400000);

    if (scheduleDiffDays === 0) {
      fSchedule = 1.0;
    } else if (scheduleDiffDays === 1) {
      fSchedule = 0.75;
    } else if (scheduleDiffDays === 2) {
      fSchedule = 0.40;
    } else {
      fSchedule = Math.max(0.05, 0.30 - (scheduleDiffDays * 0.05));
    }
  }

  // 4. DETOUR COST FACTOR (0.0 to 1.0)
  let fDetour = 1.0;
  if (geom.extraDetourKm <= 5) {
    fDetour = 1.0;
  } else if (geom.extraDetourKm <= 25) {
    fDetour = 0.90 - ((geom.extraDetourKm - 5) / 20) * 0.15;
  } else if (geom.extraDetourKm <= 60) {
    fDetour = 0.75 - ((geom.extraDetourKm - 25) / 35) * 0.25;
  } else {
    fDetour = Math.max(0.1, 0.50 - ((geom.extraDetourKm - 60) / 60) * 0.4);
  }

  // 5. DRIVER RELIABILITY FACTOR (0.0 to 1.0)
  const driverRating = trip.driverRating || 4.8;
  const fReliability = Math.min(1.0, Math.max(0.5, driverRating / 5.0));

  // WEIGHTED COMPOSITE SCORE (0 - 100)
  const rawWeightedScore =
    (fCorridorOverlap * MATCH_WEIGHTS.CORRIDOR_OVERLAP) +
    (fCapacityFit * MATCH_WEIGHTS.CAPACITY_FIT) +
    (fSchedule * MATCH_WEIGHTS.SCHEDULE_COMPATIBILITY) +
    (fDetour * MATCH_WEIGHTS.DETOUR_COST) +
    (fReliability * MATCH_WEIGHTS.RELIABILITY);

  // If geometric overlap is 0, overall score is zeroed out to guarantee no false matches
  const matchScore = fCorridorOverlap === 0
    ? 0
    : Math.min(99, Math.max(10, Math.round(rawWeightedScore * 100)));

  // PRICING: Driver names their price → platform adds 8% on top → retailer pays total.
  // This is the single source of truth for all price displays in the retailer portal.
  const PLATFORM_RATE = 0.08;
  const driverPayout = trip.minPrice;                                      // exactly what driver asked
  const retailerBudget = Math.round(driverPayout / (1 - PLATFORM_RATE));  // e.g. ₹28,000 / 0.92 = ₹30,435
  const platformFee = retailerBudget - driverPayout;                       // exact 8% cut

  // Keep engine call only for market benchmark data (savings badge, CO₂)
  const distanceKm = estimateRoadDistanceKm(loadCoords.origin, loadCoords.destination);
  const pricing = calculateBackhaulPricing({
    distanceKm,
    weightKg: loadWeight,
    vehicleType: trip.vehicleType,
    corridorId: generateCorridorCode(load.from, load.to),
    isReturnTrip: true
  });

  const calculatedPrice = retailerBudget;
  const marketPrice = pricing.marketPrice;
  const savingsPercentage = Math.max(10, Math.round(((marketPrice - retailerBudget) / marketPrice) * 100));
  const co2SavedKg = pricing.co2SavedKg;

  // DYNAMIC ALGORITHM INSIGHT: Generated purely from computed factors
  let explanation = '';
  if (fCorridorOverlap === 0) {
    explanation = `⚠ Route mismatch: Truck route (${trip.from} → ${trip.to}) does not align with load route (${load.from} → ${load.to}).`;
  } else {
    const scheduleText = scheduleDiffDays === 0 ? 'same-day departure' : `${scheduleDiffDays}-day schedule difference`;
    const capacityText = `${loadWeight.toLocaleString()} Kg load utilizes ${utilizationPct}% of ${availableCapacity.toLocaleString()} Kg spare capacity`;
    const detourText = geom.extraDetourKm <= 2 ? '0 km detour' : `~${geom.extraDetourKm} km route detour`;
    const driverPayoutText = `Driver payout ₹${driverPayout.toLocaleString()} (platform fee ₹${platformFee.toLocaleString()})`;

    if (matchScore >= 90) {
      explanation = `High-efficiency match: ${geom.description}. ${capacityText} with ${scheduleText} and ${detourText}. ${driverPayoutText} (saves ₹${(marketPrice - calculatedPrice).toLocaleString()} vs spot rate).`;
    } else if (matchScore >= 70) {
      explanation = `Strong compatibility: ${geom.description}. ${capacityText} (${scheduleText}, ${detourText}). ${driverPayoutText}.`;
    } else {
      explanation = `Partial match: ${geom.description}. ${capacityText} (${scheduleText}). ${driverPayoutText}.`;
    }
  }

  return {
    id: `match-${trip.id}-${load.id}`,
    trip,
    load,
    matchScore,
    routeOverlapScore: Math.round(fCorridorOverlap * 100),
    capacityScore: Math.round(fCapacityFit * 100),
    timeWindowScore: Math.round(fSchedule * 100),
    priceScore: Math.round(fDetour * 100),
    calculatedPrice,
    marketPrice,
    savingsPercentage,
    co2SavedKg,
    explanation
  };
}

/**
 * Filters trips to find valid candidate matches for a load request purely via coordinate geometry.
 * Discards all trips with zero geometric route overlap.
 */
export function getCandidateMatchesForLoad(trips: Trip[], load: LoadRequest): MatchResult[] {
  if (!load || !trips || trips.length === 0) return [];

  return trips
    .filter((trip) => trip.status === 'active')
    .map((trip) => calculateMatchScore(trip, load))
    .filter((match) => match.matchScore >= 35 && match.routeOverlapScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
