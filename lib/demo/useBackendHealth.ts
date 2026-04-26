"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { APIM_BASE_URL, HEALTH_PATH, HEALTH_TIMEOUT_MS, HEALTH_RECHECK_INTERVAL_MS } from "./config";

export type HealthStatus = "checking" | "healthy" | "unavailable";

export interface HealthState {
  status: HealthStatus;
  /** ISO timestamp of the last successful or failed check */
  lastCheckedAt: string | null;
  /** Latency in ms of the last successful check (null if not measured or failed) */
  latencyMs: number | null;
  /** Manually trigger a re-check (e.g. when user clicks "Retry") */
  recheck: () => void;
}

/**
 * Hook that pings the /health endpoint on mount and periodically.
 *
 * Behavior:
 *   - Initial state: "checking" (shows a neutral indicator)
 *   - On successful 200 within timeout: "healthy"
 *   - On any error (timeout, 5xx, network): "unavailable"
 *
 * Re-checks every HEALTH_RECHECK_INTERVAL_MS in case the user leaves
 * the page open. Can be manually re-triggered via the recheck() callback.
 */
export function useBackendHealth(): HealthState {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Track if the component is still mounted to avoid setState after unmount
  const mountedRef = useRef(true);

  const performCheck = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus("checking");

    const url = `${APIM_BASE_URL}${HEALTH_PATH}`;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    const startedAt = performance.now();
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        // Avoid browser cache so we always hit the live endpoint
        cache: "no-store",
      });
      window.clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startedAt);

      if (!mountedRef.current) return;
      setLastCheckedAt(new Date().toISOString());

      if (response.ok) {
        setStatus("healthy");
        setLatencyMs(elapsed);
      } else {
        setStatus("unavailable");
        setLatencyMs(null);
      }
    } catch {
      window.clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      setStatus("unavailable");
      setLatencyMs(null);
      setLastCheckedAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    performCheck();

    // Periodic re-check
    const intervalId = window.setInterval(performCheck, HEALTH_RECHECK_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [performCheck]);

  return {
    status,
    lastCheckedAt,
    latencyMs,
    recheck: performCheck,
  };
}
