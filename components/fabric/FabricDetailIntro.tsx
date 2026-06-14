import { getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricDetailIntroProps = {
  fabric: Fabric;
};

export function FabricDetailIntro({ fabric }: FabricDetailIntroProps) {
  const presentation = getFabricPresentation(fabric.slug);
  const leadLine = fabric.descriptionLines[0];

  return (
    <header className="flex w-full flex-col items-center text-center">
      <p
        className={cn(
          "max-w-sm text-[13px] font-light leading-[1.95] text-neutral-600 md:text-xs md:leading-[2.15] md:text-neutral-500",
          presentation.taglineTracking,
        )}
      >
        {leadLine}
      </p>
    </header>
  );
}
