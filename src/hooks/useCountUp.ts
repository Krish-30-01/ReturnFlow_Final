import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  target: number,
  duration: number = 1500,
  decimals: number = 0
): number {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    prevTargetRef.current = target;

    const startValue = current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startValue + (target - startValue) * eased;
      setCurrent(parseFloat(value.toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, decimals]);

  return current;
}
