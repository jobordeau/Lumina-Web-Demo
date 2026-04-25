"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { resources, type AzureResource } from "@/lib/data/resources";
import ResourcePanel from "./ResourcePanel";

export default function ArchDiagram() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
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
            onHover={setHoverId}
            hoverId={hoverId}
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
      <LegendItem color="#D9F84A" label="Producteur" />
      <LegendItem color="#7BD8B5" label="Consommateur · Données" />
      <LegendItem color="#F47435" label="Résilience · DLQ" />
      <LegendItem color="rgba(250,247,240,0.5)" label="Cross-cutting" dashed />
      <span className="ml-auto font-mono text-[0.65rem] text-ink-500 tracking-widest uppercase">
        ↳ Cliquez sur un composant
      </span>
    </div>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
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

interface NodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: "lumina" | "signal" | "ember" | "muted";
}

const nodes: NodePosition[] = [
  // Top swimlane - Happy path (y=120)
  { id: "client", x: 90, y: 120, label: "Client", sub: "E-commerce", tone: "muted" },
  { id: "apim", x: 240, y: 120, label: "APIM", sub: "apim-lumina-dev", tone: "lumina" },
  { id: "fn-producer", x: 400, y: 120, label: "Producer Fn", sub: "EcommerceOrderFn", tone: "lumina" },
  { id: "servicebus", x: 580, y: 120, label: "Service Bus", sub: "sbt-lumina-orders", tone: "lumina" },
  { id: "fn-consumer", x: 760, y: 120, label: "Consumer Fn", sub: "OrderProcessor", tone: "signal" },
  { id: "adls", x: 940, y: 120, label: "Data Lake", sub: "gold-orders", tone: "signal" },

  // Middle swimlane - DLQ branch (y=300)
  { id: "dlq", x: 580, y: 300, label: "DLQ", sub: "$DeadLetterQueue", tone: "ember", },
  { id: "fn-dlq", x: 760, y: 300, label: "DLQ Fn", sub: "FailedOrderFn", tone: "ember" },
  { id: "adls-failed", x: 940, y: 300, label: "failed-orders", sub: "container", tone: "ember" },
  { id: "eventgrid", x: 1100, y: 300, label: "Event Grid", sub: "BlobCreated", tone: "ember" },
  { id: "logicapp", x: 1260, y: 300, label: "Logic App", sub: "Email alerte", tone: "ember" },

  // Bottom swimlane - Analytics (y=480)
  { id: "adls-gold-2", x: 940, y: 480, label: "gold-orders", sub: "JSON canonique", tone: "signal" },
  { id: "adf", x: 1100, y: 480, label: "Data Factory", sub: "JSON → Parquet", tone: "signal" },
  { id: "fabric", x: 1260, y: 480, label: "Fabric", sub: "Zero-Copy", tone: "signal" },

  // Cross-cutting (right side)
  { id: "kv", x: 400, y: 620, label: "Key Vault", sub: "kv-lumina-dev", tone: "muted" },
  { id: "appinsights", x: 760, y: 620, label: "App Insights", sub: "Télémétrie", tone: "muted" },
];

const TONE_COLORS = {
  lumina: "#D9F84A",
  signal: "#7BD8B5",
  ember: "#F47435",
  muted: "rgba(250,247,240,0.4)",
};

