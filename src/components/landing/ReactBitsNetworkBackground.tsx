import React, { useEffect, useRef } from 'react';

export const ReactBitsNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Vibrant colorful nodes representing active freight corridors
    const colors = ['#0D9488', '#2563EB', '#D97706', '#059669', '#8B5CF6'];
    const nodes = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 3.5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw dynamic connecting flow lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.35;
            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            gradient.addColorStop(0, nodes[i].color);
            gradient.addColorStop(1, nodes[j].color);

            ctx.strokeStyle = gradient;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Draw animated glowing nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const currentRadius = node.radius + Math.sin(node.pulse) * 0.8;

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = node.color;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden', borderRadius: '16px', backgroundColor: 'var(--surface-2)' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          padding: '12px 16px',
          backgroundColor: 'var(--surface-card)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem'
        }}
      >
        <div>
          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>ReactBits Freight Intelligence Network</strong>
          <span style={{ color: 'var(--text-secondary)' }}>NH44 & NH163 Active Backhaul Corridors</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0D9488', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};
