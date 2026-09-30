import { useCallback, useRef, useState } from 'react';

export function useAsync<T>(asyncFn: () => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const result = await asyncFn();
      if (controller.signal.aborted) return undefined;
      return result;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [asyncFn]);

  return { run, loading };
}
