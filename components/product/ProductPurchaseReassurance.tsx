import Link from "next/link";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

export function ProductPurchaseReassurance() {
  const copy = SITE_UI_COPY.product.reassurance;

  return (
    <div className="space-y-1.5 pt-2">
      <p className="text-[11px] font-light leading-[1.85] tracking-[0.04em] text-neutral-400 md:text-[10px]">
        {copy.shipping}
      </p>
      <p className="text-[11px] font-light leading-[1.85] tracking-[0.04em] text-neutral-400 md:text-[10px]">
        {copy.returns}
      </p>
      <JaHelperText spacing="tight">{copy.helperJa}</JaHelperText>
      <Link
        href="/shipping"
        className="inline-block pt-1 text-[10px] font-light tracking-[0.06em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
      >
        {copy.shippingLink}
      </Link>
    </div>
  );
}
