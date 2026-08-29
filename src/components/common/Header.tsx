import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Truck,
  Store,
  Home,
  Cpu,
  MessageSquare,
  RotateCcw,
  BarChart3,
  LogOut,
  LogIn,
  Wifi,
  WifiOff,
  Check,
  ChevronDown
} from 'lucide-react';
import { Persona, NotificationItem } from '../../types/logistics';
import { AppUser } from '../../services/authService';

interface HeaderProps {
  currentPersona: Persona;
  currentPage: string;
  isDarkMode: boolean;
  notifications: NotificationItem[];
  unreadMessagesCount: number;
  authUser?: AppUser | null;
  isRealtimeConnected?: boolean;
  isRealtimeConnecting?: boolean;
  onSelectPersona: (persona: Persona) => void;
  onNavigate: (page: string) => void;
  onToggleDarkMode: () => void;
  onOpenMatchingEngine: () => void;
  onOpenChat: () => void;
  onResetDemo: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onMarkNotificationsRead: (ids?: string[]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  currentPage: _currentPage,
  isDarkMode,
  notifications,
  unreadMessagesCount,
  authUser,
  isRealtimeConnected = false,
  isRealtimeConnecting = false,
  onSelectPersona,
  onNavigate,
  onToggleDarkMode,
  onOpenMatchingEngine,
  onOpenChat,
  onResetDemo,
  onOpenAuth,
  onSignOut,
  onMarkNotificationsRead
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const displayName = authUser?.name || (currentPersona === 'driver' ? 'Rajesh Kumar' : 'Priya Sharma');
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = currentPersona === 'driver' ? 'Driver Partner' : currentPersona === 'admin' ? 'Platform Ops' : authUser?.company || 'Shipper / Retailer';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const personaConfig = [
    { id: 'guest' as const, label: 'Overview', icon: Home, nav: 'home' },
    { id: 'driver' as const, label: 'Driver', icon: Truck, nav: 'driver-dashboard', elementId: 'header-switch-driver' },
    { id: 'customer' as const, label: 'Shipper', icon: Store, nav: 'customer-dashboard', elementId: 'header-switch-customer' },
    { id: 'admin' as const, label: 'Ops Admin', icon: BarChart3, nav: 'admin-dashboard' }
  ];

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--surface-2)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'background-color var(--dur-base), border-color var(--dur-base)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          width: '100%'
        }}
      >
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #1D9E75 0%, #042C53 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9375rem',
                letterSpacing: '-0.5px',
                boxShadow: '0 2px 8px rgba(29, 158, 117, 0.25)'
              }}
            >
              RF
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--brand-navy)',
                    letterSpacing: '-0.4px',
                    lineHeight: 1.1
                  }}
                >
                  ReturnFlow
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--brand-teal-light)',
                    color: 'var(--brand-teal)',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  AI
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.2px'
                }}
              >
                Logistics Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Segmented Persona Switcher */}
        <nav
          className="persona-switcher"
          aria-label="Portal Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            gap: '2px'
          }}
        >
          {personaConfig.map((item) => {
            const isActive = currentPersona === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={item.elementId}
                onClick={() => {
                  onSelectPersona(item.id);
                  onNavigate(item.nav);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 13px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? item.id === 'driver'
                      ? 'var(--brand-teal)'
                      : item.id === 'customer'
                      ? 'var(--brand-amber)'
                      : item.id === 'admin'
                      ? 'var(--brand-navy)'
                      : 'var(--surface-2)'
                    : 'transparent',
                  color: isActive
                    ? item.id === 'guest'
                      ? 'var(--brand-navy)'
                      : '#FFFFFF'
                    : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.8125rem',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 180ms ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Grouped Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Status & Engine Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Live Indicator — Bug 2 fix: shows Connecting… during initial handshake */}
            <div
              title={
                isRealtimeConnecting
                  ? 'Connecting to Supabase Realtime…'
                  : isRealtimeConnected
                  ? 'Supabase Realtime Sync: Connected'
                  : 'Offline Mode: Local Demo Data'
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: isRealtimeConnected
                  ? 'rgba(22, 163, 74, 0.08)'
                  : isRealtimeConnecting
                  ? 'rgba(186,117,23,0.08)'
                  : 'var(--bg-secondary)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: isRealtimeConnected
                  ? '#16A34A'
                  : isRealtimeConnecting
                  ? 'var(--brand-amber)'
                  : 'var(--text-tertiary)',
                border: '1px solid',
                borderColor: isRealtimeConnected
                  ? 'rgba(22, 163, 74, 0.2)'
                  : isRealtimeConnecting
                  ? 'rgba(186,117,23,0.25)'
                  : 'var(--border-color)',
                cursor: 'default'
              }}
            >
              {isRealtimeConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="sync-label" style={{ letterSpacing: '0.3px' }}>
                {isRealtimeConnecting ? 'Connecting…' : isRealtimeConnected ? 'Live' : 'Offline'}
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isRealtimeConnected
                    ? '#16A34A'
                    : isRealtimeConnecting
                    ? 'var(--brand-amber)'
                    : 'var(--text-tertiary)',
                  boxShadow: isRealtimeConnected ? '0 0 0 2px rgba(22,163,74,0.2)' : 'none'
                }}
              />
            </div>

            {/* Match Engine Modal Button */}
            <button
              onClick={onOpenMatchingEngine}
              title="Open Bidirectional Matching Engine Explainer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--brand-teal-light)',
                border: '1px solid rgba(29, 158, 117, 0.3)',
                color: 'var(--brand-teal)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <Cpu size={14} />
              <span>Match Engine</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-color)', margin: '0 2px' }} />

          {/* Utility Icon Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Chat Drawer */}
            <button
              onClick={onOpenChat}
              title="Messages & Chat"
              style={{
                position: 'relative',
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={15} />
              {unreadMessagesCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: 'var(--brand-coral)',
                    color: '#FFFFFF',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(216,90,48,0.4)'
                  }}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Notifications"
                style={{
                  position: 'relative',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: isNotifOpen ? 'var(--bg-secondary)' : 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <Bell size={15} />
                {unreadNotifs > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      minWidth: '15px',
                      height: '15px',
                      padding: '0 3px',
                      backgroundColor: 'var(--brand-coral)',
                      color: '#FFFFFF',
                      borderRadius: '999px',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(216,90,48,0.4)'
                    }}
                  >
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '330px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--border-color)',
                    padding: '14px',
                    zIndex: 200
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
                        Notifications
                      </span>
                      {unreadNotifs > 0 && (
                        <span style={{ backgroundColor: 'var(--brand-coral)', color: '#fff', fontSize: '0.625rem', fontWeight: 700, padding: '1px 5px', borderRadius: '8px' }}>
                          {unreadNotifs} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        // Bug 7+25 fix: use callback instead of directly mutating
                        // notification objects (which corrupts the module-level
                        // INITIAL_NOTIFICATIONS constant and skips React re-render).
                        onMarkNotificationsRead();
                        setIsNotifOpen(false);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-teal)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Check size={12} />
                      Mark read
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            // Bug 7 fix: use callback instead of direct object mutation
                            onMarkNotificationsRead([n.id]);
                            if (n.type === 'match') onNavigate('matches');
                            if (n.type === 'payment') onNavigate('driver-earnings');
                            if (n.type === 'tracking') onNavigate('tracking');
                            if (n.type === 'booking') onNavigate('driver-dashboard');
                            setIsNotifOpen(false);
                          }}
                          style={{
                            padding: '8px 10px',
                            backgroundColor: n.read ? 'var(--surface-3)' : 'var(--brand-teal-light)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            border: n.read ? '1px solid var(--border-color)' : '1px solid rgba(29,158,117,0.3)',
                            cursor: 'pointer',
                            transition: 'background-color 150ms ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--brand-teal)' }} />
                            )}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.3, fontSize: '0.7rem' }}>{n.message}</div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                            {n.timestamp}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Demo Reset */}
            <button
              onClick={onResetDemo}
              title="Reset Demo Dataset"
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-color)', margin: '0 2px' }} />

          {/* User Profile / Auth Area */}
          {currentPersona === 'guest' ? (
            <button
              onClick={onOpenAuth}
              title="Sign in or register"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #1D9E75 0%, #042C53 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(4, 44, 83, 0.2)',
                transition: 'opacity 150ms ease'
              }}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          ) : (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '3px 8px 3px 4px',
                  borderRadius: '9999px',
                  backgroundColor: isUserMenuOpen ? 'var(--bg-secondary)' : 'transparent',
                  border: '1px solid',
                  borderColor: isUserMenuOpen ? 'var(--border-color)' : 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 150ms ease'
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor:
                      currentPersona === 'driver'
                        ? 'var(--brand-teal)'
                        : currentPersona === 'admin'
                        ? 'var(--brand-navy)'
                        : 'var(--brand-amber)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
                <div style={{ lineHeight: 1.15 }} className="desktop-user-label">
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
                    {roleLabel}
                  </div>
                </div>
                <ChevronDown size={13} color="var(--text-secondary)" />
              </div>

              {/* Profile Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '190px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--border-color)',
                    padding: '6px',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-navy)' }}>{displayName}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{authUser?.email || 'demo@returnflow.ai'}</div>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--brand-coral)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 150ms ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-coral-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
