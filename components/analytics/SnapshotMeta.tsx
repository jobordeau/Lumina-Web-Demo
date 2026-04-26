"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { formatRelativeTime, formatInteger } from "@/lib/analytics/api";

interface SnapshotMetaProps {
  summary: AnalyticsSummary;
  filterDemo: boolean;
}

export default function SnapshotMeta({ summary, filterDemo }: SnapshotMetaProps) {
  const visibleBlock = filterDemo ? summary.withoutDemoData : summary.withDemoData;
  const total = summary.sourceRecordCount;
  const visible = visibleBlock.totalOrders;
  const filtered = total - visible;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="border border-hairline bg-ink-50 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
    >
      <div className="flex items-center gap-2.5">
        <Layers className="w-3.5 h-3.5 text-lumina/70" strokeWidth={1.5} />
        <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
          Snapshot Fabric
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs">
        <SnapshotKv
          label="généré"
          value={formatRelativeTime(summary.generatedAt)}
          tone="lumina"
        />
        <SnapshotKv
          label="source"
          value={summary.sourceContainer}
          tone="signal"
          mono
        />
        <SnapshotKv
          label="parquet read"
          value={`${formatInteger(total)} lignes`}
        />
        {filterDemo && filtered > 0 && (
          <SnapshotKv
            label="filtré"
            value={`-${formatInteger(filtered)} démo`}
            tone="ember"
          />
        )}
        <SnapshotKv
          label="affiché"
          value={`${formatInteger(visible)} commandes`}
          tone="lumina"
        />
      </div>
    </motion.div>
  );
}

function SnapshotKv({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: "lumina" | "signal" | "ember";
  mono?: boolean;
}) {
  const colorClass =
    tone === "lumina"
      ? "text-lumina"
      : tone === "signal"
      ? "text-signal"
      : tone === "ember"
      ? "text-ember"
      : "text-ink-700";

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500">
        {label}
      </span>
      <span className={mono ? `font-mono ${colorClass}` : colorClass}>{value}</span>
    </div>
  );
}
