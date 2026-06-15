import Image from "next/image";
import Link from "next/link";
import { FabricCharacterDisplay } from "@/components/fabric/FabricCharacterDisplay";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { FABRIC_IMAGE_ASPECT, getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type ProductFabricLinkProps = {
  fabric: Fabric;
};

export function ProductFabricLink({ fabric }: ProductFabricLinkProps) {
  const presentation = getFabricPresentation(fabric.slug);
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <section aria-label={copy.title}>
      <Container as="div" className="py-16 sm:py-24 md:py-32 lg:py-40">
        <Link
          href={`/fabric/${fabric.slug}`}
          className="group mx-auto block max-w-4xl"
        >
          <div
            className={cn(
              "relative overflow-hidden bg-background",
              FABRIC_IMAGE_ASPECT,
            )}
          >
            <Image
              src={fabric.imageUrl}
              alt={fabric.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className={cn(
                "object-cover brightness-[0.96] contrast-[0.98] transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.012]",
                presentation.heroImagePosition,
              )}
            />
          </div>

          <div className="mx-auto mt-10 flex max-w-md flex-col items-center text-center sm:mt-14 md:mt-16 lg:mt-20">
            <p className="text-[11px] font-light tracking-[0.14em] text-neutral-500 md:text-[10px] md:text-neutral-400">
              {copy.thisFabric}
            </p>
            <h2 className="mt-5 text-[15px] font-light tracking-[0.1em] text-neutral-800 transition-opacity duration-500 group-hover:opacity-50 sm:mt-7 md:mt-8 md:text-sm md:tracking-[0.12em]">
              {fabric.name}
            </h2>
            <p
              className={cn(
                "mt-5 text-xs font-light leading-[2.1] text-neutral-500",
                presentation.taglineTracking,
              )}
            >
              {fabric.tagline}
            </p>
            {fabric.helperJa ? (
              <JaHelperText spacing="default" className="mx-auto max-w-sm">
                {fabric.helperJa}
              </JaHelperText>
            ) : null}
            <FabricCharacterDisplay
              character={fabric.character}
              variant="compact"
            />
          </div>
        </Link>
      </Container>
    </section>
  );
}
