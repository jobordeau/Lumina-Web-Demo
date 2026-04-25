"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ClosingCTA() {
  return (
    <section className="py-section border-t border-hairline relative overflow-hidden">
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(217,248,74,0.08), transparent)",
        }}
      />
      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="eyebrow eyebrow-dot mb-8">Le moment de vérité</p>
          <h2 className="display-tight text-display-lg text-balance">
            Une démo vaut mille slides.
            <br />
            <span className="display-italic text-lumina">Lancez le flux.</span>
          </h2>
          <p className="text-ink-700 mt-8 text-lg max-w-2xl mx-auto">
            Soumettez une commande, regardez-la traverser les 12 ressources Azure
            en temps réel. Injectez une erreur. Observez la résilience prendre le relais.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="group inline-flex items-center gap-3 bg-lumina text-ink-0 px-8 py-4 hover:bg-lumina-glow transition-all"
            >
              <span className="font-medium tracking-tight">Lancer la démo live</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="mt-12 font-mono text-[0.7rem] text-ink-500 tracking-widest uppercase">
            <span className="text-lumina">↓</span> 100% client-side · pas d'appel Azure réel · démo reproductible offline
          </p>
        </motion.div>
      </div>
    </section>
  );
}
