"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  max = 20,
  min = 1,
  label = "Quantité",
  small = false,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  label?: string;
  small?: boolean;
}) {
  const limit = Math.max(min, Math.min(20, max));
  return (
    <div
      className={cn(
        "inline-flex items-center border-2 border-ink bg-white",
        small ? "h-11" : "h-12",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "grid place-items-center font-mono text-ink transition-colors hover:bg-accent hover:text-white disabled:opacity-30",
          small ? "h-11 w-11" : "h-12 w-11",
        )}
        aria-label="Diminuer la quantité"
      >
        <Minus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <span
        className={cn(
          "min-w-7 text-center font-semibold tabular-nums",
          small ? "text-xs" : "text-sm",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(limit, value + 1))}
        disabled={value >= limit}
        className={cn(
          "grid place-items-center font-mono text-ink transition-colors hover:bg-accent hover:text-white disabled:opacity-30",
          small ? "h-11 w-11" : "h-12 w-11",
        )}
        aria-label="Augmenter la quantité"
      >
        <Plus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </div>
  );
}
