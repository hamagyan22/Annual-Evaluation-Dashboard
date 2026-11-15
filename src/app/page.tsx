"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { auth, db, getSystemAuthor } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, updateDoc, addDoc, deleteDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { Search, Trash2, UserPlus, UserMinus, Users, Moon, Sun, LogOut, Settings, Plus, X, Edit2, Briefcase, Columns, ChevronDown, Save, ShieldCheck, Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, LayoutDashboard, Sparkles, Check, Calendar, Award, CheckCircle2, TrendingUp, Clock, PhoneOff, Activity, PhoneCall, PhoneMissed, Timer, PhoneIncoming, PhoneOutgoing, Copy, Smartphone, Download, Share2, MessageSquare, Star, Trophy, Medal, BarChart3, ClipboardCheck, RefreshCw, RotateCcw, AlertCircle } from "lucide-react";
import { fetchTopStarData, fetchTopStarCriteria, normalizeName, formatToMinutesAndSeconds, getTopStarMotivationalQuote, invalidateTopStarCache } from "@/lib/topStarUtils";
import { DEFAULT_COMPANY_EMPLOYEES, isMemberActiveInPeriod, getNextMonthAndYear, getCurrentEffectiveMonth } from "@/lib/companyRoster";
import { BASELINE_TEAM_METRICS } from "@/lib/baselineTeamMetrics";
import { getCanonicalAgentName, getCanonicalAgent, getCanonicalSlug, getAllAgentSlugs, isSameAgent } from "@/lib/canonicalAgents";
import { ModernDropdown } from "@/components/ModernDropdown";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import { useAppTheme, applyThemeToDocument, getCurrentThemeId } from "@/lib/themeManager";
import { TrendBadge, isLowerBetterMetric } from "@/components/TrendBadge";
import { UnifiedTopNavbar, ActiveDashboardType } from "@/components/UnifiedTopNavbar";
import { useBodyScrollLock, initGlobalModalScrollLock } from "@/lib/scrollLock";
import { QualitySessionModal } from "@/components/QualitySessionModal";

type TeamName = 'Younis Kamal Team' | 'Ankido Buya Team' | 'Mohammed Dlshad Team';
const TEAMS: TeamName[] = ['Younis Kamal Team', 'Ankido Buya Team', 'Mohammed Dlshad Team'];

type ColumnConfig = {
  id: string;
  label: string;
  type: 'time' | 'number';
  aggregation: 'sum' | 'average';
};

const DEFAULT_CHAT_COLUMNS: ColumnConfig[] = [
  { id: 'chat_handled', label: 'Chat Handled', type: 'number', aggregation: 'sum' },
  { id: 'exam', label: 'EXAM', type: 'number', aggregation: 'average' },
  { id: 'quality', label: 'QUALITY', type: 'number', aggregation: 'average' },
  { id: 'aht', label: 'AHT', type: 'time', aggregation: 'average' },
  { id: 'art', label: 'ART', type: 'time', aggregation: 'average' },
  { id: 'productivity', label: 'Productivity', type: 'number', aggregation: 'average' },
  { id: 'call_handled', label: 'Call Handled', type: 'number', aggregation: 'sum' },
];

const DEFAULT_CHAT_COLUMNS_HISTORICAL: ColumnConfig[] = [
  { id: 'chat_handled', label: 'Chat Handled', type: 'number', aggregation: 'sum' },
  { id: 'exam', label: 'EXAM', type: 'number', aggregation: 'average' },
  { id: 'quality', label: 'QUALITY', type: 'number', aggregation: 'average' },
  { id: 'aht', label: 'AHT', type: 'time', aggregation: 'average' },
  { id: 'art', label: 'ART', type: 'time', aggregation: 'average' },
  { id: 'productivity', label: 'Productivity', type: 'number', aggregation: 'average' },
  { id: 'inbound', label: 'INBOUND', type: 'number', aggregation: 'sum' },
  { id: 'outbound', label: 'OUTBOUND', type: 'number', aggregation: 'sum' },
];

const DEFAULT_OTHER_COLUMNS: ColumnConfig[] = [
  { id: 'quality', label: 'Quality', type: 'number', aggregation: 'average' },
  { id: 'exam', label: 'Exam', type: 'number', aggregation: 'average' },
  { id: 'productivity', label: 'Productivity', type: 'number', aggregation: 'average' },
  { id: 'aht', label: 'AHT', type: 'time', aggregation: 'average' },
  { id: 'hold', label: 'Hold', type: 'time', aggregation: 'average' },
  { id: 'wrapup', label: 'Wrapup', type: 'number', aggregation: 'average' },
  { id: 'handled', label: 'Handled', type: 'number', aggregation: 'sum' },
  { id: 'abandoned', label: 'Abandoned', type: 'number', aggregation: 'sum' },
];

const DEFAULT_COLUMNS_MAP: Record<string, ColumnConfig[]> = {
  'Mohammed Dlshad Team': DEFAULT_CHAT_COLUMNS,
  'Younis Kamal Team': DEFAULT_OTHER_COLUMNS,
  'Ankido Buya Team': DEFAULT_OTHER_COLUMNS,
};

const DESIRED_COLUMN_ORDER = ['chat_handled', 'exam', 'quality', 'productivity', 'aht', 'art', 'hold', 'wrapup', 'handled', 'call_handled', 'inbound', 'outbound', 'abandoned'];

function sortColumnsByOrder(cols: ColumnConfig[]) {
  if (!cols) return [];
  return [...cols].sort((a, b) => {
    const idxA = DESIRED_COLUMN_ORDER.indexOf(a.id);
    const idxB = DESIRED_COLUMN_ORDER.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });
}

function cleanColLabel(colId: string, rawLabel?: string): string {
  const id = (colId || '').toLowerCase().trim();
  const lbl = (rawLabel || '').trim();
  if (id === 'quality' || lbl.toLowerCase() === 'quality %') return 'Quality';
  if (id === 'exam' || lbl.toLowerCase() === 'exam %') return 'Exam';
  if (id === 'productivity' || lbl.toLowerCase().includes('prod')) return 'Productivity';
  if (id === 'aht' || lbl.toLowerCase().includes('aht s') || lbl.toLowerCase() === 'aht') return 'AHT';
  if (id === 'art' || lbl.toLowerCase().includes('art s') || lbl.toLowerCase() === 'art') return 'ART';
  if (id === 'hold' || lbl.toLowerCase().includes('hold s') || lbl.toLowerCase() === 'hold') return 'Hold';
  if (id === 'wrapup' || lbl.toLowerCase().includes('wrapup')) return 'Wrapup';
  if (id === 'handled' || lbl.toLowerCase() === 'handled') return 'Handled';
  if (id === 'abandoned' || lbl.toLowerCase() === 'abandoned') return 'Abandoned';
  if (id === 'call_handled' || lbl.toLowerCase() === 'call handled') return 'Call Handled';
  if (id === 'chat_handled' || lbl.toLowerCase() === 'chat handled') return 'Chat Handled';
  let res = lbl || colId;
  if (res.endsWith(' %')) res = res.slice(0, -2).trim();
  if (res.endsWith(' S')) res = res.slice(0, -2).trim();
  return res;
}

function sanitizeCols(cols: ColumnConfig[]): ColumnConfig[] {
  if (!cols) return [];
  return cols.map(c => {
    const label = cleanColLabel(c.id, c.label);
    if (c.id === 'wrapup' || c.id?.toLowerCase().includes('wrapup') || label.toLowerCase().includes('wrapup')) {
      return { ...c, label, type: 'number' as const, aggregation: c.aggregation || 'average' };
    }
    return { ...c, label };
  });
}

function isFromMayOnwards(year: string | number, month: string): boolean {
  const y = parseInt(String(year)) || 2026;
  if (y > 2026) return true;
  if (y < 2026) return false;
  const m = (month || "").toUpperCase().trim();
  const AFTER_OR_IN_MAY = [
    'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    'Q2', 'Q3', 'Q4', 'H1', 'H2', 'YEAR - AVG',
    'Q2 - AVG', 'Q3 - AVG', 'Q4 - AVG', 'H1 - AVG', 'H2 - AVG'
  ];
  return AFTER_OR_IN_MAY.includes(m);
}

function getEffectiveColumns(
  team: string,
  month: string,
  year: string,
  baseCols?: ColumnConfig[]
): ColumnConfig[] {
  if (team !== 'Mohammed Dlshad Team') {
    return sanitizeCols(baseCols && baseCols.length > 0 ? baseCols : DEFAULT_OTHER_COLUMNS);
  }
  const isMayPlus = isFromMayOnwards(year, month);
  const srcCols = sanitizeCols(baseCols && baseCols.length > 0 ? baseCols : (isMayPlus ? DEFAULT_CHAT_COLUMNS : DEFAULT_CHAT_COLUMNS_HISTORICAL));

  // Chat Handled goes right before Exam for all months
  const existingChatHandled = srcCols.find(c => c.id === 'chat_handled');
  const chatHandledCol: ColumnConfig = existingChatHandled || {
    id: 'chat_handled',
    label: 'Chat Handled',
    type: 'number',
    aggregation: 'sum'
  };

  if (isMayPlus) {
    const filtered = srcCols.filter(c => c.id !== 'inbound' && c.id !== 'outbound' && c.id !== 'call_handled' && c.id !== 'chat_handled');
    const existingCallHandled = srcCols.find(c => c.id === 'call_handled');
    const callHandledCol: ColumnConfig = existingCallHandled || {
      id: 'call_handled',
      label: 'Call Handled',
      type: 'number',
      aggregation: 'sum'
    };
    return [chatHandledCol, ...filtered, callHandledCol];
  } else {
    const filtered = srcCols.filter(c => c.id !== 'call_handled' && c.id !== 'inbound' && c.id !== 'outbound' && c.id !== 'chat_handled');
    const existingInbound = srcCols.find(c => c.id === 'inbound') || {
      id: 'inbound',
      label: 'INBOUND',
      type: 'number',
      aggregation: 'sum'
    };
    const existingOutbound = srcCols.find(c => c.id === 'outbound') || {
      id: 'outbound',
      label: 'OUTBOUND',
      type: 'number',
      aggregation: 'sum'
    };
    return [chatHandledCol, ...filtered, existingInbound, existingOutbound];
  }
}

function getRowValForCol(r: any, colId: string): string {
  if (!r) return "";
  if (r[colId] !== undefined && r[colId] !== null && String(r[colId]).trim() !== "") {
    return String(r[colId]).trim();
  }
  if (colId === 'call_handled' || colId === 'handled') {
    const hasIn = r.inbound !== undefined && r.inbound !== null && String(r.inbound).trim() !== "";
    const hasOut = r.outbound !== undefined && r.outbound !== null && String(r.outbound).trim() !== "";
    if (hasIn || hasOut) {
      const sum = (parseFloat(r.inbound) || 0) + (parseFloat(r.outbound) || 0);
      return sum.toString();
    }
  }
  return "";
}


import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Camera } from "lucide-react";
import dynamic from "next/dynamic";
import { compressImageFile } from "@/lib/imageUtils";
import { BASELINE_QUALITY_EVALUATIONS, getQualityEvalDoc, mergeQualityDocs, expandQualityDocAliases } from "@/lib/baselineQualityData";

const QualityDashboard = dynamic(() => import("@/components/QualityDashboard"), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Quality Dashboard...</p>
    </div>
  ),
  ssr: false,
});

const TopStarDashboard = dynamic(() => import("@/components/TopStarDashboard"), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Top Star Leaderboard...</p>
    </div>
  ),
  ssr: false,
});

const AnnualEvaluationDashboard = dynamic(() => import("@/components/AnnualEvaluationDashboard"), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="w-10 h-10 border-3 border-[#1C6B53] border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Annual Evaluation Dashboard...</p>
    </div>
  ),
  ssr: false,
});

function toTitleCase(str: string) {
  if (!str) return '';
  const upper = str.toUpperCase().trim();
  if (upper === 'ART') return 'ART';
  if (upper === 'AHT') return 'AHT';
  return str.replace(/\w\S*/g, (txt) => {
    const u = txt.toUpperCase();
    if (u === 'ART') return 'ART';
    if (u === 'AHT') return 'AHT';
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

function validatePasswordSecurity(password: string): { isValid: boolean; error: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must include at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must include at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password) && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: "Password must include at least one number or special symbol." };
  }
  const lower = password.toLowerCase();
  if (lower === 'password123' || lower === 'password' || lower === '12345678') {
    return { isValid: false, error: "This password is too common or matches the initial default password. Please choose a unique password." };
  }
  return { isValid: true, error: "" };
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const AGGREGATE_MAP: Record<string, string[]> = {
  "Q1": ["JAN", "FEB", "MAR"],
  "Q2": ["APR", "MAY", "JUN"],
  "Q3": ["JUL", "AUG", "SEP"],
  "Q4": ["OCT", "NOV", "DEC"],
  "H1": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
  "H2": ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  "Q1 - AVG": ["JAN", "FEB", "MAR"],
  "Q2 - AVG": ["APR", "MAY", "JUN"],
  "Q3 - AVG": ["JUL", "AUG", "SEP"],
  "Q4 - AVG": ["OCT", "NOV", "DEC"],
  "H1 - AVG": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
  "H2 - AVG": ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  "YEAR - AVG": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
};


// Maps a month abbreviation to its quarter and week range within that quarter
// Each quarter has 3 months each spanning 4 weeks (month1→w1-4, month2→w5-8, month3→w9-12)
function getQualityWeekRange(month: string): { quarter: string; weekStart: number; weekEnd: number } | null {
  const idx = MONTHS.indexOf(month.toUpperCase());
  if (idx === -1) return null;
  const qIdx = Math.floor(idx / 3); // 0=Q1, 1=Q2, 2=Q3, 3=Q4
  const quarter = ["Q1","Q2","Q3","Q4"][qIdx];
  const monthInQ = idx % 3; // 0,1,2
  const weekStart = monthInQ * 4 + 1;
  const weekEnd = monthInQ === 2 ? 12 : monthInQ * 4 + 4;
  return { quarter, weekStart, weekEnd };
}

// Maps a team name to its QA evaluator section slug in quality_evaluations
function getQaSectionSlug(team: string): string {
  if (team === 'Mohammed Dlshad Team') return 'mohammed_dlshad';
  if (team === 'Ankido Buya Team') return 'lara_kamil';
  return 'mohammed_jihad';
}

// Quality Dashboard auto-sync is enabled starting from September 2026 (Month 9) onwards.
// Months prior to September 2026 (JAN–AUG 2026) retain manually entered quality scores.
function isQualitySyncEnabled(year: string, month: string): boolean {
  const y = parseInt(String(year), 10);
  if (isNaN(y) || y < 2026) return false;
  if (y > 2026) return true;
  const idx = MONTHS.indexOf((month || "").toUpperCase());
  return idx >= 8; // 8 = SEP (Month 9), 9 = OCT, 10 = NOV, 11 = DEC
}

// Checks if all active weeks for a given month (from the agent's first active week through weekEnd) have been fully evaluated, and computes the verified quality average
function computeVerifiedMonthlyQuality(
  scores: Record<string, string>,
  wr: { quarter: string; weekStart: number; weekEnd: number },
  isChatT: boolean,
  selectedYear: string
): { isComplete: boolean; qualityAvg: string } {
  if (!scores || Object.keys(scores).length === 0) {
    return { isComplete: false, qualityAvg: "" };
  }

  const yNum = parseInt(String(selectedYear), 10);
  const isNewSchema = yNum > 2026 || (yNum === 2026 && wr.quarter === "Q4");

  const evalWeek = (w: number) => {
    let colCount = 6;
    let hasOutbound = true;
    let callBase = 0;

    if (isChatT) {
      if (isNewSchema) {
        colCount = 8;
        hasOutbound = false;
      } else if (yNum === 2026 && wr.quarter === "Q3" && w >= 10) {
        colCount = 7;
        hasOutbound = false;
      } else {
        colCount = 6;
        hasOutbound = true;
      }
    } else {
      colCount = isNewSchema ? 7 : 6;
      hasOutbound = true;
      callBase = (w - 1) * colCount;
    }

    let inboundFilled = 0;
    let inboundV = 0;
    let sumW = 0;
    let cntW = 0;
    let hasV = false;

    for (let c = 1; c <= colCount; c++) {
      const key = isChatT ? `w${w}_chat_${c}` : `w${w}_call_${callBase + c}`;
      const rawVal = scores[key] ?? (isChatT ? (scores[`w${w}_call_${c}`] ?? scores[`w${w}_call_${callBase + c}`]) : scores[`w${w}_call_${c}`]);
      const s = String(rawVal ?? "").trim();
      if (s !== "" && s !== "-") {
        inboundFilled++;
        const upper = s.toUpperCase();
        if (upper === "V") {
          inboundV++;
          hasV = true;
        } else if (upper !== "S" && !upper.includes("N/A") && upper !== "NA") {
          const num = parseFloat(s);
          if (!isNaN(num)) {
            sumW += num;
            cntW++;
          }
        }
      }
    }

    const outRaw = scores[`w${w}_outbound`];
    const outStr = String(outRaw ?? "").trim();
    if (hasOutbound && outStr !== "" && outStr !== "-") {
      const upper = outStr.toUpperCase();
      if (upper === "V") {
        hasV = true;
      } else if (upper !== "S" && !upper.includes("N/A") && upper !== "NA") {
        const num = parseFloat(outStr);
        if (!isNaN(num)) {
          sumW += num;
          cntW++;
        }
      }
    }

    const outboundFilled = !hasOutbound || (outStr !== "" && outStr !== "-");
    const hasAnyEntry = inboundFilled > 0 || (hasOutbound && outStr !== "" && outStr !== "-");
    const isWeekVacation = inboundV > 0 && inboundV === inboundFilled && (!hasOutbound || outStr === "" || outStr.toUpperCase() === "V");
    const isWeekComplete = (inboundFilled === colCount && outboundFilled) || isWeekVacation;

    return { hasAnyEntry, isWeekComplete, sumW, cntW, hasV };
  };

  let firstActiveW = -1;
  for (let w = wr.weekStart; w <= wr.weekEnd; w++) {
    if (evalWeek(w).hasAnyEntry) {
      firstActiveW = w;
      break;
    }
  }

  if (firstActiveW === -1) {
    return { isComplete: false, qualityAvg: "" };
  }

  let allActiveWeeksFilled = true;
  let sumQ = 0;
  let cntQ = 0;
  let hasAnyV = false;

  for (let w = firstActiveW; w <= wr.weekEnd; w++) {
    const st = evalWeek(w);
    if (!st.isWeekComplete) {
      allActiveWeeksFilled = false;
      break;
    }
    sumQ += st.sumW;
    cntQ += st.cntW;
    if (st.hasV) hasAnyV = true;
  }

  if (!allActiveWeeksFilled) {
    return { isComplete: false, qualityAvg: "" };
  }

  let qualityAvg = "";
  if (cntQ > 0) {
    qualityAvg = (sumQ / cntQ).toFixed(1);
  } else if (hasAnyV) {
    qualityAvg = "V";
  }

  return { isComplete: true, qualityAvg };
}

const getPreviousMonthAndYear = () => {
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    month: MONTHS[prevDate.getMonth()],
    year: prevDate.getFullYear().toString(),
  };
};

const KPI_META: Record<string, { icon: any; color: string; bgLight: string; bgDark: string; border: string; label: string }> = {
  quality: { 
    icon: Award, 
    color: 'text-emerald-500 dark:text-emerald-500', 
    bgLight: 'bg-emerald-500/10', 
    bgDark: 'dark:bg-emerald-500/15',
    border: 'bg-emerald-500',
    label: 'Quality'
  },
  exam: { 
    icon: CheckCircle2, 
    color: 'text-blue-600 dark:text-blue-400', 
    bgLight: 'bg-blue-500/10', 
    bgDark: 'dark:bg-blue-500/15',
    border: 'bg-blue-500',
    label: 'Exam'
  },
  productivity: { 
    icon: TrendingUp, 
    color: 'text-purple-600 dark:text-purple-400', 
    bgLight: 'bg-purple-500/10', 
    bgDark: 'dark:bg-purple-500/15',
    border: 'bg-purple-500',
    label: 'Productivity'
  },
  aht: { 
    icon: Clock, 
    color: 'text-rose-600 dark:text-rose-400', 
    bgLight: 'bg-rose-500/10', 
    bgDark: 'dark:bg-rose-500/15',
    border: 'bg-rose-500',
    label: 'AHT'
  },
  hold: { 
    icon: PhoneOff, 
    color: 'text-cyan-600 dark:text-cyan-400', 
    bgLight: 'bg-cyan-500/10', 
    bgDark: 'dark:bg-cyan-500/15',
    border: 'bg-cyan-500',
    label: 'Hold'
  },
  wrapup: { 
    icon: Activity, 
    color: 'text-amber-600 dark:text-amber-400', 
    bgLight: 'bg-amber-500/10', 
    bgDark: 'dark:bg-amber-500/15',
    border: 'bg-amber-500',
    label: 'Wrapup'
  },
  handled: { 
    icon: PhoneCall, 
    color: 'text-teal-600 dark:text-teal-400', 
    bgLight: 'bg-teal-500/10', 
    bgDark: 'dark:bg-teal-500/15',
    border: 'bg-teal-500',
    label: 'Handled Interactions'
  },
  abandoned: { 
    icon: PhoneMissed, 
    color: 'text-red-600 dark:text-red-400', 
    bgLight: 'bg-red-500/10', 
    bgDark: 'dark:bg-red-500/15',
    border: 'bg-red-500',
    label: 'Abandoned Calls'
  },
  art: { 
    icon: Timer, 
    color: 'text-indigo-600 dark:text-indigo-400', 
    bgLight: 'bg-indigo-500/10', 
    bgDark: 'dark:bg-indigo-500/15',
    border: 'bg-indigo-500',
    label: 'Average Response Time'
  },
  inbound: { 
    icon: PhoneIncoming, 
    color: 'text-teal-600 dark:text-teal-400', 
    bgLight: 'bg-teal-500/10', 
    bgDark: 'dark:bg-teal-500/15',
    border: 'bg-teal-500',
    label: 'Inbound Interactions'
  },
  outbound: { 
    icon: PhoneOutgoing, 
    color: 'text-sky-600 dark:text-sky-400', 
    bgLight: 'bg-sky-500/10', 
    bgDark: 'dark:bg-sky-500/15',
    border: 'bg-sky-500',
    label: 'Outbound Interactions'
  },
  call_handled: { 
    icon: PhoneCall, 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bgLight: 'bg-emerald-500/10', 
    bgDark: 'dark:bg-emerald-500/15',
    border: 'bg-emerald-500',
    label: 'Call Handled'
  },
  'call handled': { 
    icon: PhoneCall, 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bgLight: 'bg-emerald-500/10', 
    bgDark: 'dark:bg-emerald-500/15',
    border: 'bg-emerald-500',
    label: 'Call Handled'
  },
  chat_handled: { 
    icon: MessageSquare, 
    color: 'text-teal-600 dark:text-teal-400', 
    bgLight: 'bg-teal-500/10', 
    bgDark: 'dark:bg-teal-500/15',
    border: 'bg-teal-500',
    label: 'Chat Handled'
  },
  'chat handled': { 
    icon: MessageSquare, 
    color: 'text-teal-600 dark:text-teal-400', 
    bgLight: 'bg-teal-500/10', 
    bgDark: 'dark:bg-teal-500/15',
    border: 'bg-teal-500',
    label: 'Chat Handled'
  },
};

