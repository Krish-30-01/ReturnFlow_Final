import React, { useEffect, useRef } from 'react';

const CORRIDORS_GEO = [
  { name: 'HYD-BLR (NH44)', color: '#1D9E75', coords: [[17.385,78.4867],[16.766,78.14],[15.828,78.037],[14.682,77.6],[13.433,77.727],[12.972,77.595]] },
  { name: 'HYD-WAR (NH163)', color: '#2DD4BF', coords: [[17.385,78.4867],[17.511,78.889],[17.728,79.156],[17.969,79.594]] },
  { name: 'HYD-MUM (NH65)', color: '#38BDF8', coords: [[17.385,78.4867],[18.0,77.5],[18.5,76.5],[19.076,72.877]] },
  { name: 'DEL-MUM (NH48)', color: '#F59E0B', coords: [[28.614,77.209],[26.912,75.787],[25.214,75.865],[23.176,75.788],[19.076,72.877]] },
  { name: 'CHE-BLR (NH48)', color: '#BA7517', coords: [[13.083,80.271],[12.823,79.7],[12.972,77.595]] },
];

export const HighwayCorridorTelemetryMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef<number[]>(CORRIDORS_GEO.map(() => 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    // Bounds: India roughly lat 8-35, lng 68-97
    const LAT_MIN = 8, LAT_MAX = 35, LNG_MIN = 68, LNG_MAX = 97;

    function project(lat: number, lng: number): [number, number] {
      const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
      const y = H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * H;
      return [x, y];
    }

    let frame = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Draw corridors
      CORRIDORS_GEO.forEach((corridor, ci) => {
        const coords = corridor.coords as [number, number][];
        ctx!.beginPath();
        coords.forEach(([lat, lng], i) => {
          const [x, y] = project(lat, lng);
          if (i === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y);
        });
        ctx!.strokeStyle = corridor.color + '55';
        ctx!.lineWidth = 1.5;
        ctx!.setLineDash([4, 4]);
        ctx!.stroke();
        ctx!.setLineDash([]);

        // Animated truck dot
        const prog = progressRef.current[ci];
        const total = coords.length - 1;
        const segIdx = Math.floor(prog * total);
        const segFrac = (prog * total) - segIdx;
        const safe = Math.min(segIdx, total - 1);
        const [lat1, lng1] = coords[safe];
        const [lat2, lng2] = coords[safe + 1] ?? coords[safe];
        const lat = lat1 + (lat2 - lat1) * segFrac;
        const lng = lng1 + (lng2 - lng1) * segFrac;
        const [tx, ty] = project(lat, lng);

        ctx!.beginPath();
        ctx!.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx!.fillStyle = corridor.color;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx!.strokeStyle = corridor.color + '88';
        ctx!.lineWidth = 1;
        ctx!.stroke();

        progressRef.current[ci] = (prog + 0.001) % 1;
      });

      // City dots
      const cities = [
        { name: 'HYD', lat: 17.385, lng: 78.487 }, { name: 'BLR', lat: 12.972, lng: 77.595 },
        { name: 'MUM', lat: 19.076, lng: 72.877 }, { name: 'DEL', lat: 28.614, lng: 77.209 },
        { name: 'CHE', lat: 13.083, lng: 80.271 }, { name: 'WAR', lat: 17.969, lng: 79.594 },
      ];
      cities.forEach(city => {
        const [x, y] = project(city.lat, city.lng);
        ctx!.beginPath();
        ctx!.arc(x, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fill();
        ctx!.fillStyle = 'rgba(255,255,255,0.7)';
        ctx!.font = '8px IBM Plex Mono, monospace';
        ctx!.fillText(city.name, x + 5, y + 3);
      });

      frame++;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ position: 'relative', height: '320px', backgroundColor: '#0A0F1D', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CORRIDORS_GEO.map(c => (
          <span key={c.name} style={{ fontSize: '0.5625rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: c.color + '22', color: c.color, border: `1px solid ${c.color}44`, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{c.name}</span>
        ))}
      </div>
    </div>
  );
};
