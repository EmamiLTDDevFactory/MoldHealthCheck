import { scale, verticalScale } from "@/utils/styling";

/**
 * MouldHealth design system — "Swiggy-style": warm, energetic, high-contrast,
 * card-driven, mobile-first.
 *
 * NOTE: legacy keys (white, black, neutral*, primary, primaryLight…) are kept so
 * older imports keep working while screens migrate to the new tokens below.
 */
export const colors = {
  // ---- Brand (warm Swiggy orange) ----
  brand: "#FF5A1F",
  brandDark: "#FB3E2E",
  brandLight: "#FF8A2B",
  brandSoft: "#FFF1E9",
  brandSoft2: "#FFE2D2",
  onBrand: "#FFFFFF",

  // ---- Text / ink ----
  ink: "#1C1C28",
  textDark: "#1C1C28",
  textBody: "#3A3A46",
  textMuted: "#6B6B76",
  textFaint: "#9A9AA6",

  // ---- Surfaces ----
  bg: "#F6F6F8",
  surface: "#FFFFFF",
  surfaceAlt: "#FBFBFD",
  border: "#ECECF1",
  divider: "#F0F0F3",

  // ---- Semantic ----
  success: "#1FA463",
  successSoft: "#E7F8EF",
  danger: "#E23744",
  dangerSoft: "#FCE9EB",
  warning: "#FF9F1C",
  warningSoft: "#FFF3E0",
  info: "#2D7FF9",
  infoSoft: "#E8F1FF",

  // ---- Legacy (kept for backward compatibility) ----
  primary: "#FF5A1F",
  primaryLight: "#FF8A2B",
  primaryDark: "#FB3E2E",
  text: "#fff",
  textLight: "#e5e5e5",
  textLighter: "#d4d4d4",
  white: "#fff",
  black: "#000",
  rose: "#ef4444",
  green: "#16a34a",
  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral350: "#CCCCCC",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#171717",
};

/** Brand gradient stops, reused across CTAs, hero cards and the splash. */
export const gradients = {
  brand: ["#FF8A2B", "#FB3E2E"] as const,
  brandSoft: ["#FFF1E9", "#FFE2D2"] as const,
  sunset: ["#FF9F1C", "#FB3E2E"] as const,
  ink: ["#2A2A35", "#15151C"] as const,
  success: ["#26C281", "#1FA463"] as const,
  info: ["#4DA3FF", "#2D7FF9"] as const,
};

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _24: verticalScale(24),
  _28: verticalScale(28),
  _30: verticalScale(30),
  _32: verticalScale(32),
  pill: 999,
};

/** Typography scale (system font; weights tuned for Android + iOS). */
export const font = {
  h1: 30,
  h2: 24,
  h3: 20,
  title: 18,
  body: 15,
  sub: 13,
  caption: 12,
  micro: 11,
  black: "900" as const,
  bold: "800" as const,
  semibold: "700" as const,
  medium: "600" as const,
  regular: "500" as const,
};

/** Elevation presets — soft, warm shadows (orange-tinted for brand cards). */
export const shadow = {
  card: {
    shadowColor: "#1C1C28",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: "#1C1C28",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  brand: {
    shadowColor: "#FB3E2E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  floating: {
    shadowColor: "#1C1C28",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
};
