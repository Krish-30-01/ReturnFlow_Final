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
  NewLoadInput
} from '../types/logistics';
import { getCandidateMatchesForLoad } from '../utils/matchingAlgorithm';
import { calculateDistanceAndDuration } from '../services/routingEngine';
import { calculateBackhaulPricing } from '../services/pricingEngine';
import { INITIAL_CANONICAL_SHIPMENTS, createCanonicalShipment } from '../services/seedService';
import { SupabaseService } from '../services/supabaseClient';
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
        setState((prev) => ({ ...prev, isRealtimeConnected: connected }));
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
    // Signed-in users get their own role-specific workspace. Requesting the
    // other portal opens the sign-in sheet pre-targeted at that role, so
    // driver and retailer never share an identity.
    if (
      (persona === 'driver' || persona === 'customer') &&
      state.authUser &&
      state.authUser.role !== persona
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

  const continueAsDemoUser = (role: 'driver' | 'customer') => {
    const demoUser: AppUser =
      role === 'driver'
        ? { id: 'drv-rajesh', email: 'rajesh@returnflow.demo', name: 'Rajesh Kumar', phone: '+91 98490 23145', role: 'driver' }
        : { id: 'cust-priya', email: 'priya@returnflow.demo', name: 'Priya Sharma', company: 'Apex Retail Networks Pvt Ltd', phone: '+91 94401 55678', role: 'customer' };
    setState((prev) => ({
      ...prev,
      authUser: demoUser,
      currentPersona: role,
      currentPage: role === 'driver' ? 'driver-dashboard' : 'customer-dashboard',
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

      // Real event: count live backhaul matches for the fresh load
      const matchCount = getCandidateMatchesForLoad(state.trips, newLoad).length;

      setState((prev) => ({
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
      }));

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

  const confirmBookingAndProceedToPayment = (match: MatchResult, _paymentMethod: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      selectedMatch: match,
      currentPage: 'payment'
    }));
  };

  const completePaymentAndStartTracking = async (match: MatchResult, paymentMethod: PaymentMethod) => {
    try {
      const bookingId = `book-${Date.now()}`;
      const weightKg = match.load.weightUnit === 'CBM' ? match.load.weight * 250 : match.load.weight;
    
    const route = calculateDistanceAndDuration(match.load.from, match.load.to);
    const pricing = calculateBackhaulPricing({
      distanceKm: route.distanceKm,
      weightKg,
      vehicleType: match.trip.vehicleType,
      corridorId: match.trip.corridor,
      isReturnTrip: true,
      retailerBudget: match.calculatedPrice
    });

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

    const newEarningsRecord: EarningsRecord = {
      id: `earn-${Date.now()}`,
      date: 'Today',
      route: `${match.load.from} → ${match.load.to} (Return leg)`,
      corridor: match.trip.corridor,
      loadsCount: 1,
      weightKg: weightKg,
      amount: pricing.driverPayout,
      escrowFeeDeducted: Math.round(pricing.driverPayout * 0.025),
      status: 'In Escrow',
      payoutReference: `ESCROW-${bookingId.toUpperCase()}`
    };

    await SupabaseService.insertBooking(newBooking, newEarningsRecord);

    setState((prev) => ({
      ...prev,
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
    } catch (err) {
      console.error('Failed to complete booking payment', err);
      showToast('Payment failed. Please try again.', 'warning');
    }
  };

  const advanceBookingStatus = async (bookingId: string) => {
    try {
      const updatedBookings = await SupabaseService.advanceBookingStatus(bookingId);
      const delivered = updatedBookings.find((b) => b.id === bookingId);
      const driverPayout = delivered ? Math.round(delivered.basePrice * 0.975) : 0;

      setState((prev) => ({
        ...prev,
        bookings: updatedBookings,
        notifications:
          delivered?.status === 'Delivered'
            ? [
                {
                  id: `notif-${Date.now()}`,
                  title: 'Delivered — Escrow Settled',
                  message: `Consignment delivered at ${delivered.to}. ₹${driverPayout.toLocaleString()} released to driver ${delivered.driverName} after the 2.5% escrow fee.`,
                  timestamp: 'Just now',
                  type: 'payment',
                  read: false
                },
                ...prev.notifications
              ]
            : delivered?.status === 'In Transit'
              ? [
                  {
                    id: `notif-${Date.now()}`,
                    title: 'Shipment In Transit',
                    message: `${delivered.driverName} picked up your consignment from ${delivered.from}. Live GPS tracking active on the ${delivered.corridor} corridor.`,
                    timestamp: 'Just now',
                    type: 'tracking',
                    read: false
                  },
                  ...prev.notifications
                ]
              : prev.notifications
      }));
    } catch (err) {
      console.error('Failed to advance booking status', err);
      showToast('Could not update shipment status.', 'warning');
    }
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
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

  const resetDemoState = () => {
    try {
      SupabaseService.resetToSeed();
      localStorage.removeItem(UI_PREFS_KEY);
      refreshFromSupabase();
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
    resetDemoState,
    openAuthModal,
    closeAuthModal,
    registerUser,
    loginUser,
    logoutUser,
    continueAsDemoUser
  };
}
