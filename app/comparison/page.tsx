import ComingSoon from "@/components/shared/ComingSoon";

export default function ComparisonPage() {
  return (
    <ComingSoon
      chapter="Chapitre 04 · Migration patterns"
      title="BizTalk Server vs Azure cloud-native, ligne par ligne."
      italicWord="ligne par ligne"
      prelude="Une vue côte-à-côte exhaustive : pour chaque concept BizTalk, son équivalent Azure cloud-native, avec le code ou la configuration concrète. Conçue pour les architectes legacy qui veulent comprendre ce qui change réellement quand on passe d'un Send Port à un Output Binding, ou d'une Orchestration XOML à une Logic App."
      description="Un Send Port n'est pas qu'un Output Binding. Une Pipeline n'est pas qu'une Function. Voici pourquoi."
      preview={[
        "Tableau de correspondance complet : 14 concepts BizTalk → équivalent Azure",
        "Snippets côte-à-côte : code XOML BizTalk vs C# .NET 8",
        "Comparaison des modèles d'identité : service account vs Managed Identity",
        "Différences de modèle de coût (CapEx vs OpEx, par cœur vs par exécution)",
        "Pièges classiques de migration et comment les éviter",
        "Score de portabilité par fonctionnalité (vert / orange / rouge)",
      ]}
    />
  );
}
