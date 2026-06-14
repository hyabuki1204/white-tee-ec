type BagIconProps = {
  className?: string;
};

/** Minimal outline bag — matches storefront stroke weight. */
export function BagIcon({ className }: BagIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M8 8V6.5a4 4 0 0 1 8 0V8" />
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
    </svg>
  );
}
