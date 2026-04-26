"use client";

import { useReducer, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { demoReducer, initialState } from "@/lib/demo/reducer";
import { runDemoCycle } from "@/lib/demo/runner";
import { buildPresetPayload, buildEmptyCustomPayload } from "@/lib/demo/presets";
import { generateOrderId, APIM_BASE_URL, ORDERS_PATH } from "@/lib/demo/config";
import type { Mode, OrderPayload, ScenarioId } from "@/lib/demo/types";

import ConfigurationPanel from "@/components/demo/ConfigurationPanel";
import FlowVisualization from "@/components/demo/FlowVisualization";
import EventLog from "@/components/demo/EventLog";
import PayloadInspector from "@/components/demo/PayloadInspector";
import BackendStatusBanner from "@/components/demo/BackendStatusBanner";
import { useSharedBackendHealth } from "@/components/shared/BackendHealthProvider";

export default function DemoPage() {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const [customPayload, setCustomPayload] = useState<OrderPayload>(() => buildEmptyCustomPayload());
  const [runCount, setRunCount] = useState(0);
  const { status: backendStatus } = useSharedBackendHealth();

  // Cancellation flag — toggled when reset is hit so the runner aborts cleanly
  const cancelledRef = useRef(false);

  const handleModeChange = (mode: Mode) => {
    cancelledRef.current = true;
    dispatch({ type: "SET_MODE", mode });
    setRunCount(0);
    if (mode === "custom") {
      // Refresh the OrderId so each entry into custom mode gets a fresh one
      setCustomPayload(buildEmptyCustomPayload());
    }
  };

  const handleSelectPreset = (id: ScenarioId) => {
    dispatch({ type: "SELECT_PRESET", scenarioId: id });
    setRunCount(0);
  };

  const handleReset = () => {
    cancelledRef.current = true;
    dispatch({ type: "RESET" });
    if (state.mode === "custom") {
      setCustomPayload(buildEmptyCustomPayload());
    }
  };

  const handleRun = useCallback(() => {
    cancelledRef.current = false;

    let payload: OrderPayload;
    let scenarioId: ScenarioId | null = null;

    if (state.mode === "preset") {
      if (!state.scenarioId) return;
      scenarioId = state.scenarioId;
      payload = buildPresetPayload(state.scenarioId, generateOrderId());
    } else {
      // Custom mode — refresh OrderId every run so polling is meaningful
      payload = { ...customPayload, orderId: generateOrderId(), timestamp: new Date().toISOString() };
      setCustomPayload(payload); // reflect the regenerated id in the form
    }

    setRunCount((n) => n + 1);

    runDemoCycle({
      payload,
      scenarioId,
      dispatch,
      isCancelled: () => cancelledRef.current,
    });
  }, [state.mode, state.scenarioId, customPayload]);

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
            Chapitre 03 · Démonstration live
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="grid md:grid-cols-12 gap-8 items-end"
          >
            <h1 className="md:col-span-9 display-tight text-display-lg text-balance">
              Soumettez une commande,{" "}
              <span className="display-italic text-lumina">voyez-la voyager</span>{" "}
              en temps réel.
            </h1>
            <div className="md:col-span-3">
              <p className="text-ink-700 text-sm leading-relaxed border-l border-lumina pl-4">
                Trois presets prêts à l'emploi — ou personnalisez votre propre commande.
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
              Cette page envoie de <span className="text-lumina">vrais appels HTTP</span> vers
              l'APIM déployé sur Azure. Pas de simulation — chaque test consomme réellement le
              pipeline jusqu'au Data Lake.
            </p>
            <p className="font-mono text-xs text-ink-500 mt-4">
              endpoint · <span className="text-ink-700">{APIM_BASE_URL}{ORDERS_PATH}</span>
            </p>
            <p className="text-xs text-ink-500 mt-3 leading-relaxed border-l border-hairline-strong pl-3">
              <span className="font-mono text-ink-700">↳ Bon à savoir</span> · les commandes
              envoyées en mode <span className="text-lumina">preset</span> sont préfixées{" "}
              <span className="font-mono text-ink-700">DEMO-*</span> et exclues par défaut
              du dashboard <a href="/analytics" className="text-signal hover:underline">Analytics</a>{" "}
              (toutes identiques, elles fausseraient les KPIs). Les commandes en mode{" "}
              <span className="text-lumina">custom</span> apparaissent comme de vraies commandes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main grid */}
      <section className="pb-section">
        <div className="container-custom">
          {/* Backend status banner — first thing visitors see in the action area */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-6"
          >
            <BackendStatusBanner />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
          >
            {/* Top row */}
            <div className="lg:col-span-3 lg:h-[520px]">
              <ConfigurationPanel
                mode={state.mode}
                scenarioId={state.scenarioId}
                phase={state.phase}
                customPayload={customPayload}
                lastOrderId={state.orderId}
                runCount={runCount}
                backendStatus={backendStatus}
                onModeChange={handleModeChange}
                onSelectPreset={handleSelectPreset}
                onCustomPayloadChange={setCustomPayload}
                onRun={handleRun}
                onReset={handleReset}
              />
            </div>

            <div className="lg:col-span-9 lg:h-[520px]">
              <FlowVisualization
                nodeStatuses={state.nodeStatuses}
                phase={state.phase}
              />
            </div>

            {/* Bottom row */}
            <div className="lg:col-span-8 lg:h-[520px]">
              <EventLog
                logs={state.logs}
                phase={state.phase}
                pollAttempt={state.pollAttempt}
                orderId={state.orderId}
              />
            </div>

            <div className="lg:col-span-4 lg:h-[520px]">
              <PayloadInspector
                state={state}
                onTabChange={(tab) => dispatch({ type: "SET_PAYLOAD_TAB", tab })}
              />
            </div>
          </motion.div>

          {/* Footer notes */}
          <div className="mt-12 pt-8 border-t border-hairline">
            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-3">
                <p className="eyebrow eyebrow-dot">À propos de cette démo</p>
              </div>
              <div className="md:col-span-9 grid md:grid-cols-3 gap-6">
                <NoteBlock
                  num="01"
                  title="Vrais appels HTTP"
                  text="Le bouton 'Envoyer' fait un POST réel vers https://apim-lumina-dev-jobordeau.azure-api.net. Vous pouvez le voir dans l'onglet Network du navigateur."
                />
                <NoteBlock
                  num="02"
                  title="Polling sur le statut"
                  text="Après le 202, la page interroge GET /orders/{id}/status toutes les 2s pour savoir si la commande apparaît dans gold-orders/ ou failed-orders/."
                />
                <NoteBlock
                  num="03"
                  title="État inferred"
                  text="ADF (planifié) et Logic App (push depuis Event Grid) ne sont pas observables depuis l'API publique. Leur état est inféré depuis le scénario."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function NoteBlock({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina mb-2">
        <span className="bracket-num">{num}</span>
        <span className="ml-3">{title}</span>
      </p>
      <p className="text-sm text-ink-700 leading-relaxed">{text}</p>
    </div>
  );
}
