"use client";

import type { NodeStatus, DemoPhase } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

interface FlowVisualizationProps {
  nodeStatuses: Record<string, NodeStatus>;
  phase: DemoPhase;
}

// Coordinates mirror the architecture page's swimlane layout, more compact.
// Lane 1 (lumina, y=80):  apim, fn-producer, servicebus
// Lane 2 (signal, y=200): fn-consumer, adls, adf, fabric
// Lane 3 (ember,  y=320): fn-dlq, adls-failed, eventgrid, logicapp

const NODES = [
  // Lane 1 — Ingestion (lumina)
  { id: "apim", x: 100, y: 80, label: "APIM", sub: "apim-lumina", lane: "lumina" as const },
  { id: "fn-producer", x: 270, y: 80, label: "Producer", sub: "EcommerceOrderFn", lane: "lumina" as const },
  { id: "servicebus", x: 450, y: 80, label: "Service Bus", sub: "sbt-lumina-orders", lane: "lumina" as const },

  // Lane 2 — Data + Analytics (signal)
  { id: "fn-consumer", x: 620, y: 200, label: "Consumer", sub: "OrderProcessor", lane: "signal" as const },
  { id: "adls", x: 800, y: 200, label: "Data Lake", sub: "gold-orders", lane: "signal" as const },
  { id: "adf", x: 980, y: 200, label: "Data Factory", sub: "JSON → Parquet", lane: "signal" as const },
  { id: "fabric", x: 1160, y: 200, label: "Fabric", sub: "Zero-Copy", lane: "signal" as const },

  // Lane 3 — Resilience (ember)
  { id: "fn-dlq", x: 620, y: 320, label: "DLQ", sub: "FailedOrderFn", lane: "ember" as const },
  { id: "adls-failed", x: 800, y: 320, label: "failed-orders", sub: "container", lane: "ember" as const },
  { id: "eventgrid", x: 980, y: 320, label: "Event Grid", sub: "BlobCreated", lane: "ember" as const },
  { id: "logicapp", x: 1160, y: 320, label: "Logic App", sub: "Email alerte", lane: "ember" as const },
] as const;

const LANE_COLORS = {
  lumina: "#D9F84A",
  signal: "#7BD8B5",
  ember: "#F47435",
} as const;

export default function FlowVisualization({ nodeStatuses, phase }: FlowVisualizationProps) {
  return (
    <div className="border border-hairline-strong bg-ink-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-hairline px-4 py-3 bg-ink-100 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-500">topology · live state</span>
        <div className="flex items-center gap-3 text-[0.65rem] font-mono tracking-widest uppercase">
          <StatusLegend dot="bg-ink-300" label="idle" />
          <StatusLegend dot="bg-lumina animate-pulse" label="active" />
          <StatusLegend dot="bg-signal" label="success" />
          <StatusLegend dot="bg-ember" label="error" />
          <StatusLegend dot="bg-ink-500 ring-1 ring-ink-400" label="non observable" />
        </div>
      </div>

      {/* SVG canvas */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 relative">
        <svg
          viewBox="0 0 1280 420"
          className="w-full h-auto min-w-[1000px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dotgrid-flow" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="0.75" cy="0.75" r="0.6" fill="rgba(250,247,240,0.07)" />
            </pattern>
            <marker id="flow-arrow-lumina" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L7,2.5 z" fill="#D9F84A" opacity="0.6" />
            </marker>
            <marker id="flow-arrow-signal" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L7,2.5 z" fill="#7BD8B5" opacity="0.6" />
            </marker>
            <marker id="flow-arrow-ember" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L7,2.5 z" fill="#F47435" opacity="0.6" />
            </marker>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1280" height="420" fill="url(#dotgrid-flow)" />

          {/* Lane labels */}
          <text x={30} y={36} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#D9F84A" letterSpacing="3" opacity="0.9">
            ① INGESTION
          </text>
          <text x={30} y={156} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#7BD8B5" letterSpacing="3" opacity="0.9">
            ② DONNÉES &amp; ANALYTIQUE
          </text>
          <text x={30} y={276} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#F47435" letterSpacing="3" opacity="0.9">
            ③ RÉSILIENCE · DLQ
          </text>

          {/* Lane separators */}
          <line x1="30" y1="146" x2="1250" y2="146" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />
          <line x1="30" y1="266" x2="1250" y2="266" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />

          {/* Connection lines */}
          <ConnectionLine from={[146, 80]} to={[224, 80]} color="lumina" arrow />
          <ConnectionLine from={[316, 80]} to={[404, 80]} color="lumina" arrow />

          {/* Service Bus → Consumer (from RIGHT of SB at 496,80 to TOP of Consumer at 620,178) */}
          <path
            d="M 496 80 C 555 80, 620 130, 620 178"
            fill="none"
            stroke="#7BD8B5"
            strokeWidth="1"
            opacity="0.5"
            markerEnd="url(#flow-arrow-signal)"
          />

          {/* Service Bus → DLQ (from bottom of SB at 450,106 to LEFT of DLQ at 574,320) */}
          <path
            d="M 450 106 C 450 260, 480 320, 574 320"
            fill="none"
            stroke="#F47435"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
            markerEnd="url(#flow-arrow-ember)"
          />
          <text x={418} y={235} fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#F47435" opacity="0.7">
            × 3 retries
          </text>

          {/* Lane 2 internal */}
          <ConnectionLine from={[666, 200]} to={[754, 200]} color="signal" arrow />
          <ConnectionLine from={[846, 200]} to={[934, 200]} color="signal" arrow />
          <ConnectionLine from={[1026, 200]} to={[1114, 200]} color="signal" arrow dashed />

          {/* Lane 3 internal */}
          <ConnectionLine from={[666, 320]} to={[754, 320]} color="ember" arrow />
          <ConnectionLine from={[846, 320]} to={[934, 320]} color="ember" arrow dashed />
          <ConnectionLine from={[1026, 320]} to={[1114, 320]} color="ember" arrow />

          {/* Render nodes */}
          {NODES.map((node) => (
            <FlowNode
              key={node.id}
              node={node}
              status={nodeStatuses[node.id] || "idle"}
            />
          ))}
        </svg>
      </div>

      {/* Footer note about 'non observable' state */}
      <div className="border-t border-hairline px-4 py-2 bg-ink-0">
        <p className="font-mono text-[0.65rem] text-ink-500 leading-relaxed">
          <span className="text-ink-700">●</span> Les états{" "}
          <span className="text-ink-900">success / error</span> sont{" "}
          <span className="text-ink-900">vérifiés</span> via l'API. L'état{" "}
          <span className="text-ink-900">non observable</span> représente des composants
          dont l'état ne peut pas être confirmé en direct pendant ce run
          (ADF, déclenché par Event Grid sur écriture blob, et Fabric, qui tourne toutes les 30 min).
        </p>
      </div>
    </div>
  );
}

function StatusLegend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-ink-500">
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      <span>{label}</span>
    </div>
  );
}

