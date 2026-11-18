"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveOrderNote,
  updateOrderStatus,
} from "@/lib/admin-actions";
import { orderStatuses, orderStatusMeta } from "@/lib/utils";
import { FormAlert } from "@/components/admin/form-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import type { ActionState, OrderStatus } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function OrderStatusForm({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateOrderStatus, initialState);
  const [value, setValue] = useState<OrderStatus>(status);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="order-status" className="label">
          Statut de la commande
        </label>
        <select
          id="order-status"
          name="status"
          className="select"
          value={value}
          onChange={(event) => setValue(event.target.value as OrderStatus)}
        >
          {orderStatuses.map((entry) => (
            <option key={entry} value={entry}>
              {orderStatusMeta[entry].label}
            </option>
          ))}
        </select>
      </div>
      <p className="field-hint">
        Annuler une commande remet automatiquement ses articles en stock.
      </p>
      <FormAlert
        error={state.error}
        message={state.ok ? state.message : undefined}
      />
      <SubmitButton
        className="w-full"
        pendingLabel="Mise à jour…"
      >
        Mettre à jour le statut
      </SubmitButton>
    </form>
  );
}

export function OrderNoteForm({
  id,
  note,
}: {
  id: string;
  note: string;
}) {
  const [state, formAction] = useActionState(saveOrderNote, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="order-note" className="label">
          Note interne
        </label>
        <textarea
          id="order-note"
          name="adminNote"
          className="textarea min-h-24 text-sm"
          defaultValue={note}
          maxLength={2000}
          placeholder="Appeler avant livraison, code portail, préférence de créneau…"
        />
      </div>
      <FormAlert
        error={state.error}
        message={state.ok ? state.message : undefined}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">
          Visible uniquement par l&apos;équipe
        </p>
        <SubmitButton
          className="w-full sm:w-auto"
          pendingLabel="Enregistrement…"
        >
          Enregistrer la note
        </SubmitButton>
      </div>
    </form>
  );
}
