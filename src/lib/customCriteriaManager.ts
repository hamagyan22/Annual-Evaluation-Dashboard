// Dynamic Criteria, Departments, and Staff Management for Annual Performance Review
// Supports localStorage persistence with real-time reactive state

export interface DynamicCriterion {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  sectionId: string; // 'kpi' | 'competencies' | custom
  sectionName?: string;
  isDefault?: boolean;
  noteGuideline?: string;
  noteGuidelineAr?: string;
  targetRole?: "all" | "manager" | "employee";
}

export interface DynamicSection {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  order: number;
}

export interface DynamicDepartment {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  color?: string;
}

export interface DynamicEmployee {
  id: string;
  name: string;
  employee_id: string;
  department: string;
  role: string;
  team?: string;
  direct_manager?: string;
  custom_position?: string;
  email?: string;
  role_type?: "trainer" | "qa" | "tl" | "backoffice" | "agent" | "custom";
}

// Default Sections
export const DEFAULT_SECTIONS: DynamicSection[] = [
  {
    id: "kpi",
    title: "Leadership & Role KPI Evaluation",
    titleAr: "مؤشرات الأداء الوظيفي والقيادي",
    description: "Role-specific operational and leadership KPIs evaluated manually on an executive 1 to 5 scale.",
    order: 1
  },
  {
    id: "competencies",
    title: "Core Competencies Evaluation",
    titleAr: "تقييم الكفاءات والسلوكيات المؤسسية",
    description: "Assessment of institutional core competencies and behavioral indicators (Rate 1 to 5).",
    order: 2
  }
];

