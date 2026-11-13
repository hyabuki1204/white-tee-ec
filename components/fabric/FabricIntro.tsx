import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";

const getCopy = defineCopy(
  {
    label: "Gauge",
    title: "1インチに、針が何本あるか。",
    lead: "ゲージは編機の針の密度です。数字が大きいほど編目は細かく、生地は薄く、密になります。28、36、46。同じ綿100%の白を、3つの密度で編み分けています。",
  },
  {
    label: "Gauge",
    title: "How many needles in one inch.",
    lead: "Gauge is the density of needles on the knitting machine: needles per inch. The higher the number, the smaller the stitches, and the thinner and denser the cloth. 28, 36, 46. We knit the same 100% cotton white at three densities.",
  },
);

export function FabricIntro({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);

  return (
    <header className="max-w-2xl">
      <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
      <h1 className="type-display mt-3">{copy.title}</h1>
      <p className="type-body mt-5 text-[var(--color-ink-soft)]">{copy.lead}</p>
    </header>
  );
}
