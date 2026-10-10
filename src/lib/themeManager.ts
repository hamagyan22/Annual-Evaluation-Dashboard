"use client";

import { useState, useEffect, useCallback } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  primary: string;         // Main color e.g. #1C6B53
  hover: string;           // Hover state e.g. #155a45
  accent: string;          // Accent / highlight e.g. #00A991
  glow: string;            // Glow e.g. rgba(28, 107, 83, 0.25)
  bgLight: string;         // Soft background tint light mode
  textLight: string;       // Text for soft background light mode
  darkBgLight: string;     // Dark mode soft background tint
  darkTextLight: string;   // Dark mode text
  borderLight: string;     // Light border
  darkBorderLight: string; // Dark border
  colorDot: string;        // CSS color hex for swatch display
  gradientFrom: string;    // Gradient start
  gradientVia: string;     // Gradient middle
  gradientTo: string;      // Gradient end
  gradientStyle: string;   // Linear gradient for banners
}

export const THEMES: ThemeConfig[] = [
  {
    id: "emerald",
    name: "Emerald Luxe",
    subtitle: "Official Brand Forest Green",
    primary: "#1C6B53",
    hover: "#155a45",
    accent: "#00A991",
    glow: "rgba(28, 107, 83, 0.25)",
    bgLight: "#ecfdf5",
    textLight: "#065f46",
    darkBgLight: "rgba(6, 78, 59, 0.45)",
    darkTextLight: "#6ee7b7",
    borderLight: "#a7f3d0",
    darkBorderLight: "#065f46",
    colorDot: "#1C6B53",
    gradientFrom: "#1C6B53",
    gradientVia: "#165a46",
    gradientTo: "#104334",
    gradientStyle: "linear-gradient(135deg, #1C6B53 0%, #165a46 50%, #104334 100%)",
  },
  {
    id: "indigo",
    name: "Royal Indigo",
    subtitle: "Executive Deep Violet & Slate",
    primary: "#4338ca",
    hover: "#3730a3",
    accent: "#6366f1",
    glow: "rgba(67, 56, 202, 0.25)",
    bgLight: "#eef2ff",
    textLight: "#3730a3",
    darkBgLight: "rgba(49, 46, 129, 0.45)",
    darkTextLight: "#a5b4fc",
    borderLight: "#c7d2fe",
    darkBorderLight: "#3730a3",
    colorDot: "#4338ca",
    gradientFrom: "#3730a3",
    gradientVia: "#4338ca",
    gradientTo: "#312e81",
    gradientStyle: "linear-gradient(135deg, #3730a3 0%, #4338ca 50%, #312e81 100%)",
  },
  {
    id: "sapphire",
    name: "Midnight Sapphire",
    subtitle: "Classic Deep Navy & Ocean Azure",
    primary: "#1e40af",
    hover: "#1e3a8a",
    accent: "#3b82f6",
    glow: "rgba(30, 64, 175, 0.25)",
    bgLight: "#eff6ff",
    textLight: "#1e3a8a",
    darkBgLight: "rgba(30, 58, 138, 0.45)",
    darkTextLight: "#93c5fd",
    borderLight: "#bfdbfe",
    darkBorderLight: "#1e3a8a",
    colorDot: "#1e40af",
    gradientFrom: "#1e3a8a",
    gradientVia: "#1e40af",
    gradientTo: "#172554",
    gradientStyle: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #172554 100%)",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    subtitle: "Nordic Sea & Vibrant Cyan",
    primary: "#0f766e",
    hover: "#115e59",
    accent: "#14b8a6",
    glow: "rgba(15, 118, 110, 0.25)",
    bgLight: "#f0fdfa",
    textLight: "#115e59",
    darkBgLight: "rgba(19, 78, 74, 0.45)",
    darkTextLight: "#5eead4",
    borderLight: "#99f6e4",
    darkBorderLight: "#134e4a",
    colorDot: "#0f766e",
    gradientFrom: "#115e59",
    gradientVia: "#0f766e",
    gradientTo: "#042f2e",
    gradientStyle: "linear-gradient(135deg, #115e59 0%, #0f766e 50%, #042f2e 100%)",
  },
  {
    id: "rose",
    name: "Rose Burgundy",
    subtitle: "Luxury Velvet Wine & Rose Gold",
    primary: "#9f1239",
    hover: "#881337",
    accent: "#f43f5e",
    glow: "rgba(159, 18, 57, 0.25)",
    bgLight: "#fff1f2",
    textLight: "#881337",
    darkBgLight: "rgba(136, 19, 55, 0.45)",
    darkTextLight: "#fda4af",
    borderLight: "#fecdd3",
    darkBorderLight: "#4c0519",
    colorDot: "#9f1239",
    gradientFrom: "#881337",
    gradientVia: "#9f1239",
    gradientTo: "#4c0519",
    gradientStyle: "linear-gradient(135deg, #881337 0%, #9f1239 50%, #4c0519 100%)",
  },
  {
    id: "amber",
    name: "Prestige Amber",
    subtitle: "Warm Burnished Gold & Bronze",
    primary: "#b45309",
    hover: "#92400e",
    accent: "#f59e0b",
    glow: "rgba(180, 83, 9, 0.25)",
    bgLight: "#fffbeb",
    textLight: "#92400e",
    darkBgLight: "rgba(120, 53, 15, 0.45)",
    darkTextLight: "#fde68a",
    borderLight: "#fde68a",
    darkBorderLight: "#78350f",
    colorDot: "#b45309",
    gradientFrom: "#92400e",
    gradientVia: "#b45309",
    gradientTo: "#451a03",
    gradientStyle: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #451a03 100%)",
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
