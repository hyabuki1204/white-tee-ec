import { Container } from "@/components/layout/Container";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

export default function Loading() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-[11px] font-light tracking-[0.28em] text-neutral-400">
          {GRAPHPAPER_STORE_COPY.states.loading}
        </p>
      </div>
    </Container>
  );
}
