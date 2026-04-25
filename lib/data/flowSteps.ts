import type { FlowStep, OrderInput } from "./flowTypes";

// Build a synthetic message ID that looks like Azure Service Bus (deterministic from order ID).
export function buildMessageId(orderId: string) {
  // Simple deterministic hash -> 32 hex chars -> formatted as a guid
  let h1 = 0x811c9dc5;
  for (let i = 0; i < orderId.length; i++) {
    h1 ^= orderId.charCodeAt(i);
    h1 = (h1 * 0x01000193) >>> 0;
  }
  const hex = h1.toString(16).padStart(8, "0");
  return `${hex}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex}${hex.slice(0, 4)}`;
}

const PAYLOAD_SIZE_HINT = (o: OrderInput) =>
  `${280 + o.itemSku.length * 4}B`;

// ============= HAPPY PATH =============

export function buildHappyPathSteps(order: OrderInput): FlowStep[] {
  const msgId = buildMessageId(order.orderId);
  const total = (order.itemQty * order.itemPrice).toFixed(2);

  return [
    {
      id: "apim-receive",
      nodeId: "apim",
      durationMs: 600,
      log: {
        level: "info",
        source: "APIM",
        message: `inbound POST /orders subscriptionKey=*** size=${PAYLOAD_SIZE_HINT(order)}`,
      },
      payloadStage: "raw",
    },
    {
      id: "apim-policy",
      nodeId: "apim",
      durationMs: 400,
      log: {
        level: "info",
        source: "APIM",
        message: `rate-limit OK (1/60) · header X-Source-System=ECOM-WEB added`,
      },
    },
    {
      id: "apim-forward",
      nodeId: "apim",
      durationMs: 350,
      log: {
        level: "info",
        source: "APIM",
        message: `forwarded to fn-lumina-processor backend`,
      },
    },
    {
      id: "producer-deserialize",
      nodeId: "fn-producer",
      durationMs: 500,
      log: {
        level: "info",
        source: "Producer",
        message: `EcommerceOrderFunction.Run() invoked · deserializing JSON`,
      },
    },
    {
      id: "producer-map",
      nodeId: "fn-producer",
      durationMs: 700,
      log: {
        level: "info",
        source: "Producer",
        message: `mapping raw payload → Order canonical (TotalAmount=${total}€)`,
      },
      payloadStage: "canonical",
    },
    {
      id: "producer-validate",
      nodeId: "fn-producer",
      durationMs: 500,
      log: {
        level: "success",
        source: "Producer",
        message: `OrderValidator passed · ${order.orderId} valid`,
      },
    },
    {
      id: "producer-publish",
      nodeId: "fn-producer",
      durationMs: 450,
      log: {
        level: "info",
        source: "Producer",
        message: `published to sbt-lumina-orders messageId=${msgId.slice(0, 18)}…`,
      },
    },
    {
      id: "sb-route",
      nodeId: "servicebus",
      durationMs: 500,
      log: {
        level: "info",
        source: "ServiceBus",
        message: `topic dispatched · subscription sbs-process-order · deliveryCount=1`,
      },
    },
    {
      id: "consumer-receive",
      nodeId: "fn-consumer",
      durationMs: 400,
      log: {
        level: "info",
        source: "Consumer",
        message: `ServiceBusTrigger fired · OrderProcessorFunction.Run()`,
      },
    },
    {
      id: "consumer-process",
      nodeId: "fn-consumer",
      durationMs: 700,
      log: {
        level: "info",
        source: "Consumer",
        message: `OrderProcessingService.ProcessOrderAsync(${order.orderId})`,
      },
    },
    {
      id: "consumer-persist",
      nodeId: "adls",
      durationMs: 700,
      log: {
        level: "info",
        source: "Consumer→ADLS",
        message: `gold-orders/${order.orderId}.json written passwordless · ManagedIdentity`,
      },
      payloadStage: "persisted",
    },
    {
      id: "complete",
      nodeId: null,
      durationMs: 300,
      log: {
        level: "success",
        source: "Outcome",
        message: `Order ${order.orderId} processed end-to-end · total elapsed ≈ 4.5s`,
      },
    },
  ];
}

// ============= ERROR PATH =============