function DiagramSVG({
  onSelect,
  onHover,
  hoverId,
  selectedId,
  animating,
}: {
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  hoverId: string | null;
  selectedId: string | null;
  animating: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1400 720"
      className="w-full h-auto min-w-[900px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dotgrid-arch" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="0.75" cy="0.75" r="0.75" fill="rgba(250,247,240,0.07)" />
        </pattern>
        <marker id="arrow-lumina" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#D9F84A" opacity="0.6" />
        </marker>
        <marker id="arrow-signal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#7BD8B5" opacity="0.6" />
        </marker>
        <marker id="arrow-ember" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#F47435" opacity="0.6" />
        </marker>
      </defs>

      {/* Background grid */}
      <rect width="1400" height="720" fill="url(#dotgrid-arch)" />

      {/* Swimlane labels */}
      <SwimlaneLabel y={50} text="① TRANSACTIONNEL · HAPPY PATH" color="#D9F84A" />
      <SwimlaneLabel y={232} text="② RÉSILIENCE · DEAD-LETTER QUEUE" color="#F47435" />
      <SwimlaneLabel y={412} text="③ ANALYTIQUE · ZERO-COPY VERS FABRIC" color="#7BD8B5" />
      <SwimlaneLabel y={580} text="④ TRANSVERSE · IDENTITÉ & OBSERVABILITÉ" color="rgba(250,247,240,0.4)" />

      {/* Swimlane separators (subtle) */}
      <line x1="40" y1="186" x2="1360" y2="186" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />
      <line x1="40" y1="366" x2="1360" y2="366" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />
      <line x1="40" y1="546" x2="1360" y2="546" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />

      {/* CONNECTION LINES */}
      {/* Happy path links */}
      <FlowLine from={[136, 120]} to={[195, 120]} color="lumina" arrow />
      <FlowLine from={[286, 120]} to={[354, 120]} color="lumina" arrow />
      <FlowLine from={[446, 120]} to={[534, 120]} color="lumina" arrow />
      <FlowLine from={[626, 120]} to={[714, 120]} color="lumina" arrow />
      <FlowLine from={[806, 120]} to={[894, 120]} color="signal" arrow />

      {/* DLQ branch from Service Bus down */}
      <path
        d="M 580 146 L 580 220 Q 580 240 580 274"
        fill="none"
        stroke="#F47435"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.55"
        markerEnd="url(#arrow-ember)"
      />
      <text x={595} y={195} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#F47435" opacity="0.7">
        × 3 retries
      </text>
      <FlowLine from={[626, 300]} to={[714, 300]} color="ember" arrow />
      <FlowLine from={[806, 300]} to={[894, 300]} color="ember" arrow />
      <FlowLine from={[986, 300]} to={[1054, 300]} color="ember" arrow dashed />
      <FlowLine from={[1146, 300]} to={[1214, 300]} color="ember" arrow />

      {/* Analytics branch from ADLS gold down */}
      <path
        d="M 940 146 L 940 400 Q 940 420 940 454"
        fill="none"
        stroke="#7BD8B5"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.55"
        markerEnd="url(#arrow-signal)"
      />
      <text x={950} y={420} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#7BD8B5" opacity="0.7">
        scheduled
      </text>
      <FlowLine from={[986, 480]} to={[1054, 480]} color="signal" arrow />
      <FlowLine from={[1146, 480]} to={[1214, 480]} color="signal" arrow dashed />

      {/* Cross-cutting - dotted lines from Functions to Key Vault and App Insights */}
      <path d="M 400 146 Q 400 380 400 594" fill="none" stroke="rgba(250,247,240,0.2)" strokeWidth="0.75" strokeDasharray="2 4" />
      <path d="M 760 146 Q 760 380 760 594" fill="none" stroke="rgba(250,247,240,0.2)" strokeWidth="0.75" strokeDasharray="2 4" />
      <path d="M 760 326 Q 760 460 760 594" fill="none" stroke="rgba(250,247,240,0.2)" strokeWidth="0.75" strokeDasharray="2 4" />

      {/* Animated flow dots */}
      {animating && (
        <>
          <circle r="3.5" fill="#D9F84A">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 90,120 L 940,120" />
            <animate attributeName="opacity" values="0;1;1;0" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle r="3" fill="#F47435">
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              begin="2s"
              path="M 580,120 L 580,300 L 1260,300"
            />
            <animate attributeName="opacity" values="0;1;1;0" dur="7s" begin="2s" repeatCount="indefinite" />
          </circle>
          <circle r="3" fill="#7BD8B5">
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              begin="1.5s"
              path="M 940,120 L 940,480 L 1260,480"
            />
            <animate attributeName="opacity" values="0;1;1;0" dur="6s" begin="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* RENDER NODES */}
      {nodes.map((n) => (
        <DiagramNode
          key={n.id}
          node={n}
          isHover={hoverId === n.id}
          isSelected={selectedId === n.id}
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
      x={40}
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
      opacity="0.55"
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
  const isInteractive = ["apim", "fn-producer", "servicebus", "fn-consumer", "adls", "fn-dlq", "eventgrid", "logicapp", "adf", "fabric", "kv", "appinsights"].includes(node.id);

  // Map duplicate gold-orders display to the real "adls" id
  const targetId =
    node.id === "adls-failed" ? "fn-dlq" :
    node.id === "adls-gold-2" ? "adls" :
    node.id === "dlq" ? "servicebus" :
    node.id;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => isInteractive && onSelect(targetId)}
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
          opacity="0.6"
        />
      )}

      {/* Main card */}
      <rect
        x={-46}
        y={-26}
        width={92}
        height={52}
        fill="rgba(10,9,8,0.92)"
        stroke={c}
        strokeWidth={isHover || isSelected ? "1.5" : "0.75"}
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
      {isHover && (
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
