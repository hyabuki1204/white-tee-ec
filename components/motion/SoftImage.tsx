"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SoftImageProps = Omit<ImageProps, "onLoad"> & {
  /** Wrapper class — should include aspect-ratio when not using fill parent. */
  frameClassName?: string;
};

/**
 * Image with #F4F2EF placeholder and fade-in on load.
 * Parent (or frameClassName) must reserve aspect-ratio / size to avoid CLS.
 */
export function SoftImage({
  className,
  frameClassName,
  alt,
  ...props
}: SoftImageProps) {
  const [loaded, setLoaded] = useState(false);

  const image = (
    <Image
      {...props}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={cn(
        "transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-quiet)]",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );

  if (!frameClassName) {
    return image;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[var(--color-image-placeholder)]",
        frameClassName,
      )}
    >
      {image}
    </div>
  );
}
