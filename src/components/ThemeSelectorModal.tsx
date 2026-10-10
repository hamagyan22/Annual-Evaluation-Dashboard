"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, X, Sparkles } from "lucide-react";
import { useAppTheme, THEMES } from "@/lib/themeManager";

interface ThemeSelectorModalProps {
  className?: string;
  buttonVariant?: "icon" | "pill";
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  className = "",
  buttonVariant = "icon",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { themeId, setTheme } = useAppTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {buttonVariant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer ${className}`}
          title="Color Theme & Appearance / المظهر والسمات"
          aria-label="Change Color Theme"
        >
          <Palette size={15} className="hover:scale-110 transition-transform" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 transition cursor-pointer shadow-2xs ${className}`}
          title="Color Theme & Appearance / المظهر والسمات"
        >
          <Palette size={14} />
          <span>Themes</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div
            ref={modalRef}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-5 sm:p-6 z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150 ring-1 ring-black/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 text-[#1C6B53] dark:text-emerald-300 flex items-center justify-center shadow-xs shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Appearance & Themes</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Classy
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    Select your preferred modern dashboard color palette
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Themes Grid */}
            <div className="overflow-y-auto py-4 space-y-2.5 max-h-[60vh] pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = theme.id === themeId;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setTheme(theme.id)}
                      className={`relative flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer border-2 group ${
                        isSelected
                          ? "bg-gray-50 dark:bg-gray-800/90 shadow-md ring-2"
                          : "bg-white dark:bg-gray-900/60 hover:bg-gray-50/80 dark:hover:bg-gray-850 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                      style={{
                        borderColor: isSelected ? theme.primary : undefined,
                        boxShadow: isSelected ? `0 4px 14px ${theme.glow}` : undefined,
                      }}
                    >
                      {/* Top Bar Preview */}
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full shadow-xs border border-white dark:border-gray-800 shrink-0"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full shadow-xs border border-white dark:border-gray-800 shrink-0 opacity-80"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>

                        {isSelected ? (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-xs"
                            style={{ backgroundColor: theme.primary }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 font-bold opacity-0 group-hover:opacity-100 transition">
                            Apply
                          </span>
                        )}
                      </div>

                      {/* Theme Name & Details */}
                      <div>
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="font-black text-sm text-gray-900 dark:text-white">
                            {theme.name}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 font-arabic">
                            {theme.nameAr}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium leading-snug">
                          {theme.subtitle}
                        </p>
                      </div>

                      {/* Mini Gradient Strip Preview */}
                      <div
                        className="w-full h-1.5 rounded-full mt-3 shadow-2xs"
                        style={{ background: theme.gradientStyle }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                <span>Persistent across all dashboards</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeSelectorModal;
