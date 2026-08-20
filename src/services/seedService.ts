import { CanonicalShipment } from '../types/logistics';
import { calculateDistanceAndDuration } from './routingEngine';
import { calculateDeterministicPrice } from './pricingEngine';

export const INITIAL_CANONICAL_SHIPMENTS: CanonicalShipment[] = [
  // Driver Return Trip 1
  {
    id: 'shipment-101',
    requestType: 'DRIVER_RETURN_TRIP',
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverAvatarText: 'RK',
    driverPhone: '+91 98490 23145',
    vehicleType: 'TATA 407 (4-Ton Commercial)',
    vehiclePlate: 'TS-09-UB-4421',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    corridor: 'HYD-WAR',
    routeDistanceKm: 148,
    routeDurationMin: 180,
    departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departureTimeWindow: '06:00 AM – 10:00 AM',
    totalCapacityKg: 4000,
    availableCapacityKg: 3650,
    weightKg: 350,
    goodsType: 'FMCG & General Goods',
    requestedPrice: 2200,
    systemRecommendedPrice: 2150,
    platformFee: 65,
    insuranceFee: 150,
    escrowStatus: 'Unfunded',
    isReturnTrip: true,
    status: 'Searching',
    createdAt: 'Today, 08:30 AM',
    updatedAt: 'Today, 08:30 AM'
  },
  // Driver Return Trip 2
  {
    id: 'shipment-102',
    requestType: 'DRIVER_RETURN_TRIP',
    driverId: 'drv-rajesh',
    driverName: 'Rajesh Kumar',
    driverRating: 4.9,
    driverAvatarText: 'RK',
    driverPhone: '+91 98490 23145',
    vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehiclePlate: 'TS-07-EA-9912',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    corridor: 'HYD-BLR',
    routeDistanceKm: 569,
    routeDurationMin: 540,
    departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    departureTimeWindow: '04:00 AM – 08:00 AM',
    totalCapacityKg: 15000,
    availableCapacityKg: 6500,
    weightKg: 8500,
    goodsType: 'Industrial & Electronics',
    requestedPrice: 18500,
    systemRecommendedPrice: 18200,
    platformFee: 546,
    insuranceFee: 150,
    escrowStatus: 'Unfunded',
    isReturnTrip: true,
    status: 'Searching',
    createdAt: 'Yesterday',
    updatedAt: 'Yesterday'
  },
  // Retailer Load Request 1
  {
    id: 'shipment-201',
    requestType: 'RETAILER_LOAD_REQUEST',
    retailerId: 'cust-priya',
    retailerName: 'Priya Sharma',
    retailerCompany: 'Apex Retail Networks Pvt Ltd',
    retailerPhone: '+91 94401 55678',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    corridor: 'HYD-WAR',
    routeDistanceKm: 148,
    routeDurationMin: 180,
    departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departureTimeWindow: 'Morning (07:00 AM – 11:00 AM)',
    totalCapacityKg: 0,
    availableCapacityKg: 0,
    weightKg: 400,
    goodsType: 'Furniture & Display Fixtures',
    specialInstructions: 'Handle with care, bubble wrapped display counters for retail store opening.',
    requestedPrice: 2500,
    systemRecommendedPrice: 2150,
    platformFee: 65,
    insuranceFee: 150,
    escrowStatus: 'Unfunded',
    isReturnTrip: false,
    status: 'Searching',
    createdAt: '10 minutes ago',
    updatedAt: '10 minutes ago'
  },
  // Retailer Load Request 2
  {
    id: 'shipment-202',
    requestType: 'RETAILER_LOAD_REQUEST',
    retailerId: 'cust-priya',
    retailerName: 'Priya Sharma',
    retailerCompany: 'Apex Retail Networks Pvt Ltd',
    retailerPhone: '+91 94401 55678',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    corridor: 'HYD-BLR',
    routeDistanceKm: 569,
    routeDurationMin: 540,
    departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    departureTimeWindow: 'Flexible',
    totalCapacityKg: 0,
    availableCapacityKg: 0,
    weightKg: 2500,
    goodsType: 'FMCG Packaged Goods',
    specialInstructions: 'Palletized cartons. Forklift available at Bangalore dock.',
    requestedPrice: 9500,
    systemRecommendedPrice: 9200,
    platformFee: 276,
    insuranceFee: 150,
    escrowStatus: 'Held in Escrow',
    isReturnTrip: false,
    status: 'Booked',
    matchedShipmentId: 'shipment-102',
    bookingId: 'book-301',
    createdAt: '2 hours ago',
    updatedAt: '2 hours ago'
  }
];

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
}): CanonicalShipment {
  const route = calculateDistanceAndDuration(input.from, input.to);
  const pricing = calculateDeterministicPrice({
    distanceKm: route.distanceKm,
    weightKg: input.weightKg,
    vehicleType: input.vehicleType,
    corridorId: route.corridorId,
    isReturnTrip: input.requestType === 'DRIVER_RETURN_TRIP'
  });

  const isDriver = input.requestType === 'DRIVER_RETURN_TRIP';

  return {
    id: `shipment-${Date.now()}`,
    requestType: input.requestType,
    driverId: isDriver ? 'drv-rajesh' : undefined,
    driverName: isDriver ? 'Rajesh Kumar' : undefined,
    driverRating: isDriver ? 4.9 : undefined,
    driverAvatarText: isDriver ? 'RK' : undefined,
    driverPhone: isDriver ? '+91 98490 23145' : undefined,
    vehicleType: input.vehicleType || 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehiclePlate: input.vehiclePlate || 'TS-07-EA-9912',
    retailerId: !isDriver ? 'cust-priya' : undefined,
    retailerName: !isDriver ? 'Priya Sharma' : undefined,
    retailerCompany: !isDriver ? 'Apex Retail Networks Pvt Ltd' : undefined,
    retailerPhone: !isDriver ? '+91 94401 55678' : undefined,
    from: input.from,
    to: input.to,
    corridor: route.corridorId,
    originCoords: route.originCoords,
    destinationCoords: route.destinationCoords,
    routeDistanceKm: route.distanceKm,
    routeDurationMin: route.durationMin,
    departureDate: input.departureDate,
    departureTimeWindow: input.departureTimeWindow,
    totalCapacityKg: input.totalCapacityKg || (isDriver ? 12000 : 0),
    availableCapacityKg: input.totalCapacityKg || (isDriver ? 12000 : 0),
    weightKg: input.weightKg,
    goodsType: input.goodsType,
    specialInstructions: input.notes,
    requestedPrice: input.requestedPrice,
    systemRecommendedPrice: pricing.systemRecommendedPrice,
    platformFee: pricing.platformFee,
    insuranceFee: pricing.insuranceFee,
    escrowStatus: 'Unfunded',
    isReturnTrip: isDriver,
    status: 'Searching',
    createdAt: 'Just now',
    updatedAt: 'Just now'
  };
}
