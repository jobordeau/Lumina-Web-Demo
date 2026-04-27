import type {
  AlertDetails,
  DemoPhase,
  DemoState,
  LogEntry,
  LogLevel,
  Mode,
  NodeStatus,
  OrderPayload,
  PayloadTab,
  RequestRecord,
  ScenarioId,
} from "./types";

// All node IDs that appear in the flow visualization.
// Mirrors the architecture page swimlanes:
// Lane 1 (lumina): apim, fn-producer, servicebus
// Lane 2 (signal): fn-consumer, adls, adf, fabric
// Lane 3 (ember):  fn-dlq, adls-failed, eventgrid, logicapp
const ALL_NODE_IDS = [
  "apim",
  "fn-producer",
  "servicebus",
  "fn-consumer",
  "adls",
  "adf",
  "fabric",
  "fn-dlq",
  "adls-failed",
  "eventgrid",
  "logicapp",
];

const initialNodeStatuses = (): Record<string, NodeStatus> =>
  ALL_NODE_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: "idle" as NodeStatus }),
    {}
  );

export const initialState: DemoState = {
  mode: "preset",
  scenarioId: null,
  phase: "idle",
  orderId: null,
  elapsedMs: 0,
  lastStatus: null,
  pollAttempt: 0,
  postRequest: null,
  lastStatusRequest: null,
  nodeStatuses: initialNodeStatuses(),
  logs: [],
  inputPayload: null,
  persistedBody: null,
  alertDetails: null,
  activePayloadTab: "request",
};

export type Action =
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SELECT_PRESET"; scenarioId: ScenarioId }
  | { type: "RESET" }
  | { type: "RUN_START"; orderId: string; payload: OrderPayload; scenarioId: ScenarioId | null }
  | { type: "POST_DONE"; request: RequestRecord }
  | { type: "POST_VALIDATION_FAILED"; request: RequestRecord }
  | { type: "POST_NETWORK_ERROR"; request: RequestRecord }
  | { type: "POLL_START" }
  | { type: "POLL_RESULT"; request: RequestRecord; status: "pending" | "completed" | "dead-lettered"; persistedBody?: unknown; alertDetails?: AlertDetails }
  | { type: "POLL_NETWORK_ERROR"; request: RequestRecord }
  | { type: "POLL_TIMEOUT" }
  | { type: "TICK"; elapsedMs: number }
  | { type: "SET_PAYLOAD_TAB"; tab: PayloadTab }
  | { type: "NODE_STATUS"; nodeId: string; status: NodeStatus }
  | { type: "LOG"; level: LogLevel; source: string; message: string; detail?: string };

let logSeq = 0;
function nextLog(
  level: LogLevel,
  source: string,
  message: string,
  ts: number,
  detail?: string
): LogEntry {
  return {
    id: `log-${logSeq++}`,
    ts,
    wallTs: new Date().toISOString(),
    level,
    source,
    message,
    detail,
  };
}

