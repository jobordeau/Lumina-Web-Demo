// Three preset payloads — these match exactly the curl tests that proved
// the deployed pipeline works end-to-end.

import type { OrderPayload, ScenarioId } from "./types";
import { generateOrderId } from "./config";

export interface PresetMeta {
  id: ScenarioId;
  title: string;
  shortLabel: string;
  description: string;
  expectedOutcome: string;
  tone: "lumina" | "ember" | "signal";
  estimatedDurationMs: number;
}

export const PRESET_META: Record<ScenarioId, PresetMeta> = {
  happy: {
    id: "happy",
    title: "Commande valide",
    shortLabel: "Happy path",
    description:
      "Une commande légitime avec CustomerId valide, montant positif. Doit traverser tout le pipeline et apparaître dans gold-orders/.",
    expectedOutcome: "202 Accepted → gold-orders/{orderId}.json",
    tone: "lumina",
    estimatedDurationMs: 8000,
  },
  "validation-error": {
    id: "validation-error",
    title: "Erreur de validation",
    shortLabel: "FluentValidation rejette",
    description:
      "CustomerId vide, montant négatif. FluentValidation rejette côté Producer Fn — le message ne touche jamais le bus.",
    expectedOutcome: "400 Bad Request · message NON publié",
    tone: "ember",
    estimatedDurationMs: 1500,
  },
  dlq: {
    id: "dlq",
    title: "Échec de traitement",
    shortLabel: "DLQ après 3 retries",
    description:
      "CustomerId = 'DLQ-TEST'. Validé par FluentValidation, publié sur le bus, mais Consumer Fn lève une exception. Service Bus retente 3 fois puis bascule en DLQ.",
    expectedOutcome: "202 Accepted → DLQ → failed-orders/failed-order-{orderId}.json",
    tone: "ember",
    estimatedDurationMs: 60000,
  },
};

export function buildPresetPayload(scenarioId: ScenarioId, orderId?: string): OrderPayload {
  const id = orderId ?? generateOrderId();
  const now = new Date().toISOString();

  switch (scenarioId) {
    case "happy":
      return {
        orderId: id,
        timestamp: now,
        channel: "E-Commerce-App",
        customerDetails: {
          customerId: "84729",
          fullName: "Alice Martin",
          contactEmail: "alice.m@email.com",
        },
        items: [
          { sku: "LUM-CEIL-005", qty: 1, unitPrice: 320.0 },
        ],
      };

    case "validation-error":
      return {
        orderId: id,
        timestamp: now,
        channel: "E-Commerce-App",
        customerDetails: {
          customerId: "",
          fullName: "",
          contactEmail: "",
        },
        items: [
          { sku: "LUM-001", qty: 1, unitPrice: -50.0 },
        ],
      };

    case "dlq":
      return {
        orderId: id,
        timestamp: now,
        channel: "E-Commerce-App",
        customerDetails: {
          customerId: "DLQ-TEST",
          fullName: "Test User",
          contactEmail: "dlq-test@lumina.io",
        },
        items: [
          { sku: "LUM-001", qty: 1, unitPrice: 320.0 },
        ],
      };
  }
}

/** Default payload used when entering Custom mode */
export function buildEmptyCustomPayload(): OrderPayload {
  return {
    orderId: generateOrderId(),
    timestamp: new Date().toISOString(),
    channel: "E-Commerce-App",
    customerDetails: {
      customerId: "84729",
      fullName: "Alice Martin",
      contactEmail: "alice.m@email.com",
    },
    items: [
      { sku: "LUM-CEIL-005", qty: 1, unitPrice: 320.0 },
    ],
  };
}
