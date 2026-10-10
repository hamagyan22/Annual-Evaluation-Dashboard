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
    subtitle: "Official Forest & Sage",
    primary: "#1B4D3E",
    hover: "#153E32",
    accent: "#2D7D65",
    glow: "rgba(27, 77, 62, 0.20)",
    bgLight: "#F0F5F2",
    textLight: "#1B4D3E",
    darkBgLight: "rgba(27, 77, 62, 0.35)",
    darkTextLight: "#A4D9C5",
    borderLight: "#C8DED4",
    darkBorderLight: "#276A54",
    colorDot: "#1B4D3E",
    gradientFrom: "#174336",
    gradientVia: "#1B4D3E",
    gradientTo: "#112F26",
    gradientStyle: "linear-gradient(135deg, #174336 0%, #1B4D3E 50%, #112F26 100%)",
  },
  {
    id: "slate",
    name: "Midnight Slate",
    subtitle: "Calm Executive Navy & Steel",
    primary: "#27384A",
    hover: "#1E2B38",
    accent: "#3D566E",
    glow: "rgba(39, 56, 74, 0.20)",
    bgLight: "#F2F5F8",
    textLight: "#27384A",
    darkBgLight: "rgba(39, 56, 74, 0.38)",
    darkTextLight: "#ADC4DA",
    borderLight: "#CFDCE6",
    darkBorderLight: "#3A5168",
    colorDot: "#27384A",
    gradientFrom: "#1C2936",
    gradientVia: "#27384A",
    gradientTo: "#141D26",
    gradientStyle: "linear-gradient(135deg, #1C2936 0%, #27384A 50%, #141D26 100%)",
  },
  {
    id: "sage",
    name: "Nordic Sage",
    subtitle: "Muted Eucalyptus & Seafoam",
    primary: "#2A574E",
    hover: "#20433C",
    accent: "#3B7569",
    glow: "rgba(42, 87, 78, 0.20)",
    bgLight: "#F1F6F4",
    textLight: "#2A574E",
    darkBgLight: "rgba(42, 87, 78, 0.38)",
    darkTextLight: "#AFD6CE",
    borderLight: "#CDDFDB",
    darkBorderLight: "#3A7367",
    colorDot: "#2A574E",
    gradientFrom: "#1F4039",
    gradientVia: "#2A574E",
    gradientTo: "#152B26",
    gradientStyle: "linear-gradient(135deg, #1F4039 0%, #2A574E 50%, #152B26 100%)",
  },
  {
    id: "cashmere",
    name: "Warm Cashmere",
    subtitle: "Neutral Charcoal & Muted Clay",
    primary: "#3E3A37",
    hover: "#302D2A",
    accent: "#5D5753",
    glow: "rgba(62, 58, 55, 0.20)",
    bgLight: "#F7F5F3",
    textLight: "#3E3A37",
    darkBgLight: "rgba(62, 58, 55, 0.38)",
    darkTextLight: "#D2CBC5",
    borderLight: "#DED8D2",
    darkBorderLight: "#58514C",
    colorDot: "#3E3A37",
    gradientFrom: "#2D2A28",
    gradientVia: "#3E3A37",
    gradientTo: "#1E1C1A",
    gradientStyle: "linear-gradient(135deg, #2D2A28 0%, #3E3A37 50%, #1E1C1A 100%)",
  },
  {
    id: "twilight",
    name: "Twilight Dusk",
    subtitle: "Soft Evening Slate & Indigo",
    primary: "#353B55",
    hover: "#292E42",
    accent: "#4C5578",
    glow: "rgba(53, 59, 85, 0.20)",
    bgLight: "#F3F4F8",
    textLight: "#353B55",
    darkBgLight: "rgba(53, 59, 85, 0.38)",
    darkTextLight: "#B6BEDC",
    borderLight: "#D4D8E7",
    darkBorderLight: "#4C5578",
    colorDot: "#353B55",
    gradientFrom: "#262B3D",
    gradientVia: "#353B55",
    gradientTo: "#1A1D2B",
    gradientStyle: "linear-gradient(135deg, #262B3D 0%, #353B55 50%, #1A1D2B 100%)",
  },
  {
    id: "obsidian",
    name: "Modern Obsidian",
    subtitle: "Minimalist Apple & Linear Slate",
    primary: "#242830",
    hover: "#1B1E24",
    accent: "#3D4350",
    glow: "rgba(36, 40, 48, 0.25)",
    bgLight: "#F3F5F7",
    textLight: "#242830",
    darkBgLight: "rgba(36, 40, 48, 0.45)",
    darkTextLight: "#C0C5CE",
    borderLight: "#D3D6DC",
    darkBorderLight: "#3D4350",
    colorDot: "#242830",
    gradientFrom: "#1A1D22",
    gradientVia: "#242830",
    gradientTo: "#111317",
    gradientStyle: "linear-gradient(135deg, #1A1D22 0%, #242830 50%, #111317 100%)",
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
