export type Language = "en" | "ar";

export interface Translations {
  // Top Header
  appTitle: string;
  appSubtitle: string;
  evaluationTab: string;
  adminBadge: string;
  languageButton: string;

  // Toolbar
  annualBadge: string;
  manageCriteria: string;
  manageStaff: string;
  whosPending: string;
  printPdf: string;
  selectEmployeePrompt: string;
  availableCount: string;
  searchEmployeePlaceholder: string;

  // Hero Card
  submittedAt: string;
  viewOnly: string;
  finalScore: string;
  ratingTier: string;
  status: string;
  draft: string;
  selfDone: string;
  finalized: string;
  pendingReview: string;
  contactCenter: string;
  teamLeader: string;
  trainer: string;
  qaRole: string;
  backOffice: string;

  // Rating Scale Legend
  ratingScaleTitle: string;
  tier5: string;
  tier4: string;
  tier3: string;
  tier2: string;
  tier1: string;

  // Evaluation Table
  section1Title: string;
  section1Desc: string;
  section2Title: string;
  section2Desc: string;
  colMetric: string;
  colSelf: string;
  colManager: string;
  colGap: string;
  colAction: string;
  sectionAverage: string;
  awaitingReview: string;
  addCriterionToSection: string;

  // Summary Section
  overallSummaryTitle: string;
  selfReviewCard: string;
  managerReviewCard: string;
  officialFinalRatingCard: string;
  kpiAverage: string;
  competencyAverage: string;
  combinedScore: string;
  officialRatingDescription: string;

  // Qualitative Feedback & Notes
  keyStrengths: string;
  areasForDevelopment: string;
  managerComments: string;
  employeeComments: string;
  strengthsPlaceholder: string;
  improvementsPlaceholder: string;
  managerCommentsPlaceholder: string;
  employeeCommentsPlaceholder: string;
  colNotes: string;
  addNote: string;
  noteAdded: string;
  notesSectionTitle: string;
  notesSectionSubtitle: string;
  noteAuthorManager: string;
  noteAuthorEmployee: string;
  noteTopicLabel: string;
  topicAchievement: string;
  topicJustification: string;
  topicImprovement: string;
  topicIncident: string;
  topicGeneral: string;
  noteTextPlaceholder: string;
  closeNote: string;
  saveNote: string;

  // Footer Actions
  lastSaved: string;
  saveDraft: string;
  submitSelf: string;
  updateSelf: string;
  approveFinalize: string;
  updateFinalize: string;

  // Modals
  criteriaModalTitle: string;
  criteriaModalSubtitle: string;
  addCriterionTitle: string;
  criterionNameLabel: string;
  criterionNamePlaceholder: string;
  criterionSectionLabel: string;
  criterionScaleLabel: string;
  criterionDescLabel: string;
  criterionDescPlaceholder: string;
  saveCriterionBtn: string;
  existingCriteriaTitle: string;
  newSectionBtn: string;
  resetDefaultsBtn: string;
  closeBtn: string;

  staffModalTitle: string;
  staffModalSubtitle: string;
  employeesTab: string;
  departmentsTab: string;
  addEmployeeBtn: string;
  addDepartmentBtn: string;
  employeeNameLabel: string;
  employeeIdLabel: string;
  departmentLabel: string;
  roleLabel: string;
  teamLabel: string;
  roleCategoryLabel: string;
  saveEmployeeBtn: string;
  saveDepartmentBtn: string;
  deptNameLabel: string;
  deptDescLabel: string;
  evaluateNowBtn: string;
  deleteConfirmMsg: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Top Header
    appTitle: "Performance Evaluation",
    appSubtitle: "Annual Performance Review",
    evaluationTab: "Evaluation",
    adminBadge: "ADMIN",
    languageButton: "العربية",

    // Toolbar
    annualBadge: "Annual Evaluation",
    manageCriteria: "Manage Criteria",
    manageStaff: "Employees & Departments",
    whosPending: "Who's Pending?",
    printPdf: "Print / PDF",
    selectEmployeePrompt: "Select Employee...",
    availableCount: "Available",
    searchEmployeePlaceholder: "Search employee across all teams...",

