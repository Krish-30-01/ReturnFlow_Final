import React, { useEffect, useState } from 'react';

interface IntroScreenProps { onComplete: () => void; }

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'logo' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 2500);
    const t2 = setTimeout(() => setPhase('exit'), 4000);
    const t3 = setTimeout(() => onComplete(), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#042C53',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', overflow: 'hidden',
      transition: phase === 'exit' ? 'transform 0.5s cubic-bezier(0.76,0,0.24,1)' : 'none',
      transform: phase === 'exit' ? 'translateY(-100%)' : 'translateY(0)',
    }}>
      <style>{`
        @keyframes roadDraw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes truckDrive { 0% { transform: translateX(-120px); opacity: 0; } 8% { opacity: 1; } 100% { transform: translateX(calc(100vw + 120px)); opacity: 1; } }
        @keyframes dotRun { 0% { transform: translateX(-200%); } 100% { transform: translateX(200vw); } }
        @keyframes logoReveal { from { opacity: 0; transform: scale(0.82) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes taglineReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); } 50% { box-shadow: 0 0 40px 12px rgba(29,158,117,0.35); } }
      `}</style>

      {/* Road strip */}
      <div style={{ position: 'absolute', bottom: '38%', left: 0, right: 0, height: '3px', backgroundColor: 'rgba(255,255,255,0.12)', transformOrigin: 'left center', animation: 'roadDraw 0.7s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s both' }} />

      {/* Dashed centre line */}
      <div style={{ position: 'absolute', bottom: 'calc(38% - 1px)', left: 0, right: 0, height: '2px', overflow: 'hidden', opacity: 0.5 }}>
        <div style={{ height: '100%', width: '200vw', backgroundImage: 'repeating-linear-gradient(90deg, #1D9E75 0px, #1D9E75 40px, transparent 40px, transparent 70px)', animation: 'dotRun 2.2s linear 0.3s both' }} />
      </div>

      {/* Truck SVG */}
      <div style={{ position: 'absolute', bottom: 'calc(38% + 4px)', left: 0, animation: 'truckDrive 2.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.4s both' }}>
        <svg width="110" height="52" viewBox="0 0 110 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="8" width="72" height="32" rx="3" fill="#1D9E75" />
          <rect x="8" y="14" width="58" height="20" rx="2" fill="#16805E" opacity="0.6" />
          <text x="28" y="29" fontFamily="Arial" fontWeight="800" fontSize="11" fill="#FFFFFF" letterSpacing="1">RF</text>
          <rect x="74" y="14" width="32" height="26" rx="3" fill="#0A4070" />
          <rect x="80" y="17" width="18" height="14" rx="2" fill="#5DCAA5" opacity="0.7" />
          <rect x="100" y="8" width="4" height="10" rx="1" fill="#0A4070" />
          <circle cx="103" cy="6" r="3" fill="rgba(255,255,255,0.15)" />
          <rect x="104" y="28" width="5" height="12" rx="1" fill="#062040" />
          <circle cx="22" cy="42" r="8" fill="#1A1A2E" /><circle cx="22" cy="42" r="4" fill="#2D2D50" />
          <circle cx="50" cy="42" r="8" fill="#1A1A2E" /><circle cx="50" cy="42" r="4" fill="#2D2D50" />
          <circle cx="88" cy="42" r="7" fill="#1A1A2E" /><circle cx="88" cy="42" r="3.5" fill="#2D2D50" />
          <rect x="72" y="36" width="4" height="5" rx="1" fill="#062040" />
          <rect x="105" y="20" width="4" height="6" rx="1" fill="#FFE066" opacity="0.9" />
        </svg>
      </div>

      {/* Logo block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', opacity: phase === 'enter' ? 0 : 1, animation: phase !== 'enter' ? 'logoReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) both' : 'none', zIndex: 2 }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #1D9E75 0%, #042C53 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.75rem', color: '#FFFFFF', letterSpacing: '-1px', animation: phase !== 'enter' ? 'pulseGlow 2s ease-in-out 0.6s infinite' : 'none', boxShadow: '0 8px 32px rgba(29,158,117,0.3)' }}>RF</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-1.5px', lineHeight: 1, fontFamily: '"Outfit","Inter",sans-serif' }}>
            Return<span style={{ color: '#1D9E75' }}>Flow</span>
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', marginTop: '8px', letterSpacing: '0.5px', opacity: phase === 'logo' || phase === 'exit' ? 1 : 0, animation: phase === 'logo' || phase === 'exit' ? 'taglineReveal 0.5s ease-out 0.35s both' : 'none' }}>
            Bidirectional Freight Intelligence
          </div>
        </div>
        <div style={{ width: phase === 'logo' || phase === 'exit' ? '80px' : '0px', height: '3px', borderRadius: '2px', backgroundColor: '#1D9E75', transition: 'width 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.5s' }} />
      </div>

      {/* Corner dots */}
      {[{ top: '12%', left: '8%' }, { top: '12%', right: '8%' }, { bottom: '12%', left: '8%' }, { bottom: '12%', right: '8%' }].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1D9E75', opacity: 0.4 }} />
      ))}

      {/* Skip button */}
      <button onClick={onComplete} style={{ position: 'absolute', bottom: '28px', right: '28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.45)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.3px' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}>
        Skip intro
      </button>
    </div>
  );
};
