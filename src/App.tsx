import React from 'react';
import { useLogisticsStore } from './store/logisticsStore';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';
import { ChatDrawer } from './components/common/ChatDrawer';
import { MatchingEngineModal } from './components/common/MatchingEngineModal';
import { AuthModal } from './components/common/AuthModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Landing Page Components
import { HeroSection } from './components/landing/HeroSection';
import { DualPersonaSection } from './components/landing/DualPersonaSection';
import { HowItWorksStepper } from './components/landing/HowItWorksStepper';
import { MetricsKpiSection } from './components/landing/MetricsKpiSection';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { TestimonialsCarousel } from './components/landing/TestimonialsCarousel';
import { PricingSection } from './components/landing/PricingSection';
import { CtaFooterSection } from './components/landing/CtaFooterSection';

// Driver Components
import { DriverDashboard } from './components/driver/DriverDashboard';
import { PostReturnTrip } from './components/driver/PostReturnTrip';
import { TripDetails } from './components/driver/TripDetails';
import { DriverEarnings } from './components/driver/DriverEarnings';

// Customer Components
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { PostLoadRequest } from './components/customer/PostLoadRequest';
import { LoadDetails } from './components/customer/LoadDetails';

// Core Process Components
import { MatchesSearchResults } from './components/core/MatchesSearchResults';
import { BookingConfirmation } from './components/core/BookingConfirmation';
import { PaymentEscrow } from './components/core/PaymentEscrow';
import { LiveTrackingMap } from './components/core/LiveTrackingMap';

