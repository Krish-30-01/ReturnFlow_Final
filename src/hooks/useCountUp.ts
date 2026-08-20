import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp - animates a number from 0 to target on mount (or when target changes),
 * with easeOutQuad easing and IntersectionObserver to trigger only when visible.
 */
export function useCountUp(
  target: number,
  duration: number = 1800,
  decimals: number = 0
): number {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const steps = 60;
    const intervalTime = duration / steps;
    let step = 0;

    ref.current = window.setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = +(target * eased).toFixed(decimals);
      setCount(current);
      if (step >= steps) {
        clearInterval(ref.current);
        setCount(target);
      }
    }, intervalTime);

    return () => clearInterval(ref.current);
  }, [target, duration, decimals]);

  return count;
}
