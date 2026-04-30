import { useState, useEffect, useRef, useCallback } from 'react';
import type { MLPipelineResult } from '@/lib/healthcareML';
import { runMLPipeline } from '@/lib/healthcareML';

/**
 * useMLWorker — Runs the ML pipeline in a Web Worker when available,
 * with a synchronous fallback for environments that don't support workers.
 */
export function useMLWorker(data: Record<string, unknown>[] | null) {
  const [result, setResult] = useState<MLPipelineResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const dataRef = useRef<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    if (!data?.length) { setResult(null); dataRef.current = null; return; }
    if (dataRef.current === data) return; // same reference → skip

    let cancelled = false;
    setIsRunning(true);
    setResult(null);

    // Try Web Worker first
    try {
      const worker = new Worker(
        new URL('@/lib/ml.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent) => {
        if (cancelled) return;
        if (e.data.type === 'result') {
          dataRef.current = data;
          setResult(e.data.payload);
          setIsRunning(false);
        } else if (e.data.type === 'error') {
          console.error('ML Worker error:', e.data.payload);
          // Fallback to main thread
          fallbackSync();
        }
        worker.terminate();
      };

      worker.onerror = () => {
        if (cancelled) return;
        console.warn('Web Worker failed, falling back to main thread');
        worker.terminate();
        fallbackSync();
      };

      worker.postMessage({ data });
    } catch {
      // Workers not supported — run synchronously
      fallbackSync();
    }

    function fallbackSync() {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        try {
          const r = runMLPipeline(data!);
          dataRef.current = data;
          setResult(r);
        } catch (e) { console.error('ML Pipeline sync error:', e); }
        setIsRunning(false);
      }, 0);
    }

    return () => {
      cancelled = true;
      workerRef.current?.terminate();
    };
  }, [data]);

  return { result, isRunning };
}
