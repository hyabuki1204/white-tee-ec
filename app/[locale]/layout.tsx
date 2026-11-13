import type { ReactNode } from "react";
import { fontBodyStyle, fontVariableClassName } from "@/app/fonts";
import { CartProvider } from "@/components/cart/CartProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getFxRates } from "@/lib/currency/config";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import "../globals.css";

export function generateStaticParams() {
  return localeStaticParams();
}

/**
 * Root layout of the storefront. The `[locale]` segment is `ja` or `en`;
 * `proxy.ts` rewrites unprefixed URLs to `/ja/...`, so Japanese keeps its
 * original addresses.
 */
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<LocaleParams>;
}>) {
  const locale = await resolveLocale(params);

  return (
    <html lang={locale} className={fontVariableClassName}>
      <body style={fontBodyStyle}>
        <LocaleProvider locale={locale}>
          <CurrencyProvider fx={getFxRates()}>
            <CartProvider>{children}</CartProvider>
          </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
