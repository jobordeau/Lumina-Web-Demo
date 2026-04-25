"use client";

import { useEffect, useRef } from "react";
import type { LogEntry, LogLevel, DemoPhase } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<LogLevel, string> = {
  INF: "text-signal",
  WRN: "text-lumina",
  ERR: "text-ember",
  REQ: "text-lumina",
  RES: "text-ink-700",
};

const LEVEL_BG: Record<LogLevel, string> = {
  INF: "bg-signal/10",
  WRN: "bg-lumina/10",
  ERR: "bg-ember/15",
  REQ: "bg-lumina/15",
  RES: "bg-ink-200",
};

interface EventLogProps {
  logs: LogEntry[];
  phase: DemoPhase;
  pollAttempt: number;
  orderId: string | null;
}

export default function EventLog({ logs, phase, pollAttempt, orderId }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  const isStreaming =
    phase === "posting" || phase === "polling";

  return (
    <div className="border border-hairline-strong bg-ink-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 bg-ink-100">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ember" />
            <span className="w-2 h-2 rounded-full bg-ink-300" />
            <span className="w-2 h-2 rounded-full bg-signal" />
          </div>
          <span className="font-mono text-xs text-ink-500 ml-2">
            event log · live
          </span>
        </div>
        <div className="flex items-center gap-3">
          {orderId && (
            <span className="font-mono text-[0.65rem] text-ink-500">
              order={orderId}
            </span>
          )}
          {isStreaming && (
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lumina animate-pulse" />
              {phase === "posting" ? "posting" : `polling · #${pollAttempt}`}
            </span>
          )}
        </div>
      </div>

      {/* Log stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs leading-relaxed scroll-smooth"
        style={{ minHeight: "260px", maxHeight: "440px" }}
      >
        {logs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-hairline">
            {logs.map((entry) => (
              <LogLine key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  // Display wall-clock time HH:mm:ss.SSS extracted from wallTs
  const wall = new Date(entry.wallTs);
  const time = wall.toISOString().substring(11, 23);

  const isSystem = entry.source === "SYSTEM";

  return (
    <div
      className={cn(
        "px-4 py-1.5 hover:bg-ink-100 transition-colors animate-fade-up",
        isSystem && "bg-ink-100/50"
      )}
      style={{ animationDuration: "0.4s" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-ink-500 shrink-0">{time}</span>

        <span
          className={cn(
            "shrink-0 px-1.5 py-0.5 text-[0.6rem] tracking-wider font-medium",
            LEVEL_BG[entry.level],
            LEVEL_COLORS[entry.level]
          )}
        >
          {entry.level}
        </span>

        <span className="text-ink-700 shrink-0 min-w-[110px]">
          [{entry.source}]
        </span>

        <span
          className={cn(
            "flex-1 break-words",
            entry.level === "ERR" ? "text-ember" :
            entry.level === "WRN" ? "text-lumina" :
            isSystem ? "text-ink-700 italic" :
            "text-ink-900"
          )}
        >
          {entry.message}
        </span>
      </div>
      {entry.detail && (
        <div className="ml-[178px] mt-1 text-ink-500 text-[0.7rem] break-all">
          ↳ {entry.detail}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
      <div className="font-mono text-xs text-ink-500 mb-3">
        <span className="text-lumina">{">"}</span> No events yet
      </div>
      <p className="text-ink-600 text-xs max-w-xs">
        Configurez puis envoyez une commande. Vous verrez ici les vraies
        requêtes HTTP, leurs codes de statut, et les transitions du pipeline.
      </p>
    </div>
  );
}
