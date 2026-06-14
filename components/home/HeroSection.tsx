import Image from "next/image";

type HeroSectionProps = {
  heroImage: string;
};

export function HeroSection({ heroImage }: HeroSectionProps) {
  return (
    <section aria-label="Hero" className="w-full">
      <div className="relative h-[68vh] min-h-[22rem] w-full md:h-[74vh] lg:h-[78vh]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.96] contrast-[0.98]"
        />
      </div>

      <div aria-hidden className="h-28 md:h-36 lg:h-44" />
    </section>
  );
}