export function buildErrorPathSteps(order: OrderInput): FlowStep[] {
  const msgId = buildMessageId(order.orderId);
  const total = (order.itemQty * order.itemPrice).toFixed(2);

  return [
    // --- Same first 8 steps as happy path: APIM → Producer → SB ---
    {
      id: "apim-receive",
      nodeId: "apim",
      durationMs: 500,
      log: {
        level: "info",
        source: "APIM",
        message: `inbound POST /orders subscriptionKey=*** size=${PAYLOAD_SIZE_HINT(order)}`,
      },
      payloadStage: "raw",
    },
    {
      id: "apim-forward",
      nodeId: "apim",
      durationMs: 350,
      log: {
        level: "info",
        source: "APIM",
        message: `policy OK · forwarded to fn-lumina-processor`,
      },
    },
    {
      id: "producer-map",
      nodeId: "fn-producer",
      durationMs: 600,
      log: {
        level: "info",
        source: "Producer",
        message: `mapping raw payload → Order canonical (TotalAmount=${total}€)`,
      },
      payloadStage: "canonical",
    },
    {
      id: "producer-publish",
      nodeId: "fn-producer",
      durationMs: 400,
      log: {
        level: "info",
        source: "Producer",
        message: `published to sbt-lumina-orders messageId=${msgId.slice(0, 18)}…`,
      },
    },
    {
      id: "sb-route-1",
      nodeId: "servicebus",
      durationMs: 400,
      log: {
        level: "info",
        source: "ServiceBus",
        message: `dispatched · deliveryCount=1`,
      },
      retryCount: 1,
    },

    // --- Retry 1: Consumer fails ---
    {
      id: "consumer-fail-1",
      nodeId: "fn-consumer",
      durationMs: 700,
      log: {
        level: "error",
        source: "Consumer",
        message: `[FATAL] DependencyException: timeout calling downstream API (5000ms)`,
      },
      nodeStatusOverrides: { "fn-consumer": "error" },
      retryCount: 1,
    },
    {
      id: "sb-redelivery-2",
      nodeId: "servicebus",
      durationMs: 800,
      log: {
        level: "warn",
        source: "ServiceBus",
        message: `lock expired · message redelivered · deliveryCount=2`,
      },
      nodeStatusOverrides: { "fn-consumer": "idle", servicebus: "retrying" },
      retryCount: 2,
    },

    // --- Retry 2: Consumer fails again ---
    {
      id: "consumer-fail-2",
      nodeId: "fn-consumer",
      durationMs: 700,
      log: {
        level: "error",
        source: "Consumer",
        message: `[FATAL] DependencyException: timeout calling downstream API (5000ms)`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "retrying" },
      retryCount: 2,
    },
    {
      id: "sb-redelivery-3",
      nodeId: "servicebus",
      durationMs: 800,
      log: {
        level: "warn",
        source: "ServiceBus",
        message: `lock expired · message redelivered · deliveryCount=3 (final)`,
      },
      nodeStatusOverrides: { "fn-consumer": "idle", servicebus: "retrying" },
      retryCount: 3,
    },

    // --- Retry 3: Consumer fails for the last time ---
    {
      id: "consumer-fail-3",
      nodeId: "fn-consumer",
      durationMs: 700,
      log: {
        level: "error",
        source: "Consumer",
        message: `[FATAL] DependencyException: max retries exhausted`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "retrying" },
      retryCount: 3,
    },

    // --- Switch to DLQ branch ---
    {
      id: "sb-to-dlq",
      nodeId: "servicebus",
      durationMs: 600,
      log: {
        level: "warn",
        source: "ServiceBus",
        message: `MaxDeliveryCount reached · message moved to $DeadLetterQueue`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "error" },
      retryCount: 3,
    },
    {
      id: "dlq-fn-trigger",
      nodeId: "fn-dlq",
      durationMs: 500,
      log: {
        level: "info",
        source: "DLQFn",
        message: `FailedOrderFunction triggered for messageId=${msgId.slice(0, 18)}…`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "error" },
    },
    {
      id: "dlq-persist",
      nodeId: "adls",
      durationMs: 600,
      log: {
        level: "info",
        source: "DLQFn→ADLS",
        message: `failed-orders/failed-order-${msgId.slice(0, 8)}.json written passwordless`,
      },
      payloadStage: "failed-persisted",
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "error" },
    },
    {
      id: "eventgrid-fire",
      nodeId: "eventgrid",
      durationMs: 500,
      log: {
        level: "info",
        source: "EventGrid",
        message: `BlobCreated event raised · subject=/failed-orders/`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "error" },
    },
    {
      id: "logicapp-trigger",
      nodeId: "logicapp",
      durationMs: 600,
      log: {
        level: "info",
        source: "LogicApp",
        message: `workflow triggered · alert email queued via Office365 connector`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "error" },
    },
    {
      id: "complete-failure",
      nodeId: null,
      durationMs: 400,
      log: {
        level: "success",
        source: "Outcome",
        message: `Order ${order.orderId} failed → captured + alerted · 0 message lost`,
      },
      nodeStatusOverrides: { "fn-consumer": "error", servicebus: "error" },
    },
  ];
}
