import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function AdminOrderNotFound() {
  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          Order not found
        </p>
        <Link
          href="/admin/orders"
          className="mt-8 inline-block text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
        >
          Back to Orders
        </Link>
      </div>
    </Container>
  );
}
