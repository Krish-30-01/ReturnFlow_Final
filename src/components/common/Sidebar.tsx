import React from 'react';
import {
  LayoutDashboard,
  Truck,
  PlusCircle,
  CalendarCheck,
  Wallet,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Package,
  CreditCard,
  Layers
} from 'lucide-react';
import { Persona } from '../../types/logistics';

interface SidebarProps {
  currentPersona: Persona;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSelectPersona: (persona: Persona) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPersona,
  currentPage,
  onNavigate,
  onSelectPersona
}) => {
  if (currentPersona === 'guest') return null;

  const isDriver = currentPersona === 'driver';

  const driverNavItems = [
    { id: 'driver-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'driver-trips', label: 'My Return Trips', icon: <Truck size={18} /> },
    { id: 'driver-post-trip', label: 'Post Return Trip', icon: <PlusCircle size={18} />, highlight: true },
    { id: 'tracking', label: 'Active Live Route', icon: <CalendarCheck size={18} /> },
    { id: 'driver-earnings', label: 'Earnings & Payouts', icon: <Wallet size={18} /> }
  ];

  const customerNavItems = [
    { id: 'customer-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'customer-loads', label: 'My Loads', icon: <Package size={18} /> },
    { id: 'customer-post-load', label: 'Post Load Request', icon: <PlusCircle size={18} />, highlight: true },
    { id: 'matches', label: 'Browse Matches', icon: <Layers size={18} /> },
    { id: 'tracking', label: 'Live Tracking', icon: <CalendarCheck size={18} /> }
  ];

  const currentNavItems = isDriver ? driverNavItems : customerNavItems;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        flexShrink: 0,
        transition: 'all var(--dur-base)'
      }}
      className="app-sidebar"
    >
      {/* Top Navigation Links */}
      <div>
        <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            {isDriver ? 'Driver Partner Workspace' : 'Retailer Workspace'}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {isDriver ? 'Rajesh Kumar Fleet' : 'Apex Retail Hubs'}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {currentNavItems.map((item) => {
            const isActive = currentPage === item.id || (item.id === 'driver-trips' && currentPage === 'driver-trip-details') || (item.id === 'customer-loads' && currentPage === 'customer-load-details');
            const activeBg = isDriver ? 'var(--brand-teal-light)' : 'var(--brand-amber-light)';
            const activeColor = isDriver ? 'var(--brand-teal)' : 'var(--brand-amber)';
            const activeBorder = isDriver ? 'var(--brand-teal)' : 'var(--brand-amber)';

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? activeBg : 'transparent',
                  color: isActive ? 'var(--brand-navy)' : 'var(--text-secondary)',
                  borderLeft: isActive ? `3.5px solid ${activeBorder}` : '3.5px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  justifyContent: 'flex-start',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <span style={{ color: isActive ? activeColor : 'var(--text-secondary)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Supporting & Logout Links */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => {
            onSelectPersona('guest');
            onNavigate('home');
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--brand-coral)',
            fontSize: '0.875rem',
            fontWeight: 500,
            justifyContent: 'flex-start'
          }}
        >
          <LogOut size={18} />
          <span>Exit to Public Portal</span>
        </button>
      </div>
    </aside>
  );
};
