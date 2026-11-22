"use client";

import React, { useState, useMemo } from "react";
import { 
  X, Plus, Trash2, Edit2, Users, Building2, 
  Search, Sparkles, UserCheck, RefreshCw, AlertCircle,
  AlertTriangle, Check, ShieldAlert, Crown
} from "lucide-react";
import { 
  DynamicDepartment, 
  DynamicEmployee, 
  DEFAULT_DEPARTMENTS, 
  DEFAULT_EMPLOYEES 
} from "@/lib/customCriteriaManager";
import { 
  getDepartmentIcon, 
  BANK_DEPARTMENT_ICONS, 
  BankIconCategory, 
  getDepartmentIconMeta 
} from "@/lib/bankDepartmentIcons";
import { Language } from "@/lib/translations";
import { useAppTheme } from "@/lib/themeManager";
import ModernDropdown from "@/components/ModernDropdown";

interface ManageStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: DynamicDepartment[];
  employees: DynamicEmployee[];
  onSaveDepartments: (depts: DynamicDepartment[], deletedIdOrFlag?: string, deletedName?: string) => void;
  onSaveEmployees: (emps: DynamicEmployee[], deletedName?: string, deletedId?: string) => void;
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
  const { currentTheme } = useAppTheme();
  const brandGradient = currentTheme?.gradientStyle || "linear-gradient(135deg, #10664F 0%, #0D523F 50%, #09382B 100%)";
  const brandPrimary = currentTheme?.primary || "#10664F";
  const brandHover = currentTheme?.hover || "#0D523F";
  const brandLightBg = currentTheme?.bgLight || "#ECFDF5";
  const brandLightText = currentTheme?.textLight || "#065F46";
  const brandLightBorder = currentTheme?.borderLight || "#A7F3D0";
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
  const [empDept, setEmpDept] = useState<string>(departments[0]?.name || "");
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
  const [deptIcon, setDeptIcon] = useState<string>("Landmark");
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [iconPickerSearch, setIconPickerSearch] = useState<string>("");
  const [iconPickerCategory, setIconPickerCategory] = useState<BankIconCategory>("all");

  // Filtered Bank Icons for Picker
  const filteredBankIcons = useMemo(() => {
    return BANK_DEPARTMENT_ICONS.filter(item => {
      if (iconPickerCategory !== "all" && item.category !== iconPickerCategory) {
        return false;
      }
      if (!iconPickerSearch.trim()) return true;
      const q = iconPickerSearch.trim().toLowerCase();
      return (
        item.nameEn.toLowerCase().includes(q) ||
        item.nameAr.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [iconPickerCategory, iconPickerSearch]);

  // Modern Confirmation Popup State (Replaces browser alert/confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "employee" | "department" | "reset";
    id?: string;
    name?: string;
    affectedCount?: number;
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

  // Check if role is managerial / leadership
  const isManagerialRole = (roleType?: string, roleName?: string, customPos?: string): boolean => {
    if (roleType === "tl") return true;
    const combined = `${roleName || ""} ${customPos || ""}`.toLowerCase();
    return /leader|manager|head|chief|director|supervisor|lead|مدير|قائد|رئيس|مشرف/i.test(combined);
  };

  // Smart resolution for Direct Manager & Chief based on department and role
  const resolveManagerHierarchy = (
    deptName: string,
    roleType?: string,
    roleName?: string,
    customPos?: string
  ) => {
    const dept = departments.find(d => d.name === deptName || d.nameAr === deptName) || departments[0];
    const isMgr = isManagerialRole(roleType, roleName, customPos);
    const chief = (dept?.department_chief || "Omer Ayad").trim();
    
    let deptMgr = (dept?.direct_manager || "").trim();
    // If empty or "Team Leaders", look for specific team leader if available
    if (!deptMgr || deptMgr.toLowerCase() === "team leaders") {
      const firstTL = employees.find(e => 
        e.department === deptName && 
        (e.role_type === "tl" || (e.role && /leader|manager/i.test(e.role)))
      );
      deptMgr = firstTL ? firstTL.name : chief;
    }

    // Key rule requested by user:
    // If the employee is a manager -> Direct Manager is the Department Chief
    // If the employee is regular staff -> Direct Manager is the Department Manager
    const targetDm = isMgr ? chief : (deptMgr || chief);

    return {
      directManager: targetDm,
      departmentChief: chief,
      deptManager: deptMgr,
      isManager: isMgr,
      deptName: dept?.name || deptName,
      deptNameAr: dept?.nameAr
    };
  };

  // Handle Employee Form Open
  const handleStartAddEmployee = () => {
    setEditingEmpId(null);
    setEmpName("");
    setEmpIdNum(String(Math.floor(100 + Math.random() * 900)));
    const initialDept = (selectedDeptFilter !== "all" && departments.some(d => d.name === selectedDeptFilter))
      ? selectedDeptFilter
      : (departments[0]?.name || "");
    setEmpDept(initialDept);
    setEmpRoleType("agent");
    setEmpRole("Staff");
    setEmpTeam("");
    setEmpCustomPosition("");

    const hierarchy = resolveManagerHierarchy(initialDept, "agent", "Customer Care Agent", "");
    setEmpDirectManager(hierarchy.directManager);
    setEmpDeptChief(hierarchy.departmentChief);
    if (hierarchy.directManager && hierarchy.directManager !== "Omer Ayad") {
      setEmpTeam(`${hierarchy.directManager} Team`);
    } else {
      setEmpTeam("");
    }
    setIsAddingEmployee(true);
  };

  const handleStartEditEmployee = (emp: DynamicEmployee) => {
    setEditingEmpId(emp.id);
    setEmpName(emp.name);
    setEmpIdNum(emp.employee_id);
    setEmpDept(emp.department);
    setEmpRole(emp.role);
    setEmpTeam(emp.team || "");
    setEmpRoleType(emp.role_type || "agent");
    setEmpCustomPosition(emp.custom_position || (emp.role_type === 'custom' ? emp.role : ""));

    const hierarchy = resolveManagerHierarchy(emp.department, emp.role_type || "agent", emp.role, emp.custom_position);
    setEmpDirectManager(emp.direct_manager || hierarchy.directManager);
    setEmpDeptChief(emp.department_chief || hierarchy.departmentChief);
    setIsAddingEmployee(true);
  };

  const handleEmpDeptChange = (newDept: string) => {
    setEmpDept(newDept);
    const hierarchy = resolveManagerHierarchy(newDept, empRoleType, empRole, empCustomPosition);
    setEmpDirectManager(hierarchy.directManager);
    setEmpDeptChief(hierarchy.departmentChief);
    if (!empTeam || empTeam.endsWith("Team")) {
      setEmpTeam(hierarchy.directManager ? `${hierarchy.directManager} Team` : "");
    }
  };

  const handleEmpRoleTypeChange = (val: any) => {
    setEmpRoleType(val);
    let newRole = empRole;
    if (val === "custom") {
      if (empRole === "Team Leader" || empRole === "Staff / Agent" || !empCustomPosition) {
        newRole = "";
      }
    } else if (!empRole || empRoleType === "custom" || empRole === "Team Leader" || empRole === "Staff / Agent") {
      if (val === "tl") newRole = "Team Leader";
      else if (val === "qa") newRole = "Quality Auditor";
      else if (val === "trainer") newRole = "Trainer";
      else if (val === "backoffice") newRole = "Back Office Specialist";
      else newRole = "Customer Care Agent";
    }
    setEmpRole(newRole);

    const hierarchy = resolveManagerHierarchy(empDept, val, newRole, empCustomPosition);
    setEmpDirectManager(hierarchy.directManager);
    setEmpDeptChief(hierarchy.departmentChief);
    if (!empTeam || empTeam.endsWith("Team")) {
      setEmpTeam(hierarchy.directManager ? `${hierarchy.directManager} Team` : "");
    }
  };

  const handleEmpRoleChange = (val: string) => {
    setEmpRole(val);
    const wasMgr = isManagerialRole(empRoleType, empRole, empCustomPosition);
    const isNowMgr = isManagerialRole(empRoleType, val, empCustomPosition);
    if (wasMgr !== isNowMgr) {
      const hierarchy = resolveManagerHierarchy(empDept, empRoleType, val, empCustomPosition);
      setEmpDirectManager(hierarchy.directManager);
      setEmpDeptChief(hierarchy.departmentChief);
    }
  };

  const handleEmpCustomPositionChange = (val: string) => {
    setEmpCustomPosition(val);
    setEmpRole(val);
    const wasMgr = isManagerialRole(empRoleType, empRole, empCustomPosition);
    const isNowMgr = isManagerialRole(empRoleType, val, val);
    if (wasMgr !== isNowMgr) {
      const hierarchy = resolveManagerHierarchy(empDept, empRoleType, val, val);
      setEmpDirectManager(hierarchy.directManager);
      setEmpDeptChief(hierarchy.departmentChief);
    }
  };

  const handleSaveEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const finalRole = empRoleType === 'custom' 
      ? (empCustomPosition.trim() || empRole.trim() || "Specialist")
      : (empRole.trim() || "Staff");
    const finalDm = empDirectManager.trim() || empTeam.trim() || "Omer Ayad";
    const finalChief = empDeptChief.trim() || "Omer Ayad";
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
            department_chief: finalChief,
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
        department_chief: finalChief,
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
    setDeptIcon("Landmark");
    setShowIconPicker(false);
    setIconPickerSearch("");
    setIconPickerCategory("all");
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
    setDeptIcon(dept.icon || "Building2");
    setShowIconPicker(false);
    setIconPickerSearch("");
    setIconPickerCategory("all");
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
            color: deptColor,
            icon: deptIcon
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
        color: deptColor,
        icon: deptIcon
      };
      onSaveDepartments([...departments, newDept]);
    }

    setIsAddingDept(false);
    setEditingDeptId(null);
  };

  // Modern Delete Department Request
  const handleRequestDeleteDept = (dept: DynamicDepartment) => {
    const affectedCount = employees.filter(e => e.department === dept.name || (dept.nameAr && e.department === dept.nameAr)).length;
    setDeleteTarget({
      type: "department",
      id: dept.id,
      name: dept.name,
      affectedCount
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
      const deletedEmp = employees.find(e => e.id === deleteTarget.id);
      const filtered = employees.filter(e => e.id !== deleteTarget.id && e.name !== deleteTarget.name);
      onSaveEmployees(filtered, deletedEmp?.name || deleteTarget.name, deleteTarget.id);
    } else if (deleteTarget.type === "department" && deleteTarget.id) {
      const targetDept = departments.find(d => d.id === deleteTarget.id);
      const filteredDepts = departments.filter(d => d.id !== deleteTarget.id);
      
      // If department had registered employees, safely reassign them to the fallback department
      const fallbackDeptName = filteredDepts[0]?.name || "Contact Center";
      const hasAffectedEmployees = employees.some(e => e.department === targetDept?.name || e.department === deleteTarget.name);
      if (hasAffectedEmployees) {
        const reassignedEmployees = employees.map(e => {
          if (e.department === targetDept?.name || e.department === deleteTarget.name) {
            return { ...e, department: fallbackDeptName };
          }
          return e;
        });
        onSaveEmployees(reassignedEmployees);
      }
      onSaveDepartments(filteredDepts, targetDept?.id || deleteTarget.id, targetDept?.name || deleteTarget.name);
    } else if (deleteTarget.type === "reset") {
      onSaveDepartments(DEFAULT_DEPARTMENTS, "__RESET__");
      onSaveEmployees(DEFAULT_EMPLOYEES, "__RESET__");
    }

    setDeleteTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 text-white flex items-center justify-between shadow-xs" style={{ background: brandGradient }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-xs">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {isAr ? "إدارة الموظفين والأقسام" : "Employees & Departments Management"}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  {employees.length} {isAr ? "موظف" : "Employees"} • {departments.length} {isAr ? "أقسام" : "Departments"}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                {isAr ? "إضافة وتعديل بيانات الموظفين والأقسام للتقييم السنوي" : "Add, edit, and organize staff rosters and departments for annual evaluation"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition border border-white/30 shadow-md cursor-pointer shrink-0"
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
                  ? "bg-white dark:bg-gray-800 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
              style={activeTab === "employees" ? { color: brandPrimary } : {}}
            >
              <Users size={15} />
              <span>{isAr ? `الموظفين (${employees.length})` : `Employees (${employees.length})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("departments")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "departments"
                  ? "bg-white dark:bg-gray-800 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
              style={activeTab === "departments" ? { color: brandPrimary } : {}}
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer hover:opacity-90"
                style={{ backgroundColor: brandPrimary }}
              >
                <Plus size={15} />
                <span>{isAr ? "إضافة موظف جديد" : "Add Employee"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartAddDept}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer hover:opacity-90"
                style={{ backgroundColor: brandPrimary }}
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
                        icon: getDepartmentIcon(d.icon),
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
                <div className="p-10 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2">
                  <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {empSearch ? (isAr ? "لا يوجد موظفون مطابقون لبحثك" : "No employees match your search") : (isAr ? "لا يوجد موظفون مضافون حالياً. اضغط على 'إضافة موظف' أعلاه لإضافة أول موظف." : "No employees added yet. Click 'Add Employee' above to register your first employee.")}
                  </p>
                  {!empSearch && (
                    <button
                      type="button"
                      onClick={handleStartAddEmployee}
                      className="mt-2 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      {isAr ? "+ إضافة أول موظف" : "+ Add First Employee"}
                    </button>
                  )}
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
                        icon: getDepartmentIcon(d.icon),
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
                <div className="col-span-full p-10 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2">
                  <Building2 size={32} className="mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {deptSearch ? (isAr ? "لا توجد أقسام مطابقة لبحثك" : "No departments match your search") : (isAr ? "لا توجد أقسام مضافة حالياً. اضغط على 'إضافة قسم جديد' أعلاه لإنشاء أول قسم." : "No departments added yet. Click 'Add Department' above to create your first department.")}
                  </p>
                  {!deptSearch && (
                    <button
                      type="button"
                      onClick={handleStartAddDept}
                      className="mt-2 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      {isAr ? "+ إضافة أول قسم" : "+ Add First Department"}
                    </button>
                  )}
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
                      {(() => {
                        const DeptCardIcon = getDepartmentIcon(dept.icon);
                        return (
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border"
                            style={{ 
                              backgroundColor: brandLightBg, 
                              color: brandPrimary, 
                              borderColor: brandLightBorder 
                            }}
                          >
                            <DeptCardIcon size={20} />
                          </div>
                        );
                      })()}
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
                                {isAr ? "مدير القسم:" : "Dept Manager:"} <strong className="font-bold text-gray-900 dark:text-white">{dept.direct_manager}</strong>
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
            <div className="p-5 text-white flex items-center justify-between shadow-xs" style={{ background: brandGradient }}>
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
                  <p className="text-xs text-white/90 font-medium">
                    {isAr ? "املأ بيانات الموظف، القسم، والمدير المباشر" : "Fill out employee details, role, and direct manager"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingEmployee(false)}
                className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition cursor-pointer"
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
                  {departments.length === 0 ? (
                    <input
                      type="text"
                      required
                      value={empDept}
                      onChange={(e) => handleEmpDeptChange(e.target.value)}
                      placeholder={isAr ? "اكتب اسم القسم (مثال: IT, Finance)..." : "e.g. IT, Finance, Operations"}
                      className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                    />
                  ) : (
                    <ModernDropdown
                      value={empDept}
                      onChange={(val) => handleEmpDeptChange(val)}
                      options={departments.map(d => ({
                        value: d.name,
                        label: isAr ? (d.nameAr ? `${d.nameAr} (${d.name})` : d.name) : d.name
                      }))}
                      fullWidth
                      variant="input"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "نوع الدور الوظيفي *" : "Role Category *"}
                  </label>
                  <ModernDropdown
                    value={empRoleType || "agent"}
                    onChange={(val: any) => handleEmpRoleTypeChange(val)}
                    options={[
                      { value: "agent", label: isAr ? "Staff / Agent (موظف أداء)" : "Staff / Agent" },
                      { value: "tl", label: isAr ? "Team Leader / Manager (قائد فريق / مدير)" : "Team Leader / Manager" },
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
                      onChange={(e) => handleEmpRoleChange(e.target.value)}
                      placeholder="e.g. Customer Care Agent, Team Leader"
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
                      onChange={(e) => handleEmpCustomPositionChange(e.target.value)}
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
                    placeholder="e.g. Calls Team, Operations Team"
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1C6B53] outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Direct Manager Field with Smart Auto-Hierarchy & Quick Suggestion Pills */}
              {(() => {
                const currentDeptObj = departments.find(d => d.name === empDept || d.nameAr === empDept);
                const isMgr = isManagerialRole(empRoleType, empRole, empCustomPosition);
                const currentDeptMgr = currentDeptObj?.direct_manager?.trim();
                const currentDeptChief = currentDeptObj?.department_chief?.trim() || "Omer Ayad";
                
                // Available TLs in this department
                const availableDeptTLs = employees.filter(e => 
                  e.department === empDept && 
                  (e.role_type === "tl" || (e.role && /leader|manager/i.test(e.role)))
                ).map(e => e.name);

                return (
                  <div 
                    className="p-3.5 rounded-2xl border transition space-y-2.5"
                    style={{ 
                      backgroundColor: brandLightBg,
                      borderColor: brandLightBorder 
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <label className="block text-xs font-black" style={{ color: brandPrimary }}>
                        {isAr ? "اسم المدير المباشر (Direct Manager) *" : "Direct Manager *"}
                      </label>
                      <span 
                        className="text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
                        style={{
                          backgroundColor: isMgr ? "#7e22ce" : brandPrimary,
                          color: "#ffffff"
                        }}
                      >
                        {isMgr ? <Crown size={11} /> : <Building2 size={11} />}
                        <span>
                          {isMgr 
                            ? (isAr ? "يتبع لشيف القسم (دور قيادي/إداري)" : "Reports to Chief (Manager Role)")
                            : (isAr ? "يتبع لمدير القسم (موظف أداء)" : "Reports to Dept Manager (Staff)")}
                        </span>
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      value={empDirectManager}
                      onChange={(e) => {
                        setEmpDirectManager(e.target.value);
                        if (!empTeam) setEmpTeam(e.target.value ? `${e.target.value} Team` : "");
                      }}
                      placeholder={isAr ? "اكتب اسم المدير المباشر..." : "Enter direct manager name..."}
                      className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border rounded-xl outline-hidden font-bold transition focus:ring-2"
                      style={{
                        borderColor: brandLightBorder,
                        // @ts-ignore
                        "--tw-ring-color": brandPrimary
                      }}
                    />

                    {/* Quick Suggestion Pills */}
                    <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {isAr ? "الاقتراحات السريعة:" : "Quick Suggestions:"}
                      </span>

                      {/* Pill 1: Department Manager (from added department) */}
                      {currentDeptMgr && currentDeptMgr.toLowerCase() !== "team leaders" && (
                        <button
                          type="button"
                          onClick={() => {
                            setEmpDirectManager(currentDeptMgr);
                            if (!empTeam || empTeam.endsWith("Team")) setEmpTeam(`${currentDeptMgr} Team`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border shadow-2xs ${
                            empDirectManager === currentDeptMgr
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          <Building2 size={11} />
                          <span>{isAr ? "مدير القسم:" : "Dept Manager:"} {currentDeptMgr}</span>
                        </button>
                      )}

                      {/* Pill 2: Department Chief */}
                      {currentDeptChief && (
                        <button
                          type="button"
                          onClick={() => {
                            setEmpDirectManager(currentDeptChief);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border shadow-2xs ${
                            empDirectManager === currentDeptChief
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-purple-500'
                          }`}
                        >
                          <Crown size={11} />
                          <span>{isAr ? "شيف القسم:" : "Dept Chief:"} {currentDeptChief}</span>
                        </button>
                      )}

                      {/* Contact Center / Specific Team Leaders */}
                      {availableDeptTLs.map(tlName => (
                        <button
                          key={tlName}
                          type="button"
                          onClick={() => {
                            setEmpDirectManager(tlName);
                            if (!empTeam || empTeam.endsWith("Team")) setEmpTeam(`${tlName} Team`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border shadow-2xs ${
                            empDirectManager === tlName
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-500'
                          }`}
                        >
                          <UserCheck size={11} />
                          <span>{tlName}</span>
                        </button>
                      ))}
                    </div>

                    {/* Explanatory Text */}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                      <Sparkles size={11} className="shrink-0 text-amber-500" />
                      <span>
                        {isMgr 
                          ? (isAr 
                              ? `تم اختيار شيف القسم (${currentDeptChief}) تلقائياً لأن الدور قيادي/إداري.` 
                              : `Auto-selected Department Chief (${currentDeptChief}) because this is a managerial/leadership role.`)
                          : (isAr 
                              ? `تم اختيار مدير القسم (${currentDeptMgr || currentDeptChief}) تلقائياً كمدير مباشر.` 
                              : `Auto-selected Department Manager (${currentDeptMgr || currentDeptChief}) as direct manager.`)}
                      </span>
                    </div>
                  </div>
                );
              })()}

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
                  className="px-6 py-2 rounded-xl text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 hover:opacity-90"
                  style={{ backgroundColor: brandPrimary }}
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
            <div className="p-5 text-white flex items-center justify-between shadow-xs" style={{ background: brandGradient }}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white backdrop-blur-sm transition cursor-pointer shadow-md group relative shrink-0"
                  title={isAr ? "اضغط لاختيار أيقونة القسم المصرفي" : "Click to choose bank department icon"}
                >
                  {React.createElement(getDepartmentIcon(deptIcon), { size: 22, className: "group-hover:scale-110 transition" })}
                  <span 
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: brandPrimary }}
                  >
                    ✦
                  </span>
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {editingDeptId 
                      ? (isAr ? `تعديل القسم: ${deptName}` : `Edit Department: ${deptName}`) 
                      : (isAr ? "إضافة قسم تنظيمي جديد" : "Add New Department")}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">
                    {isAr ? "تحديد مسمى القسم، مدير القسم، وشيف القسم" : "Define department scope, department manager, and department chief"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingDept(false)}
                className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition cursor-pointer"
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
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-hidden font-bold transition focus:ring-2"
                    style={{
                      // @ts-ignore
                      "--tw-ring-color": brandPrimary
                    }}
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
                    className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-hidden font-bold text-right transition focus:ring-2"
                    style={{
                      // @ts-ignore
                      "--tw-ring-color": brandPrimary
                    }}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Department Banking Icon Picker Row (Themed dynamically to matched user selection) */}
              {(() => {
                const iconMeta = getDepartmentIconMeta(deptIcon);
                const CurrentIconComp = getDepartmentIcon(deptIcon);
                return (
                  <div 
                    className="p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs border transition"
                    style={{ 
                      backgroundColor: brandLightBg,
                      borderColor: brandLightBorder 
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm border-2 transition"
                        style={{ 
                          color: brandPrimary,
                          borderColor: brandLightBorder
                        }}
                      >
                        <CurrentIconComp size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold" style={{ color: brandPrimary }}>
                            {isAr ? "أيقونة القسم المصرفي" : "Department Banking Icon"}
                          </span>
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                            style={{ 
                              backgroundColor: brandLightBorder,
                              color: brandPrimary 
                            }}
                          >
                            {deptIcon}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-gray-900 dark:text-white truncate mt-0.5">
                          {isAr ? iconMeta.nameAr : iconMeta.nameEn}
                        </h5>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">
                          {isAr ? iconMeta.nameEn : iconMeta.nameAr}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowIconPicker(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-black text-white shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-90"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      <Sparkles size={13} />
                      <span>{isAr ? "اختيار أيقونة..." : "Choose Icon..."}</span>
                    </button>
                  </div>
                );
              })()}

              {/* Department Manager & Department Chief Fields (Themed dynamically) */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl border transition"
                style={{ 
                  backgroundColor: brandLightBg,
                  borderColor: brandLightBorder 
                }}
              >
                <div>
                  <label className="block text-xs font-black mb-1" style={{ color: brandPrimary }}>
                    {isAr ? "مدير القسم (Department Manager)" : "Department Manager"}
                  </label>
                  <input
                    type="text"
                    value={deptDirectManager}
                    onChange={(e) => setDeptDirectManager(e.target.value)}
                    placeholder={isAr ? "اكتب اسم مدير القسم..." : "Enter department manager name..."}
                    className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border rounded-xl outline-hidden font-bold transition focus:ring-2"
                    style={{ 
                      borderColor: brandLightBorder,
                      // @ts-ignore
                      "--tw-ring-color": brandPrimary 
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1" style={{ color: brandPrimary }}>
                    {isAr ? "شيف القسم (Department Chief / Head)" : "Department Chief / Head"}
                  </label>
                  <input
                    type="text"
                    value={deptChief}
                    onChange={(e) => setDeptChief(e.target.value)}
                    placeholder={isAr ? "اكتب اسم شيف القسم..." : "Enter department chief name..."}
                    className="w-full h-10 px-3.5 text-xs bg-white dark:bg-gray-800 border rounded-xl outline-hidden font-bold transition focus:ring-2"
                    style={{ 
                      borderColor: brandLightBorder,
                      // @ts-ignore
                      "--tw-ring-color": brandPrimary 
                    }}
                  />
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
                  className="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-hidden font-medium transition focus:ring-2"
                  style={{
                    // @ts-ignore
                    "--tw-ring-color": brandPrimary
                  }}
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
                  className="px-6 py-2 rounded-xl text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 hover:opacity-90"
                  style={{ backgroundColor: brandPrimary }}
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

      {/* DEDICATED MODAL: Bank Department Icon Picker (User Request) */}
      {showIconPicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Picker Header */}
            <div className="p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-xs" style={{ background: brandGradient }}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {isAr ? "اختيار أيقونة للقسم المصرفي" : "Choose Bank Department Icon"}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">
                    {isAr 
                      ? "أيقونات معتمدة لكافة أقسام ووحدات المصرف التنظيمية" 
                      : "Approved icons covering bank departments and business units"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIconPicker(false)}
                className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition cursor-pointer"
                title={isAr ? "إغلاق" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Picker Search & Category Filters */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 space-y-3 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                <input
                  type="text"
                  value={iconPickerSearch}
                  onChange={(e) => setIconPickerSearch(e.target.value)}
                  placeholder={isAr ? "بحث بالاسم أو القسم (مثل: بطاقات، خزينة، اتصال، جودة، IT، قروض...)" : "Search by name or department (e.g. Cards, Treasury, QA, IT, Loans...)"}
                  className={`w-full h-10 ${isAr ? "pr-10 pl-8 text-right" : "pl-10 pr-8 text-left"} text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-hidden font-bold transition focus:ring-2`}
                  style={{
                    // @ts-ignore
                    "--tw-ring-color": brandPrimary
                  }}
                  autoFocus
                />
                {iconPickerSearch && (
                  <button
                    type="button"
                    onClick={() => setIconPickerSearch("")}
                    className={`absolute ${isAr ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1`}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: "all", labelEn: "All Icons", labelAr: "الكل" },
                  { id: "management", labelEn: "HQ & Legal", labelAr: "الإدارة والقانونية" },
                  { id: "finance", labelEn: "Finance & Cards", labelAr: "المالية والبطاقات" },
                  { id: "customer", labelEn: "Customer & Ops", labelAr: "العملاء والعمليات" },
                  { id: "audit", labelEn: "Quality & Risk", labelAr: "الجودة والمخاطر" },
                  { id: "tech", labelEn: "IT & Systems", labelAr: "التقنية والأنظمة" },
                  { id: "hr", labelEn: "HR & Training", labelAr: "الموارد والتدريب" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIconPickerCategory(cat.id as BankIconCategory)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                      iconPickerCategory === cat.id
                        ? "text-white shadow-xs"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                    }`}
                    style={iconPickerCategory === cat.id ? { backgroundColor: brandPrimary, color: '#ffffff' } : {}}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {filteredBankIcons.length === 0 ? (
                <div className="p-10 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <AlertCircle size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold">{isAr ? "لم يتم العثور على أيقونة مطابقة لبحثك" : "No matching icons found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredBankIcons.map((item) => {
                    const IconComp = getDepartmentIcon(item.id);
                    const isSelected = deptIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setDeptIcon(item.id);
                          setShowIconPicker(false);
                        }}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 relative group ${
                          isSelected
                            ? "shadow-sm ring-2"
                            : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        style={isSelected ? { 
                          backgroundColor: brandLightBg, 
                          borderColor: brandPrimary,
                          // @ts-ignore
                          "--tw-ring-color": brandPrimary + "40"
                        } : {}}
                      >
                        <div 
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition ${
                            isSelected ? "shadow-xs" : "group-hover:scale-105"
                          }`}
                          style={isSelected ? {
                            backgroundColor: brandPrimary,
                            color: '#ffffff'
                          } : {
                            backgroundColor: brandLightBg,
                            color: brandPrimary
                          }}
                        >
                          <IconComp size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h6 
                            className="text-xs font-black truncate"
                            style={isSelected ? { color: brandPrimary } : {}}
                          >
                            {isAr ? item.nameAr : item.nameEn}
                          </h6>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate block">
                            {isAr ? item.nameEn : item.nameAr}
                          </span>
                        </div>
                        {isSelected && (
                          <div 
                            className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: brandPrimary }}
                          >
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Picker Footer */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {isAr ? `${filteredBankIcons.length} أيقونة مصرفية معتمدة` : `${filteredBankIcons.length} approved banking icons`}
              </span>
              <button
                type="button"
                onClick={() => setShowIconPicker(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
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
                : (isAr ? "تأكيد الحذف النهائي" : "Confirm Permanent Deletion")}
            </h4>

            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
              {deleteTarget.warning ? (
                deleteTarget.warning
              ) : deleteTarget.type === "reset" ? (
                isAr 
                  ? "هل تريد بالتأكيد استعادة قائمة الموظفين والأقسام الافتراضية؟ سيتم الاحتفاظ بالسجلات المحفوظة."
                  : "Are you sure you want to restore the default employees and departments roster?"
              ) : deleteTarget.type === "department" && deleteTarget.affectedCount && deleteTarget.affectedCount > 0 ? (
                isAr ? (
                  <div>
                    هل أنت متأكد من حذف قسم <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>؟
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-bold mt-2.5 text-right" dir="rtl">
                      ⚠️ يحتوي هذا القسم على ({deleteTarget.affectedCount}) موظف مسجل حالياً. عند التأكيد، سيتم نقل جميع موظفي هذا القسم تلقائياً إلى قسم (مركز خدمة العملاء) وحذف هذا القسم نهائياً.
                    </div>
                  </div>
                ) : (
                  <div>
                    Are you sure you want to delete department <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>?
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-bold mt-2.5 text-left">
                      ⚠️ This department has ({deleteTarget.affectedCount}) registered employees. Upon confirmation, all employees will be reassigned to Contact Center, and this department will be permanently deleted.
                    </div>
                  </div>
                )
              ) : (
                isAr 
                  ? <>هل أنت متأكد من حذف <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.</>
                  : <>Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>? This action cannot be undone.</>
              )}
            </div>

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
                    : (deleteTarget.type === "department" && deleteTarget.affectedCount && deleteTarget.affectedCount > 0)
                    ? (isAr ? "نعم، احذف وانقل الموظفين" : "Yes, Delete & Reassign")
                    : (isAr ? "نعم، احذف نهائياً" : "Yes, Delete Permanently")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
