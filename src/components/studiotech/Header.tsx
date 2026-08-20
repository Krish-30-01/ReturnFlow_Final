import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, ArrowUpRight, Command } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenSearch }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div 
        id="site-announcement"
        className="flex min-h-9 items-center justify-center gap-3 border-b border-white/10 bg-black px-4 py-2 text-center text-[11px] text-[#888888]"
      >
        <span>Automation intelligence for industrial teams.</span>
        <a 
          href="#catalog"
          className="rounded-md border border-white/10 px-3 py-1 text-[10px] font-medium text-[#888888] transition hover:border-white/20 hover:text-white flex items-center gap-1"
        >
          Open catalog <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      {/* Main Navigation Header */}
      <header
        className={`sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b px-4 py-3 transition-all duration-300 sm:px-6 lg:min-h-16 lg:grid-cols-[minmax(0,1fr)_minmax(220px,560px)_minmax(0,1fr)] lg:gap-4 lg:px-8 ${
          scrolled
            ? 'border-white/10 bg-black/80 backdrop-blur-md shadow-2xl'
            : 'border-transparent bg-transparent backdrop-blur-none'
        }`}
      >
        {/* Left: Brand Logo & Links */}
        <div className="order-1 flex min-w-0 items-center gap-6 lg:order-none">
          <a href="#" className="flex items-center gap-2 group">
            <div className="bg-[#ff7400] text-black font-extrabold text-xs px-2 py-1 rounded tracking-wider uppercase">
              STUDIO
            </div>
            <span className="font-semibold text-lg tracking-tight text-white group-hover:text-[#ff7400] transition">
              TECH
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-xs text-[#888888] xl:flex">
            <a className="transition hover:text-white" href="#about">About us</a>
            <a className="transition hover:text-white" href="#catalog">Catalog</a>
            <a className="transition hover:text-white" href="#services">Services</a>
          </nav>
        </div>

        {/* Center: Search Trigger */}
        <div className="order-3 col-span-2 mx-auto w-full lg:order-none lg:col-span-1">
          <button
            onClick={onOpenSearch}
            className="group flex w-full items-center gap-3 rounded-lg border px-4 text-left text-sm transition min-h-11 border-white/10 bg-[#0a0a0a] text-[#555555] hover:border-white/20 hover:text-[#888888]"
            type="button"
          >
            <span className="transition group-hover:text-[#ff7400]">
              <Search className="h-4 w-4" />
            </span>
            <span className="flex-1 text-xs sm:text-sm">Search part codes, brands (e.g. SICK, Beckhoff)...</span>
            <span className="hidden rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] md:flex items-center gap-1">
              <Command className="w-3 h-3" /> K
            </span>
          </button>
        </div>

        {/* Right: Action Items */}
        <div className="order-2 flex items-center justify-end gap-2 text-xs text-[#888888] sm:gap-3 lg:order-0 lg:gap-6">
          <a className="hidden transition hover:text-white lg:inline" href="#spare-parts">
            Spare parts
          </a>
          <a className="hidden transition hover:text-white lg:inline" href="#support">
            Support
          </a>
          <button 
            aria-label="Account"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#888888] transition hover:border-white/20 hover:text-white"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#888888] transition hover:border-white/20 hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff7400] text-[9px] font-bold text-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
};
