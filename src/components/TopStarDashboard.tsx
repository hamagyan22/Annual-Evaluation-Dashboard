"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db, getSystemAuthor } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { 
  Star, Trophy, Medal, ArrowLeft, Search, Users, Check, Save, Download, 
  Sun, Moon, ChevronDown, RefreshCw, Calendar, Sparkles, Shield,
  ShieldCheck, AlertCircle, TrendingUp, Clock, Activity, MessageSquare, PhoneCall,
  CheckCircle2, Flame, Award, Filter, Edit3, X, Eye, BarChart3, HelpCircle,
  SlidersHorizontal, CheckCircle, Film
} from "lucide-react";
import { formatDuration, checkTeamCompleteness, fetchTopStarSyncStatus, invalidateTopStarCache } from "@/lib/topStarUtils";
import { DEFAULT_COMPANY_EMPLOYEES, isMemberActiveInPeriod } from "@/lib/companyRoster";
import { BASELINE_TEAM_METRICS } from "@/lib/baselineTeamMetrics";
import { getCanonicalAgentName } from "@/lib/canonicalAgents";
import TopStarCelebrationVideoModal from "./TopStarCelebrationVideoModal";
import { ModernDropdown } from "@/components/ModernDropdown";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import { TrendBadge } from "@/components/TrendBadge";

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

const DEFAULT_CHAT_AGENTS = [
  "Ahmed Rustam", "Akar Omer", "Bana Ahmed", "Dhuha Khanjer", "Ismail Ahmed",
  "Nawen Maadh", "Ossama Saadi", "Rassan Ismail", "Sana Dler", "Sawen",
  "Soma Sherko", "Yousif Rashid", "Zahra Yousif"
];

const DEFAULT_CALL_AGENTS = [
  "Ahmed Jalil", "Alla Satar", "Amar Hussein Salih", "Aya Yasin", "Azad Muhammad",
  "Frmesk Younis", "Haneen Abd-Al Kareem", "Haseeb Adeeb", "Hewr Adnan", "Kani Sami",
  "Kazhvan Wirya", "Lana Halmat Rafeeq", "Laveen Khaleel", "Marwa Khalil", "Mokhalad Ali",
  "Mohammed Salem", "Muzhda Omar Ali", "Rabar Mohammed", "Saja Bashar Anwar", "Salam Sadam Muhammad",
  "Sarbaz Namiq Hasan", "Shahab Ahmed Muhammed", "Taban Sirwan", "Zainab Khalid Rasheed",
  "Zhalla Sherzad", "Zhalla Salam"
];

