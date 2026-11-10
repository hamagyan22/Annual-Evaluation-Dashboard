const fs = require('fs');

const targetFile = 'C:/Users/fib/.gemini/antigravity/scratch/performance-dashboard/src/components/AnnualEvaluationDashboard.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

console.log('Original content length:', content.length);

// 1. Add Globe, Languages to lucide imports and import translations
if (!content.includes('TRANSLATIONS')) {
  content = content.replace(
    'import { \n  ArrowLeft, Search, Users, Check, Save, Sliders, Building2, Plus, Trash2, Edit2,',
    'import { \n  ArrowLeft, Search, Users, Check, Save, Sliders, Building2, Plus, Trash2, Edit2, Globe, Languages,'
  );

  content = content.replace(
    'import { ManageStaffModal } from "@/components/ManageStaffModal";',
    'import { ManageStaffModal } from "@/components/ManageStaffModal";\nimport { TRANSLATIONS, Language } from "@/lib/translations";'
  );
  console.log('Added translation imports and Globe icon');
}

// 2. Add lang state
const langStateSearch = `  // Dynamic Criteria, Sections, Departments, Employees`;
const langStateInsert = `  // Language State: default 'en' (English by default as requested!)
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("fib_eval_language") as Language;
      if (savedLang === "ar" || savedLang === "en") {
        setLang(savedLang);
      }
    }
  }, []);

  // Dynamic Criteria, Sections, Departments, Employees`;

if (!content.includes('const [lang, setLang] = useState<Language>')) {
  content = content.replace(langStateSearch, langStateInsert);
  console.log('Added language state and toggle helper');
}

// 3. Update UnifiedTopNavbar call in AnnualEvaluationDashboard.tsx:
// Pass showOnlyEvaluation={true} and extraActions with the Language switcher!
const topNavbarSearch = `            <UnifiedTopNavbar
              currentDashboard="evaluation"
              userProfile={userProfile}
              onNavigate={onNavigate}
              onLogout={onLogout || onBack}
              onOpenProfile={onOpenProfile}
              onOpenSettings={onOpenSettings}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />`;

const topNavbarReplacement = `            <UnifiedTopNavbar
              currentDashboard="evaluation"
              userProfile={userProfile}
              onNavigate={onNavigate}
              onLogout={onLogout || onBack}
              onOpenProfile={onOpenProfile}
              onOpenSettings={onOpenSettings}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              showOnlyEvaluation={true}
              extraActions={
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 text-xs font-black text-gray-800 dark:text-gray-200 transition active:scale-95 cursor-pointer shadow-2xs"
                  title={isAr ? "Switch to English" : "التبديل إلى العربية"}
                >
                  <Globe size={13} className="text-[#1C6B53] dark:text-emerald-400" />
                  <span>{t.languageButton}</span>
                </button>
              }
            />`;

if (content.includes(topNavbarSearch)) {
  content = content.replace(topNavbarSearch, topNavbarReplacement);
  console.log('Updated UnifiedTopNavbar with showOnlyEvaluation and languageButton');
}

// 4. Update Header Subtitle
content = content.replace(
  'Semi-Annual & Annual Performance Review',
  '{t.appSubtitle}'
);
content = content.replace(
  'Annual Performance Review | مراجعة وتقييم الأداء السنوي',
  '{t.appSubtitle}'
);

// 5. Update Toolbar Buttons to use t.xxx
content = content.replace(
  '<span>التقييم السنوي • Annual</span>',
  '<span>{t.annualBadge}</span>'
);
content = content.replace(
  '<span>معايير التقييم</span>',
  '<span>{t.manageCriteria}</span>'
);
content = content.replace(
  '<span>الموظفين والأقسام</span>',
  '<span>{t.manageStaff}</span>'
);
content = content.replace(
  '<span>Who&apos;s Pending?</span>',
  '<span>{t.whosPending}</span>'
);
content = content.replace(
  '<span>Who\'s Pending?</span>',
  '<span>{t.whosPending}</span>'
);
content = content.replace(
  '<span className="hidden sm:inline">Print / PDF</span>',
  '<span className="hidden sm:inline">{t.printPdf}</span>'
);

// 6. Update Green Hero Card text
content = content.replace(
  '<div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">\n                    Final Score\n                  </div>',
  '<div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">\n                    {t.finalScore}\n                  </div>'
);
content = content.replace(
  '<div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">\n                    Rating Tier\n                  </div>',
  '<div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">\n                    {t.ratingTier}\n                  </div>'
);
content = content.replace(
  '<div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">\n                    Status\n                  </div>',
  '<div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">\n                    {t.status}\n                  </div>'
);
content = content.replace(
  `{evaluationStatus === 'manager_finalized' ? 'Finalized' :
                         evaluationStatus === 'self_submitted' ? 'Self Done' : 'Draft'}`,
  `{evaluationStatus === 'manager_finalized' ? t.finalized :
                         evaluationStatus === 'self_submitted' ? t.selfDone : t.draft}`
);

