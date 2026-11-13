import { SkeletonBlock } from "@/components/motion/Skeleton";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

/** Product page skeleton: gallery on the left, purchase panel on the right. */
export default function ProductLoading() {
  return (
    <section
      aria-busy="true"
      className="lg:grid lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:items-start"
    >
      <SkeletonBlock className="aspect-[4/5] w-full lg:aspect-auto lg:h-[calc(100vh-var(--header-height))]" />

      <div className="px-6 py-10 md:px-10 lg:px-12 lg:py-12 xl:px-16">
        <SkeletonBlock className="h-3 w-40" />
        <SkeletonBlock className="mt-8 h-24 w-44" />
        <SkeletonBlock className="mt-8 h-6 w-48" />
        <SkeletonBlock className="mt-5 h-4 w-24" />
        <SkeletonBlock className="mt-10 h-11 w-full" />
        <SkeletonBlock className="mt-4 h-11 w-full" />
        <div className="mt-10 space-y-5">
          {[0, 1, 2, 3].map((row) => (
            <SkeletonBlock key={row} className="h-4 w-full" />
          ))}
        </div>
        <SkeletonBlock className="mt-10 h-14 w-full" />
      </div>
      <span className="sr-only">{GRAPHPAPER_STORE_COPY.states.loading}</span>
    </section>
  );
}
