import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

const { notFound: copy } = SITE_UI_COPY.states;

export default function NotFound() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">{copy.label}</p>
        <p className="mt-6 text-sm font-light text-neutral-700">{copy.message}</p>
        <Link
          href="/"
          className="mt-10 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          {copy.back}
        </Link>
      </div>
    </Container>
  );
}
