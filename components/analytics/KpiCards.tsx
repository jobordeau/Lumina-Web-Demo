"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Wallet, ArrowUpRight, Clock } from "lucide-react";
import type { KpiBlock } from "@/lib/analytics/api";
import { formatCurrency, formatInteger } from "@/lib/analytics/api";

interface KpiCardsProps {
  kpis: KpiBlock;
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      icon: ShoppingBag,
      label: "Commandes traitées",
      value: formatInteger(kpis.totalOrders),
      sub: "depuis l'origine",
      tone: "lumina" as const,
    },
    {
      icon: Wallet,
      label: "Chiffre d'affaires",
      value: formatCurrency(kpis.totalRevenue),
      sub: "cumul",
      tone: "signal" as const,
    },
    {
      icon: ArrowUpRight,
      label: "Panier moyen",
      value: formatCurrency(kpis.averageBasket),
      sub: "par commande",
      tone: "lumina" as const,
    },
    {
      icon: Clock,
      label: "Heure de pointe",
      value: kpis.peakHour !== null ? `${kpis.peakHour}h` : "—",
      sub: kpis.peakHour !== null ? `${kpis.peakHour}h-${(kpis.peakHour + 1) % 24}h` : "données insuffisantes",
      tone: "signal" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="border border-hairline-strong bg-ink-50 p-5 group hover:border-hairline-strong/60 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500">
              {card.label}
            </span>
            <card.icon
              className={
                card.tone === "lumina"
                  ? "w-4 h-4 text-lumina/70"
                  : "w-4 h-4 text-signal/70"
              }
              strokeWidth={1.5}
            />
          </div>

          <p className="display-tight text-3xl md:text-4xl text-ink-900 mb-2 leading-tight">
            {card.value}
          </p>

          <p className="font-mono text-[0.7rem] text-ink-500">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
