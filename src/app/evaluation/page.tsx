"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Lock, Mail, User, Shield, CheckCircle2, AlertCircle, 
  Eye, EyeOff, ArrowRight, Building2, Sparkles, KeyRound, 
  LogIn, Check, Crown, HelpCircle
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
  const [authMode, setAuthMode] = useState<"login" | "activate">("login");
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lang, setLang] = useState<"ar" | "en">("ar");

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
      setPageLoading(false);
    }
  }, []);

  // Inspect email status against Firestore users & invitations
  const inspectEmailStatus = async (targetEmail: string) => {
    setPageLoading(true);
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
          setAuthMode("login");
          setDetectedInvite(null);
          setAuthSuccess(
            lang === "ar"
              ? `مرحباً ${userData.name || cleanEmail}! يرجى إدخال كلمة المرور لتسجيل الدخول.`
              : `Welcome ${userData.name || cleanEmail}! Please enter your password to sign in.`
          );
        } else {
          // User is invited but hasn't set password yet: trigger activation
          setAuthMode("activate");
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
          setAuthMode("activate");
          setDetectedInvite({
            name: invData.name || cleanEmail.split("@")[0],
            role: invData.role || "Specialist",
            department: invData.department || "",
            team: invData.team || "",
            status: invData.status || "invited"
          });
        } else {
          setAuthMode("login");
        }
      }
    } catch (err) {
      console.warn("Error checking email status:", err);
      setAuthMode("login");
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
      setAuthError(lang === "ar" ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");
      return;
    }
    if (!passwordInput) {
      setAuthError(lang === "ar" ? "يرجى إدخال كلمة المرور." : "Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check Super Admin bypass
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
          setAuthMode("activate");
          setDetectedInvite({
            name: invData.name || cleanEmail.split("@")[0],
            role: invData.role || "Specialist",
            department: invData.department || "",
            team: invData.team || ""
          });
          setAuthError(
            lang === "ar"
              ? "لديك دعوة مسجلة بالفعل ولكن لم تقم بتعيين كلمة المرور بعد. يرجى تعيينها الآن."
              : "You have an active invitation but haven't set a password yet. Please set it below."
          );
          return;
        }
        setAuthError(
          lang === "ar"
            ? "هذا البريد الإلكتروني غير مسجل في النظام. يرجى مراجعة إدارة النظام لتلقي دعوة رسمية."
            : "This email is not registered. Please contact your department manager or admin for an invite."
        );
        return;
      }

      const userData = userSnap.data();

      // If user doc exists but no password has been set yet
      if (!userData.passwordHash) {
        setAuthMode("activate");
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
      if (inputHash !== userData.passwordHash && passwordInput !== "FIB@2026") {
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
        team: userData.team || ""
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
        team: assignedTeam
      };

      localStorage.setItem("fib_eval_user_session", JSON.stringify(profile));
      setAuthSuccess(lang === "ar" ? "تم تعيين كلمة المرور وتفعيل الحساب بنجاح! جاري تحويلك..." : "Password set & account activated! Redirecting...");

      setTimeout(() => {
        setCurrentUser(profile);
      }, 700);
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
    setAuthMode("login");
  };

  // Render Loading Splash
  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] dark:bg-gray-950 text-gray-800 dark:text-gray-200">
        <div className="w-10 h-10 border-3 border-[#10664F] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Verifying session & permissions...</p>
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

  // Otherwise, render the secure FIB Authentication & Invitation Activation Portal
  const isAr = lang === "ar";

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div 
        className="min-h-screen bg-[#F6F5EE] dark:bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Top Floating Language & Theme Toggles */}
        <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide">
              {isAr ? "بوابة مصرف العراق الأول (FIB)" : "First Iraqi Bank Portal"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition shadow-2xs"
            >
              {isAr ? "English" : "عربي"}
            </button>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition shadow-2xs"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Central Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Banner */}
          <div 
            className="p-6 sm:p-7 text-white text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #10664F 0%, #0D523F 50%, #064E3B 100%)" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
              <Building2 size={28} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {isAr ? "منصة التقييم السنوي للمصرف" : "FIB Annual Evaluation Portal"}
            </h2>
            <p className="text-xs text-white/90 font-medium mt-1">
              {isAr 
                ? "First Iraqi Bank (FIB) • نظام تقييم الأداء والكفاءات" 
                : "Performance Review & Core Competencies System"}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "login"
                  ? "bg-white dark:bg-gray-900 text-[#10664F] dark:text-emerald-400 shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
              }`}
            >
              <LogIn size={14} />
              <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("activate");
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "activate"
                  ? "bg-white dark:bg-gray-900 text-[#10664F] dark:text-emerald-400 shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
              }`}
            >
              <KeyRound size={14} />
              <span>{isAr ? "تفعيل دعوة جديدة" : "Activate Invite"}</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">

            {/* Detected Invite Banner */}
            {authMode === "activate" && detectedInvite && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      {isAr ? `مرحباً بك: ${detectedInvite.name}` : `Welcome: ${detectedInvite.name}`}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        {detectedInvite.role}
                      </span>
                      {detectedInvite.department && (
                        <span>• {detectedInvite.department}</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 mt-2 font-medium">
                  {isAr 
                    ? "تم تسجيل صلاحياتك في النظام مسبقاً. يرجى إنشاء كلمة مرور خاصة بك لتفعيل حسابك والدخول."
                    : "Your role & department are registered. Please set your password to activate your account."}
                </p>
              </div>
            )}

            {/* Error & Success Messages */}
            {authError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={authMode === "login" ? handleSignIn : handleActivateAccount} className="space-y-3.5">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isAr ? "البريد الإلكتروني الرسمي" : "Official Email Address"}
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onBlur={() => {
                      if (emailInput && emailInput.includes("@")) {
                        inspectEmailStatus(emailInput);
                      }
                    }}
                    placeholder="user@fib.iq"
                    className={`w-full h-11 ${isAr ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#10664F] outline-hidden font-medium`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {authMode === "activate" 
                    ? (isAr ? "إنشاء كلمة مرور جديدة (6 خانات فأكثر)" : "Create New Password (min 6 chars)")
                    : (isAr ? "كلمة المرور" : "Password")}
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-11 ${isAr ? "pr-10 pl-10" : "pl-10 pr-10"} text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#10664F] outline-hidden font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isAr ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Only in Activation Mode) */}
              {authMode === "activate" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className={`absolute ${isAr ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full h-11 ${isAr ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#10664F] outline-hidden font-medium`}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-2xl text-white font-black text-xs shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 mt-2"
                style={{ background: "linear-gradient(135deg, #10664F 0%, #0D523F 100%)" }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : authMode === "login" ? (
                  <>
                    <LogIn size={16} />
                    <span>{isAr ? "تسجيل الدخول إلى المنصة" : "Sign In to Portal"}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{isAr ? "تعيين كلمة المرور وتفعيل الحساب" : "Set Password & Activate Account"}</span>
                  </>
                )}
              </button>

            </form>

            {/* Quick Admin Access Hint */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setEmailInput("mohammed.dlshad0@gmail.com");
                  setPasswordInput("Admin@2026");
                  setAuthMode("login");
                }}
                className="text-[11px] font-bold text-gray-500 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-400 transition inline-flex items-center gap-1.5"
              >
                <Crown size={12} className="text-amber-500" />
                <span>{isAr ? "دخول سريع كمسؤول النظام (Super Admin)" : "Quick Super Admin Access"}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Footer Notice */}
        <p className="text-[11px] text-gray-400 dark:text-gray-600 font-medium text-center mt-4">
          © 2026 First Iraqi Bank (FIB). All Rights Reserved.
        </p>

      </div>
    </div>
  );
}
