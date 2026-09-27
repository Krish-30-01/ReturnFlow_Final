import React, { useEffect, useState } from 'react';

interface AnimatedProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  score, size = 76, strokeWidth = 5, label
}) => {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 80);
    return () => clearTimeout(timer);
  }, [score]);

  const color = score >= 80 ? '#1D9E75' : score >= 60 ? '#BA7517' : '#D85A30';
  const bgColor = score >= 80 ? 'rgba(29,158,117,0.12)' : score >= 60 ? 'rgba(186,117,23,0.12)' : 'rgba(216,90,48,0.1)';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill={bgColor}
          stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1
      }}>
        <span style={{ fontSize: size < 55 ? '0.75rem' : '1rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
          {displayed}%
        </span>
        {label && <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{label}</span>}
      </div>
    </div>
  );
};
