"use client";

import React, { useState } from "react";
import { 
  X, Plus, Trash2, Edit2, RefreshCw, 
  Sliders, AlertCircle, Sparkles, FolderPlus, Check 
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
  onSaveCriteria: (criteria: DynamicCriterion[]) => void;
  onSaveSections: (sections: DynamicSection[]) => void;
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
  
  // New Criterion Form State
  const [isAddingCriterion, setIsAddingCriterion] = useState<boolean>(false);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [critName, setCritName] = useState<string>("");
  const [critNameAr, setCritNameAr] = useState<string>("");
  const [critDesc, setCritDesc] = useState<string>("");
  const [critSectionId, setCritSectionId] = useState<string>(sections[0]?.id || "kpi");
  const [critTargetRole, setCritTargetRole] = useState<"all" | "manager" | "employee">("all");
  const [critNoteTopic, setCritNoteTopic] = useState<string>("justification");
  const [critNoteGuideline, setCritNoteGuideline] = useState<string>("");

  // New Section Form State
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [secTitle, setSecTitle] = useState<string>("");
  const [secTitleAr, setSecTitleAr] = useState<string>("");
  const [secDesc, setSecDesc] = useState<string>("");

  if (!isOpen) return null;

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
    const confirmMsg = isAr ? "هل أنت متأكد من حذف هذا المعيار من التقييم السنوي؟" : "Are you sure you want to delete this criterion from the annual evaluation?";
    if (confirm(confirmMsg)) {
      const filtered = criteria.filter(c => c.id !== id);
      onSaveCriteria(filtered);
    }
  };

  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secTitle.trim()) return;

    const newSecId = "sec_" + Date.now();
    const newSec: DynamicSection = {
      id: newSecId,
      title: secTitle.trim(),
      titleAr: secTitleAr.trim() || undefined,
      description: secDesc.trim() || "Custom Performance Criteria Evaluation",
      order: sections.length + 1
    };

    onSaveSections([...sections, newSec]);
    setIsAddingSection(false);
    setSecTitle("");
    setSecTitleAr("");
    setSecDesc("");
  };

  const handleResetDefaults = () => {
    const confirmMsg = isAr ? "هل تريد استعادة المعايير الافتراضية الرسمية؟" : "Do you want to restore the official default criteria?";
    if (confirm(confirmMsg)) {
      onSaveCriteria(DEFAULT_CRITERIA);
      onSaveSections(DEFAULT_SECTIONS);
    }
  };

  const filteredCriteria = activeSectionId === "all" 
    ? criteria 
    : criteria.filter(c => c.sectionId === activeSectionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
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

        {/* Action Toolbar */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
            <button
              type="button"
              onClick={() => setActiveSectionId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeSectionId === "all"
                  ? "bg-[#1C6B53] text-white shadow-xs"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100"
              }`}
            >
              {isAr ? `الكل (${criteria.length})` : `All (${criteria.length})`}
            </button>
            {sections.map(s => {
              const count = criteria.filter(c => c.sectionId === s.id).length;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSectionId(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    activeSectionId === s.id
                      ? "bg-[#1C6B53] text-white shadow-xs"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{isAr ? (s.titleAr || s.title) : s.title}</span>
                  <span className="ml-1 opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C6B53] hover:bg-[#155340] text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>{isAr ? "إضافة معيار جديد" : "Add Criterion"}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold transition active:scale-95 cursor-pointer"
              title={isAr ? "إضافة قسم جديد للمعايير" : "Add New Section"}
            >
              <FolderPlus size={14} />
              <span>{isAr ? "قسم جديد" : "New Section"}</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 transition"
              title={isAr ? "إعادة تعيين المعايير للافتراضية" : "Reset to Defaults"}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Add Criterion Form Modal/Box */}
          {isAddingCriterion && !editingCriterionId && (
            <form onSubmit={handleSaveCriterionSubmit} className="p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl shadow-xs animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-200 dark:border-emerald-800/80 pb-2">
                <span className="text-xs font-black text-[#1C6B53] dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>
                    {editingCriterionId 
                      ? (isAr ? "تعديل المعيار" : "Edit Criterion") 
                      : (isAr ? "إضافة معيار تقييم جديد" : "Add New Evaluation Criterion")}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingCriterion(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "اسم المعيار (إنجليزي أو عربي) *" : "Criterion Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={critName}
                    onChange={(e) => setCritName(e.target.value)}
                    placeholder="e.g. Communication, Problem Solving, Leadership"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "الاسم بالعربية (اختياري)" : "Arabic Title (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={critNameAr}
                    onChange={(e) => setCritNameAr(e.target.value)}
                    placeholder="مثال: التواصل الفعّال، حل المشكلات، القيادة"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "القسم التابع له المعيار *" : "Assigned Section *"}
                  </label>
                  <ModernDropdown
                    value={critSectionId}
                    onChange={(val) => setCritSectionId(val)}
                    options={sections.map(s => ({
                      value: s.id,
                      label: isAr ? (s.titleAr || s.title) : s.title
                    }))}
                    fullWidth
                    variant="input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "مقياس التقييم" : "Rating Scale"}
                  </label>
                  <div className="h-9 px-3 flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300">
                    {isAr ? "مقياس رسمي من 1 إلى 5 درجات" : "Official Executive Scale (1 to 5)"}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "الوصف والمؤشرات السلوكية المطلوبة" : "Description & Behavioral Indicators"}
                </label>
                <textarea
                  rows={2}
                  value={critDesc}
                  onChange={(e) => setCritDesc(e.target.value)}
                  placeholder={isAr ? "وصف ما هو متوقع من الموظف لتحقيق درجات التقييم..." : "Describe expectations and observable behaviors for top performance..."}
                  className="w-full p-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden"
                />
              </div>

              {/* Criterion Note Field Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 p-3 bg-white/80 dark:bg-gray-800/80 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "إضافة خانة النوت (للموظف أو المدير)" : "Note Field For (Employee or Manager)"}
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
                    {isAr ? "محور الملاحظة (على شنو النوت)" : "Default Note Focus (Topic)"}
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
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "توجيهات أو ملاحظة استرشادية للمعيار (اختياري)" : "Guidance Note for this Metric (Optional)"}
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCriterion(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-xs transition active:scale-95"
                >
                  {editingCriterionId 
                    ? (isAr ? "حفظ التعديلات" : "Save Changes") 
                    : (isAr ? "إضافة المعيار" : "Save Criterion")}
                </button>
              </div>
            </form>
          )}

          {/* Add Section Form Box */}
          {isAddingSection && (
            <form onSubmit={handleAddSectionSubmit} className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 rounded-2xl shadow-xs animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-purple-200 dark:border-purple-800 pb-2">
                <span className="text-xs font-black text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  <FolderPlus size={14} />
                  <span>{isAr ? "إضافة قسم تقييم جديد" : "Add New Evaluation Section"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "عنوان القسم (إنجليزي) *" : "Section Title (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={secTitle}
                    onChange={(e) => setSecTitle(e.target.value)}
                    placeholder="e.g. Project Delivery, Customer Care"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "عنوان القسم (عربي)" : "Section Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={secTitleAr}
                    onChange={(e) => setSecTitleAr(e.target.value)}
                    placeholder="مثال: إنجاز المشاريع، خدمة العملاء"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-black text-white bg-purple-700 hover:bg-purple-800 shadow-xs transition active:scale-95"
                >
                  {isAr ? "حفظ القسم" : "Save Section"}
                </button>
              </div>
            </form>
          )}

          {/* Criteria Cards List */}
          <div className="space-y-2.5">
            {filteredCriteria.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <AlertCircle size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-xs font-bold">{isAr ? "لا توجد معايير في هذا القسم" : "No criteria in this section"}</p>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="mt-2 text-xs font-black text-[#1C6B53] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isAr ? "+ أضف معياراً الآن" : "+ Add a criterion now"}
                </button>
              </div>
            ) : (
              filteredCriteria.map((item, idx) => {
                const sec = sections.find(s => s.id === item.sectionId);
                const titleToDisplay = isAr && item.nameAr ? item.nameAr : item.name;
                const descToDisplay = isAr && item.descriptionAr ? item.descriptionAr : item.description;

                // Inline Edit Form for this specific criterion
                if (editingCriterionId === item.id) {
                  return (
                    <form
                      key={item.id}
                      onSubmit={handleSaveCriterionSubmit}
                      className="p-4 sm:p-5 bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl shadow-md animate-in fade-in duration-150 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-2">
                        <span className="text-xs font-black text-[#1C6B53] dark:text-emerald-300 flex items-center gap-1.5">
                          <Edit2 size={14} />
                          <span>{isAr ? `تعديل المعيار: ${titleToDisplay}` : `Edit Criterion: ${item.name}`}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingCriterionId(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold cursor-pointer"
                        >
                          {isAr ? "إلغاء" : "Cancel"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isAr ? "اسم المعيار (إنجليزي) *" : "Criterion Title (English) *"}
                          </label>
                          <input
                            type="text"
                            required
                            autoFocus
                            value={critName}
                            onChange={(e) => setCritName(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isAr ? "الاسم بالعربية *" : "Arabic Title"}
                          </label>
                          <input
                            type="text"
                            value={critNameAr}
                            onChange={(e) => setCritNameAr(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden text-right font-bold"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isAr ? "القسم التابع له المعيار *" : "Assigned Section *"}
                          </label>
                          <ModernDropdown
                            value={critSectionId}
                            onChange={(val) => setCritSectionId(val)}
                            options={sections.map(s => ({
                              value: s.id,
                              label: isAr ? (s.titleAr || s.title) : s.title
                            }))}
                            fullWidth
                            variant="input"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isAr ? "صلاحية كتابة الملاحظة" : "Note Access"}
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
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          {isAr ? "الوصف والمؤشرات السلوكية المطلوبة" : "Description & Behavioral Indicators"}
                        </label>
                        <textarea
                          rows={2}
                          value={critDesc}
                          onChange={(e) => setCritDesc(e.target.value)}
                          className="w-full p-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          {isAr ? "توجيهات أو ملاحظة استرشادية للمعيار (اختياري)" : "Guidance Note (Optional)"}
                        </label>
                        <input
                          type="text"
                          value={critNoteGuideline}
                          onChange={(e) => setCritNoteGuideline(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-medium"
                        />
                      </div>

                      <div className="flex justify-end items-center gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                        <button
                          type="button"
                          onClick={() => setEditingCriterionId(null)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition cursor-pointer"
                        >
                          {isAr ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>{isAr ? "حفظ التعديلات" : "Save Changes"}</span>
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl hover:border-[#1C6B53]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                          {titleToDisplay}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {isAr ? (sec?.titleAr || sec?.title || "معيار") : (sec?.title || "Metric")}
                        </span>
                        {item.isDefault && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {isAr ? "افتراضي" : "Default"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {descToDisplay}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
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
    </div>
  );
}
