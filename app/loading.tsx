import { Container } from "@/components/layout/Container";

export default function Loading() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-400">Loading</p>
      </div>
    </Container>
  );
}
