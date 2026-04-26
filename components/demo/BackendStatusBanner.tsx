"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useSharedBackendHealth } from "@/components/shared/BackendHealthProvider";
import { cn } from "@/lib/utils";

/**
 * Prominent banner displayed on the demo page (and anywhere else needed)
 * showing the backend availability state. When unavailable, encourages
 * the visitor to contact the author.
 *
 * - "checking": neutral pulsing dot
 * - "healthy": green dot with latency
 * - "unavailable": orange dot with retry button + explanation
 */
export default function BackendStatusBanner() {
  const { status, latencyMs, recheck } = useSharedBackendHealth();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "border px-4 py-3 md:px-5 md:py-4 flex items-start md:items-center gap-3 md:gap-4",
          status === "healthy" && "border-signal/30 bg-signal/5",
          status === "checking" && "border-hairline-strong bg-ink-50",
          status === "unavailable" && "border-ember/40 bg-ember/5"
        )}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5 md:mt-0">
          {status === "healthy" && <CheckCircle2 className="w-5 h-5 text-signal" strokeWidth={1.5} />}
          {status === "checking" && <Loader2 className="w-5 h-5 text-ink-500 animate-spin" strokeWidth={1.5} />}
          {status === "unavailable" && <AlertCircle className="w-5 h-5 text-ember" strokeWidth={1.5} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {status === "healthy" && <HealthyContent latencyMs={latencyMs} />}
          {status === "checking" && <CheckingContent />}
          {status === "unavailable" && <UnavailableContent />}
        </div>

        {/* Retry button (only when unavailable) */}
        {status === "unavailable" && (
          <button
            onClick={recheck}
            className="shrink-0 inline-flex items-center gap-1.5 border border-ember/40 text-ember px-3 py-1.5 text-xs font-mono uppercase tracking-widest hover:bg-ember/10 transition-colors"
          >
            <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
            Re-vérifier
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function HealthyContent({ latencyMs }: { latencyMs: number | null }) {
  return (
    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
      <p className="font-mono text-[0.7rem] tracking-widest uppercase text-signal font-medium">
        ● Démo active
      </p>
      <p className="text-sm text-ink-700">
        Les ressources Azure sont en ligne et prêtes à recevoir des requêtes.
        {latencyMs !== null && (
          <span className="font-mono text-xs text-ink-500 ml-2">
            health latency : {latencyMs}ms
          </span>
        )}
      </p>
    </div>
  );
}

function CheckingContent() {
  return (
    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
      <p className="font-mono text-[0.7rem] tracking-widest uppercase text-ink-500 font-medium">
        ○ Vérification…
      </p>
      <p className="text-sm text-ink-600">
        Test de disponibilité du backend Azure.
      </p>
    </div>
  );
}

function UnavailableContent() {
  return (
    <div>
      <p className="font-mono text-[0.7rem] tracking-widest uppercase text-ember font-medium mb-1">
        ● Démo en pause
      </p>
      <p className="text-sm text-ink-700 leading-relaxed">
        Les ressources Azure sont temporairement éteintes pour économiser le crédit cloud.
        L'architecture, le code et la documentation restent entièrement consultables.
        Pour voir la démo en action, contactez-moi et je remets le backend en ligne.
      </p>
    </div>
  );
}
