import Link from "next/link";
import { HomeFabricCard } from "@/components/fabric/HomeFabricCard";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import type { Fabric } from "@/lib/fabric/content";

type HomeFabricSectionProps = {
  fabrics: Fabric[];
};

export function HomeFabricSection({ fabrics }: HomeFabricSectionProps) {
  if (fabrics.length === 0) {
    return null;
  }

  return (
    <section aria-label="Fabric catalog" className="border-t border-neutral-200/70 pb-16 md:pb-24">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <header className="flex items-end justify-between border-b border-neutral-200/70 py-8 md:py-10">
          <div>
            <h2 className="text-[13px] font-light tracking-[0.28em] text-neutral-800">
              {GRAPHPAPER_STORE_COPY.home.sectionFabric}
            </h2>
            <p className="mt-3 text-[11px] font-light tracking-[0.08em] text-neutral-400">
              {GRAPHPAPER_STORE_COPY.plp.items(fabrics.length)}
            </p>
          </div>
          <Link
            href="/fabric"
            className="hidden text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity hover:opacity-60 sm:inline-block"
          >
            {GRAPHPAPER_STORE_COPY.home.viewAllFabric}
          </Link>
        </header>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 pt-8 sm:gap-x-5 sm:gap-y-12 md:pt-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14">
          {fabrics.map((fabric) => (
            <li key={fabric.slug}>
              <HomeFabricCard fabric={fabric} />
            </li>
          ))}
        </ul>

        <div className="mt-10 sm:hidden">
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.home.viewAllFabric}
          </Link>
        </div>
      </div>
    </section>
  );
}
