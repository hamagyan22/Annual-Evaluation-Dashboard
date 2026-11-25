"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { db } from "@/lib/firebaseClient";
import { collection, doc, getDocs, query, where, onSnapshot, setDoc } from "firebase/firestore";
import { 
  ArrowLeft, Search, Users, Check, Save, 
  Sun, Moon, ChevronDown, Sparkles,
  Award, X, Printer, User, UserCheck, Star,
  Info, ThumbsUp, Target, BookOpen, AlertTriangle,
  PhoneCall, ShieldCheck, CheckCircle, Calendar,
  Clock, Eye, Lock, MessageSquare,
  ClipboardList, CheckCircle2, XCircle, AlertCircle,
  Filter, Copy, ListChecks, ExternalLink,
  Building2, Sliders, Camera, Upload, Trash2, LogOut
} from "lucide-react";
import { getCanonicalAgentName } from "@/lib/canonicalAgents";
import { isMemberActiveInPeriod } from "@/lib/companyRoster";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import { ModernDropdown } from "@/components/ModernDropdown";
import { UnifiedTopNavbar, ActiveDashboardType } from "@/components/UnifiedTopNavbar";
import { BASELINE_ANNUAL_EVALUATIONS } from "@/lib/baselineAnnualEvaluations";
import { useBodyScrollLock } from "@/lib/scrollLock";
import { ManageCriteriaModal } from "@/components/ManageCriteriaModal";
import { ManageStaffModal } from "@/components/ManageStaffModal";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { 
  loadStoredCriteria, saveStoredCriteria,
  loadStoredSections, saveStoredSections,
  loadStoredDepartments, saveStoredDepartments,
  loadStoredEmployees, saveStoredEmployees,
  loadStoredDeletedEmployees, saveStoredDeletedEmployees,
  loadStoredDeletedDepartments, saveStoredDeletedDepartments,
  loadStoredDeletedCriteria, saveStoredDeletedCriteria,
  DEFAULT_SECTIONS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_EMPLOYEES,
  DynamicCriterion, DynamicSection, DynamicDepartment, DynamicEmployee
} from "@/lib/customCriteriaManager";
import { getDepartmentIcon } from "@/lib/bankDepartmentIcons";

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

// Helper to check if two names match across Arabic/English, short/full versions, or token subsets
export function isNameTokenMatch(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const normA = normalizeAgentName(nameA);
  const normB = normalizeAgentName(nameB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) return true;

  const tokensA = normA.split(/\s+/).filter(t => t.length > 1);
  const tokensB = normB.split(/\s+/).filter(t => t.length > 1);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  // First and last token match (e.g. Jalal ... Burghol matches Jalal Burghol)
  if (tokensA[0] === tokensB[0] && tokensA[tokensA.length - 1] === tokensB[tokensB.length - 1]) {
    return true;
  }

  // Subsets: all tokens of shorter name exist in longer name
  const [shorter, longer] = tokensA.length <= tokensB.length ? [tokensA, tokensB] : [tokensB, tokensA];
  if (shorter.length >= 2 && shorter.every(t => longer.includes(t))) {
    return true;
  }

  return false;
}

