// ═══════════════════════════════════════════════════════════════
// ML Web Worker — Offloads runMLPipeline to a background thread
// so the main UI thread stays responsive during computation.
// ═══════════════════════════════════════════════════════════════
import { runMLPipeline } from './healthcareML';

self.onmessage = (e: MessageEvent) => {
  const { data } = e.data as { data: Record<string, unknown>[] };
  try {
    const result = runMLPipeline(data);
    self.postMessage({ type: 'result', payload: result });
  } catch (err) {
    self.postMessage({ type: 'error', payload: String(err) });
  }
};
