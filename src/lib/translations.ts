export type Language = "en" | "ar";

export interface Translations {
  // Top Header
  appTitle: string;
  appSubtitle: string;
  evaluationTab: string;
  adminBadge: string;
  languageButton: string;

  // Toolbar
  criteriaButton: string;
  staffButton: string;
  whosPendingButton: string;
  printPdfButton: string;
  selectEmployeePrompt: string;
  totalEmployees: string;
  availableCount: string;
  directTeamSubordinates: string;
  searchEmployeePlaceholder: string;
  searchEmployeeSubordinatesPlaceholder: string;
  allStaffAndDepts: string;
  matchingSearch: string;
  membersInScope: string;
  membersIn: string;
  directReportingScope: string;
  voiceCallsScope: string;
  digitalChatScope: string;
  specializedOpsScope: string;
  allOrgScope: string;
  noEmployeesFound: string;

  // Hero Card
  annualBadge: string;
  submittedAt: string;
  viewOnly: string;
  directManagerLabel: string;
  departmentChiefLabel: string;
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

  // Section 1
  sec1TrainerTitle: string;
  sec1QaTitle: string;
  sec1TlTitle: string;
  sec1BackOfficeTitle: string;
  sec1DefaultTitle: string;
  sec1DescLeadership: string;
  sec1DescAgent: string;
  colKpiMetric: string;
  colActualResult: string;
  colSelf: string;
  colManager: string;
  colGap: string;
  colNotes: string;
  addNoteBtn: string;
  noteCountBtn: string;
  awaitingReview: string;
  finalScoreAverage: string;

  // Section 2
  sec2Title: string;
  sec2Desc: string;
  colCompetency: string;
  competencyAverageRow: string;

  // Section 3
  sec3Title: string;
  agentSelfReviewCard: string;
  selfReviewCard: string;
  managerReviewCard: string;
  officialFinalRatingCard: string;
  kpiAverage: string;
  competencyAverage: string;
  combinedScore: string;
  officialBadge: string;
  selfBadge: string;
  pendingBadge: string;
  awaitingManagerApproval: string;
  completeEvalMsg: string;

  // Section 4
  sec4Title: string;
  sec4Subtitle: string;
  employeeNotesTitle: string;
  employeeNotesDesc: string;
  managerNotesTitle: string;
  managerNotesDesc: string;
  empPlaceholderActive: string;
  empPlaceholderEmpty: string;
  mgrPlaceholderActive: string;
  mgrPlaceholderEmpty: string;

  // Print Section
  empSig: string;
  mgrSig: string;
  chiefSig: string;
  designedBy: string;
  reportFooterOrg: string;

  // Bottom Actions Bar
  lastSavedText: string;
  noChangesSaved: string;
  saveDraftBtn: string;
  submitSelfBtn: string;
  updateSelfBtn: string;
  approveFinalizeBtn: string;
  updateFinalizeBtn: string;
  evalFinalizedBadge: string;

  // Criterion Drawer
  drawerTitle: string;
  drawerManagerTab: string;
  drawerEmployeeTab: string;
  drawerTopicLabel: string;
  drawerClose: string;
  topicJustification: string;
  topicAchievement: string;
  topicImprovement: string;
  topicIncident: string;
  topicGeneral: string;

  // Coverage Modal
  coverageTitle: string;
  coverageSubtitle: string;
  filterAll: string;
  filterPending: string;
  filterCompleted: string;
  coverageSearchPlaceholder: string;
  noEmployeesMatch: string;
  evaluateEmployeeBtn: string;
  closeBtn: string;
  showingCount: string;

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
    appTitle: "Annual Evaluation Dashboard",
    appSubtitle: "Annual Performance Review & Scorecards",
    evaluationTab: "Evaluation",
    adminBadge: "ADMIN",
    languageButton: "العربية",

    // Toolbar
    criteriaButton: "Criteria",
    staffButton: "Staff & Rosters",
    whosPendingButton: "Who's Pending?",
    printPdfButton: "Print / PDF",
    selectEmployeePrompt: "Select Employee...",
    totalEmployees: "Total Employees",
    availableCount: "Available",
    directTeamSubordinates: "Direct Team & Subordinates",
    searchEmployeePlaceholder: "Search employee across all teams...",
    searchEmployeeSubordinatesPlaceholder: "Search employee in your reporting line...",
    allStaffAndDepts: "All Staff & Departments",
    matchingSearch: "Matching Search",
    membersInScope: "Members in Your Evaluation Scope",
    membersIn: "Members in",
    directReportingScope: "Direct Reporting",
    voiceCallsScope: "Voice Calls",
    digitalChatScope: "Digital Chat",
    specializedOpsScope: "Specialized Operations",
    allOrgScope: "All Organization",
    noEmployeesFound: "No employees found",

