import ComingSoon from "@/components/shared/ComingSoon";

export default function DemoPage() {
  return (
    <ComingSoon
      chapter="Chapitre 03 · Démonstration interactive"
      title="Soumettez une commande, voyez-la voyager."
      italicWord="voyager"
      prelude="Cette page est la pièce maîtresse de la démo. Elle vous permettra de soumettre une commande e-commerce et de visualiser, en temps réel, son trajet à travers les 12 ressources Azure du POC. À chaque étape, vous verrez le payload se transformer — du JSON brut au modèle canonique, jusqu'à l'écriture finale dans le Data Lake."
      description="Trois scénarios — un succès, une erreur métier, une panne réseau — pour démontrer la résilience du pipeline."
      preview={[
        "Formulaire de soumission de commande avec validation côté client (FluentValidation simulée)",
        "Visualisation animée du parcours à travers APIM, Azure Function, Service Bus et ADLS Gen2",
        "Inspecteur de payload : le JSON brut, le modèle canonique, le Parquet final",
        "Bouton « Injecter une erreur » qui déclenche le mécanisme de retry × 3 puis la DLQ",
        "Console KQL simulée affichant les traces App Insights en streaming",
        "Mode replay pour rejouer un message historique depuis le container failed-orders",
      ]}
    />
  );
}
