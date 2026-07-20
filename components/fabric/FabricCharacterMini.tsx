import {
  FABRIC_CHARACTER_KEYS,
  type FabricCharacter,
} from "@/lib/fabric/character";
import { cn } from "@/lib/utils";

type FabricCharacterMiniProps = {
  character: FabricCharacter;
  className?: string;
};

const LEVELS = [1, 2, 3, 4, 5] as const;

export function FabricCharacterMini({
  character,
  className,
}: FabricCharacterMiniProps) {
  const averageLevel = Math.round(
    FABRIC_CHARACTER_KEYS.reduce((sum, key) => sum + character[key], 0) /
      FABRIC_CHARACTER_KEYS.length,
  );

  return (
    <div
      className={cn("flex items-center gap-1 pt-1", className)}
      role="img"
      aria-label={`Fabric character, average ${averageLevel} of 5`}
    >
      {LEVELS.map((step) => (
        <span
          key={step}
          aria-hidden
          className={cn(
            "h-1 w-1",
            step <= averageLevel ? "bg-neutral-400" : "bg-neutral-200/90",
          )}
        />
      ))}
    </div>
  );
}
