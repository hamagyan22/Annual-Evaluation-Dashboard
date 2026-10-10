"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Palette, Check } from "lucide-react";
import { useAppTheme, THEMES } from "@/lib/themeManager";

interface ThemeSelectorModalProps {
  className?: string;
  buttonVariant?: "icon" | "pill";
  align?: "left" | "right" | "auto";
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  className = "",
  buttonVariant = "icon",
  align = "auto",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const { themeId, setTheme } = useAppTheme();
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate and update position dynamically
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 240; // width of w-60
      const screenPadding = 10;

      let left: number;
      if (align === "left") {
        left = rect.left;
      } else if (align === "right") {
        left = rect.right - menuWidth;
      } else {
        // Auto: if closer to the left side of the viewport, align left; otherwise right
        if (rect.left < 260) {
          left = rect.left;
        } else {
          left = rect.right - menuWidth;
        }
      }

      // Constrain strictly within viewport boundaries
      if (left < screenPadding) {
        left = screenPadding;
      }
      if (left + menuWidth > window.innerWidth - screenPadding) {
        left = window.innerWidth - menuWidth - screenPadding;
      }

      const top = rect.bottom + 8;
      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, align]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0">
      {buttonVariant === "icon" ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer ${className}`}
          title="Color Theme"
          aria-label="Color Theme"
          aria-expanded={isOpen}
        >
          <Palette
            size={15}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-45 text-[#1C6B53] dark:text-emerald-400" : ""
            }`}
          />
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 transition cursor-pointer shadow-2xs ${className}`}
          title="Color Theme"
          aria-expanded={isOpen}
        >
          <Palette size={14} />
          <span>Themes</span>
        </button>
      )}

      {/* Dropdown Menu portaled directly to document.body to completely avoid clipping by overflow or stacking contexts */}
      {isOpen && mounted && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          role="menu"
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className="w-56 sm:w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/90 py-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10 select-none"
        >
          {/* Header */}
          <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span>Color Theme</span>
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">English Only</span>
          </div>

          {/* Simple Themes List */}
          <div className="p-1 space-y-0.5">
            {THEMES.map((theme) => {
              const isSelected = theme.id === themeId;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-gray-100/90 dark:bg-gray-800 text-gray-950 dark:text-white font-black"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-950 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ring-1 ring-black/10 dark:ring-white/10"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className="truncate text-xs">{theme.name}</span>
                  </div>

                  {isSelected && (
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="shrink-0 ml-2"
                      style={{ color: theme.primary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ThemeSelectorModal;
