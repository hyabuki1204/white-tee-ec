import Link from "next/link";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

export function ProductPurchaseReassurance() {
  const { reassurance } = SITE_UI_COPY.product;

  return (
    <div className="space-y-2 border-t border-neutral-200/50 pt-6">
      <p className="text-[10px] font-light leading-[1.9] tracking-[0.04em] text-neutral-500">
        {reassurance.shipping}
      </p>
      <p className="text-[10px] font-light leading-[1.9] tracking-[0.04em] text-neutral-500">
        {reassurance.returns}
      </p>
      <Link
        href="/shipping"
        className="inline-block pt-1 text-[10px] font-light tracking-[0.08em] text-neutral-400 transition-opacity hover:opacity-60"
      >
        {reassurance.shippingLink}
      </Link>
      <p className="text-[10px] font-light leading-[1.8] tracking-[0.04em] text-neutral-300">
        {reassurance.helperJa}
      </p>
    </div>
  );
}
