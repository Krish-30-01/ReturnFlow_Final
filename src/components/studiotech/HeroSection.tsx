import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    const starCount = 180;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const render = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= 2.5;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 256 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = 1 - star.z / width;
          const isOrange = Math.random() < 0.15;
          ctx.fillStyle = isOrange ? `rgba(255, 116, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(px, py, star.size * k * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-black flex flex-col justify-center">
      {/* Background Interactive Hyperspeed Canvas */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="h-full w-full opacity-60" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-center">
          <div>
            <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#ff7400]">
              Industrial Procurement & Automation
            </p>
            <h1 className="font-sans text-4xl font-semibold uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              INDUSTRIAL AUTOMATION.
              <span className="block text-white/70 mt-2">
                THE SPEED THAT GETS YOU MOVING AGAIN.
              </span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-[#ff7400] hover:text-white"
              >
                Explore catalog
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#quote"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#ff7400] hover:text-[#ff7400]"
              >
                Request a quote
              </a>
            </div>
          </div>

          <div className="max-w-xs justify-self-start text-left lg:justify-self-end border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
            <p className="text-xs leading-6 text-white/70 sm:text-sm">
              Search codes, brands, and alternatives. StudioTech checks stock, repairs, and fast deliveries to eliminate machine downtime.
            </p>
            <div className="mt-6 flex gap-6 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff7400] pulse-dot"></span>
                H24 support
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Verified stock
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
