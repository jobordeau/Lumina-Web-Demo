// Types for the order flow simulation.
// The whole demo is driven by stepping through arrays of FlowStep.

export type LogLevel = "info" | "warn" | "error" | "success";

export interface FlowLog {
  level: LogLevel;
  source: string;
  message: string;
}

export type ResourceStatus =
  | "idle"
  | "processing"
  | "success"
  | "error"
  | "retrying";

export type PayloadStage = "raw" | "canonical" | "persisted" | "failed-persisted";

export interface FlowStep {
  id: string;
  nodeId: string | null; // Which arch node is "active" during this step
  durationMs: number;
  log: FlowLog;
  payloadStage?: PayloadStage; // If set, switches the inspector tab focus
  // Status overrides applied AT THE START of this step.
  // After the step, the active node defaults to "success".
  // Use this for "stay in error", "retrying" etc.
  nodeStatusOverrides?: Partial<Record<string, ResourceStatus>>;
  // The retry count to display on Service Bus (for error scenario)
  retryCount?: number;
}

export interface OrderInput {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  itemSku: string;
  itemQty: number;
  itemPrice: number;
  channel: string;
  timestamp: string;
}

// The default order — matches the real payload in the POC's data-mocks/.
export const DEFAULT_ORDER: OrderInput = {
  orderId: "WEB-994827",
  customerId: "84729",
  customerName: "Alice Martin",
  customerEmail: "alice.m@email.com",
  itemSku: "LUM-CEIL-005",
  itemQty: 1,
  itemPrice: 320.0,
  channel: "E-Commerce-App",
  timestamp: "2026-03-30T14:22:10Z",
};

// ----- Payload computations -----

/** Build the raw e-commerce JSON exactly like the real source format. */
export function buildRawPayload(o: OrderInput) {
  return {
    orderId: o.orderId,
    timestamp: o.timestamp,
    channel: o.channel,
    customerDetails: {
      customerId: o.customerId,
      fullName: o.customerName,
      contactEmail: o.customerEmail,
    },
    items: [
      {
        sku: o.itemSku,
        qty: o.itemQty,
        unitPrice: o.itemPrice,
      },
    ],
  };
}

/** Build the canonical Order matching the C# Order model. */
export function buildCanonicalPayload(o: OrderInput) {
  return {
    OrderId: o.orderId,
    CustomerId: o.customerId,
    OrderDate: o.timestamp,
    Status: "Received_From_Web",
    TotalAmount: Number((o.itemQty * o.itemPrice).toFixed(2)),
  };
}

/** Build the persisted JSON (same as canonical, but pretty-printed for ADLS). */
export function buildPersistedPayload(o: OrderInput) {
  return buildCanonicalPayload(o);
}

/** Build the failed-orders JSON (canonical wrapped in DLQ envelope). */
export function buildFailedPayload(o: OrderInput, messageId: string, reason: string) {
  return {
    MessageId: messageId,
    DeliveryCount: 3,
    DeadLetterReason: "MaxDeliveryCountExceeded",
    DeadLetterErrorDescription: reason,
    EnqueuedTimeUtc: o.timestamp,
    Body: buildCanonicalPayload(o),
  };
}
