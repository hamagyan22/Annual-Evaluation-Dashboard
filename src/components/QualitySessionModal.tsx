"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Award, CheckCircle2, XCircle, PenTool, Eraser, 
  AlertTriangle, Clock, Calendar, X, MessageSquare, 
  Download, Sparkles, Check, ChevronRight, ChevronDown, ShieldCheck,
  UserCheck, AlertCircle, FileText
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { 
  BASELINE_QUALITY_EVALUATIONS, 
  getQualityEvalDoc, 
  mergeQualityDocs, 
  SLUG_ALIASES 
} from "@/lib/baselineQualityData";

export interface QualitySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentTeam?: string;
  userProfile: any;
  initialYear?: string;
  initialQuarter?: string;
  initialWeek?: number;
  isDarkMode?: boolean;
}

export function QualitySessionModal({
  isOpen,
  onClose,
  agentName,
  agentTeam = "",
  userProfile,
  initialYear = "2026",
  initialQuarter = "Q4",
  initialWeek = 4,
  isDarkMode = false
}: QualitySessionModalProps) {
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(initialQuarter);
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);

  // Evaluation data and session status
  const [evalDoc, setEvalDoc] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sub-modal views for signing and rejecting
  const [isSigningOpen, setIsSigningOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Signature Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const hasDrawnRef = useRef<boolean>(false);

  // Clean and normalize agent identifiers
  const cleanAgentName = (agentName || userProfile?.agent_name || userProfile?.name || "Agent").trim();
  const agentSlug = cleanAgentName.toLowerCase().replace(/[^a-z0-9]/g, "_");

  const isChatTeam = useMemo(() => {
    const t = (agentTeam || "").toLowerCase();
    return t.includes("chat") || t.includes("dlshad") || t.includes("mohammed dlshad");
  }, [agentTeam]);

  // Determine QA Evaluator info
  const evaluatorInfo = useMemo(() => {
    const t = (agentTeam || "").toLowerCase();
    if (t.includes("ankido")) {
      return { slug: "lara_kamil", name: "Lara Kamil", role: "Quality Assurance Evaluator" };
    }
    if (t.includes("dlshad") || t.includes("mohammed")) {
      return { slug: "mohammed_dlshad", name: "Mohammed Dlshad", role: "Quality & Chat Supervisor" };
    }
    return { slug: "mohammed_jihad", name: "Mohammed Jihad", role: "Quality Assurance Evaluator" };
  }, [agentTeam]);

  // Firestore Document IDs
  const qualityDocId = `${selectedYear}_${selectedQuarter}_${evaluatorInfo.slug}_${agentSlug}`;
  const cShiftDocId = `${selectedYear}_${selectedQuarter}_mohammed_dlshad_c_shift_${agentSlug}`;
  const sessionDocId = `${selectedYear}_${selectedQuarter}_w${selectedWeek}_${agentSlug}`;

  // Listen to Firestore Quality Evaluation doc in real-time
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const unsubEval = onSnapshot(doc(db, "quality_evaluations", qualityDocId), (snap) => {
      if (snap.exists()) {
        const liveData = snap.data();
        const baseData = getQualityEvalDoc(BASELINE_QUALITY_EVALUATIONS, qualityDocId);
        setEvalDoc(mergeQualityDocs(baseData, { ...liveData, _fromFirestore: true }));
      } else {
        // Fallback to baseline or aliases
        const baseData = getQualityEvalDoc(BASELINE_QUALITY_EVALUATIONS, qualityDocId);
        setEvalDoc(baseData || null);
      }
      setLoading(false);
    }, (err) => {
      console.warn("Quality eval snapshot error:", err);
      const baseData = getQualityEvalDoc(BASELINE_QUALITY_EVALUATIONS, qualityDocId);
      setEvalDoc(baseData || null);
      setLoading(false);
    });

    // Listen to Quality Session sign-off doc
    const unsubSession = onSnapshot(doc(db, "quality_sessions", sessionDocId), (snap) => {
      if (snap.exists()) {
        setSessionData(snap.data());
      } else {
        setSessionData(null);
      }
    }, (err) => {
      console.warn("Session snapshot error:", err);
      setSessionData(null);
    });

    return () => {
      unsubEval();
      unsubSession();
    };
  }, [isOpen, qualityDocId, sessionDocId]);

  // Compute Week Calls & Scores
  const weekDetails = useMemo(() => {
    if (!evalDoc) return { items: [], weekAvg: "-", totalCalls: 0 };

    const scores = evalDoc.scores || {};
    const notes = evalDoc.notes || {};
    const timestamps = evalDoc.cell_timestamps || {};

    const yNum = parseInt(String(selectedYear), 10);
    const isNew = yNum > 2026 || (yNum === 2026 && selectedQuarter === "Q4");

    let colCount = 6;
    let hasOutbound = true;
    let callBase = 0;

    if (isChatTeam) {
      if (isNew) {
        colCount = 8;
        hasOutbound = false;
      } else if (yNum === 2026 && selectedQuarter === "Q3" && selectedWeek >= 10) {
        colCount = 7;
        hasOutbound = false;
      } else {
        colCount = 6;
        hasOutbound = true;
      }
    } else {
      colCount = isNew ? 7 : 6;
      hasOutbound = true;
      callBase = (selectedWeek - 1) * colCount;
    }

    const items: Array<{
      label: string;
      key: string;
      score: string;
      note: string;
      timestamp: string;
      isOutbound?: boolean;
    }> = [];

    let sum = 0;
    let count = 0;
    let allV = true;

    for (let c = 1; c <= colCount; c++) {
      const key = isChatTeam ? `w${selectedWeek}_chat_${c}` : `w${selectedWeek}_call_${callBase + c}`;
      const altKey = isChatTeam ? `w${selectedWeek}_call_${c}` : `w${selectedWeek}_call_${c}`;
      const rawVal = scores[key] ?? scores[altKey] ?? "-";
      const noteVal = notes[key] ?? notes[altKey] ?? "";
      const timeVal = timestamps[key] ?? timestamps[altKey] ?? "";

      const s = String(rawVal).trim();
      if (s !== "" && s !== "-") {
        const up = s.toUpperCase();
        if (up !== "V") allV = false;
        if (up !== "V" && !up.includes("N/A") && up !== "NA") {
          const num = parseFloat(s);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
      } else {
        allV = false;
      }

      items.push({
        label: isChatTeam ? `Chat ${c}` : `Call ${callBase + c}`,
        key,
        score: s,
        note: noteVal,
        timestamp: timeVal
      });
    }

    if (hasOutbound) {
      const outKey = `w${selectedWeek}_outbound`;
      const outRaw = scores[outKey] ?? "-";
      const outNote = notes[outKey] ?? "";
      const outTime = timestamps[outKey] ?? "";

      const s = String(outRaw).trim();
      if (s !== "" && s !== "-") {
        const up = s.toUpperCase();
        if (up !== "V") allV = false;
        if (up !== "V" && !up.includes("N/A") && up !== "NA") {
          const num = parseFloat(s);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
      }

      items.push({
        label: "Outbound Call",
        key: outKey,
        score: s,
        note: outNote,
        timestamp: outTime,
        isOutbound: true
      });
    }

    let weekAvg = "-";
    if (count > 0) {
      weekAvg = (sum / count).toFixed(1) + "%";
    } else if (allV && items.some(i => i.score.toUpperCase() === "V")) {
      weekAvg = "V";
    }

    return {
      items,
      weekAvg,
      totalCalls: count
    };
  }, [evalDoc, selectedYear, selectedQuarter, selectedWeek, isChatTeam]);

  // Setup Canvas when signing pad opens
  useEffect(() => {
    if (!isSigningOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
      }
      hasDrawnRef.current = false;
    }, 50);

    return () => clearTimeout(timer);
  }, [isSigningOpen]);

  // Canvas drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;
    hasDrawnRef.current = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  };

  // Submit Approval & Save Signature
  const handleConfirmSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnRef.current) {
      setToastMessage({ text: "Please draw your signature before submitting.", type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setActionLoading(true);
    try {
      const signatureDataUrl = canvas.toDataURL("image/png");
      const signedAt = new Date().toISOString();

      const payload = {
        year: selectedYear,
        quarter: selectedQuarter,
        week: selectedWeek,
        agent_name: cleanAgentName,
        agent_slug: agentSlug,
        evaluator: evaluatorInfo.name,
        status: "approved",
        signature_data: signatureDataUrl,
        signed_at: signedAt,
        signed_by_name: cleanAgentName,
        signed_by_email: userProfile?.email || "",
        rejection_reason: null,
        rejected_at: null,
        updated_at: signedAt
      };

      await setDoc(doc(db, "quality_sessions", sessionDocId), payload, { merge: true });

      // Save to alias docs as well to ensure total consistency
      for (const [regex, replacement] of SLUG_ALIASES) {
        if (regex.test(`_${agentSlug}`)) {
          const altSlug = `_${agentSlug}`.replace(regex, replacement).replace(/^_/, "");
          if (altSlug && altSlug !== agentSlug) {
            const altSessionDocId = `${selectedYear}_${selectedQuarter}_w${selectedWeek}_${altSlug}`;
            setDoc(doc(db, "quality_sessions", altSessionDocId), payload, { merge: true }).catch(() => {});
          }
        }
      }

      setIsSigningOpen(false);
      setToastMessage({ text: "Quality session successfully approved and signed!", type: "success" });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Error saving signature:", err);
      setToastMessage({ text: "Failed to save signature. Please try again.", type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Rejection
  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      setToastMessage({ text: "Please provide a reason for rejecting the evaluation.", type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setActionLoading(true);
    try {
      const rejectedAt = new Date().toISOString();

      const payload = {
        year: selectedYear,
        quarter: selectedQuarter,
        week: selectedWeek,
        agent_name: cleanAgentName,
        agent_slug: agentSlug,
        evaluator: evaluatorInfo.name,
        status: "rejected",
        signature_data: null,
        signed_at: null,
        rejection_reason: rejectionReason.trim(),
        rejected_at: rejectedAt,
        rejected_by_name: cleanAgentName,
        rejected_by_email: userProfile?.email || "",
        updated_at: rejectedAt
      };

      await setDoc(doc(db, "quality_sessions", sessionDocId), payload, { merge: true });

      // Save to aliases as well
      for (const [regex, replacement] of SLUG_ALIASES) {
        if (regex.test(`_${agentSlug}`)) {
          const altSlug = `_${agentSlug}`.replace(regex, replacement).replace(/^_/, "");
          if (altSlug && altSlug !== agentSlug) {
            const altSessionDocId = `${selectedYear}_${selectedQuarter}_w${selectedWeek}_${altSlug}`;
            setDoc(doc(db, "quality_sessions", altSessionDocId), payload, { merge: true }).catch(() => {});
          }
        }
      }

      setIsRejectOpen(false);
      setRejectionReason("");
      setToastMessage({ text: "Evaluation rejection submitted to QA for review.", type: "success" });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Error rejecting session:", err);
      setToastMessage({ text: "Failed to submit rejection. Please try again.", type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Export / Print Individual Session Sheet
  const handlePrintSessionSheet = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const isApproved = sessionData?.status === "approved";
    const sigImg = isApproved ? sessionData.signature_data : null;
    const signTime = isApproved && sessionData.signed_at 
      ? new Date(sessionData.signed_at).toLocaleString("en-GB", { 
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
        })
      : null;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>FIB_Quality_Session_${cleanAgentName}_W${selectedWeek}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { color: #0f172a; margin: 0; padding: 0; background: #fff; }
            .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1C6B53; padding-bottom: 12px; margin-bottom: 16px; }
            .logo { height: 42px; }
            .title-area h1 { margin: 0; font-size: 20px; font-weight: 900; color: #1C6B53; }
            .title-area p { margin: 3px 0 0 0; font-size: 11px; color: #64748b; font-weight: 500; }
            .grid-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
            .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
            .meta-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; }
            .meta-val { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            .meta-highlight { background: #f0fdf4; border-color: #86efac; }
            .meta-highlight .meta-val { color: #166534; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            th { background: #f1f5f9; color: #334155; font-weight: 800; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left; }
            td { border: 1px solid #e2e8f0; padding: 8px 10px; vertical-align: top; }
            .score-cell { font-weight: 900; font-size: 12px; color: #0f172a; text-align: center; width: 85px; }
            .badge-v { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: 800; }
            .sig-box { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #fafafa; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-area { text-align: center; }
            .sig-img { max-height: 48px; max-width: 150px; object-fit: contain; }
            .sig-line { border-top: 1px dashed #94a3b8; width: 180px; margin-top: 6px; padding-top: 4px; font-size: 9px; color: #64748b; }
            .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <img src="${window.location.origin}/logo.webp" class="logo" alt="FIB Logo" />
            <div class="title-area">
              <h1>Official Quality Session Sign-off</h1>
              <p>Performance & Scorecard Verification • First Iraqi Bank Contact Center</p>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <div>Date: <strong>${new Date().toLocaleDateString('en-GB')}</strong></div>
              <div>Status: <strong style="color: ${isApproved ? '#166534' : '#64748b'};">${isApproved ? 'APPROVED' : 'PENDING'}</strong></div>
            </div>
          </div>

          <div class="grid-meta">
            <div class="meta-box">
              <div class="meta-label">Employee Name</div>
              <div class="meta-val">${cleanAgentName}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Period & Week</div>
              <div class="meta-val">${selectedYear} • ${selectedQuarter} • Week ${selectedWeek}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">QA Evaluator</div>
              <div class="meta-val">${evaluatorInfo.name}</div>
            </div>
            <div class="meta-box meta-highlight">
              <div class="meta-label">Week Average</div>
              <div class="meta-val">${weekDetails.weekAvg}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 120px;">Evaluation Item</th>
                <th style="width: 85px; text-align: center;">Score</th>
                <th>Coaching & Evaluator Observations</th>
              </tr>
            </thead>
            <tbody>
              ${weekDetails.items.map(item => `
                <tr>
                  <td style="font-weight: 700;">${item.label}</td>
                  <td class="score-cell">
                    ${item.score === 'V' ? '<span class="badge-v">Vacation (V)</span>' : item.score !== '-' ? `${item.score}%` : '—'}
                  </td>
                  <td style="color: #334155;">
                    ${item.note ? item.note : '<span style="color: #94a3b8; font-style: italic;">No specific observation noted.</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="sig-box">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">Evaluator Sign-off</div>
              <div style="font-size: 10px; color: #64748b;">Verified by QA Evaluator: <strong>${evaluatorInfo.name}</strong></div>
            </div>
            <div class="sig-area">
              ${sigImg ? `
                <img src="${sigImg}" class="sig-img" alt="Agent Signature" />
                <div class="sig-line">
                  Electronically Signed by <strong>${cleanAgentName}</strong><br/>
                  ${signTime}
                </div>
              ` : `
                <div style="height: 35px;"></div>
                <div class="sig-line">Agent Signature & Date (Pending Sign-off)</div>
              `}
            </div>
          </div>

          <div class="footer">
            <div>Quality Assurance System • Strictly Confidential</div>
            <div>Generated via FIB Performance Portal</div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  const isApproved = sessionData?.status === "approved";
  const isRejected = sessionData?.status === "rejected";
  const isQaResponded = sessionData?.status === "qa_responded";
  const hasSignedData = Boolean(sessionData?.signature_data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-60 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all animate-in slide-in-from-top-4 ${
          toastMessage.type === "success" 
            ? "bg-emerald-600 text-white shadow-emerald-700/20" 
            : "bg-red-600 text-white shadow-red-700/20"
        }`}>
          {toastMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/90 dark:border-gray-800 overflow-hidden select-none">
        
        {/* Modal Top Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#1C6B53] to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-800/20">
              <Award size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                  QUALITY SESSION
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-[#1C6B53] dark:text-emerald-400">
                  Read-Only Performance Review
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Review your official QA evaluation scores, coaching notes, and submit your electronic sign-off.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSessionSheet}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
              title="Print Session Certificate"
            >
              <Download size={13} className="text-[#1C6B53] dark:text-emerald-400" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Period and Week Controls */}
        <div className="px-5 sm:px-7 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Year Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-8 px-2.5 pr-7 text-xs font-black bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[#1C6B53] dark:text-emerald-300 shadow-xs outline-none cursor-pointer appearance-none"
              >
                {["2026", "2027", "2028", "2029", "2030"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Quarter Pill Selector */}
            <div className="flex items-center p-0.5 bg-gray-200/70 dark:bg-gray-800 rounded-xl shrink-0">
              {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedQuarter(q)}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                    selectedQuarter === q
                      ? "bg-white dark:bg-gray-700 text-[#1C6B53] dark:text-emerald-300 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Week Selector Dropdown / Pills - All weeks W1 to W13 visible */}
            <div className="flex items-center gap-1 flex-wrap">
              {Array.from({ length: 13 }, (_, i) => i + 1).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeek(w)}
                  className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all shrink-0 ${
                    selectedWeek === w
                      ? "bg-[#1C6B53] text-white shadow-xs"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  W{w}
                </button>
              ))}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isApproved ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#1C6B53] dark:text-emerald-400 text-xs font-black">
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Approved & Signed</span>
              </div>
            ) : isRejected ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-400 text-xs font-black">
                <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Rejected / Under Review</span>
              </div>
            ) : isQaResponded ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-400 text-xs font-black">
                <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
                <span>QA Responded / Ready for Sign-off</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold">
                <Clock size={14} />
                <span>Pending Sign-off</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Evaluation Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          
          {/* Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/80 p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-700/70">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Agent</span>
              <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate block mt-0.5">
                {cleanAgentName}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/80 p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-700/70">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">QA Evaluator</span>
              <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate block mt-0.5">
                {evaluatorInfo.name}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/80 p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-700/70">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Evaluations</span>
              <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate block mt-0.5">
                {weekDetails.totalCalls} Calls Recorded
              </span>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-3.5 rounded-2xl border border-emerald-300/80 dark:border-emerald-700/80 shadow-xs">
              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider block">
                Week {selectedWeek} Score
              </span>
              <span className="text-base sm:text-lg font-black text-[#1C6B53] dark:text-emerald-300 leading-none block mt-0.5">
                {weekDetails.weekAvg}
              </span>
            </div>
          </div>

          {/* QA Evaluator Response Banner (if QA responded) */}
          {isQaResponded && (
            <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
              <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <span>QA Evaluator Response Received</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-300">
                      Coaching / Re-evaluation
                    </span>
                  </h5>
                  {sessionData?.qa_responded_at && (
                    <span className="text-[10px] font-medium text-blue-700 dark:text-blue-400">
                      {new Date(sessionData.qa_responded_at).toLocaleString("en-GB")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-950 dark:text-blue-100 mt-1 leading-relaxed bg-white/70 dark:bg-gray-900/60 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 font-medium">
                  <strong>Evaluator Feedback:</strong> {sessionData?.qa_response || "QA has reviewed your objection."}
                </p>
                {sessionData?.rejection_reason && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                    Your previous objection note: <em>&ldquo;{sessionData.rejection_reason}&rdquo;</em>
                  </p>
                )}
                <div className="mt-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={13} className="text-emerald-600" />
                  <span>The QA evaluator has reviewed and updated your session. You can now approve and submit your electronic sign-off below.</span>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Alert Banner (if rejected and pending QA review) */}
          {isRejected && !isQaResponded && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-black text-amber-900 dark:text-amber-300">
                    Session Objection Submitted
                  </h5>
                  {sessionData?.rejected_at && (
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                      {new Date(sessionData.rejected_at).toLocaleString("en-GB")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1">
                  <strong>Reason:</strong> {sessionData?.rejection_reason || "No details provided."}
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400/80 mt-1 italic">
                  Note: The QA team can review this feedback in the Quality Dashboard. Rejection notes do not appear on official downloaded PDFs.
                </p>
              </div>
            </div>
          )}

          {/* Approved Signature Card (if approved) */}
          {isApproved && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                      Officially Signed & Approved
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Signed by <strong>{sessionData?.signed_by_name || cleanAgentName}</strong> on {
                      sessionData?.signed_at 
                        ? new Date(sessionData.signed_at).toLocaleString("en-GB", { 
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                          })
                        : "—"
                    }
                  </p>
                </div>
              </div>

              {hasSignedData && (
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-gray-400">Signature:</span>
                  <img 
                    src={sessionData.signature_data} 
                    alt="Agent Electronic Signature" 
                    className="h-8 max-w-[120px] object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Call / Chat Evaluations List (Read-Only) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-[#1C6B53] dark:text-emerald-400" />
                <span>Week {selectedWeek} Evaluations Breakdown</span>
              </h4>
              <span className="text-[11px] text-gray-400 font-medium">
                Official QA Scores & Observations
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-semibold text-gray-400">
                Loading week quality evaluation data...
              </div>
            ) : weekDetails.items.length === 0 ? (
              <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-center">
                <AlertCircle size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  No evaluations recorded yet for Week {selectedWeek} ({selectedQuarter} {selectedYear}).
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Once your QA evaluator finishes grading calls, they will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weekDetails.items.map((item, idx) => {
                  const isScoreV = item.score.toUpperCase() === "V";
                  const hasScore = item.score !== "-" && item.score !== "";

                  return (
                    <div 
                      key={item.key || idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${
                            item.isOutbound 
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}>
                            {item.label}
                          </span>
                          {item.timestamp && (
                            <span className="text-[9px] text-gray-400 font-mono">
                              {item.timestamp}
                            </span>
                          )}
                        </div>

                        {/* Score Tag */}
                        <div>
                          {isScoreV ? (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                              Vacation (V)
                            </span>
                          ) : hasScore ? (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-[#1C6B53] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {item.score}%
                            </span>
                          ) : (
                            <span className="text-gray-400 font-bold text-xs">—</span>
                          )}
                        </div>
                      </div>

                      {/* Coaching / Evaluator Note */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-start gap-1.5">
                          <MessageSquare size={12} className="text-gray-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {item.note ? (
                              item.note
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 italic text-[11px]">
                                No coaching note entered for this call.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer Actions: Approve / Reject */}
        <div className="px-5 sm:px-7 py-3.5 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            {isApproved ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check size={14} /> Session sign-off completed. The signature will reflect on the weekly QA PDF.
              </span>
            ) : isRejected && !isQaResponded ? (
              <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle size={14} /> Objection submitted to QA Evaluator {evaluatorInfo.name}. Waiting for evaluator response.
              </span>
            ) : isQaResponded ? (
              <span className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1">
                <Check size={14} /> Evaluator response received. Approval has been re-enabled for you to sign.
              </span>
            ) : (
              <span>Please review all call scores before submitting your electronic signature.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Reject Button: Completely disabled once submitted unless new cycle */}
            <button
              type="button"
              onClick={() => setIsRejectOpen(true)}
              disabled={actionLoading || isApproved || isRejected || isQaResponded}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                isApproved || isRejected || isQaResponded
                  ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                  : "text-red-700 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 active:scale-95 cursor-pointer"
              }`}
            >
              <XCircle size={14} />
              <span>{isRejected ? "Objection Submitted" : "Reject Session"}</span>
            </button>

            {/* Approve Button: Re-enabled when QA has responded, disabled if already approved or waiting for QA */}
            <button
              type="button"
              onClick={() => setIsSigningOpen(true)}
              disabled={actionLoading || isApproved || (isRejected && !isQaResponded)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black transition ${
                isApproved
                  ? "opacity-60 cursor-not-allowed bg-emerald-700 text-white shadow-none"
                  : (isRejected && !isQaResponded)
                  ? "opacity-40 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 shadow-none"
                  : "text-white bg-gradient-to-r from-emerald-600 to-[#1C6B53] hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-800/20 active:scale-95 cursor-pointer"
              }`}
            >
              <PenTool size={14} />
              <span>{isApproved ? "Approved & Signed" : isQaResponded ? "Approve Session" : "Approve Session"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* SUB-MODAL 1: Electronic Signature Pad */}
      {isSigningOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 overflow-hidden">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-[#1C6B53] dark:text-emerald-300">
                  <PenTool size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    Electronic Signature Pad
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Sign using your finger, stylus, or mouse
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSigningOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Signature Canvas Box */}
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50/80 dark:bg-gray-950/80 overflow-hidden mb-3">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="w-full h-44 cursor-crosshair touch-none"
              />
              <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-bold text-gray-400 select-none">
                Draw Signature Here • FIB Quality Assurance Verification
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleClearSignature}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                <Eraser size={13} />
                <span>Clear</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSigningOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignature}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-[#1C6B53] hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-800/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Check size={14} strokeWidth={2.5} />
                  <span>{actionLoading ? "Submitting..." : "Confirm & Sign"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Rejection / Objection Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 overflow-hidden">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    Reject Evaluation / Submit Objection
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    State the specific reason or call points you disagree with
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                Objection Reason:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain which call or criterion was evaluated inaccurately and why..."
                rows={4}
                className="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 dark:text-white placeholder:text-gray-400 font-medium shadow-xs resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRejection}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-800/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <AlertCircle size={14} />
                <span>{actionLoading ? "Submitting..." : "Submit Objection"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
