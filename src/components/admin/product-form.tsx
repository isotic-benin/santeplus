"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Plus, TriangleAlert, X } from "lucide-react";
import { saveProduct } from "@/lib/admin-actions";
import { FormAlert, FieldError } from "@/components/admin/form-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { useImageUploads } from "@/components/admin/use-image-uploads";
import {
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  formatMegabytes,
} from "@/lib/image-rules";
import type { ActionState, Category, Product } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function ProductForm({
  product,
  categories = [],
}: {
  product?: Product;
  categories?: Category[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveProduct, initialState);

  // Visuels déjà enregistrés, que l'admin peut retirer un par un.
  const [keptImages, setKeptImages] = useState<string[]>(
    product?.images ?? [],
  );
  // Nouveaux fichiers : envoyés immédiatement vers Vercel Blob. Seules les URL
  // terminées partent avec le formulaire (les fichiers ne traversent pas la
  // fonction Vercel, limitée à 4,5 Mo par requête).
  const uploads = useImageUploads("produits");

  useEffect(() => {
    if (state.ok) {
      router.push("/admin/produits");
      router.refresh();
    }
  }, [state, router]);

  const errors = state.fieldErrors ?? {};

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    uploads.add(Array.from(event.target.files ?? []));
    // Permet de resélectionner le même fichier après l'avoir retiré.
    event.target.value = "";
  };

  const removeKeptImage = (url: string) => {
    setKeptImages((current) => current.filter((entry) => entry !== url));
  };

  return (
    <form
      action={formAction}
      className="mt-8 max-w-4xl"
      onSubmit={(event) => {
        // Sécurité : la touche Entrée ne doit pas envoyer le formulaire avant
        // que les images en cours d'envoi aient une URL.
        if (uploads.uploading) event.preventDefault();
      }}
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      {keptImages.map((url) => (
        <input key={url} type="hidden" name="existingImages" value={url} />
      ))}
      {uploads.urls.map((url) => (
        <input key={url} type="hidden" name="imageUrls" value={url} />
      ))}

      <div className="space-y-6">
        <FormAlert error={state.error} fieldErrors={state.fieldErrors} />

        <section className="admin-card space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-2xl">Le produit</h2>

          <div>
            <label htmlFor="product-name" className="label">
              Nom du produit *
            </label>
            <input
              id="product-name"
              name="name"
              required
              className="input"
              defaultValue={product?.name ?? ""}
              aria-invalid={Boolean(errors.name)}
              placeholder="Vase en terre cuite"
            />
            <FieldError messages={errors.name} />
          </div>

          <div>
            <label htmlFor="product-slug" className="label">
              Slug (URL)
            </label>
            <input
              id="product-slug"
              name="slug"
              className="input"
              defaultValue={product?.slug ?? ""}
              aria-invalid={Boolean(errors.slug)}
              placeholder="vase-terre-cuite"
            />
            <p className="field-hint">
              Laissez vide pour le générer automatiquement à partir du nom.
            </p>
            <FieldError messages={errors.slug} />
          </div>

          <div>
            <label htmlFor="product-description" className="label">
              Description *
            </label>
            <textarea
              id="product-description"
              name="description"
              required
              className="textarea min-h-32"
              defaultValue={product?.description ?? ""}
              aria-invalid={Boolean(errors.description)}
              placeholder="Matière, dimensions, usage, entretien…"
            />
            <p className="field-hint">20 caractères minimum.</p>
            <FieldError messages={errors.description} />
          </div>

          <div>
            <label htmlFor="product-category" className="label">
              Catégorie *
            </label>
            <select
              id="product-category"
              name="categorySlug"
              required
              className="select"
              defaultValue={product?.categorySlug ?? ""}
              aria-invalid={Boolean(errors.categorySlug)}
            >
              <option value="" disabled>
                Choisir un rayon…
              </option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <FieldError messages={errors.categorySlug} />
          </div>
        </section>

        <section className="admin-card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">Visuels</h2>
            <p className="mt-1 text-sm text-ink-2">
              JPEG, PNG, WebP, AVIF ou GIF — {formatMegabytes(MAX_IMAGE_BYTES)}{" "}
              maximum par image. L&apos;envoi démarre dès la sélection et part
              directement sur Vercel Blob.
            </p>
          </div>

          <div>
            <label
              htmlFor="product-images"
              className="inline-flex cursor-pointer items-center gap-2 border border-line-strong px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
            >
              <ImagePlus className="h-4 w-4" /> Choisir des images
            </label>
            <input
              id="product-images"
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="sr-only"
              onChange={handleFilesChange}
              aria-invalid={Boolean(errors.images)}
            />
            <FieldError messages={errors.images} />
          </div>

          {(keptImages.length > 0 || uploads.items.length > 0) && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {keptImages.map((url, index) => (
                <li
                  key={url}
                  className="relative aspect-[4/5] overflow-hidden border border-line bg-surface-2"
                >
                  <Image
                    src={url}
                    alt={`Visuel ${index + 1}`}
                    width={240}
                    height={300}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeptImage(url)}
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center bg-base/90 text-ink transition-colors hover:bg-accent hover:text-base"
                    aria-label={`Retirer le visuel ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}

              {uploads.items.map((item) => (
                <li
                  key={item.id}
                  className="relative aspect-[4/5] overflow-hidden border border-accent/40 bg-surface-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-1.5 top-1.5 bg-accent px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-base">
                    Nouveau
                  </span>
                  {!item.url && !item.error && (
                    <div className="absolute inset-x-0 bottom-0 space-y-1 bg-base/85 p-2">
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-ink">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {Math.round(item.progress)} %
                      </p>
                      <div className="h-1 w-full bg-line">
                        <div
                          className="h-full bg-accent transition-[width]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {item.error && (
                    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-base/90 p-2 text-center">
                      <p className="flex flex-col items-center gap-1 text-[11px] font-medium text-accent">
                        <TriangleAlert className="h-4 w-4" />
                        {item.error}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => uploads.remove(item.id)}
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center bg-base/90 text-ink transition-colors hover:bg-accent hover:text-base"
                    aria-label={`Retirer ${item.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {keptImages.length === 0 && uploads.items.length === 0 && (
            <p className="border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-3">
              Aucun visuel. Ajoutez au moins une image.
            </p>
          )}

          {uploads.uploading && (
            <p className="text-sm text-ink-3" role="status">
              Envoi des images en cours… patientez avant d&apos;enregistrer.
            </p>
          )}
        </section>

        <section className="admin-card space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-2xl">Prix & stock</h2>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="product-price" className="label">
                Prix de vente *
              </label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="1"
                required
                className="input tabular-nums"
                defaultValue={product?.basePrice ?? ""}
                aria-invalid={Boolean(errors.price)}
                placeholder="25000"
              />
              <FieldError messages={errors.price} />
            </div>

            <div>
              <label htmlFor="product-compare-at" className="label">
                Prix barré
              </label>
              <input
                id="product-compare-at"
                name="compareAtPrice"
                type="number"
                min="0"
                step="1"
                className="input tabular-nums"
                defaultValue={product?.compareAtPrice ?? ""}
                aria-invalid={Boolean(errors.compareAtPrice)}
                placeholder="32000"
              />
              <p className="field-hint">Doit rester supérieur au prix de vente.</p>
              <FieldError messages={errors.compareAtPrice} />
            </div>

            <div>
              <label htmlFor="product-stock" className="label">
                Stock *
              </label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                className="input tabular-nums"
                defaultValue={product?.stock ?? 10}
                aria-invalid={Boolean(errors.stock)}
                placeholder="10"
              />
              <FieldError messages={errors.stock} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 border border-line p-3 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product ? product.active : true}
                className="mt-1 h-4 w-4 accent-[#b4552d]"
              />
              <span>
                <span className="block font-semibold">Produit en ligne</span>
                <span className="text-xs text-ink-3">
                  Visible dans la boutique et commandable.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 border border-line p-3 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="mt-1 h-4 w-4 accent-[#b4552d]"
              />
              <span>
                <span className="block font-semibold">Mettre en avant</span>
                <span className="text-xs text-ink-3">
                  Apparaît dans la sélection de l&apos;accueil.
                </span>
              </span>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <SubmitButton
            disabled={uploads.uploading}
            disabledLabel="Envoi des images…"
          >
            <Plus className="h-4 w-4" />
            {product ? "Enregistrer" : "Créer le produit"}
          </SubmitButton>
          <Link href="/admin/produits" className="btn btn-outline">
            <ArrowLeft className="h-4 w-4" /> Annuler
          </Link>
        </div>
      </div>
    </form>
  );
}
