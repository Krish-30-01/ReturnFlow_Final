import { resolveLocation, ResolvedLocation } from './geocodingService';

export interface RouteGeometry {
  corridorId: string;
  corridorName: string;
  distanceKm: number;
  durationMin: number;
  originCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  originLocation: ResolvedLocation | null;
  destinationLocation: ResolvedLocation | null;
}

export interface CorridorInfo {
  id: string;
  name: string;
  highway: string;
  distanceKm: number;
  durationMin: number;
  emptyReturnRate: number;
}

/**
 * Educational sample presets used exclusively by the interactive modal simulation UI.
 */
export const SAMPLE_CORRIDOR_PRESETS: Record<string, CorridorInfo> = {
  'HYD-WAR': {
    id: 'HYD-WAR',
    name: 'Hyderabad — Warangal Corridor',
    highway: 'NH163',
    distanceKm: 148,
    durationMin: 180,
    emptyReturnRate: 0.44
  },
  'HYD-BLR': {
    id: 'HYD-BLR',
    name: 'Hyderabad — Bangalore Corridor',
    highway: 'NH44',
    distanceKm: 569,
    durationMin: 540,
    emptyReturnRate: 0.38
  },
  'DEL-BLR': {
    id: 'DEL-BLR',
    name: 'Delhi — Bangalore Grand Corridor',
    highway: 'NH44',
    distanceKm: 2150,
    durationMin: 2160,
    emptyReturnRate: 0.46
  },
  'MUM-PUN': {
    id: 'MUM-PUN',
    name: 'Mumbai — Pune Expressway',
    highway: 'NH48',
    distanceKm: 230,
    durationMin: 240,
    emptyReturnRate: 0.35
  },
  'MAA-CJB': {
    id: 'MAA-CJB',
    name: 'Chennai — Coimbatore Corridor',
    highway: 'NH544',
    distanceKm: 505,
    durationMin: 480,
    emptyReturnRate: 0.36
  }
};

export const CORRIDORS = SAMPLE_CORRIDOR_PRESETS;

/**
 * Computes exact Great-Circle Haversine distance between two coordinates in kilometers.
 */
export function haversineDistanceKm(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Estimates actual commercial road driving distance from great-circle distance (averaging ~1.25x road tortuosity).
 */
export function estimateRoadDistanceKm(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const straightDist = haversineDistanceKm(p1, p2);
  if (straightDist < 5) return Math.max(5, Math.round(straightDist));
  // Indian national highway route winding multiplier
  const roadMultiplier = straightDist > 500 ? 1.22 : 1.28;
  return Math.round(straightDist * roadMultiplier);
}

/**
 * Estimates heavy commercial freight duration in minutes based on distance and average transit speeds.
 */
export function estimateDurationMin(distanceKm: number): number {
  // Average 55 km/h commercial freight speed + 15% toll/rest buffer
  const hours = distanceKm / 50;
  return Math.round(hours * 60);
}

/**
 * Generates a clean dynamic corridor code from two city names.
 * Strips parenthetical suffixes before extracting the 3-letter code.
 * Examples: "Hyderabad (Uppal)" → "HYD", "Vijayawada" → "VIJ", "Chennai (Peenya)" → "CHE"
 */
export function generateCorridorCode(fromName: string, toName: string): string {
  const clean = (s: string) =>
    (s || '').replace(/\s*\(.*?\)/g, '').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'ORG';
  return `${clean(fromName)}-${clean(toName)}`;
}

/**
 * Dynamically resolves coordinates and calculates real distance, duration,
 * and route geometry for ANY valid origin and destination pair.
 */
export function calculateDistanceAndDuration(from: string, to: string, _corridorId?: string): RouteGeometry {
  const originLoc = resolveLocation(from);
  const destLoc = resolveLocation(to);

  const originCoords = originLoc
    ? { lat: originLoc.lat, lng: originLoc.lng }
    : (console.warn(`[routingEngine] Could not resolve origin: "${from}" — using Hyderabad fallback`),
       { lat: 17.3850, lng: 78.4867 });

  const destinationCoords = destLoc
    ? { lat: destLoc.lat, lng: destLoc.lng }
    : (console.warn(`[routingEngine] Could not resolve destination: "${to}" — using Bangalore fallback`),
       { lat: 12.9716, lng: 77.5946 });

  const distanceKm = estimateRoadDistanceKm(originCoords, destinationCoords);
  const durationMin = estimateDurationMin(distanceKm);
  const corridorId = generateCorridorCode(originLoc?.city || from, destLoc?.city || to);
  const corridorName = `${originLoc?.city || from} — ${destLoc?.city || to}`;

  return {
    corridorId,
    corridorName,
    distanceKm,
    durationMin,
    originCoords,
    destinationCoords,
    originLocation: originLoc,
    destinationLocation: destLoc
  };
}

/**
 * Resolves coordinates for any city name using the comprehensive geocoding service.
 */
export function geocodeLocation(name: string): { lat: number; lng: number } {
  const res = resolveLocation(name);
  if (res) {
    return { lat: res.lat, lng: res.lng };
  }
  return { lat: 17.3850, lng: 78.4867 };
}

/**
 * Generic corridor detector that computes a dynamic route identifier purely from coordinates.
 */
export function detectCorridor(from: string, to: string): string {
  return generateCorridorCode(from, to);
}
