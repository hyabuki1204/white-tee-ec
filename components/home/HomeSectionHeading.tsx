import { STORE_TYPO } from "@/lib/store-ui/typography";
import { cn } from "@/lib/utils";

type HomeSectionHeadingProps = {
  label: string;
  title: string;
  className?: string;
};

/** English label + Japanese title — shared home section heading. */
export function HomeSectionHeading({
  label,
  title,
  className,
}: HomeSectionHeadingProps) {
  return (
    <header className={className}>
      <p className={STORE_TYPO.label}>{label}</p>
      <h2 className={cn(STORE_TYPO.h2, "mt-3")}>{title}</h2>
    </header>
  );
}
