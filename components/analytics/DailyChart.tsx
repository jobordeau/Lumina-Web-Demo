"use client";

import { motion } from "framer-motion";
import type { DailyKpi } from "@/lib/analytics/api";
import { formatCurrency, formatInteger } from "@/lib/analytics/api";

interface DailyChartProps {
  data: DailyKpi[];
}

export default function DailyChart({ data }: DailyChartProps) {
  if (data.length === 0) {
    return (
      <div className="border border-hairline-strong bg-ink-50 p-6 min-h-[280px] flex items-center justify-center">
        <p className="text-ink-500 text-sm">Aucune donnée temporelle disponible.</p>
      </div>
    );
  }

  // Normalize: ensure last 30 days are represented even if some have no orders
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const maxOrders = Math.max(...sorted.map((d) => d.orderCount), 1);
  const totalRevenue = sorted.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = sorted.reduce((sum, d) => sum + d.orderCount, 0);

  const width = 800;
  const height = 240;
  const padding = { top: 24, right: 24, bottom: 36, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const barCount = sorted.length;
  const barWidth = Math.max(8, (chartW / barCount) * 0.7);
  const barGap = (chartW / barCount) * 0.3;

  return (
    <div className="border border-hairline-strong bg-ink-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-hairline px-4 py-3 bg-ink-100 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-500">
          commandes par jour · {sorted.length} jours
        </span>
        <div className="flex items-center gap-4 font-mono text-[0.65rem]">
          <span className="text-ink-500">
            <span className="text-lumina">Total :</span> {formatInteger(totalOrders)} commandes
          </span>
          <span className="text-ink-500">
            <span className="text-signal">CA :</span> {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="p-4 md:p-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dotgrid-chart"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="0.75" cy="0.75" r="0.75" fill="rgba(250,247,240,0.05)" />
            </pattern>
          </defs>

          <rect width={width} height={height} fill="url(#dotgrid-chart)" />

          {/* Y-axis grid lines + labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartH * (1 - ratio);
            const value = Math.round(maxOrders * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartW}
                  y2={y}
                  stroke="rgba(250,247,240,0.05)"
                  strokeWidth="0.75"
                  strokeDasharray={ratio === 0 ? "0" : "2 4"}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fill="rgba(250,247,240,0.4)"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {sorted.map((day, i) => {
            const x = padding.left + (chartW / barCount) * i + barGap / 2;
            const h = (day.orderCount / maxOrders) * chartH;
            const y = padding.top + chartH - h;
            const isLastWeek = i >= sorted.length - 7;
            return (
              <motion.g
                key={day.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015, duration: 0.4 }}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  fill={isLastWeek ? "#D9F84A" : "rgba(217, 248, 74, 0.4)"}
                  className="hover:opacity-80 transition-opacity"
                >
                  <title>
                    {day.date} · {day.orderCount} commandes ·{" "}
                    {formatCurrency(day.revenue)}
                  </title>
                </rect>
                {/* Order count label on top of bar (only if bar is tall enough) */}
                {h > 18 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                    fill="rgba(250,247,240,0.6)"
                    textAnchor="middle"
                  >
                    {day.orderCount}
                  </text>
                )}
              </motion.g>
            );
          })}

          {/* X-axis labels (every 5 days) */}
          {sorted.map((day, i) => {
            if (i % 5 !== 0 && i !== sorted.length - 1) return null;
            const x = padding.left + (chartW / barCount) * i + barWidth / 2 + barGap / 2;
            const date = new Date(day.date);
            const label = date.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            });
            return (
              <text
                key={`label-${day.date}`}
                x={x}
                y={padding.top + chartH + 18}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill="rgba(250,247,240,0.45)"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Footer legend */}
      <div className="border-t border-hairline px-4 py-2 bg-ink-0 flex items-center gap-4">
        <span className="font-mono text-[0.65rem] text-ink-500 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-lumina" />7 derniers jours
        </span>
        <span className="font-mono text-[0.65rem] text-ink-500 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-lumina/40" />historique
        </span>
      </div>
    </div>
  );
}