    // Hero Card
    annualBadge: "ANNUAL",
    submittedAt: "Submitted:",
    viewOnly: "View Only",
    directManagerLabel: "Direct Manager:",
    departmentChiefLabel: "Department Chief:",
    finalScore: "Final Score",
    ratingTier: "Rating Tier",
    status: "Status",
    draft: "Draft",
    selfDone: "Self Done",
    finalized: "Finalized",
    pendingReview: "Pending",
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
    tier2: "Improvement Required",
    tier1: "Below Expectations",

    // Section 1
    sec1TrainerTitle: "Training Performance KPI Evaluation",
    sec1QaTitle: "Quality Assurance KPI Evaluation",
    sec1TlTitle: "Leadership & Team Management KPI Evaluation",
    sec1BackOfficeTitle: "Back Office Operational KPI Evaluation",
    sec1DefaultTitle: "Department KPI Evaluation",
    sec1DescLeadership: "Role-specific operational KPIs evaluated manually on an executive 1 to 5 scale.",
    sec1DescAgent: "Department operational performance metrics evaluation (Rate 1 to 5).",
    colKpiMetric: "Role KPI Metric & Objectives",
    colActualResult: "Actual Result",
    colSelf: "Self-Evaluation",
    colManager: "Manager Evaluation",
    colGap: "Gap",
    colNotes: "Notes",
    addNoteBtn: "+ Note",
    noteCountBtn: "Note",
    awaitingReview: "Awaiting Review",
    finalScoreAverage: "Final Score (1-5 Average)",

    // Section 2
    sec2Title: "Bank Core Competencies Evaluation",
    sec2Desc: "Assessment of bank core competencies and institutional behaviors (Rate 1 to 5).",
    colCompetency: "Competency & Behavioral Indicators",
    competencyAverageRow: "Competency Average (1-5)",

    // Section 3
    sec3Title: "Overall Performance Summary",
    agentSelfReviewCard: "Agent Self-Review",
    selfReviewCard: "Self-Review",
    managerReviewCard: "Manager Review",
    officialFinalRatingCard: "Official Final Rating",
    kpiAverage: "KPI Average:",
    competencyAverage: "Competency Average:",
    combinedScore: "Combined Score:",
    officialBadge: "Official",
    selfBadge: "Self",
    pendingBadge: "Pending",
    awaitingManagerApproval: "Awaiting Manager Approval",
    completeEvalMsg: "Complete evaluation to compute official final score.",

    // Section 4
    sec4Title: "Qualitative Notes & Feedback",
    sec4Subtitle: "Notes, self-reflection, and manager recommendations for this annual evaluation cycle",
    employeeNotesTitle: "Employee Notes & Self-Reflection",
    employeeNotesDesc: "Key accomplishments, challenges faced, aspirations, and reflections on performance.",
    managerNotesTitle: "Manager Notes & Recommendations",
    managerNotesDesc: "Direct manager review, strengths, coaching areas, and strategic feedback.",
    empPlaceholderActive: "Enter your self-reflection, personal milestones, and observations...",
    empPlaceholderEmpty: "No employee notes recorded yet.",
    mgrPlaceholderActive: "Enter leadership feedback, guidance, and development recommendations...",
    mgrPlaceholderEmpty: "No manager notes recorded yet.",

    // Print Section
    empSig: "Employee Signature:",
    mgrSig: "Direct Manager Signature:",
    chiefSig: "Department Chief Signature:",
    designedBy: "Designed by Omer Ayad • © 2026",
    reportFooterOrg: "First Iraqi Bank • Annual Performance Evaluation Report",

    // Bottom Actions Bar
    lastSavedText: "Last Saved:",
    noChangesSaved: "No changes saved yet",
    saveDraftBtn: "Save Draft",
    submitSelfBtn: "Submit Self-Evaluation",
    updateSelfBtn: "Update Self-Evaluation",
    approveFinalizeBtn: "Approve & Finalize Evaluation",
    updateFinalizeBtn: "Update & Finalize Evaluation",
    evalFinalizedBadge: "Evaluation Finalized by Management",

    // Criterion Drawer
    drawerTitle: "Evaluation Notes for:",
    drawerManagerTab: "Manager Note",
    drawerEmployeeTab: "Employee Note",
    drawerTopicLabel: "Note Topic / Reason",
    drawerClose: "Close",
    topicJustification: "Score Justification",
    topicAchievement: "Standout Achievement",
    topicImprovement: "Area for Improvement",
    topicIncident: "Specific Case / Incident",
    topicGeneral: "General Observation",

