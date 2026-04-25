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
              Une commande franchit{" "}
              <span className="display-italic text-lumina">12 ressources Azure</span>
              <br className="hidden md:block" /> en moins d'une seconde.
            </h2>
            <p className="text-ink-700 mt-6 max-w-2xl">
              Chaque hop est observable, chaque transformation est testable, chaque
              échec est rejouable. Cliquez sur un composant pour voir sa configuration réelle.
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
              <span className="text-lumina">●</span> Producteur ·{" "}
              <span className="text-signal">●</span> Consommateur ·{" "}
              <span className="text-ember">●</span> Dead-Letter Queue
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

function FlowSVG() {
  return (
    <svg
      viewBox="0 0 1200 360"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Animated dot moving along the path */}
        <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D9F84A" stopOpacity="0" />
          <stop offset="100%" stopColor="#D9F84A" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Background dotted grid */}
      <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="rgba(250,247,240,0.08)" />
      </pattern>
      <rect width="1200" height="360" fill="url(#dotgrid)" />

      {/* Connection lines */}
      <g stroke="rgba(250,247,240,0.2)" strokeWidth="1" strokeDasharray="4 4" fill="none">
        <line x1="180" y1="120" x2="320" y2="120" />
        <line x1="460" y1="120" x2="600" y2="120" />
        <line x1="740" y1="120" x2="880" y2="120" />
        <line x1="1020" y1="120" x2="1160" y2="120" />
        {/* DLQ branch */}
        <path d="M 670 145 Q 670 230 600 230 L 460 230" />
        <line x1="320" y1="230" x2="180" y2="230" />
      </g>

      {/* Animated flow dot */}
      <circle r="4" fill="#D9F84A">
        <animateMotion
          dur="6s"
          repeatCount="indefinite"
          path="M 180,120 L 320,120 L 460,120 L 600,120 L 740,120 L 880,120 L 1020,120 L 1160,120"
        />
        <animate attributeName="opacity" values="0;1;1;0" dur="6s" repeatCount="indefinite" />
      </circle>

      {/* Nodes - top row (happy path) */}
      <Node x={120} y={120} label="Client" sub="E-commerce" tone="muted" />
      <Node x={260} y={120} label="APIM" sub="apim-lumina" tone="lumina" />
      <Node x={400} y={120} label="Function" sub="Producer" tone="lumina" />
      <Node x={540} y={120} label="Service Bus" sub="sbt-lumina-orders" tone="lumina" />
      <Node x={680} y={120} label="Function" sub="Consumer" tone="signal" />
      <Node x={820} y={120} label="ADLS Gen2" sub="gold-orders" tone="signal" />
      <Node x={960} y={120} label="Data Factory" sub="JSON → Parquet" tone="signal" />
      <Node x={1100} y={120} label="Fabric" sub="Zero-Copy" tone="signal" />

      {/* DLQ branch */}
      <Node x={540} y={230} label="DLQ" sub="$DeadLetterQueue" tone="ember" />
      <Node x={400} y={230} label="DLQ Function" sub="failed-orders" tone="ember" />
      <Node x={260} y={230} label="Event Grid" sub="BlobCreated" tone="ember" />
      <Node x={120} y={230} label="Logic App" sub="Email alerte" tone="ember" />

      {/* Section labels */}
      <text x={600} y={30} textAnchor="middle" className="text-[10px]" fontFamily="monospace" fill="rgba(250,247,240,0.4)" letterSpacing="2">
        — FLUX TRANSACTIONNEL · HAPPY PATH —
      </text>
      <text x={300} y={310} textAnchor="middle" className="text-[10px]" fontFamily="monospace" fill="rgba(244,116,53,0.5)" letterSpacing="2">
        — RÉSILIENCE · DEAD-LETTER QUEUE —
      </text>
    </svg>
  );
}

function Node({ x, y, label, sub, tone }: { x: number; y: number; label: string; sub: string; tone: "lumina" | "signal" | "ember" | "muted" }) {
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
      <rect x={-50} y={-25} width={100} height={50}
        fill="rgba(10,9,8,0.8)"
        stroke={c}
        strokeWidth="0.75" />
      <circle cx={-40} cy={-15} r={2.5} fill={c} opacity={isMuted ? 0.6 : 1} />
      <text textAnchor="middle" y={-2} fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="500" fill="#FAF7F0">{label}</text>
      <text textAnchor="middle" y={12} fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="rgba(250,247,240,0.5)">{sub}</text>
    </g>
  );
}
