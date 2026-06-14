import Link from "next/link";
import { FabricCard } from "@/components/fabric/FabricCard";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Fabric } from "@/lib/fabric/content";

type FabricEntrySectionProps = {
  fabrics: Fabric[];
  introLines: [string, string];
};

export function FabricEntrySection({
  fabrics,
  introLines,
}: FabricEntrySectionProps) {
  if (fabrics.length === 0) {
    return null;
  }

  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section aria-label="Fabric">
      <Container
        as="div"
        className="pt-16 pb-16 sm:pt-20 sm:pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32"
      >
        <header className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <p className="text-center text-[12px] font-light tracking-[0.14em] text-neutral-500 md:text-[11px] md:tracking-[0.16em]">
            {copy.title}
          </p>
          <p className="mx-auto mt-6 max-w-sm text-center text-[13px] font-light leading-[1.95] tracking-[0.02em] text-neutral-600 sm:mt-8 md:mt-10 md:text-xs md:leading-[2.1] md:tracking-[0.03em] md:text-neutral-500">
            {introLines[0]}
            <br />
            {introLines[1]}
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-x-7 gap-y-20 sm:grid-cols-2 sm:gap-x-9 sm:gap-y-24 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-32">
          {fabrics.map((fabric) => (
            <li key={fabric.slug}>
              <FabricCard fabric={fabric} variant="entry" />
            </li>
          ))}
        </ul>

        <div className="mt-14 sm:mt-20 md:mt-24">
          <Link
            href="/fabric"
            className="inline-block py-2 text-[12px] font-light tracking-[0.08em] text-neutral-600 transition-opacity duration-500 hover:opacity-50 md:text-[11px] md:text-neutral-500"
          >
            {copy.allFabrics}
          </Link>
        </div>
      </Container>
    </section>
  );
}
