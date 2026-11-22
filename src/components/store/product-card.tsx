import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <article className="group flex flex-col border-2 border-ink bg-white">
      <div className="relative">
        <Link
          href={`/catalogue/${product.slug}`}
          className="media block aspect-[4/5] border-b-2 border-ink"
          aria-label={`Voir ${product.name}`}
        >
          <Image
            src={product.images[0] ?? "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="badge bg-accent text-white">
              {discount > 0 ? `-${discount}%` : "Offre"}
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-ink text-white">Épuisé</span>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <span className="badge border-2 border-ink bg-white text-ink">
              Derniers {product.stock}
            </span>
          )}
        </div>

      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="meta">{product.categoryName ?? product.categorySlug}</p>
          <span
            className={`mt-0.5 h-2 w-2 shrink-0 ${product.stock > 0 ? "bg-accent" : "bg-ink-3"}`}
            aria-hidden="true"
          />
        </div>

        <h3 className="mt-2 text-xl font-extrabold uppercase leading-[1.05] tracking-[-0.04em] sm:text-2xl">
          <Link
            href={`/catalogue/${product.slug}`}
            className="line-clamp-2 transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="price-tag">{formatPrice(product.price)}</p>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <p className="mt-1.5 font-mono text-[11px] text-ink-3 line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
          </div>
          <Link
            href={`/catalogue/${product.slug}`}
            aria-label={`Voir ${product.name}`}
            className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink transition-colors hover:bg-accent hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </article>
  );
}
