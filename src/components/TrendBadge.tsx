"use client";

import React from "react";

export interface TrendBadgeProps {
  currentValue: any;
  previousValue: any;
  isTime?: boolean;
  isLowerBetter?: boolean;
  prevMonthLabel?: string;
  className?: string;
  showVsLabel?: boolean;
  suffix?: string;
}

export function isLowerBetterMetric(colId?: string, label?: string): boolean {
  const str = `${colId || ''} ${label || ''}`.toLowerCase();
  return (
    str.includes('aht') ||
    str.includes('art') ||
    str.includes('frt') ||
    str.includes('hold') ||
    str.includes('wrapup') ||
    str.includes('abandoned') ||
    str.includes('transfer') ||
    str.includes('handling') ||
    str.includes('response time')
  );
}

export function parseMetricNumber(v: any, isTime = false): number | null {
  if (v == null || v === "" || v === "-" || v === "—") return null;
  const str = String(v).trim();
  if (isTime) {
    const parts = str.split(":");
    if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    const num = parseFloat(str);
    return isFinite(num) ? num : null;
  }
  const clean = parseFloat(str.replace(/%/g, "").replace(/,/g, "").trim());
  return isFinite(clean) ? clean : null;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  currentValue,
  previousValue,
  isTime = false,
  isLowerBetter = false,
  prevMonthLabel = "last month",
  className = "",
  showVsLabel = false,
  suffix,
}) => {
  const currentNum = parseMetricNumber(currentValue, isTime);
  const prevNum = parseMetricNumber(previousValue, isTime);

  if (currentNum == null || prevNum == null) {
    return null;
  }

  const diff = currentNum - prevNum;

  // Time metrics (seconds)
  if (isTime) {
    if (Math.abs(diff) < 1) {
      return (
        <span
          title={`No change compared to ${prevMonthLabel}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80 select-none shadow-2xs ${className}`}
        >
          <span>•</span>
          <span>0s</span>
          {showVsLabel && <span className="text-[9px] font-medium opacity-70">vs {prevMonthLabel}</span>}
        </span>
      );
    }

    const isImproved = isLowerBetter ? diff < 0 : diff > 0;
    const sign = diff > 0 ? "+" : "-";
    const absSec = Math.abs(Math.round(diff));
    const formattedDiff = absSec >= 60 
      ? `${sign}${Math.floor(absSec / 60)}m ${absSec % 60}s`
      : `${sign}${absSec}s`;

    return (
      <span
        title={`${formattedDiff} compared to ${prevMonthLabel}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight select-none shadow-2xs border ${
          isImproved
            ? "bg-emerald-100/90 dark:bg-emerald-950/70 text-[#1C6B53] dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60"
            : "bg-rose-100/90 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60"
        } ${className}`}
      >
        <span className="text-[9px] leading-none">{diff > 0 ? "▲" : "▼"}</span>
        <span>{formattedDiff}</span>
        {showVsLabel && <span className="text-[9px] font-medium opacity-75">vs {prevMonthLabel}</span>}
      </span>
    );
  }

  // Percentage / numeric metrics
  if (Math.abs(diff) < 0.05) {
    return (
      <span
        title={`No change compared to ${prevMonthLabel}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80 select-none shadow-2xs ${className}`}
      >
        <span>•</span>
        <span>0.0{suffix !== undefined ? suffix : "%"}</span>
        {showVsLabel && <span className="text-[9px] font-medium opacity-70">vs {prevMonthLabel}</span>}
      </span>
    );
  }

  const isImproved = isLowerBetter ? diff < 0 : diff > 0;
  const sign = diff > 0 ? "+" : "";
  const unit = suffix !== undefined ? suffix : "%";
  const diffStr = `${sign}${diff.toFixed(1)}${unit}`;

  return (
    <span
      title={`${diffStr} compared to ${prevMonthLabel}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight select-none shadow-2xs border ${
        isImproved
          ? "bg-emerald-100/90 dark:bg-emerald-950/70 text-[#1C6B53] dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60"
          : "bg-rose-100/90 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60"
      } ${className}`}
    >
      <span className="text-[9px] leading-none">{diff > 0 ? "▲" : "▼"}</span>
      <span>{diffStr}</span>
      {showVsLabel && <span className="text-[9px] font-medium opacity-75">vs {prevMonthLabel}</span>}
    </span>
  );
};

export default TrendBadge;
