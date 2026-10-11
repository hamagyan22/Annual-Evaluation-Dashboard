"use client";

import { useState, useEffect, useCallback } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  primary: string;         // Main brand color (calm, modern)
  hover: string;           // Hover state
  accent: string;          // Accent / secondary highlight
  glow: string;            // Subtle ambient glow
  bgLight: string;         // Soft background tint light mode
  textLight: string;       // Text on soft background
  darkBgLight: string;     // Dark mode soft background tint
  darkTextLight: string;   // Dark mode text
  borderLight: string;     // Light border
  darkBorderLight: string; // Dark border
  colorDot: string;        // CSS color hex for swatch display
  gradientFrom: string;    // Gradient start
  gradientVia: string;     // Gradient middle
  gradientTo: string;      // Gradient end
  gradientStyle: string;   // Linear gradient for banners & cards
}

export const THEMES: ThemeConfig[] = [
  {
    id: "emerald",
    name: "Emerald Reserve",
    subtitle: "Signature Forest & Persian Teal",
    primary: "#1C6B53",
    hover: "#155A45",
    accent: "#00A991",
    glow: "rgba(28, 107, 83, 0.25)",
    bgLight: "#ECFDF5",
    textLight: "#065F46",
    darkBgLight: "rgba(6, 78, 59, 0.40)",
    darkTextLight: "#6EE7B7",
    borderLight: "#A7F3D0",
    darkBorderLight: "#065F46",
    colorDot: "#1C6B53",
    gradientFrom: "#1C6B53",
    gradientVia: "#165A46",
    gradientTo: "#104334",
    gradientStyle: "linear-gradient(135deg, #1C6B53 0%, #165A46 50%, #104334 100%)",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    subtitle: "Executive Navy & Electric Azure",
    primary: "#1E40AF",
    hover: "#1D4ED8",
    accent: "#3B82F6",
    glow: "rgba(30, 64, 175, 0.25)",
    bgLight: "#EFF6FF",
    textLight: "#1E40AF",
    darkBgLight: "rgba(30, 58, 138, 0.40)",
    darkTextLight: "#93C5FD",
    borderLight: "#BFDBFE",
    darkBorderLight: "#1E40AF",
    colorDot: "#1E40AF",
    gradientFrom: "#1E3A8A",
    gradientVia: "#1E40AF",
    gradientTo: "#172554",
    gradientStyle: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #172554 100%)",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    subtitle: "Nordic Marine & Vivid Mint",
    primary: "#0F766E",
    hover: "#115E59",
    accent: "#14B8A6",
    glow: "rgba(15, 118, 110, 0.25)",
    bgLight: "#F0FDFA",
    textLight: "#115E59",
    darkBgLight: "rgba(19, 78, 74, 0.40)",
    darkTextLight: "#5EEAD4",
    borderLight: "#99F6E4",
    darkBorderLight: "#134E4A",
    colorDot: "#0F766E",
    gradientFrom: "#115E59",
    gradientVia: "#0F766E",
    gradientTo: "#042F2E",
    gradientStyle: "linear-gradient(135deg, #115E59 0%, #0F766E 50%, #042F2E 100%)",
  },
  {
    id: "amethyst",
    name: "Amethyst Violet",
    subtitle: "Royal Purple & Electric Iris",
    primary: "#6D28D9",
    hover: "#5B21B6",
    accent: "#8B5CF6",
    glow: "rgba(109, 40, 217, 0.25)",
    bgLight: "#F5F3FF",
    textLight: "#5B21B6",
    darkBgLight: "rgba(91, 33, 182, 0.40)",
    darkTextLight: "#C4B5FD",
    borderLight: "#DDD6FE",
    darkBorderLight: "#5B21B6",
    colorDot: "#6D28D9",
    gradientFrom: "#5B21B6",
    gradientVia: "#6D28D9",
    gradientTo: "#4C1D95",
    gradientStyle: "linear-gradient(135deg, #5B21B6 0%, #6D28D9 50%, #4C1D95 100%)",
  },
  {
    id: "ruby",
    name: "Ruby Velvet",
    subtitle: "Royal Burgundy & Crimson Rose",
    primary: "#9F1239",
    hover: "#881337",
    accent: "#E11D48",
    glow: "rgba(159, 18, 57, 0.25)",
    bgLight: "#FFF1F2",
    textLight: "#881337",
    darkBgLight: "rgba(136, 19, 55, 0.40)",
    darkTextLight: "#FDA4AF",
    borderLight: "#FECDD3",
    darkBorderLight: "#881337",
    colorDot: "#9F1239",
    gradientFrom: "#881337",
    gradientVia: "#9F1239",
    gradientTo: "#4C0519",
    gradientStyle: "linear-gradient(135deg, #881337 0%, #9F1239 50%, #4C0519 100%)",
  },
  {
    id: "carbon",
    name: "Carbon Obsidian",
    subtitle: "Minimalist Apple Slate & Zinc",
    primary: "#18181B",
    hover: "#27272A",
    accent: "#52525B",
    glow: "rgba(24, 24, 27, 0.25)",
    bgLight: "#F4F4F5",
    textLight: "#18181B",
    darkBgLight: "rgba(39, 39, 42, 0.45)",
    darkTextLight: "#D4D4D8",
    borderLight: "#E4E4E7",
    darkBorderLight: "#3F3F46",
    colorDot: "#18181B",
    gradientFrom: "#27272A",
    gradientVia: "#18181B",
    gradientTo: "#09090B",
    gradientStyle: "linear-gradient(135deg, #27272A 0%, #18181B 50%, #09090B 100%)",
  },
];

