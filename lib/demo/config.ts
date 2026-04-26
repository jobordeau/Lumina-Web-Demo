// Configuration for the live demo. The APIM gateway URL is configurable
// via the NEXT_PUBLIC_APIM_BASE_URL environment variable, falling back to
// the deployed POC endpoint.

export const APIM_BASE_URL =
  process.env.NEXT_PUBLIC_APIM_BASE_URL?.replace(/\/$/, "") ||
  "https://apim-lumina-dev-jobordeau.azure-api.net";

export const ORDERS_PATH = "/ecommerce/orders";
export const HEALTH_PATH = "/ecommerce/health";

export const POLL_INTERVAL_MS = 2000;
export const POLL_MAX_ATTEMPTS = 35; // ~70s — enough for retry × 3 + DLQ chain

export const HEALTH_TIMEOUT_MS = 5000;
// Re-check health every 5 minutes (in case the user keeps the page open)
export const HEALTH_RECHECK_INTERVAL_MS = 5 * 60 * 1000;

// Generate a unique orderId per run, prefixed DEMO so portfolio test data
// can be easily distinguished from curl tests in the storage account.
// Includes millisecond precision + 8 random chars to guarantee uniqueness
// even if multiple runs are triggered in the same second.
export function generateOrderId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  // 8 random chars from a-z0-9 - 36^8 ≈ 2.8 trillion combinations
  const rand = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("").toUpperCase();
  return `DEMO-${yyyy}${mm}${dd}-${hh}${mi}${ss}${ms}-${rand}`;
}
