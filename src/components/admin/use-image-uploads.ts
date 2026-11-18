"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { discardUpload } from "@/lib/admin-actions";
import { uploadImageFile } from "@/lib/client-upload";
import type { ImageFolder } from "@/lib/image-rules";

/**
 * Envoi immédiat des images choisies dans un formulaire d'administration.
 *
 * Les fichiers partent **directement du navigateur vers Vercel Blob** dès la
 * sélection (`uploadImageFile`), puis le formulaire ne transmet que les URL
 * obtenues. Une fonction Vercel ne peut pas recevoir plus de 4,5 Mo : c'est ce
 * qui faisait échouer les photos un peu lourdes en production.
 *
 * Avantages : barre de progression réelle, possibilité d'envoyer plusieurs
 * photos en parallèle, et surtout des fichiers de plus de 4,5 Mo acceptés.
 */

export interface PendingImage {
  id: string;
  name: string;
  /** Aperçu local (blob URL), révoqué au retrait ou au démontage. */
  previewUrl: string;
  /** 0 → 100. */
  progress: number;
  /** URL à enregistrer en base, `null` tant que l'envoi n'est pas terminé. */
  url: string | null;
  /** Message d'erreur si l'envoi a échoué. */
  error: string | null;
}

/** Supprime une image du store sans jamais faire échouer l'appelant. */
function discardQuietly(url: string) {
  void discardUpload(url).catch(() => {
    // Nettoyage best-effort : l'image reste utilisable même si la suppression
    // échoue (session expirée, réseau…).
  });
}

export function useImageUploads(folder: ImageFolder) {
  const [items, setItems] = useState<PendingImage[]>([]);
  // Envois abandonnés : leur URL, connue seulement à la fin de l'upload, doit
  // être supprimée du store pour ne pas laisser de fichier orphelin.
  const cancelledRef = useRef<Set<string>>(new Set());

  // Référence à jour pour le nettoyage au démontage.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
        // Un envoi encore en cours au démontage est abandonné : son résultat
        // sera supprimé dès qu'il arrivera.
        if (!item.url && !item.error) cancelledRef.current.add(item.id);
      }
    },
    [],
  );

  const update = useCallback(
    (id: string, patch: Partial<PendingImage>) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  /** Démarre l'envoi de chaque fichier sélectionné. */
  const add = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        setItems((current) => [
          ...current,
          {
            id,
            name: file.name,
            previewUrl,
            progress: 0,
            url: null,
            error: null,
          },
        ]);

        void uploadImageFile(file, folder, (percentage) =>
          update(id, { progress: percentage }),
        )
          .then((url) => {
            if (cancelledRef.current.has(id)) {
              discardQuietly(url);
              return;
            }
            update(id, { url, progress: 100 });
          })
          .catch((error: unknown) => {
            if (cancelledRef.current.has(id)) return;
            update(id, {
              progress: 0,
              error:
                error instanceof Error
                  ? error.message
                  : "Envoi de l'image impossible.",
            });
          });
      }
    },
    [folder, update],
  );

  /**
   * Retire une image. Si elle a déjà été envoyée, elle est supprimée du store
   * pour ne pas laisser de fichier orphelin. Si l'envoi est en cours, il est
   * annulé côté résultat : l'URL sera supprimée dès réception.
   */
  const remove = useCallback((id: string) => {
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (!item) return;

    cancelledRef.current.add(id);
    setItems((current) => current.filter((entry) => entry.id !== id));
    URL.revokeObjectURL(item.previewUrl);

    if (item.url) discardQuietly(item.url);
  }, []);

  const uploading = items.some((item) => !item.url && !item.error);
  const urls = items.flatMap((item) => (item.url ? [item.url] : []));

  return { items, add, remove, uploading, urls };
}
