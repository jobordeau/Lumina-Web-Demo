"use client";

import { motion } from "framer-motion";
import { Boxes, Shield, Workflow, Layers, Database, GitBranch } from "lucide-react";

const patterns = [
  {
    icon: Workflow,
    title: "Pub/Sub asynchrone",
    badge: "EAI Pattern",
    text: "Topic Service Bus + subscription. Le producteur ne connaît pas ses consommateurs. Découplage temporel et fonctionnel — on peut ajouter un nouveau consommateur (ex. CRM) sans toucher au producteur.",
    code: "Topic: sbt-lumina-orders\nSubscription: sbs-process-order",
  },
  {
    icon: Boxes,
    title: "Modèle canonique",
    badge: "EAI Pattern",
    text: "Le payload e-commerce hétérogène est mappé vers un modèle Order canonique en C#. Les consommateurs ne dépendent jamais des formats source. Si demain on ajoute un canal mobile, seul le mapper change.",
    code: "JSON brut → Order { OrderId, CustomerId, TotalAmount }",
  },
  {
    icon: Shield,
    title: "Zero Password",
    badge: "Sécurité",
    text: "Aucune chaîne de connexion en config. Toutes les ressources s'authentifient via Managed Identity. RBAC granulaire (Storage Blob Data Contributor, Service Bus Data Owner) attribué via Terraform.",
    code: "DefaultAzureCredential() — pas de SAS, pas de clé.",
  },
  {
    icon: Layers,
    title: "Résilience à 3 niveaux",
    badge: "Reliability",
    text: "Validation FluentValidation côté producteur, retry automatique Service Bus (×3), puis Dead-Letter Queue + Function dédiée qui persiste l'échec dans le Data Lake pour rejeu offline.",
    code: "MaxDeliveryCount = 3 → DLQ → failed-orders/",
  },
  {
    icon: Database,
    title: "Zero-Copy Analytics",
    badge: "Data Engineering",
    text: "Microsoft Fabric ne copie pas les données. Un Shortcut pointe sur l'URL DFS de l'ADLS, et Spark requête directement les fichiers Parquet. Coût de stockage divisé par deux.",
    code: "abfss://...@adls.dfs.core.windows.net/",
  },
  {
    icon: GitBranch,
    title: "Infrastructure as Code",
    badge: "DevOps",
    text: "Tout le Resource Group est codé en HCL. Workflow GitHub Actions qui compile le C# .NET 8 et déploie sur le Function App à chaque push. Une PR = un changement d'infrastructure auditable.",
    code: "src/** push → dotnet publish → Functions Action deploy",
  },
];

export default function Patterns() {
  return (
    <section className="py-section border-t border-hairline">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-3">
            <p className="eyebrow eyebrow-dot">Décisions d'architecture</p>
          </div>
          <div className="md:col-span-9">
            <h2 className="display-tight text-display-md text-balance">
              Six patterns,{" "}
              <span className="display-italic text-lumina">un seul dénominateur</span>{" "}
              : intentionalité.
            </h2>
            <p className="mt-6 text-ink-700 max-w-3xl">
              Chaque choix d'architecture répond à une contrainte métier ou opérationnelle.
              Voici les six décisions structurantes du POC, chacune justifiée par l'usage.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
          {patterns.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.6 }}
              className="bg-ink-0 p-8 md:p-10 group hover:bg-ink-50 transition-colors flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-10 h-10 border border-hairline-strong flex items-center justify-center group-hover:border-lumina group-hover:text-lumina text-ink-700 transition-colors">
                  <p.icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500">
                  <span className="bracket-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ml-2">{p.badge}</span>
                </span>
              </div>

              <h3 className="display-tight text-2xl md:text-3xl text-ink-900 mb-4">
                {p.title}
              </h3>
              <p className="text-ink-700 text-sm leading-relaxed mb-6 flex-1">
                {p.text}
              </p>

              <pre className="font-mono text-[0.7rem] text-lumina/80 bg-ink-50 group-hover:bg-ink-0 transition-colors border-l-2 border-lumina/40 p-3 whitespace-pre-wrap">
                {p.code}
              </pre>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
