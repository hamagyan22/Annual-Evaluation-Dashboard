"use client";

import React, { useState, useMemo } from "react";
import { 
  X, Plus, Trash2, Edit2, RefreshCw, 
  Sliders, AlertCircle, Sparkles, FolderPlus, Check,
  Search, Folder, Layers, FileText
} from "lucide-react";
import { 
  DynamicCriterion, 
  DynamicSection, 
  DEFAULT_CRITERIA, 
  DEFAULT_SECTIONS 
} from "@/lib/customCriteriaManager";
import { Language } from "@/lib/translations";
import ModernDropdown from "@/components/ModernDropdown";

interface ManageCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: DynamicCriterion[];
  sections: DynamicSection[];
  onSaveCriteria: (criteria: DynamicCriterion[], deletedId?: string) => void;
  onSaveSections: (sections: DynamicSection[], deletedId?: string) => void;
  lang?: Language;
}

export function ManageCriteriaModal({
  isOpen,
  onClose,
  criteria,
  sections,
  onSaveCriteria,
  onSaveSections,
  lang = "en"
}: ManageCriteriaModalProps) {
  const isAr = lang === "ar";
  const [activeSectionId, setActiveSectionId] = useState<string>("all");
  const [critSearch, setCritSearch] = useState<string>("");
  
  // Criterion Form State (Dedicated Modal)
  const [isAddingCriterion, setIsAddingCriterion] = useState<boolean>(false);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [critName, setCritName] = useState<string>("");
  const [critNameAr, setCritNameAr] = useState<string>("");
  const [critDesc, setCritDesc] = useState<string>("");
  const [critSectionId, setCritSectionId] = useState<string>(sections[0]?.id || "kpi");
  const [critTargetRole, setCritTargetRole] = useState<"all" | "manager" | "employee">("all");
  const [critNoteTopic, setCritNoteTopic] = useState<string>("justification");
  const [critNoteGuideline, setCritNoteGuideline] = useState<string>("");

  // Section Form State (Dedicated Modal)
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [secTitle, setSecTitle] = useState<string>("");
  const [secTitleAr, setSecTitleAr] = useState<string>("");
  const [secDesc, setSecDesc] = useState<string>("");

  // Modern Confirmation Popup State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "criterion" | "section" | "reset";
    id?: string;
    name?: string;
  } | null>(null);

  // Filtered criteria with Search + Section
  const filteredCriteria = useMemo(() => {
    return criteria.filter(c => {
      const matchSection = activeSectionId === "all" || c.sectionId === activeSectionId;
      const q = critSearch.trim().toLowerCase();
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nameAr || "").toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.descriptionAr || "").toLowerCase().includes(q) ||
        (c.sectionName || "").toLowerCase().includes(q);
      return matchSection && matchSearch;
    });
  }, [criteria, activeSectionId, critSearch]);

  if (!isOpen) return null;

  // Handlers for Criterion Modal
  const handleStartAdd = () => {
    setEditingCriterionId(null);
    setCritName("");
    setCritNameAr("");
    setCritDesc("");
    setCritSectionId(sections[0]?.id || "kpi");
    setCritTargetRole("all");
    setCritNoteTopic("justification");
    setCritNoteGuideline("");
    setIsAddingCriterion(true);
  };

  const handleStartEdit = (item: DynamicCriterion) => {
    setEditingCriterionId(item.id);
    setCritName(item.name);
    setCritNameAr(item.nameAr || "");
    setCritDesc(item.description);
    setCritSectionId(item.sectionId);
    setCritTargetRole(item.targetRole || "all");
    setCritNoteTopic("justification");
    setCritNoteGuideline(item.noteGuideline || "");
    setIsAddingCriterion(false);
  };

  const handleSaveCriterionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!critName.trim()) return;

    const matchedSec = sections.find(s => s.id === critSectionId);

    if (editingCriterionId) {
      const updated = criteria.map(c => {
        if (c.id === editingCriterionId) {
          return {
            ...c,
            name: critName.trim(),
            nameAr: critNameAr.trim() || undefined,
            description: critDesc.trim(),
            sectionId: critSectionId,
            sectionName: matchedSec?.title || c.sectionName,
            targetRole: critTargetRole,
            noteGuideline: critNoteGuideline.trim() || undefined
          };
        }
        return c;
      });
      onSaveCriteria(updated);
    } else {
      const newId = "crit_" + Date.now();
      const newItem: DynamicCriterion = {
        id: newId,
        name: critName.trim(),
        nameAr: critNameAr.trim() || undefined,
        description: critDesc.trim(),
        sectionId: critSectionId,
        sectionName: matchedSec?.title || "Custom Criteria",
        isDefault: false,
        targetRole: critTargetRole,
        noteGuideline: critNoteGuideline.trim() || undefined
      };
      onSaveCriteria([...criteria, newItem]);
    }

    setIsAddingCriterion(false);
    setEditingCriterionId(null);
  };

  const handleDeleteCriterion = (id: string) => {
    const matched = criteria.find(c => c.id === id);
    setDeleteTarget({
      type: "criterion",
      id,
      name: matched?.name || "Criterion"
    });
  };

  // Handlers for Section Modal
  const handleStartAddSection = () => {
    setEditingSectionId(null);
    setSecTitle("");
    setSecTitleAr("");
    setSecDesc("");
    setIsAddingSection(true);
  };

  const handleSaveSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secTitle.trim()) return;

    if (editingSectionId) {
      const updated = sections.map(s => {
        if (s.id === editingSectionId) {
          return {
            ...s,
            title: secTitle.trim(),
            titleAr: secTitleAr.trim() || undefined,
            description: secDesc.trim() || s.description || "Custom Performance Criteria Evaluation"
          };
        }
        return s;
      });
      onSaveSections(updated);
    } else {
      const newSecId = "sec_" + Date.now();
      const newSec: DynamicSection = {
        id: newSecId,
        title: secTitle.trim(),
        titleAr: secTitleAr.trim() || undefined,
        description: secDesc.trim() || "Custom Performance Criteria Evaluation",
        order: sections.length + 1
      };
      onSaveSections([...sections, newSec]);
    }

    setIsAddingSection(false);
    setEditingSectionId(null);
    setSecTitle("");
    setSecTitleAr("");
    setSecDesc("");
  };

  const handleResetDefaults = () => {
    setDeleteTarget({
      type: "reset",
      name: isAr ? "استعادة المعايير الافتراضية" : "Restore Official Default Criteria"
    });
  };

  const handleConfirmAction = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "criterion" && deleteTarget.id) {
      const filtered = criteria.filter(c => c.id !== deleteTarget.id);
      onSaveCriteria(filtered, deleteTarget.id);
    } else if (deleteTarget.type === "section" && deleteTarget.id) {
      const filteredSecs = sections.filter(s => s.id !== deleteTarget.id);
      onSaveSections(filteredSecs, deleteTarget.id);
      const filteredCrits = criteria.filter(c => c.sectionId !== deleteTarget.id);
      onSaveCriteria(filteredCrits);
    } else if (deleteTarget.type === "reset") {
      onSaveCriteria(DEFAULT_CRITERIA, "__RESET__");
      onSaveSections(DEFAULT_SECTIONS, "__RESET__");
    }

    setDeleteTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0E3A2F] to-[#1C6B53] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-xs">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {isAr ? "إدارة معايير التقييم السنوي" : "Annual Criteria Management"}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100">
                  {criteria.length} {isAr ? "معيار" : "Criteria"}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                {isAr ? "تخصيص وإضافة معايير الأداء الوظيفي والكفاءات للتقييم السنوي" : "Customize and add performance KPIs and competencies for the annual evaluation"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#0c3a2d] hover:bg-[#07241c] text-white flex items-center justify-center transition border border-white/30 shadow-md cursor-pointer shrink-0"
            title={isAr ? "إغلاق" : "Close"}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Action Toolbar: Elongated Search Bar + Modern Section Dropdown + Actions */}
        <div className="p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search + Section Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
            {/* Elongated Search Bar */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
              <input
                type="text"
                value={critSearch}
                onChange={(e) => setCritSearch(e.target.value)}
                placeholder={isAr ? "بحث بالمعيار، الوصف، أو القسم..." : "Search criteria by name, description, or section..."}
                className={`w-full h-10 ${isAr ? "pr-10 pl-8" : "pl-10 pr-8"} text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden shadow-2xs font-medium`}
              />
              {critSearch && (
                <button
                  type="button"
                  onClick={() => setCritSearch("")}
                  className={`absolute ${isAr ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-md`}
                  title={isAr ? "مسح البحث" : "Clear search"}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Section Dropdown Filter */}
            <div className="w-full sm:w-auto shrink-0 min-w-[210px]">
              <ModernDropdown
                value={activeSectionId}
                onChange={(val) => setActiveSectionId(val)}
                options={[
                  {
                    value: "all",
                    label: isAr ? `جميع الأقسام (${criteria.length})` : `All Sections (${criteria.length})`,
                    icon: Layers,
                  },
                  ...sections.map((s) => {
                    const count = criteria.filter((c) => c.sectionId === s.id).length;
                    return {
                      value: s.id,
                      label: isAr
                        ? `${s.titleAr || s.title} (${count})`
                        : `${s.title} (${count})`,
                      icon: Folder,
                    };
                  }),
                ]}
                variant="gray"
                size="sm"
                fullWidth
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C6B53] hover:bg-[#155340] text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>{isAr ? "إضافة معيار جديد" : "Add Criterion"}</span>
            </button>
            <button
              type="button"
              onClick={handleStartAddSection}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold transition active:scale-95 cursor-pointer"
              title={isAr ? "إضافة قسم جديد للمعايير" : "Add New Section"}
            >
              <FolderPlus size={14} />
              <span>{isAr ? "قسم جديد" : "New Section"}</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 transition"
              title={isAr ? "إعادة تعيين المعايير للافتراضية" : "Reset to Defaults"}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Content Body: Criteria Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredCriteria.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <AlertCircle size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {critSearch ? (isAr ? "لا توجد معايير مطابقة للبحث" : "No criteria match your search") : (isAr ? "لا توجد معايير مضافة حالياً. يمكنك إضافة مؤشرات الأداء والكفاءات الخاصة بك من الزر أدناه." : "No criteria added yet. You can add your custom KPIs and competencies using the button below.")}
              </p>
              <button
                type="button"
                onClick={handleStartAdd}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#1C6B53] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus size={14} />
                <span>{isAr ? "أضف معياراً الآن" : "Add a criterion now"}</span>
              </button>
            </div>
          ) : (
            filteredCriteria.map((item, idx) => {
              const sec = sections.find(s => s.id === item.sectionId);
              const titleToDisplay = isAr && item.nameAr ? item.nameAr : item.name;
              const descToDisplay = isAr && item.descriptionAr ? item.descriptionAr : item.description;

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 rounded-2xl hover:border-[#1C6B53]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {titleToDisplay}
                      </h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Folder size={10} />
                        <span>{isAr ? (sec?.titleAr || sec?.title || "معيار") : (sec?.title || "Metric")}</span>
                      </span>
                      {item.targetRole && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.targetRole === "all" ? (isAr ? "نوت: المدير والموظف" : "Note: Both") :
                           item.targetRole === "manager" ? (isAr ? "نوت: المدير فقط" : "Note: Manager") :
                           (isAr ? "نوت: الموظف فقط" : "Note: Employee")}
                        </span>
                      )}
                      {item.isDefault && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {isAr ? "افتراضي" : "Default"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {descToDisplay}
                    </p>
                    {item.noteGuideline && (
                      <p className="text-[11px] text-[#1C6B53] dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                        <FileText size={11} className="shrink-0" />
                        <span className="truncate">{item.noteGuideline}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                      title={isAr ? "تعديل المعيار" : "Edit Criterion"}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCriterion(item.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title={isAr ? "حذف المعيار" : "Delete Criterion"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? "يتم تطبيق المعايير مباشرة على جدول التقييم السنوي وحفظها تلقائياً." : "Changes are applied directly to the annual evaluation table and saved automatically."}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-xs transition active:scale-95 cursor-pointer"
          >
            {isAr ? "تم وإغلاق" : "Done & Close"}
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DEDICATED MODAL: Add / Edit Criterion Dialog (Image 3 Style) */}
      {/* ======================================================== */}
      {(isAddingCriterion || editingCriterionId !== null) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0E3A2F] to-[#1C6B53] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {editingCriterionId 
                      ? (isAr ? `تعديل المعيار: ${critName || "المعيار"}` : `Edit Criterion: ${critName || "Criterion"}`)
                      : (isAr ? "إضافة معيار تقييم سنوي جديد" : "Add New Evaluation Criterion")}
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    {isAr ? "املأ تفاصيل المعيار، القسم التابع له، وإعدادات خانات الملاحظات" : "Fill out criterion details, assigned section, and note settings"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCriterion(false);
                  setEditingCriterionId(null);
                }}
                className="w-8 h-8 rounded-full bg-[#0c3a2d] hover:bg-[#07241c] text-white flex items-center justify-center transition border border-white/30 shadow-md cursor-pointer shrink-0"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCriterionSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "اسم المعيار (إنجليزي) *" : "Criterion Title (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={critName}
                    onChange={(e) => setCritName(e.target.value)}
                    placeholder="e.g. Communication, Problem Solving"
                    className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "الاسم بالعربية" : "Arabic Title"}
                  </label>
                  <input
                    type="text"
                    value={critNameAr}
                    onChange={(e) => setCritNameAr(e.target.value)}
                    placeholder="مثال: مهارات التواصل، حل المشكلات"
                    className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Section Assignment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "القسم التابع له المعيار *" : "Assigned Section *"}
                </label>
                <ModernDropdown
                  value={critSectionId}
                  onChange={(val) => setCritSectionId(val)}
                  options={sections.map(s => ({
                    value: s.id,
                    label: isAr ? (s.titleAr || s.title) : s.title,
                    icon: Folder
                  }))}
                  fullWidth
                  variant="input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "الوصف وتوقعات الأداء *" : "Description & Behavioral Expectations *"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={critDesc}
                  onChange={(e) => setCritDesc(e.target.value)}
                  placeholder={isAr ? "وصف ما هو مطلوب من الموظف لتحقيق أعلى درجات التقييم..." : "Describe expectations and observable behaviors for top performance..."}
                  className="w-full p-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-medium"
                />
              </div>

              {/* Note Field Configuration Card */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1C6B53] dark:text-emerald-300">
                  <FileText size={15} />
                  <span>{isAr ? "إعدادات خانة الملاحظات (Notes)" : "Note Field Configuration"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "إتاحة خانة النوت لمن؟" : "Note Access"}
                    </label>
                    <ModernDropdown
                      value={critTargetRole}
                      onChange={(val: any) => setCritTargetRole(val)}
                      options={[
                        { value: "all", label: isAr ? "المدير والموظف معاً" : "Both Manager & Employee" },
                        { value: "manager", label: isAr ? "المدير فقط" : "Manager Only" },
                        { value: "employee", label: isAr ? "الموظف فقط" : "Employee Only" },
                      ]}
                      fullWidth
                      variant="input"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "محور الملاحظة الافتراضي" : "Default Note Focus"}
                    </label>
                    <ModernDropdown
                      value={critNoteTopic}
                      onChange={(val: any) => setCritNoteTopic(val)}
                      options={[
                        { value: "justification", label: isAr ? "تبرير الدرجة والأدلة (Score Justification)" : "Score Justification" },
                        { value: "achievement", label: isAr ? "إنجاز مميز واستثنائي (Achievement)" : "Standout Achievement" },
                        { value: "improvement", label: isAr ? "نقطة للتحسين وخطة عمل (Improvement)" : "Area for Improvement" },
                        { value: "incident", label: isAr ? "متابعة حالة محددة (Incident / Case)" : "Specific Case / Incident" },
                        { value: "general", label: isAr ? "ملاحظة عامة (General Observation)" : "General Observation" },
                      ]}
                      fullWidth
                      variant="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "توجيهات أو ملاحظة استرشادية للمعيار (اختياري)" : "Guidance Note for Evaluator (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={critNoteGuideline}
                    onChange={(e) => setCritNoteGuideline(e.target.value)}
                    placeholder={isAr ? "مثال: يرجى تدوين أدلة التزام الموظف ونماذج من الحالات المنفذة..." : "e.g. Please document specific examples, SLA adherence evidence..."}
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCriterion(false);
                    setEditingCriterionId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editingCriterionId ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة المعيار" : "Save Criterion")}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEDICATED MODAL: Add / Edit Section Dialog */}
      {/* ======================================================== */}
      {(isAddingSection || editingSectionId !== null) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0E3A2F] to-[#1C6B53] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-xs">
                  <FolderPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {editingSectionId 
                      ? (isAr ? `تعديل القسم: ${secTitle || "القسم"}` : `Edit Section: ${secTitle || "Section"}`)
                      : (isAr ? "إضافة قسم تقييم جديد" : "Add New Evaluation Section")}
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    {isAr ? "تصنيف معايير الأداء ضمن أقسام ومحاور واضحة" : "Group evaluation criteria into distinct operational categories"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSection(false);
                  setEditingSectionId(null);
                }}
                className="w-8 h-8 rounded-full bg-[#0c3a2d] hover:bg-[#07241c] text-white flex items-center justify-center transition border border-white/30 shadow-md cursor-pointer shrink-0"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveSectionSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "عنوان القسم (إنجليزي) *" : "Section Title (English) *"}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={secTitle}
                  onChange={(e) => setSecTitle(e.target.value)}
                  placeholder="e.g. Operational KPIs, Core Competencies"
                  className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "عنوان القسم بالعربية" : "Section Title (Arabic)"}
                </label>
                <input
                  type="text"
                  value={secTitleAr}
                  onChange={(e) => setSecTitleAr(e.target.value)}
                  placeholder="مثال: مؤشرات الأداء التشغيلي، الكفاءات الأساسية"
                  className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "وصف القسم (اختياري)" : "Section Description (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={secDesc}
                  onChange={(e) => setSecDesc(e.target.value)}
                  placeholder={isAr ? "وصف موجز للمحاور والمعايير المندرجة تحت هذا القسم..." : "Brief description of the KPIs and competencies in this category..."}
                  className="w-full p-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-medium"
                />
              </div>

              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSection(false);
                    setEditingSectionId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editingSectionId ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "حفظ القسم" : "Save Section")}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            {deleteTarget.type === "reset" ? (
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-blue-50 dark:ring-blue-950/30">
                <RefreshCw size={26} />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-rose-50 dark:ring-rose-950/30">
                <Trash2 size={26} />
              </div>
            )}

            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1.5">
              {deleteTarget.type === "reset"
                ? (isAr ? "استعادة المعايير الافتراضية" : "Restore Defaults")
                : (isAr ? "تأكيد الحذف" : "Confirm Deletion")}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
              {deleteTarget.type === "reset" ? (
                isAr 
                  ? "هل تريد بالتأكيد استعادة قائمة المعايير والأقسام الافتراضية الرسمية؟"
                  : "Are you sure you want to restore the official default criteria and sections?"
              ) : (
                isAr 
                  ? <>هل أنت متأكد من حذف المعيار <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</>
                  : <>Are you sure you want to delete criterion <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>? This action cannot be undone.</>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer ${
                  deleteTarget.type === "reset"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                }`}
              >
                {deleteTarget.type === "reset" 
                  ? (isAr ? "نعم، استعادة" : "Yes, Restore")
                  : (isAr ? "نعم، احذف" : "Yes, Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCriteriaModal;
