"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { db } from "@/lib/firebaseClient";
import { collection, doc, getDocs, query, where, onSnapshot, setDoc } from "firebase/firestore";
import { 
  ArrowLeft, Search, Users, Check, Save, Sliders, Building2, Plus, Trash2, Edit2, Globe, Languages, 
  Sun, Moon, ChevronDown, Sparkles,
  Award, X, Printer, UserCheck, Star,
  Info, ThumbsUp, Target, BookOpen, AlertTriangle,
  PhoneCall, ShieldCheck, CheckCircle, Calendar,
  Clock, Eye, Lock, MessageSquare,
  ClipboardList, CheckCircle2, XCircle, AlertCircle,
  Filter, Copy, ListChecks, ExternalLink
} from "lucide-react";
import { getCanonicalAgentName } from "@/lib/canonicalAgents";
import { isMemberActiveInPeriod } from "@/lib/companyRoster";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import { ModernDropdown } from "@/components/ModernDropdown";
import { UnifiedTopNavbar, ActiveDashboardType } from "@/components/UnifiedTopNavbar";
import { BASELINE_ANNUAL_EVALUATIONS } from "@/lib/baselineAnnualEvaluations";
import { useBodyScrollLock } from "@/lib/scrollLock";
import { 
  DynamicCriterion, 
  DynamicSection, 
  DynamicDepartment, 
  DynamicEmployee,
  loadStoredCriteria, 
  saveStoredCriteria, 
  loadStoredSections, 
  saveStoredSections, 
  loadStoredDepartments, 
  saveStoredDepartments, 
  loadStoredEmployees, 
  saveStoredEmployees,
  loadEvaluationRecord,
  saveEvaluationRecord,
  DEFAULT_CRITERIA,
  DEFAULT_SECTIONS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_EMPLOYEES
} from "@/lib/customCriteriaManager";
import { ManageCriteriaModal } from "@/components/ManageCriteriaModal";
import { ManageStaffModal } from "@/components/ManageStaffModal";
import { TRANSLATIONS, Language } from "@/lib/translations";


