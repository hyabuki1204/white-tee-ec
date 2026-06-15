import Link from "next/link";
import { FabricCard } from "@/components/fabric/FabricCard";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Fabric } from "@/lib/fabric/content";

type FabricEntrySectionProps = {
  fabrics: Fabric[];
};

export function FabricEntrySection({ fabrics }: FabricEntrySectionProps) {
  if (fabrics.length === 0) {
    return null;
  }

  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section aria-label="Fabric preview">
      <Container as="div" className="pb-16 sm:pb-20 md:pb-28 lg:pb-32">
        <ul className="grid grid-cols-1 gap-x-7 gap-y-20 sm:grid-cols-2 sm:gap-x-9 sm:gap-y-24 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-32">
          {fabrics.map((fabric) => (
            <li key={fabric.slug}>
              <FabricCard fabric={fabric} variant="entry" />
            </li>
          ))}
        </ul>

        <div className="mt-14 sm:mt-16 md:mt-20">
          <Link
            href="/fabric"
            className="inline-block py-2 text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity duration-500 hover:opacity-50 md:text-[10px]"
          >
            {copy.allFabrics}
          </Link>
        </div>
      </Container>
    </section>
  );
}
