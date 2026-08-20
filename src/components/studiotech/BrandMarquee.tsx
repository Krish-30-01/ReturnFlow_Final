import React from 'react';

const BRANDS = [
  { name: 'Aeco', category: 'Sensors' },
  { name: 'Beckhoff', category: 'Automation' },
  { name: 'Control Techniques', category: 'Drives' },
  { name: 'Italcoppia', category: 'Temperature' },
  { name: 'Pilz', category: 'Safety' },
  { name: 'SICK', category: 'Sensor Intelligence' },
  { name: 'Yaskawa', category: 'Robotics & Motion' },
];

export const BrandMarquee: React.FC = () => {
  return (
    <section aria-label="Available brands" className="w-full bg-black py-8 border-y border-white/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#555555]">
          Available Brands & Manufacturers
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="animate-marquee flex gap-4 pr-4">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
            <div
              key={idx}
              className="group grid h-16 min-w-[180px] place-items-center rounded-lg border border-white/10 bg-[#0a0a0a] px-6 transition hover:border-[#ff7400] hover:bg-[#111111]"
            >
              <div className="text-center">
                <span className="font-sans font-bold text-sm tracking-wider uppercase text-white/70 group-hover:text-[#ff7400] transition">
                  {brand.name}
                </span>
                <span className="block font-mono text-[9px] uppercase text-[#555555] mt-0.5">
                  {brand.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
