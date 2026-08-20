import React, { useState } from 'react';
import './studiotech.css';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FeaturesWarehouse } from './FeaturesWarehouse';
import { BrandMarquee } from './BrandMarquee';
import { ProductCatalog, ProductItem } from './ProductCatalog';
import { CartModal, CartItem } from './CartModal';
import { Search, X, CheckCircle2 } from 'lucide-react';

export const StudioTechApp: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showNotification(`Added ${product.code} to quote request`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const handleCheckout = () => {
    setCart([]);
    setIsCartOpen(false);
    showNotification('Quote request successfully sent to StudioTech H24 team!');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="studiotech-root selection:bg-[#ff7400] selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-[#ff7400] bg-[#0a0a0a] px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#ff7400]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Page Content */}
      <main>
        <HeroSection />
        <FeaturesWarehouse />
        <BrandMarquee />
        <ProductCatalog onAddToCart={handleAddToCart} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 px-6 lg:px-10 text-xs text-[#666666]">
        <div className="mx-auto max-w-7xl grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#ff7400] text-black font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                STUDIO
              </span>
              <span className="font-bold text-white text-sm">TECH</span>
            </div>
            <p className="text-[11px] text-[#555555]">
              Premium platform and distribution for electrical and electronic automation materials.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase text-[#888888] mb-3">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">24/7 Breakdown Response</a></li>
              <li><a href="#" className="hover:text-white transition">Certified Module Repair</a></li>
              <li><a href="#" className="hover:text-white transition">Obsolete Parts Sourcing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase text-[#888888] mb-3">Catalog</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Sensors & Optics</a></li>
              <li><a href="#" className="hover:text-white transition">Drives & Servo Motors</a></li>
              <li><a href="#" className="hover:text-white transition">Safety Relays & PLC</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase text-[#888888] mb-3">Contact</h4>
            <p className="text-[#555555]">StudioTech Automation Intelligence</p>
            <p className="mt-1 text-[#ff7400] font-mono">support@studiotech-automation.com</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} StudioTech Automation Intelligence. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Search className="w-4 h-4 text-[#ff7400]" />
              <input
                type="text"
                autoFocus
                placeholder="Search by part number, brand, or component..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-[#555555]"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-8 text-center text-xs text-[#666666] font-mono">
              {searchQuery ? `Searching for "${searchQuery}"...` : 'Type to search parts, e.g. SICK, UNI1402, Yaskawa'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
