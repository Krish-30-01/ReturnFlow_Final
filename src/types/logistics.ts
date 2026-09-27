export type Persona = 'guest' | 'driver' | 'customer' | 'admin';

export type UserRole = 'driver' | 'customer';

export const BOOKING_STATUS = {
  SEARCHING: 'Searching',
  MATCHED: 'Matched',
  PENDING_DRIVER_ACCEPTANCE: 'Pending Driver Acceptance',
  AWAITING_PAYMENT: 'Awaiting Payment',
  BOOKED: 'Booked',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled'
} as const;

export type ShipmentStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export type PaymentMethod = 'UPI' | 'Card' | 'Wallet';

export interface LocationPoint {
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  hubName?: string;
}

export interface MatchBreakdown {
  routeScore: number;
  capacityScore: number;
  timeWindowScore: number;
  priceScore: number;
  co2SavingsScore: number;
}

export interface CanonicalShipment {
  id: string;
  requestType: 'DRIVER_RETURN_TRIP' | 'RETAILER_LOAD_REQUEST';

  driverId?: string;
  driverName?: string;
  driverRating?: number;
  driverAvatarText?: string;
  driverPhone?: string;
  vehicleType?: string;
  vehiclePlate?: string;

  retailerId?: string;
  retailerName?: string;
  retailerCompany?: string;
  retailerPhone?: string;

  from: string;
  to: string;
  corridor: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  routeDistanceKm: number;
  routeDurationMin: number;

  departureDate: string;
  departureTimeWindow: string;

  totalCapacityKg: number;
  availableCapacityKg: number;
  weightKg: number;
  weightUnit?: 'Kg' | 'CBM';
  goodsType: string;
  specialInstructions?: string;

  requestedPrice: number;
  systemRecommendedPrice: number;
  platformFee: number;
  insuranceFee: number;
  finalAgreedPrice?: number;
  escrowStatus: 'Unfunded' | 'Held in Escrow' | 'Settled to Driver' | 'Refunded';

  isReturnTrip: boolean;
  status: ShipmentStatus;
  matchedShipmentId?: string;
  bookingId?: string;
  matchScore?: number;
  matchBreakdown?: MatchBreakdown;

  createdAt: string;
  updatedAt: string;
}

export interface BookedLoadItem {
  id: string;
  from: string;
  to: string;
  weightKg: number;
  price: number;
  shipperName: string;
  goodsType: string;
  bookingTime: string;
}

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  driverAvatarText: string;
  driverPhone: string;
  vehicleType: string;
  vehiclePlate: string;
  from: string;
  to: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  corridor: string;
  departureDate: string;
  departureTimeWindow: string;
  totalCapacityKg: number;
  bookedCapacityKg: number;
  preferredLoadType: string;
  minPrice: number;
  notes?: string;
  isReturnTrip: boolean;
  status: 'active' | 'in_transit' | 'completed' | 'cancelled';
  bookedLoads: BookedLoadItem[];
}

export interface LoadRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  from: string;
  to: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  corridor: string;
  date: string;
  timeWindow: string;
  weight: number;
  weightUnit: 'Kg' | 'CBM';
  goodsType: string;
  budget: number;
  specialInstructions?: string;
  status: ShipmentStatus;
  matchedTripId?: string;
  bookingId?: string;
  createdAt: string;
}

export interface MatchResult {
  id: string;
  trip: Trip;
  load: LoadRequest;
  matchScore: number;
  routeOverlapScore: number;
  capacityScore: number;
  timeWindowScore: number;
  priceScore: number;
  calculatedPrice: number;
  marketPrice: number;
  savingsPercentage: number;
  co2SavedKg: number;
  explanation: string;
}

export type NewTripInput = Omit<
  Trip,
  'id' | 'driverId' | 'driverName' | 'driverRating' | 'driverAvatarText' | 'driverPhone' | 'bookedCapacityKg' | 'bookedLoads' | 'status' | 'isReturnTrip'
>;

export type NewLoadInput = Omit<
  LoadRequest,
  'id' | 'customerId' | 'customerName' | 'customerCompany' | 'customerPhone' | 'status' | 'createdAt'
>;

export interface Checkpoint {
  name: string;
  lat: number;
  lng: number;
  time: string;
  completed: boolean;
}

export interface BookingTelemetry {
  currentLat: number;
  currentLng: number;
  currentSpeedKmh: number;
  currentLocationName: string;
  nextStopName: string;
  etaMinutes: number;
  lastUpdated: string;
  progressPercent: number;
  routeCoordinates: [number, number][];
  checkpoints: Checkpoint[];
}

export interface Booking {
  id: string;
  tripId: string;
  loadId: string;
  bookingDate: string;

  driverId: string;
  driverName: string;
  driverRating: number;
  driverPhone: string;
  driverAvatar: string;
  vehicleType: string;
  vehiclePlate: string;

  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;

  from: string;
  to: string;
  corridor: string;
  goodsType: string;
  weightKg: number;
  specialInstructions?: string;

  basePrice: number;
  platformFee: number;
  insuranceFee: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  escrowStatus: 'Unfunded' | 'Held in Escrow' | 'Settled to Driver' | 'Refunded';

  status: ShipmentStatus;
  estimatedPickup: string;
  estimatedDelivery: string;
  telemetry: BookingTelemetry;

  driverConfirmedDelivery?: boolean;
  retailerConfirmedDelivery?: boolean;
  driverConfirmedAt?: string;
  retailerConfirmedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'driver' | 'customer' | 'system';
  cancellationReason?: string;
}

export interface EarningsRecord {
  id: string;
  date: string;
  route: string;
  corridor: string;
  loadsCount: number;
  weightKg: number;
  amount: number;
  escrowFeeDeducted: number;
  status: 'Settled' | 'In Escrow' | 'Refunded';
  payoutReference: string;
}

export interface ChatMessage {
  id: string;
  bookingId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'driver' | 'customer' | 'system';
  recipientId: string;
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'match' | 'booking' | 'payment' | 'tracking';
  read: boolean;
  actionUrl?: string;
}
