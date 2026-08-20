import React, { useEffect, useState } from 'react';
import { useCountUp } from '../../hooks/useCountUp';

interface AnimatedProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

/**
 * AnimatedProgressRing — circular SVG ring gauge that fills to `score` %
 * on mount with a smooth CSS transition.
 *
 * Color bands:
 *  - Green/Teal  ≥ 90
 *  - Amber       70-89
 *  - Red/Coral   < 70
 */
export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  score,
  size = 72,
  strokeWidth = 5,
  label
}) => {
  const [mounted, setMounted] = useState(false);
  const animatedScore = useCountUp(score, 1400, 0);

  useEffect(() => {
    // Trigger stroke animation after first paint
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = mounted ? circumference * (1 - score / 100) : circumference;

  // Color band
  let ringColor: string;
  let glowColor: string;
  let bgRingColor: string;
  let labelText: string;

  if (score >= 90) {
    ringColor = '#1D9E75';
    glowColor = 'rgba(29, 158, 117, 0.35)';
    bgRingColor = 'rgba(29, 158, 117, 0.12)';
    labelText = label || 'Excellent';
  } else if (score >= 70) {
    ringColor = '#BA7517';
    glowColor = 'rgba(186, 117, 23, 0.35)';
    bgRingColor = 'rgba(186, 117, 23, 0.12)';
    labelText = label || 'Good';
  } else {
    ringColor = '#D85A30';
    glowColor = 'rgba(216, 90, 48, 0.35)';
    bgRingColor = 'rgba(216, 90, 48, 0.12)';
    labelText = label || 'Partial';
  }

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgRingColor}
          strokeWidth={strokeWidth}
        />
        {/* Animated progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            filter: `drop-shadow(0 0 6px ${glowColor})`
          }}
        />
      </svg>

      {/* Center score text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            fontSize: size >= 72 ? '1.125rem' : '0.875rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: ringColor,
            lineHeight: 1
          }}
        >
          {animatedScore}%
        </span>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: 1,
            marginTop: '2px'
          }}
        >
          {labelText}
        </span>
      </div>
    </div>
  );
};
