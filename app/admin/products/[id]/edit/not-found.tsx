import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function AdminProductNotFound() {
  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <p className="text-sm font-light text-neutral-500">Product not found.</p>
      <Link
        href="/admin/products"
        className="mt-8 inline-block text-xs font-light tracking-wide text-neutral-900"
      >
        ← Back to Products
      </Link>
    </Container>
  );
}
