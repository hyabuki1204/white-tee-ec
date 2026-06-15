import { FabricCharacterDots } from "@/components/fabric/FabricCharacterDots";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { FabricCharacter, FabricCharacterKey } from "@/lib/fabric/character";
import { FABRIC_CHARACTER_JA } from "@/lib/i18n/ja-helpers";
import { cn } from "@/lib/utils";

type FabricCharacterTraitLineProps = {
  trait: FabricCharacterKey;
  level: FabricCharacter["thickness"];
  className?: string;
  align?: "spread" | "start";
};

export function FabricCharacterTraitLine({
  trait,
  level,
  className,
  align = "spread",
}: FabricCharacterTraitLineProps) {
  const label = SITE_UI_COPY.fabric.character[trait];
  const labelJa = FABRIC_CHARACTER_JA[trait];

  return (
    <div
      className={cn(
        "flex items-center",
        align === "spread" ? "justify-end" : "justify-start",
        className,
      )}
      title={`${label} · ${labelJa}`}
    >
      <span className="sr-only">
        {label}（{labelJa}）
      </span>
      <FabricCharacterDots level={level} size="xs" tone="quiet" />
    </div>
  );
}
