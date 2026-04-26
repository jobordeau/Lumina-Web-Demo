"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  fetchAnalyticsSummary,
  type AnalyticsFetchResult,
} from "@/lib/analytics/api";
import { ANALYTICS_PATH, APIM_BASE_URL } from "@/lib/demo/config";
import KpiCards from "@/components/analytics/KpiCards";
import DailyChart from "@/components/analytics/DailyChart";
import TopCustomers from "@/components/analytics/TopCustomers";
import SnapshotMeta from "@/components/analytics/SnapshotMeta";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [result, setResult] = useState<AnalyticsFetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDemo, setFilterDemo] = useState(true);

  const reload = async () => {
    setLoading(true);
    const r = await fetchAnalyticsSummary();
    setResult(r);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <>
      {/* Header */}
      <section className="pt-32 md:pt-36 pb-10">
        <div className="container-custom">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow eyebrow-dot mb-6"
          >
            Chapitre 04 · Analytics Zero-Copy
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="grid md:grid-cols-12 gap-8 items-end"
          >
            <h1 className="md:col-span-9 display-tight text-display-lg text-balance">
              Du Parquet au tableau de bord,{" "}
              <span className="display-italic text-signal">en passant par Fabric</span>.
            </h1>
            <div className="md:col-span-3">
              <p className="text-ink-700 text-sm leading-relaxed border-l border-signal pl-4">
                Ces KPIs sont calculés par un notebook PySpark qui lit le Parquet via Shortcut.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 max-w-3xl"
          >
            <p className="text-ink-700 leading-relaxed">
              Chaque commande qui traverse le pipeline finit en{" "}
              <span className="text-signal">JSON dans gold-orders</span>, puis est convertie
              en <span className="text-signal">Parquet par Data Factory</span>.
              Microsoft Fabric ne copie pas ces données — un Shortcut pointe directement sur
              l'ADLS et un notebook Spark calcule les KPIs ci-dessous, qu'il écrit dans
              un autre container. La page consomme ce résultat via une nouvelle Function HTTP.
            </p>
            <p className="font-mono text-xs text-ink-500 mt-4">
              endpoint · <span className="text-ink-700">{APIM_BASE_URL}{ANALYTICS_PATH}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-section">
        <div className="container-custom">
          {/* Loading */}
          {loading && !result && <LoadingState />}

          {/* Error states */}
          {!loading && result?.kind === "not-yet" && (
            <NotYetState message={result.message} onReload={reload} />
          )}
          {!loading && result?.kind === "error" && (
            <ErrorState message={result.message} onReload={reload} />
          )}

          {/* Success */}
          {result?.kind === "ok" && (
            <SuccessState
              summary={result.data}
              filterDemo={filterDemo}
              onToggleFilter={() => setFilterDemo((f) => !f)}
              loading={loading}
              onReload={reload}
            />
          )}
        </div>
      </section>
    </>
  );
}

function LoadingState() {
  return (
    <div className="border border-hairline-strong bg-ink-50 p-12 flex flex-col items-center gap-3">
      <Loader2 className="w-6 h-6 text-lumina animate-spin" strokeWidth={1.5} />
      <p className="font-mono text-xs text-ink-500 tracking-widest uppercase">
        Chargement du snapshot Fabric…
      </p>
    </div>
  );
}

function NotYetState({ message, onReload }: { message: string; onReload: () => void }) {
  return (
    <div className="border border-lumina/40 bg-lumina/5 p-6 md:p-8">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="w-5 h-5 text-lumina shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="font-mono text-[0.7rem] tracking-widest uppercase text-lumina mb-1">
            Snapshot pas encore généré
          </p>
          <p className="text-ink-700 leading-relaxed">{message}</p>
          <p className="text-ink-700 leading-relaxed mt-3 text-sm">
            Le notebook PySpark <span className="font-mono text-lumina">nb-lumina-analytics-summary</span>{" "}
            doit être exécuté dans Fabric. Une fois fait, le fichier{" "}
            <span className="font-mono text-lumina">analytics-summary/latest.json</span>{" "}
            apparaîtra et cette page se peuplera.
          </p>
        </div>
      </div>
      <button
        onClick={onReload}
        className="inline-flex items-center gap-2 border border-lumina/40 text-lumina px-3 py-1.5 text-xs font-mono uppercase tracking-widest hover:bg-lumina/10 transition-colors"
      >
        <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
        Re-vérifier
      </button>
    </div>
  );
}

function ErrorState({ message, onReload }: { message: string; onReload: () => void }) {
  return (
    <div className="border border-ember/40 bg-ember/5 p-6 md:p-8">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-ember shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="font-mono text-[0.7rem] tracking-widest uppercase text-ember mb-1">
            Backend en pause ou erreur
          </p>
          <p className="text-ink-700 leading-relaxed text-sm">
            Impossible de charger le snapshot. Probablement parce que les ressources Azure
            sont éteintes pour économiser. L'architecture, le code et la documentation
            restent consultables.
          </p>
          <p className="font-mono text-[0.65rem] text-ink-500 mt-3 break-all">
            ↳ {message}
          </p>
        </div>
      </div>
      <button
        onClick={onReload}
        className="inline-flex items-center gap-2 border border-ember/40 text-ember px-3 py-1.5 text-xs font-mono uppercase tracking-widest hover:bg-ember/10 transition-colors"
      >
        <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
        Re-vérifier
      </button>
    </div>
  );
}

interface SuccessStateProps {
  summary: import("@/lib/analytics/api").AnalyticsSummary;
  filterDemo: boolean;
  onToggleFilter: () => void;
  loading: boolean;
  onReload: () => void;
}

