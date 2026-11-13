import type { CSSProperties } from "react";
import { League_Spartan, Zen_Kaku_Gothic_New } from "next/font/google";

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

/** Class names for `<html>`: exposes both font CSS variables. */
export const fontVariableClassName = `${fontSansJp.variable} ${fontSansEn.variable}`;

/** Inline style for `<body>`: maps the font variables onto the design tokens. */
export const fontBodyStyle = {
  "--font-sans-jp": 'var(--font-zen-kaku), "Noto Sans JP", sans-serif',
  "--font-sans-en":
    'var(--font-spartan), "Helvetica Neue", Helvetica, sans-serif',
} as CSSProperties;
