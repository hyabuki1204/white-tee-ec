/** Kanemasa factory — quiet background copy, one line at a time. */

export const KANEMASA_COPY = {
  knittedInWakayama: "Knitted in Wakayama.",
  onOurMachines: "Developed on our own machines.",
  ourFactory: "Our factory in Wakayama.",
  helperJa: {
    knitted: "和歌山の自社工場で編んでいます。",
    machines: "長年使い続けてきた自社の編み機で開発。",
    factory: "和歌山の工場から。",
    pdp: "和歌山で編み、自社の編み機で仕上げた生地です。",
  },
} as const;

export type KanemasaLineVariant = "knitted" | "machines" | "factory" | "pdp";

export function getKanemasaLines(
  variant: KanemasaLineVariant,
): { en: string[]; ja: string } {
  switch (variant) {
    case "knitted":
      return {
        en: [KANEMASA_COPY.knittedInWakayama],
        ja: KANEMASA_COPY.helperJa.knitted,
      };
    case "machines":
      return {
        en: [KANEMASA_COPY.onOurMachines],
        ja: KANEMASA_COPY.helperJa.machines,
      };
    case "factory":
      return {
        en: [KANEMASA_COPY.ourFactory],
        ja: KANEMASA_COPY.helperJa.factory,
      };
    case "pdp":
      return {
        en: [KANEMASA_COPY.knittedInWakayama],
        ja: KANEMASA_COPY.helperJa.knitted,
      };
  }
}
