import ComingSoon from "@/components/shared/ComingSoon";

export default function CodePage() {
  return (
    <ComingSoon
      chapter="Chapitre 06 · Code & Infrastructure"
      title="Le code C#, le Terraform, sans fioritures."
      italicWord="le Terraform"
      prelude="Une visite guidée du code source. Les snippets-clés en C# .NET 8 (mapping canonique, FluentValidation, DefaultAzureCredential), les ressources Terraform les plus structurantes (RBAC, Service Bus avec DLQ, Data Lake Gen2 avec HNS), et le workflow GitHub Actions qui déploie tout en OIDC sans secret stocké."
      description="Du code testable, déployable, et auditable — pas un gist de tutoriel."
      preview={[
        "EcommerceOrderFunction.cs — le producteur HTTP avec mapping JSON → modèle canonique",
        "OrderProcessorFunction.cs — le consommateur Service Bus avec gestion d'idempotence",
        "FailedOrderFunction.cs — le listener de DLQ avec écriture passwordless dans l'ADLS",
        "OrderValidator.cs — les règles métier en FluentValidation",
        "main.tf — extraits du Terraform : Service Bus + RBAC + ADLS Gen2",
        "deploy-function.yml — le workflow GitHub Actions avec authentification OIDC",
      ]}
    />
  );
}