function normalizeName(name: string): string {
  if (!name) return "";
  return getCanonicalAgentName(name);
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

// Years dropdown starts from 2026 up to 2030
const YEARS = ["2026", "2027", "2028", "2029", "2030"];

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

// Default Criteria Configuration
const DEFAULT_CRITERIA = {
  chat: {
    qaMax: 30, qaTarget: 99,
    prodMax: 15, prodTarget: 13,
    ahtMax: 15, ahtTarget: 210,
    artMax: 20, artTarget: 90,
    examMax: 20, examTarget: 99,
  },
  call: {
    qaMax: 30, qaTarget: 99,
    prodMax: 20, prodTarget: 93,
    ahtMax: 20, ahtTarget: 164,
    examMax: 20, examTarget: 99,
    wrapupMax: 5,
    holdMax: 5, holdTarget: 30,
  }
};


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

  useEffect(() => {
    if (initialYear && initialYear !== selectedYear) {
      setSelectedYear(initialYear);
    }
  }, [initialYear]);

  useEffect(() => {
    if (initialMonth && initialMonth !== selectedMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [syncStatusRegistry, setSyncStatusRegistry] = useState<Record<string, any>>({});

  const [metricsData, setMetricsData] = useState<{
    chat: Record<string, Record<string, any>>;
    call: Record<string, Record<string, any>>;
  }>({ chat: {}, call: {} });

  const [prevMetricsData, setPrevMetricsData] = useState<{
    chat: Record<string, Record<string, any>>;
    call: Record<string, Record<string, any>>;
  }>({ chat: {}, call: {} });

  // Criteria & Targets configuration
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [showCriteriaModal, setShowCriteriaModal] = useState<boolean>(false);
  const [isEditingCriteria, setIsEditingCriteria] = useState<boolean>(false);
  const [tempCriteria, setTempCriteria] = useState(DEFAULT_CRITERIA);
  const [isSavingCriteria, setIsSavingCriteria] = useState<boolean>(false);
  const [criteriaModalTab, setCriteriaModalTab] = useState<"weights" | "matrix">("weights");
  const [benchmarkMatrixTeam, setBenchmarkMatrixTeam] = useState<"call" | "chat">("call");

  // Top 3 Celebration & Appreciation Video Modal state
  const [showCelebrationVideo, setShowCelebrationVideo] = useState<boolean>(false);
  const [membersList, setMembersList] = useState<any[]>(allMembers && allMembers.length > 0 ? allMembers : DEFAULT_COMPANY_EMPLOYEES);

  useEffect(() => {
    setMembersList(allMembers && allMembers.length > 0 ? allMembers : DEFAULT_COMPANY_EMPLOYEES);
  }, [allMembers]);

  const handlePhotoUpdated = (agentName: string, photoUrl: string) => {
    setMembersList(prev => {
      const norm = normalizeName(agentName);
      const exists = prev.some(m => normalizeName(m.agent_name || m.name) === norm);
      if (exists) {
        return prev.map(m => normalizeName(m.agent_name || m.name) === norm ? { ...m, photo_url: photoUrl } : m);
      }
      return [...prev, { name: agentName, agent_name: agentName, photo_url: photoUrl }];
    });
  };

  // Active rosters (strictly excluding deleted / resigned agents for the selected period)
  const chatRoster = useMemo(() => {
    const inactiveSet = new Set(
      membersList
        .filter(m => !isMemberActiveInPeriod(m, selectedMonth, selectedYear))
        .map(m => normalizeName(m.agent_name || m.name))
    );
    const fromProps = membersList
      .filter(m => m.team === "Mohammed Dlshad Team" && isMemberActiveInPeriod(m, selectedMonth, selectedYear))
      .map(m => normalizeName(m.agent_name || m.name));
    const combined = Array.from(new Set([...fromProps, ...DEFAULT_CHAT_AGENTS])).filter(n => !inactiveSet.has(n));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [membersList, selectedMonth, selectedYear]);

  const callRoster = useMemo(() => {
    const inactiveSet = new Set(
      membersList
        .filter(m => !isMemberActiveInPeriod(m, selectedMonth, selectedYear))
        .map(m => normalizeName(m.agent_name || m.name))
    );
    const fromProps = membersList
      .filter(m => (m.team === "Younis Kamal Team" || m.team === "Ankido Buya Team") && isMemberActiveInPeriod(m, selectedMonth, selectedYear))
      .map(m => normalizeName(m.agent_name || m.name));
    const combined = Array.from(new Set([...fromProps, ...DEFAULT_CALL_AGENTS])).filter(n => !inactiveSet.has(n));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [membersList, selectedMonth, selectedYear]);

  // Load Criteria & Sync Status from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [critSnap, statusSnap] = await Promise.all([
          getDoc(doc(db, "settings", "top_star_criteria")),
          getDoc(doc(db, "settings", "top_star_status"))
        ]);
        if (critSnap.exists()) {
          const data = critSnap.data();
          if (data && data.chat && data.call) {
            setCriteria(data as typeof DEFAULT_CRITERIA);
            setTempCriteria(data as typeof DEFAULT_CRITERIA);
          }
        }
        if (statusSnap.exists()) {
          setSyncStatusRegistry(statusSnap.data()?.synced_months || {});
        }
      } catch (e) {
        console.error("Error loading criteria / status:", e);
      }
    };
    loadSettings();
  }, []);

  // Completeness checks
  const chatCompleteness = useMemo(() => {
    return checkTeamCompleteness("chat", metricsData.chat, chatRoster);
  }, [metricsData.chat, chatRoster]);

  const callCompleteness = useMemo(() => {
    return checkTeamCompleteness("call", metricsData.call, callRoster);
  }, [metricsData.call, callRoster]);

  const currentCompleteness = team === "chat" ? chatCompleteness : callCompleteness;

  // Fetch metrics data from Firestore
  const fetchDashboardMetrics = async (isManualSync = false) => {
    if (isManualSync) setIsSyncing(true);
    else setLoading(true);

    try {
      const upperMonth = (selectedMonth || "").toUpperCase();
      const currentMonthIdx = MONTHS.indexOf(upperMonth);
      const targetPrevMonth = currentMonthIdx > 0 ? MONTHS[currentMonthIdx - 1] : null;

      const targetMonths = Array.from(new Set([selectedMonth, targetPrevMonth].filter(Boolean))) as string[];
      const monthVariants = Array.from(new Set(
        targetMonths.flatMap(m => [
          m.toUpperCase(),
          m.toLowerCase(),
          m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
        ])
      )).filter(Boolean);

      const numYear = Number(selectedYear);
      const isNum = !isNaN(numYear);

      let [mohammedSnap, younisSnap, ankidoSnap, statusSnap] = await Promise.all([
        getDocs(query(collection(db, "mohammed_metrics"), where("year", "==", selectedYear), where("month", "in", monthVariants))).catch(() => null),
        getDocs(query(collection(db, "younis_metrics"), where("year", "==", selectedYear), where("month", "in", monthVariants))).catch(() => null),
        getDocs(query(collection(db, "ankido_metrics"), where("year", "==", selectedYear), where("month", "in", monthVariants))).catch(() => null),
        getDoc(doc(db, "settings", "top_star_status")).catch(() => null)
      ]);

      // Fallback: If no docs returned and year can be numeric, query numeric year
      if (isNum) {
        const [mohammedNumSnap, younisNumSnap, ankidoNumSnap] = await Promise.all([
          (!mohammedSnap || mohammedSnap.empty) ? getDocs(query(collection(db, "mohammed_metrics"), where("year", "==", numYear), where("month", "in", monthVariants))).catch(() => null) : null,
          (!younisSnap || younisSnap.empty) ? getDocs(query(collection(db, "younis_metrics"), where("year", "==", numYear), where("month", "in", monthVariants))).catch(() => null) : null,
          (!ankidoSnap || ankidoSnap.empty) ? getDocs(query(collection(db, "ankido_metrics"), where("year", "==", numYear), where("month", "in", monthVariants))).catch(() => null) : null,
        ]);
        if (mohammedNumSnap && !mohammedNumSnap.empty) mohammedSnap = mohammedNumSnap;
        if (younisNumSnap && !younisNumSnap.empty) younisSnap = younisNumSnap;
        if (ankidoNumSnap && !ankidoNumSnap.empty) ankidoSnap = ankidoNumSnap;
      }

      if (statusSnap && statusSnap.exists()) {
        setSyncStatusRegistry(statusSnap.data()?.synced_months || {});
      }

      const chatMap: Record<string, any> = {};
      const prevChatMap: Record<string, any> = {};
      const baselineChat = BASELINE_TEAM_METRICS.filter(
        m => m.team === "Mohammed Dlshad Team" && String(m.year) === String(selectedYear)
      );
      baselineChat.forEach(d => {
        const cName = normalizeName(d.agent_name || "");
        if (!cName) return;
        const dMonth = (d.month || "").toUpperCase();
        if (dMonth === upperMonth) chatMap[cName] = d;
        if (targetPrevMonth && dMonth === targetPrevMonth) prevChatMap[cName] = d;
      });
      if (mohammedSnap) {
        mohammedSnap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const cName = normalizeName(d.agent_name || "");
          if (!cName) return;
          const dMonth = (d.month || "").toUpperCase();
          if (dMonth === upperMonth) chatMap[cName] = { ...chatMap[cName], ...d };
          if (targetPrevMonth && dMonth === targetPrevMonth) prevChatMap[cName] = { ...prevChatMap[cName], ...d };
        });
      }

      const callMap: Record<string, any> = {};
      const prevCallMap: Record<string, any> = {};
      const baselineCall = BASELINE_TEAM_METRICS.filter(
        m => (m.team === "Younis Kamal Team" || m.team === "Ankido Buya Team") && String(m.year) === String(selectedYear)
      );
      baselineCall.forEach(d => {
        const cName = normalizeName(d.agent_name || "");
        if (!cName) return;
        const dMonth = (d.month || "").toUpperCase();
        if (dMonth === upperMonth) callMap[cName] = d;
        if (targetPrevMonth && dMonth === targetPrevMonth) prevCallMap[cName] = d;
      });
      if (younisSnap || ankidoSnap) {
        [...(younisSnap?.docs || []), ...(ankidoSnap?.docs || [])].forEach(docSnap => {
          const d = docSnap.data();
          const cName = normalizeName(d.agent_name || "");
          if (!cName) return;
          const dMonth = (d.month || "").toUpperCase();
          if (dMonth === upperMonth) callMap[cName] = { ...callMap[cName], ...d };
          if (targetPrevMonth && dMonth === targetPrevMonth) prevCallMap[cName] = { ...prevCallMap[cName], ...d };
        });
      }

      const finalChat: Record<string, Record<string, any>> = {};
      const prevFinalChat: Record<string, Record<string, any>> = {};
      chatRoster.forEach(name => {
        const raw = chatMap[name] || chatMap[normalizeName(name)] || {};
        finalChat[name] = {
          qa: raw.quality ?? raw.qa ?? null,
          prod: raw.productivity ?? raw.prod ?? null,
          aht: raw.aht ? parseSec(raw.aht) : null,
          art: raw.art ? parseSec(raw.art) : null,
          exam: raw.exam ?? null
        };

        const prevRaw = prevChatMap[name] || prevChatMap[normalizeName(name)] || {};
        prevFinalChat[name] = {
          qa: prevRaw.quality ?? prevRaw.qa ?? null,
          prod: prevRaw.productivity ?? prevRaw.prod ?? null,
          aht: prevRaw.aht ? parseSec(prevRaw.aht) : null,
          art: prevRaw.art ? parseSec(prevRaw.art) : null,
          exam: prevRaw.exam ?? null
        };
      });

      const finalCall: Record<string, Record<string, any>> = {};
      const prevFinalCall: Record<string, Record<string, any>> = {};
      callRoster.forEach(name => {
        const raw = callMap[name] || callMap[normalizeName(name)] || {};
        finalCall[name] = {
          qa: raw.quality ?? raw.qa ?? null,
          prod: raw.productivity ?? raw.prod ?? null,
          aht: raw.aht ? parseSec(raw.aht) : null,
          exam: raw.exam ?? null,
          wrapup: num(raw.wrapup),
          hold: raw.hold ? parseSec(raw.hold) : null
        };

        const prevRaw = prevCallMap[name] || prevCallMap[normalizeName(name)] || {};
        prevFinalCall[name] = {
          qa: prevRaw.quality ?? prevRaw.qa ?? null,
          prod: prevRaw.productivity ?? prevRaw.prod ?? null,
          aht: prevRaw.aht ? parseSec(prevRaw.aht) : null,
          exam: prevRaw.exam ?? null,
          wrapup: num(prevRaw.wrapup),
          hold: prevRaw.hold ? parseSec(prevRaw.hold) : null
        };
      });

      setPrevMetricsData({ chat: prevFinalChat, call: prevFinalCall });

      // Strict Completeness Verification
      const currentRoster = team === "chat" ? chatRoster : callRoster;
      const currentData = team === "chat" ? finalChat : finalCall;
      const completeness = checkTeamCompleteness(team, currentData, currentRoster);

      if (isManualSync) {
        if (!completeness.hasAnyData) {
          setSyncNotice({
            type: "error",
            message: `Cannot Sync: No metrics entered for ${selectedMonth} ${selectedYear} in Team Leader dashboard.`
          });
          setTimeout(() => setSyncNotice(null), 6000);
          setIsSyncing(false);
          setLoading(false);
          return;
        }

        if (!completeness.isComplete) {
          const missingNames = completeness.missingAgents.map(a => a.name).slice(0, 3).join(", ");
          const remaining = completeness.missingAgents.length > 3 ? ` +${completeness.missingAgents.length - 3} more` : "";
          setSyncNotice({
            type: "warning",
            message: `Cannot Sync: Data is incomplete (${completeness.completedAgents}/${completeness.totalAgents} agents ready). Missing: ${missingNames}${remaining}. Team Leader must complete all data before syncing.`
          });
          setTimeout(() => setSyncNotice(null), 7000);
          setIsSyncing(false);
          setLoading(false);
          return;
        }

        // All agents are 100% complete: proceed with official sync and publish
        const syncKey = `${selectedYear}_${selectedMonth}_${team}`;
        await setDoc(doc(db, "settings", "top_star_status"), {
          synced_months: {
            [syncKey]: {
              isSynced: true,
              isComplete: true,
              syncedAt: new Date().toISOString(),
              syncedBy: userProfile?.email || "admin",
              agentCount: completeness.totalAgents
            }
          }
        }, { merge: true });

        invalidateTopStarCache();

        setSyncStatusRegistry(prev => ({
          ...prev,
          [syncKey]: {
            isSynced: true,
            isComplete: true,
            syncedAt: new Date().toISOString(),
            syncedBy: userProfile?.email || "admin",
            agentCount: completeness.totalAgents
          }
        }));

        setSyncNotice({
          type: "success",
          message: `Sync successful! All ${completeness.totalAgents} agents for ${selectedMonth} ${selectedYear} are 100% complete and rankings are published.`
        });
        setTimeout(() => setSyncNotice(null), 5500);
        setMetricsData({ chat: finalChat, call: finalCall });
      }

      setMetricsData({ chat: finalChat, call: finalCall });
    } catch (err) {
      console.error("Error fetching Top Star metrics:", err);
      if (isManualSync) {
        setSyncNotice({ type: "error", message: "Failed to connect to database for synchronization." });
        setTimeout(() => setSyncNotice(null), 5000);
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Sync automatically on month or year change
  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedYear, selectedMonth]);

  // Scoring function conforming strictly to customizable Top Star criteria
  const scoreAgent = (t: "chat" | "call", vals: Record<string, any>, wrapupRange?: { min: number; max: number }) => {
    const v = vals || {};
    const qa = num(v.qa ?? v.quality);
    const prod = num(v.prod ?? v.productivity);
    const aht = parseSec(v.aht);
    const exam = num(v.exam);

    if (t === "chat") {
      const c = criteria.chat;
      const art = parseSec(v.art);
      const parts = [
        { key: "qa",   pts: qa == null ? null : clamp01(Math.min(qa, c.qaTarget) / c.qaTarget) * c.qaMax, max: c.qaMax },
        { key: "prod", pts: prod == null ? null : Math.min(prod / c.prodTarget, 1) * c.prodMax, max: c.prodMax },
        { key: "aht",  pts: aht == null || aht <= 0 ? null : Math.min(c.ahtTarget / aht, 1) * c.ahtMax, max: c.ahtMax },
        { key: "art",  pts: art == null || art <= 0 ? null : Math.min(c.artTarget / art, 1) * c.artMax, max: c.artMax },
        { key: "exam", pts: exam == null ? null : (Math.min(exam, c.examTarget) / c.examTarget) * c.examMax, max: c.examMax }
      ];
      const any = parts.some(p => p.pts != null);
      const total = any ? parts.reduce((acc, p) => acc + (p.pts || 0), 0) : null;
      return { parts, total };
    }

    const c = criteria.call;
    const wrapup = num(v.wrapup);
    const hold = parseSec(v.hold);

    let wrapupPts: number | null = null;
    if (wrapup != null && wrapupRange) {
      wrapupPts = wrapupRange.max === wrapupRange.min 
        ? c.wrapupMax 
        : Math.max(0, Math.min(c.wrapupMax, ((wrapupRange.max - wrapup) / (wrapupRange.max - wrapupRange.min)) * c.wrapupMax));
    }

    const parts = [
      { key: "qa",     pts: qa == null ? null : (Math.min(qa, c.qaTarget) / c.qaTarget) * c.qaMax, max: c.qaMax },
      { key: "prod",   pts: prod == null ? null : (Math.min(prod, c.prodTarget) / c.prodTarget) * c.prodMax, max: c.prodMax },
      { key: "aht",    pts: aht == null || aht <= 0 ? null : Math.min(c.ahtTarget / aht, 1) * c.ahtMax, max: c.ahtMax },
      { key: "exam",   pts: exam == null ? null : (Math.min(exam, c.examTarget) / c.examTarget) * c.examMax, max: c.examMax },
      { key: "wrapup", pts: wrapupPts, max: c.wrapupMax },
      { key: "hold",   pts: hold == null || hold <= 0 ? null : Math.min(c.holdTarget / hold, 1) * c.holdMax, max: c.holdMax }
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
        .map(name => num(teamData[name]?.wrapup))
        .filter((x): x is number => x != null);

      if (wrapupVals.length > 0) {
        wrapupRange = { min: Math.min(...wrapupVals), max: Math.max(...wrapupVals) };
      }
    }

    const scoredList = roster.map(name => {
      const liveVals = teamData[name] || {};
      const { parts, total } = scoreAgent(t, liveVals, wrapupRange);
      return {
        name,
        vals: liveVals,
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

  const rankedChat = useMemo(() => computeRanks("chat"), [metricsData.chat, chatRoster, criteria]);
  const rankedCall = useMemo(() => computeRanks("call"), [metricsData.call, callRoster, criteria]);

  const activeRanked = team === "chat" ? rankedChat : rankedCall;

  // Columns definition: Title Cased and WITHOUT %
  const activeCols = useMemo(() => {
    if (team === "chat") {
      const c = criteria.chat;
      return [
        { key: "qa",   label: "Qa",   ptsLabel: "Qa Pts", max: c.qaMax, target: `Target ${c.qaTarget}` },
        { key: "prod", label: "Prod", ptsLabel: "Prod Pts", max: c.prodMax, target: `Target ${c.prodTarget}/hr` },
        { key: "aht",  label: "Aht",  ptsLabel: "Aht Pts", max: c.ahtMax, target: `Target ${formatDuration(c.ahtTarget)}` },
        { key: "art",  label: "Art",  ptsLabel: "Art Pts", max: c.artMax, target: `Target ${formatDuration(c.artTarget)}` },
        { key: "exam", label: "Exam", ptsLabel: "Exam Pts", max: c.examMax, target: `Target ${c.examTarget}` }
      ];
    }
    const c = criteria.call;
    return [
      { key: "qa",     label: "Qa",     ptsLabel: "Qa Pts", max: c.qaMax, target: `Target ${c.qaTarget}` },
      { key: "prod",   label: "Prod",   ptsLabel: "Prod Pts", max: c.prodMax, target: `Target ${c.prodTarget}` },
      { key: "aht",    label: "Aht",    ptsLabel: "Aht Pts", max: c.ahtMax, target: `Target ${formatDuration(c.ahtTarget)}` },
      { key: "exam",   label: "Exam",   ptsLabel: "Exam Pts", max: c.examMax, target: `Target ${c.examTarget}` },
      { key: "wrapup", label: "Wrapup", ptsLabel: "Wrapup Pts", max: c.wrapupMax, target: "Relative" },
      { key: "hold",   label: "Hold",   ptsLabel: "Hold Pts", max: c.holdMax, target: `Target ${formatDuration(c.holdTarget)}` }
    ];
  }, [team, criteria]);

  // Rank Map: computed strictly from descending score order
  const rankMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    activeRanked.forEach((r, idx) => {
      map[r.name] = r.total != null ? idx + 1 : null;
    });
    return map;
  }, [activeRanked]);

  const upperMonth = (selectedMonth || "").toUpperCase();
  const currentMonthIdx = MONTHS.indexOf(upperMonth);
  const prevMonthName = currentMonthIdx > 0 ? MONTHS[currentMonthIdx - 1] : null;

  const prevMonthScores = useMemo(() => {
    if (!prevMonthName) return {};
    const map: Record<string, number | null> = {};
    const t = team;
    const teamPrevData = prevMetricsData[t] || {};
    
    let wrapupRange: { min: number; max: number } | undefined;
    if (t === "call") {
      const wrapupVals = callRoster
        .map(name => num(teamPrevData[name]?.wrapup))
        .filter((v): v is number => v !== null);
      if (wrapupVals.length > 0) {
        wrapupRange = { min: Math.min(...wrapupVals), max: Math.max(...wrapupVals) };
      }
    }

    const roster = t === "chat" ? chatRoster : callRoster;
    roster.forEach(name => {
      const agentVals = teamPrevData[name] || teamPrevData[normalizeName(name)];
      if (agentVals) {
        const { total } = scoreAgent(t, agentVals, wrapupRange);
        map[name] = total;
      }
    });

    return map;
  }, [prevMonthName, prevMetricsData, team, chatRoster, callRoster, criteria]);

  // Display rows: ALWAYS sorted by Rank descending (highest score first)
  const displayRows = useMemo(() => {
    let list = [...activeRanked];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (a.total == null && b.total == null) return a.name.localeCompare(b.name);
      if (a.total == null) return 1;
      if (b.total == null) return -1;
      return (b.total || 0) - (a.total || 0);
    });

    return list;
  }, [activeRanked, searchQuery]);

  const top3Chat = useMemo(() => {
    return rankedChat.filter(r => r.total != null).slice(0, 3).map((r, i) => {
      const found = membersList.find(m => normalizeName(m.agent_name || m.name) === normalizeName(r.name));
      return {
        rank: i + 1,
        name: r.name,
        score: (r.total || 0).toFixed(1),
        photoUrl: found?.photo_url || ""
      };
    });
  }, [rankedChat, membersList]);

  const top3Call = useMemo(() => {
    return rankedCall.filter(r => r.total != null).slice(0, 3).map((r, i) => {
      const found = membersList.find(m => normalizeName(m.agent_name || m.name) === normalizeName(r.name));
      return {
        rank: i + 1,
        name: r.name,
        score: (r.total || 0).toFixed(1),
        photoUrl: found?.photo_url || ""
      };
    });
  }, [rankedCall, membersList]);

  const handleSaveCriteria = async () => {
    if (!canEdit) return;
    setIsSavingCriteria(true);
    try {
      await setDoc(doc(db, "settings", "top_star_criteria"), {
        ...tempCriteria,
        updated_at: new Date().toISOString(),
        updated_by: userProfile?.email || "admin"
      });
      invalidateTopStarCache();
      setCriteria(tempCriteria);
      setIsEditingCriteria(false);
      setShowCriteriaModal(false);
      setSyncNotice({ type: "success", message: "KPI Evaluation Criteria updated successfully!" });
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (e: any) {
      alert("Error saving criteria: " + e.message);
    } finally {
      setIsSavingCriteria(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#F9F8F4] text-gray-900"
    } font-sans p-3.5 sm:p-6 md:p-8`}>
      
      {/* Floating Notice / Toast */}
      {syncNotice && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-xl animate-in fade-in slide-in-from-top-3 duration-200 ${
          syncNotice.type === "success" 
            ? "bg-[#1C6B53] shadow-emerald-800/30" 
            : syncNotice.type === "warning"
            ? "bg-amber-600 shadow-amber-800/30"
            : "bg-rose-600 shadow-rose-800/30"
        }`}>
          {syncNotice.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{syncNotice.message}</span>
        </div>
      )}

      {/* KPI Criteria Modal (With Edit Ability for Admin/Manager & 5-Star Rating Matrix) */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">KPI Evaluation & Benchmark Standards</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Benchmark Weights & Official 5-Star Performance Matrix</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {criteriaModalTab === "weights" && canEdit && !isEditingCriteria && (
                  <button
                    onClick={() => {
                      setTempCriteria(criteria);
                      setIsEditingCriteria(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Criteria</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsEditingCriteria(false);
                    setShowCriteriaModal(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Modal: Point Weights vs 5-Star Rating Matrix */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 mt-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setCriteriaModalTab("weights");
                  setIsEditingCriteria(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                  criteriaModalTab === "weights"
                    ? "bg-[#1C6B53] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Point Weights (100 Pts Total)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCriteriaModalTab("matrix");
                  setIsEditingCriteria(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                  criteriaModalTab === "matrix"
                    ? "bg-[#1C6B53] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Star size={13} className="fill-current" />
                <span>Official 5 ⭐ Rating Matrix</span>
              </button>
            </div>

            {criteriaModalTab === "weights" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chat Breakdown */}
                  <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-[#1C6B53] dark:text-emerald-400">
                      <MessageSquare size={15} />
                      <span>Chat Team Criteria</span>
                    </div>
                    
                    {isEditingCriteria ? (
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Qa Max Points & Target</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.chat.qaMax} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, qaMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (30)" />
                            <input type="number" value={tempCriteria.chat.qaTarget} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, qaTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (100)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Productivity Max Points & Target (/hr)</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.chat.prodMax} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, prodMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (15)" />
                            <input type="number" value={tempCriteria.chat.prodTarget} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, prodTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (13)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Aht Max Points & Target (s)</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.chat.ahtMax} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, ahtMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (15)" />
                            <input type="number" value={tempCriteria.chat.ahtTarget} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, ahtTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (210s)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Art Max Points & Target (s)</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.chat.artMax} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, artMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (20)" />
                            <input type="number" value={tempCriteria.chat.artTarget} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, artTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (90s)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Exam Max Points & Target</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.chat.examMax} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, examMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (20)" />
                            <input type="number" value={tempCriteria.chat.examTarget} onChange={e => setTempCriteria({...tempCriteria, chat: {...tempCriteria.chat, examTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (100)" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                          <span className="text-gray-600 dark:text-gray-300">1. Quality (Qa)</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{criteria.chat.qaMax} pts (Target {criteria.chat.qaTarget})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                          <span className="text-gray-600 dark:text-gray-300">2. Productivity (Prod)</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{criteria.chat.prodMax} pts ({criteria.chat.prodTarget}/hr)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                          <span className="text-gray-600 dark:text-gray-300">3. Average Handle Time (Aht)</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{criteria.chat.ahtMax} pts ({criteria.chat.ahtTarget}s)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                          <span className="text-gray-600 dark:text-gray-300">4. Response Time (Art)</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{criteria.chat.artMax} pts ({criteria.chat.artTarget}s)</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600 dark:text-gray-300">5. Knowledge Exam (Exam)</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{criteria.chat.examMax} pts (Target {criteria.chat.examTarget})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Call Breakdown */}
                  <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20">
                    <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <PhoneCall size={15} />
                      <span>Call Center Criteria</span>
                    </div>
                    
                    {isEditingCriteria ? (
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Qa Max Points & Target</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.call.qaMax} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, qaMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (30)" />
                            <input type="number" value={tempCriteria.call.qaTarget} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, qaTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (100)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Productivity Max Points & Target</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.call.prodMax} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, prodMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (20)" />
                            <input type="number" value={tempCriteria.call.prodTarget} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, prodTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (100)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Aht Max Points & Target (s)</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.call.ahtMax} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, ahtMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (20)" />
                            <input type="number" value={tempCriteria.call.ahtTarget} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, ahtTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (164s)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Exam Max Points & Target</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.call.examMax} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, examMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Pts (20)" />
                            <input type="number" value={tempCriteria.call.examTarget} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, examTarget: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Target (100)" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Wrapup & Hold Max Points</label>
                          <div className="flex gap-2 mt-1">
                            <input type="number" value={tempCriteria.call.wrapupMax} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, wrapupMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Wrapup (5)" />
                            <input type="number" value={tempCriteria.call.holdMax} onChange={e => setTempCriteria({...tempCriteria, call: {...tempCriteria.call, holdMax: Number(e.target.value)}})} className="w-1/2 p-1.5 border rounded-lg text-xs font-mono font-bold dark:bg-gray-800" placeholder="Hold (5)" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                          <span className="text-gray-600 dark:text-gray-300">1. Quality (Qa)</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{criteria.call.qaMax} pts (Target {criteria.call.qaTarget})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                          <span className="text-gray-600 dark:text-gray-300">2. Productivity (Prod)</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{criteria.call.prodMax} pts (Target {criteria.call.prodTarget})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                          <span className="text-gray-600 dark:text-gray-300">3. Average Handle Time (Aht)</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{criteria.call.ahtMax} pts ({criteria.call.ahtTarget}s)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                          <span className="text-gray-600 dark:text-gray-300">4. Knowledge Exam (Exam)</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{criteria.call.examMax} pts (Target {criteria.call.examTarget})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-amber-100 dark:border-amber-900/40">
                          <span className="text-gray-600 dark:text-gray-300">5. Wrapup</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{criteria.call.wrapupMax} pts (Relative)</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600 dark:text-gray-300">6. Hold Time</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{criteria.call.holdMax} pts ({criteria.call.holdTarget}s)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-600">85+ Elite</span>
                    <span className="font-bold text-amber-600">70–84 Good</span>
                    <span className="font-bold text-rose-600">&lt;70 Needs Imp.</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditingCriteria ? (
                      <>
                        <button
                          onClick={() => setIsEditingCriteria(false)}
                          className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCriteria}
                          disabled={isSavingCriteria}
                          className="px-4 py-1.5 bg-[#1C6B53] hover:bg-[#155340] text-white rounded-xl font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                        >
                          {isSavingCriteria ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                          <span>Save Changes</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowCriteriaModal(false)}
                        className="px-4 py-2 bg-[#1C6B53] hover:bg-[#155340] text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Official 5-Star Rating Matrix replica from operational benchmark */
              <div className="space-y-4">
                {/* Team Switcher Tabs for Matrix */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => setBenchmarkMatrixTeam("call")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        benchmarkMatrixTeam === "call"
                          ? "bg-[#1C6B53] text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <PhoneCall size={13} />
                      <span>Calls Matrix (Voice Operations)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBenchmarkMatrixTeam("chat")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        benchmarkMatrixTeam === "chat"
                          ? "bg-[#1C6B53] text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <MessageSquare size={13} />
                      <span>Chat Matrix (Digital Operations)</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Official 5 ⭐ Standard
                  </span>
                </div>

                {benchmarkMatrixTeam === "call" ? (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xs">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-extrabold border-b border-gray-200 dark:border-gray-700">
                          <th className="p-3 text-left">Rating Tier</th>
                          <th className="p-3">QA</th>
                          <th className="p-3">AHT</th>
                          <th className="p-3">Exam</th>
                          <th className="p-3">Productivity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {/* 5 Exceptional */}
                        <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                              <span>5 ⭐</span>
                              <span>Exceptional</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">99% - 100%</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">&lt; 2:44</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">99% - 100%</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">&gt; 93%</td>
                        </tr>

                        {/* 4 Exceeds Expectations */}
                        <tr className="bg-sky-50/50 dark:bg-sky-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-300 dark:border-sky-700">
                              <span>4 ⭐</span>
                              <span>Exceeds</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">96% - 98%</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">2:45 - 2:59</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">96% - 98%</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">91% - 92%</td>
                        </tr>

                        {/* 3 Meets Expectations */}
                        <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              <span>3 ⭐</span>
                              <span>Meets</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">95%</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">3:00 - 3:10</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">90% - 95%</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">90%</td>
                        </tr>

                        {/* 2 Developing */}
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                              <span>2 ⭐</span>
                              <span>Developing</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">90% - 94%</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">3:11 - 3:30</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">85% - 89%</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">86% - 89%</td>
                        </tr>

                        {/* 1 Needs Improvement */}
                        <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                              <span>1 ⭐</span>
                              <span>Needs Imp.</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&lt; 89%</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&gt; 3:31</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&lt; 85%</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&lt; 85%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xs">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-extrabold border-b border-gray-200 dark:border-gray-700">
                          <th className="p-3 text-left">Rating Tier</th>
                          <th className="p-3">Exam</th>
                          <th className="p-3">QA</th>
                          <th className="p-3">AHT</th>
                          <th className="p-3">ART</th>
                          <th className="p-3">Productivity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {/* 5 Exceptional */}
                        <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                              <span>5 ⭐</span>
                              <span>Exceptional</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">99% - 100%</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">99% - 100%</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">3:00 - 3:30</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">&lt; 1:30</td>
                          <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">&gt; 13</td>
                        </tr>

                        {/* 4 Exceeds Expectations */}
                        <tr className="bg-sky-50/50 dark:bg-sky-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-300 dark:border-sky-700">
                              <span>4 ⭐</span>
                              <span>Exceeds</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">96% - 98%</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">96% - 98%</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">3:31 - 4:00</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">1:31 - 1:59</td>
                          <td className="p-3 font-mono font-bold text-sky-800 dark:text-sky-300">11 - 12.99</td>
                        </tr>

                        {/* 3 Meets Expectations */}
                        <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              <span>3 ⭐</span>
                              <span>Meets</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">90% - 95%</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">95%</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">4:01 - 4:59</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">2:00 - 2:59</td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">8.5 - 10.99</td>
                        </tr>

                        {/* 2 Developing */}
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                              <span>2 ⭐</span>
                              <span>Developing</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">85% - 89%</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">90% - 94%</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">5:00 - 5:59</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">3:00 - 3:30</td>
                          <td className="p-3 font-mono font-semibold text-amber-800 dark:text-amber-300">7.50 - 8.49</td>
                        </tr>

                        {/* 1 Needs Improvement */}
                        <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                              <span>1 ⭐</span>
                              <span>Needs Imp.</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&lt; 85%</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&lt; 89%</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&gt; 6:00</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&gt; 3:31</td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">&lt; 7.50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Official benchmark matrix adopted for all contact center evaluation tiers.
                  </span>
                  <button
                    onClick={() => setShowCriteriaModal(false)}
                    className="px-4 py-2 bg-[#1C6B53] hover:bg-[#155340] text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top 3 Celebration & Appreciation Video Modal */}
      {showCelebrationVideo && (
        <TopStarCelebrationVideoModal
          isOpen={showCelebrationVideo}
          onClose={() => setShowCelebrationVideo(false)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          top3Chat={top3Chat}
          top3Call={top3Call}
          allMembers={membersList}
          onPhotoUpdated={handlePhotoUpdated}
        />
      )}

      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 gap-3 pb-4 border-b border-gray-200/70 dark:border-gray-800 relative z-30">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-11 w-auto object-contain" />
            <div className="h-8 sm:h-9 w-[1.5px] bg-gray-200 dark:bg-gray-700" />
            
            <div>
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

          {/* Right Header Navigation: Features, Divider, Dark Mode, Themes, Back (Far Right) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xs self-stretch sm:self-auto justify-end">
            
            {/* Criteria & Targets Button */}
            <button
              onClick={() => setShowCriteriaModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 transition active:scale-95 cursor-pointer shadow-2xs"
              title="View & Edit Evaluation Criteria"
            >
              <Award size={14} />
              <span>Criteria</span>
            </button>

            {/* Celebration Video Button */}
            <button
              onClick={() => setShowCelebrationVideo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-md shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Generate Motivational & Appreciation Celebration Video for Top 3"
            >
              <Film size={14} className="text-white shrink-0" />
              <span>Celebration Video</span>
            </button>

            <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />

            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="w-8 sm:w-8.5 h-8 sm:h-8.5 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer shrink-0"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
              </button>
            )}

            {/* Theme Selector right beside Back */}
            <ThemeSelectorModal />

            {/* Back Button (Always First on the Far Right) */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white bg-white hover:bg-gray-100/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/90 dark:border-gray-700 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
              title="Return to Main Dashboard"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Celebration Reel Quick Access Banner */}
        <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-[#1C6B53]/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C6B53] text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-emerald-500/20">
              <Film size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                  Top 3 Motivational & Appreciation Celebration Video
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#1C6B53] dark:text-teal-300 border border-emerald-500/30">
                  {selectedMonth} {selectedYear}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Generate an animated celebratory video and appreciation cards honoring the Top 3 performers in Chat Team & Call Team.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCelebrationVideo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-md shadow-emerald-700/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <Sparkles size={14} className="text-emerald-100" />
            <span>Generate Video</span>
          </button>
        </div>

        {/* Top 3 Vibrant Podium Cards (Both cards styled with matching Emerald color as requested) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5">
          
          {/* Top 3 Chat Agents Card: Dynamically styled with active theme gradient */}
          <div 
            style={{ background: 'var(--brand-gradient)' }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C6B53] via-[#145a46] to-[#0c392c] border border-white/20 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black shadow-xs">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm tracking-wide text-white">Top 3 Chat Team</h3>
                  <p className="text-[10px] text-white/80">Chat Operations</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-md">
                {selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase()} {selectedYear}
              </span>
            </div>

            <div className="space-y-2 relative z-10">
              {top3Chat.length === 0 ? (
                <div className="py-4 text-center text-xs text-white/70 font-medium">No calculated scores for this period yet</div>
              ) : (
                top3Chat.map((agent) => (
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
                      <div className="relative shrink-0">
                        {agent.photoUrl ? (
                          <img 
                            src={agent.photoUrl} 
                            alt={agent.name} 
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 shadow-xs" 
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                            agent.rank === 1 ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 font-black ring-1 ring-amber-300" :
                            agent.rank === 2 ? "bg-gradient-to-tr from-slate-200 to-gray-200 text-gray-900 font-bold" :
                            "bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-bold"
                          }`}>
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 text-[11px] leading-none">
                          {agent.rank === 1 ? "🥇" : agent.rank === 2 ? "🥈" : "🥉"}
                        </span>
                      </div>
                      <span className="font-bold text-xs truncate text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <span className="font-mono font-black text-sm text-white">{agent.score}</span>
                      <span className="text-[10px] text-white/80 font-semibold">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top 3 Call Team Card */}
          <div 
            style={{ background: 'var(--brand-gradient)' }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C6B53] via-[#145a46] to-[#0c392c] border border-white/20 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black shadow-xs">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm tracking-wide text-white">Top 3 Call Team</h3>
                  <p className="text-[10px] text-white/80">Voice Operations</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-md">
                {selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase()} {selectedYear}
              </span>
            </div>

            <div className="space-y-2 relative z-10">
              {top3Call.length === 0 ? (
                <div className="py-4 text-center text-xs text-white/70 font-medium">No calculated scores for this period yet</div>
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
                      <div className="relative shrink-0">
                        {agent.photoUrl ? (
                          <img 
                            src={agent.photoUrl} 
                            alt={agent.name} 
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 shadow-xs" 
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                            agent.rank === 1 ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 font-black ring-1 ring-amber-300" :
                            agent.rank === 2 ? "bg-gradient-to-tr from-slate-200 to-gray-200 text-gray-900 font-bold" :
                            "bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-bold"
                          }`}>
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 text-[11px] leading-none">
                          {agent.rank === 1 ? "🥇" : agent.rank === 2 ? "🥈" : "🥉"}
                        </span>
                      </div>
                      <span className="font-bold text-xs truncate text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <span className="font-mono font-black text-sm text-white">{agent.score}</span>
                      <span className="text-[10px] text-white/80 font-semibold">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Controls Container: Redesigned cleanly into stable 2-row layout with ZERO horizontal jitter */}
        <div className={`p-3 sm:p-4 rounded-2xl border mb-5 transition shadow-xs ${
          isDarkMode ? "bg-gray-850/90 border-gray-800" : "bg-white border-gray-200/90"
        }`}>
          {/* Top Row: Search on far left, Team Pills, Year, and Sync Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
            
            {/* Far Left: Search Input */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pl-9 pr-3 py-1.5 rounded-xl border outline-none font-medium transition shadow-xs ${
                  isDarkMode 
                    ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#1C6B53]/20 focus:border-[#1C6B53]"
                }`}
              />
            </div>

            {/* Middle & Right: Team Switcher, Year Dropdown, and Sync Action */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              
              {/* Team Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                <button
                  onClick={() => setTeam("chat")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    team === "chat"
                      ? "bg-[#1C6B53] text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Chat Team ({chatRoster.length})</span>
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
                  <span>Call Team ({callRoster.length})</span>
                </button>
              </div>

              {/* Year Selector Dropdown - Modern Custom Dropdown */}
              <div className="shrink-0">
                <ModernDropdown
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(val)}
                  options={YEARS}
                  variant="solid-green"
                  size="sm"
                  ariaLabel="Select Year"
                />
              </div>

              {/* Sync Button: Pulls live data from TL Dashboard with validation */}
              <button
                onClick={() => fetchDashboardMetrics(true)}
                disabled={isSyncing}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  !currentCompleteness.isComplete
                    ? "bg-amber-600/90 hover:bg-amber-600 text-white"
                    : "bg-[#1C6B53] hover:bg-[#155340] text-white"
                }`}
                title={
                  !currentCompleteness.isComplete
                    ? `Cannot sync: Data incomplete (${currentCompleteness.completedAgents}/${currentCompleteness.totalAgents})`
                    : `Sync ${selectedMonth} Data from TL Dashboard`
                }
              >
                <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                <span>{isSyncing ? "Checking..." : !currentCompleteness.isComplete ? "Sync (Incomplete)" : "Sync Data"}</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Full-width smooth 12 Months row without horizontal jitter */}
          <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {MONTHS.map(m => {
                const displayLabel = m.charAt(0) + m.slice(1).toLowerCase();
                const isSel = selectedMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`py-1.5 rounded-xl text-xs font-bold text-center transition cursor-pointer ${
                      isSel
                        ? "bg-[#1C6B53] text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    }`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Modern Clean Table Matching Main Dashboard Pattern */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm overflow-hidden transition">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              
              {/* Header: Title Cased and NO % symbol as requested */}
              <thead>
                <tr className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-700/80 text-[11px] font-extrabold text-gray-600 dark:text-gray-300">
                  <th className="py-3.5 px-3 sm:px-4 text-center font-mono uppercase tracking-wider w-12">#</th>
                  <th className="py-3.5 px-3 sm:px-4 uppercase tracking-wider min-w-[170px]">Agent</th>
                  
                  {/* KPI Raw Metrics Columns (No % symbol, Title Cased) */}
                  {activeCols.map(col => (
                    <th key={col.key} className="py-3.5 px-3 text-center tracking-wider border-l border-gray-100 dark:border-gray-800 min-w-[70px]">
                      <div>{col.label}</div>
                      <div className="text-[9px] text-gray-400 font-medium normal-case">{col.target}</div>
                    </th>
                  ))}

                  {/* Calculated Points Columns */}
                  {activeCols.map(col => (
                    <th key={`pts_${col.key}`} className="py-3.5 px-3 text-center tracking-wider text-[#1C6B53] dark:text-emerald-400 border-l border-gray-100 dark:border-gray-800 min-w-[62px] bg-emerald-500/[0.03]">
                      <div>{col.ptsLabel}</div>
                      <div className="text-[9px] text-[#1C6B53]/70 dark:text-emerald-400/70 font-medium normal-case">{col.max} pts</div>
                    </th>
                  ))}

                  {/* Final Score Column */}
                  <th className="py-3.5 px-4 text-center tracking-wider text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-700 min-w-[130px] bg-emerald-500/[0.05]">
                    Final Score
                  </th>
                </tr>
              </thead>

              {/* Table Body (Strictly sorted descending by rank 1 -> 13) */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 bg-[#F9F8F4] dark:bg-gray-900">
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

                        {/* Raw Metric Values (Clean without % symbol) */}
                        {activeCols.map(col => {
                          const currentVal = row.vals[col.key];
                          const displayVal = currentVal !== null && currentVal !== undefined ? currentVal : "";

                          return (
                            <td key={col.key} className="py-2.5 px-3 text-center border-l border-gray-100 dark:border-gray-800 font-mono">
                              <span className={`text-xs font-semibold tabular-nums ${
                                displayVal ? "text-gray-800 dark:text-gray-200" : "text-gray-300 dark:text-gray-600"
                              }`}>
                                {displayVal ? (
                                  col.key === "aht" || col.key === "art" || col.key === "hold"
                                    ? formatDuration(displayVal)
                                    : displayVal
                                ) : "–"}
                              </span>
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

                        {/* Final Score with Clean Progress Bar & Trend Badge */}
                        <td className="py-2.5 px-4 text-right border-l border-gray-200 dark:border-gray-700 bg-emerald-500/[0.02]">
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex-1 max-w-[65px] h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
                            {prevMonthName && row.total !== null && prevMonthScores[row.name] != null && (
                              <TrendBadge
                                currentValue={row.total}
                                previousValue={prevMonthScores[row.name]}
                                prevMonthLabel={prevMonthName}
                                suffix=" pts"
                                className="scale-90 origin-right shrink-0"
                              />
                            )}
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
