import { useEffect, useRef, useState } from 'react';

export function useIdleLogout({ timeoutMs = 30 * 60 * 1000, warnBeforeMs = 60 * 1000, onLogout }: { timeoutMs?: number; warnBeforeMs?: number; onLogout: () => void }) {
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      const warnAt = timeoutMs - warnBeforeMs;
      timerRef.current = window.setTimeout(() => {
        setShowWarning(true);
        window.setTimeout(() => {
          setShowWarning(false);
          onLogout();
        }, warnBeforeMs);
      }, warnAt);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [onLogout, timeoutMs, warnBeforeMs]);

  return { showWarning, keepSignedIn: () => setShowWarning(false) };
}
