import { CanonicalShipment, Trip, LoadRequest, Booking, EarningsRecord } from '../types/logistics';
import { calculateDistanceAndDuration } from './routingEngine';
import { calculateBackhaulPricing } from './pricingEngine';

export function createCanonicalShipment(input: {
  requestType: 'DRIVER_RETURN_TRIP' | 'RETAILER_LOAD_REQUEST';
  from: string;
  to: string;
  departureDate: string;
  departureTimeWindow: string;
  vehicleType?: string;
  vehiclePlate?: string;
  totalCapacityKg?: number;
  weightKg: number;
  goodsType: string;
  requestedPrice: number;
  notes?: string;
  driverId?: string;
  driverName?: string;
  retailerId?: string;
  retailerName?: string;
  retailerCompany?: string;
}): CanonicalShipment {
  const route = calculateDistanceAndDuration(input.from, input.to);
  const pricing = calculateBackhaulPricing({
    distanceKm: route.distanceKm,
    weightKg: input.weightKg,
    vehicleType: input.vehicleType,
    corridorId: route.corridorId,
    isReturnTrip: true,
  });

  const now = new Date().toISOString();
  return {
    id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    requestType: input.requestType,
    driverId: input.driverId,
    driverName: input.driverName,
    vehicleType: input.vehicleType,
    vehiclePlate: input.vehiclePlate,
    retailerId: input.retailerId,
    retailerName: input.retailerName,
    retailerCompany: input.retailerCompany,
    from: input.from,
    to: input.to,
    corridor: route.corridorId,
    originCoords: route.originCoords,
    destinationCoords: route.destinationCoords,
    routeDistanceKm: route.distanceKm,
    routeDurationMin: route.durationMin,
    departureDate: input.departureDate,
    departureTimeWindow: input.departureTimeWindow,
    totalCapacityKg: input.totalCapacityKg ?? input.weightKg,
    availableCapacityKg: input.totalCapacityKg ?? input.weightKg,
    weightKg: input.weightKg,
    goodsType: input.goodsType,
    specialInstructions: input.notes,
    requestedPrice: input.requestedPrice,
    systemRecommendedPrice: pricing.driverPayout,
    platformFee: pricing.platformFee,
    insuranceFee: pricing.insuranceFee,
    escrowStatus: 'Unfunded',
    isReturnTrip: true,
    status: 'Searching',
    createdAt: now,
    updatedAt: now,
  };
}

const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

export const SEED_TRIPS: Trip[] = [
  {
    id: 'trip-101',
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
    departureDate: tomorrow,
    departureTimeWindow: '06:00 AM – 10:00 AM',
    totalCapacityKg: 4000,
    bookedCapacityKg: 400,
    preferredLoadType: 'FMCG & General Goods',
    minPrice: 920,
    isReturnTrip: true,
    status: 'active',
    notes: 'Returning from Uppal warehouse delivery. Flatbed with waterproof tarpaulin ready.',
    bookedLoads: []
  },
  {
    id: 'trip-102',
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
    departureDate: dayAfter,
    departureTimeWindow: '04:00 AM – 08:00 AM',
    totalCapacityKg: 15000,
    bookedCapacityKg: 2500,
    preferredLoadType: 'FMCG & General Goods',
    minPrice: 5200,
    isReturnTrip: true,
    status: 'active',
    notes: 'Scheduled backhaul return to Bangalore depot. GPS verified, dual drivers.',
    bookedLoads: []
  }
];

