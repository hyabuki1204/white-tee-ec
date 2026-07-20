import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import {
  FABRIC_CHARACTER_KEYS,
  type FabricCharacter,
} from "@/lib/fabric/character";
import { FABRIC_CHARACTER_JA } from "@/lib/i18n/ja-helpers";
import { cn } from "@/lib/utils";

type FabricCharacterDisplayProps = {
  character: FabricCharacter;
  /** detail = fabric page; compact = centered link block; pdp = left-aligned product sidebar */
  variant?: "detail" | "compact" | "pdp";
  className?: string;
};

const LEVELS = [1, 2, 3, 4, 5] as const;

function CharacterRow({
  label,
  labelJa,
  level,
  variant,
}: {
  label: string;
  labelJa: string;
  level: number;
  variant: "detail" | "compact" | "pdp";
}) {
  return (
    <div
      className={cn(
        "flex justify-center",
        variant === "pdp" ? "justify-start" : "justify-center",
      )}
      title={`${label} · ${labelJa}`}
    >
      <span className="sr-only">
        {label}（{labelJa}）, {level} of 5
      </span>
      <div
        className={cn(
          "flex items-center",
          variant === "detail" ? "gap-1.5 sm:gap-2" : "gap-1.5",
        )}
        role="img"
        aria-label={`${label}, ${level} of 5`}
      >
        {LEVELS.map((step) => (
          <span
            key={step}
            aria-hidden
            className={cn(
              "transition-colors",
              variant === "detail" ? "h-1.5 w-1.5" : "h-1 w-1",
              step <= level ? "bg-neutral-500" : "bg-neutral-200/90",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function FabricCharacterDisplay({
  character,
  variant = "detail",
  className,
}: FabricCharacterDisplayProps) {
  const labels = SITE_UI_COPY.fabric.character;

  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "detail"
          ? "mt-12 gap-3.5 sm:mt-16 sm:gap-4 md:mt-20 md:gap-4"
          : variant === "pdp"
            ? "gap-2.5"
            : "mt-8 gap-3 sm:mt-10 sm:gap-3.5",
        className,
      )}
    >
      {FABRIC_CHARACTER_KEYS.map((key) => (
        <CharacterRow
          key={key}
          label={labels[key]}
          labelJa={FABRIC_CHARACTER_JA[key]}
          level={character[key]}
          variant={variant}
        />
      ))}
    </div>
  );
}
