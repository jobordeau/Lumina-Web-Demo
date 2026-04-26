"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    label: "Ingress",
    title: "APIM reçoit la requête",
    text: "L'API Management applique le rate-limiting (30 req/min), ajoute un header X-Source-System, et applique la policy CORS, puis route la requête vers la Function HTTP.",
    code: "POST /orders → apim-lumina-dev-jobordeau",
    tone: "lumina" as const,
  },
  {
    num: "02",
    label: "Canonicalisation",
    title: "Mapping vers le modèle canonique",
    text: "La Function producteur désérialise le JSON e-commerce hétérogène, le mappe vers le modèle Order canonique (.NET 8), puis applique la validation FluentValidation côté entrée.",
    code: "EcommerceOrderFunction.Run() → Order { OrderId, ... }",
    tone: "lumina" as const,
  },
  {
    num: "03",
    label: "Pub/Sub",
    title: "Publication sur le Topic Service Bus",
    text: "Le message canonique est publié dans le topic. Le découplage commence ici : le producteur ne connaît plus ses consommateurs. Une nouvelle subscription = un nouveau canal sans modifier le code amont.",
    code: "Topic: sbt-lumina-orders · Subscription: sbs-process-order",
    tone: "lumina" as const,
  },
  {
    num: "04",
    label: "Consommation",
    title: "Persistence dans le Data Lake",
    text: "La Function consommateur lit la subscription, applique les règles métier (OrderProcessingService), puis écrit le JSON canonique dans le container gold-orders de l'ADLS Gen2 — en mode passwordless.",
    code: "OrderProcessorFunction → adls/gold-orders/{OrderId}.json",
    tone: "signal" as const,
  },
  {
    num: "05",
    label: "Analytique",
    title: "JSON → Parquet → Microsoft Fabric",
    text: "Data Factory convertit gold-orders en Parquet (compression Snappy) toutes les 15 minutes. Microsoft Fabric pointe sur l'ADLS via un Shortcut — Zero-Copy, pas de duplication des données.",
    code: "ADF pipeline → analytics-orders/*.parquet → Fabric Shortcut",
    tone: "signal" as const,
  },
  {
    num: "06",
    label: "Résilience",
    title: "Retry · DLQ · Alerte",
    text: "À tout moment un message peut échouer. Service Bus rejoue 3 fois (MaxDeliveryCount), puis bascule en Dead-Letter Queue. Une Function dédiée capture le message mort, le persiste dans failed-orders, et déclenche une Logic App via Event Grid.",
    code: "× 3 retries → DLQ → FailedOrderFunction → failed-orders/ → Event Grid → Logic App",
    tone: "ember" as const,
  },
];

export default function Story() {
  return (
    <section className="py-section border-t border-hairline relative">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Left side - sticky narrative */}
          <div className="md:col-span-5 md:sticky md:top-32 md:self-start">
            <p className="eyebrow eyebrow-dot mb-6">L'anatomie d'un message</p>
            <h2 className="display-tight text-display-md mb-8 text-balance">
              Une commande,
              <br />
              <span className="display-italic text-lumina">six étapes</span>,
              <br />
              douze composants.
            </h2>
            <div className="space-y-4 text-ink-700 leading-relaxed">
              <p>
                Une commande e-commerce arrive sur l'endpoint HTTP. Quelques secondes plus
                tard, elle est canonisée, validée par <span className="text-ink-900">FluentValidation</span>,
                persistée dans le Data Lake, puis indexée pour l'analytique{" "}
                <span className="text-ink-900">Microsoft Fabric</span>.
              </p>
              <p>
                Voici ce qui se passe entre le moment où le client clique{" "}
                <span className="font-mono text-xs text-lumina">POST /orders</span>{" "}
                et celui où l'équipe Data écrit son premier{" "}
                <span className="font-mono text-xs text-lumina">SELECT *</span>{" "}
                sur le Lakehouse.
              </p>
              <p className="display-italic text-xl text-ink-900 pt-4 border-t border-hairline">
                Chaque étape est typée. Chaque hop est tracé. Chaque échec est rejouable.
              </p>
            </div>
          </div>

          {/* Right side - timeline of 6 steps */}
          <div className="md:col-span-7">
            <ol className="grid grid-cols-1 gap-px bg-hairline">
              {steps.map((s, i) => (
                <Step key={s.num} step={s} index={i} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  step,
  index,
}: {
  step: typeof steps[number];
  index: number;
}) {
  const colorClass = {
    lumina: "text-lumina",
    signal: "text-signal",
    ember: "text-ember",
  }[step.tone];

  const borderColorClass = {
    lumina: "border-lumina/40 group-hover:border-lumina",
    signal: "border-signal/40 group-hover:border-signal",
    ember: "border-ember/40 group-hover:border-ember",
  }[step.tone];

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="bg-ink-0 group hover:bg-ink-50 transition-colors p-6 md:p-8 relative"
    >
      <div className="flex items-start gap-6">
        {/* Step number */}
        <div className="shrink-0">
          <div className={`w-12 h-12 border ${borderColorClass} flex items-center justify-center transition-colors`}>
            <span className={`font-mono text-sm font-medium ${colorClass}`}>
              {step.num}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 min-w-0">
          <p className={`font-mono text-[0.65rem] tracking-widest uppercase ${colorClass} mb-1.5`}>
            {step.label}
          </p>
          <h3 className="display-tight text-xl md:text-2xl text-ink-900 mb-3">
            {step.title}
          </h3>
          <p className="text-ink-700 text-sm leading-relaxed mb-4">
            {step.text}
          </p>
          <pre className={`font-mono text-[0.7rem] ${colorClass} bg-ink-50 group-hover:bg-ink-0 transition-colors border-l-2 ${borderColorClass.split(" ")[0]} px-3 py-2 whitespace-pre-wrap break-words opacity-80`}>
            {step.code}
          </pre>
        </div>
      </div>
    </motion.li>
  );
}
