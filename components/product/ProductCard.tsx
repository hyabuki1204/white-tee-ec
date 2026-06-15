import { FabricCharacterTraitLine } from "@/components/fabric/FabricCharacterTraitLine";
import Image from "next/image";
import Link from "next/link";
import { getProductWearImageUrl } from "@/lib/products/wear-image";
import { formatPrice } from "@/lib/utils/format-price";
import type { FabricCharacter } from "@/lib/fabric/character";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  fabricName?: string | null;
  fitLabel?: string | null;
  fabricCharacter?: FabricCharacter | null;
  /** Swap to model-wear image on pointer hover (desktop). */
  wearHover?: boolean;
};

const IMAGE_TRANSITION =
  "transition-opacity duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

export function ProductCard({
  product,
  fabricName,
  fitLabel,
  fabricCharacter,
  wearHover = false,
}: ProductCardProps) {
  const wearImageUrl = wearHover ? getProductWearImageUrl(product) : null;

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-background">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
            className={`object-cover ${IMAGE_TRANSITION} ${
              wearImageUrl
                ? "[@media(hover:hover)]:group-hover:opacity-0"
                : "transition-transform duration-[850ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] [@media(hover:hover)]:group-hover:scale-[1.02]"
            }`}
          />
          {wearImageUrl ? (
            <Image
              src={wearImageUrl}
              alt=""
              aria-hidden
              fill
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
              className={`object-cover opacity-0 ${IMAGE_TRANSITION} [@media(hover:hover)]:group-hover:opacity-100`}
            />
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-2 md:mt-9">
          {fabricName ? (
            <p className="text-[10px] font-light tracking-[0.1em] text-neutral-400">
              {fabricName}
            </p>
          ) : null}
          <h2 className="text-[11px] font-light tracking-[0.06em] text-neutral-800 transition-opacity duration-[850ms] ease-out delay-75 group-hover:opacity-45">
            {product.name}
          </h2>
          {fitLabel ? (
            <p className="text-[10px] font-light tracking-[0.06em] text-neutral-400">
              {fitLabel}
            </p>
          ) : null}
          {fabricCharacter ? (
            <FabricCharacterTraitLine
              trait="thickness"
              level={fabricCharacter.thickness}
              align="start"
              className="pt-0.5"
            />
          ) : null}
          <p className="text-[11px] font-light tracking-wide text-neutral-400 transition-opacity duration-[850ms] ease-out delay-100 group-hover:opacity-60">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
