import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import {
  FABRIC_CHARACTER_KEYS,
  type FabricCharacter,
} from "@/lib/fabric/character";
import { cn } from "@/lib/utils";

type FabricCharacterDisplayProps = {
  character: FabricCharacter;
  /** More space on fabric detail; tighter on product PDP link. */
  variant?: "detail" | "compact";
  className?: string;
};

const LEVELS = [1, 2, 3, 4, 5] as const;

function CharacterRow({
  label,
  level,
  variant,
}: {
  label: string;
  level: number;
  variant: "detail" | "compact";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-5 sm:gap-6",
        variant === "detail" ? "gap-6 sm:gap-8" : "gap-4 sm:gap-5",
      )}
    >
      <span
        className={cn(
          "w-[5.5rem] shrink-0 text-right font-light tracking-[0.06em] text-neutral-500 sm:w-24",
          variant === "detail"
            ? "text-[11px] md:text-[10px] md:tracking-[0.08em] md:text-neutral-400"
            : "text-[10px] md:text-[9px] md:tracking-[0.08em] md:text-neutral-400",
        )}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-1.5 sm:gap-2"
        role="img"
        aria-label={`${label}, ${level} of 5`}
      >
        {LEVELS.map((step) => (
          <span
            key={step}
            aria-hidden
            className={cn(
              "rounded-full transition-colors",
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
  const { fabric: fabricCopy } = SITE_UI_COPY;

  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "detail"
          ? "mt-12 gap-3.5 sm:mt-16 sm:gap-4 md:mt-20 md:gap-4"
          : "mt-8 gap-3 sm:mt-10 sm:gap-3.5",
        className,
      )}
    >
      {variant === "detail" ? (
        <p className="text-center text-[11px] font-light tracking-[0.06em] text-neutral-400 md:text-[10px]">
          {fabricCopy.characterScale}
        </p>
      ) : null}
      {FABRIC_CHARACTER_KEYS.map((key) => (
        <CharacterRow
          key={key}
          label={labels[key]}
          level={character[key]}
          variant={variant}
        />
      ))}
    </div>
  );
}
