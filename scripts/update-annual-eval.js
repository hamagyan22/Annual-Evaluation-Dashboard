const fs = require('fs');
const path = require('path');

const targetFile = 'C:/Users/fib/.gemini/antigravity/scratch/performance-dashboard/src/components/AnnualEvaluationDashboard.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

console.log('Original content length:', content.length);

// 1. Update lucide-react imports to include Sliders, Building2, Plus
if (!content.includes('Sliders, Building2')) {
  content = content.replace(
    'import { \n  ArrowLeft, Search, Users, Check, Save,',
    'import { \n  ArrowLeft, Search, Users, Check, Save, Sliders, Building2, Plus, Trash2, Edit2,'
  );
}

// 2. Add custom criteria manager imports
if (!content.includes('customCriteriaManager')) {
  const importBlock = `
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
`;
  content = content.replace(
    'import { useBodyScrollLock } from "@/lib/scrollLock";',
    'import { useBodyScrollLock } from "@/lib/scrollLock";' + importBlock
  );
}

// 3. Update state: selectedPeriod to always 'Annual' and add dynamic criteria states
const stateTarget = `  const [selectedPeriod, setSelectedPeriod] = useState<"Semi-Annual" | "Annual">("Semi-Annual");`;
const stateReplacement = `  // Period is strictly Annual (no Semi-Annual)
  const [selectedPeriod, setSelectedPeriod] = useState<"Annual">("Annual");

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
  }, []);`;

content = content.replace(stateTarget, stateReplacement);

// 4. Update Header Subtitle
content = content.replace(
  'Semi-Annual & Annual Performance Review',
  'Annual Performance Review | مراجعة وتقييم الأداء السنوي'
);

// 5. Update Toolbar Controls: Replace period switcher with Annual Badge, Criteria Button, Staff Button
const toolbarTarget = `                {/* Period Switcher */}
                <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800/90 rounded-xl border border-gray-200/70 dark:border-gray-700/70 shrink-0 h-9">
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod("Semi-Annual")}
                    className={\`flex items-center gap-1.5 px-3.5 sm:px-4 h-8 rounded-[10px] text-xs sm:text-sm font-black transition-all cursor-pointer \${
                      selectedPeriod === "Semi-Annual"
                        ? 'bg-white dark:bg-gray-700 text-[#1C6B53] dark:text-emerald-300 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }\`}
                  >
                    <span>Semi-Annual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPeriod("Annual")}
                    className={\`flex items-center gap-1.5 px-3.5 sm:px-4 h-8 rounded-[10px] text-xs sm:text-sm font-black transition-all cursor-pointer \${
                      selectedPeriod === "Annual"
                        ? 'bg-white dark:bg-gray-700 text-[#1C6B53] dark:text-emerald-300 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }\`}
                  >
                    <span>Annual</span>
                  </button>
                </div>`;

const toolbarReplacement = `                {/* Annual Evaluation Only Badge */}
                <div className="flex items-center gap-1.5 px-3 sm:px-3.5 h-9 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-black text-[#1C6B53] dark:text-emerald-300 shrink-0 shadow-2xs">
                  <Award size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                  <span>التقييم السنوي • Annual</span>
                </div>

                {/* Criteria Management Button */}
                <button
                  type="button"
                  onClick={() => setShowManageCriteriaModal(true)}
                  className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                  title="إدارة وإضافة معايير التقييم"
                >
                  <Sliders size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                  <span>معايير التقييم</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#1C6B53] text-white text-[10px] font-black">
                    {criteria.length}
                  </span>
                </button>

                {/* Employees & Departments Management Button */}
                <button
                  type="button"
                  onClick={() => setShowManageStaffModal(true)}
                  className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                  title="إدارة وإضافة الموظفين والأقسام"
                >
                  <Building2 size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                  <span>الموظفين والأقسام</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    {effectiveAllMembers.length}
                  </span>
                </button>`;

content = content.replace(toolbarTarget, toolbarReplacement);

// 6. Update Green Hero Card badge
content = content.replace(
  '{toTitleCase(selectedPeriod)} • {selectedYear}',
  'ANNUAL • {selectedYear}'
);

// 7. Update Who's Pending badge in toolbar
content = content.replace(
  '{selectedPeriod === "Semi-Annual" ? coverageData.semiPendingCount : coverageData.annualPendingCount}',
  '{coverageData.annualPendingCount}'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Updated file successfully! New length:', content.length);