export function isEmailMatchName(email: string, targetName: string): boolean {
  if (!email || !targetName) return false;
  const userPart = email.split('@')[0].toLowerCase().replace(/[^a-z]/g, ' ').trim();
  if (!userPart) return false;
  return isNameTokenMatch(userPart, targetName);
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
    label: "Improvement Required", 
    color: "text-white", 
    bg: "bg-amber-600 text-white border-amber-700 shadow-xs", 
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300",
    desc: "Meets some expectations but regular improvement and guidance is required in certain areas." 
  },
  { 
    level: 1, 
    label: "Below Expectations", 
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

export const COMPETENCY_DEFINITIONS_AR: Record<string, { id: string; name: string; description: string }> = {
  communication: {
    id: "communication",
    name: "التواصل الفعّال واللباقة",
    description: "نقل المعلومات بوضوح ولباقة واحترافية، والاستماع الفعّال، والتعاطف، والالتزام بأعلى معايير اللباقة مع العملاء والزملاء."
  },
  problem_solving: {
    id: "problem_solving",
    name: "حل المشكلات والتعامل مع الحالات",
    description: "تشخيص احتياجات العملاء بسرعة ودقة وتقديم حلول عملية متوافقة مع السياسات المصرفية، مع الحفاظ على الهدوء والوضوح أثناء التصعيد."
  },
  accountability: {
    id: "accountability",
    name: "المسؤولية وتحمل النتائج",
    description: "تحمل الملكية الكاملة للمهام والنتائج، والوفاء بالالتزامات، وتصحيح الأخطاء بصورة بناءة دون الحاجة لإشراف مستمر."
  },
  initiative: {
    id: "initiative",
    name: "المبادرة والتطوير المستمر",
    description: "المبادرة باقتراح تحسينات لإجراءات العمل، ومساعدة أعضاء الفريق، والبحث المستمر عن فرص التطوير المهني والذاتي."
  },
  responsibility: {
    id: "responsibility",
    name: "الالتزام والنزاهة المؤسسية",
    description: "الالتزام التام بسياسات المصرف وضوابط أمن البيانات والسرية المصرفية ومواعيد العمل، مع التحلي بأعلى درجات النزاهة والموثوقية."
  },
  team_work: {
    id: "team_work",
    name: "العمل الجماعي والتعاون",
    description: "التعاون الإيجابي مع الزملاء والقادة، ومشاركة المعرفة والخبرات، ودعم أعضاء الفريق في أوقات ضغط العمل وتعزيز الروح الإيجابية."
  },
  digitalization: {
    id: "digitalization",
    name: "التحول الرقمي والتقنيات الحديثة",
    description: "الاستفادة الفعّالة من الأدوات الرقمية الحديثة والأنظمة المصرفية وأتمتة المهام لرفع جودة وكفاءة العمليات."
  }
};

export const KPI_DEFINITIONS_AR: Record<string, { name: string; description?: string }> = {
  qa: { name: "معدل جودة الخدمة (QA)", description: "تحقيق المستهدف المعتمد لجودة المكالمات والمحادثات وخدمة العملاء والالتزام بالمعايير المصرفية." },
  aht: { name: "معدل وقت معالجة المكالمة (AHT)", description: "كفاءة إدارة المكالمة والتحكم في وقت المعالجة بما يطابق مستهدفات البنك." },
  productivity: { name: "معدل الإنتاجية المستهدفة (Productivity)", description: "نسبة تحقيق مستهدفات الإنتاجية وحجم المعاملات المنجزة." },
  attendance: { name: "الالتزام ومواعيد الدوام (Attendance)", description: "الالتزام التام بجدول الشفتات ومواعيد العمل والسياسات المصرفية." },
  attendance_commitment: { name: "الالتزام ومواعيد الدوام", description: "الالتزام التام بجدول الشفتات ومواعيد العمل والسياسات المصرفية." },
  exam: { name: "اختبار المعرفة المصرفية (Exam)", description: "تحقيق نتائج متميزة في اختبارات المعرفة والمنتجات المصرفية الدورية." },
  knowledge: { name: "المعرفة بالمنتجات المصرفية (Knowledge)", description: "الإلمام الكامل بالمنتجات والخدمات المصرفية وإجراءات العمل." },
  art: { name: "معدل زمن الاستجابة (ART)", description: "سرعة وكفاءة الرد على رسائل واستفسارات المحادثة الرقمية للعملاء." },
  first_response: { name: "زمن أول استجابة (First Response)", description: "سرعة الرد على المحادثة فور بدء العميل للتواصل." },
  leadership: { name: "القيادة وإدارة الفريق", description: "التوجيه الفعّال والتحفيز ودعم أعضاء الفريق لتحقيق التميز التشغيلي." },
  team_kpi: { name: "تحقيق مؤشرات أداء الفريق (Team KPI)", description: "تحقيق مستهدفات مستوى الخدمة والجودة والإنتاجية لكافة أعضاء الفريق." },
  evaluation_accuracy: { name: "دقة التقييم والمعايرة", description: "ضمان دقة وموثوقية تدقيق المكالمات وتطابق المعايرة مع المعايير المعتمدة." },
  team_improvement: { name: "تطوير أداء الفريق وتقليل الأخطاء", description: "تحقيق تحسن ملموس في أداء الموظفين ومعالجة نقاط الضعف عبر التوجيه المستمر." },
  reporting: { name: "التقارير وسير العمل التشغيلي", description: "تقديم تقارير الأداء اليومية والتسليم والتحليلات والخطط التصحيحية في مواعيدها." },
  accuracy: { name: "دقة العمليات والبيانات (Accuracy)", description: "تنفيذ العمليات بنسبة خطأ صفر وضمان صحة وسلامة البيانات المصرفية." },
  sla_compliance: { name: "الالتزام باتفاقية مستوى الخدمة (SLA)", description: "إنجاز المعاملات ضمن الأوقات المحددة للخدمة والالتزام بالمواعيد النهائية." },
  followup_efficiency: { name: "كفاءة المتابعة والإنجاز", description: "متابعة الحالات المعلقة والتنسيق بين الأقسام لحل استفسارات العملاء." },
  ticket_management: { name: "إدارة التذاكر والطلبات", description: "إدارة طابور التذاكر وتوثيق الحالة وإغلاق المعاملات بدقة وسرعة." },
  session: { name: "جلسات التدريب والمعايرة", description: "عقد جلسات تدريبية وتوجيهية وتغذية راجعة دورية لرفع الكفاءة." }
};

const DEPT_TRANSLATION_MAP: Record<string, { ar: string; en: string }> = {
  "ادارة الفروع": { ar: "إدارة الفروع", en: "Branch Management" },
  "branch management": { ar: "إدارة الفروع", en: "Branch Management" },
  "التجاري": { ar: "التجاري", en: "Commercial" },
  "commercial": { ar: "التجاري", en: "Commercial" },
  "مركز الاتصال": { ar: "مركز الاتصال", en: "Contact Center" },
  "contact center": { ar: "مركز الاتصال", en: "Contact Center" },
  "تقنية المعلومات": { ar: "تقنية المعلومات", en: "Information Technology" },
  "information technology": { ar: "تقنية المعلومات", en: "Information Technology" },
  "المكتب الخلفي - العمليات": { ar: "المكتب الخلفي - العمليات", en: "Back Office - Operations" },
  "back office - operations": { ar: "المكتب الخلفي - العمليات", en: "Back Office - Operations" },
  "العمليات": { ar: "العمليات", en: "Operations" },
  "operations": { ar: "العمليات", en: "Operations" },
  "المبيعات": { ar: "المبيعات", en: "Sales" },
  "sales": { ar: "المبيعات", en: "Sales" },
  "الابلاغ عن غسل الاموال وتمويل الارهاب": { ar: "الإبلاغ عن غسل الأموال وتمويل الإرهاب", en: "AML / CFT Compliance" },
  "aml / cft compliance": { ar: "الإبلاغ عن غسل الأموال وتمويل الإرهاب", en: "AML / CFT Compliance" },
  "الهندسية والادارية": { ar: "الهندسية والإدارية", en: "Engineering & Administration" },
  "engineering & administration": { ar: "الهندسية والإدارية", en: "Engineering & Administration" },
  "المالية": { ar: "المالية", en: "Finance" },
  "finance": { ar: "المالية", en: "Finance" },
  "الدفع الالكتروني": { ar: "الدفع الإلكتروني", en: "Electronic Payment" },
  "electronic payment": { ar: "الدفع الإلكتروني", en: "Electronic Payment" },
  "الامتثال الشرعي ومراقبة الامتثال": { ar: "الامتثال الشرعي ومراقبة الامتثال", en: "Sharia & Regulatory Compliance" },
  "sharia & regulatory compliance": { ar: "الامتثال الشرعي ومراقبة الامتثال", en: "Sharia & Regulatory Compliance" },
  "الموارد البشرية": { ar: "الموارد البشرية", en: "Human Resources" },
  "human resources": { ar: "الموارد البشرية", en: "Human Resources" },
  "الادارة": { ar: "الإدارة العامة", en: "Executive Management" },
  "executive management": { ar: "الإدارة العامة", en: "Executive Management" },
  "القانوني": { ar: "القسم القانوني", en: "Legal Department" },
  "legal department": { ar: "القسم القانوني", en: "Legal Department" },
  "الرقابة والتدقيق الشرعي الداخلي": { ar: "الرقابة والتدقيق الشرعي الداخلي", en: "Internal Sharia Audit & Control" },
  "internal sharia audit & control": { ar: "الرقابة والتدقيق الشرعي الداخلي", en: "Internal Sharia Audit & Control" },
  "ادارة المشاريع": { ar: "إدارة المشاريع", en: "Project Management" },
  "project management": { ar: "إدارة المشاريع", en: "Project Management" },
  "أمن المعلومات": { ar: "أمن المعلومات", en: "Information Security" },
  "information security": { ar: "أمن المعلومات", en: "Information Security" },
  "التسويق": { ar: "التسويق", en: "Marketing" },
  "marketing": { ar: "التسويق", en: "Marketing" },
  "الشمول المالي": { ar: "الشمول المالي", en: "Financial Inclusion" },
  "financial inclusion": { ar: "الشمول المالي", en: "Financial Inclusion" },
  "الخزينة والاستثمار والمؤسسات المالية": { ar: "الخزينة والاستثمار والمؤسسات المالية", en: "Treasury & Investment" },
  "treasury & investment": { ar: "الخزينة والاستثمار والمؤسسات المالية", en: "Treasury & Investment" },
  "ادارة المخاطر": { ar: "إدارة المخاطر", en: "Risk Management" },
  "risk management": { ar: "إدارة المخاطر", en: "Risk Management" },
  "ادارة الجودة والتطوير المؤسسي": { ar: "إدارة الجودة والتطوير المؤسسي", en: "Quality & Institutional Development" },
  "quality & institutional development": { ar: "إدارة الجودة والتطوير المؤسسي", en: "Quality & Institutional Development" },
  "الائتمان": { ar: "الائتمان", en: "Credit" },
  "credit": { ar: "الائتمان", en: "Credit" },
  "العلاقات العامة وخدمة كبار العملاء": { ar: "العلاقات العامة وخدمة كبار العملاء", en: "Public Relations & VIP Services" },
  "public relations & vip services": { ar: "العلاقات العامة وخدمة كبار العملاء", en: "Public Relations & VIP Services" },
  "الشركات": { ar: "الشركات", en: "Corporate Banking" },
  "corporate banking": { ar: "الشركات", en: "Corporate Banking" },
};

export function getLocalizedDeptName(deptName: string, isAr: boolean) {
  if (!deptName) return isAr ? "مركز خدمة العملاء" : "Contact Center";
  const key = deptName.toLowerCase().trim();
  if (DEPT_TRANSLATION_MAP[key]) {
    return isAr ? DEPT_TRANSLATION_MAP[key].ar : DEPT_TRANSLATION_MAP[key].en;
  }
  const l = deptName.toLowerCase();
  if (l.includes("quality") || l.includes("qa")) return isAr ? "إدارة الجودة" : "Quality Assurance";
  if (l.includes("train")) return isAr ? "التدريب والتطوير" : "Training & Development";
  if (l.includes("back") || l.includes("office")) return isAr ? "العمليات والمكتب الخلفي" : "Back Office";
  if (l.includes("contact") || l.includes("call")) return isAr ? "مركز الاتصال" : "Contact Center";
  if (l.includes("it") || l.includes("digital")) return isAr ? "تكنولوجيا المعلومات" : "Information Technology";
  if (l.includes("human") || l.includes("hr")) return isAr ? "الموارد البشرية" : "Human Resources";
  if (l.includes("finan")) return isAr ? "المالية" : "Finance";
  return deptName;
}

export function getLocalizedMemberName(
  member: any,
  isAr: boolean
): string {
  if (!member) return "";
  if (typeof member === "string") return member;
  if (isAr) {
    return member.nameAr || member.name || member.agent_name || "";
  }
  return member.nameEn || member.name || member.agent_name || "";
}

export function getRatingInfo(score: number, lang: Language = "en") {
  const isAr = lang === "ar";
  if (score >= 4.5) {
    return {
      level: 5,
      label: isAr ? "متميز جداً" : "Outstanding",
      color: "text-white",
      bg: "bg-[#1C6B53] text-white border-emerald-600 shadow-xs",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300",
      desc: isAr ? "أداء متميز واستثنائي يفوق كافة الأهداف المحددة بانتظام وبكفاءة عالية." : "Consistently exceeds all performance targets and delivers exceptional quality across all operational responsibilities."
    };
  }
  if (score >= 3.5) {
    return {
      level: 4,
      label: isAr ? "يفوق التوقعات" : "Exceeds Expectations",
      color: "text-white",
      bg: "bg-blue-600 text-white border-blue-700 shadow-xs",
      badgeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300",
      desc: isAr ? "أداء متفوق يتجاوز الأهداف المحددة بانتظام بجودة عمل ممتازة." : "Frequently performs above expectations and consistently delivers high-quality work."
    };
  }
  if (score >= 2.5) {
    return {
      level: 3,
      label: isAr ? "يلبي التوقعات" : "Meets Expectations",
      color: "text-white",
      bg: "bg-slate-600 text-white border-slate-700 shadow-xs",
      badgeBg: "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200",
      desc: isAr ? "أداء يلبي كافة المتطلبات والمعايير التشغيلية المحددة بدقة واحترافية." : "Consistently meets the job requirements and performance standards set for the role."
    };
  }
  if (score >= 1.5) {
    return {
      level: 2,
      label: isAr ? "يحتاج إلى تحسين" : "Improvement Required",
      color: "text-white",
      bg: "bg-amber-600 text-white border-amber-700 shadow-xs",
      badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300",
      desc: isAr ? "أداء يلبي بعض المعايير ولكنه يحتاج لمزيد من التحسين والمتابعة لتحقيق المستوى المطلوب." : "Meets some job requirements but needs improvement and coaching to reach the expected standard."
    };
  }
  return {
    level: 1,
    label: isAr ? "دون التوقعات" : "Below Expectations",
    color: "text-white",
    bg: "bg-rose-600 text-white border-rose-700 shadow-xs",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300",
    desc: isAr ? "الأداء دون التوقعات ويتطلب خطة تحسين عاجلة ومتابعة فورية ومكثفة." : "Performance is below expectations and significant improvement is required to meet the role requirements."
  };
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
  direct_manager?: string;
  is_special_staff?: boolean;
}

export const SPECIAL_STAFF_MEMBERS: SpecialStaffMember[] = [
  { id: "mohammed_azad", agent_name: "Mohammed Azad", name: "Mohammed Azad", employee_id: "353", team: "Training Team", role_type: "trainer", department: "Training", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
  { id: "mohammed_jihad", agent_name: "Mohammed Jihad", name: "Mohammed Jihad", employee_id: "356", team: "Quality Assurance Team", role_type: "qa", department: "Call center - Quality", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
  { id: "lara_kamil", agent_name: "Lara Kamil", name: "Lara Kamil", employee_id: "351", team: "Quality Assurance Team", role_type: "qa", department: "Quality", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
  { id: "shireen_waisi", agent_name: "Shireen Waisi", name: "Shireen Waisi", employee_id: "370", team: "Back Office", role_type: "backoffice", department: "Back Office", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
  { id: "ankido_buya", agent_name: "Ankido Buya", name: "Ankido Buya", employee_id: "340", team: "Ankido Buya Team", role_type: "tl", department: "Contact Center", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
  { id: "younis_kamal", agent_name: "Younis Kamal", name: "Younis Kamal", employee_id: "373", team: "Younis Kamal Team", role_type: "tl", department: "Contact Center", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
  { id: "mohammed_dlshad", agent_name: "Mohammed Dilshad", name: "Mohammed Dilshad", employee_id: "338", team: "Mohammed Dlshad Team", role_type: "tl", department: "Contact Center", manager_name: "Omer Ayad", direct_manager: "Omer Ayad", is_special_staff: true },
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
  const emailLower = (userProfile?.email || "").toLowerCase().trim();
  const nameLower = (userProfile?.name || userProfile?.agent_name || "").toLowerCase().trim();
  const roleLower = (userProfile?.role || "").toLowerCase().trim();
  const userTeamLower = (userProfile?.team || userProfile?.name || userProfile?.email || "").toLowerCase();
  const currentUserNameNorm = normalizeAgentName(userProfile?.name || userProfile?.agent_name || "");

  const isAdmin = userProfile?.role === 'admin' || 
                  emailLower === 'mohammed.dlshad0@gmail.com' ||
                  emailLower === 'omar.ayad@fib.iq';
  const isChief = userProfile?.role === 'chief' || emailLower === 'ali.al-ameli@fib.iq';
  const isManager = isAdmin || isChief || userProfile?.role === 'manager' || emailLower === 'jalal.burghol@agent.com' || emailLower === 'jalal.burghol@fib.iq';
  const isTL = userProfile?.role === 'tl';
  const isQA = userProfile?.role === 'qa' || userProfile?.role === 'trainer' || userProfile?.role === 'auditor';
  const isAgent = userProfile?.role === 'agent';

  // Role detection for specific special staff users
  const isUserMohammedAzad = (emailLower.includes("mohammed.azad") || nameLower.includes("mohammed azad") || roleLower === "trainer") && !emailLower.includes("azad.muhammad") && !emailLower.includes("azad.mohammed") && !nameLower.includes("azad muhammad") && !nameLower.includes("azad mohammed");
  const isUserMohammedJihad = (emailLower.includes("jihad") || nameLower.includes("jihad")) && !nameLower.includes("younis");
  const isUserLaraKamil = emailLower.includes("lara") || nameLower.includes("lara");
  const isUserAnkido = emailLower.includes("ankido") || nameLower.includes("ankido");
  const isUserYounis = emailLower.includes("younis") || nameLower.includes("younis");
  const isUserShireenWaisi = emailLower.includes("shireen") || nameLower.includes("shireen") || roleLower === "backoffice";

  // Language State: default 'en', toggleable to 'ar'
  const [lang, setLang] = useState<Language>("en");
  const isAr = lang === "ar";
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fib_eval_language") as Language;
      if (saved === "ar" || saved === "en") {
        setLang(saved);
      }
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("fib_eval_language", newLang);
    }
  };

  // Dynamic Custom Criteria & Staff Modals State
  const [showManageCriteriaModal, setShowManageCriteriaModal] = useState<boolean>(false);
  const [showManageStaffModal, setShowManageStaffModal] = useState<boolean>(false);

  // User Profile & Security Modal State
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [profileStatusMsg, setProfileStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>(userProfile?.photo_url || "");
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.photo_url) {
      setCurrentUserPhoto(userProfile.photo_url);
    }
  }, [userProfile?.photo_url]);
  const [dynamicCriteria, setDynamicCriteria] = useState<DynamicCriterion[]>([]);
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([]);
  const [dynamicDepartments, setDynamicDepartments] = useState<DynamicDepartment[]>([]);
  const [dynamicEmployees, setDynamicEmployees] = useState<DynamicEmployee[]>([]);
  const [deletedEmployeeNames, setDeletedEmployeeNames] = useState<string[]>([]);
  const [deletedDepartmentIds, setDeletedDepartmentIds] = useState<string[]>([]);
  const [deletedCriteriaIds, setDeletedCriteriaIds] = useState<string[]>([]);

  // One-time automatic cleanup to wipe old defaults and start 100% clean for custom entries
  useEffect(() => {
    const WIPE_FLAG_KEY = "fib_annual_eval_clean_slate_v5";
    if (typeof window !== "undefined" && !localStorage.getItem(WIPE_FLAG_KEY)) {
      localStorage.setItem(WIPE_FLAG_KEY, "true");
      localStorage.removeItem("fib_annual_eval_criteria_v2");
      localStorage.removeItem("fib_annual_eval_departments_v2");
      localStorage.removeItem("fib_annual_eval_employees_v2");
      localStorage.removeItem("fib_annual_eval_deleted_employees_v2");
      localStorage.removeItem("fib_annual_eval_deleted_departments_v2");
      localStorage.removeItem("fib_annual_eval_deleted_criteria_v2");
      setDynamicCriteria([]);
      setDynamicDepartments([]);
      setDynamicEmployees([]);
      setDeletedEmployeeNames([]);
      setDeletedDepartmentIds([]);
      setDeletedCriteriaIds([]);
      setSelectedEmployeeName("");

      const docRef = doc(db, "annual_evaluations", "config_roster_and_criteria");
      setDoc(docRef, {
        is_clean_slate_v5: true,
        departments: [],
        employees: [],
        criteria: [],
        sections: DEFAULT_SECTIONS,
        deletedEmployeeNames: [],
        deletedDepartmentIds: [],
        deletedCriteriaIds: [],
        updatedAt: new Date().toISOString()
      }, { merge: false }).catch(() => null);
    }
  }, []);

  // Initial local loading for instant rendering
  useEffect(() => {
    setDynamicCriteria(loadStoredCriteria());
    const initialSecs = loadStoredSections();
    const upgradedInitialSecs = (initialSecs && initialSecs.length > 0 ? initialSecs : DEFAULT_SECTIONS).map(s => {
      if (s.id === "kpi") {
        return {
          ...s,
          title: "Department KPI Evaluation",
          titleAr: "تقييم مؤشرات الأداء للقسم (KPIs)",
          description: "Department operational and performance metrics evaluation (Rate 1 to 5)."
        };
      }
      if (s.id === "competencies") {
        return {
          ...s,
          title: "Bank Core Competencies Evaluation",
          titleAr: "تقييم الكفاءات الجوهرية للمصرف",
          description: "Assessment of bank core competencies and institutional behaviors (Rate 1 to 5)."
        };
      }
      return s;
    });
    setDynamicSections(upgradedInitialSecs);
    saveStoredSections(upgradedInitialSecs);
    setDynamicDepartments(loadStoredDepartments());
    setDynamicEmployees(loadStoredEmployees());
    setDeletedEmployeeNames(loadStoredDeletedEmployees());
    setDeletedDepartmentIds(loadStoredDeletedDepartments());
    setDeletedCriteriaIds(loadStoredDeletedCriteria());
  }, []);

  // Live real-time synchronization with Firestore config document for permanent, universal persistence
  useEffect(() => {
    const docRef = doc(db, "annual_evaluations", "config_roster_and_criteria");
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // If the Firestore document was from the old legacy seed (not clean slate v5), wipe it clean immediately!
        if (!data.is_clean_slate_v5) {
          const cleanDoc = {
            is_clean_slate_v5: true,
            departments: [],
            employees: [],
            criteria: [],
            sections: DEFAULT_SECTIONS,
            deletedEmployeeNames: [],
            deletedDepartmentIds: [],
            deletedCriteriaIds: [],
            updatedAt: new Date().toISOString()
          };
          setDoc(docRef, cleanDoc, { merge: false }).catch(() => null);
          setDynamicDepartments([]);
          setDynamicEmployees([]);
          setDynamicCriteria([]);
          setDeletedEmployeeNames([]);
          setDeletedDepartmentIds([]);
          setDeletedCriteriaIds([]);
          saveStoredDepartments([]);
          saveStoredEmployees([]);
          saveStoredCriteria([]);
          saveStoredDeletedEmployees([]);
          saveStoredDeletedDepartments([]);
          saveStoredDeletedCriteria([]);
          setSelectedEmployeeName("");
          return;
        }

        // Clean-slate document verified: load custom user data
        if (Array.isArray(data.departments) && data.departments.length > 0) {
          setDynamicDepartments(data.departments);
          saveStoredDepartments(data.departments);
        } else if (!data.departments || data.departments.length === 0) {
          setDynamicDepartments(DEFAULT_DEPARTMENTS);
          saveStoredDepartments(DEFAULT_DEPARTMENTS);
        }

        if (Array.isArray(data.employees) && data.employees.length > 0) {
          setDynamicEmployees(data.employees);
          saveStoredEmployees(data.employees);
        } else if (!data.employees || data.employees.length === 0) {
          setDynamicEmployees(DEFAULT_EMPLOYEES);
          saveStoredEmployees(DEFAULT_EMPLOYEES);
        }
        if (Array.isArray(data.criteria)) {
          setDynamicCriteria(data.criteria);
          saveStoredCriteria(data.criteria);
        }
        if (Array.isArray(data.sections)) {
          const upgradedSecs = data.sections.map((s: DynamicSection) => {
            if (s.id === "kpi") {
              return {
                ...s,
                title: "Department KPI Evaluation",
                titleAr: "تقييم مؤشرات الأداء للقسم (KPIs)",
                description: "Department operational and performance metrics evaluation (Rate 1 to 5)."
              };
            }
            if (s.id === "competencies") {
              return {
                ...s,
                title: "Bank Core Competencies Evaluation",
                titleAr: "تقييم الكفاءات الجوهرية للمصرف",
                description: "Assessment of bank core competencies and institutional behaviors (Rate 1 to 5)."
              };
            }
            return s;
          });
          setDynamicSections(upgradedSecs);
          saveStoredSections(upgradedSecs);
        } else {
          setDynamicSections(DEFAULT_SECTIONS);
          saveStoredSections(DEFAULT_SECTIONS);
        }
        if (Array.isArray(data.deletedEmployeeNames)) {
          setDeletedEmployeeNames(data.deletedEmployeeNames);
          saveStoredDeletedEmployees(data.deletedEmployeeNames);
        }
        if (Array.isArray(data.deletedDepartmentIds)) {
          setDeletedDepartmentIds(data.deletedDepartmentIds);
          saveStoredDeletedDepartments(data.deletedDepartmentIds);
        }
        if (Array.isArray(data.deletedCriteriaIds)) {
          setDeletedCriteriaIds(data.deletedCriteriaIds);
          saveStoredDeletedCriteria(data.deletedCriteriaIds);
        }
      } else {
        // Initialize Firestore with clean empty state so all users start fresh
        setDoc(docRef, {
          is_clean_slate_v5: true,
          departments: [],
          employees: [],
          criteria: [],
          sections: DEFAULT_SECTIONS,
          deletedEmployeeNames: [],
          deletedDepartmentIds: [],
          deletedCriteriaIds: [],
          updatedAt: new Date().toISOString()
        }, { merge: false }).catch(() => null);

        setDynamicDepartments([]);
        setDynamicEmployees([]);
        setDynamicCriteria([]);
      }
    }, (err) => {
      console.warn("Firestore config_roster_and_criteria listener warning:", err);
    });

    return () => unsub();
  }, []);

  const handleSaveCriteria = async (newCriteria: DynamicCriterion[], deletedId?: string) => {
    let nextDeleted = deletedCriteriaIds;
    if (deletedId === "__RESET__") {
      nextDeleted = [];
      setDeletedCriteriaIds([]);
      saveStoredDeletedCriteria([]);
    } else if (deletedId) {
      nextDeleted = Array.from(new Set([...deletedCriteriaIds, deletedId]));
      setDeletedCriteriaIds(nextDeleted);
      saveStoredDeletedCriteria(nextDeleted);
    }
    setDynamicCriteria(newCriteria);
    saveStoredCriteria(newCriteria);

    try {
      await setDoc(doc(db, "annual_evaluations", "config_roster_and_criteria"), {
        is_clean_slate_v5: true,
        criteria: newCriteria,
        deletedCriteriaIds: nextDeleted,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Error syncing criteria to Firestore:", e);
    }
  };

  const handleSaveSections = async (newSections: DynamicSection[]) => {
    setDynamicSections(newSections);
    saveStoredSections(newSections);
    try {
      await setDoc(doc(db, "annual_evaluations", "config_roster_and_criteria"), {
        is_clean_slate_v5: true,
        sections: newSections,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Error syncing sections to Firestore:", e);
    }
  };

  const handleSaveDepartments = async (newDepts: DynamicDepartment[], deletedIdOrFlag?: string, deletedName?: string) => {
    let nextDeleted = deletedDepartmentIds;
    if (deletedIdOrFlag === "__RESET__") {
      nextDeleted = [];
      setDeletedDepartmentIds([]);
      saveStoredDeletedDepartments([]);
    } else if (deletedIdOrFlag) {
      const toAdd = [deletedIdOrFlag, deletedName].filter(Boolean) as string[];
      nextDeleted = Array.from(new Set([...deletedDepartmentIds, ...toAdd]));
      setDeletedDepartmentIds(nextDeleted);
      saveStoredDeletedDepartments(nextDeleted);
    }
    setDynamicDepartments(newDepts);
    saveStoredDepartments(newDepts);

    try {
      await setDoc(doc(db, "annual_evaluations", "config_roster_and_criteria"), {
        is_clean_slate_v5: true,
        departments: newDepts,
        deletedDepartmentIds: nextDeleted,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Error syncing departments to Firestore:", e);
    }
  };

  const handleSaveEmployees = async (newEmps: DynamicEmployee[], deletedName?: string, deletedId?: string) => {
    let nextDeleted = deletedEmployeeNames;
    if (deletedName === "__RESET__") {
      nextDeleted = [];
      setDeletedEmployeeNames([]);
      saveStoredDeletedEmployees([]);
    } else if (deletedName || deletedId) {
      const itemsToAdd = [
        deletedName ? normalizeAgentName(deletedName) : null,
        deletedName ? deletedName.trim() : null,
        deletedId ? deletedId.trim() : null
      ].filter(Boolean) as string[];

      nextDeleted = Array.from(new Set([...deletedEmployeeNames, ...itemsToAdd]));
      setDeletedEmployeeNames(nextDeleted);
      saveStoredDeletedEmployees(nextDeleted);
    }
    setDynamicEmployees(newEmps);
    saveStoredEmployees(newEmps);

    try {
      await setDoc(doc(db, "annual_evaluations", "config_roster_and_criteria"), {
        is_clean_slate_v5: true,
        employees: newEmps,
        deletedEmployeeNames: nextDeleted,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Error syncing employees to Firestore:", e);
    }
  };

  // User Profile: Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatusMsg(null);
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setProfileStatusMsg({
        type: 'error',
        text: isAr ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل." : "Password must be at least 6 characters."
      });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setProfileStatusMsg({
        type: 'error',
        text: isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match."
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const cleanEmail = (userProfile?.email || "").toLowerCase().trim();
      if (!cleanEmail) {
        setProfileStatusMsg({
          type: 'error',
          text: isAr ? "تعذر تحديد البريد الإلكتروني للمستخدم." : "Unable to identify user email."
        });
        setIsUpdatingPassword(false);
        return;
      }

      // SHA-256 hash
      const msgUint8 = new TextEncoder().encode(newPasswordInput + "_fib_salt_2026");
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const docId = "user_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
      await setDoc(doc(db, "users", docId), {
        email: cleanEmail,
        passwordHash,
        name: userProfile?.name || userProfile?.agent_name || cleanEmail.split("@")[0],
        role: roleLower || "agent",
        department: userProfile?.department || "",
        team: userProfile?.team || "",
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setProfileStatusMsg({
        type: 'success',
        text: isAr ? "تم تحديث كلمة المرور بنجاح!" : "Password successfully updated!"
      });
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      console.error("Password update error:", err);
      setProfileStatusMsg({
        type: 'error',
        text: isAr ? "حدث خطأ أثناء تحديث كلمة المرور." : "Failed to update password."
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // User Profile: Save photo to Firestore, local state and session
  const saveProfilePhoto = async (photoDataUrl: string) => {
    setIsUpdatingPhoto(true);
    setProfileStatusMsg(null);
    try {
      const cleanEmail = (userProfile?.email || emailLower || "").toLowerCase().trim();
      if (!cleanEmail) {
        setProfileStatusMsg({
          type: "error",
          text: isAr ? "تعذر تحديد البريد الإلكتروني للمستخدم." : "User email not found."
        });
        return;
      }

      const docId = "user_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
      await setDoc(doc(db, "users", docId), {
        photo_url: photoDataUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setCurrentUserPhoto(photoDataUrl);
      if (userProfile) {
        userProfile.photo_url = photoDataUrl;
      }

      if (typeof window !== "undefined") {
        const rawSession = localStorage.getItem("fib_eval_user_session");
        if (rawSession) {
          try {
            const parsed = JSON.parse(rawSession);
            parsed.photo_url = photoDataUrl;
            localStorage.setItem("fib_eval_user_session", JSON.stringify(parsed));
          } catch {}
        }
      }

      setProfileStatusMsg({
        type: "success",
        text: photoDataUrl 
          ? (isAr ? "تم تحديث الصورة الشخصية بنجاح!" : "Profile photo updated successfully!")
          : (isAr ? "تمت إزالة الصورة الشخصية بنجاح." : "Profile photo removed.")
      });
    } catch (err: any) {
      console.error("Error saving profile photo:", err);
      setProfileStatusMsg({
        type: "error",
        text: isAr ? "حدث خطأ أثناء حفظ الصورة." : "Failed to save profile photo."
      });
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileStatusMsg({
        type: "error",
        text: isAr ? "يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)" : "Please select an image file."
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
          const resizedDataUrl = canvas.toDataURL("image/webp", 0.85);
          await saveProfilePhoto(resizedDataUrl);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    await saveProfilePhoto("");
  };

  // Selected filter: Year (2026-2030) (Pure Annual Evaluation)
  const [selectedYear, setSelectedYear] = useState<string>(initialYear || "2026");

  useEffect(() => {
    if (initialYear && initialYear !== selectedYear) {
      setSelectedYear(initialYear);
    }
  }, [initialYear]);

  const [yearDropdownOpen, setYearDropdownOpen] = useState<boolean>(false);
  const selectedPeriod = "Annual" as const;

  // Selected Employee (Supports all employees across teams)
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>("");
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState<boolean>(false);
  const [teamTabFilter, setTeamTabFilter] = useState<string>("all");
  const tlAssignedTeam: "Younis" | "Ankido" | "Mohammed" | null = null;

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

  // Per-Criterion Notes & Justification System ("على شنو النوت")
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

  // Qualitative Feedback
  const [keyStrengths, setKeyStrengths] = useState<string>("");
  const [areasForDevelopment, setAreasForDevelopment] = useState<string>("");
  const [managerComments, setManagerComments] = useState<string>("");
  const [employeeComments, setEmployeeComments] = useState<string>("");

  // Status & Metadata
  const [evaluationStatus, setEvaluationStatus] = useState<"draft" | "self_submitted" | "manager_finalized">("draft");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Self check: Is the user viewing their own evaluation?
  const isViewingSelf = useMemo(() => {
    const myName = currentUserNameNorm;
    const targetName = normalizeAgentName(selectedEmployeeName || "");
    if (!myName || !targetName) return false;
    if (myName === targetName || myName.includes(targetName) || targetName.includes(myName)) return true;
    if ((emailLower.includes("mohammed.azad") || roleLower === "trainer") && targetName.includes("mohammed azad")) return true;
    if ((emailLower.includes("azad.muhammad") || emailLower.includes("azad.mohammed") || myName.includes("azad muhammad") || myName.includes("azad mohammed")) && (targetName.includes("azad muhammad") || targetName.includes("azad mohammed"))) return true;
    if (emailLower.includes("jihad") && targetName.includes("jihad")) return true;
    if (emailLower.includes("lara") && targetName.includes("lara")) return true;
    if (emailLower.includes("shireen") && targetName.includes("shireen")) return true;
    if (emailLower.includes("ankido") && targetName.includes("ankido")) return true;
    if (emailLower.includes("younis") && targetName.includes("younis")) return true;
    if (emailLower.includes("dlshad") && targetName.includes("dlshad")) return true;
    return false;
  }, [currentUserNameNorm, selectedEmployeeName, emailLower, roleLower]);

  // Current member role type
  const currentMemberRoleType: "trainer" | "qa" | "tl" | "backoffice" | "agent" | "manager" | "custom" = useMemo(() => {
    const norm = normalizeAgentName(selectedEmployeeName || "");
    const special = SPECIAL_STAFF_MEMBERS.find(s => normalizeAgentName(s.agent_name) === norm);
    if (special) return special.role_type;
    const dynamicEmp = dynamicEmployees.find(e => normalizeAgentName(e.name) === norm);
    if (dynamicEmp?.role_type) return dynamicEmp.role_type;
    return "agent";
  }, [selectedEmployeeName, dynamicEmployees]);

  // Real actual metrics fetched for the period to assist evaluation
  const [actualMetricsSummary, setActualMetricsSummary] = useState<any | null>(null);

  // Coverage Tracking State (Evaluation Status across all employees)
  const [allEvaluationsMap, setAllEvaluationsMap] = useState<Record<string, any>>({});
  const [showCoverageModal, setShowCoverageModal] = useState<boolean>(false);
  const [coverageFilterStatus, setCoverageFilterStatus] = useState<"pending" | "completed" | "all">("pending");
  const [coverageDepartmentFilter, setCoverageDepartmentFilter] = useState<string>("all");
  const [coverageSearchTerm, setCoverageSearchTerm] = useState<string>("");
  const [coverageCopiedToast, setCoverageCopiedToast] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent background body scroll when any modal is open across the dashboard
  useBodyScrollLock(Boolean(showCoverageModal || showBenchmarkGuideModal));

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

  // Internal loaded members list (initialized empty + live Firestore sync)
  const [internalMembers, setInternalMembers] = useState<any[]>([]);
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
        setInternalMembers(members.sort((a, b) => a.agent_name.localeCompare(b.agent_name)));
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

  // Master members list: Strictly from Dynamic Employees configured by the user
  const effectiveAllMembers = useMemo(() => {
    const deletedNormSet = new Set((deletedEmployeeNames || []).map(normalizeAgentName));
    const deletedRawSet = new Set((deletedEmployeeNames || []).map(s => s.toLowerCase().trim()));
    const map = new Map<string, any>();

    // Add Dynamic Employees from ManageStaffModal
    dynamicEmployees.forEach(de => {
      const k = normalizeAgentName(de.name);
      if (!deletedNormSet.has(k) && !deletedRawSet.has(de.id?.toLowerCase().trim()) && !deletedRawSet.has(de.name?.toLowerCase().trim())) {
        map.set(k, {
          id: de.id || `emp_${de.employee_id || de.name}`,
          agent_name: de.name,
          name: de.name,
          nameEn: de.nameEn || de.name,
          nameAr: de.nameAr || de.name,
          employee_id: de.employee_id || "",
          email: de.email || "",
          department: de.department || "",
          departmentEn: de.departmentEn || de.department,
          departmentAr: de.departmentAr || de.department,
          role: de.role || "Staff",
          roleEn: de.roleEn || de.role,
          roleAr: de.roleAr || de.role,
          role_type: de.role_type || "agent",
          team: de.team || (de.department ? `${de.department} Team` : "General Team"),
          direct_manager: de.direct_manager || "",
          direct_manager_en: de.direct_manager_en || de.direct_manager || "",
          direct_manager_ar: de.direct_manager_ar || de.direct_manager || "",
          manager_email: de.manager_email || "",
          department_chief: de.department_chief || "",
          department_chief_en: de.department_chief_en || de.department_chief || "",
          department_chief_ar: de.department_chief_ar || de.department_chief || "",
          chief_email: de.chief_email || "",
          custom_position: de.custom_position || "",
          is_active: true,
          is_deleted: false,
        });
      }
    });

    return Array.from(map.values())
      .filter(m => m.is_deleted !== true && m.is_active !== false)
      .sort((a, b) => (a.agent_name || "").localeCompare(b.agent_name || ""));
  }, [dynamicEmployees, deletedEmployeeNames]);

  // Department Chief & Department Manager detection based on email, name, and role
  const userChiefDepts = useMemo(() => {
    return dynamicDepartments.filter(d => {
      const chEmail = (d.chief_email || "").toLowerCase().trim();
      const chNameNorm = normalizeAgentName(d.department_chief || "");
      const chNameEn = normalizeAgentName(d.department_chief_en || "");
      const chNameAr = normalizeAgentName(d.department_chief_ar || "");

      if (chEmail && chEmail === emailLower) return true;
      if (emailLower && (emailLower === 'ali.al-ameli@fib.iq' || isEmailMatchName(emailLower, d.department_chief || ""))) return true;
      if (chNameNorm && (chNameNorm === currentUserNameNorm || isNameTokenMatch(chNameNorm, currentUserNameNorm) || isNameTokenMatch(chNameNorm, nameLower))) return true;
      if (chNameEn && (chNameEn === currentUserNameNorm || isNameTokenMatch(chNameEn, currentUserNameNorm) || isNameTokenMatch(chNameEn, nameLower))) return true;
      if (chNameAr && (chNameAr === currentUserNameNorm || isNameTokenMatch(chNameAr, currentUserNameNorm) || isNameTokenMatch(chNameAr, nameLower))) return true;

      if (roleLower === 'chief' && userProfile?.department && (d.name === userProfile.department || d.nameAr === userProfile.department)) return true;
      return false;
    });
  }, [dynamicDepartments, emailLower, currentUserNameNorm, nameLower, roleLower, userProfile?.department]);

  const isDeptChief = userChiefDepts.length > 0 || roleLower === 'chief' || emailLower === 'ali.al-ameli@fib.iq';

  const userManagedDepts = useMemo(() => {
    return dynamicDepartments.filter(d => {
      const mgrEmail = (d.manager_email || "").toLowerCase().trim();
      const mgrNameNorm = normalizeAgentName(d.direct_manager || "");
      const mgrNameEn = normalizeAgentName(d.direct_manager_en || "");
      const mgrNameAr = normalizeAgentName(d.direct_manager_ar || "");

      if (mgrEmail && mgrEmail === emailLower) return true;
      if (emailLower && (emailLower === 'jalal.burghol@fib.iq' || emailLower === 'jalal.burghol@agent.com') && (d.name.includes("Contact") || d.nameAr?.includes("الاتصال"))) return true;
      if (emailLower && isEmailMatchName(emailLower, d.direct_manager || "")) return true;
      if (mgrNameNorm && (mgrNameNorm === currentUserNameNorm || isNameTokenMatch(mgrNameNorm, currentUserNameNorm) || isNameTokenMatch(mgrNameNorm, nameLower))) return true;
      if (mgrNameEn && (mgrNameEn === currentUserNameNorm || isNameTokenMatch(mgrNameEn, currentUserNameNorm) || isNameTokenMatch(mgrNameEn, nameLower))) return true;
      if (mgrNameAr && (mgrNameAr === currentUserNameNorm || isNameTokenMatch(mgrNameAr, currentUserNameNorm) || isNameTokenMatch(mgrNameAr, nameLower))) return true;

      if ((roleLower === 'manager' || userProfile?.role === 'manager') && userProfile?.department && (d.name === userProfile.department || d.nameAr === userProfile.department)) return true;
      return false;
    });
  }, [dynamicDepartments, emailLower, currentUserNameNorm, nameLower, roleLower, userProfile?.department, userProfile?.role]);

  const isDeptManager = userManagedDepts.length > 0 || (userProfile?.role === 'manager' && !isAdmin) || (roleLower === 'manager' && !isAdmin);

  // Detect direct subordinates under the current user (Multi-level evaluation hierarchy)
  const mySubordinates = useMemo(() => {
    if (!currentUserNameNorm && !emailLower) return [];

    const managedDeptNames = new Set(userManagedDepts.flatMap(d => [
      (d.name || "").toLowerCase().trim(),
      (d.nameAr || "").toLowerCase().trim()
    ].filter(Boolean)));

    return effectiveAllMembers.filter(m => {
      const mNameNorm = normalizeAgentName(m.agent_name || m.name || "");
      const mNameEn = normalizeAgentName(m.nameEn || "");
      const mNameAr = normalizeAgentName(m.nameAr || "");
      
      // Exclude myself from my subordinates
      if (currentUserNameNorm && (
        mNameNorm === currentUserNameNorm || 
        mNameEn === currentUserNameNorm || 
        mNameAr === currentUserNameNorm ||
        isNameTokenMatch(mNameNorm, currentUserNameNorm) ||
        isNameTokenMatch(mNameEn, currentUserNameNorm) ||
        isNameTokenMatch(mNameAr, currentUserNameNorm)
      )) return false;
      if (nameLower && (
        isNameTokenMatch(mNameNorm, nameLower) ||
        isNameTokenMatch(mNameEn, nameLower) ||
        isNameTokenMatch(mNameAr, nameLower)
      )) return false;
      if (emailLower && m.email && m.email.toLowerCase().trim() === emailLower) return false;

      // 1. If current user manages this department, ALL non-chief department members are their subordinates
      const mDept = (m.department || "").toLowerCase().trim();
      const mDeptAr = (m.departmentAr || "").toLowerCase().trim();
      if (managedDeptNames.size > 0 && (managedDeptNames.has(mDept) || managedDeptNames.has(mDeptAr))) {
        if (m.role_type === "chief" || /chief|هيد/i.test(m.role || "")) return false;
        return true;
      }

      // 2. Direct match by manager email
      if (m.manager_email && emailLower && m.manager_email.toLowerCase().trim() === emailLower) {
        return true;
      }

      // 3. Match by direct_manager, direct_manager_en, direct_manager_ar, or manager_name
      const dm = m.direct_manager || "";
      const dmEn = m.direct_manager_en || "";
      const dmAr = m.direct_manager_ar || "";
      const mgr = m.manager_name || "";

      if (emailLower && (isEmailMatchName(emailLower, dm) || isEmailMatchName(emailLower, dmEn))) return true;

      if (currentUserNameNorm) {
        if (dm && (dm === currentUserNameNorm || isNameTokenMatch(dm, currentUserNameNorm))) return true;
        if (dmEn && (dmEn === currentUserNameNorm || isNameTokenMatch(dmEn, currentUserNameNorm))) return true;
        if (dmAr && (dmAr === currentUserNameNorm || isNameTokenMatch(dmAr, currentUserNameNorm))) return true;
        if (mgr && (mgr === currentUserNameNorm || isNameTokenMatch(mgr, currentUserNameNorm))) return true;
      }

      if (nameLower) {
        if (dm && isNameTokenMatch(dm, nameLower)) return true;
        if (dmEn && isNameTokenMatch(dmEn, nameLower)) return true;
        if (dmAr && isNameTokenMatch(dmAr, nameLower)) return true;
        if (mgr && isNameTokenMatch(mgr, nameLower)) return true;
      }

      // 4. Special Contact Center TL matching
      const mTeam = (m.team || "").toLowerCase();
      if (isTL || isManager || roleLower === 'tl' || (userProfile?.team && userProfile.team.toLowerCase().includes(mTeam))) {
        if (currentUserNameNorm.includes("younis") && mTeam.includes("younis")) return true;
        if (currentUserNameNorm.includes("ankido") && mTeam.includes("ankido")) return true;
        if ((currentUserNameNorm.includes("mohammed") || currentUserNameNorm.includes("dlshad")) && (mTeam.includes("mohammed") || mTeam.includes("dlshad"))) {
          if (mNameNorm.includes("dlshad")) return false;
          return true;
        }
      }

      return false;
    });
  }, [effectiveAllMembers, currentUserNameNorm, nameLower, emailLower, userManagedDepts, isTL, isManager, roleLower, userProfile?.team]);

  const hasSubordinates = mySubordinates.length > 0;
  const isDirectManager = hasSubordinates || isManager || isDeptManager || isAdmin;

  // Check if current user is viewing one of their own direct subordinates
  // "الهيد يشوف درجات المنجر و القسم و المنجر يشوف درجات تيم مالة"
  const isViewingSubordinate = useMemo(() => {
    if (isAdmin) return true;
    const targetNorm = normalizeAgentName(selectedEmployeeName || "");
    const targetMember = effectiveAllMembers.find(m => normalizeAgentName(m.agent_name || m.name || "") === targetNorm);
    const mDept = (targetMember?.department || "").toLowerCase().trim();
    const mDeptAr = (targetMember?.departmentAr || "").toLowerCase().trim();

    // Department Chief sees all members in their department ("الهيد يشوف درجات المنجر و القسم")
    if (isDeptChief && userChiefDepts.some(d => {
      const dName = (d.name || "").toLowerCase().trim();
      const dAr = (d.nameAr || "").toLowerCase().trim();
      return (dName && (dName === mDept || dName === mDeptAr)) || (dAr && (dAr === mDept || dAr === mDeptAr));
    })) {
      return true;
    }

    // Department Manager sees members in their department ("المنجر يشوف مال تيم مالة و بس يشوف القسم ماله")
    if (isDeptManager && userManagedDepts.some(d => {
      const dName = (d.name || "").toLowerCase().trim();
      const dAr = (d.nameAr || "").toLowerCase().trim();
      return (dName && (dName === mDept || dName === mDeptAr)) || (dAr && (dAr === mDept || dAr === mDeptAr));
    })) {
      return true;
    }

    return mySubordinates.some(s => {
      const sNorm = normalizeAgentName(s.agent_name || s.name || "");
      return sNorm === targetNorm || sNorm.includes(targetNorm) || targetNorm.includes(sNorm);
    });
  }, [isAdmin, selectedEmployeeName, effectiveAllMembers, isDeptChief, userChiefDepts, isDeptManager, userManagedDepts, mySubordinates]);

  // Check if current user is the evaluator / manager for the selected member
  const isManagerEvaluatorForSelected = useMemo(() => {
    if (isAdmin) return true;
    if (isViewingSelf) return false;
    const targetNorm = normalizeAgentName(selectedEmployeeName || "");
    const targetMember = effectiveAllMembers.find(m => normalizeAgentName(m.agent_name || m.name || "") === targetNorm);
    if (!targetMember) return false;
    const mDept = (targetMember.department || "").toLowerCase().trim();
    const mDeptAr = (targetMember.departmentAr || "").toLowerCase().trim();

    // 1. Department Chief evaluates the Department Manager
    if (isDeptChief && userChiefDepts.some(d => {
      const dName = (d.name || "").toLowerCase().trim();
      const dAr = (d.nameAr || "").toLowerCase().trim();
      return (dName && (dName === mDept || dName === mDeptAr)) || (dAr && (dAr === mDept || dAr === mDeptAr));
    })) {
      const isTargetLeader = targetMember.role_type === "tl" || /manager|leader|مدير|قائد/i.test(targetMember.role || "");
      if (isTargetLeader) return true;
    }

    // 2. Department Manager evaluates staff in their department (cannot edit the Chief)
    if (isDeptManager && userManagedDepts.some(d => {
      const dName = (d.name || "").toLowerCase().trim();
      const dAr = (d.nameAr || "").toLowerCase().trim();
      return (dName && (dName === mDept || dName === mDeptAr)) || (dAr && (dAr === mDept || dAr === mDeptAr));
    })) {
      const isTargetChief = userChiefDepts.some(d => normalizeAgentName(d.department_chief || "") === targetNorm || (d.chief_email && d.chief_email.toLowerCase() === (targetMember.email || "").toLowerCase()));
      if (!isTargetChief) return true;
    }

    // 3. Direct subordinate match
    return mySubordinates.some(s => normalizeAgentName(s.agent_name || s.name || "") === targetNorm);
  }, [isAdmin, isViewingSelf, selectedEmployeeName, effectiveAllMembers, isDeptChief, userChiefDepts, isDeptManager, userManagedDepts, mySubordinates]);

  // Permissions & Role Access:
  // - Viewing self: can edit self-evaluation (unless finalized). CANNOT edit manager score unless Admin.
  // - Viewing subordinate: Direct Manager or Admin CAN edit manager evaluation and finalize it!
  // - Read-only: when not allowed to edit self or manager.
  const canEditSelf = isViewingSelf && evaluationStatus !== 'manager_finalized';
  const canEditManager = (isAdmin && !isViewingSelf) || (isManagerEvaluatorForSelected && !isViewingSelf) || (isAdmin && isViewingSelf);
  const isReadOnly = !canEditSelf && !canEditManager;
  const canApplySuggestions = canEditManager && currentMemberRoleType === "agent";
  const canEditEmployeeFeedback = (isAdmin || canEditManager || canEditSelf);

  // Single user self view only when the user has NO subordinates, is not Chief, and is not Manager
  const isSingleSelfViewOnly = !isAdmin && !isDeptChief && !isDeptManager && !hasSubordinates;

  // Manager data visibility:
  // Subordinates only see manager ratings AFTER manager finalizes
  // Chief & Managers and Admins see manager data immediately
  const isManagerDataVisible = isAdmin || isDeptChief || isDeptManager || isViewingSubordinate || evaluationStatus === 'manager_finalized';

  // Canonical Department Name Helper
  const getCanonicalDept = (rawDept: string): string => {
    const l = (rawDept || "").toLowerCase().trim();
    if (l.includes("quality") || l.includes("qa")) return "Quality Assurance";
    if (l.includes("train")) return "Training & Development";
    if (l.includes("back") || l.includes("office")) return "Back Office Operations";
    if (l.includes("contact") || l.includes("call")) return "Contact Center";
    if (l.includes("it") || l.includes("digital")) return "IT & Digital Services";
    if (l.includes("human") || l.includes("hr")) return "Human Resources";
    if (l.includes("finan")) return "Finance & Accounts";
    return rawDept || "Contact Center";
  };

  // Team counts for the 4 tabs (Younis, Ankido, Mohammed, QA & Training)
  const teamCounts = useMemo(() => {
    const activeMembers = effectiveAllMembers.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear)));
    return {
      Younis: activeMembers.filter(m => (m.team || "").toLowerCase().includes("younis")).length,
      Ankido: activeMembers.filter(m => (m.team || "").toLowerCase().includes("ankido")).length,
      Mohammed: activeMembers.filter(m => (m.team || "").toLowerCase().includes("mohammed") || (m.team || "").toLowerCase().includes("dlshad")).length,
      QA_Training: activeMembers.filter(m => (m.team || "").toLowerCase().includes("quality") || (m.team || "").toLowerCase().includes("training") || (m.team || "").toLowerCase().includes("back office") || m.role_type === "trainer" || m.role_type === "qa" || m.role_type === "backoffice").length,
    };
  }, [effectiveAllMembers, selectedYear]);

  // Hierarchy-scoped member visibility:
  // - Admin: see everyone across the entire organization
  // - Department Chief: sees Department Manager and all members in their department ("الهيد يشوف درجات المنجر و القسم")
  // - Department Manager: strictly sees only themselves and their department team members ("المنجر يشوف و يعدل مال تيم مالة و بس يشوف القسم ماله ويعدل بيه")
  // - Regular Employee / Staff: strictly see only themselves
  const allowedMembersForUser = useMemo(() => {
    if (isAdmin) {
      return effectiveAllMembers;
    }

    // 1. Department Chief: see all members of their overseen department(s) ("الهيد يشوف درجات المنجر و القسم")
    if (isDeptChief && userChiefDepts.length > 0) {
      const chiefDeptNames = new Set(userChiefDepts.flatMap(d => [
        (d.name || "").toLowerCase().trim(),
        (d.nameAr || "").toLowerCase().trim()
      ].filter(Boolean)));

      const chiefDeptMembers = effectiveAllMembers.filter(m => 
        chiefDeptNames.has((m.department || "").toLowerCase().trim()) ||
        chiefDeptNames.has((m.departmentAr || "").toLowerCase().trim())
      );
      if (chiefDeptMembers.length > 0) {
        return chiefDeptMembers;
      }
    }

    // 2. Department Manager: strictly scoped to their department members only! ("و بس يشوف القسم ماله ويعدل بيه")
    if (isDeptManager && (userManagedDepts.length > 0 || mySubordinates.length > 0)) {
      const mgrDeptNames = new Set(userManagedDepts.flatMap(d => [
        (d.name || "").toLowerCase().trim(),
        (d.nameAr || "").toLowerCase().trim()
      ].filter(Boolean)));

      const deptMembers = effectiveAllMembers.filter(m => 
        mgrDeptNames.has((m.department || "").toLowerCase().trim()) ||
        mgrDeptNames.has((m.departmentAr || "").toLowerCase().trim())
      );
      if (deptMembers.length > 0) {
        return deptMembers;
      }
      if (mySubordinates.length > 0) {
        return mySubordinates;
      }
    }

    const myself = effectiveAllMembers.find(m => {
      const mNorm = normalizeAgentName(m.agent_name || m.name || "");
      if (mNorm === currentUserNameNorm) return true;
      if (currentUserNameNorm && (mNorm.includes(currentUserNameNorm) || currentUserNameNorm.includes(mNorm))) return true;
      return false;
    });

    if (hasSubordinates) {
      const list: any[] = [];
      if (myself) list.push(myself);
      mySubordinates.forEach(s => {
        const sNorm = normalizeAgentName(s.agent_name || s.name || "");
        if (!list.some(item => normalizeAgentName(item.agent_name || item.name || "") === sNorm)) {
          list.push(s);
        }
      });
      return list;
    }

    if (myself) return [myself];

    return effectiveAllMembers.slice(0, 1);
  }, [isAdmin, isDeptChief, userChiefDepts, isDeptManager, userManagedDepts, hasSubordinates, effectiveAllMembers, currentUserNameNorm, mySubordinates]);

  // Filtered members list: Younis Kamal, Ankido Buya, Mohammed Dlshad, or QA & Training
  const filteredMembers = useMemo(() => {
    let list = allowedMembersForUser.filter(m => 
      isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))
    );

    // Search Term Filter: When searching, search across visible active agents & staff
    if (employeeSearchTerm.trim()) {
      const term = normalizeAgentName(employeeSearchTerm);
      return list.filter(m => 
        normalizeAgentName(m.agent_name || m.name || "").includes(term) ||
        normalizeAgentName(m.nameEn || "").includes(term) ||
        normalizeAgentName(m.nameAr || "").includes(term) ||
        (m.employee_id || "").includes(term) ||
        (m.team || "").toLowerCase().includes(term) ||
        (m.department || "").toLowerCase().includes(term) ||
        (m.departmentAr || "").toLowerCase().includes(term) ||
        (m.role || "").toLowerCase().includes(term) ||
        (m.roleAr || "").toLowerCase().includes(term) ||
        (m.custom_position || "").toLowerCase().includes(term)
      ).sort((a, b) => {
        const nameA = isAr ? (a.nameAr || a.name || "") : (a.nameEn || a.name || "");
        const nameB = isAr ? (b.nameAr || b.name || "") : (b.nameEn || b.name || "");
        return nameA.localeCompare(nameB, isAr ? "ar" : "en");
      });
    }

    // Only apply team / department filter for Admin (since Admin sees all teams)
    if (isAdmin && teamTabFilter !== "all") {
      if (teamTabFilter.startsWith("team_")) {
        const targetTeam = teamTabFilter.replace("team_", "").toLowerCase();
        list = list.filter(m => (m.team || "").trim().toLowerCase() === targetTeam);
      } else if (teamTabFilter.startsWith("dept_")) {
        const targetDept = teamTabFilter.replace("dept_", "").toLowerCase();
        list = list.filter(m => (m.department || "").trim().toLowerCase() === targetDept || getCanonicalDept(m.department || "").toLowerCase() === targetDept);
      } else {
        list = list.filter(m => (m.team || "").toLowerCase().includes(teamTabFilter.toLowerCase()));
      }
    }

    return list.sort((a, b) => {
      // Put oneself at top if present
      const aNorm = normalizeAgentName(a.agent_name || a.name || "");
      const bNorm = normalizeAgentName(b.agent_name || b.name || "");
      if (aNorm === currentUserNameNorm) return -1;
      if (bNorm === currentUserNameNorm) return 1;
      if (a.role_type === "tl" && b.role_type !== "tl") return -1;
      if (b.role_type === "tl" && a.role_type !== "tl") return 1;
      const nameA = isAr ? (a.nameAr || a.name || "") : (a.nameEn || a.name || "");
      const nameB = isAr ? (b.nameAr || b.name || "") : (b.nameEn || b.name || "");
      return nameA.localeCompare(nameB, isAr ? "ar" : "en");
    });
  }, [allowedMembersForUser, employeeSearchTerm, teamTabFilter, isAdmin, selectedYear, currentUserNameNorm, isAr]);

  // Current selected member object
  const currentMember = useMemo(() => {
    if (!selectedEmployeeName) return null;
    const targetNorm = normalizeAgentName(selectedEmployeeName);
    return effectiveAllMembers.find(m => 
      normalizeAgentName(m.agent_name || m.name || "") === targetNorm ||
      normalizeAgentName(m.nameEn || "") === targetNorm ||
      normalizeAgentName(m.nameAr || "") === targetNorm ||
      m.id === selectedEmployeeName
    ) || null;
  }, [effectiveAllMembers, selectedEmployeeName]);

  // Direct Manager & Department Chief for current member
  const currentMemberDirectManager = useMemo(() => {
    if (currentMember?.direct_manager) return currentMember.direct_manager;
    const matchedDept = dynamicDepartments.find(d => d.name === currentMember?.department);
    const isMgr = currentMember?.role_type === "tl" || /leader|manager|head|chief|director|supervisor|lead|مدير|قائد|رئيس|مشرف/i.test(currentMember?.role || "");
    if (isMgr) {
      if (matchedDept?.department_chief) return matchedDept.department_chief;
    } else {
      if (matchedDept?.direct_manager && matchedDept.direct_manager.toLowerCase() !== "team leaders") {
        return matchedDept.direct_manager;
      }
    }
    if (currentMember?.manager_name) return currentMember.manager_name;
    if (teamLeader) return teamLeader;
    if (currentMember?.team) return resolveTeamLeader(currentMember.team);
    return matchedDept?.department_chief || "Omer Ayad";
  }, [currentMember, dynamicDepartments, teamLeader]);

  const currentMemberDeptChief = useMemo(() => {
    if (currentMember?.department_chief) return currentMember.department_chief;
    const matchedDept = dynamicDepartments.find(d => d.name === currentMember?.department);
    if (matchedDept?.department_chief) return matchedDept.department_chief;
    return "Omer Ayad";
  }, [currentMember, dynamicDepartments]);

  // Detect if current employee is Chat
  const isSelectedEmployeeChat = useMemo(() => {
    const t = (currentMember?.team || "").toLowerCase();
    return t.includes("mohammed") || t.includes("dlshad");
  }, [currentMember]);

  // Open Benchmark Guide modal with auto-selected tab based on employee
  const openBenchmarkGuide = () => {
    setBenchmarkGuideTab(isSelectedEmployeeChat ? "chat" : "calls");
    setShowBenchmarkGuideModal(true);
  };

  // Coverage Tracking Computation (Who's evaluated and who's pending)
  const coverageData = useMemo(() => {
    let activeMembers = (isAdmin ? effectiveAllMembers : allowedMembersForUser).filter(m => 
      isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))
    );

    if (isAdmin && tlAssignedTeam) {
      if (tlAssignedTeam === "Ankido") {
        activeMembers = activeMembers.filter(m => (m.team || "").toLowerCase().includes("ankido"));
      } else if (tlAssignedTeam === "Mohammed") {
        activeMembers = activeMembers.filter(m => (m.team || "").toLowerCase().includes("mohammed") || (m.team || "").toLowerCase().includes("dlshad"));
      } else {
        activeMembers = activeMembers.filter(m => (m.team || "").toLowerCase().includes("younis"));
      }
    }

    let annualCompletedCount = 0;
    let annualPendingCount = 0;

    const list = activeMembers.map(member => {
      const rawName = (member.agent_name || member.name || "").trim();
      const clean = rawName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const norm = normalizeAgentName(rawName);
      const normClean = norm.replace(/[^a-z0-9]/g, '_');
      const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[member.id] || member.id || "";

      const findEval = () => {
        const direct1 = allEvaluationsMap[`${selectedYear}_Annual_${clean}`];
        if (direct1) return direct1;
        const direct2 = allEvaluationsMap[`${selectedYear}_Annual_${normClean}`];
        if (direct2) return direct2;

        const periodPrefix = `${selectedYear}_Annual_`;
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

      const annualDoc = findEval();

      const annualCompleted = Boolean(
        annualDoc && (
          annualDoc.status === 'manager_finalized' || 
          (typeof annualDoc.manager_overall_score === 'number' && annualDoc.manager_overall_score > 0)
        )
      );
      const annualScore = annualDoc ? (annualDoc.manager_overall_score ?? annualDoc.self_overall_score ?? null) : null;

      if (annualCompleted) annualCompletedCount++;
      else annualPendingCount++;

      const team = member.team || "Contact Center";
      const isChat = team.toLowerCase().includes('mohammed') || team.toLowerCase().includes('dlshad');
      const dept = member.department || (
        member.role_type === "trainer" ? "Training & Development" :
        member.role_type === "qa" ? "Quality Assurance" :
        member.role_type === "backoffice" ? "Back Office Operations" :
        "Contact Center"
      );

      return {
        member,
        name: rawName,
        knownId,
        team,
        department: dept,
        isChat,
        isCompleted: annualCompleted,
        status: annualDoc?.status || (annualCompleted ? 'manager_finalized' : 'pending'),
        score: annualScore,
        doc: annualDoc
      };
    });

    return {
      membersList: list,
      totalCount: activeMembers.length,
      completedCount: annualCompletedCount,
      pendingCount: annualPendingCount,
      percent: activeMembers.length > 0 ? Math.round((annualCompletedCount / activeMembers.length) * 100) : 0
    };
  }, [effectiveAllMembers, allEvaluationsMap, selectedYear, tlAssignedTeam]);

  // Department options with member counts for the Coverage Modal dropdown
  const departmentOptions = useMemo(() => {
    const map = new Map<string, number>();

    coverageData.membersList.forEach(item => {
      const canonical = getCanonicalDept(item.department || item.member?.department || "");
      map.set(canonical, (map.get(canonical) || 0) + 1);
    });

    dynamicDepartments.forEach(d => {
      if (d.name) {
        const canonical = getCanonicalDept(d.name);
        if (!map.has(canonical)) {
          map.set(canonical, 0);
        }
      }
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [coverageData.membersList, dynamicDepartments]);

  // Scope Filter Options for the Employee Selector Dropdown (Departments + Teams)
  const scopeFilterOptions = useMemo(() => {
    const activeMembers = allowedMembersForUser.filter(m => isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear)));

    const deptCounts = new Map<string, number>();
    activeMembers.forEach(m => {
      const cDept = getCanonicalDept(m.department || "");
      deptCounts.set(cDept, (deptCounts.get(cDept) || 0) + 1);
    });

    dynamicDepartments.forEach(d => {
      if (d.name) {
        const cDept = getCanonicalDept(d.name);
        if (!deptCounts.has(cDept)) deptCounts.set(cDept, 0);
      }
    });

    const opts: any[] = [
      {
        value: "all",
        label: isAr ? `كافة الموظفين والأقسام (${activeMembers.length})` : `All Staff & Departments (${activeMembers.length})`,
        icon: Users,
      },
    ];

    // Departments
    departmentOptions.forEach(dept => {
      const count = deptCounts.get(dept.name) ?? dept.count;
      const deptDisplayName = isAr ? getLocalizedDeptName(dept.name, true) : dept.name;
      const deptObj = dynamicDepartments.find(d => d.name === dept.name);
      opts.push({
        value: `dept_${dept.name}`,
        label: `${deptDisplayName} (${count})`,
        icon: getDepartmentIcon(deptObj?.icon),
      });
    });

    // Teams dynamically discovered from active members
    const teamCountsMap = new Map<string, number>();
    activeMembers.forEach(m => {
      const t = (m.team || "").trim();
      if (t) {
        teamCountsMap.set(t, (teamCountsMap.get(t) || 0) + 1);
      }
    });

    Array.from(teamCountsMap.entries()).forEach(([teamName, count]) => {
      opts.push({
        value: `team_${teamName}`,
        label: `${teamName} (${count})`,
        icon: Users,
      });
    });

    return opts;
  }, [allowedMembersForUser, selectedYear, dynamicDepartments, departmentOptions, isAr]);

  // Filtered members list for Coverage Modal
  const filteredCoverageList = useMemo(() => {
    return coverageData.membersList.filter(item => {
      // 1. Department filter
      if (coverageDepartmentFilter !== "all") {
        const itemCanonical = getCanonicalDept(item.department || item.member?.department || "");
        if (itemCanonical !== coverageDepartmentFilter) return false;
      }

      // 2. Search query filter
      if (coverageSearchTerm.trim()) {
        const q = coverageSearchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = String(item.knownId).toLowerCase().includes(q);
        const matchesDept = (item.department || "").toLowerCase().includes(q);
        const matchesTeam = (item.team || "").toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept && !matchesTeam) return false;
      }

      // 3. Status filter
      if (coverageFilterStatus === "pending") {
        return !item.isCompleted;
      }

      if (coverageFilterStatus === "completed") {
        return item.isCompleted;
      }

      return true;
    });
  }, [coverageData, coverageFilterStatus, coverageDepartmentFilter, coverageSearchTerm]);

  // Copy pending list to clipboard
  const handleCopyPendingList = () => {
    const pendingItems = coverageData.membersList.filter(item => !item.isCompleted);

    const lines = pendingItems.map((item, idx) => {
      return `${idx + 1}. ${toTitleCase(item.name)} (${item.knownId ? `ID: ${item.knownId}, ` : ''}${item.team.replace(' Team', '')}) -> Pending Annual Evaluation`;
    });

    const textToCopy = `📋 Pending Evaluations List (${selectedYear}):\n` + lines.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCoverageCopiedToast(true);
    setTimeout(() => setCoverageCopiedToast(false), 2500);
  };

  const handleSelectForEvaluation = (memberName: string) => {
    setSelectedEmployeeName(memberName);
    setShowCoverageModal(false);
  };

  // Initialize selected employee on load
  useEffect(() => {
    // 1. Regular Agent / Staff with NO subordinates: strictly lock to their own self profile
    if (!isAdmin && !hasSubordinates && !isDeptManager && !isDeptChief) {
      const myName = toTitleCase(userProfile?.name || userProfile?.agent_name || "");
      if (myName && selectedEmployeeName !== myName) {
        setSelectedEmployeeName(myName);
      }
      return;
    }

    // 2. Direct Manager / TL / Chief with subordinates or managed department: default to themselves first, or first subordinate
    if (!isAdmin && (hasSubordinates || isDeptManager || isDeptChief)) {
      if (!selectedEmployeeName) {
        const myName = toTitleCase(userProfile?.name || userProfile?.agent_name || "");
        if (myName && allowedMembersForUser.some(m => normalizeAgentName(m.agent_name || m.name) === normalizeAgentName(myName))) {
          setSelectedEmployeeName(myName);
        } else if (allowedMembersForUser.length > 0) {
          setSelectedEmployeeName(allowedMembersForUser[0].agent_name);
        }
      }
      return;
    }

    // 3. Admin / Top Manager: default to first member if available
    if (isAdmin && !selectedEmployeeName && effectiveAllMembers.length > 0) {
      setSelectedEmployeeName(effectiveAllMembers[0].agent_name);
      setTeamTabFilter("all");
    }
  }, [isAdmin, hasSubordinates, isDeptManager, isDeptChief, allowedMembersForUser, userProfile, effectiveAllMembers, selectedEmployeeName]);

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
      setTeamTabFilter("all");
    }
  }, [selectedEmployeeName]);

  // Document ID in Firestore: `${year}_${period}_${cleanSlug}`
  const docId = useMemo(() => {
    if (!selectedEmployeeName) return "";
    const cleanName = selectedEmployeeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${selectedYear}_Annual_${cleanName}`;
  }, [selectedYear, selectedEmployeeName]);

  // Load existing evaluation data from Firestore
  useEffect(() => {
    if (!docId) return;

    let isMounted = true;
    const unsub = onSnapshot(doc(db, "annual_evaluations", docId), (docSnap) => {
      if (!isMounted) return;
      const norm = normalizeAgentName(currentMember?.agent_name || selectedEmployeeName || "");
      const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[currentMember?.id] || "";

      if (docSnap.exists()) {
        const data = docSnap.data();
        setEvaluationDate(data.evaluation_date || "");
        setEmployeeId(data.employee_id || knownId || "");
        setTeamLeader(data.team_leader || resolveTeamLeader(currentMember?.team));
        setSelfKpis(data.self_kpis || {});
        setManagerKpis(data.manager_kpis || {});
        setSelfCompetencies(data.self_competencies || {});
        setManagerCompetencies(data.manager_competencies || {});
        setCriterionNotes(data.criterion_notes || {});
        setKeyStrengths(data.manager_strengths || "");
        setAreasForDevelopment(data.manager_improvements || "");
        setManagerComments(data.manager_comments || "");
        setEmployeeComments(data.self_comments || "");
        setEvaluationStatus(data.status || "draft");
        setLastSavedAt(data.updated_at || "");
      } else {
        const baselineData = BASELINE_ANNUAL_EVALUATIONS[docId] || 
          Object.values(BASELINE_ANNUAL_EVALUATIONS).find(b => 
            String(b.year) === String(selectedYear) && 
            b.period === "Annual" && 
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
          setCriterionNotes(baselineData.criterion_notes || {});
          setKeyStrengths(baselineData.manager_strengths || "");
          setAreasForDevelopment(baselineData.manager_improvements || "");
          setManagerComments(baselineData.manager_comments || "");
          setEmployeeComments(baselineData.self_comments || "");
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
          setCriterionNotes({});
          setKeyStrengths("");
          setAreasForDevelopment("");
          setManagerComments("");
          setEmployeeComments("");
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
  // Annual evaluation is computed across the full year (Jan-Dec)
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
          if (avgProd !== null) {
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
            productivity: avgProd !== null ? (isChat ? avgProd.toFixed(2) : `${avgProd.toFixed(1)}%`) : null,
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
  }, [selectedEmployeeName, selectedYear, currentMember?.team]);

  // Operational KPIs dynamic definitions: Strictly from Dynamic Criteria configured by user (filtered by department)
  const kpiDefinitions: KpiItemDefinition[] = useMemo(() => {
    const deletedCritSet = new Set(deletedCriteriaIds || []);
    const memberDept = (currentMember?.department || currentMember?.team || "").toLowerCase().trim();

    const items = dynamicCriteria.filter(c => {
      if (deletedCritSet.has(c.id)) return false;
      const isKpiSec = (c.sectionId === "kpi" || c.sectionId === "role_kpis" || (!c.sectionId || c.sectionId === ""));
      if (!isKpiSec) return false;

      // Department filter:
      if (!c.department || c.department === "all") return true;
      if (memberDept && c.department.toLowerCase().trim() === memberDept) return true;
      return false;
    });

    return items.map(c => ({
      id: c.id,
      name: (isAr && c.nameAr) ? c.nameAr : c.name,
      description: (isAr && c.descriptionAr) ? c.descriptionAr : c.description,
    }));
  }, [dynamicCriteria, deletedCriteriaIds, isAr, currentMember]);

  // Dynamic Competencies List: Strictly from Dynamic Criteria configured by user
  const currentCompetenciesList = useMemo(() => {
    const deletedCritSet = new Set(deletedCriteriaIds || []);
    const memberDept = (currentMember?.department || currentMember?.team || "").toLowerCase().trim();

    const items = dynamicCriteria.filter(c => {
      if (deletedCritSet.has(c.id)) return false;
      const isComp = (c.sectionId === "competencies" || c.sectionId === "core_competencies");
      if (!isComp) return false;

      if (!c.department || c.department === "all") return true;
      if (memberDept && c.department.toLowerCase().trim() === memberDept) return true;
      return false;
    });

    return items.map(c => ({
      id: c.id,
      name: (isAr && c.nameAr) ? c.nameAr : c.name,
      description: (isAr && c.descriptionAr) ? c.descriptionAr : c.description,
    }));
  }, [dynamicCriteria, deletedCriteriaIds, isAr, currentMember]);

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
    const vals = kpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [kpiDefinitions, selfKpis]);

  const managerKpiAvg = useMemo(() => {
    const vals = kpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [kpiDefinitions, managerKpis]);

  // Competencies Averages
  const selfCompAvg = useMemo(() => {
    const vals = currentCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [currentCompetenciesList, selfCompetencies]);

  const managerCompAvg = useMemo(() => {
    const vals = currentCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
    if (vals.length === 0) return 0;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  }, [currentCompetenciesList, managerCompetencies]);

  // Overall Scores: Calculate using unrounded averages for exact Excel precision (50% KPI + 50% Competencies)
  const selfOverall = useMemo(() => {
    const kpiVals = kpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);
    const compVals = currentCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
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
    const kpiVals = kpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);
    const compVals = currentCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);
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
  const ratingTier = getRatingInfo(officialOverallScore > 0 ? officialOverallScore : 3.0, lang);

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
                {t.drawerTitle} <span className="text-[#1C6B53] dark:text-emerald-400 font-extrabold">{critTitle}</span>
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
                <span>{t.drawerManagerTab}</span>
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
                <span>{t.drawerEmployeeTab}</span>
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
            {t.drawerTopicLabel}
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
            placeholder={canEditThisTab ? (isAr ? "اكتب الملاحظة، الشواهد، أو تبرير الدرجة لهذا المعيار..." : "Enter specific feedback, observations, or rationale for this metric...") : (isAr ? "لم تسجل أي ملاحظة بعد." : "No note has been recorded yet.")}
            className="w-full text-xs p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1C6B53]/20 focus:border-[#1C6B53] outline-none transition disabled:opacity-75 resize-none font-medium leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
          <span>
            {activeEntry?.updatedAt 
              ? `${isAr ? 'آخر تحديث:' : 'Last updated:'} ${activeEntry.updatedAt} ${activeEntry.authorName ? `(${activeEntry.authorName})` : ''}`
              : (canEditThisTab ? (isAr ? "اكتب ملاحظتك وسيتم حفظها تلقائياً مع التقييم" : "Type your note and it saves automatically with the evaluation") : (isAr ? "عرض فقط" : "Read-only view"))}
          </span>
          <button
            type="button"
            onClick={() => setOpenNoteCriterionId(null)}
            className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition cursor-pointer"
          >
            {t.drawerClose}
          </button>
        </div>
      </div>
    );
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
      const payload: any = {
        year: selectedYear,
        period: "Annual",
        period_type: "Annual",
        evaluation_date: autoDate,
        employee_name: selectedEmployeeName,
        employee_id: employeeId || "",
        department: currentMember?.department || (currentMemberRoleType === "trainer" ? "Training" : currentMemberRoleType === "qa" ? "Quality" : currentMemberRoleType === "backoffice" ? "Back Office" : "Contact Center"),
        team: currentMember?.team || "Contact Center",
        team_leader: teamLeader || resolveTeamLeader(currentMember?.team),
        channel_type: currentMemberRoleType !== "agent" ? currentMemberRoleType : (isSelectedEmployeeChat ? "chat" : "calls"),
        role_type: currentMemberRoleType,
        is_special_staff: currentMemberRoleType !== "agent",
        
        self_kpis: selfKpis,
        self_competencies: selfCompetencies,
        self_kpi_avg: selfKpiAvg,
        self_competency_avg: selfCompAvg,
        self_overall_score: selfOverall,
        self_comments: employeeComments,

        manager_kpis: managerKpis,
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
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {}
    }, 100);
  };

  const brandGradient = 'var(--brand-gradient, linear-gradient(135deg, #0C382E 0%, #135B47 50%, #1C6B53 100%))';

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen p-3.5 sm:p-6 md:p-8 font-sans bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors pb-16 print:bg-white print:text-black print:p-0">
      
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
              userProfile={{
                ...userProfile,
                photo_url: currentUserPhoto || userProfile?.photo_url
              }}
              onNavigate={onNavigate}
              onLogout={onLogout || onBack}
              onOpenProfile={() => {
                setShowUserProfileModal(true);
                if (onOpenProfile) onOpenProfile();
              }}
              onOpenSettings={onOpenSettings}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              showOnlyEvaluation={true}
              lang={lang}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>

        {/* Main Container */}
        <main className="w-full">
          
          {/* Top Control Toolbar: Prominent, Spacious, Ultra-Modern Executive Control Bar */}
          <section className="relative z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-sm mb-5 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              
              {/* Left Controls: Annual Badge & Management & Who's Pending */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Annual Evaluation Badge */}
                <div className="flex items-center gap-1.5 px-3.5 h-9 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 text-[#1C6B53] dark:text-emerald-300 rounded-xl text-xs sm:text-sm font-black shrink-0 shadow-2xs">
                  <Award size={15} />
                  <span>{t.annualBadge}</span>
                </div>

                {/* Management Button: Criteria (Admin & Department Manager) */}
                {(isAdmin || isDeptManager) && (
                  <button
                    type="button"
                    onClick={() => setShowManageCriteriaModal(true)}
                    className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl bg-gray-100/90 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 transition active:scale-95 shadow-2xs cursor-pointer shrink-0"
                    title={isDeptManager && !isAdmin ? (isAr ? `إدارة معايير قسم ${userManagedDepts[0]?.name || ''}` : `Manage ${userManagedDepts[0]?.name || ''} Department Criteria`) : "Manage Custom Evaluation Criteria"}
                  >
                    <Sliders size={15} className="text-[#1C6B53] dark:text-emerald-400" />
                    <span>{isDeptManager && !isAdmin ? (isAr ? "معايير القسم" : "Dept Criteria") : t.criteriaButton}</span>
                    <span className="px-1.5 py-0.5 bg-[#1C6B53] text-white rounded-full text-[10px] font-black shadow-2xs">
                      {isDeptManager && !isAdmin 
                        ? dynamicCriteria.filter(c => {
                            if (deletedCriteriaIds.includes(c.id)) return false;
                            const mDept = (userManagedDepts[0]?.name || userProfile?.department || "").toLowerCase().trim();
                            return !c.department || c.department === "all" || c.department.toLowerCase().trim() === mDept;
                          }).length
                        : dynamicCriteria.length}
                    </span>
                  </button>
                )}

                {/* Management Button: Staff Rosters (Admin & Department Manager) */}
                {(isAdmin || isDeptManager) && (
                  <button
                    type="button"
                    onClick={() => setShowManageStaffModal(true)}
                    className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl bg-gray-100/90 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 transition active:scale-95 shadow-2xs cursor-pointer shrink-0"
                    title={isDeptManager && !isAdmin ? (isAr ? `إدارة موظفي قسم ${userManagedDepts[0]?.name || ''}` : `Manage ${userManagedDepts[0]?.name || ''} Department Staff`) : "Manage Staff & Rosters"}
                  >
                    <Building2 size={15} className="text-[#1C6B53] dark:text-emerald-400" />
                    <span>{isDeptManager && !isAdmin ? (isAr ? "موظفي القسم" : "Department Staff") : t.staffButton}</span>
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-black shadow-2xs">
                      {isDeptManager && !isAdmin ? allowedMembersForUser.length : effectiveAllMembers.length}
                    </span>
                  </button>
                )}

                {/* Quick Button: Who's Pending - Manager & Admin Only */}
                {(isManager || isAdmin || hasSubordinates) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverageFilterStatus("pending");
                      setShowCoverageModal(true);
                    }}
                    className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-500/30 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                    title="View Pending Employees"
                  >
                    <ListChecks size={15} className="text-amber-600 dark:text-amber-400" />
                    <span>{t.whosPendingButton}</span>
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-black shadow-2xs">
                      {coverageData.pendingCount}
                    </span>
                  </button>
                )}

              </div>

              {/* Right Side: Print PDF & Employee Selector */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                
                {/* Print / Save PDF Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl bg-gray-100/90 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 transition active:scale-95 shadow-2xs cursor-pointer shrink-0"
                  title="Print / Save PDF"
                >
                  <Printer size={15} className="text-[#1C6B53] dark:text-emerald-400" />
                  <span className="hidden sm:inline">{t.printPdfButton}</span>
                </button>

                {/* Employee Selector */}
                <div className="relative min-w-[220px] sm:min-w-[300px]">
                  {isSingleSelfViewOnly ? (
                    <div className="h-10 flex items-center gap-2.5 px-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-xs sm:text-sm font-bold shrink-0">
                      <div className="w-6.5 h-6.5 rounded-lg bg-[#1C6B53] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {userProfile?.name?.charAt(0) || userProfile?.agent_name?.charAt(0) || "A"}
                      </div>
                      <span className="font-black text-gray-900 dark:text-white truncate">
                        {currentMember ? getLocalizedMemberName(currentMember, isAr) : toTitleCase(selectedEmployeeName)}
                      </span>
                      <span className="text-xs text-[#1C6B53] dark:text-emerald-400 font-bold shrink-0">
                        • {currentMember?.custom_position ||
                           (currentMemberRoleType === 'trainer' ? 'Trainer' :
                            currentMemberRoleType === 'qa' ? 'QA' :
                            currentMemberRoleType === 'tl' ? 'Team Leader' :
                            currentMemberRoleType === 'backoffice' ? 'Back Office' :
                            getLocalizedDeptName(currentMember?.department || currentMember?.team?.replace(' Team', '') || 'Contact Center', isAr))}
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
                        className="w-full h-10 flex items-center justify-between gap-2.5 px-3.5 bg-gray-100/90 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-bold text-gray-900 dark:text-white transition shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-[#1C6B53] to-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                            {selectedEmployeeName ? selectedEmployeeName.charAt(0).toUpperCase() : <Users size={13} />}
                          </div>
                          <div className="flex items-center gap-1.5 truncate text-left">
                            <span className="truncate font-black text-xs sm:text-sm text-gray-900 dark:text-white leading-tight">
                              {currentMember ? getLocalizedMemberName(currentMember, isAr) : (selectedEmployeeName ? toTitleCase(selectedEmployeeName) : (isAr ? "اختر أو أضف موظفاً" : t.selectEmployeePrompt))}
                            </span>
                            {selectedEmployeeName && (currentMember?.team || currentMember?.department) && (
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
                                • {getLocalizedDeptName(currentMember?.department || currentMember?.team?.replace(' Team', '') || 'Contact Center', isAr)}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedEmployeeName ? (
                          <div className="flex items-center gap-2 shrink-0 ml-1">
                            <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border font-black flex items-center gap-1 ${
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
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${employeeDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>
                        ) : (
                          <ChevronDown size={14} className={`text-gray-400 transition-transform ${employeeDropdownOpen ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                  {employeeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setEmployeeDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-full sm:w-[460px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-3 z-50 max-h-[460px] flex flex-col animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10">
                        
                        {/* Header */}
                        <div className="px-2 pt-1 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <div>
                            <h4 className="text-xs font-black text-gray-900 dark:text-white">
                              {isAdmin ? t.selectEmployeePrompt.replace('...', '') : t.directTeamSubordinates}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                              {isAdmin ? `${effectiveAllMembers.length} ${t.totalEmployees}` : `${allowedMembersForUser.length} ${t.membersInScope}`}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {filteredMembers.length} {t.availableCount}
                          </span>
                        </div>

                        {/* Search Input - Modern & Calm */}
                        <div className="relative mt-2.5 mb-2">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                          <input
                            type="text"
                            placeholder={isAdmin ? t.searchEmployeePlaceholder : t.searchEmployeeSubordinatesPlaceholder}
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

                        {/* Scope, Department & Team Filter Dropdown */}
                        {isAdmin && (
                          <div className="mb-2 shrink-0">
                            <ModernDropdown
                              value={teamTabFilter}
                              onChange={(val) => {
                                setTeamTabFilter(val);
                                setEmployeeSearchTerm("");
                              }}
                              options={scopeFilterOptions}
                              variant="gray"
                              size="sm"
                              fullWidth
                            />
                          </div>
                        )}

                        {/* Roster Count Summary */}
                        <div className="px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 mb-1.5">
                          <span>
                            {employeeSearchTerm.trim() 
                              ? `${filteredMembers.length} ${t.matchingSearch}` 
                              : isAdmin
                              ? `${filteredMembers.length} ${t.membersIn} ${
                                  teamTabFilter === 'all' ? t.allStaffAndDepts :
                                  teamTabFilter.startsWith('dept_') ? (isAr ? getLocalizedDeptName(teamTabFilter.replace('dept_', ''), true) : teamTabFilter.replace('dept_', '')) :
                                  teamTabFilter === 'QA_Training' ? (isAr ? 'الجودة، التدريب والعمليات' : 'QA, Training & Back Office') :
                                  teamTabFilter === 'Mohammed' ? (isAr ? 'فريق محمد دلشاد (شات)' : 'Mohammed Dlshad Team (Chat)') :
                                  teamTabFilter === 'Ankido' ? (isAr ? 'فريق أنكيدو بويا (اتصال)' : 'Ankido Buya Team (Calls)') : (isAr ? 'فريق يونس كمال (اتصال)' : 'Younis Kamal Team (Calls)')
                                }`
                              : `${filteredMembers.length} ${t.membersInScope}`}
                          </span>
                          <span className="text-[9px] font-bold text-[#1C6B53] dark:text-emerald-400">
                            {isAdmin ? (
                              teamTabFilter === 'all' ? t.allOrgScope :
                              teamTabFilter.startsWith('dept_') ? (isAr ? getLocalizedDeptName(teamTabFilter.replace('dept_', ''), true) : teamTabFilter.replace('dept_', '')) :
                              teamTabFilter === 'QA_Training' ? t.specializedOpsScope :
                              teamTabFilter === 'Mohammed' ? t.digitalChatScope : t.voiceCallsScope
                            ) : t.directReportingScope}
                          </span>
                        </div>

                        {/* Scrollable Members List */}
                        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 overscroll-contain max-h-64">
                          {filteredMembers.length === 0 ? (
                            <div className="py-8 px-3 text-center text-xs text-gray-400 dark:text-gray-500 font-medium flex flex-col items-center gap-2">
                              {isLoadingMembers ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-[#1C6B53] border-t-transparent rounded-full animate-spin" />
                                  <span>{isAr ? "جاري تحميل قائمة الموظفين..." : "Loading employees list..."}</span>
                                </>
                              ) : (
                                <>
                                  <Users size={24} className="text-gray-300 dark:text-gray-600" />
                                  <span className="font-bold text-gray-700 dark:text-gray-200">
                                    {employeeSearchTerm.trim() 
                                      ? `${isAr ? 'لا يوجد موظف مطابق لـ' : 'No employees matching'} "${employeeSearchTerm}"` 
                                      : (isAr ? "لا يوجد موظفون مسجلون حالياً" : "No employees registered yet")}
                                  </span>
                                  {!employeeSearchTerm.trim() && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEmployeeDropdownOpen(false);
                                        setShowManageStaffModal(true);
                                      }}
                                      className="mt-1 px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition hover:opacity-90 cursor-pointer"
                                      style={{ background: brandGradient }}
                                    >
                                      {isAr ? "+ إضافة أول موظف" : "+ Add First Employee"}
                                    </button>
                                  )}
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
                                    {(() => {
                                      const isSelf = normalizeAgentName(m.agent_name || m.name || "") === currentUserNameNorm;
                                      return (
                                        <>
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                                            isSelected
                                              ? 'bg-[#1C6B53] text-white shadow-2xs'
                                              : isSelf
                                              ? 'bg-amber-500 text-white shadow-2xs'
                                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                          }`}>
                                            {m.agent_name?.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="truncate">
                                            <div className="font-bold truncate text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                              <span>{getLocalizedMemberName(m, isAr)}</span>
                                              {isSelf && (
                                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
                                                  {isAr ? "⭐ حسابي" : "⭐ Myself"}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate flex items-center gap-1">
                                              <span>{m.custom_position || (m.role_type === "tl" ? (isAr ? "قائد فريق" : "Team Leader") : getLocalizedDeptName(m.department || teamStr.replace(' Team', ''), isAr))}</span>
                                              {m.direct_manager && !isSelf && (
                                                <span className="text-gray-400 dark:text-gray-500">• {isAr ? "المدير: " : "Mgr: "}{isAr ? (m.direct_manager_ar || m.direct_manager) : (m.direct_manager_en || m.direct_manager)}</span>
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {m.custom_position ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-extrabold flex items-center gap-1 bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800">
                                        <Sparkles size={10} />
                                        <span>{m.custom_position}</span>
                                      </span>
                                    ) : m.role_type === "tl" ? (
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
                    </>
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
            className="eval-header-gradient bg-gradient-to-r from-[#0C382E] via-[#135B47] to-[#1C6B53] border-b border-white/20 p-6 sm:p-8 relative overflow-hidden text-white print:rounded-2xl print:p-5 print:mb-4"
          >
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              
              {/* Employee Information & Brand Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                
                {/* Modern FIB Logo Emblem: Crisp white container popping against emerald background */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2.5 shrink-0 ring-4 ring-white/10 print:ring-0">
                  <img 
                    src="/logo.webp" 
                    alt="First Iraqi Bank" 
                    className="w-full h-full object-contain" 
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[11px] font-black tracking-wider uppercase bg-white/15 text-emerald-100 px-3 py-0.5 rounded-full border border-white/20 backdrop-blur-sm shadow-xs print-card-badge">
                      {isAr ? 'التقييم السنوي • ' : 'ANNUAL • '}{selectedYear}
                    </span>
                    {evaluationDate && (
                      <span className="text-xs font-semibold text-emerald-200">
                        {t.submittedAt} {evaluationDate}
                      </span>
                    )}
                    {isReadOnly && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 flex items-center gap-1 backdrop-blur-sm print:hidden">
                        <Eye size={11} />
                        <span>{t.viewOnly}</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentMember ? getLocalizedMemberName(currentMember, isAr) : (selectedEmployeeName ? toTitleCase(selectedEmployeeName) : (isAr ? "يرجى اختيار أو إضافة موظف للتقييم" : "Select or Add Staff for Evaluation"))}
                  </h2>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-emerald-100/90 font-medium">
                    {currentMember ? (
                      <>
                        <span className="font-bold text-white">{getLocalizedDeptName(currentMember?.department || currentMember?.team || "", isAr)}</span>
                        {currentMember?.department && (
                          <>
                            <span>•</span>
                            <span>{currentMember?.department}</span>
                          </>
                        )}
                        {currentMemberRoleType !== 'agent' && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase tracking-wider print-card-badge">
                              {currentMemberRoleType === 'trainer' ? 'Trainer' : currentMemberRoleType === 'qa' ? 'Quality Assurance' : currentMemberRoleType === 'backoffice' ? 'Back Office' : 'Team Leader'}
                            </span>
                          </>
                        )}
                        {currentMemberDirectManager && (
                          <>
                            <span>•</span>
                            <span className="bg-emerald-950/40 text-emerald-100 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border border-white/15 print-card-badge">
                              {t.directManagerLabel} <strong className="text-white font-bold">{currentMemberDirectManager}</strong>
                            </span>
                          </>
                        )}
                        {currentMemberDeptChief && (
                          <>
                            <span>•</span>
                            <span className="bg-emerald-950/40 text-emerald-100 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border border-white/15 print-card-badge">
                              {t.departmentChiefLabel} <strong className="text-white font-bold">{currentMemberDeptChief}</strong>
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-white/80">
                        {isAr ? "النظام مهيأ لإدخال بياناتك. ابدأ بإضافة الأقسام والموظفين والمعايير من الأزرار أعلاه." : "System is ready for custom data. Use the buttons above to add departments, staff, and criteria."}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge & Score Highlights — Right-aligned, larger, premium */}
              <div className="flex items-stretch gap-3 self-start lg:self-auto">
                {/* Final Score Card */}
                <div className="w-[140px] sm:w-[160px] h-[90px] bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-3 sm:p-4 flex flex-col justify-between items-center text-center shadow-sm print-card-badge">
                  <div className="text-[10px] font-black text-emerald-100 uppercase tracking-widest leading-none">
                    {t.finalScore}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    {isManagerDataVisible && officialOverallScore > 0 ? (
                      <div className="text-3xl font-black text-white leading-none">
                        <span>{officialOverallScore.toFixed(2)}</span>
                        <span className="text-sm text-emerald-200/90 font-normal"> / 5.0</span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-white/60">--</span>
                    )}
                  </div>
                </div>

                {/* Rating Tier Card */}
                <div className="min-w-[160px] sm:min-w-[190px] px-4 h-[90px] bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl py-3 sm:py-4 flex flex-col justify-between items-center text-center shadow-sm print-card-badge">
                  <div className="text-[10px] font-black text-emerald-100 uppercase tracking-widest leading-none">
                    {t.ratingTier}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm sm:text-[15px] font-black text-white flex items-center gap-2 leading-none whitespace-nowrap">
                      <Award size={17} className={isManagerDataVisible && officialOverallScore > 0 ? "text-amber-300 shrink-0" : "text-white/60 shrink-0"} />
                      <span>{isManagerDataVisible && officialOverallScore > 0 ? ratingTier.label : t.pendingReview}</span>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="w-[140px] sm:w-[155px] h-[90px] bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-3 sm:p-4 flex flex-col justify-between items-center text-center shadow-sm print-card-badge">
                  <div className="text-[10px] font-black text-emerald-100 uppercase tracking-widest leading-none">
                    {t.status}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm font-bold text-white flex items-center gap-2 leading-none">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${
                        evaluationStatus === 'manager_finalized' ? 'bg-emerald-300 ring-4 ring-emerald-400/30' :
                        evaluationStatus === 'self_submitted' ? 'bg-amber-300 ring-4 ring-amber-400/30' : 
                        'bg-white/60 ring-4 ring-white/20'
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
                    <span>
                      {isAr ? (
                        r.level === 5 ? t.tier5 :
                        r.level === 4 ? t.tier4 :
                        r.level === 3 ? t.tier3 :
                        r.level === 2 ? t.tier2 : t.tier1
                      ) : r.label}
                    </span>
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
                    {(() => {
                      const kpiSec = dynamicSections.find(s => s.id === "kpi");
                      if (kpiSec) {
                        return isAr ? (kpiSec.titleAr || t.sec1DefaultTitle) : (kpiSec.title || t.sec1DefaultTitle);
                      }
                      return t.sec1DefaultTitle;
                    })()}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-9">
                  {(() => {
                    const kpiSec = dynamicSections.find(s => s.id === "kpi");
                    if (kpiSec) {
                      return kpiSec.description;
                    }
                    return t.sec1DescAgent;
                  })()}
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
                      {currentMemberRoleType === "agent" ? (isAr ? "مؤشر الأداء" : "KPI Metric") : t.colKpiMetric}
                    </th>
                    {currentMemberRoleType === "agent" && (
                      <th className="p-3.5 text-center w-28">{t.colActualResult}</th>
                    )}
                    <th className="p-3.5 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                      <span>{t.colSelf} {currentMemberRoleType === "agent" ? (isAr ? "(الموظف)" : "(Agent)") : ""}</span>
                    </th>
                    <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                      <span>{t.colManager}</span>
                    </th>
                    <th className="p-3.5 text-center w-20">{t.colGap}</th>
                    <th className="p-3.5 text-center w-24">{t.colNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs font-medium">
                  {kpiDefinitions.length === 0 ? (
                    <tr>
                      <td colSpan={currentMemberRoleType === "agent" ? 6 : 5} className="p-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 text-gray-400 dark:text-gray-500">
                          <Sparkles size={30} className="text-gray-300 dark:text-gray-600" />
                          <p className="font-bold text-gray-700 dark:text-gray-200 text-xs">
                            {isAr ? "لا توجد مؤشرات أداء (KPIs) مضافة حالياً" : "No KPIs defined yet"}
                          </p>
                          <p className="text-[11px] text-gray-400 max-w-sm">
                            {isAr ? "يمكنك إضافة وتخصيص مؤشرات الأداء الوظيفي والقيادي من زر 'إدارة المعايير والأقسام' أعلاه." : "You can add and customize your operational and leadership KPIs using 'Manage Criteria' above."}
                          </p>
                          {(isAdmin || isDeptManager) && (
                            <button
                              type="button"
                              onClick={() => setShowManageCriteriaModal(true)}
                              className="mt-1 px-4 py-1.5 text-xs font-bold rounded-xl text-white shadow-xs transition hover:opacity-90 cursor-pointer"
                              style={{ background: brandGradient }}
                            >
                              {isAr ? "+ إضافة مؤشرات أداء (KPIs)" : "+ Add Performance KPIs"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : kpiDefinitions.map((kpi) => {
                    const selfVal = getKpiScore(selfKpis, kpi.id);
                    const mgrVal = getKpiScore(managerKpis, kpi.id);
                    const diff = mgrVal > 0 && selfVal > 0 ? (mgrVal - selfVal) : null;
                    const notesCount = getCriterionNotesCount(kpi.id);
                    const isDrawerOpen = openNoteCriterionId === kpi.id;

                    return (
                      <React.Fragment key={kpi.id}>
                      <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">{kpi.name}</div>
                          {kpi.description && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5 leading-relaxed">
                              {kpi.description}
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
                              <span>{t.awaitingReview}</span>
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

                        {/* Notes Column */}
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
                            title="Criterion Note"
                          >
                            <MessageSquare size={13} className={notesCount > 0 ? 'text-[#1C6B53] dark:text-emerald-400' : 'text-gray-400'} />
                            <span>{notesCount > 0 ? `${t.noteCountBtn} (${notesCount})` : t.addNoteBtn}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Note Drawer Row */}
                      {isDrawerOpen && (
                        <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                          <td colSpan={currentMemberRoleType === "agent" ? 6 : 5} className="p-3.5">
                            {renderCriterionNoteDrawer(kpi.id, kpi.name)}
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
                        <span className="text-sm">{t.finalScoreAverage}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center bg-blue-100/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                      <span className="text-base font-black font-mono">
                        {selfKpiAvg > 0 ? selfKpiAvg.toFixed(2) : "--"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                      <span className="text-base font-black font-mono">
                        {isManagerDataVisible && managerKpiAvg > 0 ? managerKpiAvg.toFixed(2) : isManagerDataVisible ? "--" : "Pending"}
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
                  {(() => {
                    const compSec = dynamicSections.find(s => s.id === "competencies");
                    if (compSec) {
                      return isAr ? (compSec.titleAr || t.sec2Title) : (compSec.title || t.sec2Title);
                    }
                    return t.sec2Title;
                  })()}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-9">
                {(() => {
                  const compSec = dynamicSections.find(s => s.id === "competencies");
                  if (compSec && compSec.description) {
                    return compSec.description;
                  }
                  return isAr ? `تقييم الكفاءات والسلوكيات المؤسسية الأساسية للمصرف (${currentCompetenciesList.length} كفاءات - من 1 إلى 5 درجات).` : t.sec2Desc;
                })()}
              </p>
            </div>

            {/* Competencies Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/90 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black border-b border-gray-200 dark:border-gray-700">
                    <th className="p-3.5 text-left w-1/2">{t.colCompetency}</th>
                    <th className="p-3.5 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                      <span>{t.colSelf} {currentMemberRoleType === "agent" ? (isAr ? "(الموظف)" : "(Agent)") : ""}</span>
                    </th>
                    <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                      <span>{t.colManager}</span>
                    </th>
                    <th className="p-3.5 text-center w-20">{t.colGap}</th>
                    <th className="p-3.5 text-center w-24">{t.colNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs font-medium">
                  {currentCompetenciesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 text-gray-400 dark:text-gray-500">
                          <Sparkles size={30} className="text-gray-300 dark:text-gray-600" />
                          <p className="font-bold text-gray-700 dark:text-gray-200 text-xs">
                            {isAr ? "لا توجد كفاءات سلوكية مضافة حالياً" : "No competencies defined yet"}
                          </p>
                          <p className="text-[11px] text-gray-400 max-w-sm">
                            {isAr ? "يمكنك إضافة وتخصيص الكفاءات والسلوكيات المؤسسية من زر 'إدارة المعايير والأقسام' أعلاه." : "You can add and customize institutional core competencies using 'Manage Criteria' above."}
                          </p>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setShowManageCriteriaModal(true)}
                              className="mt-1 px-4 py-1.5 text-xs font-bold rounded-xl text-white shadow-xs transition hover:opacity-90 cursor-pointer"
                              style={{ background: brandGradient }}
                            >
                              {isAr ? "+ إضافة كفاءات سلوكية" : "+ Add Core Competencies"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : currentCompetenciesList.map((comp) => {
                    const selfVal = selfCompetencies[comp.id] || 0;
                    const mgrVal = managerCompetencies[comp.id] || 0;
                    const diff = mgrVal > 0 && selfVal > 0 ? (mgrVal - selfVal) : null;
                    const notesCount = getCriterionNotesCount(comp.id);
                    const isDrawerOpen = openNoteCriterionId === comp.id;

                    return (
                      <React.Fragment key={comp.id}>
                      <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">{comp.name}</div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5 leading-relaxed">
                            {comp.description}
                          </p>
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
                              <span>{t.awaitingReview}</span>
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

                        {/* Notes Column */}
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
                            title="Competency Note"
                          >
                            <MessageSquare size={13} className={notesCount > 0 ? 'text-[#1C6B53] dark:text-emerald-400' : 'text-gray-400'} />
                            <span>{notesCount > 0 ? `${t.noteCountBtn} (${notesCount})` : t.addNoteBtn}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Note Drawer Row */}
                      {isDrawerOpen && (
                        <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                          <td colSpan={5} className="p-3.5">
                            {renderCriterionNoteDrawer(comp.id, comp.name)}
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
                        <span className="text-sm">{t.competencyAverageRow}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center bg-blue-100/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                      <span className="text-base font-black font-mono">
                        {selfCompAvg > 0 ? selfCompAvg.toFixed(2) : "--"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                      <span className="text-base font-black font-mono">
                        {isManagerDataVisible && managerCompAvg > 0 ? managerCompAvg.toFixed(2) : isManagerDataVisible ? "--" : "Pending"}
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
                {t.sec3Title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Employee Summary Card */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{currentMemberRoleType === 'agent' ? t.agentSelfReviewCard : t.selfReviewCard}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                    Self
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
                    {isManagerDataVisible && managerOverall > 0 ? 'Official' : 'Pending'}
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
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Awaiting Manager Review</span>
                    <span className="text-[10px] text-gray-400 mt-1">Official manager ratings will appear once finalized.</span>
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
                      <span className="text-base text-gray-400 font-bold">Pending Review</span>
                    )}
                  </div>
                  <div className="text-sm font-black mt-1">
                    {isManagerDataVisible && officialOverallScore > 0 ? ratingTier.label : t.awaitingManagerApproval}
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  {isManagerDataVisible && officialOverallScore > 0 ? ratingTier.desc : t.completeEvalMsg}
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Qualitative Notes & Feedback */}
          <div className="p-6 sm:p-8 border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/60">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  {t.sec4Title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.sec4Subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Employee Notes Card */}
              <div className="bg-gray-50/70 dark:bg-gray-800/70 p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <User size={13} />
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {t.employeeNotesTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                    Self Note
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  {t.employeeNotesDesc}
                </p>
                <textarea
                  rows={4}
                  value={employeeComments}
                  onChange={(e) => setEmployeeComments(e.target.value)}
                  disabled={!canEditEmployeeFeedback}
                  placeholder={canEditEmployeeFeedback ? t.empPlaceholderActive : t.empPlaceholderEmpty}
                  className="w-full flex-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 dark:text-gray-100 resize-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Manager Notes Card */}
              <div className="bg-gray-50/70 dark:bg-gray-800/70 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center">
                      <Award size={13} />
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {t.managerNotesTitle}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isManagerDataVisible
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                  }`}>
                    {isManagerDataVisible ? 'Official' : 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  {t.managerNotesDesc}
                </p>
                {isManagerDataVisible ? (
                  <textarea
                    rows={4}
                    value={managerComments}
                    onChange={(e) => setManagerComments(e.target.value)}
                    disabled={!canEditManager}
                    placeholder={canEditManager ? t.mgrPlaceholderActive : t.mgrPlaceholderEmpty}
                    className="w-full flex-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-[#1C6B53] focus:ring-2 focus:ring-emerald-500/20 text-gray-800 dark:text-gray-100 resize-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                ) : (
                  <div className="flex-1 min-h-[105px] flex flex-col items-center justify-center text-center p-4 bg-white/50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
                    <Clock size={18} className="text-amber-500 mb-1" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Awaiting Manager Finalization</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Manager notes will appear once the review is submitted.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Print Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Notes Printout - Ultra-Modern Colorful Boxes */}
            <div className="hidden print:grid grid-cols-2 gap-6 pt-4 border-t border-gray-300">
              <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 shadow-2xs">
                <div className="text-xs font-black text-blue-900 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{isAr ? "ملاحظات وتطلعات الموظف الذاتية:" : "Employee Self-Reflection Notes:"}</span>
                </div>
                <div className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{employeeComments || "None"}</div>
              </div>
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 shadow-2xs">
                <div className="text-xs font-black text-emerald-900 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{isAr ? "توجيهات وتوصيات المدير المسؤول:" : "Manager Feedback & Recommendations:"}</span>
                </div>
                <div className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{managerComments || "None"}</div>
              </div>
            </div>

            {/* Signature Line for Print - 3 Columns: Employee, Direct Manager, Department Chief */}
            <div className="hidden print:grid grid-cols-3 gap-6 pt-8 mt-6 border-t border-gray-300">
              <div className="p-3.5 border border-gray-300 rounded-2xl bg-gray-50/60 shadow-2xs">
                <div className="text-xs font-black text-gray-700">{t.empSig}</div>
                <div className="h-12 border-b border-gray-400 mt-2"></div>
                <div className="text-[11px] font-bold text-gray-600 mt-1.5">{currentMember ? getLocalizedMemberName(currentMember, isAr) : toTitleCase(selectedEmployeeName)}</div>
              </div>
              <div className="p-3.5 border border-gray-300 rounded-2xl bg-gray-50/60 shadow-2xs">
                <div className="text-xs font-black text-gray-700">{t.mgrSig}</div>
                <div className="h-12 border-b border-gray-400 mt-2"></div>
                <div className="text-[11px] font-bold text-gray-600 mt-1.5">{currentMemberDirectManager || teamLeader || "Direct Manager"}</div>
              </div>
              <div className="p-3.5 border border-gray-300 rounded-2xl bg-gray-50/60 shadow-2xs">
                <div className="text-xs font-black text-gray-700">{t.chiefSig}</div>
                <div className="h-12 border-b border-gray-400 mt-2"></div>
                <div className="text-[11px] font-bold text-gray-600 mt-1.5">{currentMemberDeptChief || "Omer Ayad"}</div>
              </div>
            </div>

            {/* Official Report Print Footer: Designed by Omer Ayad */}
            <div className="hidden print:flex items-center justify-between pt-6 mt-4 border-t border-gray-300 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                <span>{t.designedBy}</span>
              </div>
              <div className="text-[11px] font-bold text-gray-400">
                {t.reportFooterOrg}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 print:hidden">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {lastSavedAt ? (
                  <>
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>{t.lastSavedText} {lastSavedAt}</span>
                  </>
                ) : (
                  <span>{t.noChangesSaved}</span>
                )}
                {isReadOnly && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md ml-2 flex items-center gap-1">
                    <Eye size={12} />
                    <span>View Only ({tlAssignedTeam ? 'Team Leader Review' : 'Quality Team'})</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Self-evaluation actions (Agent, Trainer, QA, or Team Leader viewing self) */}
                {!canEditManager && isViewingSelf && (evaluationStatus as string) === 'manager_finalized' && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-[#1C6B53] dark:text-emerald-400">
                    <CheckCircle size={15} />
                    <span>{t.evalFinalizedBadge}</span>
                  </div>
                )}
                {!canEditManager && canEditSelf && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation("draft")}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>{t.saveDraftBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation("self_submitted")}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle size={14} />
                      <span>{evaluationStatus === 'self_submitted' ? t.updateSelfBtn : t.submitSelfBtn}</span>
                    </button>
                  </div>
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
                      <span>{t.saveDraftBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation("manager_finalized")}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#1C6B53] to-emerald-600 hover:opacity-95 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck size={15} />
                      <span>{evaluationStatus === 'manager_finalized' ? t.updateFinalizeBtn : t.approveFinalizeBtn}</span>
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
        <div data-modal="true" dir={isAr ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
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

                        {/* 2 Improvement Required */}
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                              <span>2 ⭐</span>
                              <span>Improvement Required</span>
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

                        {/* 1 Below Expectations */}
                        <tr className="bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                              <span>1 ⭐</span>
                              <span>Below Expectations</span>
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
                          <th className="p-3">
                            <div className="font-black text-gray-900 dark:text-gray-100">Productivity</div>
                            <div className="text-[10px] text-gray-400 font-medium">Chats / Hour</div>
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
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">99% - 100%</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">3:00 - 3:30</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">&lt; 1:30</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">&gt; 13</span>
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
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">96% - 98%</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">3:31 - 4:00</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">1:31 - 1:59</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-blue-900 dark:text-blue-200">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40">11 - 12.99</span>
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
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">8.50 - 10.99</span>
                          </td>
                        </tr>

                        {/* 2 Improvement Required */}
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                              <span>2 ⭐</span>
                              <span>Improvement Required</span>
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
                          <td className="p-3 font-mono font-semibold text-amber-900 dark:text-amber-200">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40">7.50 - 8.49</span>
                          </td>
                        </tr>

                        {/* 1 Below Expectations */}
                        <tr className="bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <td className="p-3 text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                              <span>1 ⭐</span>
                              <span>Below Expectations</span>
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
                          <td className="p-3 font-mono font-bold text-rose-700 dark:text-rose-400">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100/80 dark:bg-rose-900/50">&lt; 7.50</span>
                          </td>
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
                {isAr ? "إغلاق الدليل" : "Close Guide"}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Evaluation Coverage & Tracking Modal (Who's Evaluated / Who's Pending) - Manager & Admin Only */}
      {showCoverageModal && (isManager || isAdmin) && isClient && typeof document !== "undefined" && createPortal(
        <div data-modal="true" dir={isAr ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
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
                      {t.coverageTitle}
                    </h3>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                      {selectedYear}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    {t.coverageSubtitle}
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

            {/* KPI Summary Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-5 bg-gray-50/80 dark:bg-gray-800/40 border-b border-gray-200/80 dark:border-gray-800 shrink-0">
              
              {/* Card 1: Total Employees */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  <span>{isAr ? "إجمالي الموظفين النشطين" : "Total Active Members"}</span>
                  <Users size={15} className="text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  {coverageData.totalCount} <span className="text-xs font-semibold text-gray-500">{isAr ? "موظف" : "Employees"}</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Across 3 Contact Center Teams
                </div>
              </div>

              {/* Card 2: Annual Review Progress */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  <span>{isAr ? "نسبة إنجاز التقييم السنوي" : "Annual Review Progress"}</span>
                  <Award size={15} className="text-[#1C6B53] dark:text-emerald-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {coverageData.completedCount} <span className="text-xs font-semibold text-gray-500">{isAr ? "مكتمل" : "Completed"}</span>
                  </div>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    {coverageData.pendingCount} {isAr ? "متبقي" : "Pending"}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#1C6B53] to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${coverageData.percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-right font-bold text-gray-500 dark:text-gray-400 mt-1">
                  {coverageData.percent}% {isAr ? "نسبة الإنجاز" : "Completed"}
                </div>
              </div>

            </div>

            {/* Filter & Control Toolbar */}
            <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Left Controls: Status Switcher + Department Dropdown */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status Switcher Tabs: Pending, Completed, All */}
                  <div className="flex items-center bg-gray-100/90 dark:bg-gray-800/90 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
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
                      <span>{t.filterPending}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-white/25 rounded-md font-black">
                        {coverageData.pendingCount}
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
                      <span>{t.filterCompleted}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-white/25 rounded-md font-black">
                        {coverageData.completedCount}
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
                      <span>{isAr ? `الكل (${coverageData.totalCount})` : `All (${coverageData.totalCount})`}</span>
                    </button>
                  </div>

                  {/* Department Dropdown: Modern Custom Dropdown */}
                  <div className="min-w-[210px]">
                    <ModernDropdown
                      value={coverageDepartmentFilter}
                      onChange={(val) => setCoverageDepartmentFilter(val)}
                      options={[
                        {
                          value: "all",
                          label: `All Departments (${coverageData.totalCount})`,
                          icon: Building2,
                        },
                        ...departmentOptions.map((dept) => {
                          const deptObj = dynamicDepartments.find(d => d.name === dept.name);
                          return {
                            value: dept.name,
                            label: `${dept.name} (${dept.count})`,
                            icon: getDepartmentIcon(deptObj?.icon),
                          };
                        }),
                      ]}
                      variant="gray"
                      size="sm"
                      fullWidth
                    />
                  </div>
                </div>

                {/* Live Search Bar */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={coverageSearchTerm}
                    onChange={(e) => setCoverageSearchTerm(e.target.value)}
                    placeholder={t.coverageSearchPlaceholder}
                    className="w-full pl-9 pr-8 py-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C6B53] shadow-2xs"
                  />
                  {coverageSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setCoverageSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

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
                            {getLocalizedMemberName(item.member || item, isAr)}
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
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{getLocalizedDeptName(item.department || item.member?.department || "Contact Center", isAr)}</span>
                          <span>•</span>
                          <span>{item.team}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges & Quick Action */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                      
                      {/* Annual Status Badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        item.isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/60"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/60"
                      }`}>
                        {item.isCompleted ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Annual:</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300">
                              {item.score !== null ? item.score.toFixed(2) : "Completed"}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Annual:</span>
                            <span className="font-black text-amber-700 dark:text-amber-300">Pending</span>
                          </>
                        )}
                      </div>

                      {/* Action Button: Evaluate / Open */}
                      <button
                        type="button"
                        onClick={() => handleSelectForEvaluation(item.name)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C6B53] hover:bg-[#155340] text-white text-xs font-black transition active:scale-95 shadow-2xs cursor-pointer ml-auto md:ml-0"
                      >
                        <span>{t.evaluateEmployeeBtn}</span>
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
                {isAr ? `عرض ${filteredCoverageList.length} من أصل ${coverageData.totalCount} موظف` : `Showing ${filteredCoverageList.length} of ${coverageData.totalCount} employees`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoverageModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1C6B53] text-white hover:bg-[#155340] transition cursor-pointer"
                >
                  {t.closeBtn}
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Copied Toast Notification */}
      {coverageCopiedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-800 dark:border-gray-200 text-xs font-black animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{isAr ? "تم نسخ قائمة المتبقين إلى الحافظة بنجاح!" : "Pending list copied to clipboard!"}</span>
        </div>
      )}

      {/* Manage Criteria Modal */}
      {showManageCriteriaModal && (
        <ManageCriteriaModal
          lang={lang}
          isOpen={showManageCriteriaModal}
          onClose={() => setShowManageCriteriaModal(false)}
          criteria={dynamicCriteria.filter(c => !deletedCriteriaIds.includes(c.id))}
          sections={dynamicSections}
          onSaveCriteria={handleSaveCriteria}
          onSaveSections={handleSaveSections}
          currentUser={{
            name: userProfile?.name || userProfile?.agent_name || "",
            email: emailLower,
            role: isDeptManager && !isAdmin ? 'manager' : (isDeptChief && !isAdmin ? 'chief' : (isAdmin ? 'admin' : roleLower)),
            isAdmin,
            department: userManagedDepts[0]?.name || userChiefDepts[0]?.name || userProfile?.department || ""
          }}
          departments={dynamicDepartments}
        />
      )}

      {/* Manage Staff & Rosters Modal */}
      {showManageStaffModal && (
        <ManageStaffModal
          lang={lang}
          isOpen={showManageStaffModal}
          onClose={() => setShowManageStaffModal(false)}
          employees={dynamicEmployees.filter(e => {
            const norm = normalizeAgentName(e.name);
            const rawId = (e.id || "").toLowerCase().trim();
            const rawName = (e.name || "").toLowerCase().trim();
            return !deletedEmployeeNames.includes(norm) && !deletedEmployeeNames.includes(rawId) && !deletedEmployeeNames.includes(rawName);
          })}
          departments={dynamicDepartments.filter(d => {
            const rawId = (d.id || "").toLowerCase().trim();
            const rawName = (d.name || "").toLowerCase().trim();
            return !deletedDepartmentIds.includes(d.id) && !deletedDepartmentIds.includes(d.name) && !deletedDepartmentIds.includes(rawId) && !deletedDepartmentIds.includes(rawName);
          })}
          onSaveEmployees={handleSaveEmployees}
          onSaveDepartments={handleSaveDepartments}
          onSelectEmployeeForEval={(empName) => {
            setSelectedEmployeeName(empName);
            setShowManageStaffModal(false);
          }}
          currentUser={{
            name: userProfile?.name || userProfile?.agent_name || "",
            email: emailLower,
            role: isDeptManager && !isAdmin ? 'manager' : (isDeptChief && !isAdmin ? 'chief' : (isAdmin ? 'admin' : roleLower)),
            isAdmin,
            department: userManagedDepts[0]?.name || userChiefDepts[0]?.name || userProfile?.department || ""
          }}
        />
      )}

      {/* Interactive User Profile & Security Modal */}
      {showUserProfileModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative"
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[#0B3D2E] via-[#105942] to-[#0A3326] p-7 text-white text-center overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

              <button
                type="button"
                onClick={() => {
                  setShowUserProfileModal(false);
                  setProfileStatusMsg(null);
                  setNewPasswordInput("");
                  setConfirmPasswordInput("");
                }}
                className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer backdrop-blur-xs`}
              >
                <X size={16} />
              </button>

              {/* Profile Avatar with Photo Upload */}
              <div className="relative mx-auto mb-3 w-20 h-20">
                <div className="w-20 h-20 rounded-full bg-white/15 ring-4 ring-white/20 shadow-xl overflow-hidden flex items-center justify-center">
                  {currentUserPhoto ? (
                    <img src={currentUserPhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                      {(userProfile?.name || userProfile?.agent_name || emailLower || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Camera Upload Badge */}
                <label 
                  htmlFor="profile-photo-file-input" 
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-800 text-[#10664F] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 shadow-md border-2 border-[#105942] flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95"
                  title={isAr ? "رفع صورة شخصية جديدة" : "Upload new profile photo"}
                >
                  <Camera size={13} />
                </label>
                <input 
                  id="profile-photo-file-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoFileChange} 
                  className="hidden" 
                />
              </div>

              {/* Photo Action Links */}
              <div className="flex items-center justify-center gap-2 mb-2.5">
                <label 
                  htmlFor="profile-photo-file-input" 
                  className="text-[11px] font-bold text-emerald-200 hover:text-white underline cursor-pointer transition flex items-center gap-1"
                >
                  <Upload size={11} />
                  <span>{currentUserPhoto ? (isAr ? "تغيير الصورة" : "Change Photo") : (isAr ? "إضافة صورة شخصية" : "Add Profile Photo")}</span>
                </label>
                {currentUserPhoto && (
                  <>
                    <span className="text-white/40 text-xs">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-[11px] font-bold text-rose-300 hover:text-rose-100 underline cursor-pointer transition flex items-center gap-1"
                    >
                      <Trash2 size={11} />
                      <span>{isAr ? "إزالة" : "Remove"}</span>
                    </button>
                  </>
                )}
              </div>

              {isUpdatingPhoto && (
                <p className="text-[10px] text-emerald-200 animate-pulse mb-1">
                  {isAr ? "جاري معالجة وحفظ الصورة..." : "Processing and saving photo..."}
                </p>
              )}

              <h3 className="text-lg font-black tracking-tight text-white">
                {userProfile?.name || userProfile?.agent_name || emailLower}
              </h3>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                {emailLower}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-2xs">
                  {isDeptManager ? (isAr ? "مدير قسم" : "Dept Manager") : (isDeptChief ? (isAr ? "رئيس قسم" : "Dept Chief") : (isAdmin ? (isAr ? "مسؤول النظام" : "Super Admin") : roleLower))}
                </span>
                {(userProfile?.department || userManagedDepts[0]?.name) && (
                  <span className="px-3 py-1 rounded-full bg-emerald-400/25 border border-white/20 text-white text-[10px] font-bold backdrop-blur-md shadow-2xs">
                    {userProfile?.department || userManagedDepts[0]?.name}
                  </span>
                )}
                {userProfile?.team && (
                  <span className="px-3 py-1 rounded-full bg-black/25 text-white/95 text-[10px] font-medium backdrop-blur-md shadow-2xs">
                    {userProfile.team}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 bg-white dark:bg-gray-900">
              {profileStatusMsg && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                  profileStatusMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}>
                  {profileStatusMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                  <span>{profileStatusMsg.text}</span>
                </div>
              )}

              {/* Change Password Card */}
              <div className="bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/10 text-[#10664F] dark:text-emerald-400 flex items-center justify-center">
                    <Lock size={13} />
                  </div>
                  <span>{isAr ? "تغيير كلمة المرور" : "Change Password"}</span>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 focus-within:ring-2 focus-within:ring-[#10664F] shadow-2xs transition">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder={isAr ? "كلمة المرور الجديدة (6 خانات فأكثر)" : "New password (min 6 chars)"}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute top-2.5 ${isAr ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer`}
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 focus-within:ring-2 focus-within:ring-[#10664F] shadow-2xs transition">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder={isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm new password"}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPasswordInput}
                    className="w-full h-10 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10664F] to-[#147a5f] hover:from-[#0d5541] hover:to-[#10664F] disabled:opacity-50 transition shadow-md shadow-[#10664F]/20 active:scale-98 cursor-pointer"
                  >
                    {isUpdatingPassword ? (isAr ? "جاري الحفظ..." : "Updating...") : (isAr ? "حفظ كلمة المرور الجديدة" : "Update Password")}
                  </button>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserProfileModal(false);
                    if (onLogout) onLogout();
                    else if (onBack) onBack();
                  }}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span>{isAr ? "تسجيل الخروج من الحساب" : "Sign Out"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserProfileModal(false);
                    setProfileStatusMsg(null);
                    setNewPasswordInput("");
                    setConfirmPasswordInput("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
