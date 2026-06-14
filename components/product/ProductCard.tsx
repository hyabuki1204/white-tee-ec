import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-background">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.02]"
          />
        </div>

        <div className="mt-8 flex flex-col gap-2 md:mt-9">
          <h2 className="text-[11px] font-light tracking-[0.06em] text-neutral-800 transition-opacity duration-[850ms] ease-out delay-75 group-hover:opacity-45">
            {product.name}
          </h2>
          <p className="text-[11px] font-light tracking-wide text-neutral-400 transition-opacity duration-[850ms] ease-out delay-100 group-hover:opacity-60">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
