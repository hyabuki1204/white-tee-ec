import type { CSSProperties, ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { League_Spartan, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const fontSansJp = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-kaku",
  display: "swap",
  fallback: ["Noto Sans JP", "sans-serif"],
});

const fontSansEn = League_Spartan({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-spartan",
  display: "swap",
  fallback: ["Helvetica Neue", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const fontVars = {
    "--font-sans-jp":
      'var(--font-zen-kaku), "Noto Sans JP", sans-serif',
    "--font-sans-en":
      'var(--font-spartan), "Helvetica Neue", Helvetica, sans-serif',
  } as CSSProperties;

  return (
    <html
      lang="ja"
      className={`${fontSansJp.variable} ${fontSansEn.variable}`}
    >
      <body style={fontVars}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
