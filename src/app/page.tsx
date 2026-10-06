"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { auth, db, getSystemAuthor } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, updateDoc, addDoc, deleteDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { Search, Trash2, UserPlus, UserMinus, Users, Moon, Sun, LogOut, Settings, Plus, X, Edit2, Briefcase, Columns, ChevronDown, Save, ShieldCheck, Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, LayoutDashboard, Sparkles, Check, Calendar, Award, CheckCircle2, TrendingUp, Clock, PhoneOff, Activity, PhoneCall, PhoneMissed, Timer, PhoneIncoming, PhoneOutgoing, Copy, Smartphone, Download, Share2, MessageSquare, Star, Trophy, Medal, BarChart3, ClipboardCheck } from "lucide-react";
import { fetchTopStarData, fetchTopStarCriteria, normalizeName, formatToMinutesAndSeconds, getTopStarMotivationalQuote } from "@/lib/topStarUtils";

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
  { id: 'quality', label: 'Quality %', type: 'number', aggregation: 'average' },
  { id: 'exam', label: 'Exam %', type: 'number', aggregation: 'average' },
  { id: 'productivity', label: 'Prod %', type: 'number', aggregation: 'average' },
  { id: 'aht', label: 'Aht S', type: 'time', aggregation: 'average' },
  { id: 'hold', label: 'Hold S', type: 'time', aggregation: 'average' },
  { id: 'wrapup', label: 'Wrapup', type: 'number', aggregation: 'average' },
  { id: 'handled', label: 'Handled', type: 'number', aggregation: 'sum' },
  { id: 'abandoned', label: 'Abandoned', type: 'number', aggregation: 'sum' },
];

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
  const sanitizeCols = (cols: ColumnConfig[]) => cols.map(c => {
    if (c.id === 'wrapup' || c.id?.toLowerCase().includes('wrapup') || c.label?.toLowerCase().includes('wrapup')) {
      return { ...c, type: 'number' as const };
    }
    return c;
  });

  if (team !== 'Mohammed Dlshad Team') {
    return sanitizeCols(baseCols && baseCols.length > 0 ? baseCols : DEFAULT_OTHER_COLUMNS);
  }
  const isMayPlus = isFromMayOnwards(year, month);
  const srcCols = baseCols && baseCols.length > 0 ? baseCols : (isMayPlus ? DEFAULT_CHAT_COLUMNS : DEFAULT_CHAT_COLUMNS_HISTORICAL);

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

const QualityDashboard = dynamic(() => import("@/components/QualityDashboard"), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Quality Dashboard...</p>
    </div>
  ),
  ssr: false,
});

const TopStarDashboard = dynamic(() => import("@/components/TopStarDashboard"), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Top Star Leaderboard...</p>
    </div>
  ),
  ssr: false,
});

