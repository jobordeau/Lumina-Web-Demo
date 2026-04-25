import ComingSoon from "@/components/shared/ComingSoon";

export default function CostPage() {
  return (
    <ComingSoon
      chapter="Chapitre 05 · TCO sur 3 ans"
      title="Le coût réel, par message, par mois, par an."
      italicWord="par message"
      prelude="Un calculateur interactif permettant de modéliser la facture mensuelle des deux architectures pour un volume de messages donné. Inclut les coûts cachés du legacy (licences SQL Enterprise, support BizTalk, salle serveur, redondance) et la pente d'économies d'échelle d'Azure consumption."
      description="À 100 000 messages par jour, l'écart de TCO sur 3 ans dépasse les six chiffres."
      preview={[
        "Slider de volume : 1 000 à 1 000 000 messages / jour",
        "Slider de pic d'activité (×N pendant Black Friday)",
        "Décomposition Azure : APIM Consumption, Function execution, Service Bus messages, ADLS storage, ADF runs",
        "Décomposition BizTalk : licences cœur, SQL Server Enterprise, RDS, support, salle serveur, redondance",
        "Graphique d'évolution sur 36 mois avec point de bascule",
        "Export PDF de la simulation pour les comités d'investissement",
      ]}
    />
  );
}
