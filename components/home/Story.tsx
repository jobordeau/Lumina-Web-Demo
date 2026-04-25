"use client";

import { motion } from "framer-motion";

export default function Story() {
  return (
    <section className="py-section border-t border-hairline relative">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Left side - narrative */}
          <div className="md:col-span-5 md:sticky md:top-32 md:self-start">
            <p className="eyebrow eyebrow-dot mb-6">Le récit</p>
            <h2 className="display-tight text-display-md mb-8 text-balance">
              Deux époques.
              <br />
              <span className="display-italic text-lumina">Un même flux métier.</span>
            </h2>
            <div className="space-y-4 text-ink-700 leading-relaxed">
              <p>
                Une commande e-commerce arrive. Hier elle traversait un{" "}
                <span className="text-ink-900">Send Port BizTalk</span>,
                une <span className="text-ink-900">Pipeline XML</span> et une{" "}
                <span className="text-ink-900">Orchestration</span> hébergée sur un
                serveur on-premise.
              </p>
              <p>
                Aujourd'hui elle traverse une <span className="text-lumina">Function
                Azure stateless</span>, un Topic Service Bus pub/sub, et un Data
                Lake hiérarchique — le tout sans serveur à patcher, sans licence
                Enterprise, sans mot de passe.
              </p>
              <p className="display-italic text-xl text-ink-900 pt-4 border-t border-hairline">
                Le métier n'a pas changé. L'infrastructure, si.
              </p>
            </div>
          </div>

          {/* Right side - comparison */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 gap-px bg-hairline">
              {/* Legacy row */}
              <Comparison
                badge="Hier"
                badgeStyle="legacy"
                title="BizTalk Server 2010"
                items={[
                  { l: "Hébergement", v: "Windows Server on-premise" },
                  { l: "Licence", v: "Enterprise — ~6k€ / cœur" },
                  { l: "Scalabilité", v: "Vertical · provisioning manuel" },
                  { l: "Mapping", v: "BizTalk Mapper (XSLT visuel)" },
                  { l: "Orchestration", v: "Orchestration Designer (XOML)" },
                  { l: "Identité", v: "Service account + mot de passe en config" },
                  { l: "Observabilité", v: "BAM + Event Viewer" },
                  { l: "Déploiement", v: "MSI manuel · BTDF" },
                ]}
              />

              {/* Modern row */}
              <Comparison
                badge="Aujourd'hui"
                badgeStyle="modern"
                title="Azure Cloud-Native"
                items={[
                  { l: "Hébergement", v: "Azure Functions Linux Consumption" },
                  { l: "Licence", v: "Pay-per-execution · 0 €/mois au repos" },
                  { l: "Scalabilité", v: "Auto-scale horizontal sur événements" },
                  { l: "Mapping", v: "C# typé + FluentValidation" },
                  { l: "Orchestration", v: "Logic Apps + Event Grid (low-code)" },
                  { l: "Identité", v: "Managed Identity + RBAC (zero password)" },
                  { l: "Observabilité", v: "App Insights + KQL distribué" },
                  { l: "Déploiement", v: "GitHub Actions + Terraform" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison({
  badge,
  badgeStyle,
  title,
  items,
}: {
  badge: string;
  badgeStyle: "legacy" | "modern";
  title: string;
  items: { l: string; v: string }[];
}) {
  const isLegacy = badgeStyle === "legacy";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`relative bg-ink-0 p-8 md:p-10 ${isLegacy ? "stripes-warn" : ""}`}
    >
      <div className="flex items-center justify-between mb-6">
        <span
          className={`font-mono text-[0.65rem] tracking-widest uppercase px-2.5 py-1 ${
            isLegacy
              ? "bg-ember/10 text-ember"
              : "bg-lumina/10 text-lumina"
          }`}
        >
          {badge}
        </span>
        <h3
          className={`display-tight text-2xl ${
            isLegacy ? "text-ink-700 line-through decoration-ember decoration-1" : "text-ink-900"
          }`}
        >
          {title}
        </h3>
      </div>

      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col">
            <dt className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
              {it.l}
            </dt>
            <dd className={`text-sm mt-0.5 ${isLegacy ? "text-ink-600" : "text-ink-900"}`}>
              {it.v}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
