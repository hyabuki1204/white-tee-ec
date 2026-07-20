import Link from "next/link";
import type { Fabric } from "@/lib/fabric/content";

type ProductFabricChipProps = {
  fabric: Fabric;
};

export function ProductFabricChip({ fabric }: ProductFabricChipProps) {
  return (
    <Link
      href={`/fabric/${fabric.slug}`}
      className="inline-block text-[11px] font-normal tracking-[0.12em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
    >
      {fabric.name}
    </Link>
  );
}
