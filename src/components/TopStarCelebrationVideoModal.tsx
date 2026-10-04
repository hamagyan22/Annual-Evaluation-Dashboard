"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  X, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, 
  Download, Sparkles, Film, CheckCircle2, Share2, RefreshCw, Upload, 
  Camera, Image as ImageIcon, Sliders, Check, UserCheck, ChevronRight, Trophy
} from "lucide-react";
import { getTopStarMotivationalQuote, normalizeName } from "@/lib/topStarUtils";
import { compressImageFile } from "@/lib/imageUtils";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

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
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Photo management state
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<Record<string, string>>({});
  const [uploadingAgent, setUploadingAgent] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetAgentRef = useRef<{ name: string; team: string } | null>(null);

  // Initialize and sync local photos map
  useEffect(() => {
    const map: Record<string, string> = {};
    allMembers.forEach(m => {
      const cName = normalizeName(m.agent_name || m.name || "");
      if (cName && m.photo_url) {
        map[cName] = m.photo_url;
      }
    });
    setLocalPhotos(prev => ({ ...map, ...prev }));
  }, [allMembers]);

  // Helper to find member photo
  const getPhoto = useCallback((agentName: string) => {
    const cName = normalizeName(agentName);
    if (localPhotos[cName]) return localPhotos[cName];
    const member = allMembers.find(m => normalizeName(m.agent_name || m.name || "") === cName);
    return member?.photo_url || "";
  }, [allMembers, localPhotos]);

  // Upload handler for updating employee photo
  const handleUploadPhoto = async (agentName: string, teamName: string, file: File) => {
    if (!file) return;
    setUploadingAgent(agentName);
    try {
      // High-definition yet lightweight compression (~45KB, 400x400)
      const compressed = await compressImageFile(file, 400, 0.85);
      const cName = normalizeName(agentName);

      // 1. Update local state immediately for instant preview
      setLocalPhotos(prev => ({ ...prev, [cName]: compressed }));
      if (onPhotoUpdated) {
        onPhotoUpdated(agentName, compressed);
      }

      // 2. Persist to Firestore team_members collection
      const existing = allMembers.find(m => normalizeName(m.agent_name || m.name || "") === cName);
      if (existing && existing.id) {
        await updateDoc(doc(db, "team_members", existing.id), {
          photo_url: compressed
        });
      } else {
        const q = query(collection(db, "team_members"), where("agent_name", "==", agentName));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, "team_members", snap.docs[0].id), {
            photo_url: compressed
          });
        } else {
          await addDoc(collection(db, "team_members"), {
            agent_name: agentName,
            team: teamName === "chat" ? "Mohammed Dlshad Team" : "Younis Kamal Team",
            photo_url: compressed
          });
        }
      }

      setUploadNotice(`Photo for ${agentName} updated successfully!`);
      setTimeout(() => setUploadNotice(null), 4000);
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload photo: " + err.message);
    } finally {
      setUploadingAgent(null);
    }
  };

  const triggerUploadFor = (agentName: string, team: string) => {
    targetAgentRef.current = { name: agentName, team };
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetAgentRef.current) {
      handleUploadPhoto(targetAgentRef.current.name, targetAgentRef.current.team, file);
    }
  };

  // Construct slides with classy modern styling
  const slides = useMemo<SlideItem[]>(() => {
    const list: SlideItem[] = [];
    const monthFull = selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase();

    // Slide 1: Main Title Opener
    list.push({
      id: "intro",
      type: "intro",
      title: "CONTACT CENTER",
      subtitle: `TOP STARS RECOGNITION`,
      durationMs: 3800
    });

    // Chat Team Section
    if (top3Chat && top3Chat.length > 0) {
      list.push({
        id: "chat_title",
        type: "team_title",
        team: "chat",
        title: "Chat Team",
        subtitle: "Top 3 Stars Recognition",
        durationMs: 2800
      });

      // Chat Performers (Order: #1 -> #2 -> #3)
      const chatSorted = [...top3Chat].sort((a, b) => a.rank - b.rank);
      chatSorted.forEach(p => {
        list.push({
          id: `chat_${p.rank}`,
          type: "performer",
          team: "chat",
          teamLabel: "Chat Team",
          name: p.name,
          rank: p.rank,
          score: p.score,
          photoUrl: getPhoto(p.name),
          quote: getTopStarMotivationalQuote(p.rank, selectedMonth),
          durationMs: 4000
        });
      });
    }

    // Call Team Section
    if (top3Call && top3Call.length > 0) {
      list.push({
        id: "call_title",
        type: "team_title",
        team: "call",
        title: "Call Team",
        subtitle: "Top 3 Stars Recognition",
        durationMs: 2800
      });

      // Call Performers (Order: #1 -> #2 -> #3)
      const callSorted = [...top3Call].sort((a, b) => a.rank - b.rank);
      callSorted.forEach(p => {
        list.push({
          id: `call_${p.rank}`,
          type: "performer",
          team: "call",
          teamLabel: "Call Team",
          name: p.name,
          rank: p.rank,
          score: p.score,
          photoUrl: getPhoto(p.name),
          quote: getTopStarMotivationalQuote(p.rank, selectedMonth),
          durationMs: 4000
        });
      });
    }

    // Final Slide: Appreciation Outro
    list.push({
      id: "outro",
      type: "outro",
      title: "THANK YOU FOR YOUR EFFORTS",
      subtitle: "Together We Deliver Excellence Everyday",
      durationMs: 3800
    });

    return list;
  }, [selectedMonth, top3Chat, top3Call, getPhoto]);

  const activeSlide = slides[currentSlideIdx] || slides[0];

  // Audio Playback Handling
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      if (isPlaying && !isExporting) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [isOpen, isPlaying, isMuted, isExporting]);

  // Transition trigger
  const goToSlide = useCallback((newIdx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIdx(newIdx);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  }, []);

  // Slide Advance Timer
  useEffect(() => {
    if (!isOpen || !isPlaying || isExporting || showPhotoManager) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = activeSlide?.durationMs || 3800;
    timerRef.current = setTimeout(() => {
      const nextIdx = (currentSlideIdx + 1) % slides.length;
      goToSlide(nextIdx);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPlaying, currentSlideIdx, slides.length, activeSlide, isExporting, showPhotoManager, goToSlide]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIdx(0);
      setIsPlaying(true);
      setShowPhotoManager(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && !showPhotoManager) {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide((currentSlideIdx + 1) % slides.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide((currentSlideIdx - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentSlideIdx, slides.length, showPhotoManager, goToSlide]);

  // Canvas drawing for high-res video export & frame snapshot (Classy Modern 1080x1080)
  const drawSlideToCanvas = useCallback((ctx: CanvasRenderingContext2D, size: number, slide: SlideItem) => {
    ctx.clearRect(0, 0, size, size);

    if (slide.type === "intro" || slide.type === "team_title" || slide.type === "outro") {
      // 1. Luxury Dark Emerald & Obsidian Silk
      const grad = ctx.createRadialGradient(size * 0.5, size * 0.35, size * 0.1, size * 0.5, size * 0.5, size * 0.7);
      grad.addColorStop(0, "#092E24");
      grad.addColorStop(0.5, "#061F18");
      grad.addColorStop(1, "#03110D");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Subtle FIB Teal ambient glow
      const tealGlow = ctx.createRadialGradient(size * 0.5, size * 0.45, 10, size * 0.5, size * 0.45, size * 0.45);
      tealGlow.addColorStop(0, "rgba(0, 169, 145, 0.22)");
      tealGlow.addColorStop(1, "rgba(0, 169, 145, 0)");
      ctx.fillStyle = tealGlow;
      ctx.fillRect(0, 0, size, size);

      // Top Logo: FIB
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const logoY = size * 0.34;
      ctx.fillStyle = "#00A991";
      ctx.font = `900 ${Math.round(size * 0.046)}px 'Outfit', sans-serif`;
      ctx.fillText("B", size * 0.45, logoY);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.04)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText("FIB", size * 0.53, logoY);

      // Elegant Title with Soft Glow
      ctx.shadowColor = "rgba(0, 169, 145, 0.4)";
      ctx.shadowBlur = 18;

      if (slide.type === "intro") {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 ${Math.round(size * 0.052)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("CONTACT CENTER", size * 0.5, size * 0.47);
        ctx.fillStyle = "#00A991";
        ctx.fillText("TOP STARS RECOGNITION", size * 0.5, size * 0.54);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#2DD4BF";
        ctx.font = `bold ${Math.round(size * 0.03)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(`• ${selectedMonth.toUpperCase()} ${selectedYear} •`, size * 0.5, size * 0.62);
      } else if (slide.type === "team_title") {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#2DD4BF";
        ctx.font = `bold ${Math.round(size * 0.026)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("TOP 3 STARS", size * 0.5, size * 0.45);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 ${Math.round(size * 0.056)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(slide.title || "", size * 0.5, size * 0.54);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
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
        ctx.fillStyle = "#00A991";
        ctx.font = `bold ${Math.round(size * 0.024)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText("Customer Experience Operations • First Iraqi Bank", size * 0.5, size * 0.64);
      }
      ctx.restore();

    } else if (slide.type === "performer") {
      // 2. Classy Modern Performer Canvas: Soothing Dark Luxury Teal/Emerald
      const bgGrad = ctx.createLinearGradient(0, 0, size, size);
      bgGrad.addColorStop(0, "#082920");
      bgGrad.addColorStop(0.5, "#0D382D");
      bgGrad.addColorStop(1, "#051A14");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Soft ambient card glow
      ctx.save();
      const rank = slide.rank || 1;
      const rankColor = rank === 1 ? "#00A991" : rank === 2 ? "#FFFFFF" : "#2DD4BF";

      // Top Header Pill
      const pillW = size * 0.44;
      const pillH = size * 0.052;
      const pillX = size * 0.5 - pillW / 2;
      const pillY = size * 0.055;
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 14);
      ctx.fill();

      ctx.fillStyle = "#2DD4BF";
      ctx.font = `bold ${Math.round(size * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`★ ${slide.teamLabel?.toUpperCase()} • TOP 3 ★`, size * 0.5, pillY + pillH / 2);

      // Central Portrait Box (Rounded, with luxury border)
      const photoW = size * 0.44;
      const photoH = size * 0.54;
      const photoX = (size - photoW) / 2;
      const photoY = size * 0.16;

      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = rankColor;
      ctx.stroke();

      // Portrait initials
      const initials = (slide.name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.1)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(initials, size * 0.5, photoY + photoH * 0.5);

      // Rank Medal Pill
      const badgeW = size * 0.36;
      const badgeH = size * 0.048;
      ctx.fillStyle = rank === 1 ? "rgba(0, 169, 145, 0.35)" : "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(size * 0.5 - badgeW / 2, photoY + photoH - badgeH / 2, badgeW, badgeH, 12);
      ctx.fill();
      ctx.strokeStyle = rankColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`${rank === 1 ? "🥇 CHAMPION" : rank === 2 ? "🥈 1ST RUNNER-UP" : "🥉 2ND RUNNER-UP"}`, size * 0.5, photoY + photoH);

      // Agent Name in crisp pure White
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.round(size * 0.048)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(slide.name || "", size * 0.5, size * 0.77);

      // Score Pill
      ctx.fillStyle = "#2DD4BF";
      ctx.font = `800 ${Math.round(size * 0.038)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(`${slide.score} PTS`, size * 0.5, size * 0.83);

      // Motivational Quote
      if (slide.quote) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.font = `italic 500 ${Math.round(size * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(`"${slide.quote}"`, size * 0.5, size * 0.89);
      }

      ctx.restore();
    }
  }, [selectedMonth, selectedYear]);

  // Video Export Recorder: captures canvas stream + audio into downloadable .webm video
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setIsPlaying(false);
    setExportProgress(0);

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      alert("Canvas context unavailable");
      setIsExporting(false);
      return;
    }

    try {
      const stream = canvas.captureStream(30);

      // Connect audio element track to stream if available
      if (audioRef.current) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaElementSource(audioRef.current);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination);
          const audioTracks = dest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
          }
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        } catch (e) {}
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TopStars_Classy_${selectedMonth}_${selectedYear}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        if (audioRef.current) audioRef.current.pause();
      };

      recorder.start();

      const total = slides.length;
      for (let i = 0; i < total; i++) {
        const sc = slides[i];
        drawSlideToCanvas(ctx, 1080, sc);
        setExportProgress(Math.round(((i + 1) / total) * 100));
        await new Promise(r => setTimeout(r, sc.durationMs || 3400));
      }

      recorder.stop();
    } catch (err: any) {
      console.error("Export failed:", err);
      alert("Video export error: " + err.message);
      setIsExporting(false);
      if (audioRef.current) audioRef.current.pause();
    }
  };

  // Download Current Slide as High-Res PNG (1080x1080)
  const handleDownloadSnapshot = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSlideToCanvas(ctx, 1080, activeSlide);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `TopStar_${activeSlide.id}_${selectedMonth}_${selectedYear}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Top Stars - ${selectedMonth} ${selectedYear}`,
        text: `Watch our Top Stars celebration reel for ${selectedMonth} ${selectedYear}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // List of all performers for the photo manager drawer
  const allPerformers = useMemo(() => {
    const list: { name: string; team: string; teamLabel: string; rank: number; score: string | number; photoUrl: string }[] = [];
    top3Chat.forEach(p => {
      list.push({
        name: p.name,
        team: "chat",
        teamLabel: "Chat Team",
        rank: p.rank,
        score: p.score,
        photoUrl: getPhoto(p.name)
      });
    });
    top3Call.forEach(p => {
      list.push({
        name: p.name,
        team: "call",
        teamLabel: "Call Team",
        rank: p.rank,
        score: p.score,
        photoUrl: getPhoto(p.name)
      });
    });
    return list;
  }, [top3Chat, top3Call, getPhoto]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Hidden file input for photo upload */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={onFileInputChange} 
      />

      {/* Background Audio with official music */}
      <audio
        ref={audioRef}
        src="/audio/top_stars_theme.mp4"
        preload="auto"
        loop
      />

      {/* Notification Toast */}
      {uploadNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 text-white font-bold text-xs shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Main Video Studio Card */}
      <div className="relative bg-[#061813] border border-emerald-500/25 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-w-lg w-full">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#08221B]/95 border-b border-emerald-500/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00A991] text-white flex items-center justify-center font-black shadow-sm">
              <Film size={15} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 tracking-tight">
                <span>Top Stars Celebration Studio</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {selectedMonth} {selectedYear}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Manage Employee Photos Button */}
            <button
              onClick={() => setShowPhotoManager(p => !p)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                showPhotoManager 
                  ? "bg-[#00A991] text-white shadow-sm" 
                  : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/10"
              }`}
              title="Upload & Manage Employee Photos"
            >
              <Camera size={13} />
              <span className="hidden sm:inline">Upload Photos</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(m => !m)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                isMuted 
                  ? "bg-white/10 text-white/40" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
              title={isMuted ? "Unmute Music" : "Mute Music"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage: 1:1 Aspect Ratio (Classy & Modern, Soothing Palette) */}
        <div className="relative w-full aspect-square bg-[#03110D] overflow-hidden select-none flex items-center justify-center">

          {/* Dissolve Transition Overlay */}
          <div 
            className={`absolute inset-0 z-40 bg-[#08221B] pointer-events-none transition-opacity duration-300 ${
              isTransitioning ? "opacity-90" : "opacity-0"
            }`}
          />

          {/* 1. Intro Slide */}
          {activeSlide.type === "intro" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-gradient-to-br from-[#0B342A] via-[#07251E] to-[#041510] overflow-hidden">
              
              {/* Subtle Ambient Radial Lighting */}
              <div className="absolute top-1/3 w-80 h-80 bg-[#00A991]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* FIB Brand Badge */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md mb-6 shadow-sm">
                <img src="/logo.webp" alt="FIB" className="h-6 w-auto object-contain" />
                <span className="font-['Outfit',sans-serif] font-black text-sm text-white tracking-widest">
                  FIRST IRAQI BANK
                </span>
              </div>

              {/* Classy Headline: White on top, official FIB teal color below */}
              <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight mb-2">
                CONTACT CENTER<br />
                <span className="text-[#00A991] drop-shadow-sm">
                  TOP STARS RECOGNITION
                </span>
              </h1>

              {/* Month Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A991]/20 text-teal-300 border border-[#00A991]/40 text-xs font-bold font-mono tracking-wider mt-2 mb-4">
                <Sparkles size={12} className="text-[#2DD4BF]" />
                <span>{selectedMonth.toUpperCase()} {selectedYear}</span>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xs sm:max-w-md">
                Honoring the exceptional performers who drive customer trust and excellence everyday.
              </p>
            </div>
          )}

          {/* 2. Team Title Slide */}
          {activeSlide.type === "team_title" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-gradient-to-br from-[#0B342A] via-[#07251E] to-[#041510] overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-[#00A991] text-white flex items-center justify-center shadow-xl shadow-[#00A991]/30 ring-4 ring-[#00A991]/30 mb-4">
                <Trophy size={32} />
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-[#2DD4BF] mb-1">
                TOP 3 PODIUM
              </span>

              <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight mb-2">
                {activeSlide.title}
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100 font-bold bg-white/10 border border-white/15 px-4 py-1.5 rounded-xl">
                {activeSlide.subtitle}
              </p>
            </div>
          )}

          {/* 3. Classy Performer Slide */}
          {activeSlide.type === "performer" && (
            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7 bg-gradient-to-br from-[#0A2F25] via-[#0E3C30] to-[#062019] overflow-hidden">
              
              {/* Top Row: Department Pill on Left, Rank Badge on Right */}
              <div className="flex items-center justify-between w-full relative z-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-[#2DD4BF] text-[11px] font-bold tracking-wider backdrop-blur-md">
                  <span>{activeSlide.teamLabel}</span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider shadow-sm ${
                  activeSlide.rank === 1 
                    ? "bg-[#00A991] text-white ring-2 ring-teal-300/40" 
                    : activeSlide.rank === 2
                    ? "bg-white/20 text-white ring-2 ring-white/30 backdrop-blur-md"
                    : "bg-white/10 text-emerald-200 ring-2 ring-emerald-500/30 backdrop-blur-md"
                }`}>
                  <span>{activeSlide.rank === 1 ? "🥇 Champion" : activeSlide.rank === 2 ? "🥈 1st Runner-Up" : "🥉 2nd Runner-Up"}</span>
                </div>
              </div>

              {/* Center Portrait with Direct Photo Upload Option */}
              <div className="relative flex-1 flex flex-col items-center justify-center my-1 z-20">
                <div className="relative group">
                  {/* Portrait Frame */}
                  <div className={`w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden shadow-2xl p-1 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-102 ${
                    activeSlide.rank === 1 
                      ? "bg-gradient-to-tr from-[#00A991] via-teal-200 to-white ring-4 ring-[#00A991]/50" 
                      : activeSlide.rank === 2
                      ? "bg-gradient-to-tr from-slate-300 via-white to-slate-400 ring-4 ring-white/30"
                      : "bg-gradient-to-tr from-[#0B342A] via-teal-600 to-emerald-400 ring-4 ring-emerald-500/30"
                  }`}>
                    <div className="w-full h-full rounded-xl bg-gray-950 overflow-hidden flex items-center justify-center relative">
                      {activeSlide.photoUrl ? (
                        <img 
                          src={activeSlide.photoUrl} 
                          alt={activeSlide.name || ""} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0C342A] flex flex-col items-center justify-center text-white p-3 text-center">
                          <span className="font-black text-3xl sm:text-4xl tracking-tight text-emerald-200 mb-1">
                            {(activeSlide.name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                          <span className="text-[10px] text-emerald-300/70 font-bold">No photo set</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Camera Upload Action Overlay */}
                  <button
                    onClick={() => triggerUploadFor(activeSlide.name || "", activeSlide.team || "chat")}
                    disabled={uploadingAgent === activeSlide.name}
                    className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-200 hover:scale-110 active:scale-95 transition cursor-pointer flex items-center justify-center"
                    title={`Upload/Change photo for ${activeSlide.name}`}
                  >
                    {uploadingAgent === activeSlide.name ? (
                      <RefreshCw size={14} className="animate-spin text-[#00A991]" />
                    ) : (
                      <Camera size={14} className="text-[#00A991]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Info Bar: Classy Modern Typography */}
              <div className="flex flex-col items-center text-center relative z-20 pt-1">
                {/* Agent Name */}
                <h2 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-1.5">
                  <span>{activeSlide.name}</span>
                  <span className="text-[#2DD4BF] text-sm">✦</span>
                </h2>

                {/* Score Chip */}
                <div className="inline-flex items-baseline gap-1 px-3 py-0.5 rounded-xl bg-[#00A991]/20 border border-[#00A991]/40 text-[#2DD4BF] font-bold text-xs mt-1 mb-2">
                  <span className="text-white text-sm font-black font-mono">{activeSlide.score}</span>
                  <span className="text-[10px] uppercase text-emerald-200 font-semibold">pts</span>
                </div>

                {/* Dynamic Motivational Quote */}
                {activeSlide.quote && (
                  <div className="text-[11px] sm:text-xs font-semibold text-white/90 italic max-w-sm bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
                    "{activeSlide.quote}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Outro Slide */}
          {activeSlide.type === "outro" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-gradient-to-br from-[#0B342A] via-[#07251E] to-[#041510] overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-[#00A991] text-white flex items-center justify-center text-3xl shadow-xl shadow-[#00A991]/30 ring-4 ring-[#00A991]/30 mb-5">
                🌟
              </div>

              <h1 className="font-black text-2xl sm:text-4xl text-white tracking-tight mb-2">
                THANK YOU FOR YOUR EFFORTS
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-sm mb-4">
                Your daily excellence, dedication, and care inspire the entire team. Together we build lasting customer satisfaction!
              </p>

              <div className="text-[11px] font-bold text-[#2DD4BF] uppercase tracking-widest">
                Customer Experience Leadership • First Iraqi Bank
              </div>
            </div>
          )}

          {/* Photo Management Drawer Overlay */}
          {showPhotoManager && (
            <div className="absolute inset-0 z-50 bg-[#061C16]/95 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-[#2DD4BF]" />
                  <h3 className="text-sm font-black text-white">Upload Top 3 Employee Photos</h3>
                </div>
                <button
                  onClick={() => setShowPhotoManager(false)}
                  className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Performers List */}
              <div className="flex-1 overflow-y-auto space-y-2 py-3 custom-scrollbar pr-1">
                {allPerformers.map(p => (
                  <div 
                    key={p.name} 
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-900 border border-white/20 shrink-0 flex items-center justify-center relative">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-xs text-white">
                            {p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-[#2DD4BF] font-mono">#{p.rank}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {p.teamLabel} • {p.score} pts
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerUploadFor(p.name, p.team)}
                      disabled={uploadingAgent === p.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A991] hover:bg-[#00927d] text-white text-[11px] font-bold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {uploadingAgent === p.name ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>{p.photoUrl ? "Change" : "Upload"}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowPhotoManager(false)}
                  className="px-4 py-2 bg-[#00A991] hover:bg-[#00927d] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Done & Return to Video
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Playback & Export Controls Bar */}
        <div className="px-4 py-3 bg-[#08221B] border-t border-emerald-500/20 flex flex-col gap-2.5 z-20">
          
          {/* Segmented Timeline Progress */}
          <div className="flex items-center gap-1 w-full">
            {slides.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlideIdx 
                    ? "bg-white shadow-xs shadow-white" 
                    : idx < currentSlideIdx 
                    ? "bg-[#00A991]" 
                    : "bg-white/15"
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Left Controls: Previous, Play/Pause, Next, Replay */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToSlide((currentSlideIdx - 1 + slides.length) % slides.length)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition cursor-pointer"
                title="Previous Slide"
              >
                <SkipBack size={13} />
              </button>

              <button
                onClick={() => setIsPlaying(p => !p)}
                className="w-9 h-9 rounded-xl bg-[#00A991] hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer shadow-md shadow-emerald-500/20"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>

              <button
                onClick={() => goToSlide((currentSlideIdx + 1) % slides.length)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition cursor-pointer"
                title="Next Slide"
              >
                <SkipForward size={13} />
              </button>

              <button
                onClick={() => {
                  goToSlide(0);
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {});
                  }
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer ml-1"
                title="Replay from Beginning"
              >
                <RotateCcw size={13} />
              </button>

              <span className="text-[11px] font-bold text-gray-400 ml-1.5 font-mono">
                {currentSlideIdx + 1}/{slides.length}
              </span>
            </div>

            {/* Right Actions: Save Image & Download Video */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
                title="Save current slide as high-resolution PNG image"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Save Frame</span>
              </button>

              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A991] hover:bg-[#00927d] text-white font-black text-xs transition cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
                title="Download complete video with music"
              >
                {isExporting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Exporting ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Film size={13} />
                    <span>Download Video</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
                title="Share link"
              >
                {copiedLink ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
