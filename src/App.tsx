import { useState, useEffect } from 'react';
import { useLogisticsStore } from './store/logisticsStore';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { IntroScreen } from './components/common/IntroScreen';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';
import { ChatDrawer } from './components/common/ChatDrawer';
import { MatchingEngineModal } from './components/common/MatchingEngineModal';
import { AuthModal } from './components/common/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HeroSection } from './components/landing/HeroSection';
import { DualPersonaSection } from './components/landing/DualPersonaSection';
import { HowItWorksStepper } from './components/landing/HowItWorksStepper';
import { MetricsKpiSection } from './components/landing/MetricsKpiSection';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { TestimonialsCarousel } from './components/landing/TestimonialsCarousel';
import { PricingSection } from './components/landing/PricingSection';
import { CtaFooterSection } from './components/landing/CtaFooterSection';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { PostReturnTrip } from './components/driver/PostReturnTrip';
import { TripDetails } from './components/driver/TripDetails';
import { DriverEarnings } from './components/driver/DriverEarnings';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { PostLoadRequest } from './components/customer/PostLoadRequest';
import { LoadDetails } from './components/customer/LoadDetails';
import { MatchesSearchResults } from './components/core/MatchesSearchResults';
import { BookingConfirmation } from './components/core/BookingConfirmation';
import { PaymentEscrow } from './components/core/PaymentEscrow';
import { LiveTrackingMap } from './components/core/LiveTrackingMap';