// 7. Update Rating Scale Title
content = content.replace(
  '<span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Rating Scale (1 to 5):</span>',
  '<span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{t.ratingScaleTitle}</span>'
);

// 8. Update Table Column Headers
content = content.replace(
  '<span>Self-Evaluation {currentMemberRoleType === "agent" ? "(Agent)" : ""}</span>',
  '<span>{t.colSelf} {currentMemberRoleType === "agent" ? "(Agent)" : ""}</span>'
);
content = content.replace(
  '<span>Manager Evaluation</span>',
  '<span>{t.colManager}</span>'
);
content = content.replace(
  '<th className="p-3.5 text-center w-20">Gap</th>',
  '<th className="p-3.5 text-center w-20">{t.colGap}</th>'
);

// 9. Update Section Titles
content = content.replace(
  `{currentMemberRoleType === "trainer" ? "Training Performance KPI Evaluation" :
                     currentMemberRoleType === "qa" ? "Quality Assurance KPI Evaluation" :
                     currentMemberRoleType === "tl" ? "Leadership & Team Management KPI Evaluation" :
                     currentMemberRoleType === "backoffice" ? "Back Office Operational KPI Evaluation" :
                     "Operational KPI Evaluation"}`,
  `{t.section1Title}`
);
content = content.replace(
  `{currentMemberRoleType !== "agent" 
                    ? "Role-specific operational KPIs evaluated manually on an executive 1 to 5 scale." 
                    : "Operational performance metrics evaluation (Rate 1 to 5)."}`,
  `{t.section1Desc}`
);
content = content.replace(
  'Core Competencies Evaluation',
  '{t.section2Title}'
);
content = content.replace(
  `Assessment of the {activeCompetenciesList.length} core institutional competencies (Rate 1 to 5).`,
  `{t.section2Desc}`
);

// 10. Update Section Averages row
content = content.replace(
  '<span>Leadership & Role KPI Average (1-5):</span>',
  '<span>{t.sectionAverage}</span>'
);
content = content.replace(
  '<span>Competency Average (1-5):</span>',
  '<span>{t.sectionAverage}</span>'
);
content = content.replace(
  'Overall Performance Summary',
  '{t.overallSummaryTitle}'
);
content = content.replace(
  '<span>KPI Average:</span>',
  '<span>{t.kpiAverage}</span>'
);
content = content.replace(
  '<span>Competency Average:</span>',
  '<span>{t.competencyAverage}</span>'
);
content = content.replace(
  '<span>Combined Score:</span>',
  '<span>{t.combinedScore}</span>'
);
content = content.replace(
  'Official Final Rating',
  '{t.officialFinalRatingCard}'
);

// 11. Update Footer buttons
content = content.replace(
  '<span>Save Draft</span>',
  '<span>{t.saveDraft}</span>'
);
content = content.replace(
  `<span>{evaluationStatus === 'manager_finalized' ? 'Update & Finalize Evaluation' : 'Approve & Finalize Evaluation'}</span>`,
  `<span>{evaluationStatus === 'manager_finalized' ? t.updateFinalize : t.approveFinalize}</span>`
);
content = content.replace(
  `<span>{evaluationStatus === 'self_submitted' ? 'Update Self-Evaluation' : 'Submit Self-Evaluation'}</span>`,
  `<span>{evaluationStatus === 'self_submitted' ? t.updateSelf : t.submitSelf}</span>`
);

// 12. Pass lang={lang} to ManageCriteriaModal and ManageStaffModal
content = content.replace(
  '<ManageCriteriaModal\n        isOpen={showManageCriteriaModal}',
  '<ManageCriteriaModal\n        lang={lang}\n        isOpen={showManageCriteriaModal}'
);
content = content.replace(
  '<ManageStaffModal\n        isOpen={showManageStaffModal}',
  '<ManageStaffModal\n        lang={lang}\n        isOpen={showManageStaffModal}'
);

// 13. Update root container dir:
content = content.replace(
  '<div className="min-h-screen bg-[#F9F8F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans p-3 sm:p-6 transition-colors duration-200">',
  '<div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#F9F8F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans p-3 sm:p-6 transition-colors duration-200">'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Updated AnnualEvaluationDashboard.tsx with bilingual support and hidden other tabs!');
