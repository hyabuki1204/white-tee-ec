import { ProductFabricSpecs } from "@/components/product/ProductFabricSpecs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPdpAccordion } from "@/components/product/ProductPdpAccordion";
import { ProductPurchaseControls } from "@/components/product/ProductPurchaseControls";
import { ProductPurchaseHeader } from "@/components/product/ProductPurchaseHeader";
import { ProductPurchaseProvider } from "@/components/product/ProductPurchaseContext";
import { ProductSizeGuideTable } from "@/components/product/ProductSizeGuideTable";
import { getFabricSpecRows } from "@/lib/fabric/specs";
import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";
import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

type ProductPageLayoutProps = {
  product: Product;
  fabric?: Fabric | null;
  fabricName?: string | null;
  displayName: string;
};

export function ProductPageLayout({
  product,
  fabric,
  displayName,
}: ProductPageLayoutProps) {
  const specRows = getFabricSpecRows(product, fabric);
  const description =
    product.description?.trim() ||
    product.detailDescription?.trim() ||
    "";

  const accordionItems = [
    {
      id: "care",
      title: "お手入れについて",
      content: <p className="whitespace-pre-line">{product.care}</p>,
    },
    {
      id: "shipping",
      title: "配送・返品",
      content: (
        <div className="space-y-3">
          <p>{RETURNS_POLICY.shipping}</p>
          <p>{RETURNS_POLICY.returns}</p>
        </div>
      ),
    },
  ];

  const infoPanel = (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      <ProductPurchaseHeader
        displayName={displayName}
        price={product.price}
        description={description}
      />
      <ProductFabricSpecs rows={specRows} />
      <ProductPurchaseControls />
      <ProductPdpAccordion items={accordionItems} />
      <ProductSizeGuideTable rows={product.sizeGuide} />
    </div>
  );

  return (
    <ProductPurchaseProvider product={product}>
      <section className="lg:grid lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:items-start">
        <div className="min-w-0">
          <ProductGallery product={product} displayName={displayName} />
        </div>

        <aside className="px-6 py-10 md:px-10 lg:sticky lg:top-[var(--header-height)] lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-12 lg:py-12 xl:px-16">
          {infoPanel}
        </aside>
      </section>
    </ProductPurchaseProvider>
  );
}
