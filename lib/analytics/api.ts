// Types et client API pour les données analytiques.
// La structure du JSON est calculée par le notebook Fabric PySpark.

import { APIM_BASE_URL, ANALYTICS_PATH } from "@/lib/demo/config";

export interface CustomerKpi {
  customerId: string;
  revenue: number;
  orderCount: number;
}

export interface DailyKpi {
  date: string; // ISO date YYYY-MM-DD
  orderCount: number;
  revenue: number;
}

export interface KpiBlock {
  totalOrders: number;
  totalRevenue: number;
  averageBasket: number;
  topCustomers: CustomerKpi[];
  ordersPerDay: DailyKpi[];
  peakHour: number | null;
}

export interface AnalyticsSummary {
  generatedAt: string; // ISO timestamp
  sourceContainer: string;
  sourceRecordCount: number;
  withDemoData: KpiBlock;
  withoutDemoData: KpiBlock;
}

export interface NotComputedResponse {
  error: "not_yet_computed";
  message: string;
}

export type AnalyticsFetchResult =
  | { kind: "ok"; data: AnalyticsSummary; lastModified: string | null }
  | { kind: "not-yet"; message: string }
  | { kind: "error"; message: string };

export async function fetchAnalyticsSummary(): Promise<AnalyticsFetchResult> {
  const url = `${APIM_BASE_URL}${ANALYTICS_PATH}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const lastModified = response.headers.get("X-Snapshot-LastModified");
    const text = await response.text();

    if (response.status === 404) {
      try {
        const errorBody = JSON.parse(text) as NotComputedResponse;
        return { kind: "not-yet", message: errorBody.message };
      } catch {
        return { kind: "not-yet", message: "Snapshot non disponible." };
      }
    }

    if (!response.ok) {
      return {
        kind: "error",
        message: `HTTP ${response.status} · ${text.slice(0, 200)}`,
      };
    }

    const data = JSON.parse(text) as AnalyticsSummary;
    return { kind: "ok", data, lastModified };
  } catch (err) {
    return {
      kind: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Format a number like 1234.56 → "1 234,56 €" (French locale) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an integer like 1247 → "1 247" */
export function formatInteger(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n));
}

/** Relative time: "il y a 12 minutes" */
export function formatRelativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);

  if (diffSec < 60) return "à l'instant";
  if (diffSec < 3600) {
    const m = Math.round(diffSec / 60);
    return `il y a ${m} min`;
  }
  if (diffSec < 86400) {
    const h = Math.round(diffSec / 3600);
    return `il y a ${h}h`;
  }
  const d = Math.round(diffSec / 86400);
  return `il y a ${d} jour${d > 1 ? "s" : ""}`;
}
