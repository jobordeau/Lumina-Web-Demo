# Lumina — Architecture d'intégration cloud-native sur Azure

Site de présentation pour la **POC Lumina Integration** — une preuve de concept
d'architecture EAI moderne sur Microsoft Azure : 12 ressources, 3 Azure Functions
.NET 8, Service Bus avec Dead-Letter Queue, Data Lake Gen2, Microsoft Fabric.

> Ce site est un **outil de présentation**. Il n'appelle aucune API Azure réelle —
> toutes les démonstrations sont 100% côté client et reproductibles offline.

---

## ⚡ Lancement rapide

### Prérequis

- **Node.js 18.17+** ([télécharger](https://nodejs.org/))
- **npm** (livré avec Node.js)
- Un terminal (PowerShell, Terminal macOS, bash Linux)

### Démarrer en deux commandes

```bash
# 1. Installer les dépendances (une seule fois, ~1 min)
npm install

# 2. Démarrer le serveur de développement
npm run dev
```

Le site est ensuite disponible sur **http://localhost:3000**. Il se rafraîchit
automatiquement à chaque modification de fichier.

---

## 🚀 Déployer sur Vercel

Vercel est l'hébergeur officiel de Next.js. Le déploiement est gratuit et prend
**moins de 2 minutes**.

### Méthode A — Via GitHub (recommandée)

1. Pousser ce dossier sur un repo GitHub :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<votre-user>/lumina-demo.git
   git push -u origin main
   ```

2. Aller sur [vercel.com/new](https://vercel.com/new) et se connecter avec GitHub.

3. Cliquer **Import** sur le repo `lumina-demo`. Vercel détecte Next.js automatiquement.

4. Cliquer **Deploy**. Au bout de ~90 secondes, le site est en ligne sur une URL
   du type `lumina-demo-xxx.vercel.app`.

5. *(Optionnel)* Configurer un domaine custom dans Project Settings → Domains.

### Méthode B — Via la CLI Vercel

```bash
npm i -g vercel
vercel
```

Suivre les prompts. Première utilisation : créer un compte, lier le projet.

---

## 📂 Structure du projet

```
lumina-demo/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Layout racine + chargement des fonts
│   ├── page.tsx                  # Landing — composition des sections home
│   ├── globals.css               # Variables CSS, thème, utilitaires
│   ├── architecture/page.tsx     # Diagramme interactif des ressources
│   ├── demo/page.tsx             # 🚧 À venir — démo de flux animée
│   ├── cost/page.tsx             # 🚧 À venir — calculateur TCO
│   └── code/page.tsx             # 🚧 À venir — snippets C# / Terraform
│
├── components/
│   ├── nav/Nav.tsx               # Navigation top sticky
│   ├── footer/Footer.tsx         # Footer éditorial
│   ├── home/                     # Sections de la landing
│   │   ├── Hero.tsx              # Titre principal + CTA
│   │   ├── KeyStats.tsx          # 4 chiffres marquants
│   │   ├── Story.tsx             # « L'anatomie d'un message » — parcours en 6 étapes
│   │   ├── ArchPreview.tsx       # Aperçu animé du flow (3 swimlanes)
│   │   ├── Patterns.tsx          # 6 décisions d'architecture
│   │   ├── TechStack.tsx         # Inventaire technique
│   │   └── ClosingCTA.tsx        # Appel final vers la démo
│   ├── architecture/
│   │   ├── ArchDiagram.tsx       # SVG interactif (4 swimlanes, 14 nœuds)
│   │   └── ResourcePanel.tsx     # Panneau de détails à droite
│   └── shared/ComingSoon.tsx     # Template pour les pages à venir
│
├── lib/
│   ├── utils.ts                  # Helper cn() pour merge Tailwind
│   └── data/resources.ts         # ⭐ Source de vérité — les 12 ressources Azure
│                                 #    avec leurs vrais noms Terraform
│
├── tailwind.config.ts            # Theme custom : couleurs ink/lumina/ember/signal
├── package.json                  # Dépendances + scripts
└── README.md                     # Ce fichier
```

---

## 🎨 Système de design

| Token | Usage | Code couleur |
|-------|-------|-------------|
| `bg-ink-0` | Fond principal | `#0A0908` (noir chaud) |
| `text-ink-900` | Texte principal | `#FAF7F0` (paper white) |
| `text-lumina` | Accent — ingestion / orchestration | `#D9F84A` (chartreuse) |
| `text-signal` | Données / analytique | `#7BD8B5` (mint) |
| `text-ember` | Erreurs / DLQ | `#F47435` (orange chaud) |

**Typographies** (chargées automatiquement via `next/font/google`) :
- **Fraunces** — display, italique éditoriale
- **DM Sans** — corps de texte
- **JetBrains Mono** — labels techniques, noms de ressources

---

## 🛠️ Modifier le contenu

### Changer un nom de ressource Azure
→ Éditer `lib/data/resources.ts` — c'est la seule source de vérité.

### Modifier la home page
→ Chaque section est un fichier indépendant dans `components/home/`.

### Ajouter une nouvelle page
→ Créer `app/<nom>/page.tsx`. Pas de routing à configurer — c'est automatique.

### Changer les couleurs
→ Éditer la palette dans `tailwind.config.ts` (section `theme.extend.colors`).

---

## 📋 Scripts disponibles

```bash
npm run dev      # Serveur de dev avec hot reload
npm run build    # Build de production (statique + SSR)
npm run start    # Démarre le build de production localement
npm run lint     # Vérifie le code avec ESLint Next.js
```

---

## 🔧 Stack technique

- **Next.js 14** — Framework React avec App Router
- **TypeScript** — typage strict
- **Tailwind CSS** — CSS utility-first
- **Framer Motion** — animations
- **Lucide React** — icônes
- **next/font** — chargement optimisé des fonts Google

Aucune dépendance backend. Le site est entièrement statique côté contenu ;
les "démos interactives" sont des simulations React côté client.