    // Coverage Modal
    coverageTitle: "Employee Evaluation Coverage Tracker",
    coverageSubtitle: "Real-time annual evaluation status across all teams",
    filterAll: "All Statuses",
    filterPending: "Pending Only",
    filterCompleted: "Completed Only",
    coverageSearchPlaceholder: "Search by name, ID or team...",
    noEmployeesMatch: "No employees match the selected filter",
    evaluateEmployeeBtn: "Evaluate Employee",
    closeBtn: "Close",
    showingCount: "Showing {0} of {1} employees",

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
    appTitle: "لوحة التقييم السنوي",
    appSubtitle: "مراجعة وتقييم الأداء السنوي وبطاقات الأداء المعتمدة",
    evaluationTab: "التقييم",
    adminBadge: "مسؤول",
    languageButton: "English",

    // Toolbar
    criteriaButton: "معايير التقييم",
    staffButton: "الموظفين والأقسام",
    whosPendingButton: "المتبقون للتقييم",
    printPdfButton: "طباعة / PDF",
    selectEmployeePrompt: "اختر الموظف...",
    totalEmployees: "إجمالي الموظفين",
    availableCount: "متاح",
    directTeamSubordinates: "الفريق المباشر والمرؤوسون",
    searchEmployeePlaceholder: "بحث عن موظف في كافة الفرق والأقسام...",
    searchEmployeeSubordinatesPlaceholder: "بحث عن موظف في نطاق إشرافك...",
    allStaffAndDepts: "كافة الموظفين والأقسام",
    matchingSearch: "مطابق للبحث",
    membersInScope: "موظف في نطاق التقييم الخاص بك",
    membersIn: "موظف في",
    directReportingScope: "التبعية المباشرة",
    voiceCallsScope: "المكالمات الصوتية",
    digitalChatScope: "المحادثة الرقمية",
    specializedOpsScope: "العمليات التخصصية",
    allOrgScope: "كافة المنظمة",
    noEmployeesFound: "لم يتم العثور على موظفين",

    // Hero Card
    annualBadge: "التقييم السنوي",
    submittedAt: "تاريخ الاعتماد / الإرسال:",
    viewOnly: "للقراءة فقط",
    directManagerLabel: "المدير المباشر:",
    departmentChiefLabel: "شيف / رئيس القسم:",
    finalScore: "الدرجة النهائية",
    ratingTier: "فئة التقييم",
    status: "الحالة",
    draft: "مسودة",
    selfDone: "تم الذاتي",
    finalized: "معتمد نهائياً",
    pendingReview: "قيد المراجعة",
    contactCenter: "مركز خدمة العملاء",
    teamLeader: "قائد فريق",
    trainer: "مدرب",
    qaRole: "إدارة الجودة",
    backOffice: "العمليات والدعم",

    // Rating Scale Legend
    ratingScaleTitle: "مقياس التقييم الرسمي المعتمد (1 إلى 5):",
    tier5: "متميز (Outstanding)",
    tier4: "يفوق التوقعات (Exceeds Expectations)",
    tier3: "يلبي التوقعات (Meets Expectations)",
    tier2: "يحتاج إلى تحسين (Improvement Required)",
    tier1: "دون التوقعات (Below Expectations)",

    // Section 1
    sec1TrainerTitle: "تقييم مؤشرات أداء التدريب والتأهيل",
    sec1QaTitle: "تقييم مؤشرات أداء إدارة الجودة",
    sec1TlTitle: "تقييم مؤشرات القيادة وإدارة الفرق التشغيلية",
    sec1BackOfficeTitle: "تقييم مؤشرات أداء العمليات الخلفية",
    sec1DefaultTitle: "تقييم مؤشرات الأداء للقسم (Department KPI Evaluation)",
    sec1DescLeadership: "مؤشرات أداء تشغيلية وقيادية يتم تقييمها على مقياس تنفيذي من 1 إلى 5 درجات.",
    sec1DescAgent: "تقييم مؤشرات الأداء التشغيلي ومستهدفات القسم (من 1 إلى 5 درجات).",
    colKpiMetric: "معيار التقييم والمؤشرات المستهدفة",
    colActualResult: "النتيجة الفعلية",
    colSelf: "التقييم الذاتي",
    colManager: "تقييم المدير المسؤول",
    colGap: "الفارق",
    colNotes: "الملاحظات",
    addNoteBtn: "+ ملاحظة",
    noteCountBtn: "ملاحظة",
    awaitingReview: "بانتظار تقييم المدير",
    finalScoreAverage: "الدرجة النهائية (معدل 1-5)",

