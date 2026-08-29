import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trip,
  LoadRequest,
  Booking,
  EarningsRecord,
  ChatMessage,
  NotificationItem,
  Persona,
  PaymentMethod,
  MatchResult,
  CanonicalShipment,
  NewTripInput,
  NewLoadInput,
  BOOKING_STATUS
} from '../types/logistics';
import { getCandidateMatchesForLoad } from '../utils/matchingAlgorithm';
import { calculateDistanceAndDuration } from '../services/routingEngine';
import { calculateBackhaulPricing } from '../services/pricingEngine';
import { INITIAL_CANONICAL_SHIPMENTS, createCanonicalShipment } from '../services/seedService';
import { SupabaseService } from '../services/supabaseClient';
import { isLiveBackend } from '../services/supabaseClient';
import { authService, AppUser } from '../services/authService';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New High-Score Backhaul Match (95%)',
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
  authUser: AppUser | null;

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
  isAuthModalOpen: boolean;
  authModalRole: 'driver' | 'customer';
  isRealtimeConnected: boolean;
  // Bug 2 fix: track whether we are still waiting for the first connection event
  // so the header can show "Connecting…" instead of the misleading "Offline" flash.
  isRealtimeConnecting: boolean;

  // Toast
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
}

const UI_PREFS_KEY = 'returnflow_ui_prefs_v4';

