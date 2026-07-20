import { HOME_COPY } from "@/lib/store-ui/home-redesign";

export function HomeProof() {
  return (
    <section aria-label="Product proof points" className="border-t border-[var(--color-hairline)]">
      <div className="mx-auto w-full max-w-7xl px-8 py-12 md:px-16 md:py-16">
        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {HOME_COPY.proof.map((item) => (
            <li key={item.label} className="text-center sm:text-left">
              <p className="text-[12px] font-normal tracking-[0.2em] text-[var(--color-ink-soft)]">
                {item.label}
              </p>
              <p className="mt-3 text-[12px] font-normal leading-relaxed tracking-[0.04em] text-[var(--color-ink-soft)] md:text-[14px]">
                {item.line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