// Default Criteria
export const DEFAULT_CRITERIA: DynamicCriterion[] = [
  // Section 1: Role KPIs
  {
    id: "leadership",
    name: "Leadership & Team Management",
    nameAr: "القيادة وإدارة الفريق",
    description: "Effectively guiding, mentoring, motivating, and supporting team members toward operational excellence.",
    descriptionAr: "التوجيه الفعال، التحفيز، ودعم أعضاء الفريق نحو التميز التشغيلي وتحقيق الأهداف.",
    sectionId: "kpi",
    sectionName: "Leadership & Role KPI Evaluation",
    isDefault: true
  },
  {
    id: "team_kpi",
    name: "Team KPI Achievement",
    nameAr: "تحقيق مؤشرات الأداء للفريق",
    description: "Achieving target Service Level, QA averages, AHT/ART benchmarks, and operational KPIs across the assigned team.",
    descriptionAr: "تحقيق مستويات الخدمة المستهدفة، معدلات الجودة، ومعايير الأداء التشغيلي المعتمدة.",
    sectionId: "kpi",
    sectionName: "Leadership & Role KPI Evaluation",
    isDefault: true
  },
  {
    id: "reporting",
    name: "Operational Reporting & Workflow",
    nameAr: "التقارير التشغيلية وسير العمل",
    description: "Timely submission of shift handovers, daily logs, SLA reports, escalation handling, and incident tracking.",
    descriptionAr: "تسليم تقارير المناوبة، سجلات الأداء، تقارير اتفاقية مستوى الخدمة، ومتابعة الحالات الطارئة بدقة.",
    sectionId: "kpi",
    sectionName: "Leadership & Role KPI Evaluation",
    isDefault: true
  },
  {
    id: "attendance",
    name: "Attendance & Team Discipline",
    nameAr: "الانضباط والالتزام بالدوام",
    description: "Team schedule adherence, punctuality, shift coverage management, and strict policy compliance.",
    descriptionAr: "الالتزام التام بجدول العمل، مواعيد المناوبات، وتطبيق السياسات التنظيمية للبنك.",
    sectionId: "kpi",
    sectionName: "Leadership & Role KPI Evaluation",
    isDefault: true
  },
  {
    id: "team_improvement",
    name: "Team Development & Coaching",
    nameAr: "تطوير وتدريب الفريق",
    description: "Continuous coaching, one-on-one reviews, skill improvement, and reducing low-performance outliers.",
    descriptionAr: "تقديم جلسات التدريب الفردية المستمرة، وتطوير مهارات الكادر ورفع الكفاءة التشغيلية.",
    sectionId: "kpi",
    sectionName: "Leadership & Role KPI Evaluation",
    isDefault: true
  },

  // Section 2: Core Competencies
  {
    id: "communication",
    name: "Communication",
    nameAr: "التواصل الفعّال",
    description: "Conveys information clearly and professionally. Actively listens, demonstrates empathy, and maintains high standards of courteous communication with customers and colleagues.",
    descriptionAr: "إيصال المعلومات بوضوح واحترافية، الاستماع الفعال، وإظهار اللباقة والاحترام مع الزملاء والعملاء.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  },
  {
    id: "problem_solving",
    name: "Problem Solving",
    nameAr: "حل المشكلات واتخاذ القرار",
    description: "Quickly diagnoses customer needs and formulates compliant, practical solutions. Maintains composure and analytical clarity during escalations.",
    descriptionAr: "السرعة في تشخيص المشكلات وابتكار حلول عملية متوافقة مع السياسات، والمحافظة على الهدوء أثناء الضغط.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  },
  {
    id: "accountability",
    name: "Accountability",
    nameAr: "المسؤولية والاعتمادية",
    description: "Takes ownership of tasks and outcomes. Follows through on commitments and addresses mistakes constructively without requiring close supervision.",
    descriptionAr: "تحمل مسؤولية المهام والنتائج، الوفاء بالالتزامات، وتصحيح الأخطاء بإيجابية دون الحاجة لإشراف مستمر.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  },
  {
    id: "responsibility",
    name: "Responsibility & Integrity",
    nameAr: "النزاهة والالتزام المهني",
    description: "Strictly complies with banking policies, data security guidelines, and work schedules. Demonstrates high integrity and reliability.",
    descriptionAr: "الالتزام الصارم بالسياسات المصرفية، أمن المعلومات، والسرية المهنية العالية.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  },
  {
    id: "initiative",
    name: "Initiative & Proactivity",
    nameAr: "المبادرة والتحسين المستمر",
    description: "Proactively suggests workflow enhancements, assists team members, and seeks professional self-development opportunities independently.",
    descriptionAr: "اقتراح تحسينات لسير العمل، مساعدة الزملاء بشكل استباقي، والسعي للتطوير المهني الذاتي.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  },
  {
    id: "team_work",
    name: "Team Work & Collaboration",
    nameAr: "العمل الجماعي وروح الفريق",
    description: "Collaborates positively with peers and leaders. Shares domain knowledge, supports team members during peak volumes, and fosters high team morale.",
    descriptionAr: "التعاون الإيجابي مع الزملاء والمسؤولين، تبادل الخبرات، ودعم الفريق خلال أوقات الذروة.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  },
  {
    id: "digitalization",
    name: "Digitalization & Innovation",
    nameAr: "التحول الرقمي والابتكار",
    description: "Actively adopts and champions digital tools, automated workflows, and innovative solutions to enhance operational quality and productivity.",
    descriptionAr: "تبني الأدوات الرقمية الحديثة، أتمتة الإجراءات، واستخدام الحلول التقنية المبتكرة لرفع الإنتاجية.",
    sectionId: "competencies",
    sectionName: "Core Competencies Evaluation",
    isDefault: true
  }
];

// Default Departments
export const DEFAULT_DEPARTMENTS: DynamicDepartment[] = [
  { id: "dept_cc", name: "Contact Center", nameAr: "مركز خدمة العملاء", color: "emerald", description: "Customer Support & Contact Center Operations" },
  { id: "dept_qa", name: "Quality Assurance", nameAr: "إدارة الجودة والتدقيق", color: "purple", description: "Call & Chat Quality Auditing and Compliance" },
  { id: "dept_training", name: "Training & Development", nameAr: "التدريب والتطوير", color: "indigo", description: "Onboarding and Continuous Professional Training" },
  { id: "dept_backoffice", name: "Back Office Operations", nameAr: "العمليات المصرفية والدعم", color: "blue", description: "Backend Case Processing, Ticketing and SLA Tracking" },
  { id: "dept_it", name: "IT & Digital Services", nameAr: "تكنولوجيا المعلومات والخدمات الرقمية", color: "slate", description: "Infrastructure, Systems & Digital Applications" },
  { id: "dept_hr", name: "Human Resources", nameAr: "الموارد البشرية", color: "amber", description: "People, Talent and Performance Management" },
  { id: "dept_finance", name: "Finance & Accounts", nameAr: "المالية والحسابات", color: "emerald", description: "Financial Operations, Budgeting & Audits" }
];

// Default Initial Employees
export const DEFAULT_EMPLOYEES: DynamicEmployee[] = [
  { id: "emp_373", name: "Younis Kamal", employee_id: "373", department: "Contact Center", role: "Team Leader", team: "Younis Kamal Team", direct_manager: "Omer Ayad", role_type: "tl" },
  { id: "emp_340", name: "Ankido Buya", employee_id: "340", department: "Contact Center", role: "Team Leader", team: "Ankido Buya Team", direct_manager: "Omer Ayad", role_type: "tl" },
  { id: "emp_338", name: "Mohammed Dlshad", employee_id: "338", department: "Contact Center", role: "Team Leader", team: "Mohammed Dlshad Team", direct_manager: "Omer Ayad", role_type: "tl" },
  { id: "emp_353", name: "Mohammed Azad", employee_id: "353", department: "Training & Development", role: "Trainer", team: "Training Team", direct_manager: "Omer Ayad", role_type: "trainer" },
  { id: "emp_356", name: "Mohammed Jihad", employee_id: "356", department: "Quality Assurance", role: "QA Auditor", team: "Quality Assurance Team", direct_manager: "Omer Ayad", role_type: "qa" },
  { id: "emp_351", name: "Lara Kamil", employee_id: "351", department: "Quality Assurance", role: "QA Specialist", team: "Quality Assurance Team", direct_manager: "Omer Ayad", role_type: "qa" },
  { id: "emp_370", name: "Shireen Waisi", employee_id: "370", department: "Back Office Operations", role: "Senior Operations Specialist", team: "Back Office", direct_manager: "Omer Ayad", role_type: "backoffice" },
  { id: "emp_339", name: "Alla Satar", employee_id: "339", department: "Contact Center", role: "Customer Care Agent", team: "Younis Kamal Team", direct_manager: "Younis Kamal", role_type: "agent" },
  { id: "emp_377", name: "Zhalla Salam", employee_id: "377", department: "Contact Center", role: "Customer Care Agent", team: "Ankido Buya Team", direct_manager: "Ankido Buya", role_type: "agent" },
  { id: "emp_364", name: "Rabar Mohammed", employee_id: "364", department: "Contact Center", role: "Customer Care Agent", team: "Mohammed Dlshad Team", direct_manager: "Mohammed Dlshad", role_type: "agent" },
  { id: "emp_372", name: "Taban Sirwan", employee_id: "372", department: "Contact Center", role: "Customer Care Agent", team: "Younis Kamal Team", direct_manager: "Younis Kamal", role_type: "agent" },
  { id: "emp_344", name: "Dhuha Khanjer", employee_id: "344", department: "Contact Center", role: "Customer Care Agent", team: "Ankido Buya Team", direct_manager: "Ankido Buya", role_type: "agent" }
];

// LocalStorage Keys
const STORAGE_CRITERIA_KEY = "fib_annual_eval_criteria_v2";
const STORAGE_SECTIONS_KEY = "fib_annual_eval_sections_v2";
const STORAGE_DEPARTMENTS_KEY = "fib_annual_eval_departments_v2";
const STORAGE_EMPLOYEES_KEY = "fib_annual_eval_employees_v2";
const STORAGE_EVALUATIONS_PREFIX = "fib_annual_evaluation_doc_";

export function sanitizeCriterion(c: DynamicCriterion): DynamicCriterion {
  // If name contains Arabic in parentheses, e.g. "Leadership (القيادة)", strip it for clean English
  const cleanName = (c.name || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim();
  let cleanNameAr = c.nameAr;
  if (!cleanNameAr) {
    const match = (c.name || "").match(/\(([\u0600-\u06FF\s،؛ـ-]+)\)/);
    if (match) cleanNameAr = match[1].trim();
  }
  const cleanDesc = (c.description || "").replace(/\s*\([\u0600-\u06FF\s،؛ـ-]+\)/g, "").trim();

  return {
    ...c,
    name: cleanName || c.name,
    nameAr: cleanNameAr || c.nameAr,
    description: cleanDesc || c.description
  };
}

// Helpers
export function loadStoredCriteria(): DynamicCriterion[] {
  if (typeof window === "undefined") return DEFAULT_CRITERIA.map(sanitizeCriterion);
  try {
    const raw = localStorage.getItem(STORAGE_CRITERIA_KEY);
    if (!raw) {
      const sanitized = DEFAULT_CRITERIA.map(sanitizeCriterion);
      localStorage.setItem(STORAGE_CRITERIA_KEY, JSON.stringify(sanitized));
      return sanitized;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed.map(sanitizeCriterion);
      localStorage.setItem(STORAGE_CRITERIA_KEY, JSON.stringify(sanitized));
      return sanitized;
    }
    return DEFAULT_CRITERIA.map(sanitizeCriterion);
  } catch (e) {
    console.error("Error loading criteria from localStorage:", e);
    return DEFAULT_CRITERIA.map(sanitizeCriterion);
  }
}

export function saveStoredCriteria(criteria: DynamicCriterion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CRITERIA_KEY, JSON.stringify(criteria));
  } catch (e) {
    console.error("Error saving criteria to localStorage:", e);
  }
}

export function loadStoredSections(): DynamicSection[] {
  if (typeof window === "undefined") return DEFAULT_SECTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_SECTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(DEFAULT_SECTIONS));
      return DEFAULT_SECTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SECTIONS;
  } catch (e) {
    console.error("Error loading sections from localStorage:", e);
    return DEFAULT_SECTIONS;
  }
}

export function saveStoredSections(sections: DynamicSection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(sections));
  } catch (e) {
    console.error("Error saving sections to localStorage:", e);
  }
}

export function loadStoredDepartments(): DynamicDepartment[] {
  if (typeof window === "undefined") return DEFAULT_DEPARTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_DEPARTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DEPARTMENTS_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEPARTMENTS;
  } catch (e) {
    console.error("Error loading departments from localStorage:", e);
    return DEFAULT_DEPARTMENTS;
  }
}

