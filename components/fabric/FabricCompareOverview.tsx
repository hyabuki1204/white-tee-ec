import { Link } from "@/components/i18n/Link";
import { FabricCharacterDots } from "@/components/fabric/FabricCharacterDots";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import type { Locale } from "@/lib/i18n/config";
import {
  FABRIC_CHARACTER_KEYS,
  type FabricCharacterKey,
} from "@/lib/fabric/character";
import { FABRIC_CHARACTER_JA } from "@/lib/i18n/ja-helpers";
import { cn } from "@/lib/utils";
import type { Fabric } from "@/lib/fabric/content";

type FabricCompareOverviewProps = {
  locale: Locale;
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

/** English page: short words that fit the narrow columns. */
const TRAIT_SHORT_EN: Record<FabricCharacterKey, string> = {
  thickness: "Thick",
  softness: "Soft",
  structure: "Body",
  sheerness: "Sheer",
  surface: "Surface",
};

function traitTitle(key: FabricCharacterKey, locale: Locale): string {
  const label = getSiteUiCopy(locale).fabric.character[key];

  if (locale === "en") return label;

  return `${label} · ${FABRIC_CHARACTER_JA[key]}`;
}

const FULL_GRID =
  "grid grid-cols-[minmax(0,7.5rem)_repeat(5,minmax(2.5rem,1fr))] gap-x-2 sm:grid-cols-[minmax(0,9rem)_repeat(5,minmax(2.75rem,1fr))] sm:gap-x-3";

function FullCompareHeader({ locale }: { locale: Locale }) {
  return (
    <div className={cn(FULL_GRID, "mb-4 items-end sm:mb-5")}>
      <span aria-hidden className="block" />
      {FABRIC_CHARACTER_KEYS.map((key) => (
        <div key={key} className="text-center">
          <span className="block text-[11px] font-normal tracking-[0.06em] text-neutral-600 sm:text-[11px]">
            {locale === "en" ? TRAIT_SHORT_EN[key] : TRAIT_ABBREV[key]}
          </span>
          {locale === "en" ? null : (
            <span
              lang="ja"
              className="mt-0.5 block text-[11px] font-normal tracking-[0.02em] text-neutral-600/75"
            >
              {FABRIC_CHARACTER_JA[key]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function FabricCompareOverview({
  locale,
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
          {variant === "full" ? <FullCompareHeader locale={locale} /> : null}

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
                      title={traitTitle("thickness", locale)}
                    />
                  ) : (
                    FABRIC_CHARACTER_KEYS.map((key) => (
                      <div
                        key={key}
                        className="flex justify-center"
                        title={traitTitle(key, locale)}
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
