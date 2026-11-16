"use client";

import React, { useState, useMemo } from "react";
import { 
  X, Plus, Trash2, Edit2, Users, Building2, 
  Search, Sparkles, UserCheck, RefreshCw, AlertCircle 
} from "lucide-react";
import { 
  DynamicDepartment, 
  DynamicEmployee, 
  DEFAULT_DEPARTMENTS, 
  DEFAULT_EMPLOYEES 
} from "@/lib/customCriteriaManager";
import { Language } from "@/lib/translations";
import ModernDropdown from "@/components/ModernDropdown";

interface ManageStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: DynamicDepartment[];
  employees: DynamicEmployee[];
  onSaveDepartments: (depts: DynamicDepartment[]) => void;
  onSaveEmployees: (emps: DynamicEmployee[]) => void;
  onSelectEmployeeForEval?: (employeeName: string) => void;
  lang?: Language;
}

export function ManageStaffModal({
  isOpen,
  onClose,
  departments,
  employees,
  onSaveDepartments,
  onSaveEmployees,
  onSelectEmployeeForEval,
  lang = "en"
}: ManageStaffModalProps) {
  const isAr = lang === "ar";
  const [activeTab, setActiveTab] = useState<"employees" | "departments">("employees");

  // Employee Search & Filters
  const [empSearch, setEmpSearch] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");

  // Employee Form State
  const [isAddingEmployee, setIsAddingEmployee] = useState<boolean>(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empName, setEmpName] = useState<string>("");
  const [empIdNum, setEmpIdNum] = useState<string>("");
  const [empDept, setEmpDept] = useState<string>(departments[0]?.name || "Contact Center");
  const [empRole, setEmpRole] = useState<string>("Team Leader");
  const [empTeam, setEmpTeam] = useState<string>("");
  const [empDirectManager, setEmpDirectManager] = useState<string>("");
  const [empCustomPosition, setEmpCustomPosition] = useState<string>("");
  const [empRoleType, setEmpRoleType] = useState<DynamicEmployee["role_type"]>("tl");

  // Department Form State
  const [isAddingDept, setIsAddingDept] = useState<boolean>(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string>("");
  const [deptNameAr, setDeptNameAr] = useState<string>("");
  const [deptDesc, setDeptDesc] = useState<string>("");
  const [deptColor, setDeptColor] = useState<string>("emerald");

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = !empSearch || 
        emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.employee_id.includes(empSearch) ||
        (emp.role || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.direct_manager || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.custom_position || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.team || "").toLowerCase().includes(empSearch.toLowerCase());
      
      const matchDept = selectedDeptFilter === "all" || emp.department === selectedDeptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, empSearch, selectedDeptFilter]);

  if (!isOpen) return null;

  // Handle Employee Form
  const handleStartAddEmployee = () => {
    setEditingEmpId(null);
    setEmpName("");
    setEmpIdNum(String(Math.floor(100 + Math.random() * 900)));
    setEmpDept(departments[0]?.name || "Contact Center");
    setEmpRole("Team Leader");
    setEmpTeam("");
    setEmpDirectManager("Omer Ayad");
    setEmpCustomPosition("");
    setEmpRoleType("tl");
    setIsAddingEmployee(true);
  };

  const handleStartEditEmployee = (emp: DynamicEmployee) => {
    setEditingEmpId(emp.id);
    setEmpName(emp.name);
    setEmpIdNum(emp.employee_id);
    setEmpDept(emp.department);
    setEmpRole(emp.role);
    setEmpTeam(emp.team || "");
    setEmpDirectManager(emp.direct_manager || emp.team?.replace(' Team', '') || "");
    setEmpCustomPosition(emp.custom_position || (emp.role_type === 'custom' ? emp.role : ""));
    setEmpRoleType(emp.role_type || "agent");
    setIsAddingEmployee(true);
  };

  const handleSaveEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const finalRole = empRoleType === 'custom' 
      ? (empCustomPosition.trim() || empRole.trim() || "Specialist")
      : (empRole.trim() || "Staff");
    const finalDm = empDirectManager.trim() || empTeam.trim() || "Omer Ayad";
    const finalTeam = empTeam.trim() || (finalDm ? `${finalDm} Team` : "General");

    if (editingEmpId) {
      const updated = employees.map(emp => {
        if (emp.id === editingEmpId) {
          return {
            ...emp,
            name: empName.trim(),
            employee_id: empIdNum.trim() || emp.employee_id,
            department: empDept,
            role: finalRole,
            team: finalTeam,
            direct_manager: finalDm,
            custom_position: empRoleType === 'custom' ? finalRole : undefined,
            role_type: empRoleType
          };
        }
        return emp;
      });
      onSaveEmployees(updated);
    } else {
      const newEmp: DynamicEmployee = {
        id: "emp_" + Date.now(),
        name: empName.trim(),
        employee_id: empIdNum.trim() || String(Math.floor(300 + Math.random() * 600)),
        department: empDept,
        role: finalRole,
        team: finalTeam,
        direct_manager: finalDm,
        custom_position: empRoleType === 'custom' ? finalRole : undefined,
        role_type: empRoleType
      };
      onSaveEmployees([...employees, newEmp]);
    }

    setIsAddingEmployee(false);
    setEditingEmpId(null);
  };

  const handleDeleteEmployee = (id: string) => {
    const confirmMsg = isAr ? "هل أنت متأكد من حذف هذا الموظف من القائمة؟" : "Are you sure you want to delete this employee?";
    if (confirm(confirmMsg)) {
      const filtered = employees.filter(e => e.id !== id);
      onSaveEmployees(filtered);
    }
  };

  // Handle Department Form
  const handleStartAddDept = () => {
    setEditingDeptId(null);
    setDeptName("");
    setDeptNameAr("");
    setDeptDesc("");
    setDeptColor("emerald");
    setIsAddingDept(true);
  };

  const handleStartEditDept = (dept: DynamicDepartment) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptNameAr(dept.nameAr || "");
    setDeptDesc(dept.description || "");
    setDeptColor(dept.color || "emerald");
    setIsAddingDept(true);
  };

  const handleSaveDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    if (editingDeptId) {
      const updated = departments.map(d => {
        if (d.id === editingDeptId) {
          return {
            ...d,
            name: deptName.trim(),
            nameAr: deptNameAr.trim() || undefined,
            description: deptDesc.trim() || undefined,
            color: deptColor
          };
        }
        return d;
      });
      onSaveDepartments(updated);
    } else {
      const newDept: DynamicDepartment = {
        id: "dept_" + Date.now(),
        name: deptName.trim(),
        nameAr: deptNameAr.trim() || undefined,
        description: deptDesc.trim() || undefined,
        color: deptColor
      };
      onSaveDepartments([...departments, newDept]);
    }

    setIsAddingDept(false);
    setEditingDeptId(null);
  };

  const handleDeleteDept = (id: string, name: string) => {
    const hasStaff = employees.some(e => e.department === name);
    if (hasStaff) {
      alert(isAr 
        ? `لا يمكن حذف قسم "${name}" لأنه يحتوي على موظفين مسجلين حالياً. يرجى نقلهم أولاً.` 
        : `Cannot delete department "${name}" because it currently has registered employees. Please reassign them first.`);
      return;
    }
    const confirmMsg = isAr ? `هل أنت متأكد من حذف قسم "${name}"؟` : `Are you sure you want to delete department "${name}"?`;
    if (confirm(confirmMsg)) {
      onSaveDepartments(departments.filter(d => d.id !== id));
    }
  };

  const handleResetDefaults = () => {
    const confirmMsg = isAr ? "هل تريد استعادة قائمة الموظفين والأقسام الافتراضية؟" : "Do you want to restore the default employees and departments?";
    if (confirm(confirmMsg)) {
      onSaveDepartments(DEFAULT_DEPARTMENTS);
      onSaveEmployees(DEFAULT_EMPLOYEES);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0E3A2F] to-[#1C6B53] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-xs">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {isAr ? "إدارة الموظفين والأقسام" : "Employees & Departments Management"}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100">
                  {employees.length} {isAr ? "موظف" : "Employees"} • {departments.length} {isAr ? "أقسام" : "Departments"}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                {isAr ? "إضافة وتعديل بيانات الموظفين والأقسام للتقييم السنوي" : "Add, edit, and organize staff rosters and departments for annual evaluation"}
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

        {/* Tab Controls & Actions */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Main Tabs */}
          <div className="flex items-center p-1 bg-gray-200/80 dark:bg-gray-700/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("employees")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "employees"
                  ? "bg-white dark:bg-gray-800 text-[#1C6B53] dark:text-emerald-300 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              <Users size={15} />
              <span>{isAr ? `الموظفين (${employees.length})` : `Employees (${employees.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("departments")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "departments"
                  ? "bg-white dark:bg-gray-800 text-[#1C6B53] dark:text-emerald-300 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              <Building2 size={15} />
              <span>{isAr ? `الأقسام (${departments.length})` : `Departments (${departments.length})`}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeTab === "employees" ? (
              <button
                type="button"
                onClick={handleStartAddEmployee}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C6B53] hover:bg-[#155340] text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>{isAr ? "إضافة موظف جديد" : "Add Employee"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartAddDept}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C6B53] hover:bg-[#155340] text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>{isAr ? "إضافة قسم جديد" : "Add Department"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 transition"
              title={isAr ? "إعادة التعيين للافتراضي" : "Reset to Defaults"}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Tab 1: Employees View */}
        {activeTab === "employees" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Search & Dept Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search size={15} className={`absolute ${isAr ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-gray-400`} />
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder={isAr ? "بحث باسم الموظف، الرقم الوظيفي، أو المسمى..." : "Search employee by name, ID, or job title..."}
                  className={`w-full h-9 ${isAr ? "pr-9 pl-3" : "pl-9 pr-3"} text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden`}
                />
              </div>

              {/* Department Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter("all")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                    selectedDeptFilter === "all"
                      ? "bg-[#1C6B53] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {isAr ? "جميع الأقسام" : "All Departments"}
                </button>
                {departments.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDeptFilter(d.name)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                      selectedDeptFilter === d.name
                        ? "bg-[#1C6B53] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {isAr ? (d.nameAr || d.name) : d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add / Edit Employee Form */}
            {isAddingEmployee && (
              <form onSubmit={handleSaveEmployeeSubmit} className="p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl shadow-xs animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3 border-b border-emerald-200 dark:border-emerald-800/80 pb-2">
                  <span className="text-xs font-black text-[#1C6B53] dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>
                      {editingEmpId 
                        ? (isAr ? "تعديل بيانات الموظف" : "Edit Employee Details") 
                        : (isAr ? "إضافة موظف جديد" : "Add New Employee")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingEmployee(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "اسم الموظف الكامل *" : "Employee Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="e.g. Younis Kamal, Sara Ahmed"
                      className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "الرقم الوظيفي (ID) *" : "Employee ID *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={empIdNum}
                      onChange={(e) => setEmpIdNum(e.target.value)}
                      placeholder="e.g. 373, 501"
                      className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "القسم *" : "Department *"}
                    </label>
                    <ModernDropdown
                      value={empDept}
                      onChange={(val) => setEmpDept(val)}
                      options={departments.map(d => ({
                        value: d.name,
                        label: isAr ? (d.nameAr ? `${d.nameAr} (${d.name})` : d.name) : d.name
                      }))}
                      fullWidth
                      variant="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "نوع الدور الوظيفي *" : "Role Category *"}
                    </label>
                    <ModernDropdown
                      value={empRoleType || "tl"}
                      onChange={(val: any) => {
                        setEmpRoleType(val);
                        if (val === "custom") {
                          if (empRole === "Team Leader" || empRole === "Staff / Agent" || !empCustomPosition) {
                            setEmpRole("");
                          }
                        } else if (!empRole || empRoleType === "custom") {
                          if (val === "tl") setEmpRole("Team Leader");
                          else if (val === "qa") setEmpRole("Quality Auditor");
                          else if (val === "trainer") setEmpRole("Trainer");
                          else if (val === "backoffice") setEmpRole("Back Office Specialist");
                          else setEmpRole("Customer Care Agent");
                        }
                      }}
                      options={[
                        { value: "tl", label: isAr ? "Team Leader (قائد فريق)" : "Team Leader" },
                        { value: "agent", label: isAr ? "Staff / Agent (موظف أداء)" : "Staff / Agent" },
                        { value: "qa", label: isAr ? "Quality Auditor (جودة)" : "Quality Auditor" },
                        { value: "trainer", label: isAr ? "Trainer (تدريب)" : "Trainer" },
                        { value: "backoffice", label: isAr ? "Back Office (عمليات دعم)" : "Back Office" },
                        { value: "custom", label: isAr ? "Specialist / Custom (مختص / بوزيشن خاص)" : "Specialist / Custom" },
                      ]}
                      fullWidth
                      variant="input"
                    />
                  </div>

                  {empRoleType !== "custom" ? (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {isAr ? "المسمى الوظيفي (Job Title) *" : "Job Title *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={empRole}
                        onChange={(e) => setEmpRole(e.target.value)}
                        placeholder="e.g. Team Leader, Customer Care Specialist"
                        className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-black text-[#1C6B53] dark:text-emerald-400 mb-1 flex items-center gap-1">
                        <Sparkles size={12} />
                        <span>{isAr ? "اكتب البوزيشن (Position) *" : "Custom Position *"}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={empCustomPosition}
                        onChange={(e) => {
                          setEmpCustomPosition(e.target.value);
                          setEmpRole(e.target.value);
                        }}
                        placeholder={isAr ? "اكتب المسمى الوظيفي الخاص..." : "Type custom position..."}
                        className="w-full h-9 px-3 text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border-2 border-[#1C6B53] dark:border-emerald-500 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold text-gray-900 dark:text-white"
                        autoFocus
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "المدير المباشر (Direct Manager) *" : "Direct Manager *"}
                    </label>
                    <input
                      type="text"
                      required
                      list="direct-managers-list"
                      value={empDirectManager}
                      onChange={(e) => {
                        setEmpDirectManager(e.target.value);
                        setEmpTeam(e.target.value ? `${e.target.value} Team` : "");
                      }}
                      placeholder={isAr ? "اسم المدير المباشر (مثل: عمر إياد، يونس كمال...)" : "e.g. Omer Ayad, Younis Kamal..."}
                      className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden"
                    />
                    <datalist id="direct-managers-list">
                      <option value="Omer Ayad" />
                      <option value="Mohammed Dlshad" />
                      <option value="Younis Kamal" />
                      <option value="Ankido Buya" />
                      <option value="Jalal Burghol" />
                      {Array.from(new Set(employees.filter(e => e.role_type === 'tl' || (e.role || "").toLowerCase().includes('manager') || (e.role || "").toLowerCase().includes('leader')).map(e => e.name))).map(mgrName => (
                        <option key={mgrName} value={mgrName} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEmployee(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-xs transition active:scale-95"
                  >
                    {editingEmpId 
                      ? (isAr ? "حفظ التعديلات" : "Save Changes") 
                      : (isAr ? "إضافة الموظف" : "Save Employee")}
                  </button>
                </div>
              </form>
            )}

            {/* Employee Cards List */}
            <div className="space-y-2">
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <AlertCircle size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold">{isAr ? "لا يوجد موظفون مطابقون لبحثك" : "No employees match your search"}</p>
                </div>
              ) : (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl hover:border-[#1C6B53]/40 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C6B53] to-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                            {emp.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
                            ID: {emp.employee_id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#1C6B53] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {emp.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            emp.role_type === 'custom'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {emp.custom_position || emp.role}
                          </span>
                          {(emp.direct_manager || emp.team) && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span>•</span>
                              <span>{isAr ? "المدير المباشر:" : "Direct Manager:"}</span>
                              <strong className="text-gray-800 dark:text-gray-200 font-bold">
                                {emp.direct_manager || emp.team?.replace(' Team', '')}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectEmployeeForEval && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectEmployeeForEval(emp.name);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1C6B53]/10 hover:bg-[#1C6B53] text-[#1C6B53] hover:text-white text-xs font-black transition cursor-pointer"
                          title={isAr ? "تقييم هذا الموظف الآن" : "Evaluate Employee Now"}
                        >
                          <UserCheck size={14} />
                          <span className="hidden sm:inline">{isAr ? "تقييم الآن" : "Evaluate"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartEditEmployee(emp)}
                        className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                        title={isAr ? "تعديل الموظف" : "Edit Employee"}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title={isAr ? "حذف الموظف" : "Delete Employee"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Departments View */}
        {activeTab === "departments" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Add / Edit Department Form */}
            {isAddingDept && (
              <form onSubmit={handleSaveDeptSubmit} className="p-4 sm:p-5 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 rounded-2xl shadow-xs animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3 border-b border-purple-200 dark:border-purple-800/80 pb-2">
                  <span className="text-xs font-black text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>
                      {editingDeptId 
                        ? (isAr ? "تعديل بيانات القسم" : "Edit Department") 
                        : (isAr ? "إضافة قسم جديد" : "Add New Department")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingDept(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "اسم القسم (إنجليزي) *" : "Department Name (English) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. IT, Risk & Compliance, Finance"
                      className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "اسم القسم بالعربية" : "Department Name (Arabic)"}
                    </label>
                    <input
                      type="text"
                      value={deptNameAr}
                      onChange={(e) => setDeptNameAr(e.target.value)}
                      placeholder="مثال: إدارة تكنولوجيا المعلومات، المالية"
                      className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "وصف القسم أو المهام" : "Department Description"}
                  </label>
                  <input
                    type="text"
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    placeholder={isAr ? "وصف مختصر لمسؤوليات القسم..." : "Brief overview of department functions..."}
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingDept(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-black text-white bg-purple-700 hover:bg-purple-800 shadow-xs transition active:scale-95"
                  >
                    {editingDeptId 
                      ? (isAr ? "حفظ التعديلات" : "Save Changes") 
                      : (isAr ? "إضافة القسم" : "Save Department")}
                  </button>
                </div>
              </form>
            )}

            {/* Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept) => {
                const count = employees.filter(e => e.department === dept.name).length;
                return (
                  <div
                    key={dept.id}
                    className="p-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-[#1C6B53]/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1C6B53]/15 text-[#1C6B53] dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                          {isAr && dept.nameAr ? dept.nameAr : dept.name}
                        </h4>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {count} {isAr ? "موظف مسجل" : "registered staff"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditDept(dept)}
                        className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title={isAr ? "تعديل القسم" : "Edit Department"}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDept(dept.id, dept.name)}
                        className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={isAr ? "حذف القسم" : "Delete Department"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? "يتم تحديث قوائم الموظفين والأقسام فورياً في لوحة التقييم السنوي." : "Staff and department rosters update instantly in the annual evaluation dashboard."}
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