export function saveStoredDepartments(depts: DynamicDepartment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_DEPARTMENTS_KEY, JSON.stringify(depts));
  } catch (e) {
    console.error("Error saving departments to localStorage:", e);
  }
}

export function loadStoredEmployees(): DynamicEmployee[] {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  try {
    const raw = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EMPLOYEES;
  } catch (e) {
    console.error("Error loading employees from localStorage:", e);
    return DEFAULT_EMPLOYEES;
  }
}

export function saveStoredEmployees(emps: DynamicEmployee[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(emps));
  } catch (e) {
    console.error("Error saving employees to localStorage:", e);
  }
}

// Evaluation Record Storage
export interface EvaluationRecord {
  id: string; // e.g. "2026_Annual_373"
  employeeId: string;
  employeeName: string;
  year: string;
  period: "Annual";
  status: "draft" | "self_submitted" | "manager_finalized";
  selfScores: Record<string, number>;
  managerScores: Record<string, number>;
  keyStrengths?: string;
  areasForDevelopment?: string;
  managerComments?: string;
  employeeComments?: string;
  criterionNotes?: any;
  submittedAt?: string;
  finalizedAt?: string;
  updatedAt: string;
}

export function getEvaluationDocKey(year: string, employeeIdOrName: string): string {
  const clean = (employeeIdOrName || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `${year}_Annual_${clean}`;
}

export function loadEvaluationRecord(year: string, employeeIdOrName: string): EvaluationRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const key = STORAGE_EVALUATIONS_PREFIX + getEvaluationDocKey(year, employeeIdOrName);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading evaluation record:", e);
    return null;
  }
}

export function saveEvaluationRecord(record: EvaluationRecord): void {
  if (typeof window === "undefined") return;
  try {
    const key = STORAGE_EVALUATIONS_PREFIX + getEvaluationDocKey(record.year, record.employeeId || record.employeeName);
    localStorage.setItem(key, JSON.stringify(record));
  } catch (e) {
    console.error("Error saving evaluation record:", e);
  }
}

export function loadAllEvaluationsForYear(year: string): Record<string, EvaluationRecord> {
  if (typeof window === "undefined") return {};
  const result: Record<string, EvaluationRecord> = {};
  try {
    const prefix = STORAGE_EVALUATIONS_PREFIX + `${year}_Annual_`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const doc = JSON.parse(raw);
          const docId = k.replace(STORAGE_EVALUATIONS_PREFIX, "");
          result[docId] = doc;
        }
      }
    }
  } catch (e) {
    console.error("Error loading all evaluations:", e);
  }
  return result;
}
