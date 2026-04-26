"use client";

import { motion } from "framer-motion";

const stats = [
  {
    num: "01",
    value: "14",
    suffix: "",
    label: "Composants Azure déployés",
    note: "via Terraform · Infrastructure as Code",
  },
  {
    num: "02",
    value: "6",
    suffix: "",
    label: "Azure Functions .NET 8",
    note: "Producer · Consumer · DLQ · Status · Analytics · Health",
  },
  {
    num: "03",
    value: "0",
    suffix: "",
    label: "Mot de passe en clair",
    note: "100% Managed Identity + RBAC",
  },
  {
    num: "04",
    value: "3",
    suffix: "× retry",
    label: "Niveaux de résilience",
    note: "FluentValidation → Service Bus → DLQ",
  },
];

export default function KeyStats() {
  return (
    <section className="py-section border-t border-hairline">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-3">
            <p className="eyebrow eyebrow-dot">Métriques clés</p>
          </div>
          <div className="md:col-span-9">
            <h2 className="display-tight text-display-md text-balance">
              Une architecture
              <span className="display-italic text-lumina"> mesurable</span>,
              <br className="hidden md:block" />
              pas une promesse PowerPoint.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
          {stats.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="bg-ink-0 p-8 md:p-10 group hover:bg-ink-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
                  <span className="bracket-num">{s.num}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-ink-300 group-hover:bg-lumina transition-colors" />
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="display-tight text-6xl md:text-7xl text-ink-900 group-hover:text-lumina transition-colors">
                  {s.value}
                </span>
                {s.suffix && (
                  <span className="font-mono text-sm text-ink-500">
                    {s.suffix}
                  </span>
                )}
              </div>

              <p className="text-ink-900 font-medium mb-2">{s.label}</p>
              <p className="font-mono text-xs text-ink-500 leading-relaxed">
                {s.note}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
