import React from 'react';
import { CheckCircle2, Clock, Wrench } from 'lucide-react';

export const FeaturesWarehouse: React.FC = () => {
  return (
    <section className="relative z-10 w-full overflow-hidden bg-black py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#ff7400]">
            From line downtime to quote
          </p>
          <h2 className="font-sans text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Fast industrial solutions for complex problems.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Card 1: Warehouse Immediate Availability */}
          <article className="grid min-h-[28rem] overflow-hidden rounded-xl border border-white/10 bg-[#151515] p-6 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Visual Animation Box */}
            <div className="relative min-h-[200px] flex items-center justify-center bg-black/60 rounded-lg p-4 border border-white/5 overflow-hidden">
              <div className="grid grid-cols-7 gap-2 w-full max-w-[240px]">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const isHighlighted = [3, 8, 12, 17, 21, 25].includes(idx);
                  const isFalling = [4, 11, 19].includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`h-6 rounded transition-all duration-500 ${
                        isHighlighted
                          ? 'bg-[#ff7400]/80 shadow-[0_0_8px_#ff7400]'
                          : isFalling
                          ? 'bg-white warehouse-falling-block'
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff7400]">
                  Warehouse
                </p>
                <h3 className="mt-3 text-3xl font-semibold leading-tight text-white">
                  Immediate availability
                </h3>
                <p className="mt-4 text-xs leading-5 text-[#888888]">
                  Wide stock availability of parts including obsolete and hard-to-find legacy industrial brands.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-[#888888]">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff7400]" />
                    Fast and efficient worldwide delivery
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff7400]" />
                    Experienced and qualified technical staff
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff7400]" />
                    Direct verified OEM replacements
                  </li>
                </ul>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-widest text-[#666666]">
                <div>
                  <p className="text-2xl font-bold normal-case text-white">1000+</p>
                  <p className="mt-1">Items in stock</p>
                </div>
                <div>
                  <p className="text-2xl font-bold normal-case text-[#ff7400]">H24</p>
                  <p className="mt-1">Technical response</p>
                </div>
              </div>
            </div>
          </article>

          {/* Column 2: Assistance & Repair Cards */}
          <div className="grid gap-6">
            {/* Card 2: H24 Breakdown Assistance */}
            <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#111111] p-6 hover:border-white/20 transition">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#888888]">
                  Assistance
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  H24 breakdown support
                </h3>
                <p className="mt-3 text-xs leading-5 text-[#777777]">
                  Machine downtime stops production and creates cost. We dispatch urgent replacement items immediately.
                </p>
              </div>

              {/* Chat Bubble Loop Visual */}
              <div className="mt-6 rounded-lg bg-black/60 border border-white/10 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-red-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>[02:14 AM] Line 3 PLC Fault Detected</span>
                </div>
                <div className="flex items-center gap-2 text-green-400 pl-4 border-l border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>[02:16 AM] Replacement Dispatched</span>
                </div>
              </div>
            </article>

            {/* Card 3: Repair & Diagnostics */}
            <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#111111] p-6 hover:border-white/20 transition">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#888888]">
                  Repair Service
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Certified Component Repair
                </h3>
              </div>

              {/* Conveyor Visual */}
              <div className="mt-6 relative h-12 bg-black/60 rounded-lg border border-white/10 overflow-hidden flex items-center px-4">
                <div className="w-full flex items-center justify-between font-mono text-[11px] text-[#ff7400]">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" /> Inspecting
                  </span>
                  <div className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-red-500 via-[#ff7400] to-green-500 relative">
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-conveyor" />
                  </div>
                  <span className="text-green-400 font-bold">100% Tested</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};