export const App: React.FC = () => {
  const {
    state,
    setPersona,
    setCurrentPage,
    toggleDarkMode,
    showToast: _showToast,
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
    setSelectedBookingId: _setSelectedBookingId,
    getMatchesForLoad,
    resetDemoState,
    openAuthModal,
    closeAuthModal,
    registerUser,
    loginUser,
    logoutUser,
    continueAsDemoUser
  } = useLogisticsStore();

  const selectedTrip = state.trips.find((t) => t.id === state.selectedTripId) || state.trips[0];
  const selectedLoad = state.loads.find((l) => l.id === state.selectedLoadId) || state.loads[0];
  const selectedBooking = state.bookings.find((b) => b.id === state.selectedBookingId) || state.bookings[0];
  const matchesList = getMatchesForLoad(state.selectedLoadId || undefined);

  return (
    <div className="returnflow-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        currentPersona={state.currentPersona}
        currentPage={state.currentPage}
        isDarkMode={state.isDarkMode}
        notifications={state.notifications}
        unreadMessagesCount={state.chatMessages.length > 2 ? 1 : 0}
        authUser={state.authUser}
        isRealtimeConnected={state.isRealtimeConnected}
        onSelectPersona={setPersona}
        onNavigate={setCurrentPage}
        onToggleDarkMode={toggleDarkMode}
        onOpenMatchingEngine={() => toggleMatchingEngineModal(true)}
        onOpenChat={() => toggleChatDrawer(true)}
        onResetDemo={resetDemoState}
        onOpenAuth={() => openAuthModal('customer')}
        onSignOut={logoutUser}
      />

      {/* Main Layout Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Logged-in Sidebar (Driver / Customer) */}
        {state.currentPersona !== 'guest' && (
          <Sidebar
            currentPersona={state.currentPersona}
            currentPage={state.currentPage}
            authUser={state.authUser}
            onNavigate={setCurrentPage}
            onSelectPersona={setPersona}
          />
        )}

        {/* Content Area */}
        <main
          style={{
            flex: 1,
            padding: state.currentPersona === 'guest' ? '0' : '32px 24px',
            maxWidth: state.currentPersona === 'guest' ? '100%' : '1200px',
            margin: '0 auto',
            width: '100%'
          }}
        >
          {/* 1. PUBLIC MARKETING LANDING PAGE */}
          {state.currentPersona === 'guest' && state.currentPage === 'home' && (
            <div className="w-full">
              <HeroSection
                onSelectPersona={(persona) => {
                  setPersona(persona);
                }}
                onExploreMatching={() => toggleMatchingEngineModal(true)}
              />
              <DualPersonaSection
                onSelectPersona={(persona) => {
                  setPersona(persona);
                }}
              />
              <HowItWorksStepper />
              <MetricsKpiSection />
              <FeaturesGrid />
              <TestimonialsCarousel />
              <PricingSection
                onSelectPersona={(persona) => {
                  setPersona(persona);
                }}
              />
              <CtaFooterSection
                onSelectPersona={(persona) => {
                  setPersona(persona);
                }}
                onExploreMatching={() => toggleMatchingEngineModal(true)}
              />
            </div>
          )}

          {/* 2. TRUCK DRIVER PORTAL SCREENS */}
          {state.currentPersona === 'driver' && (
            <div>
              {state.currentPage === 'driver-dashboard' && (
                <DriverDashboard
                  trips={state.trips}
                  earnings={state.earnings}
                  onNavigate={setCurrentPage}
                  onSelectTrip={setSelectedTripId}
                  onCancelTrip={cancelTrip}
                />
              )}

              {state.currentPage === 'driver-trips' && (
                <DriverDashboard
                  trips={state.trips}
                  earnings={state.earnings}
                  onNavigate={setCurrentPage}
                  onSelectTrip={setSelectedTripId}
                  onCancelTrip={cancelTrip}
                />
              )}

              {state.currentPage === 'driver-post-trip' && (
                <PostReturnTrip
                  onSubmitTrip={(tripData) => addTrip(tripData)}
                  onCancel={() => setCurrentPage('driver-dashboard')}
                />
              )}

              {state.currentPage === 'driver-trip-details' && selectedTrip && (
                <TripDetails
                  trip={selectedTrip}
                  onBack={() => setCurrentPage('driver-dashboard')}
                  onNavigateToTracking={() => setCurrentPage('tracking')}
                />
              )}

              {state.currentPage === 'driver-earnings' && (
                <DriverEarnings earnings={state.earnings} onNavigate={setCurrentPage} />
              )}
            </div>
          )}

          {/* 3. CUSTOMER (RETAILER) PORTAL SCREENS */}
          {state.currentPersona === 'customer' && (
            <div>
              {state.currentPage === 'customer-dashboard' && (
                <CustomerDashboard
                  loads={state.loads}
                  onNavigate={setCurrentPage}
                  onSelectLoad={setSelectedLoadId}
                  onBrowseMatches={(loadId) => {
                    setSelectedLoadId(loadId);
                    setCurrentPage('matches');
                  }}
                  onCancelLoad={cancelLoad}
                />
              )}

              {state.currentPage === 'customer-loads' && (
                <CustomerDashboard
                  loads={state.loads}
                  onNavigate={setCurrentPage}
                  onSelectLoad={setSelectedLoadId}
                  onBrowseMatches={(loadId) => {
                    setSelectedLoadId(loadId);
                    setCurrentPage('matches');
                  }}
                  onCancelLoad={cancelLoad}
                />
              )}

              {state.currentPage === 'customer-post-load' && (
                <PostLoadRequest
                  onSubmitLoad={(loadData) => addLoadRequest(loadData)}
                  onCancel={() => setCurrentPage('customer-dashboard')}
                />
              )}

              {state.currentPage === 'customer-load-details' && selectedLoad && (
                <LoadDetails
                  load={selectedLoad}
                  matchedTrip={state.trips.find((t) => t.id === selectedLoad.matchedTripId) || state.trips.find((t) => t.corridor === selectedLoad.corridor) || selectedTrip}
                  onBack={() => setCurrentPage('customer-dashboard')}
                  onBrowseMatches={(loadId) => {
                    setSelectedLoadId(loadId);
                    setCurrentPage('matches');
                  }}
                  onNavigateToTracking={() => setCurrentPage('tracking')}
                />
              )}
            </div>
          )}

          {/* 4. PLATFORM OPS (ADMIN) SCREENS */}
          {state.currentPersona === 'admin' && state.currentPage === 'admin-dashboard' && (
            <AdminDashboard
              trips={state.trips}
              loads={state.loads}
              bookings={state.bookings}
              onNavigate={setCurrentPage}
            />
          )}

          {/* 5. CORE PROCESS (SHARED) SCREENS */}
          {state.currentPage === 'matches' && (
            <MatchesSearchResults
              matches={matchesList}
              activeLoad={selectedLoad}
              onSelectMatch={selectMatchForBooking}
              onBack={() => {
                if (state.currentPersona === 'customer') setCurrentPage('customer-dashboard');
                else if (state.currentPersona === 'driver') setCurrentPage('driver-dashboard');
                else setCurrentPage('home');
              }}
            />
          )}

          {state.currentPage === 'booking-confirmation' && state.selectedMatch && (
            <BookingConfirmation
              match={state.selectedMatch}
              onConfirm={(match, method) => confirmBookingAndProceedToPayment(match, method)}
              onBack={() => setCurrentPage('matches')}
            />
          )}

          {state.currentPage === 'payment' && state.selectedMatch && (
            <PaymentEscrow
              match={state.selectedMatch}
              onPaymentSuccess={(match, method) => completePaymentAndStartTracking(match, method)}
              onBack={() => setCurrentPage('booking-confirmation')}
            />
          )}

          {state.currentPage === 'tracking' && selectedBooking && (
            <LiveTrackingMap
              booking={selectedBooking}
              onAdvanceStatus={advanceBookingStatus}
              onOpenChat={() => toggleChatDrawer(true)}
              onBack={() => {
                if (state.currentPersona === 'driver') setCurrentPage('driver-dashboard');
                else setCurrentPage('customer-dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <MatchingEngineModal
        isOpen={state.isMatchingEngineOpen}
        onClose={() => toggleMatchingEngineModal(false)}
      />

      <ChatDrawer
        isOpen={state.isChatDrawerOpen}
        messages={state.chatMessages}
        currentPersona={state.currentPersona}
        onClose={() => toggleChatDrawer(false)}
        onSendMessage={sendChatMessage}
      />

      <AuthModal
        isOpen={state.isAuthModalOpen}
        initialRole={state.authModalRole}
        onClose={closeAuthModal}
        onSignIn={loginUser}
        onSignUp={registerUser}
        onDemoContinue={continueAsDemoUser}
      />

      <Toast toast={state.toastMessage} />
    </div>
  );
};
export default App;
