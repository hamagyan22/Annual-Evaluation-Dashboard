"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const AnnualEvaluationDashboard = dynamic(
  () => import("@/components/AnnualEvaluationDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
        <div className="w-10 h-10 border-3 border-[#1C6B53] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Annual Performance Review...</p>
      </div>
    ),
  }
);

export default function StandaloneEvaluationPage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Default administrator / evaluator profile for direct access
  const mockAdminProfile = {
    name: "Mohammed Dlshad",
    agent_name: "Mohammed Dlshad",
    email: "mohammed.dlshad0@gmail.com",
    role: "admin",
    isAdmin: true,
    team: "Mohammed Dlshad Team",
    department: "Contact Center"
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <AnnualEvaluationDashboard
        userProfile={mockAdminProfile}
        selectedYear="2026"
        onBack={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />
    </div>
  );
}
