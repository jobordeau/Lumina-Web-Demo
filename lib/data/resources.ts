// Real Azure resources from the Lumina POC Terraform infrastructure.
// These names and configs match exactly what is deployed in rg-lumina-poc-dev.

export type ResourceCategory =
  | "ingress"
  | "compute"
  | "messaging"
  | "storage"
  | "data"
  | "orchestration"
  | "security"
  | "observability";

export interface AzureResource {
  id: string;
  name: string;
  type: string;
  category: ResourceCategory;
  role: string;
  description: string;
  config: { label: string; value: string }[];
  azIcon: string; // simplified label for the diagram
}

export const resources: AzureResource[] = [
  {
    id: "apim",
    name: "apim-lumina-dev-jobordeau",
    type: "API Management",
    category: "ingress",
    role: "Point d'entrée HTTP public",
    description:
      "Reçoit les commandes E-commerce, applique CORS et rate-limiting, ajoute le header X-Source-System, puis route vers l'Azure Function. Expose aussi l'endpoint GET /orders/{id}/status pour le polling de la démo.",
    config: [
      { label: "SKU", value: "Consumption" },
      { label: "Rate limit", value: "30 calls / 60 sec" },
      { label: "CORS", value: "Allow-origin: *" },
      { label: "Auth", value: "Anonymous (subscription_required = false)" },
      { label: "Backend", value: "fn-lumina-processor" },
      { label: "Operations", value: "POST /orders · GET /orders/{id}/status" },
    ],
    azIcon: "APIM",
  },
  {
    id: "fn-producer",
    name: "EcommerceOrderFunction",
    type: "Azure Function — HTTP Trigger",
    category: "compute",
    role: "Producteur — JSON brut → Modèle canonique → Service Bus",
    description:
      "Désérialise le payload e-commerce, mappe vers le modèle canonique Order, valide via FluentValidation côté entrée (fail-fast 400) puis publie dans le Topic Service Bus. MessageId du bus = OrderId pour traçabilité bout-en-bout.",
    config: [
      { label: "Runtime", value: ".NET 8 Isolated Worker" },
      { label: "Plan", value: "Linux Consumption" },
      { label: "Identité", value: "System Assigned Managed Identity" },
      { label: "Validation", value: "FluentValidation (OrderValidator)" },
      { label: "Auth", value: "Anonymous (exposé via APIM)" },
      { label: "Réponse", value: "202 Accepted ou 400 BadRequest" },
    ],
    azIcon: "FN",
  },
  {
    id: "servicebus",
    name: "sb-lumina-poc-dev-jobordeau",
    type: "Azure Service Bus — Topic + Subscription",
    category: "messaging",
    role: "Routage Pub/Sub asynchrone",
    description:
      "Topic 'sbt-lumina-orders' avec subscription 'sbs-process-order'. Découple le producteur du consommateur. MaxDeliveryCount = 3 avant DLQ.",
    config: [
      { label: "Tier", value: "Standard" },
      { label: "Topic", value: "sbt-lumina-orders" },
      { label: "Subscription", value: "sbs-process-order" },
      { label: "Max delivery", value: "3 (puis DLQ)" },
      { label: "Lock duration", value: "30 sec" },
    ],
    azIcon: "SB",
  },
  {
    id: "fn-consumer",
    name: "OrderProcessorFunction",
    type: "Azure Function — Service Bus Trigger",
    category: "compute",
    role: "Consommateur — Persiste en Data Lake",
    description:
      "Écoute la subscription, applique les règles métier (OrderProcessingService), puis écrit le JSON canonique dans le container 'gold-orders' de l'ADLS Gen2.",
    config: [
      { label: "Trigger", value: "ServiceBusTrigger" },
      { label: "Container cible", value: "gold-orders" },
      { label: "Auth ADLS", value: "Managed Identity (Storage Blob Data Contributor)" },
      { label: "Idempotent", value: "Oui — overwrite par OrderId" },
    ],
    azIcon: "FN",
  },
  {
    id: "fn-dlq",
    name: "FailedOrderFunction",
    type: "Azure Function — DLQ Listener",
    category: "compute",
    role: "Capture des messages morts",
    description:
      "Écoute '$DeadLetterQueue' de la subscription. Sérialise le message en échec dans le container 'failed-orders' pour analyse offline.",
    config: [
      { label: "Trigger", value: "sbs-process-order/$DeadLetterQueue" },
      { label: "Container cible", value: "failed-orders" },
      { label: "Format de fichier", value: "failed-order-{messageId}.json" },
    ],
    azIcon: "FN",
  },
  {
    id: "fn-status",
    name: "GetOrderStatusFunction",
    type: "Azure Function — HTTP Trigger",
    category: "compute",
    role: "Lookup du statut d'une commande dans le Data Lake",
    description:
      "Endpoint GET /orders/{orderId}/status interrogé en polling par le portfolio. Lit gold-orders, failed-orders, et alerts-sent pour exposer le statut complet (incluant la confirmation d'envoi email par Logic App).",
    config: [
      { label: "Trigger", value: "HttpTrigger · GET" },
      { label: "Route", value: "orders/{orderId}/status" },
      { label: "Containers consultés", value: "gold-orders + failed-orders + alerts-sent" },
      { label: "Auth", value: "Anonymous (exposé via APIM)" },
      { label: "Réponse", value: "completed · dead-lettered · pending + alert.sent" },
    ],
    azIcon: "FN",
  },
  {
    id: "fn-analytics",
    name: "GetAnalyticsSummaryFunction",
    type: "Azure Function — HTTP Trigger",
    category: "compute",
    role: "Exposition du snapshot analytique Fabric",
    description:
      "Endpoint GET /analytics/summary qui retourne le résumé de KPIs calculé par le notebook PySpark Fabric. Lit analytics-summary/latest.json depuis l'ADLS et le retourne tel quel avec un cache navigateur de 60s.",
    config: [
      { label: "Trigger", value: "HttpTrigger · GET" },
      { label: "Route", value: "analytics/summary" },
      { label: "Container source", value: "analytics-summary" },
      { label: "Cache", value: "public, max-age=60" },
      { label: "Réponse", value: "JSON KPIs (withDemoData + withoutDemoData)" },
    ],
    azIcon: "FN",
  },
  {
    id: "fn-health",
    name: "HealthCheckFunction",
    type: "Azure Function — HTTP Trigger",
    category: "compute",
    role: "Vérification de disponibilité du backend",
    description:
      "Endpoint GET /health très léger interrogé au chargement de chaque page du portfolio pour détecter si le backend Azure est en ligne. Permet d'afficher un bandeau de statut avant que l'utilisateur ne lance la démo.",
    config: [
      { label: "Trigger", value: "HttpTrigger · GET" },
      { label: "Route", value: "health" },
      { label: "Auth", value: "Anonymous" },
      { label: "Réponse", value: "200 OK · {status, timestamp, version}" },
      { label: "Cache", value: "no-cache, no-store" },
    ],
    azIcon: "FN",
  },
  {
    id: "adls",
    name: "adlsluminadevjobordeau",
    type: "Azure Data Lake Storage Gen2",
    category: "storage",
    role: "Stockage hiérarchique transactionnel & analytique",
    description:
      "Trois filesystems isolés : gold-orders (JSON validé), failed-orders (DLQ), analytics-orders (Parquet). Hierarchical Namespace activé.",
    config: [
      { label: "HNS", value: "Activé" },
      { label: "Tier", value: "Hot" },
      { label: "Replication", value: "LRS" },
      { label: "Filesystems", value: "3 (gold / failed / analytics)" },
    ],
    azIcon: "ADLS",
  },
  {
    id: "eventgrid",
    name: "Event Grid — System Topic",
    type: "Azure Event Grid",
    category: "orchestration",
    role: "Détection d'événements sur le Data Lake",
    description:
      "Souscrit aux événements 'Microsoft.Storage.BlobCreated' du conteneur failed-orders. Déclenche les Logic Apps en push.",
    config: [
      { label: "Source", value: "Storage Account adls-lumina" },
      { label: "Filter", value: "subject contains '/failed-orders/'" },
      { label: "Event type", value: "BlobCreated" },
    ],
    azIcon: "EG",
  },
  {
    id: "logicapp",
    name: "la-lumina-workflow-dev-jobordeau",
    type: "Azure Logic App",
    category: "orchestration",
    role: "Orchestration low-code event-driven",
    description:
      "Déclenchée par Event Grid. Lit le fichier d'erreur via la connection azureblob, parse le JSON, et envoie un email d'alerte aux équipes via Office365.",
    config: [
      { label: "Trigger", value: "Event Grid (BlobCreated)" },
      { label: "Connections", value: "azureblob, office365, servicebus" },
      { label: "Type", value: "Consumption" },
    ],
    azIcon: "LA",
  },
  {
    id: "adf",
    name: "adf-lumina-dev-jobordeau",
    type: "Azure Data Factory",
    category: "data",
    role: "Pipeline JSON → Parquet",
    description:
      "Convertit les commandes du container gold-orders en Parquet colonnaire (compression Snappy), déposé dans analytics-orders pour Microsoft Fabric.",
    config: [
      { label: "Pipeline", value: "pipeline-orders-to-parquet" },
      { label: "Trigger", value: "Schedule (toutes les 15 min)" },
      { label: "Compression", value: "Snappy" },
      { label: "Auth", value: "Managed Identity" },
    ],
    azIcon: "ADF",
  },
  {
    id: "fabric",
    name: "Microsoft Fabric Lakehouse",
    type: "Fabric — Shortcut + Spark",
    category: "data",
    role: "Couche analytique Zero-Copy",
    description:
      "Un Shortcut Fabric pointe sur l'URL DFS de l'ADLS. Les fichiers Parquet sont requêtés via PySpark et Spark SQL sans déplacement physique des données.",
    config: [
      { label: "Mode", value: "Shortcut (Zero Copy)" },
      { label: "Source URL", value: "abfss://...@adls.dfs.core.windows.net/" },
      { label: "Compute", value: "Spark Notebook (PySpark)" },
    ],
    azIcon: "FAB",
  },
  {
    id: "kv",
    name: "kv-lumina-dev-jobordeau",
    type: "Azure Key Vault",
    category: "security",
    role: "Coffre-fort des rares secrets",
    description:
      "L'architecture est 'zero password' via Managed Identity. Le Key Vault stocke uniquement les secrets non substituables (clés tierces, signing keys).",
    config: [
      { label: "SKU", value: "Standard" },
      { label: "Soft delete", value: "90 jours" },
      { label: "Access policy", value: "RBAC" },
      { label: "Permissions Function", value: "Get, List" },
    ],
    azIcon: "KV",
  },
];

export const resourceById = (id: string) =>
  resources.find((r) => r.id === id);
