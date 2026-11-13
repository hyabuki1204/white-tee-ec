import { fontBodyStyle, fontVariableClassName } from "@/app/fonts";
import { AdminShell } from "@/components/admin/AdminShell";
import "../globals.css";

/** Root layout of the admin. Not localised: always Japanese, never under `/en`. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={fontVariableClassName}>
      <body style={fontBodyStyle}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
