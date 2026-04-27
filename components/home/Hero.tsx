"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 overflow-hidden">
      {/* Background ambient grid */}
      <BackgroundGrid />

      <div className="container-custom relative">
        {/* Top metadata strip — 3 items now (no Édition) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 pb-6 md:pb-8 border-b border-hairline"
        >
          <Meta label="Cas client" value="E-commerce / EAI" />
          <Meta label="Architecture" value="Cloud-Native · Serverless" />
          <Meta label="Pattern" value="Event-Driven Pub/Sub" />
        </motion.div>

        {/* Main headline */}
        <div className="pt-8 md:pt-10 pb-4 grid md:grid-cols-12 gap-6 md:gap-8 items-end">
          <div className="md:col-span-9">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="eyebrow eyebrow-dot mb-4"
            >
              Preuve de Concept · rg-lumina-poc-dev
            </motion.p>

            <h1 className="display-tight text-display-xl text-ink-900 text-balance leading-[0.95]">
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                Une intégration
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                <span className="display-italic text-lumina">event-driven</span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block text-ink-500"
              >
                de bout-en-bout.
              </motion.span>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="md:col-span-3 md:pb-2"
          >
            <p className="text-ink-700 text-sm leading-relaxed border-l border-lumina pl-4">
              Une POC d'architecture EAI moderne :{" "}
              <span className="text-ink-900">100% serverless, event-driven et passwordless</span>{" "}
              sur Microsoft Azure, instrumentée bout-en-bout.
            </p>
          </motion.div>
        </div>

        {/* Long-form intro — tighter top margin */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="grid md:grid-cols-12 gap-8 mt-6 md:mt-8"
        >
          <div className="md:col-start-4 md:col-span-9">
            <p className="text-base md:text-lg text-ink-700 leading-relaxed text-balance">
              Lumina est une <em className="display-italic text-ink-900 font-normal">preuve de concept</em>{" "}
              de bout-en-bout : APIM, Azure Functions en producteur/consommateur,
              Service Bus avec Dead-Letter Queue, Data Lake Gen2, orchestration
              Logic Apps, et couche analytique <span className="text-lumina">Microsoft Fabric en Zero-Copy</span>.
            </p>
          </div>
        </motion.div>

        {/* CTA row — tighter top margin */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 md:mt-10 flex flex-col md:flex-row gap-4 md:items-center"
        >
          <Link
            href="/demo"
            className="group inline-flex items-center gap-3 bg-lumina text-ink-0 px-6 py-3.5 hover:bg-lumina-glow transition-all"
          >
            <span className="font-medium tracking-tight">Lancer la démo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/architecture"
            className="group inline-flex items-center gap-3 border border-hairline-strong text-ink-900 px-6 py-3.5 hover:border-lumina hover:text-lumina transition-all"
          >
            <span className="font-medium tracking-tight">Explorer l'architecture</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <span className="font-mono text-xs text-ink-500 md:ml-4">
            <span className="text-lumina">↓</span> 14 composants Azure · 6 Functions · 0 secret en clair
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500 mb-1.5">
        {label}
      </p>
      <p className="text-ink-900 text-sm">{value}</p>
    </div>
  );
}

function BackgroundGrid() {
  return (
    <>
      {/* Faint vertical guide lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(250,247,240,0.4) 1px, transparent 1px)",
          backgroundSize: "8.33% 100%",
        }}
      />
      {/* Glow blob */}
      <div
        className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(217,248,74,0.10), transparent)",
        }}
      />
    </>
  );
}
