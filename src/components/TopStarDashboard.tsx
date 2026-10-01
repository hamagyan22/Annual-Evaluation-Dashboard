"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db, getSystemAuthor } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { 
  Star, Trophy, Medal, ArrowLeft, Search, Users, Check, Save, Download, 
  Sun, Moon, ChevronDown, RefreshCw, Calendar, Sparkles, Shield,
  ShieldCheck, AlertCircle, TrendingUp, Clock, Activity, MessageSquare, PhoneCall,
  CheckCircle2, Flame, Award, Filter, Edit3, X, Eye, BarChart3, HelpCircle,
  Info
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
  { key: "aht",  label: "AHT",    ptsLabel: "AH", max: 15, placeholder: "s",   target: "210s", legend: "AHT 15 pts · target 210s" },
  { key: "art",  label: "ART",    ptsLabel: "AR", max: 20, placeholder: "s",   target: "89s",  legend: "ART 20 pts · target 89s" },
  { key: "exam", label: "Exam %", ptsLabel: "Ex", max: 20, placeholder: "%",   target: "100%", legend: "Exam 20 pts" }
];

const CALL_COLS: KpiColDef[] = [
  { key: "qa",     label: "QA %",   ptsLabel: "QA", max: 30, placeholder: "%", target: "100%", legend: "QA 30 pts" },
  { key: "prod",   label: "Prod %", ptsLabel: "Pr", max: 20, placeholder: "%", target: "100%", legend: "Productivity 20 pts" },
  { key: "aht",    label: "AHT",    ptsLabel: "AH", max: 20, placeholder: "s", target: "169s", legend: "AHT 20 pts · target 169s" },
  { key: "exam",   label: "Exam %", ptsLabel: "Ex", max: 20, placeholder: "%", target: "100%", legend: "Exam 20 pts" },
  { key: "wrapup", label: "Wrapup", ptsLabel: "Wr", max: 5,  placeholder: "#", target: "Min",  legend: "Wrapup 5 pts · relative, lower is better" },
  { key: "hold",   label: "Hold",   ptsLabel: "Ho", max: 5,  placeholder: "s", target: "45s",  legend: "Hold 5 pts · target 45s" }
];

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const num = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const str = String(v).replace(/%/g, "").replace(/s$/i, "").replace(/,/g, "").trim();
  const n = parseFloat(str);
  return isFinite(n) && n > 0 ? n : null;
};

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
  const canEdit = isAdmin || isManager;

  const [team, setTeam] = useState<"chat" | "call">("chat");
  const [selectedYear, setSelectedYear] = useState<string>(initialYear || "2026");
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || "SEP");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [metricsData, setMetricsData] = useState<{
    chat: Record<string, Record<string, any>>;
    call: Record<string, Record<string, any>>;
  }>({ chat: {}, call: {} });

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedCells, setEditedCells] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Targets & Info Modal State
  const [showTargetsModal, setShowTargetsModal] = useState<boolean>(false);

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
      const [mohammedSnap, younisSnap, ankidoSnap] = await Promise.all([
        getDocs(query(collection(db, "mohammed_metrics"), where("year", "==", selectedYear), where("month", "==", selectedMonth))),
        getDocs(query(collection(db, "younis_metrics"), where("year", "==", selectedYear), where("month", "==", selectedMonth))),
        getDocs(query(collection(db, "ankido_metrics"), where("year", "==", selectedYear), where("month", "==", selectedMonth)))
      ]);

      const chatMap: Record<string, any> = {};
      mohammedSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        const cName = normalizeName(d.agent_name || "");
        if (cName) chatMap[cName] = d;
      });

      const callMap: Record<string, any> = {};
      [...younisSnap.docs, ...ankidoSnap.docs].forEach(docSnap => {
        const d = docSnap.data();
        const cName = normalizeName(d.agent_name || "");
        if (cName) callMap[cName] = d;
      });

      const finalChat: Record<string, Record<string, any>> = {};
      chatRoster.forEach(name => {
        const raw = chatMap[name] || {};
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
        const raw = callMap[name] || {};
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

  // Scoring function conforming strictly to Top Star criteria
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

    // Strictly sort by total score descending so Rank 1 is always the highest score!
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

  // Rank Map: computed strictly from descending score order
  const rankMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    activeRanked.forEach((r, idx) => {
      map[r.name] = r.total != null ? idx + 1 : null;
    });
    return map;
  }, [activeRanked]);

  // Display rows: ALWAYS sorted by Rank (descending score), filtered by search if present
  const displayRows = useMemo(() => {
    let list = [...activeRanked];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }

    // Default & strictly: Highest score first (Rank 1 -> 13)
    list.sort((a, b) => {
      if (a.total == null && b.total == null) return a.name.localeCompare(b.name);
      if (a.total == null) return 1;
      if (b.total == null) return -1;
      return (b.total || 0) - (a.total || 0);
    });

    return list;
  }, [activeRanked, searchQuery]);

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
    } font-sans p-3 sm:p-5 md:p-8`}>
      
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1C6B53] text-white font-bold text-xs shadow-xl shadow-emerald-700/30 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* KPI Targets & Info Modal */}
      {showTargetsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">KPI Targets & Scoring Breakdown</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">100 Points Total Evaluation Criteria</p>
                </div>
              </div>
              <button
                onClick={() => setShowTargetsModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {/* Chat Breakdown */}
              <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-[#1C6B53] dark:text-emerald-400">
                  <MessageSquare size={15} />
                  <span>Chat Team (100 Pts)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-gray-600 dark:text-gray-300">1. Quality (QA %)</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">30 pts (100%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-gray-600 dark:text-gray-300">2. Productivity</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">15 pts (13/hr)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-gray-600 dark:text-gray-300">3. Average Handle Time (AHT)</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">15 pts (210s)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-gray-600 dark:text-gray-300">4. Response Time (ART)</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">20 pts (89s)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-300">5. Knowledge Exam</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">20 pts (100%)</span>
                  </div>
                </div>
              </div>

              {/* Call Breakdown */}
              <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <PhoneCall size={15} />
                  <span>Call Center (100 Pts)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-600 dark:text-gray-300">1. Quality (QA %)</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">30 pts (100%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-600 dark:text-gray-300">2. Productivity %</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">20 pts (100%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-600 dark:text-gray-300">3. Average Handle Time (AHT)</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">20 pts (169s)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-600 dark:text-gray-300">4. Knowledge Exam</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">20 pts (100%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-600 dark:text-gray-300">5. Wrapup Time</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">5 pts (Relative)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-300">6. Hold Time</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">5 pts (45s)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-600">🟢 85+ Elite</span>
                <span className="font-bold text-amber-600">🟡 70–84 Good</span>
                <span className="font-bold text-rose-600">🔴 &lt;70 Needs Imp.</span>
              </div>
              <button
                onClick={() => setShowTargetsModal(false)}
                className="px-4 py-2 bg-[#1C6B53] hover:bg-[#155340] text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-5 gap-3 pb-4 border-b border-gray-200/70 dark:border-gray-800">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-11 w-auto object-contain" />
            <div className="h-8 sm:h-9 w-[1.5px] bg-gray-200 dark:bg-gray-700" />
            
            <div>
              {/* Title exactly as requested: Top Star Dashboard */}
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none flex items-center gap-2">
                <span>Top Star Dashboard</span>
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-xs">
                  <Star size={13} className="fill-white text-white" />
                </div>
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Performance Evaluation & Live Ranking System
              </p>
            </div>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xs self-stretch sm:self-auto justify-between sm:justify-end">
            
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1C6B53] dark:text-emerald-400 bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 transition cursor-pointer"
              title="Return to Main Dashboard"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />

            <button
              onClick={fetchDashboardMetrics}
              disabled={loading}
              className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""} />
            </button>

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

        {/* Top 3 Vibrant Podium Cards (Modernized with rich colors & badges) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          
          {/* Top 3 Chat Agents Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 border border-slate-800 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                  <Trophy size={16} />
                </div>
                <div>
                  <h3 className="font-black text-xs tracking-wider text-amber-300 uppercase">Top 3 Chat Agents</h3>
                  <p className="text-[10px] text-gray-400">Mohammed Dlshad Team</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-200 border border-white/10 backdrop-blur-md">
                {selectedMonth} {selectedYear}
              </span>
            </div>

            <div className="space-y-2 relative z-10">
              {top3Chat.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 font-medium">No calculated scores for this period yet</div>
              ) : (
                top3Chat.map((agent) => (
                  <div 
                    key={agent.name}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                      agent.rank === 1 
                        ? "bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/30" 
                        : agent.rank === 2
                        ? "bg-gradient-to-r from-slate-300/15 via-slate-300/5 to-transparent border border-slate-300/20"
                        : "bg-gradient-to-r from-amber-700/15 via-amber-700/5 to-transparent border border-amber-600/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                        agent.rank === 1 ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 font-black ring-1 ring-amber-300" :
                        agent.rank === 2 ? "bg-gradient-to-tr from-slate-200 to-gray-300 text-gray-900 font-bold" :
                        "bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-bold"
                      }`}>
                        {agent.rank === 1 ? "🥇" : agent.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      <span className="font-bold text-xs truncate text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <span className="font-mono font-black text-sm text-amber-300">{agent.score}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top 3 Call Center Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C6B53] via-[#145a46] to-[#0c392c] border border-emerald-700/70 text-white shadow-lg shadow-[#1C6B53]/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black shadow-md shadow-black/10">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-black text-xs tracking-wider text-emerald-100 uppercase">Top 3 Call Center</h3>
                  <p className="text-[10px] text-emerald-200/80">Call Inbound & Outbound</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-md">
                {selectedMonth} {selectedYear}
              </span>
            </div>

            <div className="space-y-2 relative z-10">
              {top3Call.length === 0 ? (
                <div className="py-4 text-center text-xs text-emerald-200/70 font-medium">No calculated scores for this period yet</div>
              ) : (
                top3Call.map((agent) => (
                  <div 
                    key={agent.name}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                      agent.rank === 1 
                        ? "bg-white/20 border border-white/30" 
                        : agent.rank === 2
                        ? "bg-white/12 border border-white/15"
                        : "bg-white/8 border border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                        agent.rank === 1 ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 font-black ring-1 ring-amber-300" :
                        agent.rank === 2 ? "bg-gradient-to-tr from-slate-200 to-gray-200 text-gray-900 font-bold" :
                        "bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-bold"
                      }`}>
                        {agent.rank === 1 ? "🥇" : agent.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      <span className="font-bold text-xs truncate text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <span className="font-mono font-black text-sm text-emerald-100">{agent.score}</span>
                      <span className="text-[10px] text-emerald-200/80 font-semibold">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Controls Bar (Search on FAR LEFT, No Rank/A-Z, Year up to 2030, Months Jan-Dec, Targets & Info, Edit Metrics) */}
        <div className={`p-2.5 sm:p-3 rounded-2xl border mb-5 transition shadow-xs ${
          isDarkMode ? "bg-gray-850/90 border-gray-800" : "bg-white border-gray-200/90"
        }`}>
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-hide">
            
            {/* 1. Far Left: Search Input */}
            <div className="relative shrink-0 w-40 sm:w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pl-7 pr-2.5 py-1.5 rounded-xl border outline-none font-medium transition ${
                  isDarkMode 
                    ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500" 
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-600"
                }`}
              />
            </div>

            <div className="h-5 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0 mx-0.5" />

            {/* 2. Team Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
              <button
                onClick={() => setTeam("chat")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  team === "chat"
                    ? "bg-[#1C6B53] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare size={13} />
                <span>Chat ({chatRoster.length})</span>
              </button>

              <button
                onClick={() => setTeam("call")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  team === "call"
                    ? "bg-[#1C6B53] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <PhoneCall size={13} />
                <span>Call ({callRoster.length})</span>
              </button>
            </div>

            <div className="h-5 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0 mx-0.5" />

            {/* 3. Year Selector Dropdown (Up to 2030) */}
            <div className="relative shrink-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-bold bg-[#1C6B53] text-white shadow-xs outline-none cursor-pointer border-0"
              >
                {YEARS.map(y => (
                  <option key={y} value={y} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/90" />
            </div>

            <div className="h-5 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0 mx-0.5" />

            {/* 4. Months Horizontal Row (Jan - Dec without Quarters) */}
            <div className="flex items-center gap-1 shrink-0">
              {MONTHS.map(m => {
                const displayLabel = m.charAt(0) + m.slice(1).toLowerCase();
                const isSel = selectedMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      isSel
                        ? "bg-[#1C6B53] text-white shadow-sm shadow-[#1C6B53]/25"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    }`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0 mx-0.5" />

            {/* 5. Targets & Info Modal Button */}
            <button
              onClick={() => setShowTargetsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer shrink-0"
              title="View KPI Targets & Scoring Rules"
            >
              <Award size={13} />
              <span>Targets & Info</span>
            </button>

            {/* 6. Edit Metrics Button */}
            {canEdit && (
              <button
                onClick={() => {
                  if (editMode && Object.keys(editedCells).length > 0) {
                    handleSaveChanges();
                  } else {
                    setEditMode(!editMode);
                  }
                }}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ${
                  editMode
                    ? "bg-[#1C6B53] hover:bg-[#155340] text-white shadow-emerald-700/20"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
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
            )}
          </div>
        </div>

        {/* Modern Clean Table Matching Main Dashboard Pattern */}
        <div className={`bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm overflow-hidden transition`}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              
              {/* Clean Single Level Header Matching Main Dashboard */}
              <thead>
                <tr className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-700/80 text-[11px] font-extrabold text-gray-600 dark:text-gray-300">
                  <th className="py-3 px-3 sm:px-4 text-center font-mono uppercase tracking-wider w-12">#</th>
                  <th className="py-3 px-3 sm:px-4 uppercase tracking-wider min-w-[170px]">Agent</th>
                  
                  {/* KPI Raw Metrics Columns */}
                  {activeCols.map(col => (
                    <th key={col.key} className="py-3 px-3 text-center uppercase tracking-wider border-l border-gray-100 dark:border-gray-800 min-w-[70px]">
                      <div>{col.label}</div>
                      <div className="text-[9px] text-gray-400 font-medium normal-case">{col.target}</div>
                    </th>
                  ))}

                  {/* Calculated Points Columns */}
                  {activeCols.map(col => (
                    <th key={`pts_${col.key}`} className="py-3 px-3 text-center uppercase tracking-wider text-[#1C6B53] dark:text-emerald-400 border-l border-gray-100 dark:border-gray-800 min-w-[60px] bg-emerald-500/[0.03]">
                      <div>{col.ptsLabel}</div>
                      <div className="text-[9px] text-[#1C6B53]/70 dark:text-emerald-400/70 font-medium normal-case">{col.max} pts</div>
                    </th>
                  ))}

                  {/* Final Score Column */}
                  <th className="py-3 px-4 text-center uppercase tracking-wider text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-700 min-w-[130px] bg-emerald-500/[0.05]">
                    Final Score
                  </th>
                </tr>
              </thead>

              {/* Table Body (Strictly sorted descending by rank 1 -> 13) */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 bg-[#FDFCFB] dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={2 + activeCols.length * 2 + 1} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={22} className="animate-spin text-emerald-500" />
                        <span className="text-xs text-gray-500 font-bold">Loading Top Star Dashboard...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={2 + activeCols.length * 2 + 1} className="py-12 text-center text-gray-400 font-medium">
                      No matching agents found
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => {
                    const rankNum = rankMap[row.name];
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;

                    return (
                      <tr 
                        key={row.name}
                        className="hover:bg-emerald-50/40 dark:hover:bg-gray-800/60 transition-all duration-150 group"
                      >
                        {/* Rank Badge */}
                        <td className="py-3 px-3 sm:px-4 text-center font-mono">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 font-black text-xs shadow-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-gray-300 dark:from-slate-700 dark:to-gray-600 text-gray-900 dark:text-white font-black text-xs shadow-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xs shadow-xs">
                              3
                            </span>
                          ) : rankNum ? (
                            <span className="text-gray-500 dark:text-gray-400 font-bold text-xs">
                              {rankNum}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">–</span>
                          )}
                        </td>

                        {/* Agent Avatar + Name */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C6B53]/20 to-emerald-100 dark:from-[#1C6B53]/40 dark:to-emerald-950 text-[#1C6B53] dark:text-emerald-300 font-black text-xs flex items-center justify-center shadow-xs border border-emerald-500/20 flex-shrink-0 ring-1 ring-emerald-500/10">
                              {row.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-800 dark:text-gray-100 truncate text-xs sm:text-sm">
                              {row.name}
                            </span>
                          </div>
                        </td>

                        {/* Raw Metric Inputs / Values */}
                        {activeCols.map(col => {
                          const currentVal = row.vals[col.key];
                          const displayVal = currentVal !== null && currentVal !== undefined ? currentVal : "";

                          return (
                            <td key={col.key} className="py-2.5 px-3 text-center border-l border-gray-100 dark:border-gray-800 font-mono">
                              {editMode && canEdit ? (
                                <input
                                  type="text"
                                  value={displayVal}
                                  placeholder={col.placeholder}
                                  onChange={(e) => handleCellChange(row.name, col.key, e.target.value)}
                                  className="w-16 px-2 py-1 text-center text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-bold focus:border-[#1C6B53] focus:ring-1 focus:ring-[#1C6B53]/20 outline-none shadow-xs"
                                />
                              ) : (
                                <span className={`text-xs font-semibold tabular-nums ${
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

                        {/* Calculated Points Cells */}
                        {row.parts.map(p => {
                          const isHigh = p.pts !== null && p.pts >= p.max * 0.95;
                          return (
                            <td key={`pts_${p.key}`} className="py-2.5 px-3 text-center font-mono border-l border-gray-100 dark:border-gray-800 bg-emerald-500/[0.015]">
                              <span className={`text-xs tabular-nums ${
                                p.pts === null ? "text-gray-300 dark:text-gray-600" :
                                isHigh ? "text-emerald-600 dark:text-emerald-400 font-bold" :
                                "text-gray-600 dark:text-gray-400 font-medium"
                              }`}>
                                {p.pts !== null ? p.pts.toFixed(1) : "–"}
                              </span>
                            </td>
                          );
                        })}

                        {/* Final Score with Clean Progress Bar */}
                        <td className="py-2.5 px-4 text-right border-l border-gray-200 dark:border-gray-700 bg-emerald-500/[0.02]">
                          <div className="flex items-center justify-end gap-2.5">
                            <div className="flex-1 max-w-[70px] h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  (row.total || 0) >= 85 ? "bg-emerald-500" :
                                  (row.total || 0) >= 70 ? "bg-amber-500" :
                                  "bg-rose-500"
                                }`}
                                style={{
                                  width: row.total ? `${Math.min(100, Math.max(0, row.total))}%` : "0%"
                                }}
                              />
                            </div>
                            <span className={`font-mono font-black text-sm min-w-[38px] text-right tabular-nums ${
                              (row.total || 0) >= 85 ? "text-emerald-600 dark:text-emerald-400" :
                              (row.total || 0) >= 70 ? "text-amber-600 dark:text-amber-400" :
                              "text-rose-600 dark:text-rose-400"
                            }`}>
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

      </div>
    </div>
  );
}
