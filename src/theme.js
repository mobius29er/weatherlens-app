// Retro atomic-age color palette & shared styles
export const COLORS = {
  bg: "#1a1e14",
  surface: "#232a1c",
  surface2: "#2a3420",
  border: "#3a4a2a",
  border2: "#4a5a3a",
  text: "#d4c88a",
  text2: "#8a8060",
  gold: "#c8a832",
  gold2: "#e8c842",
  green: "#4a8a4a",
  greenBright: "#6abf6a",
  red: "#c85a4a",
  orange: "#d4923a",
  white: "#fff",
  black: "#000",
};

export const SEVERITY_COLORS = {
  SEVERE: "#f87171",
  MODERATE: "#fb923c",
  ADVISORY: "#fbbf24",
  MILD: "#34d399",
};

export const FONTS = {
  mono: "SpaceMono",      // will load via Expo
  monoFallback: "Courier",
};

// Shared text styles
export const TEXT = {
  h1: { fontFamily: FONTS.mono, fontSize: 28, fontWeight: "900", letterSpacing: 3, color: COLORS.text },
  h2: { fontFamily: FONTS.mono, fontSize: 16, fontWeight: "900", letterSpacing: 2, color: COLORS.text },
  h3: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "800", letterSpacing: 1, color: COLORS.text },
  body: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text },
  small: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2 },
  tiny: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.text2, letterSpacing: 0.5 },
  gold: { color: COLORS.gold2 },
  green: { color: COLORS.greenBright },
};
