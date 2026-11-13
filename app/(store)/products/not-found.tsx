import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const { notFound: copy } = GRAPHPAPER_STORE_COPY.states;

export default function ProductNotFound() {
  return (
    <NotFoundContent title={copy.productTitle} message={copy.productMessage} />
  );
}
