"use client";

import { motion } from "framer-motion";
import type { CustomerKpi } from "@/lib/analytics/api";
import { formatCurrency, formatInteger } from "@/lib/analytics/api";

interface TopCustomersProps {
  customers: CustomerKpi[];
}

export default function TopCustomers({ customers }: TopCustomersProps) {
  if (customers.length === 0) {
    return (
      <div className="border border-hairline-strong bg-ink-50 p-6">
        <p className="text-ink-500 text-sm">Aucune donnée client disponible.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...customers.map((c) => c.revenue), 1);

  return (
    <div className="border border-hairline-strong bg-ink-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-hairline px-4 py-3 bg-ink-100 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-500">
          top {customers.length} clients · par revenu
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-hairline">
        {customers.map((customer, i) => {
          const ratio = customer.revenue / maxRevenue;
          return (
            <motion.div
              key={customer.customerId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="px-4 py-3 hover:bg-ink-100 transition-colors relative"
            >
              {/* Background bar showing relative size */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                className="absolute inset-y-0 left-0 bg-lumina/5 pointer-events-none"
              />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                {/* Rank */}
                <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500 w-6">
                  #{String(i + 1).padStart(2, "0")}
                </span>

                {/* CustomerId */}
                <span className="font-mono text-xs text-ink-900 flex-1 truncate">
                  {customer.customerId}
                </span>

                {/* Order count */}
                <span className="font-mono text-[0.7rem] text-ink-500 hidden sm:inline">
                  {formatInteger(customer.orderCount)} cmd
                </span>

                {/* Revenue */}
                <span className="font-mono text-sm text-lumina font-medium tabular-nums">
                  {formatCurrency(customer.revenue)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
