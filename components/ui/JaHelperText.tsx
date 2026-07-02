import { cn } from "@/lib/utils";

type JaHelperTextProps = {
  children: string;
  className?: string;
  /** Vertical space above the helper line. */
  spacing?: "tight" | "default" | "loose";
};

const SPACING = {
  tight: "mt-3 sm:mt-3.5",
  default: "mt-5 sm:mt-6",
  loose: "mt-6 sm:mt-8 md:mt-10",
} as const;

/** One-line Japanese summary — always subordinate to English above. */
export function JaHelperText({
  children,
  className,
  spacing = "default",
}: JaHelperTextProps) {
  return (
    <p
      lang="ja"
      className={cn(
        "max-w-xs font-extralight leading-[2.05] tracking-[0.03em] text-neutral-600",
        "text-[12px] md:leading-[2.15]",
        SPACING[spacing],
        className,
      )}
    >
      {children}
    </p>
  );
}
