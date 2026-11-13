import { ProductFabricSpecs } from "@/components/product/ProductFabricSpecs";
import { MobilePurchaseBar } from "@/components/product/MobilePurchaseBar";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductLadderNav } from "@/components/product/ProductLadderNav";
import { ProductPdpAccordion } from "@/components/product/ProductPdpAccordion";
import { ProductPurchaseControls } from "@/components/product/ProductPurchaseControls";
import { ProductPurchaseHeader } from "@/components/product/ProductPurchaseHeader";
import { ProductPurchaseProvider } from "@/components/product/ProductPurchaseContext";
import { ProductSizeGuideTable } from "@/components/product/ProductSizeGuideTable";
import { getGaugeSpec } from "@/lib/fabric/gauge";
import { getFabricSpecRows } from "@/lib/fabric/specs";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  getReturnsPolicy,
  SHIPS_WITHIN_JAPAN_ONLY,
} from "@/lib/store-ui/returns-policy";
import type { Fabric } from "@/lib/fabric/content";
import type { Product, ProductSize } from "@/types";

const getCopy = defineCopy(
  { care: "お手入れについて", shipping: "配送・返品" },
  { care: "Care", shipping: "Shipping & returns" },
);

type ProductPageLayoutProps = {
  locale: Locale;
  product: Product;
  fabric?: Fabric | null;
  fabricName?: string | null;
  displayName: string;
  initialSize?: ProductSize | null;
};

export function ProductPageLayout({
  locale,
  product,
  fabric,
  displayName,
  initialSize = null,
}: ProductPageLayoutProps) {
  const copy = getCopy(locale);
  const returnsPolicy = getReturnsPolicy(locale);
  const specRows = getFabricSpecRows(product, fabric, locale);
  const gaugeSpec = getGaugeSpec(product.fabricSlug, locale);
  const description =
    product.description?.trim() ||
    product.detailDescription?.trim() ||
    "";

  const accordionItems = [
    {
      id: "care",
      title: copy.care,
      content: <p className="whitespace-pre-line">{product.care}</p>,
    },
    {
      id: "shipping",
      title: copy.shipping,
      content: (
        <div className="space-y-3">
          {locale === "en" ? <p>{SHIPS_WITHIN_JAPAN_ONLY}</p> : null}
          <p>{returnsPolicy.shipping}</p>
          <p>{returnsPolicy.returns}</p>
        </div>
      ),
    },
  ];

  const infoPanel = (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      <ProductPurchaseHeader
        locale={locale}
        displayName={displayName}
        price={product.price}
        description={description}
        gauge={gaugeSpec?.gauge}
        character={gaugeSpec?.character}
      />
      <ProductLadderNav locale={locale} product={product} />
      <ProductFabricSpecs rows={specRows} />
      <ProductPurchaseControls />
      <ProductPdpAccordion items={accordionItems} />
      <ProductSizeGuideTable rows={product.sizeGuide} />
    </div>
  );

  return (
    <ProductPurchaseProvider product={product} initialSize={initialSize}>
      <section className="lg:grid lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:items-start">
        <div className="min-w-0">
          <ProductGallery product={product} displayName={displayName} />
        </div>

        <aside className="px-6 py-10 md:px-10 lg:sticky lg:top-[var(--header-height)] lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-12 lg:py-12 xl:px-16">
          {infoPanel}
        </aside>
      </section>

      <MobilePurchaseBar displayName={displayName} />
    </ProductPurchaseProvider>
  );
}