export const SEED_LOADS: LoadRequest[] = [
  {
    id: 'load-201',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks Pvt Ltd',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    originCoords: { lat: 17.3984, lng: 78.5583 },
    destinationCoords: { lat: 17.9689, lng: 79.5941 },
    corridor: 'HYD-WAR',
    date: tomorrow,
    timeWindow: 'Morning (07:00 AM – 11:00 AM)',
    weight: 400,
    weightUnit: 'Kg',
    goodsType: 'Furniture & Display Fixtures',
    budget: 1000,
    specialInstructions: 'Handle with care, bubble wrapped display counters for retail store opening.',
    status: 'Pending Driver Acceptance',
    matchedTripId: 'trip-101',
    bookingId: 'book-302',
    createdAt: 'Recently'
  },
  {
    id: 'load-202',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks Pvt Ltd',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    originCoords: { lat: 17.2403, lng: 78.4294 },
    destinationCoords: { lat: 13.0312, lng: 77.5186 },
    corridor: 'HYD-BLR',
    date: dayAfter,
    timeWindow: 'Flexible',
    weight: 2500,
    weightUnit: 'Kg',
    goodsType: 'FMCG Packaged Goods',
    budget: 5652,
    specialInstructions: 'Palletized cartons. Forklift available at Bangalore dock.',
    status: 'Booked',
    matchedTripId: 'trip-102',
    bookingId: 'book-301',
    createdAt: 'Recently'
  }
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'book-302',
    tripId: 'trip-101',
    loadId: 'load-201',
    bookingDate: new Date().toISOString().split('T')[0],
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverPhone: '+91 98490 23145',
    driverAvatar: 'RK',
    vehicleType: 'TATA 407 (4-Ton Commercial)',
    vehiclePlate: 'TS-09-UB-4421',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks Pvt Ltd',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    corridor: 'HYD-WAR',
    goodsType: 'Furniture & Display Fixtures',
    weightKg: 400,
    specialInstructions: 'Handle with care, bubble wrapped display counters.',
    basePrice: 920,
    platformFee: 80,
    insuranceFee: 150,
    totalPrice: 1150,
    paymentMethod: 'UPI',
    escrowStatus: 'Unfunded',
    status: 'Pending Driver Acceptance',
    estimatedPickup: 'Tomorrow, 08:00 AM',
    estimatedDelivery: 'Tomorrow, 06:00 PM',
    telemetry: {
      currentLat: 17.3984,
      currentLng: 78.5583,
      currentSpeedKmh: 0,
      currentLocationName: 'Origin Depot — Pending Dispatch',
      nextStopName: 'En route to destination corridor',
      etaMinutes: 240,
      lastUpdated: 'Just now',
      progressPercent: 0,
      routeCoordinates: [
        [17.3984, 78.5583], [17.5108, 78.8891], [17.7277, 79.1558], [17.9689, 79.5941]
      ],
      checkpoints: [
        { name: 'Origin Warehouse (Pickup)', lat: 17.3984, lng: 78.5583, time: '08:00 AM', completed: false },
        { name: 'Corridor Checkpoint 1', lat: 17.5108, lng: 78.8891, time: '10:15 AM (Est.)', completed: false },
        { name: 'Midway Weighbridge', lat: 17.7277, lng: 79.1558, time: '01:00 PM (Est.)', completed: false },
        { name: 'Destination Drop Bay', lat: 17.9689, lng: 79.5941, time: '04:30 PM (Est.)', completed: false }
      ]
    }
  },
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
    basePrice: 5200,
    platformFee: 452,
    insuranceFee: 150,
    totalPrice: 5802,
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
      lastUpdated: 'Just now (Simulated)',
      progressPercent: 54,
      routeCoordinates: [
        [17.2403, 78.4294], [16.7663, 78.1408], [15.8281, 78.0373],
        [14.6819, 77.6006], [13.4325, 77.7275], [12.9716, 77.5946]
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

export const SEED_EARNINGS: EarningsRecord[] = [
  { id: 'earn-501', date: '18 Aug 2026', route: 'Warangal → Hyderabad (Backhaul)', corridor: 'HYD-WAR', loadsCount: 1, weightKg: 850, amount: 1450, escrowFeeDeducted: 36, status: 'Settled', payoutReference: 'UPI-RETURN-883912' },
  { id: 'earn-502', date: '14 Aug 2026', route: 'Bangalore → Hyderabad (Backhaul)', corridor: 'HYD-BLR', loadsCount: 2, weightKg: 2200, amount: 5800, escrowFeeDeducted: 145, status: 'Settled', payoutReference: 'UPI-RETURN-772190' },
  { id: 'earn-503', date: '09 Aug 2026', route: 'Vijayawada → Hyderabad (Backhaul)', corridor: 'VIJ-HYD', loadsCount: 1, weightKg: 1100, amount: 2200, escrowFeeDeducted: 55, status: 'Settled', payoutReference: 'UPI-RETURN-661023' },
  { id: 'earn-504', date: '04 Aug 2026', route: 'Anantapur → Bangalore (Backhaul)', corridor: 'HYD-BLR', loadsCount: 1, weightKg: 1800, amount: 3400, escrowFeeDeducted: 85, status: 'Settled', payoutReference: 'UPI-RETURN-550914' }
];

export const INITIAL_CANONICAL_SHIPMENTS: CanonicalShipment[] = SEED_TRIPS.map(t =>
  createCanonicalShipment({
    requestType: 'DRIVER_RETURN_TRIP',
    from: t.from, to: t.to,
    departureDate: t.departureDate,
    departureTimeWindow: t.departureTimeWindow,
    vehicleType: t.vehicleType,
    vehiclePlate: t.vehiclePlate,
    totalCapacityKg: t.totalCapacityKg,
    weightKg: t.totalCapacityKg,
    goodsType: t.preferredLoadType,
    requestedPrice: t.minPrice,
    driverId: t.driverId,
    driverName: t.driverName,
  })
);
