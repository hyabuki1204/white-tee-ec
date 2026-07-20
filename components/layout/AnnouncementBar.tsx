import Link from "next/link";

type AnnouncementBarProps = {
  message: string;
  linkHref: string;
  linkLabel: string;
};

export function AnnouncementBar({
  message,
  linkHref,
  linkLabel,
}: AnnouncementBarProps) {
  return (
    <div className="border-b border-neutral-200/60 bg-[#f4f4f2]">
      <p className="px-6 py-2.5 text-center text-[11px] font-light tracking-[0.1em] text-neutral-600 md:text-[13px]">
        {message}{" "}
        <Link
          href={linkHref}
          className="text-neutral-700 underline decoration-neutral-300 underline-offset-[3px] transition-opacity hover:opacity-60"
        >
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}
