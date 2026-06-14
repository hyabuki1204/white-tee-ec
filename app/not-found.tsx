import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">404</p>
        <p className="mt-6 text-sm font-light text-neutral-700">
          お探しのページが見つかりませんでした。
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          Back to Home
        </Link>
      </div>
    </Container>
  );
}
