"use client";

import React, { useState, useMemo } from "react";
import { 
  X, Plus, Trash2, Edit2, Users, Building2, 
  Search, Sparkles, UserCheck, RefreshCw, AlertCircle,
  AlertTriangle, Check, ShieldAlert
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

  // Department Search & Filters
  const [deptSearch, setDeptSearch] = useState<string>("");
  const [selectedDeptViewFilter, setSelectedDeptViewFilter] = useState<string>("all");

  // Employee Form State (Opens as a Dedicated Modal)
  const [isAddingEmployee, setIsAddingEmployee] = useState<boolean>(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empName, setEmpName] = useState<string>("");
  const [empIdNum, setEmpIdNum] = useState<string>("");
  const [empDept, setEmpDept] = useState<string>(departments[0]?.name || "Contact Center");
  const [empRole, setEmpRole] = useState<string>("Team Leader");
  const [empTeam, setEmpTeam] = useState<string>("");
  const [empDirectManager, setEmpDirectManager] = useState<string>("");
  const [empDeptChief, setEmpDeptChief] = useState<string>("Omer Ayad");
  const [empCustomPosition, setEmpCustomPosition] = useState<string>("");
  const [empRoleType, setEmpRoleType] = useState<DynamicEmployee["role_type"]>("tl");

  // Department Form State (Opens as a Dedicated Modal)
  const [isAddingDept, setIsAddingDept] = useState<boolean>(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string>("");
  const [deptNameAr, setDeptNameAr] = useState<string>("");
  const [deptDesc, setDeptDesc] = useState<string>("");
  const [deptDirectManager, setDeptDirectManager] = useState<string>("");
  const [deptChief, setDeptChief] = useState<string>("Omer Ayad");
  const [deptColor, setDeptColor] = useState<string>("emerald");

  // Modern Confirmation Popup State (Replaces browser alert/confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "employee" | "department" | "reset";
    id?: string;
    name?: string;
    warning?: string;
  } | null>(null);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = !empSearch || 
        emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.employee_id.includes(empSearch) ||
        (emp.role || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.direct_manager || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.department_chief || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.custom_position || "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (emp.team || "").toLowerCase().includes(empSearch.toLowerCase());
      
      const matchDept = selectedDeptFilter === "all" || emp.department === selectedDeptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, empSearch, selectedDeptFilter]);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const q = deptSearch.trim().toLowerCase();
      const matchSearch = !q ||
        dept.name.toLowerCase().includes(q) ||
        (dept.nameAr || "").toLowerCase().includes(q) ||
        (dept.description || "").toLowerCase().includes(q) ||
        (dept.direct_manager || "").toLowerCase().includes(q) ||
        (dept.department_chief || "").toLowerCase().includes(q);

      const matchFilter = selectedDeptViewFilter === "all" || dept.name === selectedDeptViewFilter;
      return matchSearch && matchFilter;
    });
  }, [departments, deptSearch, selectedDeptViewFilter]);

  if (!isOpen) return null;

  // Handle Employee Form Open
  const handleStartAddEmployee = () => {
    setEditingEmpId(null);
    setEmpName("");
    setEmpIdNum(String(Math.floor(100 + Math.random() * 900)));
    setEmpDept(departments[0]?.name || "Contact Center");
    setEmpRole("Team Leader");
    setEmpTeam("");
    setEmpDirectManager("Omer Ayad");
    setEmpDeptChief("Omer Ayad");
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
    setEmpDirectManager(emp.direct_manager || emp.team?.replace(' Team', '') || "Omer Ayad");
    setEmpDeptChief(emp.department_chief || "Omer Ayad");
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

  // Modern Delete Request
  const handleRequestDeleteEmployee = (emp: DynamicEmployee) => {
    setDeleteTarget({
      type: "employee",
      id: emp.id,
      name: emp.name
    });
  };

  // Handle Department Form Open
  const handleStartAddDept = () => {
    setEditingDeptId(null);
    setDeptName("");
    setDeptNameAr("");
    setDeptDesc("");
    setDeptDirectManager("");
    setDeptChief("Omer Ayad");
    setDeptColor("emerald");
    setIsAddingDept(true);
  };

  const handleStartEditDept = (dept: DynamicDepartment) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptNameAr(dept.nameAr || "");
    setDeptDesc(dept.description || "");
    setDeptDirectManager(dept.direct_manager || "");
    setDeptChief(dept.department_chief || "Omer Ayad");
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
            direct_manager: deptDirectManager.trim() || undefined,
            department_chief: deptChief.trim() || undefined,
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
        direct_manager: deptDirectManager.trim() || undefined,
        department_chief: deptChief.trim() || undefined,
        color: deptColor
      };
      onSaveDepartments([...departments, newDept]);
    }

    setIsAddingDept(false);
    setEditingDeptId(null);
  };

  // Modern Delete Department Request
  const handleRequestDeleteDept = (dept: DynamicDepartment) => {
    const hasStaff = employees.some(e => e.department === dept.name);
    if (hasStaff) {
      setDeleteTarget({
        type: "department",
        id: dept.id,
        name: dept.name,
        warning: isAr
          ? `لا يمكن حذف قسم "${dept.name}" لأنه يحتوي على موظفين مسجلين حالياً. يرجى إعادة تعيين موظفي القسم أولاً.`
          : `Cannot delete department "${dept.name}" because it currently has registered employees. Please reassign them first.`
      });
      return;
    }

    setDeleteTarget({
      type: "department",
      id: dept.id,
      name: dept.name
    });
  };

  const handleRequestResetDefaults = () => {
    setDeleteTarget({
      type: "reset",
      name: isAr ? "استعادة الإعدادات الافتراضية" : "Restore Defaults"
    });
  };

  const handleConfirmAction = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "employee" && deleteTarget.id) {
      const filtered = employees.filter(e => e.id !== deleteTarget.id);
      onSaveEmployees(filtered);
    } else if (deleteTarget.type === "department" && deleteTarget.id) {
      onSaveDepartments(departments.filter(d => d.id !== deleteTarget.id));
    } else if (deleteTarget.type === "reset") {
      onSaveDepartments(DEFAULT_DEPARTMENTS);
      onSaveEmployees(DEFAULT_EMPLOYEES);
    }

    setDeleteTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
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
              onClick={handleRequestResetDefaults}
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
            
            {/* Search & Dept Filters - Elongated Search Bar + Modern Department Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={15} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder={isAr ? "بحث باسم الموظف، الرقم الوظيفي، أو المسمى..." : "Search employee by name, ID, or job title..."}
                  className={`w-full h-10 ${isAr ? "pr-10 pl-8" : "pl-10 pr-8"} text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden shadow-2xs font-medium`}
                />
                {empSearch && (
                  <button
                    type="button"
                    onClick={() => setEmpSearch("")}
                    className={`absolute ${isAr ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-md`}
                    title={isAr ? "مسح البحث" : "Clear search"}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Department Dropdown Filter */}
              <div className="w-full sm:w-auto shrink-0 min-w-[210px]">
                <ModernDropdown
                  value={selectedDeptFilter}
                  onChange={(val) => setSelectedDeptFilter(val)}
                  options={[
                    {
                      value: "all",
                      label: isAr ? `جميع الأقسام (${employees.length})` : `All Departments (${employees.length})`,
                      icon: Building2,
                    },
                    ...departments.map((d) => {
                      const count = employees.filter((e) => e.department === d.name).length;
                      return {
                        value: d.name,
                        label: isAr
                          ? `${d.nameAr || d.name} (${count})`
                          : `${d.name} (${count})`,
                        icon: Building2,
                      };
                    }),
                  ]}
                  variant="gray"
                  size="sm"
                  fullWidth
                />
              </div>
            </div>

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
                          {emp.department_chief && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span>•</span>
                              <span>{isAr ? "شيف القسم:" : "Chief:"}</span>
                              <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
                                {emp.department_chief}
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
                        onClick={() => handleRequestDeleteEmployee(emp)}
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
            
            {/* Search & Dept Filters - Elongated Search Bar + Modern Department Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={15} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder={isAr ? "بحث باسم القسم، المدير المباشر، أو الشيف..." : "Search department by name, manager, or chief..."}
                  className={`w-full h-10 ${isAr ? "pr-10 pl-8" : "pl-10 pr-8"} text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden shadow-2xs font-medium`}
                />
                {deptSearch && (
                  <button
                    type="button"
                    onClick={() => setDeptSearch("")}
                    className={`absolute ${isAr ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-md`}
                    title={isAr ? "مسح البحث" : "Clear search"}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Department Dropdown Filter */}
              <div className="w-full sm:w-auto shrink-0 min-w-[210px]">
                <ModernDropdown
                  value={selectedDeptViewFilter}
                  onChange={(val) => setSelectedDeptViewFilter(val)}
                  options={[
                    {
                      value: "all",
                      label: isAr ? `جميع الأقسام (${departments.length})` : `All Departments (${departments.length})`,
                      icon: Building2,
                    },
                    ...departments.map((d) => {
                      const count = employees.filter((e) => e.department === d.name).length;
                      return {
                        value: d.name,
                        label: isAr
                          ? `${d.nameAr || d.name} (${count})`
                          : `${d.name} (${count})`,
                        icon: Building2,
                      };
                    }),
                  ]}
                  variant="gray"
                  size="sm"
                  fullWidth
                />
              </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDepartments.length === 0 ? (
                <div className="col-span-full p-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <AlertCircle size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold">{isAr ? "لا توجد أقسام مطابقة لبحثك" : "No departments match your search"}</p>
                </div>
              ) : (
                filteredDepartments.map((dept) => {
                const count = employees.filter(e => e.department === dept.name).length;
                return (
                  <div
                    key={dept.id}
                    className="p-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-[#1C6B53]/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                          {dept.name}
                        </h4>
                        {dept.nameAr && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                            {dept.nameAr}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#1C6B53] dark:text-emerald-400">
                            {count} {isAr ? "موظف" : "Staff"}
                          </span>
                          {dept.direct_manager && (
                            <>
                              <span>•</span>
                              <span className="text-gray-600 dark:text-gray-300 font-medium">
                                {isAr ? "المدير:" : "Manager:"} <strong className="font-bold text-gray-900 dark:text-white">{dept.direct_manager}</strong>
                              </span>
                            </>
                          )}
                          {dept.department_chief && (
                            <>
                              <span>•</span>
                              <span className="text-purple-700 dark:text-purple-300 font-medium">
                                {isAr ? "شيف القسم:" : "Chief:"} <strong className="font-bold text-purple-900 dark:text-purple-200">{dept.department_chief}</strong>
                              </span>
                            </>
                          )}
                          {dept.description && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[180px]">{dept.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditDept(dept)}
                        className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                        title={isAr ? "تعديل القسم" : "Edit Department"}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDeleteDept(dept)}
                        className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title={isAr ? "حذف القسم" : "Delete Department"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>

          </div>
        )}

      </div>

      {/* DEDICATED MODAL: Add / Edit Employee (Clean, Focused, Dedicated Dialog) */}
      {isAddingEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Dedicated Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#0E3A2F] to-[#1C6B53] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {editingEmpId 
                      ? (isAr ? `تعديل بيانات الموظف: ${empName}` : `Edit Employee: ${empName}`) 
                      : (isAr ? "إضافة موظف جديد للتقييم السنوي" : "Add New Employee for Evaluation")}
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    {isAr ? "املأ بيانات الموظف، القسم، والمدير المباشر" : "Fill out employee details, role, and direct manager"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingEmployee(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
                title={isAr ? "إغلاق" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Dedicated Form Body */}
            <form onSubmit={handleSaveEmployeeSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "اسم الموظف الكامل *" : "Employee Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Younis Kamal, Sara Ahmed"
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "الرقم الوظيفي (ID) *" : "Employee ID *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={empIdNum}
                    onChange={(e) => setEmpIdNum(e.target.value)}
                    placeholder="e.g. 373, 501"
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isAr ? "المسمى الوظيفي (Job Title) *" : "Job Title *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      placeholder="e.g. Team Leader, Customer Care Specialist"
                      className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-black text-[#1C6B53] dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <Sparkles size={13} />
                      <span>{isAr ? "اكتب البوزيشن الخاص *" : "Custom Position *"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empCustomPosition}
                      onChange={(e) => {
                        setEmpCustomPosition(e.target.value);
                        setEmpRole(e.target.value);
                      }}
                      placeholder={isAr ? "اكتب المسمى الوظيفي..." : "Type custom position..."}
                      className="w-full h-10 px-3.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border-2 border-[#1C6B53] dark:border-emerald-500 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "اسم الفريق (Team)" : "Team / Unit"}
                  </label>
                  <input
                    type="text"
                    value={empTeam}
                    onChange={(e) => setEmpTeam(e.target.value)}
                    placeholder="e.g. Younis Kamal Team, Calls Team"
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Direct Manager Field Only (User Request: Employee modal only has Direct Manager) */}
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl">
                <label className="block text-xs font-black text-[#1C6B53] dark:text-emerald-300 mb-1">
                  {isAr ? "اسم المدير المباشر (Direct Manager) *" : "Direct Manager *"}
                </label>
                <input
                  type="text"
                  required
                  list="modal-direct-managers-list"
                  value={empDirectManager}
                  onChange={(e) => {
                    setEmpDirectManager(e.target.value);
                    if (!empTeam) setEmpTeam(e.target.value ? `${e.target.value} Team` : "");
                  }}
                  placeholder={isAr ? "اسم المدير المباشر (مثل: يونس كمال، أنكيدو بويا، عمر إياد...)" : "e.g. Younis Kamal, Ankido Buya, Omer Ayad..."}
                  className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                />
                <datalist id="modal-direct-managers-list">
                  <option value="Younis Kamal" />
                  <option value="Ankido Buya" />
                  <option value="Mohammed Dlshad" />
                  <option value="Mohammed Azad" />
                  <option value="Lara Kamil" />
                  <option value="Shireen Waisi" />
                  <option value="Omer Ayad" />
                  <option value="Jalal Burghol" />
                </datalist>
              </div>

              {/* Dedicated Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddingEmployee(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-black text-white bg-[#1C6B53] hover:bg-[#155340] shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>
                    {editingEmpId 
                      ? (isAr ? "حفظ التعديلات" : "Save Changes") 
                      : (isAr ? "حفظ وإضافة الموظف" : "Save Employee")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED MODAL: Add / Edit Department (Clean, Focused, Dedicated Dialog) */}
      {isAddingDept && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {editingDeptId 
                      ? (isAr ? `تعديل القسم: ${deptName}` : `Edit Department: ${deptName}`) 
                      : (isAr ? "إضافة قسم تنظيمي جديد" : "Add New Department")}
                  </h3>
                  <p className="text-xs text-purple-200 font-medium">
                    {isAr ? "تحديد مسمى القسم، المدير المباشر مال التيم، والشيف" : "Define department scope, team direct manager, and department chief"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingDept(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
                title={isAr ? "إغلاق" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveDeptSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "اسم القسم (إنجليزي) *" : "Department Name (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. IT, Risk & Compliance, Finance"
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-bold"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "اسم القسم بالعربية" : "Department Name (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={deptNameAr}
                    onChange={(e) => setDeptNameAr(e.target.value)}
                    placeholder="مثال: إدارة تكنولوجيا المعلومات، المالية"
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-bold text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Direct Manager of the Team & Department Chief (User Request) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 rounded-2xl">
                <div>
                  <label className="block text-xs font-black text-purple-900 dark:text-purple-200 mb-1">
                    {isAr ? "المدير المباشر مال التيم (Team Direct Manager)" : "Team Direct Manager"}
                  </label>
                  <input
                    type="text"
                    list="modal-dept-team-direct-managers"
                    value={deptDirectManager}
                    onChange={(e) => setDeptDirectManager(e.target.value)}
                    placeholder={isAr ? "اسم المدير المباشر للتيم (مثل: يونس كمال، أنكيدو بويا...)" : "e.g. Younis Kamal, Ankido Buya, Team Leader"}
                    className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-bold"
                  />
                  <datalist id="modal-dept-team-direct-managers">
                    <option value="Younis Kamal" />
                    <option value="Ankido Buya" />
                    <option value="Mohammed Dlshad" />
                    <option value="Lara Kamil" />
                    <option value="Mohammed Azad" />
                    <option value="Shireen Waisi" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-black text-purple-900 dark:text-purple-200 mb-1">
                    {isAr ? "شيف القسم (Department Chief / Head)" : "Department Chief / Head"}
                  </label>
                  <input
                    type="text"
                    list="modal-dept-chiefs-list"
                    value={deptChief}
                    onChange={(e) => setDeptChief(e.target.value)}
                    placeholder={isAr ? "اسم شيف القسم (مثل: عمر إياد)" : "e.g. Omer Ayad"}
                    className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-bold"
                  />
                  <datalist id="modal-dept-chiefs-list">
                    <option value="Omer Ayad" />
                    <option value="Jalal Burghol" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "وصف القسم أو نطاق المهام" : "Department Description / Scope"}
                </label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder={isAr ? "وصف مختصر لمسؤوليات القسم وأهدافه..." : "Brief overview of department functions and KPIs..."}
                  className="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-medium"
                />
              </div>

              {/* Dedicated Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddingDept(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-black text-white bg-purple-700 hover:bg-purple-800 shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>
                    {editingDeptId 
                      ? (isAr ? "حفظ التعديلات" : "Save Changes") 
                      : (isAr ? "حفظ القسم" : "Save Department")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED CONFIRMATION POPUP: Modern, Elegant Modal (Replaces browser window.confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            {deleteTarget.warning ? (
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-amber-50 dark:ring-amber-950/30">
                <ShieldAlert size={28} />
              </div>
            ) : deleteTarget.type === "reset" ? (
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-blue-50 dark:ring-blue-950/30">
                <RefreshCw size={26} />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-rose-50 dark:ring-rose-950/30">
                <Trash2 size={26} />
              </div>
            )}

            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1.5">
              {deleteTarget.warning 
                ? (isAr ? "تنبيه" : "Action Blocked")
                : deleteTarget.type === "reset"
                ? (isAr ? "استعادة الإعدادات الافتراضية" : "Restore Defaults")
                : (isAr ? "تأكيد الحذف" : "Confirm Deletion")}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
              {deleteTarget.warning ? (
                deleteTarget.warning
              ) : deleteTarget.type === "reset" ? (
                isAr 
                  ? "هل تريد بالتأكيد استعادة قائمة الموظفين والأقسام الافتراضية؟ سيتم الاحتفاظ بالسجلات المحفوظة."
                  : "Are you sure you want to restore the default employees and departments roster?"
              ) : (
                isAr 
                  ? <>هل أنت متأكد من حذف <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</>
                  : <>Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>? This action cannot be undone.</>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
              >
                {deleteTarget.warning ? (isAr ? "فهمت ذلك" : "Got it") : (isAr ? "إلغاء" : "Cancel")}
              </button>

              {!deleteTarget.warning && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
