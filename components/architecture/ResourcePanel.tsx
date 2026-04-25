"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import type { AzureResource } from "@/lib/data/resources";

const CATEGORY_LABELS: Record<string, string> = {
  ingress: "Ingress",
  compute: "Compute",
  messaging: "Messaging",
  storage: "Storage",
  data: "Data Engineering",
  orchestration: "Orchestration",
  security: "Sécurité & Identité",
  observability: "Observabilité",
};

const CATEGORY_TONES: Record<string, string> = {
  ingress: "text-lumina",
  compute: "text-lumina",
  messaging: "text-lumina",
  storage: "text-signal",
  data: "text-signal",
  orchestration: "text-ember",
  security: "text-ink-700",
  observability: "text-ink-700",
};

export default function ResourcePanel({
  resource,
  onClose,
}: {
  resource: AzureResource | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {resource ? (
        <motion.aside
          key={resource.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="border border-hairline-strong bg-ink-50 p-6 md:p-8 relative"
        >
          {/* Top corner brackets - editorial detail */}
          <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-lumina/40" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-lumina/40" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-lumina/40" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-lumina/40" />

          <header className="flex items-start justify-between mb-6">
            <div>
              <p className={`font-mono text-[0.65rem] tracking-widest uppercase mb-2 ${CATEGORY_TONES[resource.category]}`}>
                <span className="bracket-num">{resource.azIcon}</span>
                <span className="ml-3">{CATEGORY_LABELS[resource.category]}</span>
              </p>
              <h3 className="display-tight text-3xl text-ink-900 leading-tight mb-1">
                {resource.type.split("—")[0].trim()}
              </h3>
              <p className="font-mono text-xs text-ink-500 break-all">
                {resource.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-ink-100 transition-colors text-ink-500 hover:text-ink-900"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          <div className="rule mb-6" />

          <section className="mb-6">
            <p className="eyebrow mb-2">Rôle</p>
            <p className="text-ink-900 font-medium mb-4">{resource.role}</p>
            <p className="text-ink-700 text-sm leading-relaxed">
              {resource.description}
            </p>
          </section>

          <section className="mb-6">
            <p className="eyebrow mb-3">Configuration</p>
            <dl className="grid grid-cols-1 gap-2.5">
              {resource.config.map((c) => (
                <div
                  key={c.label}
                  className="grid grid-cols-[110px_1fr] gap-3 text-sm border-b border-hairline pb-2"
                >
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500 pt-0.5">
                    {c.label}
                  </dt>
                  <dd className="text-ink-900 break-words">{c.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="rule mb-6" />

          <p className="font-mono text-[0.65rem] text-ink-500 leading-relaxed">
            <span className="text-lumina">Note&nbsp;:</span> Cette ressource fait
            partie du Resource Group <span className="text-ink-900">rg-lumina-poc-dev</span>{" "}
            déployé via Terraform. Toutes les valeurs ci-dessus correspondent à la
            configuration exacte de l'infrastructure de production.
          </p>
        </motion.aside>
      ) : (
        <motion.aside
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-dashed border-hairline-strong bg-transparent p-8"
        >
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-hairline-strong text-ink-500 mb-6">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="display-italic text-2xl text-ink-900 mb-3">
              Sélectionnez un composant
            </h3>
            <p className="text-ink-500 text-sm leading-relaxed max-w-xs mx-auto">
              Cliquez sur n'importe quelle ressource du diagramme pour voir sa configuration réelle, son rôle dans le flux et ses paramètres Terraform.
            </p>

            <div className="mt-8 pt-8 border-t border-hairline">
              <p className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500 mb-3">
                Conseil
              </p>
              <p className="text-xs text-ink-700">
                Commencez par <span className="text-lumina">APIM</span>, puis suivez
                la flèche pour traverser le flux complet jusqu'au Data Lake.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
