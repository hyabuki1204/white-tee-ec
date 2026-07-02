import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const PRIMARY_FOOTER_LINKS = [
  { href: "/store-guide", label: GRAPHPAPER_STORE_COPY.footer.storeGuide },
  { href: "/shipping", label: GRAPHPAPER_STORE_COPY.footer.shipping },
  { href: "/stockist", label: GRAPHPAPER_STORE_COPY.footer.stockist },
  { href: "/contact", label: GRAPHPAPER_STORE_COPY.footer.contact },
] as const;

const SECONDARY_FOOTER_LINKS = [
  { href: "/about", label: GRAPHPAPER_STORE_COPY.footer.about },
  { href: "/journal", label: GRAPHPAPER_STORE_COPY.footer.journal },
  { href: "/fabric", label: GRAPHPAPER_STORE_COPY.footer.fabric },
  { href: "/privacy", label: GRAPHPAPER_STORE_COPY.footer.privacy },
  { href: "/terms", label: GRAPHPAPER_STORE_COPY.footer.terms },
  { href: "/legal", label: GRAPHPAPER_STORE_COPY.footer.legal },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200/70">
      <Container as="div" className="py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <p className="text-[12px] tracking-[0.28em] text-neutral-600">
            {GRAPHPAPER_STORE_COPY.brandLine}
          </p>

          <nav aria-label="Footer" className="flex flex-col gap-8 sm:gap-10">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 md:gap-x-10">
              {PRIMARY_FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] font-light tracking-[0.06em] text-neutral-600 transition-opacity hover:opacity-60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 md:gap-x-10">
              {SECONDARY_FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] font-light tracking-[0.06em] text-neutral-600 transition-opacity hover:opacity-60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="text-[12px] font-light text-neutral-600 md:text-right">
            &copy; {currentYear} {GRAPHPAPER_STORE_COPY.brandLine}
          </p>
        </div>
      </Container>
    </footer>
  );
}
