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
    subtitle: "Forest Teal & Corporate Mint",
    primary: "#10664F",
    hover: "#0D523F",
    accent: "#059669",
    glow: "rgba(16, 102, 79, 0.25)",
    bgLight: "#ECFDF5",
    textLight: "#065F46",
    darkBgLight: "rgba(6, 78, 59, 0.40)",
    darkTextLight: "#6EE7B7",
    borderLight: "#A7F3D0",
    darkBorderLight: "#065F46",
    colorDot: "#10664F",
    gradientFrom: "#10664F",
    gradientVia: "#0D523F",
    gradientTo: "#09382B",
    gradientStyle: "linear-gradient(135deg, #10664F 0%, #0D523F 50%, #09382B 100%)",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    subtitle: "Executive Navy & Bright Azure",
    primary: "#1D4ED8",
    hover: "#1E40AF",
    accent: "#3B82F6",
    glow: "rgba(29, 78, 216, 0.25)",
    bgLight: "#EFF6FF",
    textLight: "#1E40AF",
    darkBgLight: "rgba(30, 58, 138, 0.40)",
    darkTextLight: "#93C5FD",
    borderLight: "#BFDBFE",
    darkBorderLight: "#1E40AF",
    colorDot: "#1D4ED8",
    gradientFrom: "#1E3A8A",
    gradientVia: "#1D4ED8",
    gradientTo: "#172554",
    gradientStyle: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #172554 100%)",
  },
  {
    id: "amber",
    name: "Sunset Bronze",
    subtitle: "Warm Gold & Terracotta Amber",
    primary: "#C2410C",
    hover: "#9A3412",
    accent: "#EA580C",
    glow: "rgba(194, 65, 12, 0.25)",
    bgLight: "#FFF7ED",
    textLight: "#9A3412",
    darkBgLight: "rgba(124, 45, 18, 0.40)",
    darkTextLight: "#FDBA74",
    borderLight: "#FED7AA",
    darkBorderLight: "#9A3412",
    colorDot: "#C2410C",
    gradientFrom: "#9A3412",
    gradientVia: "#C2410C",
    gradientTo: "#7C2D12",
    gradientStyle: "linear-gradient(135deg, #9A3412 0%, #C2410C 50%, #7C2D12 100%)",
  },
  {
    id: "amethyst",
    name: "Imperial Amethyst",
    subtitle: "Royal Purple & Electric Iris",
    primary: "#7C3AED",
    hover: "#6D28D9",
    accent: "#8B5CF6",
    glow: "rgba(124, 58, 237, 0.25)",
    bgLight: "#F5F3FF",
    textLight: "#5B21B6",
    darkBgLight: "rgba(91, 33, 182, 0.40)",
    darkTextLight: "#C4B5FD",
    borderLight: "#DDD6FE",
    darkBorderLight: "#5B21B6",
    colorDot: "#7C3AED",
    gradientFrom: "#5B21B6",
    gradientVia: "#7C3AED",
    gradientTo: "#4C1D95",
    gradientStyle: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #4C1D95 100%)",
  },
  {
    id: "cyan",
    name: "Nordic Glacier",
    subtitle: "Arctic Sky & Vivid Cyan",
    primary: "#0284C7",
    hover: "#0369A1",
    accent: "#0EA5E9",
    glow: "rgba(2, 132, 199, 0.25)",
    bgLight: "#F0F9FF",
    textLight: "#0369A1",
    darkBgLight: "rgba(12, 74, 110, 0.40)",
    darkTextLight: "#7DD3FC",
    borderLight: "#BAE6FD",
    darkBorderLight: "#0369A1",
    colorDot: "#0284C7",
    gradientFrom: "#0369A1",
    gradientVia: "#0284C7",
    gradientTo: "#082F49",
    gradientStyle: "linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #082F49 100%)",
  },
  {
    id: "ruby",
    name: "Ruby Velvet",
    subtitle: "Royal Burgundy & Crimson Rose",
    primary: "#BE123C",
    hover: "#9F1239",
    accent: "#E11D48",
    glow: "rgba(190, 18, 60, 0.25)",
    bgLight: "#FFF1F2",
    textLight: "#881337",
    darkBgLight: "rgba(136, 19, 55, 0.40)",
    darkTextLight: "#FDA4AF",
    borderLight: "#FECDD3",
    darkBorderLight: "#881337",
    colorDot: "#BE123C",
    gradientFrom: "#881337",
    gradientVia: "#BE123C",
    gradientTo: "#4C0519",
    gradientStyle: "linear-gradient(135deg, #881337 0%, #BE123C 50%, #4C0519 100%)",
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
  return THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === "emerald") || THEMES[0];
}

export function applyThemeToDocument(themeId: string) {
  if (typeof document === "undefined") return;
  const theme = getThemeById(themeId);
  const root = document.documentElement;
  const isDark = root.classList.contains("dark") || (document.body && document.body.classList.contains("dark"));

  root.setAttribute("data-theme", theme.id);
  root.style.setProperty("--brand-primary", theme.primary);
  root.style.setProperty("--brand-hover", theme.hover);
  root.style.setProperty("--brand-accent", theme.accent);
  root.style.setProperty("--brand-glow", theme.glow);
  root.style.setProperty("--brand-bg-light", isDark ? theme.darkBgLight : theme.bgLight);
  root.style.setProperty("--brand-text-light", isDark ? theme.darkTextLight : theme.textLight);
  root.style.setProperty("--brand-dark-bg-light", theme.darkBgLight);
  root.style.setProperty("--brand-dark-text-light", theme.darkTextLight);
  root.style.setProperty("--brand-border-light", isDark ? theme.darkBorderLight : theme.borderLight);
  root.style.setProperty("--brand-dark-border-light", theme.darkBorderLight);
  root.style.setProperty("--brand-from", theme.gradientFrom);
  root.style.setProperty("--brand-via", theme.gradientVia);
  root.style.setProperty("--brand-to", theme.gradientTo);
  root.style.setProperty("--brand-gradient", theme.gradientStyle);
}

export function getCurrentThemeId(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  const activeUser = localStorage.getItem("app_active_user_email");
  if (activeUser) {
    const userTheme = localStorage.getItem(`app_color_theme_${activeUser.toLowerCase().trim()}`);
    if (userTheme && THEMES.some(t => t.id === userTheme)) return userTheme;
  }
  const saved = localStorage.getItem("app_color_theme");
  if (!saved) {
    try {
      localStorage.setItem("app_color_theme", DEFAULT_THEME_ID);
    } catch (e) {}
    return DEFAULT_THEME_ID;
  }
  return saved;
}

export function setAppTheme(themeId: string, userKey?: string) {
  if (typeof window === "undefined") return;
  // Local-only persistence: Changes strictly apply to this device/browser and user
  localStorage.setItem("app_color_theme", themeId);
  const activeUser = userKey || localStorage.getItem("app_active_user_email");
  if (activeUser) {
    try {
      localStorage.setItem(`app_color_theme_${activeUser.toLowerCase().trim()}`, themeId);
    } catch (e) {}
  }
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
    const activeUser = typeof window !== "undefined" ? localStorage.getItem("app_active_user_email") : null;
    setAppTheme(id, activeUser || undefined);
  }, []);

  const currentTheme = getThemeById(themeId);

  return { themeId, currentTheme, setTheme, themes: THEMES };
}
