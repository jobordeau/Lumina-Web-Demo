"use client";

import { useState } from "react";
import { resources } from "@/lib/data/resources";
import ResourcePanel from "./ResourcePanel";

export default function ArchDiagram() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(true);

  const selected = selectedId
    ? resources.find((r) => r.id === selectedId) ?? null
    : null;

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
      {/* Diagram canvas */}
      <div className="border border-hairline-strong bg-ink-50 relative overflow-hidden">
        <DiagramHeader animating={animating} setAnimating={setAnimating} />

        <div className="overflow-x-auto p-4 md:p-6">
          <DiagramSVG
            onSelect={setSelectedId}
            onHover={setHoveredId}
            hoveredId={hoveredId}
            selectedId={selectedId}
            animating={animating}
          />
        </div>

        <DiagramLegend />
      </div>

      {/* Side panel - sticky on desktop */}
      <div className="lg:sticky lg:top-24">
        <ResourcePanel
          resource={selected}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}

function DiagramHeader({
  animating,
  setAnimating,
}: {
  animating: boolean;
  setAnimating: (b: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ember" />
          <span className="w-2.5 h-2.5 rounded-full bg-ink-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-signal" />
        </div>
        <span className="font-mono text-xs text-ink-500 ml-3">
          rg-lumina-poc-dev — Topology View
        </span>
      </div>
      <button
        onClick={() => setAnimating(!animating)}
        className={`font-mono text-[0.65rem] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
          animating
            ? "border-lumina/40 text-lumina hover:bg-lumina/10"
            : "border-hairline-strong text-ink-500 hover:text-ink-900"
        }`}
      >
        {animating ? "● Flux animé" : "○ Flux statique"}
      </button>
    </div>
  );
}

function DiagramLegend() {
  return (
    <div className="border-t border-hairline px-6 py-4 flex flex-wrap items-center gap-6 text-xs">
      <LegendItem color="#D9F84A" label="Ingestion · orchestration" />
      <LegendItem color="#7BD8B5" label="Données · analytique" />
      <LegendItem color="#F47435" label="Résilience · DLQ" />
      <LegendItem color="rgba(250,247,240,0.5)" label="Transverse" dashed />
      <span className="ml-auto font-mono text-[0.65rem] text-ink-500 tracking-widest uppercase">
        ↳ Cliquez sur un composant
      </span>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-ink-500">
      {dashed ? (
        <svg width="20" height="2">
          <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      ) : (
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span>{label}</span>
    </div>
  );
}

// ===== The big SVG diagram =====
//
// LANE LAYOUT (role-coherent — each lane has ONE color identity):
//
//   Lane 1 (LUMINA, y=160)  Ingestion + orchestration
//   ────────────────────────────────────────────────────
//   [Client] [APIM] [Producer] [Service Bus] ──┐
//                       ▲                      │
//                       │ (Key Vault pin)      │
//                                              ├─→ Consumer (lane 2, top side)
//                                              │
//                                              └─→ DLQ (lane 3, left side)
//
//   Lane 2 (SIGNAL, y=320)  Données + analytique
//   ────────────────────────────────────────────────────
//                            [Consumer] → [gold-orders] → [ADF] → [Fabric]
//
//   Lane 3 (EMBER, y=480)  Résilience + DLQ
//   ────────────────────────────────────────────────────
//                            [DLQ] → [failed-orders] → [Event Grid] → [Logic App]
//
// Key Vault is a transverse identity component used only by the Producer.
// Rendered as a small annotation pin above the Producer block — not a regular
// node — to avoid wasting an entire swimlane on a single resource.
//
// ViewBox: 1620 × 580

interface NodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: "lumina" | "signal" | "ember" | "muted";
}

const LANE_Y = {
  L1: 160, // Ingestion
  L2: 320, // Data
  L3: 480, // Resilience
};

const COL_X = {
  A: 130,
  B: 330,
  C: 530,
  D: 730,
  E: 930,
  F: 1130,
  G: 1330,
  H: 1530,
};

const nodes: NodePosition[] = [
  // Lane 1 — Ingestion + orchestration (LUMINA)
  { id: "client", x: COL_X.A, y: LANE_Y.L1, label: "Client", sub: "E-commerce", tone: "muted" },
  { id: "apim", x: COL_X.B, y: LANE_Y.L1, label: "APIM", sub: "apim-lumina-dev", tone: "lumina" },
  { id: "fn-producer", x: COL_X.C, y: LANE_Y.L1, label: "Producer", sub: "EcommerceOrderFn", tone: "lumina" },
  { id: "servicebus", x: COL_X.D, y: LANE_Y.L1, label: "Service Bus", sub: "sbt-lumina-orders", tone: "lumina" },

  // Lane 2 — Data + analytics (SIGNAL)
  { id: "fn-consumer", x: COL_X.E, y: LANE_Y.L2, label: "Consumer", sub: "OrderProcessor", tone: "signal" },
  { id: "adls", x: COL_X.F, y: LANE_Y.L2, label: "Data Lake", sub: "gold-orders", tone: "signal" },
  { id: "adf", x: COL_X.G, y: LANE_Y.L2, label: "Data Factory", sub: "JSON → Parquet", tone: "signal" },
  { id: "fabric", x: COL_X.H, y: LANE_Y.L2, label: "Fabric", sub: "Zero-Copy", tone: "signal" },

  // Lane 3 — Resilience + DLQ (EMBER)
  { id: "fn-dlq", x: COL_X.E, y: LANE_Y.L3, label: "DLQ", sub: "FailedOrderFn", tone: "ember" },
  { id: "adls-failed", x: COL_X.F, y: LANE_Y.L3, label: "failed-orders", sub: "container", tone: "ember" },
  { id: "eventgrid", x: COL_X.G, y: LANE_Y.L3, label: "Event Grid", sub: "BlobCreated", tone: "ember" },
  { id: "logicapp", x: COL_X.H, y: LANE_Y.L3, label: "Logic App", sub: "Email alerte", tone: "ember" },
];

// Key Vault is rendered as a small pin above the Producer block (see KeyVaultPin component below).

const TONE_COLORS = {
  lumina: "#D9F84A",
  signal: "#7BD8B5",
  ember: "#F47435",
  muted: "rgba(250,247,240,0.4)",
};

// Map node visual id → resource panel id
const NODE_TO_RESOURCE: Record<string, string> = {
  apim: "apim",
  "fn-producer": "fn-producer",
  servicebus: "servicebus",
  "fn-consumer": "fn-consumer",
  adls: "adls",
  adf: "adf",
  fabric: "fabric",
  "fn-dlq": "fn-dlq",
  "adls-failed": "adls",
  eventgrid: "eventgrid",
  logicapp: "logicapp",
  kv: "kv",
};

function DiagramSVG({
  onSelect,
  onHover,
  hoveredId,
  selectedId,
  animating,
}: {
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  selectedId: string | null;
  animating: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1620 580"
      className="w-full h-auto min-w-[1100px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dotgrid-arch" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="0.75" cy="0.75" r="0.75" fill="rgba(250,247,240,0.07)" />
        </pattern>
        <marker id="arrow-lumina" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#D9F84A" opacity="0.7" />
        </marker>
        <marker id="arrow-signal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#7BD8B5" opacity="0.7" />
        </marker>
        <marker id="arrow-ember" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#F47435" opacity="0.7" />
        </marker>
        <marker id="arrow-muted" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="rgba(250,247,240,0.4)" />
        </marker>
      </defs>

      {/* Background grid */}
      <rect width="1620" height="580" fill="url(#dotgrid-arch)" />

      {/* Swimlane labels — 3 lanes only */}
      <SwimlaneLabel y={90} text="① INGESTION · ORCHESTRATION" color="#D9F84A" />
      <SwimlaneLabel y={250} text="② DONNÉES · DU GOLD AU LAKEHOUSE FABRIC" color="#7BD8B5" />
      <SwimlaneLabel y={410} text="③ RÉSILIENCE · DEAD-LETTER QUEUE" color="#F47435" />

      {/* Subtle swimlane separators (between lanes) */}
      <line x1="60" y1="240" x2="1580" y2="240" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />
      <line x1="60" y1="400" x2="1580" y2="400" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />

      {/* ============ KEY VAULT PIN (small annotation above Producer) ============ */}
      {/* Producer is at (530, 160), top edge at y=134. Key Vault pin sits at (530, 80) */}
      <KeyVaultPin x={530} y={80} onSelect={onSelect} isSelected={selectedId === "kv"} isHover={hoveredId === "kv-pin"} onHover={onHover} />
      {/* Connection line: KV pin (530, 96) → Producer top (530, 134) */}
      <line x1={530} y1={96} x2={530} y2={134} stroke="rgba(250,247,240,0.4)" strokeWidth="0.85" strokeDasharray="2 3" markerEnd="url(#arrow-muted)" />

      {/* ============ CONNECTION LINES ============ */}

      {/* --- Lane 1 internal: Client → APIM → Producer → Service Bus --- */}
      <FlowLine from={[176, 160]} to={[284, 160]} color="lumina" arrow />
      <FlowLine from={[376, 160]} to={[484, 160]} color="lumina" arrow />
      <FlowLine from={[576, 160]} to={[684, 160]} color="lumina" arrow />

      {/* --- Service Bus → Consumer (from RIGHT side of SB at 776,160 to TOP of Consumer at 930,294) --- */}
      <path
        d="M 776 160 C 870 160, 930 220, 930 294"
        fill="none"
        stroke="#7BD8B5"
        strokeWidth="1.25"
        opacity="0.7"
        markerEnd="url(#arrow-signal)"
      />
      <text x={830} y={205} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#7BD8B5" opacity="0.85">
        sbs-process-order
      </text>

      {/* --- Service Bus → DLQ (from bottom of SB at 730,186 to LEFT side of DLQ at 884,480) --- */}
      <path
        d="M 730 186 C 730 380, 770 480, 884 480"
        fill="none"
        stroke="#F47435"
        strokeWidth="1.25"
        strokeDasharray="3 3"
        opacity="0.7"
        markerEnd="url(#arrow-ember)"
      />
      <text x={745} y={345} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#F47435" opacity="0.85">
        × 3 retries
      </text>
      <text x={745} y={359} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#F47435" opacity="0.85">
        $DeadLetterQueue
      </text>

      {/* --- Lane 2 internal: Consumer → gold-orders → ADF → Fabric --- */}
      <FlowLine from={[976, 320]} to={[1084, 320]} color="signal" arrow />
      <FlowLine from={[1176, 320]} to={[1284, 320]} color="signal" arrow />
      <FlowLine from={[1376, 320]} to={[1484, 320]} color="signal" arrow dashed />

      {/* --- Lane 3 internal: DLQ → failed-orders → Event Grid → Logic App --- */}
      <FlowLine from={[976, 480]} to={[1084, 480]} color="ember" arrow />
      <FlowLine from={[1176, 480]} to={[1284, 480]} color="ember" arrow dashed />
      <FlowLine from={[1376, 480]} to={[1484, 480]} color="ember" arrow />

      {/* ============ ANIMATED FLOW DOTS ============ */}
      {animating && (
        <>
          {/* Happy path: Client → APIM → Producer → Service Bus → Consumer → ADLS → ADF → Fabric */}
          <circle r="4" fill="#D9F84A">
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              path="M 130,160 L 776,160 C 870,160 930,220 930,320 L 1530,320"
            />
            <animate attributeName="opacity" values="0;1;1;0" dur="6s" repeatCount="indefinite" />
          </circle>

          {/* Resilience path: Service Bus → DLQ → failed-orders → Event Grid → Logic App */}
          <circle r="3.5" fill="#F47435">
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              begin="2s"
              path="M 730,186 C 730,380 770,480 884,480 L 1530,480"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="6s"
              begin="2s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {/* ============ NODES ============ */}
      {nodes.map((n) => (
        <DiagramNode
          key={n.id}
          node={n}
          isHover={hoveredId === n.id}
          isSelected={selectedId === NODE_TO_RESOURCE[n.id]}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </svg>
  );
}

function SwimlaneLabel({ y, text, color }: { y: number; text: string; color: string }) {
  return (
    <text
      x={60}
      y={y}
      fontSize="9"
      fontFamily="JetBrains Mono, monospace"
      fill={color}
      letterSpacing="3"
      opacity="0.85"
    >
      {text}
    </text>
  );
}

function FlowLine({
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
  const c = TONE_COLORS[color];
  return (
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke={c}
      strokeWidth="1"
      strokeDasharray={dashed ? "3 3" : undefined}
      opacity="0.6"
      markerEnd={arrow ? `url(#arrow-${color})` : undefined}
    />
  );
}

function DiagramNode({
  node,
  isHover,
  isSelected,
  onSelect,
  onHover,
}: {
  node: NodePosition;
  isHover: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const c = TONE_COLORS[node.tone];
  const isMuted = node.tone === "muted";
  const resourceId = NODE_TO_RESOURCE[node.id];
  const isInteractive = !!resourceId;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => isInteractive && onSelect(resourceId)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className={isInteractive ? "cursor-pointer" : ""}
      opacity={nodeOpacity(isHover, isSelected, isMuted)}
    >
      {/* Selection ring */}
      {isSelected && (
        <rect
          x={-52}
          y={-32}
          width={104}
          height={64}
          fill="none"
          stroke={c}
          strokeWidth="1.5"
          strokeDasharray="2 2"
          opacity="0.7"
        />
      )}

      {/* Main card */}
      <rect
        x={-46}
        y={-26}
        width={92}
        height={52}
        fill="rgba(10,9,8,0.95)"
        stroke={c}
        strokeWidth={isHover || isSelected ? "1.5" : "0.85"}
      />

      {/* Status dot */}
      <circle cx={-37} cy={-17} r={2.5} fill={c} opacity={isMuted ? 0.7 : 1}>
        {isInteractive && !isMuted && (
          <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Labels */}
      <text textAnchor="middle" y={-3} fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="500" fill="#FAF7F0">
        {node.label}
      </text>
      <text textAnchor="middle" y={11} fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="rgba(250,247,240,0.55)">
        {node.sub}
      </text>

      {/* Hover accent */}
      {isHover && !isMuted && (
        <line x1={-46} y1={28} x2={46} y2={28} stroke={c} strokeWidth="1.5" />
      )}
    </g>
  );
}

function nodeOpacity(isHover: boolean, isSelected: boolean, isMuted: boolean) {
  if (isMuted) return 0.7;
  if (isSelected) return 1;
  if (isHover) return 1;
  return 0.95;
}

/**
 * Key Vault rendered as a small annotation pin instead of a full lane.
 * Compact (60×30 instead of 92×52), positioned just above the Producer block.
 * Clickable to open the resource panel like any other node.
 */
function KeyVaultPin({
  x,
  y,
  onSelect,
  isSelected,
  isHover,
  onHover,
}: {
  x: number;
  y: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isHover: boolean;
  onHover: (id: string | null) => void;
}) {
  const c = "rgba(250,247,240,0.4)";
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onSelect("kv")}
      onMouseEnter={() => onHover("kv-pin")}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
      opacity={isSelected || isHover ? 1 : 0.7}
    >
      {/* Selection ring */}
      {isSelected && (
        <rect
          x={-36}
          y={-18}
          width={72}
          height={36}
          fill="none"
          stroke={c}
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.7"
        />
      )}

      {/* Compact card */}
      <rect
        x={-30}
        y={-15}
        width={60}
        height={30}
        fill="rgba(10,9,8,0.95)"
        stroke={c}
        strokeWidth={isHover || isSelected ? "1" : "0.6"}
      />

      {/* Tiny lock-style indicator */}
      <circle cx={-22} cy={-7} r={1.75} fill={c} />

      {/* Label */}
      <text
        textAnchor="middle"
        y={-1}
        fontSize="9"
        fontFamily="DM Sans, sans-serif"
        fontWeight="500"
        fill="#FAF7F0"
      >
        Key Vault
      </text>
      <text
        textAnchor="middle"
        y={9}
        fontSize="7"
        fontFamily="JetBrains Mono, monospace"
        fill="rgba(250,247,240,0.5)"
      >
        passwordless
      </text>
    </g>
  );
}

