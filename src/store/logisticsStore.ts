import { useState, useEffect } from 'react';
import {
  Trip,
  LoadRequest,
  Booking,
  EarningsRecord,
  ChatMessage,
  NotificationItem,
  Persona,
  ShipmentStatus,
  PaymentMethod,
  MatchResult,
  CanonicalShipment
} from '../types/logistics';
import { calculateMatchScore } from '../utils/matchingAlgorithm';
import { calculateDistanceAndDuration } from '../services/routingEngine';
import { calculateDeterministicPrice } from '../services/pricingEngine';
import { INITIAL_CANONICAL_SHIPMENTS, createCanonicalShipment } from '../services/seedService';

// Mock Initial Trips derived from canonical shipments
const INITIAL_TRIPS: Trip[] = [
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
    corridor: 'HYD-WAR',
    departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departureTimeWindow: '06:00 AM – 10:00 AM',
    totalCapacityKg: 4000,
    bookedCapacityKg: 350,
    preferredLoadType: 'FMCG & General Goods',
    minPrice: 2200,
    isReturnTrip: true,
    status: 'active',
    notes: 'Returning from Uppal warehouse delivery. Flatbed with waterproof tarpaulin ready.',
    bookedLoads: [
      {
        id: 'bload-1',
        from: 'Bhongir',
        to: 'Warangal',
        weightKg: 350,
        price: 1400,
        shipperName: 'Srinivasa Wholesale Grocers',
        goodsType: 'Packaged Spices',
        bookingTime: 'Today, 10:15 AM'
      }
    ]
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
    corridor: 'HYD-BLR',
    departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    departureTimeWindow: '04:00 AM – 08:00 AM',
    totalCapacityKg: 15000,
    bookedCapacityKg: 8500,
    preferredLoadType: 'Industrial / Electronics / FMCG',
    minPrice: 18500,
    isReturnTrip: true,
    status: 'active',
    notes: 'Scheduled backhaul return to Bangalore depot. GPS verified, dual drivers.',
    bookedLoads: [
      {
        id: 'bload-2',
        from: 'Shamshabad Logistics Park',
        to: 'Anantapur Hub',
        weightKg: 5000,
        price: 11000,
        shipperName: 'Deccan Hardware Ltd',
        goodsType: 'Construction Fasteners',
        bookingTime: 'Yesterday'
      }
    ]
  }
];

const INITIAL_LOADS: LoadRequest[] = [
  {
    id: 'load-201',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks Pvt Ltd',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Uppal)',
    to: 'Warangal Industrial Zone',
    corridor: 'HYD-WAR',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeWindow: 'Morning (07:00 AM – 11:00 AM)',
    weight: 400,
    weightUnit: 'Kg',
    goodsType: 'Furniture & Display Fixtures',
    budget: 2500,
    specialInstructions: 'Handle with care, bubble wrapped display counters for retail store opening.',
    status: 'Searching',
    createdAt: '10 minutes ago'
  },
  {
    id: 'load-202',
    customerId: 'cust-priya',
    customerName: 'Priya Sharma',
    customerCompany: 'Apex Retail Networks Pvt Ltd',
    customerPhone: '+91 94401 55678',
    from: 'Hyderabad (Shamshabad)',
    to: 'Bangalore (Peenya)',
    corridor: 'HYD-BLR',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeWindow: 'Flexible',
    weight: 2500,
    weightUnit: 'Kg',
    goodsType: 'FMCG Packaged Goods',
    budget: 9500,
    specialInstructions: 'Palletized cartons. Forklift available at Bangalore dock.',
    status: 'Booked',
    bookingId: 'book-301',
    matchedTripId: 'trip-102',
    createdAt: '2 hours ago'
  }
];

