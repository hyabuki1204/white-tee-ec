import { cn } from "@/lib/utils";

const LEVELS = [1, 2, 3, 4, 5] as const;

type FabricCharacterDotsProps = {
  level: number;
  size?: "xs" | "sm";
  tone?: "default" | "quiet";
  className?: string;
  title?: string;
};

export function FabricCharacterDots({
  level,
  size = "sm",
  tone = "default",
  className,
  title,
}: FabricCharacterDotsProps) {
  const filled =
    tone === "quiet" ? "bg-neutral-400/35" : "bg-neutral-500";
  const empty =
    tone === "quiet" ? "bg-neutral-200/45" : "bg-neutral-200/90";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={title ?? `${level} of 5`}
      title={title}
    >
      {LEVELS.map((step) => (
        <span
          key={step}
          aria-hidden
          className={cn(
            size === "xs" ? "h-1 w-1" : "h-1 w-1",
            step <= level ? filled : empty,
          )}
        />
      ))}
    </div>
  );
}
