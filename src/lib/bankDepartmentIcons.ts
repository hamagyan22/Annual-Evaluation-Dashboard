import React from "react";
import {
  LucideIcon,
  Landmark, Building2, Building, Scale,
  CreditCard, Wallet, CircleDollarSign, Banknote, Coins, Receipt, PiggyBank, BarChart3,
  Headphones, PhoneCall, Briefcase, Layers, HeartHandshake, Target,
  ShieldCheck, ShieldAlert, FileCheck, Lock, Search,
  Laptop, Server, Smartphone, Database,
  Users, GraduationCap, Award, BookOpen
} from "lucide-react";

export type BankIconCategory = "all" | "management" | "finance" | "customer" | "audit" | "tech" | "hr";

export interface BankIconItem {
  id: string; // Lucide icon name
  nameEn: string;
  nameAr: string;
  category: "management" | "finance" | "customer" | "audit" | "tech" | "hr";
  keywords: string[];
}

export const BANK_DEPARTMENT_ICONS: BankIconItem[] = [
  // 1. Management, Headquarters & Legal
  {
    id: "Landmark",
    nameEn: "Central Bank & Head Office",
    nameAr: "المصرف والإدارة العامة",
    category: "management",
    keywords: ["bank", "hq", "central", "management", "ادارة", "مصرف", "بنك", "عامة"]
  },
  {
    id: "Building2",
    nameEn: "Main Branch & Facilities",
    nameAr: "المبنى الرئيسي والفروع",
    category: "management",
    keywords: ["building", "branch", "office", "مبنى", "فرع", "مكاتب"]
  },
  {
    id: "Building",
    nameEn: "Branch Network & Outlets",
    nameAr: "شبكة الفروع والمكاتب",
    category: "management",
    keywords: ["branches", "network", "فروع", "شبكة"]
  },
  {
    id: "Scale",
    nameEn: "Legal Affairs & Compliance",
    nameAr: "الشؤون القانونية والامتثال",
    category: "management",
    keywords: ["legal", "compliance", "law", "قانونية", "امتثال", "محاماة", "شؤون"]
  },

  // 2. Finance, Treasury, Cards & Payments
  {
    id: "CreditCard",
    nameEn: "Cards & Electronic Payments",
    nameAr: "البطاقات والمدفوعات الإلكترونية",
    category: "finance",
    keywords: ["cards", "visa", "mastercard", "payments", "pos", "بطاقات", "مدفوعات", "فيزا", "ماستركارد", "دفع"]
  },
  {
    id: "Wallet",
    nameEn: "Digital Wallets & Cashier",
    nameAr: "المحافظ الرقمية والقبض",
    category: "finance",
    keywords: ["wallet", "cashier", "teller", "محفظة", "محافظ", "قبض", "صندوق"]
  },
  {
    id: "CircleDollarSign",
    nameEn: "Finance & General Accounts",
    nameAr: "المالية والحسابات العامة",
    category: "finance",
    keywords: ["finance", "accounts", "accounting", "money", "مالية", "حسابات", "محاسبة"]
  },
  {
    id: "Banknote",
    nameEn: "Treasury & Cash Operations",
    nameAr: "الخزينة والعمليات النقدية",
    category: "finance",
    keywords: ["treasury", "cash", "vault", "خزينة", "نقد", "سيولة", "صندوق"]
  },
  {
    id: "Coins",
    nameEn: "Foreign Exchange & Currency",
    nameAr: "الصرافة والعملات الأجنبية",
    category: "finance",
    keywords: ["fx", "forex", "exchange", "currency", "صرافة", "عملات", "تحويل"]
  },
  {
    id: "Receipt",
    nameEn: "Settlement & Reconciliation",
    nameAr: "المطابقة والتسويات المالية",
    category: "finance",
    keywords: ["settlement", "reconciliation", "audit", "مطابقة", "تسويات", "فواتير"]
  },
  {
    id: "PiggyBank",
    nameEn: "Retail Deposits & Savings",
    nameAr: "الودائع وحسابات التوفير",
    category: "finance",
    keywords: ["savings", "deposits", "retail", "توفير", "ودائع", "حسابات"]
  },
  {
    id: "BarChart3",
    nameEn: "Financial Planning & Analytics",
    nameAr: "التخطيط المالي والتحليلات",
    category: "finance",
    keywords: ["budget", "planning", "analytics", "تخطيط", "موازنة", "تحليل"]
  },

  // 3. Customer Care, Operations & Sales
  {
    id: "Headphones",
    nameEn: "Contact Center & Customer Care",
    nameAr: "مركز الاتصال وخدمة العملاء",
    category: "customer",
    keywords: ["call", "contact", "support", "care", "اتصال", "خدمة", "عملاء", "دعم", "كول سنتر"]
  },
  {
    id: "PhoneCall",
    nameEn: "Telephony & Inbound Support",
    nameAr: "الاتصالات والدعم الهاتفي",
    category: "customer",
    keywords: ["phone", "telecom", "inbound", "هاتف", "مكالمات", "اتصالات"]
  },
  {
    id: "Briefcase",
    nameEn: "Back Office Operations",
    nameAr: "العمليات المصرفية والدعم",
    category: "customer",
    keywords: ["backoffice", "operations", "processing", "عمليات", "باك اوفيس", "دعم"]
  },
  {
    id: "Layers",
    nameEn: "Central Operations & Clearing",
    nameAr: "العمليات المركزية والمقاصة",
    category: "customer",
    keywords: ["clearing", "central", "operations", "مقاصة", "مركزي", "عمليات"]
  },
  {
    id: "HeartHandshake",
    nameEn: "VIP Banking & Customer Relations",
    nameAr: "كبار العملاء والعلاقات العامة",
    category: "customer",
    keywords: ["vip", "relations", "clients", "partners", "علاقات", "كبار", "عملاء", "شراكات"]
  },
  {
    id: "Target",
    nameEn: "Sales & Business Development",
    nameAr: "المبيعات وتطوير الأعمال",
    category: "customer",
    keywords: ["sales", "growth", "business", "targets", "مبيعات", "تطوير", "اهداف"]
  },

  // 4. Quality, Audit, Security & Risk
  {
    id: "ShieldCheck",
    nameEn: "Quality Assurance & Auditing",
    nameAr: "إدارة الجودة والتدقيق",
    category: "audit",
    keywords: ["qa", "quality", "audit", "assurance", "جودة", "تدقيق", "ضمان"]
  },
  {
    id: "ShieldAlert",
    nameEn: "AML & Anti-Fraud Security",
    nameAr: "مكافحة الاحتيال وغسل الأموال",
    category: "audit",
    keywords: ["fraud", "aml", "security", "احتيال", "غسل", "اموال", "مكافحة"]
  },
  {
    id: "FileCheck",
    nameEn: "Risk Management & Credit",
    nameAr: "إدارة المخاطر والائتمان",
    category: "audit",
    keywords: ["risk", "credit", "loans", "مخاطر", "ائتمان", "قروض"]
  },
  {
    id: "Lock",
    nameEn: "Information & Cyber Security",
    nameAr: "أمن المعلومات والأمن السيبراني",
    category: "audit",
    keywords: ["cyber", "infosec", "security", "امن", "سيبراني", "معلومات", "حماية"]
  },
  {
    id: "Search",
    nameEn: "Internal Inspection & Oversight",
    nameAr: "التفتيش والرقابة الداخلية",
    category: "audit",
    keywords: ["inspection", "oversight", "رقابة", "تفتيش", "متابعة"]
  },

  // 5. Technology, Digital & Systems
  {
    id: "Laptop",
    nameEn: "IT & Core Banking Systems",
    nameAr: "تكنولوجيا المعلومات والأنظمة",
    category: "tech",
    keywords: ["it", "systems", "core", "software", "تكنولوجيا", "معلومات", "انظمة", "برمجيات"]
  },
  {
    id: "Server",
    nameEn: "Infrastructure & Data Centers",
    nameAr: "البنية التحتية والسيرفرات",
    category: "tech",
    keywords: ["server", "infrastructure", "cloud", "سيرفرات", "بنية", "تحتية", "سحابية"]
  },
  {
    id: "Smartphone",
    nameEn: "Digital Banking & Mobile App",
    nameAr: "التطبيقات والخدمات الرقمية",
    category: "tech",
    keywords: ["app", "mobile", "digital", "تطبيق", "موبايل", "رقمي"]
  },
  {
    id: "Database",
    nameEn: "Data Management & BI",
    nameAr: "إدارة البيانات والتحليلات",
    category: "tech",
    keywords: ["database", "data", "bi", "بيانات", "قواعد", "ذكاء"]
  },

  // 6. HR, Training & Development
  {
    id: "Users",
    nameEn: "Human Resources & Talent",
    nameAr: "الموارد البشرية وشؤون الموظفين",
    category: "hr",
    keywords: ["hr", "personnel", "talent", "موارد", "بشرية", "موظفين", "توظيف"]
  },
  {
    id: "GraduationCap",
    nameEn: "Training & Banking Academy",
    nameAr: "التدريب والتطوير المصرفي",
    category: "hr",
    keywords: ["training", "academy", "learning", "تدريب", "تطوير", "اكاديمية", "تعليم"]
  },
  {
    id: "Award",
    nameEn: "Excellence & Performance",
    nameAr: "التميز والأداء المؤسسي",
    category: "hr",
    keywords: ["award", "excellence", "kpi", "تميز", "اداء", "جوائز"]
  },
  {
    id: "BookOpen",
    nameEn: "Banking Policies & Knowledge",
    nameAr: "السياسات والمعرفة المصرفية",
    category: "hr",
    keywords: ["policy", "knowledge", "rules", "سياسات", "لوائح", "معرفة"]
  }
];

export const BANK_ICON_COMPONENTS: Record<string, LucideIcon> = {
  Landmark,
  Building2,
  Building,
  Scale,
  CreditCard,
  Wallet,
  CircleDollarSign,
  Banknote,
  Coins,
  Receipt,
  PiggyBank,
  BarChart3,
  Headphones,
  PhoneCall,
  Briefcase,
  Layers,
  HeartHandshake,
  Target,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Lock,
  Search,
  Laptop,
  Server,
  Smartphone,
  Database,
  Users,
  GraduationCap,
  Award,
  BookOpen
};

export function getDepartmentIcon(iconName?: string): LucideIcon {
  if (iconName && BANK_ICON_COMPONENTS[iconName]) {
    return BANK_ICON_COMPONENTS[iconName];
  }
  return Building2;
}

export function getDepartmentIconMeta(iconName?: string): BankIconItem {
  const found = BANK_DEPARTMENT_ICONS.find(item => item.id === iconName);
  if (found) return found;
  return BANK_DEPARTMENT_ICONS[1]; // Building2 fallback
}
