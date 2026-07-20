import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "header";
} & HTMLAttributes<HTMLElement>;

/** Marks a block for one-shot scroll reveal (opacity + 12px rise). */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  ...rest
}: RevealProps) {
  return (
    <Tag data-reveal className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}
