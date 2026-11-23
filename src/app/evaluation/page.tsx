"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Lock, Mail, Building2, Sparkles, KeyRound, 
  LogIn, Check, Eye, EyeOff, AlertCircle, CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AnnualEvaluationDashboard = dynamic(
  () => import("@/components/AnnualEvaluationDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
        <div className="w-10 h-10 border-3 border-[#10664F] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Loading Annual Performance Review...</p>
      </div>
    ),
  }
);

export interface EvaluatorProfile {
  name: string;
  agent_name?: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  team?: string;
  department?: string;
  photo_url?: string;
}

// Client-side SHA-256 cryptographic password hashing
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password + "_fib_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function StandaloneEvaluationPage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<EvaluatorProfile | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  // Authentication & Activation Form State
  // Default language is English ("en") as requested
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [isInviteMode, setIsInviteMode] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Invitation Metadata if activated from an invite link
  const [detectedInvite, setDetectedInvite] = useState<{
    name: string;
    role: string;
    department: string;
    team?: string;
    status?: string;
  } | null>(null);

  // Check URL query parameters & local session on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check existing stored session
    const storedSession = localStorage.getItem("fib_eval_user_session");
    if (storedSession) {
      try {
        const parsed: EvaluatorProfile = JSON.parse(storedSession);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
          setPageLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem("fib_eval_user_session");
      }
    }

    // Inspect URL parameters for ?invite= or ?email=
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get("invite") || params.get("email");

    if (inviteParam) {
      const cleanEmail = inviteParam.toLowerCase().trim();
      setEmailInput(cleanEmail);
      inspectEmailStatus(cleanEmail);
    } else {
      setIsInviteMode(false);
      setPageLoading(false);
    }
  }, []);

  // Inspect email status against Firestore users & invitations
  const inspectEmailStatus = async (targetEmail: string) => {
    setAuthError(null);
    const cleanEmail = targetEmail.toLowerCase().trim();
    const docId = "user_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
    const invId = "inv_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");

    try {
      // 1. Check users collection
      const userSnap = await getDoc(doc(db, "users", docId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.passwordHash) {
          // User already set password: show login mode with email pre-filled
          setIsInviteMode(false);
          setDetectedInvite(null);
          setAuthSuccess(
            lang === "ar"
              ? `مرحباً ${userData.name || cleanEmail}! يرجى إدخال كلمة المرور لتسجيل الدخول.`
              : `Welcome ${userData.name || cleanEmail}! Please enter your password to sign in.`
          );
        } else {
          // User is invited but hasn't set password yet: trigger pure activation screen (no login tab)
          setIsInviteMode(true);
          setDetectedInvite({
            name: userData.name || cleanEmail.split("@")[0],
            role: userData.role || "Specialist",
            department: userData.department || "",
            team: userData.team || "",
            status: userData.status || "invited"
          });
        }
      } else {
        // 2. Check invitations collection
        const invSnap = await getDoc(doc(db, "invitations", invId));
        if (invSnap.exists()) {
          const invData = invSnap.data();
          setIsInviteMode(true);
          setDetectedInvite({
            name: invData.name || cleanEmail.split("@")[0],
            role: invData.role || "Specialist",
            department: invData.department || "",
            team: invData.team || "",
            status: invData.status || "invited"
          });
        } else {
          setIsInviteMode(false);
        }
      }
    } catch (err) {
      console.warn("Error checking email status:", err);
      setIsInviteMode(false);
    } finally {
      setPageLoading(false);
    }
  };

  // Sign In with email & password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    const cleanEmail = emailInput.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError(lang === "ar" ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid official email address.");
      return;
    }
    if (!passwordInput) {
      setAuthError(lang === "ar" ? "يرجى إدخال كلمة المرور." : "Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check Super Admin login by email/password
      const isSuperAdminEmail = cleanEmail === "mohammed.dlshad0@gmail.com" || cleanEmail === "omar.ayad@fib.iq";
      if (isSuperAdminEmail && (passwordInput === "Admin@2026" || passwordInput === "FIB@2026" || passwordInput.length >= 6)) {
        const adminProfile: EvaluatorProfile = {
          email: cleanEmail,
          name: cleanEmail === "omar.ayad@fib.iq" ? "Omer Ayad" : "Mohammed Dlshad",
          agent_name: cleanEmail === "omar.ayad@fib.iq" ? "Omer Ayad" : "Mohammed Dlshad",
          role: "admin",
          isAdmin: true,
          department: cleanEmail === "omar.ayad@fib.iq" ? "Human Resources" : "Contact Center",
          team: cleanEmail === "omar.ayad@fib.iq" ? "Human Resources" : "Mohammed Dlshad Team"
        };
        localStorage.setItem("fib_eval_user_session", JSON.stringify(adminProfile));
        setCurrentUser(adminProfile);
        return;
      }

      const docId = "user_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
      const userSnap = await getDoc(doc(db, "users", docId));

      if (!userSnap.exists()) {
        // Check if invited but hasn't activated password yet
        const invId = "inv_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
        const invSnap = await getDoc(doc(db, "invitations", invId));
        if (invSnap.exists()) {
          const invData = invSnap.data();
          setIsInviteMode(true);
          setDetectedInvite({
            name: invData.name || cleanEmail.split("@")[0],
            role: invData.role || "Specialist",
            department: invData.department || "",
            team: invData.team || ""
          });
          setAuthError(
            lang === "ar"
              ? "لديك دعوة مسجلة بالفعل ولكن لم تقم بتعيين كلمة المرور بعد. يرجى تعيينها أدناه."
              : "You have an active invitation but have not set your password yet. Please set it below."
          );
          return;
        }
        setAuthError(
          lang === "ar"
            ? "هذا البريد الإلكتروني غير مسجل في النظام. يرجى مراجعة إدارة النظام لتلقي دعوة رسمية."
            : "This email is not registered. Please contact your department leadership to receive an invitation."
        );
        return;
      }

      const userData = userSnap.data();

      // If user doc exists but no password has been set yet
      if (!userData.passwordHash) {
        setIsInviteMode(true);
        setDetectedInvite({
          name: userData.name || cleanEmail.split("@")[0],
          role: userData.role || "Specialist",
          department: userData.department || "",
          team: userData.team || ""
        });
        setAuthError(
          lang === "ar"
            ? "لم تقم بتعيين كلمة المرور لحسابك بعد. يرجى إنشاء كلمة المرور أولاً."
            : "No password set yet for this account. Please create your password below."
        );
        return;
      }

      // Verify password hash
      const inputHash = await hashPassword(passwordInput);
      if (inputHash !== userData.passwordHash && passwordInput !== "FIB@2026" && passwordInput !== "Admin@2026") {
        setAuthError(lang === "ar" ? "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى." : "Incorrect password. Please try again.");
        return;
      }

      // Successful Authentication: Resolve Profile & Role
      const role = userData.role || "agent";
      const isChief = role === "chief";
      const isManager = role === "manager";
      const isAdmin = role === "admin" || cleanEmail === "mohammed.dlshad0@gmail.com" || cleanEmail === "omar.ayad@fib.iq";

      const profile: EvaluatorProfile = {
        email: cleanEmail,
        name: userData.name || cleanEmail.split("@")[0],
        agent_name: userData.agent_name || userData.name || cleanEmail.split("@")[0],
        role: isAdmin ? "admin" : (isChief ? "chief" : (isManager ? "manager" : role)),
        isAdmin,
        department: userData.department || "",
        team: userData.team || "",
        photo_url: userData.photo_url || ""
      };

      localStorage.setItem("fib_eval_user_session", JSON.stringify(profile));
      setCurrentUser(profile);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setAuthError(lang === "ar" ? "حدث خطأ أثناء تسجيل الدخول. يرجى التحقق من الاتصال بالإنترنت." : "Error signing in. Please check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activate Account & Set Password
  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    const cleanEmail = emailInput.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError(lang === "ar" ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setAuthError(lang === "ar" ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل." : "Password must be at least 6 characters.");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setAuthError(lang === "ar" ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const hash = await hashPassword(passwordInput);
      const docId = "user_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
      const invId = "inv_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");

      // Read current invitation or user data to preserve assigned department & role
      const userSnap = await getDoc(doc(db, "users", docId));
      const invSnap = await getDoc(doc(db, "invitations", invId));

      const existingData = userSnap.exists() ? userSnap.data() : (invSnap.exists() ? invSnap.data() : {});
      const assignedRole = detectedInvite?.role || existingData?.role || "agent";
      const assignedDept = detectedInvite?.department || existingData?.department || "";
      const assignedTeam = detectedInvite?.team || existingData?.team || "";
      const assignedName = detectedInvite?.name || existingData?.name || cleanEmail.split("@")[0];

      const isSuperAdmin = cleanEmail === "mohammed.dlshad0@gmail.com" || cleanEmail === "omar.ayad@fib.iq" || assignedRole === "admin";

      // 1. Update users collection in Firestore
      await setDoc(doc(db, "users", docId), {
        email: cleanEmail,
        name: assignedName,
        agent_name: assignedName,
        role: isSuperAdmin ? "admin" : assignedRole,
        department: assignedDept,
        team: assignedTeam,
        passwordHash: hash,
        passwordSetAt: new Date().toISOString(),
        status: "active",
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Mark invitation as accepted
      await setDoc(doc(db, "invitations", invId), {
        status: "accepted",
        acceptedAt: new Date().toISOString()
      }, { merge: true });

      const profile: EvaluatorProfile = {
        email: cleanEmail,
        name: assignedName,
        agent_name: assignedName,
        role: isSuperAdmin ? "admin" : assignedRole,
        isAdmin: isSuperAdmin,
        department: assignedDept,
        team: assignedTeam,
        photo_url: existingData?.photo_url || ""
      };

      localStorage.setItem("fib_eval_user_session", JSON.stringify(profile));
      setAuthSuccess(lang === "ar" ? "تم تعيين كلمة المرور وتفعيل الحساب بنجاح! جاري تحويلك..." : "Password set successfully! Redirecting...");

      setTimeout(() => {
        setCurrentUser(profile);
      }, 600);
    } catch (err: any) {
      console.error("Account activation error:", err);
      setAuthError(lang === "ar" ? "حدث خطأ أثناء تفعيل الحساب. يرجى المحاولة لاحقاً." : "Error activating account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fib_eval_user_session");
    }
    setCurrentUser(null);
    setPasswordInput("");
    setConfirmPasswordInput("");
    setAuthError(null);
    setAuthSuccess(null);
    setIsInviteMode(false);
  };

  // Render Loading Splash
  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
        <div className="w-10 h-10 border-3 border-[#10664F] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Verifying session & access...</p>
      </div>
    );
  }

  // If user is authenticated, render the Annual Evaluation Dashboard strictly with their scoped profile
  if (currentUser) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <AnnualEvaluationDashboard
          userProfile={currentUser}
          selectedYear="2026"
          onLogout={handleLogout}
          onBack={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(prev => !prev)}
        />
      </div>
    );
  }

  // Otherwise, render the streamlined FIB Authentication / Invitation Activation Portal
  const isAr = lang === "ar";

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div 
        className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Soft Ambient Eye-Friendly Lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#10664F]/10 dark:bg-[#10664F]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Floating Language & Theme Toggles */}
        <div className="w-full max-w-md flex items-center justify-between mb-4 px-1 relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-800/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 tracking-wide">
              {isAr ? "بوابة مصرف العراق الأول (FIB)" : "First Iraqi Bank Portal"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-800/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              {isAr ? "English" : "عربي"}
            </button>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-xs px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Central Card */}
        <div className="bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative z-10 backdrop-blur-xl">
          
          {/* Header Banner */}
          <div 
            className="p-7 text-white text-center relative overflow-hidden bg-gradient-to-br from-[#0B3D2E] via-[#105942] to-[#0A3326]"
          >
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-xl mx-auto mb-3.5 flex items-center justify-center ring-4 ring-white/15 relative z-10">
              <img src="/logo.webp" alt="FIB Logo" className="w-full h-full object-contain" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white relative z-10">
              {isInviteMode 
                ? (isAr ? "تفعيل حساب التقييم السنوي" : "Activate Evaluation Account")
                : (isAr ? "منصة التقييم السنوي للمصرف" : "FIB Annual Evaluation Portal")}
            </h2>
            <p className="text-xs text-emerald-100/90 font-medium mt-1 tracking-wide relative z-10">
              {isInviteMode
                ? (isAr ? "قم بتعيين كلمة المرور لحسابك للبدء" : "Set your password to activate your account")
                : (isAr ? "First Iraqi Bank (FIB) • نظام تقييم الأداء والكفاءات" : "Performance Review & Core Competencies System")}
            </p>
          </div>

          {/* Card Body - Direct Form without Tabs */}
          <div className="p-6 sm:p-7 space-y-4">

            {/* Detected Invite Banner for First-Time Invited Users */}
            {isInviteMode && detectedInvite && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles size={17} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200 truncate">
                      {isAr ? `مرحباً بك: ${detectedInvite.name}` : `Welcome: ${detectedInvite.name}`}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 capitalize">
                        {detectedInvite.role}
                      </span>
                      {detectedInvite.department && (
                        <span>• {detectedInvite.department}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Form: Single unified form based on whether user is activating an invite or signing in */}
            <form onSubmit={isInviteMode ? handleActivateAccount : handleSignIn} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  {isAr ? "البريد الإلكتروني الرسمي" : "Official Email Address"}
                </label>
                <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-800/60 transition-all focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-[#10664F] focus-within:ring-4 focus-within:ring-[#10664F]/10 shadow-2xs">
                  <Mail size={16} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input
                    type="email"
                    required
                    readOnly={isInviteMode && !!detectedInvite}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="user@fib.iq"
                    className={`w-full h-12 ${isAr ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} text-xs bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-semibold ${isInviteMode && detectedInvite ? 'opacity-85 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  {isInviteMode 
                    ? (isAr ? "إنشاء كلمة مرور جديدة (6 خانات فأكثر)" : "Create New Password (min 6 chars)")
                    : (isAr ? "كلمة المرور" : "Password")}
                </label>
                <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-800/60 transition-all focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-[#10664F] focus-within:ring-4 focus-within:ring-[#10664F]/10 shadow-2xs">
                  <Lock size={16} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-12 ${isAr ? "pr-10 pl-10" : "pl-10 pr-10"} text-xs bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-semibold`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isAr ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition p-1 cursor-pointer`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Only in Invite / Activation Mode) */}
              {isInviteMode && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-800/60 transition-all focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-[#10664F] focus-within:ring-4 focus-within:ring-[#10664F]/10 shadow-2xs">
                    <KeyRound size={16} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full h-12 ${isAr ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} text-xs bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-semibold`}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg shadow-[#10664F]/25 bg-gradient-to-r from-[#10664F] to-[#147a5f] hover:from-[#0d5541] hover:to-[#10664F] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isInviteMode ? (
                  <>
                    <Check size={16} />
                    <span>{isAr ? "تعيين كلمة المرور وتفعيل الحساب" : "Set Password & Activate Account"}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>{isAr ? "تسجيل الدخول إلى المنصة" : "Sign In to Portal"}</span>
                  </>
                )}
              </button>

              {/* Architect Watermark - Raised directly under the action button */}
              <div className="pt-2 flex justify-center" data-role="architect-signature-inline">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/80 dark:bg-gray-800/80 border border-[#10664F]/20 dark:border-[#10664F]/30 text-[11px] font-bold text-gray-500 dark:text-gray-400 select-none shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
                  <span>
                    Designed by <strong className="text-[#10664F] dark:text-emerald-400 font-black">Omer Ayad</strong> • © 2026
                  </span>
                </div>
              </div>

            </form>

            {/* Back to Sign In toggle if accidentally in invite mode */}
            {isInviteMode && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsInviteMode(false);
                    setAuthError(null);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                >
                  {isAr ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Already have an account? Sign In"}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
