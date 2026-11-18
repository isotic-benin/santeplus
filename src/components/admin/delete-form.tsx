"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeleteForm({
  action,
  id,
  label = "Supprimer",
  confirmText = "Confirmer la suppression ? Cette action est définitive.",
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={cn(
          "inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-ink-3 transition-colors hover:text-[#9b2c2c]",
          className,
        )}
        aria-label={label}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}
