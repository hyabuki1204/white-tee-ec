import Image from "next/image";
import type { Fabric } from "@/lib/fabric/content";

type FabricHeroProps = {
  fabric: Fabric;
};

export function FabricHero({ fabric }: FabricHeroProps) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-background md:aspect-[16/9] lg:aspect-[2/1]">
      <Image
        src={fabric.imageUrl}
        alt={fabric.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center brightness-[0.97] contrast-[0.98]"
      />
    </div>
  );
}
