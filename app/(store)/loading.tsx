import { Container } from "@/components/layout/Container";
import { ProductGridSkeleton } from "@/components/motion/Skeleton";

export default function Loading() {
  return (
    <Container as="section" className="py-16 md:py-24" aria-busy="true">
      <div className="mb-10 space-y-3">
        <div className="skeleton-block h-3 w-24" aria-hidden />
        <div className="skeleton-block h-3 w-16" aria-hidden />
      </div>
      <ProductGridSkeleton count={6} />
      <span className="sr-only">読み込み中</span>
    </Container>
  );
}
