import Link from "next/link";
import { FabricCharacterDots } from "@/components/fabric/FabricCharacterDots";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import {
  FABRIC_CHARACTER_KEYS,
  type FabricCharacterKey,
} from "@/lib/fabric/character";
import { FABRIC_CHARACTER_JA } from "@/lib/i18n/ja-helpers";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricCompareOverviewProps = {
  fabrics: Fabric[];
  /** full = all traits on /fabric; compact = thickness only */
  variant?: "full" | "compact";
  className?: string;
};

const TRAIT_ABBREV: Record<FabricCharacterKey, string> = {
  thickness: "Thick",
  softness: "Soft",
  structure: "Struct",
  sheerness: "Sheer",
  surface: "Surf",
};

function traitTitle(key: FabricCharacterKey): string {
  const label = SITE_UI_COPY.fabric.character[key];
  const labelJa = FABRIC_CHARACTER_JA[key];
  return `${label} · ${labelJa}`;
}

const FULL_GRID =
  "grid grid-cols-[minmax(0,7.5rem)_repeat(5,minmax(2.5rem,1fr))] gap-x-2 sm:grid-cols-[minmax(0,9rem)_repeat(5,minmax(2.75rem,1fr))] sm:gap-x-3";

function FullCompareHeader() {
  return (
    <div className={cn(FULL_GRID, "mb-4 items-end sm:mb-5")}>
      <span aria-hidden className="block" />
      {FABRIC_CHARACTER_KEYS.map((key) => (
        <div key={key} className="text-center">
          <span className="block text-[11px] font-normal tracking-[0.06em] text-neutral-600 sm:text-[11px]">
            {TRAIT_ABBREV[key]}
          </span>
          <span
            lang="ja"
            className="mt-0.5 block text-[11px] font-normal tracking-[0.02em] text-neutral-600/75"
          >
            {FABRIC_CHARACTER_JA[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FabricCompareOverview({
  fabrics,
  variant = "full",
  className,
}: FabricCompareOverviewProps) {
  if (fabrics.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Fabric character comparison"
      className={cn(
        variant === "full" ? "mb-20 md:mb-28" : "mb-8 sm:mb-10",
        className,
      )}
    >
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={variant === "full" ? "min-w-[20rem] sm:min-w-0" : ""}>
          {variant === "full" ? <FullCompareHeader /> : null}

          <ul
            className={cn(
              variant === "compact"
                ? "mx-auto max-w-[16rem] space-y-5 sm:max-w-[18rem] md:max-w-[20rem]"
                : "space-y-3 sm:space-y-3.5",
            )}
          >
            {fabrics.map((fabric) => (
              <li key={fabric.slug}>
                <Link
                  href={`/fabric/${fabric.slug}`}
                  className={cn(
                    "group block transition-opacity duration-[var(--duration-fast)] hover:opacity-60",
                    variant === "full"
                      ? cn(FULL_GRID, "items-center")
                      : "flex flex-col items-center gap-2",
                  )}
                >
                  <span className="text-[12px] font-normal tracking-[0.06em] text-neutral-700 md:text-[12px]">
                    {fabric.name}
                  </span>

                  {variant === "compact" ? (
                    <FabricCharacterDots
                      level={fabric.character.thickness}
                      size="xs"
                      tone="quiet"
                      title={traitTitle("thickness")}
                    />
                  ) : (
                    FABRIC_CHARACTER_KEYS.map((key) => (
                      <div
                        key={key}
                        className="flex justify-center"
                        title={traitTitle(key)}
                      >
                        <FabricCharacterDots
                          level={fabric.character[key]}
                          size="xs"
                          tone="default"
                        />
                      </div>
                    ))
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