export interface AnnualEvaluationDashboardProps {
  userProfile: any;
  allMembers?: any[];
  selectedYear?: string;
  onBack: () => void;
  onLogout?: () => void;
  onNavigate?: (target: ActiveDashboardType) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export function toTitleCase(str: string) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

export function normalizeAgentName(raw: string): string {
  if (!raw) return "";
  const canonical = getCanonicalAgentName(raw);
  return (canonical || raw)
    .toLowerCase()
    .replace(/[\._\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Distinct, vibrant, executive rating levels (Scale 1 to 5) - Exact Official Corporate Rubric
export const RATING_LEVELS = [
  { 
    level: 5, 
    label: "Outstanding", 
    color: "text-white", 
    bg: "bg-[#1C6B53] text-white border-[#155340] shadow-xs", 
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-[#1C6B53] dark:text-emerald-300",
    desc: "Consistently delivers exceptional results, exceeds goals, and serves as a role model for others." 
  },
  { 
    level: 4, 
    label: "Exceeds Expectations", 
    color: "text-white", 
    bg: "bg-blue-600 text-white border-blue-700 shadow-xs", 
    badgeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    desc: "Frequently performs above expectations and consistently delivers high-quality work." 
  },
  { 
    level: 3, 
    label: "Meets Expectations", 
    color: "text-white", 
    bg: "bg-slate-600 text-white border-slate-700 shadow-xs", 
    badgeBg: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200",
    desc: "Reliably meets job expectations and completes responsibilities effectively." 
  },
  { 
    level: 2, 
    label: "Developing", 
    color: "text-white", 
    bg: "bg-amber-600 text-white border-amber-700 shadow-xs", 
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300",
    desc: "Meets some expectations but requires further development and regular guidance in certain areas." 
  },
  { 
    level: 1, 
    label: "Needs Improvement", 
    color: "text-white", 
    bg: "bg-rose-600 text-white border-rose-700 shadow-xs", 
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300",
    desc: "Performance is below expectations and significant improvement is required to meet the role requirements." 
  },
];

// Dynamic color helper per score degree (1=Rose, 2=Amber, 3=Slate, 4=Blue, 5=Emerald)
export function getRatingButtonClass(level: number, isActive: boolean) {
  if (!isActive) {
    return "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700";
  }
  switch (level) {
    case 5:
      return "bg-[#1C6B53] text-white shadow-xs ring-2 ring-emerald-400 dark:ring-emerald-500 font-black";
    case 4:
      return "bg-blue-600 text-white shadow-xs ring-2 ring-blue-400 dark:ring-blue-500 font-black";
    case 3:
      return "bg-slate-600 text-white shadow-xs ring-2 ring-slate-400 dark:ring-slate-500 font-black";
    case 2:
      return "bg-amber-600 text-white shadow-xs ring-2 ring-amber-400 dark:ring-amber-500 font-black";
    case 1:
      return "bg-rose-600 text-white shadow-xs ring-2 ring-rose-400 dark:ring-rose-500 font-black";
    default:
      return "bg-[#1C6B53] text-white font-black";
  }
}

export function getRatingInfo(score: number) {
  if (score >= 4.5) return RATING_LEVELS[0];
  if (score >= 3.5) return RATING_LEVELS[1];
  if (score >= 2.5) return RATING_LEVELS[2];
  if (score >= 1.5) return RATING_LEVELS[3];
  return RATING_LEVELS[4];
}

export const COMPETENCIES_LIST = [
  {
    id: "communication",
    name: "Communication",
    description: "Conveys information clearly and professionally. Actively listens, demonstrates empathy, and maintains high standards of courteous communication with customers and colleagues."
  },
  {
    id: "problem_solving",
    name: "Problem Solving",
    description: "Quickly diagnoses customer needs and formulates compliant, practical solutions. Maintains composure and analytical clarity during escalations."
  },
  {
    id: "accountability",
    name: "Accountability",
    description: "Takes ownership of tasks and outcomes. Follows through on commitments and addresses mistakes constructively without requiring close supervision."
  },
  {
    id: "initiative",
    name: "Initiative",
    description: "Proactively suggests workflow enhancements, assists team members, and seeks professional self-development opportunities independently."
  },
  {
    id: "responsibility",
    name: "Responsibility",
    description: "Strictly complies with banking policies, data security guidelines, and work schedules. Demonstrates high integrity and reliability."
  },
  {
    id: "team_work",
    name: "Team Work",
    description: "Collaborates positively with peers and leaders. Shares domain knowledge, supports team members during peak volumes, and fosters high team morale."
  }
];

export const COMPETENCY_DEFINITIONS: Record<string, { id: string; name: string; description: string }> = {
  communication: {
    id: "communication",
    name: "Communication",
    description: "Conveys information clearly and professionally. Actively listens, demonstrates empathy, and maintains high standards of courteous communication with customers and colleagues."
  },
  problem_solving: {
    id: "problem_solving",
    name: "Problem Solving",
    description: "Quickly diagnoses customer needs and formulates compliant, practical solutions. Maintains composure and analytical clarity during escalations."
  },
  accountability: {
    id: "accountability",
    name: "Accountability",
    description: "Takes ownership of tasks and outcomes. Follows through on commitments and addresses mistakes constructively without requiring close supervision."
  },
  initiative: {
    id: "initiative",
    name: "Initiative",
    description: "Proactively suggests workflow enhancements, assists team members, and seeks professional self-development opportunities independently."
  },
  responsibility: {
    id: "responsibility",
    name: "Responsibility",
    description: "Strictly complies with banking policies, data security guidelines, and work schedules. Demonstrates high integrity and reliability."
  },
  team_work: {
    id: "team_work",
    name: "Team Work",
    description: "Collaborates positively with peers and leaders. Shares domain knowledge, supports team members during peak volumes, and fosters high team morale."
  },
  customer_focus: {
    id: "customer_focus",
    name: "Customer Focus",
    description: "Consistently demonstrates dedication to meeting customer needs, elevating service excellence, and resolving inquiries with care and empathy."
  },
  digitalization: {
    id: "digitalization",
    name: "Digitalization & Innovation",
    description: "Actively adopts and champions digital tools, automated workflows, and innovative solutions to enhance operational quality and productivity."
  }
};

export interface KpiItemDefinition {
  id: string;
  name: string;
  description?: string;
  actual?: string | null;
}

export const TRAINER_KPIS: KpiItemDefinition[] = [
  { id: "training_delivery", name: "Training Delivery & Execution", description: "Delivery of all training programs across the contact center according to annual training plan." },
  { id: "knowledge_assessment", name: "Knowledge Assessment & Testing", description: "Design, conduct, and score knowledge assessment exams and test results for onboarding & refresher training." },
  { id: "training_materials", name: "Training Materials & Content", description: "Development, continuous enhancement, and updating of training slides, manuals, SOPs, and product guides." },
  { id: "jira_reporting", name: "Jira & Reporting", description: "Timely resolution of Jira tickets, comprehensive training reports, audit documentation, and analytics." },
  { id: "attendance_engagement", name: "Attendance & Engagement", description: "Trainee attendance tracking, punctuality, professional conduct, and fostering high engagement." },
];

export const QA_KPIS: KpiItemDefinition[] = [
  { id: "evaluation_accuracy", name: "Evaluation Accuracy & Calibration", description: "Ensuring 100% calibration alignment, audit reliability, and accurate scoring across audited customer interactions." },
  { id: "team_improvement", name: "Team Performance Improvement", description: "Measurable QA performance improvement and error reduction in coached and audited agents." },
  { id: "reporting", name: "Quality Reporting & Insights", description: "Timely delivery of recurring quality reports, executive summaries, root-cause analyses, and action plans." },
  { id: "session", name: "Coaching & Calibration Sessions", description: "Conducting targeted coaching sessions, calibration meetings with team leaders, and quality feedback loops." },
  { id: "attendance", name: "Attendance & Punctuality", description: "Adherence to schedule, shift timings, audit volume deadlines, and institutional banking policies." },
];

export const TL_KPIS: KpiItemDefinition[] = [
  { id: "leadership", name: "Leadership & Team Management", description: "Effectively guiding, mentoring, motivating, and supporting team members toward operational excellence." },
  { id: "team_kpi", name: "Team KPI Achievement", description: "Achieving target Service Level, QA averages, AHT/ART benchmarks, and operational KPIs across the assigned team." },
  { id: "reporting", name: "Operational Reporting & Workflow", description: "Timely submission of shift handovers, daily logs, SLA reports, escalation handling, and incident tracking." },
  { id: "attendance", name: "Attendance & Team Discipline", description: "Team schedule adherence, punctuality, shift coverage management, and strict policy compliance." },
  { id: "team_improvement", name: "Team Development & Coaching", description: "Continuous coaching, one-on-one reviews, skill improvement, and reducing low-performance outliers." },
];

export const BACKOFFICE_KPIS: KpiItemDefinition[] = [
  { id: "accuracy", name: "Accuracy", description: "Ensuring zero-error rate, exact transaction processing, and data integrity." },
  { id: "sla_compliance", name: "SLA Compliance", description: "Adherence to agreed turnaround time (TAT), operational deadlines, and SLA targets." },
  { id: "followup_efficiency", name: "Follow-up Efficiency", description: "Proactive tracking of pending cases, timely resolution, and cross-department follow-ups." },
  { id: "ticket_management", name: "Ticket Management", description: "Queue management, accurate ticket categorization, status documentation, and timely closure." },
  { id: "attendance_commitment", name: "Attendance & Commitment", description: "Schedule adherence, punctuality, shift coverage, and high commitment to institutional banking standards." },
];

export interface SpecialStaffMember {
  id: string;
  agent_name: string;
  name: string;
  employee_id: string;
  team: string;
  role_type: "trainer" | "qa" | "tl" | "backoffice";
  department: string;
  manager_name: string;
  is_special_staff?: boolean;
}

export const SPECIAL_STAFF_MEMBERS: SpecialStaffMember[] = [
  { id: "mohammed_azad", agent_name: "Mohammed Azad", name: "Mohammed Azad", employee_id: "353", team: "Training Team", role_type: "trainer", department: "Training", manager_name: "Jalal Burghol", is_special_staff: true },
  { id: "mohammed_jihad", agent_name: "Mohammed Jihad", name: "Mohammed Jihad", employee_id: "356", team: "Quality Assurance Team", role_type: "qa", department: "Call center - Quality", manager_name: "Jalal Burghol", is_special_staff: true },
  { id: "lara_kamil", agent_name: "Lara Kamil", name: "Lara Kamil", employee_id: "351", team: "Quality Assurance Team", role_type: "qa", department: "Quality", manager_name: "Jalal Burghol", is_special_staff: true },
  { id: "shireen_waisi", agent_name: "Shireen Waisi", name: "Shireen Waisi", employee_id: "370", team: "Back Office", role_type: "backoffice", department: "Back Office", manager_name: "Jalal Burghol", is_special_staff: true },
  { id: "ankido_buya", agent_name: "Ankido Buya", name: "Ankido Buya", employee_id: "340", team: "Ankido Buya Team", role_type: "tl", department: "Contact Center", manager_name: "Jalal Burghol", is_special_staff: true },
  { id: "younis_kamal", agent_name: "Younis Kamal", name: "Younis Kamal", employee_id: "373", team: "Younis Kamal Team", role_type: "tl", department: "Contact Center", manager_name: "Jalal Burghol", is_special_staff: true },
  { id: "mohammed_dlshad", agent_name: "Mohammed Dilshad", name: "Mohammed Dilshad", employee_id: "338", team: "Mohammed Dlshad Team", role_type: "tl", department: "Contact Center", manager_name: "Jalal Burghol", is_special_staff: true },
];

export { DEFAULT_COMPANY_EMPLOYEES } from "@/lib/companyRoster";
import { DEFAULT_COMPANY_EMPLOYEES } from "@/lib/companyRoster";

export const KNOWN_EMPLOYEE_IDS: Record<string, string> = {
  "alla satar": "339",
  "alla_satar": "339",
  "zhalla salam": "377",
  "zhalla_salam": "377",
  "rabar mohammed": "364",
  "rabar_mohammed": "364",
  "taban sirwan": "372",
  "taban_sirwan": "372",
  "dhuha khanjer": "344",
  "dhuha_khanjer": "344",
  "dhuha khanjer noori": "344",
  "dhuha_khanjer_noori": "344",
  "shireen waisi": "370",
  "shireen_waisi": "370",
  "kani sami": "349",
  "kani_sami": "349",
  "soma sherko": "371",
  "soma_sherko": "371",
  "soma muhammed": "371",
  "soma_muhammed": "371",
  "frmesk younis": "345",
  "frmesk_younis": "345",
  "muzhda omar": "358",
  "muzhda_omar": "358",
  "muzhda omar ali": "358",
  "muzhda_omar_ali": "358",
  "rasan ismail musa": "365",
  "rasan_ismail_musa": "365",
  "rasan ismail": "365",
  "rasan_ismail": "365",
  "rassan ismail": "365",
  "rassan_ismail": "365",
  "aya yasin": "341",
  "aya_yasin": "341",
  "lana halmat rafeeq": "350",
  "lana_halmat_rafeeq": "350",
  "lana halmat": "350",
  "lana_halmat": "350",
  "zainab khalid rasheed": "376",
  "zainab_khalid_rasheed": "376",
  "zainab khalid": "376",
  "zainab_khalid": "376",
  "saja bashar anwar": "366",
  "saja_bashar_anwar": "366",
  "saja bashar": "366",
  "saja_bashar": "366",
  "haneen abd-al kareem": "586",
  "haneen_abd_al_kareem": "586",
  "haneen abd al kareem": "586",
  "haneen abdelkareem": "586",
  "haneen_abdelkareem": "586",
  "mokhalad ali": "507",
  "mokhalad_ali": "507",
  "mukhalad ali": "507",
  "mukhalad_ali": "507",
  "akar omer": "337",
  "akar_omer": "337",
  "kazhvan wirya": "575",
  "kazhvan_wirya": "575",
  "ahmed rustam": "336",
  "ahmed_rustam": "336",
  "hewr adnan": "348",
  "hewr_adnan": "348",
  "yousif rashid darwesh": "374",
  "yousif_rashid_darwesh": "374",
  "yousif rashid": "374",
  "yousif_rashid": "374",
  "haseeb adeeb": "347",
  "haseeb_adeeb": "347",
  "mohammed azad": "353",
  "mohammed_azad": "353",
  "mohammed jihad": "356",
  "mohammed_jihad": "356",
  "lara kamil": "351",
  "lara_kamil": "351",
  "ankido buya": "340",
  "ankido_buya": "340",
  "younis kamal": "373",
  "younis_kamal": "373",
  "mohammed dlshad": "338",
  "mohammed_dlshad": "338",
  "mohammed dilshad": "338",
  "mohammed_dilshad": "338",
  "nawen maadh": "360",
  "nawen_maadh": "360",
  "bana ahmed": "343",
  "bana_ahmed": "343",
  "azad muhammad": "342",
  "azad_muhammad": "342",
  "azad muhammad abdullah": "342",
  "azad_muhammad_abdullah": "342",
  "azad mohammed": "342",
  "azad_mohammed": "342",
};

const AVAILABLE_YEARS = ["2026", "2027", "2028", "2029", "2030"];

export default function AnnualEvaluationDashboard({
  userProfile,
  allMembers = [],
  selectedYear: initialYear = "2026",
  onBack,
  onLogout,
  onNavigate,
  onOpenProfile,
  onOpenSettings,
  isDarkMode = false,
  toggleDarkMode
}: AnnualEvaluationDashboardProps) {
  const isAdmin = userProfile?.role === 'admin' || userProfile?.email?.toLowerCase() === 'mohammed.dlshad0@gmail.com' || userProfile?.email?.toLowerCase() === 'omar.ayad@fib.iq';
  const isManager = isAdmin || userProfile?.role === 'manager' || userProfile?.email?.toLowerCase() === 'jalal.burghol@agent.com';
  const isTL = userProfile?.role === 'tl';
  const isQA = userProfile?.role === 'qa' || userProfile?.role === 'trainer' || userProfile?.role === 'auditor';
  const isAgent = userProfile?.role === 'agent';

  const emailLower = (userProfile?.email || "").toLowerCase().trim();
  const nameLower = (userProfile?.name || userProfile?.agent_name || "").toLowerCase().trim();
  const roleLower = (userProfile?.role || "").toLowerCase().trim();
  const userTeamLower = (userProfile?.team || userProfile?.name || userProfile?.email || "").toLowerCase();

  // Role detection for specific special staff users
  const isUserMohammedAzad = (emailLower.includes("mohammed.azad") || nameLower.includes("mohammed azad") || roleLower === "trainer") && !emailLower.includes("azad.muhammad") && !emailLower.includes("azad.mohammed") && !nameLower.includes("azad muhammad") && !nameLower.includes("azad mohammed");
  const isUserMohammedJihad = (emailLower.includes("jihad") || nameLower.includes("jihad")) && !nameLower.includes("younis");
  const isUserLaraKamil = emailLower.includes("lara") || nameLower.includes("lara");
  const isUserAnkido = emailLower.includes("ankido") || nameLower.includes("ankido");
  const isUserYounis = emailLower.includes("younis") || nameLower.includes("younis");
  const isUserShireenWaisi = emailLower.includes("shireen") || nameLower.includes("shireen") || roleLower === "backoffice";

  // Single-user self view only for Trainer, QA, Back Office, and Team Leaders:
  // "التيم ليدر خلي بس يشوفون تقييمهم و ليس مال تيمهم"
  const isUserSpecialStaffOnly = (isUserMohammedAzad || isUserMohammedJihad || isUserLaraKamil || isUserShireenWaisi || isTL || isUserAnkido || isUserYounis) && !isAdmin && !isManager;

  // Strict Team Leader team scope (null for TLs now because they only view their own evaluation)
  const tlAssignedTeam: "Younis" | "Ankido" | "Mohammed" | null = null;

  // Selected filters: Year (2026-2030) and Period (Semi-Annual & Annual only)
  const [selectedYear, setSelectedYear] = useState<string>(initialYear || "2026");

  useEffect(() => {
    if (initialYear && initialYear !== selectedYear) {
      setSelectedYear(initialYear);
    }
  }, [initialYear]);

  const [yearDropdownOpen, setYearDropdownOpen] = useState<boolean>(false);
  // Period is strictly Annual (no Semi-Annual)
  const [selectedPeriod, setSelectedPeriod] = useState<"Annual">("Annual");

  // Language State: default 'en' (English by default as requested!)
  const [lang, setLang] = useState<Language>("en");
  const t = TRANSLATIONS[lang];
  const isAr = lang === "ar";

  const toggleLanguage = () => {
    const nextLang: Language = lang === "en" ? "ar" : "en";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("fib_eval_language", nextLang);
    }
  };

  const getTierLabel = (tierLevel: number) => {
    switch (tierLevel) {
      case 5: return t.tier5;
      case 4: return t.tier4;
      case 3: return t.tier3;
      case 2: return t.tier2;
      case 1: return t.tier1;
      default: return "";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("fib_eval_language") as Language;
      if (savedLang === "ar" || savedLang === "en") {
        setLang(savedLang);
      }
    }
  }, []);

  // Dynamic Criteria, Sections, Departments, Employees
  const [criteria, setCriteria] = useState<DynamicCriterion[]>([]);
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [departments, setDepartments] = useState<DynamicDepartment[]>([]);
  const [dynamicEmployees, setDynamicEmployees] = useState<DynamicEmployee[]>([]);

  // Modals
  const [showManageCriteriaModal, setShowManageCriteriaModal] = useState<boolean>(false);
  const [showManageStaffModal, setShowManageStaffModal] = useState<boolean>(false);

  useEffect(() => {
    setCriteria(loadStoredCriteria());
    setSections(loadStoredSections());
    setDepartments(loadStoredDepartments());
    setDynamicEmployees(loadStoredEmployees());
  }, []);

  // Selected Employee (Supports all employees across teams)
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>("");
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState<boolean>(false);
  const employeeButtonRef = useRef<HTMLButtonElement>(null);
  const [employeeDropdownCoords, setEmployeeDropdownCoords] = useState<{ top: number; right: number } | null>(null);

  // Department Filter & Dropdown
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("All");
  const [deptDropdownOpen, setDeptDropdownOpen] = useState<boolean>(false);
  const deptButtonRef = useRef<HTMLButtonElement>(null);
  const [deptDropdownCoords, setDeptDropdownCoords] = useState<{ top: number; right: number } | null>(null);

  const updateDeptDropdownPosition = useCallback(() => {
    if (deptButtonRef.current && typeof window !== "undefined") {
      const rect = deptButtonRef.current.getBoundingClientRect();
      const rightDistance = Math.max(16, window.innerWidth - rect.right);
      setDeptDropdownCoords({
        top: rect.bottom + 8,
        right: rightDistance,
      });
    }
  }, []);

  const toggleDeptDropdown = useCallback(() => {
    if (!deptDropdownOpen) {
      updateDeptDropdownPosition();
      setDeptDropdownOpen(true);
    } else {
      setDeptDropdownOpen(false);
    }
  }, [deptDropdownOpen, updateDeptDropdownPosition]);

  useEffect(() => {
    if (!deptDropdownOpen) return;
    const handleScrollOrResize = () => {
      updateDeptDropdownPosition();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [deptDropdownOpen, updateDeptDropdownPosition]);

  const updateEmployeeDropdownPosition = useCallback(() => {
    if (employeeButtonRef.current && typeof window !== "undefined") {
      const rect = employeeButtonRef.current.getBoundingClientRect();
      const rightDistance = Math.max(16, window.innerWidth - rect.right);
      setEmployeeDropdownCoords({
        top: rect.bottom + 8,
        right: rightDistance,
      });
    }
  }, []);

  const toggleEmployeeDropdown = useCallback(() => {
    if (!employeeDropdownOpen) {
      updateEmployeeDropdownPosition();
      setEmployeeDropdownOpen(true);
    } else {
      setEmployeeDropdownOpen(false);
    }
  }, [employeeDropdownOpen, updateEmployeeDropdownPosition]);

  useEffect(() => {
    if (!employeeDropdownOpen) return;
    const handleScrollOrResize = () => {
      updateEmployeeDropdownPosition();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [employeeDropdownOpen, updateEmployeeDropdownPosition]);

  const [teamTabFilter, setTeamTabFilter] = useState<string>("Younis");

  // Guide Modal State
  const [showBenchmarkGuideModal, setShowBenchmarkGuideModal] = useState<boolean>(false);
  const [benchmarkGuideTab, setBenchmarkGuideTab] = useState<"calls" | "chat" | "competencies">("calls");

  // Helper to dynamically determine team leader from team name
  const resolveTeamLeader = (teamName?: string) => {
    if (!teamName) return "Contact Center Team Leader";
    if (teamName.includes('Ankido')) return "Ankido Buya";
    if (teamName.includes('Mohammed') || teamName.includes('Dlshad')) return "Mohammed Dilshad";
    if (teamName.includes('Younis')) return "Younis Kamal";
    return teamName;
  };

  // Form State
  const [evaluationDate, setEvaluationDate] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [teamLeader, setTeamLeader] = useState<string>("Contact Center Team Leader");

  // KPIs State (Self & Manager)
  const [selfKpis, setSelfKpis] = useState<Record<string, number>>({});
  const [managerKpis, setManagerKpis] = useState<Record<string, number>>({});

  // Competencies State (Self & Manager)
  const [selfCompetencies, setSelfCompetencies] = useState<Record<string, number>>({});
  const [managerCompetencies, setManagerCompetencies] = useState<Record<string, number>>({});

  // Qualitative Feedback
  const [keyStrengths, setKeyStrengths] = useState<string>("");
  const [areasForDevelopment, setAreasForDevelopment] = useState<string>("");
  const [managerComments, setManagerComments] = useState<string>("");
  const [employeeComments, setEmployeeComments] = useState<string>("");

  // Criterion-Level Notes: Structured notes on any metric for employee or manager
  type CriterionNoteTopic = "achievement" | "justification" | "improvement" | "incident" | "general";
  interface CriterionNoteEntry {
    role: "manager" | "employee";
    authorName?: string;
    topic: CriterionNoteTopic;
    text: string;
    updatedAt?: string;
  }
  const [criterionNotes, setCriterionNotes] = useState<Record<string, { employee?: CriterionNoteEntry; manager?: CriterionNoteEntry }>>({});
  const [openNoteCriterionId, setOpenNoteCriterionId] = useState<string | null>(null);
  const [noteActiveTab, setNoteActiveTab] = useState<"manager" | "employee">("manager");

  // Clean English helper to guarantee no Arabic inside parentheses shows in English mode
  const cleanEnglish = (text: string) => (text || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim();
  const getCriterionTitle = (c: { name: string; nameAr?: string }) => {
    if (isAr) return c.nameAr || c.name;
    return cleanEnglish(c.name);
  };
  const getCriterionDesc = (c: { description?: string; descriptionAr?: string }) => {
    if (isAr) return c.descriptionAr || c.description || "";
    return cleanEnglish(c.description || "");
  };

  // Status & Metadata
  const [evaluationStatus, setEvaluationStatus] = useState<"draft" | "self_submitted" | "manager_finalized">("draft");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Self check: Is the user viewing their own evaluation?
  const isViewingSelf = useMemo(() => {
    const myName = normalizeAgentName(userProfile?.name || userProfile?.agent_name || "");
    const targetName = normalizeAgentName(selectedEmployeeName || "");
    if (!myName || !targetName) return false;
    if (myName === targetName || myName.includes(targetName) || targetName.includes(myName)) return true;
    const myEmail = (userProfile?.email || "").toLowerCase();
    if ((myEmail.includes("mohammed.azad") || roleLower === "trainer") && targetName.includes("mohammed azad")) return true;
    if ((myEmail.includes("azad.muhammad") || myEmail.includes("azad.mohammed") || myName.includes("azad muhammad") || myName.includes("azad mohammed")) && (targetName.includes("azad muhammad") || targetName.includes("azad mohammed"))) return true;
    if (myEmail.includes("jihad") && targetName.includes("jihad")) return true;
    if (myEmail.includes("lara") && targetName.includes("lara")) return true;
    if (myEmail.includes("shireen") && targetName.includes("shireen")) return true;
    if (myEmail.includes("ankido") && targetName.includes("ankido")) return true;
    if (myEmail.includes("younis") && targetName.includes("younis")) return true;
    if (myEmail.includes("dlshad") && targetName.includes("dlshad")) return true;
    return false;
  }, [userProfile, selectedEmployeeName]);

  // Current member role type
  const currentMemberRoleType: "trainer" | "qa" | "tl" | "backoffice" | "agent" = useMemo(() => {
    const norm = normalizeAgentName(selectedEmployeeName || "");
    const special = SPECIAL_STAFF_MEMBERS.find(s => normalizeAgentName(s.agent_name) === norm);
    if (special) return special.role_type;
    return "agent";
  }, [selectedEmployeeName]);

  // Permissions & Role Access:
  // Team Leaders & Quality Team are view-only when viewing others, but can edit their OWN self-evaluation
  // Manager (Jalal Burghol) evaluates Trainer, QA, and TLs later:
  // "و النجر بعدين رح يقيمة هذا الاقيم الي هو مسوي"
  const isReadOnly = (isTL || isQA) && !isViewingSelf;
  const canEditSelf = (isViewingSelf || isAgent || isAdmin || isManager) && evaluationStatus !== 'manager_finalized';
  const canEditManager = (isManager || isAdmin);
  const canApplySuggestions = canEditManager && currentMemberRoleType === "agent";
  const canEditEmployeeFeedback = (isAdmin || isManager || canEditSelf);

  // Manager data visibility:
  // Manager ratings and scores are only visible to the agent/staff AFTER manager finalizes
  const isManagerDataVisible = isManager || isAdmin || evaluationStatus === 'manager_finalized';

  // Real actual metrics fetched for the period to assist evaluation
  const [actualMetricsSummary, setActualMetricsSummary] = useState<any | null>(null);

  // Coverage Tracking State (Evaluation Status across all employees)
  const [allEvaluationsMap, setAllEvaluationsMap] = useState<Record<string, any>>({});
  const [showCoverageModal, setShowCoverageModal] = useState<boolean>(false);
  const [coverageFilterStatus, setCoverageFilterStatus] = useState<"pending" | "completed" | "all">("pending");
  const [coverageTeamFilter, setCoverageTeamFilter] = useState<string>("all");
  const [coverageDeptFilter, setCoverageDeptFilter] = useState<string>("all");
  const [coverageSearchTerm, setCoverageSearchTerm] = useState<string>("");
  const [coverageCopiedToast, setCoverageCopiedToast] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent background body scroll when any modal or dropdown is open across the dashboard
  useBodyScrollLock(Boolean(showCoverageModal || showBenchmarkGuideModal || employeeDropdownOpen || deptDropdownOpen || showManageCriteriaModal || showManageStaffModal));

  // Lock team tab filter for Team Leaders to their team only
  useEffect(() => {
    if (tlAssignedTeam && teamTabFilter !== tlAssignedTeam) {
      setTeamTabFilter(tlAssignedTeam);
    }
  }, [tlAssignedTeam, teamTabFilter]);

  // Live real-time listener on all annual_evaluations collection docs for coverage tracking
  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(collection(db, "annual_evaluations"), (snap) => {
      if (!isMounted) return;
      const map: Record<string, any> = { ...BASELINE_ANNUAL_EVALUATIONS };
      snap.docs.forEach(d => {
        map[d.id] = { id: d.id, ...d.data() };
      });
      setAllEvaluationsMap(map);
    }, (err) => {
      console.warn("annual_evaluations collection listener warning:", err);
      if (isMounted) setAllEvaluationsMap({ ...BASELINE_ANNUAL_EVALUATIONS });
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Internal loaded members list (initialized with full official roster + live Firestore sync)
  const [internalMembers, setInternalMembers] = useState<any[]>(DEFAULT_COMPANY_EMPLOYEES);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  // 1. Live real-time listener on team_members collection
  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(collection(db, 'team_members'), (snap) => {
      if (!isMounted) return;
      const members = snap.docs.map(d => {
        const data = d.data();
        const name = (data.agent_name || data.name || data.display_name || "").trim();
        return {
          id: d.id,
          ...data,
          agent_name: name,
          name: name,
          team: data.team || "Contact Center"
        };
      }).filter(m => Boolean(m.agent_name));

      if (members.length > 0) {
        setInternalMembers(prev => {
          const map = new Map<string, any>();
          DEFAULT_COMPANY_EMPLOYEES.forEach(m => map.set(normalizeAgentName(m.agent_name), { ...m }));
          members.forEach(m => {
            const k = normalizeAgentName(m.agent_name);
            const existing = map.get(k);
            if (existing) {
              map.set(k, { ...existing, ...m, id: m.id, team: m.team || existing.team });
            }
          });
          return Array.from(map.values()).sort((a, b) => a.agent_name.localeCompare(b.agent_name));
        });
      }
    }, (err) => {
      console.warn("Annual eval team_members live listener warning:", err);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // 2. Direct fetch & sync to attach Firestore IDs to canonical roster
  useEffect(() => {
    let isMounted = true;
    const fetchAllCompanyEmployees = async () => {
      try {
        const membersMap = new Map<string, any>();
        DEFAULT_COMPANY_EMPLOYEES.forEach(m => {
          membersMap.set(normalizeAgentName(m.agent_name), { ...m });
        });

        // Add from team_members direct getDocs
        try {
          const tmSnap = await getDocs(collection(db, 'team_members'));
          tmSnap.forEach(d => {
            const data = d.data();
            const name = (data.agent_name || data.name || data.display_name || "").trim();
            if (name) {
              const key = normalizeAgentName(name);
              const existing = membersMap.get(key);
              if (existing) {
                membersMap.set(key, { ...existing, id: d.id, team: data.team || existing.team });
              }
            }
          });
        } catch (e) {}

        // Add from users collection
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          usersSnap.forEach(d => {
            const data = d.data();
            const name = (data.name || data.agent_name || data.display_name || "").trim();
            if (name) {
              const key = normalizeAgentName(name);
              const existing = membersMap.get(key);
              if (existing) {
                membersMap.set(key, { ...existing, id: d.id, team: data.team || existing.team });
              }
            }
          });
        } catch (e) {}

        if (isMounted && membersMap.size > 0) {
          setInternalMembers(Array.from(membersMap.values()).sort((a, b) => 
            a.agent_name.localeCompare(b.agent_name)
          ));
        }
      } catch (err) {
        console.error("Error ensuring all company employees:", err);
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    };

    fetchAllCompanyEmployees();
    return () => { isMounted = false; };
  }, [allMembers, selectedYear]);

  // Combined master members list: 38 official agents + Special Staff (Trainer, QA, Team Leaders)
  const effectiveAllMembers = useMemo(() => {
    const map = new Map<string, any>();
    
    // 1. Initial base: All 38 Company employees
    DEFAULT_COMPANY_EMPLOYEES.forEach(m => {
      map.set(normalizeAgentName(m.agent_name), { ...m });
    });

    // 1b. Add Special Staff (Trainer, QA, Team Leaders)
    SPECIAL_STAFF_MEMBERS.forEach(s => {
      const k = normalizeAgentName(s.agent_name);
      if (!map.has(k)) {
        map.set(k, { ...s });
      } else {
        const existing = map.get(k);
        map.set(k, { ...existing, ...s });
      }
    });

    // Add dynamic employees from Manage Staff
    dynamicEmployees.forEach(de => {
      const k = normalizeAgentName(de.name);
      map.set(k, {
        id: de.id,
        agent_name: de.name,
        name: de.name,
        employee_id: de.employee_id,
        team: de.team || (de.name + ' Team'),
        department: de.department || 'Contact Center',
        role: de.role || 'Team Leader',
        role_type: de.role_type || 'agent',
        is_active: true,
        is_dynamic: true
      });
    });

    // 2. Attach any Firestore metadata
    (allMembers || []).concat(internalMembers || []).forEach(m => {
      const name = (m.agent_name || m.name || m.display_name || "").trim();
      if (name) {
        const key = normalizeAgentName(name);
        const existing = map.get(key);
        if (existing) {
          map.set(key, {
            ...existing,
            ...m,
            id: m.id || existing.id,
            team: m.team || existing.team,
            is_deleted: m.is_deleted === true || existing.is_deleted === true,
            is_active: m.is_active === false ? false : (existing.is_active ?? true),
            resigned_month: m.resigned_month || existing.resigned_month,
            resigned_year: m.resigned_year || existing.resigned_year,
          });
        }
      }
    });

    return Array.from(map.values())
      .filter(m => m.is_deleted !== true && m.is_active !== false)
      .sort((a, b) => (a.agent_name || "").localeCompare(b.agent_name || ""));
  }, [allMembers, internalMembers, dynamicEmployees]);

  // Team counts for the 4 tabs (Younis, Ankido, Mohammed, QA & Training)
  const teamCounts = useMemo(() => {
    const activeMembers = effectiveAllMembers.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear)));
    return {
      Younis: activeMembers.filter(m => (m.team || "").toLowerCase().includes("younis")).length,
      Ankido: activeMembers.filter(m => (m.team || "").toLowerCase().includes("ankido")).length,
      Mohammed: activeMembers.filter(m => (m.team || "").toLowerCase().includes("mohammed") || (m.team || "").toLowerCase().includes("dlshad")).length,
      QA_Training: activeMembers.filter(m => (m.team || "").toLowerCase().includes("quality") || (m.team || "").toLowerCase().includes("training") || (m.team || "").toLowerCase().includes("back office") || m.role_type === "trainer" || m.role_type === "qa" || m.role_type === "backoffice").length,
    };
  }, [effectiveAllMembers, selectedPeriod, selectedYear]);

  // Available departments with member counts
  const availableDepartments = useMemo(() => {
    const activeMembers = effectiveAllMembers.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear)));
    const deptMap = new Map<string, { id: string; name: string; nameAr?: string; count: number }>();

    // Seed official departments
    departments.forEach(d => {
      const name = d.name.trim();
      if (!deptMap.has(name)) {
        deptMap.set(name, { id: d.id, name, nameAr: d.nameAr, count: 0 });
      }
    });

    // Count members in departments
    activeMembers.forEach(m => {
      let dept = (m.department || "").trim();
      if (!dept) {
        if ((m.team || "").toLowerCase().includes("quality")) dept = "Call center - Quality";
        else if ((m.team || "").toLowerCase().includes("training")) dept = "Training";
        else if ((m.team || "").toLowerCase().includes("back office")) dept = "Back Office";
        else dept = "Contact Center";
      }
      if (deptMap.has(dept)) {
        deptMap.get(dept)!.count += 1;
      } else {
        deptMap.set(dept, { id: dept.toLowerCase().replace(/[^a-z0-9]/g, '_'), name: dept, count: 1 });
      }
    });

    return Array.from(deptMap.values()).sort((a, b) => b.count - a.count);
  }, [departments, effectiveAllMembers, selectedYear]);

  const handleSelectDepartment = (deptName: string) => {
    setSelectedDepartmentFilter(deptName);
    setDeptDropdownOpen(false);

    if (deptName !== "All") {
      const target = deptName.toLowerCase();
      const inDept = effectiveAllMembers.filter(m => {
        const mDept = (m.department || "").toLowerCase();
        const mTeam = (m.team || "").toLowerCase();
        return (mDept.includes(target) || target.includes(mDept) || mTeam.includes(target)) && isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear));
      });

      const isCurrentInDept = inDept.some(m => m.agent_name === selectedEmployeeName);
      if (!isCurrentInDept && inDept.length > 0) {
        setSelectedEmployeeName(inDept[0].agent_name);
      }
    }
  };

  // Filtered members list: Younis Kamal, Ankido Buya, Mohammed Dlshad, or QA & Training
  const filteredMembers = useMemo(() => {
    let list = effectiveAllMembers.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear)));
    
    // Special Staff & Team Leaders: strictly view only their own evaluation:
    // "التيم ليدر خلي بس يشوفون تقييمهم و ليس مال تيمهم"
    if (isUserSpecialStaffOnly) {
      if (isUserMohammedAzad) {
        return effectiveAllMembers.filter(m => normalizeAgentName(m.agent_name).includes("mohammed azad"));
      }
      if (isUserMohammedJihad) {
        return effectiveAllMembers.filter(m => normalizeAgentName(m.agent_name).includes("jihad"));
      }
      if (isUserLaraKamil) {
        return effectiveAllMembers.filter(m => normalizeAgentName(m.agent_name).includes("lara"));
      }
      if (isUserShireenWaisi) {
        return effectiveAllMembers.filter(m => normalizeAgentName(m.agent_name).includes("shireen"));
      }
      if (isUserAnkido || (isTL && userTeamLower.includes("ankido"))) {
        return effectiveAllMembers.filter(m => normalizeAgentName(m.agent_name).includes("ankido"));
      }
      if (isUserYounis || (isTL && userTeamLower.includes("younis"))) {
        return effectiveAllMembers.filter(m => normalizeAgentName(m.agent_name).includes("younis"));
      }
      const myName = normalizeAgentName(userProfile?.name || userProfile?.agent_name || "");
      if (myName) {
        return effectiveAllMembers.filter(m => {
          const aName = normalizeAgentName(m.agent_name || "");
          return aName === myName || aName.includes(myName) || myName.includes(aName);
        });
      }
    }

    if (isAgent) {
      const myName = normalizeAgentName(userProfile?.name || userProfile?.agent_name || "");
      const me = list.filter(m => {
        const aName = normalizeAgentName(m.agent_name || "");
        return aName === myName || aName.includes(myName) || myName.includes(aName);
      });
      if (me.length > 0) return me;
      return list.slice(0, 1);
    }

    // Team Leader: strictly restrict to their assigned team only (Team Leader + their team agents)
    // "وممال انككيدو خلي يشوف مالته و مال تيمه"
    // "و يونس هم"
    if (tlAssignedTeam) {
      if (tlAssignedTeam === "Ankido") {
        list = list.filter(m => (m.team || "").toLowerCase().includes("ankido"));
      } else if (tlAssignedTeam === "Mohammed") {
        list = list.filter(m => (m.team || "").toLowerCase().includes("mohammed") || (m.team || "").toLowerCase().includes("dlshad"));
      } else {
        list = list.filter(m => (m.team || "").toLowerCase().includes("younis"));
      }

      if (employeeSearchTerm.trim()) {
        const term = normalizeAgentName(employeeSearchTerm);
        list = list.filter(m => 
          normalizeAgentName(m.agent_name).includes(term) ||
          (m.team || "").toLowerCase().includes(term)
        );
      }
      return list.sort((a, b) => {
        if (a.role_type === "tl" && b.role_type !== "tl") return -1;
        if (b.role_type === "tl" && a.role_type !== "tl") return 1;
        return (a.agent_name || "").localeCompare(b.agent_name || "");
      });
    }

    // Search Term Filter: When searching, search across all active agents & staff
    if (employeeSearchTerm.trim()) {
      const term = normalizeAgentName(employeeSearchTerm);
      return list.filter(m => 
        normalizeAgentName(m.agent_name).includes(term) ||
        (m.team || "").toLowerCase().includes(term) ||
        (m.department || "").toLowerCase().includes(term)
      ).sort((a, b) => (a.agent_name || "").localeCompare(b.agent_name || ""));
    }

    // Department Filter: when selected, filter to that department across all teams
    if (selectedDepartmentFilter && selectedDepartmentFilter !== "All") {
      const target = selectedDepartmentFilter.toLowerCase();
      list = list.filter(m => {
        const mDept = (m.department || "").toLowerCase();
        const mTeam = (m.team || "").toLowerCase();
        return mDept.includes(target) || target.includes(mDept) || mTeam.includes(target);
      });
    } else {
      // Default: Team Tab Filter (Younis, Ankido, Mohammed, QA & Training)
      if (teamTabFilter === "Ankido") {
        list = list.filter(m => (m.team || "").toLowerCase().includes("ankido"));
      } else if (teamTabFilter === "Mohammed") {
        list = list.filter(m => (m.team || "").toLowerCase().includes("mohammed") || (m.team || "").toLowerCase().includes("dlshad"));
      } else if (teamTabFilter === "QA_Training") {
        list = list.filter(m => (m.team || "").toLowerCase().includes("quality") || (m.team || "").toLowerCase().includes("training") || (m.team || "").toLowerCase().includes("back office") || m.role_type === "trainer" || m.role_type === "qa" || m.role_type === "backoffice");
      } else {
        // Default to Younis
        list = list.filter(m => (m.team || "").toLowerCase().includes("younis"));
      }
    }
    
    return list.sort((a, b) => {
      if (a.role_type === "tl" && b.role_type !== "tl") return -1;
      if (b.role_type === "tl" && a.role_type !== "tl") return 1;
      return (a.agent_name || "").localeCompare(b.agent_name || "");
    });
  }, [effectiveAllMembers, employeeSearchTerm, teamTabFilter, selectedDepartmentFilter, isAgent, tlAssignedTeam, userProfile, selectedPeriod, selectedYear, isUserSpecialStaffOnly, isUserMohammedAzad, isUserMohammedJihad, isUserLaraKamil, isUserShireenWaisi]);

  // Current selected member object
  const currentMember = useMemo(() => {
    const targetNorm = normalizeAgentName(selectedEmployeeName);
    return effectiveAllMembers.find(m => normalizeAgentName(m.agent_name) === targetNorm) || null;
  }, [effectiveAllMembers, selectedEmployeeName]);

  // Detect if current employee is Chat
  const isSelectedEmployeeChat = useMemo(() => {
    const t = (currentMember?.team || "").toLowerCase();
    return t.includes("mohammed") || t.includes("dlshad");
  }, [currentMember]);

  // Chat Semi-Annual 2026 exception: Productivity is removed ONLY for year 2026 Semi-Annual Chat team
  const isChatSemi2026 = useMemo(() => {
    return false;
  }, [isSelectedEmployeeChat, selectedPeriod, selectedYear]);

  // Open Benchmark Guide modal with auto-selected tab based on employee
  const openBenchmarkGuide = () => {
    setBenchmarkGuideTab(isSelectedEmployeeChat ? "chat" : "calls");
    setShowBenchmarkGuideModal(true);
  };

  // Coverage Tracking Computation (Who's evaluated and who's pending)
  const coverageData = useMemo(() => {
    let activeMembers = effectiveAllMembers.filter(m => 
      isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))
    );

    if (tlAssignedTeam) {
      if (tlAssignedTeam === "Ankido") {
        activeMembers = activeMembers.filter(m => (m.team || "").toLowerCase().includes("ankido"));
      } else if (tlAssignedTeam === "Mohammed") {
        activeMembers = activeMembers.filter(m => (m.team || "").toLowerCase().includes("mohammed") || (m.team || "").toLowerCase().includes("dlshad"));
      } else {
        activeMembers = activeMembers.filter(m => (m.team || "").toLowerCase().includes("younis"));
      }
    }

    let semiCompletedCount = 0;
    let semiPendingCount = 0;
    let annualCompletedCount = 0;
    let annualPendingCount = 0;

    const list = activeMembers.map(member => {
      const rawName = (member.agent_name || member.name || "").trim();
      const clean = rawName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const norm = normalizeAgentName(rawName);
      const normClean = norm.replace(/[^a-z0-9]/g, '_');
      const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[member.id] || member.id || "";

      const findEval = (period: "Semi-Annual" | "Annual") => {
        const direct1 = allEvaluationsMap[`${selectedYear}_${period}_${clean}`];
        if (direct1) return direct1;
        const direct2 = allEvaluationsMap[`${selectedYear}_${period}_${normClean}`];
        if (direct2) return direct2;

        const periodPrefix = `${selectedYear}_${period}_`;
        for (const [k, d] of Object.entries(allEvaluationsMap)) {
          if (!k.startsWith(periodPrefix)) continue;
          const docEmpName = normalizeAgentName(d.employee_name || "");
          const docEmpId = String(d.employee_id || "");
          if (
            (docEmpName && (docEmpName === norm || docEmpName.includes(norm) || norm.includes(docEmpName))) ||
            (knownId && docEmpId && docEmpId === String(knownId))
          ) {
            return d;
          }
        }
        return null;
      };

      const semiDoc = findEval("Semi-Annual");
      const annualDoc = findEval("Annual");

      const semiCompleted = Boolean(
        semiDoc && (
          semiDoc.status === 'manager_finalized' || 
          (typeof semiDoc.manager_overall_score === 'number' && semiDoc.manager_overall_score > 0)
        )
      );
      const semiScore = semiDoc ? (semiDoc.manager_overall_score ?? semiDoc.self_overall_score ?? null) : null;

      const annualCompleted = Boolean(
        annualDoc && (
          annualDoc.status === 'manager_finalized' || 
          (typeof annualDoc.manager_overall_score === 'number' && annualDoc.manager_overall_score > 0)
        )
      );
      const annualScore = annualDoc ? (annualDoc.manager_overall_score ?? annualDoc.self_overall_score ?? null) : null;

      if (semiCompleted) semiCompletedCount++;
      else semiPendingCount++;

      if (annualCompleted) annualCompletedCount++;
      else annualPendingCount++;

      const team = member.team || "Contact Center";
      const isChat = team.toLowerCase().includes('mohammed') || team.toLowerCase().includes('dlshad');

      return {
        member,
        name: rawName,
        knownId,
        team,
        isChat,
        semi: {
          isEvaluated: Boolean(semiDoc),
          isCompleted: semiCompleted,
          status: semiDoc?.status || (semiCompleted ? 'manager_finalized' : 'pending'),
          score: semiScore,
          doc: semiDoc
        },
        annual: {
          isEvaluated: Boolean(annualDoc),
          isCompleted: annualCompleted,
          status: annualDoc?.status || (annualCompleted ? 'manager_finalized' : 'pending'),
          score: annualScore,
          doc: annualDoc
        }
      };
    });

    return {
      membersList: list,
      totalCount: activeMembers.length,
      semiCompletedCount,
      semiPendingCount,
      annualCompletedCount,
      annualPendingCount,
      semiPercent: activeMembers.length > 0 ? Math.round((semiCompletedCount / activeMembers.length) * 100) : 0,
      annualPercent: activeMembers.length > 0 ? Math.round((annualCompletedCount / activeMembers.length) * 100) : 0
    };
  }, [effectiveAllMembers, allEvaluationsMap, selectedYear, tlAssignedTeam]);

  // Dynamic department counts with pending and completed tallies for Coverage Tracker
  const coverageDeptCounts = useMemo(() => {
    const counts: Record<string, { total: number; pending: number; completed: number; nameAr?: string }> = {};
    coverageData.membersList.forEach(item => {
      const deptName = item.member?.department || "Contact Center";
      if (!counts[deptName]) {
        const foundDept = departments.find(d => d.name.toLowerCase() === deptName.toLowerCase());
        counts[deptName] = { 
          total: 0, 
          pending: 0, 
          completed: 0, 
          nameAr: foundDept?.nameAr 
        };
      }
      counts[deptName].total++;
      if (!item.annual.isCompleted) {
        counts[deptName].pending++;
      } else {
        counts[deptName].completed++;
      }
    });
    return counts;
  }, [coverageData.membersList, departments]);

  // Filtered members list for Coverage Modal
  const filteredCoverageList = useMemo(() => {
    return coverageData.membersList.filter(item => {
      // 1. Department filter
      if (coverageDeptFilter !== "all") {
        const itemDept = (item.member?.department || "Contact Center").toLowerCase();
        if (itemDept !== coverageDeptFilter.toLowerCase()) return false;
      }

      // 2. Team filter
      if (coverageTeamFilter !== "all") {
        const t = (item.team || "").toLowerCase();
        if (coverageTeamFilter === "Younis" && !t.includes("younis")) return false;
        if (coverageTeamFilter === "Ankido" && !t.includes("ankido")) return false;
        if (coverageTeamFilter === "Mohammed" && !t.includes("mohammed") && !t.includes("dlshad")) return false;
        if (coverageTeamFilter === "QA_Training" && !t.includes("quality") && !t.includes("training") && item.member?.role_type !== "trainer" && item.member?.role_type !== "qa") return false;
      }

      // 3. Search query filter
      if (coverageSearchTerm.trim()) {
        const q = coverageSearchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = String(item.knownId).toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      // 4. Status filter (Strictly Annual)
      if (coverageFilterStatus === "pending") {
        return !item.annual.isCompleted;
      }

      if (coverageFilterStatus === "completed") {
        return item.annual.isCompleted;
      }

      return true;
    });
  }, [coverageData, coverageFilterStatus, coverageTeamFilter, coverageDeptFilter, coverageSearchTerm]);

  // Copy pending list to clipboard
  const handleCopyPendingList = () => {
    const pendingItems = coverageData.membersList.filter(item => !item.annual.isCompleted);

    const lines = pendingItems.map((item, idx) => {
      return `${idx + 1}. ${toTitleCase(item.name)} (${item.knownId ? `ID: ${item.knownId}, ` : ''}${item.team.replace(' Team', '')}) -> Pending Annual Evaluation`;
    });

    const textToCopy = `📋 Pending Annual Evaluations List (${selectedYear}):\n` + lines.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCoverageCopiedToast(true);
    setTimeout(() => setCoverageCopiedToast(false), 2500);
  };

  const handleSelectForEvaluation = (memberName: string, period?: "Semi-Annual" | "Annual") => {
    setSelectedEmployeeName(memberName);
    if (period) {
      setSelectedPeriod("Annual");
    }
    setShowCoverageModal(false);
  };

  // Initialize selected employee on load
  useEffect(() => {
    // 1. Trainer, QA, Back Office, and Team Leaders: strictly lock to their own self profile
    // "التيم ليدر خلي بس يشوفون تقييمهم و ليس مال تيمهم"
    if (isUserSpecialStaffOnly) {
      if (isUserMohammedAzad) {
        setSelectedEmployeeName("Mohammed Azad");
        setTeamTabFilter("QA_Training");
        return;
      }
      if (isUserMohammedJihad) {
        setSelectedEmployeeName("Mohammed Jihad");
        setTeamTabFilter("QA_Training");
        return;
      }
      if (isUserLaraKamil) {
        setSelectedEmployeeName("Lara Kamil");
        setTeamTabFilter("QA_Training");
        return;
      }
      if (isUserShireenWaisi) {
        setSelectedEmployeeName("Shireen Waisi");
        setTeamTabFilter("Special_Staff");
        return;
      }
      if (isUserAnkido || (isTL && userTeamLower.includes("ankido"))) {
        setSelectedEmployeeName("Ankido Buya");
        setTeamTabFilter("Ankido");
        return;
      }
      if (isUserYounis || (isTL && userTeamLower.includes("younis"))) {
        setSelectedEmployeeName("Younis Kamal");
        setTeamTabFilter("Younis");
        return;
      }
      const myName = toTitleCase(userProfile?.name || userProfile?.agent_name || "");
      if (myName) {
        setSelectedEmployeeName(myName);
        return;
      }
    }

    // 2. Regular Agent: strictly lock to their own self profile
    if (isAgent) {
      const agentName = userProfile?.agent_name || userProfile?.name || "";
      if (agentName && selectedEmployeeName !== agentName) {
        setSelectedEmployeeName(agentName);
      }
      const myTeam = (userProfile?.team || "").toLowerCase();
      if (myTeam.includes("younis")) setTeamTabFilter("Younis");
      else if (myTeam.includes("ankido")) setTeamTabFilter("Ankido");
      else if (myTeam.includes("mohammed") || myTeam.includes("dlshad")) setTeamTabFilter("Mohammed");
      return;
    }

    // 4. Admin / Manager: default to Younis Kamal (first team leader)
    if (!selectedEmployeeName && effectiveAllMembers.length > 0) {
      const defaultMember = effectiveAllMembers.find(m => normalizeAgentName(m.agent_name) === "younis kamal") || effectiveAllMembers[0];
      setSelectedEmployeeName(defaultMember.agent_name);
      setTeamTabFilter("Younis");
    }
  }, [isAgent, isUserSpecialStaffOnly, isUserMohammedAzad, isUserMohammedJihad, isUserLaraKamil, isUserShireenWaisi, userProfile, effectiveAllMembers, selectedEmployeeName, tlAssignedTeam]);

  // Auto-fill Employee info when currentMember changes
  useEffect(() => {
    if (currentMember) {
      const norm = normalizeAgentName(currentMember.agent_name || "");
      const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[currentMember.id] || "";
      setEmployeeId(knownId || currentMember.employee_id || currentMember.employee_code || "");
      if (currentMember.manager_name) {
        setTeamLeader(currentMember.manager_name);
      } else {
        setTeamLeader(resolveTeamLeader(currentMember.team));
      }
    }
  }, [currentMember]);

  // Sync team tab filter when a newly selected employee changes (e.g. from search, direct select or modal)
  useEffect(() => {
    if (currentMember && !tlAssignedTeam) {
      const t = (currentMember.team || "").toLowerCase();
      if (currentMember.role_type === "trainer" || currentMember.role_type === "qa" || currentMember.role_type === "backoffice" || t.includes("training") || t.includes("quality") || t.includes("back office")) {
        setTeamTabFilter("QA_Training");
      } else if (t.includes("ankido")) {
        setTeamTabFilter("Ankido");
      } else if (t.includes("mohammed") || t.includes("dlshad")) {
        setTeamTabFilter("Mohammed");
      } else if (t.includes("younis")) {
        setTeamTabFilter("Younis");
      }
    }
  }, [selectedEmployeeName]);

  // Document ID in Firestore: `${year}_${period}_${cleanSlug}`
  const docId = useMemo(() => {
    if (!selectedEmployeeName) return "";
    const cleanName = selectedEmployeeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${selectedYear}_${selectedPeriod}_${cleanName}`;
  }, [selectedYear, selectedPeriod, selectedEmployeeName]);

  // Load existing evaluation data from Firestore
  useEffect(() => {
    if (!docId) return;

    let isMounted = true;
    const norm = normalizeAgentName(currentMember?.agent_name || selectedEmployeeName || "");
    const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[currentMember?.id] || "";

    const unsub = onSnapshot(doc(db, "annual_evaluations", docId), (docSnap) => {
      if (!isMounted) return;

      // Local storage fallback for instant response
      const localDoc = loadEvaluationRecord(selectedYear, selectedEmployeeName);
      if (localDoc && !docSnap.exists()) {
        setEvaluationDate(localDoc.submittedAt || "");
        setEmployeeId(localDoc.employeeId || knownId || "");
        setSelfKpis(localDoc.selfScores || {});
        setManagerKpis(localDoc.managerScores || {});
        setSelfCompetencies(localDoc.selfScores || {});
        setManagerCompetencies(localDoc.managerScores || {});
        setKeyStrengths(localDoc.keyStrengths || "");
        setAreasForDevelopment(localDoc.areasForDevelopment || "");
        setManagerComments(localDoc.managerComments || "");
        setEmployeeComments(localDoc.employeeComments || "");
        setCriterionNotes(localDoc.criterionNotes || {});
        setEvaluationStatus(localDoc.status || "draft");
        setLastSavedAt(localDoc.updatedAt || "");
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        setEvaluationDate(data.evaluation_date || "");
        setEmployeeId(data.employee_id || knownId || "");
        setTeamLeader(data.team_leader || resolveTeamLeader(currentMember?.team));
        setSelfKpis(data.self_kpis || {});
        setManagerKpis(data.manager_kpis || {});
        setSelfCompetencies(data.self_competencies || {});
        setManagerCompetencies(data.manager_competencies || {});
        setKeyStrengths(data.manager_strengths || "");
        setAreasForDevelopment(data.manager_improvements || "");
        setManagerComments(data.manager_comments || "");
        setEmployeeComments(data.self_comments || "");
        setCriterionNotes(data.criterion_notes || localDoc?.criterionNotes || {});
        setEvaluationStatus(data.status || "draft");
        setLastSavedAt(data.updated_at || "");
      } else {
        const baselineData = BASELINE_ANNUAL_EVALUATIONS[docId] || 
          Object.values(BASELINE_ANNUAL_EVALUATIONS).find(b => 
            String(b.year) === String(selectedYear) && 
            b.period === selectedPeriod && 
            (
              normalizeAgentName(b.employee_name || "") === norm ||
              (b.employee_id && (b.employee_id === knownId || b.employee_id === currentMember?.id))
            )
          );

        if (baselineData) {
          setEvaluationDate(baselineData.evaluation_date || "");
          setEmployeeId(baselineData.employee_id || knownId || "");
          setTeamLeader(baselineData.team_leader || resolveTeamLeader(currentMember?.team));
          setSelfKpis(baselineData.self_kpis || {});
          setManagerKpis(baselineData.manager_kpis || {});
          setSelfCompetencies(baselineData.self_competencies || {});
          setManagerCompetencies(baselineData.manager_competencies || {});
          setKeyStrengths(baselineData.manager_strengths || "");
          setAreasForDevelopment(baselineData.manager_improvements || "");
          setManagerComments(baselineData.manager_comments || "");
          setEmployeeComments(baselineData.self_comments || "");
          setCriterionNotes(baselineData.criterion_notes || localDoc?.criterionNotes || {});
          setEvaluationStatus(baselineData.status || "manager_finalized");
          setLastSavedAt(baselineData.updated_at || "");

          try {
            setDoc(doc(db, "annual_evaluations", docId), baselineData, { merge: true }).catch(() => null);
          } catch (e) {}
        } else {
          setEvaluationDate("");
          setSelfKpis({});
          setManagerKpis({});
          setSelfCompetencies({});
          setManagerCompetencies({});
          setKeyStrengths("");
          setAreasForDevelopment("");
          setManagerComments("");
          setEmployeeComments("");
          setCriterionNotes(localDoc?.criterionNotes || {});
          setEvaluationStatus("draft");
          setLastSavedAt("");
        }
      }
    }, (error) => {
      console.error("Error fetching evaluation:", error);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [docId]);

  // Fetch actual performance metrics from team metrics table (ankido_metrics, mohammed_metrics, younis_metrics)
  // Semi-Annual is H1 (Jan-Jun) and Annual is full year as requested
  useEffect(() => {
    if (!selectedEmployeeName) {
      setActualMetricsSummary(null);
      return;
    }

    let isMounted = true;
    const fetchActuals = async () => {
      try {
        const targetTeam = currentMember?.team || "";
        const collectionName = targetTeam.includes('Ankido') ? 'ankido_metrics' :
                               (targetTeam.includes('Mohammed') || targetTeam.includes('Dlshad')) ? 'mohammed_metrics' :
                               'younis_metrics';

        let snap: any = null;
        try {
          const q = query(
            collection(db, collectionName),
            where("year", "==", selectedYear)
          );
          snap = await getDocs(q);
        } catch (e) {
          console.warn("Metrics string year query error:", e);
        }

        // Fallback: If no documents found, try querying numeric year
        if (!snap || snap.empty) {
          try {
            const numYear = parseInt(selectedYear, 10);
            if (!isNaN(numYear)) {
              const qNum = query(
                collection(db, collectionName),
                where("year", "==", numYear)
              );
              snap = await getDocs(qNum);
            }
          } catch (e2) {}
        }
        
        const periodMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; // Annual is Full Year

        const targetLower = selectedEmployeeName.toLowerCase().trim();
        const targetClean = targetLower.replace(/[^a-z0-9]/g, '');

        const rows = (snap?.docs || [])
          .map((d: any) => d.data())
          .filter((r: any) => {
            const rName = (r.agent_name || r.agent || r.name || "").toLowerCase().trim();
            const rClean = rName.replace(/[^a-z0-9]/g, '');
            const isMatch = rName === targetLower || rClean === targetClean || 
                           (rClean.length >= 4 && targetClean.length >= 4 && (rClean.includes(targetClean) || targetClean.includes(rClean)));
            return isMatch && periodMonths.includes(r.month);
          });

        if (rows.length === 0) {
          if (isMounted) setActualMetricsSummary(null);
          return;
        }

        let totalQA = 0, countQA = 0;
        let totalExam = 0, countExam = 0;
        let totalProd = 0, countProd = 0;
        let totalAhtSec = 0, countAht = 0;
        let totalArtSec = 0, countArt = 0;

        const parseSec = (val: any) => {
          if (!val) return 0;
          const s = String(val).trim();
          if (s.includes(':')) {
            const parts = s.split(':');
            if (parts.length === 3) return (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
            return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
          }
          return parseFloat(s) || 0;
        };

        rows.forEach((r: any) => {
          if (r.quality != null && r.quality !== "") { totalQA += parseFloat(r.quality) || 0; countQA++; }
          if (r.exam != null && r.exam !== "") { totalExam += parseFloat(r.exam) || 0; countExam++; }
          if (r.productivity != null && r.productivity !== "") { totalProd += parseFloat(r.productivity) || 0; countProd++; }
          if (r.aht != null && r.aht !== "") { totalAhtSec += parseSec(r.aht); countAht++; }
          if (r.art != null && r.art !== "") { totalArtSec += parseSec(r.art); countArt++; }
        });

        const avgQA = countQA > 0 ? (totalQA / countQA) : null;
        const avgExam = countExam > 0 ? (totalExam / countExam) : null;
        const avgProd = countProd > 0 ? (totalProd / countProd) : null;
        const avgAhtSec = countAht > 0 ? (totalAhtSec / countAht) : null;
        const avgArtSec = countArt > 0 ? (totalArtSec / countArt) : null;

        const formatTime = (secs: number | null) => {
          if (secs === null) return "-";
          const m = Math.floor(secs / 60);
          const s = Math.round(secs % 60);
          return `${m}:${s.toString().padStart(2, '0')}`;
        };

        const isChat = (currentMember?.team || "").toLowerCase().includes("mohammed") || 
                       (currentMember?.team || "").toLowerCase().includes("dlshad");

        const suggestions: Record<string, number> = {};

        if (isChat) {
          // Chat Rating Benchmarks (Exact Image Table Replica)
          // Exam: 99-100 (5), 96-98 (4), 90-95 (3), 85-89 (2), <85 (1)
          if (avgExam !== null) {
            if (avgExam >= 99) suggestions.exam = 5;
            else if (avgExam >= 96) suggestions.exam = 4;
            else if (avgExam >= 90) suggestions.exam = 3;
            else if (avgExam >= 85) suggestions.exam = 2;
            else suggestions.exam = 1;
            suggestions.knowledge = suggestions.exam;
          }
          // QA: 99-100 (5), 96-98 (4), 95 (3), 90-94 (2), <89 (1)
          if (avgQA !== null) {
            if (avgQA >= 99) suggestions.qa = 5;
            else if (avgQA >= 96) suggestions.qa = 4;
            else if (avgQA >= 95) suggestions.qa = 3;
            else if (avgQA >= 90) suggestions.qa = 2;
            else suggestions.qa = 1;
          }
          // AHT: 3:00-3:30 (5), 3:31-4:00 (4), 4:01-4:59 (3), 5:00-5:59 (2), >6:00 (1)
          if (avgAhtSec !== null) {
            if (avgAhtSec <= 210) suggestions.aht = 5;
            else if (avgAhtSec <= 240) suggestions.aht = 4;
            else if (avgAhtSec <= 299) suggestions.aht = 3;
            else if (avgAhtSec <= 359) suggestions.aht = 2;
            else suggestions.aht = 1;
          }
          // ART: Less than 1:30 (<=90s -> 5), 1:31-1:59 (91-119s -> 4), 2:00-2:59 (120-179s -> 3), 3:00-3:30 (180-210s -> 2), >3:31 (>210s -> 1)
          if (avgArtSec !== null) {
            if (avgArtSec <= 90) suggestions.art = 5;
            else if (avgArtSec <= 119) suggestions.art = 4;
            else if (avgArtSec <= 179) suggestions.art = 3;
            else if (avgArtSec <= 210) suggestions.art = 2;
            else suggestions.art = 1;
          }
          // Productivity: >13 (5), 11-12.99 (4), 8.5-10.99 (3), 7.50-8.49 (2), <7.50 (1)
          if (!isChatSemi2026 && avgProd !== null) {
            if (avgProd > 13) suggestions.productivity = 5;
            else if (avgProd >= 11) suggestions.productivity = 4;
            else if (avgProd >= 8.5) suggestions.productivity = 3;
            else if (avgProd >= 7.5) suggestions.productivity = 2;
            else suggestions.productivity = 1;
          }
        } else {
          // Calls Rating Benchmarks (Exact Image Table Replica)
          // QA: 99-100 (5), 96-98 (4), 95 (3), 90-94 (2), <89 (1)
          if (avgQA !== null) {
            if (avgQA >= 99) suggestions.qa = 5;
            else if (avgQA >= 96) suggestions.qa = 4;
            else if (avgQA >= 95) suggestions.qa = 3;
            else if (avgQA >= 90) suggestions.qa = 2;
            else suggestions.qa = 1;
          }
          // AHT: Less than 2:44 (<=164s -> 5), 2:45-2:59 (165-179s -> 4), 3:00-3:10 (180-190s -> 3), 3:11-3:30 (191-210s -> 2), >3:31 (>210s -> 1)
          if (avgAhtSec !== null) {
            if (avgAhtSec <= 164) suggestions.aht = 5;
            else if (avgAhtSec <= 179) suggestions.aht = 4;
            else if (avgAhtSec <= 190) suggestions.aht = 3;
            else if (avgAhtSec <= 210) suggestions.aht = 2;
            else suggestions.aht = 1;
          }
          // Exam / Knowledge: 99-100 (5), 96-98 (4), 90-95 (3), 85-89 (2), <85 (1)
          if (avgExam !== null) {
            if (avgExam >= 99) suggestions.knowledge = 5;
            else if (avgExam >= 96) suggestions.knowledge = 4;
            else if (avgExam >= 90) suggestions.knowledge = 3;
            else if (avgExam >= 85) suggestions.knowledge = 2;
            else suggestions.knowledge = 1;
            suggestions.exam = suggestions.knowledge;
          }
          // Productivity: Greater than 93 (>93 -> 5), 91-92 (4), 90 (3), 86-89 (2), <85 (1)
          if (avgProd !== null) {
            if (avgProd > 93) suggestions.productivity = 5;
            else if (avgProd >= 91) suggestions.productivity = 4;
            else if (avgProd >= 90) suggestions.productivity = 3;
            else if (avgProd >= 86) suggestions.productivity = 2;
            else suggestions.productivity = 1;
          }
        }

        if (isMounted) {
          setActualMetricsSummary({
            monthsCount: rows.length,
            qa: avgQA !== null ? `${avgQA.toFixed(1)}%` : null,
            exam: avgExam !== null ? `${avgExam.toFixed(1)}%` : null,
            productivity: (!isChatSemi2026 && avgProd !== null) ? (isChat ? avgProd.toFixed(2) : `${avgProd.toFixed(1)}%`) : null,
            aht: formatTime(avgAhtSec),
            art: formatTime(avgArtSec),
            suggestions
          });
        }
      } catch (err) {
        console.error("Error fetching actual metrics:", err);
      }
    };

    fetchActuals();
    return () => { isMounted = false; };
  }, [selectedEmployeeName, selectedYear, selectedPeriod, currentMember?.team, isChatSemi2026]);



  // Operational KPIs dynamic definitions matching Role and Templates
  const kpiDefinitions: KpiItemDefinition[] = useMemo(() => {
    if (currentMemberRoleType === "trainer") {
      return TRAINER_KPIS;
    }
    if (currentMemberRoleType === "qa") {
      return QA_KPIS;
    }
    if (currentMemberRoleType === "tl") {
      return TL_KPIS;
    }
    if (currentMemberRoleType === "backoffice") {
      return BACKOFFICE_KPIS;
    }
    if (isSelectedEmployeeChat) {
      return [
        { id: "qa", name: "Quality Assurance", actual: actualMetricsSummary?.qa },
        { id: "art", name: "ART", actual: actualMetricsSummary?.art },
        { id: "attendance", name: "Attendance", actual: null },
        { id: "aht", name: "AHT", actual: actualMetricsSummary?.aht },
        { id: "knowledge", name: "Knowledge", actual: actualMetricsSummary?.exam },
      ];
    }
    return [
      { id: "qa", name: "Quality Assurance", actual: actualMetricsSummary?.qa },
      { id: "productivity", name: "Productivity", actual: actualMetricsSummary?.productivity },
      { id: "attendance", name: "Attendance", actual: null },
      { id: "aht", name: "AHT", actual: actualMetricsSummary?.aht },
      { id: "knowledge", name: "Knowledge", actual: actualMetricsSummary?.exam },
    ];
  }, [currentMemberRoleType, isSelectedEmployeeChat, actualMetricsSummary]);

  // Dynamic Competencies List matching specific role templates
  const currentCompetenciesList = useMemo(() => {
    const norm = normalizeAgentName(selectedEmployeeName || currentMember?.agent_name || "");
    const isJihad = norm.includes("jihad");

    if (isJihad) {
      return [
        COMPETENCY_DEFINITIONS.communication,
        COMPETENCY_DEFINITIONS.problem_solving,
        COMPETENCY_DEFINITIONS.accountability,
        COMPETENCY_DEFINITIONS.customer_focus,
        COMPETENCY_DEFINITIONS.responsibility,
        COMPETENCY_DEFINITIONS.team_work,
        COMPETENCY_DEFINITIONS.digitalization,
      ];
    }

    if (currentMemberRoleType === "qa" || currentMemberRoleType === "tl") {
      return [
        COMPETENCY_DEFINITIONS.communication,
        COMPETENCY_DEFINITIONS.problem_solving,
        COMPETENCY_DEFINITIONS.accountability,
        COMPETENCY_DEFINITIONS.responsibility,
        COMPETENCY_DEFINITIONS.initiative,
        COMPETENCY_DEFINITIONS.team_work,
        COMPETENCY_DEFINITIONS.digitalization,
      ];
    }

    // Trainer & Regular Agents (6 standard competencies)
    return [
      COMPETENCY_DEFINITIONS.communication,
      COMPETENCY_DEFINITIONS.problem_solving,
      COMPETENCY_DEFINITIONS.accountability,
      COMPETENCY_DEFINITIONS.initiative,
      COMPETENCY_DEFINITIONS.responsibility,
      COMPETENCY_DEFINITIONS.team_work,
    ];
  }, [selectedEmployeeName, currentMember, currentMemberRoleType]);

  // Dynamic user criteria mapped to KPI section
  const activeKpiDefinitions: KpiItemDefinition[] = useMemo(() => {
    const customKpis = criteria.filter(c => c.sectionId === 'kpi');
    if (customKpis.length > 0) {
      return customKpis.map(c => ({
        id: c.id,
        name: (c.name || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim(),
        nameAr: c.nameAr || (c.name || "").match(/\(([\u0600-\u06FF\s،؛ـ-]+)\)/)?.[1]?.trim() || "",
        description: (c.description || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim(),
        descriptionAr: c.descriptionAr || "",
        noteGuideline: c.noteGuideline,
        actual: null
      }));
    }
    return kpiDefinitions;
  }, [criteria, kpiDefinitions]);

  // Dynamic user criteria mapped to Competencies section
  const activeCompetenciesList = useMemo(() => {
    const customComps = criteria.filter(c => c.sectionId === 'competencies');
    if (customComps.length > 0) {
      return customComps.map(c => ({
        id: c.id,
        name: (c.name || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim(),
        nameAr: c.nameAr || (c.name || "").match(/\(([\u0600-\u06FF\s،؛ـ-]+)\)/)?.[1]?.trim() || "",
        description: (c.description || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim(),
        descriptionAr: c.descriptionAr || "",
        noteGuideline: c.noteGuideline
      }));
    }
    return currentCompetenciesList;
  }, [criteria, currentCompetenciesList]);

  // Custom sections beyond KPI and Competencies
  const customSectionsList = useMemo(() => {
    return sections.filter(s => s.id !== 'kpi' && s.id !== 'competencies');
  }, [sections]);

  // Helper to reliably read KPI score whether keyed by 'exam' or 'knowledge'
  const getKpiScore = (kpisMap: Record<string, number>, id: string) => {
    if (!kpisMap) return 0;
    if (kpisMap[id] !== undefined && kpisMap[id] !== null && kpisMap[id] > 0) return kpisMap[id];
    if (id === 'exam' && kpisMap['knowledge']) return kpisMap['knowledge'];
    if (id === 'knowledge' && kpisMap['exam']) return kpisMap['exam'];
    return 0;
  };

  // KPI Averages
  const selfKpiAvg = useMemo(() => {
    const vals = activeKpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [kpiDefinitions, selfKpis]);

  const managerKpiAvg = useMemo(() => {
    const vals = activeKpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [kpiDefinitions, managerKpis]);

  // Competencies Averages
  const selfCompAvg = useMemo(() => {
    const vals = activeCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [currentCompetenciesList, selfCompetencies]);

  const managerCompAvg = useMemo(() => {
    const vals = activeCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [currentCompetenciesList, managerCompetencies]);

  // Overall Scores: Calculate using unrounded averages for exact Excel precision (50% KPI + 50% Competencies)
  const selfOverall = useMemo(() => {
    const kpiVals = activeKpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);
    const compVals = activeCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
    if (kpiVals.length > 0 && compVals.length > 0) {
      const rawKpi = kpiVals.reduce((a, b) => a + b, 0) / kpiVals.length;
      const rawComp = compVals.reduce((a, b) => a + b, 0) / compVals.length;
      return parseFloat(((rawKpi + rawComp) / 2).toFixed(2));
    }
    if (kpiVals.length > 0) return selfKpiAvg;
    if (compVals.length > 0) return selfCompAvg;
    return 0;
  }, [kpiDefinitions, selfKpis, currentCompetenciesList, selfCompetencies, selfKpiAvg, selfCompAvg]);

  const managerOverall = useMemo(() => {
    const kpiVals = activeKpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);
    const compVals = activeCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
    if (kpiVals.length > 0 && compVals.length > 0) {
      const rawKpi = kpiVals.reduce((a, b) => a + b, 0) / kpiVals.length;
      const rawComp = compVals.reduce((a, b) => a + b, 0) / compVals.length;
      return parseFloat(((rawKpi + rawComp) / 2).toFixed(2));
    }
    if (kpiVals.length > 0) return managerKpiAvg;
    if (compVals.length > 0) return managerCompAvg;
    return 0;
  }, [kpiDefinitions, managerKpis, currentCompetenciesList, managerCompetencies, managerKpiAvg, managerCompAvg]);

  // Official Score (only visible when manager data is visible or manager finalized)
  const officialOverallScore = managerOverall > 0 ? managerOverall : (isManagerDataVisible ? selfOverall : 0);
  const ratingTier = getRatingInfo(officialOverallScore > 0 ? officialOverallScore : 3.0);

  // Apply suggestions (Manager only)
  const handleApplySuggestions = () => {
    if (!canApplySuggestions || !actualMetricsSummary?.suggestions) return;
    const sugg = actualMetricsSummary.suggestions;
    setManagerKpis(prev => ({ ...prev, ...sugg }));
    showToastNotification("Applied benchmark suggestions to Manager Evaluation", "success");
  };

  const showToastNotification = (message: string, type: "success" | "error") => {
    setSaveToast({ message, type });
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Auto-stamp submission date on submit
  const getSubmissionFormattedDate = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Save to Firestore
  const handleSaveEvaluation = async (newStatus?: "draft" | "self_submitted" | "manager_finalized") => {
    if (!docId || !selectedEmployeeName) {
      showToastNotification("Please select an employee first", "error");
      return;
    }

    if (isReadOnly) {
      showToastNotification("Read-only mode: Team Leaders and Quality Team cannot edit or submit evaluations", "error");
      return;
    }

    setIsSaving(true);
    const targetStatus = newStatus || evaluationStatus;
    const autoDate = evaluationDate || getSubmissionFormattedDate();

    try {
      const cleanSelfKpis = { ...selfKpis };
      const cleanManagerKpis = { ...managerKpis };
      if (isChatSemi2026) {
        delete cleanSelfKpis.productivity;
        delete cleanManagerKpis.productivity;
      }

      const payload: any = {
        year: selectedYear,
        period: selectedPeriod,
        period_type: selectedPeriod,
        evaluation_date: autoDate,
        employee_name: selectedEmployeeName,
        employee_id: employeeId || "",
        department: currentMember?.department || (currentMemberRoleType === "trainer" ? "Training" : currentMemberRoleType === "qa" ? "Quality" : currentMemberRoleType === "backoffice" ? "Back Office" : "Contact Center"),
        team: currentMember?.team || "Contact Center",
        team_leader: teamLeader || resolveTeamLeader(currentMember?.team),
        channel_type: currentMemberRoleType !== "agent" ? currentMemberRoleType : (isSelectedEmployeeChat ? "chat" : "calls"),
        role_type: currentMemberRoleType,
        is_special_staff: currentMemberRoleType !== "agent",
        
        self_kpis: cleanSelfKpis,
        self_competencies: selfCompetencies,
        self_kpi_avg: selfKpiAvg,
        self_competency_avg: selfCompAvg,
        self_overall_score: selfOverall,
        self_comments: employeeComments,

        manager_kpis: cleanManagerKpis,
        manager_competencies: managerCompetencies,
        manager_kpi_avg: managerKpiAvg,
        manager_competency_avg: managerCompAvg,
        manager_overall_score: managerOverall,
        manager_strengths: keyStrengths,
        manager_improvements: areasForDevelopment,
        manager_comments: managerComments,
        criterion_notes: criterionNotes,

        status: targetStatus,
        updated_at: new Date().toISOString(),
        last_modified_by: userProfile?.name || userProfile?.agent_name || "Authorized User"
      };

      if (targetStatus === 'self_submitted') {
        payload.self_submitted_at = new Date().toISOString();
        payload.evaluation_date = autoDate;
        setEvaluationDate(autoDate);
      }
      if (targetStatus === 'manager_finalized') {
        payload.manager_submitted_at = new Date().toISOString();
        payload.evaluation_date = autoDate;
        setEvaluationDate(autoDate);
      }

      await setDoc(doc(db, "annual_evaluations", docId), payload, { merge: true });

      // LocalStorage backup
      try {
        saveEvaluationRecord({
          id: docId,
          employeeId: employeeId || currentMember?.employee_id || "",
          employeeName: selectedEmployeeName,
          year: selectedYear,
          period: "Annual",
          status: targetStatus,
          selfScores: { ...cleanSelfKpis, ...selfCompetencies },
          managerScores: { ...cleanManagerKpis, ...managerCompetencies },
          keyStrengths,
          areasForDevelopment,
          managerComments,
          employeeComments,
          criterionNotes,
          submittedAt: autoDate,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("localStorage evaluation save warning:", e);
      }
      setEvaluationStatus(targetStatus);
      setLastSavedAt(new Date().toLocaleTimeString());
      
      const successMsg = targetStatus === 'manager_finalized'
        ? "Evaluation approved & finalized successfully!"
        : targetStatus === 'self_submitted'
        ? "Self-Evaluation submitted to manager successfully!"
        : "Evaluation draft saved successfully!";

      showToastNotification(successMsg, "success");
    } catch (err: any) {
      console.error("Save error:", err);
      showToastNotification("Error saving evaluation: " + (err.message || ""), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateCriterionNote = (criterionId: string, role: "manager" | "employee", topic: CriterionNoteTopic, text: string) => {
    const safeId = criterionId || "crit_default";
    setCriterionNotes(prev => {
      const existing = prev[safeId] || {};
      const updated = {
        ...existing,
        [role]: {
          role,
          authorName: userProfile?.name || userProfile?.agent_name || (role === "manager" ? "Manager" : "Employee"),
          topic,
          text: text,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
      return {
        ...prev,
        [safeId]: updated
      };
    });
  };

  const getCriterionNotesCount = (critId: string) => {
    const safeId = critId || "";
    const entry = criterionNotes[safeId];
    if (!entry) return 0;
    return (entry.manager?.text ? 1 : 0) + (entry.employee?.text ? 1 : 0);
  };

  const renderCriterionNoteDrawer = (critId: string, critTitle: string) => {
    const safeCritId = critId || (critTitle ? critTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'crit_default');
    const entry = criterionNotes[safeCritId] || {};
    const activeEntry = noteActiveTab === "manager" ? entry.manager : entry.employee;
    const canEditThisTab = noteActiveTab === "manager" ? canEditManager : canEditSelf;

    return (
      <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 shadow-sm animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#1C6B53] dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white">
                {isAr ? "ملاحظات وتبرير معيار:" : "Evaluation Notes for:"} <span className="text-[#1C6B53] dark:text-emerald-400 font-extrabold">{critTitle}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tabs: Manager Note vs Employee Note */}
            <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNoteActiveTab("manager")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                  noteActiveTab === "manager"
                    ? "bg-[#1C6B53] text-white shadow-2xs font-black"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <span>{t.noteAuthorManager}</span>
                {entry.manager?.text && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
              </button>
              <button
                type="button"
                onClick={() => setNoteActiveTab("employee")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                  noteActiveTab === "employee"
                    ? "bg-blue-600 text-white shadow-2xs font-black"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <span>{t.noteAuthorEmployee}</span>
                {entry.employee?.text && <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOpenNoteCriterionId(null)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Note Topic / Reason Selector ("على شنو النوت") */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.noteTopicLabel}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "justification" as CriterionNoteTopic, label: t.topicJustification, icon: "⚖️" },
              { id: "achievement" as CriterionNoteTopic, label: t.topicAchievement, icon: "🏆" },
              { id: "improvement" as CriterionNoteTopic, label: t.topicImprovement, icon: "🎯" },
              { id: "incident" as CriterionNoteTopic, label: t.topicIncident, icon: "⚠️" },
              { id: "general" as CriterionNoteTopic, label: t.topicGeneral, icon: "💬" }
            ].map((top) => {
              const currentTopic = activeEntry?.topic || "justification";
              const isSelected = currentTopic === top.id;
              return (
                <button
                  key={top.id}
                  type="button"
                  disabled={!canEditThisTab}
                  onClick={() => {
                    if (canEditThisTab) {
                      handleUpdateCriterionNote(safeCritId, noteActiveTab, top.id, activeEntry?.text || "");
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? (noteActiveTab === "manager" ? "bg-[#1C6B53] text-white shadow-2xs" : "bg-blue-600 text-white shadow-2xs")
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 border border-gray-200 dark:border-gray-700"
                  } ${!canEditThisTab ? "opacity-75 cursor-default" : "cursor-pointer"}`}
                >
                  <span>{top.icon}</span>
                  <span>{top.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={3}
            value={activeEntry?.text || ""}
            disabled={!canEditThisTab}
            onChange={(e) => {
              handleUpdateCriterionNote(
                safeCritId, 
                noteActiveTab, 
                activeEntry?.topic || "justification", 
                e.target.value
              );
            }}
            placeholder={canEditThisTab ? t.noteTextPlaceholder : (isAr ? "لا توجد ملاحظة مدونة بعد." : "No note has been recorded yet.")}
            className="w-full text-xs p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1C6B53]/20 focus:border-[#1C6B53] outline-none transition disabled:opacity-75 resize-none font-medium leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
          <span>
            {activeEntry?.updatedAt 
              ? `${isAr ? "آخر تعديل:" : "Last updated:"} ${activeEntry.updatedAt} ${activeEntry.authorName ? `(${activeEntry.authorName})` : ''}`
              : (canEditThisTab ? (isAr ? "اكتب الملاحظة وستحفظ تلقائياً مع التقييم" : "Type your note and it saves automatically with the evaluation") : (isAr ? "للقراءة فقط" : "Read-only view"))}
          </span>
          <button
            type="button"
            onClick={() => setOpenNoteCriterionId(null)}
            className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition cursor-pointer"
          >
            {t.closeNote}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-3.5 sm:p-6 md:p-8 font-sans bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors pb-16 print:bg-white print:text-black print:p-0" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Toast Notification */}
      {saveToast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          saveToast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20' 
            : 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
        }`}>
          {saveToast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{saveToast.message}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        {/* Top Header - Unified Level & Spacing Matching All Dashboards */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 sm:mb-8 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/60 dark:border-gray-800 relative z-30 print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img src="/logo.webp" alt="FIB Logo" className="h-9 sm:h-11 w-auto object-contain shrink-0" />
            <div className="h-8 sm:h-9 w-[1.5px] bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="shrink-0">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                {t.appTitle}
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center shrink-0 self-stretch sm:self-auto justify-end">
            <UnifiedTopNavbar
              currentDashboard="evaluation"
              userProfile={userProfile}
              onNavigate={onNavigate}
              onLogout={onLogout || onBack}
              onOpenProfile={onOpenProfile}
              onOpenSettings={onOpenSettings}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              showOnlyEvaluation={true}
              lang={lang}
              evaluationLabel={t.evaluationTab}
              extraActions={
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        setLang("en");
                        if (typeof window !== "undefined") localStorage.setItem("fib_eval_language", "en");
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                        lang === "en"
                          ? "bg-white dark:bg-gray-700 text-[#1C6B53] dark:text-emerald-300 shadow-xs ring-1 ring-black/5"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-300"
                      }`}
                      title="Switch to English"
                    >
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLang("ar");
                        if (typeof window !== "undefined") localStorage.setItem("fib_eval_language", "ar");
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                        lang === "ar"
                          ? "bg-[#1C6B53] text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-300"
                      }`}
                      title="التبديل إلى العربية"
                    >
                      <span>العربية</span>
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Main Container */}
        <main className="w-full">
          
          {/* Top Control Toolbar: Single Streamlined Executive Row ("روو واحد") */}
          <section className="relative z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xs mb-5 print:hidden">
            <div className="flex items-center justify-between gap-2.5 sm:gap-3 w-full overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
              
              {/* Left Group */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Year Dropdown using ModernDropdown */}
                <div className="shrink-0">
                  <ModernDropdown
                    value={selectedYear}
                    onChange={(val) => setSelectedYear(val)}
                    options={AVAILABLE_YEARS}
                    variant="white"
                    size="md"
                    ariaLabel="Select Year"
                  />
                </div>

                {/* Annual Evaluation Badge */}
                <div className="flex items-center gap-2 px-3.5 h-10 bg-gradient-to-r from-[#10664F] to-[#0A4736] border border-emerald-400/30 rounded-xl sm:rounded-2xl text-[13px] font-black text-white shrink-0 shadow-sm shadow-[#10664F]/25 select-none">
                  <Award size={15} className="text-emerald-300" />
                  <span>{isAr ? "التقييم السنوي" : "Annual Evaluation"}</span>
                </div>

                {/* Criteria Management Button */}
                <button
                  type="button"
                  onClick={() => setShowManageCriteriaModal(true)}
                  className="flex items-center gap-2 h-10 px-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50/90 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200/90 dark:border-gray-700/80 text-[13px] font-bold text-gray-800 dark:text-gray-200 transition-all hover:border-[#10664F]/40 active:scale-95 cursor-pointer shrink-0 shadow-xs"
                  title={isAr ? "إدارة ومعايير التقييم" : "Manage Evaluation Criteria"}
                >
                  <Sliders size={14} className="text-[#10664F] dark:text-emerald-400" />
                  <span>{isAr ? "المعايير" : "Criteria"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/60 text-[#10664F] dark:text-emerald-300 text-[11px] font-black">
                    {criteria.length}
                  </span>
                </button>

                {/* Employees & Departments Management Button */}
                <button
                  type="button"
                  onClick={() => setShowManageStaffModal(true)}
                  className="flex items-center gap-2 h-10 px-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50/90 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200/90 dark:border-gray-700/80 text-[13px] font-bold text-gray-800 dark:text-gray-200 transition-all hover:border-blue-400/40 active:scale-95 cursor-pointer shrink-0 shadow-xs"
                  title={isAr ? "إدارة الموظفين والأقسام" : "Manage Staff & Departments"}
                >
                  <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>{isAr ? "الموظفين والأقسام" : "Staff & Rosters"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-black">
                    {effectiveAllMembers.length}
                  </span>
                </button>

                {/* Quick Button: Who's Pending - Manager & Admin Only */}
                {(isManager || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverageFilterStatus("pending");
                      setShowCoverageModal(true);
                    }}
                    className="flex items-center gap-2 h-10 px-3.5 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300/80 dark:border-amber-700/80 text-[13px] font-bold text-amber-900 dark:text-amber-200 transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
                    title={isAr ? "عرض الموظفين المتبقين للتقييم" : "View Pending Employees"}
                  >
                    <ListChecks size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>{isAr ? "المتبقين" : "Who's Pending"}</span>
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[11px] font-black shadow-2xs">
                      {coverageData.annualPendingCount}
                    </span>
                  </button>
                )}
              </div>

              {/* Right Group */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end">
                {/* Print / Save PDF Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 h-10 px-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50/90 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200/90 dark:border-gray-700/80 text-[13px] font-bold text-gray-800 dark:text-gray-200 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
                  title="Print / Save PDF"
                >
                  <Printer size={14} className="text-[#10664F] dark:text-emerald-400" />
                  <span>Print</span>
                </button>

                {/* Department Selector */}
                <div className="relative shrink-0">
                  <button
                    ref={deptButtonRef}
                    type="button"
                    onClick={toggleDeptDropdown}
                    className="h-10 flex items-center justify-between gap-2 px-3.5 bg-white hover:bg-gray-50/90 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200/90 dark:border-gray-750 rounded-xl sm:rounded-2xl text-[13px] font-bold text-gray-900 dark:text-white transition-all shadow-xs cursor-pointer select-none"
                    title={isAr ? "تصفية حسب القسم" : "Filter by Department"}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                        <Building2 size={12} className="text-[#10664F] dark:text-emerald-400" />
                      </div>
                      <span className="truncate max-w-[95px] sm:max-w-[130px]">
                        {selectedDepartmentFilter === "All" ? (isAr ? "جميع الأقسام" : "All Depts") : selectedDepartmentFilter}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/50 text-[#10664F] dark:text-emerald-300">
                        {selectedDepartmentFilter === "All"
                          ? effectiveAllMembers.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))).length
                          : (availableDepartments.find(d => d.name.toLowerCase() === selectedDepartmentFilter.toLowerCase())?.count || filteredMembers.length)}
                      </span>
                      <ChevronDown size={13} className={`text-gray-400 transition-transform ${deptDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {deptDropdownOpen && isClient && typeof document !== "undefined" && createPortal(
                    <>
                      <div 
                        className="fixed inset-0 z-[99990] bg-black/10 backdrop-blur-[1px]" 
                        onClick={() => setDeptDropdownOpen(false)} 
                        onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      />
                      <div
                        style={{
                          position: 'fixed',
                          top: deptDropdownCoords ? `${deptDropdownCoords.top}px` : '72px',
                          right: deptDropdownCoords ? `${deptDropdownCoords.right}px` : '16px',
                        }}
                        className="w-[260px] sm:w-[280px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 z-[99999] flex flex-col animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10"
                      >
                        <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Building2 size={12} className="text-[#1C6B53] dark:text-emerald-400" />
                            {isAr ? "الأقسام" : "Departments"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {availableDepartments.length} {isAr ? "قسم" : "Depts"}
                          </span>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain">
                          {/* All Departments Option */}
                          <button
                            type="button"
                            onClick={() => handleSelectDepartment("All")}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                              selectedDepartmentFilter === "All"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-black"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="truncate">{isAr ? "جميع الأقسام (الكل)" : "All Departments"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black">
                                {effectiveAllMembers.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))).length}
                              </span>
                              {selectedDepartmentFilter === "All" && <Check size={13} className="text-[#1C6B53] dark:text-emerald-400 shrink-0" />}
                            </div>
                          </button>

                          {/* Department List */}
                          {availableDepartments.map(dept => {
                            const isSelected = selectedDepartmentFilter.toLowerCase() === dept.name.toLowerCase();
                            return (
                              <button
                                key={dept.id || dept.name}
                                type="button"
                                onClick={() => handleSelectDepartment(dept.name)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-black"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="truncate">{isAr ? (dept.nameAr || dept.name) : dept.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black">
                                    {dept.count}
                                  </span>
                                  {isSelected && <Check size={13} className="text-[#1C6B53] dark:text-emerald-400 shrink-0" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
                </div>

                {/* Employee Selector (Comfortable & Modern) */}
                <div className="relative shrink-0">
                  {(isAgent || isUserSpecialStaffOnly) ? (
                    <div className="h-10 flex items-center gap-2.5 px-3.5 bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-750 rounded-xl sm:rounded-2xl text-[13px] font-bold shadow-xs shrink-0">
                      <div className="w-6.5 h-6.5 rounded-lg bg-[#10664F] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {userProfile?.name?.charAt(0) || userProfile?.agent_name?.charAt(0) || "A"}
                      </div>
                      <span className="font-black text-gray-900 dark:text-white truncate max-w-[120px]">
                        {toTitleCase(selectedEmployeeName)}
                      </span>
                      <span className="text-xs text-[#10664F] dark:text-emerald-400 font-bold shrink-0">
                        • {currentMemberRoleType === 'trainer' ? 'Trainer' :
                           currentMemberRoleType === 'qa' ? 'QA' :
                           currentMemberRoleType === 'tl' ? 'Team Leader' :
                           currentMemberRoleType === 'backoffice' ? 'Back Office' :
                           currentMember?.team?.replace(' Team', '') || 'Contact Center'}
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        ref={employeeButtonRef}
                        type="button"
                        onClick={toggleEmployeeDropdown}
                        className="h-10 flex items-center justify-between gap-2.5 px-3.5 bg-white hover:bg-gray-50/90 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200/90 dark:border-gray-750 rounded-xl sm:rounded-2xl text-[13px] font-bold text-gray-900 dark:text-white transition-all shadow-xs cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-[#10664F] to-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                            {selectedEmployeeName ? selectedEmployeeName.charAt(0).toUpperCase() : <Users size={12} />}
                          </div>
                          <span className="truncate font-black text-[13px] text-gray-900 dark:text-white max-w-[95px] sm:max-w-[130px] text-left">
                            {toTitleCase(selectedEmployeeName) || "Select Employee..."}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          <span className={`text-[11px] px-2 py-0.5 rounded-lg border font-black flex items-center gap-1 ${
                            currentMemberRoleType === 'trainer'
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                              : currentMemberRoleType === 'qa'
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : currentMemberRoleType === 'tl'
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : currentMemberRoleType === 'backoffice'
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : isSelectedEmployeeChat
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                          }`}>
                            {currentMemberRoleType === 'trainer' ? <Award size={11} /> :
                             currentMemberRoleType === 'qa' ? <ShieldCheck size={11} /> :
                             currentMemberRoleType === 'tl' ? <Star size={11} /> :
                             currentMemberRoleType === 'backoffice' ? <ListChecks size={11} /> :
                             isSelectedEmployeeChat ? <MessageSquare size={11} /> : <PhoneCall size={11} />}
                            <span>
                              {currentMemberRoleType === 'trainer' ? 'Trainer' :
                               currentMemberRoleType === 'qa' ? 'QA' :
                               currentMemberRoleType === 'tl' ? 'Team Leader' :
                               currentMemberRoleType === 'backoffice' ? 'Back Office' :
                               isSelectedEmployeeChat ? 'Chat' : 'Calls'}
                            </span>
                          </span>
                          <ChevronDown size={13} className={`text-gray-400 transition-transform ${employeeDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                  {employeeDropdownOpen && isClient && typeof document !== "undefined" && createPortal(
                    <>
                      <div 
                        className="fixed inset-0 z-[99990] bg-black/10 backdrop-blur-[1px]" 
                        onClick={() => setEmployeeDropdownOpen(false)} 
                        onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      />
                      <div 
                        style={{
                          position: 'fixed',
                          top: employeeDropdownCoords ? `${employeeDropdownCoords.top}px` : '72px',
                          right: employeeDropdownCoords ? `${employeeDropdownCoords.right}px` : '16px',
                          maxHeight: employeeDropdownCoords ? `calc(100vh - ${employeeDropdownCoords.top + 16}px)` : '80vh',
                        }}
                        className="w-[92vw] sm:w-[460px] max-w-[460px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-3 z-[99999] flex flex-col animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10"
                      >
                        
                        {/* Header */}
                        <div className="px-2 pt-1 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-gray-900 dark:text-white">
                                Select Employee
                              </h4>
                              {selectedDepartmentFilter !== "All" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <span>{selectedDepartmentFilter}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDepartmentFilter("All");
                                    }}
                                    className="hover:text-red-500 font-black ml-0.5"
                                    title="Clear department filter"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                              {filteredMembers.length} {isAr ? "موظف متاح" : "Available Employees"}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {filteredMembers.length} Available
                          </span>
                        </div>

                        {/* Search Input - Modern & Calm */}
                        <div className="relative mt-2.5 mb-2">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                          <input
                            type="text"
                            placeholder={tlAssignedTeam ? "Search employee in your team..." : "Search employee across all teams..."}
                            value={employeeSearchTerm}
                            onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1C6B53]/20 focus:border-[#1C6B53] dark:focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium shadow-xs transition"
                            autoFocus
                          />
                          {employeeSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setEmployeeSearchTerm("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-md transition"
                              title="Clear search"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Team Filter Pills: Younis Kamal, Ankido Buya, Mohammed Dlshad, QA & Training */}
                        <div className={`grid ${tlAssignedTeam ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-4'} gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 shrink-0`}>
                          {[
                            { id: "Younis", label: "Younis Kamal", count: teamCounts.Younis, icon: PhoneCall },
                            { id: "Ankido", label: "Ankido Buya", count: teamCounts.Ankido, icon: PhoneCall },
                            { id: "Mohammed", label: "Mohammed Dlshad", count: teamCounts.Mohammed, icon: MessageSquare },
                            { id: "QA_Training", label: "QA, Training & Back Office", count: teamCounts.QA_Training, icon: ShieldCheck },
                          ]
                          .filter(tab => !tlAssignedTeam || tab.id === tlAssignedTeam)
                          .map(tab => {
                            const TabIcon = tab.icon;
                            const isActive = teamTabFilter === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                title={tab.label}
                                onClick={() => {
                                  setTeamTabFilter(tab.id);
                                  setEmployeeSearchTerm("");
                                }}
                                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                  isActive
                                    ? 'bg-[#1C6B53] text-white shadow-xs font-black'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700'
                                }`}
                              >
                                <TabIcon size={11} className={isActive ? 'text-emerald-200 shrink-0' : 'text-gray-400 shrink-0'} />
                                <span className="truncate">{tab.id === 'QA_Training' ? 'QA & Ops' : tab.label.split(' ')[0]}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
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
                            {employeeSearchTerm.trim() 
                              ? `${filteredMembers.length} Matching Search` 
                              : `${filteredMembers.length} Members in ${teamTabFilter === 'QA_Training' ? 'QA, Training & Back Office' : teamTabFilter === 'Mohammed' ? 'Mohammed Dlshad Team (Chat)' : teamTabFilter === 'Ankido' ? 'Ankido Buya Team (Calls)' : 'Younis Kamal Team (Calls)'}`}
                          </span>
                          <span className="text-[9px] font-bold text-[#1C6B53] dark:text-emerald-400">
                            {teamTabFilter === 'QA_Training' ? 'Specialized Operations' : teamTabFilter === 'Mohammed' ? 'Digital Chat' : 'Voice Calls'}
                          </span>
                        </div>

                        {/* Scrollable Members List */}
                        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 overscroll-contain max-h-64">
                          {filteredMembers.length === 0 ? (
                            <div className="py-8 px-3 text-center text-xs text-gray-400 dark:text-gray-500 font-medium flex flex-col items-center gap-2">
                              {isLoadingMembers ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-[#1C6B53] border-t-transparent rounded-full animate-spin" />
                                  <span>Loading employees list...</span>
                                </>
                              ) : (
                                <>
                                  <Users size={20} className="text-gray-300 dark:text-gray-600" />
                                  <span>{employeeSearchTerm.trim() ? `No employees matching "${employeeSearchTerm}"` : "No employees found"}</span>
                                </>
                              )}
                            </div>
                          ) : (
                            filteredMembers.map(m => {
                              const isSelected = m.agent_name === selectedEmployeeName;
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
                                    setSelectedEmployeeName(m.agent_name);
                                    setEmployeeDropdownOpen(false);
                                    setEmployeeSearchTerm("");
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
                                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">
                                        {teamStr.replace(' Team', '')}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {m.role_type === "tl" ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-extrabold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                                        <Star size={10} />
                                        <span>Team Leader</span>
                                      </span>
                                    ) : m.role_type === "trainer" ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-extrabold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                        <Award size={10} />
                                        <span>Trainer</span>
                                      </span>
                                    ) : m.role_type === "qa" ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-extrabold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                        <ShieldCheck size={10} />
                                        <span>QA</span>
                                      </span>
                                    ) : (
                                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${teamBadgeClass}`}>
                                        {isDlshad ? <MessageSquare size={10} /> : <PhoneCall size={10} />}
                                        <span>{isDlshad ? 'Chat' : 'Calls'}</span>
                                      </span>
                                    )}
                                    {isSelected && <Check size={14} className="text-[#1C6B53] dark:text-emerald-400" />}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

        {/* Unified Evaluation Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-xs overflow-hidden print:border-none print:shadow-none print:p-0">
          
          {/* Header Card: Rich Brand Emerald Gradient Design */}
          <div 
            style={{ background: 'var(--brand-gradient)' }}
            className="bg-gradient-to-r from-[#0C382E] via-[#135B47] to-[#1C6B53] border-b border-white/20 p-6 sm:p-8 relative overflow-hidden text-white"
          >
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              
              {/* Employee Information & Brand Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                
                {/* Modern FIB Logo Emblem: Crisp white container popping against emerald background */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2.5 shrink-0 ring-4 ring-white/10">
                  <img 
                    src="/logo.webp" 
                    alt="First Iraqi Bank" 
                    className="w-full h-full object-contain" 
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[11px] font-black tracking-wider uppercase bg-white/15 text-emerald-100 px-3 py-0.5 rounded-full border border-white/20 backdrop-blur-sm shadow-xs">
                      {isAr ? "التقييم السنوي" : "ANNUAL"} • {selectedYear}
                    </span>
                    {evaluationDate && (
                      <span className="text-xs font-semibold text-emerald-200">
                        {t.submittedAt} {evaluationDate}
                      </span>
                    )}
                    {isReadOnly && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 flex items-center gap-1 backdrop-blur-sm">
                        <Eye size={11} />
                        <span>{t.viewOnly}</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {toTitleCase(selectedEmployeeName || (isAr ? "اختر موظفاً" : "Select Employee"))}
                  </h2>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-emerald-100/90 font-medium">
                    <span className="font-bold text-white">{currentMember?.team || (isAr ? 'مركز خدمة العملاء' : 'Contact Center')}</span>
                    <span>•</span>
                    <span>{currentMember?.department || (isAr ? 'خدمة العملاء' : 'Contact Center')}</span>
                    {currentMemberRoleType !== 'agent' && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase tracking-wider">
                          {currentMemberRoleType === 'trainer' ? t.trainer : currentMemberRoleType === 'qa' ? t.qaRole : currentMemberRoleType === 'backoffice' ? t.backOffice : t.teamLeader}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge & Score Highlights — Right-aligned, larger, premium */}
              <div className="flex items-stretch gap-3 self-start lg:self-auto">
                {/* Final Score Card */}
                <div className="w-[140px] sm:w-[160px] h-[90px] bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 flex flex-col justify-between items-center text-center shadow-sm">
                  <div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">
                    {t.finalScore}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    {isManagerDataVisible && officialOverallScore > 0 ? (
                      <div className="text-3xl font-black text-white leading-none">
                        <span>{officialOverallScore.toFixed(2)}</span>
                        <span className="text-sm text-emerald-200/80 font-normal"> / 5.0</span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-white/40">--</span>
                    )}
                  </div>
                </div>

                {/* Rating Tier Card */}
                <div className="min-w-[160px] sm:min-w-[190px] px-4 h-[90px] bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl py-3 sm:py-4 flex flex-col justify-between items-center text-center shadow-sm">
                  <div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">
                    {t.ratingTier}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm sm:text-[15px] font-black text-white flex items-center gap-2 leading-none whitespace-nowrap">
                      <Award size={17} className={isManagerDataVisible && officialOverallScore > 0 ? "text-amber-300 shrink-0" : "text-white/40 shrink-0"} />
                      <span>{isManagerDataVisible && officialOverallScore > 0 ? getTierLabel(ratingTier.level) : (isAr ? "قيد الانتظار" : "Pending")}</span>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="w-[140px] sm:w-[155px] h-[90px] bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 flex flex-col justify-between items-center text-center shadow-sm">
                  <div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">
                    {t.status}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm font-bold text-white flex items-center gap-2 leading-none">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${
                        evaluationStatus === 'manager_finalized' ? 'bg-emerald-400 ring-4 ring-emerald-400/25' :
                        evaluationStatus === 'self_submitted' ? 'bg-amber-400 ring-4 ring-amber-400/25' : 
                        'bg-white/40 ring-4 ring-white/10'
                      }`} />
                      <span>
                        {evaluationStatus === 'manager_finalized' ? t.finalized :
                         evaluationStatus === 'self_submitted' ? t.selfDone : t.draft}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Rating Scale Legend Reference Strip with Refined Executive Colors */}
          <div className="bg-white dark:bg-gray-900 px-6 sm:px-8 py-3.5 border-b border-gray-200/80 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{t.ratingScaleTitle}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {RATING_LEVELS.map(r => (
                  <div key={r.level} className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-[11px] font-bold ${r.bg}`}>
                    <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-black">
                      {r.level}
                    </span>
                    <span>{getTierLabel(r.level)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 1: KPI Evaluation */}
          <div className="p-6 sm:p-8 border-b border-gray-200/80 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                    {t.section1Title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-9">
                  {t.section1Desc}
                </p>
              </div>

              {/* Auto suggestion helper from actual data - ONLY for CC agents and manager */}
              {currentMemberRoleType === "agent" && actualMetricsSummary && canApplySuggestions && (
                <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-1.5 rounded-2xl shadow-2xs">
                  <div className="text-[11px] font-bold text-[#1C6B53] dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-500" />
                    <span>Actual Metrics Available ({actualMetricsSummary.monthsCount} Months)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySuggestions}
                    className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#1C6B53] text-white hover:bg-[#155340] transition cursor-pointer shadow-2xs"
                    title="Apply benchmark suggestions to manager ratings"
                  >
                    Apply Manager
                  </button>
                </div>
              )}
            </div>

            {/* KPI Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/90 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black border-b border-gray-200 dark:border-gray-700">
                    <th className={`p-3.5 text-left ${currentMemberRoleType === "agent" ? "w-1/3" : "w-1/2"}`}>
                      {t.colMetric}
                    </th>
                    {currentMemberRoleType === "agent" && (
                      <th className="p-3.5 text-center w-28">{isAr ? "النتيجة الفعلية" : "Actual Result"}</th>
                    )}
                    <th className="p-3.5 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                      <span>{t.colSelf} {currentMemberRoleType === "agent" ? (isAr ? " - الموظف" : " (Agent)") : ""}</span>
                    </th>
                    <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                      <span>{t.colManager}</span>
                    </th>
                    <th className="p-3.5 text-center w-20">{t.colGap}</th>
                    <th className="p-3.5 text-center w-24">{t.colNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs font-medium">
                  {activeKpiDefinitions.map((kpi) => {
                    const selfVal = getKpiScore(selfKpis, kpi.id);
                    const mgrVal = getKpiScore(managerKpis, kpi.id);
                    const diff = mgrVal > 0 && selfVal > 0 ? (mgrVal - selfVal) : null;
                    const notesCount = getCriterionNotesCount(kpi.id);
                    const isDrawerOpen = openNoteCriterionId === kpi.id;

                    return (
                      <React.Fragment key={kpi.id}>
                      <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {getCriterionTitle(kpi as any)}
                          </div>
                          {getCriterionDesc(kpi as any) && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5 leading-relaxed">
                              {getCriterionDesc(kpi as any)}
                            </p>
                          )}
                        </td>

                        {currentMemberRoleType === "agent" && (
                          <td className="p-3.5 text-center font-bold text-gray-700 dark:text-gray-300">
                            {kpi.actual ? (
                              <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[#1C6B53] dark:text-emerald-400 font-mono font-bold">
                                {kpi.actual}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-normal">-</span>
                            )}
                          </td>
                        )}

                        {/* Self Rating (1 to 5) */}
                        <td className="p-3.5 text-center bg-blue-50/20 dark:bg-blue-950/10">
                          <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  if (canEditSelf) {
                                    setSelfKpis(prev => ({
                                      ...prev,
                                      [kpi.id]: lvl,
                                      ...(kpi.id === 'exam' ? { knowledge: lvl } : {}),
                                      ...(kpi.id === 'knowledge' ? { exam: lvl } : {})
                                    }));
                                  }
                                }}
                                disabled={!canEditSelf}
                                className={`w-7 h-7 rounded-xl font-black text-xs transition active:scale-90 ${
                                  getRatingButtonClass(lvl, selfVal === lvl)
                                } ${!canEditSelf ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={`Self Rating: ${lvl}`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* Manager Rating (1 to 5) */}
                        <td className="p-3.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                          {!isManagerDataVisible ? (
                            <div className="flex items-center justify-center gap-1.5 py-1 text-gray-400 dark:text-gray-500 text-[11px] font-semibold">
                              <Clock size={13} className="text-amber-500" />
                              <span>{isAr ? "بانتظار المراجعة" : "Awaiting Review"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => {
                                    if (canEditManager) {
                                      setManagerKpis(prev => ({
                                        ...prev,
                                        [kpi.id]: lvl,
                                        ...(kpi.id === 'exam' ? { knowledge: lvl } : {}),
                                        ...(kpi.id === 'knowledge' ? { exam: lvl } : {})
                                      }));
                                    }
                                  }}
                                  disabled={!canEditManager}
                                  className={`w-7 h-7 rounded-xl font-black text-xs transition active:scale-90 ${
                                    getRatingButtonClass(lvl, mgrVal === lvl)
                                  } ${!canEditManager ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                  title={`Manager Rating: ${lvl}`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Gap / Delta */}
                        <td className="p-3.5 text-center font-bold">
                          {!isManagerDataVisible ? (
                            <span className="text-gray-400">-</span>
                          ) : diff !== null ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold ${
                              diff === 0 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' :
                              diff > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' :
                              'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            }`}>
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Criterion Note Button */}
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenNoteCriterionId(isDrawerOpen ? null : kpi.id);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs ${
                              notesCount > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                            title={isAr ? "ملاحظة / تبرير المعيار" : "Criterion Note"}
                          >
                            <MessageSquare size={13} className={notesCount > 0 ? 'text-[#1C6B53] dark:text-emerald-400' : 'text-gray-400'} />
                            <span>{notesCount > 0 ? (isAr ? `ملاحظة (${notesCount})` : `Note (${notesCount})`) : t.addNote}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Note Drawer Row */}
                      {isDrawerOpen && (
                        <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                          <td colSpan={currentMemberRoleType === "agent" ? 6 : 5} className="p-3.5">
                            {renderCriterionNoteDrawer(kpi.id, getCriterionTitle(kpi as any))}
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}

                  {/* Summary Row for Final KPI Score */}
                  <tr className="bg-gray-100 dark:bg-gray-800/90 font-black text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-700">
                    <td className="p-3.5" colSpan={currentMemberRoleType === "agent" ? 2 : 1}>
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-[#1C6B53] dark:text-emerald-400" />
                        <span className="text-sm">{isAr ? "النتيجة النهائية (متوسط 1-5)" : "Final Score (1-5 Average)"}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center bg-blue-100/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                      <span className="text-base font-black font-mono">
                        {selfKpiAvg > 0 ? selfKpiAvg.toFixed(2) : "--"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                      <span className="text-base font-black font-mono">
                        {isManagerDataVisible && managerKpiAvg > 0 ? managerKpiAvg.toFixed(2) : isManagerDataVisible ? "--" : (isAr ? "قيد الانتظار" : "Pending")}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {isManagerDataVisible && managerKpiAvg > 0 && selfKpiAvg > 0 ? (
                        <span className="text-xs font-mono font-black">
                          {(managerKpiAvg - selfKpiAvg) > 0 ? `+${(managerKpiAvg - selfKpiAvg).toFixed(2)}` : (managerKpiAvg - selfKpiAvg).toFixed(2)}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="p-3.5 text-center text-gray-400 font-normal">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Core Competencies */}
          <div className="p-6 sm:p-8 border-b border-gray-200/80 dark:border-gray-800">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  {t.section2Title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-9">
                {isAr ? `تقييم ${currentCompetenciesList.length} كفاءات وسلوكيات مؤسسية معتمدة (من 1 إلى 5).` : `Assessment of the ${currentCompetenciesList.length} core institutional competencies (Rate 1 to 5).`}
              </p>
            </div>

            {/* Competencies Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/90 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black border-b border-gray-200 dark:border-gray-700">
                    <th className="p-3.5 text-left w-1/2">{isAr ? "الكفاءات والمؤشرات السلوكية" : "Competency & Behavioral Indicators"}</th>
                    <th className="p-3.5 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                      <span>{t.colSelf} {currentMemberRoleType === "agent" ? (isAr ? " - الموظف" : " (Agent)") : ""}</span>
                    </th>
                    <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                      <span>{t.colManager}</span>
                    </th>
                    <th className="p-3.5 text-center w-20">{t.colGap}</th>
                    <th className="p-3.5 text-center w-24">{t.colNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs font-medium">
                  {activeCompetenciesList.map((comp) => {
                    const selfVal = selfCompetencies[comp.id] || 0;
                    const mgrVal = managerCompetencies[comp.id] || 0;
                    const diff = mgrVal > 0 && selfVal > 0 ? (mgrVal - selfVal) : null;
                    const notesCount = getCriterionNotesCount(comp.id);
                    const isDrawerOpen = openNoteCriterionId === comp.id;

                    return (
                      <React.Fragment key={comp.id}>
                      <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {getCriterionTitle(comp as any)}
                          </div>
                          {getCriterionDesc(comp as any) && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5 leading-relaxed">
                              {getCriterionDesc(comp as any)}
                            </p>
                          )}
                        </td>

                        {/* Self Rating (1 to 5) */}
                        <td className="p-3.5 text-center bg-blue-50/20 dark:bg-blue-950/10">
                          <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  if (canEditSelf) {
                                    setSelfCompetencies(prev => ({ ...prev, [comp.id]: lvl }));
                                  }
                                }}
                                disabled={!canEditSelf}
                                className={`w-7 h-7 rounded-xl font-black text-xs transition active:scale-90 ${
                                  getRatingButtonClass(lvl, selfVal === lvl)
                                } ${!canEditSelf ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={`Self Rating: ${lvl}`}
                              >
                                {lvl}
                              </button>
                            ))}
                            {selfVal > 0 && selfVal % 1 !== 0 && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black">
                                {selfVal}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Manager Rating (1 to 5) */}
                        <td className="p-3.5 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                          {!isManagerDataVisible ? (
                            <div className="flex items-center justify-center gap-1.5 py-1 text-gray-400 dark:text-gray-500 text-[11px] font-semibold">
                              <Clock size={13} className="text-amber-500" />
                              <span>{isAr ? "بانتظار المراجعة" : "Awaiting Review"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => {
                                    if (canEditManager) {
                                      setManagerCompetencies(prev => ({ ...prev, [comp.id]: lvl }));
                                    }
                                  }}
                                  disabled={!canEditManager}
                                  className={`w-7 h-7 rounded-xl font-black text-xs transition active:scale-90 ${
                                    getRatingButtonClass(lvl, mgrVal === lvl)
                                  } ${!canEditManager ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                  title={`Manager Rating: ${lvl}`}
                                >
                                  {lvl}
                                </button>
                              ))}
                              {mgrVal > 0 && mgrVal % 1 !== 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#1C6B53] text-white text-[10px] font-black">
                                  {mgrVal}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Gap / Delta */}
                        <td className="p-3.5 text-center font-bold">
                          {!isManagerDataVisible ? (
                            <span className="text-gray-400">-</span>
                          ) : diff !== null ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold ${
                              diff === 0 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' :
                              diff > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' :
                              'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            }`}>
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Criterion Note Button */}
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenNoteCriterionId(isDrawerOpen ? null : comp.id);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs ${
                              notesCount > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                            title={isAr ? "ملاحظة / تبرير الكفاءة" : "Criterion Note"}
                          >
                            <MessageSquare size={13} className={notesCount > 0 ? 'text-[#1C6B53] dark:text-emerald-400' : 'text-gray-400'} />
                            <span>{notesCount > 0 ? (isAr ? `ملاحظة (${notesCount})` : `Note (${notesCount})`) : t.addNote}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Note Drawer Row */}
                      {isDrawerOpen && (
                        <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                          <td colSpan={5} className="p-3.5">
                            {renderCriterionNoteDrawer(comp.id, getCriterionTitle(comp as any))}
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}

                  {/* Summary Row for Competencies Average */}
                  <tr className="bg-gray-100 dark:bg-gray-800/90 font-black text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-700">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#1C6B53] dark:text-emerald-400" />
                        <span className="text-sm">{t.competencyAverage}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center bg-blue-100/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                      <span className="text-base font-black font-mono">
                        {selfCompAvg > 0 ? selfCompAvg.toFixed(2) : "--"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                      <span className="text-base font-black font-mono">
                        {isManagerDataVisible && managerCompAvg > 0 ? managerCompAvg.toFixed(2) : isManagerDataVisible ? "--" : (isAr ? "قيد الانتظار" : "Pending")}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {isManagerDataVisible && managerCompAvg > 0 && selfCompAvg > 0 ? (
                        <span className="text-xs font-mono font-black">
                          {(managerCompAvg - selfCompAvg) > 0 ? `+${(managerCompAvg - selfCompAvg).toFixed(2)}` : (managerCompAvg - selfCompAvg).toFixed(2)}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="p-3.5 text-center text-gray-400 font-normal">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Overall Performance Rating Summary */}
          <div className="p-6 sm:p-8 border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {t.overallSummaryTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Employee Summary Card */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    {currentMemberRoleType === 'agent' ? (isAr ? 'التقييم الذاتي للموظف' : 'Agent Self-Review') : t.selfReviewCard}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                    {isAr ? "الذاتي" : "Self"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span>{t.kpiAverage}</span>
                    <span className="font-bold font-mono">{selfKpiAvg > 0 ? selfKpiAvg.toFixed(2) : "--"} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span>{t.competencyAverage}</span>
                    <span className="font-bold font-mono">{selfCompAvg > 0 ? selfCompAvg.toFixed(2) : "--"} / 5.0</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-black text-gray-900 dark:text-white">
                    <span>{t.combinedScore}</span>
                    <span className="font-mono text-base text-blue-600 dark:text-blue-400">
                      {selfOverall > 0 ? selfOverall.toFixed(2) : "--"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manager Summary Card */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#1C6B53] dark:text-emerald-300">{t.managerReviewCard}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isManagerDataVisible && managerOverall > 0
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                  }`}>
                    {isManagerDataVisible && managerOverall > 0 ? (isAr ? 'معتمد' : 'Official') : (isAr ? 'قيد الانتظار' : 'Pending')}
                  </span>
                </div>
                {isManagerDataVisible ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                      <span>{t.kpiAverage}</span>
                      <span className="font-bold font-mono">{managerKpiAvg > 0 ? managerKpiAvg.toFixed(2) : "--"} / 5.0</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                      <span>{t.competencyAverage}</span>
                      <span className="font-bold font-mono">{managerCompAvg > 0 ? managerCompAvg.toFixed(2) : "--"} / 5.0</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-black text-gray-900 dark:text-white">
                      <span>{t.combinedScore}</span>
                      <span className="font-mono text-base text-[#1C6B53] dark:text-emerald-400">
                        {managerOverall > 0 ? managerOverall.toFixed(2) : "--"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-5 text-center text-gray-400 dark:text-gray-500">
                    <Clock size={20} className="text-amber-500 mb-1.5" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{isAr ? "بانتظار تقييم المدير المسؤول" : "Awaiting Manager Review"}</span>
                    <span className="text-[10px] text-gray-400 mt-1">{isAr ? "سيظهر التقييم الرسمي بمجرد اعتماده من قبل الإدارة." : "Official manager ratings will appear once finalized."}</span>
                  </div>
                )}
              </div>

              {/* Final Agreed Level Card */}
              <div className={`p-5 rounded-2xl border shadow-2xs flex flex-col justify-between ${
                isManagerDataVisible && officialOverallScore > 0 ? ratingTier.badgeBg : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      {t.officialFinalRatingCard}
                    </span>
                    {isManagerDataVisible && officialOverallScore > 0 ? (
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                    ) : (
                      <Clock size={16} className="text-amber-500" />
                    )}
                  </div>
                  <div className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-1">
                    {isManagerDataVisible && officialOverallScore > 0 ? (
                      <>
                        {officialOverallScore.toFixed(2)}
                        <span className="text-xs text-gray-500 font-normal"> / 5.0</span>
                      </>
                    ) : (
                      <span className="text-base text-gray-400 font-bold">{isAr ? "قيد المراجعة" : "Pending Review"}</span>
                    )}
                  </div>
                  <div className="text-sm font-black mt-1">
                    {isManagerDataVisible && officialOverallScore > 0 ? getTierLabel(ratingTier.level) : (isAr ? "بانتظار اعتماد الإدارة" : "Awaiting Manager Approval")}
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  {isManagerDataVisible && officialOverallScore > 0 ? (
                    isAr ? (
                      ratingTier.level === 5 ? "أداء استثنائي متميز يفوق كافة الأهداف المحددة بانتظام ويكون قدوة للآخرين." :
                      ratingTier.level === 4 ? "أداء متميز يفوق التوقعات المحددة بانتظام وبجودة عمل عالية." :
                      ratingTier.level === 3 ? "يلبي متطلبات وتوقعات الوظيفة بفعالية وكفاءة." :
                      ratingTier.level === 2 ? "يحتاج إلى مزيد من التطوير والمتابعة الدورية في بعض الجوانب." :
                      "أداء دون المستوى المطلوب ويحتاج إلى خطة تحسين عاجلة."
                    ) : ratingTier.desc
                  ) : (
                    isAr ? "أكمل التقييم لاحتساب الدرجة النهائية الرسمية." : "Complete evaluation to compute official final score."
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Performance Notes & Executive Development Plans */}
          <div className="p-6 sm:p-8 border-b border-gray-200/80 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {t.notesSectionTitle}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 ml-9">
              {t.notesSectionSubtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Manager Feedback & Recommendations */}
              <div className="bg-gray-50/70 dark:bg-gray-800/50 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                    <span>{t.managerComments}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {t.noteAuthorManager}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  disabled={!canEditManager}
                  placeholder={canEditManager ? t.managerCommentsPlaceholder : (isAr ? "لا توجد ملاحظات مدونة من المدير بعد." : "No manager comments recorded yet.")}
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1C6B53]/20 focus:border-[#1C6B53] outline-none transition disabled:opacity-75 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Employee Self-Reflection & Goals */}
              <div className="bg-gray-50/70 dark:bg-gray-800/50 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>{t.employeeComments}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                    {t.noteAuthorEmployee}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={employeeComments}
                  onChange={(e) => setEmployeeComments(e.target.value)}
                  disabled={!canEditSelf}
                  placeholder={canEditSelf ? t.employeeCommentsPlaceholder : (isAr ? "لا توجد أهداف أو تعليقات مدونة من الموظف بعد." : "No self-reflection notes recorded yet.")}
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition disabled:opacity-75 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Key Strengths */}
              <div className="bg-gray-50/70 dark:bg-gray-800/50 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <ThumbsUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{t.keyStrengths}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {isAr ? "نقاط القوة" : "Strengths"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={keyStrengths}
                  onChange={(e) => setKeyStrengths(e.target.value)}
                  disabled={!canEditManager}
                  placeholder={canEditManager ? t.strengthsPlaceholder : (isAr ? "لم يتم تحديد نقاط القوة بعد." : "No strengths specified yet.")}
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1C6B53] outline-none transition disabled:opacity-75 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Areas for Development */}
              <div className="bg-gray-50/70 dark:bg-gray-800/50 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Target size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>{t.areasForDevelopment}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {isAr ? "خطة التطوير" : "Growth"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={areasForDevelopment}
                  onChange={(e) => setAreasForDevelopment(e.target.value)}
                  disabled={!canEditManager}
                  placeholder={canEditManager ? t.improvementsPlaceholder : (isAr ? "لم يتم تحديد مجالات التطوير بعد." : "No development areas specified yet.")}
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition disabled:opacity-75 resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Actions & Print Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Signature Line for Print */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-gray-300">
              <div>
                <div className="text-xs font-bold text-gray-600">Employee Signature:</div>
                <div className="h-14 border-b border-gray-400 mt-2"></div>
                <div className="text-[10px] text-gray-500 mt-1">{toTitleCase(selectedEmployeeName)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">Team Leader / Manager Signature:</div>
                <div className="h-14 border-b border-gray-400 mt-2"></div>
                <div className="text-[10px] text-gray-500 mt-1">{teamLeader || "Team Leader"}</div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 print:hidden">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {lastSavedAt ? (
                  <>
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>{t.lastSaved} {lastSavedAt}</span>
                  </>
                ) : (
                  <span>{isAr ? "لم يتم حفظ أية تغييرات بعد" : "No changes saved yet"}</span>
                )}
                {isReadOnly && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md ml-2 flex items-center gap-1">
                    <Eye size={12} />
                    <span>{t.viewOnly} ({tlAssignedTeam ? (isAr ? 'مراجعة قائد الفريق' : 'Team Leader Review') : (isAr ? 'فريق الجودة' : 'Quality Team')})</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Self-evaluation actions (Agent, Trainer, QA, or Team Leader viewing self) */}
                {!canEditManager && isViewingSelf && (evaluationStatus as string) === 'manager_finalized' && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-[#1C6B53] dark:text-emerald-400">
                    <CheckCircle size={15} />
                    <span>{isAr ? "تم اعتماد التقييم نهائياً من قبل الإدارة" : "Evaluation Finalized by Management"}</span>
                  </div>
                )}
                {!canEditManager && canEditSelf && (
                  <button
                    type="button"
                    onClick={() => handleSaveEvaluation("self_submitted")}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    <span>{evaluationStatus === 'self_submitted' ? t.updateSelf : t.submitSelf}</span>
                  </button>
                )}

                {/* Manager actions */}
                {canEditManager && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation(evaluationStatus === 'manager_finalized' ? 'manager_finalized' : 'draft')}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>{t.saveDraft}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation("manager_finalized")}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#1C6B53] to-emerald-600 hover:opacity-95 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck size={15} />
                      <span>{evaluationStatus === 'manager_finalized' ? t.updateFinalize : t.approveFinalize}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
      </div>

      {/* KPI Benchmark Informational Guide Modal */}
      {showBenchmarkGuideModal && isClient && typeof document !== "undefined" && createPortal(
        <div data-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 overscroll-contain">
            
            {/* Modal Header */}
            <div 
              style={{ background: 'var(--brand-gradient)' }}
              className="p-5 sm:p-6 bg-gradient-to-r from-[#0E3A2F] to-[#1C6B53] text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    KPI & Competency Benchmark Guide
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Official rating benchmarks (Scale 1 to 5) for Contact Center
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBenchmarkGuideModal(false)}
                className="w-9 h-9 rounded-full bg-[#0c3a2d] hover:bg-[#07241c] text-white flex items-center justify-center transition border border-white/30 shadow-md cursor-pointer shrink-0"
                title="Close"
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.5} className="text-white drop-shadow-xs" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {(!isAgent || !isSelectedEmployeeChat) && (
                <button
                  type="button"
                  onClick={() => setBenchmarkGuideTab("calls")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    benchmarkGuideTab === "calls"
                      ? 'bg-[#1C6B53] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                  }`}
                >
                  <PhoneCall size={14} />
                  <span>Calls Benchmarks</span>
                </button>
              )}

              {(!isAgent || isSelectedEmployeeChat) && (
                <button
                  type="button"
                  onClick={() => setBenchmarkGuideTab("chat")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    benchmarkGuideTab === "chat"
                      ? 'bg-[#1C6B53] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Chat Benchmarks</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setBenchmarkGuideTab("competencies")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  benchmarkGuideTab === "competencies"
                    ? 'bg-[#1C6B53] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                }`}
              >
                <Users size={14} />
                <span>Competency Descriptions</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Calls Benchmarks (Younis & Ankido Teams) */}
              {benchmarkGuideTab === "calls" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                        <PhoneCall size={15} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-sky-950 dark:text-sky-100 block">
                          Calls Performance Rating Matrix
                        </span>
                        <span className="text-[10px] text-sky-700 dark:text-sky-300 font-medium">
                          Younis Kamal & Ankido Buya Teams
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-sky-200/80 dark:bg-sky-900 text-sky-900 dark:text-sky-200 border border-sky-300/60 dark:border-sky-700">
                      Official Voice Matrix
                    </span>
                  </div>

                  {/* Single Unified Modern Benchmark Table */}
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xs">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 font-black border-b border-gray-200 dark:border-gray-700">
                          <th className="p-3 text-left w-52">Rating Tier</th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">QA</div>
                            <div className="text-[10px] text-gray-400 font-medium">Quality Score</div>
                          </th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">AHT</div>
                            <div className="text-[10px] text-gray-400 font-medium">Handle Time</div>
                          </th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">Exam</div>
                            <div className="text-[10px] text-gray-400 font-medium">Knowledge Test</div>
                          </th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">Productivity</div>
                            <div className="text-[10px] text-gray-400 font-medium">Target %</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {/* 5 Outstanding */}
                        <tr className="bg-emerald-50/60 dark:bg-emerald-950/25 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                              <span>5 ⭐</span>
                              <span>Outstanding</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">99% - 100%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">&lt; 2:44</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">99% - 100%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">&gt; 93%</span>
                          </td>
                        </tr>

                        {/* 4 Exceeds Expectations */}
                        <tr className="bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                              <span>4 ⭐</span>
                              <span>Exceeds Expectations</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">96% - 98%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">2:45 - 2:59</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">96% - 98%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">91% - 92%</span>
                          </td>
                        </tr>

                        {/* 3 Meets Expectations */}
                        <tr className="bg-slate-50/70 dark:bg-slate-900/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              <span>3 ⭐</span>
                              <span>Meets Expectations</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">95%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">3:00 - 3:10</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">90% - 95%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">90%</span>
                          </td>
                        </tr>

                        {/* 2 Developing */}
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                              <span>2 ⭐</span>
                              <span>Developing</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">90% - 94%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">3:11 - 3:30</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">85% - 89%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">86% - 89%</span>
                          </td>
                        </tr>

                        {/* 1 Needs Improvement */}
                        <tr className="bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                              <span>1 ⭐</span>
                              <span>Needs Improvement</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 89%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&gt; 3:31</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 85%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 85%</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <span>Baseline standard requires Meets Expectations (Rating 3) across all core metrics.</span>
                    <span className="font-bold text-[#1C6B53] dark:text-emerald-400">Calls Voice Standard</span>
                  </div>
                </div>
              )}

              {/* Chat Benchmarks (Mohammed Dlshad Team) */}
              {benchmarkGuideTab === "chat" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <MessageSquare size={15} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 block">
                          Chat Performance Rating Matrix
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                          Mohammed Dlshad Team
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700">
                      Official Digital Matrix
                    </span>
                  </div>

                  {/* Single Unified Modern Benchmark Table */}
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xs">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 font-black border-b border-gray-200 dark:border-gray-700">
                          <th className="p-3 text-left w-52">Rating Tier</th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">Exam</div>
                            <div className="text-[10px] text-gray-400 font-medium">Knowledge Test</div>
                          </th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">QA</div>
                            <div className="text-[10px] text-gray-400 font-medium">Quality Score</div>
                          </th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">AHT</div>
                            <div className="text-[10px] text-gray-400 font-medium">Handle Time</div>
                          </th>
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">ART</div>
                            <div className="text-[10px] text-gray-400 font-medium">First Response</div>
                          </th>
                          {!isChatSemi2026 && (
                            <th className="p-3">
                              <div className="font-black text-gray-900 dark:text-gray-100">Productivity</div>
                              <div className="text-[10px] text-gray-400 font-medium">Chats / Hour</div>
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {/* 5 Outstanding */}
                        <tr className="bg-emerald-50/60 dark:bg-emerald-950/25 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                              <span>5 ⭐</span>
                              <span>Outstanding</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">99% - 100%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">99% - 100%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">3:00 - 3:30</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">&lt; 1:30</span>
                          </td>
                          {!isChatSemi2026 && (
                            <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">&gt; 13</span>
                            </td>
                          )}
                        </tr>

                        {/* 4 Exceeds Expectations */}
                        <tr className="bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                              <span>4 ⭐</span>
                              <span>Exceeds Expectations</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">96% - 98%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">96% - 98%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">3:31 - 4:00</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">1:31 - 1:59</span>
                          </td>
                          {!isChatSemi2026 && (
                            <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                              <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">11 - 12.99</span>
                            </td>
                          )}
                        </tr>

                        {/* 3 Meets Expectations */}
                        <tr className="bg-slate-50/70 dark:bg-slate-900/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              <span>3 ⭐</span>
                              <span>Meets Expectations</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">90% - 95%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">95%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">4:01 - 4:59</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">2:00 - 2:59</span>
                          </td>
                          {!isChatSemi2026 && (
                            <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">8.50 - 10.99</span>
                            </td>
                          )}
                        </tr>

                        {/* 2 Developing */}
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                              <span>2 ⭐</span>
                              <span>Developing</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">85% - 89%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">90% - 94%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">5:00 - 5:59</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">3:00 - 3:30</span>
                          </td>
                          {!isChatSemi2026 && (
                            <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                              <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">7.50 - 8.49</span>
                            </td>
                          )}
                        </tr>

                        {/* 1 Needs Improvement */}
                        <tr className="bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                              <span>1 ⭐</span>
                              <span>Needs Improvement</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 85%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 89%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&gt; 6:00</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&gt; 3:31</span>
                          </td>
                          {!isChatSemi2026 && (
                            <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                              <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 7.50</span>
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <span>Baseline standard requires Meets Expectations (Rating 3) across all core metrics.</span>
                    <span className="font-bold text-[#1C6B53] dark:text-emerald-400">Chat Digital Standard</span>
                  </div>
                </div>
              )}

              {/* Competency Descriptions */}
              {benchmarkGuideTab === "competencies" && (
                <div className="space-y-3">
                  {COMPETENCIES_LIST.map((c, idx) => (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#1C6B53]/20 text-[#1C6B53] dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white">
                          {c.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 ml-7 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBenchmarkGuideModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1C6B53] text-white hover:bg-[#155340] transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Evaluation Coverage & Tracking Modal (Who's Evaluated / Who's Pending) - Manager & Admin Only */}
      {showCoverageModal && (isManager || isAdmin) && isClient && typeof document !== "undefined" && createPortal(
        <div data-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 overscroll-contain">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#1C6B53] bg-gradient-to-r from-[#1C6B53] via-emerald-800 to-[#124636] text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/15">
                  <ClipboardList size={22} className="text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Evaluation Coverage Tracker
                    </h3>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                      Year {selectedYear}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    Real-time tracking of completed and pending semi-annual & annual evaluations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCoverageModal(false)}
                className="w-9 h-9 rounded-full bg-[#0c3a2d] hover:bg-[#07241c] text-white flex items-center justify-center transition border border-white/30 shadow-md cursor-pointer shrink-0"
                title="Close"
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.5} className="text-white drop-shadow-xs" />
              </button>
            </div>

            {/* KPI Summary Overview Cards - Strictly Annual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-gray-50/80 dark:bg-gray-800/40 border-b border-gray-200/80 dark:border-gray-800 shrink-0">
              
              {/* Card 1: Total Employees */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  <span>Total Active Members</span>
                  <Users size={16} className="text-[#1C6B53] dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  {coverageData.totalCount} <span className="text-xs font-semibold text-gray-500">Employees</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Across Contact Center & Specialized Operations
                </div>
              </div>

              {/* Card 2: Annual Review Progress */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  <span>Annual Review Progress</span>
                  <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {coverageData.annualCompletedCount} <span className="text-xs font-semibold text-gray-500">Completed</span>
                  </div>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    {coverageData.annualPendingCount} Pending
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-[#1C6B53] h-full rounded-full transition-all duration-500"
                    style={{ width: `${coverageData.annualPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-right font-bold text-gray-500 dark:text-gray-400 mt-1">
                  {coverageData.annualPercent}% Completed
                </div>
              </div>

            </div>

            {/* Filter & Control Toolbar */}
            <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-gray-800 space-y-3 bg-white dark:bg-gray-900 shrink-0">
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Status Switcher Tabs: Pending, Completed, All */}
                <div className="flex items-center bg-gray-100/90 dark:bg-gray-800/90 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setCoverageFilterStatus("pending")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      coverageFilterStatus === "pending"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <AlertCircle size={13} />
                    <span>Pending Only</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-white/25 rounded-md font-black">
                      {coverageData.annualPendingCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverageFilterStatus("completed")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      coverageFilterStatus === "completed"
                        ? "bg-[#1C6B53] text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Completed</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-white/25 rounded-md font-black">
                      {coverageData.annualCompletedCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverageFilterStatus("all")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      coverageFilterStatus === "all"
                        ? "bg-gray-800 text-white dark:bg-gray-700 shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span>All ({coverageData.totalCount})</span>
                  </button>
                </div>

                {/* Team Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1">{isAr ? "الفريق:" : "Team:"}</span>
                  {[
                    { id: "all", label: isAr ? "جميع الفرق" : "All Teams" },
                    { id: "Younis", label: "Younis Kamal" },
                    { id: "Ankido", label: "Ankido Buya" },
                    { id: "Mohammed", label: "Mohammed Dlshad" },
                    { id: "QA_Training", label: "QA & Training" },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCoverageTeamFilter(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        coverageTeamFilter === t.id
                          ? "bg-[#1C6B53] text-white shadow-2xs font-black"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Department Filter Bar with Live Pending Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
                  <Building2 size={13} className="text-[#1C6B53] dark:text-emerald-400" />
                  <span>{isAr ? "القسم والمتبقي:" : "Department & Pending:"}</span>
                </span>
                
                <button
                  type="button"
                  onClick={() => setCoverageDeptFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    coverageDeptFilter === "all"
                      ? "bg-[#1C6B53] text-white shadow-2xs font-black"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span>{isAr ? "جميع الأقسام" : "All Departments"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    coverageDeptFilter === "all" ? "bg-white/20 text-white font-black" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}>
                    {coverageData.totalCount}
                  </span>
                </button>

                {Object.entries(coverageDeptCounts).map(([dName, stats]) => {
                  const isSelected = coverageDeptFilter.toLowerCase() === dName.toLowerCase();
                  const displayName = isAr && stats.nameAr ? stats.nameAr : dName;
                  return (
                    <button
                      key={dName}
                      type="button"
                      onClick={() => setCoverageDeptFilter(isSelected ? "all" : dName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#1C6B53] text-white shadow-2xs font-black ring-2 ring-[#1C6B53]/30"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <span>{displayName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                        stats.pending > 0 
                          ? (isSelected ? "bg-amber-400 text-amber-950 font-black" : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800")
                          : (isSelected ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-800")
                      }`}>
                        {stats.pending > 0 
                          ? `${stats.pending} ${isAr ? "معلق" : "Pending"}`
                          : (isAr ? "مكتمل" : "Completed")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Second Row: Live Search Bar & Quick Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={coverageSearchTerm}
                    onChange={(e) => setCoverageSearchTerm(e.target.value)}
                    placeholder="Search by name or employee ID..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C6B53]"
                  />
                  {coverageSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setCoverageSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Copy Pending Button */}
                <button
                  type="button"
                  onClick={handleCopyPendingList}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <Copy size={13} />
                  <span>{coverageCopiedToast ? "Copied!" : "Copy Pending List"}</span>
                </button>

              </div>

            </div>

            {/* Employee List Area */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 bg-gray-50/50 dark:bg-gray-900/50">
              {filteredCoverageList.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-3 opacity-80" />
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200">
                    No employees match the selected filter
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {coverageFilterStatus === "pending" 
                      ? "Great! All employees in this category have been evaluated." 
                      : "Try adjusting your filter options or clearing the search query."}
                  </p>
                </div>
              ) : (
                filteredCoverageList.map(item => (
                  <div 
                    key={item.member.id || item.name}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-white dark:bg-gray-800/90 hover:bg-gray-50/80 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl transition shadow-2xs"
                  >
                    {/* Employee Identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1C6B53] to-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm text-gray-900 dark:text-white">
                            {toTitleCase(item.name)}
                          </span>
                          {item.knownId && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              #{item.knownId}
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            item.isChat
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                          }`}>
                            {item.isChat ? "Chat" : "Calls"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{item.team}</span>
                          {item.member?.department && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-gray-600 dark:text-gray-300">
                                {item.member.department}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badges & Quick Action */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                      
                      {/* Annual Status Badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        item.annual.isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/60"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/60"
                      }`}>
                        {item.annual.isCompleted ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Annual:</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300">
                              {item.annual.score !== null ? item.annual.score.toFixed(2) : "Completed"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Annual:</span>
                            <span className="font-medium text-amber-700 dark:text-amber-300">Pending</span>
                          </>
                        )}
                      </div>

                      {/* Action Button: Evaluate / Open */}
                      <button
                        type="button"
                        onClick={() => handleSelectForEvaluation(item.name, "Annual")}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C6B53] hover:bg-[#155340] text-white text-xs font-black transition active:scale-95 shadow-2xs cursor-pointer ml-auto md:ml-0"
                      >
                        <span>Evaluate Employee</span>
                        <ExternalLink size={12} />
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Showing {filteredCoverageList.length} of {coverageData.totalCount} employees
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoverageModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1C6B53] text-white hover:bg-[#155340] transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Manage Criteria Modal */}
      <ManageCriteriaModal
        lang={lang}
        isOpen={showManageCriteriaModal}
        onClose={() => setShowManageCriteriaModal(false)}
        criteria={criteria}
        sections={sections}
        onSaveCriteria={(updated) => {
          setCriteria(updated);
          saveStoredCriteria(updated);
          showToastNotification("تم حفظ معايير التقييم بنجاح!", "success");
        }}
        onSaveSections={(updated) => {
          setSections(updated);
          saveStoredSections(updated);
          showToastNotification("تم حفظ أقسام التقييم بنجاح!", "success");
        }}
      />

      {/* Manage Staff Modal */}
      <ManageStaffModal
        lang={lang}
        isOpen={showManageStaffModal}
        onClose={() => setShowManageStaffModal(false)}
        departments={departments}
        employees={dynamicEmployees}
        onSaveDepartments={(updated) => {
          setDepartments(updated);
          saveStoredDepartments(updated);
          showToastNotification("تم حفظ الأقسام بنجاح!", "success");
        }}
        onSaveEmployees={(updated) => {
          setDynamicEmployees(updated);
          saveStoredEmployees(updated);
          showToastNotification("تم حفظ بيانات الموظفين بنجاح!", "success");
        }}
        onSelectEmployeeForEval={(empName) => {
          setSelectedEmployeeName(empName);
          setShowManageStaffModal(false);
        }}
      />

      {/* Copied Toast Notification */}
      {coverageCopiedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-800 dark:border-gray-200 text-xs font-black animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>Pending list copied to clipboard!</span>
        </div>
      )}

    </div>
  );
}