function SuccessState({
  summary,
  filterDemo,
  onToggleFilter,
  loading,
  onReload,
}: SuccessStateProps) {
  const block = filterDemo ? summary.withoutDemoData : summary.withDemoData;

  return (
    <div className="space-y-6">
      {/* Snapshot metadata + controls */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1">
          <SnapshotMeta summary={summary} filterDemo={filterDemo} />
        </div>

        <div className="flex items-center gap-3">
          <DemoFilterToggle filterDemo={filterDemo} onToggle={onToggleFilter} />
          <button
            onClick={onReload}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 border border-hairline-strong text-ink-700 px-3 py-2 text-xs font-mono uppercase tracking-widest hover:text-ink-900 hover:border-lumina/40 transition-colors",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("w-3 h-3", loading && "animate-spin")}
              strokeWidth={1.75}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <KpiCards kpis={block} />

      {/* 2-column grid: chart + top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-8">
          <DailyChart data={block.ordersPerDay} />
        </div>
        <div className="lg:col-span-4">
          <TopCustomers customers={block.topCustomers} />
        </div>
      </div>

      {/* Explanation of the data filtering */}
      <DataFilteringExplanation
        filterDemo={filterDemo}
        sourceCount={summary.sourceRecordCount}
        visibleCount={block.totalOrders}
      />

      {/* Footer note about the pipeline */}
      <div className="mt-12 pt-8 border-t border-hairline">
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <p className="eyebrow eyebrow-dot">Comment c'est calculé</p>
          </div>
          <div className="md:col-span-9 grid md:grid-cols-3 gap-6">
            <Step
              num="01"
              title="Stockage Parquet"
              text="Data Factory convertit chaque JSON de gold-orders en Parquet dans analytics-orders. Compression Snappy, schéma préservé."
            />
            <Step
              num="02"
              title="Fabric Spark"
              text="Notebook PySpark planifié toutes les 30 minutes qui lit les Parquet via Shortcut, calcule les agrégations avec Spark SQL, écrit le résultat en JSON dans analytics-summary."
            />
            <Step
              num="03"
              title="Function HTTP"
              text="GetAnalyticsSummaryFunction lit analytics-summary/latest.json et l'expose à cette page via APIM. Cache navigateur 60s."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DataFilteringExplanation({
  filterDemo,
  sourceCount,
  visibleCount,
}: {
  filterDemo: boolean;
  sourceCount: number;
  visibleCount: number;
}) {
  const filteredCount = sourceCount - visibleCount;

  return (
    <div className="border border-hairline-strong bg-ink-50 p-5 md:p-6">
      <div className="grid md:grid-cols-12 gap-5">
        <div className="md:col-span-3">
          <p className="eyebrow eyebrow-dot">Pourquoi cette séparation ?</p>
        </div>
        <div className="md:col-span-9 space-y-3 text-sm text-ink-700 leading-relaxed">
          <p>
            Le portfolio est public et reçoit du trafic réel. Pour préserver la qualité
            des analyses sans pénaliser l'expérience démo, le notebook Spark calcule
            <span className="text-lumina"> deux jeux de KPIs</span> à partir du même Parquet :
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div className={cn(
              "border px-3 py-2.5 transition-colors",
              !filterDemo ? "border-ember/40 bg-ember/5" : "border-hairline"
            )}>
              <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ember mb-1">
                Toutes données
              </p>
              <p className="text-xs text-ink-700 leading-snug">
                Inclut les commandes <span className="font-mono">DEMO-*</span> envoyées par
                les visiteurs en mode <span className="text-lumina">preset</span>. Toutes
                identiques (même SKU, même client, même montant) → fausse les KPIs.
              </p>
            </div>

            <div className={cn(
              "border px-3 py-2.5 transition-colors",
              filterDemo ? "border-signal/40 bg-signal/5" : "border-hairline"
            )}>
              <p className="font-mono text-[0.6rem] tracking-widest uppercase text-signal mb-1">
                Sans données démo (recommandé)
              </p>
              <p className="text-xs text-ink-700 leading-snug">
                Exclut uniquement les <span className="font-mono">DEMO-*</span>. Les
                commandes <span className="text-lumina">custom</span> (saisies à la
                main dans la démo) et le <span className="font-mono">SEED-*</span>{" "}
                (jeu de test réaliste) sont conservées car elles diffèrent.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-hairline">
            <p className="font-mono text-[0.65rem] text-ink-500 leading-relaxed">
              <span className="text-ink-700">État actuel</span> ·{" "}
              {filterDemo ? (
                <>
                  <span className="text-signal">{visibleCount}</span> commandes affichées,{" "}
                  <span className="text-ember">{filteredCount}</span> filtrées (DEMO-*)
                </>
              ) : (
                <>
                  <span className="text-ember">{sourceCount}</span> commandes affichées dont{" "}
                  <span className="text-ember">{filteredCount}</span> proviennent de la démo
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoFilterToggle({
  filterDemo,
  onToggle,
}: {
  filterDemo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors",
        filterDemo
          ? "border-signal/40 text-signal hover:bg-signal/5"
          : "border-ember/40 text-ember hover:bg-ember/5"
      )}
      title={
        filterDemo
          ? "Cliquer pour inclure les commandes DEMO-* (envoyées via le mode preset de la démo)"
          : "Cliquer pour exclure les commandes DEMO-* et ne garder que les vraies commandes"
      }
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          filterDemo ? "bg-signal" : "bg-ember"
        )}
      />
      {filterDemo ? "DEMO-* exclus" : "DEMO-* inclus"}
    </button>
  );
}

function Step({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-[0.65rem] tracking-widest uppercase text-signal mb-2">
        <span className="bracket-num">{num}</span>
        <span className="ml-3">{title}</span>
      </p>
      <p className="text-sm text-ink-700 leading-relaxed">{text}</p>
    </div>
  );
}
