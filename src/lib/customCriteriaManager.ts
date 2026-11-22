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
  direct_manager?: string;
  department_chief?: string;
  icon?: string;
}

export interface DynamicEmployee {
  id: string;
  name: string;
  employee_id: string;
  department: string;
  role: string;
  team?: string;
  direct_manager?: string;
  department_chief?: string;
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

// Default Criteria (Starts completely clean - ready for custom additions)
export const DEFAULT_CRITERIA: DynamicCriterion[] = [];

// Default Departments (Starts completely clean - ready for custom additions)
export const DEFAULT_DEPARTMENTS: DynamicDepartment[] = [];

// Default Initial Employees (Starts completely clean - ready for custom additions)
export const DEFAULT_EMPLOYEES: DynamicEmployee[] = [];

// LocalStorage Keys
const STORAGE_CRITERIA_KEY = "fib_annual_eval_criteria_v2";
const STORAGE_SECTIONS_KEY = "fib_annual_eval_sections_v2";
const STORAGE_DEPARTMENTS_KEY = "fib_annual_eval_departments_v2";
const STORAGE_EMPLOYEES_KEY = "fib_annual_eval_employees_v2";
const STORAGE_EVALUATIONS_PREFIX = "fib_annual_evaluation_doc_";
export const STORAGE_DELETED_EMPLOYEES_KEY = "fib_annual_eval_deleted_employees_v2";
export const STORAGE_DELETED_DEPARTMENTS_KEY = "fib_annual_eval_deleted_departments_v2";
export const STORAGE_DELETED_CRITERIA_KEY = "fib_annual_eval_deleted_criteria_v2";

export function loadStoredDeletedEmployees(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_EMPLOYEES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredDeletedEmployees(namesOrIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_DELETED_EMPLOYEES_KEY, JSON.stringify(namesOrIds));
  } catch (e) {
    console.error("Error saving deleted employees to localStorage:", e);
  }
}

export function loadStoredDeletedDepartments(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_DEPARTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredDeletedDepartments(namesOrIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_DELETED_DEPARTMENTS_KEY, JSON.stringify(namesOrIds));
  } catch (e) {
    console.error("Error saving deleted departments to localStorage:", e);
  }
}

export function loadStoredDeletedCriteria(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_CRITERIA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredDeletedCriteria(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_DELETED_CRITERIA_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Error saving deleted criteria to localStorage:", e);
  }
}

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
  if (typeof window === "undefined") return [];
  const deletedIds = new Set(loadStoredDeletedCriteria());
  try {
    const raw = localStorage.getItem(STORAGE_CRITERIA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(c => !deletedIds.has(c.id));
      const sanitized = filtered.map(sanitizeCriterion);
      return sanitized;
    }
    return [];
  } catch (e) {
    return [];
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
  if (typeof window === "undefined") return [];
  const deletedSet = new Set(loadStoredDeletedDepartments());
  try {
    const raw = localStorage.getItem(STORAGE_DEPARTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(d => !deletedSet.has(d.id) && !deletedSet.has(d.name));
    }
    return [];
  } catch (e) {
    return [];
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
  if (typeof window === "undefined") return [];
  const deletedSet = new Set(loadStoredDeletedEmployees().map(s => s.toLowerCase().trim()));
  try {
    const raw = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(e => 
        !deletedSet.has(e.id.toLowerCase().trim()) && 
        !deletedSet.has(e.name.toLowerCase().trim())
      );
    }
    return [];
  } catch (e) {
    return [];
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
