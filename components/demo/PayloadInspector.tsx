"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DemoState, PayloadTab } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

interface PayloadInspectorProps {
  state: DemoState;
  onTabChange: (tab: PayloadTab) => void;
}

const TABS: { id: PayloadTab; label: string }[] = [
  { id: "request", label: "Request" },
  { id: "response", label: "Response" },
  { id: "persisted", label: "Persisted" },
  { id: "alert", label: "Alert" },
];

export default function PayloadInspector({ state, onTabChange }: PayloadInspectorProps) {
  const { activePayloadTab, inputPayload, postRequest, persistedBody, alertDetails, phase } = state;

  // Decide which tabs are enabled based on what we've observed
  const tabAvailability: Record<PayloadTab, boolean> = {
    request: inputPayload != null,
    response: postRequest != null,
    persisted: persistedBody != null || phase === "completed-gold" || phase === "completed-dlq",
    alert: alertDetails != null,
  };

  return (
    <div className="border border-hairline-strong bg-ink-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-hairline px-4 py-3 bg-ink-100 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-500">payload inspector</span>
        <PayloadTabIndicator phase={phase} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline overflow-x-auto bg-ink-0">
        {TABS.map((tab) => {
          const isActive = activePayloadTab === tab.id;
          const isAvailable = tabAvailability[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => isAvailable && onTabChange(tab.id)}
              disabled={!isAvailable}
              className={cn(
                "px-4 py-2 text-[0.7rem] font-mono tracking-wider uppercase border-r border-hairline whitespace-nowrap transition-colors relative",
                isActive
                  ? "bg-ink-50 text-ink-900"
                  : isAvailable
                  ? "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                  : "text-ink-500/40 cursor-not-allowed"
              )}
            >
              {tab.label}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-px bg-lumina" />}
            </button>
          );
        })}
      </div>

      {/* Subtitle showing context */}
      <div className="border-b border-hairline px-4 py-2 bg-ink-0">
        <p className="font-mono text-[0.7rem] text-ink-500 truncate">
          → {getSubtitle(activePayloadTab, state)}
        </p>
      </div>

      {/* JSON content */}
      <div className="flex-1 overflow-auto" style={{ minHeight: "260px", maxHeight: "440px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePayloadTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-xs leading-relaxed text-ink-900 px-4 py-3"
          >
            {renderTab(activePayloadTab, state)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PayloadTabIndicator({ phase }: { phase: DemoState["phase"] }) {
  if (phase === "idle") {
    return <span className="font-mono text-[0.65rem] text-ink-500 tracking-widest uppercase">○ ready</span>;
  }
  return null;
}

function getSubtitle(tab: PayloadTab, state: DemoState): string {
  if (tab === "request") {
    return state.postRequest?.url
      ? `POST ${shortPath(state.postRequest.url)}`
      : "Body que la démo enverra à l'APIM";
  }
  if (tab === "response") {
    if (state.postRequest?.status) {
      return `${state.postRequest.method} ${shortPath(state.postRequest.url)} · ${state.postRequest.status} · ${state.postRequest.durationMs}ms`;
    }
    return "Réponse HTTP de l'APIM";
  }
  if (tab === "persisted") {
    if (state.phase === "completed-gold") return "Lu depuis gold-orders/{orderId}.json";
    if (state.phase === "completed-dlq") return "Lu depuis failed-orders/failed-order-{orderId}.json";
    return "Body persisté dans le Data Lake";
  }
  if (tab === "alert") {
    if (state.alertDetails) return `Lu depuis alerts-sent/${state.orderId ?? "{orderId}"}.json`;
    return "Preuve d'envoi email écrite par la Logic App";
  }
  return "";
}

function renderTab(tab: PayloadTab, state: DemoState): React.ReactNode {
  if (tab === "request") {
    if (!state.inputPayload) return <Hint text="Aucune requête en cours. Configurez puis envoyez." />;
    return <ColoredJSON value={state.inputPayload} />;
  }

  if (tab === "response") {
    if (!state.postRequest) return <Hint text="Aucune réponse encore reçue de l'APIM." />;
    if (state.postRequest.errorMessage) {
      return (
        <div className="space-y-3">
          <div className="text-ember">Network error</div>
          <div className="text-ink-700 break-all">{state.postRequest.errorMessage}</div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <ResponseStatusLine
          status={state.postRequest.status ?? 0}
          durationMs={state.postRequest.durationMs ?? 0}
        />
        <ColoredJSON
          value={state.postRequest.responseBody}
          accent={state.postRequest.status === 400 ? "ember" : "lumina"}
        />
      </div>
    );
  }

  if (tab === "persisted") {
    if (state.phase === "polling" || state.phase === "posting") {
      return <Hint text="En attente de la persistance dans le Data Lake…" />;
    }
    if (state.phase === "validation-failed") {
      return <Hint text="Aucun body persisté — la commande a été rejetée avant le bus." />;
    }
    if (!state.persistedBody) {
      return <Hint text="Aucun body persisté disponible." />;
    }
    const accent = state.phase === "completed-dlq" ? "ember" : "signal";
    return <ColoredJSON value={state.persistedBody} accent={accent} />;
  }

  if (tab === "alert") {
    if (!state.alertDetails) {
      if (state.phase === "completed-dlq") {
        return <Hint text="En attente de la confirmation Logic App…" />;
      }
      return <Hint text="Aucune alerte à afficher pour ce scénario." />;
    }
    const a = state.alertDetails;
    return (
      <div className="space-y-4">
        {/* Confirmation banner */}
        <div className="border border-signal/40 bg-signal/5 px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-signal font-medium">
              ✓ Email envoyé · vérifié
            </span>
          </div>
          <p className="text-[0.7rem] text-ink-700 leading-relaxed">
            Logic App a écrit ce fichier <span className="text-signal">après</span>{" "}
            l'envoi réussi de l'email d'alerte. C'est la preuve cryptographique que la chaîne
            Event Grid → Logic App → SMTP a bien fonctionné.
          </p>
        </div>

        {/* Key facts grid */}
        <div className="grid grid-cols-1 gap-1.5 font-mono text-[0.7rem]">
          <KeyValue label="Destinataire" value={a.recipient} accent="signal" />
          <KeyValue label="Sujet" value={a.subject} />
          <KeyValue label="Canal" value={a.channel} />
          <KeyValue label="Envoyé à" value={a.alertSentAt} accent="lumina" />
          {a.logicAppRunId && (
            <KeyValue label="Logic App run" value={a.logicAppRunId} mono />
          )}
        </div>

        <div className="border-t border-hairline pt-3">
          <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500 mb-2">
            JSON brut
          </p>
          <ColoredJSON value={a} accent="signal" />
        </div>
      </div>
    );
  }

  return null;
}

function KeyValue({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: "signal" | "lumina" | "ember";
  mono?: boolean;
}) {
  const colorClass =
    accent === "signal" ? "text-signal" :
    accent === "lumina" ? "text-lumina" :
    accent === "ember" ? "text-ember" :
    "text-ink-900";

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-ink-500 shrink-0 min-w-[110px]">{label}</span>
      <span className={cn("flex-1 break-all", colorClass, mono && "text-[0.65rem]")}>
        {value}
      </span>
    </div>
  );
}

function ResponseStatusLine({ status, durationMs }: { status: number; durationMs: number }) {
  const tone = status >= 200 && status < 300 ? "signal"
    : status >= 400 && status < 500 ? "ember"
    : status >= 500 ? "ember"
    : "ink-500";

  const colorClass = {
    signal: "text-signal",
    ember: "text-ember",
    "ink-500": "text-ink-500",
  }[tone];

  return (
    <div className="flex items-center gap-3 pb-2 border-b border-hairline">
      <span className={cn("font-mono text-sm font-medium", colorClass)}>
        HTTP {status}
      </span>
      <span className="font-mono text-xs text-ink-500">·</span>
      <span className="font-mono text-xs text-ink-500">{durationMs}ms</span>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <div className="text-ink-500 text-xs italic">{text}</div>
  );
}

function shortPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url;
  }
}

// Simple colored JSON renderer
function ColoredJSON({
  value,
  accent = "lumina",
}: {
  value: unknown;
  accent?: "lumina" | "ember" | "signal";
}) {
  if (value == null) return <span className="text-ink-500">null</span>;
  if (typeof value !== "object") return <span className="text-ink-700">{String(value)}</span>;

  let json: string;
  try {
    json = JSON.stringify(value, null, 2);
  } catch {
    return <span className="text-ember">[Cannot serialize]</span>;
  }

  const lines = json.split("\n");
  const accentClass =
    accent === "ember" ? "text-ember" :
    accent === "signal" ? "text-signal" :
    "text-lumina";

  return (
    <span className="whitespace-pre-wrap break-words">
      {lines.map((line, i) => (
        <div key={i} className="leading-relaxed">
          {colorizeJSONLine(line, accentClass)}
        </div>
      ))}
    </span>
  );
}

function colorizeJSONLine(line: string, keyClass: string): React.ReactNode {
  const keyMatch = line.match(/^(\s*)("[^"]+"):\s*(.*)$/);
  if (keyMatch) {
    const [, indent, key, rest] = keyMatch;
    return (
      <>
        <span>{indent}</span>
        <span className={keyClass}>{key}</span>
        <span className="text-ink-500">: </span>
        {colorizeValue(rest)}
      </>
    );
  }
  return <span className="text-ink-700">{line}</span>;
}

function colorizeValue(rest: string): React.ReactNode {
  const hasTrailingComma = rest.endsWith(",");
  const value = hasTrailingComma ? rest.slice(0, -1) : rest;
  const comma = hasTrailingComma ? <span className="text-ink-500">,</span> : null;

  if (value.startsWith('"') && value.endsWith('"')) {
    return (
      <>
        <span className="text-signal">{value}</span>
        {comma}
      </>
    );
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return (
      <>
        <span className="text-ink-900 font-medium">{value}</span>
        {comma}
      </>
    );
  }
  if (["true", "false", "null"].includes(value)) {
    return (
      <>
        <span className="text-ember">{value}</span>
        {comma}
      </>
    );
  }
  return (
    <>
      <span className="text-ink-500">{value}</span>
      {comma}
    </>
  );
}