function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(true);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useBodyScrollLock(showIosModal);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (sessionStorage.getItem('pwa_banner_dismissed') === 'true') {
      setDismissed(true);
    }

    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setDeferredPrompt(null);
        setDismissed(true);
      }
    } else {
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch (e) {}
  };

  return (
    <>
      {/* Mobile Floating Install Pill */}
      <aside aria-label="Install App" className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm mx-auto sm:mx-0 animate-fadeIn">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/25 rounded-2xl shadow-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 ring-1 ring-emerald-500/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/apple-touch-icon.png" alt="App Icon" className="w-9 h-9 rounded-xl object-cover shadow-xs border border-emerald-500/20 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                FIB Performance App
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium">
                {isIos ? "أضف كـ تطبيق للشاشة الرئيسية" : "تثبيت كـ تطبيق سريع على الموبايل"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-[#1C6B53] hover:bg-[#155a45] text-white text-[11px] font-bold rounded-xl transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Download size={12} />
              <span>تثبيت</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg cursor-pointer"
              title="إغلاق"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Home Screen Guide Modal */}
      {showIosModal && (
        <div data-modal="true" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl animate-fadeIn text-right" dir="rtl">
            <div className="flex justify-between items-start mb-4 flex-row-reverse">
              <button onClick={() => setShowIosModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X size={18} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-2.5">
                <img src="/apple-touch-icon.png" alt="FIB" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    تثبيت على الشاشة الرئيسية
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    خطوتين للحصول على تجربة التطبيق
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 my-4 text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-[#1C6B53] dark:text-emerald-400 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="leading-relaxed">
                  اضغط على زر المشاركة <span className="font-bold text-[#1C6B53] dark:text-emerald-400 inline-flex items-center gap-0.5">Share <Share2 size={12} className="inline" /></span> في أسفل شاشة Safari.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-[#1C6B53] dark:text-emerald-400 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="leading-relaxed">
                  مرر للأسفل واختر <span className="font-bold text-[#1C6B53] dark:text-emerald-400">&quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</span>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1C6B53] text-white text-xs font-bold shadow-md hover:bg-[#155a45] transition cursor-pointer"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AgentDashboard({ 
  userProfile, 
  onLogout, 
  columnsMap, 
  previewMode = false, 
  allMembers = [], 
  onExitPreview,
  isDarkMode = false,
  toggleDarkMode,
  onOpenAnnualEval,
  onNavigate,
  onOpenProfile,
  onOpenSettings
}: { 
  userProfile: any; 
  onLogout: () => void; 
  columnsMap: any; 
  previewMode?: boolean; 
  allMembers?: any[]; 
  onExitPreview?: () => void; 
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onOpenAnnualEval?: () => void;
  onNavigate?: (target: ActiveDashboardType) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}) {
  const defaultPeriod = getPreviousMonthAndYear();
  const [selectedYear, setSelectedYear] = useState(defaultPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState(defaultPeriod.month);

  const activeMembersList = useMemo(() => {
    return (allMembers || []).filter(m => isMemberActiveInPeriod(m, selectedMonth, selectedYear));
  }, [allMembers, selectedMonth, selectedYear]);

  const initialAgent = (previewMode && activeMembersList && activeMembersList.length > 0)
    ? activeMembersList[0]
    : userProfile;
  const [currentAgent, setCurrentAgent] = useState<any>(initialAgent);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [tlSyncRegistry, setTlSyncRegistry] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "tl_agent_sync_status"), (snap) => {
      if (snap.exists()) {
        setTlSyncRegistry(snap.data()?.synced_months || {});
      } else {
        setTlSyncRegistry({});
      }
    }, () => {});
    return () => unsub();
  }, []);
  
  const [memberDoc, setMemberDoc] = useState<any>(null);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [teamTabFilter, setTeamTabFilter] = useState<string>("Younis");

  const teamCounts = useMemo(() => {
    const counts = { Younis: 0, Ankido: 0, Mohammed: 0 };
    (activeMembersList || []).forEach(m => {
      const t = (m.team || "").toLowerCase();
      if (t.includes("younis")) counts.Younis++;
      else if (t.includes("ankido")) counts.Ankido++;
      else if (t.includes("mohammed") || t.includes("dlshad")) counts.Mohammed++;
    });
    return counts;
  }, [activeMembersList]);

  const filteredAgentsList = useMemo(() => {
    let list = activeMembersList || [];
    if (teamTabFilter) {
      list = list.filter(m => {
        const t = (m.team || "").toLowerCase();
        if (teamTabFilter === "Younis") return t.includes("younis");
        if (teamTabFilter === "Ankido") return t.includes("ankido");
        if (teamTabFilter === "Mohammed") return t.includes("mohammed") || t.includes("dlshad");
        return true;
      });
    }
    if (agentSearchTerm.trim()) {
      const q = agentSearchTerm.toLowerCase();
      list = (activeMembersList || []).filter(m => 
        (m.agent_name || "").toLowerCase().includes(q) || 
        (m.team || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeMembersList, teamTabFilter, agentSearchTerm]);

  useEffect(() => {
    if (currentAgent?.team) {
      const t = currentAgent.team.toLowerCase();
      if (t.includes("ankido")) setTeamTabFilter("Ankido");
      else if (t.includes("mohammed") || t.includes("dlshad")) setTeamTabFilter("Mohammed");
      else if (t.includes("younis")) setTeamTabFilter("Younis");
    }
  }, [currentAgent]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showQualitySessionModal, setShowQualitySessionModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(
    previewMode ? false : (userProfile?.passwordUpdated !== true || userProfile?.mustChangePassword === true)
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useBodyScrollLock(Boolean(showEditProfile || forcePasswordChange || showQualitySessionModal));

  useEffect(() => {
    if (previewMode && activeMembersList && activeMembersList.length > 0 && (!currentAgent?.agent_name || !activeMembersList.some(m => m.agent_name === currentAgent?.agent_name))) {
      setCurrentAgent(activeMembersList[0]);
    } else if (userProfile && !previewMode) {
      setCurrentAgent(userProfile);
    }
  }, [userProfile, previewMode, activeMembersList]);

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      return setPasswordError("Passwords do not match");
    }
    const check = validatePasswordSecurity(newPassword);
    if (!check.isValid) {
      return setPasswordError(check.error);
    }
    
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        await setDoc(doc(db, 'users', auth.currentUser.uid), { 
          mustChangePassword: false, 
          passwordUpdated: true,
          passwordChangedAt: new Date().toISOString() 
        }, { merge: true });
        if (userProfile) {
          userProfile.mustChangePassword = false;
          userProfile.passwordUpdated = true;
        }
        setForcePasswordChange(false);
      }
    } catch(err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPasswordError("Security session expired. Please log out and sign back in to change your password.");
      } else {
        setPasswordError(err.message || "Failed to update password");
      }
    }
  };

  const months = MONTHS;
  const teamCols = getEffectiveColumns(currentAgent?.team || '', selectedMonth, selectedYear, columnsMap[currentAgent?.team] || []);
  const teamLower = (currentAgent?.team || '').toLowerCase();
  const tableName =
    teamLower.includes('younis') ? 'younis_metrics' :
    teamLower.includes('ankido') ? 'ankido_metrics' :
    'mohammed_metrics';

  useEffect(() => {
    if (showEditProfile || forcePasswordChange) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEditProfile, forcePasswordChange]);

  useEffect(() => {
    const targetName = (currentAgent?.agent_name || currentAgent?.name || "").trim();
    if (!targetName) return;
    setLoading(true);

    const isChatT = teamLower.includes('mohammed') || teamLower.includes('dlshad');
    const sectionSlug = getQaSectionSlug(currentAgent?.team || "");
    const canonicalTarget = getCanonicalAgentName(targetName);

    let rawFirestoreDocs: any[] = [];
    const qaLiveMap = new Map<string, any>();
    let syncedRegistry: Record<string, any> | null = null;

    const applyAgentMetrics = () => {
      // 1. Get baseline rows specifically for this agent & year
      const baseDocs = BASELINE_TEAM_METRICS.filter(
        m => isSameAgent(m.agent_name || m.name || "", targetName) && String(m.year) === String(selectedYear)
      );

      const metricsMap = new Map<string, any>();

      // Populate from baseline
      baseDocs.forEach(d => {
        const mKey = (d.month || "").toUpperCase();
        if (mKey) {
          metricsMap.set(mKey, {
            ...d,
            month: mKey,
            agent_name: canonicalTarget,
            _fromBaseline: true,
          });
        }
      });

      // Overlay live Firestore metrics for this agent
      rawFirestoreDocs.forEach(d => {
        if (isSameAgent(d.agent_name || d.name || "", targetName)) {
          const mKey = (d.month || "").toUpperCase();
          if (mKey) {
            const existing = metricsMap.get(mKey) || {};
            metricsMap.set(mKey, {
              ...existing,
              ...d,
              id: d.id,
              month: mKey,
              agent_name: canonicalTarget,
              _fromFirestore: true,
            });
          }
        }
      });

      // Ensure every month JAN - DEC has a row structure
      months.forEach(mKey => {
        if (!metricsMap.has(mKey)) {
          metricsMap.set(mKey, {
            agent_name: canonicalTarget,
            team: currentAgent?.team || "",
            year: selectedYear,
            month: mKey,
          });
        }
      });

      // Process metrics for all 12 months (Quality strictly comes from TL table as synced)
      const finalRows = months.map(mKey => {
        const row = { ...(metricsMap.get(mKey) || {}) };
        row.month = mKey;
        row.agent_name = canonicalTarget;
        return row;
      });

      setMetrics(finalRows);
      setLoading(false);
    };

    const numYear = Number(selectedYear);
    const yearList = !isNaN(numYear) ? [selectedYear, numYear] : [selectedYear];

    const q = query(
      collection(db, tableName),
      where('year', 'in', yearList)
    );
    const unsubMetrics = onSnapshot(q, (snap) => {
      rawFirestoreDocs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      applyAgentMetrics();
    }, (err) => {
      console.error(err);
      applyAgentMetrics();
    });

    const qaQ = query(
      collection(db, 'quality_evaluations'),
      where('year', 'in', yearList)
    );
    const unsubQA = onSnapshot(qaQ, (qSnap) => {
      qSnap.docs.forEach(d => {
        qaLiveMap.set(d.id, d.data());
      });
      applyAgentMetrics();
    }, () => {});

    const unsubSync = onSnapshot(doc(db, 'quality_evaluations', 'config_sync_status'), (snap) => {
      if (snap.exists()) {
        syncedRegistry = snap.data()?.synced_months || {};
      } else {
        syncedRegistry = null;
      }
      applyAgentMetrics();
    }, () => {});

    const mQ = query(
      collection(db, 'team_members'),
      where('team', '==', currentAgent.team)
    );
    const unsubMember = onSnapshot(mQ, (mSnap) => {
      const matchedDoc = mSnap.docs.find(
        d => isSameAgent(d.data().agent_name || d.data().name || "", targetName)
      );
      if (matchedDoc) {
        const mData: any = { id: matchedDoc.id, ...matchedDoc.data() };
        setMemberDoc(mData);
        setEditDisplayName(mData.display_name || mData.agent_name);
        setEditPhotoUrl(mData.photo_url || "");
      } else {
        setMemberDoc(null);
        setEditDisplayName(currentAgent.name || currentAgent.agent_name);
        setEditPhotoUrl("");
      }
    }, (err) => {
      console.error(err);
    });

    return () => {
      unsubMetrics();
      unsubQA();
      unsubSync();
      unsubMember();
    };
  }, [selectedYear, currentAgent, tableName, teamLower]);

  const handleSaveProfile = async () => {
    try {
      if (memberDoc) {
        await updateDoc(doc(db, 'team_members', memberDoc.id), {
          display_name: editDisplayName,
          photo_url: editPhotoUrl
        });
        setMemberDoc({ ...memberDoc, display_name: editDisplayName, photo_url: editPhotoUrl });
      }
      if (auth.currentUser?.uid) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          name: editDisplayName,
          photo_url: editPhotoUrl
        }, { merge: true });
      }
      setShowEditProfile(false);
    } catch(e) {
      console.error("Error saving agent profile:", e);
    }
  };
  
  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if(!file) return;
    try {
      const compressed = await compressImageFile(file);
      setEditPhotoUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditPhotoUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Top Star Leaderboard & Personal Rank state
  const [topStarData, setTopStarData] = useState<{
    rankedChat: any[];
    rankedCall: any[];
    top3Chat: any[];
    top3Call: any[];
    chatCompleteness?: any;
    callCompleteness?: any;
    syncStatus?: any;
  } | null>(null);
  const [topStarLoading, setTopStarLoading] = useState(false);
  const [activePodiumTeam, setActivePodiumTeam] = useState<"chat" | "call">(
    currentAgent?.team === 'Mohammed Dlshad Team' ? "chat" : "call"
  );

  useEffect(() => {
    setActivePodiumTeam(currentAgent?.team === 'Mohammed Dlshad Team' ? 'chat' : 'call');
  }, [currentAgent?.team]);

  useEffect(() => {
    let isMounted = true;
    const loadTopStar = async () => {
      const m = months.includes((selectedMonth || '').toUpperCase()) ? (selectedMonth || '').toUpperCase() : "SEP";
      try {
        setTopStarLoading(true);
        const crit = await fetchTopStarCriteria();
        const res = await fetchTopStarData(selectedYear, m, crit);
        if (isMounted) {
          setTopStarData(res);
        }
      } catch (e) {
        console.error("Failed to load Top Star for agent dashboard:", e);
      } finally {
        if (isMounted) setTopStarLoading(false);
      }
    };
    loadTopStar();
    return () => { isMounted = false; };
  }, [selectedYear, selectedMonth]);

  const isChatTeam = currentAgent?.team === 'Mohammed Dlshad Team';
  const rawAgentName = (currentAgent?.agent_name || currentAgent?.name || "").toLowerCase().trim();
  const currentAgentCanonicalName = normalizeName(currentAgent?.agent_name || currentAgent?.name || "");

  const monthIndex = MONTHS.indexOf((selectedMonth || "").toUpperCase());
  const yearNum = parseInt(selectedYear || "2026", 10);
  const isSepOrLater = yearNum > 2026 || (yearNum === 2026 && (monthIndex >= 8 || selectedMonth === "Q4" || selectedMonth === "H2"));

  // Check if Top Star results are officially published for the selected month
  const upperSelectedMonth = (selectedMonth || "").toUpperCase();
  const isHistoricalTopStar = yearNum < 2026 || (yearNum === 2026 && monthIndex < 8);
  const myTeamSyncKey = `${selectedYear}_${upperSelectedMonth}_${isChatTeam ? 'chat' : 'call'}`;
  const podiumSyncKey = `${selectedYear}_${upperSelectedMonth}_${activePodiumTeam}`;

  const isMyTeamTopStarPublished = isHistoricalTopStar || Boolean(
    topStarData?.syncStatus?.[myTeamSyncKey]?.isPublished === true || 
    topStarData?.syncStatus?.[myTeamSyncKey]?.isSynced === true
  );
  const isPodiumTopStarPublished = isHistoricalTopStar || Boolean(
    topStarData?.syncStatus?.[podiumSyncKey]?.isPublished === true || 
    topStarData?.syncStatus?.[podiumSyncKey]?.isSynced === true
  );

  // Team completeness check for current agent's team
  const myTeamCompleteness = isChatTeam ? topStarData?.chatCompleteness : topStarData?.callCompleteness;
  const isMonthComplete = myTeamCompleteness?.isComplete === true;

  // Active podium team completeness check (Only appears to employees when data is 100% complete and published)
  const activePodiumCompleteness = activePodiumTeam === "chat" ? topStarData?.chatCompleteness : topStarData?.callCompleteness;
  const isPodiumComplete = activePodiumCompleteness?.isComplete === true && isPodiumTopStarPublished;

  const agentRankInfo = useMemo(() => {
    if (!topStarData) return null;
    const teamList = (isChatTeam ? topStarData.rankedChat : topStarData.rankedCall) || [];
    const otherList = (isChatTeam ? topStarData.rankedCall : topStarData.rankedChat) || [];
    const allRanked = [...teamList, ...otherList];

    const matchAgent = (r: any) => {
      const rNorm = normalizeName(r.name);
      const rLower = (r.name || "").toLowerCase().trim();
      return rNorm === currentAgentCanonicalName || 
             rLower === rawAgentName || 
             ((rawAgentName.includes("saleem") || rawAgentName.includes("salem") || rawAgentName.includes("سليم") || rawAgentName.includes("سالم")) &&
              (rLower.includes("salem") || rLower.includes("saleem")));
    };

    // First check team list, then all ranked agents
    return teamList.find(matchAgent) || allRanked.find(matchAgent) || null;
  }, [topStarData, isChatTeam, currentAgentCanonicalName, rawAgentName]);

  const myRank = (previewMode || isMyTeamTopStarPublished) ? (agentRankInfo?.rank ?? null) : null;
  const myScore = agentRankInfo?.scoreStr ?? null;
  const isTop3 = isSepOrLater && myRank !== null && myRank <= 3;

  const currentTop3 = useMemo(() => {
    if (!topStarData || !isPodiumComplete) return [];
    return activePodiumTeam === "chat" ? (topStarData.top3Chat || []) : (topStarData.top3Call || []);
  }, [topStarData, activePodiumTeam, isPodiumComplete]);

  // Helper to parse a stored value to a numeric (seconds if mm:ss, else as-is)
  const parseVal = (col: any, row: any) => {
    if (!row) return 0;
    const rawVal = getRowValForCol(row, col.id);
    if (!rawVal) return 0;
    if (col.type === 'time' && rawVal.includes(':')) {
      const parts = rawVal.split(':');
      if (parts.length === 3) {
        return (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
      }
      return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0); // → seconds
    }
    return parseFloat(rawVal) || 0; // plain number
  };

  const selectedUpper = (selectedMonth || '').toUpperCase();
  const isMonthSelected = months.includes(selectedUpper);
  const selectedMonthData: any = isMonthSelected
    ? (metrics.find(r => (r.month || '').toUpperCase() === selectedUpper) || {})
    : {};

  const rawTeam = (currentAgent?.team || '').toLowerCase();
  const canonicalAgentTeam = rawTeam.includes('younis')
    ? 'Younis Kamal Team'
    : rawTeam.includes('ankido')
    ? 'Ankido Buya Team'
    : rawTeam.includes('mohammed') || rawTeam.includes('dlshad')
    ? 'Mohammed Dlshad Team'
    : (currentAgent?.team || '');

  const syncKey = `${selectedYear}_${selectedUpper}_${canonicalAgentTeam}`;
  const combinedKey = `${selectedYear}_${selectedUpper}_Call Center Combined`;
  const allKey = `${selectedYear}_${selectedUpper}_all`;
  const isHistorical = Number(selectedYear) < 2026 || (Number(selectedYear) === 2026 && MONTHS.indexOf(selectedUpper) < 8);
  const isMonthSyncedByTl = isHistorical || Boolean(
    tlSyncRegistry[syncKey]?.isSynced ||
    tlSyncRegistry[allKey]?.isSynced ||
    (canonicalAgentTeam !== 'Mohammed Dlshad Team' && tlSyncRegistry[combinedKey]?.isSynced)
  );
  const currentSyncDetails = tlSyncRegistry[syncKey] || (canonicalAgentTeam !== 'Mohammed Dlshad Team' ? tlSyncRegistry[combinedKey] : null) || tlSyncRegistry[allKey] || null;

  const chartData = months.map(m => {
    const row = metrics.find(r => (r.month || '').toUpperCase() === m.toUpperCase());
    const mSyncKey = `${selectedYear}_${m.toUpperCase()}_${canonicalAgentTeam}`;
    const mCombinedKey = `${selectedYear}_${m.toUpperCase()}_Call Center Combined`;
    const mAllKey = `${selectedYear}_${m.toUpperCase()}_all`;
    const mIsHistorical = Number(selectedYear) < 2026 || (Number(selectedYear) === 2026 && MONTHS.indexOf(m.toUpperCase()) < 8);
    const mIsSynced = mIsHistorical || Boolean(
      tlSyncRegistry[mSyncKey]?.isSynced ||
      tlSyncRegistry[mAllKey]?.isSynced ||
      (canonicalAgentTeam !== 'Mohammed Dlshad Team' && tlSyncRegistry[mCombinedKey]?.isSynced)
    );

    const dataObj: any = { month: m };
    teamCols.forEach((col: any) => { 
      if (!mIsSynced && !previewMode) {
        dataObj[col.id] = null;
      } else {
        dataObj[col.id] = parseVal(col, row); 
      }
    });
    return dataObj;
  });

  // Smart aggregation — respects format (mm:ss vs plain) and aggregation type (sum vs average)
  const avgCols = (monthList: string[], col: any) => {
    const rowsWithVals = monthList
      .filter(m => {
        if (previewMode) return true;
        const mSyncKey = `${selectedYear}_${m.toUpperCase()}_${canonicalAgentTeam}`;
        const mCombinedKey = `${selectedYear}_${m.toUpperCase()}_Call Center Combined`;
        const mAllKey = `${selectedYear}_${m.toUpperCase()}_all`;
        const mIsHistorical = Number(selectedYear) < 2026 || (Number(selectedYear) === 2026 && MONTHS.indexOf(m.toUpperCase()) < 8);
        return mIsHistorical || Boolean(
          tlSyncRegistry[mSyncKey]?.isSynced ||
          tlSyncRegistry[mAllKey]?.isSynced ||
          (canonicalAgentTeam !== 'Mohammed Dlshad Team' && tlSyncRegistry[mCombinedKey]?.isSynced)
        );
      })
      .map(m => {
        const r = metrics.find(row => (row.month || '').toUpperCase() === m.toUpperCase());
        const val = getRowValForCol(r, col.id);
        return { r, val };
      })
      .filter(({ val }) => val != null && val !== '');

    if (!rowsWithVals.length) return '-';

    // Detect if values are stored as mm:ss
    const isTimeFormatted = col.type === 'time' && rowsWithVals.some(({ val }) => val.includes(':'));

    const nums = rowsWithVals.map(({ val }) => {
      const v = val || '0';
      if (isTimeFormatted && v.includes(':')) {
        const parts = v.split(':');
        if (parts.length === 3) {
          return (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
        }
        return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
      }
      return parseFloat(v) || 0;
    });

    const total = nums.reduce((a, b) => a + b, 0);
    const result = col.aggregation === 'sum' ? total : total / nums.length;

    if (isTimeFormatted) {
      return `${Math.floor(result / 60).toString().padStart(2, '0')}:${String(Math.round(result % 60)).padStart(2, '0')}`;
    }
    return col.aggregation === 'sum'
      ? Math.round(result).toString()
      : result.toFixed(1);
  };

  const PERIODS = [
    { label: 'Q1', months: ['JAN','FEB','MAR'] },
    { label: 'Q2', months: ['APR','MAY','JUN'] },
    { label: 'Q3', months: ['JUL','AUG','SEP'] },
    { label: 'Q4', months: ['OCT','NOV','DEC'] },
    { label: 'H1', months: ['JAN','FEB','MAR','APR','MAY','JUN'] },
    { label: 'H2', months: ['JUL','AUG','SEP','OCT','NOV','DEC'] },
  ];

  const currentMonthIdx = months.findIndex(m => m.toUpperCase() === selectedUpper);
  const prevMonthName = currentMonthIdx > 0 ? months[currentMonthIdx - 1] : null;
  const prevMonthData: any = prevMonthName
    ? (metrics.find(r => (r.month || '').toUpperCase() === prevMonthName.toUpperCase()) || null)
    : null;

  const getPrevMonthVal = (col: any) => {
    if (!prevMonthData) return null;
    const v = getRowValForCol(prevMonthData, col.id);
    return v !== "" ? v : (prevMonthData[col.id] || null);
  };

  const getDisplayVal = (col: any) => {
    if (isMonthSelected) {
      if (!isMonthSyncedByTl && !previewMode) {
        return '-';
      }
      const v = getRowValForCol(selectedMonthData, col.id);
      return v !== "" ? v : (selectedMonthData[col.id] || '-');
    }
    const period = PERIODS.find(p => p.label === selectedMonth);
    if (!period) return '-';
    return avgCols(period.months, col);
  };

  const getAgentColLabel = (col: any) => {
    return cleanColLabel(col.id, col.label);
  };

  return (
    <div className="min-h-screen p-3.5 sm:p-6 md:p-8 font-sans bg-[#F9F8F4] dark:bg-gray-900 transition-colors">
      <div className="max-w-[1400px] mx-auto">

        {/* Top Brand Header (FIB Logo & Portal Controls) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 sm:mb-8 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/60 dark:border-gray-800 relative z-30">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-11 w-auto object-contain shrink-0" />
            <div className="h-8 sm:h-9 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="shrink-0">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                Agent Dashboard
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Performance & Scorecards Portal
              </p>
            </div>
          </div>

          <div className="flex items-center shrink-0 self-stretch sm:self-auto justify-end">
            <UnifiedTopNavbar
              currentDashboard="agent"
              userProfile={userProfile}
              onNavigate={onNavigate}
              onLogout={onLogout}
              onOpenProfile={onOpenProfile}
              onOpenSettings={onOpenSettings}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </div>
        </div>
        
        {/* Header with Profile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 bg-white dark:bg-gray-800 p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/70 dark:border-gray-700/80">
          <div className="flex items-center gap-3.5 sm:gap-5 w-full sm:w-auto">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-3 sm:border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center">
                {memberDoc?.photo_url ? (
                  <img src={memberDoc.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Users size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                )}
              </div>
              {!previewMode && (
                <button 
                  onClick={() => setShowEditProfile(true)} 
                  className="absolute bottom-0 right-0 p-1.5 bg-[#1C6B53] text-white rounded-full shadow-md hover:bg-emerald-700 transition"
                  title="Change Profile Photo"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-[#1C6B53] dark:text-emerald-300 text-[11px] sm:text-xs font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[140px] sm:max-w-none">{currentAgent?.team || 'Team Member'}</span>
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-[11px] sm:text-xs font-medium hidden sm:inline">
                  {previewMode ? '• Agent Performance Scorecard' : '• Performance Scorecard'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white truncate">
                {memberDoc?.display_name || currentAgent?.agent_name || currentAgent?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap justify-end">
            {/* Modern Top Star Standing Card on the Right */}
            {myRank != null ? (
              <div className={`relative overflow-hidden flex items-center gap-3.5 px-4 py-2.5 rounded-2xl sm:rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                myRank === 1
                  ? "bg-gradient-to-br from-amber-500/20 via-yellow-400/12 to-amber-500/5 border-amber-400/80 dark:border-amber-400/50 shadow-amber-500/15 ring-1 ring-amber-300/40"
                  : myRank === 2
                  ? "bg-gradient-to-br from-slate-200/80 via-gray-100/70 to-slate-200/40 border-slate-300 dark:border-slate-500/60 dark:bg-slate-800/60 shadow-slate-500/15 ring-1 ring-slate-300/40"
                  : myRank === 3
                  ? "bg-gradient-to-br from-amber-700/20 via-amber-600/15 to-amber-700/8 border-amber-600/80 dark:border-amber-600/50 shadow-amber-700/15 ring-1 ring-amber-500/40"
                  : "bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/15 dark:from-gray-800 dark:via-gray-850 dark:to-emerald-950/20 border-emerald-500/25 dark:border-emerald-500/30"
              }`}>
                {/* Decorative background aura */}
                <div className={`absolute -right-5 -bottom-5 w-20 h-20 rounded-full blur-xl pointer-events-none ${
                  myRank === 1 ? "bg-amber-400/25" : myRank === 2 ? "bg-slate-300/25" : myRank === 3 ? "bg-amber-600/25" : "bg-emerald-400/15"
                }`} />

                {/* Left Badge with Rank or Medal */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm transition-transform duration-200 hover:scale-105 ${
                  myRank === 1
                    ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 ring-2 ring-amber-300 shadow-amber-400/30 text-xl"
                    : myRank === 2
                    ? "bg-gradient-to-tr from-slate-200 to-gray-300 text-gray-900 ring-2 ring-slate-300 shadow-slate-400/20 text-xl"
                    : myRank === 3
                    ? "bg-gradient-to-tr from-amber-600 to-amber-700 text-white ring-2 ring-amber-500 shadow-amber-700/30 text-xl"
                    : "bg-gradient-to-tr from-[#1C6B53] to-emerald-600 text-white ring-2 ring-emerald-400/30 shadow-emerald-900/20"
                }`}>
                  {myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : (
                    <>
                      <span className="text-[8px] font-black uppercase tracking-wider text-emerald-100/90 leading-none">RANK</span>
                      <span className="text-sm font-black leading-tight text-white tracking-tight">#{myRank}</span>
                    </>
                  )}
                </div>

                {/* Center / Right Content */}
                <div className="flex flex-col min-w-0 pr-1 max-w-xs sm:max-w-sm">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      myRank === 1 ? "bg-amber-500/20 text-amber-900 dark:text-amber-200" :
                      myRank === 2 ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200" :
                      myRank === 3 ? "bg-amber-700/20 text-amber-900 dark:text-amber-200" :
                      "bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300"
                    }`}>
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      <span>{myRank <= 3 ? "Top Star Winner" : "Top Star"}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 font-mono">
                      {selectedMonth.slice(0, 3)} {selectedYear}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                      {myRank === 1 ? "1st Place" :
                       myRank === 2 ? "2nd Place" :
                       myRank === 3 ? "3rd Place" :
                       `Rank #${myRank}`}
                    </span>
                    <div className="inline-flex items-baseline gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 text-[#1C6B53] dark:text-emerald-300 border border-emerald-500/20 font-bold">
                      <span className="font-mono text-xs font-black">{myScore}</span>
                      <span className="text-[9px] uppercase font-bold opacity-75">pts</span>
                    </div>
                  </div>

                  {/* Motivational Quote for Top 3 (Unique per Rank and Month) */}
                  {myRank <= 3 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900/90 dark:text-amber-200/90 italic mt-1 leading-snug">
                      <Sparkles size={11} className="text-amber-500 shrink-0" />
                      <span className="truncate">&quot;{getTopStarMotivationalQuote(myRank, selectedMonth)}&quot;</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-gray-50/90 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-gray-200/80 dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                  <Clock size={16} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <Star size={10} className="text-gray-400" />
                    <span>Top Star</span>
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {!isMonthComplete ? "Pending month data" : "Results pending publication"}
                  </span>
                </div>
              </div>
            )}

            {/* Moved Preview Agent Selector Dropdown (Placed neatly next to Q.S & KPI) */}
            {previewMode && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
                  className="h-9 flex items-center justify-between gap-2 px-3 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-xs transition cursor-pointer shrink-0"
                  title="Switch Preview Employee"
                >
                  <div className="w-5 h-5 rounded-md bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">
                    {currentAgent?.agent_name ? currentAgent.agent_name.charAt(0).toUpperCase() : <Users size={11} />}
                  </div>
                  <div className="flex items-center gap-1.5 text-left truncate">
                    <span className="truncate max-w-[120px] sm:max-w-[150px] font-black text-xs text-gray-900 dark:text-white leading-none">
                      {toTitleCase(currentAgent?.agent_name || "Select Agent")}
                    </span>
                    <span className="text-[10px] text-[#1C6B53] dark:text-emerald-400 font-bold leading-none shrink-0">
                      • {currentAgent?.team?.replace(' Team', '') || 'CC'}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 shrink-0 ml-0.5 ${agentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {agentDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAgentDropdownOpen(false)} />
                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[420px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-3 z-50 max-h-[460px] flex flex-col animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10">
                      
                      {/* Header */}
                      <div className="px-2 pt-1 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div>
                          <h4 className="text-xs font-black text-gray-900 dark:text-white">
                            Select Employee
                          </h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {activeMembersList.length} Official Contact Center Agents
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {filteredAgentsList.length} Available
                        </span>
                      </div>

                      {/* Search Input */}
                      <div className="relative mt-2.5 mb-2">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search employee across all teams..."
                          value={agentSearchTerm}
                          onChange={(e) => setAgentSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1C6B53]/20 focus:border-[#1C6B53] dark:focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium shadow-xs transition"
                          autoFocus
                        />
                        {agentSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setAgentSearchTerm("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-md transition"
                            title="Clear search"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Team Filter Pills */}
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 shrink-0">
                        {[
                          { id: "Younis", label: "Younis Kamal", count: teamCounts.Younis, icon: PhoneCall },
                          { id: "Ankido", label: "Ankido Buya", count: teamCounts.Ankido, icon: PhoneCall },
                          { id: "Mohammed", label: "Mohammed Dlshad", count: teamCounts.Mohammed, icon: MessageSquare },
                        ].map(tab => {
                          const TabIcon = tab.icon;
                          const isActive = teamTabFilter === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setTeamTabFilter(tab.id);
                                setAgentSearchTerm("");
                              }}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                isActive
                                  ? 'bg-[#1C6B53] text-white shadow-xs font-black'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <TabIcon size={11} className={isActive ? 'text-emerald-200' : 'text-gray-400'} />
                              <span className="truncate">{tab.label.split(' ')[0]}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                                isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Roster Count Summary */}
                      <div className="px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 mb-1.5">
                        <span>
                          {agentSearchTerm.trim() 
                            ? `${filteredAgentsList.length} Matching Search` 
                            : `${filteredAgentsList.length} Agents in ${teamTabFilter === 'Mohammed' ? 'Mohammed Dlshad Team (Chat)' : teamTabFilter === 'Ankido' ? 'Ankido Buya Team (Calls)' : 'Younis Kamal Team (Calls)'}`}
                        </span>
                        <span className="text-[9px] font-bold text-[#1C6B53] dark:text-emerald-400">
                          {teamTabFilter === 'Mohammed' ? 'Digital Chat' : 'Voice Calls'}
                        </span>
                      </div>

                      {/* Scrollable Members List */}
                      <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 overscroll-contain max-h-64">
                        {filteredAgentsList.length === 0 ? (
                          <div className="py-8 px-3 text-center text-xs text-gray-400 dark:text-gray-500 font-medium flex flex-col items-center gap-2">
                            <Users size={20} className="text-gray-300 dark:text-gray-600" />
                            <span>{agentSearchTerm.trim() ? `No employees matching "${agentSearchTerm}"` : "No employees found"}</span>
                          </div>
                        ) : (
                          filteredAgentsList.map(m => {
                            const isSelected = m.agent_name === currentAgent?.agent_name;
                            const teamStr = m.team || "Contact Center";
                            const isYounis = teamStr.includes("Younis");
                            const isAnkido = teamStr.includes("Ankido");
                            const isDlshad = teamStr.includes("Mohammed") || teamStr.includes("Dlshad");
                            
                            const teamBadgeClass = isYounis
                              ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                              : isAnkido
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : isDlshad
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";

                            return (
                              <button
                                key={m.id || m.agent_name}
                                type="button"
                                onClick={() => {
                                  setCurrentAgent({
                                    role: 'agent',
                                    agent_name: m.agent_name,
                                    team: m.team,
                                    name: m.agent_name,
                                    photo_url: m.photo_url || ""
                                  });
                                  setAgentDropdownOpen(false);
                                  setAgentSearchTerm("");
                                }}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                                    isSelected
                                      ? 'bg-[#1C6B53] text-white shadow-2xs'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {m.agent_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-bold truncate text-gray-900 dark:text-gray-100">
                                      {toTitleCase(m.agent_name)}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold border ${teamBadgeClass}`}>
                                        {teamStr.replace(' Team', '')}
                                      </span>
                                      <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">
                                        {isDlshad ? 'Chat' : 'Call'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0 ml-2">
                                  {isSelected ? (
                                    <span className="w-5 h-5 rounded-full bg-[#1C6B53] text-white flex items-center justify-center shadow-2xs">
                                      <Check size={11} strokeWidth={3} />
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 group-hover:text-gray-600 font-medium">Select</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Q.S & KPI Button */}
            <button 
              type="button"
              onClick={() => setShowQualitySessionModal(true)} 
              className="h-9 flex items-center gap-2 px-3.5 sm:px-4 text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-[#1C6B53] to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-2xl shadow-md shadow-emerald-900/20 active:scale-95 transition cursor-pointer shrink-0 border border-emerald-400/30"
              title="Open Q.S & KPI Sign-off"
            >
              <Award size={14} className="text-amber-300" />
              <span>Q.S &amp; KPI</span>
            </button>

            {!previewMode && (
              <button 
                onClick={() => setShowEditProfile(true)} 
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/60 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600/80 rounded-2xl transition shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <Edit2 size={13} className="text-[#1C6B53] dark:text-emerald-400" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading performance data...</div>
        ) : (
          <div className="space-y-4 sm:space-y-5">

            {/* Year Performance Overview (Adapts Dynamically to Active Brand Theme) */}
            <div 
              style={{ background: 'var(--brand-gradient)' }}
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-[var(--brand-glow)] border border-white/20 relative overflow-hidden text-white"
            >
              {/* Subtle ambient brand glow in background */}
              <div 
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40" 
                style={{ backgroundColor: 'var(--brand-glow)' }}
              />
              <div 
                className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30" 
                style={{ backgroundColor: 'var(--brand-glow)' }}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-white/10 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-white/15 border border-white/25 text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-1.5">
                    <Sparkles size={11} className="text-white" />
                    <span>Year Performance</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    {selectedYear} Overview
                  </h2>
                  <p className="text-[11px] sm:text-xs text-white/75 mt-0.5 sm:mt-1 font-medium">
                    Consolidated annual metrics across all 12 months
                  </p>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">12 Months Consolidated</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6 relative z-10">
                {getEffectiveColumns(currentAgent?.team || '', 'YEAR - AVG', selectedYear, columnsMap[currentAgent?.team] || []).map((col: any) => {
                  const yearAvg = avgCols(months, col);
                  return (
                    <div 
                      key={col.id} 
                      className="relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 hover:border-white/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
                    >
                      <span className="text-[11px] sm:text-xs font-semibold text-white/80 group-hover:text-white transition-colors truncate block">
                        {getAgentColLabel(col)}
                      </span>
                      
                      <div className="mt-2 flex items-baseline">
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                          {yearAvg}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Month / Period Selector Toolbar with Year Dropdown beside months */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm p-1.5 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5 px-1">
                {/* Modern Year Select Dropdown beside months */}
                <div className="shrink-0 mr-0.5 sm:mr-1">
                  <ModernDropdown
                    value={selectedYear}
                    onChange={(val) => setSelectedYear(val)}
                    options={["2026", "2027", "2028", "2029", "2030"]}
                    variant="tinted-green"
                    size="sm"
                    ariaLabel="Select Year"
                  />
                </div>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1 shrink-0" />

                {/* Month & Period tabs */}
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide flex-1 py-0.5">
                  {months.map(m => {
                    const displayLabel = m.charAt(0) + m.slice(1).toLowerCase();
                    return (
                      <button
                        key={m}
                        onClick={() => setSelectedMonth(m)}
                        className={`shrink-0 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-150 ${
                          selectedMonth === m
                            ? 'bg-[#1C6B53] text-white shadow-md shadow-[#1C6B53]/25 scale-[1.02]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}

                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1 shrink-0" />

                  {/* Period tabs - Styled in Green like Team Leader Dashboard */}
                  {PERIODS.map(p => {
                    const isSel = selectedMonth === p.label;
                    return (
                      <button
                        key={p.label}
                        onClick={() => setSelectedMonth(p.label)}
                        className={`shrink-0 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all duration-150 whitespace-nowrap ${
                          isSel
                            ? 'bg-[#00A991] text-white shadow-md shadow-[#00A991]/30 scale-[1.02]'
                            : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>



            {/* Top 3 Performers Section (Visible to all employees) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1C6B53]/10 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                        Top 3 Performers
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        {selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase()} {selectedYear}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      Top Star Podium for {activePodiumTeam === 'chat' ? 'Chat Team' : 'Call Center'}
                    </p>
                  </div>
                </div>

                {/* Team Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-900 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActivePodiumTeam("chat")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activePodiumTeam === "chat"
                        ? "bg-[#1C6B53] text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <MessageSquare size={12} />
                    <span>Chat Team</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePodiumTeam("call")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activePodiumTeam === "call"
                        ? "bg-[#1C6B53] text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <PhoneCall size={12} />
                    <span>Call Center</span>
                  </button>
                </div>
              </div>

              {/* 3 Podium Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {!isSepOrLater ? (
                  <div className="col-span-3 py-6 px-4 text-center bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
                      <Sparkles size={20} className="text-amber-500" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Active From September 2026</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                      Leaderboard available from September 2026 onwards.
                    </p>
                  </div>
                ) : !isPodiumComplete ? (
                  <div className="col-span-3 py-6 px-4 text-center bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
                      <Clock size={20} className="text-amber-500" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Rankings Pending</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                      Rankings will appear once monthly evaluations are complete.
                    </p>
                  </div>
                ) : currentTop3.length === 0 ? (
                  <div className="col-span-3 py-6 px-4 text-center bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-2xl bg-gray-200/60 dark:bg-gray-700/60 text-gray-400 flex items-center justify-center mx-auto mb-2">
                      <Clock size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No Scores Yet</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                      No scores recorded for this period yet.
                    </p>
                  </div>
                ) : (
                  currentTop3.map((agent: any) => {
                    const isMe = normalizeName(agent.name) === currentAgentCanonicalName ||
                                 (agent.name || "").toLowerCase().trim() === rawAgentName ||
                                 (rawAgentName.includes("saleem") && (agent.name || "").toLowerCase().includes("salem")) ||
                                 (rawAgentName.includes("salem") && (agent.name || "").toLowerCase().includes("saleem"));
                    return (
                      <div
                        key={agent.name}
                        className={`relative p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex items-center justify-between shadow-xs hover:shadow-md ${
                          isMe 
                            ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400/90 ring-2 ring-emerald-500/20" 
                            : agent.rank === 1
                            ? "bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-white dark:to-gray-800 border-amber-300/80 dark:border-amber-500/40"
                            : agent.rank === 2
                            ? "bg-gradient-to-br from-slate-200/50 via-gray-100/40 to-white dark:to-gray-800 border-slate-300/80 dark:border-slate-600/50"
                            : "bg-gradient-to-br from-amber-700/10 via-amber-600/5 to-white dark:to-gray-800 border-amber-600/60 dark:border-amber-600/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-xs ${
                            agent.rank === 1 ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 ring-2 ring-amber-300" :
                            agent.rank === 2 ? "bg-gradient-to-tr from-slate-200 to-gray-200 text-gray-900 ring-2 ring-slate-300" :
                            "bg-gradient-to-tr from-amber-600 to-amber-700 text-white ring-2 ring-amber-500"
                          }`}>
                            {agent.rank === 1 ? "🥇" : agent.rank === 2 ? "🥈" : "🥉"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                {agent.name}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#1C6B53] text-white shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                              {agent.rank === 1 ? "1st Place" : agent.rank === 2 ? "2nd Place" : "3rd Place"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1 shrink-0 pl-2">
                          <div className="flex items-baseline gap-0.5 px-2.5 py-1 rounded-xl bg-[#1C6B53]/10 dark:bg-emerald-400/15 text-[#1C6B53] dark:text-emerald-300 font-mono font-black text-xs sm:text-sm border border-emerald-500/20">
                            <span>{agent.scoreStr || agent.score}</span>
                            <span className="text-[9px] font-sans font-bold opacity-75">pts</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* KPI Cards — Grand, High-Impact Modern Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-5">
              {teamCols.map((col: any) => {
                const cardLabel = getAgentColLabel(col);
                const colKey = (col.id || '').toLowerCase();
                const lblKey = (col.label || '').toLowerCase();
                const meta = KPI_META[colKey] || 
                             KPI_META[lblKey] || 
                             Object.entries(KPI_META).find(([k]) => colKey.includes(k) || lblKey.includes(k))?.[1] || {
                  icon: Activity,
                  color: 'text-[#1C6B53] dark:text-emerald-400',
                  bgLight: 'bg-emerald-500/10',
                  bgDark: 'dark:bg-emerald-500/15',
                  border: 'bg-[#1C6B53]',
                  label: cardLabel
                };
                const IconComp = meta.icon;
                const val = getDisplayVal(col);

                const isWrapup = col.id?.toLowerCase().includes('wrapup') || col.label?.toLowerCase().includes('wrapup');
                const isTime = col.type === 'time' && !isWrapup;
                const isPercent = !isTime && !isWrapup && (
                  col.aggregation === 'average' || 
                  col.id.toLowerCase().includes('quality') || 
                  col.id.toLowerCase().includes('exam') || 
                  col.id.toLowerCase().includes('prod') || 
                  col.label.includes('%')
                );
                const strVal = String(val ?? '-').trim();
                const hasPercentSign = strVal.endsWith('%');
                const cleanVal = hasPercentSign ? strVal.slice(0, -1).trim() : strVal;

                return (
                  <div 
                    key={col.id} 
                    className="group relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[145px] sm:min-h-[190px]"
                  >
                    {/* Top colored accent indicator line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 ${meta.border}`} />

                    {/* Subtle ambient colored radial glow in background */}
                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 sm:w-32 sm:h-32 rounded-full ${meta.bgLight} ${meta.bgDark} blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity`} />

                    <div className="relative z-10">
                      {/* Header: Icon + Metric Title + Trend Badge */}
                      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.color} shadow-xs group-hover:scale-110 transition-transform`}>
                            <IconComp size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-base font-black text-gray-800 dark:text-gray-100 tracking-tight block truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {cardLabel}
                          </span>
                        </div>
                        {isMonthSelected && prevMonthName && cleanVal !== '-' && getPrevMonthVal(col) && (
                          <TrendBadge
                            currentValue={val}
                            previousValue={getPrevMonthVal(col)}
                            colId={col.id}
                            label={cardLabel}
                            prevMonthLabel={prevMonthName}
                          />
                        )}
                      </div>

                      {/* Hero Big Value — Modern, High-Impact & Beautiful */}
                      <div className="my-2 sm:my-3.5">
                        {cleanVal === '-' || cleanVal === '' ? (
                          <span className="text-2xl sm:text-4xl font-bold text-gray-300 dark:text-gray-600 select-none">
                            —
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1 flex-wrap">
                            <span className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight tabular-nums text-gray-900 dark:text-white leading-none drop-shadow-xs">
                              {cleanVal}
                            </span>
                            
                            {(isPercent || hasPercentSign) && (
                              <span className={`text-base sm:text-xl lg:text-2xl font-black ${meta.color} opacity-90 select-none ml-0.5`}>
                                %
                              </span>
                            )}

                            {isTime && cleanVal !== '-' && (
                              <span className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1 select-none bg-gray-100 dark:bg-gray-700/60 px-1.5 py-0.5 rounded-md self-center">
                                min
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="relative z-10 mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/70 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.border}`} />
                        <span className="hidden xs:inline sm:inline">Active</span>
                      </span>
                      <span className="font-bold text-gray-600 dark:text-gray-300">{selectedMonth} {selectedYear}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div data-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center p-4 overscroll-contain">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditProfile(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800 overscroll-contain">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
            
            <div className="flex flex-col items-center mb-6">
               <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 overflow-hidden border-2 border-gray-200 dark:border-gray-700 relative group flex items-center justify-center">
                  {editPhotoUrl ? <img src={editPhotoUrl} className="w-full h-full object-cover" /> : <Users size={32} className="text-gray-300" />}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition">
                    <Camera size={18} className="mb-1" />
                    <span className="text-[10px] font-medium">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
               </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Display Name</label>
              <input type="text" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53]" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition">Cancel</button>
              <button onClick={handleSaveProfile} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-[#1C6B53] hover:bg-emerald-700 transition shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Force Change Password Modal for First-Time Login */}
      {forcePasswordChange && (
        <div data-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overscroll-contain">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-7 sm:p-8 max-w-md w-full border border-gray-100 dark:border-gray-800 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#1C6B53]/10 dark:bg-emerald-950 flex items-center justify-center text-[#1C6B53] dark:text-emerald-400 mb-4 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                First Time Login Security
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Welcome, <strong className="text-gray-800 dark:text-gray-200">{userProfile.agent_name || userProfile.name}</strong>! As this is your first time signing in, you must set your private personal password before accessing the dashboard.
              </p>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters with letters & numbers"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Security Requirements:</p>
                <div className="flex items-center gap-1.5">
                  <span className={newPassword.length >= 8 ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                  <span>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                  <span>Uppercase & lowercase letters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={/[0-9]/.test(newPassword) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                  <span>At least one number or special character</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-lg shadow-[#1C6B53]/25 transition-all active:scale-[0.99]"
              >
                Set New Password & Access Dashboard
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-gray-400 hover:text-red-500 font-semibold transition"
                >
                  Cancel and Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quality Session Sign-off Modal */}
      <QualitySessionModal
        isOpen={showQualitySessionModal}
        onClose={() => setShowQualitySessionModal(false)}
        agentName={currentAgent?.agent_name || userProfile?.name || userProfile?.agent_name}
        agentTeam={currentAgent?.team || userProfile?.team || ""}
        userProfile={userProfile}
        initialYear={selectedYear}
        initialQuarter={(() => {
          const idx = MONTHS.indexOf(selectedMonth.toUpperCase());
          if (idx === -1) return "Q4";
          return ["Q1","Q2","Q3","Q4"][Math.floor(idx / 3)];
        })()}
        initialWeek={4}
        isDarkMode={isDarkMode}
      />

      {/* Mobile PWA Install Floating Banner */}
      <PwaInstallBanner />
    </div>
  );
}

export default function Dashboard() {
  const { themeId } = useAppTheme();
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isAdmin = session?.email?.toLowerCase() === 'mohammed.dlshad0@gmail.com' || userProfile?.role === 'admin';
  const isManager = isAdmin || session?.email?.toLowerCase() === 'jalal.burghol@agent.com' || userProfile?.role === 'manager';
  const emailLower = (session?.email || userProfile?.email || '').toLowerCase().trim();
  const isTl = userProfile?.role === 'tl';
  const isYounis = (emailLower.includes('younis.kamal') || userProfile?.name?.toLowerCase().includes('younis kamal') || (isTl && userProfile?.team === 'Younis Kamal Team')) && !emailLower.includes('mohammed.jihad');
  const isAnkido = (emailLower.includes('ankido.buya') || userProfile?.name?.toLowerCase().includes('ankido buya') || (isTl && userProfile?.team === 'Ankido Buya Team')) && !emailLower.includes('lara.kamil');
  const canAccessQuality = isAdmin || isManager || isYounis || isAnkido || userProfile?.role === 'qa' || userProfile?.role === 'trainer';
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("theme") === "dark") return true;
      if (sp.get("theme") === "light") return false;
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Mandatory first-login password change for TL/Manager users
  const [tlNewPassword, setTlNewPassword] = useState('');
  const [tlConfirmPassword, setTlConfirmPassword] = useState('');
  const [tlPasswordError, setTlPasswordError] = useState('');
  const [tlPasswordLoading, setTlPasswordLoading] = useState(false);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const defaultPeriod = getPreviousMonthAndYear();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_selected_month");
      if (saved) return saved;
    }
    return defaultPeriod.month;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_selected_year");
      if (saved) return saved;
    }
    return defaultPeriod.year;
  });
  const [selectedTeam, setSelectedTeam] = useState<TeamName>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_selected_team") as TeamName;
      if (saved && TEAMS.includes(saved)) return saved;
    }
    return 'Younis Kamal Team';
  });
  const [rows, setRows] = useState<any[]>([]);
  const [showAgentPreview, setShowAgentPreview] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("view") === "agent" || sp.get("tab") === "agent") return true;
      return localStorage.getItem("app_show_agent_preview") === "true";
    }
    return false;
  });
  const [showQualityView, setShowQualityView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("view") === "quality" || sp.get("tab") === "quality") return true;
      return localStorage.getItem("app_show_quality_view") === "true";
    }
    return false;
  });
  const [showTopStarView, setShowTopStarView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("view") === "topstar" || sp.get("tab") === "topstar") return true;
      return localStorage.getItem("app_show_top_star_view") === "true";
    }
    return false;
  });
  const [showAnnualEvalView, setShowAnnualEvalView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("app_show_annual_eval_view");
      } catch (e) {}
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("view") === "evaluation" || sp.get("tab") === "evaluation") return true;
    }
    return false;
  });
  const [isPageTransitioning, setIsPageTransitioning] = useState<boolean>(false);
  const [isCombinedCallCenter, setIsCombinedCallCenter] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_combined_call_center") === "true";
    }
    return false;
  });
  const [showCcBreakdownModal, setShowCcBreakdownModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_combined_call_center", isCombinedCallCenter ? "true" : "false");
    }
  }, [isCombinedCallCenter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_show_quality_view", String(showQualityView));
    }
  }, [showQualityView]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_show_top_star_view", String(showTopStarView));
    }
  }, [showTopStarView]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_show_annual_eval_view", String(showAnnualEvalView));
    }
  }, [showAnnualEvalView]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_show_agent_preview", String(showAgentPreview));
    }
  }, [showAgentPreview]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_selected_team", selectedTeam);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_selected_month", selectedMonth);
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_selected_year", selectedYear);
    }
  }, [selectedYear]);

  // Drag-to-select table cells state & refs
  const [selectionStart, setSelectionStart] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const selectionStartRef = useRef<{ rowIndex: number; colIndex: number } | null>(null);
  const selectionEndRef = useRef<{ rowIndex: number; colIndex: number } | null>(null);
  const isSelectingRef = useRef(false);

  const updateSelection = (start: { rowIndex: number; colIndex: number } | null, end: { rowIndex: number; colIndex: number } | null) => {
    selectionStartRef.current = start;
    selectionEndRef.current = end;
    setSelectionStart(start);
    setSelectionEnd(end);
  };

  // In-memory cache for instant switching between months and teams (<5ms)
  const teamDataCacheRef = useRef<Record<string, { roster: any[]; allYearData: any[] }>>({});
  const qaCacheRef = useRef<Record<string, any>>({ ...BASELINE_QUALITY_EVALUATIONS });
  const selectedMonthRef = useRef(selectedMonth);
  const selectedTeamRef = useRef(selectedTeam);
  const selectedYearRef = useRef(selectedYear);

  useEffect(() => { selectedMonthRef.current = selectedMonth; }, [selectedMonth]);
  useEffect(() => { selectedTeamRef.current = selectedTeam; }, [selectedTeam]);
  useEffect(() => { selectedYearRef.current = selectedYear; }, [selectedYear]);

  // Real-time listener for quality evaluations: ensures live QA edits stream directly into qaCacheRef
  useEffect(() => {
    const numYear = Number(selectedYear);
    const yearList = !isNaN(numYear) ? [selectedYear, numYear] : [selectedYear];
    const q = query(
      collection(db, "quality_evaluations"),
      where("year", "in", yearList)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreDocs: Record<string, any> = {};
      snapshot.forEach(d => {
        firestoreDocs[d.id] = { id: d.id, ...d.data(), _fromFirestore: true };
      });
      expandQualityDocAliases(firestoreDocs);

      for (const [id, fDoc] of Object.entries(firestoreDocs)) {
        qaCacheRef.current[id] = mergeQualityDocs(qaCacheRef.current[id] || { id }, fDoc);
      }
      expandQualityDocAliases(qaCacheRef.current);
    }, (err) => {
      console.warn("Firestore QA evaluations listener in page.tsx:", err);
    });

    return () => unsubscribe();
  }, [selectedYear]);

  const inferQuarterFromMonth = (m: string) => {
    const up = (m || "").toUpperCase();
    if (["JAN", "FEB", "MAR", "Q1"].includes(up)) return "Q1";
    if (["APR", "MAY", "JUN", "Q2", "H1"].includes(up)) return "Q2";
    if (["JUL", "AUG", "SEP", "Q3"].includes(up)) return "Q3";
    return "Q4";
  };

  // Real-time KPI Sessions listener for Team Leader Dashboard PDF Signatures
  const [kpiSessionsMap, setKpiSessionsMap] = useState<Record<string, any>>({});
  const [showTlPdfModal, setShowTlPdfModal] = useState(false);
  const [tlPdfQuarter, setTlPdfQuarter] = useState<string>(() => inferQuarterFromMonth(selectedMonth));
  const [tlPdfWeek, setTlPdfWeek] = useState<number>(4);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "kpi_sessions"), (snapshot) => {
      const map: Record<string, any> = {};
      snapshot.forEach(d => {
        map[d.id] = { id: d.id, ...d.data() };
      });
      setKpiSessionsMap(map);
    }, (err) => {
      console.warn("Firestore kpi_sessions listener in page.tsx:", err);
    });

    return () => unsubscribe();
  }, []);

  const findKpiSession = useCallback((agentName: string, year: string, quarter: string, week: number) => {
    if (!agentName) return null;
    const slugs = getAllAgentSlugs(agentName);
    for (const s of slugs) {
      const docId = `${year}_${quarter}_w${week}_${s}`;
      if (kpiSessionsMap[docId]) return kpiSessionsMap[docId];
    }
    const qUp = String(quarter || "").toUpperCase();
    for (const rec of Object.values(kpiSessionsMap)) {
      if (
        String(rec.year) === String(year) &&
        String(rec.quarter || "").toUpperCase() === qUp &&
        Number(rec.week) === Number(week) &&
        isSameAgent(rec.agent_name || "", agentName)
      ) {
        return rec;
      }
    }
    return null;
  }, [kpiSessionsMap]);

  const [columnsMap, setColumnsMap] = useState<Record<string, ColumnConfig[]>>(DEFAULT_COLUMNS_MAP);

  // TL & Manager Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [newProfilePassword, setNewProfilePassword] = useState("");
  const [confirmProfilePassword, setConfirmProfilePassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleTLPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setTlPasswordError('');
    if (tlNewPassword !== tlConfirmPassword) {
      setTlPasswordError('Passwords do not match');
      return;
    }
    const check = validatePasswordSecurity(tlNewPassword);
    if (!check.isValid) {
      setTlPasswordError(check.error);
      return;
    }
    setTlPasswordLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, tlNewPassword);
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          mustChangePassword: false,
          passwordUpdated: true,
          passwordChangedAt: new Date().toISOString(),
        }, { merge: true });
        setUserProfile((prev: any) => ({
          ...prev,
          mustChangePassword: false,
          passwordUpdated: true,
        }));
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setTlPasswordError('Security session expired. Please log out and sign back in to change your password.');
      } else {
        setTlPasswordError(err.message || 'Failed to update password');
      }
    } finally {
      setTlPasswordLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    const cleanForgotEmail = forgotEmail.trim().toLowerCase();
    if (!cleanForgotEmail) {
      setForgotError("Please enter your email address");
      return;
    }
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanForgotEmail);
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setForgotError("Too many password reset requests. Please wait a few minutes before trying again.");
        setForgotLoading(false);
        return;
      }
      console.warn("Password reset notice:", err.code);
    } finally {
      setForgotLoading(false);
      setForgotSuccess("If an account exists with this email address, password reset instructions have been sent. Please check your inbox and spam folder.");
    }
  };

  const openProfileModal = () => {
    setProfileName(userProfile?.name || "");
    setProfilePhoto(userProfile?.photo_url || "");
    setNewProfilePassword("");
    setConfirmProfilePassword("");
    setProfileError("");
    setProfileSuccess("");
    setShowProfileModal(true);
  };

  const handleProfilePhotoUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setProfilePhoto(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTLProfile = async (e: any) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);

    try {
      if (newProfilePassword) {
        if (newProfilePassword !== confirmProfilePassword) {
          setProfileError("Passwords do not match");
          setSavingProfile(false);
          return;
        }
        const check = validatePasswordSecurity(newProfilePassword);
        if (!check.isValid) {
          setProfileError(check.error);
          setSavingProfile(false);
          return;
        }
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, newProfilePassword);
        }
      }

      if (session?.uid) {
        const payload: any = {
          name: profileName,
          photo_url: profilePhoto,
        };
        if (newProfilePassword) {
          payload.mustChangePassword = false;
          payload.passwordUpdated = true;
          payload.passwordChangedAt = new Date().toISOString();
        }
        await setDoc(doc(db, 'users', session.uid), payload, { merge: true });
        setUserProfile((prev: any) => ({
          ...prev,
          ...payload
        }));

        // Also sync photo to matching team_members document if it exists
        try {
          const tmSnap = await getDocs(collection(db, 'team_members'));
          const currentName = (userProfile?.name || profileName || "").trim().toLowerCase();
          for (const d of tmSnap.docs) {
            const data = d.data();
            const dName = (data.agent_name || data.name || "").trim().toLowerCase();
            if (dName && (dName === currentName || isSameAgent(dName, currentName))) {
              await setDoc(doc(db, 'team_members', d.id), { photo_url: profilePhoto, display_name: profileName }, { merge: true });
            }
          }
        } catch (tmErr) {
          console.error("Error syncing to team_members:", tmErr);
        }
      }

      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => {
        setShowProfileModal(false);
        setProfileSuccess("");
      }, 900);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Manage members modal
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [allMembers, setAllMembers] = useState<any[]>(DEFAULT_COMPANY_EMPLOYEES);
  
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberTeam, setNewMemberTeam] = useState<TeamName>('Younis Kamal Team');
  const [deleteTarget, setDeleteTarget] = useState<{ memberId: string; name: string; team: string } | null>(null);
  const [deleteTiming, setDeleteTiming] = useState<"next" | "current">("next");
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Edit Agents
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberTeam, setEditMemberTeam] = useState<TeamName>('Younis Kamal Team');

  // New/Edit Column state
  const [manageColsTeam, setManageColsTeam] = useState<string>('ALL');
  const [newColLabel, setNewColLabel] = useState("");
  const [newColType, setNewColType] = useState<'number'|'time'>('number');
  const [newColAgg, setNewColAgg] = useState<'sum'|'average'>('average');

  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editColLabel, setEditColLabel] = useState("");
  const [editColType, setEditColType] = useState<'number'|'time'>('number');
  const [editColAgg, setEditColAgg] = useState<'sum'|'average'>('average');

  const [yearMetrics, setYearMetrics] = useState<any[]>([]);
  const [showMonthLockModal, setShowMonthLockModal] = useState(false);
  const [adminBypassMonthLock, setAdminBypassMonthLock] = useState(false);

  // Compute if previous month is incomplete for team leader data entry lock
  const prevMonthIncompleteInfo = useMemo(() => {
    const upperMonth = (selectedMonth || "").toUpperCase();
    const currentMonthIdx = MONTHS.indexOf(upperMonth);
    if (currentMonthIdx <= 0) return null; // First month (JAN) or aggregate periods are not locked

    const yearNum = parseInt(selectedYear || "2026", 10);
    // Lock rule only applies from this month (OCT 2026) and for future months (NOV, DEC, 2027+)
    const octMonthIdx = MONTHS.indexOf("OCT"); // 9
    if (yearNum < 2026 || (yearNum === 2026 && currentMonthIdx < octMonthIdx)) {
      return null;
    }

    const prevMonth = MONTHS[currentMonthIdx - 1];
    const targetTeams = isCombinedCallCenter 
      ? ['Younis Kamal Team', 'Ankido Buya Team'] 
      : [selectedTeam];

    const prevMonthMembers = allMembers.filter(m => 
      targetTeams.includes(m.team) && 
      isMemberActiveInPeriod(m, prevMonth, selectedYear)
    );

    if (prevMonthMembers.length === 0) return null;

    const incompleteAgents: { name: string; missingFields: string[] }[] = [];

    const isFilled = (v: any) => {
      if (v === undefined || v === null) return false;
      const s = String(v).trim();
      return s !== "" && s !== "-" && s !== "–";
    };

    prevMonthMembers.forEach(member => {
      const memberTeam = member.team || selectedTeam;
      const isChat = memberTeam === 'Mohammed Dlshad Team';
      const memberKey = getCanonicalAgentName(member.agent_name || member.name || "");

      // Find member's metrics in yearMetrics for prevMonth
      const mRow = yearMetrics.find(r => 
        (r.month || "").toUpperCase() === prevMonth && 
        (r.team === memberTeam || !r.team || isCombinedCallCenter) &&
        isSameAgent(r.agent_name || "", memberKey)
      );

      const missing: string[] = [];

      if (!mRow) {
        if (isChat) {
          missing.push("Chat Handled", "Exam", "AHT", "ART", "Prod");
        } else {
          missing.push("Exam", "Prod", "AHT", "Hold", "Wrapup", "Handled");
        }
      } else {
        if (isChat) {
          if (!isFilled(mRow.chat_handled)) missing.push("Chat Handled");
          if (!isFilled(mRow.exam)) missing.push("Exam");
          if (!isFilled(mRow.aht)) missing.push("AHT");
          if (!isFilled(mRow.art)) missing.push("ART");
          if (!isFilled(mRow.productivity ?? mRow.prod)) missing.push("Prod");
        } else {
          if (!isFilled(mRow.exam)) missing.push("Exam");
          if (!isFilled(mRow.productivity ?? mRow.prod)) missing.push("Prod");
          if (!isFilled(mRow.aht)) missing.push("AHT");
          if (!isFilled(mRow.hold)) missing.push("Hold");
          if (!isFilled(mRow.wrapup)) missing.push("Wrapup");
          const handledVal = getRowValForCol(mRow, 'handled') || getRowValForCol(mRow, 'call_handled');
          if (!isFilled(handledVal)) missing.push("Handled");
          if (!isQualitySyncEnabled(selectedYear, prevMonth) && !isFilled(mRow.quality)) {
            missing.push("Quality");
          }
        }
      }

      if (missing.length > 0) {
        incompleteAgents.push({
          name: member.display_name || member.agent_name || memberKey,
          missingFields: missing
        });
      }
    });

    if (incompleteAgents.length > 0) {
      return {
        prevMonth,
        prevYear: selectedYear,
        totalAgents: prevMonthMembers.length,
        incompleteAgents
      };
    }

    return null;
  }, [selectedMonth, selectedYear, selectedTeam, isCombinedCallCenter, allMembers, yearMetrics]);

  const isCurrentMonthLocked = Boolean(prevMonthIncompleteInfo && !adminBypassMonthLock);

  const aggregateMap = AGGREGATE_MAP;
  const isAggregate = Object.keys(AGGREGATE_MAP).includes(selectedMonth);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    initGlobalModalScrollLock();
  }, []);

  // Team Leader -> Agent Dashboard Sync state
  const [tlSyncRegistry, setTlSyncRegistry] = useState<Record<string, any>>({});
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [showIncompleteSyncModal, setShowIncompleteSyncModal] = useState(false);
  const [showSyncedDetailsModal, setShowSyncedDetailsModal] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);

  const isAnyDashboardModalOpen = Boolean(
    showManageMembers ||
    showProfileModal ||
    showForgotModal ||
    showCcBreakdownModal ||
    showMonthLockModal ||
    showIncompleteSyncModal ||
    showSyncedDetailsModal ||
    showTlPdfModal ||
    deleteTarget
  );
  useBodyScrollLock(isAnyDashboardModalOpen);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "tl_agent_sync_status"), (snap) => {
      if (snap.exists()) {
        setTlSyncRegistry(snap.data()?.synced_months || {});
      } else {
        setTlSyncRegistry({});
      }
    }, (err) => {
      console.warn("tl_agent_sync_status snapshot error:", err);
    });
    return () => unsub();
  }, []);

  const currentSyncKey = useMemo(() => {
    const upperMonth = (selectedMonth || "").toUpperCase();
    if (isCombinedCallCenter) {
      return `${selectedYear}_${upperMonth}_Call Center Combined`;
    }
    return `${selectedYear}_${upperMonth}_${selectedTeam}`;
  }, [selectedYear, selectedMonth, isCombinedCallCenter, selectedTeam]);

  const isCurrentMonthSynced = useMemo(() => {
    if (isAggregate) return false;
    const upperMonth = (selectedMonth || "").toUpperCase();
    const isHistorical = Number(selectedYear) < 2026 || (Number(selectedYear) === 2026 && MONTHS.indexOf(upperMonth) < 8);
    if (isHistorical) return true;

    if (isCombinedCallCenter) {
      const yKey = `${selectedYear}_${upperMonth}_Younis Kamal Team`;
      const aKey = `${selectedYear}_${upperMonth}_Ankido Buya Team`;
      return Boolean(tlSyncRegistry[currentSyncKey]?.isSynced || (tlSyncRegistry[yKey]?.isSynced && tlSyncRegistry[aKey]?.isSynced));
    }
    return Boolean(tlSyncRegistry[currentSyncKey]?.isSynced);
  }, [selectedYear, selectedMonth, isCombinedCallCenter, selectedTeam, isAggregate, tlSyncRegistry, currentSyncKey]);

  const currentMonthSyncDetails = useMemo(() => {
    if (isCombinedCallCenter) {
      return tlSyncRegistry[currentSyncKey] || tlSyncRegistry[`${selectedYear}_${(selectedMonth || "").toUpperCase()}_Younis Kamal Team`] || null;
    }
    return tlSyncRegistry[currentSyncKey] || null;
  }, [tlSyncRegistry, currentSyncKey, isCombinedCallCenter, selectedYear, selectedMonth]);

  const currentMonthCompleteness = useMemo(() => {
    if (isAggregate) return null;
    const upperMonth = (selectedMonth || "").toUpperCase();
    if (!MONTHS.includes(upperMonth)) return null;

    if (!rows || rows.length === 0) {
      return {
        isComplete: false,
        totalAgents: 0,
        completedAgents: 0,
        incompleteAgents: []
      };
    }

    const isFilled = (v: any) => {
      if (v === undefined || v === null) return false;
      const s = String(v).trim();
      return s !== "" && s !== "-" && s !== "–";
    };

    const incompleteAgents: { name: string; missingFields: string[] }[] = [];

    rows.forEach(r => {
      const rTeam = r.team || selectedTeam;
      const isChat = rTeam === 'Mohammed Dlshad Team';
      const missing: string[] = [];

      if (isChat) {
        if (!isFilled(r.chat_handled)) missing.push("Chat Handled");
        if (!isFilled(r.exam)) missing.push("Exam");
        if (!isFilled(r.aht)) missing.push("AHT");
        if (!isFilled(r.art)) missing.push("ART");
        if (!isFilled(r.productivity ?? r.prod)) missing.push("Prod");
        if (!isQualitySyncEnabled(selectedYear, upperMonth) && !isFilled(r.quality)) {
          missing.push("Quality");
        }
      } else {
        if (!isFilled(r.exam)) missing.push("Exam");
        if (!isFilled(r.productivity ?? r.prod)) missing.push("Prod");
        if (!isFilled(r.aht)) missing.push("AHT");
        if (!isFilled(r.hold)) missing.push("Hold");
        if (!isFilled(r.wrapup)) missing.push("Wrapup");
        const handledVal = getRowValForCol(r, 'handled') || getRowValForCol(r, 'call_handled');
        if (!isFilled(handledVal)) missing.push("Handled");
        if (!isQualitySyncEnabled(selectedYear, upperMonth) && !isFilled(r.quality)) {
          missing.push("Quality");
        }
      }

      if (missing.length > 0) {
        incompleteAgents.push({
          name: r.display_name || r.agent_name || "Agent",
          missingFields: missing
        });
      }
    });

    const total = rows.length;
    const completed = total - incompleteAgents.length;

    return {
      isComplete: incompleteAgents.length === 0,
      totalAgents: total,
      completedAgents: completed,
      incompleteAgents
    };
  }, [isAggregate, selectedMonth, selectedYear, rows, selectedTeam]);

  const handleSyncData = async () => {
    if (isSyncingData || isAggregate) return;
    if (!currentMonthCompleteness || !currentMonthCompleteness.isComplete) {
      setShowIncompleteSyncModal(true);
      return;
    }

    setIsSyncingData(true);
    try {
      const syncDocRef = doc(db, "settings", "tl_agent_sync_status");
      const syncSnap = await getDoc(syncDocRef);
      const existing = syncSnap.exists() ? (syncSnap.data()?.synced_months || {}) : {};

      const upperMonth = (selectedMonth || "").toUpperCase();
      const syncTime = new Date().toISOString();
      const syncedBy = userProfile?.name || userProfile?.display_name || userProfile?.email || "Team Leader";

      const updated = { ...existing };

      if (isAdmin || isManager) {
        // ADMIN / MANAGER: Syncs for EVERYONE (all teams + call center combined)
        const allTeams = ['Younis Kamal Team', 'Ankido Buya Team', 'Mohammed Dlshad Team', 'Call Center Combined'];
        allTeams.forEach(t => {
          const key = `${selectedYear}_${upperMonth}_${t}`;
          updated[key] = {
            isSynced: true,
            isComplete: true,
            syncedAt: syncTime,
            syncedBy: `${syncedBy} (Manager/Admin)`,
            agentCount: currentMonthCompleteness.totalAgents,
            team: t,
            month: upperMonth,
            year: selectedYear
          };
        });
        // Global all key
        updated[`${selectedYear}_${upperMonth}_all`] = {
          isSynced: true,
          isComplete: true,
          syncedAt: syncTime,
          syncedBy: `${syncedBy} (Manager/Admin)`,
          month: upperMonth,
          year: selectedYear
        };

        await setDoc(syncDocRef, { synced_months: updated, updatedAt: syncTime }, { merge: true });

        // Invalidate Top Star cache so Top Star calculates rankings from latest TL data
        invalidateTopStarCache();
        try {
          const topStarDocRef = doc(db, "settings", "top_star_status");
          const topStarSnap = await getDoc(topStarDocRef);
          const tsExisting = topStarSnap.exists() ? (topStarSnap.data()?.synced_months || {}) : {};
          const tsUpdated = { ...tsExisting };
          tsUpdated[`${selectedYear}_${upperMonth}_call_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
          tsUpdated[`${selectedYear}_${upperMonth}_chat_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
          tsUpdated[`${selectedYear}_${upperMonth}_younis_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
          tsUpdated[`${selectedYear}_${upperMonth}_ankido_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
          await setDoc(topStarDocRef, { synced_months: tsUpdated, updatedAt: syncTime }, { merge: true });
        } catch (e) {
          console.warn("Could not sync top_star tl_ready status:", e);
        }
      } else {
        // TEAM LEADER: Only syncs for THEIR OWN TEAM
        let tlTeam: TeamName = selectedTeam;
        if (isYounis || userProfile?.team === 'Younis Kamal Team') {
          tlTeam = 'Younis Kamal Team';
        } else if (isAnkido || userProfile?.team === 'Ankido Buya Team') {
          tlTeam = 'Ankido Buya Team';
        } else if (userProfile?.team === 'Mohammed Dlshad Team' || emailLower.includes('mohammed.dlshad')) {
          tlTeam = 'Mohammed Dlshad Team';
        }

        const key = `${selectedYear}_${upperMonth}_${tlTeam}`;
        updated[key] = {
          isSynced: true,
          isComplete: true,
          syncedAt: syncTime,
          syncedBy,
          agentCount: currentMonthCompleteness.totalAgents,
          team: tlTeam,
          month: upperMonth,
          year: selectedYear
        };

        // If Call Center team, check if both Younis and Ankido have synced before activating Combined
        if (tlTeam === 'Younis Kamal Team' || tlTeam === 'Ankido Buya Team') {
          const yKey = `${selectedYear}_${upperMonth}_Younis Kamal Team`;
          const aKey = `${selectedYear}_${upperMonth}_Ankido Buya Team`;
          const isYounisSynced = tlTeam === 'Younis Kamal Team' ? true : Boolean(updated[yKey]?.isSynced);
          const isAnkidoSynced = tlTeam === 'Ankido Buya Team' ? true : Boolean(updated[aKey]?.isSynced);

          if (isYounisSynced && isAnkidoSynced) {
            updated[`${selectedYear}_${upperMonth}_Call Center Combined`] = {
              isSynced: true,
              isComplete: true,
              syncedAt: syncTime,
              syncedBy: "Both Team Leaders",
              month: upperMonth,
              year: selectedYear
            };
          } else {
            if (updated[`${selectedYear}_${upperMonth}_Call Center Combined`]) {
              updated[`${selectedYear}_${upperMonth}_Call Center Combined`] = {
                ...updated[`${selectedYear}_${upperMonth}_Call Center Combined`],
                isSynced: false
              };
            }
          }
        }

        await setDoc(syncDocRef, { synced_months: updated, updatedAt: syncTime }, { merge: true });

        // Invalidate Top Star cache so Top Star calculates rankings from latest TL data
        invalidateTopStarCache();
        try {
          const topStarDocRef = doc(db, "settings", "top_star_status");
          const topStarSnap = await getDoc(topStarDocRef);
          const tsExisting = topStarSnap.exists() ? (topStarSnap.data()?.synced_months || {}) : {};
          const tsUpdated = { ...tsExisting };

          if (tlTeam === 'Mohammed Dlshad Team') {
            tsUpdated[`${selectedYear}_${upperMonth}_chat_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
          } else if (tlTeam === 'Younis Kamal Team') {
            tsUpdated[`${selectedYear}_${upperMonth}_younis_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
            if (Boolean(tsExisting[`${selectedYear}_${upperMonth}_ankido_tl_ready`]?.isReady)) {
              tsUpdated[`${selectedYear}_${upperMonth}_call_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy: "Both Team Leaders" };
            }
          } else if (tlTeam === 'Ankido Buya Team') {
            tsUpdated[`${selectedYear}_${upperMonth}_ankido_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy };
            if (Boolean(tsExisting[`${selectedYear}_${upperMonth}_younis_tl_ready`]?.isReady)) {
              tsUpdated[`${selectedYear}_${upperMonth}_call_tl_ready`] = { isReady: true, readyAt: syncTime, syncedBy: "Both Team Leaders" };
            }
          }
          await setDoc(topStarDocRef, { synced_months: tsUpdated, updatedAt: syncTime }, { merge: true });
        } catch (e) {
          console.warn("Could not sync top_star tl_ready status:", e);
        }
      }

      setShowSyncedDetailsModal(false);
      setSyncSuccessToast(true);
      setTimeout(() => setSyncSuccessToast(false), 4500);
    } catch (err: any) {
      console.error("Error syncing data:", err);
      alert("Error syncing data: " + (err.message || "Unknown error"));
    } finally {
      setIsSyncingData(false);
    }
  };

  const handleUnsyncData = async () => {
    if (isSyncingData || isAggregate) return;
    setIsSyncingData(true);
    try {
      const syncDocRef = doc(db, "settings", "tl_agent_sync_status");
      const syncSnap = await getDoc(syncDocRef);
      const existing = syncSnap.exists() ? (syncSnap.data()?.synced_months || {}) : {};

      const upperMonth = (selectedMonth || "").toUpperCase();
      const updated = { ...existing };

      if (isAdmin || isManager) {
        const teamsToUnsync = isCombinedCallCenter
          ? ['Younis Kamal Team', 'Ankido Buya Team', 'Call Center Combined', 'all']
          : [selectedTeam];
        teamsToUnsync.forEach(t => {
          const key = t === 'all' ? `${selectedYear}_${upperMonth}_all` : `${selectedYear}_${upperMonth}_${t}`;
          if (updated[key]) {
            updated[key] = { ...updated[key], isSynced: false, unSyncedAt: new Date().toISOString() };
          }
        });
        if (!isCombinedCallCenter && updated[`${selectedYear}_${upperMonth}_Call Center Combined`]) {
          updated[`${selectedYear}_${upperMonth}_Call Center Combined`] = {
            ...updated[`${selectedYear}_${upperMonth}_Call Center Combined`],
            isSynced: false,
            unSyncedAt: new Date().toISOString()
          };
        }
      } else {
        let tlTeam: TeamName = selectedTeam;
        if (isYounis || userProfile?.team === 'Younis Kamal Team') {
          tlTeam = 'Younis Kamal Team';
        } else if (isAnkido || userProfile?.team === 'Ankido Buya Team') {
          tlTeam = 'Ankido Buya Team';
        } else if (userProfile?.team === 'Mohammed Dlshad Team' || emailLower.includes('mohammed.dlshad')) {
          tlTeam = 'Mohammed Dlshad Team';
        }

        const key = `${selectedYear}_${upperMonth}_${tlTeam}`;
        if (updated[key]) {
          updated[key] = { ...updated[key], isSynced: false, unSyncedAt: new Date().toISOString() };
        }
        const cKey = `${selectedYear}_${upperMonth}_Call Center Combined`;
        if (updated[cKey]) {
          updated[cKey] = { ...updated[cKey], isSynced: false, unSyncedAt: new Date().toISOString() };
        }
      }

      await setDoc(syncDocRef, { synced_months: updated, updatedAt: new Date().toISOString() }, { merge: true });
      setShowSyncedDetailsModal(false);
    } catch (err: any) {
      console.error("Error un-syncing data:", err);
      alert("Error un-syncing data: " + (err.message || "Unknown error"));
    } finally {
      setIsSyncingData(false);
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showManageMembers || showProfileModal || deleteTarget || showForgotModal || showMonthLockModal || showCcBreakdownModal || showIncompleteSyncModal || showSyncedDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showManageMembers, showProfileModal, deleteTarget, showForgotModal, showMonthLockModal, showCcBreakdownModal, showIncompleteSyncModal, showSyncedDetailsModal]);

  // Real-time columns synchronization across all teams, TLs, and Agents
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'columns_config'), (snap) => {
      const map: Record<string, ColumnConfig[]> = {};
      snap.docs.forEach(d => {
        const rawCols = d.data().columns || [];
        map[d.id] = sanitizeCols(rawCols);
      });
      for (const t of TEAMS) {
        if (!map[t] || map[t].length === 0) {
          map[t] = t === 'Mohammed Dlshad Team' ? DEFAULT_CHAT_COLUMNS : DEFAULT_OTHER_COLUMNS;
        } else {
          map[t] = sanitizeCols(map[t]);
        }
      }
      setColumnsMap(map);
    }, (err) => {
      console.error("Columns listener error:", err);
      setColumnsMap(prev => Object.keys(prev).length > 0 ? prev : DEFAULT_COLUMNS_MAP);
    });
    return () => unsub();
  }, []);

  // Real-time team members sync across all accounts (reactive to session authentication)
  useEffect(() => {
    if (!session) return;
    const unsub = onSnapshot(collection(db, 'team_members'), (snap) => {
      setAllMembers(prev => {
        const map = new Map<string, any>();
        DEFAULT_COMPANY_EMPLOYEES.forEach(m => {
          const canon = getCanonicalAgentName(m.agent_name);
          map.set(canon.toLowerCase().trim(), { ...m, agent_name: canon, name: canon });
        });
        snap.docs.forEach(d => {
          const data = d.data();
          const rawName = (data.agent_name || data.name || data.display_name || "").trim();
          if (rawName) {
            const canonName = getCanonicalAgentName(rawName);
            const k = canonName.toLowerCase().trim();
            const existing = map.get(k) || {};
            map.set(k, {
              ...existing,
              ...data,
              id: d.id,
              agent_name: canonName,
              name: canonName,
              team: data.team || existing.team || ""
            });
          }
        });
        return Array.from(map.values()).sort((a, b) => a.agent_name.localeCompare(b.agent_name));
      });
    }, (err) => {
      console.error("Members listener error:", err);
      setAllMembers(prev => prev.length > 0 ? prev : DEFAULT_COMPANY_EMPLOYEES);
    });

    // Also trigger direct fetch in case snapshot is delayed
    fetchAllMembers();

    return () => unsub();
  }, [session]);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const periods = ["Q1", "Q2", "Q3", "Q4", "H1", "H2"];

  const tableName =
    selectedTeam === 'Younis Kamal Team' ? 'younis_metrics' :
    selectedTeam === 'Ankido Buya Team' ? 'ankido_metrics' :
    'mohammed_metrics';

  const calcYearTeamStat = (col: ColumnConfig, teamFilter?: string) => {
    let metricsToUse = yearMetrics;
    if (teamFilter) {
      metricsToUse = yearMetrics.filter(r => r.team === teamFilter);
    }
    const validMetrics = metricsToUse.filter(r => {
      const val = getRowValForCol(r, col.id);
      return val !== "";
    });
    if (validMetrics.length === 0) return "-";

    if (col.type === 'time') {
      let totalSeconds = 0;
      validMetrics.forEach(r => {
        const val = getRowValForCol(r, col.id);
        const parts = val.split(':');
        if (parts.length === 3) {
          totalSeconds += (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
        } else if (parts.length === 2) {
          totalSeconds += (parseInt(parts[0]) * 60) + parseInt(parts[1]);
        } else {
          totalSeconds += parseInt(parts[0]) || 0;
        }
      });
      const resultSecs = col.aggregation === 'sum' ? totalSeconds : Math.round(totalSeconds / validMetrics.length);
      return `${Math.floor(resultSecs / 60).toString().padStart(2, '0')}:${(resultSecs % 60).toString().padStart(2, '0')}`;
    } else {
      const sum = validMetrics.reduce((acc, r) => acc + (parseFloat(getRowValForCol(r, col.id)) || 0), 0);
      const result = col.aggregation === 'sum' ? sum : sum / validMetrics.length;
      return Number.isInteger(result) ? result.toString() : result.toFixed(1);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const snap = await getDocs(collection(db, 'team_members'));
      setAllMembers(prev => {
        const map = new Map<string, any>();
        DEFAULT_COMPANY_EMPLOYEES.forEach(m => {
          const canon = getCanonicalAgentName(m.agent_name);
          map.set(canon.toLowerCase().trim(), { ...m, agent_name: canon, name: canon });
        });
        snap.docs.forEach(d => {
          const data = d.data();
          const rawName = (data.agent_name || data.name || data.display_name || "").trim();
          if (rawName) {
            const canonName = getCanonicalAgentName(rawName);
            const k = canonName.toLowerCase().trim();
            const existing = map.get(k) || {};
            map.set(k, {
              ...existing,
              ...data,
              id: d.id,
              agent_name: canonName,
              name: canonName,
              team: data.team || existing.team || ""
            });
          }
        });
        return Array.from(map.values()).sort((a, b) => a.agent_name.localeCompare(b.agent_name));
      });
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("app_show_annual_eval_view");
        localStorage.removeItem("app_auth_session");
      } catch (e) {}
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("preview") === "true" || sp.get("guest") === "true" || sp.get("demo") === "true") {
        const demoTeam = (sp.get("team") as TeamName) || "Mohammed Dlshad Team";
        const adminProfile: any = {
          role: "admin",
          isAdmin: true,
          team: demoTeam,
          name: "Mohammed Dlshad",
          email: "mohammed.dlshad0@gmail.com",
          photo_url: "",
          mustChangePassword: false,
          passwordUpdated: true,
        };
        setUserProfile(adminProfile);
        setSession({ email: "mohammed.dlshad0@gmail.com", uid: "demo-guest-admin" });
        if (TEAMS.includes(demoTeam)) {
          setSelectedTeam(demoTeam);
        }
        if (sp.get("theme") === "dark") {
          setIsDarkMode(true);
          document.body.classList.add("dark");
          document.documentElement.classList.add("dark");
          applyThemeToDocument(getCurrentThemeId());
        } else if (sp.get("theme") === "light") {
          setIsDarkMode(false);
          document.body.classList.remove("dark");
          document.documentElement.classList.remove("dark");
          applyThemeToDocument(getCurrentThemeId());
        }
        setAuthLoading(false);
        return;
      }


    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setSession(user);
      if (user) {
        const emailLower = user.email?.toLowerCase().trim() || '';
        const isMohammed = emailLower === 'mohammed.dlshad0@gmail.com';
        const isJalal = emailLower === 'jalal.burghol@agent.com';
        const isYounis = emailLower === 'younis.kamal@agent.com' || emailLower === 'younis.kamal.tl@agent.com' || emailLower.includes('younis.kamal');
        const isAnkido = emailLower === 'ankido.buya@agent.com';
        const isLara = emailLower === 'lara.kamil@agent.com';
        const isMohammedJihad = emailLower === 'mohammed.jihad@agent.com' || emailLower === 'mohammed.jihad.qa@agent.com' || emailLower.includes('mohammed.jihad');
        const isMohammedAzad = emailLower === 'mohammed.azad@agent.com' || emailLower === 'mohammed.azad.qa@agent.com' || emailLower.includes('mohammed.azad');
        const isAzad = (emailLower === 'azad.muhammad@agent.com' || emailLower === 'azad.mohammed@agent.com' || emailLower === 'azad.muhammad.reset@agent.com' || emailLower.startsWith('azad.muhammad') || emailLower.startsWith('azad.mohammed')) && !isMohammedAzad;
        const isMarwa = emailLower === 'marwa.shalaan@agent.com' || emailLower === 'marwa.shaalan@agent.com' || emailLower === 'marwa.shalaan.reset@agent.com' || emailLower === 'marwa.shalaan.reset2@agent.com' || emailLower.startsWith('marwa.shalaan') || emailLower.startsWith('marwa.shaalan');
        const isAya = emailLower === 'aya.yasin@agent.com' || emailLower === 'aya.yaseen@agent.com' || emailLower === 'aya.yasin.reset@agent.com' || emailLower.startsWith('aya.yasin') || emailLower.startsWith('aya.yaseen');
        const isShireen = emailLower === 'shireen.waisi@agent.com' || emailLower.includes('shireen.waisi') || emailLower.includes('shireen');
        const isAgent = emailLower.endsWith('@agent.com');

        // Instant optimistic role identification: Mohammed Dlshad (The Admin) is EXEMPT
        if (isMohammed) {
          let existingData: any = {};
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              existingData = userDoc.data();
            }
          } catch (err) {
            console.error("Error reading admin userDoc:", err);
          }

          const adminProfile: any = {
            ...existingData,
            role: 'admin',
            isAdmin: true,
            team: 'Mohammed Dlshad Team',
            name: existingData.name || 'Mohammed Dlshad',
            email: user.email,
            photo_url: existingData.photo_url || '',
            mustChangePassword: false,
            passwordUpdated: true,
          };
          setUserProfile(adminProfile);
          const savedTeam = typeof window !== 'undefined' ? localStorage.getItem('app_selected_team') as TeamName : null;
          if (!savedTeam || !TEAMS.includes(savedTeam)) {
            setSelectedTeam('Mohammed Dlshad Team');
          }
          setAuthLoading(false);
          setDoc(doc(db, 'users', user.uid), adminProfile, { merge: true }).catch(console.error);
          return;
        }

        // For ALL other users (Manager Jalal Burghol, Team Leaders Younis & Ankido, QA Lara & Mohammed Jihad, Trainer Mohammed Azad, Agents):
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const existingData = userDoc.exists() ? userDoc.data() : {};

          let role = existingData.role;
          let name = existingData.name;
          let team = existingData.team;

          if (isJalal) {
            role = 'manager';
            name = name || 'Jalal Burghol';
            team = 'All';
          } else if (isYounis) {
            role = 'tl';
            name = name || 'Younis Kamal';
            team = 'Younis Kamal Team';
            setSelectedTeam('Younis Kamal Team');
          } else if (isAnkido) {
            role = 'tl';
            name = name || 'Ankido Buya';
            team = 'Ankido Buya Team';
            setSelectedTeam('Ankido Buya Team');
          } else if (isLara) {
            role = 'qa';
            name = name || 'Lara Kamil';
            team = 'Ankido Buya Team';
          } else if (isMohammedJihad) {
            role = 'qa';
            name = name || 'Mohammed Jihad';
            team = 'Younis Kamal Team';
          } else if (isMohammedAzad) {
            role = 'trainer';
            name = name || 'Mohammed Azad';
            team = 'All Call Teams';
          } else if (isShireen) {
            role = 'backoffice';
            name = name || 'Shireen Waisi';
            team = 'Back Office';
          } else if (isAzad) {
            role = 'agent';
            name = name || 'Azad Muhammad';
            team = team || 'Younis Kamal Team';
          } else if (isMarwa) {
            role = 'agent';
            name = name || 'Marwa Shalaan';
            team = team || 'Ankido Buya Team';
          } else if (isAya) {
            role = 'agent';
            name = name || 'Aya Yasin';
            team = team || 'Ankido Buya Team';
          } else if (!role) {
            role = isAgent ? 'agent' : 'tl';
          }

          if (role === 'tl' && team) {
            setSelectedTeam(team as TeamName);
          }

          // Mandatory password change for everyone except Mohammed:
          // User must have explicitly completed the password change process (passwordUpdated === true)
          const hasUpdatedPassword = existingData.passwordUpdated === true;
          const canonicalEmail = isMohammedJihad
            ? 'mohammed.jihad@agent.com'
            : isYounis
            ? 'younis.kamal@agent.com'
            : isMohammedAzad
            ? 'mohammed.azad@agent.com'
            : isShireen
            ? 'shireen.waisi@agent.com'
            : isAzad
            ? 'azad.muhammad@agent.com'
            : isMarwa
            ? 'marwa.shalaan@agent.com'
            : isAya
            ? 'aya.yasin@agent.com'
            : user.email;

          const updatedProfile = {
            ...existingData,
            role,
            name: name || user.displayName || user.email?.split('@')[0],
            team: team || (isJalal ? 'All' : undefined),
            email: canonicalEmail,
            isAdmin: false,
            passwordUpdated: hasUpdatedPassword,
            mustChangePassword: !hasUpdatedPassword,
          };

          setUserProfile(updatedProfile);

          // Update Firestore
          setDoc(doc(db, 'users', user.uid), {
            role,
            name: updatedProfile.name,
            team: updatedProfile.team || null,
            email: canonicalEmail,
            isAdmin: false,
            passwordUpdated: hasUpdatedPassword,
            mustChangePassword: !hasUpdatedPassword,
          }, { merge: true }).catch(console.error);

        } catch (e) {
          console.error("Error fetching user profile:", e);
          const fallbackRole = isJalal ? 'manager' : (isYounis || isAnkido ? 'tl' : (isLara || isMohammedJihad ? 'qa' : (isMohammedAzad ? 'trainer' : (isShireen ? 'backoffice' : (isAgent ? 'agent' : 'tl')))));
          setUserProfile({
            role: fallbackRole,
            name: isJalal ? 'Jalal Burghol' : (isYounis ? 'Younis Kamal' : (isAnkido ? 'Ankido Buya' : (isLara ? 'Lara Kamil' : (isMohammedJihad ? 'Mohammed Jihad' : (isMohammedAzad ? 'Mohammed Azad' : (isShireen ? 'Shireen Waisi' : (isAzad ? 'Azad Muhammad' : (isMarwa ? 'Marwa Shalaan' : (isAya ? 'Aya Yasin' : user.email?.split('@')[0]))))))))),
            team: isYounis ? 'Younis Kamal Team' : (isAnkido ? 'Ankido Buya Team' : (isLara ? 'Ankido Buya Team' : (isMohammedJihad ? 'Younis Kamal Team' : (isMohammedAzad ? 'All Call Teams' : (isShireen ? 'Back Office' : (isAzad ? 'Younis Kamal Team' : (isMarwa || isAya ? 'Ankido Buya Team' : (isJalal ? 'All' : undefined)))))))),
            email: isMohammedJihad ? 'mohammed.jihad@agent.com' : (isYounis ? 'younis.kamal@agent.com' : (isMohammedAzad ? 'mohammed.azad@agent.com' : (isShireen ? 'shireen.waisi@agent.com' : (isAzad ? 'azad.muhammad@agent.com' : (isMarwa ? 'marwa.shalaan@agent.com' : (isAya ? 'aya.yasin@agent.com' : user.email)))))),
            isAdmin: false,
            passwordUpdated: false,
            mustChangePassword: true,
          });
        }
        setAuthLoading(false);
      } else {
        setUserProfile(null);
        setAuthLoading(false);
      }
    });

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      applyThemeToDocument(getCurrentThemeId());
    }

    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
      applyThemeToDocument(getCurrentThemeId());
    } else {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
      applyThemeToDocument(getCurrentThemeId());
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setAuthError(`Too many failed attempts. Please wait ${lockoutTimer} seconds before trying again.`);
      return;
    }
    setAuthError('');
    setLoginLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();



    try {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (firstErr: any) {
        if (cleanEmail === 'younis.kamal@agent.com') {
          await signInWithEmailAndPassword(auth, 'younis.kamal.tl@agent.com', password);
        } else if (cleanEmail === 'mohammed.jihad@agent.com') {
          await signInWithEmailAndPassword(auth, 'mohammed.jihad.qa@agent.com', password);
        } else if (cleanEmail === 'mohammed.azad@agent.com') {
          await signInWithEmailAndPassword(auth, 'mohammed.azad.qa@agent.com', password);
        } else if (cleanEmail === 'azad.muhammad@agent.com' || cleanEmail === 'azad.mohammed@agent.com' || cleanEmail.startsWith('azad.muhammad') || cleanEmail.startsWith('azad.mohammed')) {
          try {
            await signInWithEmailAndPassword(auth, 'azad.muhammad.reset@agent.com', password);
          } catch (passErr) {
            try {
              await signInWithEmailAndPassword(auth, 'azad.muhammad.reset@agent.com', 'Azad@2026');
            } catch {
              throw passErr;
            }
          }
        } else if (cleanEmail === 'marwa.shalaan@agent.com' || cleanEmail === 'marwa.shaalan@agent.com' || cleanEmail.startsWith('marwa.shalaan') || cleanEmail.startsWith('marwa.shaalan')) {
          try {
            await signInWithEmailAndPassword(auth, 'marwa.shalaan.reset2@agent.com', password);
          } catch (passErr) {
            try {
              await signInWithEmailAndPassword(auth, 'marwa.shalaan.reset2@agent.com', 'Password@2026');
            } catch {
              try {
                await signInWithEmailAndPassword(auth, 'marwa.shalaan.reset@agent.com', password);
              } catch {
                throw passErr;
              }
            }
          }
        } else if (cleanEmail === 'aya.yasin@agent.com' || cleanEmail === 'aya.yaseen@agent.com' || cleanEmail.startsWith('aya.yasin') || cleanEmail.startsWith('aya.yaseen')) {
          try {
            await signInWithEmailAndPassword(auth, 'aya.yasin.reset@agent.com', password);
          } catch (passErr) {
            try {
              await signInWithEmailAndPassword(auth, 'aya.yasin.reset@agent.com', 'Aya@2026');
            } catch {
              throw passErr;
            }
          }
        } else {
          throw firstErr;
        }
      }
      setLoginAttempts(0);
    } catch (err: any) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutTimer(30);
        setAuthError("Too many failed login attempts. Access temporarily locked for 30 seconds for security.");
      } else {
        const code = err.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-email') {
          setAuthError("Invalid email or password. Please verify your credentials and try again.");
        } else if (code === 'auth/too-many-requests') {
          setLockoutTimer(60);
          setAuthError("Unusual activity detected. Access temporarily restricted. Please reset your password or try again in a few minutes.");
        } else if (code === 'auth/user-disabled') {
          setAuthError("This user account has been deactivated. Please contact your system administrator.");
        } else if (code === 'auth/network-request-failed') {
          setAuthError("Network connection failed. Please check your internet connection.");
        } else {
          setAuthError("Sign in failed. Please verify your email and password.");
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("app_show_quality_view");
      localStorage.removeItem("app_show_agent_preview");
      localStorage.removeItem("app_auth_session");
    } catch (e) {}
    try {
      await signOut(auth);
    } catch (e) {}
    setSession(null);
    setUserProfile(null);
  };

  const handleNavigateDashboard = (target: ActiveDashboardType) => {
    // Smooth fade-out → update → fade-in transition
    setIsPageTransitioning(true);
    setTimeout(() => {
      setShowAnnualEvalView(false);
      setShowQualityView(false);
      setShowTopStarView(false);
      setShowAgentPreview(false);

      if (target === 'cc') {
        fetchData(true);
      } else if (target === 'agent') {
        if (userProfile?.role !== 'agent') {
          setShowAgentPreview(true);
        }
      } else if (target === 'quality') {
        setShowQualityView(true);
      } else if (target === 'topstar') {
        setShowTopStarView(true);
      } else if (target === 'evaluation') {
        setShowAnnualEvalView(true);
      }
      // Fade back in
      setTimeout(() => setIsPageTransitioning(false), 80);
    }, 180);
  };

  const timeToSec = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.toString().split(':');
    if (parts.length === 3) {
      return (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
    }
    if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    return parseInt(parts[0]) || 0;
  };

  const secToTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "";
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60).toString().padStart(2, '0');
    return `${m.toString().padStart(2, '0')}:${s}`;
  };

  // Helper to keep in-memory cache synchronized when editing cells
  // Helper to keep in-memory cache synchronized when editing cells
  const updateCachedMetric = (payload: any, docId?: string) => {
    const cacheKeys = isCombinedCallCenter 
      ? [`Combined_CallCenter_${selectedYear}`, `${payload.team || selectedTeam}_${selectedYear}`]
      : [`${selectedTeam}_${selectedYear}`];

    cacheKeys.forEach(cacheKey => {
      const cached = teamDataCacheRef.current[cacheKey];
      if (!cached) return;
      const pMonthUpper = (payload.month || "").trim().toUpperCase();
      const idx = cached.allYearData.findIndex((m: any) =>
        (docId && m.id === docId) ||
        (isSameAgent(m.agent_name || "", payload.agent_name || "") && (m.month || "").trim().toUpperCase() === pMonthUpper)
      );
      if (idx >= 0) {
        cached.allYearData[idx] = { ...cached.allYearData[idx], ...payload, ...(docId ? { id: docId } : {}) };
      } else {
        cached.allYearData.push({ ...payload, ...(docId ? { id: docId } : {}) });
      }
    });

    const activeKey = isCombinedCallCenter ? `Combined_CallCenter_${selectedYear}` : `${selectedTeam}_${selectedYear}`;
    if (teamDataCacheRef.current[activeKey]) {
      setYearMetrics([...teamDataCacheRef.current[activeKey].allYearData]);
    }
  };

  // Pure in-memory row computer (runs in <1ms)
  const buildComputedRows = (
    roster: any[],
    allYearData: any[],
    targetMonth: string,
    teamCols: ColumnConfig[],
    isAgg: boolean,
    qaCache: Record<string, any>,
    team: TeamName,
    year: string
  ) => {
    const activeRoster = roster.filter(member => isMemberActiveInPeriod(member, targetMonth, year));

    if (isAgg) {
      const monthsInPeriod = (aggregateMap[targetMonth] || []).map(m => m.toUpperCase());
      const metrics = allYearData.filter(m => monthsInPeriod.includes((m.month || "").toUpperCase()));
      const agentGroups: Record<string, any[]> = {};
      metrics.forEach(row => {
        const key = getCanonicalAgentName(row.agent_name || "");
        if (!agentGroups[key]) agentGroups[key] = [];
        agentGroups[key].push(row);
      });

      const aggregatedRows = activeRoster.map(member => {
        const memberKey = getCanonicalAgentName(member.agent_name || "");
        const agentRows = agentGroups[memberKey] || [];
        const avgRow: any = {
          _memberId: member.id,
          agent_name: memberKey,
          photo_url: member.photo_url || "",
          display_name: member.display_name || memberKey,
          team: member.team || team,
          _readonly: true
        };

        teamCols.forEach(col => {
          const vals = agentRows.map(r => getRowValForCol(r, col.id)).filter(v => v !== "");
          if (col.type === 'time') {
            const sumSecs = vals.reduce((acc, v) => acc + timeToSec(v), 0);
            const resultSecs = col.aggregation === 'sum' ? sumSecs : (vals.length > 0 ? sumSecs / vals.length : 0);
            avgRow[col.id] = vals.length > 0 ? secToTime(resultSecs) : "";
          } else {
            const sum = vals.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
            const result = col.aggregation === 'sum' ? sum : (vals.length > 0 ? sum / vals.length : 0);
            avgRow[col.id] = vals.length > 0 ? (Number.isInteger(result) ? result.toString() : result.toFixed(1)) : "";
          }
        });
        return avgRow;
      });

      const hasQualityCol = teamCols.some((c: any) => c.id === 'quality');
      if (hasQualityCol) {
        const syncedMonthsMap = qaCache['config_sync_status']?.synced_months || null;

        for (const row of aggregatedRows) {
          const rowTeam = row.team || team;
          const sectionSlug = getQaSectionSlug(rowTeam);
          const isChatT = rowTeam === 'Mohammed Dlshad Team';
          const agentName = row.agent_name;
          const agentKey = getCanonicalAgentName(agentName);
          const slugs = getAllAgentSlugs(agentName);
          let sumQ = 0;
          let cntQ = 0;

          for (const m of monthsInPeriod) {
            if (!isQualitySyncEnabled(year, m)) {
              // Prior to SEP 2026: strictly use manually entered metric quality
              const mRow = agentGroups[agentKey]?.find(r => (r.month || "").toUpperCase() === m);
              if (mRow && mRow.quality && mRow.quality !== 'V') {
                const num = parseFloat(String(mRow.quality).replace('%', ''));
                if (!isNaN(num)) {
                  sumQ += num;
                  cntQ++;
                }
              }
              continue;
            }

            const syncKey = `${year}_${m.toUpperCase()}_${sectionSlug}`;
            if (syncedMonthsMap && !syncedMonthsMap[syncKey]) {
              continue;
            }

            const wr = getQualityWeekRange(m);
            if (!wr) continue;
            let cachedQa = null;
            for (const s of slugs) {
              const docId = `${year}_${wr.quarter}_${sectionSlug}_${s}`;
              if (qaCache[docId]) {
                cachedQa = qaCache[docId];
                break;
              }
            }
            if (cachedQa && cachedQa.scores) {
              const { isComplete, qualityAvg } = computeVerifiedMonthlyQuality(cachedQa.scores, wr, isChatT, year);
              if (isComplete && qualityAvg && qualityAvg !== 'V') {
                const num = parseFloat(qualityAvg);
                if (!isNaN(num)) {
                  sumQ += num;
                  cntQ++;
                }
              }
            } else {
              // Fallback to month's existing metric quality if present
              const mRow = agentGroups[agentKey]?.find(r => (r.month || "").toUpperCase() === m);
              if (mRow && mRow.quality && mRow.quality !== 'V') {
                const num = parseFloat(String(mRow.quality).replace('%', ''));
                if (!isNaN(num)) {
                  sumQ += num;
                  cntQ++;
                }
              }
            }
          }

          if (cntQ > 0) {
            row['quality'] = (sumQ / cntQ).toFixed(1);
          } else {
            row['quality'] = "";
          }
        }
      }

      return aggregatedRows;
    } else {
      // Single month
      const targetUpper = (targetMonth || "").toUpperCase();
      const metrics = allYearData.filter(m => (m.month || "").toUpperCase() === targetUpper);
      const metricsByAgent: Record<string, any> = {};
      metrics.forEach(row => {
        const key = getCanonicalAgentName(row.agent_name || "");
        if (!metricsByAgent[key]) {
          metricsByAgent[key] = { ...row, agent_name: key };
        } else {
          // Merge non-empty values so an empty duplicate document never overwrites saved metrics
          const current = metricsByAgent[key];
          Object.entries(row).forEach(([k, v]) => {
            if (v !== undefined && v !== null && String(v).trim() !== "") {
              current[k] = v;
            }
          });
        }
      });

      const mergedRows = activeRoster.map(member => {
        const memberKey = getCanonicalAgentName(member.agent_name || "");
        const existing = metricsByAgent[memberKey];
        if (existing) {
          const rowData = {
            ...existing,
            agent_name: memberKey,
            _memberId: member.id,
            photo_url: member.photo_url || "",
            display_name: member.display_name || memberKey,
            team: member.team || team
          };
          if (teamCols.some(c => c.id === 'call_handled') && (rowData.call_handled === undefined || rowData.call_handled === '')) {
            const computedVal = getRowValForCol(rowData, 'call_handled');
            if (computedVal !== "") {
              rowData.call_handled = computedVal;
            }
          }
          return rowData;
        }
        const empty: any = {
          _memberId: member.id,
          agent_name: memberKey,
          photo_url: member.photo_url || "",
          display_name: member.display_name || memberKey,
          team: member.team || team
        };
        teamCols.forEach(col => empty[col.id] = "");
        return empty;
      });

      const hasQualityCol = teamCols.some((c: any) => c.id === 'quality');
      // Only sync from quality_evaluations starting from SEP 2026 onwards; JAN–AUG 2026 keep manual values
      if (hasQualityCol && isQualitySyncEnabled(year, targetMonth)) {
        const wr = getQualityWeekRange(targetMonth);
        const syncedMonthsMap = qaCache['config_sync_status']?.synced_months || null;

        if (wr) {
          for (const row of mergedRows) {
            const rowTeam = row.team || team;
            const sectionSlug = getQaSectionSlug(rowTeam);
            const isChatT = rowTeam === 'Mohammed Dlshad Team';
            const syncKey = `${year}_${targetMonth.toUpperCase()}_${sectionSlug}`;
            const isMonthSynced = !syncedMonthsMap || Boolean(syncedMonthsMap[syncKey]);

            if (!isMonthSynced) {
              row['quality'] = "";
              continue;
            }
            const agentName = row.agent_name;
            const slugs = getAllAgentSlugs(agentName);
            let cachedQa = null;
            for (const s of slugs) {
              const docId = `${year}_${wr.quarter}_${sectionSlug}_${s}`;
              if (qaCache[docId]) {
                cachedQa = qaCache[docId];
                break;
              }
            }
            if (cachedQa && cachedQa.scores) {
              const { isComplete, qualityAvg } = computeVerifiedMonthlyQuality(cachedQa.scores, wr, isChatT, year);
              if (isComplete && qualityAvg) {
                row['quality'] = qualityAvg;
              } else {
                row['quality'] = "";
              }
            }
            // If cachedQa is not in cache yet, row['quality'] from allYearData is kept!
          }
        }
      }

      return mergedRows;
    }
  };

  // Background fetch for missing QA docs in parallel without blocking UI
  const fetchMissingQaDocs = async (
    roster: any[],
    monthsToCheck: string[],
    team: TeamName,
    year: string,
    tName: string
  ) => {
    const teamCols = columnsMap[team] || [];
    const hasQualityCol = teamCols.some((c: any) => c.id === 'quality');
    if (!hasQualityCol) return;

    const syncEnabledMonths = monthsToCheck.filter(m => isQualitySyncEnabled(year, m));
    if (syncEnabledMonths.length === 0) return;

    const sectionSlug = getQaSectionSlug(team);
    const isChatT = team === 'Mohammed Dlshad Team';
    const toFetch: { docId: string; allDocIds?: string[]; month: string; member: any }[] = [];

    if (qaCacheRef.current['config_sync_status'] === undefined) {
      qaCacheRef.current['config_sync_status'] = null;
      try {
        const syncSnap = await getDoc(doc(db, 'quality_evaluations', 'config_sync_status'));
        qaCacheRef.current['config_sync_status'] = syncSnap.exists() ? syncSnap.data() : {};
      } catch {
        qaCacheRef.current['config_sync_status'] = {};
      }
    }

    for (const m of syncEnabledMonths) {
      const wr = getQualityWeekRange(m);
      if (!wr) continue;
      for (const member of roster) {
        const slugs = getAllAgentSlugs(member.agent_name);
        const alreadyVerified = slugs.some(s => qaCacheRef.current[`${year}_${wr.quarter}_${sectionSlug}_${s}`]?._fromFirestore);
        if (!alreadyVerified) {
          toFetch.push({ 
            docId: `${year}_${wr.quarter}_${sectionSlug}_${slugs[0]}`,
            allDocIds: slugs.map(s => `${year}_${wr.quarter}_${sectionSlug}_${s}`),
            month: m, 
            member 
          });
        }
      }
    }

    if (toFetch.length === 0) return;

    // Mark pending with null placeholder only if not already having baseline data
    toFetch.forEach(item => {
      (item as any).allDocIds?.forEach((id: string) => {
        if (!qaCacheRef.current[id]) {
          qaCacheRef.current[id] = null;
        }
      });
    });

    try {
      const snaps = await Promise.all(
        toFetch.map(async (item: any) => {
          // Try primary docId first
          try {
            const snap = await getDoc(doc(db, 'quality_evaluations', item.docId));
            if (snap.exists()) return { ...snap.data(), _fromFirestore: true };
          } catch {}
          // Try alternate alias docIds if primary doesn't exist
          if (item.allDocIds) {
            for (let i = 1; i < item.allDocIds.length; i++) {
              try {
                const altSnap = await getDoc(doc(db, 'quality_evaluations', item.allDocIds[i]));
                if (altSnap.exists()) return { ...altSnap.data(), _fromFirestore: true };
              } catch {}
            }
          }
          // Fallback to baseline
          const idsToCheck = item.allDocIds || [item.docId];
          for (const dId of idsToCheck) {
            const baseDoc = BASELINE_QUALITY_EVALUATIONS[dId] || getQualityEvalDoc(BASELINE_QUALITY_EVALUATIONS, dId);
            if (baseDoc) return baseDoc;
          }
          return null;
        })
      );

      let hasNewData = false;
      const syncedMonthsMap = qaCacheRef.current['config_sync_status']?.synced_months || null;

      snaps.forEach((data, idx) => {
        const { docId, allDocIds, month, member } = toFetch[idx] as any;
        const targetIds = allDocIds || [docId];
        if (data) {
          targetIds.forEach((id: string) => {
            qaCacheRef.current[id] = mergeQualityDocs(qaCacheRef.current[id] || { id }, data);
          });
          expandQualityDocAliases(qaCacheRef.current);
          hasNewData = true;

          // If this is for a sync-enabled month (SEP 2026+) that has been synced and quality is complete, keep metric table in sync
          const wr = getQualityWeekRange(month);
          const syncKey = `${year}_${month.toUpperCase()}_${sectionSlug}`;
          const isMonthSynced = !syncedMonthsMap || Boolean(syncedMonthsMap[syncKey]);
          if (wr && data.scores && isQualitySyncEnabled(year, month) && isMonthSynced) {
            const { isComplete, qualityAvg } = computeVerifiedMonthlyQuality(data.scores, wr, isChatT, year);
            if (isComplete && qualityAvg) {
              const cacheKey = `${team}_${year}`;
              const cached = teamDataCacheRef.current[cacheKey];
              const existingMetric = cached?.allYearData.find(
                (r: any) => isSameAgent(r.agent_name, member.agent_name) && r.month === month
              );
              if (existingMetric && existingMetric.quality !== qualityAvg) {
                existingMetric.quality = qualityAvg;
                if (existingMetric.id) {
                  updateDoc(doc(db, tName, existingMetric.id), { quality: qualityAvg }).catch(console.error);
                }
              }
            }
          }
        } else {
          targetIds.forEach((id: string) => {
            qaCacheRef.current[id] = {};
          });
        }
      });

      if (hasNewData) {
        const cacheKey = `${team}_${year}`;
        const cached = teamDataCacheRef.current[cacheKey];
        if (cached && selectedTeamRef.current === team && selectedYearRef.current === year) {
          const currentMonth = selectedMonthRef.current;
          const isAgg = Object.keys(aggregateMap).includes(currentMonth);
          const updated = buildComputedRows(
            cached.roster,
            cached.allYearData,
            currentMonth,
            teamCols,
            isAgg,
            qaCacheRef.current,
            team,
            year
          );
          setRows(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching QA docs in background:", err);
    }
  };

  const fetchData = async (forceRefresh = false) => {
    if (!session) return;

    if (isCombinedCallCenter) {
      const cacheKey = `Combined_CallCenter_${selectedYear}`;
      const effectiveCols = columnsMap['Ankido Buya Team'] || columnsMap['Younis Kamal Team'] || DEFAULT_OTHER_COLUMNS;
      const teamCols = getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, effectiveCols);
      const isAgg = Object.keys(aggregateMap).includes(selectedMonth);

      // Fast path: In-memory cache hit
      if (!forceRefresh && teamDataCacheRef.current[cacheKey]) {
        const { roster, allYearData } = teamDataCacheRef.current[cacheKey];
        setYearMetrics(allYearData);
        const computed = buildComputedRows(
          roster,
          allYearData,
          selectedMonth,
          teamCols,
          isAgg,
          qaCacheRef.current,
          'Ankido Buya Team',
          selectedYear
        );
        setRows(computed);
        setLoading(false);
        const monthsToCheck = isAgg ? (aggregateMap[selectedMonth] || []) : [selectedMonth];
        fetchMissingQaDocs(roster.filter(m => m.team === 'Younis Kamal Team'), monthsToCheck, 'Younis Kamal Team', selectedYear, 'younis_metrics');
        fetchMissingQaDocs(roster.filter(m => m.team === 'Ankido Buya Team'), monthsToCheck, 'Ankido Buya Team', selectedYear, 'ankido_metrics');
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      const defaultYounis = DEFAULT_COMPANY_EMPLOYEES.filter(m => m.team === 'Younis Kamal Team');
      const defaultAnkido = DEFAULT_COMPANY_EMPLOYEES.filter(m => m.team === 'Ankido Buya Team');
      const defaultCombinedRoster = [...defaultYounis, ...defaultAnkido].sort((a, b) => a.agent_name.localeCompare(b.agent_name));
      const defaultBaselineMetrics = BASELINE_TEAM_METRICS.filter(m => (m.team === 'Younis Kamal Team' || m.team === 'Ankido Buya Team') && (m.year === selectedYear || String(m.year) === String(selectedYear)));

      const numYear = Number(selectedYear);
      const yearList = !isNaN(numYear) ? [selectedYear, numYear] : [selectedYear];

      try {
        const [younisMembersSnap, ankidoMembersSnap, younisMetricsSnap, ankidoMetricsSnap] = await Promise.all([
          getDocs(query(collection(db, 'team_members'), where('team', '==', 'Younis Kamal Team'))).catch(() => null),
          getDocs(query(collection(db, 'team_members'), where('team', '==', 'Ankido Buya Team'))).catch(() => null),
          getDocs(query(collection(db, 'younis_metrics'), where('year', 'in', yearList))).catch(() => null),
          getDocs(query(collection(db, 'ankido_metrics'), where('year', 'in', yearList))).catch(() => null)
        ]);

        const younisRosterMap = new Map<string, any>();
        defaultYounis.forEach(m => {
          const c = getCanonicalAgentName(m.agent_name);
          younisRosterMap.set(c.toLowerCase().trim(), { ...m, agent_name: c, name: c });
        });
        if (younisMembersSnap && younisMembersSnap.docs.length > 0) {
          younisMembersSnap.docs.forEach(d => {
            const data = d.data();
            const raw = (data.agent_name || data.name || "").trim();
            if (raw) {
              const c = getCanonicalAgentName(raw);
              const k = c.toLowerCase().trim();
              const existing = younisRosterMap.get(k) || {};
              younisRosterMap.set(k, { ...existing, ...data, id: d.id, agent_name: c, name: c, team: 'Younis Kamal Team' });
            }
          });
        }
        const younisRoster = Array.from(younisRosterMap.values());

        const ankidoRosterMap = new Map<string, any>();
        defaultAnkido.forEach(m => {
          const c = getCanonicalAgentName(m.agent_name);
          ankidoRosterMap.set(c.toLowerCase().trim(), { ...m, agent_name: c, name: c });
        });
        if (ankidoMembersSnap && ankidoMembersSnap.docs.length > 0) {
          ankidoMembersSnap.docs.forEach(d => {
            const data = d.data();
            const raw = (data.agent_name || data.name || "").trim();
            if (raw) {
              const c = getCanonicalAgentName(raw);
              const k = c.toLowerCase().trim();
              const existing = ankidoRosterMap.get(k) || {};
              ankidoRosterMap.set(k, { ...existing, ...data, id: d.id, agent_name: c, name: c, team: 'Ankido Buya Team' });
            }
          });
        }
        const ankidoRoster = Array.from(ankidoRosterMap.values());
        const roster = [...younisRoster, ...ankidoRoster].sort((a: any, b: any) => (a.agent_name > b.agent_name ? 1 : -1));

        const younisNames = new Set(younisRoster.map((d: any) => getCanonicalAgentName(d.agent_name || "")));
        const ankidoNames = new Set(ankidoRoster.map((d: any) => getCanonicalAgentName(d.agent_name || "")));

        // Younis metrics: baseline fallback + live Firestore overlay (live edits strictly take precedence)
        const younisMap = new Map<string, any>();
        defaultBaselineMetrics
          .filter(m => m.team === 'Younis Kamal Team' && younisNames.has(getCanonicalAgentName(m.agent_name || "")))
          .forEach(d => {
            const canon = getCanonicalAgentName(d.agent_name || "");
            const m = (d.month || "").toUpperCase();
            if (canon && m) younisMap.set(`${canon}_${m}`, { ...d, team: 'Younis Kamal Team', _fromBaseline: true });
          });
        if (younisMetricsSnap && younisMetricsSnap.docs.length > 0) {
          younisMetricsSnap.docs.forEach(d => {
            const data = d.data();
            const canon = getCanonicalAgentName(data.agent_name || "");
            if (canon && younisNames.has(canon)) {
              const m = (data.month || "").toUpperCase();
              const key = `${canon}_${m}`;
              const existing = younisMap.get(key) || {};
              younisMap.set(key, { ...existing, ...data, id: d.id, agent_name: canon, team: 'Younis Kamal Team', _fromFirestore: true });
            }
          });
        }
        const younisData = Array.from(younisMap.values());

        // Ankido metrics: baseline fallback + live Firestore overlay (live edits strictly take precedence)
        const ankidoMap = new Map<string, any>();
        defaultBaselineMetrics
          .filter(m => m.team === 'Ankido Buya Team' && ankidoNames.has(getCanonicalAgentName(m.agent_name || "")))
          .forEach(d => {
            const canon = getCanonicalAgentName(d.agent_name || "");
            const m = (d.month || "").toUpperCase();
            if (canon && m) ankidoMap.set(`${canon}_${m}`, { ...d, team: 'Ankido Buya Team', _fromBaseline: true });
          });
        if (ankidoMetricsSnap && ankidoMetricsSnap.docs.length > 0) {
          ankidoMetricsSnap.docs.forEach(d => {
            const data = d.data();
            const canon = getCanonicalAgentName(data.agent_name || "");
            if (canon && ankidoNames.has(canon)) {
              const m = (data.month || "").toUpperCase();
              const key = `${canon}_${m}`;
              const existing = ankidoMap.get(key) || {};
              ankidoMap.set(key, { ...existing, ...data, id: d.id, agent_name: canon, team: 'Ankido Buya Team', _fromFirestore: true });
            }
          });
        }
        const ankidoData = Array.from(ankidoMap.values());

        let allYearData = [...younisData, ...ankidoData];
        if (allYearData.length === 0 && defaultBaselineMetrics.length > 0) {
          allYearData = defaultBaselineMetrics;
        }

        teamDataCacheRef.current[cacheKey] = { roster, allYearData };
        setYearMetrics(allYearData);

        const computed = buildComputedRows(
          roster,
          allYearData,
          selectedMonth,
          teamCols,
          isAgg,
          qaCacheRef.current,
          'Ankido Buya Team',
          selectedYear
        );
        setRows(computed);

        const monthsToCheck = isAgg ? (aggregateMap[selectedMonth] || []) : [selectedMonth];
        fetchMissingQaDocs(younisRoster, monthsToCheck, 'Younis Kamal Team', selectedYear, 'younis_metrics');
        fetchMissingQaDocs(ankidoRoster, monthsToCheck, 'Ankido Buya Team', selectedYear, 'ankido_metrics');
      } catch (err: any) {
        console.error("Error fetching combined data:", err);
        setErrorMsg(err.message);
        const roster = defaultCombinedRoster;
        const allYearData = defaultBaselineMetrics;
        setYearMetrics(allYearData);
        const computed = buildComputedRows(
          roster,
          allYearData,
          selectedMonth,
          teamCols,
          isAgg,
          qaCacheRef.current,
          'Ankido Buya Team',
          selectedYear
        );
        setRows(computed);
      } finally {
        setLoading(false);
      }
      return;
    }

    const cacheKey = `${selectedTeam}_${selectedYear}`;
    const effectiveCols = columnsMap[selectedTeam] || (selectedTeam === 'Mohammed Dlshad Team' ? DEFAULT_CHAT_COLUMNS : DEFAULT_OTHER_COLUMNS);
    const teamCols = getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, effectiveCols);
    const isAgg = Object.keys(aggregateMap).includes(selectedMonth);

    // 1. FAST PATH: In-memory cache hit -> INSTANT rendering (<1ms, zero spinner delay)
    if (!forceRefresh && teamDataCacheRef.current[cacheKey]) {
      const { roster, allYearData } = teamDataCacheRef.current[cacheKey];
      setYearMetrics(allYearData);
      const computed = buildComputedRows(
        roster,
        allYearData,
        selectedMonth,
        teamCols,
        isAgg,
        qaCacheRef.current,
        selectedTeam,
        selectedYear
      );
      setRows(computed);
      setLoading(false);

      const monthsToCheck = isAgg ? (aggregateMap[selectedMonth] || []) : [selectedMonth];
      fetchMissingQaDocs(roster, monthsToCheck, selectedTeam, selectedYear, tableName);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const defaultRoster = DEFAULT_COMPANY_EMPLOYEES.filter(m => m.team === selectedTeam);
    const defaultMetrics = BASELINE_TEAM_METRICS.filter(m => m.team === selectedTeam && (m.year === selectedYear || String(m.year) === String(selectedYear)));

    const numYear = Number(selectedYear);
    const yearList = !isNaN(numYear) ? [selectedYear, numYear] : [selectedYear];

    try {
      const [membersSnap, metricsSnap] = await Promise.all([
        getDocs(query(collection(db, 'team_members'), where('team', '==', selectedTeam))).catch(() => null),
        getDocs(query(collection(db, tableName), where('team', '==', selectedTeam), where('year', 'in', yearList))).catch(() => null)
      ]);

      const memberMap = new Map<string, any>();
      defaultRoster.forEach(m => {
        const canon = getCanonicalAgentName(m.agent_name);
        memberMap.set(canon.toLowerCase().trim(), { ...m, agent_name: canon, name: canon });
      });
      if (membersSnap && membersSnap.docs.length > 0) {
        membersSnap.docs.forEach(d => {
          const data = d.data();
          const rawName = (data.agent_name || data.name || "").trim();
          if (rawName) {
            const canon = getCanonicalAgentName(rawName);
            const k = canon.toLowerCase().trim();
            const existing = memberMap.get(k) || {};
            memberMap.set(k, {
              ...existing,
              ...data,
              id: d.id,
              agent_name: canon,
              name: canon,
              team: data.team || existing.team || selectedTeam
            });
          }
        });
      }
      const roster = Array.from(memberMap.values()).sort((a, b) => a.agent_name.localeCompare(b.agent_name));

      const rosterNames = new Set(roster.map(d => getCanonicalAgentName(d.agent_name || "")));
      const metricsMap = new Map<string, any>();
      defaultMetrics
        .filter((d: any) => rosterNames.has(getCanonicalAgentName(d.agent_name || "")))
        .forEach((d: any) => {
          const canon = getCanonicalAgentName(d.agent_name || "");
          const m = (d.month || "").toUpperCase();
          if (canon && m) {
            metricsMap.set(`${canon}_${m}`, { ...d, _fromBaseline: true });
          }
        });

      if (metricsSnap && metricsSnap.docs.length > 0) {
        metricsSnap.docs.forEach(d => {
          const data = d.data();
          const canon = getCanonicalAgentName(data.agent_name || "");
          if (canon && rosterNames.has(canon)) {
            const m = (data.month || "").toUpperCase();
            const key = `${canon}_${m}`;
            const existing = metricsMap.get(key) || {};
            metricsMap.set(key, { ...existing, ...data, id: d.id, agent_name: canon, _fromFirestore: true });
          }
        });
      }

      let allYearData = Array.from(metricsMap.values());
      if (allYearData.length === 0 && defaultMetrics.length > 0) {
        allYearData = defaultMetrics;
      }

      teamDataCacheRef.current[cacheKey] = { roster, allYearData };
      setYearMetrics(allYearData);

      const computed = buildComputedRows(
        roster,
        allYearData,
        selectedMonth,
        teamCols,
        isAgg,
        qaCacheRef.current,
        selectedTeam,
        selectedYear
      );
      setRows(computed);

      const monthsToCheck = isAgg ? (aggregateMap[selectedMonth] || []) : [selectedMonth];
      fetchMissingQaDocs(roster, monthsToCheck, selectedTeam, selectedYear, tableName);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setErrorMsg(err.message);
      const roster = defaultRoster;
      const allYearData = defaultMetrics;
      setYearMetrics(allYearData);
      const computed = buildComputedRows(
        roster,
        allYearData,
        selectedMonth,
        teamCols,
        isAgg,
        qaCacheRef.current,
        selectedTeam,
        selectedYear
      );
      setRows(computed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedMonth, selectedTeam, selectedYear, session, columnsMap, isCombinedCallCenter]);

  const handleChange = (index: number, field: string, value: string) => {
    if (isCurrentMonthLocked) {
      setShowMonthLockModal(true);
      return;
    }
    const teamCols = isCombinedCallCenter
      ? getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || DEFAULT_OTHER_COLUMNS)
      : getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);
    const col = teamCols.find(c => c.id === field);
    if (col && col.type === 'time') {
      const trimmed = value.trim();
      // If user pasted/typed 2 or more colons (hours format e.g. 00:01:54)
      if ((trimmed.match(/:/g) || []).length >= 2) {
        value = formatToMinutesAndSeconds(trimmed);
      } else {
        // Strip any characters that are not digits or colon
        value = value.replace(/[^0-9:]/g, '');
        // Disallow hours: max 1 colon allowed!
        const parts = value.split(':');
        if (parts.length > 2) {
          value = parts[0] + ':' + parts[1];
        }
        // Limit seconds to 2 digits max (SS)
        if (parts.length === 2 && parts[1].length > 2) {
          value = parts[0] + ':' + parts[1].slice(0, 2);
        }
      }
    }
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleBlur = async (index: number) => {
    if (isAggregate || isCurrentMonthLocked) return;
    const row = rows[index];
    if (!row || !row.agent_name) return;

    const teamCols = isCombinedCallCenter
      ? getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || DEFAULT_OTHER_COLUMNS)
      : getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);
    const updatedRow = { ...row };
    let hasTimeFormatChanged = false;

    teamCols.forEach(col => {
      if (col.type === 'time' && updatedRow[col.id] && updatedRow[col.id].toString().trim() !== '') {
        const formatted = formatToMinutesAndSeconds(updatedRow[col.id]);
        if (formatted !== updatedRow[col.id]) {
          updatedRow[col.id] = formatted;
          hasTimeFormatChanged = true;
        }
      }
    });

    if (hasTimeFormatChanged) {
      const newRows = [...rows];
      newRows[index] = updatedRow;
      setRows(newRows);
    }

    try {
      const { _memberId, _readonly, ...cleanRow } = updatedRow;
      const rowTeam = updatedRow.team || (isCombinedCallCenter ? (rows[index]?.team || 'Ankido Buya Team') : selectedTeam);
      const targetTable = rowTeam === 'Younis Kamal Team' ? 'younis_metrics' : (rowTeam === 'Ankido Buya Team' ? 'ankido_metrics' : tableName);
      const payload: any = { ...cleanRow, team: rowTeam, month: selectedMonth, year: selectedYear, _arch: getSystemAuthor() };
      if (cleanRow.call_handled !== undefined) {
        payload.handled = cleanRow.call_handled;
      }

      if (updatedRow.id) {
        await updateDoc(doc(db, targetTable, updatedRow.id), payload);
        updateCachedMetric(payload, updatedRow.id);
      } else {
        const docRef = await addDoc(collection(db, targetTable), payload);
        const newRows = [...rows];
        newRows[index] = { ...payload, id: docRef.id, _memberId: updatedRow._memberId, team: rowTeam };
        setRows(newRows);
        updateCachedMetric(payload, docRef.id);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to save: ${err.message}`);
    }
  };

  const openManageModal = () => {
    if (!isAdmin && !isManager && userProfile?.role !== 'tl') return;
    setManageColsTeam(selectedTeam);
    setNewMemberTeam(selectedTeam);
    fetchAllMembers();
    setShowManageMembers(true);
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    const targetTeam = (userProfile?.role === 'tl' && userProfile?.team) ? userProfile.team : newMemberTeam;
    try {
      await addDoc(collection(db, 'team_members'), { agent_name: newMemberName.trim(), team: targetTeam });
      setNewMemberName("");
      teamDataCacheRef.current = {};
      fetchAllMembers();
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to add: ${err.message}`);
    }
  };

  const handleEditMemberStart = (member: any) => {
    setEditingMemberId(member.id);
    setEditMemberName(member.agent_name);
    setEditMemberTeam(member.team);
  };

  const handleSaveMember = async (id: string) => {
    const targetTeam = (userProfile?.role === 'tl' && userProfile?.team) ? userProfile.team : editMemberTeam;
    try {
      await updateDoc(doc(db, 'team_members', id), {
        agent_name: editMemberName.trim(),
        team: targetTeam
      });
      setEditingMemberId(null);
      teamDataCacheRef.current = {};
      fetchAllMembers();
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to edit: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingMember(true);
    try {
      const curEffective = getCurrentEffectiveMonth(selectedMonth, selectedYear);
      const nextEffective = getNextMonthAndYear(curEffective.month, curEffective.year);

      const resMonth = deleteTiming === "next" ? nextEffective.month : curEffective.month;
      const resYear = deleteTiming === "next" ? nextEffective.year : curEffective.year;
      const nowIso = new Date().toISOString();

      // Soft delete in team_members: marks resigned from resMonth/resYear onwards
      // Query all team_members documents to locate matching doc by ID or canonical name
      const allMembersSnap = await getDocs(collection(db, 'team_members'));
      let matchedCount = 0;
      for (const mDoc of allMembersSnap.docs) {
        const mData = mDoc.data();
        const mName = (mData.agent_name || mData.name || "").trim();
        const isTargetDoc = mDoc.id === deleteTarget.memberId ||
                            isSameAgent(mName, deleteTarget.name) ||
                            getCanonicalAgentName(mName).toLowerCase() === getCanonicalAgentName(deleteTarget.name).toLowerCase();

        if (isTargetDoc) {
          matchedCount++;
          await setDoc(mDoc.ref, {
            agent_name: deleteTarget.name,
            name: deleteTarget.name,
            team: deleteTarget.team || mData.team || "",
            is_active: false,
            is_deleted: true,
            resigned_month: resMonth,
            resigned_year: resYear,
            deleted_at: nowIso
          }, { merge: true });
        }
      }

      // If no existing document matched by ID or name, create with memberId
      if (matchedCount === 0) {
        await setDoc(doc(db, 'team_members', deleteTarget.memberId), {
          agent_name: deleteTarget.name,
          name: deleteTarget.name,
          team: deleteTarget.team,
          is_active: false,
          is_deleted: true,
          resigned_month: resMonth,
          resigned_year: resYear,
          deleted_at: nowIso
        }, { merge: true });
      }

      // Deactivate agent in users collection if present
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const uDoc of usersSnap.docs) {
          const uData = uDoc.data();
          const uName = (uData.name || "").trim().toLowerCase();
          const targetName = deleteTarget.name.trim().toLowerCase();
          if (uName === targetName || isSameAgent(uName, targetName)) {
            await updateDoc(uDoc.ref, {
              is_active: false,
              is_deleted: true,
              resigned_month: resMonth,
              resigned_year: resYear
            });
          }
        }
      } catch (userErr) {
        console.warn("Could not deactivate user account:", userErr);
      }

      // Purge metrics ONLY for resMonth and future months; keep all prior months 100% intact
      const tName = deleteTarget.team === 'Younis Kamal Team' ? 'younis_metrics' :
                    deleteTarget.team === 'Ankido Buya Team' ? 'ankido_metrics' :
                    'mohammed_metrics';
      const q = query(collection(db, tName));
      const snap = await getDocs(q);
      const resMonthIdx = MONTHS.indexOf(resMonth);
      const resYearNum = parseInt(resYear, 10);

      snap.forEach(d => {
        const dData = d.data();
        if (isSameAgent(dData.agent_name || "", deleteTarget.name)) {
          const dYear = parseInt(dData.year || resYear, 10);
          const mIdx = MONTHS.indexOf((dData.month || "").toUpperCase());
          if (dYear > resYearNum || (dYear === resYearNum && mIdx >= resMonthIdx)) {
            deleteDoc(d.ref).catch(console.error);
          }
        }
      });

      teamDataCacheRef.current = {};
      fetchAllMembers();
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to remove: ${err.message}`);
    } finally {
      setIsDeletingMember(false);
      setDeleteTarget(null);
    }
  };

  const handleRestoreMember = async (member: any) => {
    try {
      const allMembersSnap = await getDocs(collection(db, 'team_members'));
      let matched = false;
      for (const mDoc of allMembersSnap.docs) {
        const mData = mDoc.data();
        const mName = (mData.agent_name || mData.name || "").trim();
        if (mDoc.id === member.id || isSameAgent(mName, member.agent_name) || getCanonicalAgentName(mName).toLowerCase() === getCanonicalAgentName(member.agent_name).toLowerCase()) {
          matched = true;
          await updateDoc(mDoc.ref, {
            is_active: true,
            is_deleted: false,
            resigned_month: null,
            resigned_year: null,
            restored_at: new Date().toISOString()
          });
        }
      }
      if (!matched && member.id) {
        await setDoc(doc(db, 'team_members', member.id), {
          is_active: true,
          is_deleted: false,
          resigned_month: null,
          resigned_year: null,
          restored_at: new Date().toISOString()
        }, { merge: true });
      }
      teamDataCacheRef.current = {};
      fetchAllMembers();
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to restore member: ${err.message}`);
    }
  };

  const handleAddColumn = async () => {
    if (!newColLabel.trim()) return;
    const trimmedLabel = cleanColLabel("", newColLabel.trim());
    const newId = trimmedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newCol: ColumnConfig = { id: newId, label: trimmedLabel, type: newColType, aggregation: newColAgg };
    
    try {
      const targetTeams = manageColsTeam === 'ALL' ? TEAMS : [manageColsTeam as TeamName];
      const newMap = { ...columnsMap };
      for (const t of targetTeams) {
        const fallback = t === 'Mohammed Dlshad Team' ? DEFAULT_CHAT_COLUMNS : DEFAULT_OTHER_COLUMNS;
        const currentCols = (newMap[t] && newMap[t].length > 0) ? newMap[t] : fallback;
        if (!currentCols.some(c => c.id === newId)) {
          const updatedCols = sanitizeCols([...currentCols, newCol]);
          newMap[t] = updatedCols;
          await setDoc(doc(db, 'columns_config', t), { columns: updatedCols }, { merge: true });
        }
      }
      setColumnsMap(newMap);
      setNewColLabel("");
      teamDataCacheRef.current = {};
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to add column: ${err.message}`);
    }
  };

  const handleEditColumnStart = (col: ColumnConfig) => {
    setEditingColId(col.id);
    setEditColLabel(cleanColLabel(col.id, col.label));
    setEditColType(col.type);
    setEditColAgg(col.aggregation);
  };

  const handleSaveColumn = async () => {
    if (!editingColId || !editColLabel.trim()) return;
    const trimmedLabel = cleanColLabel(editingColId, editColLabel.trim());
    try {
      const targetTeams = manageColsTeam === 'ALL' ? TEAMS : [manageColsTeam as TeamName];
      const newMap = { ...columnsMap };
      for (const t of targetTeams) {
        const fallback = t === 'Mohammed Dlshad Team' ? DEFAULT_CHAT_COLUMNS : DEFAULT_OTHER_COLUMNS;
        const currentCols = (newMap[t] && newMap[t].length > 0) ? newMap[t] : fallback;
        const updatedCols = sanitizeCols(currentCols.map(c => 
          c.id === editingColId 
            ? { ...c, label: trimmedLabel, type: editColType, aggregation: editColAgg } 
            : c
        ));
        newMap[t] = updatedCols;
        await setDoc(doc(db, 'columns_config', t), { columns: updatedCols }, { merge: true });
      }
      setColumnsMap(newMap);
      setEditingColId(null);
      teamDataCacheRef.current = {};
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to edit column: ${err.message}`);
    }
  };

  const handleRemoveColumn = async (colId: string) => {
    try {
      const targetTeams = manageColsTeam === 'ALL' ? TEAMS : [manageColsTeam as TeamName];
      const newMap = { ...columnsMap };
      for (const t of targetTeams) {
        const fallback = t === 'Mohammed Dlshad Team' ? DEFAULT_CHAT_COLUMNS : DEFAULT_OTHER_COLUMNS;
        const currentCols = (newMap[t] && newMap[t].length > 0) ? newMap[t] : fallback;
        const updatedCols = sanitizeCols(currentCols.filter(c => c.id !== colId));
        newMap[t] = updatedCols;
        await setDoc(doc(db, 'columns_config', t), { columns: updatedCols }, { merge: true });
      }
      setColumnsMap(newMap);
      teamDataCacheRef.current = {};
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to remove column: ${err.message}`);
    }
  };

  const filteredRows = rows.filter(r =>
    r.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcAvg = (col: ColumnConfig, teamRows: any[]) => {
    const validRows = teamRows.filter(r => r[col.id] && r[col.id].toString().trim() !== "");
    if (validRows.length === 0) return "-";

    if (col.type === 'time') {
      let totalSeconds = 0;
      validRows.forEach(r => {
        const parts = r[col.id].toString().split(':');
        if (parts.length === 3) totalSeconds += (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
        else if (parts.length === 2) totalSeconds += (parseInt(parts[0]) * 60) + parseInt(parts[1]);
        else totalSeconds += parseInt(parts[0]) || 0;
      });
      const resultSecs = col.aggregation === 'sum' ? totalSeconds : Math.round(totalSeconds / validRows.length);
      return `${Math.floor(resultSecs / 60).toString().padStart(2, '0')}:${(resultSecs % 60).toString().padStart(2, '0')}`;
    } else {
      const sum = validRows.reduce((acc, r) => acc + parseFloat(r[col.id] || 0), 0);
      const result = col.aggregation === 'sum' ? sum : sum / validRows.length;
      return Number.isInteger(result) ? result.toString() : result.toFixed(1);
    }
  };

  const upperMonth = (selectedMonth || "").toUpperCase();
  const mainMonthIdx = MONTHS.indexOf(upperMonth);
  const mainPrevMonthName = mainMonthIdx > 0 ? MONTHS[mainMonthIdx - 1] : null;

  const calcPrevMonthAvg = (col: ColumnConfig) => {
    if (!mainPrevMonthName || !yearMetrics || yearMetrics.length === 0) return null;
    
    // Filter yearMetrics for the previous month and current team/teams
    const prevRows = yearMetrics.filter(r => {
      const rowMonth = (r.month || '').toUpperCase();
      if (rowMonth !== mainPrevMonthName) return false;
      if (isCombinedCallCenter) {
        return r.team === 'Younis Kamal Team' || r.team === 'Ankido Buya Team' || !r.team;
      }
      return !r.team || r.team === selectedTeam;
    });

    if (prevRows.length === 0) return null;

    // Adapt prevRows so col.id can be read via r[col.id] or getRowValForCol
    const mappedRows = prevRows.map(r => ({
      ...r,
      [col.id]: getRowValForCol(r, col.id) || r[col.id] || ""
    }));

    return calcAvg(col, mappedRows);
  };

  // Ensure selectedTeam is valid for TL
  useEffect(() => {
    if (userProfile?.role === 'tl' && userProfile?.team && selectedTeam !== userProfile.team) {
      setSelectedTeam(userProfile.team);
    }
  }, [userProfile, selectedTeam]);

  // Drag selection helpers and handlers
  const getSelectionBounds = () => {
    if (!selectionStart || !selectionEnd) return null;
    return {
      minRow: Math.min(selectionStart.rowIndex, selectionEnd.rowIndex),
      maxRow: Math.max(selectionStart.rowIndex, selectionEnd.rowIndex),
      minCol: Math.min(selectionStart.colIndex, selectionEnd.colIndex),
      maxCol: Math.max(selectionStart.colIndex, selectionEnd.colIndex),
    };
  };

  const isCellSelected = (r: number, c: number) => {
    const bounds = getSelectionBounds();
    if (!bounds) return false;
    return r >= bounds.minRow && r <= bounds.maxRow && c >= bounds.minCol && c <= bounds.maxCol;
  };

  const isMultiCellSelected = Boolean(
    selectionStart &&
    selectionEnd &&
    (selectionStart.rowIndex !== selectionEnd.rowIndex || selectionStart.colIndex !== selectionEnd.colIndex)
  );

  const selectedCellCount = (() => {
    const b = getSelectionBounds();
    if (!b) return 0;
    return (b.maxRow - b.minRow + 1) * (b.maxCol - b.minCol + 1);
  })();

  const handleCellMouseDown = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
    if (e.button !== 0) return; // Only primary mouse button

    if (e.shiftKey && selectionStartRef.current) {
      e.preventDefault();
      updateSelection(selectionStartRef.current, { rowIndex, colIndex });
      return;
    }

    isSelectingRef.current = true;
    setIsSelecting(true);
    updateSelection({ rowIndex, colIndex }, { rowIndex, colIndex });
  };

  const handleCellMouseEnter = (rowIndex: number, colIndex: number) => {
    if (!isSelectingRef.current || !selectionStartRef.current) return;
    const start = selectionStartRef.current;
    if (start.rowIndex !== rowIndex || start.colIndex !== colIndex) {
      window.getSelection()?.removeAllRanges();
      if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
      }
    }
    updateSelection(start, { rowIndex, colIndex });
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current || !selectionStartRef.current) return;
      
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;
      const cellEl = element.closest('[data-cell-pos="true"]');
      if (cellEl) {
        const r = parseInt(cellEl.getAttribute('data-row-index') || '-1', 10);
        const c = parseInt(cellEl.getAttribute('data-col-index') || '-1', 10);
        if (r >= 0 && c >= 0) {
          const start = selectionStartRef.current;
          const prevEnd = selectionEndRef.current;
          if (!prevEnd || r !== prevEnd.rowIndex || c !== prevEnd.colIndex) {
            window.getSelection()?.removeAllRanges();
            if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'INPUT') {
              document.activeElement.blur();
            }
            updateSelection(start, { rowIndex: r, colIndex: c });
          }
        }
      }
    };

    const handleWindowMouseUp = () => {
      if (isSelectingRef.current) {
        isSelectingRef.current = false;
        setIsSelecting(false);

        const start = selectionStartRef.current;
        const end = selectionEndRef.current;
        if (start && end && start.rowIndex === end.rowIndex && start.colIndex === end.colIndex) {
          const el = document.getElementById(`cell-${start.rowIndex}-${start.colIndex}`) as HTMLInputElement | null;
          if (el && document.activeElement !== el) {
            el.focus();
          }
        }
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  const handleClearSelectedCells = async () => {
    if (isAggregate || isCurrentMonthLocked) {
      if (isCurrentMonthLocked) setShowMonthLockModal(true);
      return;
    }
    const bounds = getSelectionBounds();
    if (!bounds) return;

    const teamCols = isCombinedCallCenter
      ? getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || DEFAULT_OTHER_COLUMNS)
      : getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);
    const newRows = [...rows];
    const rowsToSave: any[] = [];

    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      const row = filteredRows[r];
      if (!row || row._readonly) continue;
      const actualIndex = rows.findIndex(item => item === row);
      if (actualIndex === -1) continue;

      let changed = false;
      const updatedRow = { ...newRows[actualIndex] };
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        const col = teamCols[c];
        if (col && updatedRow[col.id] !== '') {
          updatedRow[col.id] = '';
          changed = true;
        }
      }

      if (changed) {
        newRows[actualIndex] = updatedRow;
        rowsToSave.push({ row: updatedRow, actualIndex });
      }
    }

    if (rowsToSave.length === 0) return;
    setRows(newRows);

    try {
      for (const item of rowsToSave) {
        const { _memberId, _readonly, ...cleanRow } = item.row;
        const rowTeam = item.row.team || (isCombinedCallCenter ? 'Ankido Buya Team' : selectedTeam);
        const targetTable = rowTeam === 'Younis Kamal Team' ? 'younis_metrics' : (rowTeam === 'Ankido Buya Team' ? 'ankido_metrics' : tableName);
        const payload: any = { ...cleanRow, team: rowTeam, month: selectedMonth, year: selectedYear };
        if (cleanRow.call_handled !== undefined) {
          payload.handled = cleanRow.call_handled;
        }
        if (item.row.id) {
          await updateDoc(doc(db, targetTable, item.row.id), payload);
          updateCachedMetric(payload, item.row.id);
        } else {
          const docRef = await addDoc(collection(db, targetTable), payload);
          item.row.id = docRef.id;
          updateCachedMetric(payload, docRef.id);
        }
      }
      setCopyToast(`Cleared ${rowsToSave.length} row${rowsToSave.length > 1 ? 's' : ''}`);
      setTimeout(() => setCopyToast(null), 2000);
    } catch (err: any) {
      console.error("Error clearing cells:", err);
      setErrorMsg(`Error clearing cells: ${err.message}`);
    }
  };

  const handleCopySelection = async () => {
    const bounds = getSelectionBounds();
    if (!bounds) return;

    const teamCols = getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);
    const lines: string[] = [];
    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      const row = filteredRows[r];
      if (!row) continue;
      const cells: string[] = [];
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        const col = teamCols[c];
        if (col) {
          cells.push(row[col.id]?.toString() || '');
        }
      }
      lines.push(cells.join('\t'));
    }

    const tsv = lines.join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopyToast(`Copied ${selectedCellCount} cell${selectedCellCount > 1 ? 's' : ''}`);
      setTimeout(() => setCopyToast(null), 2500);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const handleTablePaste = async (e: React.ClipboardEvent) => {
    if (isAggregate || isCurrentMonthLocked) {
      if (isCurrentMonthLocked) setShowMonthLockModal(true);
      return;
    }
    const clipboardData = e.clipboardData.getData('text/plain');
    if (!clipboardData) return;

    const rowsData = clipboardData
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n');

    if (rowsData.length > 0 && rowsData[rowsData.length - 1] === '') {
      rowsData.pop();
    }

    const parsedGrid = rowsData.map(rowStr => rowStr.split('\t'));
    if (parsedGrid.length === 0) return;

    if (parsedGrid.length === 1 && parsedGrid[0].length === 1 && document.activeElement?.tagName === 'INPUT') {
      return;
    }

    e.preventDefault();

    const bounds = getSelectionBounds();
    const startRow = bounds ? bounds.minRow : 0;
    const startCol = bounds ? bounds.minCol : 0;
    const teamCols = isCombinedCallCenter
      ? getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || DEFAULT_OTHER_COLUMNS)
      : getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);

    const newRows = [...rows];
    const rowsToSave: any[] = [];

    parsedGrid.forEach((gridRow, rOffset) => {
      const targetRowIdx = startRow + rOffset;
      if (targetRowIdx >= filteredRows.length) return;
      const row = filteredRows[targetRowIdx];
      if (!row || row._readonly) return;

      const actualIndex = rows.findIndex(item => item === row);
      if (actualIndex === -1) return;

      const updatedRow = { ...newRows[actualIndex] };
      let changed = false;

      gridRow.forEach((val, cOffset) => {
        const targetColIdx = startCol + cOffset;
        if (targetColIdx >= teamCols.length) return;
        const col = teamCols[targetColIdx];
        if (!col) return;

        let cleanVal = val.trim();
        if (col.type === 'time' && cleanVal !== '') {
          cleanVal = formatToMinutesAndSeconds(cleanVal);
        }
        updatedRow[col.id] = cleanVal;
        changed = true;
      });

      if (changed) {
        newRows[actualIndex] = updatedRow;
        rowsToSave.push({ row: updatedRow, actualIndex });
      }
    });

    if (rowsToSave.length === 0) return;
    setRows(newRows);

    try {
      for (const item of rowsToSave) {
        const { _memberId, _readonly, ...cleanRow } = item.row;
        const rowTeam = item.row.team || (isCombinedCallCenter ? 'Ankido Buya Team' : selectedTeam);
        const targetTable = rowTeam === 'Younis Kamal Team' ? 'younis_metrics' : (rowTeam === 'Ankido Buya Team' ? 'ankido_metrics' : tableName);
        const payload: any = { ...cleanRow, team: rowTeam, month: selectedMonth, year: selectedYear };
        if (cleanRow.call_handled !== undefined) {
          payload.handled = cleanRow.call_handled;
        }
        if (item.row.id) {
          await updateDoc(doc(db, targetTable, item.row.id), payload);
          updateCachedMetric(payload, item.row.id);
        } else {
          const docRef = await addDoc(collection(db, targetTable), payload);
          item.row.id = docRef.id;
          updateCachedMetric(payload, docRef.id);
        }
      }
      setCopyToast(`Pasted ${parsedGrid.length * (parsedGrid[0]?.length || 1)} cells`);
      setTimeout(() => setCopyToast(null), 2500);
    } catch (err: any) {
      console.error("Paste save error:", err);
      setErrorMsg(`Error saving pasted data: ${err.message}`);
    }
  };

  useEffect(() => {
    updateSelection(null, null);
  }, [selectedMonth, selectedTeam, selectedYear]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!selectionStartRef.current || !selectionEndRef.current) return;
      
      const isMulti = 
        selectionStartRef.current.rowIndex !== selectionEndRef.current.rowIndex || 
        selectionStartRef.current.colIndex !== selectionEndRef.current.colIndex;

      if (e.key === 'Escape') {
        updateSelection(null, null);
        return;
      }

      if (isMulti) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleClearSelectedCells();
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
          e.preventDefault();
          handleCopySelection();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [rows, filteredRows, selectedTeam, selectedMonth, selectedYear, isAggregate, columnsMap]);


  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center transition-colors dark:bg-gray-900"><div className="text-gray-500 dark:text-gray-400 font-medium">Loading...</div></div>;
  }

  // Mandatory password change screen for TL / Manager / Agent who haven't set their personal password yet
  // Mohammed Dlshad (Admin) is EXEMPT — passwordUpdated is always true for him
  if (session && userProfile && userProfile.passwordUpdated !== true && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors bg-[#F4F7F5] dark:bg-[#07130F] relative overflow-hidden font-sans">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1C6B53]/25 dark:bg-[#1C6B53]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[440px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(28,107,83,0.12)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] border border-white/80 dark:border-emerald-500/20 p-6 sm:p-9 relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1C6B53]/10 dark:bg-emerald-950 flex items-center justify-center text-[#1C6B53] dark:text-emerald-400 mb-4 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Security: Set Your Password
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xs">
              Welcome, <strong className="text-gray-800 dark:text-gray-200">{userProfile?.name || userProfile?.email}</strong>! For your account security, you must set a personal password before accessing the dashboard.
            </p>
          </div>

          {tlPasswordError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
              {tlPasswordError}
            </div>
          )}

          <form onSubmit={handleTLPasswordChange} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="Min. 8 characters with uppercase & number"
                value={tlNewPassword}
                onChange={(e) => setTlNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={tlConfirmPassword}
                onChange={(e) => setTlConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
              />
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
              <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Security Requirements:</p>
              <div className="flex items-center gap-1.5">
                <span className={tlNewPassword.length >= 8 ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                <span>Minimum 8 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={/[A-Z]/.test(tlNewPassword) && /[a-z]/.test(tlNewPassword) ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                <span>Uppercase & lowercase letters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={/[0-9]/.test(tlNewPassword) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(tlNewPassword) ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                <span>At least one number or special character</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={tlPasswordLoading}
              className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-lg shadow-[#1C6B53]/25 transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              {tlPasswordLoading ? 'Saving...' : 'Set Password & Access Dashboard'}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 font-semibold transition"
              >
                Cancel and Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

    if (!session) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors bg-[#F4F7F5] dark:bg-[#07130F] relative overflow-hidden font-sans">
          {/* Ambient glowing radial orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1C6B53]/25 dark:bg-[#1C6B53]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full max-w-[440px] p-6 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(28,107,83,0.12)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] border border-white/80 dark:border-emerald-500/20 relative z-10">
            {/* Top Bar with Dark Mode Toggle */}
            <div className="flex justify-end items-center mb-6">
              <button 
                onClick={toggleDarkMode} 
                className="w-10 h-10 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
              </button>
            </div>
            
            {/* Logo & Heading */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-800 p-2.5 flex items-center justify-center border border-emerald-100/80 dark:border-emerald-900/50 shadow-sm mb-4">
                <img src="/logo.webp" alt="FIB Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
                Team Leader &amp; Agent Dashboard
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                Welcome back. Please sign in to access your scorecards.
              </p>
            </div>
            
            {authError && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none transition-all text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-[#1C6B53] dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium placeholder:text-gray-400" 
                    placeholder="name@agent.com" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { 
                      setForgotEmail(email); 
                      setForgotError(''); 
                      setForgotSuccess(''); 
                      setShowForgotModal(true); 
                    }} 
                    className="text-xs font-semibold text-[#1C6B53] dark:text-emerald-400 hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-10 pr-11 py-3.5 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none transition-all text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-[#1C6B53] dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium placeholder:text-gray-400" 
                    placeholder="••••••••" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginAttempts >= 3 && loginAttempts < 5 && lockoutTimer === 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-semibold text-center">
                  ⚠️ {5 - loginAttempts} attempt(s) remaining before temporary account lockout.
                </div>
              )}

              <button 
                type="submit" 
                disabled={loginLoading || lockoutTimer > 0}
                className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all mt-6 bg-[#1C6B53] hover:bg-[#155a45] shadow-lg shadow-[#1C6B53]/25 hover:shadow-xl hover:shadow-[#1C6B53]/35 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>
                  {lockoutTimer > 0 
                    ? `Locked (${lockoutTimer}s)` 
                    : (loginLoading ? 'Signing In...' : 'Sign In')}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500 text-[11px] font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                <span>Protected By FIB Enterprise Security</span>
              </div>
              <div className="text-[10.5px] font-bold tracking-wide text-gray-400/90 dark:text-gray-500">
                Designed &amp; Engineered by <span className="text-[#1C6B53] dark:text-emerald-400 font-black">{getSystemAuthor()}</span>
              </div>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div data-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overscroll-contain">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 relative">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Forgot Password</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a password reset link.</p>
                  </div>
                  <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {forgotError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-[#1C6B53] dark:text-emerald-400 text-xs font-semibold rounded-xl leading-relaxed">
                    {forgotSuccess}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@agent.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#1C6B53] hover:bg-[#155a45] transition shadow-md shadow-[#1C6B53]/20 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mobile PWA Install Floating Banner */}
          <PwaInstallBanner />
        </div>
      );
    }

    const activeTeams = userProfile?.role === 'tl' && userProfile?.team 
      ? TEAMS.filter(t => t === userProfile.team) 
      : TEAMS;

    const displayedMembers = userProfile?.role === 'tl' && userProfile?.team
      ? allMembers.filter(m => m.team === userProfile.team)
      : allMembers;

    const activeDisplayedMembers = displayedMembers.filter(m => !m.is_deleted && m.is_active !== false);
    const resignedDisplayedMembers = displayedMembers.filter(m => m.is_deleted === true || m.is_active === false);

    const manageCols = manageColsTeam === 'ALL'
      ? (columnsMap[selectedTeam] || columnsMap['Ankido Buya Team'] || columnsMap['Younis Kamal Team'] || [])
      : (columnsMap[manageColsTeam] || []);

    const renderUniversalModals = () => {
      if (!isMounted) return null;
      return (
        <>
          {/* Manage Settings Modal (System Configuration) */}
          {showManageMembers && (isAdmin || isManager || userProfile?.role === 'tl') && createPortal(
            <div data-modal="true" className="fixed inset-0 z-[80] flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto overscroll-contain">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowManageMembers(false)} />
              <div className="relative bg-[#F9F8F4] dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 w-full border border-transparent dark:border-gray-700 mb-10 transition-all overscroll-contain max-w-5xl">
                
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      System Settings
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                      {isAdmin ? 'Add or remove agents and table columns across the system.' : 'Manage agents and team members.'}
                    </p>
                  </div>
                  <button onClick={() => setShowManageMembers(false)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition shadow-2xs shrink-0" title="Close" aria-label="Close">
                     <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                <div className={`grid gap-4 sm:gap-6 grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'max-w-xl mx-auto'}`}>
                  
                  {/* Agents Card */}
                  <div className="bg-[#F1EFE8] dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 flex flex-col h-[460px] sm:h-[550px] border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-600 dark:text-gray-300" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                          {userProfile?.role === 'tl' ? `${userProfile?.team?.replace(' Team', '') || 'My Team'} Agents` : 'Agents'}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300">
                        {activeDisplayedMembers.length} Active Agents
                      </span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="New agent name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-[#1C6B53] font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                      />
                    </div>

                    {(isAdmin || userProfile?.role === 'manager' || userProfile?.role === 'admin') && (
                      <div className="mb-3">
                        <ModernDropdown
                          value={newMemberTeam}
                          onChange={(val) => setNewMemberTeam(val as TeamName)}
                          options={activeTeams.map(t => ({ value: t, label: t, icon: Briefcase }))}
                          variant="solid-green"
                          className="w-full"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleAddMember}
                      className="w-full bg-[#1C6B53] hover:bg-[#155a45] text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm mb-4 sm:mb-5 flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16}/> Add Agent
                    </button>

                    <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1">
                      {activeDisplayedMembers.length === 0 && <div className="text-xs text-gray-400 text-center mt-6">No active agents found in this team.</div>}
                      {activeDisplayedMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2.5 sm:p-3 flex justify-between items-center shadow-sm">
                          
                          {editingMemberId === member.id ? (
                            <div className="flex-1 flex gap-2 items-center">
                              <input 
                                type="text" 
                                value={editMemberName} 
                                onChange={(e) => setEditMemberName(e.target.value)} 
                                className="flex-1 px-2 py-1 text-xs sm:text-sm border rounded outline-none focus:border-[#1C6B53] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                              {(isAdmin || userProfile?.role === 'manager' || userProfile?.role === 'admin') && (
                                <select 
                                  value={editMemberTeam} 
                                  onChange={(e: any) => setEditMemberTeam(e.target.value)} 
                                  className="w-28 sm:w-32 px-2 py-1 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-2xs text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#1C6B53] cursor-pointer"
                                >
                                  {activeTeams.map(t => <option key={t} value={t}>{t.replace(' Team', '')}</option>)}
                                </select>
                              )}
                              <button onClick={() => handleSaveMember(member.id)} className="text-[#1C6B53] hover:text-emerald-700 p-1">
                                <Save size={14}/>
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[130px] sm:max-w-none">{member.agent_name}</span>
                              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
                                  {member.team.replace(' Team', '')}
                                </span>
                                <div className="flex gap-1.5 sm:gap-2">
                                  <button onClick={() => handleEditMemberStart(member)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="Edit">
                                    <Edit2 size={13} />
                                  </button>
                                  <button onClick={() => setDeleteTarget({ memberId: member.id, name: member.agent_name, team: member.team })} className="text-red-400 hover:text-red-600 transition" title="Delete">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      {resignedDisplayedMembers.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Former / Resigned Agents ({resignedDisplayedMembers.length})
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {resignedDisplayedMembers.map((member) => (
                              <div key={member.id} className="bg-gray-50/80 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-2.5 sm:p-3 flex justify-between items-center opacity-85 hover:opacity-100 transition">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 truncate">
                                    {member.agent_name}
                                  </span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    Resigned: {member.resigned_month || 'N/A'} {member.resigned_year || '2026'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    {member.team.replace(' Team', '')}
                                  </span>
                                  <button
                                    onClick={() => handleRestoreMember(member)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                                    title="Restore / Re-activate Agent"
                                  >
                                    <RotateCcw size={12} />
                                    <span>Restore</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columns Card - Admin Only */}
                  {isAdmin && (
                    <div className="bg-[#F1EFE8] dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 flex flex-col h-[460px] sm:h-[550px] border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Columns size={18} className="text-gray-600 dark:text-gray-300" />
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">Table Columns & KPIs</h3>
                        </div>
                        <ModernDropdown 
                          value={manageColsTeam} 
                          onChange={(val) => setManageColsTeam(val)}
                          options={[
                            { value: "ALL", label: "🌐 All Teams" },
                            ...activeTeams.map(t => ({ value: t, label: t }))
                          ]}
                          variant="white"
                          size="sm"
                          align="right"
                          ariaLabel="Select Team for Columns"
                        />
                      </div>

                      {manageColsTeam === 'ALL' && (
                        <div className="mb-3 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl text-[10px] sm:text-[11px] text-[#1C6B53] dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                          <span>✓ Syncs Across All Team Leaders & Agent Dashboards</span>
                        </div>
                      )}
                      
                      <input
                        type="text"
                        placeholder="KPI Name (e.g. Quality, Exam, Prod)"
                        value={newColLabel}
                        onChange={(e) => setNewColLabel(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-[#1C6B53] mb-2 font-medium"
                      />

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</label>
                          <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-0.5">
                            <button
                              type="button"
                              onClick={() => setNewColType('number')}
                              className={`flex-1 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${newColType === 'number' ? 'bg-[#1C6B53] text-white' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              Number / %
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewColType('time')}
                              className={`flex-1 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${newColType === 'time' ? 'bg-[#1C6B53] text-white' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              Time (mm:ss)
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aggregation</label>
                          <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-0.5">
                            <button
                              type="button"
                              onClick={() => setNewColAgg('average')}
                              className={`flex-1 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${newColAgg === 'average' ? 'bg-[#1C6B53] text-white' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              Average
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewColAgg('sum')}
                              className={`flex-1 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${newColAgg === 'sum' ? 'bg-[#1C6B53] text-white' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              Sum
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleAddColumn}
                        className="w-full bg-[#1C6B53] hover:bg-[#155a45] text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm mb-4 sm:mb-5 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Add KPI
                      </button>

                      <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1">
                        {manageCols.map((col) => (
                          <div key={col.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2.5 sm:p-3 flex justify-between items-center shadow-sm">
                            {editingColId === col.id ? (
                              <div className="flex-1 flex flex-col gap-2 p-1">
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={editColLabel}
                                    onChange={(e) => setEditColLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveColumn();
                                      if (e.key === 'Escape') setEditingColId(null);
                                    }}
                                    placeholder="KPI Name"
                                    className="flex-1 px-2.5 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-[#1C6B53] dark:bg-gray-700 dark:text-white font-medium"
                                    autoFocus
                                  />
                                  <button 
                                    onClick={handleSaveColumn} 
                                    className="bg-[#1C6B53] hover:bg-[#155a45] text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                                    title="Save Changes"
                                  >
                                    <Save size={13} />
                                    <span>Save</span>
                                  </button>
                                  <button 
                                    onClick={() => setEditingColId(null)} 
                                    className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 p-1 rounded-lg text-xs transition"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                {/* Format & Aggregation controls */}
                                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-100 dark:border-gray-700">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</label>
                                    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditColType('number')}
                                        className={`flex-1 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded transition ${editColType === 'number' ? 'bg-[#1C6B53] text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                                      >
                                        Number / %
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditColType('time')}
                                        className={`flex-1 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded transition ${editColType === 'time' ? 'bg-[#1C6B53] text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                                      >
                                        Time (mm:ss)
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aggregation</label>
                                    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditColAgg('average')}
                                        className={`flex-1 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded transition ${editColAgg === 'average' ? 'bg-[#1C6B53] text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                                      >
                                        Average
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditColAgg('sum')}
                                        className={`flex-1 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded transition ${editColAgg === 'sum' ? 'bg-[#1C6B53] text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                                      >
                                        Sum
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">{col.label || col.id}</span>
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditColumnStart(col)}
                                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1"
                                    title="Click to edit format and aggregation"
                                  >
                                    <span>{toTitleCase(col.type)} • {toTitleCase(col.aggregation)}</span>
                                  </button>
                                  <div className="flex gap-1 sm:gap-1.5">
                                    <button onClick={() => handleEditColumnStart(col)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" title="Edit KPI">
                                      <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => handleRemoveColumn(col.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete KPI">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>,
            document.body
          )}

          {/* TL & Manager Profile Modal */}
          {showProfileModal && createPortal(
            <div data-modal="true" className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-4 overscroll-contain">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Profile Settings</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update Your Display Name, Profile Photo & Password</p>
                  </div>
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveTLProfile} className="space-y-4">
                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[#1C6B53] dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <Check size={16} />
                      {profileSuccess}
                    </div>
                  )}

                  {profileError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle size={16} />
                      {profileError}
                    </div>
                  )}

                  {/* Profile Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1C6B53] to-emerald-400 flex items-center justify-center overflow-hidden ring-4 ring-[#1C6B53]/15 text-white font-black text-xl shadow-md shrink-0">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        (profileName || userProfile?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Profile Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePhotoUpload} 
                        className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1C6B53]/10 file:text-[#1C6B53] hover:file:bg-[#1C6B53]/20 dark:file:bg-emerald-950/60 dark:file:text-emerald-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
                    />
                  </div>

                  {/* Role & Email info (Assigned Team removed) */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-500 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">Account Role</span>
                      <span className="font-bold text-gray-800 dark:text-white">{isAdmin ? 'Administrator' : userProfile?.role === 'manager' ? 'Manager' : userProfile?.role === 'agent' ? 'Agent' : 'Team Leader'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">Email Address</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{session?.email}</span>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Change Password (Optional)</span>
                    <div className="space-y-2.5">
                      <input
                        type="password"
                        placeholder="New Password (At least 6 characters)"
                        value={newProfilePassword}
                        onChange={(e) => setNewProfilePassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmProfilePassword}
                        onChange={(e) => setConfirmProfilePassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1C6B53] hover:bg-[#155a45] transition shadow-md shadow-[#1C6B53]/20 disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Delete / Resign Member Confirmation Modal */}
          {deleteTarget && (() => {
            const curEffective = getCurrentEffectiveMonth(selectedMonth, selectedYear);
            const nextEffective = getNextMonthAndYear(curEffective.month, curEffective.year);

            return createPortal(
              <div data-modal="true" className="fixed inset-0 z-[90] flex items-center justify-center p-4 overscroll-contain">
                <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" 
                  onClick={() => !isDeletingMember && setDeleteTarget(null)} 
                />
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-7 max-w-lg w-full border border-gray-200/80 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Top Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
                      <UserMinus size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                          Remove / Resign Member
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {deleteTarget.team.replace(' Team', '')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select effective timeline for <strong className="text-gray-800 dark:text-gray-200">{deleteTarget.name}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Timing Choices */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                      Effective Date
                    </label>

                    <div className="space-y-2.5">
                      {/* Option 1: Next Month (Recommended) */}
                      <div
                        onClick={() => setDeleteTiming("next")}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                          deleteTiming === "next"
                            ? "border-[#1C6B53] bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-[#1C6B53]/20"
                            : "border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/40"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            deleteTiming === "next" 
                              ? "border-[#1C6B53] bg-[#1C6B53]" 
                              : "border-gray-300 dark:border-gray-600"
                          }`}>
                            {deleteTiming === "next" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                              Next Month ({nextEffective.displayLabel})
                            </span>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                              Recommended
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                            The employee remains active in the current month ({curEffective.displayLabel}) with all metrics saved. Removal starts from next month ({nextEffective.displayLabel}) onwards.
                          </p>
                        </div>
                      </div>

                      {/* Option 2: Current Month */}
                      <div
                        onClick={() => setDeleteTiming("current")}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                          deleteTiming === "current"
                            ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 ring-1 ring-rose-500/20"
                            : "border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/40"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            deleteTiming === "current" 
                              ? "border-rose-500 bg-rose-500" 
                              : "border-gray-300 dark:border-gray-600"
                          }`}>
                            {deleteTiming === "current" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                              Current Month ({curEffective.displayLabel})
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                            The employee is removed starting from {curEffective.displayLabel} immediately. All historical data from previous months (January through the preceding month) is 100% preserved and untouched.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isDeletingMember}
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition active:scale-95 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingMember}
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm font-bold text-white transition active:scale-95 shadow-md shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isDeletingMember ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          <span>Confirm Removal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            );
          })()}
        </>
      );
    };

    // Back Office / Shireen: Exclusively evaluation dashboard and NOTHING else
    if (userProfile?.role === 'backoffice' || (userProfile?.email || '').toLowerCase().includes('shireen')) {
      return (
        <>
          <AnnualEvaluationDashboard
            userProfile={userProfile}
            allMembers={allMembers}
            selectedYear={selectedYear}
            onBack={handleLogout}
            onLogout={handleLogout}
            onNavigate={handleNavigateDashboard}
            onOpenProfile={openProfileModal}
            onOpenSettings={openManageModal}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          {renderUniversalModals()}
        </>
      );
    }

    if (showAnnualEvalView) {
      return (
        <div key="eval" className={isPageTransitioning ? "page-exit" : "page-enter"}>
          <AnnualEvaluationDashboard
            userProfile={userProfile}
            allMembers={allMembers}
            selectedYear={selectedYear}
            onBack={() => {
              setShowAnnualEvalView(false);
            }}
            onLogout={handleLogout}
            onNavigate={handleNavigateDashboard}
            onOpenProfile={openProfileModal}
            onOpenSettings={openManageModal}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          {renderUniversalModals()}
        </div>
      );
    }

    if (userProfile?.role === 'agent') {
      return (
        <div key="agent" className={isPageTransitioning ? "page-exit" : "page-enter"}>
          <AgentDashboard 
            userProfile={userProfile} 
            onLogout={handleLogout} 
            columnsMap={columnsMap} 
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onOpenAnnualEval={() => setShowAnnualEvalView(true)}
            onNavigate={handleNavigateDashboard}
            onOpenProfile={openProfileModal}
          />
          {renderUniversalModals()}
        </div>
      );
    }

    if (showAgentPreview) {
      return (
        <div key="agent-preview" className={isPageTransitioning ? "page-exit" : "page-enter"}>
          <AgentDashboard 
            userProfile={userProfile} 
            onLogout={handleLogout} 
            columnsMap={columnsMap} 
            previewMode={true} 
            allMembers={allMembers} 
            onExitPreview={() => setShowAgentPreview(false)} 
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onOpenAnnualEval={() => setShowAnnualEvalView(true)}
            onNavigate={handleNavigateDashboard}
            onOpenProfile={openProfileModal}
            onOpenSettings={openManageModal}
          />
          {renderUniversalModals()}
        </div>
      );
    }

    if (userProfile?.role === 'qa' || userProfile?.role === 'trainer') {
      return (
        <div key="quality-role" className={isPageTransitioning ? "page-exit" : "page-enter"}>
          <QualityDashboard 
            userProfile={userProfile} 
            onBack={handleLogout} 
            onLogout={handleLogout}
            onOpenProfile={openProfileModal}
            onOpenSettings={openManageModal}
            onNavigate={handleNavigateDashboard}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onOpenAnnualEval={() => setShowAnnualEvalView(true)}
          />
          {renderUniversalModals()}
        </div>
      );
    }

    if (showQualityView && canAccessQuality) {
      return (
        <div key="quality" className={isPageTransitioning ? "page-exit" : "page-enter"}>
          <QualityDashboard 
            userProfile={userProfile} 
            onBack={() => {
              teamDataCacheRef.current = {};
              qaCacheRef.current = {};
              setShowQualityView(false);
              fetchData(true);
            }} 
            onLogout={handleLogout}
            onOpenProfile={openProfileModal}
            onOpenSettings={openManageModal}
            onNavigate={handleNavigateDashboard}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onOpenAnnualEval={() => setShowAnnualEvalView(true)}
          />
          {renderUniversalModals()}
        </div>
      );
    }

    if (showTopStarView && (isAdmin || isManager || userProfile?.role === 'tl' || userProfile?.role === 'agent')) {
      return (
        <div key="topstar" className={isPageTransitioning ? "page-exit" : "page-enter"}>
          <TopStarDashboard
            userProfile={userProfile}
            allMembers={allMembers}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onBack={() => {
              setShowTopStarView(false);
              fetchData(true);
            }}
            onLogout={handleLogout}
            onOpenProfile={openProfileModal}
            onOpenSettings={openManageModal}
            onNavigate={handleNavigateDashboard}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        {renderUniversalModals()}
        </div>
      );
    }

    const activeCols = isCombinedCallCenter
      ? getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || columnsMap['Younis Kamal Team'] || DEFAULT_OTHER_COLUMNS)
      : getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);

    const handleExportTlPdf = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Popup blocked! Please allow popups in your browser to download the Team Leader PDF report.");
        return;
      }

      const escapeHtml = (val: string) =>
        String(val || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const teamTitle = isCombinedCallCenter ? "Call Center Combined (Younis + Ankido)" : selectedTeam;
      const tlDisplayName = isCombinedCallCenter
        ? "Younis Kamal & Ankido Buya"
        : selectedTeam.replace(" Team", "");
      const safeFilePart = teamTitle.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
      const docTitle = `TL_KPI_Signoff_${safeFilePart}_${selectedYear}_${tlPdfQuarter}_W${tlPdfWeek}`;

      let signedCount = 0;
      const rowsHtml = filteredRows.map((row, idx) => {
        const agentName = row.display_name || row.agent_name || "-";
        const initialChar = agentName.trim().charAt(0).toUpperCase() || "A";
        const kpiRec = findKpiSession(row.agent_name || row.display_name || "", selectedYear, tlPdfQuarter, tlPdfWeek);
        const isSigned = kpiRec?.status === "approved";
        if (isSigned) signedCount++;

        const signedDateObj = isSigned && kpiRec?.signed_at ? new Date(kpiRec.signed_at) : null;
        const dateOnlyStr = signedDateObj && !isNaN(signedDateObj.getTime())
          ? signedDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : null;
        const timeOnlyStr = signedDateObj && !isNaN(signedDateObj.getTime())
          ? signedDateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;

        const safeSigUrl = isSigned && typeof kpiRec?.signature_data === "string" && kpiRec.signature_data.startsWith("data:image/")
          ? kpiRec.signature_data
          : null;

        const rowTeamStr = String(row.team || selectedTeam || "");
        const rowTlLabel = rowTeamStr.replace(" Team", "");
        const teamPillClass = rowTeamStr.includes("Ankido")
          ? "team-pill-purple"
          : rowTeamStr.includes("Mohammed") || rowTeamStr.includes("Dlshad")
          ? "team-pill-teal"
          : "team-pill-emerald";

        const statusCellHtml = isSigned
          ? `<span class="status-pill status-signed">&#10003; Approved</span>`
          : `<span class="status-pill status-pending">Pending</span>`;

        const signatureColHtml = isSigned
          ? (safeSigUrl
              ? `<div class="sig-frame"><img src="${safeSigUrl}" alt="Signature" class="sig-img" /></div>`
              : `<span class="status-pill status-signed">Verified Approval</span>`)
          : `<div class="sig-empty">Awaiting Signature</div>`;

        const dateColHtml = isSigned && dateOnlyStr
          ? `<div class="date-wrap">
               <div class="date-main">${escapeHtml(dateOnlyStr)}</div>
               ${timeOnlyStr ? `<div class="date-time">${escapeHtml(timeOnlyStr)}</div>` : ""}
             </div>`
          : `<span class="muted-dash">&mdash;</span>`;

        return `<tr class="${isSigned ? "row-signed" : ""}">
          <td class="idx-cell"><span class="idx-badge ${isSigned ? "idx-signed" : ""}">${idx + 1}</span></td>
          <td class="agent-cell">
            <div class="agent-wrap">
              <div class="avatar ${isSigned ? "avatar-signed" : ""}">${escapeHtml(initialChar)}</div>
              <div>
                <div class="agent-name">${escapeHtml(agentName)}</div>
                ${rowTlLabel ? `<span class="team-pill ${teamPillClass}">TL: ${escapeHtml(rowTlLabel)}</span>` : ""}
              </div>
            </div>
          </td>
          <td class="status-cell">${statusCellHtml}</td>
          <td class="sig-cell">${signatureColHtml}</td>
          <td class="date-cell">${dateColHtml}</td>
        </tr>`;
      }).join("");

      const pendingCount = Math.max(0, filteredRows.length - signedCount);
      const completionPct = filteredRows.length > 0 ? Math.round((signedCount / filteredRows.length) * 100) : 0;

      const generatedAt = new Date().toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
      const preparedBy = userProfile?.name || (selectedTeam ? selectedTeam.replace(" Team", "") : "Team Leader");
      const logoUrl = `${window.location.origin}/logo.webp`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    *, *::before, *::after {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
    }
    body { padding: 16px; }
    .no-print {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      padding: 10px 16px;
      border-radius: 12px;
      margin-bottom: 14px;
    }
    .no-print-info { font-size: 12px; color: #065f46; font-weight: 700; }
    .no-print-actions { display: flex; gap: 8px; }
    .btn-primary {
      background: #1C6B53;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 9px;
      font-weight: 800;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(28, 107, 83, 0.25);
    }
    .btn-secondary {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 8px 14px;
      border-radius: 9px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }

    /* Executive Emerald Header Banner */
    .banner {
      background-color: #1C6B53 !important;
      background-image: linear-gradient(135deg, #064e3b 0%, #1C6B53 55%, #0f766e 100%) !important;
      color: #ffffff !important;
      padding: 16px 20px;
      border-radius: 14px;
      border-bottom: 4px solid #fbbf24;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-pill {
      background-color: #ffffff !important;
      padding: 6px 10px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .logo-img {
      height: 30px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .banner-title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.4px;
      color: #ffffff !important;
    }
    .banner-sub {
      font-size: 11px;
      color: #fde68a !important;
      font-weight: 700;
      margin-top: 3px;
    }
    .banner-meta {
      text-align: right;
      background-color: rgba(255, 255, 255, 0.12) !important;
      border: 1px solid rgba(255, 255, 255, 0.22);
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 10.5px;
      color: #ecfdf5 !important;
      line-height: 1.55;
      flex-shrink: 0;
    }
    .banner-meta strong { color: #ffffff !important; }

    /* Colorful Metadata Summary Cards */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .meta-card {
      border-radius: 10px;
      padding: 9px 11px;
      border: 1.5px solid #e2e8f0;
      background-color: #f8fafc !important;
    }
    .meta-card.card-teal {
      background-color: #f0fdfa !important;
      border-color: #99f6e4;
    }
    .meta-card.card-sky {
      background-color: #f0f9ff !important;
      border-color: #bae6fd;
    }
    .meta-card.card-amber {
      background-color: #fffbeb !important;
      border-color: #fde68a;
    }
    .meta-card.card-emerald {
      background-color: #ecfdf5 !important;
      border-color: #6ee7b7;
    }
    .meta-lbl {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #475569;
    }
    .card-emerald .meta-lbl { color: #065f46; }
    .meta-val {
      font-size: 12px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 3px;
    }
    .card-emerald .meta-val { color: #047857; }
    .meta-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #059669;
      margin-top: 1px;
    }

    /* Executive Sign-off Table */
    .table-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    thead { display: table-header-group; }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      background-color: #1C6B53 !important;
      color: #ffffff !important;
      padding: 10px 8px;
      text-align: center;
      font-weight: 800;
      font-size: 10.5px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      border-right: 1px solid #165441;
      border-bottom: 2px solid #064e3b;
    }
    th:last-child { border-right: none; }
    th.agent-th { text-align: left; padding-left: 12px; }
    th.sig-th, th.date-th { background-color: #0f4c3a !important; }
    td {
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      vertical-align: middle;
      background-color: #ffffff !important;
    }
    td:last-child { border-right: none; }
    tbody tr:nth-child(even) td { background-color: #f8fafc !important; }
    tbody tr.row-signed td { background-color: #f0fdf4 !important; }

    .idx-cell { text-align: center; width: 38px; }
    .idx-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 7px;
      font-size: 10px;
      font-weight: 800;
      background-color: #f1f5f9 !important;
      color: #475569;
    }
    .idx-badge.idx-signed {
      background-color: #d1fae5 !important;
      color: #065f46;
    }

    .agent-cell { text-align: left; padding-left: 12px; }
    .agent-wrap { display: flex; align-items: center; gap: 9px; }
    .avatar {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background-color: #e2e8f0 !important;
      color: #334155;
      font-size: 11px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .avatar.avatar-signed {
      background-color: #1C6B53 !important;
      color: #ffffff !important;
    }
    .agent-name {
      font-weight: 800;
      font-size: 11.5px;
      color: #0f172a;
    }
    .team-pill {
      display: inline-block;
      margin-top: 2px;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 8.5px;
      font-weight: 800;
      border: 1px solid transparent;
    }
    .team-pill-emerald {
      background-color: #e0f2fe !important;
      color: #0369a1;
      border-color: #bae6fd;
    }
    .team-pill-purple {
      background-color: #f3e8ff !important;
      color: #7e22ce;
      border-color: #e9d5ff;
    }
    .team-pill-teal {
      background-color: #ccfbf1 !important;
      color: #0f766e;
      border-color: #99f6e4;
    }

    .status-cell { text-align: center; width: 105px; }
    .status-pill {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }
    .status-signed {
      background-color: #dcfce7 !important;
      color: #166534;
      border: 1px solid #86efac;
    }
    .status-pending {
      background-color: #fef3c7 !important;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    /* Separate Column 1: Electronic Signature */
    .sig-cell { text-align: center; width: 175px; }
    .sig-frame {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff !important;
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 3px 10px;
      min-width: 120px;
      min-height: 34px;
    }
    .sig-img {
      height: 28px;
      max-width: 135px;
      object-fit: contain;
      display: block;
    }
    .sig-empty {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
      background-color: #f8fafc !important;
      font-size: 9.5px;
      font-weight: 600;
      color: #94a3b8;
    }

    /* Separate Column 2: Date & Time */
    .date-cell { text-align: center; width: 130px; }
    .date-wrap {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      background-color: #ecfdf5 !important;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 4px 10px;
      min-width: 106px;
    }
    .date-main {
      font-size: 10.5px;
      font-weight: 800;
      color: #065f46;
      white-space: nowrap;
    }
    .date-time {
      font-size: 9px;
      font-weight: 700;
      color: #047857;
      margin-top: 1px;
      white-space: nowrap;
    }
    .muted-dash {
      color: #cbd5e1;
      font-weight: 800;
      font-size: 13px;
    }

    tfoot td {
      background-color: #064e3b !important;
      color: #ffffff !important;
      font-weight: 800;
      padding: 9px 10px;
      font-size: 10.5px;
      border-top: 2px solid #fbbf24;
    }
    .footer-note {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div class="no-print-info">Tip: Choose &ldquo;Save as PDF&rdquo; as the destination to download this color report as a PDF file.</div>
    <div class="no-print-actions">
      <button class="btn-secondary" onclick="window.close()">Close</button>
      <button class="btn-primary" onclick="window.print()">Download / Print PDF</button>
    </div>
  </div>

  <div class="banner">
    <div class="banner-left">
      <div class="logo-pill">
        <img src="${logoUrl}" alt="FIB Logo" class="logo-img" />
      </div>
      <div>
        <div class="banner-title">WEEKLY KPI SIGN-OFF &amp; ATTENDANCE REGISTER</div>
        <div class="banner-sub">First Iraqi Bank (FIB) &bull; Contact Center Team Leader Review</div>
      </div>
    </div>
    <div class="banner-meta">
      <div><strong>Prepared By:</strong> ${escapeHtml(preparedBy)}</div>
      <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-card card-teal">
      <div class="meta-lbl">Team / Unit</div>
      <div class="meta-val">${escapeHtml(teamTitle)}</div>
    </div>
    <div class="meta-card card-sky">
      <div class="meta-lbl">Team Leader</div>
      <div class="meta-val">${escapeHtml(tlDisplayName)}</div>
    </div>
    <div class="meta-card card-amber">
      <div class="meta-lbl">KPI Review Week</div>
      <div class="meta-val">${escapeHtml(selectedYear)} &bull; ${escapeHtml(tlPdfQuarter)} &bull; Week ${tlPdfWeek}</div>
    </div>
    <div class="meta-card card-emerald">
      <div class="meta-lbl">Signatures Logged</div>
      <div class="meta-val">${signedCount} / ${filteredRows.length} Agents Signed</div>
      <div class="meta-sub">${completionPct}% Completed</div>
    </div>
  </div>

  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th class="agent-th">Agent Name</th>
          <th>Status</th>
          <th class="sig-th">Agent Signature</th>
          <th class="date-th">Sign-off Date &amp; Time</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="text-align:left;padding-left:12px;">KPI Sign-off Summary (${escapeHtml(tlPdfQuarter)} &bull; Week ${tlPdfWeek})</td>
          <td style="text-align:center;">${signedCount} Signed / ${pendingCount} Pending</td>
          <td style="text-align:center;">${completionPct}% Verified</td>
          <td style="text-align:center;">${escapeHtml(selectedYear)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="footer-note">
    <span>FIB Contact Center &bull; Official Team Leader Weekly KPI Sign-off Sheet</span>
    <span>Electronic signatures &amp; timestamps synced from Q.S &amp; KPI Portal</span>
  </div>
  <script>window.onload = function() { setTimeout(function(){ window.print(); }, 350); };</script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setShowTlPdfModal(false);
    };

    const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
      if (isAggregate) return;

      if (e.shiftKey) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const start = selectionStartRef.current || { rowIndex, colIndex };
          const end = selectionEndRef.current || { rowIndex, colIndex };
          const newEnd = { ...end, rowIndex: Math.min(filteredRows.length - 1, end.rowIndex + 1) };
          updateSelection(start, newEnd);
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const start = selectionStartRef.current || { rowIndex, colIndex };
          const end = selectionEndRef.current || { rowIndex, colIndex };
          const newEnd = { ...end, rowIndex: Math.max(0, end.rowIndex - 1) };
          updateSelection(start, newEnd);
          return;
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const start = selectionStartRef.current || { rowIndex, colIndex };
          const end = selectionEndRef.current || { rowIndex, colIndex };
          const newEnd = { ...end, colIndex: Math.min(activeCols.length - 1, end.colIndex + 1) };
          updateSelection(start, newEnd);
          return;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const start = selectionStartRef.current || { rowIndex, colIndex };
          const end = selectionEndRef.current || { rowIndex, colIndex };
          const newEnd = { ...end, colIndex: Math.max(0, end.colIndex - 1) };
          updateSelection(start, newEnd);
          return;
        }
      }

      let targetRow = rowIndex;
      let targetCol = colIndex;

      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        targetRow = Math.min(filteredRows.length - 1, rowIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        targetRow = Math.max(0, rowIndex - 1);
      } else if (e.key === 'ArrowRight') {
        const input = e.currentTarget;
        if (input.selectionStart === input.selectionEnd && input.selectionStart === input.value.length) {
          if (colIndex < activeCols.length - 1) {
            e.preventDefault();
            targetCol = colIndex + 1;
          }
        }
      } else if (e.key === 'ArrowLeft') {
        const input = e.currentTarget;
        if (input.selectionStart === input.selectionEnd && input.selectionStart === 0) {
          if (colIndex > 0) {
            e.preventDefault();
            targetCol = colIndex - 1;
          }
        }
      } else {
        return;
      }

      if (targetRow !== rowIndex || targetCol !== colIndex) {
        updateSelection({ rowIndex: targetRow, colIndex: targetCol }, { rowIndex: targetRow, colIndex: targetCol });
        const targetElement = document.getElementById(`cell-${targetRow}-${targetCol}`) as HTMLInputElement | null;
        if (targetElement) {
          targetElement.focus();
          targetElement.select();
        }
      }
    };

    return (
      <div className="min-h-screen p-3.5 sm:p-6 md:p-8 font-sans transition-colors bg-[#F9F8F4] dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 sm:mb-8 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/60 dark:border-gray-800 relative z-30">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-11 w-auto object-contain shrink-0" />
              <div className="h-8 sm:h-9 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="shrink-0">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                  {isAdmin ? 'Administrator Dashboard' : isManager ? 'Manager Dashboard' : 'Team Leader Dashboard'}
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {isAdmin ? 'System Administration & Performance Analytics' : isManager ? 'Executive Oversight & Analytics' : 'Performance & Quality Analytics'}
                </p>
              </div>
            </div>
            
            <UnifiedTopNavbar
              currentDashboard="cc"
              userProfile={userProfile}
              onNavigate={handleNavigateDashboard}
              onLogout={handleLogout}
              onOpenProfile={openProfileModal}
              onOpenSettings={openManageModal}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </div>

        {/* Team Cards */}
        {activeTeams.length === 1 ? (
          <div 
            style={{ background: 'var(--brand-gradient)' }}
            className="mb-6 sm:mb-8 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-[var(--brand-glow)] border border-white/20 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Users size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                    {activeTeams[0]}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 sm:mt-1 font-medium">
                    {selectedYear} Annual Team Performance Summary • {rows.length} Active Agents
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Grid (Permanent Full Year Data) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
              {(getEffectiveColumns(activeTeams[0], 'YEAR - AVG', selectedYear, columnsMap[activeTeams[0]] || [])).map((col) => {
                const annualVal = calcYearTeamStat(col);
                return (
                  <div key={col.id} className="bg-white/10 dark:bg-black/25 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition shadow-sm">
                    <div className="text-[10px] sm:text-[11px] font-bold tracking-wide text-white/90 truncate mb-1.5 sm:mb-2" title={cleanColLabel(col.id, col.label)}>
                      {cleanColLabel(col.id, col.label)}
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
                      {annualVal}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-white/70 font-medium mt-1">
                      {toTitleCase(col.aggregation)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {isCombinedCallCenter && (
              <div 
                style={{ background: 'var(--brand-gradient)' }}
                className="mb-5 sm:mb-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-[var(--brand-glow)] border border-white/20 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
              >
                <div 
                  className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30" 
                  style={{ backgroundColor: 'var(--brand-glow)' }}
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black shadow-md border border-white/20">
                      <PhoneCall size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                          Combined Call Center Analytics
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Younis + Ankido
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-black tracking-tight text-white mt-0.5">
                        Call Center Combined Performance
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-white/15 text-emerald-100 border border-white/20 backdrop-blur-md">
                      {rows.length} Total Call Agents
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCcBreakdownModal(true)}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-amber-400 text-gray-950 hover:bg-amber-300 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <BarChart3 size={14} />
                      <span>Side-by-Side Breakdown</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full relative z-10">
                  {(getEffectiveColumns('Ankido Buya Team', 'YEAR - AVG', selectedYear, columnsMap['Ankido Buya Team'] || DEFAULT_OTHER_COLUMNS)).slice(0, 8).map(col => (
                    <div key={col.id} className="p-2 sm:p-2.5 rounded-xl text-center bg-white/10 border border-white/10 backdrop-blur-md">
                      <div className="text-[10px] font-bold truncate text-emerald-100/90" title={cleanColLabel(col.id, col.label)}>
                        {cleanColLabel(col.id, col.label)}
                      </div>
                      <div className="font-black text-xs sm:text-base mt-1 text-white tabular-nums">
                        {calcYearTeamStat(col)}
                      </div>
                      <div className="text-[9px] text-emerald-300/70 font-semibold mt-0.5 uppercase">
                        {toTitleCase(col.aggregation)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mb-6 sm:mb-8">
              {activeTeams.map((teamName) => {
                const isActive = isCombinedCallCenter 
                  ? (teamName === 'Younis Kamal Team' || teamName === 'Ankido Buya Team')
                  : selectedTeam === teamName;
                const teamCols = getEffectiveColumns(teamName, 'YEAR - AVG', selectedYear, columnsMap[teamName] || []);
                return (
                  <button
                    key={teamName}
                    onClick={() => {
                      setSelectedTeam(teamName);
                      setIsCombinedCallCenter(false);
                    }}
                    style={isActive ? { background: 'var(--brand-gradient)' } : undefined}
                    className={`text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between transition-all border cursor-pointer relative overflow-hidden
                      ${isActive 
                        ? 'text-white border-transparent shadow-lg shadow-[var(--brand-glow)] ring-2 ring-white/40 scale-[1.01]' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'}`}
                  >
                    <div className="flex justify-between items-start w-full mb-3 sm:mb-4">
                      <div>
                        <span className={`text-[10px] font-bold tracking-widest block mb-0.5 sm:mb-1 ${isActive ? 'text-emerald-200' : 'text-gray-400'}`}>
                          {isCombinedCallCenter && (teamName === 'Younis Kamal Team' || teamName === 'Ankido Buya Team') ? 'Call Center Member' : 'Team Performance'}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold tracking-tight">
                          {teamName}
                        </h2>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        {isActive ? (isCombinedCallCenter ? 'Active (CC)' : 'Selected') : 'Select'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full mt-2">
                      {teamCols.slice(0, 8).map(col => (
                        <div key={col.id} className={`p-1.5 sm:p-2 rounded-xl text-center border ${isActive ? 'bg-white/10 border-white/10' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700'}`}>
                          <div className={`text-[9px] font-bold truncate ${isActive ? 'text-emerald-100/80' : 'text-gray-400'}`} title={cleanColLabel(col.id, col.label)}>
                            {cleanColLabel(col.id, col.label)}
                          </div>
                          <div className="font-extrabold text-xs sm:text-sm mt-0.5">
                            {isActive ? calcYearTeamStat(col, teamName) : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Month Tabs & Controls Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 sm:p-2 pr-3 sm:pr-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 w-full shadow-sm mb-4 sm:mb-5">
          {/* Pinned Left Controls: Year, Search, Agent count, Multi-cell tools */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Year selector - Sleek Modern Custom Dropdown */}
            <div className="shrink-0">
              <ModernDropdown
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                options={["2026", "2027", "2028", "2029", "2030"]}
                variant="solid-green"
                size="sm"
                ariaLabel="Select Year"
              />
            </div>

            {/* Search Agent Input & Count next to Year - Sleek, Spacious, and Modern */}
            <div className="relative flex-shrink-0">
              <Search size={13} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search agent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-7 py-1 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/90 hover:bg-white dark:bg-gray-900/70 dark:hover:bg-gray-900 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1C6B53]/30 focus:border-[#1C6B53] dark:focus:border-emerald-500 text-[11px] sm:text-xs w-36 sm:w-48 md:w-56 transition-all dark:text-gray-100 font-semibold shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 transition cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100/90 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-[10px] sm:text-[11px] font-bold whitespace-nowrap flex-shrink-0 border border-gray-200/50 dark:border-gray-700/50 shadow-2xs">
              <Users size={11} className="text-gray-400" />
              <span>{filteredRows.length} Agents</span>
            </div>

            {/* Selection Action Toolbar */}
            {isMultiCellSelected && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/90 border border-[#1C6B53]/30 dark:border-emerald-600/40 rounded-lg text-xs text-[#1C6B53] dark:text-emerald-300 font-bold shadow-xs flex-shrink-0 animate-fadeIn">
                <span className="tabular-nums text-[11px]">{selectedCellCount} selected</span>
                <div className="h-3 w-px bg-emerald-300 dark:bg-emerald-700" />
                <button 
                  onClick={handleCopySelection}
                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition text-[11px]"
                  title="Copy selected cells (Ctrl+C)"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
                {!isAggregate && (
                  <>
                    <div className="h-3 w-px bg-emerald-300 dark:bg-emerald-700" />
                    <button 
                      onClick={handleClearSelectedCells}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-950/60 transition text-[11px]"
                      title="Clear selected cells (Delete / Backspace)"
                    >
                      <Trash2 size={11} />
                      <span>Clear</span>
                    </button>
                  </>
                )}
                <div className="h-3 w-px bg-emerald-300 dark:bg-emerald-700" />
                <button 
                  onClick={() => updateSelection(null, null)}
                  className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  title="Deselect (Esc)"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-0.5 flex-shrink-0" />

          {/* Horizontally Scrollable Months and Quarters */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide flex-1 py-0.5">
            {/* Months (Jan - Dec) */}
            {months.map(m => {
              const displayLabel = m.charAt(0) + m.slice(1).toLowerCase();
              const isSel = selectedMonth === m;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  style={isSel ? { backgroundColor: 'var(--brand-primary)', color: '#ffffff' } : undefined}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                    isSel
                      ? 'shadow-md shadow-[var(--brand-glow)]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}

            {/* Separator */}
            <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-0.5 flex-shrink-0" />

            {/* Quarters & Halves */}
            {periods.map(p => {
              const isSel = selectedMonth === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedMonth(p)}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-xs font-extrabold transition flex-shrink-0 cursor-pointer ${
                    isSel
                      ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-glow)]'
                      : 'bg-[var(--brand-bg-light)] dark:bg-gray-800 text-[var(--brand-text-light)] dark:text-[var(--brand-dark-text-light)] hover:opacity-90'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Separator */}
            <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-0.5 flex-shrink-0" />

            {/* Button next to H1 / H2: Younis + Ankido Combined Data (Compact & Brief) */}
            <button
              type="button"
              onClick={() => setIsCombinedCallCenter(prev => !prev)}
              style={isCombinedCallCenter ? { background: 'var(--brand-gradient)' } : undefined}
              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[11px] font-black transition-all flex-shrink-0 flex items-center gap-1 border cursor-pointer whitespace-nowrap ${
                isCombinedCallCenter
                  ? 'text-white border-transparent shadow-md shadow-[var(--brand-glow)] ring-2 ring-[var(--brand-glow)]'
                  : 'bg-[var(--brand-bg-light)] dark:bg-gray-800 text-[var(--brand-text-light)] dark:text-[var(--brand-dark-text-light)] border-[var(--brand-border-light)] dark:border-gray-700 hover:opacity-90'
              }`}
              title="View combined data for Younis and Ankido teams (Call Center Combined: Younis + Ankido)"
            >
              <Users
                size={11}
                className={isCombinedCallCenter ? 'text-yellow-300 animate-pulse' : 'text-[var(--brand-text-light)] dark:text-[var(--brand-dark-text-light)]'}
              />
              <span>CC (Y+A)</span>
            </button>

            {/* Sync Data Button (Right next to CC (Y+A)) */}
            {!isAggregate && currentMonthCompleteness && (
              <>
                <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-0.5 flex-shrink-0" />
                {!currentMonthCompleteness.isComplete ? (
                  <button
                    type="button"
                    onClick={() => setShowIncompleteSyncModal(true)}
                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border cursor-pointer whitespace-nowrap bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/60 shadow-2xs shrink-0 active:scale-95"
                    title={`${selectedMonth} data is incomplete (${currentMonthCompleteness.completedAgents}/${currentMonthCompleteness.totalAgents}). Click to view missing fields.`}
                  >
                    <Clock size={11} className="text-amber-600 dark:text-amber-400" />
                    <span>Sync ({currentMonthCompleteness.completedAgents}/{currentMonthCompleteness.totalAgents})</span>
                  </button>
                ) : isCurrentMonthSynced ? (
                  <button
                    type="button"
                    onClick={() => setShowSyncedDetailsModal(true)}
                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 border cursor-pointer whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/70 shadow-2xs shrink-0 active:scale-95"
                    title="Data is published and live on Agent Dashboard. Click to manage sync."
                  >
                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Synced ✓</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSyncData}
                    disabled={isSyncingData}
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1C6B53] hover:from-emerald-700 hover:to-[#155a45] shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40 animate-pulse shrink-0 active:scale-95 disabled:opacity-50"
                    title={
                      isAdmin || isManager
                        ? "Manager / Admin: 100% complete! Click to sync ALL teams to Agent Dashboard & update Top Star."
                        : `100% data complete! Click to sync ${selectedTeam} to Agent Dashboard.`
                    }
                  >
                    <RefreshCw size={11} className={isSyncingData ? "animate-spin" : ""} />
                    <span>
                      {isSyncingData
                        ? "Syncing..."
                        : isAdmin || isManager
                        ? "Sync All Teams to Agents"
                        : `Sync to ${selectedTeam.replace(' Team', '')} Agents`}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Export PDF Button (Pinned Right in TL Controls Bar) */}
          <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-0.5 flex-shrink-0" />
          <button
            type="button"
            onClick={() => {
              setTlPdfQuarter(inferQuarterFromMonth(selectedMonth));
              setShowTlPdfModal(true);
            }}
            className="px-2.5 sm:px-3 py-1 rounded-xl text-[11px] font-black transition flex items-center gap-1.5 border cursor-pointer whitespace-nowrap bg-gray-900 hover:bg-gray-800 dark:bg-[#1C6B53] dark:hover:bg-[#155a45] text-white border-gray-800 dark:border-emerald-500/40 shadow-xs shrink-0 active:scale-95"
            title="Download Team Leader KPI & Agent Signatures PDF Report"
          >
            <Download size={12} />
            <span>Export PDF</span>
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mb-2 px-1 font-medium">
          <span>👈 Swipe horizontally to view all KPI columns 👉</span>
          <span>{activeCols.length} KPIs</span>
        </div>

        {/* Month Entry Lock Warning Banner */}
        {isCurrentMonthLocked && prevMonthIncompleteInfo && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                    Data Entry for {selectedMonth} is Locked
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60">
                    Locked
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 font-medium">
                  Please complete all data and KPIs for <strong>{prevMonthIncompleteInfo.prevMonth} {prevMonthIncompleteInfo.prevYear}</strong> first ({prevMonthIncompleteInfo.incompleteAgents.length} team members pending) before filling <strong>{selectedMonth}</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setSelectedMonth(prevMonthIncompleteInfo.prevMonth)}
                className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 transition shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft size={13} />
                <span>Back to {prevMonthIncompleteInfo.prevMonth}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMonthLockModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900/80 transition cursor-pointer whitespace-nowrap"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Monthly Team Performance Highlights & Trend Comparison */}
        {!isAggregate && mainPrevMonthName && !loading && rows.length > 0 && (
          <div className="mb-4 p-2.5 sm:p-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center shadow-2xs shrink-0">
                <TrendingUp size={15} strokeWidth={2.5} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs sm:text-[13px] font-black text-gray-900 dark:text-white tracking-tight">Team Trends</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  {selectedMonth} vs {mainPrevMonthName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {activeCols.slice(0, 6).map(col => {
                const curAvg = calcAvg(col, rows);
                const prevAvg = calcPrevMonthAvg(col);
                if (curAvg === '-' || prevAvg === '-' || !prevAvg) return null;
                const isTime = col.type === 'time';
                const isCount = col.aggregation === 'sum' || col.id.toLowerCase().includes('handled') || col.id.toLowerCase().includes('call');
                const isPercent = col.aggregation === 'average' && !isTime && !col.id.toLowerCase().includes('prod') && !col.id.toLowerCase().includes('score') && !isCount;
                
                const numVal = parseFloat(String(curAvg).replace(/,/g, ''));
                const displayVal = isCount && !isNaN(numVal) 
                  ? Math.round(numVal).toLocaleString()
                  : `${curAvg}${isPercent ? '%' : ''}`;

                return (
                  <div key={col.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50/90 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/60 shadow-2xs hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      {cleanColLabel(col.id, col.label)}
                    </span>
                    <span className="text-xs font-black text-gray-900 dark:text-gray-100 tabular-nums">
                      {displayVal}
                    </span>
                    <TrendBadge
                      currentValue={curAvg}
                      previousValue={prevAvg}
                      colId={col.id}
                      label={col.label}
                      prevMonthLabel={mainPrevMonthName}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div 
          onPaste={handleTablePaste}
          className={`bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar overscroll-x-contain touch-pan-x ${isSelecting ? 'select-none cursor-crosshair' : ''}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border-b border-red-100 dark:border-red-800">
              {errorMsg}
              <button onClick={() => setErrorMsg(null)} className="ml-4 underline text-red-400 dark:text-red-300">dismiss</button>
            </div>
          )}

          <div className="min-w-[1000px] sm:min-w-[1150px]">
            {/* Table Header */}
            <div className="grid gap-2 px-3 sm:px-5 py-3.5 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-md text-xs font-bold border-b border-gray-200/80 dark:border-gray-800 items-center rounded-t-2xl"
                 style={{ gridTemplateColumns: `minmax(180px, 2.2fr) repeat(${activeCols.length}, minmax(105px, 1fr))` }}>
              <div className="pl-3 sm:pl-4 py-1 sticky left-0 bg-gray-50/95 dark:bg-gray-800/95 z-20 shadow-[3px_0_8px_-3px_rgba(0,0,0,0.06)] text-[11px] sm:text-xs font-extrabold text-gray-500 dark:text-gray-400 rounded-tl-2xl">
                Agent
              </div>
              {activeCols.map(col => (
                <div key={col.id} className="text-center font-extrabold text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 px-1 truncate" title={cleanColLabel(col.id, col.label)}>
                  {cleanColLabel(col.id, col.label)}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800/70 bg-white dark:bg-gray-900">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading data...</div>
              ) : filteredRows.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No team members found. Click &quot;Manage Agents&quot; to add members.</div>
              ) : (
                filteredRows.map((row, index) => {
                  const actualIndex = rows.findIndex(r => r === row);
                  const disabled = isAggregate || !!row._readonly;

                  return (
                    <div key={row._memberId || index} className="grid gap-2 px-3 sm:px-5 py-2 sm:py-2.5 items-center hover:bg-[var(--brand-bg-light)]/40 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
                         style={{ gridTemplateColumns: `minmax(180px, 2.2fr) repeat(${activeCols.length}, minmax(105px, 1fr))` }}>
                      
                      <div className="pl-3 sm:pl-4 py-1 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5 sm:gap-3 sticky left-0 bg-white dark:bg-gray-900 group-hover:bg-[var(--brand-bg-light)]/40 dark:group-hover:bg-gray-800/50 z-10 pr-3 shadow-[3px_0_8px_-3px_rgba(0,0,0,0.06)] transition-colors duration-150">
                        {row.photo_url ? (
                          <img src={row.photo_url} alt={row.agent_name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700 shadow-xs" />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border border-[var(--brand-border-light)] dark:border-gray-700 bg-[var(--brand-bg-light)] dark:bg-gray-800 text-[var(--brand-primary)] dark:text-[var(--brand-dark-text-light)] shadow-2xs select-none transition-transform duration-200 group-hover:scale-105"
                          >
                            {row.agent_name ? row.agent_name.charAt(0).toUpperCase() : <Users size={12} />}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold truncate max-w-[110px] sm:max-w-none text-gray-800 dark:text-gray-100">{row.display_name || row.agent_name}</span>
                          {isCombinedCallCenter && row.team && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0 border ${
                              row.team === 'Younis Kamal Team'
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/40'
                                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/40'
                            }`}>
                              {row.team === 'Younis Kamal Team' ? 'Younis' : 'Ankido'}
                            </span>
                          )}
                        </div>
                      </div>
                      {activeCols.map((col, colIndex) => {
                        const isSelected = isCellSelected(index, colIndex);
                        return (
                          <div 
                            key={col.id}
                            data-cell-pos="true"
                            data-row-index={index}
                            data-col-index={colIndex}
                            onMouseDown={(e) => handleCellMouseDown(e, index, colIndex)}
                            onMouseEnter={() => handleCellMouseEnter(index, colIndex)}
                            className="flex items-center justify-center p-0.5"
                          >
                            <input 
                              id={`cell-${index}-${colIndex}`}
                              disabled={disabled || isCurrentMonthLocked}
                              type="text"
                              onDragStart={(e) => e.preventDefault()}
                              onClick={() => {
                                if (isCurrentMonthLocked) setShowMonthLockModal(true);
                              }}
                              placeholder={
                                (col.id === 'wrapup' || col.id?.toLowerCase().includes('wrapup') || col.label?.toLowerCase().includes('wrapup'))
                                  ? '#'
                                  : col.type === 'time'
                                  ? 'mm:ss'
                                  : (col.aggregation === 'average' ? '%' : '#')
                              }
                              value={row[col.id] || ''}
                              onChange={(e) => handleChange(actualIndex, col.id, e.target.value)}
                              onBlur={() => handleBlur(actualIndex)}
                              onKeyDown={(e) => handleCellKeyDown(e, index, colIndex)}
                              className={`w-full max-w-[85px] sm:max-w-[95px] text-center rounded-lg px-2 py-1.5 text-xs sm:text-[13px] font-bold outline-none transition-all duration-150 shadow-2xs tabular-nums disabled:bg-gray-100/60 dark:disabled:bg-gray-800/40 disabled:border-transparent disabled:text-gray-500 dark:disabled:text-gray-400 ${isCurrentMonthLocked ? 'cursor-not-allowed' : 'cursor-text'} ${
                                isSelected && isMultiCellSelected
                                  ? 'bg-[var(--brand-bg-light)] dark:bg-gray-800 border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] dark:text-[var(--brand-dark-text-light)] font-black ring-2 ring-[var(--brand-glow)]'
                                  : isSelected
                                  ? 'bg-white dark:bg-gray-800 border-2 border-[var(--brand-primary)] text-gray-900 dark:text-gray-100 font-black ring-2 ring-[var(--brand-glow)] shadow-xs'
                                  : 'bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-medium placeholder:text-[11px] hover:border-gray-300 dark:hover:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-glow)]'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Team Average Row */}
            {!loading && (
               <div 
                 className="grid gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-t-2 border-gray-200/80 dark:border-gray-800 items-center font-bold rounded-b-2xl bg-[var(--brand-bg-light)] dark:bg-gray-800"
                 style={{
                   gridTemplateColumns: `minmax(180px, 2.2fr) repeat(${activeCols.length}, minmax(105px, 1fr))`
                 }}
               >
                 <div 
                   className="text-xs font-black text-gray-800 dark:text-gray-200 pl-3 sm:pl-4 py-1 sticky left-0 z-10 shadow-[3px_0_8px_-3px_rgba(0,0,0,0.06)] flex items-center gap-2 rounded-bl-2xl bg-[var(--brand-bg-light)] dark:bg-gray-800"
                 >
                   <span 
                     style={{ backgroundColor: 'var(--brand-primary)' }} 
                     className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                   />
                   <span className="truncate">{isCombinedCallCenter ? 'Call Center Combined Total / Avg' : 'Team Average'}</span>
                 </div>
                 {activeCols.map(col => {
                   const curAvg = calcAvg(col, rows);
                   const prevAvg = !isAggregate && mainPrevMonthName ? calcPrevMonthAvg(col) : null;
                   const isCount = col.aggregation === 'sum' || col.id.toLowerCase().includes('handled') || col.id.toLowerCase().includes('call');
                   const numVal = parseFloat(String(curAvg).replace(/,/g, ''));
                   const displayVal = isCount && !isNaN(numVal) ? Math.round(numVal).toLocaleString() : curAvg;

                   return (
                     <div 
                       key={col.id} 
                       className="flex flex-col items-center justify-center gap-0.5 text-center text-xs sm:text-[13px] font-black tabular-nums px-1 text-[var(--brand-primary)] dark:text-[var(--brand-dark-text-light)]"
                     >
                       <span>{displayVal}</span>
                       {prevAvg && prevAvg !== '-' && curAvg !== '-' && (
                         <TrendBadge
                           currentValue={curAvg}
                           previousValue={prevAvg}
                           colId={col.id}
                           label={col.label}
                           prevMonthLabel={mainPrevMonthName || undefined}
                           className="scale-90 origin-center"
                         />
                       )}
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          Agent names are fixed from the roster. Use &quot;Settings&quot; to edit members or columns. Data auto-saves when you click out of a field.
        </div>
      </div>

      {/* Side-by-Side Call Center Comparison Breakdown Modal */}
      {showCcBreakdownModal && (
        <div data-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overscroll-contain">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCcBreakdownModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-5 sm:p-7 w-full max-w-2xl border border-gray-200 dark:border-gray-800 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200/80 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1C6B53] to-teal-500 text-white flex items-center justify-center shadow-md">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    Call Center Side-by-Side Breakdown
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    Younis Kamal Team vs. Ankido Buya Team • {selectedMonth} {selectedYear}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCcBreakdownModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition shadow-2xs cursor-pointer shrink-0" title="Close" aria-label="Close"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs mb-5">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-black">
                    <th className="p-3">KPI / Metric</th>
                    <th className="p-3 text-center text-amber-700 dark:text-amber-400">Younis Kamal Team</th>
                    <th className="p-3 text-center text-emerald-700 dark:text-emerald-400">Ankido Buya Team</th>
                    <th className="p-3 text-center bg-[#1C6B53]/10 text-[#1C6B53] dark:text-emerald-300">Combined Total / Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold text-gray-800 dark:text-gray-200">
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-3 font-extrabold flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span>Active Agents</span>
                    </td>
                    <td className="p-3 text-center tabular-nums font-semibold">
                      {rows.filter(r => r.team === 'Younis Kamal Team').length}
                    </td>
                    <td className="p-3 text-center tabular-nums font-semibold">
                      {rows.filter(r => r.team === 'Ankido Buya Team').length}
                    </td>
                    <td className="p-3 text-center font-black bg-[#1C6B53]/5 text-[#1C6B53] dark:text-emerald-300 tabular-nums">
                      {rows.length}
                    </td>
                  </tr>
                  {activeCols.map(col => {
                    const younisVal = calcAvg(col, rows.filter(r => r.team === 'Younis Kamal Team'));
                    const ankidoVal = calcAvg(col, rows.filter(r => r.team === 'Ankido Buya Team'));
                    const combinedVal = calcAvg(col, rows);
                    return (
                      <tr key={col.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="p-3">
                          <span className="font-extrabold">{cleanColLabel(col.id, col.label)}</span>
                          <span className="text-[10px] text-gray-400 ml-1.5 uppercase font-medium">({col.aggregation})</span>
                        </td>
                        <td className="p-3 text-center tabular-nums font-semibold text-gray-700 dark:text-gray-300">
                          {younisVal}
                        </td>
                        <td className="p-3 text-center tabular-nums font-semibold text-gray-700 dark:text-gray-300">
                          {ankidoVal}
                        </td>
                        <td className="p-3 text-center font-black bg-[#1C6B53]/5 text-[#1C6B53] dark:text-emerald-300 tabular-nums">
                          {combinedVal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCcBreakdownModal(false)}
                className="px-5 py-2.5 bg-[#1C6B53] hover:bg-[#155a45] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {renderUniversalModals()}

      {/* Previous Month Incomplete Lock Modal */}
      {isMounted && showMonthLockModal && prevMonthIncompleteInfo && createPortal(
        <div data-modal="true" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-800/80 overflow-hidden text-left animate-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-100 dark:border-amber-900/50 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Lock size={22} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 mb-1">
                    Previous Month Required
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Complete {prevMonthIncompleteInfo.prevMonth} {prevMonthIncompleteInfo.prevYear} First
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMonthLockModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition shadow-2xs cursor-pointer shrink-0" title="Close" aria-label="Close"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                You cannot fill or edit data for <strong>{selectedMonth}</strong> until you finish entering all metrics and KPIs for <strong>{prevMonthIncompleteInfo.prevMonth} {prevMonthIncompleteInfo.prevYear}</strong> for all team members.
              </div>

              <div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                  <span>Team members with pending data:</span>
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                    {prevMonthIncompleteInfo.incompleteAgents.length} / {prevMonthIncompleteInfo.totalAgents}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  {prevMonthIncompleteInfo.incompleteAgents.map((ag, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 text-xs shadow-xs">
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[170px]">{ag.name}</span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                        {ag.missingFields.slice(0, 3).map((f, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 font-semibold border border-red-200/60 dark:border-red-800/60">
                            {f}
                          </span>
                        ))}
                        {ag.missingFields.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-semibold">
                            +{ag.missingFields.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth(prevMonthIncompleteInfo.prevMonth);
                    setShowMonthLockModal(false);
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <ArrowLeft size={14} />
                  <span>Go to {prevMonthIncompleteInfo.prevMonth} to Complete Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMonthLockModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminBypassMonthLock(true);
                      setShowMonthLockModal(false);
                    }}
                    className="text-[11px] text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 underline font-medium transition cursor-pointer"
                  >
                    Bypass lock (Admin Override)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Incomplete Sync Data Modal */}
      {isMounted && showIncompleteSyncModal && currentMonthCompleteness && createPortal(
        <div data-modal="true" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-800/80 overflow-hidden text-left animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-100 dark:border-amber-900/50 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 mb-1">
                    Incomplete Data
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {selectedMonth} {selectedYear} Data Completeness
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIncompleteSyncModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition shadow-2xs cursor-pointer shrink-0"
                title="Close"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                Data for this month cannot be synced or published to the <strong>Agent Dashboard</strong> until 100% of all metrics are filled for every team member listed below.
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span>Entry Completion Progress:</span>
                  <span className="text-amber-700 dark:text-amber-300 font-mono font-extrabold">
                    {currentMonthCompleteness.completedAgents} of {currentMonthCompleteness.totalAgents} employees ({Math.round((currentMonthCompleteness.completedAgents / Math.max(1, currentMonthCompleteness.totalAgents)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((currentMonthCompleteness.completedAgents / Math.max(1, currentMonthCompleteness.totalAgents)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                  <span>Team members with pending fields:</span>
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                    {currentMonthCompleteness.incompleteAgents.length} remaining
                  </span>
                </div>
                <div className="max-h-52 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {currentMonthCompleteness.incompleteAgents.map((ag, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 text-xs shadow-xs border border-gray-100 dark:border-gray-700/60">
                      <span className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[170px]">{ag.name}</span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {ag.missingFields.map((f, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold border border-red-200/60 dark:border-red-800/60">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncompleteSyncModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-md transition cursor-pointer active:scale-95"
                >
                  Return & Complete Pending Data
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Synced Details & Actions Modal */}
      {isMounted && showSyncedDetailsModal && currentMonthSyncDetails && createPortal(
        <div data-modal="true" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800/80 overflow-hidden text-left animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-b border-emerald-100 dark:border-emerald-900/50 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1C6B53] text-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 mb-1">
                    Approved & Published
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {selectedMonth} {selectedYear} Sync Status
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncedDetailsModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition shadow-2xs cursor-pointer shrink-0"
                title="Close"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 font-medium leading-relaxed">
                This month&apos;s data is currently published and visible with all scores and metrics on the <strong>Agent Dashboard</strong>.
              </div>

              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500 dark:text-gray-400">Last Synced:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {currentMonthSyncDetails.syncedAt ? new Date(currentMonthSyncDetails.syncedAt).toLocaleString('en-GB') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500 dark:text-gray-400">Approved By:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {currentMonthSyncDetails.syncedBy || 'Team Leader'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-gray-400">Employees Included:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {currentMonthSyncDetails.agentCount || (currentMonthCompleteness?.totalAgents ?? '-')} members
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSyncData}
                  disabled={isSyncingData}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isSyncingData ? "animate-spin" : ""} />
                  <span>
                    {isSyncingData
                      ? "Updating..."
                      : isAdmin || isManager
                      ? "Re-sync All Teams to Agents"
                      : `Re-sync to ${selectedTeam.replace(' Team', '')} Agents`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleUnsyncData}
                  disabled={isSyncingData}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  <span>Unpublish (Revert to Draft)</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Team Leader Export PDF Modal (with Weekly KPI Signatures) */}
      {isMounted && showTlPdfModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C6B53] text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                    Export KPI Sign-off Report (PDF)
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Signatures &amp; timestamps register (no performance scores)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTlPdfModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Report Scope Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-700/70">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Team / View</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white mt-0.5 block truncate">
                    {isCombinedCallCenter ? "CC Combined (Y+A)" : selectedTeam}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-700/70">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Selected Week &amp; Roster</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white mt-0.5 block">
                    {selectedYear} &bull; {tlPdfQuarter} &bull; W{tlPdfWeek} &bull; {filteredRows.length} Agents
                  </span>
                </div>
              </div>

              {/* Quarter Selection for Signatures */}
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 block mb-2">
                  Select Signature Quarter ({selectedYear}):
                </label>
                <div className="grid grid-cols-4 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setTlPdfQuarter(q)}
                      className={`py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        tlPdfQuarter === q
                          ? "bg-[#1C6B53] text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Week Selection for Signatures */}
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 block mb-2">
                  Select KPI Signature Week (W1 &ndash; W12):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setTlPdfWeek(w)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        tlPdfWeek === w
                          ? "bg-[#1C6B53] text-white shadow-xs"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      W{w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Signatures Readiness Box */}
              {(() => {
                const signedAgents = filteredRows.filter(r =>
                  findKpiSession(r.agent_name || r.display_name || "", selectedYear, tlPdfQuarter, tlPdfWeek)?.status === "approved"
                ).length;
                return (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                        KPI Signatures for {selectedYear} &bull; {tlPdfQuarter} &bull; W{tlPdfWeek}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Each signed agent&apos;s signature &amp; timestamp will be printed on the PDF.
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 text-xs font-black text-[#1C6B53] dark:text-emerald-300 shrink-0">
                      {signedAgents} / {filteredRows.length} Signed
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowTlPdfModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportTlPdf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-[#1C6B53] hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-900/20 transition active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>Download / Print PDF Report</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification for Sync Success */}
      {isMounted && syncSuccessToast && createPortal(
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 bg-[#1C6B53] text-white rounded-2xl shadow-2xl text-xs font-bold animate-fadeIn border border-emerald-400/30">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
          <div>
            <div className="font-extrabold text-sm">Data Synced Successfully!</div>
            <div className="text-[11px] text-white/80 font-normal">{selectedMonth} {selectedYear} data is now live on Agent Dashboard and updated in Top Star.</div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification for Copy/Paste */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#1C6B53] text-white rounded-xl shadow-xl text-xs font-bold animate-fadeIn border border-emerald-400/30">
          <Check size={14} />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Mobile PWA Install Floating Banner */}
      <PwaInstallBanner />
    </div>
  );
}
