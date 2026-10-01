"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db, getSystemAuthor } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { 
  Star, Trophy, Medal, ArrowLeft, Search, Users, Check, Save, Download, 
  Sun, Moon, ChevronDown, RefreshCw, Calendar, Sparkles, Shield,
  ShieldCheck, AlertCircle, TrendingUp, Clock, Activity, MessageSquare, PhoneCall,
  CheckCircle2, Flame, Award, Filter, Edit3, X, Eye, BarChart3, HelpCircle,
  Layers, ArrowUpDown
} from "lucide-react";

interface TopStarDashboardProps {
  userProfile: any;
  allMembers?: any[];
  selectedYear?: string;
  selectedMonth?: string;
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

// Canonical agent name mapping for clean matching across collections
const CANONICAL_NAMES: Record<string, string> = {
  "dhuha khanjer noori": "Dhuha Khanjer",
  "dhuha khanjer": "Dhuha Khanjer",
  "rasan ismail musa": "Rassan Ismail",
  "rasan ismail": "Rassan Ismail",
  "rassan ismail": "Rassan Ismail",
  "sawin sartib": "Sawen",
  "sawen sartib": "Sawen",
  "sawen": "Sawen",
  "soma muhammed": "Soma Sherko",
  "soma sherko": "Soma Sherko",
  "yousif rashid darwesh": "Yousif Rashid",
  "yousif rashid": "Yousif Rashid",
  "ahmed rustam": "Ahmed Rustam",
  "akar omer": "Akar Omer",
  "bana ahmed": "Bana Ahmed",
  "ismail ahmed": "Ismail Ahmed",
  "nawen maadh": "Nawen Maadh",
  "ossama saadi": "Ossama Saadi",
  "sana dler": "Sana Dler",
  "zahra yousif": "Zahra Yousif",

  // Call Team
  "shahab ahmed": "Shahab Ahmed",
  "shahab ahmed muhammed": "Shahab Ahmed",
  "zhalla sherzad": "Zhalla Sherzad",
  "zhala sherzad": "Zhalla Sherzad",
  "marwa khaleel": "Marwa Khaleel",
  "marwa khalil": "Marwa Khaleel",
  "haneen abd-al kareem": "Haneen Abd-Al Kareem",
  "haneen abdulkarim": "Haneen Abd-Al Kareem",
  "hannen iskandar": "Haneen Abd-Al Kareem",
  "azad muhammad abdullah": "Azad muhammad abdullah",
  "azad muhammad": "Azad muhammad abdullah",
  "alla satar": "Alla Satar",
  "alla sattar": "Alla Satar",
  "amar hussein salih": "Amar Hussein Salih",
  "amar hussein": "Amar Hussein Salih",
  "kazhvan wirya": "Kazhvan Wirya",
  "kani sami": "Kani Sami",
  "lana halmat rafeeq": "Lana Halmat Rafeeq",
  "lana halmat": "Lana Halmat Rafeeq",
  "laveen khaleel": "Laveen Khaleel",
  "mokhalad ali": "Mokhalad Ali",
  "muzhda omar ali": "Muzhda Omar Ali",
  "muzhda omar": "Muzhda Omar Ali",
  "rabar mohammed": "Rabar Mohammed",
  "saja bashar anwar": "Saja Bashar Anwar",
  "saja bashar": "Saja Bashar Anwar",
  "salam sadam muhammad": "Salam Sadam Muhammad",
  "salam sadam": "Salam Sadam Muhammad",
  "sarbaz namiq hasan": "Sarbaz Namiq Hasan",
  "sarbaz namiq": "Sarbaz Namiq Hasan",
  "taban sirwan": "Taban Sirwan",
  "zainab khalid rasheed": "Zainab Khalid Rasheed",
  "zainab khalid": "Zainab Khalid Rasheed",
  "zhalla salam": "Zhalla Salam",
  "frmesk younis": "Frmesk Younis",
  "haseeb adeeb": "Haseeb Adeeb",
  "hewr adnan": "Hewr Adnan",
  "aya yasin": "Aya Yasin",
  "ahmed jalil": "Ahmed Jalil"
};

const DEFAULT_CHAT_AGENTS = [
  "Ahmed Rustam", "Akar Omer", "Bana Ahmed", "Dhuha Khanjer", "Ismail Ahmed",
  "Nawen Maadh", "Ossama Saadi", "Rassan Ismail", "Sana Dler", "Sawen",
  "Soma Sherko", "Yousif Rashid", "Zahra Yousif"
];

const DEFAULT_CALL_AGENTS = [
  "Ahmed Jalil", "Alla Satar", "Amar Hussein Salih", "Aya Yasin", "Azad muhammad abdullah",
  "Frmesk Younis", "Haneen Abd-Al Kareem", "Haseeb Adeeb", "Hewr Adnan", "Kani Sami",
  "Kazhvan Wirya", "Lana Halmat Rafeeq", "Laveen Khaleel", "Marwa Khaleel", "Mokhalad Ali",
  "Muzhda Omar Ali", "Rabar Mohammed", "Saja Bashar Anwar", "Salam Sadam Muhammad",
  "Sarbaz Namiq Hasan", "Shahab Ahmed", "Taban Sirwan", "Zainab Khalid Rasheed",
  "Zhalla Sherzad", "Zhalla Salam"
];

function normalizeName(name: string): string {
  if (!name) return "";
  const key = name.trim().toLowerCase();
  return CANONICAL_NAMES[key] || name.trim();
}

interface KpiColDef {
  key: string;
  label: string;
  ptsLabel: string;
  max: number;
  placeholder: string;
  legend: string;
  target: string;
}

const CHAT_COLS: KpiColDef[] = [
  { key: "qa",   label: "QA %",   ptsLabel: "QA", max: 30, placeholder: "%",   target: "100%", legend: "QA 30 pts · % of target" },
  { key: "prod", label: "Prod",   ptsLabel: "Pr", max: 15, placeholder: "/hr", target: "13/hr", legend: "Productivity 15 pts · target 13" },
  { key: "aht",  label: "AHT s",  ptsLabel: "AH", max: 15, placeholder: "s",   target: "210s", legend: "AHT 15 pts · target 210s" },
  { key: "art",  label: "ART s",  ptsLabel: "AR", max: 20, placeholder: "s",   target: "89s",  legend: "ART 20 pts · target 89s" },
  { key: "exam", label: "Exam %", ptsLabel: "Ex", max: 20, placeholder: "%",   target: "100%", legend: "Exam 20 pts" }
];

const CALL_COLS: KpiColDef[] = [
  { key: "qa",     label: "QA %",   ptsLabel: "QA", max: 30, placeholder: "%", target: "100%", legend: "QA 30 pts" },
  { key: "prod",   label: "Prod %", ptsLabel: "Pr", max: 20, placeholder: "%", target: "100%", legend: "Productivity 20 pts" },
  { key: "aht",    label: "AHT s",  ptsLabel: "AH", max: 20, placeholder: "s", target: "169s", legend: "AHT 20 pts · target 169s" },
  { key: "exam",   label: "Exam %", ptsLabel: "Ex", max: 20, placeholder: "%", target: "100%", legend: "Exam 20 pts" },
  { key: "wrapup", label: "Wrapup", ptsLabel: "Wr", max: 5,  placeholder: "#", target: "Min",  legend: "Wrapup 5 pts · relative, lower is better" },
  { key: "hold",   label: "Hold s", ptsLabel: "Ho", max: 5,  placeholder: "s", target: "45s",  legend: "Hold 5 pts · target 45s" }
];

const MONTHS_LIST = [
  { id: "JAN", name: "January" },
  { id: "FEB", name: "February" },
  { id: "MAR", name: "March" },
  { id: "APR", name: "April" },
  { id: "MAY", name: "May" },
  { id: "JUN", name: "June" },
  { id: "JUL", name: "July" },
  { id: "AUG", name: "August" },
  { id: "SEP", name: "September" },
  { id: "OCT", name: "October" },
  { id: "NOV", name: "November" },
  { id: "DEC", name: "December" },
];

const PERIODS_LIST = [
  { id: "Q1", name: "Q1 (Jan–Mar)" },
  { id: "Q2", name: "Q2 (Apr–Jun)" },
  { id: "Q3", name: "Q3 (Jul–Sep)" },
  { id: "Q4", name: "Q4 (Oct–Dec)" },
  { id: "H1", name: "H1 (Jan–Jun)" },
  { id: "H2", name: "H2 (Jul–Dec)" },
  { id: "YEAR - AVG", name: "Full Year (Avg)" },
];

const AGGREGATE_MONTH_MAP: Record<string, string[]> = {
  "Q1": ["JAN", "FEB", "MAR"],
  "Q2": ["APR", "MAY", "JUN"],
  "Q3": ["JUL", "AUG", "SEP"],
  "Q4": ["OCT", "NOV", "DEC"],
  "H1": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
  "H2": ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  "YEAR - AVG": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
};

// Numeric parser
const num = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const str = String(v).replace(/%/g, "").replace(/s$/i, "").replace(/,/g, "").trim();
  const n = parseFloat(str);
  return isFinite(n) && n > 0 ? n : null;
};

