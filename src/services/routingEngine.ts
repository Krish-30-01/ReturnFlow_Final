export interface RouteGeometry {
  distanceKm: number;
  durationMin: number;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  corridorId: string;
  corridorName: string;
}

export interface CorridorInfo {
  name: string;
  highway: string;
  distanceKm: number;
  emptyReturnRate: number;
  waypoints: [number, number][];
}

export const CORRIDORS: Record<string, CorridorInfo> = {
  'HYD-BLR': {
    name: 'Hyderabad to Bangalore',
    highway: 'NH44',
    distanceKm: 569,
    emptyReturnRate: 0.42,
    waypoints: [
      [17.385, 78.4867], [16.7663, 78.1408], [15.8281, 78.0373],
      [14.6819, 77.6006], [13.4325, 77.7275], [12.9716, 77.5946]
    ]
  },
  'HYD-WAR': {
    name: 'Hyderabad to Warangal',
    highway: 'NH163',
    distanceKm: 148,
    emptyReturnRate: 0.38,
    waypoints: [
      [17.385, 78.4867], [17.5108, 78.8891], [17.7277, 79.1558], [17.9689, 79.5941]
    ]
  },
  'HYD-MUM': {
    name: 'Hyderabad to Mumbai',
    highway: 'NH65',
    distanceKm: 711,
    emptyReturnRate: 0.44,
    waypoints: [
      [17.385, 78.4867], [18.0, 77.5], [18.5, 76.5], [19.076, 72.8777]
    ]
  },
  'DEL-MUM': {
    name: 'Delhi to Mumbai',
    highway: 'NH48',
    distanceKm: 1421,
    emptyReturnRate: 0.40,
    waypoints: [
      [28.6139, 77.209], [26.9124, 75.7873], [25.2138, 75.8648],
      [23.1765, 75.7885], [22.7196, 75.8577], [21.1458, 79.0882],
      [20.0059, 76.8616], [19.076, 72.8777]
    ]
  },
  'DEL-CHE': {
    name: 'Delhi to Chennai',
    highway: 'NH44',
    distanceKm: 2180,
    emptyReturnRate: 0.45,
    waypoints: [
      [28.6139, 77.209], [27.1767, 78.0081], [26.4499, 80.3319],
      [23.1765, 75.7885], [17.385, 78.4867], [13.0827, 80.2707]
    ]
  },
  'CHE-BLR': {
    name: 'Chennai to Bangalore',
    highway: 'NH48',
    distanceKm: 346,
    emptyReturnRate: 0.36,
    waypoints: [
      [13.0827, 80.2707], [12.8231, 79.7], [12.9716, 77.5946]
    ]
  },
  'MUM-PUN': {
    name: 'Mumbai to Pune',
    highway: 'NH48',
    distanceKm: 149,
    emptyReturnRate: 0.35,
    waypoints: [
      [19.076, 72.8777], [18.9548, 73.1185], [18.5204, 73.8567]
    ]
  },
  'VIJ-HYD': {
    name: 'Vijayawada to Hyderabad',
    highway: 'NH16',
    distanceKm: 280,
    emptyReturnRate: 0.39,
    waypoints: [
      [16.5062, 80.648], [16.9, 79.7], [17.385, 78.4867]
    ]
  },
  'HYD-NAG': {
    name: 'Hyderabad to Nagpur',
    highway: 'NH44',
    distanceKm: 498,
    emptyReturnRate: 0.41,
    waypoints: [
      [17.385, 78.4867], [18.0, 79.5], [19.5, 79.3], [21.1458, 79.0882]
    ]
  },
  'BLR-CHE': {
    name: 'Bangalore to Chennai',
    highway: 'NH48',
    distanceKm: 346,
    emptyReturnRate: 0.36,
    waypoints: [
      [12.9716, 77.5946], [12.8231, 79.7], [13.0827, 80.2707]
    ]
  },
  'DEL-JAI': {
    name: 'Delhi to Jaipur',
    highway: 'NH48',
    distanceKm: 282,
    emptyReturnRate: 0.38,
    waypoints: [
      [28.6139, 77.209], [28.2, 76.9], [26.9124, 75.7873]
    ]
  },
  'MUM-NAG': {
    name: 'Mumbai to Nagpur',
    highway: 'NH6',
    distanceKm: 836,
    emptyReturnRate: 0.43,
    waypoints: [
      [19.076, 72.8777], [19.9975, 73.7898], [20.5431, 75.3433], [21.1458, 79.0882]
    ]
  }
};

