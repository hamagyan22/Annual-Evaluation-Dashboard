"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  X, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, 
  Download, Sparkles, Film, CheckCircle2, Share2, RefreshCw, Upload, 
  Camera, Image as ImageIcon, Sliders, Check, UserCheck, ChevronRight, Trophy,
  Palette
} from "lucide-react";
import { getTopStarMotivationalQuote, normalizeName } from "@/lib/topStarUtils";
import { compressImageFile } from "@/lib/imageUtils";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { useBodyScrollLock } from "@/lib/scrollLock";

/* ────────────────────────────────────────────────────────────
   THEME DEFINITIONS
   Each theme drives both the JSX preview & the canvas export.
───────────────────────────────────────────────────────────── */
const VIDEO_THEMES = [
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#00A991",
    // Backgrounds
    bg1: "#0B342A", bg2: "#07251E", bg3: "#041510",
    // Performer bg
    pbg1: "#0A2F25", pbg2: "#0E3C30", pbg3: "#062019",
    // Accents
    accent: "#00A991",
    accentAlt: "#2DD4BF",
    accentMuted: "rgba(0,169,145,0.20)",
    accentBorder: "rgba(0,169,145,0.40)",
    accentGlow: "rgba(0,169,145,0.22)",
    headerBg: "#08221B",
    cardBg: "#061813",
    border: "emerald-500/25",
    borderHeader: "emerald-500/20",
    // Canvas
    cBg1: "#092E24", cBg2: "#061F18", cBg3: "#03110D",
    cAccent: "#00A991", cAccentAlt: "#2DD4BF",
    cGlow: "rgba(0,169,145,0.22)",
  },
  {
    id: "royal",
    name: "Royal",
    swatch: "#4F7FFA",
    bg1: "#0D1A3A", bg2: "#0A1530", bg3: "#060D20",
    pbg1: "#0D1F45", pbg2: "#0E2550", pbg3: "#08142F",
    accent: "#4F7FFA",
    accentAlt: "#93B4FF",
    accentMuted: "rgba(79,127,250,0.18)",
    accentBorder: "rgba(79,127,250,0.40)",
    accentGlow: "rgba(79,127,250,0.20)",
    headerBg: "#0B1535",
    cardBg: "#080F25",
    border: "blue-500/25",
    borderHeader: "blue-500/20",
    cBg1: "#0A1730", cBg2: "#07102A", cBg3: "#04091A",
    cAccent: "#4F7FFA", cAccentAlt: "#93B4FF",
    cGlow: "rgba(79,127,250,0.22)",
  },
  {
    id: "cosmic",
    name: "Cosmic",
    swatch: "#A855F7",
    bg1: "#1A0B35", bg2: "#150929", bg3: "#0C061B",
    pbg1: "#200B3F", pbg2: "#250D4A", pbg3: "#140728",
    accent: "#A855F7",
    accentAlt: "#D8B4FE",
    accentMuted: "rgba(168,85,247,0.18)",
    accentBorder: "rgba(168,85,247,0.40)",
    accentGlow: "rgba(168,85,247,0.22)",
    headerBg: "#160A2E",
    cardBg: "#10071F",
    border: "purple-500/25",
    borderHeader: "purple-500/20",
    cBg1: "#180A32", cBg2: "#130827", cBg3: "#0A0518",
    cAccent: "#A855F7", cAccentAlt: "#D8B4FE",
    cGlow: "rgba(168,85,247,0.22)",
  },
  {
    id: "flame",
    name: "Flame",
    swatch: "#F97316",
    bg1: "#2D1006", bg2: "#200C04", bg3: "#130700",
    pbg1: "#321208", pbg2: "#3D160A", pbg3: "#1E0B04",
    accent: "#F97316",
    accentAlt: "#FEC07A",
    accentMuted: "rgba(249,115,22,0.18)",
    accentBorder: "rgba(249,115,22,0.40)",
    accentGlow: "rgba(249,115,22,0.22)",
    headerBg: "#1F0C03",
    cardBg: "#170900",
    border: "orange-500/25",
    borderHeader: "orange-500/20",
    cBg1: "#2A0F05", cBg2: "#1C0903", cBg3: "#0F0500",
    cAccent: "#F97316", cAccentAlt: "#FEC07A",
    cGlow: "rgba(249,115,22,0.22)",
  },
  {
    id: "silver",
    name: "Silver",
    swatch: "#94A3B8",
    bg1: "#111827", bg2: "#0F172A", bg3: "#080D16",
    pbg1: "#1A2332", pbg2: "#1E2A3D", pbg3: "#101825",
    accent: "#94A3B8",
    accentAlt: "#CBD5E1",
    accentMuted: "rgba(148,163,184,0.15)",
    accentBorder: "rgba(148,163,184,0.35)",
    accentGlow: "rgba(148,163,184,0.18)",
    headerBg: "#0D1421",
    cardBg: "#0A1020",
    border: "slate-500/25",
    borderHeader: "slate-500/20",
    cBg1: "#0F1520", cBg2: "#0C1118", cBg3: "#080C12",
    cAccent: "#94A3B8", cAccentAlt: "#CBD5E1",
    cGlow: "rgba(148,163,184,0.18)",
  },
] as const;

