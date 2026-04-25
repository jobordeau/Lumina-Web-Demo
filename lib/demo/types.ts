// Types for the live demo. The state machine reflects the real lifecycle of
// an HTTP request to APIM and subsequent polling of the order status endpoint.

export type ScenarioId = "happy" | "validation-error" | "dlq";

export type DemoPhase =
  | "idle"
  | "posting"           // POST in flight to APIM
  | "validation-failed" // 400 returned by Producer Fn
  | "polling"           // 202 received, awaiting status resolution
  | "completed-gold"    // status endpoint returned 'completed'
  | "completed-dlq"     // status endpoint returned 'dead-lettered'
  | "timeout"           // poll attempts exhausted
  | "error";            // network / unexpected error

export type NodeStatus =
  | "idle"
  | "processing"
  | "success"
  | "error"
  | "retry"
  | "inferred"; // for downstream nodes we cannot directly observe

export type LogLevel = "INF" | "WRN" | "ERR" | "REQ" | "RES";

export interface LogEntry {
  id: string;
  /** ms since scenario start (for display) */
  ts: number;
  /** wall-clock ISO time captured at log creation */
  wallTs: string;
  level: LogLevel;
  source: string;
  message: string;
  /** Optional payload preview (e.g. response body) */
  detail?: string;
}

export interface RequestRecord {
  method: "POST" | "GET";
  url: string;
  status?: number;
  durationMs?: number;
  responseBody?: unknown;
  errorMessage?: string;
}

// === The shape of a payload submitted to APIM ===
// Matches the real e-commerce JSON consumed by EcommerceOrderFunction.
export interface OrderPayload {
  orderId: string;
  timestamp: string;
  channel: string;
  customerDetails: {
    customerId: string;
    fullName: string;
    contactEmail: string;
  };
  items: Array<{
    sku: string;
    qty: number;
    unitPrice: number;
  }>;
}

export type PayloadTab = "request" | "response" | "persisted";

export type Mode = "preset" | "custom";

export interface DemoState {
  mode: Mode;
  scenarioId: ScenarioId | null;
  phase: DemoPhase;
  orderId: string | null;
  /** ms elapsed since the run started */
  elapsedMs: number;
  /** current status as last returned by the status endpoint */
  lastStatus: "pending" | "completed" | "dead-lettered" | null;
  /** number of times we've polled the status endpoint */
  pollAttempt: number;
  /** the full request record for the POST */
  postRequest: RequestRecord | null;
  /** the most recent status request record */
  lastStatusRequest: RequestRecord | null;
  /** node visual states */
  nodeStatuses: Record<string, NodeStatus>;
  /** streaming log entries */
  logs: LogEntry[];
  /** the original input payload sent to APIM */
  inputPayload: OrderPayload | null;
  /** the canonical / persisted body if status returned a body */
  persistedBody: unknown | null;
  /** payload tab the user is currently viewing (independent from phase) */
  activePayloadTab: PayloadTab;
}