export function useLogisticsStore() {
  const [state, setState] = useState<LogisticsState>(() => {
    let isDarkMode = false;
    try {
      const saved = localStorage.getItem(UI_PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        isDarkMode = parsed.isDarkMode || false;
      }
    } catch (e) {
      console.warn('UI preferences not found', e);
    }

    return {
      currentPersona: 'guest',
      currentPage: 'home',
      isDarkMode,
      authUser: null,
      canonicalShipments: INITIAL_CANONICAL_SHIPMENTS,
      trips: [],
      loads: [],
      bookings: [],
      earnings: [],
      notifications: INITIAL_NOTIFICATIONS,
      chatMessages: INITIAL_MESSAGES,
      selectedTripId: 'trip-101',
      selectedLoadId: 'load-201',
      selectedMatch: null,
      selectedBookingId: 'book-301',
      isMatchingEngineOpen: false,
      isChatDrawerOpen: false,
      isAuthModalOpen: false,
      authModalRole: 'driver',
      isRealtimeConnected: false,
      isRealtimeConnecting: isLiveBackend, // only show "connecting" when Supabase is configured
      toastMessage: null
    };
  });

  // Sync with Supabase on mount and realtime events
  const refreshFromSupabase = useCallback(async () => {
    try {
      const [tripsData, loadsData, earningsData, bookingsData] = await Promise.all([
        SupabaseService.getTrips(),
        SupabaseService.getLoadRequests(),
        SupabaseService.getEarnings(),
        SupabaseService.getBookings()
      ]);

      setState((prev) => ({
        ...prev,
        trips: tripsData,
        loads: loadsData,
        earnings: earningsData,
        bookings: bookingsData,
        selectedTripId: prev.selectedTripId || tripsData[0]?.id || null,
        selectedLoadId: prev.selectedLoadId || loadsData[0]?.id || null,
        selectedBookingId: prev.selectedBookingId || bookingsData[0]?.id || null
      }));
    } catch (err) {
      console.error('Failed to sync from Supabase', err);
    }
  }, []);

  useEffect(() => {
    // Restore authenticated session (Supabase or local demo session)
    void authService.getSessionUser().then((user) => {
      if (user) {
        setState((prev) => ({ ...prev, authUser: user }));
      }
    });

    refreshFromSupabase();

    // Subscribe to realtime Supabase changes
    const unsubscribe = SupabaseService.subscribe(
      () => {
        refreshFromSupabase();
      },
      (connected) => {
        // Bug 2 fix: first status event resolves the "connecting" state.
        setState((prev) => ({ ...prev, isRealtimeConnected: connected, isRealtimeConnecting: false }));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [refreshFromSupabase]);

  // Persist UI preferences (dark mode, etc.)
  useEffect(() => {
    try {
      localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ isDarkMode: state.isDarkMode }));
    } catch (e) {
      console.warn('Could not persist UI prefs', e);
    }
  }, [state.isDarkMode]);

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
    // Admin tab: go straight to dashboard without auth check
    if (persona === 'admin') {
      const adminUser: AppUser = state.authUser?.id === 'admin-ops'
        ? state.authUser
        : { id: 'admin-ops', email: 'ops@returnflow.demo', name: 'Platform Ops', role: 'customer' };
      setState((prev) => ({
        ...prev,
        authUser: adminUser,
        currentPersona: 'admin',
        currentPage: 'admin-dashboard'
      }));
      return;
    }
    // Signed-in users get their own role-specific workspace. Requesting the
    // other portal opens the sign-in sheet pre-targeted at that role, so
    // driver and retailer never share an identity.
    if (
      (persona === 'driver' || persona === 'customer') &&
      state.authUser &&
      state.authUser.role !== persona &&
      state.authUser.id !== 'admin-ops'
    ) {
      showToast(
        `Switching portals — sign in with your ${persona === 'driver' ? 'Driver' : 'Retailer'} account, or continue as the demo ${persona}.`,
        'info'
      );
      setState((prev) => ({ ...prev, isAuthModalOpen: true, authModalRole: persona }));
      return;
    }
    // Driver / Retailer portals require an authenticated identity.
    if ((persona === 'driver' || persona === 'customer') && !state.authUser) {
      setState((prev) => ({ ...prev, isAuthModalOpen: true, authModalRole: persona === 'driver' ? 'driver' : 'customer' }));
      return;
    }
    setState((prev) => {
      let nextPage = prev.currentPage;
      if (persona === 'driver') nextPage = 'driver-dashboard';
      else if (persona === 'customer') nextPage = 'customer-dashboard';
      else if (persona === 'admin') nextPage = 'admin-dashboard';
      else if (persona === 'guest') nextPage = 'home';
      return { ...prev, currentPersona: persona, currentPage: nextPage };
    });
  };

  const openAuthModal = (role: 'driver' | 'customer' = 'driver') => {
    setState((prev) => ({ ...prev, isAuthModalOpen: true, authModalRole: role }));
  };

  const closeAuthModal = () => {
    setState((prev) => ({ ...prev, isAuthModalOpen: false }));
  };

  const registerUser = async (input: { email: string; password: string; name: string; phone?: string; company?: string; role: 'driver' | 'customer' }) => {
    try {
      const { user, needsEmailConfirmation } = await authService.signUp(input);
      if (needsEmailConfirmation) {
        showToast('Account created! Check your email to confirm, then sign in.', 'info');
        setState((prev) => ({ ...prev, isAuthModalOpen: false }));
        return;
      }
      setState((prev) => ({
        ...prev,
        authUser: user,
        currentPersona: user.role,
        currentPage: user.role === 'driver' ? 'driver-dashboard' : 'customer-dashboard',
        isAuthModalOpen: false,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: `Welcome to ReturnFlow, ${user.name.split(' ')[0]}!`,
            message:
              user.role === 'driver'
                ? 'Your driver account is live. Post a return trip to start receiving backhaul matches.'
                : 'Your shipper account is live. Post a consignment and let return trucks come to you.',
            timestamp: 'Just now',
            type: 'booking',
            read: false
          },
          ...prev.notifications
        ]
      }));
      showToast(`Welcome aboard, ${user.name.split(' ')[0]}!`, 'success');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Registration failed');
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const user = await authService.signIn(email, password);
      setState((prev) => ({
        ...prev,
        authUser: user,
        currentPersona: user.role,
        currentPage: user.role === 'driver' ? 'driver-dashboard' : 'customer-dashboard',
        isAuthModalOpen: false
      }));
      showToast(`Signed in as ${user.name}`, 'success');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Sign-in failed');
    }
  };

  const logoutUser = async () => {
    await authService.signOut();
    setState((prev) => ({ ...prev, authUser: null, currentPersona: 'guest', currentPage: 'home' }));
    showToast('Signed out successfully.', 'info');
  };

  const continueAsDemoUser = (role: 'driver' | 'customer' | 'admin') => {
    const demoUser: AppUser =
      role === 'driver'
        ? { id: 'drv-rajesh', email: 'rajesh@returnflow.demo', name: 'Rajesh Kumar', phone: '+91 98490 23145', role: 'driver' }
        : role === 'admin'
        ? { id: 'admin-ops', email: 'ops@returnflow.demo', name: 'Platform Ops', role: 'customer' }
        : { id: 'cust-priya', email: 'priya@returnflow.demo', name: 'Priya Sharma', company: 'Apex Retail Networks Pvt Ltd', phone: '+91 94401 55678', role: 'customer' };
    const targetPage = role === 'driver' ? 'driver-dashboard' : role === 'admin' ? 'admin-dashboard' : 'customer-dashboard';
    setState((prev) => ({
      ...prev,
      authUser: demoUser,
      currentPersona: role,
      currentPage: targetPage,
      isAuthModalOpen: false
    }));
    showToast(`Continuing as demo ${role} (${demoUser.name}).`, 'info');
  };

  const setCurrentPage = (page: string) => {
    setState((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setState((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setState((prev) => ({ ...prev, toastMessage: { text, type } }));
    toastTimerRef.current = setTimeout(() => {
      toastTimerRef.current = null;
      setState((prev) => ({ ...prev, toastMessage: null }));
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const addTrip = async (tripData: NewTripInput) => {
    try {
      const u = state.authUser;
      const newTrip = await SupabaseService.insertTrip({
        ...tripData,
        driverIdentity:
          u && (u.role === 'driver' || u.id.startsWith('drv'))
            ? { id: u.id, name: u.name, phone: u.phone, avatarText: u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() }
            : undefined
      });

      const canonical = createCanonicalShipment({
        requestType: 'DRIVER_RETURN_TRIP',
        from: tripData.from,
        to: tripData.to,
        departureDate: tripData.departureDate,
        departureTimeWindow: tripData.departureTimeWindow,
        vehicleType: tripData.vehicleType,
        vehiclePlate: tripData.vehiclePlate,
        totalCapacityKg: tripData.totalCapacityKg,
        weightKg: tripData.totalCapacityKg,
        goodsType: tripData.preferredLoadType || 'FMCG & General Goods',
        requestedPrice: newTrip.minPrice,
        notes: tripData.notes
      });

      setState((prev) => ({
        ...prev,
        canonicalShipments: [canonical, ...prev.canonicalShipments],
        trips: [newTrip, ...prev.trips.filter((t) => t.id !== newTrip.id)],
        selectedTripId: newTrip.id,
        currentPage: 'driver-dashboard',
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Return Trip Active',
            message: `${newTrip.from} → ${newTrip.to} (${newTrip.totalCapacityKg.toLocaleString()} Kg) is now live and matching loads.`,
            timestamp: 'Just now',
            type: 'booking',
            read: false
          },
          ...prev.notifications
        ]
      }));

      showToast('Return trip posted successfully!', 'success');
    } catch (err) {
      console.error('Failed to insert trip', err);
      showToast('Failed to post trip.', 'warning');
    }
  };

  const addLoadRequest = async (loadData: NewLoadInput) => {
    try {
      const u = state.authUser;
      const newLoad = await SupabaseService.insertLoadRequest({
        from: loadData.from,
        to: loadData.to,
        corridor: loadData.corridor,
        date: loadData.date,
        timeWindow: loadData.timeWindow,
        weight: loadData.weight,
        weightUnit: loadData.weightUnit,
        goodsType: loadData.goodsType,
        budget: loadData.budget,
        specialInstructions: loadData.specialInstructions,
        retailerIdentity:
          u && (u.role === 'customer' || u.id.startsWith('cust'))
            ? { id: u.id, name: u.name, company: u.company, phone: u.phone }
            : undefined
      });

      const weightKg = loadData.weightUnit === 'CBM' ? loadData.weight * 250 : loadData.weight;
      const canonical = createCanonicalShipment({
        requestType: 'RETAILER_LOAD_REQUEST',
        from: loadData.from,
        to: loadData.to,
        departureDate: loadData.date,
        departureTimeWindow: loadData.timeWindow,
        weightKg,
        goodsType: loadData.goodsType,
        requestedPrice: newLoad.budget,
        notes: loadData.specialInstructions
      });

      // Bug 18 fix: read trips from setState's prev snapshot so we always use
      // the freshest state even if refreshFromSupabase is concurrently in flight.
      setState((prev) => {
        const matchCount = getCandidateMatchesForLoad(prev.trips, newLoad).length;
        return {
          ...prev,
          canonicalShipments: [canonical, ...prev.canonicalShipments],
          loads: [newLoad, ...prev.loads.filter((l) => l.id !== newLoad.id)],
          selectedLoadId: newLoad.id,
          currentPage: 'matches',
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: matchCount > 0 ? `${matchCount} Backhaul Match${matchCount > 1 ? 'es' : ''} Found` : 'Consignment Posted — Scanning Corridor',
              message:
                matchCount > 0
                  ? `${matchCount} verified return trip${matchCount > 1 ? 's' : ''} on ${newLoad.corridor} can carry your ${newLoad.weight} ${newLoad.weightUnit} consignment.`
                  : `${newLoad.from} → ${newLoad.to} is now live. We'll alert you the moment a return truck matches your corridor.`,
              timestamp: 'Just now',
              type: 'match',
              read: false
            },
            ...prev.notifications
          ]
        };
      });

      showToast('Consignment load request posted successfully!', 'success');
    } catch (err) {
      console.error('Failed to insert load request', err);
      showToast('Failed to post load request.', 'warning');
    }
  };

  const selectMatchForBooking = (match: MatchResult) => {
    setState((prev) => ({
      ...prev,
      selectedMatch: match,
      currentPage: 'booking-confirmation'
    }));
  };

  const createPendingBooking = async (match: MatchResult) => {
    try {
      const weightKg = match.load.weightUnit === 'CBM' ? match.load.weight * 250 : match.load.weight;
      
      // Safeguard: Re-validate that the trip has not departed and has sufficient capacity
      const freshTrip = state.trips.find((t) => t.id === match.trip.id);
      if (!freshTrip) {
        showToast('Selected trip listing is no longer available.', 'warning');
        return;
      }
      const spareCapacity = freshTrip.totalCapacityKg - freshTrip.bookedCapacityKg;
      if (spareCapacity < weightKg) {
        showToast(`Trip only has ${spareCapacity.toLocaleString()} Kg spare capacity remaining (requested: ${weightKg.toLocaleString()} Kg).`, 'warning');
        return;
      }

      const bookingId = `book-${Date.now()}`;
      const route = calculateDistanceAndDuration(match.load.from, match.load.to);
      const pricing = calculateBackhaulPricing({
        distanceKm: route.distanceKm,
        weightKg,
        vehicleType: match.trip.vehicleType,
        corridorId: match.trip.corridor,
        isReturnTrip: true,
        retailerBudget: match.calculatedPrice
      });

      // Bug 6 fix: build route coordinates from the actual load origin/destination
      // instead of hardcoding the HYD-WAR corridor waypoints.
      const originLat = match.load.originCoords?.lat ?? route.originCoords?.lat ?? 17.3850;
      const originLng = match.load.originCoords?.lng ?? route.originCoords?.lng ?? 78.4867;
      const destLat   = match.load.destinationCoords?.lat ?? route.destinationCoords?.lat ?? 17.9689;
      const destLng   = match.load.destinationCoords?.lng ?? route.destinationCoords?.lng ?? 79.5941;
      // Build two intermediate waypoints by linear interpolation so the polyline
      // renders meaningfully even without a real routing API response.
      const midLat1 = originLat + (destLat - originLat) * 0.33;
      const midLng1 = originLng + (destLng - originLng) * 0.33;
      const midLat2 = originLat + (destLat - originLat) * 0.66;
      const midLng2 = originLng + (destLng - originLng) * 0.66;
      const routeCoordinates: [number, number][] = [
        [originLat, originLng],
        [midLat1, midLng1],
        [midLat2, midLng2],
        [destLat, destLng]
      ];

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
        basePrice: pricing.driverPayout,
        platformFee: pricing.platformFee,
        insuranceFee: 150,
        totalPrice: pricing.retailerBudget + 150,
        paymentMethod: 'UPI',
        escrowStatus: 'Unfunded',
        status: BOOKING_STATUS.PENDING_DRIVER_ACCEPTANCE,
        estimatedPickup: `${match.trip.departureDate}, ${match.trip.departureTimeWindow.split('–')[0].trim()}`,
        estimatedDelivery: `${match.trip.departureDate}, ~${route.durationMin >= 60 ? Math.round(route.durationMin / 60) + 'h ETA' : route.durationMin + 'min ETA'}`,
        telemetry: {
          currentLat: originLat,
          currentLng: originLng,
          currentSpeedKmh: 0,
          currentLocationName: 'Origin Depot — Pending Dispatch',
          nextStopName: 'En route to destination corridor',
          etaMinutes: 240,
          lastUpdated: 'Just now',
          progressPercent: 0,
          routeCoordinates,
          checkpoints: [
            { name: 'Origin Warehouse (Pickup)', lat: originLat, lng: originLng, time: '08:00 AM', completed: false },
            { name: 'Corridor Checkpoint 1', lat: midLat1, lng: midLng1, time: '10:15 AM (Est.)', completed: false },
            { name: 'Midway Weighbridge', lat: midLat2, lng: midLng2, time: '01:00 PM (Est.)', completed: false },
            { name: 'Destination Drop Bay', lat: destLat, lng: destLng, time: '04:30 PM (Est.)', completed: false }
          ]
        }
      };

      await SupabaseService.insertPendingBooking(newBooking);

      setState((prev) => ({
        ...prev,
        bookings: [newBooking, ...prev.bookings],
        selectedBookingId: bookingId,
        currentPage: 'customer-dashboard',
        // Atomic capacity reservation in UI state
        trips: prev.trips.map((t) =>
          t.id === match.trip.id
            ? { ...t, bookedCapacityKg: t.bookedCapacityKg + weightKg }
            : t
        ),
        loads: prev.loads.map((l) =>
          l.id === match.load.id
            ? { ...l, status: BOOKING_STATUS.PENDING_DRIVER_ACCEPTANCE, matchedTripId: match.trip.id, bookingId: bookingId }
            : l
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Booking Request Sent — Awaiting Driver Acceptance',
            message: `Reservation request for ${weightKg.toLocaleString()} Kg sent to ${match.trip.driverName}. No payment charged yet.`,
            timestamp: 'Just now',
            type: 'booking',
            read: false
          },
          {
            id: `notif-${Date.now() + 1}`,
            title: 'New Backhaul Load Request (Action Required)',
            message: `${match.load.customerName} requested ${weightKg.toLocaleString()} Kg capacity on your ${match.trip.from} → ${match.trip.to} route. Accept or Decline now.`,
            timestamp: 'Just now',
            type: 'booking',
            read: false
          },
          ...prev.notifications
        ]
      }));

      showToast('Booking request sent! Waiting for driver acceptance.', 'info');
    } catch (err) {
      console.error('Failed to create pending booking', err);
      showToast(err instanceof Error ? err.message : 'Failed to book capacity.', 'warning');
    }
  };

  const acceptBookingByDriver = async (bookingId: string) => {
    try {
      await SupabaseService.acceptBooking(bookingId);
      const b = state.bookings.find((item) => item.id === bookingId);
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) => item.id === bookingId ? { ...item, status: 'Awaiting Payment' as const } : item),
        loads: prev.loads.map((l) => (b && l.id === b.loadId) ? { ...l, status: 'Awaiting Payment' as const } : l),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Driver Accepted Your Booking Request!',
            message: `${b?.driverName || 'Driver'} accepted your ${b?.from} → ${b?.to} load request. Click "Pay Securely" to lock funds in escrow.`,
            timestamp: 'Just now',
            type: 'payment',
            read: false
          },
          ...prev.notifications
        ]
      }));
      showToast('Booking accepted! Shipper has been notified to pay.', 'success');
    } catch (err) {
      console.error('Failed to accept booking', err);
      showToast('Could not accept booking request.', 'warning');
    }
  };

  const declineBookingByDriver = async (bookingId: string) => {
    try {
      await SupabaseService.declineBooking(bookingId);
      const b = state.bookings.find((item) => item.id === bookingId);
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) => item.id === bookingId ? { ...item, status: 'Declined' as const } : item),
        trips: prev.trips.map((t) => (b && t.id === b.tripId) ? { ...t, bookedCapacityKg: Math.max(0, t.bookedCapacityKg - b.weightKg) } : t),
        loads: prev.loads.map((l) => (b && l.id === b.loadId) ? { ...l, status: 'Searching' as const, matchedTripId: undefined, bookingId: undefined } : l),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Booking Request Declined',
            message: `Driver declined booking #${bookingId}. Reserved capacity released and load returned to search.`,
            timestamp: 'Just now',
            type: 'booking',
            read: false
          },
          ...prev.notifications
        ]
      }));
      showToast('Booking declined. Spare capacity restored.', 'info');
    } catch (err) {
      console.error('Failed to decline booking', err);
      showToast('Could not decline booking request.', 'warning');
    }
  };

  const openPaymentForBooking = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      showToast('Booking not found.', 'warning');
      return;
    }
    const trip = state.trips.find((t) => t.id === booking.tripId) || {
      id: booking.tripId,
      driverId: booking.driverId,
      driverName: booking.driverName,
      driverRating: booking.driverRating,
      driverAvatarText: booking.driverAvatar,
      driverPhone: booking.driverPhone,
      vehicleType: booking.vehicleType,
      vehiclePlate: booking.vehiclePlate,
      from: booking.from,
      to: booking.to,
      corridor: booking.corridor,
      departureDate: booking.estimatedPickup || 'Tomorrow',
      departureTimeWindow: 'Morning',
      totalCapacityKg: booking.weightKg * 2,
      bookedCapacityKg: booking.weightKg,
      preferredLoadType: booking.goodsType,
      minPrice: booking.basePrice,
      isReturnTrip: true,
      status: 'active' as const,
      bookedLoads: []
    };
    const load = state.loads.find((l) => l.id === booking.loadId) || {
      id: booking.loadId,
      customerId: booking.customerId,
      customerName: booking.customerName,
      customerCompany: booking.customerCompany,
      customerPhone: booking.customerPhone,
      from: booking.from,
      to: booking.to,
      corridor: booking.corridor,
      date: booking.bookingDate,
      timeWindow: 'Morning',
      weight: booking.weightKg,
      weightUnit: 'Kg' as const,
      goodsType: booking.goodsType,
      budget: booking.totalPrice - 150,
      status: booking.status,
      createdAt: 'Recently'
    };

    const match: MatchResult = {
      id: `match-${booking.id}`,
      trip,
      load,
      matchScore: 92,
      routeOverlapScore: 95,
      capacityScore: 90,
      timeWindowScore: 88,
      priceScore: 94,
      calculatedPrice: booking.totalPrice - 150,
      marketPrice: Math.round((booking.totalPrice - 150) * 1.5),
      savingsPercentage: 33,
      co2SavedKg: Math.round(booking.weightKg * 0.12),
      explanation: 'Verified return backhaul match approved by driver.'
    };

    setState((prev) => ({
      ...prev,
      selectedBookingId: bookingId,
      selectedMatch: match,
      currentPage: 'booking-confirmation'
    }));
  };

  const confirmBookingAndProceedToPayment = (match: MatchResult, _paymentMethod: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      selectedMatch: match,
      currentPage: 'payment'
    }));
  };

  const completePaymentAndStartTracking = async (bookingIdOrMatch: string | MatchResult, paymentMethod: PaymentMethod) => {
    try {
      let bookingId = typeof bookingIdOrMatch === 'string' ? bookingIdOrMatch : state.selectedBookingId;
      let targetBooking = state.bookings.find((b) => b.id === bookingId);

      if (!targetBooking && typeof bookingIdOrMatch !== 'string') {
        const match = bookingIdOrMatch;
        targetBooking = state.bookings.find((b) => b.loadId === match.load.id || (b.tripId === match.trip.id && b.from === match.load.from));
      }

      if (!targetBooking) {
        showToast('Booking reference not found.', 'warning');
        return;
      }

      bookingId = targetBooking.id;

      // Idempotency: skip if already funded
      if (targetBooking.escrowStatus === 'Held in Escrow') {
        setState((prev) => ({ ...prev, selectedBookingId: bookingId, currentPage: 'tracking' }));
        return;
      }

      const newEarningsRecord: EarningsRecord = {
        id: `earn-${Date.now()}`,
        date: 'Today',
        route: `${targetBooking.from} → ${targetBooking.to} (Return leg)`,
        corridor: targetBooking.corridor,
        loadsCount: 1,
        weightKg: targetBooking.weightKg,
        amount: targetBooking.basePrice,
        escrowFeeDeducted: Math.round(targetBooking.basePrice * 0.025),
        status: 'In Escrow',
        payoutReference: `ESCROW-${bookingId.toUpperCase()}`
      };

      await SupabaseService.payBooking(bookingId, paymentMethod, newEarningsRecord);

      setState((prev) => ({
        ...prev,
        selectedBookingId: bookingId,
        currentPage: 'tracking',
        bookings: prev.bookings.map((b) =>
          b.id === bookingId
            // Bug 4 fix: status should be 'Booked' after payment, not 'In Transit'.
            // DB also writes BOOKING_STATUS.BOOKED; keep in-memory state consistent.
            ? { ...b, status: 'Booked' as const, escrowStatus: 'Held in Escrow' as const, paymentMethod }
            : b
        ),
        earnings: [newEarningsRecord, ...prev.earnings],
        loads: prev.loads.map((l) =>
          l.id === targetBooking!.loadId
            ? { ...l, status: 'Booked' as const }
            : l
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Escrow Locked & Tracking Active',
            message: `₹${targetBooking!.totalPrice.toLocaleString()} secured in RBI-compliant escrow. Driver dispatch confirmed for ${targetBooking!.from} → ${targetBooking!.to}.`,
            timestamp: 'Just now',
            type: 'payment',
            read: false
          },
          ...prev.notifications
        ]
      }));

      showToast('Payment held in secure escrow! Tracking activated.', 'success');
    } catch (err) {
      console.error('Failed to complete payment', err);
      showToast('Payment processing failed. Please try again.', 'warning');
    }
  };

  const confirmDelivery = async (bookingId: string, role: 'driver' | 'customer') => {
    try {
      const updatedBookings = await SupabaseService.confirmDelivery(bookingId, role);
      const b = updatedBookings.find((item) => item.id === bookingId);
      const isFullySettled = b?.status === 'Delivered';

      setState((prev) => ({
        ...prev,
        bookings: updatedBookings,
        loads: prev.loads.map((l) => (b && l.id === b.loadId && isFullySettled) ? { ...l, status: 'Delivered' as const } : l),
        earnings: prev.earnings.map((e) =>
          (b && isFullySettled && (e.payoutReference.includes(bookingId.toUpperCase()) || e.route.includes(b.from)))
            ? { ...e, status: 'Settled' as const }
            : e
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: isFullySettled ? 'Delivery Verified — Escrow Settled' : (role === 'driver' ? 'Driver Confirmed Delivery' : 'Retailer Confirmed Receipt'),
            message: isFullySettled
              ? `Both confirmations received! Escrow payout of ₹${b ? Math.round(b.basePrice * 0.975).toLocaleString() : ''} released to ${b?.driverName}.`
              : (role === 'driver'
                ? `Driver ${b?.driverName || ''} marked delivered. Waiting for retailer receipt confirmation before escrow payout.`
                : 'Retailer confirmed receipt. Waiting for driver delivery confirmation before escrow payout.'),
            timestamp: 'Just now',
            type: isFullySettled ? 'payment' : 'tracking',
            read: false
          },
          ...prev.notifications
        ]
      }));

      if (isFullySettled) {
        showToast('Both confirmations recorded! Escrow funds released to driver.', 'success');
      } else {
        showToast(
          role === 'driver'
            ? 'Driver confirmation recorded. Waiting for retailer receipt confirmation.'
            : 'Receipt confirmation recorded. Waiting for driver confirmation.',
          'info'
        );
      }
    } catch (err) {
      console.error('Failed to confirm delivery', err);
      showToast('Could not record delivery confirmation.', 'warning');
    }
  };

  const cancelBookingWithRefund = async (bookingId: string, reason?: string) => {
    try {
      const cancelledBy = state.currentPersona === 'driver' ? 'driver' : 'customer';
      await SupabaseService.cancelBooking(bookingId, cancelledBy, reason);
      const b = state.bookings.find((item) => item.id === bookingId);
      const wasFunded = b?.escrowStatus === 'Held in Escrow';

      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) =>
          item.id === bookingId
            ? {
                ...item,
                status: 'Cancelled' as const,
                escrowStatus: wasFunded ? ('Refunded' as const) : ('Unfunded' as const),
                cancelledAt: new Date().toISOString(),
                cancelledBy,
                cancellationReason: reason
              }
            : item
        ),
        trips: prev.trips.map((t) => (b && t.id === b.tripId) ? { ...t, bookedCapacityKg: Math.max(0, t.bookedCapacityKg - b.weightKg) } : t),
        loads: prev.loads.map((l) => (b && l.id === b.loadId) ? { ...l, status: wasFunded ? ('Cancelled' as const) : ('Searching' as const), matchedTripId: undefined, bookingId: undefined } : l),
        earnings: prev.earnings.map((e) =>
          (b && wasFunded && (e.payoutReference.includes(bookingId.toUpperCase()) || e.route.includes(b.from)))
            ? { ...e, status: 'Refunded' as const }
            : e
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: wasFunded ? 'Booking Cancelled — Escrow Refunded' : 'Booking Request Cancelled',
            message: wasFunded
              ? `Booking #${bookingId} was cancelled. Full refund of ₹${b?.totalPrice.toLocaleString()} initiated to shipper.`
              : `Booking request #${bookingId} was cancelled. Capacity restored.`,
            timestamp: 'Just now',
            type: 'booking',
            read: false
          },
          ...prev.notifications
        ]
      }));

      showToast(wasFunded ? 'Booking cancelled. Escrow refund issued to retailer.' : 'Booking request cancelled.', 'info');
    } catch (err) {
      console.error('Failed to cancel booking', err);
      showToast('Could not cancel booking.', 'warning');
    }
  };

  const advanceBookingStatus = async (bookingId: string) => {
    try {
      const updatedBookings = await SupabaseService.advanceBookingStatus(bookingId);
      const b = updatedBookings.find((item) => item.id === bookingId);

      setState((prev) => ({
        ...prev,
        bookings: updatedBookings,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: `Shipment Status: ${b?.status}`,
            message: `${b?.driverName} is ${b?.status.toLowerCase()} on the ${b?.corridor} corridor.`,
            timestamp: 'Just now',
            type: 'tracking',
            read: false
          },
          ...prev.notifications
        ]
      }));
    } catch (err) {
      console.error('Failed to advance booking status', err);
      showToast('Could not update shipment status.', 'warning');
    }
  };

  // Bug 7+25 fix: proper immutable update instead of direct object mutation
  const markNotificationsRead = (ids?: string[]) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        !ids || ids.includes(n.id) ? { ...n, read: true } : n
      )
    }));
  };

  const sendChatMessage = (text: string) => {    if (!text.trim()) return;
    const isDriver = state.currentPersona === 'driver';
    const u = state.authUser;
    const senderName = u?.name || (isDriver ? 'Rajesh Kumar' : 'Priya Sharma');
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: state.selectedBookingId || undefined,
      senderId: u?.id || (isDriver ? 'drv-rajesh' : 'cust-priya'),
      senderName: `${senderName} (${isDriver ? 'Driver' : 'Retailer'})`,
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

    return getCandidateMatchesForLoad(state.trips, load);
  };

  const cancelTrip = async (tripId: string) => {
    try {
      await SupabaseService.deleteTrip(tripId);
      setState((prev) => ({
        ...prev,
        trips: prev.trips.filter((t) => t.id !== tripId),
        canonicalShipments: prev.canonicalShipments.filter((s) => s.id !== tripId)
      }));
      showToast('Trip listing cancelled.', 'info');
    } catch (err) {
      console.error('Failed to cancel trip', err);
      showToast('Could not cancel the trip.', 'warning');
    }
  };

  const cancelLoad = async (loadId: string) => {
    try {
      await SupabaseService.deleteLoadRequest(loadId);
      setState((prev) => ({
        ...prev,
        loads: prev.loads.filter((l) => l.id !== loadId),
        canonicalShipments: prev.canonicalShipments.filter((s) => s.id !== loadId)
      }));
      showToast('Load consignment request cancelled.', 'info');
    } catch (err) {
      console.error('Failed to cancel load', err);
      showToast('Could not cancel the load request.', 'warning');
    }
  };

  const resetDemoState = async () => {
    try {
      // Bug 9 fix: await the full seed so refreshFromSupabase reads populated tables.
      await SupabaseService.resetToSeed();
      localStorage.removeItem(UI_PREFS_KEY);
      await refreshFromSupabase();
      showToast('Platform demo data restored successfully.', 'info');
    } catch (err) {
      console.error('Failed to reset demo state', err);
      showToast('Could not restore demo data.', 'warning');
    }
  };


  return {
    state,
    setPersona,
    setCurrentPage,
    toggleDarkMode,
    showToast,
    addTrip,
    cancelTrip,
    addLoadRequest,
    cancelLoad,
    selectMatchForBooking,
    createPendingBooking,
    acceptBookingByDriver,
    declineBookingByDriver,
    openPaymentForBooking,
    confirmBookingAndProceedToPayment,
    completePaymentAndStartTracking,
    confirmDelivery,
    cancelBookingWithRefund,
    advanceBookingStatus,
    sendChatMessage,
    toggleMatchingEngineModal,
    toggleChatDrawer,
    setSelectedTripId,
    setSelectedLoadId,
    setSelectedBookingId,
    getMatchesForLoad,
    resetDemoState,
    openAuthModal,
    closeAuthModal,
    registerUser,
    loginUser,
    logoutUser,
    continueAsDemoUser,
    markNotificationsRead
  };
}
