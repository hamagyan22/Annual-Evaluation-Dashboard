"use client";

import React from "react";

export interface TrendBadgeProps {
  currentValue: any;
  previousValue: any;
  colId?: string;
  label?: string;
  isTime?: boolean;
  isLowerBetter?: boolean;
  isCount?: boolean;
  isPercent?: boolean;
  prevMonthLabel?: string;
  className?: string;
  showVsLabel?: boolean;
  suffix?: string;
}

export type MetricCategory = "time" | "count" | "percent" | "points" | "rate";

/**
 * Intelligent categorization of contact center metrics
 * based on user instructions:
 * - Counts: Chat Handled, Call Handled, Handled, Inbound, Outbound (higher is better)
 * - Inverted Counts: Wrapup, RONA, Missed, Abandoned (lower is better)
 * - Inverted Time: AHT, ART, Hold, FRT (lower is better)
 * - Percentages: Quality, Exam, Adherence, CSAT (higher is better)
 * - Points: Top Star scores (higher is better)
 */
export function getMetricCategory(colId?: string, label?: string, sampleVal?: any): {
  category: MetricCategory;
  isLowerBetter: boolean;
  suffix: string;
} {
  const str = `${colId || ""} ${label || ""}`.toLowerCase().trim();
  const valStr = String(sampleVal ?? "").trim();

  // 1. Explicit Time metrics or values with ":" (mm:ss)
  if (
    str.includes("aht") ||
    str.includes("art") ||
    str.includes("frt") ||
    str.includes("hold") ||
    str.includes("handling") ||
    str.includes("response time") ||
    valStr.includes(":")
  ) {
    return { category: "time", isLowerBetter: true, suffix: "s" };
  }

  // 2. Inverted Count metrics (lower count is better)
  if (
    str.includes("wrapup") ||
    str.includes("wrap_up") ||
    str.includes("acw") ||
    str.includes("rona") ||
    str.includes("missed") ||
    str.includes("abandoned") ||
    str.includes("transfer")
  ) {
    const isTimeVal = valStr.includes(":");
    return {
      category: isTimeVal ? "time" : "count",
      isLowerBetter: true,
      suffix: isTimeVal ? "s" : "",
    };
  }

  // 3. Positive Count metrics (higher count is better) - NOT percentage
  if (
    str.includes("handled") ||
    str.includes("inbound") ||
    str.includes("outbound") ||
    str.includes("call_handled") ||
    str.includes("chat_handled") ||
    str.includes("calls") ||
    str.includes("chats") ||
    str.includes("tickets") ||
    str === "call" ||
    str === "chat"
  ) {
    return { category: "count", isLowerBetter: false, suffix: "" };
  }

  // 4. Points (Top Star leaderboard, scorecard)
  if (str.includes("pts") || str.includes("point") || str.includes("score")) {
    return { category: "points", isLowerBetter: false, suffix: " pts" };
  }

  // 5. Productivity (either % or per hour rate)
  if (str.includes("prod")) {
    if (valStr.includes("%")) {
      return { category: "percent", isLowerBetter: false, suffix: "%" };
    }
    return { category: "rate", isLowerBetter: false, suffix: "" };
  }

  // 6. Default percentage metrics (Quality, Exam, etc.)
  return { category: "percent", isLowerBetter: false, suffix: "%" };
}

export function isLowerBetterMetric(colId?: string, label?: string): boolean {
  return getMetricCategory(colId, label).isLowerBetter;
}