export function demoReducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "SET_MODE":
      return {
        ...initialState,
        mode: action.mode,
      };

    case "SELECT_PRESET":
      return {
        ...initialState,
        mode: "preset",
        scenarioId: action.scenarioId,
      };

    case "RESET":
      return {
        ...initialState,
        mode: state.mode,
        scenarioId: state.scenarioId,
      };

    case "RUN_START": {
      const log = nextLog(
        "INF",
        "SYSTEM",
        `═══ Run started · OrderId=${action.orderId} ═══`,
        0
      );
      return {
        ...initialState,
        mode: state.mode,
        scenarioId: action.scenarioId,
        phase: "posting",
        orderId: action.orderId,
        inputPayload: action.payload,
        logs: [log],
        nodeStatuses: { ...initialNodeStatuses(), apim: "processing" },
      };
    }

    case "POST_DONE": {
      // 202 Accepted: APIM done, Producer Fn done, Service Bus done; consumer next
      const logs = [
        ...state.logs,
        nextLog(
          "REQ",
          "APIM",
          `${action.request.method} ${shortPath(action.request.url)}`,
          state.elapsedMs
        ),
        nextLog(
          "RES",
          "APIM",
          `${action.request.status} · ${action.request.durationMs}ms`,
          state.elapsedMs,
          previewBody(action.request.responseBody)
        ),
        nextLog(
          "INF",
          "EcommerceOrderFn",
          "FluentValidation OK · message publié sur sbt-lumina-orders",
          state.elapsedMs
        ),
      ];
      return {
        ...state,
        phase: "polling",
        postRequest: action.request,
        nodeStatuses: {
          ...state.nodeStatuses,
          apim: "success",
          "fn-producer": "success",
          servicebus: "processing",
        },
        logs,
        activePayloadTab: "response",
      };
    }

    case "POST_VALIDATION_FAILED": {
      const logs = [
        ...state.logs,
        nextLog(
          "REQ",
          "APIM",
          `${action.request.method} ${shortPath(action.request.url)}`,
          state.elapsedMs
        ),
        nextLog(
          "RES",
          "APIM",
          `${action.request.status} · ${action.request.durationMs}ms`,
          state.elapsedMs,
          previewBody(action.request.responseBody)
        ),
        nextLog(
          "ERR",
          "EcommerceOrderFn",
          "FluentValidation a rejeté la commande · message NON publié sur le bus",
          state.elapsedMs
        ),
      ];
      return {
        ...state,
        phase: "validation-failed",
        postRequest: action.request,
        nodeStatuses: {
          ...state.nodeStatuses,
          apim: "success",
          "fn-producer": "error",
        },
        logs,
        activePayloadTab: "response",
      };
    }

    case "POST_NETWORK_ERROR": {
      const logs = [
        ...state.logs,
        nextLog(
          "ERR",
          "APIM",
          `Network error · ${action.request.errorMessage ?? "unknown"}`,
          state.elapsedMs
        ),
      ];
      return {
        ...state,
        phase: "error",
        postRequest: action.request,
        nodeStatuses: {
          ...state.nodeStatuses,
          apim: "error",
        },
        logs,
      };
    }

    case "POLL_START": {
      // First poll cycle starting after the 202
      return {
        ...state,
        pollAttempt: state.pollAttempt + 1,
      };
    }

    case "POLL_RESULT": {
      const incrementedAttempts = state.pollAttempt;
      const newLogs: LogEntry[] = [
        ...state.logs,
        nextLog(
          "REQ",
          "StatusAPI",
          `GET /orders/{orderId}/status · attempt ${incrementedAttempts}`,
          state.elapsedMs
        ),
        nextLog(
          "RES",
          "StatusAPI",
          `${action.request.status} · ${action.request.durationMs}ms · status="${action.status}"`,
          state.elapsedMs
        ),
      ];

      let newNodeStatuses = { ...state.nodeStatuses };
      let newPhase: DemoPhase = state.phase;

      if (action.status === "pending") {
        // Still in transit — Service Bus has handed off, consumer may be processing or retrying
        newNodeStatuses = {
          ...newNodeStatuses,
          servicebus: "success",
          "fn-consumer": "processing",
        };
        return {
          ...state,
          lastStatusRequest: action.request,
          lastStatus: "pending",
          logs: newLogs,
          nodeStatuses: newNodeStatuses,
        };
      }

      if (action.status === "completed") {
        newPhase = "completed-gold";
        newNodeStatuses = {
          ...newNodeStatuses,
          servicebus: "success",
          "fn-consumer": "success",
          adls: "success",
          // ADF runs on storage event (asynchronous), Fabric notebook runs on
          // a 30-min schedule. Both are observable later via the Analytics page.
          adf: "deferred",
          fabric: "deferred",
        };
        newLogs.push(
          nextLog(
            "INF",
            "OrderProcessor",
            "Commande persistée dans gold-orders/ · pipeline transactionnel terminé",
            state.elapsedMs
          ),
          nextLog(
            "INF",
            "SYSTEM",
            "═══ Run complete · status=completed ═══",
            state.elapsedMs
          )
        );
      } else if (action.status === "dead-lettered") {
        newPhase = "completed-dlq";
        const alertConfirmed = action.alertDetails != null;

        newNodeStatuses = {
          ...newNodeStatuses,
          servicebus: "error",
          "fn-consumer": "error",
          "fn-dlq": "success",
          "adls-failed": "success",
          // Event Grid + Logic App: 'success' when alert blob proves email was sent,
          // 'deferred' until then (transient state during polling)
          eventgrid: alertConfirmed ? "success" : "deferred",
          logicapp: alertConfirmed ? "success" : "deferred",
        };
        newLogs.push(
          nextLog(
            "ERR",
            "OrderProcessor",
            "MaxDeliveryCount atteint · message basculé en $DeadLetterQueue",
            state.elapsedMs
          ),
          nextLog(
            "INF",
            "FailedOrderFn",
            "DLQ message capturé · persisté dans failed-orders/",
            state.elapsedMs
          )
        );
        if (alertConfirmed && action.alertDetails) {
          newLogs.push(
            nextLog(
              "INF",
              "EventGrid",
              "BlobCreated event délivré à la Logic App",
              state.elapsedMs
            ),
            nextLog(
              "INF",
              "LogicApp",
              `Email envoyé · destinataire=${action.alertDetails.recipient} · runId=${action.alertDetails.logicAppRunId ?? "n/a"}`,
              state.elapsedMs,
              `Preuve persistée dans alerts-sent/${state.orderId}.json`
            ),
          );
        }
        newLogs.push(
          nextLog(
            "INF",
            "SYSTEM",
            alertConfirmed
              ? "═══ Run complete · status=dead-lettered · email envoyé ═══"
              : "═══ Run complete · status=dead-lettered ═══",
            state.elapsedMs
          )
        );
      }

      // Determine the best tab to surface based on what just arrived
      let nextActiveTab: PayloadTab = state.activePayloadTab;
      if (action.status === "dead-lettered" && action.alertDetails) {
        nextActiveTab = "alert"; // surface the email proof when it arrives
      } else if (action.status === "completed" || action.status === "dead-lettered") {
        nextActiveTab = "persisted";
      }

      return {
        ...state,
        phase: newPhase,
        lastStatusRequest: action.request,
        lastStatus: action.status,
        persistedBody: action.persistedBody ?? state.persistedBody,
        alertDetails: action.alertDetails ?? state.alertDetails,
        nodeStatuses: newNodeStatuses,
        logs: newLogs,
        activePayloadTab: nextActiveTab,
      };
    }

    case "POLL_NETWORK_ERROR": {
      return {
        ...state,
        lastStatusRequest: action.request,
        logs: [
          ...state.logs,
          nextLog(
            "WRN",
            "StatusAPI",
            `Network error during poll · ${action.request.errorMessage ?? "unknown"} · retrying...`,
            state.elapsedMs
          ),
        ],
      };
    }

    case "POLL_TIMEOUT": {
      return {
        ...state,
        phase: "timeout",
        logs: [
          ...state.logs,
          nextLog(
            "WRN",
            "SYSTEM",
            "Polling timeout · le statut n'a pas convergé dans le délai imparti",
            state.elapsedMs
          ),
        ],
      };
    }

    case "TICK":
      return { ...state, elapsedMs: action.elapsedMs };

    case "SET_PAYLOAD_TAB":
      return { ...state, activePayloadTab: action.tab };

    case "NODE_STATUS":
      return {
        ...state,
        nodeStatuses: { ...state.nodeStatuses, [action.nodeId]: action.status },
      };

    case "LOG":
      return {
        ...state,
        logs: [
          ...state.logs,
          nextLog(action.level, action.source, action.message, state.elapsedMs, action.detail),
        ],
      };

    default:
      return state;
  }
}

function shortPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/ecommerce/, "");
  } catch {
    return url;
  }
}

function previewBody(body: unknown): string {
  if (body == null) return "";
  if (typeof body === "string") return body.length > 120 ? body.slice(0, 117) + "..." : body;
  try {
    const json = JSON.stringify(body);
    return json.length > 120 ? json.slice(0, 117) + "..." : json;
  } catch {
    return "";
  }
}
