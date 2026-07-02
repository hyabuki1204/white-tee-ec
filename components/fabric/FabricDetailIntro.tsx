import type { Fabric } from "@/lib/fabric/content";
import { getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";

type FabricDetailIntroProps = {
  fabric: Fabric;
};

export function FabricDetailIntro({ fabric }: FabricDetailIntroProps) {
  const presentation = getFabricPresentation(fabric.slug);

  return (
    <header className="flex w-full flex-col items-center text-center">
      <div className="max-w-md space-y-5">
        {fabric.descriptionLines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className={cn(
              "text-[13px] font-light leading-[2] tracking-[0.02em] text-neutral-600 md:text-[13px] md:leading-[2.1] md:text-neutral-600",
              presentation.taglineTracking,
            )}
          >
            {line}
          </p>
        ))}
      </div>
    </header>
  );
}