export const App: React.FC = () => {
  const [introReady, setIntroReady] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try { return !sessionStorage.getItem('rf_intro_seen'); } catch { return true; }
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIntroReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleIntroComplete = () => {
    try { sessionStorage.setItem('rf_intro_seen', '1'); } catch { /* ignore */ }
    setShowIntro(false);
  };

  const {
    state, setPersona, setCurrentPage, toggleDarkMode,
    addTrip, cancelTrip, addLoadRequest, cancelLoad,
    selectMatchForBooking, createPendingBooking,
    acceptBookingByDriver, declineBookingByDriver,
    openPaymentForBooking, confirmBookingAndProceedToPayment,
    completePaymentAndStartTracking, confirmDelivery,
    cancelBookingWithRefund, advanceBookingStatus,
    sendChatMessage, toggleMatchingEngineModal, toggleChatDrawer,
    setSelectedTripId, setSelectedLoadId, setSelectedBookingId,
    getMatchesForLoad, resetDemoState,
    openAuthModal, closeAuthModal, registerUser, loginUser, logoutUser,
    continueAsDemoUser, markNotificationsRead
  } = useLogisticsStore();

  const selectedTrip = state.trips.find(t => t.id === state.selectedTripId) || state.trips[0];
  const selectedLoad = state.loads.find(l => l.id === state.selectedLoadId) || state.loads[0];
  // Resolve selected booking strictly — prefer selectedBookingId, then follow the active load's bookingId
  const selectedBooking =
    (state.selectedBookingId ? state.bookings.find(b => b.id === state.selectedBookingId) : undefined) ||
    (selectedLoad?.bookingId ? state.bookings.find(b => b.id === selectedLoad.bookingId) : undefined) ||
    (selectedLoad ? state.bookings.find(b => b.loadId === selectedLoad.id && b.status !== 'Declined' && b.status !== 'Cancelled') : undefined);
  const matchesList = getMatchesForLoad(state.selectedLoadId || undefined);

  return (
    <div className="returnflow-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showIntro && introReady && <IntroScreen onComplete={handleIntroComplete} />}

      <Header
        currentPersona={state.currentPersona} currentPage={state.currentPage}
        isDarkMode={state.isDarkMode} notifications={state.notifications}
        unreadMessagesCount={Math.max(0, state.chatMessages.length - state.lastReadChatCount)}
        authUser={state.authUser} isRealtimeConnected={state.isRealtimeConnected}
        isRealtimeConnecting={state.isRealtimeConnecting}
        onSelectPersona={setPersona} onNavigate={setCurrentPage}
        onToggleDarkMode={toggleDarkMode} onOpenMatchingEngine={() => toggleMatchingEngineModal(true)}
        onOpenChat={() => toggleChatDrawer(true)} onResetDemo={resetDemoState}
        onOpenAuth={() => openAuthModal('customer')} onSignOut={logoutUser}
        onMarkNotificationsRead={markNotificationsRead}
      />

      <div className="app-body-container" style={{ flex: 1, display: 'flex' }}>
        {state.currentPersona !== 'guest' && (
          <Sidebar currentPersona={state.currentPersona} currentPage={state.currentPage}
            authUser={state.authUser} onNavigate={setCurrentPage} onSelectPersona={setPersona} />
        )}

        <main className="app-main-content" style={{
          flex: 1, padding: state.currentPersona === 'guest' ? '0' : '28px 36px',
          maxWidth: state.currentPersona === 'guest' ? '100%' : '1280px', margin: '0 auto', width: '100%'
        }}>
          <AppErrorBoundary onNavigateHome={() => setCurrentPage('home')}>

            {/* 1. PUBLIC LANDING PAGE */}
            {state.currentPage === 'home' && (
              <div className="animate-fade-in w-full">
                <HeroSection onSelectPersona={persona => { setPersona(persona); setCurrentPage(persona === 'customer' ? 'customer-dashboard' : 'driver-dashboard'); }} onExploreMatching={() => toggleMatchingEngineModal(true)} />
                <DualPersonaSection onSelectPersona={persona => { setPersona(persona); setCurrentPage(persona === 'customer' ? 'customer-dashboard' : 'driver-dashboard'); }} />
                <HowItWorksStepper />
                <MetricsKpiSection />
                <FeaturesGrid />
                <TestimonialsCarousel />
                <PricingSection onSelectPersona={persona => { setPersona(persona); setCurrentPage(persona === 'customer' ? 'customer-dashboard' : 'driver-dashboard'); }} />
                <CtaFooterSection
                  onSelectPersona={persona => { setPersona(persona); setCurrentPage(persona === 'customer' ? 'customer-dashboard' : 'driver-dashboard'); }}
                  onExploreMatching={() => toggleMatchingEngineModal(true)}
                />
              </div>
            )}

            {/* 2. DRIVER PORTAL */}
            {state.currentPersona === 'driver' && (
              <div>
                {(state.currentPage === 'driver-dashboard' || state.currentPage === 'driver-trips') && (
                  <DriverDashboard trips={state.trips} bookings={state.bookings} earnings={state.earnings}
                    driverId={state.authUser?.id || 'drv-rajesh'} authUser={state.authUser}
                    onNavigate={setCurrentPage} onSelectTrip={setSelectedTripId}
                    onSelectBooking={bId => { setSelectedBookingId(bId); setCurrentPage('tracking'); }}
                    onCancelTrip={cancelTrip} onAcceptBooking={acceptBookingByDriver} onDeclineBooking={declineBookingByDriver}
                  />
                )}
                {state.currentPage === 'driver-post-trip' && (
                  <PostReturnTrip onSubmitTrip={tripData => addTrip(tripData)} onCancel={() => setCurrentPage('driver-dashboard')} />
                )}
                {state.currentPage === 'driver-trip-details' && selectedTrip && (
                  <TripDetails trip={selectedTrip} onBack={() => setCurrentPage('driver-dashboard')} onNavigateToTracking={() => setCurrentPage('tracking')} />
                )}
                {state.currentPage === 'driver-earnings' && (
                  <DriverEarnings earnings={state.earnings} onNavigate={setCurrentPage} />
                )}
              </div>
            )}

            {/* 3. CUSTOMER PORTAL */}
            {state.currentPersona === 'customer' && (
              <div>
                {(state.currentPage === 'customer-dashboard' || state.currentPage === 'customer-loads') && (
                  <CustomerDashboard loads={state.loads} bookings={state.bookings} authUser={state.authUser}
                    onNavigate={setCurrentPage} onSelectLoad={setSelectedLoadId}
                    onBrowseMatches={loadId => { setSelectedLoadId(loadId); setCurrentPage('matches'); }}
                    onPayBooking={openPaymentForBooking} onCancelLoad={cancelLoad}
                    onSelectBooking={setSelectedBookingId}
                  />
                )}
                {state.currentPage === 'customer-post-load' && (
                  <PostLoadRequest onSubmitLoad={loadData => addLoadRequest(loadData)} onCancel={() => setCurrentPage('customer-dashboard')} />
                )}
                {state.currentPage === 'customer-load-details' && selectedLoad && (
                  <LoadDetails load={selectedLoad}
                    matchedTrip={state.trips.find(t => t.id === selectedLoad.matchedTripId) || selectedTrip}
                    onBack={() => setCurrentPage('customer-dashboard')}
                    onBrowseMatches={loadId => { setSelectedLoadId(loadId); setCurrentPage('matches'); }}
                    onNavigateToTracking={() => {
                      const bid = selectedLoad.bookingId
                        || state.bookings.find(b => b.loadId === selectedLoad.id)?.id;
                      if (bid) setSelectedBookingId(bid);
                      setCurrentPage('tracking');
                    }}
                  />
                )}
              </div>
            )}

            {/* 4. ADMIN PORTAL */}
            {state.currentPersona === 'admin' && state.currentPage === 'admin-dashboard' && state.authUser?.id === 'admin-ops' && (
              <AdminDashboard trips={state.trips} loads={state.loads} bookings={state.bookings} onNavigate={setCurrentPage} />
            )}
            {state.currentPersona === 'admin' && state.authUser?.id !== 'admin-ops' && (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                <h2 style={{ color: 'var(--brand-navy)', marginBottom: '8px' }}>Admin Access Required</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>This portal is restricted to platform operators.</p>
                <button className="btn-primary-teal" onClick={() => setPersona('guest')}>Back to Home</button>
              </div>
            )}

            {/* 5. CORE PROCESS SCREENS */}
            {state.currentPage === 'matches' && (
              <MatchesSearchResults matches={matchesList} activeLoad={selectedLoad} onSelectMatch={selectMatchForBooking}
                onBack={() => { if (state.currentPersona === 'customer') setCurrentPage('customer-dashboard'); else setCurrentPage('home'); }}
              />
            )}

            {state.currentPage === 'booking-confirmation' && state.selectedMatch && (
              <BookingConfirmation match={state.selectedMatch}
                existingBooking={state.bookings.find(b => b.loadId === state.selectedMatch!.load.id && b.status !== 'Declined' && b.status !== 'Cancelled')}
                onRequestBooking={match => createPendingBooking(match)}
                onConfirmPayment={(match, method) => confirmBookingAndProceedToPayment(match, method)}
                onBack={() => { if (state.currentPersona === 'customer') setCurrentPage('customer-dashboard'); else setCurrentPage('matches'); }}
              />
            )}

            {state.currentPage === 'payment' && state.selectedMatch && (
              <PaymentEscrow match={state.selectedMatch}
                onPaymentSuccess={(match, method) => completePaymentAndStartTracking(match, method)}
                onBack={() => setCurrentPage('booking-confirmation')}
              />
            )}

            {state.currentPage === 'tracking' && selectedBooking && (
              <LiveTrackingMap booking={selectedBooking} currentPersona={state.currentPersona}
                onAdvanceStatus={advanceBookingStatus} onConfirmDelivery={confirmDelivery}
                onCancelBooking={cancelBookingWithRefund} onOpenChat={() => toggleChatDrawer(true)}
                onBack={() => setCurrentPage(state.currentPersona === 'driver' ? 'driver-dashboard' : 'customer-dashboard')}
              />
            )}
            {state.currentPage === 'tracking' && !selectedBooking && (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                <h2 style={{ color: 'var(--brand-navy)', marginBottom: '8px' }}>No Active Shipment</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Book a load to activate live tracking.</p>
                <button className="btn-primary-teal" onClick={() => setCurrentPage(state.currentPersona === 'driver' ? 'driver-dashboard' : 'customer-dashboard')}>Go to Dashboard</button>
              </div>
            )}

          </AppErrorBoundary>
        </main>
      </div>

      <MatchingEngineModal isOpen={state.isMatchingEngineOpen} onClose={() => toggleMatchingEngineModal(false)} />
      <ChatDrawer isOpen={state.isChatDrawerOpen} messages={state.chatMessages} currentPersona={state.currentPersona} onClose={() => toggleChatDrawer(false)} onSendMessage={sendChatMessage} />
      <AuthModal isOpen={state.isAuthModalOpen} initialRole={state.authModalRole} onClose={closeAuthModal} onSignIn={loginUser} onSignUp={registerUser} onDemoContinue={continueAsDemoUser} />
      <Toast toast={state.toastMessage} />
    </div>
  );
};

export default App;
