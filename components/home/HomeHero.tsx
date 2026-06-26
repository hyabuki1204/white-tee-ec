import Image from "next/image";
import { HOME_COPY, HOME_IMAGES } from "@/lib/store-ui/home-redesign";

export function HomeHero() {
  return (
    <section aria-label="Introduction" className="relative h-screen w-full overflow-hidden">
      <Image
        src={HOME_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_20%]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      <div className="absolute inset-x-0 bottom-0 px-8 pb-16 md:px-16 md:pb-[120px]">
        <div className="mx-auto w-full max-w-7xl">
          {HOME_COPY.hero.lines.map((line) => (
            <p
              key={line}
              className="text-[12px] font-light leading-[1.9] tracking-[0.06em] text-[#6c6c6c] md:text-[14px]"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
