import { ProductModelFitInfo } from "@/components/product/ProductModelFitInfo";
import { SizeRecommendationTool } from "@/components/product/SizeRecommendationTool";
import type { ProductFitProfile } from "@/types/product-fit";
import type { ProductSize } from "@/types";

type ProductPurchaseFitGuideProps = {
  fitProfile: ProductFitProfile;
  availableSizes: ProductSize[];
};

export function ProductPurchaseFitGuide({
  fitProfile,
  availableSizes,
}: ProductPurchaseFitGuideProps) {
  return (
    <div className="space-y-2 border-t border-neutral-200/50 pt-6">
      <ProductModelFitInfo fitProfile={fitProfile} />
      <SizeRecommendationTool
        fitProfile={fitProfile}
        availableSizes={availableSizes}
      />
    </div>
  );
}
