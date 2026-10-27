"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  size?: "sm" | "md" | "lg";
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
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpwards: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUpwards: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setCoords({
      top: openUpwards ? rect.top - 6 : rect.bottom + 6,
      left: align === "right" ? rect.right : rect.left,
      width: rect.width,
      openUpwards,
    });
  }, [align]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updatePosition]);

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
      size === "lg"
        ? "h-10 px-4 text-sm font-black gap-2.5 rounded-xl"
        : size === "sm"
        ? "px-2.5 py-1 text-xs font-bold gap-1.5 rounded-lg"
        : "px-3 py-1.5 text-xs font-black gap-2 rounded-xl";

    switch (variant) {
      case "solid-green":
      case "theme":
        return `${sizeClasses} bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white shadow-xs border border-white/20`;
      case "tinted-green":
        return `${sizeClasses} bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs`;
      case "gray":
        return `${sizeClasses} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs`;
      case "white":
      default:
        return `${sizeClasses} bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-xs`;
    }
  };

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`flex items-center justify-between transition-all cursor-pointer select-none active:scale-95 ${getButtonStyles()}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          size={size === "lg" ? 15 : size === "sm" ? 11 : 13}
          className={`transition-transform duration-200 shrink-0 ${
            variant === "solid-green" || variant === "theme"
              ? "text-white/80"
              : "text-gray-400 dark:text-gray-400"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <>
          {/* Backdrop to catch clicks outside */}
          <div
            className="fixed inset-0 z-[99998] cursor-default bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Portal dropdown floating container */}
          <div
            role="listbox"
            style={{
              position: "fixed",
              top: coords.openUpwards ? undefined : `${coords.top}px`,
              bottom: coords.openUpwards ? `${Math.max(8, window.innerHeight - coords.top)}px` : undefined,
              left: align === "right" ? undefined : `${coords.left}px`,
              right: align === "right" ? `${Math.max(8, window.innerWidth - coords.left)}px` : undefined,
              minWidth: Math.max(120, coords.width),
            }}
            className="z-[99999] max-w-xs py-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5"
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
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white font-black"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {OptIcon && (
                        <OptIcon
                          size={13}
                          className={isSelected ? "text-gray-900 dark:text-white" : "text-gray-400"}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="text-gray-900 dark:text-white shrink-0 ml-2"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default ModernDropdown;
