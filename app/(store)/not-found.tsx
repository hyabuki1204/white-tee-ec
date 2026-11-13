import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const { notFound: copy } = GRAPHPAPER_STORE_COPY.states;

export default function NotFound() {
  return <NotFoundContent title={copy.title} message={copy.message} />;
}