const INITIAL_BOOKINGS: Booking[] = [
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
    basePrice: 9200,
    platformFee: 276,
    insuranceFee: 150,
    totalPrice: 9626,
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
      lastUpdated: 'Just now (Live GPS 4G)',
      progressPercent: 54,
      routeCoordinates: [
        [17.2403, 78.4294],
        [16.7663, 78.1408],
        [15.8281, 78.0373],
        [14.6819, 77.6006],
        [13.4325, 77.7275],
        [12.9716, 77.5946]
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

const INITIAL_EARNINGS: EarningsRecord[] = [
  {
    id: 'earn-501',
    date: '18 Aug 2026',
    route: 'Warangal → Hyderabad (Backhaul)',
    corridor: 'HYD-WAR',
    loadsCount: 2,
    weightKg: 850,
    amount: 3450,
    escrowFeeDeducted: 86,
    status: 'Settled',
    payoutReference: 'UPI-RETURN-883912'
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New High-Score Backhaul Match (94%)',
    message: 'Apex Retail posted 400 Kg furniture for Hyderabad → Warangal on your scheduled return route.',
    timestamp: '5m ago',
    type: 'match',
    read: false
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'drv-rajesh',
    senderName: 'Rajesh Kumar (Driver)',
    senderRole: 'driver',
    recipientId: 'cust-priya',
    text: 'Hello Priya Ji! Vehicle TS-07-EA-9912 is ready for loading.',
    timestamp: '11:20 AM'
  }
];

export interface LogisticsState {
  currentPersona: Persona;
  currentPage: string;
  isDarkMode: boolean;
  
  canonicalShipments: CanonicalShipment[];
  trips: Trip[];
  loads: LoadRequest[];
  bookings: Booking[];
  earnings: EarningsRecord[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];

  // Selection states
  selectedTripId: string | null;
  selectedLoadId: string | null;
  selectedMatch: MatchResult | null;
  selectedBookingId: string | null;

  // Active Modals
  isMatchingEngineOpen: boolean;
  isChatDrawerOpen: boolean;

  // Toast
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
}

// Storage helpers
const STORAGE_KEY = 'returnflow_logistics_v3';

export function useLogisticsStore() {
  const [state, setState] = useState<LogisticsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          canonicalShipments: parsed.canonicalShipments || INITIAL_CANONICAL_SHIPMENTS,
          trips: parsed.trips || INITIAL_TRIPS,
          loads: parsed.loads || INITIAL_LOADS,
          bookings: parsed.bookings || INITIAL_BOOKINGS,
          earnings: parsed.earnings || INITIAL_EARNINGS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          chatMessages: parsed.chatMessages || INITIAL_MESSAGES
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }

    return {
      currentPersona: 'guest',
      currentPage: 'home',
      isDarkMode: false,
      canonicalShipments: INITIAL_CANONICAL_SHIPMENTS,
      trips: INITIAL_TRIPS,
      loads: INITIAL_LOADS,
      bookings: INITIAL_BOOKINGS,
      earnings: INITIAL_EARNINGS,
      notifications: INITIAL_NOTIFICATIONS,
      chatMessages: INITIAL_MESSAGES,
      selectedTripId: 'trip-101',
      selectedLoadId: 'load-201',
      selectedMatch: null,
      selectedBookingId: 'book-301',
      isMatchingEngineOpen: false,
      isChatDrawerOpen: false,
      toastMessage: null
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }, [state]);

  // Sync dark mode class and attribute
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Actions
  const setPersona = (persona: Persona) => {
    setState((prev) => {
      let nextPage = prev.currentPage;
      if (persona === 'driver') nextPage = 'driver-dashboard';
      else if (persona === 'customer') nextPage = 'customer-dashboard';
      else if (persona === 'guest') nextPage = 'home';
      return { ...prev, currentPersona: persona, currentPage: nextPage };
    });
  };

  const setCurrentPage = (page: string) => {
    setState((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setState((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setState((prev) => ({ ...prev, toastMessage: { text, type } }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, toastMessage: null }));
    }, 4000);
  };

  const addTrip = (tripData: Omit<Trip, 'id' | 'driverId' | 'driverName' | 'driverRating' | 'driverAvatarText' | 'driverPhone' | 'bookedCapacityKg' | 'bookedLoads' | 'status' | 'isReturnTrip'>) => {
    const route = calculateDistanceAndDuration(tripData.from, tripData.to);
    const pricing = calculateDeterministicPrice({
      distanceKm: route.distanceKm,
      weightKg: tripData.totalCapacityKg,
      vehicleType: tripData.vehicleType,
      corridorId: route.corridorId,
      isReturnTrip: true
    });

    const canonical: CanonicalShipment = createCanonicalShipment({
      requestType: 'DRIVER_RETURN_TRIP',
      from: tripData.from,
      to: tripData.to,
      departureDate: tripData.departureDate,
      departureTimeWindow: tripData.departureTimeWindow,
      vehicleType: tripData.vehicleType,
      vehiclePlate: tripData.vehiclePlate,
      totalCapacityKg: tripData.totalCapacityKg,
      weightKg: tripData.totalCapacityKg,
      goodsType: tripData.preferredLoadType,
      requestedPrice: tripData.minPrice || pricing.systemRecommendedPrice,
      notes: tripData.notes
    });

    const newTrip: Trip = {
      ...tripData,
      id: canonical.id,
      driverId: 'drv-rajesh',
      driverName: 'Rajesh Kumar',
      driverRating: 4.9,
      driverAvatarText: 'RK',
      driverPhone: '+91 98490 23145',
      corridor: route.corridorId,
      bookedCapacityKg: 0,
      bookedLoads: [],
      isReturnTrip: true,
      status: 'active'
    };

    setState((prev) => ({
      ...prev,
      canonicalShipments: [canonical, ...prev.canonicalShipments],
      trips: [newTrip, ...prev.trips],
      selectedTripId: newTrip.id,
      currentPage: 'driver-dashboard',
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Return Trip Posted & Synchronized',
          message: `${newTrip.from} → ${newTrip.to} (${newTrip.totalCapacityKg.toLocaleString()} Kg) is now live across driver & retailer portals.`,
          timestamp: 'Just now',
          type: 'booking',
          read: false
        },
        ...prev.notifications
      ]
    }));

    showToast('Return trip posted & synchronized across portals!', 'success');
  };

  const addLoadRequest = (loadData: Omit<LoadRequest, 'id' | 'customerId' | 'customerName' | 'customerCompany' | 'customerPhone' | 'status' | 'createdAt'>) => {
    const route = calculateDistanceAndDuration(loadData.from, loadData.to);
    const weightKg = loadData.weightUnit === 'CBM' ? loadData.weight * 250 : loadData.weight;
    const pricing = calculateDeterministicPrice({
      distanceKm: route.distanceKm,
      weightKg,
      corridorId: route.corridorId,
      isReturnTrip: true
    });

    const canonical: CanonicalShipment = createCanonicalShipment({
      requestType: 'RETAILER_LOAD_REQUEST',
      from: loadData.from,
      to: loadData.to,
      departureDate: loadData.date,
      departureTimeWindow: loadData.timeWindow,
      weightKg,
      goodsType: loadData.goodsType,
      requestedPrice: loadData.budget || pricing.systemRecommendedPrice,
      notes: loadData.specialInstructions
    });

    const newLoad: LoadRequest = {
      ...loadData,
      id: canonical.id,
      corridor: route.corridorId,
      customerId: 'cust-priya',
      customerName: 'Priya Sharma',
      customerCompany: 'Apex Retail Networks Pvt Ltd',
      customerPhone: '+91 94401 55678',
      status: 'Searching',
      createdAt: 'Just now'
    };

    setState((prev) => ({
      ...prev,
      canonicalShipments: [canonical, ...prev.canonicalShipments],
      loads: [newLoad, ...prev.loads],
      selectedLoadId: newLoad.id,
      currentPage: 'matches'
    }));

    showToast('Load request posted! Real-time matches generated.', 'success');
  };


  const selectMatchForBooking = (match: MatchResult) => {
    setState((prev) => ({
      ...prev,
      selectedMatch: match,
      currentPage: 'booking-confirmation'
    }));
  };

  const confirmBookingAndProceedToPayment = (match: MatchResult, paymentMethod: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      selectedMatch: match,
      currentPage: 'payment'
    }));
  };

  const completePaymentAndStartTracking = (match: MatchResult, paymentMethod: PaymentMethod) => {
    const bookingId = `book-${Date.now()}`;
    const weightKg = match.load.weightUnit === 'CBM' ? match.load.weight * 250 : match.load.weight;
    
    const newBooking: Booking = {
      id: bookingId,
      tripId: match.trip.id,
      loadId: match.load.id,
      bookingDate: new Date().toISOString().split('T')[0],
      driverId: match.trip.driverId,
      driverName: match.trip.driverName,
      driverRating: match.trip.driverRating,
      driverPhone: match.trip.driverPhone,
      driverAvatar: match.trip.driverAvatarText,
      vehicleType: match.trip.vehicleType,
      vehiclePlate: match.trip.vehiclePlate,
      customerId: match.load.customerId,
      customerName: match.load.customerName,
      customerCompany: match.load.customerCompany,
      customerPhone: match.load.customerPhone,
      from: match.load.from,
      to: match.load.to,
      corridor: match.trip.corridor,
      goodsType: match.load.goodsType,
      weightKg: weightKg,
      specialInstructions: match.load.specialInstructions,
      basePrice: match.calculatedPrice,
      platformFee: Math.round(match.calculatedPrice * 0.03),
      insuranceFee: 150,
      totalPrice: Math.round(match.calculatedPrice * 1.03) + 150,
      paymentMethod: paymentMethod,
      escrowStatus: 'Held in Escrow',
      status: 'Booked',
      estimatedPickup: 'Tomorrow, 08:00 AM',
      estimatedDelivery: 'Tomorrow, 06:00 PM',
      telemetry: {
        currentLat: 17.3984,
        currentLng: 78.5583,
        currentSpeedKmh: 0,
        currentLocationName: 'Pickup Hub — Preparing for loading',
        nextStopName: 'En route to destination corridor',
        etaMinutes: 240,
        lastUpdated: 'Just now',
        progressPercent: 10,
        routeCoordinates: [
          [17.3984, 78.5583],
          [17.5108, 78.8891],
          [17.7277, 79.1558],
          [17.9784, 79.5255],
          [17.9689, 79.5941]
        ],
        checkpoints: [
          { name: 'Origin Warehouse (Pickup)', lat: 17.3984, lng: 78.5583, time: '08:00 AM', completed: true },
          { name: 'Corridor Checkpoint 1', lat: 17.5108, lng: 78.8891, time: '10:15 AM (Est.)', completed: false },
          { name: 'Midway Fuel & Weighbridge', lat: 17.7277, lng: 79.1558, time: '01:00 PM (Est.)', completed: false },
          { name: 'Destination Unloading Bay (Drop)', lat: 17.9689, lng: 79.5941, time: '04:30 PM (Est.)', completed: false }
        ]
      }
    };

    // Update trip capacity & booked loads
    const updatedTrips = state.trips.map((t) => {
      if (t.id === match.trip.id) {
        return {
          ...t,
          bookedCapacityKg: t.bookedCapacityKg + weightKg,
          bookedLoads: [
            ...t.bookedLoads,
            {
              id: `bload-${Date.now()}`,
              from: match.load.from,
              to: match.load.to,
              weightKg: weightKg,
              price: match.calculatedPrice,
              shipperName: match.load.customerCompany,
              goodsType: match.load.goodsType,
              bookingTime: 'Just now'
            }
          ]
        };
      }
      return t;
    });

    // Update load status
    const updatedLoads = state.loads.map((l) => {
      if (l.id === match.load.id) {
        return {
          ...l,
          status: 'Booked' as ShipmentStatus,
          matchedTripId: match.trip.id,
          bookingId: bookingId
        };
      }
      return l;
    });

    // Add new earnings record (in escrow)
    const newEarningsRecord: EarningsRecord = {
      id: `earn-${Date.now()}`,
      date: 'Today',
      route: `${match.load.from} → ${match.load.to} (Return leg)`,
      corridor: match.trip.corridor,
      loadsCount: 1,
      weightKg: weightKg,
      amount: match.calculatedPrice,
      escrowFeeDeducted: Math.round(match.calculatedPrice * 0.025),
      status: 'In Escrow',
      payoutReference: `ESCROW-${bookingId.toUpperCase()}`
    };

    setState((prev) => ({
      ...prev,
      trips: updatedTrips,
      loads: updatedLoads,
      bookings: [newBooking, ...prev.bookings],
      earnings: [newEarningsRecord, ...prev.earnings],
      selectedBookingId: bookingId,
      currentPage: 'tracking',
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Escrow Secured & Booking Confirmed',
          message: `Booking #${bookingId} confirmed with ${match.trip.driverName}. Live GPS tracking activated!`,
          timestamp: 'Just now',
          type: 'tracking',
          read: false
        },
        ...prev.notifications
      ]
    }));

    showToast('Payment held in secure escrow! Tracking activated.', 'success');
  };

  const advanceBookingStatus = (bookingId: string) => {
    setState((prev) => {
      const updatedBookings = prev.bookings.map((b) => {
        if (b.id === bookingId) {
          let nextStatus: ShipmentStatus = b.status;
          let progress = b.telemetry.progressPercent;
          let speed = b.telemetry.currentSpeedKmh;

          if (b.status === 'Booked') {
            nextStatus = 'Picked Up';
            progress = 25;
            speed = 35;
          } else if (b.status === 'Picked Up') {
            nextStatus = 'In Transit';
            progress = 65;
            speed = 58;
          } else if (b.status === 'In Transit') {
            nextStatus = 'Delivered';
            progress = 100;
            speed = 0;
          }

          const checkpoints = b.telemetry.checkpoints.map((cp, idx) => {
            if (nextStatus === 'Delivered') return { ...cp, completed: true };
            if (nextStatus === 'In Transit' && idx <= 2) return { ...cp, completed: true };
            if (nextStatus === 'Picked Up' && idx <= 1) return { ...cp, completed: true };
            return cp;
          });

          return {
            ...b,
            status: nextStatus,
            escrowStatus: nextStatus === 'Delivered' ? 'Settled to Driver' : b.escrowStatus,
            telemetry: {
              ...b.telemetry,
              progressPercent: progress,
              currentSpeedKmh: speed,
              checkpoints
            }
          };
        }
        return b;
      });

      // Update load status as well
      const currentBooking = prev.bookings.find((b) => b.id === bookingId);
      const updatedLoads = prev.loads.map((l) => {
        if (currentBooking && l.id === currentBooking.loadId) {
          const matchingBooking = updatedBookings.find((b) => b.id === bookingId);
          return {
            ...l,
            status: matchingBooking ? matchingBooking.status : l.status
          };
        }
        return l;
      });

      return {
        ...prev,
        bookings: updatedBookings,
        loads: updatedLoads
      };
    });
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const isDriver = state.currentPersona === 'driver';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: state.selectedBookingId || undefined,
      senderId: isDriver ? 'drv-rajesh' : 'cust-priya',
      senderName: isDriver ? 'Rajesh Kumar (Driver)' : 'Priya Sharma (Retailer)',
      senderRole: isDriver ? 'driver' : 'customer',
      recipientId: isDriver ? 'cust-priya' : 'drv-rajesh',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMsg]
    }));
  };

  const toggleMatchingEngineModal = (open?: boolean) => {
    setState((prev) => ({
      ...prev,
      isMatchingEngineOpen: open !== undefined ? open : !prev.isMatchingEngineOpen
    }));
  };

  const toggleChatDrawer = (open?: boolean) => {
    setState((prev) => ({
      ...prev,
      isChatDrawerOpen: open !== undefined ? open : !prev.isChatDrawerOpen
    }));
  };

  const setSelectedTripId = (id: string) => {
    setState((prev) => ({ ...prev, selectedTripId: id, currentPage: 'driver-trip-details' }));
  };

  const setSelectedLoadId = (id: string) => {
    setState((prev) => ({ ...prev, selectedLoadId: id, currentPage: 'customer-load-details' }));
  };

  const setSelectedBookingId = (id: string) => {
    setState((prev) => ({ ...prev, selectedBookingId: id, currentPage: 'tracking' }));
  };

  // Generate real-time matches for currently selected load or a given load
  const getMatchesForLoad = (loadId?: string): MatchResult[] => {
    const targetLoadId = loadId || state.selectedLoadId || state.loads[0]?.id;
    const load = state.loads.find((l) => l.id === targetLoadId) || state.loads[0];
    if (!load) return [];

    return state.trips
      .filter((trip) => trip.status === 'active')
      .map((trip) => calculateMatchScore(trip, load))
      .filter((match) => match.matchScore >= 40) // Filter out geographically incompatible matches
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  // Reset demo state
  const resetDemoState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentPersona: 'guest',
      currentPage: 'home',
      isDarkMode: false,
      canonicalShipments: INITIAL_CANONICAL_SHIPMENTS,
      trips: INITIAL_TRIPS,
      loads: INITIAL_LOADS,
      bookings: INITIAL_BOOKINGS,
      earnings: INITIAL_EARNINGS,
      notifications: INITIAL_NOTIFICATIONS,
      chatMessages: INITIAL_MESSAGES,
      selectedTripId: 'trip-101',
      selectedLoadId: 'load-201',
      selectedMatch: null,
      selectedBookingId: 'book-301',
      isMatchingEngineOpen: false,
      isChatDrawerOpen: false,
      toastMessage: { text: 'Platform demo data restored.', type: 'info' }
    });
  };

  return {
    state,
    setPersona,
    setCurrentPage,
    toggleDarkMode,
    showToast,
    addTrip,
    addLoadRequest,
    selectMatchForBooking,
    confirmBookingAndProceedToPayment,
    completePaymentAndStartTracking,
    advanceBookingStatus,
    sendChatMessage,
    toggleMatchingEngineModal,
    toggleChatDrawer,
    setSelectedTripId,
    setSelectedLoadId,
    setSelectedBookingId,
    getMatchesForLoad,
    resetDemoState
  };
}
