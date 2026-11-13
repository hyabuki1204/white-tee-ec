import type { Fabric } from "@/lib/fabric/content";

type FabricDetailIntroProps = {
  fabric: Fabric;
};

/** Short English note under the gauge hero. */
export function FabricDetailIntro({ fabric }: FabricDetailIntroProps) {
  return (
    <header className="max-w-xl border-l border-[var(--color-ink)] pl-6">
      <p className="font-en text-[20px] leading-snug tracking-[0.02em] text-[var(--color-ink)]">
        {fabric.tagline}
      </p>
      <div className="mt-3 space-y-1">
        {fabric.descriptionLines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className="font-en text-[15px] leading-relaxed tracking-[0.02em] text-[var(--color-ink-soft)]"
          >
            {line}
          </p>
        ))}
      </div>
    </header>
  );
}
