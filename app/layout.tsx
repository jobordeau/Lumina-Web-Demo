import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav/Nav";
import Footer from "@/components/footer/Footer";
import { BackendHealthProvider } from "@/components/shared/BackendHealthProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Lumina — Architecture d'intégration cloud-native sur Azure",
  description:
    "Preuve de Concept d'une architecture d'intégration événementielle, serverless et passwordless sur Microsoft Azure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-ink-0 text-ink-900">
        <div className="grain-overlay" aria-hidden="true" />
        <BackendHealthProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </BackendHealthProvider>
      </body>
    </html>
  );
}
