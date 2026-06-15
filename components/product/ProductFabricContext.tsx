import Link from "next/link";
import { FabricCharacterDisplay } from "@/components/fabric/FabricCharacterDisplay";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Fabric } from "@/lib/fabric/content";

type ProductFabricContextProps = {
  fabric: Fabric;
};

/** PDP fabric block — Graphpaper clarity, AURALEE quiet tone. */
export function ProductFabricContext({ fabric }: ProductFabricContextProps) {
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section
      aria-label={copy.thisFabric}
      className="space-y-4 border-0 pt-2"
    >
      <div className="space-y-2">
        <Link
          href={`/fabric/${fabric.slug}`}
          className="inline-block text-[11px] font-light tracking-[0.08em] text-neutral-700 transition-opacity duration-300 hover:opacity-50 md:text-[10px]"
        >
          {fabric.name}
        </Link>
        {fabric.tagline ? (
          <p className="text-[11px] font-light leading-[1.8] tracking-[0.03em] text-neutral-400 md:text-[10px]">
            {fabric.tagline}
          </p>
        ) : null}
      </div>

      <FabricCharacterDisplay
        character={fabric.character}
        variant="pdp"
        className="!mt-0"
      />
    </section>
  );
}
