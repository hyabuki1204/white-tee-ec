/**
 * Combines class names, filtering out falsy values.
 * Extend with clsx/tailwind-merge when styling grows.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
