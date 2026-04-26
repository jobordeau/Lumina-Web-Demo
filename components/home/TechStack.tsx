"use client";

import { motion } from "framer-motion";

const stacks = [
  {
    title: "Compute & Intégration",
    items: [
      ".NET 8 · Isolated Worker",
      "Azure Functions (HTTP + Service Bus triggers)",
      "API Management (Consumption)",
      "Service Bus (Topic + Subscription + DLQ)",
      "Event Grid (BlobCreated)",
      "Logic Apps",
    ],
  },
  {
    title: "Stockage & Data",
    items: [
      "Azure Data Lake Storage Gen2",
      "Hierarchical Namespace",
      "Azure Data Factory",
      "Parquet · compression Snappy",
      "Microsoft Fabric Lakehouse",
      "Spark / PySpark / Spark SQL",
    ],
  },
  {
    title: "Sécurité & Identité",
    items: [
      "Managed Identity (System Assigned)",
      "Azure RBAC granulaire",
      "Key Vault",
      "DefaultAzureCredential",
      "Storage Blob Data Contributor",
      "Service Bus Data Owner / Sender / Receiver",
    ],
  },
  {
    title: "Code & DevOps",
    items: [
      "Terraform (HCL)",
      "GitHub Actions (CI/CD)",
      "FluentValidation (entrée + sortie)",
      "Hexagonal architecture (Core / Infrastructure)",
      "DI native (Program.cs)",
      "CORS configuré pour le portfolio",
    ],
  },
];

export default function TechStack() {
  return (
    <section className="py-section border-t border-hairline">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-3">
            <p className="eyebrow eyebrow-dot">Stack complète</p>
          </div>
          <div className="md:col-span-9">
            <h2 className="display-tight text-display-md text-balance">
              Tout ce qui est{" "}
              <span className="display-italic text-lumina">déployé</span>{" "}
              dans <span className="font-mono text-2xl md:text-3xl">rg-lumina-poc-dev</span>.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stacks.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <p className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina mb-6">
                <span className="bracket-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ml-3">{s.title}</span>
              </p>
              <ul className="space-y-3">
                {s.items.map((it) => (
                  <li
                    key={it}
                    className="text-ink-700 text-sm border-b border-hairline pb-3 hover:text-ink-900 hover:border-lumina/40 transition-colors"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