const AnnualEvaluationDashboard = dynamic(() => import("@/components/AnnualEvaluationDashboard"), {
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
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
  if (upper === 'PROD' || upper === 'PRODUCTIVITY') return 'Productivity';
  return str.replace(/\w\S*/g, (txt) => {
    const u = txt.toUpperCase();
    if (u === 'ART') return 'ART';
    if (u === 'AHT') return 'AHT';
    if (u === 'PROD') return 'Productivity';
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
    color: 'text-emerald-600 dark:text-emerald-400', 
    bgLight: 'bg-emerald-500/10', 
    bgDark: 'dark:bg-emerald-500/15',
    border: 'bg-emerald-500',
    label: 'Quality Score'
  },
  exam: { 
    icon: CheckCircle2, 
    color: 'text-blue-600 dark:text-blue-400', 
    bgLight: 'bg-blue-500/10', 
    bgDark: 'dark:bg-blue-500/15',
    border: 'bg-blue-500',
    label: 'Assessment Exam'
  },
  productivity: { 
    icon: TrendingUp, 
    color: 'text-purple-600 dark:text-purple-400', 
    bgLight: 'bg-purple-500/10', 
    bgDark: 'dark:bg-purple-500/15',
    border: 'bg-purple-500',
    label: 'Productivity Rate'
  },
  aht: { 
    icon: Clock, 
    color: 'text-rose-600 dark:text-rose-400', 
    bgLight: 'bg-rose-500/10', 
    bgDark: 'dark:bg-rose-500/15',
    border: 'bg-rose-500',
    label: 'Average Handling Time'
  },
  hold: { 
    icon: PhoneOff, 
    color: 'text-cyan-600 dark:text-cyan-400', 
    bgLight: 'bg-cyan-500/10', 
    bgDark: 'dark:bg-cyan-500/15',
    border: 'bg-cyan-500',
    label: 'Hold Duration'
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
        <div className="bg-white/95 dark:bg-gray-850/95 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/25 rounded-2xl shadow-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 ring-1 ring-emerald-500/10">
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl animate-fadeIn text-right" dir="rtl">
            <div className="flex justify-between items-start mb-4 flex-row-reverse">
              <button onClick={() => setShowIosModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X size={18} />
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
                  مرر للأسفل واختر <span className="font-bold text-[#1C6B53] dark:text-emerald-400">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</span>.
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
  onOpenAnnualEval
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
}) {
  const defaultPeriod = getPreviousMonthAndYear();

  const initialAgent = (previewMode && allMembers && allMembers.length > 0)
    ? allMembers[0]
    : userProfile;
  const [currentAgent, setCurrentAgent] = useState<any>(initialAgent);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(defaultPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState(defaultPeriod.month);
  
  const [memberDoc, setMemberDoc] = useState<any>(null);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(
    previewMode ? false : (userProfile?.passwordUpdated !== true || userProfile?.mustChangePassword === true)
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (previewMode && allMembers && allMembers.length > 0 && !currentAgent?.agent_name) {
      setCurrentAgent(allMembers[0]);
    } else if (userProfile && !previewMode) {
      setCurrentAgent(userProfile);
    }
  }, [userProfile, previewMode, allMembers]);

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

  const teamCols = getEffectiveColumns(currentAgent?.team || '', selectedMonth, selectedYear, columnsMap[currentAgent?.team] || []);
  const tableName =
    currentAgent?.team === 'Younis Kamal Team' ? 'younis_metrics' :
    currentAgent?.team === 'Ankido Buya Team' ? 'ankido_metrics' :
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

    let rawMetricsDocs: any[] = [];
    let syncedRegistry: Record<string, any> | null = null;
    const sectionSlug = getQaSectionSlug(currentAgent?.team || "");

    const applyAgentMetrics = () => {
      const targetLower = targetName.toLowerCase();
      const filtered = rawMetricsDocs
        .filter(d => (d.agent_name || "").trim().toLowerCase() === targetLower)
        .map(d => {
          const row = { ...d };
          if (isQualitySyncEnabled(selectedYear, row.month) && syncedRegistry) {
            const syncKey = `${selectedYear}_${(row.month || "").toUpperCase()}_${sectionSlug}`;
            if (!syncedRegistry[syncKey]) {
              row.quality = "";
            }
          }
          return row;
        });
      setMetrics(filtered);
      setLoading(false);
    };

    const q = query(
      collection(db, tableName),
      where('year', '==', selectedYear)
    );
    const unsubMetrics = onSnapshot(q, (snap) => {
      rawMetricsDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      applyAgentMetrics();
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

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
      const targetLower = targetName.toLowerCase();
      const matchedDoc = mSnap.docs.find(
        d => (d.data().agent_name || "").trim().toLowerCase() === targetLower
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
      unsubSync();
      unsubMember();
    };
  }, [selectedYear, currentAgent, tableName]);

  const handleSaveProfile = async () => {
    if(!memberDoc) return;
    try {
       await updateDoc(doc(db, 'team_members', memberDoc.id), {
         display_name: editDisplayName,
         photo_url: editPhotoUrl
       });
       setMemberDoc({ ...memberDoc, display_name: editDisplayName, photo_url: editPhotoUrl });
       setShowEditProfile(false);
    } catch(e) {
       console.error(e);
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

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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
      const m = months.includes(selectedMonth) ? selectedMonth : "SEP";
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
  const currentAgentCanonicalName = normalizeName(currentAgent?.agent_name || currentAgent?.name || "");

  const monthIndex = MONTHS.indexOf((selectedMonth || "").toUpperCase());
  const yearNum = parseInt(selectedYear || "2026", 10);
  const isSepOrLater = yearNum > 2026 || (yearNum === 2026 && (monthIndex >= 8 || selectedMonth === "Q4" || selectedMonth === "H2"));

  // Team completeness check for current agent's team
  const myTeamCompleteness = isChatTeam ? topStarData?.chatCompleteness : topStarData?.callCompleteness;
  const isMonthComplete = myTeamCompleteness?.isComplete === true;

  // Active podium team completeness check (Only appears to employees when data is 100% complete)
  const activePodiumCompleteness = activePodiumTeam === "chat" ? topStarData?.chatCompleteness : topStarData?.callCompleteness;
  const isPodiumComplete = activePodiumCompleteness?.isComplete === true;

  const agentRankInfo = useMemo(() => {
    if (!topStarData || !isMonthComplete) return null;
    const teamList = isChatTeam ? topStarData.rankedChat : topStarData.rankedCall;
    return teamList.find((r: any) => normalizeName(r.name) === currentAgentCanonicalName) || null;
  }, [topStarData, isChatTeam, currentAgentCanonicalName, isMonthComplete]);

  const myRank = isMonthComplete ? (agentRankInfo?.rank ?? null) : null;
  const myScore = isMonthComplete ? (agentRankInfo?.scoreStr ?? null) : null;
  const isTop3 = isMonthComplete && isSepOrLater && myRank !== null && myRank <= 3;

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

  const chartData = months.map(m => {
    const row = metrics.find(r => r.month === m);
    const dataObj: any = { month: m };
    teamCols.forEach((col: any) => { dataObj[col.id] = parseVal(col, row); });
    return dataObj;
  });

  // Smart aggregation — respects format (mm:ss vs plain) and aggregation type (sum vs average)
  const avgCols = (monthList: string[], col: any) => {
    const rowsWithVals = monthList
      .map(m => {
        const r = metrics.find(row => row.month === m);
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

  // selectedPeriod: either a month name or a period label
  const isMonthSelected = months.includes(selectedMonth);
  const selectedMonthData: any = isMonthSelected
    ? (metrics.find(r => r.month === selectedMonth) || {})
    : {};

  const getDisplayVal = (col: any) => {
    if (isMonthSelected) {
      const v = getRowValForCol(selectedMonthData, col.id);
      return v !== "" ? v : (selectedMonthData[col.id] || '-');
    }
    const period = PERIODS.find(p => p.label === selectedMonth);
    if (!period) return '-';
    return avgCols(period.months, col);
  };

  const getAgentColLabel = (col: any) => {
    const id = (col.id || '').toLowerCase();
    const lbl = (col.label || '').toLowerCase();
    if (id === 'aht' || lbl === 'aht') return 'AHT';
    if (id === 'art' || lbl === 'art') return 'ART';
    if (id === 'productivity' || lbl === 'productivity' || id.includes('prod') || lbl.includes('prod')) return 'Productivity';
    if (id === 'wrapup' || lbl === 'wrapup' || id.includes('wrapup') || lbl.includes('wrapup')) return 'Wrapup Not Selected';
    if (id === 'call_handled' || lbl === 'call handled') return 'Call Handled';
    if (id === 'chat_handled' || lbl === 'chat handled') return 'Chat Handled';
    return toTitleCase(col.label);
  };

  return (
    <div className="min-h-screen p-3.5 sm:p-6 md:p-10 font-sans bg-[#F9F8F4] dark:bg-gray-900 transition-colors">
      <div className="max-w-[1400px] mx-auto">

        {/* Top Brand Header (FIB Logo & Portal Controls) */}
        <div className="relative z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 sm:mb-8 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/70 dark:border-gray-800">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-12 w-auto object-contain drop-shadow-xs" />
              <div className="h-8 sm:h-10 w-[1.5px] bg-gray-200 dark:bg-gray-700" />
              <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                  Agent Dashboard
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Performance & Scorecards Portal
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-50 flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xs flex-wrap w-full sm:w-auto justify-between sm:justify-end">
            {/* Agent Selector Dropdown in Preview Mode */}
            {previewMode && (
              <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                <button
                  type="button"
                  onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-2.5 sm:px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/60 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-600/80 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 transition shadow-xs cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#1C6B53] dark:text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">
                    {currentAgent?.agent_name ? currentAgent.agent_name.charAt(0).toUpperCase() : <Users size={11} />}
                  </div>
                  <span className="truncate max-w-[90px] sm:max-w-[160px]">{currentAgent?.agent_name || "Select Agent"}</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-600 text-gray-600 dark:text-gray-300 shrink-0">
                    {currentAgent?.team?.replace(' Team', '') || ''}
                  </span>
                  <ChevronDown size={12} className={`text-gray-400 dark:text-gray-400 transition-transform duration-200 ${agentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {agentDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAgentDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-72 max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 z-50 max-h-80 flex flex-col">
                      <div className="relative mb-2">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Filter agents..."
                          value={agentSearchTerm}
                          onChange={(e) => setAgentSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#1C6B53] text-gray-800 dark:text-gray-200 font-medium"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto space-y-1 flex-1 pr-1 overscroll-contain">
                        {allMembers
                          .filter(m => 
                            (m.agent_name || "").toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
                            (m.team || "").toLowerCase().includes(agentSearchTerm.toLowerCase())
                          )
                          .map(m => {
                            const isSelected = m.agent_name === currentAgent?.agent_name;
                            return (
                              <button
                                key={m.id}
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
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                                  isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-bold'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
                                    {m.agent_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="truncate">{m.agent_name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    {m.team?.replace(' Team', '')}
                                  </span>
                                  {isSelected && <Check size={13} className="text-[#1C6B53] dark:text-emerald-400" />}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Annual & Semi-Annual Evaluation Button */}
            {onOpenAnnualEval && (
              <button
                type="button"
                onClick={onOpenAnnualEval}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-[#1C6B53] dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                title="Performance Evaluation"
              >
                <ClipboardCheck size={13} />
                <span className="text-xs font-bold">Evaluation</span>
              </button>
            )}

            {/* Back to Dashboard Button in Preview Mode */}
            {previewMode && onExitPreview && (
              <button
                onClick={onExitPreview}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1C6B53] dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs transition active:scale-95 shrink-0"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            {(previewMode || toggleDarkMode) && (
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />
            )}

            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <button 
                onClick={toggleDarkMode} 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors shrink-0"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
              </button>
            )}

            {!previewMode && (
              <>
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />
                <button 
                  onClick={onLogout} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition shrink-0"
                >
                  <LogOut size={14} /> <span>Logout</span>
                </button>
              </>
            )}
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
                      <span className="truncate">"{getTopStarMotivationalQuote(myRank, selectedMonth)}"</span>
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
                    Pending month data
                  </span>
                </div>
              </div>
            )}

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

            {/* Year Performance Overview (FIB Emerald Theme - Modern & Ultra-Sleek) */}
            <div className="bg-gradient-to-br from-[#0C3227] via-[#124235] to-[#0A281F] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-[#0C3227]/20 border border-emerald-500/25 relative overflow-hidden text-white">
              {/* Subtle ambient brand glow in background */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#1C6B53]/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00A887]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-white/10 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-1.5">
                    <Sparkles size={11} className="text-emerald-300" />
                    <span>Year Performance</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    {selectedYear} Overview
                  </h2>
                  <p className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5 sm:mt-1 font-medium">
                    Consolidated annual metrics across all 12 months
                  </p>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-100 tracking-wide">12 Months Consolidated</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6 relative z-10">
                {getEffectiveColumns(currentAgent?.team || '', 'YEAR - AVG', selectedYear, columnsMap[currentAgent?.team] || []).map((col: any) => {
                  const yearAvg = avgCols(months, col);
                  return (
                    <div 
                      key={col.id} 
                      className="relative overflow-hidden bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/15 hover:border-emerald-400/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
                    >
                      <span className="text-[11px] sm:text-xs font-semibold text-emerald-100/80 group-hover:text-white transition-colors truncate block">
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
              <div className="flex items-center px-1 overflow-x-auto scrollbar-hide gap-1 sm:gap-1.5">
                {/* Modern Year Select Dropdown beside months */}
                <div className="relative shrink-0 mr-0.5 sm:mr-1">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-1.5 sm:pl-3.5 sm:pr-8 sm:py-2 text-[11px] sm:text-xs font-black rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 outline-none cursor-pointer shadow-xs hover:bg-emerald-100/60 transition-all"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#1C6B53] dark:text-emerald-400 font-bold" />
                </div>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1 shrink-0" />

                {/* Month tabs */}
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
                    const isMe = normalizeName(agent.name) === currentAgentCanonicalName;
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
                      {/* Header: Icon + Metric Title (clean without secondary subtitle) */}
                      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${meta.bgLight} ${meta.bgDark} ${meta.color} shadow-xs group-hover:scale-110 transition-transform`}>
                            <IconComp size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-base font-black text-gray-800 dark:text-gray-100 tracking-tight block truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {cardLabel}
                          </span>
                        </div>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditProfile(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overscroll-contain">
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

      {/* Mobile PWA Install Floating Banner */}
      <PwaInstallBanner />
    </div>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isAdmin = session?.email?.toLowerCase() === 'mohammed.dlshad0@gmail.com' || userProfile?.role === 'admin';
  const isManager = isAdmin || session?.email?.toLowerCase() === 'jalal.burghol@agent.com' || userProfile?.role === 'manager';
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
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
      return localStorage.getItem("app_show_agent_preview") === "true";
    }
    return false;
  });
  const [showQualityView, setShowQualityView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_show_quality_view") === "true";
    }
    return false;
  });
  const [showTopStarView, setShowTopStarView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_show_top_star_view") === "true";
    }
    return false;
  });
  const [showAnnualEvalView, setShowAnnualEvalView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_show_annual_eval_view") === "true";
    }
    return false;
  });
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
  const qaCacheRef = useRef<Record<string, any>>({});
  const selectedMonthRef = useRef(selectedMonth);
  const selectedTeamRef = useRef(selectedTeam);
  const selectedYearRef = useRef(selectedYear);

  useEffect(() => { selectedMonthRef.current = selectedMonth; }, [selectedMonth]);
  useEffect(() => { selectedTeamRef.current = selectedTeam; }, [selectedTeam]);
  useEffect(() => { selectedYearRef.current = selectedYear; }, [selectedYear]);

  const [columnsMap, setColumnsMap] = useState<Record<string, ColumnConfig[]>>({});

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
  const [allMembers, setAllMembers] = useState<any[]>([]);
  
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberTeam, setNewMemberTeam] = useState<TeamName>('Younis Kamal Team');
  const [deleteTarget, setDeleteTarget] = useState<{ memberId: string; name: string; team: string } | null>(null);

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

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showManageMembers || showProfileModal || deleteTarget || showForgotModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showManageMembers, showProfileModal, deleteTarget, showForgotModal]);

  // Real-time columns synchronization across all teams, TLs, and Agents
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'columns_config'), (snap) => {
      const map: Record<string, ColumnConfig[]> = {};
      snap.docs.forEach(d => {
        const rawCols = d.data().columns || [];
        const cols = rawCols.map((c: any) => {
          if (c.id === 'wrapup' || c.id?.toLowerCase().includes('wrapup') || c.label?.toLowerCase().includes('wrapup')) {
            return { ...c, type: 'number', aggregation: c.aggregation || 'average' };
          }
          return c;
        });
        map[d.id] = cols;
      });
      for (const t of TEAMS) {
        if (!map[t] || map[t].length === 0) {
          map[t] = t === 'Mohammed Dlshad Team' ? DEFAULT_CHAT_COLUMNS : DEFAULT_OTHER_COLUMNS;
          setDoc(doc(db, 'columns_config', t), { columns: map[t] }).catch(console.error);
        }
      }
      setColumnsMap(map);
    }, (err) => {
      console.error("Columns listener error:", err);
    });
    return () => unsub();
  }, []);

  // Real-time team members sync across all accounts
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'team_members'), (snap) => {
      const members = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      members.sort((a, b) => (a.agent_name > b.agent_name ? 1 : -1));
      setAllMembers(members);
    }, (err) => {
      console.error("Members listener error:", err);
    });
    return () => unsub();
  }, []);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const periods = ["Q1", "Q2", "Q3", "Q4", "H1", "H2"];

  const aggregateMap: Record<string, string[]> = {
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

  const isAggregate = Object.keys(aggregateMap).includes(selectedMonth);

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
      const members = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      members.sort((a, b) => (a.agent_name > b.agent_name ? 1 : -1));
      setAllMembers(members);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
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
        const isMohammedAzad = emailLower === 'mohammed.azad@agent.com';
        const isAgent = emailLower.endsWith('@agent.com');

        // Instant optimistic role identification: Mohammed Dlshad (The Admin) is EXEMPT
        if (isMohammed) {
          const adminProfile: any = {
            role: 'admin',
            isAdmin: true,
            team: 'Mohammed Dlshad Team',
            name: 'Mohammed Dlshad',
            email: user.email,
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
          const fallbackRole = isJalal ? 'manager' : (isYounis || isAnkido ? 'tl' : (isLara || isMohammedJihad ? 'qa' : (isMohammedAzad ? 'trainer' : (isAgent ? 'agent' : 'tl'))));
          setUserProfile({
            role: fallbackRole,
            name: isJalal ? 'Jalal Burghol' : (isYounis ? 'Younis Kamal' : (isAnkido ? 'Ankido Buya' : (isLara ? 'Lara Kamil' : (isMohammedJihad ? 'Mohammed Jihad' : (isMohammedAzad ? 'Mohammed Azad' : user.email?.split('@')[0]))))),
            team: isYounis ? 'Younis Kamal Team' : (isAnkido ? 'Ankido Buya Team' : (isLara ? 'Ankido Buya Team' : (isMohammedJihad ? 'Younis Kamal Team' : (isMohammedAzad ? 'All Call Teams' : (isJalal ? 'All' : undefined))))),
            email: isMohammedJihad ? 'mohammed.jihad@agent.com' : (isYounis ? 'younis.kamal@agent.com' : user.email),
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
    }

    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
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

    try {
      const primaryEmail =
        cleanEmail === 'younis.kamal@agent.com'
          ? 'younis.kamal.tl@agent.com'
          : cleanEmail === 'mohammed.jihad@agent.com'
          ? 'mohammed.jihad.qa@agent.com'
          : cleanEmail;

      try {
        await signInWithEmailAndPassword(auth, primaryEmail, password);
      } catch (firstErr: any) {
        if (primaryEmail !== cleanEmail) {
          await signInWithEmailAndPassword(auth, cleanEmail, password);
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
    } catch (e) {}
    await signOut(auth);
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
  const updateCachedMetric = (payload: any, docId?: string) => {
    const cacheKeys = isCombinedCallCenter 
      ? [`Combined_CallCenter_${selectedYear}`, `${payload.team || selectedTeam}_${selectedYear}`]
      : [`${selectedTeam}_${selectedYear}`];

    cacheKeys.forEach(cacheKey => {
      const cached = teamDataCacheRef.current[cacheKey];
      if (!cached) return;
      const pAgentLower = (payload.agent_name || "").trim().toLowerCase();
      const pMonthUpper = (payload.month || "").trim().toUpperCase();
      const idx = cached.allYearData.findIndex((m: any) =>
        (docId && m.id === docId) ||
        ((m.agent_name || "").trim().toLowerCase() === pAgentLower && (m.month || "").trim().toUpperCase() === pMonthUpper)
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
    if (isAgg) {
      const monthsInPeriod = (aggregateMap[targetMonth] || []).map(m => m.toUpperCase());
      const metrics = allYearData.filter(m => monthsInPeriod.includes((m.month || "").toUpperCase()));
      const agentGroups: Record<string, any[]> = {};
      metrics.forEach(row => {
        const key = (row.agent_name || "").trim().toLowerCase();
        if (!agentGroups[key]) agentGroups[key] = [];
        agentGroups[key].push(row);
      });

      const aggregatedRows = roster.map(member => {
        const memberKey = (member.agent_name || "").trim().toLowerCase();
        const agentRows = agentGroups[memberKey] || [];
        const avgRow: any = {
          _memberId: member.id,
          agent_name: member.agent_name,
          photo_url: member.photo_url || "",
          display_name: member.display_name || member.agent_name,
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
          const agentKey = (agentName || "").trim().toLowerCase();
          const slug = agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
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
            const docId = `${year}_${wr.quarter}_${sectionSlug}_${slug}`;
            const cachedQa = qaCache[docId];
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
        const key = (row.agent_name || "").trim().toLowerCase();
        if (!metricsByAgent[key]) {
          metricsByAgent[key] = { ...row };
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

      const mergedRows = roster.map(member => {
        const memberKey = (member.agent_name || "").trim().toLowerCase();
        const existing = metricsByAgent[memberKey];
        if (existing) {
          const rowData = {
            ...existing,
            agent_name: member.agent_name,
            _memberId: member.id,
            photo_url: member.photo_url || "",
            display_name: member.display_name || member.agent_name,
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
          agent_name: member.agent_name,
          photo_url: member.photo_url || "",
          display_name: member.display_name || member.agent_name,
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
            const slug = agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const docId = `${year}_${wr.quarter}_${sectionSlug}_${slug}`;
            const cachedQa = qaCache[docId];
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
    const toFetch: { docId: string; month: string; member: any }[] = [];

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
        const slug = member.agent_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const docId = `${year}_${wr.quarter}_${sectionSlug}_${slug}`;
        if (qaCacheRef.current[docId] === undefined) {
          toFetch.push({ docId, month: m, member });
        }
      }
    }

    if (toFetch.length === 0) return;

    // Mark pending to avoid duplicate in-flight requests
    toFetch.forEach(item => { qaCacheRef.current[item.docId] = null; });

    try {
      const snaps = await Promise.all(
        toFetch.map(item => getDoc(doc(db, 'quality_evaluations', item.docId)).catch(() => null))
      );

      let hasNewData = false;
      const syncedMonthsMap = qaCacheRef.current['config_sync_status']?.synced_months || null;

      snaps.forEach((snap, idx) => {
        const { docId, month, member } = toFetch[idx];
        if (snap && snap.exists()) {
          const data = snap.data();
          qaCacheRef.current[docId] = data;
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
              const memberLower = (member.agent_name || "").trim().toLowerCase();
              const existingMetric = cached?.allYearData.find(
                (r: any) => (r.agent_name || "").trim().toLowerCase() === memberLower && r.month === month
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
          qaCacheRef.current[docId] = {};
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
    if (!session || Object.keys(columnsMap).length === 0) return;

    if (isCombinedCallCenter) {
      const cacheKey = `Combined_CallCenter_${selectedYear}`;
      const teamCols = getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || columnsMap['Younis Kamal Team'] || DEFAULT_OTHER_COLUMNS);
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

      try {
        const [younisMembersSnap, ankidoMembersSnap, younisMetricsSnap, ankidoMetricsSnap] = await Promise.all([
          getDocs(query(collection(db, 'team_members'), where('team', '==', 'Younis Kamal Team'))),
          getDocs(query(collection(db, 'team_members'), where('team', '==', 'Ankido Buya Team'))),
          getDocs(query(collection(db, 'younis_metrics'), where('year', '==', selectedYear))),
          getDocs(query(collection(db, 'ankido_metrics'), where('year', '==', selectedYear)))
        ]);

        const younisRoster = younisMembersSnap.docs.map(d => ({ id: d.id, ...d.data(), team: 'Younis Kamal Team' })) as any[];
        const ankidoRoster = ankidoMembersSnap.docs.map(d => ({ id: d.id, ...d.data(), team: 'Ankido Buya Team' })) as any[];
        const roster = [...younisRoster, ...ankidoRoster].sort((a, b) => (a.agent_name > b.agent_name ? 1 : -1));

        const younisNames = new Set(younisRoster.map(d => (d.agent_name || "").trim().toLowerCase()));
        const ankidoNames = new Set(ankidoRoster.map(d => (d.agent_name || "").trim().toLowerCase()));

        const younisData = younisMetricsSnap.docs
          .map(d => ({ id: d.id, ...d.data(), team: 'Younis Kamal Team' }))
          .filter((d: any) => younisNames.has((d.agent_name || "").trim().toLowerCase()));

        const ankidoData = ankidoMetricsSnap.docs
          .map(d => ({ id: d.id, ...d.data(), team: 'Ankido Buya Team' }))
          .filter((d: any) => ankidoNames.has((d.agent_name || "").trim().toLowerCase()));

        const allYearData = [...younisData, ...ankidoData];

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
        setRows([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    const cacheKey = `${selectedTeam}_${selectedYear}`;
    const teamCols = getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);
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

      // Background check for missing QA docs without blocking UI
      const monthsToCheck = isAgg ? (aggregateMap[selectedMonth] || []) : [selectedMonth];
      fetchMissingQaDocs(roster, monthsToCheck, selectedTeam, selectedYear, tableName);
      return;
    }

    // 2. SLOW PATH (only initial load or team/year switch): Concurrent network fetch
    setLoading(true);
    setErrorMsg(null);

    try {
      const [membersSnap, metricsSnap] = await Promise.all([
        getDocs(query(collection(db, 'team_members'), where('team', '==', selectedTeam))),
        getDocs(query(collection(db, tableName), where('team', '==', selectedTeam), where('year', '==', selectedYear)))
      ]);

      const roster = membersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      roster.sort((a, b) => (a.agent_name > b.agent_name ? 1 : -1));

      const rosterNames = new Set(roster.map(d => (d.agent_name || "").trim().toLowerCase()));
      const allYearData = metricsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((d: any) => rosterNames.has((d.agent_name || "").trim().toLowerCase())) as any[];

      // Store in memory cache
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

      // Background check for missing QA docs in parallel
      const monthsToCheck = isAgg ? (aggregateMap[selectedMonth] || []) : [selectedMonth];
      fetchMissingQaDocs(roster, monthsToCheck, selectedTeam, selectedYear, tableName);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setErrorMsg(err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedMonth, selectedTeam, selectedYear, session, columnsMap, isCombinedCallCenter]);

  const handleChange = (index: number, field: string, value: string) => {
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
    if (isAggregate) return;
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
    if (!isAdmin) return;
    setManageColsTeam('ALL');
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
      setErrorMsg(`Failed to save: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'team_members', deleteTarget.memberId));
      
      const tName = deleteTarget.team === 'Younis Kamal Team' ? 'younis_metrics' :
                    deleteTarget.team === 'Ankido Buya Team' ? 'ankido_metrics' :
                    'mohammed_metrics';
      const q = query(collection(db, tName), where('agent_name', '==', deleteTarget.name));
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref));
      
      teamDataCacheRef.current = {};
      fetchAllMembers();
      fetchData(true);
    } catch (err: any) {
      setErrorMsg(`Failed to remove: ${err.message}`);
    }
    setDeleteTarget(null);
  };

  const handleAddColumn = async () => {
    if (!newColLabel.trim()) return;
    const newId = newColLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newCol: ColumnConfig = { id: newId, label: newColLabel.trim(), type: newColType, aggregation: newColAgg };
    
    try {
      const targetTeams = manageColsTeam === 'ALL' ? TEAMS : [manageColsTeam as TeamName];
      const newMap = { ...columnsMap };
      for (const t of targetTeams) {
        const currentCols = newMap[t] || [];
        if (!currentCols.some(c => c.id === newId)) {
          const updatedCols = [...currentCols, newCol];
          newMap[t] = updatedCols;
          await setDoc(doc(db, 'columns_config', t), { columns: updatedCols }, { merge: true });
        }
      }
      setColumnsMap(newMap);
      setNewColLabel("");
    } catch (err: any) {
      setErrorMsg(`Failed to add column: ${err.message}`);
    }
  };

  const handleEditColumnStart = (col: ColumnConfig) => {
    setEditingColId(col.id);
    setEditColLabel(col.label);
    setEditColType(col.type);
    setEditColAgg(col.aggregation);
  };

  const handleSaveColumn = async () => {
    if (!editingColId || !editColLabel.trim()) return;
    try {
      const targetTeams = manageColsTeam === 'ALL' ? TEAMS : [manageColsTeam as TeamName];
      const newMap = { ...columnsMap };
      for (const t of targetTeams) {
        const currentCols = newMap[t] || [];
        const updatedCols = currentCols.map(c => 
          c.id === editingColId 
            ? { ...c, label: editColLabel.trim(), type: editColType, aggregation: editColAgg } 
            : c
        );
        newMap[t] = updatedCols;
        await setDoc(doc(db, 'columns_config', t), { columns: updatedCols }, { merge: true });
      }
      setColumnsMap(newMap);
      setEditingColId(null);
    } catch (err: any) {
      setErrorMsg(`Failed to edit column: ${err.message}`);
    }
  };

  const handleRemoveColumn = async (colId: string) => {
    try {
      const targetTeams = manageColsTeam === 'ALL' ? TEAMS : [manageColsTeam as TeamName];
      const newMap = { ...columnsMap };
      for (const t of targetTeams) {
        const currentCols = newMap[t] || [];
        const updatedCols = currentCols.filter(c => c.id !== colId);
        newMap[t] = updatedCols;
        await setDoc(doc(db, 'columns_config', t), { columns: updatedCols }, { merge: true });
      }
      setColumnsMap(newMap);
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
    if (isAggregate) return;
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
    if (isAggregate) return;
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
                Team Leader & Agent Dashboard
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
                className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all mt-6 bg-gradient-to-r from-[#1C6B53] via-[#165a46] to-[#0F3A2E] hover:from-[#155a45] hover:to-[#0D2D24] shadow-lg shadow-[#1C6B53]/25 hover:shadow-xl hover:shadow-[#1C6B53]/35 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
              <div className="text-[10.5px] font-bold tracking-wide text-gray-400/90 dark:text-gray-500">
                Designed &amp; Engineered by <span className="text-[#1C6B53] dark:text-emerald-400 font-black">{getSystemAuthor()}</span>
              </div>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 relative">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Forgot Password</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a password reset link.</p>
                  </div>
                  <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                    <X size={20} />
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

    if (showAnnualEvalView) {
      return (
        <AnnualEvaluationDashboard
          userProfile={userProfile}
          allMembers={allMembers}
          onBack={() => {
            setShowAnnualEvalView(false);
          }}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      );
    }

    if (userProfile?.role === 'agent') {
      return (
        <AgentDashboard 
          userProfile={userProfile} 
          onLogout={handleLogout} 
          columnsMap={columnsMap} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenAnnualEval={() => setShowAnnualEvalView(true)}
        />
      );
    }

    if (showAgentPreview) {
      return (
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
        />
      );
    }

    if (userProfile?.role === 'qa' || userProfile?.role === 'trainer') {
      return (
        <QualityDashboard 
          userProfile={userProfile} 
          onBack={handleLogout} 
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenAnnualEval={() => setShowAnnualEvalView(true)}
        />
      );
    }

    if (showQualityView && (isAdmin || isManager)) {
      return (
        <QualityDashboard 
          userProfile={userProfile} 
          onBack={() => {
            teamDataCacheRef.current = {};
            qaCacheRef.current = {};
            setShowQualityView(false);
            fetchData(true);
          }} 
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenAnnualEval={() => setShowAnnualEvalView(true)}
        />
      );
    }

    if (showTopStarView && (isAdmin || isManager || userProfile?.role === 'tl')) {
      return (
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
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      );
    }

    const activeTeams = userProfile?.role === 'tl' && userProfile?.team 
      ? TEAMS.filter(t => t === userProfile.team) 
      : TEAMS;

    const displayedMembers = userProfile?.role === 'tl' && userProfile?.team
      ? allMembers.filter(m => m.team === userProfile.team)
      : allMembers;

    const activeCols = isCombinedCallCenter
      ? getEffectiveColumns('Ankido Buya Team', selectedMonth, selectedYear, columnsMap['Ankido Buya Team'] || columnsMap['Younis Kamal Team'] || DEFAULT_OTHER_COLUMNS)
      : getEffectiveColumns(selectedTeam, selectedMonth, selectedYear, columnsMap[selectedTeam] || []);
    const manageCols = manageColsTeam === 'ALL'
      ? (columnsMap['Ankido Buya Team'] || columnsMap['Younis Kamal Team'] || columnsMap[selectedTeam] || [])
      : (columnsMap[manageColsTeam] || []);

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
      <div className="min-h-screen p-3.5 sm:p-6 md:p-10 font-sans transition-colors dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 sm:mb-8 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/60 dark:border-gray-800">
            <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-12 w-auto object-contain" />
                <div className="h-8 sm:h-10 w-[1.5px] bg-gray-200 dark:bg-gray-700" />
                <div>
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                    {isAdmin ? 'Administrator Dashboard' : isManager ? 'Manager Dashboard' : 'Team Leader Dashboard'}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    {isAdmin ? 'System Administration & Performance Analytics' : isManager ? 'Executive Oversight & Analytics' : 'Performance & Quality Analytics'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm flex-wrap w-full sm:w-auto justify-between sm:justify-end">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
              </button>

              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700/80 mx-0.5" />

              {/* Navigation Items (Agent View, Settings, Quality) */}
              <div className="flex items-center gap-1">
                {isManager && (
                  <button
                    onClick={() => setShowAgentPreview(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#1C6B53] dark:hover:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all group cursor-pointer"
                    title="Agent View"
                  >
                    <div className="w-5 h-5 rounded-lg bg-[#1C6B53]/10 dark:bg-emerald-400/10 flex items-center justify-center text-[#1C6B53] dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <LayoutDashboard size={13} />
                    </div>
                    <span className="hidden xs:inline sm:inline">Agent View</span>
                  </button>
                )}


                {(isAdmin || isManager) && (
                  <button
                    onClick={() => setShowQualityView(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-all group cursor-pointer"
                    title="Quality Assurance Dashboard"
                  >
                    <div className="w-5 h-5 rounded-lg bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <Award size={13} />
                    </div>
                    <span className="hidden xs:inline sm:inline">Quality</span>
                  </button>
                )}

                {(isAdmin || isManager || userProfile?.role === 'tl') && (
                  <button
                    onClick={() => setShowTopStarView(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-all group cursor-pointer"
                    title="Top Star KPI Leaderboard"
                  >
                    <div className="w-5 h-5 rounded-lg bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <Star size={13} />
                    </div>
                    <span className="hidden xs:inline sm:inline">Top Star</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAnnualEvalView(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#1C6B53] dark:hover:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all group cursor-pointer"
                  title="Annual & Semi-Annual Performance Evaluation"
                >
                  <div className="w-5 h-5 rounded-lg bg-[#1C6B53]/15 dark:bg-emerald-400/15 flex items-center justify-center text-[#1C6B53] dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <ClipboardCheck size={13} />
                  </div>
                  <span className="text-xs font-bold">Evaluation</span>
                </button>
              </div>

              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700/80 mx-0.5" />

              {/* Profile Button */}
              <button 
                onClick={openProfileModal}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 transition-all group cursor-pointer"
                title="Profile Settings"
              >
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-tr from-[#1C6B53] to-emerald-400 flex items-center justify-center overflow-hidden ring-2 ring-[#1C6B53]/20 dark:ring-emerald-400/20 text-white font-black text-xs shadow-sm flex-shrink-0">
                  {userProfile?.photo_url ? (
                    <img src={userProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <Users size={12} />
                  )}
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="max-w-[70px] sm:max-w-[120px] truncate group-hover:text-[#1C6B53] dark:group-hover:text-emerald-400 transition-colors">
                    {userProfile?.name || (isAdmin ? 'Mohammed Dlshad' : (isManager ? 'Jalal Burghol' : 'Team Lead'))}
                  </span>
                  <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                    isAdmin 
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60' 
                      : isManager 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60'
                  }`}>
                    {isAdmin ? 'Admin' : isManager ? 'Manager' : 'TL'}
                  </span>
                </div>
              </button>

              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700/80 mx-0.5" />

              {/* Settings + Logout Group */}
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    onClick={openManageModal}
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[#1C6B53] dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all group cursor-pointer"
                    title="Settings"
                  >
                    <Settings size={15} className="group-hover:rotate-45 transition-transform duration-200" />
                  </button>
                )}

                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span className="hidden xs:inline sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

        {/* Team Cards */}
        {activeTeams.length === 1 ? (
          <div className="mb-6 sm:mb-8 bg-gradient-to-br from-[#1C6B53] via-[#165a46] to-[#104334] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-[#1C6B53]/15 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Users size={20} className="text-emerald-200 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                    {activeTeams[0]}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-emerald-100/80 mt-0.5 sm:mt-1 font-medium">
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
                    <div className="text-[10px] sm:text-[11px] font-bold tracking-wide text-emerald-100/90 truncate mb-1.5 sm:mb-2" title={col.label}>
                      {toTitleCase(col.label)}
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
                      {annualVal}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-emerald-300/70 font-medium mt-1">
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
              <div className="mb-5 sm:mb-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0b3327] via-[#1C6B53] to-[#124d3a] text-white shadow-xl shadow-[#1C6B53]/25 border border-emerald-400/30 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
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
                      <div className="text-[10px] font-bold truncate text-emerald-100/90" title={col.label}>
                        {toTitleCase(col.label)}
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
                    className={`text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between transition-all border cursor-pointer relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-br from-[#1C6B53] to-[#155a45] text-white border-transparent shadow-lg shadow-[#1C6B53]/20 ring-2 ring-[#1C6B53]/50 scale-[1.01]' 
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
                          <div className={`text-[9px] font-bold truncate ${isActive ? 'text-emerald-100/80' : 'text-gray-400'}`} title={col.label}>
                            {toTitleCase(col.label)}
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
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 w-full overflow-x-auto scrollbar-hide shadow-sm mb-4 sm:mb-5">
          {/* Year selector */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-bold bg-[#1C6B53] text-white shadow-sm outline-none cursor-pointer border-0"
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" />
          </div>

          {/* Search Agent Input & Count next to Year */}
          <div className="relative flex-shrink-0">
            <Search size={12} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/80 dark:bg-gray-900/60 focus:outline-none focus:border-[#1C6B53] dark:focus:border-emerald-500 text-xs w-28 sm:w-44 transition dark:text-gray-200 font-medium"
            />
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-semibold whitespace-nowrap px-1 flex-shrink-0">
            {filteredRows.length} Agents
          </span>

          {/* Selection Action Toolbar */}
          {isMultiCellSelected && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-emerald-100/90 dark:bg-emerald-950/90 border border-[#1C6B53]/30 dark:border-emerald-600/40 rounded-xl text-xs text-[#1C6B53] dark:text-emerald-300 font-bold shadow-xs flex-shrink-0 animate-fadeIn">
              <span className="tabular-nums">{selectedCellCount} selected</span>
              <div className="h-3.5 w-px bg-emerald-300 dark:bg-emerald-700" />
              <button 
                onClick={handleCopySelection}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition"
                title="Copy selected cells (Ctrl+C)"
              >
                <Copy size={12} />
                <span>Copy</span>
              </button>
              {!isAggregate && (
                <>
                  <div className="h-3.5 w-px bg-emerald-300 dark:bg-emerald-700" />
                  <button 
                    onClick={handleClearSelectedCells}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-950/60 transition"
                    title="Clear selected cells (Delete / Backspace)"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                </>
              )}
              <div className="h-3.5 w-px bg-emerald-300 dark:bg-emerald-700" />
              <button 
                onClick={() => updateSelection(null, null)}
                className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                title="Deselect (Esc)"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Separator */}
          <div className="h-5 w-[1.5px] bg-gray-300 dark:bg-gray-600 mx-0.5 sm:mx-1 flex-shrink-0" />

          {/* Months (Jan - Dec) */}
          {months.map(m => {
            const displayLabel = m.charAt(0) + m.slice(1).toLowerCase();
            const isSel = selectedMonth === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  isSel
                    ? 'bg-[#1C6B53] text-white shadow-md shadow-[#1C6B53]/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}

          {/* Separator */}
          <div className="h-5 w-[1.5px] bg-gray-300 dark:bg-gray-600 mx-0.5 sm:mx-1 flex-shrink-0" />

          {/* Quarters & Halves */}
          {periods.map(p => {
            const isSel = selectedMonth === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedMonth(p)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex-shrink-0 ${
                  isSel
                    ? 'bg-[#00A991] text-white shadow-md shadow-[#00A991]/30'
                    : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Separator */}
          <div className="h-5 w-[1.5px] bg-gray-300 dark:bg-gray-600 mx-0.5 sm:mx-1 flex-shrink-0" />

          {/* Button next to H1 / H2: Younis + Ankido Combined Data */}
          <button
            type="button"
            onClick={() => setIsCombinedCallCenter(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex-shrink-0 flex items-center gap-1.5 border cursor-pointer ${
              isCombinedCallCenter
                ? 'bg-gradient-to-r from-[#1C6B53] to-[#155a45] text-white border-transparent shadow-md shadow-[#1C6B53]/30 ring-2 ring-[#1C6B53]/50 scale-[1.02]'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:shadow-xs'
            }`}
            title="عرض داتا تيم يونس وتيم انكيدو ويه بعض (Call Center Combined Data)"
          >
            <Users size={13} className={isCombinedCallCenter ? 'text-amber-300 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'} />
            <span>Younis + Ankido</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              isCombinedCallCenter ? 'bg-white/20 text-white' : 'bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200'
            }`}>
              CC
            </span>
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mb-2 px-1 font-medium">
          <span>👈 Swipe horizontally to view all KPI columns 👉</span>
          <span>{activeCols.length} KPIs</span>
        </div>

        {/* Data Table */}
        <div 
          onPaste={handleTablePaste}
          className={`bg-[#F9F8F4] dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar overscroll-x-contain touch-pan-x ${isSelecting ? 'select-none cursor-crosshair' : ''}`}
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
            <div className="grid gap-2 px-3 sm:px-5 py-3.5 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md text-xs font-bold border-b border-gray-200/80 dark:border-gray-700/80 items-center"
                 style={{ gridTemplateColumns: `minmax(180px, 2.2fr) repeat(${activeCols.length}, minmax(105px, 1fr))` }}>
              <div className="pl-2 sticky left-0 bg-gray-50/95 dark:bg-gray-800/95 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] text-[11px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300">
                Agent
              </div>
              {activeCols.map(col => (
                <div key={col.id} className="text-center font-extrabold text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 px-1 truncate" title={toTitleCase(col.label)}>
                  {toTitleCase(col.label)}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800/70 bg-[#FDFCFB] dark:bg-gray-900">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading data...</div>
              ) : filteredRows.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No team members found. Click "Manage Agents" to add members.</div>
              ) : (
                filteredRows.map((row, index) => {
                  const actualIndex = rows.findIndex(r => r === row);
                  const disabled = isAggregate || !!row._readonly;

                  return (
                    <div key={row._memberId || index} className="grid gap-2 px-3 sm:px-5 py-2.5 sm:py-3 items-center hover:bg-emerald-50/40 dark:hover:bg-gray-800/60 transition-all duration-150 group"
                         style={{ gridTemplateColumns: `minmax(180px, 2.2fr) repeat(${activeCols.length}, minmax(105px, 1fr))` }}>
                      
                      <div className="pl-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5 sm:gap-3 sticky left-0 bg-[#FDFCFB] dark:bg-gray-900 group-hover:bg-[#f6fbf9] dark:group-hover:bg-gray-850 z-10 pr-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                        {row.photo_url ? (
                          <img src={row.photo_url} alt={row.agent_name} className="w-8 h-8 rounded-full object-cover shadow-xs border border-emerald-500/20 flex-shrink-0 ring-2 ring-emerald-500/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C6B53]/20 to-emerald-100 dark:from-[#1C6B53]/40 dark:to-emerald-950 text-[#1C6B53] dark:text-emerald-300 font-black text-xs flex items-center justify-center shadow-xs border border-emerald-500/20 flex-shrink-0 ring-1 ring-emerald-500/10">
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
                            className={`flex items-center justify-center p-0.5 sm:p-1 rounded-xl transition-all ${
                              isSelected && isMultiCellSelected
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 ring-2 ring-[#1C6B53] dark:ring-emerald-400 z-10'
                                : isSelected
                                ? 'ring-2 ring-[#1C6B53]/40 dark:ring-emerald-400/40'
                                : ''
                            }`}
                          >
                            <input 
                              id={`cell-${index}-${colIndex}`}
                              disabled={disabled}
                              type="text"
                              onDragStart={(e) => e.preventDefault()}
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
                              className={`w-full max-w-[85px] sm:max-w-[100px] text-center rounded-xl px-2.5 py-1.5 text-xs sm:text-[13px] font-bold outline-none transition-all shadow-xs tabular-nums disabled:bg-gray-100/60 dark:disabled:bg-gray-800/40 disabled:border-transparent disabled:text-gray-500 dark:disabled:text-gray-400 cursor-text ${
                                isSelected && isMultiCellSelected
                                  ? 'bg-transparent border-transparent text-[#1C6B53] dark:text-emerald-300 font-black'
                                  : isSelected
                                  ? 'bg-white dark:bg-gray-800 border-[#1C6B53] dark:border-emerald-500 text-gray-800 dark:text-gray-100'
                                  : 'bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-medium placeholder:text-[11px] focus:border-[#1C6B53] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#1C6B53]/20'
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
               <div className="grid gap-2 px-3 sm:px-5 py-3 sm:py-3.5 bg-emerald-50/50 dark:bg-emerald-950/25 border-t-2 border-emerald-500/20 dark:border-emerald-500/30 items-center font-bold"
                    style={{ gridTemplateColumns: `minmax(180px, 2.2fr) repeat(${activeCols.length}, minmax(105px, 1fr))` }}>
                 <div className="text-xs font-black text-gray-800 dark:text-gray-200 pl-2 sticky left-0 bg-[#F4F9F6] dark:bg-gray-850 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-[#1C6B53] dark:bg-emerald-400" />
                   <span>{isCombinedCallCenter ? 'Call Center Combined Total / Avg' : 'Team Average'}</span>
                 </div>
                 {activeCols.map(col => (
                   <div key={col.id} className="text-center text-xs sm:text-[13px] font-black text-[#1C6B53] dark:text-emerald-400 tabular-nums px-1">
                     {calcAvg(col, rows)}
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          Agent names are fixed from the roster. Use "Settings" to edit members or columns. Data auto-saves when you click out of a field.
        </div>
      </div>

      {/* Side-by-Side Call Center Comparison Breakdown Modal */}
      {showCcBreakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
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
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50">
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
                      <tr key={col.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50">
                        <td className="p-3">
                          <span className="font-extrabold">{toTitleCase(col.label)}</span>
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

      {/* Manage Settings Modal (System Configuration) */}
      {showManageMembers && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto overscroll-contain">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowManageMembers(false)} />
          <div className="relative bg-[#F9F8F4] dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 w-full border border-transparent dark:border-gray-700 mb-10 transition-all overscroll-contain max-w-5xl">
            
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  System Settings
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                  Add or remove agents and table columns across the system.
                </p>
              </div>
              <button onClick={() => setShowManageMembers(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                 <X size={22} />
              </button>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              
              {/* Agents Card */}
              <div className="bg-[#F1EFE8] dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 flex flex-col h-[460px] sm:h-[550px] border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-600 dark:text-gray-300" />
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                      {userProfile?.role === 'tl' ? `${userProfile?.team?.replace(' Team', '') || 'My Team'} Agents` : 'Agents'}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {displayedMembers.length} Agents
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
                  <div className="relative mb-3">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Briefcase size={14} className="text-white" />
                     </div>
                     <select
                       value={newMemberTeam}
                       onChange={(e) => setNewMemberTeam(e.target.value as TeamName)}
                       className="w-full pl-9 pr-8 py-2.5 bg-[#1C6B53] text-white text-xs sm:text-sm font-medium rounded-xl appearance-none cursor-pointer outline-none"
                     >
                       {activeTeams.map(t => <option key={t} value={t} className="bg-white text-gray-800">{t}</option>)}
                     </select>
                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                       <ChevronDown size={14} className="text-white" />
                     </div>
                  </div>
                )}

                <button
                  onClick={handleAddMember}
                  className="w-full bg-[#1C6B53] hover:bg-[#155a45] text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm mb-4 sm:mb-5 flex items-center justify-center gap-2"
                >
                  <UserPlus size={16}/> Add Agent
                </button>

                <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1">
                  {displayedMembers.length === 0 && <div className="text-xs text-gray-400 text-center mt-6">No agents found in this team.</div>}
                  {displayedMembers.map((member) => (
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
                              className="w-28 sm:w-32 px-1.5 py-1 text-[10px] border rounded outline-none focus:border-[#1C6B53] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                </div>
              </div>

              {/* Columns Card - Admin Only */}
              <div className="bg-[#F1EFE8] dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 flex flex-col h-[460px] sm:h-[550px] border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Columns size={18} className="text-gray-600 dark:text-gray-300" />
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">Table Columns & KPIs</h3>
                  </div>
                  <div className="relative">
                    <select 
                      value={manageColsTeam} 
                      onChange={(e: any) => setManageColsTeam(e.target.value)}
                      className="appearance-none pl-2.5 pr-7 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-[#1C6B53] font-semibold cursor-pointer shadow-xs"
                    >
                      <option value="ALL">🌐 All Teams</option>
                      {activeTeams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
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
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">{toTitleCase(col.label)}</span>
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

            </div>
          </div>
        </div>
      )}

      {/* TL & Manager Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Profile Settings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update Your Display Name, Profile Photo & Password</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X size={20} />
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-[#1C6B53] dark:text-emerald-400 text-xs font-semibold rounded-xl">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveTLProfile} className="space-y-4">
              {/* Photo Upload */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden border-2 border-gray-200 dark:border-gray-700 relative group flex items-center justify-center shadow-inner">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={32} className="text-gray-400" />
                  )}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition rounded-full">
                    <Camera size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
                  </label>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Click Photo To Upload New Image</span>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">Display Name / Username</label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-transparent dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 size={22} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Remove Member</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.name}</span> from the roster? All their metric data for this team will also be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
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