export function parseMetricNumber(v: any, isTime = false): number | null {
  if (v == null || v === "" || v === "-" || v === "—" || v === "V" || v === "N/A") return null;
  const str = String(v).trim();
  if (isTime || str.includes(":")) {
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
  colId,
  label,
  isTime: explicitIsTime,
  isLowerBetter: explicitIsLowerBetter,
  isCount: explicitIsCount,
  isPercent: explicitIsPercent,
  prevMonthLabel = "previous period",
  className = "",
  showVsLabel = false,
  suffix: explicitSuffix,
}) => {
  // Infer category configuration automatically or respect explicit props
  const config = getMetricCategory(colId, label, currentValue);
  const isTime = explicitIsTime ?? (config.category === "time");
  const isCount = explicitIsCount ?? (config.category === "count");
  const isPoints = config.category === "points" || explicitSuffix?.includes("pts");
  const isLowerBetter = explicitIsLowerBetter ?? config.isLowerBetter;

  const currentNum = parseMetricNumber(currentValue, isTime);
  const prevNum = parseMetricNumber(previousValue, isTime);

  if (currentNum == null || prevNum == null) {
    return null;
  }

  const diff = currentNum - prevNum;

  // 1. Time Metric (AHT, ART, Hold, Wrapup in mm:ss)
  if (isTime) {
    if (Math.abs(diff) < 1) {
      return (
        <span
          title={`No change vs ${prevMonthLabel}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80 select-none shadow-2xs ${className}`}
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
        title={`${formattedDiff} vs ${prevMonthLabel}`}
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight select-none shadow-2xs border ${
          isImproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60"
            : "bg-rose-50 text-rose-700 border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60"
        } ${className}`}
      >
        <svg className="w-2.5 h-2.5 shrink-0 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {diff > 0 ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          )}
        </svg>
        <span>{formattedDiff}</span>
        {showVsLabel && <span className="text-[9px] font-medium opacity-75">vs {prevMonthLabel}</span>}
      </span>
    );
  }

  // 2. Count / Integer Metric (Chat Handled, Call Handled, Inbound, Outbound, Wrapup count, RONA)
  if (isCount) {
    if (Math.abs(diff) < 0.5) {
      return (
        <span
          title={`No change vs ${prevMonthLabel}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80 select-none shadow-2xs ${className}`}
        >
          <span>•</span>
          <span>0</span>
          {showVsLabel && <span className="text-[9px] font-medium opacity-70">vs {prevMonthLabel}</span>}
        </span>
      );
    }

    const isImproved = isLowerBetter ? diff < 0 : diff > 0;
    const sign = diff > 0 ? "+" : "";
    const intDiff = Math.round(diff);
    const formattedDiff = `${sign}${intDiff.toLocaleString()}`;

    return (
      <span
        title={`${formattedDiff} vs ${prevMonthLabel}`}
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight select-none shadow-2xs border ${
          isImproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60"
            : "bg-rose-50 text-rose-700 border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60"
        } ${className}`}
      >
        <svg className="w-2.5 h-2.5 shrink-0 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {diff > 0 ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          )}
        </svg>
        <span>{formattedDiff}</span>
        {showVsLabel && <span className="text-[9px] font-medium opacity-75">vs {prevMonthLabel}</span>}
      </span>
    );
  }

  // 3. Points Metric (Top Star score)
  if (isPoints) {
    if (Math.abs(diff) < 0.05) {
      return (
        <span
          title={`No change vs ${prevMonthLabel}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80 select-none shadow-2xs ${className}`}
        >
          <span>•</span>
          <span>0.0 pts</span>
          {showVsLabel && <span className="text-[9px] font-medium opacity-70">vs {prevMonthLabel}</span>}
        </span>
      );
    }

    const isImproved = isLowerBetter ? diff < 0 : diff > 0;
    const sign = diff > 0 ? "+" : "";
    const diffStr = `${sign}${diff.toFixed(1)} pts`;

    return (
      <span
        title={`${diffStr} vs ${prevMonthLabel}`}
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight select-none shadow-2xs border ${
          isImproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60"
            : "bg-rose-50 text-rose-700 border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60"
        } ${className}`}
      >
        <svg className="w-2.5 h-2.5 shrink-0 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {diff > 0 ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          )}
        </svg>
        <span>{diffStr}</span>
        {showVsLabel && <span className="text-[9px] font-medium opacity-75">vs {prevMonthLabel}</span>}
      </span>
    );
  }

  // 4. Default Percentage & Rate Metrics (Quality, Exam, Productivity, CSAT)
  const unit = explicitSuffix !== undefined ? explicitSuffix : (explicitIsPercent ? "%" : config.suffix);

  if (Math.abs(diff) < 0.05) {
    return (
      <span
        title={`No change vs ${prevMonthLabel}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80 select-none shadow-2xs ${className}`}
      >
        <span>•</span>
        <span>0.0{unit}</span>
        {showVsLabel && <span className="text-[9px] font-medium opacity-70">vs {prevMonthLabel}</span>}
      </span>
    );
  }

  const isImproved = isLowerBetter ? diff < 0 : diff > 0;
  const sign = diff > 0 ? "+" : "";
  const diffStr = `${sign}${diff.toFixed(1)}${unit}`;

  return (
    <span
      title={`${diffStr} vs ${prevMonthLabel}`}
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-black font-mono tracking-tight select-none shadow-2xs border ${
        isImproved
          ? "bg-emerald-50 text-emerald-700 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60"
          : "bg-rose-50 text-rose-700 border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60"
      } ${className}`}
    >
      <svg className="w-2.5 h-2.5 shrink-0 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {diff > 0 ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        )}
      </svg>
      <span>{diffStr}</span>
      {showVsLabel && <span className="text-[9px] font-medium opacity-75">vs {prevMonthLabel}</span>}
    </span>
  );
};

export default TrendBadge;
