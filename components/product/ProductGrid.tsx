import type { FabricCharacter } from "@/lib/fabric/character";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

type ProductGridProps = {
  products: Product[];
  fabricNameBySlug?: Record<string, string>;
  fabricCharacterBySlug?: Record<string, FabricCharacter>;
};

export function ProductGrid({
  products,
  fabricNameBySlug,
  fabricCharacterBySlug,
}: ProductGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-24 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-28 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-32">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            fabricName={
              product.fabricSlug && fabricNameBySlug
                ? fabricNameBySlug[product.fabricSlug]
                : null
            }
            fitLabel={product.fitProfile.fitLabel}
            fabricCharacter={
              product.fabricSlug && fabricCharacterBySlug
                ? fabricCharacterBySlug[product.fabricSlug]
                : null
            }
          />
        </li>
      ))}
    </ul>
  );
}
