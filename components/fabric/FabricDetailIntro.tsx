import type { Fabric } from "@/lib/fabric/content";

type FabricDetailIntroProps = {
  fabric: Fabric;
};

export function FabricDetailIntro({ fabric }: FabricDetailIntroProps) {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <h1 className="text-xs font-light tracking-[0.14em] text-neutral-800">
        {fabric.name}
      </h1>

      <p className="mt-8 max-w-sm text-xs font-light leading-[2.1] tracking-[0.03em] text-neutral-500 md:mt-10">
        {fabric.tagline}
      </p>

      <p className="mt-10 max-w-md text-xs font-light leading-[2.15] tracking-[0.03em] text-neutral-500 md:mt-12">
        {fabric.descriptionLines.map((line, index) => (
          <span key={line}>
            {line}
            {index < fabric.descriptionLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </header>
  );
}
