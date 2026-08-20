import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductItem } from './ProductCatalog';

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => {
    const rawPrice = parseFloat(item.product.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + rawPrice * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Cart Header */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#ff7400]" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Industrial Procurement Cart
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#888888] hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="text-center py-12 text-[#666666] font-mono text-xs">
                Your industrial quote cart is currently empty.
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-[#111111]"
                >
                  <div className="flex-1 pr-3">
                    <span className="font-mono text-[10px] uppercase text-[#ff7400] font-bold block">
                      {product.code}
                    </span>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[200px]">
                      {product.name}
                    </h4>
                    <span className="text-[11px] text-[#888888]">{product.price}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-white/10 rounded overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="px-2 py-0.5 text-xs text-[#888888] hover:bg-white/10 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono text-white">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="px-2 py-0.5 text-xs text-[#888888] hover:bg-white/10 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Footer */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs text-[#888888] uppercase">Estimated Subtotal:</span>
            <span className="text-xl font-bold text-white">€{total.toFixed(2)}</span>
          </div>

          <button
            disabled={items.length === 0}
            onClick={onCheckout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#ff7400] text-black font-bold uppercase text-xs tracking-wider transition hover:bg-[#e66900] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quote / Order Request <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