    // Hero Card
    submittedAt: "Submitted:",
    viewOnly: "View Only",
    finalScore: "Final Score",
    ratingTier: "Rating Tier",
    status: "Status",
    draft: "Draft",
    selfDone: "Self Done",
    finalized: "Finalized",
    pendingReview: "Pending Review",
    contactCenter: "Contact Center",
    teamLeader: "Team Leader",
    trainer: "Trainer",
    qaRole: "Quality Assurance",
    backOffice: "Back Office",

    // Rating Scale Legend
    ratingScaleTitle: "Rating Scale (1 to 5):",
    tier5: "Outstanding",
    tier4: "Exceeds Expectations",
    tier3: "Meets Expectations",
    tier2: "Developing",
    tier1: "Needs Improvement",

    // Evaluation Table
    section1Title: "Leadership & Role KPI Evaluation",
    section1Desc: "Role-specific operational and leadership KPIs evaluated manually on an executive 1 to 5 scale.",
    section2Title: "Core Competencies Evaluation",
    section2Desc: "Assessment of core institutional competencies and behavioral indicators (Rate 1 to 5).",
    colMetric: "Role KPI Metric & Objectives",
    colSelf: "Self-Evaluation",
    colManager: "Manager Evaluation",
    colGap: "Gap",
    colAction: "Action",
    sectionAverage: "Section Average (1-5):",
    awaitingReview: "Awaiting Review",
    addCriterionToSection: "Add Criterion to Section",

    // Summary Section
    overallSummaryTitle: "Overall Performance Summary",
    selfReviewCard: "Self-Review",
    managerReviewCard: "Manager Review",
    officialFinalRatingCard: "OFFICIAL FINAL RATING",
    kpiAverage: "KPI Average:",
    competencyAverage: "Competency Average:",
    combinedScore: "Combined Score:",
    officialRatingDescription: "Frequently performs above expectations and consistently delivers high-quality work.",

    // Qualitative Feedback & Notes
    keyStrengths: "Key Strengths",
    areasForDevelopment: "Areas for Development",
    managerComments: "Manager Comments & Recommendations",
    employeeComments: "Employee Self-Reflection & Goals",
    strengthsPlaceholder: "Highlight key accomplishments, standout contributions, and exemplary performance...",
    improvementsPlaceholder: "Identify focus areas, skill development targets, and training priorities...",
    managerCommentsPlaceholder: "Official management review, observations, and recommendations for the year...",
    employeeCommentsPlaceholder: "Employee self-reflection, achievements, challenges, and goals for the upcoming year...",
    colNotes: "Notes",
    addNote: "+ Note",
    noteAdded: "Note Added",
    notesSectionTitle: "Performance Notes & Development Plans",
    notesSectionSubtitle: "Executive feedback, employee self-reflection, strengths, and areas for improvement.",
    noteAuthorManager: "Manager Note",
    noteAuthorEmployee: "Employee Note",
    noteTopicLabel: "Note Topic / Reason",
    topicAchievement: "Standout Achievement",
    topicJustification: "Score Justification",
    topicImprovement: "Area for Improvement",
    topicIncident: "Specific Case / Incident",
    topicGeneral: "General Observation",
    noteTextPlaceholder: "Enter specific feedback, observations, or rationale for this metric...",
    closeNote: "Done",
    saveNote: "Save Note",

    // Footer Actions
    lastSaved: "Last Saved:",
    saveDraft: "Save Draft",
    submitSelf: "Submit Self-Evaluation",
    updateSelf: "Update Self-Evaluation",
    approveFinalize: "Approve & Finalize Evaluation",
    updateFinalize: "Update & Finalize Evaluation",

    // Modals
    criteriaModalTitle: "Annual Criteria Management",
    criteriaModalSubtitle: "Customize and add performance KPIs and competencies for the annual evaluation",
    addCriterionTitle: "Add New Evaluation Criterion",
    criterionNameLabel: "Criterion Title *",
    criterionNamePlaceholder: "e.g. Communication, Problem Solving, Leadership",
    criterionSectionLabel: "Assigned Section *",
    criterionScaleLabel: "Rating Scale",
    criterionDescLabel: "Description & Behavioral Indicators",
    criterionDescPlaceholder: "Describe expectations and observable behaviors for top performance...",
    saveCriterionBtn: "Save Criterion",
    existingCriteriaTitle: "Active Criteria",
    newSectionBtn: "New Section",
    resetDefaultsBtn: "Reset to Defaults",
    closeBtn: "Done & Close",

