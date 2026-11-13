import { cn } from "@/lib/utils";

type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn("skeleton-block", className)}
      aria-hidden
    />
  );
}
