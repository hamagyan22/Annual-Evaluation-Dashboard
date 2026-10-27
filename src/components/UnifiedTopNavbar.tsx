"use client";

import React from "react";
import { 
  BarChart3, LayoutDashboard, Award, Star, 
  ClipboardCheck, Settings, Sun, Moon, 
  LogOut, Users, ArrowLeft 
} from "lucide-react";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";

export type ActiveDashboardType = 'cc' | 'agent' | 'quality' | 'topstar' | 'evaluation';

export interface UnifiedTopNavbarProps {
  currentDashboard: ActiveDashboardType;
  userProfile: any;
  onNavigate?: (target: ActiveDashboardType) => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export function UnifiedTopNavbar({
  currentDashboard,
  userProfile,
  onNavigate,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  isDarkMode = false,
  toggleDarkMode,
  showBack = false,
  onBack,
  backLabel = "Back",
  className = ""
}: UnifiedTopNavbarProps) {
  const emailLower = (userProfile?.email || "").toLowerCase().trim();
  const nameLower = (userProfile?.name || userProfile?.agent_name || "").toLowerCase().trim();
  const roleLower = (userProfile?.role || "").toLowerCase().trim();

  const isAdmin = userProfile?.isAdmin === true || roleLower === "admin" || emailLower === "mohammed.dlshad0@gmail.com";
  const isManager = isAdmin || roleLower === "manager" || emailLower === "jalal.burghol@agent.com";
  const isTL = roleLower === "tl" || emailLower.includes("younis.kamal") || emailLower.includes("ankido.buya");
  const isQA = roleLower === "qa" || emailLower.includes("lara.kamil") || emailLower.includes("mohammed.jihad");
  const isTrainer = roleLower === "trainer" || emailLower.includes("mohammed.azad");
  const isBackOffice = roleLower === "backoffice" || emailLower.includes("shireen");
  const isAgent = roleLower === "agent";

  // Dashboard Access Permissions
  const canAccessCC = isAdmin || isManager || isTL;
  const canAccessAgentView = isManager || isAdmin;
  const canAccessQuality = isAdmin || isManager || isTL || isQA;
  const canAccessTopStar = isAdmin || isManager || isTL;
  const canAccessEvaluation = true; // All staff have evaluation access (self or full review)

  // Role Badge Display
  let roleBadgeText = "AGENT";
  let roleBadgeClass = "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700/60";

  if (isAdmin) {
    roleBadgeText = "ADMIN";
    roleBadgeClass = "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60";
  } else if (isManager) {
    roleBadgeText = "MANAGER";
    roleBadgeClass = "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/60";
  } else if (isTL) {
    roleBadgeText = "TL";
    roleBadgeClass = "bg-emerald-50 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60";
  } else if (isQA) {
    roleBadgeText = "QA";
    roleBadgeClass = "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60";
  } else if (isTrainer) {
    roleBadgeText = "TRAINER";
    roleBadgeClass = "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60";
  } else if (isBackOffice) {
    roleBadgeText = "BACK OFFICE";
    roleBadgeClass = "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60";
  }

  // Display Name
  const rawName = userProfile?.name || userProfile?.agent_name || (
    isAdmin ? "Mohammed Dlshad" :
    isManager ? "Jalal Burghol" :
    isTL ? "Team Leader" :
    isTrainer ? "Mohammed Azad" :
    isBackOffice ? "Shireen Waisi" :
    "Employee"
  );

  const displayName = rawName.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

  // Navigation Items
  const navItems = [
    {
      id: 'cc' as ActiveDashboardType,
      label: 'CC Dashboard',
      show: canAccessCC,
      icon: BarChart3,
      iconColor: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-slate-500/15 dark:bg-slate-400/20'
    },
    {
      id: 'agent' as ActiveDashboardType,
      label: isAgent ? 'My Dashboard' : 'Agent View',
      show: canAccessAgentView,
      icon: LayoutDashboard,
      iconColor: 'text-sky-700 dark:text-sky-300',
      iconBg: 'bg-sky-500/15 dark:bg-sky-400/20'
    },
    {
      id: 'quality' as ActiveDashboardType,
      label: 'Quality',
      show: canAccessQuality,
      icon: Award,
      iconColor: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-500/15 dark:bg-purple-400/20'
    },
    {
      id: 'topstar' as ActiveDashboardType,
      label: 'Top Star',
      show: canAccessTopStar,
      icon: Star,
      iconColor: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-500/20 dark:bg-amber-400/25'
    },
    {
      id: 'evaluation' as ActiveDashboardType,
      label: 'Evaluation',
      show: canAccessEvaluation,
      icon: ClipboardCheck,
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-500/15 dark:bg-emerald-400/20'
    }
  ].filter(item => item.show);

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 p-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm flex-wrap w-full sm:w-auto justify-end ${className}`}>
      
      {/* Optional Back Button (if preview mode or explicit sub-view) */}
      {showBack && onBack && (
        <>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200/90 dark:border-gray-700 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
            title={backLabel}
          >
            <ArrowLeft size={13.5} />
            <span>{backLabel}</span>
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700/80 mx-0.5 shrink-0" />
        </>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
        {navItems.map((item) => {
          const isActive = currentDashboard === item.id;
          const ItemIcon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!isActive && onNavigate) {
                  onNavigate(item.id);
                }
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 font-black border border-emerald-300/80 dark:border-emerald-700/60 shadow-xs ring-1 ring-emerald-400/20'
                  : 'font-bold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700/60'
              }`}
              title={item.label}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform shadow-2xs shrink-0 ${
                isActive
                  ? 'bg-[#1C6B53] dark:bg-emerald-500 text-white font-black'
                  : `${item.iconBg} ${item.iconColor} group-hover:scale-105`
              }`}>
                <ItemIcon size={13.5} className={item.id === 'topstar' ? (isActive ? 'fill-white' : 'fill-amber-500/30') : ''} />
              </div>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700/80 mx-0.5 shrink-0" />

      {/* User Profile Pill */}
      <button 
        type="button"
        onClick={onOpenProfile}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 transition-all group cursor-pointer shrink-0"
        title="Profile Settings"
      >
        <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-tr from-[#1C6B53] to-emerald-400 flex items-center justify-center overflow-hidden ring-2 ring-[#1C6B53]/20 dark:ring-emerald-400/20 text-white font-black text-xs shadow-sm shrink-0">
          {userProfile?.photo_url ? (
            <img src={userProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="max-w-[70px] sm:max-w-[120px] truncate group-hover:text-[#1C6B53] dark:group-hover:text-emerald-400 transition-colors">
            {displayName}
          </span>
          <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${roleBadgeClass}`}>
            {roleBadgeText}
          </span>
        </div>
      </button>

      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700/80 mx-0.5 shrink-0" />

      {/* Utilities: Settings (Admin), Dark Mode, Theme, Logout */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {isAdmin && onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[#1C6B53] dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all group cursor-pointer"
            title="Settings"
          >
            <Settings size={15} className="group-hover:rotate-45 transition-transform duration-200" />
          </button>
        )}

        {/* Dark Mode Toggle */}
        {toggleDarkMode && (
          <button 
            type="button"
            onClick={toggleDarkMode} 
            className="w-8 sm:w-8.5 h-8 sm:h-8.5 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer shrink-0"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
          </button>
        )}

        {/* Theme Palette Selector */}
        <ThemeSelectorModal />

        {/* Logout Button */}
        {onLogout && (
          <button 
            type="button"
            onClick={onLogout} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/40 transition-all cursor-pointer shrink-0"
            title="Logout"
          >
            <LogOut size={14} />
            <span className="hidden xs:inline sm:inline">Logout</span>
          </button>
        )}
      </div>

    </div>
  );
}