    // Section 2
    sec2Title: "تقييم الكفاءات الجوهرية للمصرف (Bank Core Competencies)",
    sec2Desc: "تقييم الكفاءات والسلوكيات المؤسسية الأساسية للمصرف (من 1 إلى 5 درجات).",
    colCompetency: "الكفاءة والمؤشرات السلوكية",
    competencyAverageRow: "معدل الكفاءات (1-5)",

    // Section 3
    sec3Title: "ملخص التقييم العام لأداء الموظف",
    agentSelfReviewCard: "التقييم الذاتي للموظف",
    selfReviewCard: "التقييم الذاتي",
    managerReviewCard: "تقييم المدير المسؤول",
    officialFinalRatingCard: "التقييم النهائي المعتمد",
    kpiAverage: "معدل مؤشرات الأداء:",
    competencyAverage: "معدل الكفاءات:",
    combinedScore: "الدرجة المشتركة:",
    officialBadge: "معتمد رسمي",
    selfBadge: "ذاتي",
    pendingBadge: "قيد المراجعة",
    awaitingManagerApproval: "بانتظار اعتماد المدير",
    completeEvalMsg: "أكمل درجات التقييم لاحتساب النتيجة الرسمية المعتمدة.",

    // Section 4
    sec4Title: "الملاحظات النوعية والتوصيات وخطط التطوير",
    sec4Subtitle: "ملاحظات تفصيلية وتطلعات الموظف الذاتية وتوصيات المدير للدورة التقييمية",
    employeeNotesTitle: "ملاحظات وتطلعات الموظف الذاتية",
    employeeNotesDesc: "أبرز الإنجازات المحققة، التحديات التي واجهها، والتطلعات المهنية لتطوير الأداء.",
    managerNotesTitle: "ملاحظات وتوجيهات المدير والمسؤول المباشر",
    managerNotesDesc: "تقييم المسؤول المباشر، نقاط القوة، مجالات التوجيه، والتوصيات الاستراتيجية للمرحلة القادمة.",
    empPlaceholderActive: "اكتب ملاحظاتك وتطلعاتك الذاتية وأبرز إنجازاتك خلال العام...",
    empPlaceholderEmpty: "لم تسجل أي ملاحظات ذاتية حتى الآن.",
    mgrPlaceholderActive: "اكتب توجيهات الإدارة، الملاحظات التقييمية، وتوصيات التطوير المهني...",
    mgrPlaceholderEmpty: "لم تسجل أي ملاحظات للمدير حتى الآن.",

    // Print Section
    empSig: "توقيع الموظف:",
    mgrSig: "توقيع المدير المباشر:",
    chiefSig: "توقيع شيف / رئيس القسم:",
    designedBy: "تصميم وتطوير: عمر إياد • © 2026",
    reportFooterOrg: "المصرف العراقي الأول • تقرير التقييم السنوي للأداء",

    // Bottom Actions Bar
    lastSavedText: "آخر حفظ:",
    noChangesSaved: "لم يتم حفظ أي تغييرات بعد",
    saveDraftBtn: "حفظ كمسودة",
    submitSelfBtn: "إرسال التقييم الذاتي",
    updateSelfBtn: "تحديث التقييم الذاتي",
    approveFinalizeBtn: "اعتماد وتثبيت التقييم السنوي",
    updateFinalizeBtn: "تحديث واعتماد التقييم السنوي",
    evalFinalizedBadge: "تم اعتماد التقييم نهائياً من قبل الإدارة",

    // Criterion Drawer
    drawerTitle: "ملاحظات التقييم لمعيار:",
    drawerManagerTab: "ملاحظة المدير",
    drawerEmployeeTab: "ملاحظة الموظف",
    drawerTopicLabel: "محور الملاحظة (على شنو النوت)",
    drawerClose: "إغلاق",
    topicJustification: "تبرير الدرجة والأدلة",
    topicAchievement: "إنجاز متميز واستثنائي",
    topicImprovement: "نقطة للتحسين وخطة عمل",
    topicIncident: "متابعة حالة أو موقف محدد",
    topicGeneral: "ملاحظة عامة",

    // Coverage Modal
    coverageTitle: "متابعة تغطية التقييم السنوي للموظفين",
    coverageSubtitle: "حالة التقييم السنوي اللحظية لكافة الأقسام والفرق",
    filterAll: "كافة الحالات",
    filterPending: "المتبقون فقط",
    filterCompleted: "المكتملون فقط",
    coverageSearchPlaceholder: "بحث بالاسم، الرقم الوظيفي، أو الفريق...",
    noEmployeesMatch: "لا يوجد موظفون مطابقون لهذا الفلتر",
    evaluateEmployeeBtn: "تقييم الموظف",
    closeBtn: "إغلاق",
    showingCount: "عرض {0} من أصل {1} موظف",

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
