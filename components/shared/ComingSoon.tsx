"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  chapter: string;
  title: string;
  italicWord: string;
  prelude: string;
  description: string;
  preview: string[];
}

export default function ComingSoon({
  chapter,
  title,
  italicWord,
  prelude,
  description,
  preview,
}: ComingSoonProps) {
  return (
    <section className="pt-32 md:pt-40 pb-section min-h-[80vh]">
      <div className="container-custom">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow eyebrow-dot mb-6"
        >
          {chapter}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="display-tight text-display-lg text-balance max-w-5xl"
        >
          {title.split(italicWord)[0]}
          <span className="display-italic text-lumina">{italicWord}</span>
          {title.split(italicWord)[1]}
        </motion.h1>

        <div className="mt-16 grid md:grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="md:col-span-7"
          >
            <p className="text-ink-700 leading-relaxed mb-8">{prelude}</p>

            <div className="border-l-2 border-lumina pl-6 py-2 mb-12">
              <p className="display-italic text-2xl text-ink-900 leading-snug">
                {description}
              </p>
            </div>

            <div className="border border-hairline-strong p-6 md:p-8 bg-ink-50">
              <p className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina mb-4">
                <span className="bracket-num">EN COURS</span>
                <span className="ml-3">Aperçu de cette section</span>
              </p>
              <ul className="space-y-3">
                {preview.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink-700">
                    <span className="font-mono text-ink-500 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/"
              className="group inline-flex items-center gap-2 mt-12 text-sm text-ink-500 hover:text-lumina transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Retour à l'aperçu</span>
            </Link>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="md:col-span-4 md:col-start-9"
          >
            <div className="sticky top-32 border border-dashed border-hairline-strong p-8 relative">
              <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-lumina/40" />
              <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-lumina/40" />
              <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-lumina/40" />
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-lumina/40" />

              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-lumina animate-pulse" />
                  <span className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina">
                    Build · in progress
                  </span>
                </div>
                <p className="display-italic text-3xl text-ink-900 mb-3">
                  Bientôt ici.
                </p>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Cette section sera ajoutée lors de la prochaine itération de
                  cette démo. La conception et l'architecture sous-jacente sont
                  déjà finalisées.
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
