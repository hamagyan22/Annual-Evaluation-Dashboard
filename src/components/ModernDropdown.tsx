"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label?: string;
  icon?: React.ComponentType<any>;
}

export interface ModernDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  variant?: "solid-green" | "tinted-green" | "white" | "gray" | "theme";
  size?: "sm" | "md";
  align?: "left" | "right";
  className?: string;
  ariaLabel?: string;
}

export const ModernDropdown: React.FC<ModernDropdownProps> = ({
  value,
  onChange,
  options,
  variant = "solid-green",
  size = "md",
  align = "left",
  className = "",
  ariaLabel = "Select option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : { ...opt, label: opt.label || opt.value }
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value,
    label: value,
  };

  // Button styles based on variant
  const getButtonStyles = () => {
    const sizeClasses =
      size === "sm"
        ? "px-2.5 py-1 text-xs font-bold gap-1.5 rounded-lg"
        : "px-3 py-1.5 text-xs font-black gap-2 rounded-xl";

    switch (variant) {
      case "solid-green":
      case "theme":
        return `${sizeClasses} bg-[#1C6B53] hover:bg-[#155a45] text-white shadow-xs border border-emerald-600/40`;
      case "tinted-green":
        return `${sizeClasses} bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/70 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs`;
      case "gray":
        return `${sizeClasses} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs`;
      case "white":
      default:
        return `${sizeClasses} bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-xs`;
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`flex items-center justify-between transition-all cursor-pointer select-none active:scale-95 ${getButtonStyles()}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          size={size === "sm" ? 11 : 13}
          className={`transition-transform duration-200 shrink-0 ${
            variant === "solid-green" || variant === "theme"
              ? "text-white/80"
              : "text-gray-400 dark:text-gray-400"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 z-50 min-w-[120px] max-w-xs py-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5 overscroll-contain">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              const OptIcon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-bold transition-colors cursor-pointer select-none text-left ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-black"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {OptIcon && (
                      <OptIcon
                        size={13}
                        className={isSelected ? "text-[#1C6B53] dark:text-emerald-400" : "text-gray-400"}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check
                      size={13}
                      strokeWidth={2.5}
                      className="text-[#1C6B53] dark:text-emerald-400 shrink-0 ml-2"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDropdown;
