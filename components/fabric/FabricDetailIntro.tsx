import { FabricCharacterDisplay } from "@/components/fabric/FabricCharacterDisplay";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { getFabricPresentation } from "@/lib/fabric/presentation";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricDetailIntroProps = {
  fabric: Fabric;
};

export function FabricDetailIntro({ fabric }: FabricDetailIntroProps) {
  const presentation = getFabricPresentation(fabric.slug);

  return (
    <header className="flex w-full flex-col items-center text-center">
      <div className="max-w-sm space-y-6">
        {fabric.descriptionLines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className={cn(
              "text-[13px] font-light leading-[1.95] text-neutral-600 md:text-xs md:leading-[2.15] md:text-neutral-500",
              presentation.taglineTracking,
            )}
          >
            {line}
          </p>
        ))}
      </div>
      {fabric.helperJa ? (
        <JaHelperText spacing="default" className="mx-auto max-w-sm">
          {fabric.helperJa}
        </JaHelperText>
      ) : null}
      <FabricCharacterDisplay character={fabric.character} variant="detail" />
    </header>
  );
}
