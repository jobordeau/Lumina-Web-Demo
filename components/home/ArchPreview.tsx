"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ArchPreview() {
  return (
    <section className="py-section border-t border-hairline">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-3">
            <p className="eyebrow eyebrow-dot">Architecture</p>
          </div>
          <div className="md:col-span-9">
            <h2 className="display-tight text-display-md text-balance">
              Trois flux,{" "}
              <span className="display-italic text-lumina">douze composants</span>,
              <br className="hidden md:block" /> une seule source de vérité.
            </h2>
            <p className="text-ink-700 mt-6 max-w-2xl">
              L'ingestion descend dans deux pipelines parallèles : la chaîne data
              (consommation, persistence, analytique Zero-Copy) et la chaîne résilience
              (DLQ, capture, alerte). Cliquez sur un composant pour voir sa configuration réelle.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="border border-hairline-strong bg-ink-50 p-6 md:p-12 relative overflow-hidden"
        >
          <FlowSVG />

          <div className="mt-8 pt-8 border-t border-hairline flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <p className="font-mono text-xs text-ink-500">
              <span className="text-lumina">●</span> Ingestion ·{" "}
              <span className="text-signal">●</span> Données &amp; analytique ·{" "}
              <span className="text-ember">●</span> Résilience &amp; DLQ
            </p>
            <Link
              href="/architecture"
              className="group inline-flex items-center gap-2 text-sm text-ink-900 hover:text-lumina transition-colors"
            >
              <span>Vue interactive complète</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Compact 3-lane diagram mirroring the architecture page layout.
// Lane 1 (lumina, y=100):  Client → APIM → Producer → Service Bus
// Lane 2 (signal, y=220):  Consumer Fn → gold-orders → ADF → Fabric
// Lane 3 (ember,  y=340):  DLQ Fn → failed-orders → Event Grid → Logic App

function FlowSVG() {
  return (
    <svg
      viewBox="0 0 1300 420"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dotgrid-preview" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="0.75" cy="0.75" r="0.6" fill="rgba(250,247,240,0.07)" />
        </pattern>
        <marker id="prev-arrow-l" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#D9F84A" opacity="0.7" />
        </marker>
        <marker id="prev-arrow-s" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#7BD8B5" opacity="0.7" />
        </marker>
        <marker id="prev-arrow-e" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#F47435" opacity="0.7" />
        </marker>
      </defs>

      <rect width="1300" height="420" fill="url(#dotgrid-preview)" />

      {/* Lane labels */}
      <text x={40} y={50} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#D9F84A" letterSpacing="3" opacity="0.85">
        ① INGESTION
      </text>
      <text x={40} y={170} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#7BD8B5" letterSpacing="3" opacity="0.85">
        ② DONNÉES + ANALYTIQUE
      </text>
      <text x={40} y={290} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#F47435" letterSpacing="3" opacity="0.85">
        ③ RÉSILIENCE
      </text>

      {/* Lane separators */}
      <line x1="40" y1="160" x2="1260" y2="160" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />
      <line x1="40" y1="280" x2="1260" y2="280" stroke="rgba(250,247,240,0.06)" strokeWidth="1" />

      {/* === Lane 1 internal connections === */}
      <line x1="146" y1="100" x2="234" y2="100" stroke="#D9F84A" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-l)" />
      <line x1="296" y1="100" x2="384" y2="100" stroke="#D9F84A" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-l)" />
      <line x1="446" y1="100" x2="534" y2="100" stroke="#D9F84A" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-l)" />

      {/* === Service Bus → Consumer (from RIGHT of SB at 611,100 to TOP of Consumer at 700,198) === */}
      <path
        d="M 611 100 C 660 100, 700 145, 700 198"
        fill="none"
        stroke="#7BD8B5"
        strokeWidth="1"
        opacity="0.65"
        markerEnd="url(#prev-arrow-s)"
      />

      {/* === Service Bus → DLQ (from bottom of SB at 565,122 to LEFT side of DLQ at 654,340) === */}
      <path
        d="M 565 122 C 565 280, 580 340, 654 340"
        fill="none"
        stroke="#F47435"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.65"
        markerEnd="url(#prev-arrow-e)"
      />
      <text x={528} y={245} fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#F47435" opacity="0.75">
        × 3 retries
      </text>

      {/* === Lane 2 internal connections === */}
      <line x1="732" y1="220" x2="820" y2="220" stroke="#7BD8B5" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-s)" />
      <line x1="882" y1="220" x2="970" y2="220" stroke="#7BD8B5" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-s)" />
      <line x1="1032" y1="220" x2="1120" y2="220" stroke="#7BD8B5" strokeWidth="1" opacity="0.6" strokeDasharray="3 3" markerEnd="url(#prev-arrow-s)" />

      {/* === Lane 3 internal connections === */}
      <line x1="732" y1="340" x2="820" y2="340" stroke="#F47435" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-e)" />
      <line x1="882" y1="340" x2="970" y2="340" stroke="#F47435" strokeWidth="1" opacity="0.6" strokeDasharray="3 3" markerEnd="url(#prev-arrow-e)" />
      <line x1="1032" y1="340" x2="1120" y2="340" stroke="#F47435" strokeWidth="1" opacity="0.6" markerEnd="url(#prev-arrow-e)" />

      {/* === Animated flow dots === */}
      {/* Happy + analytics path */}
      <circle r="3.5" fill="#D9F84A">
        <animateMotion
          dur="6s"
          repeatCount="indefinite"
          path="M 100,100 L 611,100 C 660,100 700,145 700,220 L 1150,220"
        />
        <animate attributeName="opacity" values="0;1;1;0" dur="6s" repeatCount="indefinite" />
      </circle>
      {/* Resilience path */}
      <circle r="3" fill="#F47435">
        <animateMotion
          dur="6s"
          repeatCount="indefinite"
          begin="2s"
          path="M 565,122 C 565,280 580,340 700,340 L 1150,340"
        />
        <animate attributeName="opacity" values="0;1;1;0" dur="6s" begin="2s" repeatCount="indefinite" />
      </circle>

      {/* === NODES === */}
      {/* Lane 1 — Ingestion (lumina) */}
      <Node x={100} y={100} label="Client" sub="E-commerce" tone="muted" />
      <Node x={265} y={100} label="APIM" sub="apim-lumina" tone="lumina" />
      <Node x={415} y={100} label="Producer" sub="EcommerceOrderFn" tone="lumina" />
      <Node x={565} y={100} label="Service Bus" sub="sbt-lumina-orders" tone="lumina" />

      {/* Lane 2 — Data + Analytics (signal) */}
      <Node x={700} y={220} label="Consumer" sub="OrderProcessor" tone="signal" />
      <Node x={850} y={220} label="Data Lake" sub="gold-orders" tone="signal" />
      <Node x={1000} y={220} label="Data Factory" sub="JSON → Parquet" tone="signal" />
      <Node x={1150} y={220} label="Fabric" sub="Zero-Copy" tone="signal" />

      {/* Lane 3 — Resilience (ember) */}
      <Node x={700} y={340} label="DLQ" sub="FailedOrderFn" tone="ember" />
      <Node x={850} y={340} label="failed-orders" sub="container" tone="ember" />
      <Node x={1000} y={340} label="Event Grid" sub="BlobCreated" tone="ember" />
      <Node x={1150} y={340} label="Logic App" sub="Email alerte" tone="ember" />
    </svg>
  );
}

function Node({
  x,
  y,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: "lumina" | "signal" | "ember" | "muted";
}) {
  const colorMap = {
    lumina: "#D9F84A",
    signal: "#7BD8B5",
    ember: "#F47435",
    muted: "rgba(250,247,240,0.4)",
  };
  const c = colorMap[tone];
  const isMuted = tone === "muted";

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-46}
        y={-22}
        width={92}
        height={44}
        fill="rgba(10,9,8,0.92)"
        stroke={c}
        strokeWidth="0.85"
      />
      <circle cx={-37} cy={-13} r={2.25} fill={c} opacity={isMuted ? 0.6 : 1} />
      <text textAnchor="middle" y={-1} fontSize="10.5" fontFamily="DM Sans, sans-serif" fontWeight="500" fill="#FAF7F0">
        {label}
      </text>
      <text textAnchor="middle" y={11} fontSize="8" fontFamily="JetBrains Mono, monospace" fill="rgba(250,247,240,0.5)">
        {sub}
      </text>
    </g>
  );
}
