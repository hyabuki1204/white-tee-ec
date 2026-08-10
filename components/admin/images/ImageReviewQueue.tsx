"use client";

import { useState } from "react";

import { ImageReviewCard } from "@/components/admin/images/ImageReviewCard";
import { adminEmpty } from "@/lib/admin/ui";
import { IMAGE_ADMIN_COPY } from "@/lib/images/labels";
import type { AdminImageReviewItem } from "@/types/admin-image";

type Props = {
  items: AdminImageReviewItem[];
};

export function ImageReviewQueue({ items }: Props) {
  // Reviewed cards drop out locally rather than triggering a refetch: the
  // signed URLs on the remaining cards are short-lived, and reloading the
  // page would cost the reviewer their place in a long queue.
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const remaining = items.filter((item) => !reviewedIds.has(item.id));

  if (remaining.length === 0) {
    return <p className={adminEmpty}>{IMAGE_ADMIN_COPY.review.empty}</p>;
  }

  return (
    <div className="space-y-4">
      {remaining.map((item) => (
        <ImageReviewCard
          key={item.id}
          item={item}
          onReviewed={(id) =>
            setReviewedIds((previous) => new Set(previous).add(id))
          }
        />
      ))}
    </div>
  );
}
