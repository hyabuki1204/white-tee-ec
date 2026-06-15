import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

const FOOTER_LINKS = [
  { href: "/fabric", label: SITE_UI_COPY.nav.fabric },
  { href: "/products", label: SITE_UI_COPY.nav.products },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/legal", label: "Legal Notice" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200/70">
      <Container as="div" className="py-12 md:py-16">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-xs tracking-[0.25em] text-neutral-400">
            WHITE TEE
          </p>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-light tracking-wide text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="text-xs font-light text-neutral-400 md:min-w-[12rem] md:text-right">
            &copy; {currentYear} WHITE TEE
          </p>
        </div>
      </Container>
    </footer>
  );
}