type ThemeId = typeof VIDEO_THEMES[number]["id"];
type ThemeDef = typeof VIDEO_THEMES[number];

/* ────────────────────────────────────────────────────────────
   INTERFACES
───────────────────────────────────────────────────────────── */
interface Performer {
  rank: number;
  name: string;
  score: string | number;
  vals?: Record<string, any>;
}

interface TopStarCelebrationVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  selectedYear: string;
  top3Chat: Performer[];
  top3Call: Performer[];
  allMembers?: any[];
  onPhotoUpdated?: (agentName: string, photoUrl: string) => void;
}

interface SlideItem {
  id: string;
  type: "intro" | "team_title" | "performer" | "outro";
  team?: "chat" | "call";
  teamLabel?: string;
  name?: string;
  rank?: number;
  score?: string | number;
  photoUrl?: string;
  title?: string;
  subtitle?: string;
  quote?: string;
  durationMs: number;
}

/* ────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function TopStarCelebrationVideoModal({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  top3Chat,
  top3Call,
  allMembers = [],
  onPhotoUpdated
}: TopStarCelebrationVideoModalProps) {
  useBodyScrollLock(isOpen);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ── Theme
  const [themeIdx, setThemeIdx] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const theme: ThemeDef = VIDEO_THEMES[themeIdx];

  useEffect(() => { setIsClient(true); }, []);

  // ── Photo management
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<Record<string, string>>({});
  const [uploadingAgent, setUploadingAgent] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetAgentRef = useRef<{ name: string; team: string } | null>(null);

  useEffect(() => {
    const map: Record<string, string> = {};
    allMembers.forEach(m => {
      const cName = normalizeName(m.agent_name || m.name || "");
      if (cName && m.photo_url) map[cName] = m.photo_url;
    });
    setLocalPhotos(prev => ({ ...map, ...prev }));
  }, [allMembers]);

  const getPhoto = useCallback((agentName: string) => {
    const cName = normalizeName(agentName);
    if (localPhotos[cName]) return localPhotos[cName];
    const member = allMembers.find(m => normalizeName(m.agent_name || m.name || "") === cName);
    return member?.photo_url || "";
  }, [allMembers, localPhotos]);

  const handleUploadPhoto = async (agentName: string, teamName: string, file: File) => {
    if (!file) return;
    setUploadingAgent(agentName);
    try {
      const compressed = await compressImageFile(file, 400, 0.85);
      const cName = normalizeName(agentName);
      setLocalPhotos(prev => ({ ...prev, [cName]: compressed }));
      if (onPhotoUpdated) onPhotoUpdated(agentName, compressed);
      const existing = allMembers.find(m => normalizeName(m.agent_name || m.name || "") === cName);
      if (existing?.id) {
        await updateDoc(doc(db, "team_members", existing.id), { photo_url: compressed });
      } else {
        const q = query(collection(db, "team_members"), where("agent_name", "==", agentName));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, "team_members", snap.docs[0].id), { photo_url: compressed });
        } else {
          await addDoc(collection(db, "team_members"), {
            agent_name: agentName,
            team: teamName === "chat" ? "Mohammed Dlshad Team" : "Younis Kamal Team",
            photo_url: compressed
          });
        }
      }
      setUploadNotice(`Photo for ${agentName} updated!`);
      setTimeout(() => setUploadNotice(null), 4000);
    } catch (err: any) {
      alert("Failed to upload photo: " + err.message);
    } finally {
      setUploadingAgent(null);
    }
  };

  const triggerUploadFor = (agentName: string, team: string) => {
    targetAgentRef.current = { name: agentName, team };
    if (fileInputRef.current) { fileInputRef.current.value = ""; fileInputRef.current.click(); }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetAgentRef.current) {
      handleUploadPhoto(targetAgentRef.current.name, targetAgentRef.current.team, file);
    }
  };

  // ── Slides
  const slides = useMemo<SlideItem[]>(() => {
    const list: SlideItem[] = [];
    list.push({ id: "intro", type: "intro", title: "CONTACT CENTER", subtitle: "TOP STARS RECOGNITION", durationMs: 3800 });
    if (top3Chat?.length > 0) {
      list.push({ id: "chat_title", type: "team_title", team: "chat", title: "Chat Team", subtitle: "Top 3 Stars Recognition", durationMs: 2800 });
      [...top3Chat].sort((a, b) => a.rank - b.rank).forEach(p => {
        list.push({ id: `chat_${p.rank}`, type: "performer", team: "chat", teamLabel: "Chat Team", name: p.name, rank: p.rank, score: p.score, photoUrl: getPhoto(p.name), quote: getTopStarMotivationalQuote(p.rank, selectedMonth), durationMs: 4000 });
      });
    }
    if (top3Call?.length > 0) {
      list.push({ id: "call_title", type: "team_title", team: "call", title: "Call Team", subtitle: "Top 3 Stars Recognition", durationMs: 2800 });
      [...top3Call].sort((a, b) => a.rank - b.rank).forEach(p => {
        list.push({ id: `call_${p.rank}`, type: "performer", team: "call", teamLabel: "Call Team", name: p.name, rank: p.rank, score: p.score, photoUrl: getPhoto(p.name), quote: getTopStarMotivationalQuote(p.rank, selectedMonth), durationMs: 4000 });
      });
    }
    list.push({ id: "outro", type: "outro", title: "THANK YOU FOR YOUR EFFORTS", subtitle: "Together We Deliver Excellence Everyday", durationMs: 3800 });
    return list;
  }, [selectedMonth, top3Chat, top3Call, getPhoto]);

  const activeSlide = slides[currentSlideIdx] || slides[0];

  // ── Audio
  useEffect(() => {
    if (!isOpen) { audioRef.current?.pause(); if (audioRef.current) audioRef.current.currentTime = 0; return; }
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      if (isPlaying && !isExporting) audio.play().catch(() => {});
      else audio.pause();
    }
  }, [isOpen, isPlaying, isMuted, isExporting]);

  // ── Slide navigation
  const goToSlide = useCallback((newIdx: number) => {
    setIsTransitioning(true);
    setTimeout(() => { setCurrentSlideIdx(newIdx); setTimeout(() => setIsTransitioning(false), 300); }, 200);
  }, []);

  // ── Auto-advance timer
  useEffect(() => {
    if (!isOpen || !isPlaying || isExporting || showPhotoManager) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const duration = activeSlide?.durationMs || 3800;
    timerRef.current = setTimeout(() => goToSlide((currentSlideIdx + 1) % slides.length), duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOpen, isPlaying, currentSlideIdx, slides.length, activeSlide, isExporting, showPhotoManager, goToSlide]);

  // ── Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIdx(0); setIsPlaying(true); setShowPhotoManager(false);
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
    } else {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    }
  }, [isOpen]);

  // ── Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && !showPhotoManager) { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.key === "ArrowRight") { e.preventDefault(); goToSlide((currentSlideIdx + 1) % slides.length); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goToSlide((currentSlideIdx - 1 + slides.length) % slides.length); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentSlideIdx, slides.length, showPhotoManager, goToSlide]);

  // ── Canvas draw for export
  const drawSlideToCanvas = useCallback((ctx: CanvasRenderingContext2D, size: number, slide: SlideItem, t: ThemeDef) => {
    ctx.clearRect(0, 0, size, size);

    if (slide.type === "intro" || slide.type === "team_title" || slide.type === "outro") {
      const grad = ctx.createRadialGradient(size * 0.5, size * 0.35, size * 0.1, size * 0.5, size * 0.5, size * 0.7);
      grad.addColorStop(0, t.cBg1); grad.addColorStop(0.5, t.cBg2); grad.addColorStop(1, t.cBg3);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);

      const glow = ctx.createRadialGradient(size * 0.5, size * 0.45, 10, size * 0.5, size * 0.45, size * 0.45);
      glow.addColorStop(0, t.cGlow); glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowColor = t.cAccent; ctx.shadowBlur = 18;

      if (slide.type === "intro") {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 ${Math.round(size * 0.052)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("CONTACT CENTER", size * 0.5, size * 0.47);
        ctx.fillStyle = t.cAccent;
        ctx.fillText("TOP STARS RECOGNITION", size * 0.5, size * 0.54);
        ctx.shadowBlur = 0;
        ctx.fillStyle = t.cAccentAlt;
        ctx.font = `bold ${Math.round(size * 0.03)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(`• ${selectedMonth.toUpperCase()} ${selectedYear} •`, size * 0.5, size * 0.62);
      } else if (slide.type === "team_title") {
        ctx.shadowBlur = 0;
        ctx.fillStyle = t.cAccentAlt;
        ctx.font = `bold ${Math.round(size * 0.026)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("TOP 3 STARS", size * 0.5, size * 0.45);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 ${Math.round(size * 0.056)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(slide.title || "", size * 0.5, size * 0.54);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = `500 ${Math.round(size * 0.026)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(slide.subtitle || "", size * 0.5, size * 0.62);
      } else if (slide.type === "outro") {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 ${Math.round(size * 0.052)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("THANK YOU FOR YOUR EFFORTS", size * 0.5, size * 0.48);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#E2E8F0";
        ctx.font = `500 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("Together We Deliver Excellence Everyday", size * 0.5, size * 0.56);
        ctx.fillStyle = t.cAccent;
        ctx.font = `bold ${Math.round(size * 0.024)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("Customer Experience Operations • First Iraqi Bank", size * 0.5, size * 0.64);
      }
      ctx.restore();
    } else if (slide.type === "performer") {
      const bgGrad = ctx.createLinearGradient(0, 0, size, size);
      bgGrad.addColorStop(0, t.cBg1); bgGrad.addColorStop(0.5, t.cBg2); bgGrad.addColorStop(1, t.cBg3);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, size, size);
      ctx.save();
      const rank = slide.rank || 1;
      const rankColor = rank === 1 ? t.cAccent : rank === 2 ? "#FFFFFF" : t.cAccentAlt;
      const pillW = size * 0.44, pillH = size * 0.052;
      const pillX = size * 0.5 - pillW / 2, pillY = size * 0.055;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, 14); ctx.fill();
      ctx.fillStyle = t.cAccentAlt;
      ctx.font = `bold ${Math.round(size * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`★ ${slide.teamLabel?.toUpperCase()} • TOP 3 ★`, size * 0.5, pillY + pillH / 2);
      const photoW = size * 0.44, photoH = size * 0.54;
      const photoX = (size - photoW) / 2, photoY = size * 0.16;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath(); ctx.roundRect(photoX, photoY, photoW, photoH, 20); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rankColor; ctx.stroke();
      const initials = (slide.name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.1)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(initials, size * 0.5, photoY + photoH * 0.5);
      const badgeW = size * 0.36, badgeH = size * 0.048;
      ctx.fillStyle = rank === 1 ? `${t.cAccent}55` : "rgba(255,255,255,0.15)";
      ctx.beginPath(); ctx.roundRect(size * 0.5 - badgeW / 2, photoY + photoH - badgeH / 2, badgeW, badgeH, 12); ctx.fill();
      ctx.strokeStyle = rankColor; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`${rank === 1 ? "🥇 1ST PLACE" : rank === 2 ? "🥈 2ND PLACE" : "🥉 3RD PLACE"}`, size * 0.5, photoY + photoH);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.048)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(slide.name || "", size * 0.5, size * 0.77);
      ctx.fillStyle = t.cAccentAlt;
      ctx.font = `800 ${Math.round(size * 0.038)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`${slide.score} PTS`, size * 0.5, size * 0.83);
      if (slide.quote) {
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.font = `italic 500 ${Math.round(size * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(`"${slide.quote}"`, size * 0.5, size * 0.89);
      }
      ctx.restore();
    }
  }, [selectedMonth, selectedYear]);

  // ── Video export
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true); setIsPlaying(false); setExportProgress(0);
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) { alert("Canvas context unavailable"); setIsExporting(false); return; }
    try {
      const stream = canvas.captureStream(30);
      if (audioRef.current) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaElementSource(audioRef.current);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest); source.connect(audioCtx.destination);
          const audioTracks = dest.stream.getAudioTracks();
          if (audioTracks.length > 0) stream.addTrack(audioTracks[0]);
          audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {});
        } catch (e) {}
      }
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `TopStars_${theme.name}_${selectedMonth}_${selectedYear}.webm`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setIsExporting(false); if (audioRef.current) audioRef.current.pause();
      };
      recorder.start();
      const total = slides.length;
      for (let i = 0; i < total; i++) {
        drawSlideToCanvas(ctx, 1080, slides[i], theme);
        setExportProgress(Math.round(((i + 1) / total) * 100));
        await new Promise(r => setTimeout(r, slides[i].durationMs || 3400));
      }
      recorder.stop();
    } catch (err: any) {
      alert("Video export error: " + err.message);
      setIsExporting(false); if (audioRef.current) audioRef.current.pause();
    }
  };

  // ── Save frame
  const handleDownloadSnapshot = () => {
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    drawSlideToCanvas(ctx, 1080, activeSlide, theme);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = `TopStar_${theme.name}_${activeSlide.id}_${selectedMonth}_${selectedYear}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Top Stars - ${selectedMonth} ${selectedYear}`, text: `Watch our Top Stars celebration!`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true); setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const allPerformers = useMemo(() => {
    const list: { name: string; team: string; teamLabel: string; rank: number; score: string | number; photoUrl: string }[] = [];
    top3Chat.forEach(p => list.push({ name: p.name, team: "chat", teamLabel: "Chat Team", rank: p.rank, score: p.score, photoUrl: getPhoto(p.name) }));
    top3Call.forEach(p => list.push({ name: p.name, team: "call", teamLabel: "Call Team", rank: p.rank, score: p.score, photoUrl: getPhoto(p.name) }));
    return list;
  }, [top3Chat, top3Call, getPhoto]);

  if (!isOpen || !isClient || typeof document === "undefined") return null;

  /* ──────────────────────────────────────────────────────────
     Derived helpers for theme-based CSS
  ─────────────────────────────────────────────────────────── */
  const accentHex = theme.accent;
  const accentAltHex = theme.accentAlt;

  // rank badge helpers
  const rankBadge = (rank?: number) => {
    if (rank === 1) return { bg: accentHex, ring: `${accentHex}66`, text: "#FFFFFF" };
    if (rank === 2) return { bg: "rgba(255,255,255,0.2)", ring: "rgba(255,255,255,0.35)", text: "#FFFFFF" };
    return { bg: "rgba(255,255,255,0.1)", ring: `${accentAltHex}55`, text: accentAltHex };
  };

  const rankLabel = (rank?: number) =>
    rank === 1 ? "🥇 1st Place" : rank === 2 ? "🥈 2nd Place" : "🥉 3rd Place";

  return createPortal(
    <div data-modal="true" className="fixed inset-0 z-50 bg-black/88 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] overscroll-contain">

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />

      {/* Audio */}
      <audio ref={audioRef} src="/audio/top_stars_theme.mp4" preload="auto" loop />

      {/* Upload Toast */}
      {uploadNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 text-white font-bold text-xs shadow-2xl animate-in slide-in-from-top-4 duration-200 border border-emerald-500/40">
          <CheckCircle2 size={15} />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* ── Main Studio Card ── */}
      <div
        className="relative flex flex-col overflow-hidden max-w-lg w-full rounded-3xl shadow-2xl"
        style={{ background: theme.cardBg, border: `1px solid ${accentHex}33` }}
      >

        {/* ── Header Bar ── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b z-30"
          style={{ background: theme.headerBg, borderColor: `${accentHex}22` }}
        >
          {/* Left: Brand + Month */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0" style={{ background: accentHex }}>
              <Film size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>Top Stars Studio</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border shrink-0"
                  style={{ background: `${accentHex}22`, color: accentAltHex, borderColor: `${accentHex}44` }}
                >
                  {selectedMonth} {selectedYear}
                </span>
              </h2>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Theme Picker Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(p => !p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border"
                style={showThemePicker
                  ? { background: accentHex, color: "#fff", borderColor: "transparent" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.10)" }
                }
                title="Change Video Theme"
              >
                <Palette size={13} />
                <span className="hidden sm:inline">Theme</span>
              </button>

              {/* Dropdown */}
              {showThemePicker && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl p-2 flex flex-col gap-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-150"
                  style={{ background: theme.headerBg, borderColor: `${accentHex}33` }}
                >
                  {VIDEO_THEMES.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => { setThemeIdx(idx); setShowThemePicker(false); }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left"
                      style={themeIdx === idx
                        ? { background: `${t.swatch}25`, color: "#fff" }
                        : { color: "rgba(255,255,255,0.65)" }
                      }
                    >
                      <span className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white/20" style={{ background: t.swatch }} />
                      <span>{t.name}</span>
                      {themeIdx === idx && <Check size={11} className="ml-auto" style={{ color: t.swatch }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Photos */}
            <button
              onClick={() => setShowPhotoManager(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border"
              style={showPhotoManager
                ? { background: accentHex, color: "#fff", borderColor: "transparent" }
                : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.10)" }
              }
              title="Upload Employee Photos"
            >
              <Camera size={13} />
              <span className="hidden sm:inline">Photos</span>
            </button>

            {/* Mute */}
            <button
              onClick={() => setIsMuted(m => !m)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer border"
              style={isMuted
                ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }
                : { background: `${accentHex}20`, color: accentAltHex, borderColor: `${accentHex}40` }
              }
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition border border-white/20 cursor-pointer"
              style={{ background: "rgba(0,0,0,0.45)" }}
              title="Close"
            >
              <X size={17} strokeWidth={2.5} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Video Stage ── */}
        <div className="relative w-full aspect-square overflow-hidden select-none" style={{ background: theme.bg3 }}>

          {/* Transition overlay */}
          <div
            className="absolute inset-0 z-40 pointer-events-none transition-opacity duration-300"
            style={{ background: theme.headerBg, opacity: isTransitioning ? 0.9 : 0 }}
          />

          {/* ── 1. Intro ── */}
          {activeSlide.type === "intro" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2}, ${theme.bg3})` }}
            >
              {/* Glow blobs */}
              <div className="absolute top-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: `${accentHex}22` }} />
              <div className="absolute bottom-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: `${accentAltHex}15` }} />

              {/* FIB Badge */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-md mb-6 shadow-sm" style={{ background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.15)" }}>
                <img src="/logo.webp" alt="FIB" className="h-6 w-auto object-contain" />
                <span className="font-['Outfit',sans-serif] font-black text-sm text-white tracking-widest">FIRST IRAQI BANK</span>
              </div>

              <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight mb-2">
                CONTACT CENTER<br />
                <span style={{ color: accentHex }}>TOP STARS RECOGNITION</span>
              </h1>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono tracking-wider mt-2 mb-4" style={{ background: `${accentHex}20`, color: accentAltHex, borderColor: `${accentHex}40` }}>
                <Sparkles size={12} style={{ color: accentAltHex }} />
                <span>{selectedMonth.toUpperCase()} {selectedYear}</span>
              </div>

              <p className="text-xs sm:text-sm font-medium max-w-xs sm:max-w-md" style={{ color: "rgba(255,255,255,0.75)" }}>
                Honoring the exceptional performers who drive customer trust and excellence everyday.
              </p>
            </div>
          )}

          {/* ── 2. Team Title ── */}
          {activeSlide.type === "team_title" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2}, ${theme.bg3})` }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <div className="w-96 h-96 rounded-full" style={{ background: accentHex, filter: "blur(80px)" }} />
              </div>

              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl ring-4 mb-5 relative z-10"
                style={{ background: accentHex, boxShadow: `0 8px 32px ${accentHex}44, 0 0 0 4px ${accentHex}33` }}
              >
                <Trophy size={30} className="text-white" />
              </div>

              <span className="text-xs font-black uppercase tracking-widest mb-1.5 relative z-10" style={{ color: accentAltHex }}>
                TOP 3 PODIUM
              </span>
              <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight mb-3 relative z-10">{activeSlide.title}</h1>
              <p className="text-xs sm:text-sm font-bold px-5 py-1.5 rounded-xl relative z-10" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}>
                {activeSlide.subtitle}
              </p>
            </div>
          )}

          {/* ── 3. Performer ── */}
          {activeSlide.type === "performer" && (
            <div
              className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.pbg1}, ${theme.pbg2}, ${theme.pbg3})` }}
            >
              {/* Ambient glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <div className="w-72 h-72 rounded-full" style={{ background: accentHex, filter: "blur(70px)" }} />
              </div>

              {/* Top row */}
              <div className="flex items-center justify-between w-full relative z-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold tracking-wider backdrop-blur-md" style={{ background: "rgba(255,255,255,0.10)", color: accentAltHex, border: "1px solid rgba(255,255,255,0.15)" }}>
                  {activeSlide.teamLabel}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider shadow-sm" style={{ background: rankBadge(activeSlide.rank).bg, color: rankBadge(activeSlide.rank).text, boxShadow: `0 0 0 2px ${rankBadge(activeSlide.rank).ring}` }}>
                  {rankLabel(activeSlide.rank)}
                </div>
              </div>

              {/* Portrait */}
              <div className="relative flex-1 flex flex-col items-center justify-center my-1 z-20">
                <div className="relative group">
                  <div
                    className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden shadow-2xl p-1 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{
                      background: activeSlide.rank === 1
                        ? `linear-gradient(135deg, ${accentHex}, ${accentAltHex}, #fff)`
                        : activeSlide.rank === 2
                        ? "linear-gradient(135deg, #cbd5e1, #fff, #94a3b8)"
                        : `linear-gradient(135deg, ${theme.bg1}, ${accentAltHex}, #34d399)`,
                      boxShadow: `0 0 0 4px ${accentHex}44`
                    }}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#0a0a14" }}>
                      {activeSlide.photoUrl ? (
                        <img src={activeSlide.photoUrl} alt={activeSlide.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white p-3 text-center" style={{ background: theme.pbg1 }}>
                          <span className="font-black text-3xl sm:text-4xl tracking-tight mb-1" style={{ color: accentAltHex }}>
                            {(activeSlide.name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold opacity-60" style={{ color: accentAltHex }}>No photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camera overlay */}
                  <button
                    onClick={() => triggerUploadFor(activeSlide.name || "", activeSlide.team || "chat")}
                    disabled={uploadingAgent === activeSlide.name}
                    className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-200 hover:scale-110 active:scale-95 transition cursor-pointer flex items-center justify-center"
                    title={`Upload photo for ${activeSlide.name}`}
                  >
                    {uploadingAgent === activeSlide.name
                      ? <RefreshCw size={14} className="animate-spin" style={{ color: accentHex }} />
                      : <Camera size={14} style={{ color: accentHex }} />
                    }
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col items-center text-center relative z-20 pt-1">
                <h2 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-1.5">
                  <span>{activeSlide.name}</span>
                  <span style={{ color: accentAltHex }} className="text-sm">✦</span>
                </h2>
                <div className="inline-flex items-baseline gap-1 px-3 py-0.5 rounded-xl border font-bold text-xs mt-1 mb-2" style={{ background: `${accentHex}20`, borderColor: `${accentHex}40`, color: accentAltHex }}>
                  <span className="text-white text-sm font-black font-mono">{activeSlide.score}</span>
                  <span className="text-[10px] uppercase font-semibold opacity-70">pts</span>
                </div>
                {activeSlide.quote && (
                  <div className="text-[11px] sm:text-xs font-semibold text-white/88 italic max-w-sm px-3.5 py-1.5 rounded-xl backdrop-blur-md" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    &ldquo;{activeSlide.quote}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 4. Outro ── */}
          {activeSlide.type === "outro" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2}, ${theme.bg3})` }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-96 rounded-full opacity-20" style={{ background: accentHex, filter: "blur(90px)" }} />
              </div>

              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl ring-4 mb-5 relative z-10"
                style={{ background: accentHex, boxShadow: `0 8px 32px ${accentHex}44` }}
              >
                🌟
              </div>
              <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight mb-2 relative z-10">THANK YOU FOR YOUR EFFORTS</h1>
              <p className="text-xs sm:text-sm font-medium max-w-sm mb-4 relative z-10" style={{ color: "rgba(255,255,255,0.80)" }}>
                Your daily excellence, dedication, and care inspire the entire team. Together we build lasting customer satisfaction!
              </p>
              <div className="text-[11px] font-bold uppercase tracking-widest relative z-10" style={{ color: accentAltHex }}>
                Customer Experience Leadership • First Iraqi Bank
              </div>
            </div>
          )}

          {/* ── Photo Manager Drawer ── */}
          {showPhotoManager && (
            <div className="absolute inset-0 z-50 flex flex-col justify-between p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-200" style={{ background: `${theme.headerBg}f8`, backdropFilter: "blur(10px)" }}>
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
                <div className="flex items-center gap-2">
                  <Camera size={15} style={{ color: accentAltHex }} />
                  <h3 className="text-sm font-black text-white">Manage Employee Photos</h3>
                </div>
                <button onClick={() => setShowPhotoManager(false)} className="w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.60)" }}>
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
                {allPerformers.map(p => (
                  <div key={p.name} className="flex items-center justify-between p-2.5 rounded-2xl transition" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center shrink-0" style={{ background: "#0a0a14", borderColor: "rgba(255,255,255,0.15)" }}>
                        {p.photoUrl
                          ? <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                          : <span className="font-bold text-xs text-white">{p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: accentAltHex }}>#{p.rank}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{p.teamLabel} • {p.score} pts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerUploadFor(p.name, p.team)}
                      disabled={uploadingAgent === p.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                      style={{ background: accentHex }}
                    >
                      {uploadingAgent === p.name
                        ? <><RefreshCw size={12} className="animate-spin" /><span>Uploading...</span></>
                        : <><Upload size={12} /><span>{p.photoUrl ? "Change" : "Upload"}</span></>
                      }
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t flex justify-end" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
                <button onClick={() => setShowPhotoManager(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer" style={{ background: accentHex }}>
                  Done &amp; Return
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Controls ── */}
        <div className="px-4 py-3 flex flex-col gap-2.5 z-20 border-t" style={{ background: theme.headerBg, borderColor: `${accentHex}22` }}>

          {/* Timeline */}
          <div className="flex items-center gap-1 w-full">
            {slides.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => goToSlide(idx)}
                className="h-1 flex-1 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  background: idx === currentSlideIdx
                    ? "#FFFFFF"
                    : idx < currentSlideIdx
                    ? accentHex
                    : "rgba(255,255,255,0.15)"
                }}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Playback */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => goToSlide((currentSlideIdx - 1 + slides.length) % slides.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition cursor-pointer" style={{ background: "rgba(255,255,255,0.10)" }}>
                <SkipBack size={13} />
              </button>
              <button onClick={() => setIsPlaying(p => !p)} className="w-9 h-9 rounded-xl text-white flex items-center justify-center transition cursor-pointer shadow-md" style={{ background: accentHex, boxShadow: `0 4px 12px ${accentHex}44` }}>
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>
              <button onClick={() => goToSlide((currentSlideIdx + 1) % slides.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition cursor-pointer" style={{ background: "rgba(255,255,255,0.10)" }}>
                <SkipForward size={13} />
              </button>
              <button
                onClick={() => { goToSlide(0); if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); } }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer ml-1"
                style={{ background: "rgba(255,255,255,0.10)" }}
              >
                <RotateCcw size={13} />
              </button>
              <span className="text-[11px] font-bold text-gray-400 ml-1.5 font-mono">{currentSlideIdx + 1}/{slides.length}</span>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1.5">
              <button onClick={handleDownloadSnapshot} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold transition cursor-pointer" style={{ background: "rgba(255,255,255,0.10)" }}>
                <Download size={13} />
                <span className="hidden sm:inline">Frame</span>
              </button>
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-black text-xs transition cursor-pointer disabled:opacity-50 shadow-md"
                style={{ background: accentHex, boxShadow: `0 4px 12px ${accentHex}44` }}
              >
                {isExporting
                  ? <><RefreshCw size={13} className="animate-spin" /><span>({exportProgress}%)...</span></>
                  : <><Film size={13} /><span>Export Video</span></>
                }
              </button>
              <button onClick={handleShare} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer" style={{ background: "rgba(255,255,255,0.10)" }}>
                {copiedLink ? <CheckCircle2 size={14} style={{ color: accentAltHex }} /> : <Share2 size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
