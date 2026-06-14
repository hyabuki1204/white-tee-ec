import Link from "next/link";
import { Container } from "@/components/layout/Container";

const BRAND_LINKS = [
  { label: "About", href: "/about" },
  { label: "Stories", href: "/stories" },
] as const;

export function BrandLinksSection() {
  return (
    <section aria-label="Brand">
      <Container as="div" className="pb-24 pt-4 md:pb-32 lg:pb-40">
        <nav
          aria-label="Brand pages"
          className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4"
        >
          {BRAND_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-light tracking-[0.1em] text-neutral-500 transition-opacity duration-500 hover:opacity-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