function ConnectionLine({
  from,
  to,
  color,
  arrow,
  dashed,
}: {
  from: [number, number];
  to: [number, number];
  color: "lumina" | "signal" | "ember";
  arrow?: boolean;
  dashed?: boolean;
}) {
  return (
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke={LANE_COLORS[color]}
      strokeWidth="1"
      strokeDasharray={dashed ? "3 3" : undefined}
      opacity="0.5"
      markerEnd={arrow ? `url(#flow-arrow-${color})` : undefined}
    />
  );
}

function FlowNode({
  node,
  status,
}: {
  node: typeof NODES[number];
  status: NodeStatus;
}) {
  const c = LANE_COLORS[node.lane];
  const isActive = status !== "idle";
  const isProcessing = status === "processing";
  const isError = status === "error";
  const isSuccess = status === "success";
  const isDeferred = status === "deferred";
  const isRetry = status === "retry";

  const strokeColor =
    status === "error" || status === "retry"
      ? "#F47435"
      : status === "success"
      ? "#7BD8B5"
      : status === "processing"
      ? c
      : status === "deferred"
      ? "rgba(250,247,240,0.4)"
      : "rgba(250,247,240,0.2)";

  const dotColor =
    status === "error" || status === "retry"
      ? "#F47435"
      : status === "success"
      ? "#7BD8B5"
      : status === "deferred"
      ? "rgba(250,247,240,0.7)"
      : c;

  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      {/* Halo when processing */}
      {isProcessing && (
        <circle
          cx={0}
          cy={0}
          r={56}
          fill={c}
          opacity="0.08"
          filter="url(#node-glow)"
        >
          <animate attributeName="r" values="46;58;46" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.05;0.18;0.05" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main card */}
      <rect
        x={-46}
        y={-22}
        width={92}
        height={44}
        fill="rgba(10,9,8,0.96)"
        stroke={strokeColor}
        strokeWidth={isActive ? "1.5" : "0.85"}
        strokeDasharray={isDeferred ? "3 2" : undefined}
      />

      {/* Status indicator dot */}
      <circle cx={-37} cy={-13} r={2.5} fill={dotColor}>
        {isProcessing && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Status icon top-right */}
      {isSuccess && (
        <g transform="translate(34, -13)">
          <circle r="6" fill="#7BD8B5" />
          <path d="M -2.5 0 L -1 1.5 L 2.5 -2" stroke="#0A0908" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {isError && (
        <g transform="translate(34, -13)">
          <circle r="6" fill="#F47435" />
          <path d="M -2 -2 L 2 2 M -2 2 L 2 -2" stroke="#0A0908" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
      {isRetry && (
        <g transform="translate(34, -13)">
          <circle r="6" fill="#F47435" opacity="0.85" />
          <text textAnchor="middle" y="2" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#0A0908">↻</text>
        </g>
      )}
      {isProcessing && (
        <g transform="translate(34, -13)">
          <circle r="3" fill={c} opacity="0.9">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {isDeferred && (
        <g transform="translate(34, -13)">
          <circle r="6" fill="rgba(250,247,240,0.15)" stroke="rgba(250,247,240,0.5)" strokeWidth="0.75" />
          <text textAnchor="middle" y="2.5" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(250,247,240,0.7)">?</text>
        </g>
      )}

      {/* Labels */}
      <text textAnchor="middle" y={-1} fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="500" fill={isDeferred ? "rgba(250,247,240,0.7)" : "#FAF7F0"}>
        {node.label}
      </text>
      <text textAnchor="middle" y={11} fontSize="8" fontFamily="JetBrains Mono, monospace" fill="rgba(250,247,240,0.5)">
        {node.sub}
      </text>

      {/* Active-state underline */}
      {isActive && !isDeferred && (
        <line x1={-46} y1={28} x2={46} y2={28} stroke={dotColor} strokeWidth="1.5" />
      )}
    </g>
  );
}
