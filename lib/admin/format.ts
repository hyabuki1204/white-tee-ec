export function formatAdminDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Date-only format for admin list views (e.g. 2026/06/13). */
export function formatAdminListDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatAdminLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
