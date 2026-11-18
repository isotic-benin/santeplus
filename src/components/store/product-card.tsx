import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/store/add-to-cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <article className="group">
      <div className="relative">
        <Link
          href={`/catalogue/${product.slug}`}
          className="media block aspect-[4/5]"
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
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="badge bg-accent text-white">
              {discount > 0 ? `-${discount}%` : "Offre"}
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-ink text-base">Épuisé</span>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <span className="badge bg-base/95 text-ink">
              Derniers {product.stock}
            </span>
          )}
        </div>

        {product.stock > 0 && (
          <div className="absolute bottom-3 right-3 translate-y-1 opacity-100 transition-all duration-300 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <AddToCart product={product} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          {product.categoryName ?? product.categorySlug}
        </p>
        <h3 className="mt-1.5 font-display text-lg leading-snug sm:text-xl">
          <Link
            href={`/catalogue/${product.slug}`}
            className="line-clamp-2 transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-base font-semibold tabular-nums">
            {formatPrice(product.price)}
          </p>
          {product.compareAtPrice &&
            product.compareAtPrice > product.price && (
              <p className="text-[11px] text-ink-3 line-through tabular-nums">
                {formatPrice(product.compareAtPrice)}
              </p>
            )}
        </div>
      </div>
    </article>
  );
}
