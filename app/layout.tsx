import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
