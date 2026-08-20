import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

export interface ProductItem {
  id: string;
  brand: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: 'In Stock' | 'Limited' | 'Special Order';
  accentColor: string;
}

export const PRODUCTS: ProductItem[] = [
  {
    id: 'ct-uni1402',
    brand: 'Control Techniques',
    code: 'UNI1402',
    name: 'Unidrive SP AC Drive Module',
    category: 'Frequency Inverter',
    stock: 8,
    price: '€1,240.00',
    status: 'In Stock',
    accentColor: '#0056a7',
  },
  {
    id: 'yaskawa-sgmph',
    brand: 'Yaskawa',
    code: 'SGMPH-02AAA21',
    name: 'Sigma II AC Servo Motor',
    category: 'Servo Motion',
    stock: 5,
    price: '€890.00',
    status: 'In Stock',
    accentColor: '#ff7400',
  },
  {
    id: 'sick-microscan3',
    brand: 'SICK',
    code: 'MICS3-ABAZ40IZ1',
    name: 'microScan3 Core Safety Laser Scanner',
    category: 'Optical Sensors',
    stock: 3,
    price: '€2,150.00',
    status: 'Limited',
    accentColor: '#00a3e0',
  },
  {
    id: 'pilz-pnoz-s4',
    brand: 'Pilz',
    code: '750104 PNOZ s4',
    name: 'PNOZsigma Safety Relay 24VDC',
    category: 'Safety Control',
    stock: 14,
    price: '€210.00',
    status: 'In Stock',
    accentColor: '#e30613',
  },
  {
    id: 'beckhoff-kl3204',
    brand: 'Beckhoff',
    code: 'KL3204',
    name: '4-Channel Analog Input Terminal PT100',
    category: 'I/O Modules',
    stock: 12,
    price: '€175.00',
    status: 'In Stock',
    accentColor: '#e2001a',
  },
  {
    id: 'aeco-si12',
    brand: 'Aeco',
    code: 'SI12-CE4 NPN NO',
    name: 'Inductive Proximity Sensor M12',
    category: 'Sensors',
    stock: 25,
    price: '€45.00',
    status: 'In Stock',
    accentColor: '#ff7400',
  },
];

interface ProductCatalogProps {
  onAddToCart: (product: ProductItem) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToCart }) => {
  const [activeTab, setActiveTab] = useState('Catalog');

  return (
    <section id="catalog" className="relative z-20 mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-end mb-12">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#ff7400]">
            Industrial catalog
          </p>
          <h2 className="font-sans text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Real components, operational context, fast response.
          </h2>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <a
            href="#catalog-full"
            className="inline-flex w-fit items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ff7400] transition hover:text-white"
          >
            View full 1,000+ catalog <ArrowRight className="w-4 h-4" />
          </a>
          
          {/* Tab buttons */}
          <div className="flex overflow-x-auto rounded-lg border border-white/10 bg-[#0a0a0a] p-1 text-xs font-medium text-[#888888]">
            {['Catalog', 'Procurement', 'Spare parts', 'Telemetry', 'Suppliers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-9 whitespace-nowrap px-4 py-2 rounded-md transition ${
                  activeTab === tab
                    ? 'bg-[#ff7400] text-white font-semibold'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <article
            key={product.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] p-5 transition duration-300 hover:border-white/20 hover:bg-[#111111]"
          >
            <div>
              {/* Product Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
                  {product.brand}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: product.accentColor }}
                />
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff7400]">
                  {product.code}
                </p>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#ff7400] transition">
                  {product.name}
                </h3>
                <p className="text-xs text-[#666666]">{product.category}</p>
              </div>
            </div>

            {/* Product Footer & Action */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="block font-mono text-[10px] uppercase text-[#666666]">
                  {product.stock} pcs available
                </span>
                <span className="text-sm font-bold text-white">{product.price}</span>
              </div>

              <button
                onClick={() => onAddToCart(product)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#888888] transition hover:border-[#ff7400] hover:bg-[#ff7400] hover:text-white"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
