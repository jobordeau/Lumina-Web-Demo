import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-section border-t border-hairline">
      <div className="container-custom py-16 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <p className="font-display italic text-3xl text-ink-900 leading-tight text-balance">
            Une architecture d'intégration cloud-native, de bout-en-bout.
          </p>
          <p className="mt-4 text-ink-500 text-sm max-w-md">
            Une preuve de concept conçue, codée et déployée en{" "}
            <span className="text-ink-900">100% Infrastructure as Code</span>,
            instrumentée bout-en-bout, et pensée pour des charges en production.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow eyebrow-dot mb-4">Naviguer</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="text-ink-700 hover:text-lumina transition-colors">Aperçu</Link></li>
            <li><Link href="/architecture" className="text-ink-700 hover:text-lumina transition-colors">Architecture</Link></li>
            <li><Link href="/demo" className="text-ink-700 hover:text-lumina transition-colors">Démo</Link></li>
            <li><Link href="/analytics" className="text-ink-700 hover:text-lumina transition-colors">Analytics</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow eyebrow-dot mb-4">Stack technique</p>
          <ul className="space-y-2 text-sm font-mono text-ink-500">
            <li>.NET 8 · Azure Functions Isolated Worker</li>
            <li>APIM · Service Bus · Event Grid · Logic Apps</li>
            <li>ADLS Gen2 · Data Factory · Microsoft Fabric</li>
            <li>Terraform · GitHub Actions · FluentValidation</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-ink-500 font-mono uppercase tracking-widest">
          <span>© 2026 · Lumina Integration POC</span>
          <span>Resource Group : rg-lumina-poc-dev</span>
          <span>Région : France Central</span>
        </div>
      </div>
    </footer>
  );
}
