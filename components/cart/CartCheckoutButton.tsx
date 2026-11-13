"use client";

import { buttonPrimaryClass } from "@/lib/store-ui/ui-classes";
import { cn } from "@/lib/utils";

type CartCheckoutButtonProps = {
  label: React.ReactNode;
  disabled: boolean;
  isLoading: boolean;
  loadingLabel: string;
  onClick: () => void;
  className?: string;
};

/** The one primary action of the cart: navy fill, full width. */
export function CartCheckoutButton({
  label,
  disabled,
  isLoading,
  loadingLabel,
  onClick,
  className,
}: CartCheckoutButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonPrimaryClass, "min-h-14 w-full px-6", className)}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
