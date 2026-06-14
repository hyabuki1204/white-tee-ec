type CartProviderProps = {
  children: React.ReactNode;
};

/**
 * Extension point for future server-side cart sync (e.g. Supabase).
 * Zustand persist handles localStorage hydration automatically.
 */
export function CartProvider({ children }: CartProviderProps) {
  return <>{children}</>;
}