// Seconds parser
const parseSec = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const str = String(v).trim();
  if (str.includes(":")) {
    const parts = str.split(":");
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    const total = mins * 60 + secs;
    return total > 0 ? total : null;
  }
  return num(str);
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export default function TopStarDashboard({
  userProfile,
  allMembers = [],
  selectedYear: initialYear = "2026",
  selectedMonth: initialMonth = "SEP",
  onBack,
  onLogout,
  isDarkMode = false,
  toggleDarkMode
}: TopStarDashboardProps) {
  const isAdmin = userProfile?.email?.toLowerCase() === "mohammed.dlshad0@gmail.com" || userProfile?.role === "admin";
  const isManager = isAdmin || userProfile?.email?.toLowerCase() === "jalal.burghol@agent.com" || userProfile?.role === "manager";
  const isTeamLeader = userProfile?.role === "tl";
  const canEdit = isAdmin || isManager; // Team Leader is strictly read-only

  const [team, setTeam] = useState<"chat" | "call">("chat");
  const [selectedYear, setSelectedYear] = useState<string>(initialYear || "2026");
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || "SEP");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"rank" | "name">("rank");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [metricsData, setMetricsData] = useState<{
    chat: Record<string, Record<string, any>>;
    call: Record<string, Record<string, any>>;
  }>({ chat: {}, call: {} });

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedCells, setEditedCells] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active rosters
  const chatRoster = useMemo(() => {
    const fromProps = allMembers
      .filter(m => m.team === "Mohammed Dlshad Team")
      .map(m => normalizeName(m.agent_name || m.name));
    const combined = Array.from(new Set([...fromProps, ...DEFAULT_CHAT_AGENTS]));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [allMembers]);

  const callRoster = useMemo(() => {
    const fromProps = allMembers
      .filter(m => m.team === "Younis Kamal Team" || m.team === "Ankido Buya Team")
      .map(m => normalizeName(m.agent_name || m.name));
    const combined = Array.from(new Set([...fromProps, ...DEFAULT_CALL_AGENTS]));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [allMembers]);

  // Fetch metrics data from Firestore
  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const isAgg = Object.keys(AGGREGATE_MONTH_MAP).includes(selectedMonth);
      const monthsToFetch = isAgg ? AGGREGATE_MONTH_MAP[selectedMonth] : [selectedMonth];

      const [mohammedSnap, younisSnap, ankidoSnap] = await Promise.all([
        getDocs(query(collection(db, "mohammed_metrics"), where("year", "==", selectedYear))),
        getDocs(query(collection(db, "younis_metrics"), where("year", "==", selectedYear))),
        getDocs(query(collection(db, "ankido_metrics"), where("year", "==", selectedYear)))
      ]);

      const chatMap: Record<string, any[]> = {};
      mohammedSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        if (monthsToFetch.includes(d.month)) {
          const cName = normalizeName(d.agent_name || "");
          if (cName) {
            if (!chatMap[cName]) chatMap[cName] = [];
            chatMap[cName].push(d);
          }
        }
      });

      const callMap: Record<string, any[]> = {};
      [...younisSnap.docs, ...ankidoSnap.docs].forEach(docSnap => {
        const d = docSnap.data();
        if (monthsToFetch.includes(d.month)) {
          const cName = normalizeName(d.agent_name || "");
          if (cName) {
            if (!callMap[cName]) callMap[cName] = [];
            callMap[cName].push(d);
          }
        }
      });

      const averageRow = (records: any[], isChat: boolean) => {
        if (!records || records.length === 0) return {};
        if (records.length === 1) return records[0];

        const keys = isChat 
          ? ["quality", "productivity", "aht", "art", "exam"]
          : ["quality", "productivity", "aht", "exam", "wrapup", "hold"];

        const result: Record<string, any> = {};
        keys.forEach(k => {
          let sum = 0;
          let count = 0;
          records.forEach(r => {
            const val = k === "aht" || k === "art" || k === "hold" || k === "wrapup" 
              ? parseSec(r[k]) 
              : num(r[k]);
            if (val !== null && val > 0) {
              sum += val;
              count++;
            }
          });
          if (count > 0) {
            result[k] = (sum / count).toFixed(1);
          }
        });
        return result;
      };

      const finalChat: Record<string, Record<string, any>> = {};
      chatRoster.forEach(name => {
        const recs = chatMap[name] || [];
        const raw = averageRow(recs, true);
        finalChat[name] = {
          qa: raw.quality ?? null,
          prod: raw.productivity ?? null,
          aht: raw.aht ? parseSec(raw.aht) : null,
          art: raw.art ? parseSec(raw.art) : null,
          exam: raw.exam ?? null
        };
      });

      const finalCall: Record<string, Record<string, any>> = {};
      callRoster.forEach(name => {
        const recs = callMap[name] || [];
        const raw = averageRow(recs, false);
        finalCall[name] = {
          qa: raw.quality ?? null,
          prod: raw.productivity ?? null,
          aht: raw.aht ? parseSec(raw.aht) : null,
          exam: raw.exam ?? null,
          wrapup: raw.wrapup ? parseSec(raw.wrapup) : null,
          hold: raw.hold ? parseSec(raw.hold) : null
        };
      });

      setMetricsData({ chat: finalChat, call: finalCall });
      setEditedCells({});
    } catch (err) {
      console.error("Error fetching Top Star metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedYear, selectedMonth]);

  // Scoring algorithm strictly adhering to Top Star KPI definitions
  const scoreAgent = (t: "chat" | "call", vals: Record<string, any>, wrapupRange?: { min: number; max: number }) => {
    const v = vals || {};
    const qa = num(v.qa);
    const prod = num(v.prod);
    const aht = parseSec(v.aht);
    const exam = num(v.exam);

    if (t === "chat") {
      const art = parseSec(v.art);
      const parts = [
        { key: "qa",   pts: qa == null ? null : clamp01(Math.min(qa, 100) / 100) * 30, max: 30 },
        { key: "prod", pts: prod == null ? null : Math.min(prod / 13, 1) * 15, max: 15 },
        { key: "aht",  pts: aht == null || aht <= 0 ? null : Math.min(210 / aht, 1) * 15, max: 15 },
        { key: "art",  pts: art == null || art <= 0 ? null : Math.min(89 / art, 1) * 20, max: 20 },
        { key: "exam", pts: exam == null ? null : (Math.min(exam, 100) / 100) * 20, max: 20 }
      ];
      const any = parts.some(p => p.pts != null);
      const total = any ? parts.reduce((acc, p) => acc + (p.pts || 0), 0) : null;
      return { parts, total };
    }

    const wrapup = num(v.wrapup);
    const hold = parseSec(v.hold);

    let wrapupPts: number | null = null;
    if (wrapup != null && wrapupRange) {
      wrapupPts = wrapupRange.max === wrapupRange.min 
        ? 5 
        : Math.max(0, Math.min(5, ((wrapupRange.max - wrapup) / (wrapupRange.max - wrapupRange.min)) * 5));
    }

    const parts = [
      { key: "qa",     pts: qa == null ? null : (Math.min(qa, 100) / 100) * 30, max: 30 },
      { key: "prod",   pts: prod == null ? null : (Math.min(prod, 100) / 100) * 20, max: 20 },
      { key: "aht",    pts: aht == null || aht <= 0 ? null : Math.min(169 / aht, 1) * 20, max: 20 },
      { key: "exam",   pts: exam == null ? null : (Math.min(exam, 100) / 100) * 20, max: 20 },
      { key: "wrapup", pts: wrapupPts, max: 5 },
      { key: "hold",   pts: hold == null || hold <= 0 ? null : Math.min(45 / hold, 1) * 5, max: 5 }
    ];

    const any = parts.some(p => p.pts != null);
    const total = any ? parts.reduce((acc, p) => acc + (p.pts || 0), 0) : null;
    return { parts, total };
  };

  const computeRanks = (t: "chat" | "call") => {
    const roster = t === "chat" ? chatRoster : callRoster;
    const teamData = metricsData[t] || {};

    let wrapupRange: { min: number; max: number } | undefined = undefined;
    if (t === "call") {
      const wrapupVals = roster
        .map(name => {
          const cellVal = editedCells[name]?.wrapup !== undefined 
            ? editedCells[name].wrapup 
            : teamData[name]?.wrapup;
          return num(cellVal);
        })
        .filter((x): x is number => x != null);

      if (wrapupVals.length > 0) {
        wrapupRange = { min: Math.min(...wrapupVals), max: Math.max(...wrapupVals) };
      }
    }

    const scoredList = roster.map(name => {
      const liveVals = teamData[name] || {};
      const overrideVals = editedCells[name] || {};
      const mergedVals = { ...liveVals, ...overrideVals };
      const { parts, total } = scoreAgent(t, mergedVals, wrapupRange);
      return {
        name,
        vals: mergedVals,
        parts,
        total
      };
    });

    scoredList.sort((a, b) => {
      if (a.total == null && b.total == null) return a.name.localeCompare(b.name);
      if (a.total == null) return 1;
      if (b.total == null) return -1;
      return (b.total || 0) - (a.total || 0);
    });

    return scoredList;
  };

  const rankedChat = useMemo(() => computeRanks("chat"), [metricsData.chat, chatRoster, editedCells]);
  const rankedCall = useMemo(() => computeRanks("call"), [metricsData.call, callRoster, editedCells]);

  const activeRanked = team === "chat" ? rankedChat : rankedCall;
  const activeCols = team === "chat" ? CHAT_COLS : CALL_COLS;

  const rankMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    activeRanked.forEach((r, idx) => {
      map[r.name] = r.total != null ? idx + 1 : null;
    });
    return map;
  }, [activeRanked]);

  const displayRows = useMemo(() => {
    let list = [...activeRanked];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }

    if (sortBy === "name") {
      list.sort((a, b) => sortAsc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => {
        if (a.total == null && b.total == null) return a.name.localeCompare(b.name);
        if (a.total == null) return 1;
        if (b.total == null) return -1;
        return sortAsc ? (a.total || 0) - (b.total || 0) : (b.total || 0) - (a.total || 0);
      });
    }

    return list;
  }, [activeRanked, searchQuery, sortBy, sortAsc]);

  const scoredCount = useMemo(() => activeRanked.filter(r => r.total != null).length, [activeRanked]);
  const avgScore = useMemo(() => {
    const scored = activeRanked.filter(r => r.total != null);
    if (!scored.length) return null;
    const sum = scored.reduce((acc, r) => acc + (r.total || 0), 0);
    return (sum / scored.length).toFixed(1);
  }, [activeRanked]);

  const top3Chat = useMemo(() => {
    return rankedChat.filter(r => r.total != null).slice(0, 3).map((r, i) => ({
      rank: i + 1,
      name: r.name,
      score: (r.total || 0).toFixed(1)
    }));
  }, [rankedChat]);

  const top3Call = useMemo(() => {
    return rankedCall.filter(r => r.total != null).slice(0, 3).map((r, i) => ({
      rank: i + 1,
      name: r.name,
      score: (r.total || 0).toFixed(1)
    }));
  }, [rankedCall]);

  const getBand = (score: number | null) => {
    if (score == null) return { color: "#9ca3af", label: "Pending", bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
    if (score >= 85) return { color: "#10b981", label: "85+ Elite", bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" };
    if (score >= 70) return { color: "#f59e0b", label: "70–84 Good", bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" };
    return { color: "#ef4444", label: "<70 Needs Imp.", bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800" };
  };

  const handleCellChange = (agentName: string, colKey: string, value: string) => {
    if (!canEdit) return;
    setEditedCells(prev => ({
      ...prev,
      [agentName]: {
        ...(prev[agentName] || {}),
        [colKey]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    if (!canEdit) return;
    const changedAgents = Object.keys(editedCells);
    if (changedAgents.length === 0) {
      setEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      const collectionName = team === "chat" ? "mohammed_metrics" : "ankido_metrics";
      
      for (const agentName of changedAgents) {
        const edits = editedCells[agentName];
        if (!edits || Object.keys(edits).length === 0) continue;

        const updatePayload: Record<string, any> = {
          _arch: getSystemAuthor(),
          updated_at: new Date().toISOString()
        };

        if (edits.qa !== undefined) updatePayload.quality = edits.qa;
        if (edits.prod !== undefined) updatePayload.productivity = edits.prod;
        if (edits.aht !== undefined) updatePayload.aht = edits.aht;
        if (edits.exam !== undefined) updatePayload.exam = edits.exam;
        if (edits.art !== undefined) updatePayload.art = edits.art;
        if (edits.wrapup !== undefined) updatePayload.wrapup = edits.wrapup;
        if (edits.hold !== undefined) updatePayload.hold = edits.hold;

        const q = query(
          collection(db, collectionName),
          where("year", "==", selectedYear),
          where("month", "==", selectedMonth),
          where("agent_name", "==", agentName)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docId = snap.docs[0].id;
          await updateDoc(doc(db, collectionName, docId), updatePayload);
        } else {
          await setDoc(doc(collection(db, collectionName)), {
            agent_name: agentName,
            year: selectedYear,
            month: selectedMonth,
            team: team === "chat" ? "Mohammed Dlshad Team" : "Ankido Buya Team",
            ...updatePayload
          });
        }
      }

      setSaveToast("Metrics successfully saved and synced with Team Leader dashboard!");
      setTimeout(() => setSaveToast(null), 4000);
      setEditMode(false);
      await fetchDashboardMetrics();
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Error saving changes: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#FDFCFB] text-gray-900"
    } font-sans p-3.5 sm:p-6 md:p-8`}>
      
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} />
          <span>{saveToast}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Header Matching FIB & Quality Dashboard Pattern */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 sm:mb-8 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/70 dark:border-gray-800">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-12 w-auto object-contain" />
            <div className="h-8 sm:h-10 w-[1.5px] bg-gray-200 dark:bg-gray-700" />
            
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none flex items-center gap-2">
                  <span>Top Star KPI Leaderboard</span>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-xs">
                    <Star size={14} className="fill-white text-white" />
                  </div>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Comprehensive Agent Performance Evaluation & Ranking System
              </p>
            </div>
          </div>

          {/* Right Action Controls Container */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xs self-stretch sm:self-auto justify-between sm:justify-end">
            
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1C6B53] dark:text-emerald-400 bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 transition cursor-pointer"
              title="Return to Main Dashboard"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />

            {/* Read-Only Badge or Edit Mode Toggle */}
            {isTeamLeader && !isAdmin && !isManager ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 text-xs font-bold">
                <Eye size={13} className="text-sky-500" />
                <span>Read-Only</span>
              </div>
            ) : (
              canEdit && (
                <button
                  onClick={() => {
                    if (editMode && Object.keys(editedCells).length > 0) {
                      handleSaveChanges();
                    } else {
                      setEditMode(!editMode);
                    }
                  }}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    editMode
                      ? "bg-[#1C6B53] hover:bg-[#155340] text-white shadow-emerald-700/20"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750"
                  }`}
                >
                  {isSaving ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : editMode ? (
                    <Save size={13} />
                  ) : (
                    <Edit3 size={13} />
                  )}
                  <span>{editMode ? (Object.keys(editedCells).length > 0 ? "Save Changes" : "Exit Edit") : "Edit Metrics"}</span>
                </button>
              )
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardMetrics}
              disabled={loading}
              className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""} />
            </button>

            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
              </button>
            )}
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-7">
          
          {/* Top 3 Chat Agents Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 border border-slate-800 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider text-amber-300 uppercase">Top 3 Chat Agents</h3>
                  <p className="text-[10px] text-gray-400">Mohammed Dlshad Team</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                {selectedMonth} {selectedYear}
              </span>
            </div>

            <div className="space-y-2">
              {top3Chat.length === 0 ? (
                <div className="py-5 text-center text-xs text-gray-400 font-medium">No calculated scores for this period yet</div>
              ) : (
                top3Chat.map((agent) => (
                  <div 
                    key={agent.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/5 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        agent.rank === 1 ? "bg-amber-400 text-gray-950" :
                        agent.rank === 2 ? "bg-slate-300 text-gray-900" :
                        "bg-amber-700 text-white"
                      }`}>
                        {agent.rank === 1 ? "1" : agent.rank === 2 ? "2" : "3"}
                      </div>
                      <span className="font-bold text-xs truncate text-gray-100">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono font-black text-sm text-amber-300">{agent.score}</span>
                      <span className="text-[10px] text-gray-400">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top 3 Call Center Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C6B53] via-[#155542] to-[#0e3d2f] border border-[#1C6B53]/80 text-white shadow-md shadow-[#1C6B53]/15 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 text-emerald-200 flex items-center justify-center font-bold text-sm">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider text-emerald-200 uppercase">Top 3 Call Center</h3>
                  <p className="text-[10px] text-emerald-200/80">Call Inbound & Outbound</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/15 text-emerald-100 border border-white/20">
                {selectedMonth} {selectedYear}
              </span>
            </div>

            <div className="space-y-2">
              {top3Call.length === 0 ? (
                <div className="py-5 text-center text-xs text-emerald-200/70 font-medium">No calculated scores for this period yet</div>
              ) : (
                top3Call.map((agent) => (
                  <div 
                    key={agent.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.18] border border-white/10 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        agent.rank === 1 ? "bg-amber-400 text-gray-950" :
                        agent.rank === 2 ? "bg-slate-200 text-gray-900" :
                        "bg-amber-600 text-white"
                      }`}>
                        {agent.rank === 1 ? "1" : agent.rank === 2 ? "2" : "3"}
                      </div>
                      <span className="font-bold text-xs truncate text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono font-black text-sm text-emerald-100">{agent.score}</span>
                      <span className="text-[10px] text-emerald-200/80">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Filter, Period & Team Controls Bar */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition shadow-xs ${
          isDarkMode ? "bg-gray-850/90 border-gray-800" : "bg-white border-gray-200/90"
        }`}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Team Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
              <button
                onClick={() => setTeam("chat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  team === "chat"
                    ? "bg-[#1C6B53] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare size={14} />
                <span>Chat Team ({chatRoster.length})</span>
              </button>

              <button
                onClick={() => setTeam("call")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  team === "call"
                    ? "bg-[#1C6B53] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <PhoneCall size={14} />
                <span>Call Center ({callRoster.length})</span>
              </button>
            </div>

            {/* Period, Search & Sorting Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              
              {/* Year Select */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold text-[11px]">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                    isDarkMode 
                      ? "bg-gray-800 border-gray-700 text-white" 
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                >
                  {["2026", "2025", "2027"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Period Select */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold text-[11px]">Period:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                    isDarkMode 
                      ? "bg-gray-800 border-gray-700 text-white" 
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                >
                  <optgroup label="Months">
                    {MONTHS_LIST.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Quarters & Averages">
                    {PERIODS_LIST.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Agent Search Input */}
              <div className="relative flex-1 sm:w-44 min-w-[130px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border outline-none ${
                    isDarkMode 
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500" 
                      : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-600"
                  }`}
                />
              </div>

              {/* Sort by Rank Button */}
              <button
                onClick={() => {
                  if (sortBy === "rank") {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortBy("rank");
                    setSortAsc(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  sortBy === "rank"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : isDarkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-300 text-gray-700"
                }`}
                title="Sort by Score Rank"
              >
                <Trophy size={13} />
                <span>Rank</span>
              </button>

              {/* Sort A-Z Button */}
              <button
                onClick={() => {
                  if (sortBy === "name") {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortBy("name");
                    setSortAsc(false);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  sortBy === "name"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : isDarkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-300 text-gray-700"
                }`}
                title="Sort Alphabetically"
              >
                <span>A–Z</span>
              </button>
            </div>
          </div>

          {/* Sub-bar Statistics */}
          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{scoredCount} of {activeRanked.length} Scored</span>
              </span>
              <span>·</span>
              <span>Team Avg: <strong className="text-gray-800 dark:text-white">{avgScore ?? "–"} pts</strong></span>
            </div>

            {/* Score Band Legend Chips */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                <span>85+ Elite</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
                <span>70–84 Good</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs"></span>
                <span>&lt;70 Needs Imp.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Clean Modern Leaderboard Table */}
        <div className={`rounded-2xl border overflow-hidden transition shadow-xs ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200/90"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              
              {/* Table Head */}
              <thead>
                <tr className={isDarkMode ? "bg-gray-950/80 border-b border-gray-800 text-gray-400" : "bg-gray-50/90 border-b border-gray-200 text-gray-600"}>
                  <th className="py-3.5 px-3 sm:px-4 text-center font-mono font-bold uppercase text-[10px] tracking-wider w-12">#</th>
                  <th className="py-3.5 px-3 sm:px-4 font-bold uppercase text-[10px] tracking-wider min-w-[170px]">Agent Name</th>
                  
                  {/* Raw Input Metric Headers */}
                  {activeCols.map(col => (
                    <th key={col.key} className="py-3.5 px-3 text-right font-mono font-bold uppercase text-[10px] tracking-wider border-l border-gray-100 dark:border-gray-800/80 min-w-[68px]">
                      <div>{col.label}</div>
                      <div className="text-[9px] text-gray-400 font-normal lowercase">{col.target}</div>
                    </th>
                  ))}

                  {/* Calculated Points Headers */}
                  {activeCols.map(col => (
                    <th key={`pts_${col.key}`} className="py-3.5 px-3 text-right font-mono font-bold uppercase text-[10px] tracking-wider text-amber-600 dark:text-amber-400/90 min-w-[55px] bg-amber-500/[0.02]">
                      {col.ptsLabel} ({col.max})
                    </th>
                  ))}

                  {/* Final Total Score Header */}
                  <th className="py-3.5 px-4 text-right font-mono font-black uppercase text-[11px] tracking-wider text-gray-900 dark:text-white border-l border-gray-100 dark:border-gray-800 min-w-[160px]">
                    Final Score (100)
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={2 + activeCols.length * 2 + 1} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={22} className="animate-spin text-emerald-500" />
                        <span className="text-xs text-gray-500 font-bold">Loading Top Star Leaderboard...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={2 + activeCols.length * 2 + 1} className="py-12 text-center text-gray-500 font-medium">
                      No matching agents found
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => {
                    const rankNum = rankMap[row.name];
                    const band = getBand(row.total);
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;

                    return (
                      <tr 
                        key={row.name}
                        className={`transition hover:bg-gray-50/80 dark:hover:bg-gray-800/40 ${
                          isTop1 ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.04]" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-3 sm:px-4 text-center font-mono">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-gray-950 font-black text-xs shadow-xs">1</span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-white font-black text-xs">2</span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs">3</span>
                          ) : rankNum ? (
                            <span className="text-gray-500 dark:text-gray-400 font-bold text-xs">{String(rankNum).padStart(2, "0")}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">–</span>
                          )}
                        </td>

                        {/* Agent Name */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isTop1 ? "bg-amber-400 text-gray-950" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                            }`}>
                              {row.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-800 dark:text-gray-100 truncate">
                              {row.name}
                            </span>
                          </div>
                        </td>

                        {/* Raw Metric Inputs / Badges */}
                        {activeCols.map(col => {
                          const currentVal = row.vals[col.key];
                          const displayVal = currentVal !== null && currentVal !== undefined ? currentVal : "";

                          return (
                            <td key={col.key} className="py-2.5 px-3 text-right border-l border-gray-100 dark:border-gray-800/80 font-mono">
                              {editMode && canEdit ? (
                                <input
                                  type="text"
                                  value={displayVal}
                                  placeholder={col.placeholder}
                                  onChange={(e) => handleCellChange(row.name, col.key, e.target.value)}
                                  className={`w-16 px-2 py-1 text-right text-xs rounded-lg border outline-none font-mono font-bold ${
                                    isDarkMode 
                                      ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500" 
                                      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-600"
                                  }`}
                                />
                              ) : (
                                <span className={`text-xs font-semibold ${
                                  displayVal ? "text-gray-800 dark:text-gray-200" : "text-gray-300 dark:text-gray-600"
                                }`}>
                                  {displayVal ? (
                                    col.key === "qa" || col.key === "exam" || (team === "call" && col.key === "prod") 
                                      ? `${displayVal}%` 
                                      : col.key === "aht" || col.key === "art" || col.key === "hold"
                                      ? `${displayVal}s`
                                      : displayVal
                                  ) : "–"}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Calculated Points */}
                        {row.parts.map(p => {
                          const isHigh = p.pts !== null && p.pts >= p.max * 0.95;
                          return (
                            <td key={`pts_${p.key}`} className="py-2.5 px-3 text-right font-mono bg-amber-500/[0.015]">
                              <span className={`text-xs font-bold ${
                                p.pts === null ? "text-gray-300 dark:text-gray-600" :
                                isHigh ? "text-emerald-600 dark:text-emerald-400 font-black" :
                                "text-gray-600 dark:text-gray-400"
                              }`}>
                                {p.pts !== null ? p.pts.toFixed(1) : "–"}
                              </span>
                            </td>
                          );
                        })}

                        {/* Final Score Bar & Value */}
                        <td className="py-2.5 px-4 text-right border-l border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-end gap-2.5">
                            <div className="flex-1 max-w-[80px] h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: row.total ? `${Math.min(100, Math.max(0, row.total))}%` : "0%",
                                  backgroundColor: band.color
                                }}
                              />
                            </div>
                            <span 
                              className="font-mono font-black text-sm min-w-[42px] text-right"
                              style={{ color: band.color }}
                            >
                              {row.total !== null ? row.total.toFixed(1) : "–"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scoring Breakdown & Weight Cards (100% English) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chat Scoring Breakdown Card */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? "bg-gray-850/80 border-gray-800 text-gray-300" : "bg-white border-gray-200/90 text-gray-700"
          }`}>
            <div className="flex items-center gap-2 mb-3.5 font-bold text-xs uppercase tracking-wider text-[#1C6B53] dark:text-emerald-400">
              <MessageSquare size={16} />
              <span>Chat KPI Breakdown & Targets (100 Pts Total)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">1. Quality Assurance (QA %)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">30 pts (Target: 100%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">2. Productivity (Chats / Hour)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">15 pts (Target: 13/hr)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">3. Average Handle Time (AHT)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">15 pts (Target: 210s)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">4. Average Response Time (ART)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">20 pts (Target: 89s)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-medium">5. Knowledge Exam (Exam %)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">20 pts (Target: 100%)</span>
              </div>
            </div>
          </div>

          {/* Call Scoring Breakdown Card */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? "bg-gray-850/80 border-gray-800 text-gray-300" : "bg-white border-gray-200/90 text-gray-700"
          }`}>
            <div className="flex items-center gap-2 mb-3.5 font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <PhoneCall size={16} />
              <span>Call Center KPI Breakdown & Targets (100 Pts Total)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">1. Quality Assurance (QA %)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">30 pts (Target: 100%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">2. Productivity (Prod %)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">20 pts (Target: 100%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">3. Average Handle Time (AHT)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">20 pts (Target: 169s)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">4. Knowledge Exam (Exam %)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">20 pts (Target: 100%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/80">
                <span className="font-medium">5. Wrapup Time (Relative Best)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">5 pts (Relative Best)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-medium">6. Hold Time (Hold)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">5 pts (Target: 45s)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
