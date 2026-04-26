"use client";

import { createContext, useContext, ReactNode } from "react";
import { useBackendHealth, type HealthState } from "@/lib/demo/useBackendHealth";

const BackendHealthContext = createContext<HealthState | null>(null);

export function BackendHealthProvider({ children }: { children: ReactNode }) {
  const health = useBackendHealth();
  return (
    <BackendHealthContext.Provider value={health}>
      {children}
    </BackendHealthContext.Provider>
  );
}

/**
 * Read the shared backend health status. Returns a "checking" placeholder
 * if used outside the provider (defensive — should never happen in practice).
 */
export function useSharedBackendHealth(): HealthState {
  const ctx = useContext(BackendHealthContext);
  if (!ctx) {
    return {
      status: "checking",
      lastCheckedAt: null,
      latencyMs: null,
      recheck: () => {},
    };
  }
  return ctx;
}
