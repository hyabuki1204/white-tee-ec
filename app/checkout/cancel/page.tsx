import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function CheckoutCancelPage() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Checkout cancelled
        </p>
        <p className="mt-6 text-sm font-light text-neutral-700">
          決済は完了していません。
        </p>
        <Link
          href="/cart"
          className="mt-10 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          Back to Cart
        </Link>
      </div>
    </Container>
  );
}
