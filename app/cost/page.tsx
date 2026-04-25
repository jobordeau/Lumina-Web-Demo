import ComingSoon from "@/components/shared/ComingSoon";

export default function CostPage() {
  return (
    <ComingSoon
      chapter="Chapitre 04 · TCO sur 3 ans"
      title="Le coût réel, par message, par mois, par an."
      italicWord="par message"
      prelude="Un calculateur interactif permettant de modéliser la facture mensuelle de l'architecture cloud-native pour un volume de messages donné. Décomposition par service Azure (APIM Consumption, Function execution, Service Bus messages, ADLS storage, ADF runs), évolution sur 36 mois, sensibilité aux pics d'activité."
      description="À 100 000 messages par jour, l'architecture serverless coûte moins de 200€ par mois — sans serveur à patcher."
      preview={[
        "Slider de volume : 1 000 à 1 000 000 messages / jour",
        "Slider de pic d'activité (×N pendant Black Friday)",
        "Décomposition fine : APIM Consumption, Function execution, Service Bus messages, ADLS storage, ADF runs",
        "Coût par requête, par mois, par an — actualisés en temps réel",
        "Graphique d'évolution sur 36 mois",
        "Export PDF de la simulation pour les comités d'investissement",
      ]}
    />
  );
}
