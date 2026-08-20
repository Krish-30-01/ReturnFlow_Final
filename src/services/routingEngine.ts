export interface CorridorInfo {
  id: string;
  name: string;
  highway: string;
  distanceKm: number;
  durationMin: number;
  emptyReturnRate: number;
  cities: { name: string; lat: number; lng: number }[];
}

export const CORRIDORS: Record<string, CorridorInfo> = {
  'HYD-WAR': {
    id: 'HYD-WAR',
    name: 'Hyderabad — Warangal Corridor',
    highway: 'NH163',
    distanceKm: 148,
    durationMin: 180,
    emptyReturnRate: 0.44,
    cities: [
      { name: 'Hyderabad (Uppal Hub)', lat: 17.3984, lng: 78.5583 },
      { name: 'Bhongir', lat: 17.5108, lng: 78.8891 },
      { name: 'Jangaon', lat: 17.7277, lng: 79.1558 },
      { name: 'Kazipet Junction', lat: 17.9784, lng: 79.5255 },
      { name: 'Warangal Industrial Area', lat: 17.9689, lng: 79.5941 }
    ]
  },
  'HYD-BLR': {
    id: 'HYD-BLR',
    name: 'Hyderabad — Bangalore Corridor',
    highway: 'NH44',
    distanceKm: 569,
    durationMin: 540,
    emptyReturnRate: 0.38,
    cities: [
      { name: 'Hyderabad (Shamshabad)', lat: 17.2403, lng: 78.4294 },
      { name: 'Jadcherla', lat: 16.7663, lng: 78.1408 },
      { name: 'Kurnool Tollway', lat: 15.8281, lng: 78.0373 },
      { name: 'Anantapur Hub', lat: 14.6819, lng: 77.6006 },
      { name: 'Chikkaballapur', lat: 13.4325, lng: 77.7275 },
      { name: 'Bangalore (Peenya)', lat: 12.9716, lng: 77.5946 }
    ]
  },
  'DEL-BLR': {
    id: 'DEL-BLR',
    name: 'Delhi — Bangalore Grand Corridor',
    highway: 'NH44',
    distanceKm: 2150,
    durationMin: 2160,
    emptyReturnRate: 0.46,
    cities: [
      { name: 'Delhi NCR (Kundli)', lat: 28.7041, lng: 77.1025 },
      { name: 'Agra', lat: 27.1767, lng: 78.0081 },
      { name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
      { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 }
    ]
  },
  'MUM-PUN': {
    id: 'MUM-PUN',
    name: 'Mumbai — Pune Expressway',
    highway: 'NH48',
    distanceKm: 230,
    durationMin: 240,
    emptyReturnRate: 0.35,
    cities: [
      { name: 'Mumbai (JNPT)', lat: 18.9498, lng: 72.9515 },
      { name: 'Panvel', lat: 18.9894, lng: 73.1175 },
      { name: 'Lonavala', lat: 18.7557, lng: 73.4091 },
      { name: 'Pune (Chakan)', lat: 18.7583, lng: 73.8567 }
    ]
  },
  'VIJ-HYD': {
    id: 'VIJ-HYD',
    name: 'Vijayawada — Hyderabad Corridor',
    highway: 'NH65',
    distanceKm: 275,
    durationMin: 300,
    emptyReturnRate: 0.40,
    cities: [
      { name: 'Vijayawada Auto Nagar', lat: 16.5062, lng: 80.6480 },
      { name: 'Nandigama', lat: 16.7725, lng: 80.2925 },
      { name: 'Suryapet Hub', lat: 17.1439, lng: 79.6239 },
      { name: 'Nalgonda Bypass', lat: 17.0577, lng: 79.2684 },
      { name: 'Hyderabad (L.B. Nagar)', lat: 17.3512, lng: 78.5522 }
    ]
  }
};

const CITY_KEYWORD_MAP: { keyword: string; corridors: string[]; coords: { lat: number; lng: number } }[] = [
  { keyword: 'warangal', corridors: ['HYD-WAR'], coords: { lat: 17.9689, lng: 79.5941 } },
  { keyword: 'kazipet', corridors: ['HYD-WAR'], coords: { lat: 17.9784, lng: 79.5255 } },
  { keyword: 'jangaon', corridors: ['HYD-WAR'], coords: { lat: 17.7277, lng: 79.1558 } },
  { keyword: 'bhongir', corridors: ['HYD-WAR'], coords: { lat: 17.5108, lng: 78.8891 } },
  { keyword: 'bangalore', corridors: ['HYD-BLR', 'DEL-BLR'], coords: { lat: 12.9716, lng: 77.5946 } },
  { keyword: 'bengaluru', corridors: ['HYD-BLR', 'DEL-BLR'], coords: { lat: 12.9716, lng: 77.5946 } },
  { keyword: 'peenya', corridors: ['HYD-BLR'], coords: { lat: 13.0312, lng: 77.5186 } },
  { keyword: 'electronic city', corridors: ['HYD-BLR'], coords: { lat: 12.8399, lng: 77.6770 } },
  { keyword: 'kurnool', corridors: ['HYD-BLR'], coords: { lat: 15.8281, lng: 78.0373 } },
  { keyword: 'anantapur', corridors: ['HYD-BLR'], coords: { lat: 14.6819, lng: 77.6006 } },
  { keyword: 'delhi', corridors: ['DEL-BLR'], coords: { lat: 28.7041, lng: 77.1025 } },
  { keyword: 'kundli', corridors: ['DEL-BLR'], coords: { lat: 28.8741, lng: 77.1215 } },
  { keyword: 'agra', corridors: ['DEL-BLR'], coords: { lat: 27.1767, lng: 78.0081 } },
  { keyword: 'gwalior', corridors: ['DEL-BLR'], coords: { lat: 26.2183, lng: 78.1828 } },
  { keyword: 'nagpur', corridors: ['DEL-BLR'], coords: { lat: 21.1458, lng: 79.0882 } },
  { keyword: 'mumbai', corridors: ['MUM-PUN'], coords: { lat: 18.9498, lng: 72.9515 } },
  { keyword: 'jnpt', corridors: ['MUM-PUN'], coords: { lat: 18.9498, lng: 72.9515 } },
  { keyword: 'pune', corridors: ['MUM-PUN'], coords: { lat: 18.7583, lng: 73.8567 } },
  { keyword: 'chakan', corridors: ['MUM-PUN'], coords: { lat: 18.7583, lng: 73.8567 } },
  { keyword: 'vijayawada', corridors: ['VIJ-HYD'], coords: { lat: 16.5062, lng: 80.6480 } },
  { keyword: 'hyderabad', corridors: ['HYD-WAR', 'HYD-BLR', 'VIJ-HYD', 'DEL-BLR'], coords: { lat: 17.3850, lng: 78.4867 } },
  { keyword: 'shamshabad', corridors: ['HYD-BLR'], coords: { lat: 17.2403, lng: 78.4294 } },
  { keyword: 'uppal', corridors: ['HYD-WAR'], coords: { lat: 17.3984, lng: 78.5583 } },
  { keyword: 'l.b. nagar', corridors: ['VIJ-HYD'], coords: { lat: 17.3512, lng: 78.5522 } }
];

export function detectCorridor(from: string, to: string): string {
  const normFrom = from.toLowerCase();
  const normTo = to.toLowerCase();

  const fromCorridors = new Set<string>();
  const toCorridors = new Set<string>();

  for (const entry of CITY_KEYWORD_MAP) {
    if (normFrom.includes(entry.keyword)) {
      entry.corridors.forEach((c) => fromCorridors.add(c));
    }
    if (normTo.includes(entry.keyword)) {
      entry.corridors.forEach((c) => toCorridors.add(c));
    }
  }

  const intersection = [...fromCorridors].filter((c) => toCorridors.has(c));
  if (intersection.length === 1) return intersection[0];
  if (intersection.length > 1) {
    const direct = intersection.filter((c) => CORRIDORS[c] && CORRIDORS[c].distanceKm < 1000);
    return direct.length > 0 ? direct[0] : intersection[0];
  }
  return 'HYD-BLR';
}

export function geocodeLocation(name: string): { lat: number; lng: number } {
  const norm = name.toLowerCase();
  for (const entry of CITY_KEYWORD_MAP) {
    if (norm.includes(entry.keyword)) {
      return entry.coords;
    }
  }
  return { lat: 17.3850, lng: 78.4867 };
}

export function calculateDistanceAndDuration(from: string, to: string, corridorId?: string) {
  const corridorKey = corridorId || detectCorridor(from, to);
  const corridor = CORRIDORS[corridorKey];
  if (corridor) {
    return {
      corridorId: corridorKey,
      distanceKm: corridor.distanceKm,
      durationMin: corridor.durationMin,
      originCoords: geocodeLocation(from),
      destinationCoords: geocodeLocation(to)
    };
  }

  return {
    corridorId: 'HYD-BLR',
    distanceKm: 569,
    durationMin: 540,
    originCoords: geocodeLocation(from),
    destinationCoords: geocodeLocation(to)
  };
}
