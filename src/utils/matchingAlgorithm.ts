import { Trip, LoadRequest, MatchResult } from '../types/logistics';
import { calculateDistanceAndDuration } from '../services/routingEngine';
import { calculateBackhaulPricing } from '../services/pricingEngine';

export interface GeometricOverlapResult {
  overlapRatio: number;
  description: string;
  detourKm: number;
}

function toLocalPlaneKm(
  lat: number,
  lng: number,
  refLat: number,
  refLng: number
): { x: number; y: number } {
  const R = 6371;
  const dLat = ((lat - refLat) * Math.PI) / 180;
  const dLng = ((lng - refLng) * Math.PI) / 180;
  return {
    x: dLng * R * Math.cos((refLat * Math.PI) / 180),
    y: dLat * R,
  };
}

function getCoordinates(city: string | undefined | null): { lat: number; lng: number } | null {
  if (!city || typeof city !== 'string') return null;
  // Inline minimal lookup — full lookup is in geocodingService
  const QUICK: Record<string, { lat: number; lng: number }> = {
    hyderabad: { lat: 17.385, lng: 78.4867 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    bengaluru: { lat: 12.9716, lng: 77.5946 },
    warangal: { lat: 17.9689, lng: 79.5941 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.209 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    pune: { lat: 18.5204, lng: 73.8567 },
    vijayawada: { lat: 16.5062, lng: 80.648 },
    nagpur: { lat: 21.1458, lng: 79.0882 },
  };
  const key = city.toLowerCase().replace(/\s*\(.*\)/g, '').trim().split(' ')[0];
  return QUICK[key] ?? null;
}

export function calculateGeometricOverlap(
  trip: Trip,
  load: LoadRequest
): GeometricOverlapResult {
  const tripOrigin = trip.originCoords ?? getCoordinates(trip.from);
  const tripDest = trip.destinationCoords ?? getCoordinates(trip.to);
  const loadOrigin = load.originCoords ?? getCoordinates(load.from);
  const loadDest = load.destinationCoords ?? getCoordinates(load.to);

  if (!tripOrigin || !tripDest || !loadOrigin || !loadDest) {
    // Fallback: compare corridor strings
    if (trip.corridor && load.corridor && trip.corridor === load.corridor) {
      return { overlapRatio: 0.85, description: 'Same corridor match', detourKm: 0 };
    }
    const tFrom = (trip.from ?? '').toLowerCase();
    const tTo = (trip.to ?? '').toLowerCase();
    const lFrom = (load.from ?? '').toLowerCase();
    const lTo = (load.to ?? '').toLowerCase();
    if (lFrom && tFrom.includes(lFrom.split(' ')[0])) {
      return { overlapRatio: 0.7, description: 'Partial corridor match', detourKm: 15 };
    }
    if (lTo && tTo.includes(lTo.split(' ')[0])) {
      return { overlapRatio: 0.7, description: 'Partial corridor match', detourKm: 15 };
    }
    return { overlapRatio: 0, description: 'No route overlap', detourKm: 999 };
  }

  const refLat = tripOrigin.lat;
  const refLng = tripOrigin.lng;

  const tO = toLocalPlaneKm(tripOrigin.lat, tripOrigin.lng, refLat, refLng);
  const tD = toLocalPlaneKm(tripDest.lat, tripDest.lng, refLat, refLng);
  const lO = toLocalPlaneKm(loadOrigin.lat, loadOrigin.lng, refLat, refLng);
  const lD = toLocalPlaneKm(loadDest.lat, loadDest.lng, refLat, refLng);

  const tripLen = Math.sqrt(Math.pow(tD.x - tO.x, 2) + Math.pow(tD.y - tO.y, 2));
  if (tripLen < 1) return { overlapRatio: 0, description: 'Trip too short', detourKm: 0 };

  // Project load origin onto trip line
  const t1 = Math.max(0, Math.min(1,
    ((lO.x - tO.x) * (tD.x - tO.x) + (lO.y - tO.y) * (tD.y - tO.y)) / (tripLen * tripLen)
  ));
  const proj1 = { x: tO.x + t1 * (tD.x - tO.x), y: tO.y + t1 * (tD.y - tO.y) };
  const dist1 = Math.sqrt(Math.pow(lO.x - proj1.x, 2) + Math.pow(lO.y - proj1.y, 2));

  // Project load dest onto trip line
  const t2 = Math.max(0, Math.min(1,
    ((lD.x - tO.x) * (tD.x - tO.x) + (lD.y - tO.y) * (tD.y - tO.y)) / (tripLen * tripLen)
  ));
  const proj2 = { x: tO.x + t2 * (tD.x - tO.x), y: tO.y + t2 * (tD.y - tO.y) };
  const dist2 = Math.sqrt(Math.pow(lD.x - proj2.x, 2) + Math.pow(lD.y - proj2.y, 2));

  const avgDetour = (dist1 + dist2) / 2;
  const detourKm = avgDetour;
  const overlapSpan = Math.abs(t2 - t1);

  let overlapRatio = overlapSpan * Math.max(0, 1 - detourKm / 80);
  overlapRatio = Math.max(0, Math.min(1, overlapRatio));

  let description = '';
  if (overlapRatio >= 0.8) description = `Direct corridor alignment — ${Math.round(detourKm)} km detour`;
  else if (overlapRatio >= 0.5) description = `Good route overlap with ~${Math.round(detourKm)} km detour`;
  else if (overlapRatio >= 0.2) description = `Partial overlap, ${Math.round(detourKm)} km off-corridor`;
  else description = 'Minimal route overlap';

  return { overlapRatio, description, detourKm };
}

export function calculateMatchScore(trip: Trip, load: LoadRequest): MatchResult {
  const overlap = calculateGeometricOverlap(trip, load);

  if (overlap.overlapRatio === 0) {
    return {
      id: `match-${trip.id}-${load.id}`,
      trip, load,
      matchScore: 0, routeOverlapScore: 0, capacityScore: 0,
      timeWindowScore: 0, priceScore: 0,
      calculatedPrice: 0, marketPrice: 0, savingsPercentage: 0,
      co2SavedKg: 0, explanation: 'No route overlap between driver corridor and shipper request.'
    };
  }

  // 1. Route overlap (0-35)
  const routeOverlapScore = Math.round(overlap.overlapRatio * 35);

  // 2. Capacity (0-25)
  const weightKg = load.weightUnit === 'CBM' ? load.weight * 250 : load.weight;
  const spareKg = trip.totalCapacityKg - trip.bookedCapacityKg;
  let capacityScore = 0;
  if (weightKg <= spareKg) {
    const utilization = weightKg / trip.totalCapacityKg;
    if (utilization >= 0.7) capacityScore = 25;
    else if (utilization >= 0.3) capacityScore = 20;
    else capacityScore = 15;
  } else {
    capacityScore = 5;
  }

  // 3. Time window (0-20)
  let timeWindowScore = 10;
  if (trip.departureDate === load.date) timeWindowScore = 20;
  else {
    const tripDate = new Date(trip.departureDate).getTime();
    const loadDate = new Date(load.date).getTime();
    const diffDays = Math.abs(tripDate - loadDate) / 86400000;
    if (diffDays <= 1) timeWindowScore = 15;
    else if (diffDays <= 3) timeWindowScore = 10;
    else timeWindowScore = 5;
  }

  // 4. Price (0-10)
  const route = calculateDistanceAndDuration(load.from, load.to);
  const pricing = calculateBackhaulPricing({
    distanceKm: route.distanceKm,
    weightKg,
    vehicleType: trip.vehicleType,
    corridorId: trip.corridor,
    isReturnTrip: true,
    retailerBudget: load.budget,
  });
  let priceScore = 0;
  if (load.budget >= pricing.driverPayout) priceScore = 10;
  else if (load.budget >= pricing.driverPayout * 0.85) priceScore = 8;
  else priceScore = 4;

  // 5. CO2 (static 9 for valid matches)
  const co2Score = 9;

  const matchScore = Math.min(100, routeOverlapScore + capacityScore + timeWindowScore + priceScore + co2Score);
  const co2SavedKg = Math.round((weightKg / 1000) * route.distanceKm * 0.0811);

  const explanation = `${overlap.description}. Payload utilization: ${Math.round((weightKg / trip.totalCapacityKg) * 100)}%. ${trip.departureDate === load.date ? 'Same-day departure.' : 'Schedule aligned within window.'} Backhaul saves ${pricing.savingsPercentage}% vs spot rate.`;

  return {
    id: `match-${trip.id}-${load.id}`,
    trip, load,
    matchScore,
    routeOverlapScore,
    capacityScore,
    timeWindowScore,
    priceScore,
    calculatedPrice: pricing.retailerBudget,
    marketPrice: pricing.marketPrice,
    savingsPercentage: pricing.savingsPercentage,
    co2SavedKg,
    explanation,
  };
}

export function getCandidateMatchesForLoad(trips: Trip[], load: LoadRequest): MatchResult[] {
  const weightKg = load.weightUnit === 'CBM' ? load.weight * 250 : load.weight;
  const candidates = trips.filter(t => {
    if (t.status !== 'active') return false;
    const spare = t.totalCapacityKg - t.bookedCapacityKg;
    if (spare < weightKg * 0.5) return false;
    return true;
  });

  const scored = candidates
    .map(trip => calculateMatchScore(trip, load))
    .filter(m => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}
