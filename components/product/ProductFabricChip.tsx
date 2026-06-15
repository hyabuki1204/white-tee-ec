import Link from "next/link";
import type { Fabric } from "@/lib/fabric/content";

type ProductFabricChipProps = {
  fabric: Fabric;
};

export function ProductFabricChip({ fabric }: ProductFabricChipProps) {
  return (
    <Link
      href={`/fabric/${fabric.slug}`}
      className="inline-block text-[10px] font-light tracking-[0.12em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
    >
      {fabric.name}
    </Link>
  );
}