export const DEFAULT_THEME_ID = "emerald";

export function getThemeById(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyThemeToDocument(themeId: string) {
  if (typeof document === "undefined") return;
  const theme = getThemeById(themeId);
  const root = document.documentElement;

  root.setAttribute("data-theme", theme.id);
  root.style.setProperty("--brand-primary", theme.primary);
  root.style.setProperty("--brand-hover", theme.hover);
  root.style.setProperty("--brand-accent", theme.accent);
  root.style.setProperty("--brand-glow", theme.glow);
  root.style.setProperty("--brand-bg-light", theme.bgLight);
  root.style.setProperty("--brand-text-light", theme.textLight);
  root.style.setProperty("--brand-dark-bg-light", theme.darkBgLight);
  root.style.setProperty("--brand-dark-text-light", theme.darkTextLight);
  root.style.setProperty("--brand-border-light", theme.borderLight);
  root.style.setProperty("--brand-dark-border-light", theme.darkBorderLight);
  root.style.setProperty("--brand-from", theme.gradientFrom);
  root.style.setProperty("--brand-via", theme.gradientVia);
  root.style.setProperty("--brand-to", theme.gradientTo);
  root.style.setProperty("--brand-gradient", theme.gradientStyle);
}

export function getCurrentThemeId(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  return localStorage.getItem("app_color_theme") || DEFAULT_THEME_ID;
}

export function setAppTheme(themeId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("app_color_theme", themeId);
  applyThemeToDocument(themeId);
  window.dispatchEvent(new CustomEvent("app-theme-changed", { detail: themeId }));
}

export function useAppTheme() {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);

  useEffect(() => {
    const saved = getCurrentThemeId();
    setThemeId(saved);
    applyThemeToDocument(saved);

    const handleThemeChange = (e: any) => {
      const newThemeId = e.detail || getCurrentThemeId();
      setThemeId(newThemeId);
    };

    window.addEventListener("app-theme-changed", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("app-theme-changed", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeId(id);
    setAppTheme(id);
  }, []);

  const currentTheme = getThemeById(themeId);

  return { themeId, currentTheme, setTheme, themes: THEMES };
}
