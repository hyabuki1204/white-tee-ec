import Link from "next/link";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

export function AnnouncementBar() {
  const copy = GRAPHPAPER_STORE_COPY.announcement;

  return (
    <div className="border-b border-neutral-200/60 bg-[#f4f4f2]">
      <p className="px-6 py-2.5 text-center text-[11px] font-light tracking-[0.1em] text-neutral-600 md:text-[13px]">
        {copy.message}{" "}
        <Link
          href={copy.linkHref}
          className="text-neutral-700 underline decoration-neutral-300 underline-offset-[3px] transition-opacity hover:opacity-60"
        >
          {copy.linkLabel}
        </Link>
      </p>
    </div>
  );
}
