import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

const { notFound: copy } = GRAPHPAPER_STORE_COPY.states;

export default function NotFound() {
  return (
    <Container as="section" className="py-20 md:py-28">
      <div className="mx-auto max-w-md text-center">
        <div className="relative mx-auto aspect-[4/3] max-w-xs overflow-hidden bg-[#f4f4f2]">
          <Image
            src="/store/store-empty-state.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 80vw, 320px"
            className="object-cover opacity-90"
          />
        </div>

        <p className="mt-10 text-[12px] font-light tracking-[0.28em] text-neutral-600">
          {copy.label}
        </p>
        <p className="mt-4 text-[14px] font-light leading-[1.8] tracking-[0.03em] text-neutral-700">
          {copy.message}
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-[12px] font-light tracking-[0.14em] text-neutral-800 transition-opacity hover:opacity-60"
        >
          {copy.back}
        </Link>
        <p className="mt-8">
          <Link
            href="/products?sleeve=short"
            className="text-[12px] font-light tracking-[0.08em] text-neutral-600 transition-opacity hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.nav.topsAll}
          </Link>
        </p>
      </div>
    </Container>
  );
}
