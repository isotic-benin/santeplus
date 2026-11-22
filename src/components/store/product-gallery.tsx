"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  children,
}: {
  images: string[];
  name: string;
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? "/placeholder.svg";

  return (
    <div>
      <div className="relative">
        <div className="media aspect-[4/5] border-2 border-ink">
          <Image
            src={current}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
          />
        </div>
        {children}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label="Images du produit">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Image ${index + 1} de ${name}`}
              onClick={() => setActive(index)}
              className={cn(
                "media aspect-square border-2 transition-colors",
                active === index ? "border-accent" : "border-ink",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
