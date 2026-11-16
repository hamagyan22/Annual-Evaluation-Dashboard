"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label?: string;
  icon?: React.ComponentType<any>;
  subtitle?: string;
}

export interface ModernDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  variant?: "solid-green" | "tinted-green" | "white" | "gray" | "theme" | "input";
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
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
  fullWidth = false,
  disabled = false,
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
    const dropdownHeight = 260;
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
  const SelectedIcon = selectedOption.icon;

  // Button styles based on variant
  const getButtonStyles = () => {
    const sizeClasses =
      size === "lg"
        ? "h-11 px-4 text-sm font-black gap-2.5 rounded-xl sm:rounded-2xl"
        : size === "sm"
        ? "h-9 px-3 text-xs font-bold gap-1.5 rounded-xl"
        : "h-10 px-3.5 text-[13px] font-bold gap-2 rounded-xl sm:rounded-2xl";

    const widthClass = fullWidth ? "w-full" : "";

    switch (variant) {
      case "input":
        return `${sizeClasses} ${widthClass} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs focus:ring-2 focus:ring-emerald-500/20 font-medium`;
      case "solid-green":
      case "theme":
        return `${sizeClasses} ${widthClass} bg-[var(--brand-primary,#10664F)] hover:opacity-95 text-white shadow-xs border border-white/20 font-bold`;
      case "tinted-green":
        return `${sizeClasses} ${widthClass} bg-emerald-50/90 hover:bg-emerald-100/90 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 shadow-xs font-bold`;
      case "gray":
      case "white":
      default:
        return `${sizeClasses} ${widthClass} bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200/90 dark:border-gray-700 shadow-xs font-bold`;
    }
  };

  return (
    <div className={`relative ${fullWidth ? "w-full" : "inline-block"} text-left shrink-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0 pr-1">
          {SelectedIcon && (
            <SelectedIcon
              size={size === "lg" ? 15 : size === "sm" ? 12 : 13}
              className={`shrink-0 ${
                variant === "solid-green" || variant === "theme"
                  ? "text-white/80"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />
          )}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          size={size === "lg" ? 15 : size === "sm" ? 11 : 13}
          className={`transition-transform duration-200 shrink-0 ml-1.5 ${
            variant === "solid-green" || variant === "theme"
              ? "text-white/80"
              : "text-gray-400 dark:text-gray-400"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <>
          {/* Backdrop to catch clicks outside and lock wheel pass-through */}
          <div
            className="fixed inset-0 z-[99998] cursor-default bg-black/5"
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
              width: fullWidth ? `${Math.max(coords.width, 220)}px` : undefined,
              minWidth: Math.max(160, coords.width),
              maxWidth: "min(92vw, 420px)",
            }}
            className="z-[99999] p-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5"
          >
            <div className="max-h-64 overflow-y-auto p-0.5 space-y-1 overscroll-contain">
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
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer select-none text-left ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-black border border-emerald-200/60 dark:border-emerald-800/60"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-950 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {OptIcon && (
                        <OptIcon
                          size={13}
                          className={isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400"}
                        />
                      )}
                      <div className="flex flex-col truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.subtitle && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2"
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
