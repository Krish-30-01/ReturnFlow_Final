export type Persona = 'guest' | 'driver' | 'customer';

export type UserRole = 'driver' | 'customer';

export type ShipmentStatus = 'Searching' | 'Matched' | 'Booked' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled';

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

  // Owner Identifiers (Persisted & Stable)
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

  // Routing Details (Canonical Single Source of Truth)
  from: string;
  to: string;
  corridor: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  routeDistanceKm: number;
  routeDurationMin: number;

  // Schedule & Timing
  departureDate: string;
  departureTimeWindow: string;

  // Cargo & Capacity
  totalCapacityKg: number;
  availableCapacityKg: number;
  weightKg: number;
  weightUnit?: 'Kg' | 'CBM';
  goodsType: string;
  specialInstructions?: string;

  // Financials & Pricing (Deterministic & Single Source of Truth)
  requestedPrice: number; // Driver minPrice or Retailer budget
  systemRecommendedPrice: number;
  platformFee: number;
  insuranceFee: number;
  finalAgreedPrice?: number;
  escrowStatus: 'Unfunded' | 'Held in Escrow' | 'Settled to Driver' | 'Refunded';

  // Status & Matching
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
  corridor: string;
  departureDate: string;
  departureTimeWindow: string;
  totalCapacityKg: number;
  bookedCapacityKg: number;
  preferredLoadType: string;
  minPrice: number;
  notes?: string;
  isReturnTrip: boolean;
  status: 'active' | 'in_transit' | 'completed';
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
  matchScore: number; // 0 to 100
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
  progressPercent: number; // 0 to 100
  routeCoordinates: [number, number][];
  checkpoints: Checkpoint[];
}

export interface Booking {
  id: string;
  tripId: string;
  loadId: string;
  bookingDate: string;
  
  // Driver Details
  driverId: string;
  driverName: string;
  driverRating: number;
  driverPhone: string;
  driverAvatar: string;
  vehicleType: string;
  vehiclePlate: string;

  // Customer Details
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;

  // Shipment Details
  from: string;
  to: string;
  corridor: string;
  goodsType: string;
  weightKg: number;
  specialInstructions?: string;

  // Financials & Escrow
  basePrice: number;
  platformFee: number;
  insuranceFee: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  escrowStatus: 'Held in Escrow' | 'Settled to Driver' | 'Refunded';

  // State Tracking
  status: ShipmentStatus;
  estimatedPickup: string;
  estimatedDelivery: string;
  telemetry: BookingTelemetry;
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
  status: 'Settled' | 'In Escrow';
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

