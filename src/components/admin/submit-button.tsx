"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  disabled = false,
  disabledLabel = "Envoi des images…",
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  /** Bloque l'envoi, par exemple pendant un upload d'image en cours. */
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const busy = pending || disabled;
  return (
    <button
      type="submit"
      disabled={busy}
      className={cn("btn btn-primary", className)}
      aria-busy={busy}
      aria-disabled={busy}
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />{" "}
          {pending ? pendingLabel : disabledLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
