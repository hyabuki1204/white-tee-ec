import Image from "next/image";

type HeroSectionProps = {
  heroImage: string;
};

export function HeroSection({ heroImage }: HeroSectionProps) {
  return (
    <section aria-label="Hero" className="w-full">
      <div className="relative h-[68vh] min-h-[22rem] w-full sm:h-[72vh] md:h-[72vh] lg:h-[75vh]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%] brightness-[0.96] contrast-[0.98]"
        />
      </div>
    </section>
  );
}
