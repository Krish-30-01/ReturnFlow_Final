import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Truck,
  Store,
  Home,
  Cpu,
  MessageSquare,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { Persona, NotificationItem } from '../../types/logistics';

interface HeaderProps {
  currentPersona: Persona;
  currentPage: string;
  isDarkMode: boolean;
  notifications: NotificationItem[];
  unreadMessagesCount: number;
  onSelectPersona: (persona: Persona) => void;
  onNavigate: (page: string) => void;
  onToggleDarkMode: () => void;
  onOpenMatchingEngine: () => void;
  onOpenChat: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  currentPage,
  isDarkMode,
  notifications,
  unreadMessagesCount,
  onSelectPersona,
  onNavigate,
  onToggleDarkMode,
  onOpenMatchingEngine,
  onOpenChat,
  onResetDemo
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--surface-2)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color var(--dur-base)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1D9E75 0%, #042C53 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 2px 6px rgba(29, 158, 117, 0.3)'
              }}
            >
              RF
            </div>
            <div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--brand-navy)',
                  letterSpacing: '-0.3px'
                }}
              >
                ReturnFlow
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  display: 'block',
                  color: 'var(--brand-teal)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginTop: '-2px'
                }}
              >
                Logistics Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Interactive Persona Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            padding: '3px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-color)'
          }}
          className="persona-switcher"
        >
          <button
            onClick={() => {
              onSelectPersona('guest');
              onNavigate('home');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: currentPersona === 'guest' ? 'var(--surface-2)' : 'transparent',
              color: currentPersona === 'guest' ? 'var(--brand-navy)' : 'var(--text-secondary)',
              fontWeight: currentPersona === 'guest' ? 600 : 500,
              fontSize: '0.8125rem',
              boxShadow: currentPersona === 'guest' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Home size={14} />
            <span>Landing Page</span>
          </button>

          <button
            onClick={() => {
              onSelectPersona('driver');
              onNavigate('driver-dashboard');
            }}
            id="header-switch-driver"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: currentPersona === 'driver' ? 'var(--brand-teal)' : 'transparent',
              color: currentPersona === 'driver' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: currentPersona === 'driver' ? 600 : 500,
              fontSize: '0.8125rem',
              boxShadow: currentPersona === 'driver' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Truck size={14} />
            <span>Driver Portal</span>
          </button>

          <button
            onClick={() => {
              onSelectPersona('customer');
              onNavigate('customer-dashboard');
            }}
            id="header-switch-customer"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: currentPersona === 'customer' ? 'var(--brand-amber)' : 'transparent',
              color: currentPersona === 'customer' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: currentPersona === 'customer' ? 600 : 500,
              fontSize: '0.8125rem',
              boxShadow: currentPersona === 'customer' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Store size={14} />
            <span>Retailer Portal</span>
          </button>
        </div>

        {/* Right Tools: Simulator, Chat, Notifs, Theme, User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Matching Engine Interactive Explainer Modal Trigger */}
          <button
            onClick={onOpenMatchingEngine}
            className="btn-outline-navy btn-sm"
            title="Open Interactive Bidirectional Matching Engine Simulator"
            style={{
              padding: '6px 12px',
              fontSize: '0.8125rem',
              color: 'var(--brand-teal)',
              borderColor: 'rgba(29, 158, 117, 0.4)',
              background: 'var(--brand-teal-light)'
            }}
          >
            <Cpu size={15} />
            <span style={{ fontWeight: 600 }}>AI Match Engine</span>
          </button>

          {/* In-App Chat Drawer Trigger */}
          <button
            onClick={onOpenChat}
            className="btn-outline-navy btn-sm"
            style={{ position: 'relative', width: '36px', height: '36px', padding: 0 }}
            title="Open in-app driver / shipper communications"
          >
            <MessageSquare size={17} />
            {unreadMessagesCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--brand-coral)',
                  color: '#FFFFFF',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notification Bell with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="btn-outline-navy btn-sm"
              style={{ position: 'relative', width: '36px', height: '36px', padding: 0 }}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadNotifs > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    backgroundColor: 'var(--brand-coral)',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.5)'
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
                  top: '44px',
                  right: 0,
                  width: '340px',
                  backgroundColor: 'var(--surface-2)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  zIndex: 200
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '0.9375rem', color: 'var(--brand-navy)', margin: 0, fontWeight: 700 }}>
                      Live Notifications
                    </h4>
                    {unreadNotifs > 0 && (
                      <span style={{ backgroundColor: 'var(--brand-coral)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                        {unreadNotifs} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      notifications.forEach(n => { n.read = true; });
                      setIsNotifOpen(false);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-teal)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          n.read = true;
                          if (n.type === 'match') onNavigate('matches');
                          if (n.type === 'payment') onNavigate('driver-earnings');
                          if (n.type === 'tracking') onNavigate('tracking');
                          if (n.type === 'booking') onNavigate('driver-dashboard');
                          setIsNotifOpen(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: n.read ? 'var(--surface-3)' : 'var(--brand-teal-light)',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          border: n.read ? '1px solid var(--border-color)' : '1px solid rgba(29,158,117,0.4)',
                          cursor: 'pointer',
                          transition: 'background-color 150ms ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                            {n.title}
                          </div>
                          {!n.read && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-teal)' }} />
                          )}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.35, fontSize: '0.75rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                          {n.timestamp}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="btn-outline-navy btn-sm"
            style={{ width: '36px', height: '36px', padding: 0 }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={onResetDemo}
            className="btn-outline-navy btn-sm"
            style={{ width: '36px', height: '36px', padding: 0 }}
            title="Reset platform demo dataset"
          >
            <RotateCcw size={15} />
          </button>

          {/* User Profile Avatar */}
          {currentPersona !== 'guest' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '6px',
                borderLeft: '1px solid var(--border-color)'
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: currentPersona === 'driver' ? 'var(--brand-teal)' : 'var(--brand-amber)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem'
                }}
              >
                {currentPersona === 'driver' ? 'RK' : 'PS'}
              </div>
              <div style={{ display: 'none', lineHeight: 1.2 }} className="desktop-user-label">
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {currentPersona === 'driver' ? 'Rajesh Kumar' : 'Priya Sharma'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {currentPersona === 'driver' ? 'Fleet Owner' : 'Retailer'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
