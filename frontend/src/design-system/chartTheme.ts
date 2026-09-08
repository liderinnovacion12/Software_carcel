// Chart color tokens, validated against this app's dark chart surface
// (--color-bg-surface, #111f30) with the dataviz skill's validator:
// all 8 categorical slots pass lightness/chroma/CVD/contrast gates.
export const categorical = [
  "#3987e5", // 1 blue
  "#d95926", // 2 orange
  "#199e70", // 3 aqua
  "#c98500", // 4 yellow
  "#d55181", // 5 magenta
  "#008300", // 6 green
  "#9085e9", // 7 violet
  "#e66767", // 8 red
] as const;

export const sequentialBlue = "#3987e5";

export const status = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const chartChrome = {
  grid: "#22374c", // --color-border
  axis: "#71879c", // --color-text-muted
  textSecondary: "#a9bdd1",
  textPrimary: "#eaf1f8",
  tooltipBg: "#16283d", // --color-bg-surface-raised
  tooltipBorder: "#22374c",
} as const;
