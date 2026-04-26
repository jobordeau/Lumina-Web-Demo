"use client";

import { motion } from "framer-motion";
import ArchDiagram from "@/components/architecture/ArchDiagram";

export default function ArchitecturePage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 md:pt-40 pb-16">
        <div className="container-custom">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow eyebrow-dot mb-6"
          >
            Chapitre 02 · Architecture détaillée
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="display-tight text-display-lg text-balance max-w-5xl"
          >
            Trois flux,{" "}
            <span className="display-italic text-lumina">douze composants</span>,
            une seule source de vérité.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="grid md:grid-cols-12 gap-8 mt-12"
          >
            <div className="md:col-span-7">
              <p className="text-ink-700 leading-relaxed">
                L'architecture distingue trois flux clairement séparés : le{" "}
                <span className="text-lumina">flux d'ingestion</span> qui
                porte la commande de bout-en-bout, la <span className="text-ember">résilience DLQ</span>{" "}
                qui capture les erreurs sans perdre de message, et le{" "}
                <span className="text-signal">flux analytique Zero-Copy</span>{" "}
                vers Microsoft Fabric. Le Key Vault, utilisé uniquement par le Producer,
                est représenté en annotation au-dessus de celui-ci.
              </p>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <div className="border-l border-lumina pl-4">
                <p className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina mb-2">
                  Mode d'emploi
                </p>
                <p className="text-sm text-ink-700">
                  Cliquez sur n'importe quelle ressource pour afficher sa configuration
                  Terraform, son rôle exact, et les paramètres clés.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Diagram + panel */}
      <section className="pb-section">
        <div className="container-custom">
          <ArchDiagram />
        </div>
      </section>

      {/* Below: Resource summary table */}
      <section className="py-section border-t border-hairline">
        <div className="container-custom">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-3">
              <p className="eyebrow eyebrow-dot">Inventaire</p>
            </div>
            <div className="md:col-span-9">
              <h2 className="display-tight text-display-md text-balance">
                Les douze composants,{" "}
                <span className="display-italic text-lumina">leur rôle exact</span>.
              </h2>
              <p className="mt-4 text-ink-700 text-sm leading-relaxed max-w-2xl">
                Le diagramme ci-dessus visualise les onze composants impliqués dans le
                flux. La douzième entrée (GetOrderStatusFunction) est une route HTTP
                additionnelle exposée par la même Function App, dédiée au polling
                de la démo — non visualisée pour préserver la lisibilité.
              </p>
            </div>
          </div>

          <ResourceTable />
        </div>
      </section>
    </>
  );
}

function ResourceTable() {
  // Imported lazily to keep this file readable
  const { resources } = require("@/lib/data/resources");
  return (
    <div className="border border-hairline">
      <div className="grid grid-cols-[2fr_2fr_3fr] gap-4 px-6 py-4 border-b border-hairline bg-ink-50">
        <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
          Ressource
        </span>
        <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
          Type
        </span>
        <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
          Rôle
        </span>
      </div>
      {resources.map((r: any, i: number) => (
        <div
          key={r.id}
          className="grid grid-cols-[2fr_2fr_3fr] gap-4 px-6 py-4 border-b border-hairline last:border-b-0 hover:bg-ink-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.65rem] text-ink-500">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-ink-900 break-all">{r.name}</span>
          </div>
          <span className="text-sm text-ink-700">{r.type}</span>
          <span className="text-sm text-ink-900">{r.role}</span>
        </div>
      ))}
    </div>
  );
}
