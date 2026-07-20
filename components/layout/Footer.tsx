import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { FooterNewsletter } from "@/components/layout/FooterNewsletter";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const linkClass =
  "inline-flex min-h-11 items-center text-[12px] font-normal tracking-[0.02em] text-[var(--color-ink)] no-underline transition-[text-decoration-color] duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:underline";

const columnTitleClass = "type-label mb-4 text-[var(--color-ink)]";

const SHOP_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/fabric", label: "Fabric" },
  { href: "/journal", label: "Journal" },
] as const;

const INFORMATION_LINKS = [
  { href: "/store-guide", label: GRAPHPAPER_STORE_COPY.footer.storeGuide },
  { href: "/shipping", label: GRAPHPAPER_STORE_COPY.footer.shipping },
  { href: "/contact", label: GRAPHPAPER_STORE_COPY.footer.contact },
  { href: "/stockist", label: GRAPHPAPER_STORE_COPY.footer.stockist },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: GRAPHPAPER_STORE_COPY.footer.privacy },
  { href: "/terms", label: GRAPHPAPER_STORE_COPY.footer.terms },
  { href: "/legal", label: GRAPHPAPER_STORE_COPY.footer.legal },
] as const;

const INSTAGRAM_HREF = "https://www.instagram.com/";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-hairline)] bg-[var(--color-bg-warm)]">
      <Container as="div" className="py-[var(--space-5)] md:py-[var(--space-6)]">
        {/* Newsletter */}
        <div>
          <p className="type-label text-[var(--color-ink)]">NEWSLETTER</p>
          <FooterNewsletter />
        </div>

        {/* Link columns */}
        <nav
          aria-label="Footer"
          className="mt-12 flex flex-col gap-10 md:mt-16 md:grid md:grid-cols-3 md:gap-8"
        >
          <div>
            <p className={columnTitleClass}>SHOP</p>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[12px] font-normal leading-[1.7] tracking-[0.02em] text-[var(--color-ink-soft)]">
              {GRAPHPAPER_STORE_COPY.shipping.freeNote}
            </p>
            <p className={columnTitleClass}>INFORMATION</p>
            <ul className="space-y-3">
              {INFORMATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={columnTitleClass}>LEGAL</p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-hairline)] pt-8 md:mt-16 md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] font-normal tracking-[0.02em] text-[var(--color-ink-soft)]">
            © 2026 WHITE TEE — Kanemasa, Wakayama
          </p>
          <Link
            href={INSTAGRAM_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Instagram
          </Link>
        </div>
      </Container>
    </footer>
  );
}
