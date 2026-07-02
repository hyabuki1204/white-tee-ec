import { JaHelperText } from "@/components/ui/JaHelperText";
import {
  getKanemasaLines,
  type KanemasaLineVariant,
} from "@/lib/brand/kanemasa";
import { cn } from "@/lib/utils";

type KanemasaLineProps = {
  variant?: KanemasaLineVariant;
  className?: string;
  /** Tighter spacing when nested in fabric blocks. */
  spacing?: "default" | "tight";
};

export function KanemasaLine({
  variant = "factory",
  className,
  spacing = "default",
}: KanemasaLineProps) {
  const { en, ja } = getKanemasaLines(variant);

  return (
    <div
      className={cn(
        spacing === "tight" ? "space-y-1" : "space-y-1.5",
        className,
      )}
    >
      {en.map((line) => (
        <p
          key={line}
          className="text-[12px] font-light leading-[1.85] tracking-[0.05em] text-neutral-600 md:text-[12px]"
        >
          {line}
        </p>
      ))}
      <JaHelperText spacing="tight">{ja}</JaHelperText>
    </div>
  );
}
