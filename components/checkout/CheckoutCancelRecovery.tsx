"use client";

import { Link } from "@/components/i18n/Link";
import { useSyncExternalStore } from "react";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import { getLastViewedProductSlug } from "@/lib/navigation/last-product";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  textLinkClass,
} from "@/lib/store-ui/ui-classes";

// sessionStorage does not change while this page is open; read it once on
// the client and render nothing for it on the server.
const subscribe = () => () => {};
const getServerSnapshot = () => null;

export function CheckoutCancelRecovery() {
  const storeCopy = getStoreCopy(useLocale());
  const copy = storeCopy.checkout;
  const { openDrawer } = useCartDrawer();
  const lastProductSlug = useSyncExternalStore(
    subscribe,
    getLastViewedProductSlug,
    getServerSnapshot,
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={openDrawer} className={buttonPrimaryClass}>
          {copy.backToBag}
        </button>
        {lastProductSlug ? (
          <Link
            href={`/products/${lastProductSlug}`}
            className={buttonSecondaryClass}
          >
            {copy.backToLastProduct}
          </Link>
        ) : (
          <Link href="/products" className={buttonSecondaryClass}>
            {copy.viewProducts}
          </Link>
        )}
      </div>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {lastProductSlug ? (
          <Link href="/products" className={textLinkClass}>
            {copy.viewProducts}
          </Link>
        ) : null}
        <Link href="/fabric" className={textLinkClass}>
          {copy.exploreFabric}
        </Link>
        <Link href="/store-guide" className={textLinkClass}>
          {storeCopy.footer.storeGuide}
        </Link>
      </div>
    </div>
  );
}
