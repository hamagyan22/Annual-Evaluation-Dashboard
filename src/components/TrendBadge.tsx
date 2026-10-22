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
  const isNeutral = Math.abs(diff) < (isTime ? 1 : isCount ? 0.5 : 0.05);
  const isImproved = isLowerBetter ? diff < 0 : diff > 0;

  // Format diff value nicely
  let formattedDiff = "";
  if (isTime) {
    if (isNeutral) {
      formattedDiff = "0s";
    } else {
      const sign = diff > 0 ? "+" : "-";
      const absSec = Math.abs(Math.round(diff));
      formattedDiff = absSec >= 60 
        ? `${sign}${Math.floor(absSec / 60)}m ${absSec % 60}s`
        : `${sign}${absSec}s`;
    }
  } else if (isCount) {
    if (isNeutral) {
      formattedDiff = "0";
    } else {
      const sign = diff > 0 ? "+" : "";
      formattedDiff = `${sign}${Math.round(diff).toLocaleString()}`;
    }
  } else if (isPoints) {
    if (isNeutral) {
      formattedDiff = "0.0 pts";
    } else {
      const sign = diff > 0 ? "+" : "";
      formattedDiff = `${sign}${diff.toFixed(1)} pts`;
    }
  } else {
    const unit = explicitSuffix !== undefined ? explicitSuffix : (explicitIsPercent ? "%" : config.suffix);
    if (isNeutral) {
      formattedDiff = `0.0${unit}`;
    } else {
      const sign = diff > 0 ? "+" : "";
      formattedDiff = `${sign}${diff.toFixed(1)}${unit}`;
    }
  }

  // Modern badge styling (subtle frosted glass pill, crisp icon, clean typography)
  const colorClasses = isNeutral
    ? "bg-slate-500/[0.08] text-slate-600 dark:bg-slate-400/[0.12] dark:text-slate-300 border-slate-300/60 dark:border-slate-700/60"
    : isImproved
    ? "bg-emerald-500/[0.09] text-emerald-700 dark:bg-emerald-400/[0.14] dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-400/30 shadow-[0_1px_2px_rgba(16,185,129,0.06)]"
    : "bg-rose-500/[0.09] text-rose-700 dark:bg-rose-400/[0.14] dark:text-rose-300 border-rose-500/25 dark:border-rose-400/30 shadow-[0_1px_2px_rgba(244,63,94,0.06)]";

  return (
    <span
      title={`${formattedDiff} vs ${prevMonthLabel}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums tracking-tight select-none border transition-all duration-150 ${colorClasses} ${className}`}
    >
      {isNeutral ? (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
      ) : diff > 0 ? (
        <svg
          className="w-2.5 h-2.5 shrink-0 stroke-[2.5]"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8.5V1.5M5 1.5L2 4.5M5 1.5L8 4.5" />
        </svg>
      ) : (
        <svg
          className="w-2.5 h-2.5 shrink-0 stroke-[2.5]"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 1.5V8.5M5 8.5L2 5.5M5 8.5L8 5.5" />
        </svg>
      )}
      <span className="leading-none">{formattedDiff}</span>
      {showVsLabel && (
        <span className="text-[9px] font-medium opacity-75 ml-0.5">vs {prevMonthLabel}</span>
      )}
    </span>
  );
};

export default TrendBadge;
