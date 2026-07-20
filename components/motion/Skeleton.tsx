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

/** Product-grid style list skeleton for route loading states. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-x-6 gap-y-16 lg:grid-cols-3"
      aria-busy="true"
      aria-label="読み込み中"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="space-y-3">
          <SkeletonBlock className="aspect-[3/4] w-full" />
          <SkeletonBlock className="h-3 w-3/4 max-w-[12rem]" />
          <SkeletonBlock className="h-3 w-1/3 max-w-[5rem]" />
        </li>
      ))}
    </ul>
  );
}
