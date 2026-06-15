import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type ProductFabricFilterProps = {
  fabrics: Fabric[];
  activeSlug?: string | null;
};

export function ProductFabricFilter({
  fabrics,
  activeSlug,
}: ProductFabricFilterProps) {
  const linkClass = (isActive: boolean) =>
    cn(
      "inline-flex min-h-9 items-center text-[11px] font-light tracking-[0.06em] transition-opacity duration-300 md:text-[10px]",
      isActive
        ? "text-neutral-800"
        : "text-neutral-400 hover:opacity-60",
    );

  return (
    <nav
      aria-label="Filter by fabric"
      className="mb-12 flex flex-wrap gap-x-5 gap-y-2 md:mb-16"
    >
      <Link href="/products" className={linkClass(!activeSlug)}>
        All
      </Link>
      {fabrics.map((fabric) => (
        <Link
          key={fabric.slug}
          href={`/products?fabric=${fabric.slug}`}
          className={linkClass(activeSlug === fabric.slug)}
        >
          {fabric.name}
        </Link>
      ))}
    </nav>
  );
}
