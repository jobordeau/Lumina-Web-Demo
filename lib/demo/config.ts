// Configuration for the live demo. The APIM gateway URL is configurable
// via the NEXT_PUBLIC_APIM_BASE_URL environment variable, falling back to
// the deployed POC endpoint.

export const APIM_BASE_URL =
  process.env.NEXT_PUBLIC_APIM_BASE_URL?.replace(/\/$/, "") ||
  "https://apim-lumina-dev-jobordeau.azure-api.net";

export const ORDERS_PATH = "/ecommerce/orders";

export const POLL_INTERVAL_MS = 2000;
export const POLL_MAX_ATTEMPTS = 35; // ~70s — enough for retry × 3 + DLQ chain

// Generate a unique orderId per run, prefixed DEMO so portfolio test data
// can be easily distinguished from curl tests in the storage account.
export function generateOrderId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DEMO-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`;
}