const CITY_CORRIDOR_MAP: Record<string, string[]> = {
  hyderabad: ['HYD-BLR', 'HYD-WAR', 'HYD-MUM', 'VIJ-HYD', 'HYD-NAG'],
  bangalore: ['HYD-BLR', 'CHE-BLR', 'BLR-CHE'],
  bengaluru: ['HYD-BLR', 'CHE-BLR', 'BLR-CHE'],
  warangal: ['HYD-WAR'],
  mumbai: ['HYD-MUM', 'DEL-MUM', 'MUM-PUN', 'MUM-NAG'],
  delhi: ['DEL-MUM', 'DEL-CHE', 'DEL-JAI'],
  chennai: ['DEL-CHE', 'CHE-BLR', 'BLR-CHE'],
  pune: ['MUM-PUN'],
  vijayawada: ['VIJ-HYD'],
  nagpur: ['HYD-NAG', 'MUM-NAG'],
  jaipur: ['DEL-JAI'],
};

export function haversineDistanceKm(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
    Math.cos((coord2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateRoadDistanceKm(straightLineKm: number): number {
  return Math.round(straightLineKm * 1.25);
}

export function estimateDurationMin(distanceKm: number): number {
  const avgSpeedKmh = distanceKm > 500 ? 55 : distanceKm > 200 ? 50 : 45;
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

function normalizeCity(name: string): string {
  return name.toLowerCase().replace(/\s*\(.*?\)/g, '').trim().split(' ')[0];
}

export function generateCorridorCode(from: string, to: string): string {
  const fromKey = normalizeCity(from);
  const toKey = normalizeCity(to);

  const fromCorridors = CITY_CORRIDOR_MAP[fromKey] ?? [];
  const toCorridors = CITY_CORRIDOR_MAP[toKey] ?? [];

  for (const c of fromCorridors) {
    if (toCorridors.includes(c)) return c;
  }

  // Build a new corridor code from city initials
  const fromInitials = fromKey.slice(0, 3).toUpperCase();
  const toInitials = toKey.slice(0, 3).toUpperCase();
  return `${fromInitials}-${toInitials}`;
}

// Quick city coordinate lookup
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  hyderabad: { lat: 17.385, lng: 78.4867 },
  shamshabad: { lat: 17.2403, lng: 78.4294 },
  uppal: { lat: 17.3984, lng: 78.5583 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  peenya: { lat: 13.0312, lng: 77.5186 },
  warangal: { lat: 17.9689, lng: 79.5941 },
  hanamkonda: { lat: 17.9784, lng: 79.5255 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  pune: { lat: 18.5204, lng: 73.8567 },
  vijayawada: { lat: 16.5062, lng: 80.648 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  vizag: { lat: 17.6868, lng: 83.2185 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  kurnool: { lat: 15.8281, lng: 78.0373 },
  anantapur: { lat: 14.6819, lng: 77.6006 },
  jadcherla: { lat: 16.7663, lng: 78.1408 },
};

function getCityCoords(cityName: string): { lat: number; lng: number } | null {
  const key = normalizeCity(cityName);
  return CITY_COORDS[key] ?? null;
}

export function calculateDistanceAndDuration(
  from: string,
  to: string,
  corridorId?: string
): RouteGeometry {
  const corridorKey = corridorId ?? generateCorridorCode(from, to);
  const corridor = CORRIDORS[corridorKey];

  const originCoords = getCityCoords(from);
  const destinationCoords = getCityCoords(to);

  if (corridor) {
    return {
      distanceKm: corridor.distanceKm,
      durationMin: estimateDurationMin(corridor.distanceKm),
      originCoords: originCoords ?? undefined,
      destinationCoords: destinationCoords ?? undefined,
      corridorId: corridorKey,
      corridorName: corridor.name,
    };
  }

  // Fallback: haversine
  if (originCoords && destinationCoords) {
    const straight = haversineDistanceKm(originCoords, destinationCoords);
    const road = estimateRoadDistanceKm(straight);
    return {
      distanceKm: road,
      durationMin: estimateDurationMin(road),
      originCoords,
      destinationCoords,
      corridorId: corridorKey,
      corridorName: `${from.split('(')[0].trim()} → ${to.split('(')[0].trim()}`,
    };
  }

  // Last fallback
  return {
    distanceKm: 300,
    durationMin: 360,
    originCoords: originCoords ?? undefined,
    destinationCoords: destinationCoords ?? undefined,
    corridorId: corridorKey,
    corridorName: `${from} → ${to}`,
  };
}
