import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function ProductNotFound() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-600">
          Product not found
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          Back to Products
        </Link>
      </div>
    </Container>
  );
}
