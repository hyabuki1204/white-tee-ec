import { HOME_COPY } from "@/lib/store-ui/home-redesign";

export function HomeProof() {
  return (
    <section aria-label="Product proof points" className="border-t border-[#e8e8e6]">
      <div className="mx-auto w-full max-w-7xl px-8 py-16 md:px-16 md:py-[120px]">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-16">
          {HOME_COPY.proof.map((item) => (
            <li key={item.label} className="text-center sm:text-left">
              <p className="text-[11px] font-light tracking-[0.2em] text-[#9a9a9a]">
                {item.label}
              </p>
              <p className="mt-4 text-[11px] font-light leading-relaxed tracking-[0.04em] text-[#6c6c6c] md:text-[12px]">
                {item.line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
