"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Zap, AlertTriangle, ShieldAlert, Beaker, ListChecks } from "lucide-react";
import { PRESET_META } from "@/lib/demo/presets";
import type { OrderPayload, ScenarioId, Mode, DemoPhase } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const ICONS: Record<ScenarioId, typeof Zap> = {
  happy: Zap,
  "validation-error": AlertTriangle,
  dlq: ShieldAlert,
};

interface ConfigurationPanelProps {
  mode: Mode;
  scenarioId: ScenarioId | null;
  phase: DemoPhase;
  customPayload: OrderPayload;
  lastOrderId: string | null;
  runCount: number;
  onModeChange: (mode: Mode) => void;
  onSelectPreset: (id: ScenarioId) => void;
  onCustomPayloadChange: (payload: OrderPayload) => void;
  onRun: () => void;
  onReset: () => void;
}

const isRunning = (phase: DemoPhase) =>
  phase === "posting" || phase === "polling";

const isComplete = (phase: DemoPhase) =>
  phase === "completed-gold" || phase === "completed-dlq" ||
  phase === "validation-failed" || phase === "timeout" || phase === "error";

export default function ConfigurationPanel(props: ConfigurationPanelProps) {
  const { mode, scenarioId, phase, customPayload, lastOrderId, runCount, onModeChange, onSelectPreset, onRun, onReset, onCustomPayloadChange } = props;

  const running = isRunning(phase);
  const complete = isComplete(phase);
  const canRun = mode === "preset" ? scenarioId !== null : isCustomValid(customPayload);

  return (
    <div className="border border-hairline-strong bg-ink-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-hairline px-4 py-3 bg-ink-100 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-500">configuration · contrôle</span>
        <PhaseStatusBadge phase={phase} />
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 border-b border-hairline">
        <ModeButton
          icon={ListChecks}
          label="Preset"
          isActive={mode === "preset"}
          isDisabled={running}
          onClick={() => onModeChange("preset")}
        />
        <ModeButton
          icon={Beaker}
          label="Custom"
          isActive={mode === "custom"}
          isDisabled={running}
          onClick={() => onModeChange("custom")}
        />
      </div>

      {/* Body — scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {mode === "preset" ? (
            <motion.div
              key="preset"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <p className="eyebrow eyebrow-dot mb-4">Choisissez un scénario</p>
              <div className="space-y-3">
                {(["happy", "validation-error", "dlq"] as const).map((id, i) => (
                  <PresetCard
                    key={id}
                    scenarioId={id}
                    index={i}
                    isSelected={scenarioId === id}
                    isDisabled={running}
                    onSelect={onSelectPreset}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <CustomPayloadForm
                payload={customPayload}
                isDisabled={running}
                onChange={onCustomPayloadChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="border-t border-hairline p-4 space-y-2 bg-ink-0">
        {/* Last sent OrderId (visual proof of uniqueness) */}
        {lastOrderId && (
          <motion.div
            key={lastOrderId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l-2 border-lumina/40 pl-2.5 py-1 mb-3"
          >
            <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500 leading-tight">
              {runCount > 0 ? `Run #${runCount} · OrderId envoyé` : "Dernier OrderId"}
            </p>
            <p className="font-mono text-[0.7rem] text-lumina break-all leading-tight mt-0.5">
              {lastOrderId}
            </p>
            <p className="font-mono text-[0.6rem] text-ink-500 leading-tight mt-1">
              ↻ un nouvel ID sera généré au prochain envoi
            </p>
          </motion.div>
        )}

        <button
          onClick={onRun}
          disabled={!canRun || running}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 transition-all",
            !canRun || running
              ? "bg-ink-100 text-ink-500 cursor-not-allowed"
              : "bg-lumina text-ink-0 hover:bg-lumina-glow"
          )}
        >
          <Play className="w-3.5 h-3.5" fill="currentColor" />
          <span className="font-medium text-sm">
            {running ? "Exécution en cours…" : "Envoyer la commande"}
          </span>
        </button>

        <button
          onClick={onReset}
          disabled={phase === "idle" || running}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2.5 border transition-colors",
            phase === "idle" || running
              ? "border-hairline text-ink-500 cursor-not-allowed"
              : "border-hairline-strong text-ink-700 hover:text-ink-900 hover:border-lumina/40"
          )}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="font-medium text-xs">Réinitialiser</span>
        </button>

        {complete && (
          <p className="font-mono text-[0.65rem] text-ink-500 text-center pt-1">
            Vous pouvez relancer · ou modifier la commande
          </p>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  icon: Icon,
  label,
  isActive,
  isDisabled,
  onClick,
}: {
  icon: typeof Zap;
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-3 text-xs font-mono uppercase tracking-widest transition-colors",
        isActive
          ? "bg-ink-50 text-lumina border-b-2 border-lumina -mb-px"
          : "bg-ink-100 text-ink-500 hover:text-ink-700 hover:bg-ink-50",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}

function PhaseStatusBadge({ phase }: { phase: DemoPhase }) {
  const { dot, label } = phaseToBadge(phase);
  return (
    <span className="font-mono text-[0.65rem] tracking-widest uppercase flex items-center gap-2 text-ink-500">
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

function phaseToBadge(phase: DemoPhase): { dot: string; label: string } {
  switch (phase) {
    case "idle":            return { dot: "bg-ink-400",                 label: "idle" };
    case "posting":         return { dot: "bg-lumina animate-pulse",    label: "posting" };
    case "polling":         return { dot: "bg-lumina animate-pulse",    label: "polling" };
    case "validation-failed": return { dot: "bg-ember",                 label: "rejected" };
    case "completed-gold":  return { dot: "bg-signal",                  label: "completed" };
    case "completed-dlq":   return { dot: "bg-ember",                   label: "dead-lettered" };
    case "timeout":         return { dot: "bg-ember",                   label: "timeout" };
    case "error":           return { dot: "bg-ember",                   label: "error" };
  }
}

function PresetCard({
  scenarioId,
  index,
  isSelected,
  isDisabled,
  onSelect,
}: {
  scenarioId: ScenarioId;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (id: ScenarioId) => void;
}) {
  const meta = PRESET_META[scenarioId];
  const Icon = ICONS[scenarioId];

  const badgeColor = {
    lumina: "border-lumina/40 text-lumina bg-lumina/5",
    ember: "border-ember/40 text-ember bg-ember/5",
    signal: "border-signal/40 text-signal bg-signal/5",
  }[meta.tone];

  const selectedBorder = {
    lumina: "border-lumina",
    ember: "border-ember",
    signal: "border-signal",
  }[meta.tone];

  return (
    <motion.button
      onClick={() => !isDisabled && onSelect(scenarioId)}
      disabled={isDisabled}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(
        "w-full text-left p-3 border transition-all relative group",
        isSelected
          ? `${selectedBorder} bg-ink-100`
          : "border-hairline hover:border-hairline-strong",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("shrink-0 w-8 h-8 border flex items-center justify-center", badgeColor)}>
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-ink-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={cn("font-mono text-[0.65rem] tracking-widest uppercase", badgeColor.split(" ")[1])}>
              {meta.shortLabel}
            </span>
          </div>
          <p className="text-sm font-medium text-ink-900 mb-1.5">{meta.title}</p>
          <p className="text-xs text-ink-600 leading-relaxed line-clamp-2 mb-2">
            {meta.description}
          </p>
          <p className="font-mono text-[0.65rem] text-ink-500 line-clamp-1">
            → {meta.expectedOutcome}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function CustomPayloadForm({
  payload,
  isDisabled,
  onChange,
}: {
  payload: OrderPayload;
  isDisabled: boolean;
  onChange: (payload: OrderPayload) => void;
}) {
  const item = payload.items[0] ?? { sku: "", qty: 1, unitPrice: 0 };

  const updateField = (path: string, value: any) => {
    const next = JSON.parse(JSON.stringify(payload)) as OrderPayload;
    if (path === "orderId") next.orderId = value;
    else if (path === "customerId") next.customerDetails.customerId = value;
    else if (path === "fullName") next.customerDetails.fullName = value;
    else if (path === "contactEmail") next.customerDetails.contactEmail = value;
    else if (path === "sku") next.items[0] = { ...item, sku: value };
    else if (path === "qty") next.items[0] = { ...item, qty: Number(value) || 0 };
    else if (path === "unitPrice") next.items[0] = { ...item, unitPrice: Number(value) || 0 };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="eyebrow eyebrow-dot mb-2">Personnaliser la commande</p>
      <p className="text-xs text-ink-600 leading-relaxed mb-4">
        Modifiez les champs pour tester vos propres scénarios. Astuce :
        <span className="text-ember"> CustomerId vide</span> ou
        <span className="text-ember"> prix négatif</span> → 400 ;
        <span className="text-ember"> CustomerId = DLQ-TEST</span> → bascule en DLQ.
      </p>

      <FormField
        label="OrderId"
        value={payload.orderId}
        onChange={(v) => updateField("orderId", v)}
        disabled={isDisabled}
        mono
      />

      <div className="rule my-3" />
      <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500">Customer</p>
      <FormField
        label="CustomerId"
        value={payload.customerDetails.customerId}
        onChange={(v) => updateField("customerId", v)}
        disabled={isDisabled}
        mono
      />
      <FormField
        label="Full name"
        value={payload.customerDetails.fullName}
        onChange={(v) => updateField("fullName", v)}
        disabled={isDisabled}
      />
      <FormField
        label="Contact email"
        value={payload.customerDetails.contactEmail}
        onChange={(v) => updateField("contactEmail", v)}
        disabled={isDisabled}
        mono
      />

      <div className="rule my-3" />
      <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500">Item</p>
      <FormField
        label="SKU"
        value={item.sku}
        onChange={(v) => updateField("sku", v)}
        disabled={isDisabled}
        mono
      />
      <div className="grid grid-cols-2 gap-2">
        <FormField
          label="Qty"
          value={String(item.qty)}
          onChange={(v) => updateField("qty", v)}
          disabled={isDisabled}
          mono
          type="number"
        />
        <FormField
          label="Unit price"
          value={String(item.unitPrice)}
          onChange={(v) => updateField("unitPrice", v)}
          disabled={isDisabled}
          mono
          type="number"
        />
      </div>

      <div className="rule my-3" />
      <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-500 mb-2">Total calculé</p>
      <p className="font-mono text-sm text-lumina">
        {(item.qty * item.unitPrice).toFixed(2)} €
      </p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  disabled,
  mono,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  mono?: boolean;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[0.6rem] tracking-widest uppercase text-ink-500 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full bg-ink-0 border border-hairline-strong px-2.5 py-1.5 text-sm text-ink-900",
          "focus:border-lumina focus:outline-none transition-colors",
          mono && "font-mono",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </label>
  );
}

function isCustomValid(payload: OrderPayload): boolean {
  // Allow any input (we want users to be able to send invalid stuff to see errors)
  return payload.orderId.trim().length > 0 && payload.items.length > 0;
}
