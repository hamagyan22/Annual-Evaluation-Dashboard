"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { auth, db, getSystemAuthor } from "@/lib/firebaseClient";
import { collection, query, where, doc, setDoc, onSnapshot, getDocs, updateDoc, addDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { 
  Award, ArrowLeft, Search, Users, Check, Save, Download, 
  Sun, Moon, ChevronDown, ChevronLeft, ChevronRight, CheckCheck, RefreshCw, Calendar, Plus,
  LogOut, PhoneIncoming, PhoneOutgoing, Camera, X, Trash2, FileText, MessageSquare, ShieldCheck, UserPlus, ExternalLink, Link2,
  CheckCircle2, AlertCircle, Activity, Clock, Lock
} from "lucide-react";
import { compressImageFile } from "@/lib/imageUtils";

interface QualityDashboardProps {
  userProfile: any;
  onBack: () => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

interface EvaluatorSection {
  id: string;
  evaluator: string;
  team: string;
  colorBadge: string;
  headerBg: string;
  borderColor: string;
  accentColor: string;
}

const DEFAULT_SECTIONS: EvaluatorSection[] = [
  {
    id: "mohammed_jihad",
    evaluator: "Mohammed Jihad",
    team: "Younis Kamal Team",
    colorBadge: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
    headerBg: "from-sky-900/10 via-sky-800/5 to-transparent",
    borderColor: "border-sky-200/80 dark:border-sky-800/40",
    accentColor: "#0284c7"
  },
  {
    id: "lara_kamil",
    evaluator: "Lara Kamil",
    team: "Ankido Buya Team",
    colorBadge: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
    headerBg: "from-purple-900/10 via-purple-800/5 to-transparent",
    borderColor: "border-purple-200/80 dark:border-purple-800/40",
    accentColor: "#9333ea"
  },
  {
    id: "mohammed_dlshad",
    evaluator: "Mohammed Dlshad",
    team: "Mohammed Dlshad Team",
    colorBadge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    headerBg: "from-emerald-900/10 via-emerald-800/5 to-transparent",
    borderColor: "border-emerald-200/80 dark:border-emerald-800/40",
    accentColor: "#1C6B53"
  },
  {
    id: "mohammed_azad",
    evaluator: "Mohammed Azad",
    team: "All Call Teams (Morning & Evening)",
    colorBadge: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800/60",
    headerBg: "from-teal-900/10 via-teal-800/5 to-transparent",
    borderColor: "border-teal-200/80 dark:border-teal-800/40",
    accentColor: "#0d9488"
  }
];

const QUARTERS = [
  { id: "Q1", label: "Q1", subtitle: "Weeks 1 – 12", startWeek: 1 },
  { id: "Q2", label: "Q2", subtitle: "Weeks 13 – 24", startWeek: 13 },
  { id: "Q3", label: "Q3", subtitle: "Weeks 25 – 36", startWeek: 25 },
  { id: "Q4", label: "Q4", subtitle: "Weeks 37 – 48", startWeek: 37 },
];

const YEARS = ["2026", "2027", "2028", "2029", "2030"];

const CANONICAL_AGENT_NAMES: Record<string, string> = {
  "shahab ahmed": "Shahab Ahmed Muhammed",
  "shahab ahmed muhammed": "Shahab Ahmed Muhammed",
  "zhala sherzad": "Zhalla Sherzad",
  "zhalla sherzad": "Zhalla Sherzad",
  "marwa khaleel": "Marwa Khalil",
  "marwa khalil": "Marwa Khalil",
  "mohammed saman": "Mohammed Salem",
  "mohammed saleem": "Mohammed Salem",
  "mohammed salem": "Mohammed Salem",
  "hannen iskandar": "Haneen Abd-Al Kareem",
  "haneen abdulkarim": "Haneen Abd-Al Kareem",
  "haneen abd-al kareem": "Haneen Abd-Al Kareem",
  "kazhvan wirya": "Kazhvan Wirya",
  "kani sami": "Kani Sami",
  "azad muhammad": "Azad Muhammad",
  "dhuha khanjer": "Dhuha Khanjer",
  "sawen": "Sawen",
  "sawin sartib": "Sawen",
  "sawen sartib": "Sawen"
};

const REMOVED_QA_AGENTS = new Set([
  "sara khasrow",
  "mohammed omarble",
  "nariman abbas",
  "hala ahmed",
  "ali twana"
]);

function getCanonicalAgentName(name: string): string {
  const trimmed = (name || "").trim();
  const lower = trimmed.toLowerCase();
  return CANONICAL_AGENT_NAMES[lower] || trimmed;
}

function isValidAgentName(name: string): boolean {
  const lower = (name || "").toLowerCase().trim();
  if (!lower) return false;
  if (REMOVED_QA_AGENTS.has(lower)) return false;
  if (lower.includes("csr /") || lower.includes("csr/") || lower.startsWith("csr /") || lower.startsWith("csr/")) return false;
  return true;
}

// Helper to determine current year, quarter, and week dynamically
function getCurrentPeriod(): { year: string; quarter: string; week: number } {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = now.getMonth(); // 0 = Jan, 11 = Dec

  let quarter = "Q1";
  let quarterStartMonth = 0;

  if (month >= 9) {
    quarter = "Q4";
    quarterStartMonth = 9;
  } else if (month >= 6) {
    quarter = "Q3";
    quarterStartMonth = 6;
  } else if (month >= 3) {
    quarter = "Q2";
    quarterStartMonth = 3;
  } else {
    quarter = "Q1";
    quarterStartMonth = 0;
  }

  const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
  const diffTime = now.getTime() - quarterStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;
  const clampedWeek = Math.min(12, Math.max(1, weekNum));

  return {
    year,
    quarter,
    week: clampedWeek
  };
}

// Helper to determine if the new evaluation schema applies:
// 2026: Q4 (all weeks)
// 2027+: Q1, Q2, Q3, Q4 (all weeks from start of year)
function isNewEvalSchema(year: string | number, quarter: string): boolean {
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (isNaN(y)) return false;
  if (y > 2026) return true;
  if (y < 2026) return false;
  return quarter === "Q4";
}

// Helper to determine column config for any team, year, quarter, and week
function getWeekColumnsConfig(isChat: boolean, year: string, quarter: string, weekNum: number) {
  const isNew = isNewEvalSchema(year, quarter);
  if (isChat) {
    if (isNew) {
      // Starting 2026 Q4 (and 2027+ from start of year): 8 chats, no outbound
      return {
        colCount: 8,
        hasOutbound: false,
        colType: "chat" as const,
        callBase: 0,
      };
    }
    const has7 = quarter === "Q3" && weekNum >= 10 && parseInt(String(year), 10) === 2026;
    if (has7) {
      // 2026 Q3 W10-12: 7 chats, no outbound
      return {
        colCount: 7,
        hasOutbound: false,
        colType: "chat" as const,
        callBase: 0,
      };
    }
    // Earlier: 6 chats + 1 outbound
    return {
      colCount: 6,
      hasOutbound: true,
      colType: "chat" as const,
      callBase: 0,
    };
  } else {
    // Call Team: Main Shift
    // Starting 2026 Q4 (and 2027+ from start of year): 7 calls + 1 outbound
    // Earlier: 6 calls + 1 outbound
    const colCount = isNew ? 7 : 6;
    return {
      colCount,
      hasOutbound: true,
      colType: "call" as const,
      callBase: (weekNum - 1) * colCount,
    };
  }
}

// Backward-compatible helper to check if chat has 7 or more chats
function getHasChat7(isChat: boolean, year: string, quarter: string, weekNum: number): boolean {
  if (!isChat) return false;
  const cfg = getWeekColumnsConfig(true, year, quarter, weekNum);
  return cfg.colCount >= 7;
}

// Helper to compute average from scores in a week
function computeWeekAvg(
  scores: Record<string, string>,
  weekNum: number,
  isChat: boolean = false,
  year: string = "2026",
  quarter: string = "Q1",
  isCShift: boolean = false
): string {
  if (!scores) return "-";
  
  let keys: string[] = [];

  if (isCShift) {
    for (let i = 1; i <= 3; i++) {
      keys.push(`w${weekNum}_chat_${i}`);
    }
  } else {
    const config = getWeekColumnsConfig(isChat, year, quarter, weekNum);
    for (let i = 1; i <= config.colCount; i++) {
      if (isChat) {
        const possibleKeys = [
          `w${weekNum}_chat_${i}`,
          `w${weekNum}_call_${i}`
        ];
        const foundKey = possibleKeys.find(k => scores[k] !== undefined && scores[k] !== "") || `w${weekNum}_chat_${i}`;
        keys.push(foundKey);
      } else {
        keys.push(`w${weekNum}_call_${config.callBase + i}`);
      }
    }
    if (config.hasOutbound) {
      keys.push(`w${weekNum}_outbound`);
    }
  }

  const vals = keys.map(k => (scores[k] || "").trim().toUpperCase()).filter(v => v !== "");
  if (vals.length === 0) return "-";

  const isAllV = vals.every(v => v === "V");
  if (isAllV) return "V";

  const numericVals: number[] = [];
  for (const v of vals) {
    if (v === "V" || v === "N/A" || v === "NA") continue;
    const num = parseFloat(v);
    if (!isNaN(num)) {
      numericVals.push(num);
    }
  }

  if (numericVals.length === 0) return "-";

  const sum = numericVals.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / numericVals.length;
  return avg.toFixed(2);
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
  if (lower === 'password123' || lower === 'password123!' || lower === 'password' || lower === '12345678') {
    return { isValid: false, error: "This password is too common or matches the initial default password. Please choose a unique password." };
  }
  return { isValid: true, error: "" };
}

export default function QualityDashboard({
  userProfile,
  onBack,
  onLogout,
  onOpenProfile,
  isDarkMode = false,
  toggleDarkMode
}: QualityDashboardProps) {
  const isQaUser = userProfile?.role === "qa";
  const isAdmin = userProfile?.role === "admin" || userProfile?.email?.toLowerCase() === "mohammed.dlshad0@gmail.com";
  const isManager = isAdmin || userProfile?.role === "manager" || userProfile?.email?.toLowerCase() === "jalal.burghol@agent.com";
  
  const canSwitchTeams = isAdmin || isManager;

  const initialPeriod = useMemo(() => getCurrentPeriod(), []);
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_selected_year");
      if (saved && YEARS.includes(saved)) return saved;
    }
    return initialPeriod.year;
  });
  const [selectedQuarter, setSelectedQuarter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_selected_quarter");
      if (saved && ["Q1", "Q2", "Q3", "Q4"].includes(saved)) return saved;
    }
    return initialPeriod.quarter;
  });
  
  // Top Card Summary Period: affects the top card when no specific month is selected
  const [cardPeriodMode, setCardPeriodMode] = useState<"quarter" | "h1" | "h2" | "year">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_card_period_mode") as any;
      if (saved && ["quarter", "h1", "h2", "year"].includes(saved)) return saved;
    }
    return "quarter";
  });
  // Unified month filter: controls both top card and agents table (null = all months / standard view, 0-11 = Jan-Dec)
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_selected_month_filter");
      if (saved !== null && saved !== "null" && saved !== "") {
        const num = Number(saved);
        if (!isNaN(num) && num >= 0 && num <= 11) return num;
      }
    }
    return null;
  });
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMonthMenu = () => {
    setIsMonthMenuOpen(prev => !prev);
  };

  useEffect(() => {
    if (!isMonthMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target as Node) &&
        monthButtonRef.current &&
        !monthButtonRef.current.contains(e.target as Node)
      ) {
        setIsMonthMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMonthMenuOpen]);

  // Force Password Change for first login or after password reset
  const [forcePasswordChange, setForcePasswordChange] = useState<boolean>(
    userProfile?.passwordUpdated !== true || userProfile?.mustChangePassword === true
  );
  const [forceNewPassword, setForceNewPassword] = useState("");
  const [forceConfirmPassword, setForceConfirmPassword] = useState("");
  const [forcePasswordError, setForcePasswordError] = useState("");
  const [forcePasswordLoading, setForcePasswordLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.passwordUpdated !== true || userProfile.mustChangePassword === true) {
        setForcePasswordChange(true);
      }
    }
  }, [userProfile]);

  const defaultSectionId = useMemo(() => {
    const email = (userProfile?.email || "").toLowerCase();
    const name = (userProfile?.name || userProfile?.evaluator || "").toLowerCase();
    if (email.includes("azad") || name.includes("azad") || userProfile?.role === "trainer") {
      return "mohammed_azad";
    }
    if (email.includes("dlshad") || name.includes("dlshad")) {
      return "mohammed_dlshad";
    }
    if (email.includes("lara") || name.includes("lara")) {
      return "lara_kamil";
    }
    return "mohammed_jihad";
  }, [userProfile]);

  const [activeSectionId, setActiveSectionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_active_section_id");
      if (saved && DEFAULT_SECTIONS.some(s => s.id === saved)) return saved;
    }
    return defaultSectionId;
  });
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_selected_week");
      if (saved && !isNaN(Number(saved))) {
        const num = Number(saved);
        if (num >= 1 && num <= 12) return num;
      }
    }
    return initialPeriod.week;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Trainer (Mohammed Azad) specific state: No weeks, open evaluation count per month/quarter
  const [trainerMonth, setTrainerMonth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_trainer_month");
      if (saved && !isNaN(Number(saved))) {
        const num = Number(saved);
        if (num >= 0 && num <= 11) return num;
      }
    }
    return new Date().getMonth();
  });
  const [trainerColCount, setTrainerColCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_trainer_col_count");
      if (saved && !isNaN(Number(saved))) {
        const num = Number(saved);
        if (num >= 1) return num;
      }
    }
    return 5;
  });
  const [bonusColCount, setBonusColCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_bonus_col_count");
      if (saved && !isNaN(Number(saved))) {
        const num = Number(saved);
        if (num >= 1) return num;
      }
    }
    return 6;
  });
  const [callMonColCount, setCallMonColCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_call_mon_col_count");
      if (saved && !isNaN(Number(saved))) {
        const num = Number(saved);
        if (num >= 1) return num;
      }
    }
    return 12;
  });

  // Table horizontal scroll container ref & scroll helper
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const handleScrollTable = (direction: "left" | "right") => {
    if (!tableContainerRef.current) return;
    const scrollAmount = 360;
    tableContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(userProfile?.name || "");
  const [profilePhoto, setProfilePhoto] = useState(userProfile?.photo_url || "");
  const [newProfilePassword, setNewProfilePassword] = useState("");
  const [confirmProfilePassword, setConfirmProfilePassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Metric Sync State
  const [syncingMetrics, setSyncingMetrics] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cell Note Modal State (Matching exact visual in user image 1)
  const [activeNoteModal, setActiveNoteModal] = useState<{
    csrName: string;
    key: string;
    callLabel: string;
    score: string;
    noteText: string;
    linkUrl: string;
  } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  // Raw data from Firestore
  const [evalData, setEvalData] = useState<Record<string, any>>({});
  const [rosterMembers, setRosterMembers] = useState<any[]>([]);
  const [memberPhotos, setMemberPhotos] = useState<Record<string, string>>({});

  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const effectiveSectionId = canSwitchTeams ? activeSectionId : defaultSectionId;
  const currentSection = useMemo(() => {
    return DEFAULT_SECTIONS.find(s => s.id === effectiveSectionId) || DEFAULT_SECTIONS[0];
  }, [effectiveSectionId]);

  const isTrainer = useMemo(() => {
    return currentSection.id === "mohammed_azad" || 
      currentSection.evaluator.toLowerCase().includes("azad");
  }, [currentSection]);

  const isChatTeam = useMemo(() => {
    return currentSection.id === "mohammed_dlshad" || 
      currentSection.team.toLowerCase().includes("dlshad") || 
      currentSection.evaluator.toLowerCase().includes("dlshad");
  }, [currentSection]);

  // Mohammed Dlshad Shift State: "main" (Chat Shift), "c_shift" (Evening Call Team, 3 Chats), or "bonus" (Bonus Chats)
  const [dlshadShift, setDlshadShift] = useState<"main" | "c_shift" | "bonus">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_dlshad_shift");
      if (saved === "c_shift" || saved === "main" || saved === "bonus") return saved;
    }
    return "main";
  });
  const [cShiftRoster, setCShiftRoster] = useState<string[]>([]);
  const [cShiftWeeklyAdded, setCShiftWeeklyAdded] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_c_shift_weekly_added");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {}
      }
    }
    return {};
  });
  const [showAddCShiftModal, setShowAddCShiftModal] = useState(false);
  const [cShiftSearchTerm, setCShiftSearchTerm] = useState("");

  const isCShift = useMemo(() => {
    return isChatTeam && dlshadShift === "c_shift";
  }, [isChatTeam, dlshadShift]);

  // Lara Kamil & Mohammed Jihad Shift State: "main" (Main Team Shift) or "bonus" (Younis + Ankido Teams)
  const isCallEvaluator = useMemo(() => {
    return currentSection.id === "lara_kamil" || currentSection.id === "mohammed_jihad";
  }, [currentSection]);

  const [callShift, setCallShift] = useState<"main" | "bonus">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_call_shift");
      if (saved === "main" || saved === "bonus") return saved;
    }
    return "main";
  });

  const isBonus = useMemo(() => {
    return (isCallEvaluator && callShift === "bonus") || (isChatTeam && dlshadShift === "bonus");
  }, [isCallEvaluator, callShift, isChatTeam, dlshadShift]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_call_shift", callShift);
    }
  }, [callShift]);

  // Load and listen to C Shift roster and weekly added from Firestore and localStorage
  useEffect(() => {
    const savedLocal = localStorage.getItem("c_shift_roster");
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (Array.isArray(parsed)) setCShiftRoster(parsed);
      } catch (e) {}
    }

    const unsubCShift = onSnapshot(doc(db, "quality_evaluations", "config_c_shift_roster"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.agents)) {
          setCShiftRoster(data.agents);
          localStorage.setItem("c_shift_roster", JSON.stringify(data.agents));
        }
      }
    }, (err) => {
      console.error("Error listening to c_shift_roster:", err);
    });

    const unsubWeekly = onSnapshot(doc(db, "quality_evaluations", "config_c_shift_weekly"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.weekly === "object") {
          setCShiftWeeklyAdded(prev => ({ ...prev, ...(data.weekly || {}) }));
          if (typeof window !== "undefined") {
            localStorage.setItem("qa_c_shift_weekly_added", JSON.stringify(data.weekly || {}));
          }
        }
      }
    }, (err) => {
      console.error("Error listening to config_c_shift_weekly:", err);
    });

    return () => {
      unsubCShift();
      unsubWeekly();
    };
  }, []);

  const eveningCallTeamMembers = useMemo(() => {
    return rosterMembers
      .filter(m => {
        const t = (m.team || "").trim();
        return t === "Younis Kamal Team" || t.toLowerCase().includes("younis");
      })
      .map(m => (m.agent_name || m.name || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [rosterMembers]);

  const handleAddCShiftAgent = async (agentName: string) => {
    if (!agentName) return;
    const weekKey = `${selectedYear}_${selectedQuarter}_w${selectedWeek}`;
    const currentList = cShiftWeeklyAdded[weekKey] || [];
    if (!currentList.includes(agentName)) {
      const nextList = [...currentList, agentName].sort((a, b) => a.localeCompare(b));
      const updated = { ...cShiftWeeklyAdded, [weekKey]: nextList };
      setCShiftWeeklyAdded(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("qa_c_shift_weekly_added", JSON.stringify(updated));
      }
      try {
        await setDoc(doc(db, "quality_evaluations", "config_c_shift_weekly"), {
          weekly: updated,
          updated_at: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error("Error saving C shift weekly agent:", e);
      }
    }
  };

  const handleRemoveCShiftAgent = async (agentName: string) => {
    const weekKey = `${selectedYear}_${selectedQuarter}_w${selectedWeek}`;
    const currentList = cShiftWeeklyAdded[weekKey] || [];
    const nextList = currentList.filter(a => a !== agentName);
    const updated = { ...cShiftWeeklyAdded, [weekKey]: nextList };
    setCShiftWeeklyAdded(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_c_shift_weekly_added", JSON.stringify(updated));
    }

    // Clear scores for this week in evalData & Firestore
    const slug = agentName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const docId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${slug}`;
    const updatedScores = { ...((evalData[docId]?.scores) || {}) };
    delete updatedScores[`w${selectedWeek}_chat_1`];
    delete updatedScores[`w${selectedWeek}_chat_2`];
    delete updatedScores[`w${selectedWeek}_chat_3`];

    setEvalData(prev => {
      if (!prev[docId]) return prev;
      return {
        ...prev,
        [docId]: {
          ...prev[docId],
          scores: updatedScores,
          updated_at: new Date().toISOString()
        }
      };
    });

    try {
      await setDoc(doc(db, "quality_evaluations", "config_c_shift_weekly"), {
        weekly: updated,
        updated_at: new Date().toISOString()
      }, { merge: true });

      await setDoc(doc(db, "quality_evaluations", docId), {
        scores: updatedScores,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error removing C shift agent:", e);
    }
  };

  // Mohammed Azad Shift State: "training" (standard trainer view) or "call_mon" (Call Monitoring view)
  const [azadShift, setAzadShift] = useState<"training" | "call_mon">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qa_azad_shift");
      if (saved === "call_mon" || saved === "training") return saved;
    }
    return "training";
  });
  const [callMonRoster, setCallMonRoster] = useState<string[]>([]);
  const [showAddCallMonModal, setShowAddCallMonModal] = useState(false);
  const [callMonSearchTerm, setCallMonSearchTerm] = useState("");

  const isCallMon = useMemo(() => {
    return isTrainer && azadShift === "call_mon";
  }, [isTrainer, azadShift]);

  // Load and listen to Call Monitoring roster from Firestore and localStorage
  useEffect(() => {
    const savedLocal = localStorage.getItem("call_mon_roster");
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (Array.isArray(parsed)) setCallMonRoster(parsed);
      } catch (e) {}
    }

    const unsubCallMon = onSnapshot(doc(db, "quality_evaluations", "config_call_mon_roster"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.agents)) {
          setCallMonRoster(data.agents);
          localStorage.setItem("call_mon_roster", JSON.stringify(data.agents));
        }
      }
    }, (err) => {
      console.error("Error listening to call_mon_roster:", err);
    });

    return () => unsubCallMon();
  }, []);

  // All agents from both Younis Kamal Team AND Ankido Buya Team (for Call Mon modal)
  const allCallTeamMembers = useMemo(() => {
    return rosterMembers
      .filter(m => {
        const t = (m.team || "").trim();
        return (
          t === "Younis Kamal Team" || t.toLowerCase().includes("younis") ||
          t === "Ankido Buya Team" || t.toLowerCase().includes("ankido")
        );
      })
      .map(m => ({ name: (m.agent_name || m.name || "").trim(), team: (m.team || "").trim() }))
      .filter(m => Boolean(m.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rosterMembers]);

  const handleAddCallMonAgent = async (agentName: string) => {
    if (!agentName || callMonRoster.includes(agentName)) return;
    const nextList = [...callMonRoster, agentName].sort((a, b) => a.localeCompare(b));
    setCallMonRoster(nextList);
    localStorage.setItem("call_mon_roster", JSON.stringify(nextList));
    try {
      await setDoc(doc(db, "quality_evaluations", "config_call_mon_roster"), {
        year: selectedYear,
        agents: nextList,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving call_mon roster:", e);
    }
  };

  const handleRemoveCallMonAgent = async (agentName: string) => {
    const nextList = callMonRoster.filter(a => a !== agentName);
    setCallMonRoster(nextList);
    localStorage.setItem("call_mon_roster", JSON.stringify(nextList));
    try {
      await setDoc(doc(db, "quality_evaluations", "config_call_mon_roster"), {
        year: selectedYear,
        agents: nextList,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving call_mon roster:", e);
    }
  };

  // Synchronize QA dashboard state to localStorage for persistence across browser refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_selected_year", selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_selected_quarter", selectedQuarter);
    }
  }, [selectedQuarter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_selected_week", String(selectedWeek));
    }
  }, [selectedWeek]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_selected_month_filter", selectedMonthFilter !== null ? String(selectedMonthFilter) : "null");
    }
  }, [selectedMonthFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_active_section_id", activeSectionId);
    }
  }, [activeSectionId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_trainer_month", String(trainerMonth));
    }
  }, [trainerMonth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_trainer_col_count", String(trainerColCount));
    }
  }, [trainerColCount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_bonus_col_count", String(bonusColCount));
    }
  }, [bonusColCount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_dlshad_shift", dlshadShift);
    }
  }, [dlshadShift]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_azad_shift", azadShift);
    }
  }, [azadShift]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_call_mon_col_count", String(callMonColCount));
    }
  }, [callMonColCount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa_card_period_mode", cardPeriodMode);
    }
  }, [cardPeriodMode]);

  const hasChat7 = useMemo(() => {
    return getHasChat7(isChatTeam, selectedYear, selectedQuarter, selectedWeek);
  }, [isChatTeam, selectedYear, selectedQuarter, selectedWeek]);

  // The 3 month indices for the currently selected quarter
  const quarterMonthIndices = useMemo(() => {
    const qIdx = QUARTERS.findIndex(q => q.id === selectedQuarter);
    const base = (qIdx >= 0 ? qIdx : 0) * 3;
    return [base, base + 1, base + 2];
  }, [selectedQuarter]);

  // 1. Live real-time listener for team_members & users to sync roster & profile photos
  useEffect(() => {
    const unsubTeam = onSnapshot(collection(db, "team_members"), (snap) => {
      const members: any[] = [];
      const photos: Record<string, string> = {};
      snap.forEach(d => {
        const data = d.data();
        members.push({ id: d.id, ...data });
        const name = (data.agent_name || data.name || "").trim().toLowerCase();
        if (name && data.photo_url) {
          photos[name] = data.photo_url;
        }
      });
      setRosterMembers(members);
      setMemberPhotos(prev => ({ ...prev, ...photos }));
    }, (err) => {
      console.error("Failed to fetch team members for QA:", err);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const photos: Record<string, string> = {};
      snap.forEach(d => {
        const data = d.data();
        const name = (data.name || data.display_name || data.agent_name || "").trim().toLowerCase();
        if (name && data.photo_url) {
          photos[name] = data.photo_url;
        }
      });
      setMemberPhotos(prev => ({ ...prev, ...photos }));
    }, (err) => {
      console.error("Failed to fetch users photos for QA:", err);
    });

    return () => {
      unsubTeam();
      unsubUsers();
    };
  }, []);

  // 2. Real-time listener for quality evaluations in selected year
  useEffect(() => {
    setLoading(true);
    const numYear = Number(selectedYear);
    const yearList = !isNaN(numYear) ? [selectedYear, numYear] : [selectedYear];
    const q = query(
      collection(db, "quality_evaluations"),
      where("year", "in", yearList)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataMap: Record<string, any> = {};
      snapshot.forEach(d => {
        dataMap[d.id] = { id: d.id, ...d.data() };
      });
      setEvalData(dataMap);
      setLoading(false);
    }, (err) => {
      console.error("Firestore QA snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedYear]);

  // 3. Real-time listener for monthly sync status registry (config_sync_status)
  const [syncedMonthsRegistry, setSyncedMonthsRegistry] = useState<
    Record<string, { synced_at: string; latest_score_ts?: string; synced_by?: string; count?: number }>
  >({});
  const [syncReminderModal, setSyncReminderModal] = useState<{
    monthIdx: number;
    monthName: string;
    upperMonth: string;
    quarter: string;
    syncKey: string;
    agentScores: Record<string, string>;
    latestScoreTs: string;
  } | null>(null);
  const unsyncedPreviousMonthRef = useRef<{
    monthIdx: number;
    monthName: string;
    upperMonth: string;
    quarter: string;
    syncKey: string;
    agentScores: Record<string, string>;
    latestScoreTs: string;
  } | null>(null);

  useEffect(() => {
    const unsubSyncStatus = onSnapshot(
      doc(db, "quality_evaluations", "config_sync_status"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.synced_months && typeof data.synced_months === "object") {
            setSyncedMonthsRegistry(data.synced_months);
          }
        }
      },
      (err) => {
        console.error("Error listening to config_sync_status:", err);
      }
    );
    return () => unsubSyncStatus();
  }, []);

  // Helper to determine the exact active section slug in Firestore
  const getActiveSectionSlug = useCallback((evaluatorName?: string) => {
    if (isCallMon) return "mohammed_azad_call_mon";
    if (isCShift) return "mohammed_dlshad_c_shift";
    const name = evaluatorName || currentSection.evaluator;
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (isBonus) return `${base}_bonus`;
    return base;
  }, [isCallMon, isCShift, isBonus, currentSection.evaluator]);

  // Handle score change with debounced save
  const handleScoreChange = useCallback((
    section: EvaluatorSection,
    csrName: string,
    key: string,
    rawVal: string
  ) => {
    // Block data entry in a new month if a completed previous month (from SEP 2026 onwards) has not been synced yet
    if (!isTrainer && !isCallMon && !isBonus && !isCShift && unsyncedPreviousMonthRef.current) {
      setSyncReminderModal(unsyncedPreviousMonthRef.current);
      return;
    }

    const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sectionSlug = getActiveSectionSlug(section.evaluator);
    const isTrainerSection = section.id === "mohammed_azad" || section.evaluator.toLowerCase().includes("azad");
    const effectiveQuarter = isTrainerSection ? `Q${Math.floor(trainerMonth / 3) + 1}` : selectedQuarter;
    const docId = `${selectedYear}_${effectiveQuarter}_${sectionSlug}_${slug}`;

    let val = rawVal.trim();
    if (val.toUpperCase() === "V") val = "V";
    if (val.toUpperCase() === "N/A" || val.toUpperCase() === "NA") val = "N/A";

    const isBonusActive = ((section.evaluator.toLowerCase().includes("lara") || section.evaluator.toLowerCase().includes("jihad")) && callShift === "bonus") ||
      (section.evaluator.toLowerCase().includes("dlshad") && dlshadShift === "bonus");
    let altKey: string | null = null;
    if (isBonusActive && key.match(/(?:call|chat)_(\d+)/)) {
      const cNum = parseInt(key.match(/(?:call|chat)_(\d+)/)![1], 10);
      const isChatBonus = section.evaluator.toLowerCase().includes("dlshad");
      const prefixKey = isChatBonus ? "chat" : "call";
      altKey = key.startsWith(`${prefixKey}_`)
        ? `w${Math.floor((cNum - 1) / 6) + 1}_${prefixKey}_${cNum}`
        : `${prefixKey}_${cNum}`;
    }

    const nowIso = new Date().toISOString();
    const existingDoc = evalData[docId] || {
      year: selectedYear,
      quarter: effectiveQuarter,
      evaluator: section.evaluator,
      team: section.team,
      csr_name: csrName,
      scores: {},
      notes: {},
      cell_timestamps: {}
    };
    const nextScores = {
      ...(existingDoc.scores || {}),
      [key]: val,
      ...(altKey ? { [altKey]: val } : {})
    };
    const nextTimestamps = {
      ...(existingDoc.cell_timestamps || {})
    };
    if (val && val !== "-") {
      nextTimestamps[key] = nowIso;
      if (altKey) nextTimestamps[altKey] = nowIso;
    } else {
      delete nextTimestamps[key];
      if (altKey) delete nextTimestamps[altKey];
    }

    setEvalData(prev => {
      const currentDoc = prev[docId] || existingDoc;
      const mergedTimestamps = {
        ...(currentDoc.cell_timestamps || {})
      };
      if (val && val !== "-") {
        mergedTimestamps[key] = nowIso;
        if (altKey) mergedTimestamps[altKey] = nowIso;
      } else {
        delete mergedTimestamps[key];
        if (altKey) delete mergedTimestamps[altKey];
      }
      return {
        ...prev,
        [docId]: {
          ...currentDoc,
          scores: {
            ...(currentDoc.scores || {}),
            [key]: val,
            ...(altKey ? { [altKey]: val } : {})
          },
          cell_timestamps: mergedTimestamps,
          updated_at: nowIso
        }
      };
    });

    setSaveStatus("saving");
    if (saveTimeoutRef.current[docId]) {
      clearTimeout(saveTimeoutRef.current[docId]);
    }

    saveTimeoutRef.current[docId] = setTimeout(async () => {
      try {
        await setDoc(doc(db, "quality_evaluations", docId), {
          year: selectedYear,
          quarter: effectiveQuarter,
          evaluator: section.evaluator,
          team: section.team,
          csr_name: csrName,
          scores: nextScores,
          cell_timestamps: nextTimestamps,
          _arch: getSystemAuthor(),
          updated_at: nowIso
        }, { merge: true });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (e) {
        console.error("Error saving score:", e);
        setSaveStatus("idle");
      }
    }, 450);
  }, [selectedYear, selectedQuarter, trainerMonth, evalData, isCShift, isCallMon, isBonus, getActiveSectionSlug, callShift, dlshadShift]);

  // Section CSRs strictly pulled and deduplicated from live team_members
  const sectionCSRs = useMemo(() => {
    const result: Record<string, string[]> = {};

    DEFAULT_SECTIONS.forEach(sec => {
      let teamAgents: string[] = [];
      if (sec.id === "mohammed_azad") {
        teamAgents = rosterMembers
          .filter(m => m.team === "Younis Kamal Team" || m.team === "Ankido Buya Team")
          .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
          .filter(isValidAgentName);
      } else {
        teamAgents = rosterMembers
          .filter(m => m.team === sec.team)
          .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
          .filter(isValidAgentName);
      }

      // Also include any agents who have evalData for this section in current year/quarter
      const secSlug = sec.id;
      const prefix = `${selectedYear}_${selectedQuarter}_${secSlug}_`;
      Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
        // Exclude sub-shifts (c_shift, bonus, call_mon)
        if (docId.includes("_c_shift_") || docId.includes("_bonus_") || docId.includes("_call_mon_")) {
          return;
        }
        if (docId.startsWith(prefix) && docData?.csr_name) {
          const cName = getCanonicalAgentName(docData.csr_name.trim());
          if (isValidAgentName(cName)) {
            // Strictly exclude any agent belonging to another team in rosterMembers (unless sec is mohammed_azad)
            const isFromOtherTeam = sec.id !== "mohammed_azad" && rosterMembers.some(m => {
              const mName = getCanonicalAgentName((m.agent_name || m.name || "").trim()).toLowerCase();
              return mName === cName.toLowerCase() && m.team && m.team !== sec.team;
            });
            if (!isFromOtherTeam) {
              teamAgents.push(cName);
            }
          }
        }
      });

      const nameMap = new Map<string, string>();
      teamAgents.forEach(n => {
        const k = n.toLowerCase();
        if (!nameMap.has(k)) nameMap.set(k, n);
      });
      result[sec.id] = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));
    });

    return result;
  }, [rosterMembers, evalData, selectedYear, selectedQuarter]);

  // Month names for dropdown
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Activity Log Modal State & Computations (Admin & Manager only)
  const toLocalDateStr = useCallback((isoStr: string): string => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr.slice(0, 10);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [activityNowTick, setActivityNowTick] = useState<number>(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityNowTick(Date.now());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const todayLocalStr = useMemo(() => toLocalDateStr(new Date(activityNowTick).toISOString()), [toLocalDateStr, activityNowTick]);
  const yesterdayLocalStr = useMemo(() => {
    const d = new Date(activityNowTick);
    d.setDate(d.getDate() - 1);
    return toLocalDateStr(d.toISOString());
  }, [toLocalDateStr, activityNowTick]);
  const sevenDaysAgoLocalStr = useMemo(() => {
    const d = new Date(activityNowTick);
    d.setDate(d.getDate() - 6);
    return toLocalDateStr(d.toISOString());
  }, [toLocalDateStr, activityNowTick]);

  const [showActivityLogModal, setShowActivityLogModal] = useState(false);
  const [activityFilterMode, setActivityFilterMode] = useState<"today" | "yesterday" | "7days" | "custom">("today");
  const [activityCustomDate, setActivityCustomDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [highlightedCellTarget, setHighlightedCellTarget] = useState<{ agentLower: string; cellKey: string } | null>(null);

  const stepActivityDate = (deltaDays: number) => {
    const baseStr = activityFilterMode === "custom" ? activityCustomDate : activityFilterMode === "yesterday" ? yesterdayLocalStr : todayLocalStr;
    const parts = baseStr.split("-").map(Number);
    if (parts.length !== 3) return;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + deltaDays);
    const nextStr = toLocalDateStr(d.toISOString());
    setActivityCustomDate(nextStr);
    if (nextStr === todayLocalStr) setActivityFilterMode("today");
    else if (nextStr === yesterdayLocalStr) setActivityFilterMode("yesterday");
    else setActivityFilterMode("custom");
  };

  // Navigate directly from an Activity Log chip to the exact cell on the Quality Dashboard
  const handleJumpToActivityItem = useCallback((item: {
    agentName: string;
    shiftBadge: string;
    quarter: string;
    canonicalKey: string;
  }) => {
    // 1. Ensure Quarter matches
    if (item.quarter && item.quarter !== selectedQuarter) {
      setSelectedQuarter(item.quarter);
    }

    // 2. Clear search filter so the agent row is visible
    setSearchTerm("");

    // 3. Switch Shift / Mode Tab to match item.shiftBadge
    if (isTrainer) {
      setAzadShift(item.shiftBadge === "Call Mon" ? "call_mon" : "training");
    } else if (isChatTeam) {
      if (item.shiftBadge === "C Shift") setDlshadShift("c_shift");
      else if (item.shiftBadge === "Bonus") setDlshadShift("bonus");
      else setDlshadShift("main");
    } else if (isCallEvaluator) {
      setCallShift(item.shiftBadge === "Bonus" ? "bonus" : "main");
    }

    // 4. Switch Week or Month and resolve exact cell key
    let targetCellKey = item.canonicalKey;
    const weekMatch = item.canonicalKey.match(/^w(\d+)_/);
    const monthMatch = item.canonicalKey.match(/^m(\d+)_eval_(\d+)$/);
    const bonusMatch = item.canonicalKey.match(/^bonus_(\d+)$/);

    if (weekMatch) {
      const targetWeek = parseInt(weekMatch[1], 10);
      if (!isNaN(targetWeek) && targetWeek >= 1 && targetWeek <= 12) {
        setSelectedWeek(targetWeek);
        setSelectedMonthFilter(null);
      }
    } else if (monthMatch) {
      const targetMonth = parseInt(monthMatch[1], 10);
      const evalNum = parseInt(monthMatch[2], 10);
      if (!isNaN(targetMonth) && targetMonth >= 0 && targetMonth <= 11) {
        setTrainerMonth(targetMonth);
      }
      if (!isNaN(evalNum)) {
        if (item.shiftBadge === "Call Mon" && evalNum > callMonColCount) {
          setCallMonColCount(evalNum);
        } else if (item.shiftBadge !== "Call Mon" && evalNum > trainerColCount) {
          setTrainerColCount(evalNum);
        }
      }
    } else if (bonusMatch) {
      const cNum = parseInt(bonusMatch[1], 10);
      targetCellKey = isChatTeam ? `chat_${cNum}` : `call_${cNum}`;
      if (!isNaN(cNum) && cNum > bonusColCount) {
        setBonusColCount(cNum);
      }
    }

    // 5. Close Activity Log Modal & highlight + scroll to target cell
    setShowActivityLogModal(false);
    const agentLower = item.agentName.trim().toLowerCase();
    setHighlightedCellTarget({ agentLower, cellKey: targetCellKey });

    setTimeout(() => {
      const cellEl = document.querySelector(
        `[data-qa-target="${CSS.escape(`${agentLower}|${targetCellKey}`)}"]`
      ) as HTMLInputElement | null;
      const rowEl = document.querySelector(
        `[data-qa-row="${CSS.escape(agentLower)}"]`
      ) as HTMLElement | null;

      if (cellEl) {
        cellEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        cellEl.focus();
      } else if (rowEl) {
        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 140);

    setTimeout(() => {
      setHighlightedCellTarget((prev) =>
        prev && prev.agentLower === agentLower && prev.cellKey === targetCellKey ? null : prev
      );
    }, 3500);
  }, [
    selectedQuarter,
    isTrainer,
    isChatTeam,
    isCallEvaluator,
    callMonColCount,
    trainerColCount,
    bonusColCount,
  ]);

  // Gather all timestamped evaluation entries for the currently selected Quality Evaluator above
  const sectionActivityData = useMemo(() => {
    const seenMap = new Map<string, {
      id: string;
      agentName: string;
      shiftBadge: string;
      quarter: string;
      canonicalKey: string;
      label: string;
      score: string;
      hasNote: boolean;
      noteText: string;
      timestamp: string;
      dateStr: string;
      timeStr: string;
    }>();

    const evalLower = currentSection.evaluator.toLowerCase();
    const isChatEval = currentSection.id === "mohammed_dlshad" || evalLower.includes("dlshad");

    Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
      if (!docData || docId.startsWith("config_")) return;
      const docEv = (docData.evaluator || "").toLowerCase();
      const matchesEvaluator = docEv === evalLower || docId.includes(`_${currentSection.id}_`);
      if (!matchesEvaluator) return;

      const agentName = getCanonicalAgentName((docData.csr_name || "").trim());
      if (!isValidAgentName(agentName)) return;

      let shiftBadge = "Main Shift";
      if (docId.includes("_bonus_")) shiftBadge = "Bonus";
      else if (docId.includes("_c_shift_")) shiftBadge = "C Shift";
      else if (docId.includes("_call_mon_")) shiftBadge = "Call Mon";
      else if (currentSection.id === "mohammed_azad") shiftBadge = "Training";

      const scores = docData.scores || {};
      const notes = docData.notes || {};
      const links = docData.links || {};
      const timestamps = docData.cell_timestamps || {};
      const quarter = docData.quarter || selectedQuarter;

      Object.entries(timestamps).forEach(([rawKey, tsVal]) => {
        const tsIso = String(tsVal || "");
        if (!tsIso) return;

        const scoreVal = String(scores[rawKey] ?? "").trim();
        const noteVal = String(notes[rawKey] ?? "").trim();
        const linkVal = String(links[rawKey] ?? "").trim();
        if ((!scoreVal || scoreVal === "-") && !noteVal && !linkVal) return;

        let canonicalKey = rawKey;
        let label = rawKey;

        if (shiftBadge === "Bonus") {
          const m = rawKey.match(/(?:call|chat)_(\d+)/);
          if (m) {
            canonicalKey = `bonus_${m[1]}`;
            label = `Bonus ${isChatEval ? "Chat" : "Call"} #${m[1]}`;
          }
        } else if (rawKey.match(/^m(\d+)_eval_(\d+)$/)) {
          const m = rawKey.match(/^m(\d+)_eval_(\d+)$/)!;
          const mIdx = parseInt(m[1], 10);
          const eNum = m[2];
          label = `${MONTH_NAMES[mIdx] || `M${mIdx + 1}`} • Eval ${eNum}`;
        } else if (rawKey.match(/^w(\d+)_outbound$/)) {
          const m = rawKey.match(/^w(\d+)_outbound$/)!;
          label = `W${m[1]} • Outbound`;
        } else if (rawKey.match(/^w(\d+)_(call|chat)_(\d+)$/)) {
          const m = rawKey.match(/^w(\d+)_(call|chat)_(\d+)$/)!;
          label = `W${m[1]} • ${m[2] === "chat" ? "Chat" : "Call"} ${m[3]}`;
        }

        const dateStr = toLocalDateStr(tsIso);
        const dObj = new Date(tsIso);
        const timeStr = !isNaN(dObj.getTime())
          ? dObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "";

        const dedupId = `${shiftBadge}|${agentName.toLowerCase()}|${quarter}|${canonicalKey}`;
        const existing = seenMap.get(dedupId);
        if (!existing || tsIso > existing.timestamp) {
          seenMap.set(dedupId, {
            id: dedupId,
            agentName,
            shiftBadge,
            quarter,
            canonicalKey,
            label,
            score: scoreVal || "-",
            hasNote: Boolean(noteVal || linkVal),
            noteText: noteVal,
            timestamp: tsIso,
            dateStr,
            timeStr
          });
        }
      });
    });

    const allEntries = Array.from(seenMap.values()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const todayCount = allEntries.filter(e => e.dateStr === todayLocalStr).length;
    const yesterdayCount = allEntries.filter(e => e.dateStr === yesterdayLocalStr).length;
    const last7DaysCount = allEntries.filter(e => e.dateStr >= sevenDaysAgoLocalStr && e.dateStr <= todayLocalStr).length;
    const activeDateLabel =
      activityFilterMode === "today"
        ? "Today"
        : activityFilterMode === "yesterday"
        ? "Yesterday"
        : activityFilterMode === "7days"
        ? "Last 7 Days"
        : activityCustomDate;

    const filtered = allEntries.filter(e => {
      if (activityFilterMode === "today") return e.dateStr === todayLocalStr;
      if (activityFilterMode === "yesterday") return e.dateStr === yesterdayLocalStr;
      if (activityFilterMode === "7days") return e.dateStr >= sevenDaysAgoLocalStr && e.dateStr <= todayLocalStr;
      return e.dateStr === activityCustomDate;
    });

    // Group filtered entries by Agent + Shift + Quarter
    const groupsMap = new Map<string, {
      agentName: string;
      shiftBadge: string;
      quarter: string;
      latestTimestamp: string;
      latestTimeStr: string;
      latestDateStr: string;
      items: typeof filtered;
    }>();

    filtered.forEach(item => {
      const gKey = `${item.agentName.toLowerCase()}|${item.shiftBadge}|${item.quarter}`;
      const existing = groupsMap.get(gKey);
      if (!existing) {
        groupsMap.set(gKey, {
          agentName: item.agentName,
          shiftBadge: item.shiftBadge,
          quarter: item.quarter,
          latestTimestamp: item.timestamp,
          latestTimeStr: item.timeStr,
          latestDateStr: item.dateStr,
          items: [item]
        });
      } else {
        existing.items.push(item);
        if (item.timestamp > existing.latestTimestamp) {
          existing.latestTimestamp = item.timestamp;
          existing.latestTimeStr = item.timeStr;
          existing.latestDateStr = item.dateStr;
        }
      }
    });

    const groupedByAgent = Array.from(groupsMap.values()).sort((a, b) =>
      b.latestTimestamp.localeCompare(a.latestTimestamp)
    );

    const uniqueAgentsCount = new Set(filtered.map(e => e.agentName.toLowerCase())).size;
    const notesCount = filtered.filter(e => e.hasNote).length;

    return {
      todayCount,
      yesterdayCount,
      last7DaysCount,
      activeDateLabel,
      filteredCount: filtered.length,
      uniqueAgentsCount,
      notesCount,
      groupedByAgent
    };
  }, [evalData, currentSection, selectedQuarter, todayLocalStr, yesterdayLocalStr, sevenDaysAgoLocalStr, activityFilterMode, activityCustomDate, toLocalDateStr]);

  // Map a calendar month (0-11) to { quarter, weekStart, weekEnd } within that quarter
  const getMonthWeekRange = (month: number): { quarter: string; weekStart: number; weekEnd: number } => {
    const qIdx = Math.floor(month / 3); // 0=Q1, 1=Q2, 2=Q3, 3=Q4
    const quarter = ["Q1","Q2","Q3","Q4"][qIdx];
    const monthInQ = month % 3; // 0,1,2
    const weekStart = monthInQ * 4 + 1;
    const weekEnd = monthInQ === 2 ? 12 : monthInQ * 4 + 4;
    return { quarter, weekStart, weekEnd };
  };

  const currentCsrs = useMemo(() => {
    let list: string[] = [];
    if (isCallMon) {
      const nameMap = new Map<string, string>();
      callMonRoster.forEach(n => {
        const cName = getCanonicalAgentName(n);
        if (isValidAgentName(cName)) {
          const k = cName.toLowerCase();
          if (!nameMap.has(k)) nameMap.set(k, cName);
        }
      });
      // Also include any agents who have call_mon evalData for the current year/quarter
      const effectiveQuarter = `Q${Math.floor(trainerMonth / 3) + 1}`;
      const prefix = `${selectedYear}_${effectiveQuarter}_mohammed_azad_call_mon_`;
      Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
        if (docId.startsWith(prefix) && docData?.csr_name) {
          const cName = getCanonicalAgentName(docData.csr_name.trim());
          if (isValidAgentName(cName)) {
            const k = cName.toLowerCase();
            if (!nameMap.has(k)) nameMap.set(k, cName);
          }
        }
      });
      list = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));
    } else if (isCShift) {
      // For C Shift: ONLY show agents who have evaluation data in the active week(s),
      // or who were explicitly added for this week!
      const activeWeeks: number[] = [];
      if (selectedMonthFilter !== null) {
        const { weekStart, weekEnd } = getMonthWeekRange(selectedMonthFilter);
        for (let w = weekStart; w <= weekEnd; w++) {
          activeWeeks.push(w);
        }
      } else {
        activeWeeks.push(selectedWeek);
      }

      const agentsSet = new Set<string>();

      // 1. Check agents explicitly added for the active weeks
      activeWeeks.forEach(w => {
        const wKey = `${selectedYear}_${selectedQuarter}_w${w}`;
        (cShiftWeeklyAdded[wKey] || []).forEach(name => {
          const cName = getCanonicalAgentName(name);
          if (isValidAgentName(cName)) agentsSet.add(cName);
        });
      });

      // 2. Scan all docs in evalData that belong to C shift for this year & quarter
      const prefix = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_`;
      Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
        if (docId.startsWith(prefix) && docData.csr_name) {
          const cName = getCanonicalAgentName(docData.csr_name.trim());
          if (!isValidAgentName(cName)) return;
          const scores = docData.scores || {};
          const hasScore = activeWeeks.some(w => {
            const s1 = scores[`w${w}_chat_1`];
            const s2 = scores[`w${w}_chat_2`];
            const s3 = scores[`w${w}_chat_3`];
            return (s1 !== undefined && s1 !== "" && s1 !== "-") ||
                   (s2 !== undefined && s2 !== "" && s2 !== "-") ||
                   (s3 !== undefined && s3 !== "" && s3 !== "-");
          });
          if (hasScore) {
            agentsSet.add(cName);
          }
        }
      });

      const nameMap = new Map<string, string>();
      Array.from(agentsSet).forEach(n => {
        const k = n.toLowerCase();
        if (!nameMap.has(k)) nameMap.set(k, n);
      });
      list = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));
    } else if (isBonus) {
      // In Bonus shift: show Mohammed Dlshad Team for chat team, or combined call teams for call evaluators
      const combined: string[] = isChatTeam
        ? rosterMembers
            .filter(m => m.team === "Mohammed Dlshad Team")
            .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
            .filter(isValidAgentName)
        : rosterMembers
            .filter(m => m.team === "Younis Kamal Team" || m.team === "Ankido Buya Team")
            .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
            .filter(isValidAgentName);

      // Also include any bonus agents in evalData
      const secSlug = getActiveSectionSlug(currentSection.evaluator);
      const prefix = `${selectedYear}_${selectedQuarter}_${secSlug}_`;
      Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
        if (docId.startsWith(prefix) && docData?.csr_name) {
          const cName = getCanonicalAgentName(docData.csr_name.trim());
          if (isValidAgentName(cName)) {
            combined.push(cName);
          }
        }
      });

      const nameMap = new Map<string, string>();
      combined.forEach(n => {
        const k = n.toLowerCase();
        if (!nameMap.has(k)) nameMap.set(k, n);
      });
      list = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));
    } else {
      list = sectionCSRs[currentSection.id] || [];
    }
    if (!searchTerm.trim()) return list;
    return list.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [
    sectionCSRs, currentSection, searchTerm, isCShift, isCallMon, isBonus, rosterMembers, callMonRoster,
    selectedMonthFilter, selectedWeek, selectedYear, selectedQuarter, evalData, cShiftWeeklyAdded, getActiveSectionSlug
  ]);

  // Compute full completion & sync status for any calendar month index (0..11) in selectedYear
  const computeMonthSyncStatus = useCallback((mIdx: number) => {
    const upperMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const upperMonth = upperMonths[mIdx] || "SEP";
    const monthName = MONTH_NAMES[mIdx] || upperMonth;
    const { quarter, weekStart, weekEnd } = getMonthWeekRange(mIdx);
    const mainSectionSlug = currentSection.id;
    const syncKey = `${selectedYear}_${upperMonth}_${mainSectionSlug}`;

    const yNum = parseInt(String(selectedYear), 10);
    const isSyncEligible =
      !isTrainer &&
      !isCallMon &&
      !isBonus &&
      !isCShift &&
      currentSection.id !== "mohammed_azad" &&
      !isNaN(yNum) &&
      (yNum > 2026 || (yNum === 2026 && mIdx >= 8));

    if (!isSyncEligible) {
      return {
        monthIdx: mIdx,
        monthName,
        upperMonth,
        quarter,
        syncKey,
        isSyncEligible: false,
        isMonthComplete: false,
        isSynced: true,
        agentScores: {} as Record<string, string>,
        latestScoreTs: "",
        completedWeeksCount: 0
      };
    }

    // Build canonical list of agents for this section & quarter
    const teamAgents: string[] = rosterMembers
      .filter(m => m.team === currentSection.team)
      .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
      .filter(isValidAgentName);

    const prefix = `${selectedYear}_${quarter}_${mainSectionSlug}_`;
    Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
      if (docId.includes("_c_shift_") || docId.includes("_bonus_") || docId.includes("_call_mon_")) return;
      if (docId.startsWith(prefix) && docData?.csr_name) {
        const cName = getCanonicalAgentName(docData.csr_name.trim());
        if (isValidAgentName(cName)) {
          const isFromOtherTeam = rosterMembers.some(m => {
            const mName = getCanonicalAgentName((m.agent_name || m.name || "").trim()).toLowerCase();
            return mName === cName.toLowerCase() && m.team && m.team !== currentSection.team;
          });
          if (!isFromOtherTeam) teamAgents.push(cName);
        }
      }
    });

    const nameMap = new Map<string, string>();
    teamAgents.forEach(n => {
      const k = n.toLowerCase();
      if (!nameMap.has(k)) nameMap.set(k, n);
    });
    const monthAgents = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));

    if (monthAgents.length === 0) {
      return {
        monthIdx: mIdx,
        monthName,
        upperMonth,
        quarter,
        syncKey,
        isSyncEligible: true,
        isMonthComplete: false,
        isSynced: false,
        agentScores: {} as Record<string, string>,
        latestScoreTs: "",
        completedWeeksCount: 0
      };
    }

    const getAgentWeekStat = (csrName: string, w: number) => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${quarter}_${mainSectionSlug}_${slug}`;
      const docData = evalData[docId];
      const scores = docData?.scores || {};
      const timestamps = docData?.cell_timestamps || {};
      const wCfg = getWeekColumnsConfig(isChatTeam, selectedYear, quarter, w);
      const isHistoricalEarlyQ = selectedYear === "2026" && (quarter === "Q1" || quarter === "Q2");

      let inboundFilled = 0;
      let inboundV = 0;
      let sumQ = 0;
      let cntQ = 0;
      let hasV = false;
      let latestTs = "";

      for (let c = 1; c <= wCfg.colCount; c++) {
        const key = isChatTeam ? `w${w}_chat_${c}` : `w${w}_call_${wCfg.callBase + c}`;
        const altKey1 = `w${w}_call_${c}`;
        const altKey2 = `w${w}_call_${wCfg.callBase + c}`;
        const rawVal = scores[key] ?? (isChatTeam ? (scores[altKey1] ?? scores[altKey2]) : scores[altKey1]);
        const s = String(rawVal ?? "").trim();
        const ts = String(timestamps[key] || timestamps[altKey1] || timestamps[altKey2] || "");
        if (ts && ts > latestTs) latestTs = ts;

        if (s !== "" && s !== "-") {
          inboundFilled++;
          const upper = s.toUpperCase();
          if (upper === "V") {
            inboundV++;
            hasV = true;
          } else if (upper !== "S" && !upper.includes("N/A") && upper !== "NA") {
            const n = parseFloat(s);
            if (!isNaN(n)) {
              sumQ += n;
              cntQ++;
            }
          }
        }
      }

      const outKey = `w${w}_outbound`;
      const outStr = String(scores[outKey] ?? "").trim();
      const outTs = String(timestamps[outKey] || "");
      if (outTs && outTs > latestTs) latestTs = outTs;

      if (wCfg.hasOutbound && outStr !== "" && outStr !== "-") {
        const upper = outStr.toUpperCase();
        if (upper === "V") {
          hasV = true;
        } else if (upper !== "S" && !upper.includes("N/A") && upper !== "NA") {
          const n = parseFloat(outStr);
          if (!isNaN(n)) {
            sumQ += n;
            cntQ++;
          }
        }
      }

      const requireOutbound = wCfg.hasOutbound && !isHistoricalEarlyQ;
      const outboundFilled = !requireOutbound || (outStr !== "" && outStr !== "-");
      const hasAnyEntry = inboundFilled > 0 || (wCfg.hasOutbound && outStr !== "" && outStr !== "-");
      const isWeekVacation =
        inboundV > 0 &&
        inboundV === inboundFilled &&
        (!requireOutbound || outStr === "" || outStr.toUpperCase() === "V");
      const isWeekComplete = (inboundFilled === wCfg.colCount && outboundFilled) || isWeekVacation;

      return { hasAnyEntry, isWeekComplete, sumQ, cntQ, hasV, latestTs };
    };

    let completedWeeksCount = 0;
    let allFourWeeksTeamComplete = true;

    for (let w = weekStart; w <= weekEnd; w++) {
      const activeInW = monthAgents.filter(c => getAgentWeekStat(c, w).hasAnyEntry);
      if (activeInW.length === 0) {
        allFourWeeksTeamComplete = false;
        continue;
      }

      // Every agent who has started in or before week w of this month must complete week w
      const expectedInW = monthAgents.filter(c => {
        for (let pw = weekStart; pw <= w; pw++) {
          if (getAgentWeekStat(c, pw).hasAnyEntry) return true;
        }
        return false;
      });

      const weekCompleteForTeam =
        expectedInW.length > 0 && expectedInW.every(c => getAgentWeekStat(c, w).isWeekComplete);

      if (weekCompleteForTeam) {
        completedWeeksCount++;
      } else {
        allFourWeeksTeamComplete = false;
      }
    }

    const agentScores: Record<string, string> = {};
    let latestScoreTs = "";

    for (const csrName of monthAgents) {
      let firstActiveW = -1;
      for (let w = weekStart; w <= weekEnd; w++) {
        if (getAgentWeekStat(csrName, w).hasAnyEntry) {
          firstActiveW = w;
          break;
        }
      }
      if (firstActiveW === -1) continue;

      let agentAllActiveWeeksComplete = true;
      let sumQ = 0;
      let cntQ = 0;
      let hasV = false;

      for (let w = firstActiveW; w <= weekEnd; w++) {
        const st = getAgentWeekStat(csrName, w);
        if (st.latestTs && st.latestTs > latestScoreTs) {
          latestScoreTs = st.latestTs;
        }
        if (!st.isWeekComplete) {
          agentAllActiveWeeksComplete = false;
          break;
        }
        sumQ += st.sumQ;
        cntQ += st.cntQ;
        if (st.hasV) hasV = true;
      }

      if (agentAllActiveWeeksComplete) {
        const verifiedAvg = cntQ > 0 ? (sumQ / cntQ).toFixed(1) : hasV ? "V" : "";
        if (verifiedAvg) {
          agentScores[csrName] = verifiedAvg;
        }
      }
    }

    const isMonthComplete = allFourWeeksTeamComplete && completedWeeksCount === (weekEnd - weekStart + 1) && Object.keys(agentScores).length > 0;
    const syncEntry = syncedMonthsRegistry[syncKey];
    const isSynced =
      Boolean(syncEntry?.synced_at) &&
      (!latestScoreTs || latestScoreTs <= (syncEntry.latest_score_ts || syncEntry.synced_at));

    return {
      monthIdx: mIdx,
      monthName,
      upperMonth,
      quarter,
      syncKey,
      isSyncEligible: true,
      isMonthComplete,
      isSynced,
      agentScores,
      latestScoreTs,
      completedWeeksCount
    };
  }, [
    selectedYear,
    currentSection,
    isTrainer,
    isCallMon,
    isBonus,
    isCShift,
    isChatTeam,
    rosterMembers,
    evalData,
    syncedMonthsRegistry
  ]);

  // Determine the active calendar month index (0..11) currently displayed in the main table
  const activeTableMonthIdx = useMemo(() => {
    if (selectedMonthFilter !== null) return selectedMonthFilter;
    const qIdx = ["Q1", "Q2", "Q3", "Q4"].indexOf(selectedQuarter);
    const baseMonth = (qIdx >= 0 ? qIdx : 0) * 3;
    const monthInQuarter = Math.min(2, Math.floor((selectedWeek - 1) / 4));
    return baseMonth + monthInQuarter;
  }, [selectedMonthFilter, selectedQuarter, selectedWeek]);

  const currentMonthSyncStatus = useMemo(() => {
    return computeMonthSyncStatus(activeTableMonthIdx);
  }, [computeMonthSyncStatus, activeTableMonthIdx]);

  // Check if any completed previous month (from SEP 2026 onwards) prior to activeTableMonthIdx has NOT been synced yet
  const unsyncedPreviousMonth = useMemo(() => {
    if (isTrainer || isCallMon || isBonus || isCShift || currentSection.id === "mohammed_azad") {
      return null;
    }
    const yNum = parseInt(String(selectedYear), 10);
    if (isNaN(yNum) || yNum < 2026) return null;
    const startM = yNum === 2026 ? 8 : 0; // 8 = SEP

    for (let m = startM; m < activeTableMonthIdx; m++) {
      const st = computeMonthSyncStatus(m);
      if (st.isSyncEligible && st.isMonthComplete && !st.isSynced) {
        return st;
      }
    }
    return null;
  }, [
    isTrainer,
    isCallMon,
    isBonus,
    isCShift,
    currentSection.id,
    selectedYear,
    activeTableMonthIdx,
    computeMonthSyncStatus
  ]);

  useEffect(() => {
    unsyncedPreviousMonthRef.current = unsyncedPreviousMonth;
    if (unsyncedPreviousMonth) {
      setSyncReminderModal(unsyncedPreviousMonth);
    } else {
      setSyncReminderModal(null);
    }
  }, [unsyncedPreviousMonth]);

  const weeksList = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  // Compute team statistics for top card (Sentence case, no "Audit", only "Quality")
  const teamQualityStats = useMemo(() => {
    let totalCallsAudited = 0;
    let sumScores = 0;
    let inboundCount = 0;
    let outboundSum = 0;
    let outboundCount = 0;
    let passCount = 0;
    const weeksWithData = new Set<string>();
    const csrTotals: Record<string, { sum: number; count: number }> = {};

    // Special handling for Trainer (Mohammed Azad): open count by month
    if (isTrainer) {
      let trainerSum = 0;
      let trainerCount = 0;
      let trainerPass = 0;
      const csrTrainerAvgs: { name: string; avg: number }[] = [];
      const trainerQ = `Q${Math.floor(trainerMonth / 3) + 1}`;

      const targetColCount = isCallMon ? callMonColCount : trainerColCount;
      const trainerSectionSlug = isCallMon ? "mohammed_azad_call_mon" : "mohammed_azad";

      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${trainerQ}_${trainerSectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};

        let agentSum = 0;
        let agentCount = 0;

        for (let c = 1; c <= targetColCount; c++) {
          const k = `m${trainerMonth}_eval_${c}`;
          const val = scores[k];
          if (val && val.toUpperCase() !== "V" && !val.toUpperCase().includes("N/A")) {
            const v = parseFloat(val);
            if (!isNaN(v)) {
              agentSum += v;
              agentCount++;
              trainerSum += v;
              trainerCount++;
              if (v >= 90) trainerPass++;
            }
          }
        }

        if (agentCount > 0) {
          csrTrainerAvgs.push({ name: csrName, avg: agentSum / agentCount });
        }
      });

      csrTrainerAvgs.sort((a, b) => b.avg - a.avg);
      const topAgent = csrTrainerAvgs[0] ? `${csrTrainerAvgs[0].name} (${csrTrainerAvgs[0].avg.toFixed(1)}%)` : "—";
      const annualAvg = trainerCount > 0 ? (trainerSum / trainerCount).toFixed(1) : "-";
      const passRate = trainerCount > 0 ? Math.round((trainerPass / trainerCount) * 100) : 0;

      return {
        annualAvg,
        totalCallsAudited: trainerCount,
        totalTargetCalls: currentCsrs.length * targetColCount,
        auditProgressPercent: trainerCount > 0 ? Math.min(100, Math.round((trainerCount / Math.max(1, currentCsrs.length * targetColCount)) * 100)) : 0,
        weeksCount: trainerCount,
        totalWeeksInPeriod: currentCsrs.length,
        outboundAvg: "-",
        inboundCount: trainerCount,
        passRate,
        topAgent,
        totalAgents: currentCsrs.length
      };
    }

    if (isBonus) {
      let sumScores = 0;
      let totalCallsAudited = 0;
      let passCount = 0;
      const csrTotals: Record<string, { sum: number; count: number }> = {};

      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
        const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};

        for (let c = 1; c <= bonusColCount; c++) {
          const val = scores[`call_${c}`] ?? scores[`chat_${c}`] ?? scores[`w${Math.floor((c - 1) / 6) + 1}_call_${c}`] ?? scores[`w${Math.floor((c - 1) / 6) + 1}_chat_${c}`];
          const valStr = String(val || "").trim().toUpperCase();
          if (valStr && valStr !== "V" && valStr !== "N/A") {
            const num = parseFloat(valStr);
            if (!isNaN(num)) {
              totalCallsAudited++;
              sumScores += num;
              if (num >= 90) passCount++;
              if (!csrTotals[csrName]) csrTotals[csrName] = { sum: 0, count: 0 };
              csrTotals[csrName].sum += num;
              csrTotals[csrName].count += 1;
            }
          }
        }
      });

      const totalTargetCalls = currentCsrs.length * bonusColCount;
      const annualAvg = totalCallsAudited > 0 ? (sumScores / totalCallsAudited).toFixed(1) : "-";
      const passRate = totalCallsAudited > 0 ? Math.round((passCount / totalCallsAudited) * 100) : 0;
      const auditProgressPercent = totalTargetCalls > 0 ? Math.min(100, Math.round((totalCallsAudited / Math.max(1, totalTargetCalls)) * 100)) : 0;

      let topAgent = "—";
      let topScore = -1;
      Object.entries(csrTotals).forEach(([name, stat]) => {
        if (stat.count > 0) {
          const avg = stat.sum / stat.count;
          if (avg > topScore) {
            topScore = avg;
            topAgent = `${name} (${avg.toFixed(1)}%)`;
          }
        }
      });

      return {
        annualAvg,
        totalCallsAudited,
        totalTargetCalls,
        auditProgressPercent,
        weeksCount: bonusColCount,
        totalWeeksInPeriod: bonusColCount,
        outboundAvg: "-",
        inboundCount: totalCallsAudited,
        passRate,
        topAgent,
        totalAgents: currentCsrs.length
      };
    }

    // When a specific month is selected, filter to that month only
    let targetQuarters: string[];
    let weekFilter: ((qId: string, w: number) => boolean) | null = null;
    let totalWeeksInPeriod: number;

    if (selectedMonthFilter !== null) {
      const { quarter, weekStart, weekEnd } = getMonthWeekRange(selectedMonthFilter);
      targetQuarters = [quarter];
      weekFilter = (qId: string, w: number) => qId === quarter && w >= weekStart && w <= weekEnd;
      totalWeeksInPeriod = weekEnd - weekStart + 1;
    } else {
      targetQuarters = 
        cardPeriodMode === "h1" ? ["Q1", "Q2"] :
        cardPeriodMode === "h2" ? ["Q3", "Q4"] :
        cardPeriodMode === "year" ? ["Q1", "Q2", "Q3", "Q4"] :
        [selectedQuarter];
      totalWeeksInPeriod = 
        cardPeriodMode === "year" ? 48 :
        (cardPeriodMode === "h1" || cardPeriodMode === "h2") ? 24 : 12;
    }

    // Total target calls calculation based on period and dynamic weekly columns
    let totalTargetCalls = 0;
    targetQuarters.forEach(qId => {
      const qWeeks = weekFilter
        ? Array.from({ length: 12 }, (_, i) => i + 1).filter(w => weekFilter(qId, w)).length
        : (cardPeriodMode === "year" || cardPeriodMode === "h1" || cardPeriodMode === "h2" || selectedMonthFilter === null ? 12 : totalWeeksInPeriod);
      const qCallsPerWeek = isCShift ? 3 : (isNewEvalSchema(selectedYear, qId) ? 8 : 7);
      totalTargetCalls += currentCsrs.length * qCallsPerWeek * qWeeks;
    });

    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);

    currentCsrs.forEach(csrName => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");

      targetQuarters.forEach(qId => {
        const docId = `${selectedYear}_${qId}_${sectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};

        for (let w = 1; w <= 12; w++) {
          // Skip weeks not in the selected month filter
          if (weekFilter && !weekFilter(qId, w)) continue;

          if (isCShift) {
            for (let c = 1; c <= 3; c++) {
              const val = scores[`w${w}_chat_${c}`];
              const valStr = String(val || "").trim().toUpperCase();
              if (valStr && valStr !== "V" && valStr !== "N/A") {
                const num = parseFloat(valStr);
                if (!isNaN(num)) {
                  totalCallsAudited++;
                  sumScores += num;
                  if (num >= 90) passCount++;
                  if (!csrTotals[csrName]) csrTotals[csrName] = { sum: 0, count: 0 };
                  csrTotals[csrName].sum += num;
                  csrTotals[csrName].count += 1;
                  inboundCount++;
                }
              }
            }
          } else {
            const wCfg = getWeekColumnsConfig(isChatTeam, selectedYear, qId, w);
            for (let c = 1; c <= wCfg.colCount; c++) {
              const key = isChatTeam ? `w${w}_chat_${c}` : `w${w}_call_${wCfg.callBase + c}`;
              const val = scores[key] ?? (isChatTeam ? (scores[`w${w}_call_${c}`] ?? scores[`w${w}_call_${wCfg.callBase + c}`]) : undefined);
              const valStr = String(val || "").trim().toUpperCase();
              if (valStr && valStr !== "V" && valStr !== "N/A") {
                const num = parseFloat(valStr);
                if (!isNaN(num)) {
                  totalCallsAudited++;
                  sumScores += num;
                  if (num >= 90) passCount++;
                  if (!csrTotals[csrName]) csrTotals[csrName] = { sum: 0, count: 0 };
                  csrTotals[csrName].sum += num;
                  csrTotals[csrName].count += 1;
                  inboundCount++;
                }
              }
            }

            if (wCfg.hasOutbound) {
              const outVal = scores[`w${w}_outbound`];
              const outValStr = String(outVal || "").trim().toUpperCase();
              if (outValStr && outValStr !== "V" && outValStr !== "N/A") {
                const num = parseFloat(outValStr);
                if (!isNaN(num)) {
                  totalCallsAudited++;
                  sumScores += num;
                  if (num >= 90) passCount++;
                  if (!csrTotals[csrName]) csrTotals[csrName] = { sum: 0, count: 0 };
                  csrTotals[csrName].sum += num;
                  csrTotals[csrName].count += 1;
                  outboundSum += num;
                  outboundCount++;
                }
              }
            }
          }
        }
      });
    });

    // Strictly count a week as "Completed" ONLY when all required evaluations for that week are filled
    const hasEntryInWeek = (csrName: string, qId: string, w: number): boolean => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${qId}_${sectionSlug}_${slug}`;
      const scores = evalData[docId]?.scores || {};
      const prefix = `w${w}_`;
      return Object.entries(scores).some(([k, v]) => {
        const s = String(v ?? "").trim();
        return k.startsWith(prefix) && s !== "" && s !== "-";
      });
    };

    const hasEntryBeforeInQuarter = (csrName: string, qId: string, w: number): boolean => {
      for (let pw = 1; pw < w; pw++) {
        if (hasEntryInWeek(csrName, qId, pw)) return true;
      }
      return false;
    };

    const hasEntryAfterInQuarter = (csrName: string, qId: string, w: number): boolean => {
      for (let nw = w + 1; nw <= 12; nw++) {
        if (hasEntryInWeek(csrName, qId, nw)) return true;
      }
      return false;
    };

    targetQuarters.forEach(qId => {
      let latestActiveWeekInQ = 0;
      if (!isCShift && currentCsrs.length > 0) {
        for (let w = 1; w <= 12; w++) {
          const activeCnt = currentCsrs.filter(c => hasEntryInWeek(c, qId, w)).length;
          if (activeCnt >= Math.ceil(currentCsrs.length / 2)) {
            latestActiveWeekInQ = w;
          }
        }
      }

      for (let w = 1; w <= 12; w++) {
        if (weekFilter && !weekFilter(qId, w)) continue;

        if (isCShift) {
          // Determine C-shift agents active in (qId, w)
          const wKey = `${selectedYear}_${qId}_w${w}`;
          const weekCShiftSet = new Set<string>();
          (cShiftWeeklyAdded[wKey] || []).forEach(n => {
            const cName = getCanonicalAgentName(n);
            if (isValidAgentName(cName)) weekCShiftSet.add(cName);
          });
          const prefix = `${selectedYear}_${qId}_mohammed_dlshad_c_shift_`;
          Object.entries(evalData).forEach(([docId, docData]: [string, any]) => {
            if (docId.startsWith(prefix) && docData?.csr_name) {
              const cName = getCanonicalAgentName(docData.csr_name.trim());
              if (!isValidAgentName(cName)) return;
              const sc = docData.scores || {};
              if (
                [1, 2, 3].some(c => {
                  const sv = String(sc[`w${w}_chat_${c}`] ?? "").trim();
                  return sv !== "" && sv !== "-";
                })
              ) {
                weekCShiftSet.add(cName);
              }
            }
          });

          const weekAgents = Array.from(weekCShiftSet);
          if (weekAgents.length > 0) {
            const allCShiftComplete = weekAgents.every(csrName => {
              const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
              const docId = `${selectedYear}_${qId}_mohammed_dlshad_c_shift_${slug}`;
              const sc = evalData[docId]?.scores || {};
              let filled = 0;
              let vCount = 0;
              for (let c = 1; c <= 3; c++) {
                const sv = String(sc[`w${w}_chat_${c}`] ?? "").trim();
                if (sv !== "" && sv !== "-") {
                  filled++;
                  if (sv.toUpperCase() === "V") vCount++;
                }
              }
              return filled === 3 || (vCount > 0 && vCount === filled);
            });
            if (allCShiftComplete) {
              weeksWithData.add(`${qId}_w${w}`);
            }
          }
        } else {
          if (currentCsrs.length === 0) continue;
          const wCfg = getWeekColumnsConfig(isChatTeam, selectedYear, qId, w);
          const anyAgentHasOutboundInW = currentCsrs.some(csrName => {
            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
            const outVal = String(evalData[`${selectedYear}_${qId}_${sectionSlug}_${slug}`]?.scores?.[`w${w}_outbound`] ?? "").trim();
            return outVal !== "" && outVal !== "-";
          });
          const isHistoricalEarlyQ = selectedYear === "2026" && (qId === "Q1" || qId === "Q2");
          const requireOutbound = wCfg.hasOutbound && (!isHistoricalEarlyQ || anyAgentHasOutboundInW);

          let expectedCsrs = currentCsrs.filter(csrName => {
            if (hasEntryInWeek(csrName, qId, w)) return true;
            if (latestActiveWeekInQ === 0) return true;
            if (w >= latestActiveWeekInQ) {
              const refW = Math.max(1, latestActiveWeekInQ - 1);
              return hasEntryInWeek(csrName, qId, refW) || hasEntryInWeek(csrName, qId, latestActiveWeekInQ);
            }
            return hasEntryBeforeInQuarter(csrName, qId, w) && hasEntryAfterInQuarter(csrName, qId, w);
          });
          if (expectedCsrs.length === 0) expectedCsrs = currentCsrs;

          let allExpectedComplete = expectedCsrs.length > 0;
          let anyAgentComplete = false;

          for (const csrName of expectedCsrs) {
            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
            const docId = `${selectedYear}_${qId}_${sectionSlug}_${slug}`;
            const scores = evalData[docId]?.scores || {};

            let inboundFilled = 0;
            let inboundV = 0;
            for (let c = 1; c <= wCfg.colCount; c++) {
              const key = isChatTeam ? `w${w}_chat_${c}` : `w${w}_call_${wCfg.callBase + c}`;
              const val = String(
                scores[key] ??
                  (isChatTeam ? (scores[`w${w}_call_${c}`] ?? scores[`w${w}_call_${wCfg.callBase + c}`]) : "") ??
                  ""
              ).trim();
              if (val !== "" && val !== "-") {
                inboundFilled++;
                if (val.toUpperCase() === "V") inboundV++;
              }
            }

            const outVal = String(scores[`w${w}_outbound`] ?? "").trim();
            const outboundFilled = !requireOutbound || (outVal !== "" && outVal !== "-");
            const isAllVacation =
              inboundV > 0 &&
              inboundV === inboundFilled &&
              (!requireOutbound || outVal === "" || outVal.toUpperCase() === "V");

            const agentComplete = (inboundFilled === wCfg.colCount && outboundFilled) || isAllVacation;
            if (agentComplete) {
              anyAgentComplete = true;
            } else {
              allExpectedComplete = false;
              break;
            }
          }

          if (allExpectedComplete && anyAgentComplete) {
            weeksWithData.add(`${qId}_w${w}`);
          }
        }
      }
    });

    const annualAvg = totalCallsAudited > 0 ? (sumScores / totalCallsAudited).toFixed(1) : "-";
    const outboundAvg = outboundCount > 0 ? (outboundSum / outboundCount).toFixed(1) : "-";
    const passRate = totalCallsAudited > 0 ? Math.round((passCount / totalCallsAudited) * 100) : 0;
    const auditProgressPercent = totalTargetCalls > 0 ? Math.round((totalCallsAudited / totalTargetCalls) * 100) : 0;

    let topAgent = "—";
    let topScore = -1;
    Object.entries(csrTotals).forEach(([name, stat]) => {
      if (stat.count > 0) {
        const avg = stat.sum / stat.count;
        if (avg > topScore) {
          topScore = avg;
          topAgent = `${name} (${avg.toFixed(1)}%)`;
        }
      }
    });

    return {
      annualAvg,
      totalCallsAudited,
      totalTargetCalls,
      auditProgressPercent,
      weeksCount: weeksWithData.size,
      totalWeeksInPeriod,
      outboundAvg,
      inboundCount,
      passRate,
      topAgent,
      totalAgents: currentCsrs.length
    };
  }, [currentCsrs, currentSection, selectedYear, selectedQuarter, cardPeriodMode, selectedMonthFilter, evalData, isChatTeam, isTrainer, trainerMonth, trainerColCount, callMonColCount, bonusColCount, isCShift, isCallMon, isBonus, cShiftWeeklyAdded, getActiveSectionSlug]);

  const currentWeekConfig = useMemo(() => {
    return getWeekColumnsConfig(isChatTeam, selectedYear, selectedQuarter, selectedWeek);
  }, [isChatTeam, selectedYear, selectedQuarter, selectedWeek]);

  const callBase = currentWeekConfig.callBase;
  const standardColCount = currentWeekConfig.colCount;
  const showOutbound = currentWeekConfig.hasOutbound;

  // Per-agent average quality scores for the selected table month
  const tableMonthAgentAvgs = useMemo(() => {
    if (selectedMonthFilter === null) return {};
    const { quarter, weekStart, weekEnd } = getMonthWeekRange(selectedMonthFilter);
    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
    const result: Record<string, string> = {};

    currentCsrs.forEach(csrName => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${quarter}_${sectionSlug}_${slug}`;
      const scores = evalData[docId]?.scores || {};
      let sum = 0; let cnt = 0;

      for (let w = weekStart; w <= weekEnd; w++) {
        if (isCShift) {
          for (let c = 1; c <= 3; c++) {
            const val = scores[`w${w}_chat_${c}`];
            const v = parseFloat(String(val || ""));
            if (!isNaN(v)) { sum += v; cnt++; }
          }
        } else {
          const wCfg = getWeekColumnsConfig(isChatTeam, selectedYear, quarter, w);
          for (let c = 1; c <= wCfg.colCount; c++) {
            const key = isChatTeam ? `w${w}_chat_${c}` : `w${w}_call_${wCfg.callBase + c}`;
            const val = scores[key] ?? (isChatTeam ? (scores[`w${w}_call_${c}`] ?? scores[`w${w}_call_${wCfg.callBase + c}`]) : undefined);
            const v = parseFloat(String(val || ""));
            if (!isNaN(v)) { sum += v; cnt++; }
          }
          if (wCfg.hasOutbound) {
            const outV = parseFloat(String(scores[`w${w}_outbound`] ?? ""));
            if (!isNaN(outV)) { sum += outV; cnt++; }
          }
        }
      }

      result[csrName] = cnt > 0 ? (sum / cnt).toFixed(1) : "-";
    });

    return result;
  }, [selectedMonthFilter, currentCsrs, currentSection, selectedYear, evalData, isChatTeam, isCShift, isBonus, getActiveSectionSlug]);

  // Handler for selecting month from toolbar dropdown (affects both top card and table)
  const handleMonthSelect = (monthIdx: number | null) => {
    setSelectedMonthFilter(monthIdx);
    if (monthIdx !== null) {
      const { quarter, weekStart } = getMonthWeekRange(monthIdx);
      setSelectedQuarter(quarter);
      setSelectedWeek(weekStart);
    }
  };

  // Auto-expand trainer column count if higher evaluation indexes exist in data
  useEffect(() => {
    if (!isTrainer) return;
    let maxFoundWithData = 0;
    const trainerQ = `Q${Math.floor(trainerMonth / 3) + 1}`;
    const targetSlug = isCallMon ? "mohammed_azad_call_mon" : "mohammed_azad";
    currentCsrs.forEach(csrName => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${trainerQ}_${targetSlug}_${slug}`;
      const scores = evalData[docId]?.scores || {};
      Object.keys(scores).forEach(k => {
        const match = k.match(new RegExp(`^m${trainerMonth}_eval_(\\d+)$`));
        if (match && scores[k] && scores[k] !== "-") {
          const idx = parseInt(match[1], 10);
          if (idx > maxFoundWithData) maxFoundWithData = idx;
        }
      });
    });
    if (isCallMon) {
      if (maxFoundWithData > callMonColCount) {
        setCallMonColCount(maxFoundWithData);
      }
    } else {
      if (maxFoundWithData > trainerColCount) {
        setTrainerColCount(maxFoundWithData);
      }
    }
  }, [isTrainer, isCallMon, trainerMonth, selectedYear, evalData, currentCsrs, trainerColCount, callMonColCount]);

  // Remove trainer evaluation column (shifts remaining columns or clears column data)
  const handleRemoveTrainerColumn = async (colIndex: number) => {
    const colCount = isCallMon ? callMonColCount : trainerColCount;
    if (colCount <= 1) return;
    const newCount = colCount - 1;
    const trainerQ = `Q${Math.floor(trainerMonth / 3) + 1}`;
    const targetSlug = isCallMon ? "mohammed_azad_call_mon" : "mohammed_azad";

    for (const csrName of currentCsrs) {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${trainerQ}_${targetSlug}_${slug}`;
      const docData = evalData[docId];
      if (!docData) continue;

      const scores = { ...(docData.scores || {}) };
      const notes = { ...(docData.notes || {}) };
      let changed = false;

      if (colIndex === colCount) {
        // Removing the last column
        const key = `m${trainerMonth}_eval_${colIndex}`;
        if (scores[key] !== undefined) {
          delete scores[key];
          changed = true;
        }
        if (notes[key] !== undefined) {
          delete notes[key];
          changed = true;
        }
      } else {
        // Shift columns above colIndex down
        for (let c = colIndex; c < colCount; c++) {
          const currKey = `m${trainerMonth}_eval_${c}`;
          const nextKey = `m${trainerMonth}_eval_${c + 1}`;
          if (scores[nextKey] !== undefined) {
            scores[currKey] = scores[nextKey];
          } else {
            delete scores[currKey];
          }
          if (notes[nextKey] !== undefined) {
            notes[currKey] = notes[nextKey];
          } else {
            delete notes[currKey];
          }
          changed = true;
        }
        delete scores[`m${trainerMonth}_eval_${colCount}`];
        delete notes[`m${trainerMonth}_eval_${colCount}`];
      }

      if (changed) {
        setEvalData(prev => ({
          ...prev,
          [docId]: {
            ...docData,
            scores,
            notes,
            updated_at: new Date().toISOString()
          }
        }));
        try {
          await setDoc(doc(db, "quality_evaluations", docId), {
            scores,
            notes,
            updated_at: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error("Error updating doc on remove column:", err);
        }
      }
    }

    if (isCallMon) {
      setCallMonColCount(newCount);
    } else {
      setTrainerColCount(newCount);
    }
  };

  // Compute agent average for Bonus mode (all calls or chats combined)
  const computeBonusAgentAvg = useCallback((scores: Record<string, string>, colCount: number): string => {
    const nums: number[] = [];
    let hasV = false;
    for (let c = 1; c <= colCount; c++) {
      const val = scores[`call_${c}`] ?? scores[`chat_${c}`] ?? scores[`w${Math.floor((c - 1) / 6) + 1}_call_${c}`] ?? scores[`w${Math.floor((c - 1) / 6) + 1}_chat_${c}`];
      if (val && val.toUpperCase() !== "N/A") {
        if (val.toUpperCase() === "V") {
          hasV = true;
        } else {
          const n = parseFloat(val);
          if (!isNaN(n)) nums.push(n);
        }
      }
    }
    if (nums.length === 0) return hasV ? "V" : "-";
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  }, []);

  // Auto-expand bonus column count if higher evaluation indexes exist in data
  useEffect(() => {
    if (!isBonus) return;
    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
    let maxFoundWithData = 6;
    currentCsrs.forEach(csrName => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
      const scores = evalData[docId]?.scores || {};
      Object.keys(scores).forEach(k => {
        const match = k.match(/(?:call|chat)_(\d+)/);
        if (match && scores[k] && scores[k] !== "-") {
          const idx = parseInt(match[1], 10);
          if (idx > maxFoundWithData) maxFoundWithData = idx;
        }
      });
    });
    if (maxFoundWithData > bonusColCount) {
      setBonusColCount(maxFoundWithData);
    }
  }, [isBonus, currentSection.evaluator, selectedYear, selectedQuarter, evalData, currentCsrs, getActiveSectionSlug, bonusColCount]);

  // Add bonus evaluation column
  const handleAddBonusColumn = () => {
    setBonusColCount(prev => {
      const next = prev + 1;
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTo({
            left: tableContainerRef.current.scrollWidth,
            behavior: "smooth"
          });
        }
      }, 100);
      return next;
    });
  };

  // Remove bonus evaluation column (shifts remaining columns or clears column data)
  const handleRemoveBonusColumn = async (colIndex: number) => {
    if (bonusColCount <= 1) return;
    const newCount = bonusColCount - 1;
    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);

    for (const csrName of currentCsrs) {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
      const docData = evalData[docId];
      if (!docData) continue;

      const scores = { ...(docData.scores || {}) };
      const notes = { ...(docData.notes || {}) };
      const links = { ...(docData.links || {}) };
      let changed = false;

      const isChatBonus = currentSection.evaluator.toLowerCase().includes("dlshad");
      const pKey = isChatBonus ? "chat" : "call";

      const deleteCallKeys = (c: number) => {
        const k1 = `${pKey}_${c}`;
        const w = Math.floor((c - 1) / 6) + 1;
        const k2 = `w${w}_${pKey}_${c}`;
        if (scores[k1] !== undefined || scores[k2] !== undefined) {
          delete scores[k1];
          delete scores[k2];
          changed = true;
        }
        if (notes[k1] !== undefined || notes[k2] !== undefined) {
          delete notes[k1];
          delete notes[k2];
          changed = true;
        }
        if (links[k1] !== undefined || links[k2] !== undefined) {
          delete links[k1];
          delete links[k2];
          changed = true;
        }
      };

      if (colIndex === bonusColCount) {
        deleteCallKeys(colIndex);
      } else {
        for (let c = colIndex; c < bonusColCount; c++) {
          const next = c + 1;
          const currK1 = `${pKey}_${c}`;
          const currW = Math.floor((c - 1) / 6) + 1;
          const currK2 = `w${currW}_${pKey}_${c}`;

          const nextK1 = `${pKey}_${next}`;
          const nextW = Math.floor((next - 1) / 6) + 1;
          const nextK2 = `w${nextW}_${pKey}_${next}`;

          const val = scores[nextK1] ?? scores[nextK2];
          if (val !== undefined) {
            scores[currK1] = val;
            scores[currK2] = val;
          } else {
            delete scores[currK1];
            delete scores[currK2];
          }

          const nVal = notes[nextK1] ?? notes[nextK2];
          if (nVal !== undefined) {
            notes[currK1] = nVal;
            notes[currK2] = nVal;
          } else {
            delete notes[currK1];
            delete notes[currK2];
          }

          const lVal = links[nextK1] ?? links[nextK2];
          if (lVal !== undefined) {
            links[currK1] = lVal;
            links[currK2] = lVal;
          } else {
            delete links[currK1];
            delete links[currK2];
          }
          changed = true;
        }
        deleteCallKeys(bonusColCount);
      }

      if (changed) {
        setEvalData(prev => ({
          ...prev,
          [docId]: {
            ...docData,
            scores,
            notes,
            links,
            updated_at: new Date().toISOString()
          }
        }));
        try {
          await setDoc(doc(db, "quality_evaluations", docId), {
            scores,
            notes,
            links,
            updated_at: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error("Error updating doc on remove bonus column:", err);
        }
      }
    }

    setBonusColCount(newCount);
  };

  // Profile modal opening
  const handleOpenProfile = () => {
    if (onOpenProfile) {
      onOpenProfile();
      return;
    }
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

  const handleSaveProfile = async (e: any) => {
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
        if (newProfilePassword.length < 6) {
          setProfileError("Password must be at least 6 characters");
          setSavingProfile(false);
          return;
        }
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, newProfilePassword);
        }
      }

      if (auth.currentUser?.uid) {
        const payload: any = {
          name: profileName,
          photo_url: profilePhoto,
        };
        if (newProfilePassword) {
          payload.mustChangePassword = false;
          payload.passwordUpdated = true;
          payload.passwordChangedAt = new Date().toISOString();
        }
        await setDoc(doc(db, "users", auth.currentUser.uid), payload, { merge: true });
        if (userProfile) {
          userProfile.name = profileName;
          userProfile.photo_url = profilePhoto;
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

  const handleForcePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForcePasswordError("");

    if (forceNewPassword !== forceConfirmPassword) {
      setForcePasswordError("Passwords do not match");
      return;
    }

    const check = validatePasswordSecurity(forceNewPassword);
    if (!check.isValid) {
      setForcePasswordError(check.error);
      return;
    }

    setForcePasswordLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, forceNewPassword);
        const isJihad = auth.currentUser.email?.toLowerCase().includes("mohammed.jihad");
        const docUpdates: any = {
          mustChangePassword: false,
          passwordUpdated: true,
          passwordChangedAt: new Date().toISOString(),
        };
        if (isJihad) {
          docUpdates.email = "mohammed.jihad@agent.com";
          docUpdates.name = "Mohammed Jihad";
          docUpdates.evaluator = "Mohammed Jihad";
          docUpdates.team = "Younis Kamal Team";
          docUpdates.role = "qa";
        }
        await setDoc(doc(db, "users", auth.currentUser.uid), docUpdates, { merge: true });

        if (userProfile) {
          if (isJihad) {
            userProfile.email = "mohammed.jihad@agent.com";
          }
          userProfile.mustChangePassword = false;
          userProfile.passwordUpdated = true;
        }

        setForcePasswordChange(false);
      }
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setForcePasswordError("Security session expired. Please log out and sign back in to change your password.");
      } else {
        setForcePasswordError(err.message || "Failed to update password");
      }
    } finally {
      setForcePasswordLoading(false);
    }
  };

  // Open note modal for a specific cell
  const handleOpenNote = (csrName: string, key: string, callLabel: string) => {
    if (!isTrainer && !isCallMon && !isBonus && !isCShift && unsyncedPreviousMonthRef.current) {
      setSyncReminderModal(unsyncedPreviousMonthRef.current);
      return;
    }
    const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
    const effectiveQuarter = (isTrainer || isCallMon) ? `Q${Math.floor(trainerMonth / 3) + 1}` : selectedQuarter;
    const docId = `${selectedYear}_${effectiveQuarter}_${sectionSlug}_${slug}`;
    let existingNote = (evalData[docId]?.notes || {})[key] || "";
    let existingLink = (evalData[docId]?.links || {})[key] || "";
    let scoreVal = (evalData[docId]?.scores || {})[key] || "";

    if (isBonus && (!existingNote || !existingLink || !scoreVal)) {
      const m = key.match(/(?:call|chat)_(\d+)/);
      if (m) {
        const cNum = parseInt(m[1], 10);
        const prefixKey = isChatTeam ? "chat" : "call";
        const altKey = key.startsWith(`${prefixKey}_`)
          ? `w${Math.floor((cNum - 1) / 6) + 1}_${prefixKey}_${cNum}`
          : `${prefixKey}_${cNum}`;
        if (!existingNote) existingNote = (evalData[docId]?.notes || {})[altKey] || (evalData[docId]?.notes || {})[`call_${cNum}`] || (evalData[docId]?.notes || {})[`chat_${cNum}`] || "";
        if (!existingLink) existingLink = (evalData[docId]?.links || {})[altKey] || (evalData[docId]?.links || {})[`call_${cNum}`] || (evalData[docId]?.links || {})[`chat_${cNum}`] || "";
        if (!scoreVal) scoreVal = (evalData[docId]?.scores || {})[altKey] || (evalData[docId]?.scores || {})[`call_${cNum}`] || (evalData[docId]?.scores || {})[`chat_${cNum}`] || "";
      }
    }

    // If no explicit link is stored, check if the note text contains an HTTP link
    if (!existingLink && existingNote) {
      const match = existingNote.match(/https?:\/\/[^\s<>"]+/);
      if (match) {
        existingLink = match[0];
      }
    }

    setActiveNoteModal({
      csrName,
      key,
      callLabel,
      score: scoreVal,
      noteText: existingNote,
      linkUrl: existingLink
    });
  };

  // Save note & link to Firestore
  const handleSaveNote = async () => {
    if (!activeNoteModal) return;
    setSavingNote(true);
    const { csrName, key, noteText, linkUrl } = activeNoteModal;
    const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
    const effectiveQuarter = (isTrainer || isCallMon) ? `Q${Math.floor(trainerMonth / 3) + 1}` : selectedQuarter;
    const docId = `${selectedYear}_${effectiveQuarter}_${sectionSlug}_${slug}`;

    try {
      const updatedNotes = {
        ...((evalData[docId]?.notes) || {})
      };
      if (noteText.trim()) {
        updatedNotes[key] = noteText.trim();
      } else {
        delete updatedNotes[key];
      }

      const updatedLinks = {
        ...((evalData[docId]?.links) || {})
      };
      if (linkUrl.trim()) {
        updatedLinks[key] = linkUrl.trim();
      } else {
        delete updatedLinks[key];
      }

      let altKey: string | null = null;
      if (isBonus && key.match(/call_(\d+)/)) {
        const cNum = parseInt(key.match(/call_(\d+)/)![1], 10);
        altKey = key.startsWith("call_")
          ? `w${Math.floor((cNum - 1) / 6) + 1}_call_${cNum}`
          : `call_${cNum}`;
      }
      if (altKey) {
        if (noteText.trim()) updatedNotes[altKey] = noteText.trim();
        else delete updatedNotes[altKey];
        if (linkUrl.trim()) updatedLinks[altKey] = linkUrl.trim();
        else delete updatedLinks[altKey];
      }

      const nowIso = new Date().toISOString();
      const updatedTimestamps = {
        ...((evalData[docId]?.cell_timestamps) || {}),
      };
      if (noteText.trim() || linkUrl.trim() || evalData[docId]?.scores?.[key] !== undefined) {
        updatedTimestamps[key] = nowIso;
        if (altKey) updatedTimestamps[altKey] = nowIso;
      }

      setEvalData(prev => {
        const currentDoc = prev[docId] || {
          year: selectedYear,
          quarter: effectiveQuarter,
          evaluator: currentSection.evaluator,
          team: currentSection.team,
          csr_name: csrName,
          scores: {},
          notes: {},
          links: {},
          cell_timestamps: {}
        };
        return {
          ...prev,
          [docId]: {
            ...currentDoc,
            notes: updatedNotes,
            links: updatedLinks,
            cell_timestamps: updatedTimestamps,
            updated_at: nowIso
          }
        };
      });

      await setDoc(doc(db, "quality_evaluations", docId), {
        year: selectedYear,
        quarter: effectiveQuarter,
        evaluator: currentSection.evaluator,
        team: currentSection.team,
        csr_name: csrName,
        notes: updatedNotes,
        links: updatedLinks,
        cell_timestamps: updatedTimestamps,
        _arch: getSystemAuthor(),
        updated_at: nowIso
      }, { merge: true });

      setActiveNoteModal(null);
    } catch (e) {
      console.error("Error saving note:", e);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete note & link from Firestore
  const handleDeleteNote = async () => {
    if (!activeNoteModal) return;
    setSavingNote(true);
    const { csrName, key } = activeNoteModal;
    const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
    const effectiveQuarter = (isTrainer || isCallMon) ? `Q${Math.floor(trainerMonth / 3) + 1}` : selectedQuarter;
    const docId = `${selectedYear}_${effectiveQuarter}_${sectionSlug}_${slug}`;

    try {
      const updatedNotes = { ...((evalData[docId]?.notes) || {}) };
      delete updatedNotes[key];

      const updatedLinks = { ...((evalData[docId]?.links) || {}) };
      delete updatedLinks[key];

      let altKey: string | null = null;
      if (isBonus && key.match(/call_(\d+)/)) {
        const cNum = parseInt(key.match(/call_(\d+)/)![1], 10);
        altKey = key.startsWith("call_")
          ? `w${Math.floor((cNum - 1) / 6) + 1}_call_${cNum}`
          : `call_${cNum}`;
      }
      if (altKey) {
        delete updatedNotes[altKey];
        delete updatedLinks[altKey];
      }

      setEvalData(prev => {
        const currentDoc = prev[docId];
        if (!currentDoc) return prev;
        return {
          ...prev,
          [docId]: {
            ...currentDoc,
            notes: updatedNotes,
            links: updatedLinks,
            updated_at: new Date().toISOString()
          }
        };
      });

      await setDoc(doc(db, "quality_evaluations", docId), {
        notes: updatedNotes,
        links: updatedLinks,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setActiveNoteModal(null);
    } catch (e) {
      console.error("Error deleting note:", e);
    } finally {
      setSavingNote(false);
    }
  };

  // Keyboard arrow, Enter, and Tab navigation between score cells
  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
    let targetRow = rowIdx;
    let targetCol = colIdx;
    const maxCol = isCallMon ? callMonColCount - 1 : isTrainer ? trainerColCount - 1 : isCShift ? 2 : isBonus ? bonusColCount - 1 : (standardColCount - 1 + (showOutbound ? 1 : 0));

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      if (rowIdx < currentCsrs.length - 1) {
        targetRow = rowIdx + 1;
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIdx > 0) {
        targetRow = rowIdx - 1;
      }
    } else if (e.key === "ArrowRight") {
      const input = e.currentTarget;
      const isAtEnd = input.selectionEnd === input.value.length;
      const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;
      if (isAtEnd || isAllSelected || !input.value || input.value === "-") {
        e.preventDefault();
        if (colIdx < maxCol) {
          targetCol = colIdx + 1;
        } else if (rowIdx < currentCsrs.length - 1) {
          targetRow = rowIdx + 1;
          targetCol = 0;
        }
      }
    } else if (e.key === "ArrowLeft") {
      const input = e.currentTarget;
      const isAtStart = input.selectionStart === 0;
      const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;
      if (isAtStart || isAllSelected || !input.value || input.value === "-") {
        e.preventDefault();
        if (colIdx > 0) {
          targetCol = colIdx - 1;
        } else if (rowIdx > 0) {
          targetRow = rowIdx - 1;
          targetCol = maxCol;
        }
      }
    } else {
      return;
    }

    const nextInput = document.getElementById(`qa_cell_${targetRow}_${targetCol}`) as HTMLInputElement | null;
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  // Export Week / Month Data to PDF
  const handleExportPDF = () => {
    if (isTrainer) {
      const trainerQ = `Q${Math.floor(trainerMonth / 3) + 1}`;
      const effectiveColCount = isCallMon ? callMonColCount : trainerColCount;
      const trainerSectionSlug = isCallMon ? "mohammed_azad_call_mon" : "mohammed_azad";

      const rowsData = currentCsrs.map((csrName, idx) => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${trainerQ}_${trainerSectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};
        const notes = evalData[docId]?.notes || {};

        let sum = 0; let count = 0;
        const evalVals = Array.from({ length: effectiveColCount }, (_, i) => i + 1).map(cNum => {
          const key = `m${trainerMonth}_eval_${cNum}`;
          const val = scores[key] ?? "-";
          const note = notes[key] ?? "";
          if (val && val.toUpperCase() !== "V" && !val.toUpperCase().includes("N/A")) {
            const n = parseFloat(val);
            if (!isNaN(n)) { sum += n; count++; }
          }
          return { val, note };
        });

        const agentAvg = count > 0 ? (sum / count).toFixed(1) + "%" : "-";
        return {
          idx: idx + 1,
          csrName,
          evalVals,
          agentAvg
        };
      });

      const colAverages = Array.from({ length: effectiveColCount }, (_, i) => i + 1).map(cNum => {
        const key = `m${trainerMonth}_eval_${cNum}`;
        const nums: number[] = [];
        currentCsrs.forEach(csrName => {
          const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
          const docId = `${selectedYear}_${trainerQ}_${trainerSectionSlug}_${slug}`;
          const val = (evalData[docId]?.scores || {})[key];
          if (val && val.toUpperCase() !== "V" && !val.toUpperCase().includes("N/A")) {
            const n = parseFloat(val);
            if (!isNaN(n)) nums.push(n);
          }
        });
        return nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) + "%" : "-";
      });

      let allSum = 0; let allCnt = 0;
      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${trainerQ}_${trainerSectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};
        for (let c = 1; c <= effectiveColCount; c++) {
          const val = scores[`m${trainerMonth}_eval_${c}`];
          if (val && val.toUpperCase() !== "V" && !val.toUpperCase().includes("N/A")) {
            const n = parseFloat(val);
            if (!isNaN(n)) { allSum += n; allCnt++; }
          }
        }
      });
      const totalMonthAvg = allCnt > 0 ? (allSum / allCnt).toFixed(1) + "%" : "-";

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const reportTitle = isCallMon ? "Random Call Monitoring Report" : "Call Training Evaluation Report";
      const reportSubtitle = isCallMon
        ? "Random Call Listening & Monitoring Evaluation • Younis Kamal & Ankido Buya Teams"
        : "Official Monthly Call Training Quality Evaluation Summary • Morning & Evening Teams";
      const reportScope = isCallMon
        ? `${currentCsrs.length} Call Agents (Younis & Ankido Teams)`
        : `${currentCsrs.length} Call Agents (Morning & Evening)`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportTitle} - ${MONTH_NAMES[trainerMonth]} ${selectedYear}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm 15mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .logo { max-height: 48px; object-fit: contain; }
            .title-area h1 { font-size: 20px; font-weight: 900; color: #0d9488; margin: 0 0 3px 0; }
            .title-area p { font-size: 11px; color: #64748b; margin: 0; font-weight: 500; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
            .meta-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
            .meta-item.highlight { background: #f0fdfa; border-color: #99f6e4; }
            .meta-item .label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
            .meta-item .val { font-size: 13px; font-weight: 800; color: #0f172a; }
            .meta-item.highlight .val { color: #0d9488; }
            .data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px; }
            .data-table th { background-color: #f1f5f9; color: #334155; font-weight: 800; text-align: center; padding: 7px 4px; border: 1px solid #cbd5e1; font-size: 10px; }
            .data-table th.agent-col { text-align: left; padding-left: 8px; }
            .data-table th.score-header { background-color: #0d9488; color: #ffffff; }
            .data-table td { border: 1px solid #e2e8f0; padding: 6px 4px; text-align: center; vertical-align: middle; }
            .data-table td.agent-cell { text-align: left; padding-left: 8px; font-weight: 700; color: #0f172a; }
            tr.total-row td { background-color: #f0fdfa !important; color: #0f766e !important; font-weight: 900; font-size: 11px; border-top: 2px solid #0d9488; border-bottom: 2px solid #0d9488; padding: 8px 4px; }
            tr.total-row td.total-avg-cell { background-color: #0d9488 !important; color: #ffffff !important; font-size: 12px; font-weight: 900; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 130px; vertical-align: middle;">
                <img src="${window.location.origin}/logo.webp" class="logo" alt="FIB Logo" />
              </td>
              <td class="title-area" style="vertical-align: middle;">
                <h1>${reportTitle}</h1>
                <p>${reportSubtitle}</p>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 10px; color: #64748b;">
                  <div>Export Date: <strong>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                  <div style="margin-top: 2px;">Trainer: <strong style="color: #0d9488;">Mohammed Azad</strong></div>
                </div>
              </td>
            </tr>
          </table>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="label">Year & Month</div>
              <div class="val">${selectedYear} • ${MONTH_NAMES[trainerMonth]}</div>
            </div>
            <div class="meta-item">
              <div class="label">Scope</div>
              <div class="val">${reportScope}</div>
            </div>
            <div class="meta-item">
              <div class="label">Trainer</div>
              <div class="val">Mohammed Azad</div>
            </div>
            <div class="meta-item highlight">
              <div class="label">Team Month Avg</div>
              <div class="val">${totalMonthAvg}</div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 32px;">#</th>
                <th class="agent-col" style="min-width: 170px;">Agent Name</th>
                ${Array.from({ length: effectiveColCount }, (_, i) => i + 1).map(c => `<th style="width: 65px;">Eval ${c}</th>`).join('')}
                <th class="score-header" style="width: 95px;">${MONTH_NAMES[trainerMonth]} Avg</th>
              </tr>
            </thead>
            <tbody>
              ${rowsData.map(r => `
                <tr>
                  <td style="color: #94a3b8; font-size: 10px; font-weight: 600;">${r.idx}</td>
                  <td class="agent-cell">${r.csrName}</td>
                  ${r.evalVals.map(e => `<td><span style="font-weight: 800;">${e.val}</span></td>`).join('')}
                  <td><span style="font-weight: 900; color: #0d9488;">${r.agentAvg}</span></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2" style="text-align: left; padding-left: 12px; text-transform: uppercase;">Team Average</td>
                ${colAverages.map(avg => `<td>${avg}</td>`).join('')}
                <td class="total-avg-cell">${totalMonthAvg}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; font-weight: 600;">
            <div>Quality Assurance System • Official Confidential Report</div>
            <div>System Engineered by <strong style="color: #0d9488;">${getSystemAuthor()}</strong></div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      return;
    }

    if (isCShift) {
      const rowsData = currentCsrs.map((csrName, idx) => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${slug}`;
        const scores = evalData[docId]?.scores || {};
        const notes = evalData[docId]?.notes || {};
        const weekAvg = computeWeekAvg(scores, selectedWeek, isChatTeam, selectedYear, selectedQuarter, true);

        const chatVals = [1, 2, 3].map(cNum => {
          const key = `w${selectedWeek}_chat_${cNum}`;
          const val = scores[key] ?? "-";
          const note = notes[key] ?? "";
          return { val, note };
        });

        return {
          idx: idx + 1,
          csrName,
          chatVals,
          weekAvg: weekAvg !== "-" && weekAvg !== "V" ? `${weekAvg}%` : weekAvg
        };
      });

      const colAverages = [1, 2, 3].map(cNum => {
        const key = `w${selectedWeek}_chat_${cNum}`;
        const nums: number[] = [];
        currentCsrs.forEach(csrName => {
          const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
          const docId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${slug}`;
          const val = (evalData[docId]?.scores || {})[key];
          if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
            const n = parseFloat(val);
            if (!isNaN(n)) nums.push(n);
          }
        });
        return nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) + "%" : "-";
      });

      const weekAverages: number[] = [];
      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${slug}`;
        const scores = evalData[docId]?.scores || {};
        const avgStr = computeWeekAvg(scores, selectedWeek, isChatTeam, selectedYear, selectedQuarter, true);
        if (avgStr !== "-" && avgStr !== "V") {
          const n = parseFloat(avgStr);
          if (!isNaN(n)) weekAverages.push(n);
        }
      });
      const totalWeekTeamAvg = weekAverages.length > 0 ? (weekAverages.reduce((a, b) => a + b, 0) / weekAverages.length).toFixed(1) + "%" : "-";

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>FIB_Quality_CShift_${selectedYear}_${selectedQuarter}_Week${selectedWeek}</title>
            <style>
              @page { size: A4 landscape; margin: 10mm 12mm; }
              * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif; }
              body { color: #0f172a; background: #ffffff; margin: 0; padding: 6px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .header-table { width: 100%; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px; }
              .logo { height: 42px; width: auto; object-fit: contain; }
              .title-area h1 { font-size: 22px; font-weight: 900; color: #00A991; margin: 0 0 3px 0; letter-spacing: -0.3px; }
              .title-area p { font-size: 11px; color: #64748b; margin: 0; font-weight: 500; }
              .meta-badge-box { display: inline-block; text-align: right; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; }
              .meta-badge-box .meta-line { font-size: 10px; color: #64748b; font-weight: 500; }
              .meta-badge-box .meta-line strong { color: #0f172a; font-weight: 700; }
              .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
              .meta-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 14px; }
              .meta-item.highlight { background: #f0fdfa; border: 1.5px solid #99f6e4; }
              .meta-item .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; color: #64748b; }
              .meta-item.highlight .label { color: #0f766e; }
              .meta-item .val { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; }
              .meta-item.highlight .val { color: #00A991; font-size: 15px; font-weight: 900; }
              table.data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
              table.data-table th { background-color: #00A991; color: #ffffff; font-weight: 800; text-align: center; padding: 8px 5px; font-size: 11px; letter-spacing: 0.2px; border-bottom: 1px solid #0b7f74; }
              table.data-table th.agent-col { text-align: left; padding-left: 12px; }
              table.data-table th.score-header { background-color: #0b7f74 !important; color: #ffffff; font-weight: 900; }
              table.data-table td { padding: 6px 4px; text-align: center; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f8fafc; font-weight: 600; }
              table.data-table td.agent-cell { text-align: left; padding-left: 12px; font-weight: 700; color: #0f172a; }
              table.data-table tr:nth-child(even) td { background-color: #fbfcfd; }
              table.data-table tr:nth-child(odd) td { background-color: #ffffff; }
              .badge-score { background-color: #f0fdfa; color: #0f766e; font-weight: 900; padding: 2.5px 7px; border-radius: 6px; border: 1px solid #99f6e4; font-size: 11px; display: inline-block; }
              tr.total-row td { background-color: #f0fdfa !important; color: #0f766e !important; font-weight: 900; font-size: 11px; border-top: 2px solid #00A991; border-bottom: 2px solid #00A991; padding: 8px 4px; }
              tr.total-row td.total-avg-cell { background-color: #00A991 !important; color: #ffffff !important; font-size: 12px; font-weight: 900; }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr>
                <td style="width: 130px; vertical-align: middle;">
                  <img src="${window.location.origin}/logo.webp" class="logo" alt="FIB Logo" />
                </td>
                <td class="title-area" style="vertical-align: middle;">
                  <h1>Chat Quality Assurance Report (C Shift)</h1>
                  <p>Mohammed Dlshad — Evening Call Team (Younis Kamal Team • 3 Chats Quality Evaluation)</p>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <div class="meta-badge-box">
                    <div class="meta-line">Export Date: <strong>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                    <div class="meta-line" style="margin-top: 2px;">Evaluator: <strong style="color: #00A991;">Mohammed Dlshad (C Shift)</strong></div>
                  </div>
                </td>
              </tr>
            </table>

            <div class="meta-grid">
              <div class="meta-item">
                <div class="label">Year & Quarter</div>
                <div class="val">${selectedYear} • ${selectedQuarter}</div>
              </div>
              <div class="meta-item">
                <div class="label">Week Number</div>
                <div class="val">Week ${selectedWeek} (Chats 1–3)</div>
              </div>
              <div class="meta-item">
                <div class="label">Target Team</div>
                <div class="val">Evening Call Team (Younis Kamal)</div>
              </div>
              <div class="meta-item highlight">
                <div class="label">Team Week Avg</div>
                <div class="val">${totalWeekTeamAvg}</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 32px;">#</th>
                  <th class="agent-col" style="min-width: 170px;">Agent Name</th>
                  <th style="width: 80px;">Chat 1</th>
                  <th style="width: 80px;">Chat 2</th>
                  <th style="width: 80px;">Chat 3</th>
                  <th class="score-header" style="width: 100px;">Week ${selectedWeek} Score</th>
                </tr>
              </thead>
              <tbody>
                ${rowsData.map(r => `
                  <tr>
                    <td style="color: #94a3b8; font-size: 10px; font-weight: 600;">${r.idx}</td>
                    <td class="agent-cell">${r.csrName}</td>
                    ${r.chatVals.map(c => `<td><span style="font-weight: 800;">${c.val}</span></td>`).join('')}
                    <td><span class="badge-score">${r.weekAvg}</span></td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" style="text-align: left; padding-left: 12px; text-transform: uppercase;">Team Average</td>
                  ${colAverages.map(avg => `<td>${avg}</td>`).join('')}
                  <td class="total-avg-cell">${totalWeekTeamAvg}</td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; font-weight: 600;">
              <div>Quality Assurance System • Official Confidential Report</div>
              <div>System Engineered by <strong style="color: #00A991;">${getSystemAuthor()}</strong></div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return;
    }

    const exportSectionSlug = getActiveSectionSlug(currentSection.evaluator);

    if (isBonus) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const rowsData = currentCsrs.map((csrName, idx) => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};
        const notes = evalData[docId]?.notes || {};
        const bonusAvg = computeBonusAgentAvg(scores, bonusColCount);

        const callVals = Array.from({ length: bonusColCount }, (_, i) => i + 1).map(cNum => {
          const key = isChatTeam ? `chat_${cNum}` : `call_${cNum}`;
          const wKey = `w${Math.floor((cNum - 1) / 6) + 1}_${isChatTeam ? "chat" : "call"}_${cNum}`;
          const val = scores[key] ?? scores[`call_${cNum}`] ?? scores[`chat_${cNum}`] ?? scores[wKey] ?? "-";
          const note = notes[key] ?? notes[`call_${cNum}`] ?? notes[`chat_${cNum}`] ?? notes[wKey] ?? "";
          return { val, note };
        });

        return {
          idx: idx + 1,
          csrName,
          callVals,
          bonusAvg: bonusAvg !== "-" && bonusAvg !== "V" ? `${bonusAvg}%` : bonusAvg
        };
      });

      const colAverages = Array.from({ length: bonusColCount }, (_, i) => i + 1).map(cNum => {
        const key = isChatTeam ? `chat_${cNum}` : `call_${cNum}`;
        const wKey = `w${Math.floor((cNum - 1) / 6) + 1}_${isChatTeam ? "chat" : "call"}_${cNum}`;
        const nums: number[] = [];
        currentCsrs.forEach(csrName => {
          const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
          const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
          const val = (evalData[docId]?.scores || {})[key] ?? (evalData[docId]?.scores || {})[`call_${cNum}`] ?? (evalData[docId]?.scores || {})[`chat_${cNum}`] ?? (evalData[docId]?.scores || {})[wKey];
          if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
            const n = parseFloat(val);
            if (!isNaN(n)) nums.push(n);
          }
        });
        return nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) + "%" : "-";
      });

      const bonusAverages: number[] = [];
      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
        const scores = evalData[docId]?.scores || {};
        const avgStr = computeBonusAgentAvg(scores, bonusColCount);
        if (avgStr !== "-" && avgStr !== "V") {
          const n = parseFloat(avgStr);
          if (!isNaN(n)) bonusAverages.push(n);
        }
      });
      const totalBonusTeamAvg = bonusAverages.length > 0
        ? (bonusAverages.reduce((a, b) => a + b, 0) / bonusAverages.length).toFixed(1) + "%"
        : "-";

      const colLabel = isChatTeam ? "Chat" : "Call";

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${currentSection.evaluator} - Bonus Quality Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #00A991; padding-bottom: 16px; }
              .title { font-size: 20px; font-weight: 800; color: #00A991; margin: 0; }
              .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; font-size: 11px; }
              th { background: #f0fdfa; color: #00A991; font-weight: 700; padding: 6px; border: 1px solid #ccfbf1; text-align: center; }
              td { padding: 6px; border: 1px solid #e2e8f0; text-align: center; }
              .agent-cell { text-align: left; font-weight: 700; }
              .badge-score { background: #00A991; color: white; padding: 2px 6px; border-radius: 6px; font-weight: 800; }
              .total-row { background: #f0fdfa; font-weight: 800; color: #00A991; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">${currentSection.evaluator} — Bonus Evaluations</h1>
                <div class="sub">${selectedQuarter} ${selectedYear} • ${colLabel}s 1 to ${bonusColCount}${isChatTeam ? "" : " • Younis + Ankido Teams"} (${currentCsrs.length} Agents)</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 30px;">#</th>
                  <th style="text-align: left;">Agent</th>
                  ${Array.from({ length: bonusColCount }, (_, i) => `<th>${colLabel} ${i + 1}</th>`).join('')}
                  <th style="background: #00A991; color: white;">Bonus Avg</th>
                </tr>
              </thead>
              <tbody>
                ${rowsData.map(r => `
                  <tr>
                    <td style="color: #94a3b8; font-size: 10px; font-weight: 600;">${r.idx}</td>
                    <td class="agent-cell">${r.csrName}</td>
                    ${r.callVals.map(c => `<td><span style="font-weight: 800;">${c.val}</span></td>`).join('')}
                    <td><span class="badge-score">${r.bonusAvg}</span></td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" style="text-align: left; padding-left: 12px; text-transform: uppercase;">Team Average</td>
                  ${colAverages.map(avg => `<td>${avg}</td>`).join('')}
                  <td class="total-avg-cell">${totalBonusTeamAvg}</td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; font-weight: 600;">
              <div>Quality Assurance System • Official Confidential Report</div>
              <div>System Engineered by <strong style="color: #00A991;">${getSystemAuthor()}</strong></div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return;
    }

    const rowsData = currentCsrs.map((csrName, idx) => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
      const scores = evalData[docId]?.scores || {};
      const notes = evalData[docId]?.notes || {};
      const weekAvg = computeWeekAvg(scores, selectedWeek, isChatTeam, selectedYear, selectedQuarter);

      const config = getWeekColumnsConfig(isChatTeam, selectedYear, selectedQuarter, selectedWeek);
      const callVals = Array.from({ length: config.colCount }, (_, i) => i + 1).map(cNum => {
        const key = isChatTeam ? `w${selectedWeek}_chat_${cNum}` : `w${selectedWeek}_call_${config.callBase + cNum}`;
        const val = scores[key] ?? (isChatTeam ? (scores[`w${selectedWeek}_call_${cNum}`] ?? scores[`w${selectedWeek}_call_${config.callBase + cNum}`]) : undefined) ?? "-";
        const note = notes[key] ?? (isChatTeam ? (notes[`w${selectedWeek}_call_${cNum}`] ?? notes[`w${selectedWeek}_call_${config.callBase + cNum}`]) : undefined) ?? "";
        return { val, note };
      });

      const outboundVal = config.hasOutbound
        ? { val: scores[`w${selectedWeek}_outbound`] || "-", note: notes[`w${selectedWeek}_outbound`] || "" }
        : null;

      return {
        idx: idx + 1,
        csrName,
        callVals,
        outboundVal,
        weekAvg: weekAvg !== "-" && weekAvg !== "V" ? `${weekAvg}%` : weekAvg
      };
    });

    const exportWeekCfg = getWeekColumnsConfig(isChatTeam, selectedYear, selectedQuarter, selectedWeek);
    const colAverages = Array.from({ length: exportWeekCfg.colCount }, (_, i) => i + 1).map(cNum => {
      const key = isChatTeam ? `w${selectedWeek}_chat_${cNum}` : `w${selectedWeek}_call_${exportWeekCfg.callBase + cNum}`;
      const nums: number[] = [];
      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
        const val = (evalData[docId]?.scores || {})[key] ?? (isChatTeam ? ((evalData[docId]?.scores || {})[`w${selectedWeek}_call_${cNum}`]) : undefined);
        if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
          const n = parseFloat(val);
          if (!isNaN(n)) nums.push(n);
        }
      });
      return nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) + "%" : "-";
    });

    let extraColHeader = "";
    let extraColAvg = "-";
    if (exportWeekCfg.hasOutbound) {
      const outboundNums: number[] = [];
      currentCsrs.forEach(csrName => {
        const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
        const val = (evalData[docId]?.scores || {})[`w${selectedWeek}_outbound`];
        if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
          const n = parseFloat(val);
          if (!isNaN(n)) outboundNums.push(n);
        }
      });
      extraColAvg = outboundNums.length > 0 ? (outboundNums.reduce((a, b) => a + b, 0) / outboundNums.length).toFixed(1) + "%" : "-";
      extraColHeader = `<th class="outbound-header" style="width: 75px;">Outbound</th>`;
    }

    const weekAverages: number[] = [];
    currentCsrs.forEach(csrName => {
      const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${selectedYear}_${selectedQuarter}_${exportSectionSlug}_${slug}`;
      const scores = evalData[docId]?.scores || {};
      const avgStr = computeWeekAvg(scores, selectedWeek, isChatTeam, selectedYear, selectedQuarter);
      if (avgStr !== "-" && avgStr !== "V") {
        const n = parseFloat(avgStr);
        if (!isNaN(n)) weekAverages.push(n);
      }
    });
    const totalWeekTeamAvg = weekAverages.length > 0 ? (weekAverages.reduce((a, b) => a + b, 0) / weekAverages.length).toFixed(1) + "%" : "-";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>FIB_Quality_${selectedYear}_${selectedQuarter}_Week${selectedWeek}_${currentSection.team.replace(/\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif;
            }
            body {
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 6px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-table {
              width: 100%;
              border-bottom: 1.5px solid #e2e8f0;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .logo {
              height: 42px;
              width: auto;
              object-fit: contain;
            }
            .title-area h1 {
              font-size: 22px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 3px 0;
              letter-spacing: -0.3px;
            }
            .title-area p {
              font-size: 11px;
              color: #64748b;
              margin: 0;
              font-weight: 500;
            }
            .meta-badge-box {
              display: inline-block;
              text-align: right;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 6px 12px;
            }
            .meta-badge-box .meta-line {
              font-size: 10px;
              color: #64748b;
              font-weight: 500;
            }
            .meta-badge-box .meta-line strong {
              color: #0f172a;
              font-weight: 700;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 14px;
            }
            .meta-item {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 8px 14px;
            }
            .meta-item.highlight {
              background: #f0fdf4;
              border: 1.5px solid #86efac;
            }
            .meta-item .label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              font-weight: 700;
              color: #64748b;
            }
            .meta-item.highlight .label {
              color: #166534;
            }
            .meta-item .val {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 2px;
            }
            .meta-item.highlight .val {
              color: #166534;
              font-size: 15px;
              font-weight: 900;
            }
            table.data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              font-size: 11px;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              overflow: hidden;
            }
            table.data-table th {
              background-color: #1C6B53;
              color: #ffffff;
              font-weight: 800;
              text-align: center;
              padding: 8px 5px;
              font-size: 11px;
              letter-spacing: 0.2px;
              border-bottom: 1px solid #165a46;
            }
            table.data-table th.agent-col {
              text-align: left;
              padding-left: 12px;
            }
            table.data-table th.outbound-header {
              background-color: #b45309 !important;
              color: #ffffff;
            }
            table.data-table th.score-header {
              background-color: #0f4c3a !important;
              color: #ffffff;
              font-weight: 900;
            }
            table.data-table td {
              padding: 5.5px 4px;
              text-align: center;
              border-bottom: 1px solid #f1f5f9;
              border-right: 1px solid #f8fafc;
              font-weight: 600;
            }
            table.data-table td.agent-cell {
              text-align: left;
              padding-left: 12px;
              font-weight: 700;
              color: #0f172a;
            }
            table.data-table tr:nth-child(even) td {
              background-color: #fbfcfd;
            }
            table.data-table tr:nth-child(odd) td {
              background-color: #ffffff;
            }
            .badge-v {
              background-color: #fef3c7;
              color: #92400e;
              padding: 1.5px 6px;
              border-radius: 4px;
              font-weight: 800;
              font-size: 10px;
              border: 1px solid #fde68a;
            }
            .badge-score {
              background-color: #ecfdf5;
              color: #166534;
              font-weight: 900;
              padding: 2.5px 7px;
              border-radius: 6px;
              border: 1px solid #a7f3d0;
              font-size: 11px;
              display: inline-block;
            }
            .muted-dash {
              color: #cbd5e1;
              font-weight: 400;
            }
            .note-tag {
              display: inline-block;
              font-size: 8px;
              font-weight: 800;
              color: #dc2626;
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 3px;
              padding: 0.5px 3px;
              margin-top: 1px;
            }
            .outbound-col {
              background-color: #fffdf5 !important;
              color: #92400e;
            }
            tr.total-row td {
              background-color: #f0fdf4 !important;
              color: #166534 !important;
              font-weight: 900;
              font-size: 11px;
              border-top: 2px solid #1C6B53;
              border-bottom: 2px solid #1C6B53;
              padding: 8px 4px;
            }
            tr.total-row td.total-avg-cell {
              background-color: #1C6B53 !important;
              color: #ffffff !important;
              font-size: 12px;
              font-weight: 900;
            }
            .footer {
              margin-top: 14px;
              padding-top: 8px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 130px; vertical-align: middle;">
                <img src="${window.location.origin}/logo.webp" class="logo" alt="FIB Logo" />
              </td>
              <td class="title-area" style="vertical-align: middle;">
                <h1>${isChatTeam ? "Chat Quality Assurance Report" : "Quality Assurance Report"}</h1>
                <p>${isChatTeam ? "Official Weekly Chat Quality Evaluation Summary & Performance Metrics" : "Official Weekly Quality Evaluation Summary & Performance Metrics"}</p>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div class="meta-badge-box">
                  <div class="meta-line">Export Date: <strong>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                  <div class="meta-line" style="margin-top: 2px;">Evaluator: <strong style="color: #1C6B53;">${currentSection.evaluator}</strong></div>
                </div>
              </td>
            </tr>
          </table>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="label">Year & Quarter</div>
              <div class="val">${selectedYear} • ${selectedQuarter}</div>
            </div>
            <div class="meta-item">
              <div class="label">Week Number</div>
              <div class="val">Week ${selectedWeek} (${isChatTeam ? `Chats 1–${exportWeekCfg.colCount}${exportWeekCfg.hasOutbound ? " + Outbound" : ""}` : `Calls ${exportWeekCfg.callBase + 1}–${exportWeekCfg.callBase + exportWeekCfg.colCount} + Outbound`})</div>
            </div>
            <div class="meta-item">
              <div class="label">QA Evaluator</div>
              <div class="val">${currentSection.evaluator}</div>
            </div>
            <div class="meta-item highlight">
              <div class="label">Team Week Avg</div>
              <div class="val">${totalWeekTeamAvg}</div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 32px;">#</th>
                <th class="agent-col" style="min-width: 170px;">Agent Name</th>
                ${Array.from({ length: exportWeekCfg.colCount }, (_, i) => i + 1).map(cNum => `<th style="width: 60px;">${isChatTeam ? `Chat ${cNum}` : `Call ${exportWeekCfg.callBase + cNum}`}</th>`).join('')}
                ${extraColHeader}
                <th class="score-header" style="width: 95px;">Week ${selectedWeek} Score</th>
              </tr>
            </thead>
            <tbody>
              ${rowsData.map(r => `
                <tr>
                  <td style="color: #94a3b8; font-size: 10px; font-weight: 600;">${r.idx}</td>
                  <td class="agent-cell">${r.csrName}</td>
                  ${r.callVals.map(c => `
                    <td>
                      ${c.val === 'V' 
                        ? '<span class="badge-v">V</span>' 
                        : c.val === '-' 
                        ? '<span class="muted-dash">—</span>' 
                        : `<span style="font-weight: 800; color: #0f172a;">${c.val}</span>`}
                      ${c.note ? `<br><span class="note-tag">Note</span>` : ''}
                    </td>
                  `).join('')}
                  ${r.outboundVal ? `
                    <td class="outbound-col">
                      ${r.outboundVal.val === 'V' 
                        ? '<span class="badge-v">V</span>' 
                        : r.outboundVal.val === '-' 
                        ? '<span class="muted-dash">—</span>' 
                        : `<span style="font-weight: 800; color: #92400e;">${r.outboundVal.val}</span>`}
                      ${r.outboundVal.note ? `<br><span class="note-tag">Note</span>` : ''}
                    </td>
                  ` : ''}
                  <td>
                    ${r.weekAvg !== '-' && r.weekAvg !== 'V' 
                      ? `<span class="badge-score">${r.weekAvg}</span>` 
                      : r.weekAvg === 'V' 
                      ? '<span class="badge-v">V</span>' 
                      : '<span class="muted-dash">—</span>'}
                  </td>
                </tr>
              `).join('')}

              <tr class="total-row">
                <td colspan="2" style="text-align: left; padding-left: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Team Average</td>
                ${colAverages.map(avg => `<td>${avg === '-' ? '<span class="muted-dash">—</span>' : avg}</td>`).join('')}
                ${exportWeekCfg.hasOutbound ? `
                  <td class="outbound-col" style="font-weight: 900; color: #92400e;">${extraColAvg === '-' ? '<span class="muted-dash">—</span>' : extraColAvg}</td>
                ` : ''}
                <td class="total-avg-cell">${totalWeekTeamAvg}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div>Quality Assurance System • Official Confidential Report</div>
            <div>Week ${selectedWeek} Quality Performance Summary • System Engineered by <strong style="color: #1C6B53;">${getSystemAuthor()}</strong></div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Synchronize completed quality evaluations to Team Leader and Agent dashboards (SEP 2026 onwards only)
  const handleSyncToMetrics = async (targetMonthIdxOverride?: number) => {
    setSyncingMetrics(true);
    try {
      const yNum = parseInt(String(selectedYear), 10);
      if (isNaN(yNum) || yNum < 2026) {
        setSyncToast({
          message: "Quality sync starts from September 2026 onwards (Jan–Aug 2026 retain manual entries).",
          type: "error"
        });
        return;
      }

      const candidateMonthIndices = new Set<number>();
      if (typeof targetMonthIdxOverride === "number") {
        candidateMonthIndices.add(targetMonthIdxOverride);
      } else {
        if (unsyncedPreviousMonth) {
          candidateMonthIndices.add(unsyncedPreviousMonth.monthIdx);
        }
        candidateMonthIndices.add(activeTableMonthIdx);
        quarterMonthIndices.forEach(mIdx => candidateMonthIndices.add(mIdx));
      }

      const eligibleMonths = Array.from(candidateMonthIndices)
        .filter(mIdx => yNum > 2026 || (yNum === 2026 && mIdx >= 8))
        .sort((a, b) => a - b);

      if (eligibleMonths.length === 0) {
        setSyncToast({
          message: "Quality sync starts from September 2026 onwards (Jan–Aug 2026 retain manual entries).",
          type: "error"
        });
        return;
      }

      // Determine target metrics table and team for current section
      let defaultTargetTable = "mohammed_metrics";
      let defaultTargetTeam = "Mohammed Dlshad Team";
      if (currentSection.id === "mohammed_jihad") {
        defaultTargetTable = "younis_metrics";
        defaultTargetTeam = "Younis Kamal Team";
      } else if (currentSection.id === "lara_kamil") {
        defaultTargetTable = "ankido_metrics";
        defaultTargetTeam = "Ankido Buya Team";
      } else if (currentSection.id === "mohammed_dlshad") {
        defaultTargetTable = "mohammed_metrics";
        defaultTargetTeam = "Mohammed Dlshad Team";
      }

      let syncedCount = 0;
      const syncedMonthNames: string[] = [];
      const nowIso = new Date().toISOString();
      const nextSyncedRegistry = { ...syncedMonthsRegistry };

      for (const mIdx of eligibleMonths) {
        const st = computeMonthSyncStatus(mIdx);
        if (!st.isSyncEligible || !st.isMonthComplete) continue;

        const mUpper = st.upperMonth;
        const mSnap = await getDocs(
          query(
            collection(db, defaultTargetTable),
            where("month", "==", mUpper),
            where("year", "==", selectedYear)
          )
        );

        for (const [csrName, verifiedAvg] of Object.entries(st.agentScores)) {
          if (!verifiedAvg) continue;

          const matchingDocs = mSnap.docs.filter(
            d => (d.data().agent_name || "").trim().toLowerCase() === csrName.trim().toLowerCase()
          );

          if (matchingDocs.length > 0) {
            for (const mDoc of matchingDocs) {
              await updateDoc(doc(db, defaultTargetTable, mDoc.id), {
                quality: verifiedAvg,
                agent_name: csrName
              });
            }
          } else {
            await addDoc(collection(db, defaultTargetTable), {
              agent_name: csrName,
              team: defaultTargetTeam,
              month: mUpper,
              year: selectedYear,
              quality: verifiedAvg,
              display_name: csrName
            });
          }
          syncedCount++;
        }

        nextSyncedRegistry[st.syncKey] = {
          synced_at: nowIso,
          latest_score_ts: st.latestScoreTs || nowIso,
          synced_by: userProfile?.name || userProfile?.email || currentSection.evaluator,
          count: Object.keys(st.agentScores).length
        };
        syncedMonthNames.push(`${st.monthName} ${selectedYear}`);
      }

      if (syncedCount > 0) {
        await setDoc(
          doc(db, "quality_evaluations", "config_sync_status"),
          {
            synced_months: nextSyncedRegistry,
            updated_at: nowIso
          },
          { merge: true }
        );
        setSyncedMonthsRegistry(nextSyncedRegistry);
        setSyncReminderModal(null);
        setSyncToast({
          message: `Synced ${syncedMonthNames.join(", ")} (${syncedCount} agent records) to Team Leader & Agent Dashboards!`,
          type: "success"
        });
      } else {
        const activeSt = computeMonthSyncStatus(activeTableMonthIdx);
        setSyncToast({
          message: `Cannot sync ${activeSt.monthName} ${selectedYear} yet (${activeSt.completedWeeksCount}/4 weeks completed). Complete all 4 weeks of the month first.`,
          type: "error"
        });
      }
    } catch (err: any) {
      setSyncToast({
        message: `Error syncing quality scores: ${err.message}`,
        type: "error"
      });
    } finally {
      setSyncingMetrics(false);
      setTimeout(() => setSyncToast(null), 5500);
    }
  };

  return (
    <div className="min-h-screen p-3.5 sm:p-6 md:p-10 font-sans transition-colors bg-[#F9F8F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-[1700px] mx-auto space-y-6">

        {/* Top Header & Brand Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3.5">
            <img src="/logo.webp" alt="FIB Logo" className="h-10 sm:h-12 w-auto object-contain" />
            <div className="h-8 sm:h-10 w-[1.5px] bg-gray-200 dark:bg-gray-700" />
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                  Quality Assurance Dashboard
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {isTrainer
                  ? "Mohammed Azad — Call Training Evaluations (Open Count)"
                  : isCShift
                  ? "Mohammed Dlshad — C Shift Weekly Chat Evaluations (3 Chats)"
                  : isChatTeam
                  ? "Weekly Chat Evaluations & Performance Overview"
                  : "Weekly Call Evaluations & Performance Overview"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            {/* Real-time Save Status */}
            {saveStatus !== "idle" && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                saveStatus === "saving" 
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}>
                {saveStatus === "saving" ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-amber-600" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck size={13} className="text-emerald-600" />
                    <span>Saved</span>
                  </>
                )}
              </div>
            )}

            {canSwitchTeams ? (
              <div className="flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1C6B53] dark:text-emerald-400 bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                  title="Return to Main Dashboard"
                >
                  <ArrowLeft size={14} /> <span>Back</span>
                </button>
                {toggleDarkMode && (
                  <>
                    <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                    <button
                      onClick={toggleDarkMode}
                      className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 transition shrink-0 cursor-pointer"
                      title="Toggle Dark Mode"
                    >
                      {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Dark Mode Toggle */}
                {toggleDarkMode && (
                  <button 
                    onClick={toggleDarkMode} 
                    className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 transition shadow-xs cursor-pointer"
                    title="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
                  </button>
                )}

                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />

                {/* Profile Button (Placed right next to Sign Out) */}
                <button 
                  onClick={handleOpenProfile}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition shadow-xs group cursor-pointer"
                  title="Profile Settings"
                >
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-tr from-[#1C6B53] to-emerald-400 flex items-center justify-center overflow-hidden ring-2 ring-[#1C6B53]/20 dark:ring-emerald-400/20 text-white font-black text-xs shadow-xs shrink-0">
                    {userProfile?.photo_url ? (
                      <img src={userProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <Users size={12} />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="max-w-[70px] sm:max-w-[120px] truncate group-hover:text-[#1C6B53] dark:group-hover:text-emerald-400 transition-colors">
                      {userProfile?.name || 'QA Evaluator'}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60">
                      QA
                    </span>
                  </div>
                </button>

                {/* Sign Out (Logout) Button */}
                <button
                  onClick={onLogout || onBack}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/40 border border-gray-200 dark:border-gray-700 transition shadow-xs cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Top Evaluator Performance Card (Clean, Title Case, No Subtitle Line from Image 3) */}
        <div className="bg-gradient-to-br from-[#1C6B53] via-[#165a46] to-[#104334] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl shadow-[#1C6B53]/15 border border-emerald-500/30 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                <Award size={24} className="text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-200">
                    {isTrainer ? "Call Training Performance" : "QA Evaluator Performance"}
                  </span>
                  {selectedMonthFilter !== null && !isTrainer && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-[10px] font-black tracking-wider uppercase backdrop-blur-xs">
                      {MONTH_NAMES[selectedMonthFilter]}
                    </span>
                  )}
                  {isTrainer && (
                    <span className="px-2 py-0.5 rounded-lg bg-teal-500/40 text-white text-[10px] font-black tracking-wider uppercase backdrop-blur-xs border border-teal-300/30">
                      {MONTH_NAMES[trainerMonth]}
                    </span>
                  )}
                </div>
                {/* Main Evaluator Name Title */}
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  {currentSection.evaluator}
                </h2>
              </div>
            </div>

            {/* Top Card Controls: Period Toggle (Quarter, H1, H2, Full Year) & Team Switcher for Admin/Manager */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Card Summary Period Selector (Hidden for Trainer) */}
              {!isTrainer && (
                <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonthFilter(null);
                      setCardPeriodMode("quarter");
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      cardPeriodMode === "quarter" && selectedMonthFilter === null
                        ? "bg-white text-[#1C6B53] font-black shadow-xs" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    title="Quarter Summary"
                  >
                    {selectedQuarter}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonthFilter(null);
                      setCardPeriodMode("h1");
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      cardPeriodMode === "h1" && selectedMonthFilter === null
                        ? "bg-white text-[#1C6B53] font-black shadow-xs" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    title="Semi-Annual 1 (Q1 + Q2)"
                  >
                    H1 (Semi)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonthFilter(null);
                      setCardPeriodMode("h2");
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      cardPeriodMode === "h2" && selectedMonthFilter === null
                        ? "bg-white text-[#1C6B53] font-black shadow-xs" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    title="Semi-Annual 2 (Q3 + Q4)"
                  >
                    H2 (Semi)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonthFilter(null);
                      setCardPeriodMode("year");
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      cardPeriodMode === "year" && selectedMonthFilter === null
                        ? "bg-white text-[#1C6B53] font-black shadow-xs" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    title="Full Year Summary"
                  >
                    Full Year
                  </button>
                </div>
              )}


              {canSwitchTeams && (
                <div className="flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                  {DEFAULT_SECTIONS.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        effectiveSectionId === sec.id
                          ? "bg-white text-[#1C6B53] shadow-xs font-black"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {sec.evaluator}
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Metric KPI Cards Grid: 4 Clean, Balanced, Modern Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Quality Avg / Score */}
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 transition shadow-xs flex flex-col justify-between min-h-[105px]">
              <div className="text-xs font-bold text-emerald-100/90 tracking-wide">
                {isTrainer ? `${MONTH_NAMES[trainerMonth]} Quality Score` : (selectedMonthFilter !== null ? `${MONTH_NAMES[selectedMonthFilter]} Score` : "Quality Score")}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1">
                {teamQualityStats.annualAvg !== "-" ? `${teamQualityStats.annualAvg}%` : "—"}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold">
                {isTrainer ? "Average Quality Score" : (selectedMonthFilter !== null ? "Monthly Quality Score" : "Overall Quality Average")}
              </div>
            </div>

            {/* 2. Completed Weeks / Logged Evaluations */}
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 transition shadow-xs flex flex-col justify-between min-h-[105px]">
              <div className="text-xs font-bold text-emerald-100/90 tracking-wide">
                {isTrainer ? "Completed Evaluations" : "Completed Weeks"}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1">
                {isTrainer ? teamQualityStats.totalCallsAudited : `${teamQualityStats.weeksCount} / ${teamQualityStats.totalWeeksInPeriod}`}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold">
                {isTrainer ? `${MONTH_NAMES[trainerMonth]} Total Logged` : (selectedMonthFilter !== null ? `${MONTH_NAMES[selectedMonthFilter]} Weeks Logged` : "Weeks Logged")}
              </div>
            </div>

            {/* 3. Evaluation Target (Formally planned evaluations, no 'Audit') */}
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 transition shadow-xs flex flex-col justify-between min-h-[105px]">
              <div className="text-xs font-bold text-emerald-100/90 tracking-wide">
                {isTrainer ? "Evaluation Target" : "Target Progress"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight my-1">
                {teamQualityStats.totalCallsAudited} / {teamQualityStats.totalTargetCalls}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold">{teamQualityStats.auditProgressPercent}% Target Achieved</div>
            </div>

            {/* 4. Top QA Agent / Performer */}
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 transition shadow-xs flex flex-col justify-between min-h-[105px]">
              <div className="text-xs font-bold text-emerald-100/90 tracking-wide">
                {isTrainer ? `Top Performer (${MONTH_NAMES[trainerMonth]})` : (selectedMonthFilter !== null ? `Top Performer (${MONTH_NAMES[selectedMonthFilter]})` : "Top Performer")}
              </div>
              <div className="text-base sm:text-lg font-black text-white tracking-tight my-1 truncate" title={teamQualityStats.topAgent}>
                {teamQualityStats.topAgent}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold">
                {isTrainer ? "Highest Monthly Score" : (selectedMonthFilter !== null ? "Highest Monthly Score" : "Highest Overall Score")}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Quarter & Week Selection Bar for Data Entry (Single Row) */}
        <div className="sticky top-2 z-50 flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-2 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 w-full shadow-md flex-nowrap overflow-visible">
          
          {/* Static Left Controls: Year & Month */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Year Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={`appearance-none pl-3 pr-7 py-2 text-xs font-black rounded-xl text-white shadow-xs outline-none cursor-pointer border-0 ${
                  isTrainer ? "bg-[#0d9488]" : "bg-[#1C6B53]"
                }`}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" />
            </div>

            {/* Modern Month Dropdown (For Regular QA: filters month) */}
            {!isTrainer && (
              <div ref={monthDropdownRef} className={`relative shrink-0 ${isMonthMenuOpen ? "z-50" : ""}`}>
                <button
                  ref={monthButtonRef}
                  type="button"
                  onClick={toggleMonthMenu}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs border ${
                    selectedMonthFilter !== null
                      ? "bg-[#00A991] text-white border-[#00A991] shadow-md shadow-[#00A991]/25 scale-[1.02]"
                      : "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40"
                  }`}
                  title="Filter by Month"
                >
                  <Calendar size={13} className={selectedMonthFilter !== null ? "text-white" : "text-[#1C6B53] dark:text-emerald-400"} />
                  <span>{selectedMonthFilter !== null ? MONTH_NAMES[selectedMonthFilter] : "All Months"}</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isMonthMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isMonthMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[60] bg-transparent" 
                      onClick={() => setIsMonthMenuOpen(false)} 
                    />
                    <div 
                      className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 z-[70] w-48 animate-in fade-in zoom-in-95 duration-150"
                    >
                    <button
                      type="button"
                      onClick={() => {
                        handleMonthSelect(null);
                        setIsMonthMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer mb-1.5 ${
                        selectedMonthFilter === null
                          ? "bg-[#1C6B53] text-white font-black shadow-xs"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>All Months</span>
                      {selectedMonthFilter === null && <Check size={13} />}
                    </button>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                    
                    <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto p-0.5">
                      {MONTH_NAMES.map((name, idx) => {
                        const isSel = selectedMonthFilter === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleMonthSelect(idx);
                              setIsMonthMenuOpen(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isSel
                                ? "bg-[#00A991] text-white font-black shadow-xs"
                                : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-[#1C6B53]"
                            }`}
                          >
                            <span>{name}</span>
                            {isSel && <Check size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />

          {/* Mohammed Dlshad: Shift Switcher (Main Shift vs C shift vs Bonus) */}
          {isChatTeam && (
            <>
              <div className="flex items-center p-0.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setDlshadShift("main")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    dlshadShift === "main"
                      ? "bg-[#1C6B53] text-white shadow-xs scale-[1.02]"
                      : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  Main Shift
                </button>
                <button
                  type="button"
                  onClick={() => setDlshadShift("c_shift")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    dlshadShift === "c_shift"
                      ? "bg-[#00A991] text-white shadow-xs scale-[1.02]"
                      : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  C shift
                </button>
                <button
                  type="button"
                  onClick={() => setDlshadShift("bonus")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    dlshadShift === "bonus"
                      ? "bg-[#00A991] text-white shadow-xs scale-[1.02]"
                      : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  Bonus
                </button>
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />
            </>
          )}

          {/* Lara Kamil & Mohammed Jihad: Shift Switcher (Main Shift vs Bonus) */}
          {isCallEvaluator && (
            <>
              <div className="flex items-center p-0.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setCallShift("main")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    callShift === "main"
                      ? "bg-[#1C6B53] text-white shadow-xs scale-[1.02]"
                      : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  Main Shift
                </button>
                <button
                  type="button"
                  onClick={() => setCallShift("bonus")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    callShift === "bonus"
                      ? "bg-[#00A991] text-white shadow-xs scale-[1.02]"
                      : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  Bonus
                </button>
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />
            </>
          )}

          {/* Quarter Tabs (Q1, Q2, Q3, Q4) - ONLY FOR QA EVALUATORS, REMOVED FOR TRAINER */}
          {!isTrainer && (
            <>
              <div className="flex items-center gap-1 shrink-0">
                {QUARTERS.map(q => {
                  const isSel = selectedQuarter === q.id && selectedMonthFilter === null;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuarter(q.id);
                        setSelectedMonthFilter(null);
                        if (q.id === initialPeriod.quarter && selectedYear === initialPeriod.year) {
                          setSelectedWeek(initialPeriod.week);
                        } else {
                          setSelectedWeek(1);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        isSel
                          ? "bg-[#00A991] text-white shadow-md shadow-[#00A991]/30 scale-[1.02]"
                          : "text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                      }`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />
            </>
          )}

          {/* TRAINER VIEW: All 12 Complete Month Tabs (Jan to Dec) & Add / Remove Column Buttons */}
          {isTrainer ? (
            <div className="flex items-center gap-2 shrink-0">
              {/* Azad Shift Switcher: Training | Call Mon */}
              <div className="flex items-center p-0.5 bg-teal-50/70 dark:bg-teal-950/40 rounded-xl border border-teal-200/80 dark:border-teal-800/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setAzadShift("training")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    azadShift === "training"
                      ? "bg-[#0d9488] text-white shadow-xs scale-[1.02]"
                      : "text-teal-800 dark:text-teal-300 hover:bg-teal-100/60 dark:hover:bg-teal-900/40"
                  }`}
                >
                  Training
                </button>
                <button
                  type="button"
                  onClick={() => setAzadShift("call_mon")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    azadShift === "call_mon"
                      ? "bg-[#0f766e] text-white shadow-xs scale-[1.02]"
                      : "text-teal-800 dark:text-teal-300 hover:bg-teal-100/60 dark:hover:bg-teal-900/40"
                  }`}
                >
                  Call Mon
                </button>
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />

              {/* 12 Months Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-900/70 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shrink-0">
                {MONTH_NAMES.map((mName, mIdx) => {
                  const isSel = trainerMonth === mIdx;
                  return (
                    <button
                      key={mIdx}
                      type="button"
                      onClick={() => {
                        setTrainerMonth(mIdx);
                        setSelectedQuarter(`Q${Math.floor(mIdx / 3) + 1}`);
                      }}
                      className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isSel
                          ? "bg-[#0d9488] text-white shadow-xs font-black scale-[1.02]"
                          : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>

              {/* Add Evaluation Column Button */}
              <button
                type="button"
                onClick={() => {
                  if (isCallMon) {
                    setCallMonColCount(prev => {
                      const next = prev + 1;
                      setTimeout(() => {
                        if (tableContainerRef.current) {
                          tableContainerRef.current.scrollTo({
                            left: tableContainerRef.current.scrollWidth,
                            behavior: "smooth"
                          });
                        }
                      }, 100);
                      return next;
                    });
                  } else {
                    setTrainerColCount(prev => {
                      const next = prev + 1;
                      setTimeout(() => {
                        if (tableContainerRef.current) {
                          tableContainerRef.current.scrollTo({
                            left: tableContainerRef.current.scrollWidth,
                            behavior: "smooth"
                          });
                        }
                      }, 100);
                      return next;
                    });
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ${isCallMon ? "bg-[#0f766e] hover:bg-[#0d6962]" : "bg-[#0d9488] hover:bg-[#0b7f74]"} text-white text-xs font-black shadow-xs hover:shadow-md transition cursor-pointer shrink-0 active:scale-95`}
                title="Add Evaluation Column"
              >
                <Plus size={13} className="stroke-[2.5]" />
                <span>Add</span>
              </button>

              {/* Remove Evaluation Column Button */}
              <button
                type="button"
                onClick={() => handleRemoveTrainerColumn(isCallMon ? callMonColCount : trainerColCount)}
                disabled={(isCallMon ? callMonColCount : trainerColCount) <= 1}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 text-xs font-black transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                title="Remove Last Evaluation Column"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          ) : isBonus ? (
            /* BONUS VIEW: Add & Delete Call/Chat Columns */
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0">
                {isChatTeam ? <MessageSquare size={12} className="text-[#00A991]" /> : <PhoneIncoming size={12} className="text-[#00A991]" />}
                <span>{isChatTeam ? "Bonus Chats" : "Bonus Calls"} (1 to {bonusColCount})</span>
              </div>

              {/* Add Call/Chat Column Button */}
              <button
                type="button"
                onClick={handleAddBonusColumn}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00A991] hover:bg-[#008f7a] text-white text-xs font-black shadow-xs hover:shadow-md transition cursor-pointer shrink-0 active:scale-95"
                title={isChatTeam ? "Add Bonus Chat Column" : "Add Bonus Call Column"}
              >
                <Plus size={13} className="stroke-[2.5]" />
                <span>Add</span>
              </button>

              {/* Delete Call/Chat Column Button */}
              <button
                type="button"
                onClick={() => handleRemoveBonusColumn(bonusColCount)}
                disabled={bonusColCount <= 1}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 text-xs font-black transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                title={isChatTeam ? "Remove Last Bonus Chat Column" : "Remove Last Bonus Call Column"}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          ) : (
            /* REGULAR QA VIEW: 12 Week Tabs */
            <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto scrollbar-thin py-0.5 px-2 pr-4">
              {weeksList.map(w => {
                const isSel = selectedWeek === w;
                return (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`shrink-0 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      isSel
                        ? "bg-[#1C6B53] text-white shadow-md shadow-[#1C6B53]/25 scale-[1.02]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    }`}
                  >
                    Week {w}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Quality Data Table: Focused Week / Trainer Month View */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Week Section Subheader */}
          <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-gray-50 via-white to-gray-50/90 dark:from-gray-800/95 dark:via-gray-900 dark:to-gray-800/95 border-b border-gray-200 dark:border-gray-700/80 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
            {/* Left Info Cluster */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-black shadow-xs ${isCallMon ? "bg-[#0f766e]" : isTrainer ? "bg-[#0d9488]" : isCShift || isBonus ? "bg-[#00A991]" : "bg-[#1C6B53]"}`}>
                <Calendar size={12} className="opacity-85 shrink-0" />
                <span>{isCallMon ? `${MONTH_NAMES[trainerMonth]} Call Mon` : isTrainer ? `${MONTH_NAMES[trainerMonth]} Evaluations` : isBonus ? `Bonus Evaluations` : `Week ${selectedWeek}`}</span>
              </div>

              <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />

              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100/90 dark:bg-gray-800 text-xs font-extrabold text-gray-700 dark:text-gray-200 border border-gray-200/70 dark:border-gray-700/70">
                {isCallMon
                  ? "Mohammed Azad — Call Mon (Younis + Ankido Teams)"
                  : isTrainer 
                  ? "Mohammed Azad — Call Training Evaluations (Open Count • Morning & Evening)"
                  : isCShift
                  ? "Chats 1 to 3"
                  : isBonus
                  ? `${currentSection.evaluator} — Bonus (${bonusColCount} ${isChatTeam ? "Chats" : "Calls"}${isChatTeam ? "" : " • Younis + Ankido Teams"})`
                  : (isChatTeam 
                      ? (standardColCount === 8
                          ? `Chats 1 to 8`
                          : (standardColCount === 7 
                              ? `Chats 1 to 7` 
                              : `Chats 1 to 6 + Outbound`))
                      : `Calls ${callBase + 1} to ${callBase + standardColCount} + Outbound`
                    )
                }
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border shadow-2xs ${isCallMon ? "bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] dark:text-teal-300 border-teal-200/80 dark:border-teal-800/50" : "bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50"}`}>
                <Users size={12} className={`shrink-0 ${isCallMon ? "text-[#0f766e]" : "text-[#00A991]"}`} />
                <span>{currentCsrs.length} Agents</span>
              </span>
            </div>

            {/* Right Action Cluster: Add Agent, Scroll Navigation, Activity Log (Admin/Manager only), Export PDF, Sync */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {isCShift && (
                <button
                  type="button"
                  onClick={() => setShowAddCShiftModal(true)}
                  className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-[#00A991] hover:bg-[#008f7a] text-white text-xs font-black shadow-xs hover:shadow-md transition cursor-pointer shrink-0 active:scale-95"
                  title="Add Evening Call Team Agent to C Shift"
                >
                  <Plus size={13} className="stroke-[2.5]" />
                  <span>Add Agent</span>
                </button>
              )}

              {isCallMon && (
                <button
                  type="button"
                  onClick={() => setShowAddCallMonModal(true)}
                  className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-[#0f766e] hover:bg-[#0d6360] text-white text-xs font-black shadow-xs hover:shadow-md transition cursor-pointer shrink-0 active:scale-95"
                  title="Add Agent to Call Monitoring Roster"
                >
                  <Plus size={13} className="stroke-[2.5]" />
                  <span>Add Agent</span>
                </button>
              )}

              {/* Scroll Navigation Buttons for Columns */}
              <div className="h-8 flex items-center gap-0.5 bg-white dark:bg-gray-800 px-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleScrollTable("left")}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer active:scale-90"
                  title="Scroll Left"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft size={14} className="stroke-[2.5]" />
                </button>
                <div className="h-3.5 w-px bg-gray-200 dark:bg-gray-700" />
                <button
                  type="button"
                  onClick={() => handleScrollTable("right")}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer active:scale-90"
                  title="Scroll Right"
                  aria-label="Scroll Right"
                >
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="hidden sm:block h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />

              {/* Activity Log Button — strictly restricted to Admin & Manager (canSwitchTeams) */}
              {canSwitchTeams && (
                <button
                  type="button"
                  onClick={() => {
                    const nowTs = Date.now();
                    const freshToday = toLocalDateStr(new Date(nowTs).toISOString());
                    setActivityNowTick(nowTs);
                    setActivityFilterMode("today");
                    setActivityCustomDate(freshToday);
                    setShowActivityLogModal(true);
                  }}
                  className="h-8 flex items-center gap-1.5 px-3 rounded-xl text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/90 dark:border-indigo-800/70 transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
                  title={`View Daily Activity Log for ${currentSection.evaluator}`}
                >
                  <Activity size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Activity Log</span>
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                    sectionActivityData.todayCount > 0
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-indigo-200/70 dark:bg-indigo-800/70 text-indigo-700 dark:text-indigo-300"
                  }`}>
                    {sectionActivityData.todayCount} Today
                  </span>
                </button>
              )}

              {/* Export PDF Button */}
              <button
                type="button"
                onClick={handleExportPDF}
                className="h-8 flex items-center gap-1.5 px-3 rounded-xl text-xs font-black text-[#1C6B53] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="Export Report as PDF"
              >
                <Download size={13} />
                <span>Export PDF</span>
              </button>

              {/* Sync Completed Quality to TL & Agent Dashboards */}
              <button
                type="button"
                onClick={() => handleSyncToMetrics()}
                disabled={syncingMetrics}
                className={`h-8 flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-black text-white shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 ${
                  unsyncedPreviousMonth || (currentMonthSyncStatus.isMonthComplete && !currentMonthSyncStatus.isSynced)
                    ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-400/50 animate-pulse"
                    : "bg-[#1C6B53] hover:bg-[#155a45]"
                }`}
                title="Sync Completed Quality Scores to Dashboards"
              >
                <RefreshCw size={13} className={syncingMetrics ? "animate-spin" : ""} />
                <span>
                  {syncingMetrics
                    ? "Syncing..."
                    : unsyncedPreviousMonth
                    ? `Sync ${unsyncedPreviousMonth.monthName} First!`
                    : "Sync to Dashboards"}
                </span>
              </button>
            </div>
          </div>

          {/* Lock Banner when moving to a new month without syncing the completed previous month */}
          {unsyncedPreviousMonth && (
            <div className="mx-4 mt-3 mb-1 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2 flex-wrap">
                    <span>Data Entry Locked for {MONTH_NAMES[activeTableMonthIdx]} {selectedYear}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      Sync Required • يرجى عمل Sync أولاً
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 font-medium leading-relaxed">
                    You have completed all 4 weeks of <strong>{unsyncedPreviousMonth.monthName} {selectedYear}</strong> ({Object.keys(unsyncedPreviousMonth.agentScores).length} agents), but haven&apos;t synced it yet. Please sync <strong>{unsyncedPreviousMonth.monthName}</strong> to the Team Leader &amp; Agent Dashboards to unlock data entry for <strong>{MONTH_NAMES[activeTableMonthIdx]}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const { quarter, weekStart } = getMonthWeekRange(unsyncedPreviousMonth.monthIdx);
                    setSelectedQuarter(quarter);
                    setSelectedWeek(weekStart);
                    setSelectedMonthFilter(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 transition cursor-pointer"
                >
                  Review {unsyncedPreviousMonth.monthName}
                </button>
                <button
                  type="button"
                  onClick={() => handleSyncToMetrics(unsyncedPreviousMonth.monthIdx)}
                  disabled={syncingMetrics}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={syncingMetrics ? "animate-spin" : ""} />
                  <span>{syncingMetrics ? "Syncing..." : `Sync ${unsyncedPreviousMonth.monthName} Now`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Ready-to-Sync Banner when current viewed month has all 4 weeks completed but is not synced yet */}
          {!unsyncedPreviousMonth && currentMonthSyncStatus.isSyncEligible && currentMonthSyncStatus.isMonthComplete && !currentMonthSyncStatus.isSynced && (
            <div className="mx-4 mt-3 mb-1 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-[#1C6B53] dark:text-emerald-400 shrink-0" />
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  All 4 weeks of <strong>{currentMonthSyncStatus.monthName} {selectedYear}</strong> are 100% completed! Click <strong>Sync to Dashboards</strong> before moving to the next month.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSyncToMetrics(currentMonthSyncStatus.monthIdx)}
                disabled={syncingMetrics}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <RefreshCw size={12} className={syncingMetrics ? "animate-spin" : ""} />
                <span>{syncingMetrics ? "Syncing..." : `Sync ${currentMonthSyncStatus.monthName} Now`}</span>
              </button>
            </div>
          )}

          <div 
            ref={tableContainerRef}
            className="overflow-x-auto custom-scrollbar overscroll-x-contain touch-pan-x pb-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="w-full text-xs text-left border-collapse border-spacing-0">
              <thead>
                <tr className="bg-gray-100/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-black text-xs">
                  <th className="sticky left-0 bg-gray-100 dark:bg-gray-800 z-30 px-5 py-3.5 min-w-[210px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                    Agent
                  </th>
                  {isCallMon ? (
                    <>
                      {Array.from({ length: callMonColCount }, (_, i) => i + 1).map(cNum => {
                        const wNum = Math.floor((cNum - 1) / 3) + 1;
                        const cInW = ((cNum - 1) % 3) + 1;
                        return (
                          <th key={cNum} className="px-2.5 py-2 text-center min-w-[100px] relative group/col">
                            <div className="flex flex-col items-center justify-center gap-0.5 text-teal-800 dark:text-teal-300 font-bold">
                              <div className="flex items-center gap-1">
                                <PhoneIncoming size={12} />
                                <span>Eval {cNum}</span>
                                {callMonColCount > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveTrainerColumn(cNum);
                                    }}
                                    className="opacity-0 group-hover/col:opacity-100 hover:opacity-100 p-0.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer"
                                    title={`Remove Eval ${cNum}`}
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-semibold">W{wNum} C{cInW}</span>
                            </div>
                          </th>
                        );
                      })}
                      <th className="px-4 py-3 text-center min-w-[120px] bg-[#0f766e] text-white font-black">
                        {MONTH_NAMES[trainerMonth]} Avg
                      </th>
                      <th className="px-3 py-3 text-center w-12 text-gray-400 font-bold">
                        Action
                      </th>
                    </>
                  ) : isTrainer ? (
                    <>
                      {Array.from({ length: trainerColCount }, (_, i) => i + 1).map(cNum => (
                        <th key={cNum} className="px-2.5 py-3 text-center min-w-[100px] relative group/col">
                          <div className="flex items-center justify-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold">
                            <PhoneIncoming size={12} />
                            <span>Eval {cNum}</span>
                            {trainerColCount > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTrainerColumn(cNum);
                                }}
                                className="opacity-0 group-hover/col:opacity-100 hover:opacity-100 p-0.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer"
                                title={`Remove Eval ${cNum}`}
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center min-w-[120px] bg-[#0d9488] text-white font-black">
                        {MONTH_NAMES[trainerMonth]} Avg
                      </th>
                    </>
                  ) : isCShift ? (
                    <>
                      {[1, 2, 3].map(cNum => (
                        <th key={cNum} className="px-2.5 py-3 text-center min-w-[100px]">
                          <div className="flex items-center justify-center gap-1 text-teal-800 dark:text-teal-300 font-bold">
                            <MessageSquare size={12} />
                            <span>Chat {cNum}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center min-w-[120px] bg-[#00A991] text-white font-black">
                        {selectedMonthFilter !== null ? `${MONTH_NAMES[selectedMonthFilter]} Avg` : `Week ${selectedWeek} Score`}
                      </th>
                      <th className="px-3 py-3 text-center w-12 text-gray-400 font-bold">
                        Action
                      </th>
                    </>
                  ) : isBonus ? (
                    <>
                      {Array.from({ length: bonusColCount }, (_, i) => i + 1).map(cNum => (
                        <th key={cNum} className="px-2.5 py-3 text-center min-w-[100px] relative group/col">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                            {isChatTeam ? <MessageSquare size={12} /> : <PhoneIncoming size={12} />}
                            <span>{isChatTeam ? `Chat ${cNum}` : `Call ${cNum}`}</span>
                            {bonusColCount > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveBonusColumn(cNum);
                                }}
                                className="opacity-0 group-hover/col:opacity-100 hover:opacity-100 p-0.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer"
                                title={`Remove ${isChatTeam ? "Chat" : "Call"} ${cNum}`}
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center min-w-[120px] bg-[#00A991] text-white font-black">
                        Bonus Score
                      </th>
                    </>
                  ) : (
                    <>
                      {Array.from({ length: standardColCount }, (_, i) => i + 1).map(cNum => (
                        <th key={cNum} className="px-2.5 py-3 text-center min-w-[100px]">
                          <div className="flex items-center justify-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold">
                            {isChatTeam ? <MessageSquare size={12} /> : <PhoneIncoming size={12} />}
                            <span>{isChatTeam ? `Chat ${cNum}` : `Call ${callBase + cNum}`}</span>
                          </div>
                        </th>
                      ))}
                      {showOutbound && (
                        <th className="px-3 py-3 text-center min-w-[110px] bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-x border-amber-200 dark:border-amber-900/60 font-bold">
                          <div className="flex items-center justify-center gap-1">
                            <PhoneOutgoing size={12} />
                            <span>Outbound</span>
                          </div>
                        </th>
                      )}
                      <th className="px-4 py-3 text-center min-w-[120px] bg-[#1C6B53] text-white font-black">
                        {selectedMonthFilter !== null ? `${MONTH_NAMES[selectedMonthFilter]} Avg` : `Week ${selectedWeek} Score`}
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-[#FDFCFB] dark:bg-gray-900">
                {currentCsrs.length === 0 ? (
                  <tr>
                    <td colSpan={isCallMon ? callMonColCount + 2 : isTrainer ? trainerColCount + 2 : isCShift ? 5 : isBonus ? bonusColCount + 1 : (standardColCount + (showOutbound ? 1 : 0) + 2)} className="p-8 text-center text-sm text-gray-400">
                      {isCallMon ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p>No agents in Call Mon roster yet.</p>
                          <button
                            type="button"
                            onClick={() => setShowAddCallMonModal(true)}
                            className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d6360] text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={14} />
                            <span>Add Agent (Younis + Ankido Teams)</span>
                          </button>
                        </div>
                      ) : isCShift ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p>No agents in C Shift roster yet.</p>
                          <button
                            type="button"
                            onClick={() => setShowAddCShiftModal(true)}
                            className="px-4 py-2 bg-[#00A991] hover:bg-[#008f7a] text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={14} />
                            <span>Add Evening Call Team Agent</span>
                          </button>
                        </div>
                      ) : (
                        "No agents found for this team."
                      )}
                    </td>
                  </tr>
                ) : (
                  currentCsrs.map((csrName, agentIdx) => {
                    const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                    const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
                    const effectiveQuarter = (isTrainer || isCallMon) ? `Q${Math.floor(trainerMonth / 3) + 1}` : selectedQuarter;
                    const docId = `${selectedYear}_${effectiveQuarter}_${sectionSlug}_${slug}`;
                    const currentDoc = evalData[docId] || {};
                    const currentScores = currentDoc.scores || {};
                    const currentNotes = currentDoc.notes || {};
                    const currentLinks = currentDoc.links || {};
                    const weekAvg = computeWeekAvg(currentScores, selectedWeek, isChatTeam, selectedYear, selectedQuarter, isCShift);
                    const agentPhoto = memberPhotos[csrName.trim().toLowerCase()] || "";

                    if (isCallMon) {
                      // Call Monitoring: dynamic callMonColCount Eval cols + Avg + Remove button
                      let sum = 0; let count = 0;
                      for (let c = 1; c <= callMonColCount; c++) {
                        const key = `m${trainerMonth}_eval_${c}`;
                        const raw = currentScores[key];
                        if (raw && raw.toUpperCase() !== "V" && !raw.toUpperCase().includes("N/A")) {
                          const n = parseFloat(raw);
                          if (!isNaN(n)) { sum += n; count++; }
                        }
                      }
                      const agentCallMonAvg = count > 0 ? (sum / count).toFixed(1) : "-";

                      const isRowHighlighted = highlightedCellTarget?.agentLower === csrName.trim().toLowerCase();
                      return (
                        <tr key={csrName} data-qa-row={csrName.trim().toLowerCase()} className={`hover:bg-teal-50/30 dark:hover:bg-gray-800/40 transition ${isRowHighlighted ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""}`}>
                          <td className="sticky left-0 bg-white dark:bg-gray-900 z-20 px-5 py-3 font-bold text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                              {agentPhoto ? (
                                <img
                                  src={agentPhoto}
                                  alt={csrName}
                                  className="w-7 h-7 rounded-full object-cover shadow-xs border border-teal-500/20 ring-1 ring-teal-500/20 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950/60 text-[#0f766e] dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  {csrName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate max-w-[150px]" title={csrName}>{csrName}</span>
                            </div>
                          </td>

                          {Array.from({ length: callMonColCount }, (_, i) => i + 1).map((cNum, cIdx) => {
                            const key = `m${trainerMonth}_eval_${cNum}`;
                            const rawVal = currentScores[key] ?? "";
                            const val = String(rawVal);
                            const note = currentNotes[key] ?? "";
                            const link = currentLinks[key] ?? "";
                            const hasNote = Boolean(note.trim());
                            const hasLink = Boolean(link.trim());
                            const isV = val.toUpperCase() === "V";
                            const isNA = val.toUpperCase().includes("N/A");
                            const numVal = parseFloat(val);
                            const isBelow90 = !isNaN(numVal) && numVal < 90;
                            const wNum = Math.floor((cNum - 1) / 3) + 1;
                            const cInW = ((cNum - 1) % 3) + 1;
                            const cellLabel = `${MONTH_NAMES[trainerMonth]} Eval ${cNum} (W${wNum} C${cInW})`;
                            const isCellHighlighted = isRowHighlighted && highlightedCellTarget?.cellKey === key;

                            return (
                              <td key={cNum} className="p-2 text-center">
                                <div className="relative inline-block group">
                                  {hasNote && (
                                    <div
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className="absolute top-0 left-0 w-0 h-0 border-t-[9px] border-r-[9px] border-r-transparent border-t-red-500 rounded-tl-xl cursor-pointer z-10"
                                      title={`Note: ${note}${hasLink ? `\nLink: ${link}` : ""}`}
                                    />
                                  )}
                                  <input
                                    id={`qa_cell_${agentIdx}_${cIdx}`}
                                    data-qa-target={`${csrName.trim().toLowerCase()}|${key}`}
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleScoreChange(currentSection, csrName, key, e.target.value)}
                                    onKeyDown={(e) => handleCellKeyDown(e, agentIdx, cIdx)}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="-"
                                    className={`w-18 sm:w-20 h-10 text-center rounded-xl font-black text-sm outline-none transition-all shadow-2xs ${
                                      isCellHighlighted ? "ring-4 ring-indigo-500 border-indigo-600 scale-105 z-20 " : ""
                                    }${
                                      isV
                                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                        : isNA
                                        ? "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                        : isBelow90
                                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                        : "bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500/70 focus:border-[#0f766e] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#0f766e]/20 dark:focus:ring-teal-400/20"
                                    }`}
                                  />
                                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-5">
                                    {hasLink && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded-full bg-[#0f766e] hover:bg-[#0d625b] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                                        title={`Open Conversation Link: ${link}`}
                                      >
                                        <ExternalLink size={7} />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                        hasNote
                                          ? "bg-red-500 text-white ring-2 ring-white dark:ring-gray-900 hover:bg-red-600 scale-100"
                                          : "opacity-0 group-hover:opacity-100 bg-gray-100 hover:bg-[#0f766e] dark:bg-gray-700 text-gray-400 hover:text-white dark:text-gray-400 ring-1 ring-gray-200/90 dark:ring-gray-600/70 hover:scale-110"
                                      }`}
                                      title={hasNote ? `Note: ${note}${hasLink ? `\nLink: ${link}` : ''}` : (hasLink ? `Link: ${link}` : "Add Note / Link")}
                                    >
                                      <FileText size={8} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}

                          <td className="p-2 text-center font-black text-sm bg-teal-50/50 dark:bg-teal-950/30">
                            {(() => {
                              const numCallMonAvg = parseFloat(agentCallMonAvg);
                              const isLowCallMonAvg = !isNaN(numCallMonAvg) && numCallMonAvg < 90;
                              return (
                                <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs ${
                                  agentCallMonAvg !== "-"
                                    ? isLowCallMonAvg
                                      ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                                      : "bg-white dark:bg-gray-800 text-[#0f766e] dark:text-teal-300 border border-teal-500/20"
                                    : "text-gray-300 dark:text-gray-600 font-normal"
                                }`}>
                                  {agentCallMonAvg !== "-" ? `${agentCallMonAvg}%` : "-"}
                                </span>
                              );
                            })()}
                          </td>

                          <td className="p-2 text-center w-12">
                            <button
                              type="button"
                              onClick={() => handleRemoveCallMonAgent(csrName)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                              title={`Remove ${csrName} from Call Mon roster`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    if (isTrainer) {
                      // Calculate trainer agent average for current trainerMonth
                      let sum = 0; let count = 0;
                      for (let c = 1; c <= trainerColCount; c++) {
                        const key = `m${trainerMonth}_eval_${c}`;
                        const raw = currentScores[key];
                        if (raw && raw.toUpperCase() !== "V" && !raw.toUpperCase().includes("N/A")) {
                          const n = parseFloat(raw);
                          if (!isNaN(n)) { sum += n; count++; }
                        }
                      }
                      const agentTrainerAvg = count > 0 ? (sum / count).toFixed(1) : "-";
                      const isRowHighlighted = highlightedCellTarget?.agentLower === csrName.trim().toLowerCase();

                      return (
                        <tr key={csrName} data-qa-row={csrName.trim().toLowerCase()} className={`hover:bg-teal-50/30 dark:hover:bg-gray-800/40 transition ${isRowHighlighted ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""}`}>
                          <td className="sticky left-0 bg-white dark:bg-gray-900 z-20 px-5 py-3 font-bold text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                              {agentPhoto ? (
                                <img
                                  src={agentPhoto}
                                  alt={csrName}
                                  className="w-7 h-7 rounded-full object-cover shadow-xs border border-teal-500/20 ring-1 ring-teal-500/20 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  {csrName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate max-w-[150px]" title={csrName}>{csrName}</span>
                            </div>
                          </td>

                          {Array.from({ length: trainerColCount }, (_, i) => i + 1).map((cNum, cIdx) => {
                            const key = `m${trainerMonth}_eval_${cNum}`;
                            const rawVal = currentScores[key] ?? "";
                            const val = String(rawVal);
                            const note = currentNotes[key] ?? "";
                            const link = currentLinks[key] ?? "";
                            const hasNote = Boolean(note.trim());
                            const hasLink = Boolean(link.trim());
                            const isV = val.toUpperCase() === "V";
                            const isNA = val.toUpperCase().includes("N/A");
                            const numVal = parseFloat(val);
                            const isBelow90 = !isNaN(numVal) && numVal < 90;
                            const cellLabel = `${MONTH_NAMES[trainerMonth]} Eval ${cNum}`;
                            const isCellHighlighted = isRowHighlighted && highlightedCellTarget?.cellKey === key;

                            return (
                              <td key={cNum} className="p-2 text-center">
                                <div className="relative inline-block group">
                                  {hasNote && (
                                    <div 
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className="absolute top-0 left-0 w-0 h-0 border-t-[9px] border-r-[9px] border-r-transparent border-t-red-500 rounded-tl-xl cursor-pointer z-10" 
                                      title={`Note: ${note}${hasLink ? `\nLink: ${link}` : ""}`}
                                    />
                                  )}

                                  <input
                                    id={`qa_cell_${agentIdx}_${cIdx}`}
                                    data-qa-target={`${csrName.trim().toLowerCase()}|${key}`}
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleScoreChange(currentSection, csrName, key, e.target.value)}
                                    onKeyDown={(e) => handleCellKeyDown(e, agentIdx, cIdx)}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="-"
                                    className={`w-18 sm:w-20 h-10 text-center rounded-xl font-black text-sm outline-none transition-all shadow-2xs ${
                                      isCellHighlighted ? "ring-4 ring-indigo-500 border-indigo-600 scale-105 z-20 " : ""
                                    }${
                                      isV
                                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                        : isNA
                                        ? "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                        : isBelow90
                                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                        : "bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500/70 focus:border-[#0d9488] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#0d9488]/20 dark:focus:ring-teal-400/20"
                                    }`}
                                  />

                                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-5">
                                    {hasLink && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded-full bg-[#0d9488] hover:bg-[#0b7a6f] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                                        title={`Open Conversation Link: ${link}`}
                                      >
                                        <ExternalLink size={7} />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                        hasNote
                                          ? "bg-red-500 text-white ring-2 ring-white dark:ring-gray-900 hover:bg-red-600 scale-100"
                                          : "opacity-0 group-hover:opacity-100 bg-gray-100 hover:bg-[#0d9488] dark:bg-gray-700 text-gray-400 hover:text-white dark:text-gray-400 ring-1 ring-gray-200/90 dark:ring-gray-600/70 hover:scale-110"
                                      }`}
                                      title={hasNote ? `Note: ${note}${hasLink ? `\nLink: ${link}` : ''}` : (hasLink ? `Link: ${link}` : "Add Note / Link")}
                                    >
                                      <FileText size={8} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}

                          <td className="p-2 text-center font-black text-sm bg-teal-50/50 dark:bg-teal-950/30">
                            {(() => {
                              const numTrainerAvg = parseFloat(agentTrainerAvg);
                              const isLowTrainerAvg = !isNaN(numTrainerAvg) && numTrainerAvg < 90;
                              return (
                                <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs ${
                                  agentTrainerAvg !== "-"
                                    ? isLowTrainerAvg
                                      ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                                      : "bg-white dark:bg-gray-800 text-[#0d9488] dark:text-teal-300 border border-teal-500/20"
                                    : "text-gray-300 dark:text-gray-600 font-normal"
                                }`}>
                                  {agentTrainerAvg !== "-" ? `${agentTrainerAvg}%` : "-"}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    }

                    if (isCShift) {
                      const isRowHighlighted = highlightedCellTarget?.agentLower === csrName.trim().toLowerCase();
                      return (
                        <tr key={csrName} data-qa-row={csrName.trim().toLowerCase()} className={`hover:bg-teal-50/30 dark:hover:bg-gray-800/40 transition ${isRowHighlighted ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""}`}>
                          <td className="sticky left-0 bg-white dark:bg-gray-900 z-20 px-5 py-3 font-bold text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                              {agentPhoto ? (
                                <img
                                  src={agentPhoto}
                                  alt={csrName}
                                  className="w-7 h-7 rounded-full object-cover shadow-xs border border-teal-500/20 ring-1 ring-teal-500/20 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950/60 text-[#00A991] dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  {csrName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate max-w-[150px]" title={csrName}>{csrName}</span>
                            </div>
                          </td>

                          {[1, 2, 3].map((cNum, cIdx) => {
                            const key = `w${selectedWeek}_chat_${cNum}`;
                            const rawVal = currentScores[key] ?? "";
                            const val = String(rawVal || "");
                            const note = currentNotes[key] ?? "";
                            const link = currentLinks[key] ?? "";
                            const hasNote = Boolean(note.trim());
                            const hasLink = Boolean(link.trim());
                            const isV = val.toUpperCase() === "V";
                            const isNA = val.toUpperCase().includes("N/A");
                            const numVal = parseFloat(val);
                            const isBelow90 = !isNaN(numVal) && numVal < 90;
                            const cellLabel = `Chat ${cNum}`;
                            const isCellHighlighted = isRowHighlighted && highlightedCellTarget?.cellKey === key;

                            return (
                              <td key={cNum} className="p-2 text-center">
                                <div className="relative inline-block group">
                                  {hasNote && (
                                    <div 
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className="absolute top-0 left-0 w-0 h-0 border-t-[9px] border-r-[9px] border-r-transparent border-t-red-500 rounded-tl-xl cursor-pointer z-10" 
                                      title={`Note: ${note}${hasLink ? `\nLink: ${link}` : ""}`}
                                    />
                                  )}

                                  <input
                                    id={`qa_cell_${agentIdx}_${cIdx}`}
                                    data-qa-target={`${csrName.trim().toLowerCase()}|${key}`}
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleScoreChange(currentSection, csrName, key, e.target.value)}
                                    onKeyDown={(e) => handleCellKeyDown(e, agentIdx, cIdx)}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="-"
                                    className={`w-18 sm:w-20 h-10 text-center rounded-xl font-black text-sm outline-none transition-all shadow-2xs ${
                                      isCellHighlighted ? "ring-4 ring-indigo-500 border-indigo-600 scale-105 z-20 " : ""
                                    }${
                                      isV
                                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                        : isNA
                                        ? "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                        : isBelow90
                                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                        : "bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500/70 focus:border-[#00A991] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#00A991]/20 dark:focus:ring-teal-400/20"
                                    }`}
                                  />

                                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-5">
                                    {hasLink && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded-full bg-[#00A991] hover:bg-[#008f7a] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                                        title={`Open Conversation Link: ${link}`}
                                      >
                                        <ExternalLink size={7} />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                        hasNote
                                          ? "bg-red-500 text-white ring-2 ring-white dark:ring-gray-900 hover:bg-red-600 scale-100"
                                          : "opacity-0 group-hover:opacity-100 bg-gray-100 hover:bg-[#00A991] dark:bg-gray-700 text-gray-400 hover:text-white dark:text-gray-400 ring-1 ring-gray-200/90 dark:ring-gray-600/70 hover:scale-110"
                                      }`}
                                      title={hasNote ? `Note: ${note}${hasLink ? `\nLink: ${link}` : ''}` : (hasLink ? `Link: ${link}` : "Add Note / Link")}
                                    >
                                      <FileText size={8} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}

                          <td className="p-2 text-center font-black text-sm bg-teal-50/50 dark:bg-teal-950/30">
                            {(() => {
                              const displayVal = selectedMonthFilter !== null
                                ? (tableMonthAgentAvgs[csrName] ?? "-")
                                : weekAvg;
                              const numCShiftAvg = parseFloat(displayVal);
                              const isLowCShiftAvg = !isNaN(numCShiftAvg) && numCShiftAvg < 90;
                              return (
                                <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs ${
                                  displayVal === "V"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                    : isLowCShiftAvg
                                    ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                                    : displayVal !== "-"
                                    ? "bg-white dark:bg-gray-800 text-[#00A991] dark:text-teal-300 border border-teal-500/20"
                                    : "text-gray-300 dark:text-gray-600 font-normal"
                                }`}>
                                  {displayVal !== "-" && displayVal !== "V" ? `${displayVal}%` : displayVal}
                                </span>
                              );
                            })()}
                          </td>

                          <td className="p-2 text-center w-12">
                            <button
                              type="button"
                              onClick={() => handleRemoveCShiftAgent(csrName)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                              title={`Remove ${csrName} from C Shift`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    if (isBonus) {
                      const agentBonusAvg = computeBonusAgentAvg(currentScores, bonusColCount);
                      const isRowHighlighted = highlightedCellTarget?.agentLower === csrName.trim().toLowerCase();

                      return (
                        <tr key={csrName} data-qa-row={csrName.trim().toLowerCase()} className={`hover:bg-emerald-50/30 dark:hover:bg-gray-800/40 transition ${isRowHighlighted ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""}`}>
                          {/* Sticky CSR Name with Real Profile Photo if uploaded */}
                          <td className="sticky left-0 bg-white dark:bg-gray-900 z-20 px-5 py-3 font-bold text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                              {agentPhoto ? (
                                <img
                                  src={agentPhoto}
                                  alt={csrName}
                                  className="w-7 h-7 rounded-full object-cover shadow-xs border border-emerald-500/20 ring-1 ring-emerald-500/20 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#00A991] dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  {csrName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate max-w-[150px]" title={csrName}>{csrName}</span>
                            </div>
                          </td>

                          {/* Dynamic Bonus Call/Chat Columns */}
                          {Array.from({ length: bonusColCount }, (_, i) => i + 1).map((cNum, cIdx) => {
                            const key = isChatTeam ? `chat_${cNum}` : `call_${cNum}`;
                            const wKey = `w${Math.floor((cNum - 1) / 6) + 1}_${isChatTeam ? "chat" : "call"}_${cNum}`;
                            const rawVal = currentScores[key] ?? currentScores[`call_${cNum}`] ?? currentScores[`chat_${cNum}`] ?? currentScores[wKey] ?? "";
                            const val = String(rawVal);
                            const note = currentNotes[key] ?? currentNotes[`call_${cNum}`] ?? currentNotes[`chat_${cNum}`] ?? currentNotes[wKey] ?? "";
                            const link = currentLinks[key] ?? currentLinks[`call_${cNum}`] ?? currentLinks[`chat_${cNum}`] ?? currentLinks[wKey] ?? "";
                            const hasNote = Boolean(note.trim());
                            const hasLink = Boolean(link.trim());
                            const isV = val.toUpperCase() === "V";
                            const isNA = val.toUpperCase().includes("N/A");
                            const numVal = parseFloat(val);
                            const isBelow90 = !isNaN(numVal) && numVal < 90;
                            const cellLabel = `${isChatTeam ? "Chat" : "Call"} ${cNum}`;
                            const isCellHighlighted = isRowHighlighted && highlightedCellTarget?.cellKey === key;

                            return (
                              <td key={cNum} className="p-2 text-center">
                                <div className="relative inline-block group">
                                  {hasNote && (
                                    <div
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className="absolute top-0 left-0 w-0 h-0 border-t-[9px] border-r-[9px] border-r-transparent border-t-red-500 rounded-tl-xl cursor-pointer z-10"
                                      title={`Note: ${note}${hasLink ? `\nLink: ${link}` : ""}`}
                                    />
                                  )}
                                  <input
                                    id={`qa_cell_${agentIdx}_${cIdx}`}
                                    data-qa-target={`${csrName.trim().toLowerCase()}|${key}`}
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleScoreChange(currentSection, csrName, key, e.target.value)}
                                    onKeyDown={(e) => handleCellKeyDown(e, agentIdx, cIdx)}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="-"
                                    className={`w-18 sm:w-20 h-10 text-center rounded-xl font-black text-sm outline-none transition-all shadow-2xs ${
                                      isCellHighlighted ? "ring-4 ring-indigo-500 border-indigo-600 scale-105 z-20 " : ""
                                    }${
                                      isV
                                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                        : isNA
                                        ? "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                        : isBelow90
                                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                        : "bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500/70 focus:border-[#00A991] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#00A991]/20 dark:focus:ring-teal-400/20"
                                    }`}
                                  />
                                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-5">
                                    {hasLink && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded-full bg-[#00A991] hover:bg-[#008f7a] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                                        title={`Open Conversation Link: ${link}`}
                                      >
                                        <ExternalLink size={7} />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                        hasNote
                                          ? "bg-red-500 text-white ring-2 ring-white dark:ring-gray-900 hover:bg-red-600 scale-100"
                                          : "opacity-0 group-hover:opacity-100 bg-gray-100 hover:bg-[#00A991] dark:bg-gray-700 text-gray-400 hover:text-white dark:text-gray-400 ring-1 ring-gray-200/90 dark:ring-gray-600/70 hover:scale-110"
                                      }`}
                                      title={hasNote ? `Note: ${note}${hasLink ? `\nLink: ${link}` : ''}` : (hasLink ? `Link: ${link}` : "Add Note / Link")}
                                    >
                                      <FileText size={8} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}

                          {/* Bonus Score (Average of all calls) */}
                          <td className="p-2 text-center font-black text-sm bg-teal-50/50 dark:bg-teal-950/30">
                            {(() => {
                              const numBonusAvg = parseFloat(agentBonusAvg);
                              const isLowBonusAvg = !isNaN(numBonusAvg) && numBonusAvg < 90;
                              return (
                                <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs ${
                                  agentBonusAvg !== "-" && agentBonusAvg !== "V"
                                    ? isLowBonusAvg
                                      ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                                      : "bg-white dark:bg-gray-800 text-[#00A991] dark:text-teal-300 border border-teal-500/20"
                                    : "text-gray-300 dark:text-gray-600 font-normal"
                                }`}>
                                  {agentBonusAvg !== "-" && agentBonusAvg !== "V" ? `${agentBonusAvg}%` : agentBonusAvg}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    }

                    const isRowHighlighted = highlightedCellTarget?.agentLower === csrName.trim().toLowerCase();
                    return (
                      <tr key={csrName} data-qa-row={csrName.trim().toLowerCase()} className={`hover:bg-emerald-50/30 dark:hover:bg-gray-800/40 transition ${isRowHighlighted ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""}`}>
                        {/* Sticky CSR Name with Real Profile Photo if uploaded */}
                        <td className="sticky left-0 bg-white dark:bg-gray-900 z-20 px-5 py-3 font-bold text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2.5">
                            {agentPhoto ? (
                              <img
                                src={agentPhoto}
                                alt={csrName}
                                className="w-7 h-7 rounded-full object-cover shadow-xs border border-emerald-500/20 ring-1 ring-emerald-500/20 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {csrName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate max-w-[150px]" title={csrName}>{csrName}</span>
                          </div>
                        </td>

                        {/* Dynamic Inbound Call / Chat Inputs with Arrow Key Navigation */}
                        {Array.from({ length: standardColCount }, (_, i) => i + 1).map((cNum, cIdx) => {
                          const callIndex = callBase + cNum;
                          const key = isChatTeam ? `w${selectedWeek}_chat_${cNum}` : `w${selectedWeek}_call_${callIndex}`;
                          const rawVal = currentScores[key] ?? (isChatTeam ? (currentScores[`w${selectedWeek}_call_${cNum}`] ?? currentScores[`w${selectedWeek}_call_${callIndex}`] ?? "") : "");
                          const val = String(rawVal || "");
                          const note = currentNotes[key] ?? (isChatTeam ? (currentNotes[`w${selectedWeek}_call_${cNum}`] ?? currentNotes[`w${selectedWeek}_call_${callIndex}`] ?? "") : "");
                          const link = currentLinks[key] ?? (isChatTeam ? (currentLinks[`w${selectedWeek}_call_${cNum}`] ?? currentLinks[`w${selectedWeek}_call_${callIndex}`] ?? "") : "");
                          const hasNote = Boolean(note.trim());
                          const hasLink = Boolean(link.trim());
                          const isV = val.toUpperCase() === "V";
                          const isNA = val.toUpperCase().includes("N/A");
                          const numVal = parseFloat(val);
                          const isBelow90 = !isNaN(numVal) && numVal < 90;
                          const cellLabel = isChatTeam ? `Chat ${cNum}` : `Call ${callIndex}`;
                          const isCellHighlighted = isRowHighlighted && highlightedCellTarget?.cellKey === key;

                          return (
                            <td key={cNum} className="p-2 text-center">
                              <div className="relative inline-block group">
                                {/* Red Corner Triangle Mark (Visible when note exists) */}
                                {hasNote && (
                                  <div 
                                    onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                    className="absolute top-0 left-0 w-0 h-0 border-t-[9px] border-r-[9px] border-r-transparent border-t-red-500 rounded-tl-xl cursor-pointer z-10" 
                                    title={`Note: ${note}${hasLink ? `\nLink: ${link}` : ""}`}
                                  />
                                )}

                                <input
                                  id={`qa_cell_${agentIdx}_${cIdx}`}
                                  data-qa-target={`${csrName.trim().toLowerCase()}|${key}`}
                                  type="text"
                                  value={val}
                                  readOnly={Boolean(unsyncedPreviousMonth)}
                                  onClick={() => {
                                    if (unsyncedPreviousMonth) {
                                      setSyncReminderModal(unsyncedPreviousMonth);
                                    }
                                  }}
                                  onChange={(e) => handleScoreChange(currentSection, csrName, key, e.target.value)}
                                  onKeyDown={(e) => handleCellKeyDown(e, agentIdx, cIdx)}
                                  onFocus={(e) => {
                                    if (unsyncedPreviousMonth) {
                                      e.target.blur();
                                      setSyncReminderModal(unsyncedPreviousMonth);
                                      return;
                                    }
                                    e.target.select();
                                  }}
                                  placeholder="-"
                                  className={`w-18 sm:w-20 h-10 text-center rounded-xl font-black text-sm outline-none transition-all shadow-2xs ${
                                    unsyncedPreviousMonth ? "cursor-not-allowed opacity-75 " : ""
                                  }${
                                    isCellHighlighted ? "ring-4 ring-indigo-500 border-indigo-600 scale-105 z-20 " : ""
                                  }${
                                    isV
                                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                      : isNA
                                      ? "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                      : isBelow90
                                      ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                      : "bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-emerald-400 dark:hover:border-emerald-500/70 focus:border-[#1C6B53] dark:focus:border-emerald-400 focus:ring-2 focus:ring-[#1C6B53]/20 dark:focus:ring-emerald-400/20"
                                  }`}
                                />

                                {/* Visible Note & Link Buttons */}
                                <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-5">
                                  {hasLink && (
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 rounded-full bg-[#1C6B53] hover:bg-[#155a45] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                                      title={`Open Conversation Link: ${link}`}
                                    >
                                      <ExternalLink size={7} />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenNote(csrName, key, cellLabel)}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                      hasNote
                                        ? "bg-red-500 text-white ring-2 ring-white dark:ring-gray-900 hover:bg-red-600 scale-100"
                                        : "opacity-0 group-hover:opacity-100 bg-gray-100 hover:bg-[#1C6B53] dark:bg-gray-700 text-gray-400 hover:text-white dark:text-gray-400 ring-1 ring-gray-200/90 dark:ring-gray-600/70 hover:scale-110"
                                    }`}
                                    title={hasNote ? `Note: ${note}${hasLink ? `\nLink: ${link}` : ''}` : (hasLink ? `Link: ${link}` : "Add Note / Link")}
                                  >
                                    <FileText size={8} />
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        {/* Outbound Call Input (When showOutbound is true) */}
                        {showOutbound && (
                          <td className="p-2 text-center bg-amber-50/40 dark:bg-amber-950/20 border-x border-amber-200/60 dark:border-amber-900/40">
                            {(() => {
                              const key = `w${selectedWeek}_outbound`;
                              const rawVal = currentScores[key];
                              const val = String(rawVal ?? "");
                              const note = currentNotes[key] ?? "";
                              const link = currentLinks[key] ?? "";
                              const hasNote = Boolean(note.trim());
                              const hasLink = Boolean(link.trim());
                              const isV = val.toUpperCase() === "V";
                              const isNA = val.toUpperCase().includes("N/A");
                              const numVal = parseFloat(val);
                              const isBelow90 = !isNaN(numVal) && numVal < 90;
                              const isCellHighlighted = isRowHighlighted && highlightedCellTarget?.cellKey === key;

                              return (
                                <div className="relative inline-block group">
                                  {hasNote && (
                                    <div 
                                      onClick={() => handleOpenNote(csrName, key, "Outbound")}
                                      className="absolute top-0 left-0 w-0 h-0 border-t-[9px] border-r-[9px] border-r-transparent border-t-red-500 rounded-tl-xl cursor-pointer z-10" 
                                      title={`Note: ${note}${hasLink ? `\nLink: ${link}` : ""}`}
                                    />
                                  )}

                                  <input
                                    id={`qa_cell_${agentIdx}_${standardColCount}`}
                                    data-qa-target={`${csrName.trim().toLowerCase()}|${key}`}
                                    type="text"
                                    value={val}
                                    readOnly={Boolean(unsyncedPreviousMonth)}
                                    onClick={() => {
                                      if (unsyncedPreviousMonth) {
                                        setSyncReminderModal(unsyncedPreviousMonth);
                                      }
                                    }}
                                    onChange={(e) => handleScoreChange(currentSection, csrName, key, e.target.value)}
                                    onKeyDown={(e) => handleCellKeyDown(e, agentIdx, standardColCount)}
                                    onFocus={(e) => {
                                      if (unsyncedPreviousMonth) {
                                        e.target.blur();
                                        setSyncReminderModal(unsyncedPreviousMonth);
                                        return;
                                      }
                                      e.target.select();
                                    }}
                                    placeholder="-"
                                    className={`w-18 sm:w-20 h-10 text-center rounded-xl font-black text-sm outline-none transition-all shadow-2xs ${
                                      unsyncedPreviousMonth ? "cursor-not-allowed opacity-75 " : ""
                                    }${
                                      isCellHighlighted ? "ring-4 ring-indigo-500 border-indigo-600 scale-105 z-20 " : ""
                                    }${
                                      isV
                                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                        : isNA
                                        ? "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                        : isBelow90
                                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                                        : "bg-white dark:bg-gray-800/90 border border-amber-300 dark:border-amber-700 text-gray-900 dark:text-gray-100 hover:border-amber-400 dark:hover:border-amber-500 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                                    }`}
                                  />

                                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-5">
                                    {hasLink && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                                        title={`Open Conversation Link: ${link}`}
                                      >
                                        <ExternalLink size={7} />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenNote(csrName, key, "Outbound")}
                                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                        hasNote
                                          ? "bg-red-500 text-white ring-2 ring-white dark:ring-gray-900 hover:bg-red-600 scale-100"
                                          : "opacity-0 group-hover:opacity-100 bg-amber-100 hover:bg-amber-600 dark:bg-amber-900 text-amber-700 hover:text-white dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700 hover:scale-110"
                                      }`}
                                      title={hasNote ? `Note: ${note}${hasLink ? `\nLink: ${link}` : ''}` : (hasLink ? `Link: ${link}` : "Add Note / Link")}
                                    >
                                      <FileText size={8} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                        )}

                        {/* Auto-calculated Week Score (or Monthly Avg when month filter active) */}
                        <td className="p-2 text-center font-black text-sm bg-emerald-50/50 dark:bg-emerald-950/30">
                          {(() => {
                            const displayVal = selectedMonthFilter !== null
                              ? (tableMonthAgentAvgs[csrName] ?? "-")
                              : weekAvg;
                            const numAvg = parseFloat(displayVal);
                            const isLowAvg = !isNaN(numAvg) && numAvg < 90;
                            return (
                              <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs ${
                                displayVal === "V"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                  : isLowAvg
                                  ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                                  : displayVal !== "-"
                                  ? "bg-white dark:bg-gray-800 text-[#1C6B53] dark:text-emerald-300 border border-emerald-500/20"
                                  : "text-gray-300 dark:text-gray-600 font-normal"
                              }`}>
                                {displayVal !== "-" && displayVal !== "V" ? `${displayVal}%` : displayVal}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Bottom Team Average Row */}
                {currentCsrs.length > 0 && (
                  <tr className={`border-t-2 font-black text-xs ${isTrainer ? "bg-teal-50/80 dark:bg-teal-950/60 border-[#0d9488]/30" : "bg-emerald-50/80 dark:bg-emerald-950/60 border-[#1C6B53]/30"}`}>
                    <td className={`sticky left-0 z-20 px-5 py-3.5 font-black shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] ${isTrainer ? "bg-teal-50 dark:bg-teal-950 text-[#0d9488] dark:text-teal-300" : "bg-emerald-50 dark:bg-emerald-950 text-[#1C6B53] dark:text-emerald-300"}`}>
                      Team Average
                    </td>

                    {isTrainer ? (
                      <>
                        {Array.from({ length: isCallMon ? callMonColCount : trainerColCount }, (_, i) => i + 1).map(cNum => {
                          const key = `m${trainerMonth}_eval_${cNum}`;
                          const nums: number[] = [];
                          const trainerQ = `Q${Math.floor(trainerMonth / 3) + 1}`;
                          const trainerSectionSlug = isCallMon ? "mohammed_azad_call_mon" : "mohammed_azad";
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const docId = `${selectedYear}_${trainerQ}_${trainerSectionSlug}_${slug}`;
                            const val = (evalData[docId]?.scores || {})[key];
                            if (val && val.toUpperCase() !== "V" && !val.toUpperCase().includes("N/A")) {
                              const n = parseFloat(val);
                              if (!isNaN(n)) nums.push(n);
                            }
                          });
                          const colAvg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "-";
                          return (
                            <td key={cNum} className="p-2 text-center font-black text-[#0d9488] dark:text-teal-300">
                              {colAvg !== "-" ? `${colAvg}%` : "-"}
                            </td>
                          );
                        })}

                        {(() => {
                          let allSum = 0; let allCnt = 0;
                          const trainerQ = `Q${Math.floor(trainerMonth / 3) + 1}`;
                          const trainerSectionSlug = isCallMon ? "mohammed_azad_call_mon" : "mohammed_azad";
                          const colCount = isCallMon ? callMonColCount : trainerColCount;
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const docId = `${selectedYear}_${trainerQ}_${trainerSectionSlug}_${slug}`;
                            const scores = evalData[docId]?.scores || {};
                            for (let c = 1; c <= colCount; c++) {
                              const val = scores[`m${trainerMonth}_eval_${c}`];
                              if (val && val.toUpperCase() !== "V" && !val.toUpperCase().includes("N/A")) {
                                const n = parseFloat(val);
                                if (!isNaN(n)) { allSum += n; allCnt++; }
                              }
                            }
                          });
                          const totalTrainerAvg = allCnt > 0 ? (allSum / allCnt).toFixed(1) : "-";
                          return (
                            <td className={`p-2 text-center font-black text-sm ${isCallMon ? "bg-teal-300/60 dark:bg-teal-800/60 text-[#0f766e]" : "bg-teal-200/60 dark:bg-teal-900/60 text-[#0d9488]"} dark:text-teal-300`}>
                              {totalTrainerAvg !== "-" ? `${totalTrainerAvg}%` : "-"}
                            </td>
                          );
                        })()}
                      </>
                    ) : isCShift ? (
                      <>
                        {[1, 2, 3].map(cNum => {
                          const key = `w${selectedWeek}_chat_${cNum}`;
                          const nums: number[] = [];
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const docId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${slug}`;
                            const val = (evalData[docId]?.scores || {})[key];
                            if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
                              const n = parseFloat(val);
                              if (!isNaN(n)) nums.push(n);
                            }
                          });
                          const colAvg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "-";
                          return (
                            <td key={cNum} className="p-2 text-center font-black text-[#00A991] dark:text-teal-300">
                              {colAvg !== "-" ? `${colAvg}%` : "-"}
                            </td>
                          );
                        })}

                        {/* Total week/month team average */}
                        {(() => {
                          let totalAvg = "-";
                          if (selectedMonthFilter !== null) {
                            const vals = Object.values(tableMonthAgentAvgs)
                              .map(v => parseFloat(v))
                              .filter(n => !isNaN(n));
                            totalAvg = vals.length > 0
                              ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                              : "-";
                          } else {
                            const weekAverages: number[] = [];
                            currentCsrs.forEach(csrName => {
                              const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                              const docId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${slug}`;
                              const scores = evalData[docId]?.scores || {};
                              const avgStr = computeWeekAvg(scores, selectedWeek, isChatTeam, selectedYear, selectedQuarter, true);
                              if (avgStr !== "-" && avgStr !== "V") {
                                const n = parseFloat(avgStr);
                                if (!isNaN(n)) weekAverages.push(n);
                              }
                            });
                            totalAvg = weekAverages.length > 0
                              ? (weekAverages.reduce((a, b) => a + b, 0) / weekAverages.length).toFixed(1)
                              : "-";
                          }
                          return (
                            <td className="p-2 text-center font-black text-sm bg-teal-200/60 dark:bg-teal-900/60 text-[#00A991] dark:text-teal-300">
                              {totalAvg !== "-" ? `${totalAvg}%` : "-"}
                            </td>
                          );
                        })()}
                        <td className="p-2" />
                      </>
                    ) : isBonus ? (
                      <>
                        {Array.from({ length: bonusColCount }, (_, i) => i + 1).map(cNum => {
                          const key = isChatTeam ? `chat_${cNum}` : `call_${cNum}`;
                          const wKey = `w${Math.floor((cNum - 1) / 6) + 1}_${isChatTeam ? "chat" : "call"}_${cNum}`;
                          const nums: number[] = [];
                          const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
                            const val = (evalData[docId]?.scores || {})[key] ?? (evalData[docId]?.scores || {})[`call_${cNum}`] ?? (evalData[docId]?.scores || {})[`chat_${cNum}`] ?? (evalData[docId]?.scores || {})[wKey];
                            if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
                              const n = parseFloat(val);
                              if (!isNaN(n)) nums.push(n);
                            }
                          });
                          const colAvg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "-";
                          return (
                            <td key={cNum} className="p-2 text-center font-black text-[#00A991] dark:text-teal-300">
                              {colAvg !== "-" ? `${colAvg}%` : "-"}
                            </td>
                          );
                        })}

                        {/* Overall Bonus Team Average */}
                        {(() => {
                          const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
                          const agentAvgs: number[] = [];
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
                            const scores = evalData[docId]?.scores || {};
                            const avgStr = computeBonusAgentAvg(scores, bonusColCount);
                            if (avgStr !== "-" && avgStr !== "V") {
                              const n = parseFloat(avgStr);
                              if (!isNaN(n)) agentAvgs.push(n);
                            }
                          });
                          const totalAvg = agentAvgs.length > 0 ? (agentAvgs.reduce((a, b) => a + b, 0) / agentAvgs.length).toFixed(1) : "-";
                          return (
                            <td className="p-2 text-center font-black text-sm bg-teal-200/60 dark:bg-teal-900/60 text-[#00A991] dark:text-teal-300">
                              {totalAvg !== "-" ? `${totalAvg}%` : "-"}
                            </td>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        {Array.from({ length: standardColCount }, (_, i) => i + 1).map(cNum => {
                          const callIndex = callBase + cNum;
                          const key = isChatTeam ? `w${selectedWeek}_chat_${cNum}` : `w${selectedWeek}_call_${callIndex}`;
                          const nums: number[] = [];
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
                            const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
                            const scores = evalData[docId]?.scores || {};
                            const val = scores[key] ?? (isChatTeam ? (scores[`w${selectedWeek}_call_${cNum}`] ?? scores[`w${selectedWeek}_call_${callIndex}`]) : undefined);
                            if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
                              const n = parseFloat(val);
                              if (!isNaN(n)) nums.push(n);
                            }
                          });
                          const colAvg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "-";
                          return (
                            <td key={cNum} className="p-2 text-center font-black text-[#1C6B53] dark:text-emerald-300">
                              {colAvg !== "-" ? `${colAvg}%` : "-"}
                            </td>
                          );
                        })}

                        {/* Outbound column avg when showOutbound is true */}
                        {showOutbound && (() => {
                          const nums: number[] = [];
                          currentCsrs.forEach(csrName => {
                            const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                            const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
                            const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
                            const val = (evalData[docId]?.scores || {})[`w${selectedWeek}_outbound`];
                            if (val && val.toUpperCase() !== "V" && val.toUpperCase() !== "N/A") {
                              const n = parseFloat(val);
                              if (!isNaN(n)) nums.push(n);
                            }
                          });
                          const outAvg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "-";
                          return (
                            <td className="p-2 text-center font-black text-amber-800 dark:text-amber-400 bg-amber-100/40 dark:bg-amber-950/30">
                              {outAvg !== "-" ? `${outAvg}%` : "-"}
                            </td>
                          );
                        })()}

                        {/* Total week/month team average */}
                        {(() => {
                          let totalAvg = "-";
                          if (selectedMonthFilter !== null) {
                            // Monthly avg of all agents
                            const vals = Object.values(tableMonthAgentAvgs)
                              .map(v => parseFloat(v))
                              .filter(n => !isNaN(n));
                            totalAvg = vals.length > 0
                              ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                              : "-";
                          } else {
                            const weekAverages: number[] = [];
                            currentCsrs.forEach(csrName => {
                              const slug = csrName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                              const sectionSlug = getActiveSectionSlug(currentSection.evaluator);
                              const docId = `${selectedYear}_${selectedQuarter}_${sectionSlug}_${slug}`;
                              const scores = evalData[docId]?.scores || {};
                              const avgStr = computeWeekAvg(scores, selectedWeek, isChatTeam, selectedYear, selectedQuarter);
                              if (avgStr !== "-" && avgStr !== "V") {
                                const n = parseFloat(avgStr);
                                if (!isNaN(n)) weekAverages.push(n);
                              }
                            });
                            totalAvg = weekAverages.length > 0
                              ? (weekAverages.reduce((a, b) => a + b, 0) / weekAverages.length).toFixed(1)
                              : "-";
                          }
                          return (
                            <td className="p-2 text-center font-black text-sm bg-emerald-200/60 dark:bg-emerald-900/60 text-[#1C6B53] dark:text-emerald-300">
                              {totalAvg !== "-" ? `${totalAvg}%` : "-"}
                            </td>
                          );
                        })()}
                      </>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Note & Conversation Link Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs" onClick={() => setActiveNoteModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-80 sm:w-96 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-100">
            
            {/* Header: Green document icon + CSR Name + Call Label + Trash */}
            <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">
                    {activeNoteModal.csrName} • {activeNoteModal.callLabel}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {isChatTeam ? "Chat Evaluation Note & Link" : "Call Evaluation Note & Link"}
                  </p>
                </div>
              </div>
              {(activeNoteModal.noteText.trim() || activeNoteModal.linkUrl.trim()) && (
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  disabled={savingNote}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer disabled:opacity-50"
                  title="Delete Note & Link"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* Note Textarea */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                Evaluation note
              </label>
              <textarea
                rows={3}
                value={activeNoteModal.noteText}
                onChange={(e) => setActiveNoteModal({ ...activeNoteModal, noteText: e.target.value })}
                placeholder="Enter evaluation note (e.g. -2, Missing greeting, incorrect step)..."
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs outline-none focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20 resize-none font-medium transition"
                autoFocus
              />
            </div>

            {/* Dedicated Conversation Link Field */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                Conversation link
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={activeNoteModal.linkUrl}
                    onChange={(e) => setActiveNoteModal({ ...activeNoteModal, linkUrl: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveNote();
                      }
                    }}
                    placeholder="https://app.intercom.com/..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#00A991] font-mono text-[11px]"
                  />
                </div>
                {activeNoteModal.linkUrl.trim() && (
                  <a
                    href={activeNoteModal.linkUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#00A991] dark:text-teal-300 rounded-xl text-xs font-black flex items-center gap-1 shrink-0 border border-emerald-200/60 dark:border-emerald-800/40 transition shadow-2xs cursor-pointer"
                    title="Open link in new tab"
                  >
                    <ExternalLink size={12} />
                    <span>Open ↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer: Press Enter to save + Save Note & Link Button */}
            <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">
                Press Enter to save
              </span>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={savingNote}
                className="bg-[#00A991] hover:bg-[#008f7a] text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {savingNote ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                <span>Save Note & Link</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add C Shift Agent Modal (Evening Call Team only) */}
      {showAddCShiftModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs" onClick={() => setShowAddCShiftModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-full max-w-md border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#00A991] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    Add Evening Call Agent
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Available members from Evening Call Team (Younis Kamal Team)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCShiftModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={cShiftSearchTerm}
                onChange={(e) => setCShiftSearchTerm(e.target.value)}
                placeholder="Search Evening Call agents..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Agent List */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800 pr-1 max-h-96">
              {eveningCallTeamMembers
                .filter(name => !cShiftSearchTerm.trim() || name.toLowerCase().includes(cShiftSearchTerm.toLowerCase()))
                .map(agentName => {
                  const isAdded = currentCsrs.includes(agentName);
                  const photo = memberPhotos[agentName.trim().toLowerCase()] || "";
                  return (
                    <div key={agentName} className="flex items-center justify-between py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition">
                      <div className="flex items-center gap-2.5">
                        {photo ? (
                          <img src={photo} alt={agentName} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-[#00A991] flex items-center justify-center font-bold text-xs">
                            {agentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">{agentName}</div>
                          <div className="text-[10px] text-gray-400">Evening Call Team (Younis Kamal)</div>
                        </div>
                      </div>

                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCShiftAgent(agentName)}
                          className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} className="text-emerald-600" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCShiftAgent(agentName)}
                          className="px-3 py-1 text-xs font-black text-white bg-[#00A991] hover:bg-[#008f7a] rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  );
                })}

              {eveningCallTeamMembers.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">
                  No Evening Call team members (Younis Kamal Team) found in the system.
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <span>{currentCsrs.length} agent(s) in Week {selectedWeek}</span>
              <button
                type="button"
                onClick={() => setShowAddCShiftModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Call Mon Agent Modal (Younis + Ankido Teams) */}
      {showAddCallMonModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs" onClick={() => setShowAddCallMonModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-full max-w-md border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    Add Call Mon Agent
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Younis Kamal Team + Ankido Buya Team
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCallMonModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={callMonSearchTerm}
                onChange={(e) => setCallMonSearchTerm(e.target.value)}
                placeholder="Search agents..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Agent List */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800 pr-1 max-h-96">
              {allCallTeamMembers
                .filter(m => !callMonSearchTerm.trim() || m.name.toLowerCase().includes(callMonSearchTerm.toLowerCase()))
                .map(({ name: agentName, team }) => {
                  const isAdded = callMonRoster.includes(agentName);
                  const photo = memberPhotos[agentName.trim().toLowerCase()] || "";
                  const isYounis = team.toLowerCase().includes("younis");
                  return (
                    <div key={agentName} className="flex items-center justify-between py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition">
                      <div className="flex items-center gap-2.5">
                        {photo ? (
                          <img src={photo} alt={agentName} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-[#0f766e] flex items-center justify-center font-bold text-xs">
                            {agentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">{agentName}</div>
                          <div className="text-[10px] text-gray-400">{isYounis ? "Younis Kamal Team" : "Ankido Buya Team"}</div>
                        </div>
                      </div>

                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCallMonAgent(agentName)}
                          className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} className="text-emerald-600" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCallMonAgent(agentName)}
                          className="px-3 py-1 text-xs font-black text-white bg-[#0f766e] hover:bg-[#0d6360] rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  );
                })}

              {allCallTeamMembers.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">
                  No agents found from Younis Kamal or Ankido Buya Teams.
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <span>{callMonRoster.length} agent(s) added</span>
              <button
                type="button"
                onClick={() => setShowAddCallMonModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self-Contained Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Profile Settings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update Your Display Name, Photo & Password</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 cursor-pointer">
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

            <form onSubmit={handleSaveProfile} className="space-y-4">
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

              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Account Role</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {isAdmin ? 'Administrator' : isManager ? 'Manager' : 'Quality Evaluator'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Email Address</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{userProfile?.email}</span>
                </div>
              </div>

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
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1C6B53] hover:bg-[#155a45] transition shadow-md shadow-[#1C6B53]/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Force Password Change Modal for QA First Login / After Reset */}
      {forcePasswordChange && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overscroll-contain">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-7 sm:p-8 max-w-md w-full border border-gray-100 dark:border-gray-800 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950 flex items-center justify-center text-[#1C6B53] dark:text-emerald-400 mb-4 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Security Password Update
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Welcome, <strong className="text-gray-800 dark:text-gray-200">{userProfile?.name || "User"}</strong>! Your password has been reset. To keep your account secure, please set your new personal password to continue to the dashboard.
              </p>
            </div>

            {forcePasswordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                {forcePasswordError}
              </div>
            )}

            <form onSubmit={handleForcePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters with letters & numbers"
                  value={forceNewPassword}
                  onChange={(e) => setForceNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium transition"
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
                  value={forceConfirmPassword}
                  onChange={(e) => setForceConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/70 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[#1C6B53] text-sm font-medium transition"
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Security Requirements:</p>
                <div className="flex items-center gap-1.5">
                  <span className={forceNewPassword.length >= 8 ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                  <span>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={/[A-Z]/.test(forceNewPassword) && /[a-z]/.test(forceNewPassword) ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                  <span>Uppercase & lowercase letters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={/[0-9]/.test(forceNewPassword) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forceNewPassword) ? "text-emerald-500 font-bold" : "text-gray-400"}>•</span>
                  <span>At least one number or special character</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={forcePasswordLoading}
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-lg shadow-[#1C6B53]/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {forcePasswordLoading ? "Updating Password..." : "Set New Password & Access Dashboard"}
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition text-center cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Activity Log Modal — Strictly Restricted to Admin & Manager (canSwitchTeams) */}
      {showActivityLogModal && canSwitchTeams && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowActivityLogModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0C3227] via-[#144d3c] to-[#1C6B53] text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <Activity size={20} className="text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black tracking-tight truncate">
                      Quality Evaluator Activity Log
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                      Admin & Manager Only
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/85 font-semibold truncate mt-0.5">
                    Selected Evaluator: <span className="font-black text-white">{currentSection.evaluator}</span> • {currentSection.team}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowActivityLogModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                title="Close Activity Log"
              >
                <X size={18} />
              </button>
            </div>

            {/* Evaluator Switcher + Day Filter Bar */}
            <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 space-y-3 shrink-0">
              {/* Quick Evaluator Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1 shrink-0">
                  Evaluator:
                </span>
                {DEFAULT_SECTIONS.map((sec) => {
                  const isActive = effectiveSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#1C6B53] text-white shadow-xs"
                          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {sec.evaluator}
                    </button>
                  );
                })}
              </div>

              {/* Day Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActivityFilterMode("today");
                      setActivityCustomDate(todayLocalStr);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      activityFilterMode === "today"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Today</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      activityFilterMode === "today"
                        ? "bg-white/25 text-white"
                        : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      {sectionActivityData.todayCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivityFilterMode("yesterday");
                      setActivityCustomDate(yesterdayLocalStr);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      activityFilterMode === "yesterday"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Yesterday</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      activityFilterMode === "yesterday"
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {sectionActivityData.yesterdayCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivityFilterMode("7days")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      activityFilterMode === "7days"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Last 7 Days</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      activityFilterMode === "7days"
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {sectionActivityData.last7DaysCount}
                    </span>
                  </button>
                </div>

                {/* Custom Day Picker with < > Navigation */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => stepActivityDate(-1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    title="Previous Day"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <input
                    type="date"
                    value={
                      activityFilterMode === "today"
                        ? todayLocalStr
                        : activityFilterMode === "yesterday"
                        ? yesterdayLocalStr
                        : activityCustomDate
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const val = e.target.value;
                        setActivityCustomDate(val);
                        if (val === todayLocalStr) setActivityFilterMode("today");
                        else if (val === yesterdayLocalStr) setActivityFilterMode("yesterday");
                        else setActivityFilterMode("custom");
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-black outline-none cursor-pointer ${
                      activityFilterMode === "custom"
                        ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300"
                        : "bg-transparent text-gray-700 dark:text-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => stepActivityDate(1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    title="Next Day"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Summary Strip */}
            <div className="px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-indigo-600/80 dark:text-indigo-300/80 uppercase tracking-wider">
                    Evaluations Entered ({sectionActivityData.activeDateLabel})
                  </p>
                  <p className="text-2xl font-black text-indigo-950 dark:text-white mt-0.5">
                    {sectionActivityData.filteredCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80 uppercase tracking-wider">
                    Agents Evaluated
                  </p>
                  <p className="text-2xl font-black text-emerald-950 dark:text-white mt-0.5">
                    {sectionActivityData.uniqueAgentsCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Users size={20} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-700/80 dark:text-amber-300/80 uppercase tracking-wider">
                    Coaching Notes Added
                  </p>
                  <p className="text-2xl font-black text-amber-950 dark:text-white mt-0.5">
                    {sectionActivityData.notesCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-600/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <MessageSquare size={20} />
                </div>
              </div>
            </div>

            {/* Detailed Activity List by Agent */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-gray-50/50 dark:bg-gray-950/40">
              {sectionActivityData.groupedByAgent.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Clock size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2.5" />
                  <p className="text-sm font-black text-gray-700 dark:text-gray-200">
                    No evaluations recorded for {currentSection.evaluator} on {sectionActivityData.activeDateLabel}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Try switching the day filter above (Yesterday, Last 7 Days, or pick a specific date).
                  </p>
                </div>
              ) : (
                sectionActivityData.groupedByAgent.map((agentGroup) => {
                  const latestTime = agentGroup.latestTimeStr;
                  const latestDate = agentGroup.latestDateStr;
                  return (
                    <div
                      key={`${agentGroup.quarter}_${agentGroup.shiftBadge}_${agentGroup.agentName}`}
                      className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-2xs hover:border-indigo-200 dark:hover:border-indigo-800/60 transition"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              if (agentGroup.items[0]) handleJumpToActivityItem(agentGroup.items[0]);
                            }}
                            className="text-sm font-black text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer flex items-center gap-1 group/agent"
                            title={`Jump to ${agentGroup.agentName} on the dashboard`}
                          >
                            <span>{agentGroup.agentName}</span>
                            <ExternalLink size={12} className="opacity-0 group-hover/agent:opacity-100 text-indigo-500 transition" />
                          </button>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                            agentGroup.shiftBadge === "Morning"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50"
                              : agentGroup.shiftBadge === "C Shift"
                              ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50"
                              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50"
                          }`}>
                            {agentGroup.shiftBadge}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {agentGroup.quarter}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {latestTime && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 dark:text-gray-500">
                              <Clock size={11} />
                              <span>{activityFilterMode === "7days" ? `${latestDate} • ${latestTime}` : latestTime}</span>
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                            {agentGroup.items.length} {agentGroup.items.length === 1 ? "Entry" : "Entries"}
                          </span>
                        </div>
                      </div>

                      {/* Individual Evaluated Calls / Chats Chips (Clickable to Jump to Dashboard Cell) */}
                      <div className="flex flex-wrap gap-2">
                        {agentGroup.items.map((item) => {
                          const numScore = Number(item.score);
                          const isHigh = !isNaN(numScore) && numScore >= 90;
                          const isMid = !isNaN(numScore) && numScore >= 80 && numScore < 90;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleJumpToActivityItem(item)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-indigo-50/80 dark:bg-gray-800/90 dark:hover:bg-indigo-950/60 border border-gray-200/80 hover:border-indigo-300 dark:border-gray-700/80 dark:hover:border-indigo-700 text-xs transition-all cursor-pointer active:scale-95 hover:shadow-xs group/chip"
                              title={item.noteText ? `Click to go to ${item.label} • Coaching Note: ${item.noteText}` : `Click to go to ${item.label} on dashboard`}
                            >
                              <span className="font-bold text-gray-600 group-hover/chip:text-indigo-700 dark:text-gray-300 dark:group-hover/chip:text-indigo-300 transition">
                                {item.label}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-md font-black text-[11px] ${
                                isHigh
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                  : isMid
                                  ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                                  : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                              }`}>
                                {item.score}%
                              </span>
                              {item.hasNote && (
                                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                  <MessageSquare size={11} />
                                  <span>Note</span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Sync Reminder Modal when trying to enter a new month before syncing a completed previous month */}
      {syncReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-800/80 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-100 dark:border-amber-900/50 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Lock size={22} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 mb-1">
                    Sync Required First • تنبيه المزامنة
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Sync {syncReminderModal.monthName} {selectedYear} Before Continuing
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncReminderModal(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                You have completed all 4 weeks of evaluations for{" "}
                <strong className="text-gray-900 dark:text-white">{syncReminderModal.monthName} {selectedYear}</strong>{" "}
                ({Object.keys(syncReminderModal.agentScores).length} employees), but you have not synced the month to the Team Leader &amp; Agent Dashboards yet.
              </p>
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 font-bold leading-relaxed" dir="rtl">
                لقد أكملت إدخال جميع أسابيع شهر <strong>{syncReminderModal.monthName} {selectedYear}</strong> بالكامل. يرجى الضغط على زر المزامنة (Sync) لعكس درجات الموظفين في داشبورد التيم ليدر والأيجنت أولاً قبل البدء بإدخال بيانات الشهر الجديد (<strong>{MONTH_NAMES[activeTableMonthIdx]}</strong>).
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const { quarter, weekStart } = getMonthWeekRange(syncReminderModal.monthIdx);
                    setSelectedQuarter(quarter);
                    setSelectedWeek(weekStart);
                    setSelectedMonthFilter(null);
                    setSyncReminderModal(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  Go Back to {syncReminderModal.monthName}
                </button>
                <button
                  type="button"
                  onClick={() => handleSyncToMetrics(syncReminderModal.monthIdx)}
                  disabled={syncingMetrics}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155a45] shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncingMetrics ? "animate-spin" : ""} />
                  <span>
                    {syncingMetrics
                      ? `Syncing ${syncReminderModal.monthName}...`
                      : `Sync ${syncReminderModal.monthName} Now & Unlock ${MONTH_NAMES[activeTableMonthIdx]}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sync Toast Notification */}
      {syncToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-5 ${
          syncToast.type === "success" 
            ? "bg-[#0C3227] text-white border-emerald-500/40 shadow-emerald-950/40" 
            : "bg-amber-950 text-white border-amber-500/40 shadow-amber-950/40"
        }`}>
          {syncToast.type === "success" ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-amber-400 shrink-0" />}
          <span>{syncToast.message}</span>
        </div>
      )}
    </div>
  );
}
