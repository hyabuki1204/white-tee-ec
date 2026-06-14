import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

export default function Loading() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-400">
          {SITE_UI_COPY.states.loading}
        </p>
      </div>
    </Container>
  );
}