    staffModalTitle: "Employees & Departments Management",
    staffModalSubtitle: "Add, edit, and organize staff rosters and departments for annual evaluation",
    employeesTab: "Employees",
    departmentsTab: "Departments",
    addEmployeeBtn: "Add New Employee",
    addDepartmentBtn: "Add New Department",
    employeeNameLabel: "Employee Full Name *",
    employeeIdLabel: "Employee ID *",
    departmentLabel: "Department *",
    roleLabel: "Job Title *",
    teamLabel: "Team Name",
    roleCategoryLabel: "Role Category",
    saveEmployeeBtn: "Save Employee",
    saveDepartmentBtn: "Save Department",
    deptNameLabel: "Department Name *",
    deptDescLabel: "Department Scope / Description",
    evaluateNowBtn: "Evaluate Now",
    deleteConfirmMsg: "Are you sure you want to delete this item?"
  },
  ar: {
    // Top Header
    appTitle: "تقييم الأداء",
    appSubtitle: "مراجعة وتقييم الأداء السنوي",
    evaluationTab: "التقييم",
    adminBadge: "مسؤول",
    languageButton: "English",

    // Toolbar
    annualBadge: "التقييم السنوي",
    manageCriteria: "معايير التقييم",
    manageStaff: "الموظفين والأقسام",
    whosPending: "المتبقون للتقييم",
    printPdf: "طباعة / PDF",
    selectEmployeePrompt: "اختر الموظف...",
    availableCount: "متاح",
    searchEmployeePlaceholder: "بحث عن موظف في كافة الفرق...",

    // Hero Card
    submittedAt: "تاريخ الإرسال:",
    viewOnly: "للقراءة فقط",
    finalScore: "الدرجة النهائية",
    ratingTier: "فئة التقييم",
    status: "الحالة",
    draft: "مسودة",
    selfDone: "تم الذاتي",
    finalized: "معتمد رسمي",
    pendingReview: "قيد المراجعة",
    contactCenter: "مركز خدمة العملاء",
    teamLeader: "قائد فريق",
    trainer: "مدرب",
    qaRole: "إدارة الجودة",
    backOffice: "العمليات والدعم",

    // Rating Scale Legend
    ratingScaleTitle: "مقياس التقييم الرسمي (1 إلى 5):",
    tier5: "متميز جداً",
    tier4: "يفوق التوقعات",
    tier3: "يلبي التوقعات",
    tier2: "يحتاج تطوير",
    tier1: "غير مرضٍ",

    // Evaluation Table
    section1Title: "تقييم مؤشرات الأداء الوظيفي والقيادي",
    section1Desc: "مؤشرات أداء تشغيلية وقيادية يتم تقييمها على مقياس تنفيذي من 1 إلى 5 درجات.",
    section2Title: "تقييم الكفاءات والسلوكيات المؤسسية",
    section2Desc: "تقييم الكفاءات والسلوكيات المؤسسية الأساسية المعتمدة (من 1 إلى 5 درجات).",
    colMetric: "معيار التقييم والمؤشرات السلوكية",
    colSelf: "التقييم الذاتي",
    colManager: "تقييم المدير المسؤول",
    colGap: "الفارق",
    colAction: "إجراء",
    sectionAverage: "معدل القسم (1-5):",
    awaitingReview: "بانتظار تقييم المدير",
    addCriterionToSection: "إضافة معيار لهذا القسم",

    // Summary Section
    overallSummaryTitle: "ملخص التقييم العام لأداء الموظف",
    selfReviewCard: "التقييم الذاتي للموظف",
    managerReviewCard: "تقييم المدير المسؤول",
    officialFinalRatingCard: "التقييم النهائي المعتمد",
    kpiAverage: "معدل مؤشرات الأداء:",
    competencyAverage: "معدل الكفاءات:",
    combinedScore: "الدرجة المشتركة:",
    officialRatingDescription: "أداء متميز يفوق التوقعات المحددة بانتظام وبجودة عمل عالية.",

    // Qualitative Feedback & Notes
    keyStrengths: "أبرز نقاط القوة والإنجازات",
    areasForDevelopment: "مجالات التحسين والتطوير المستقبلي",
    managerComments: "ملاحظات وتوصيات الإدارة والمدير",
    employeeComments: "ملاحظات وتطلعات الموظف الذاتية",
    strengthsPlaceholder: "أبرز الإنجازات والمهارات الاستثنائية التي قدمها الموظف خلال العام...",
    improvementsPlaceholder: "الفرص التدريبية ومجالات التطوير المقترحة للمرحلة القادمة...",
    managerCommentsPlaceholder: "التقييم النهائي والتوجيهات الإدارية السنوية وتوصيات التطوير من قبل المسؤول...",
    employeeCommentsPlaceholder: "التقييم الذاتي للموظف، التحديات، والأهداف المهنية للعام القادم...",
    colNotes: "الملاحظات",
    addNote: "+ ملاحظة",
    noteAdded: "ملاحظة مسجلة",
    notesSectionTitle: "قسم الملاحظات والتوصيات وخطط التطوير",
    notesSectionSubtitle: "ملاحظات تفصيلية وتوصيات إدارية، تطلعات الموظف، نقاط القوة، ومجالات التطوير.",
    noteAuthorManager: "ملاحظة المدير",
    noteAuthorEmployee: "ملاحظة الموظف",
    noteTopicLabel: "محور الملاحظة (على شنو النوت)",
    topicAchievement: "إنجاز متميز واستثنائي",
    topicJustification: "تبرير الدرجة والأدلة",
    topicImprovement: "نقطة للتحسين وخطة عمل",
    topicIncident: "متابعة حالة أو موقف محدد",
    topicGeneral: "ملاحظة عامة",
    noteTextPlaceholder: "اكتب الملاحظات، تبرير الدرجة، أو شواهد الأداء لهذا المعيار...",
    closeNote: "تم",
    saveNote: "حفظ الملاحظة",

    // Footer Actions
    lastSaved: "آخر حفظ:",
    saveDraft: "حفظ كمسودة",
    submitSelf: "إرسال التقييم الذاتي",
    updateSelf: "تحديث التقييم الذاتي",
    approveFinalize: "اعتماد وتثبيت التقييم السنوي",
    updateFinalize: "تحديث واعتماد التقييم السنوي",

    // Modals
    criteriaModalTitle: "إدارة معايير التقييم السنوي",
    criteriaModalSubtitle: "تخصيص وإضافة معايير الأداء الوظيفي والكفاءات للتقييم السنوي",
    addCriterionTitle: "إضافة معيار تقييم جديد",
    criterionNameLabel: "اسم المعيار *",
    criterionNamePlaceholder: "مثال: القيادة، جودة العمل، التواصل الفعّال",
    criterionSectionLabel: "القسم التابع له المعيار *",
    criterionScaleLabel: "مقياس الدرجات",
    criterionDescLabel: "الوصف والمؤشرات السلوكية المطلوبة",
    criterionDescPlaceholder: "وصف ما هو متوقع من الموظف لتحقيق الدرجة المتميزة...",
    saveCriterionBtn: "حفظ المعيار",
    existingCriteriaTitle: "المعايير المسجلة حالياً",
    newSectionBtn: "قسم جديد",
    resetDefaultsBtn: "إعادة التعيين للافتراضي",
    closeBtn: "تم وإغلاق",

    staffModalTitle: "إدارة الموظفين والأقسام",
    staffModalSubtitle: "إضافة وتعديل بيانات الموظفين والأقسام للتقييم السنوي",
    employeesTab: "الموظفين",
    departmentsTab: "الأقسام",
    addEmployeeBtn: "إضافة موظف جديد",
    addDepartmentBtn: "إضافة قسم جديد",
    employeeNameLabel: "اسم الموظف الكامل *",
    employeeIdLabel: "الرقم الوظيفي *",
    departmentLabel: "القسم *",
    roleLabel: "المسمى الوظيفي *",
    teamLabel: "اسم الفريق",
    roleCategoryLabel: "نوع الدور الوظيفي",
    saveEmployeeBtn: "إضافة الموظف",
    saveDepartmentBtn: "إضافة القسم",
    deptNameLabel: "اسم القسم *",
    deptDescLabel: "وصف مهام القسم",
    evaluateNowBtn: "تقييم الآن",
    deleteConfirmMsg: "هل أنت متأكد من الحذف؟"
  }
};
