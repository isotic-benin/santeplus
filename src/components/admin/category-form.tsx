"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { ArrowLeft, ImagePlus, Loader2, Plus, TriangleAlert } from "lucide-react";
import { saveCategory } from "@/lib/admin-actions";
import { FormAlert, FieldError } from "@/components/admin/form-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { useImageUploads } from "@/components/admin/use-image-uploads";
import {
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  formatMegabytes,
} from "@/lib/image-rules";
import type { ActionState, Category } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveCategory, initialState);
  // Image envoyée immédiatement vers Vercel Blob : le formulaire ne transmet
  // que son URL (les fonctions Vercel sont limitées à 4,5 Mo par requête).
  const uploads = useImageUploads("categories");
  const item = uploads.items[0];
  const uploadedUrl = uploads.urls[0] ?? null;
  const currentImage = item?.previewUrl ?? category?.image ?? null;

  useEffect(() => {
    if (state.ok) {
      router.push("/admin/categories");
      router.refresh();
    }
  }, [state, router]);

  const errors = state.fieldErrors ?? {};

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    // Une seule image par catégorie : une nouvelle sélection remplace la
    // précédente (l'ancienne est retirée du store si elle y était déjà).
    if (files.length === 0) return;
    for (const pending of uploads.items) {
      uploads.remove(pending.id);
    }
    uploads.add(files.slice(0, 1));
  };

  return (
    <form
      action={formAction}
      className="mt-8 max-w-3xl space-y-6"
      onSubmit={(event) => {
        if (uploads.uploading) event.preventDefault();
      }}
    >
      {category && <input type="hidden" name="id" value={category.id} />}
      {uploadedUrl && (
        <input type="hidden" name="imageUrl" value={uploadedUrl} />
      )}

      <FormAlert error={state.error} fieldErrors={state.fieldErrors} />

      <div>
        <label htmlFor="category-name" className="label">
          Nom *
        </label>
        <input
          id="category-name"
          name="name"
          required
          className="input"
          defaultValue={category?.name ?? ""}
          aria-invalid={Boolean(errors.name)}
          placeholder="Maison"
        />
        <FieldError messages={errors.name} />
      </div>

      <div>
        <label htmlFor="category-slug" className="label">
          Slug (URL)
        </label>
        <input
          id="category-slug"
          name="slug"
          className="input"
          defaultValue={category?.slug ?? ""}
          aria-invalid={Boolean(errors.slug)}
          placeholder="maison"
        />
        <p className="field-hint">
          Laissez vide pour le générer automatiquement à partir du nom.
        </p>
        <FieldError messages={errors.slug} />
      </div>

      <div>
        <label htmlFor="category-description" className="label">
          Description *
        </label>
        <textarea
          id="category-description"
          name="description"
          required
          className="textarea min-h-24"
          defaultValue={category?.description ?? ""}
          aria-invalid={Boolean(errors.description)}
          placeholder="Ce que l'on trouve dans ce rayon."
        />
        <p className="field-hint">10 caractères minimum.</p>
        <FieldError messages={errors.description} />
      </div>

      <div>
        <p className="label">Image *</p>
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="category-image"
            className="inline-flex cursor-pointer items-center gap-2 border border-line-strong px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
          >
            <ImagePlus className="h-4 w-4" />
            {category?.image || uploadedUrl
              ? "Remplacer l'image"
              : "Choisir une image"}
          </label>
          <input
            id="category-image"
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={handleFileChange}
            aria-invalid={Boolean(errors.image)}
          />
          {item && (
            <button
              type="button"
              onClick={() => uploads.remove(item.id)}
              className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3 underline underline-offset-4 hover:text-accent"
            >
              Annuler la sélection
            </button>
          )}
        </div>
        <p className="field-hint">
          JPEG, PNG, WebP, AVIF ou GIF — {formatMegabytes(MAX_IMAGE_BYTES)}{" "}
          maximum. L&apos;envoi démarre dès la sélection et part directement sur
          Vercel Blob.
        </p>
        <FieldError messages={errors.image} />

        {item && !item.url && !item.error && (
          <div className="mt-4 max-w-xs space-y-1" role="status">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Envoi de {item.name} — {Math.round(item.progress)} %
            </p>
            <div className="h-1.5 w-full bg-line">
              <div
                className="h-full bg-accent transition-[width]"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        {item?.error && (
          <p
            className="mt-4 flex items-start gap-2 border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent"
            role="alert"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {item.error}
          </p>
        )}

        {currentImage ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-32 w-24 overflow-hidden border border-line bg-surface-2">
              <Image
                src={currentImage}
                alt={category?.name ?? "Aperçu de la catégorie"}
                width={192}
                height={256}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm text-ink-3">
              {item
                ? item.url
                  ? "Nouvelle image envoyée"
                  : "Envoi en cours…"
                : "Image actuelle"}
            </p>
          </div>
        ) : (
          <p className="mt-4 border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-3">
            Aucune image. Ajoutez-en une.
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 border border-line p-3 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={category?.featured ?? false}
          className="mt-1 h-4 w-4 accent-[#b4552d]"
        />
        <span>
          <span className="block font-semibold">Mettre en avant</span>
          <span className="text-xs text-ink-3">
            La catégorie apparaît en priorité sur l&apos;accueil.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <SubmitButton
          disabled={uploads.uploading}
          disabledLabel="Envoi de l'image…"
        >
          <Plus className="h-4 w-4" />
          {category ? "Enregistrer" : "Créer la catégorie"}
        </SubmitButton>
        <Link href="/admin/categories" className="btn btn-outline">
          <ArrowLeft className="h-4 w-4" /> Annuler
        </Link>
      </div>
    </form>
  );
}
