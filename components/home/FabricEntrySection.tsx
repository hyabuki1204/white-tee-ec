import Link from "next/link";
import { FabricCard } from "@/components/fabric/FabricCard";
import { Container } from "@/components/layout/Container";
import type { Fabric } from "@/lib/fabric/content";

type FabricEntrySectionProps = {
  fabrics: Fabric[];
};

export function FabricEntrySection({ fabrics }: FabricEntrySectionProps) {
  if (fabrics.length === 0) {
    return null;
  }

  return (
    <section aria-label="Fabric">
      <Container as="div" className="py-20 md:py-28 lg:py-32">
        <header className="mb-20 md:mb-24 lg:mb-28">
          <p className="text-center text-[10px] font-light tracking-[0.14em] text-neutral-400">
            Fabric
          </p>
          <p className="mx-auto mt-10 max-w-sm text-center text-xs font-light leading-[2.1] tracking-[0.03em] text-neutral-500 md:mt-12">
            Every white tee begins with the cloth.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-x-6 gap-y-24 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-28 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-32">
          {fabrics.map((fabric) => (
            <li key={fabric.slug}>
              <FabricCard fabric={fabric} />
            </li>
          ))}
        </ul>

        <div className="mt-20 md:mt-24">
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-500 transition-opacity duration-500 hover:opacity-50"
          >
            View all fabrics
          </Link>
        </div>
      </Container>
    </section>
  );
}
