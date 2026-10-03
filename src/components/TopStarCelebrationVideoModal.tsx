"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  X, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, 
  Download, Sparkles, Film, CheckCircle2, Share2, RefreshCw, Music
} from "lucide-react";
import { normalizeName } from "@/lib/topStarUtils";

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
  durationMs: number;
}

export default function TopStarCelebrationVideoModal({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  top3Chat,
  top3Call,
  allMembers = []
}: TopStarCelebrationVideoModalProps) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to find member photo
  const getPhoto = useCallback((agentName: string) => {
    const cName = normalizeName(agentName);
    const member = allMembers.find(m => normalizeName(m.agent_name || m.name || "") === cName);
    return member?.photo_url || "";
  }, [allMembers]);

  // Construct slides exactly following the user's reference video
  const slides = useMemo<SlideItem[]>(() => {
    const list: SlideItem[] = [];
    const monthUpper = selectedMonth.toUpperCase();

    // Slide 1: Main Intro
    list.push({
      id: "intro",
      type: "intro",
      title: "CONTACT CENTER",
      subtitle: `TOP STARS\n(${monthUpper})`,
      durationMs: 3400
    });

    // Chat Team Section
    if (top3Chat && top3Chat.length > 0) {
      // Slide 2: Chat Team Intro
      list.push({
        id: "chat_title",
        type: "team_title",
        team: "chat",
        title: "TOP 3 ON",
        subtitle: "CHAT TEAM",
        durationMs: 2600
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
          durationMs: 3600
        });
      });
    }

    // Call Team Section
    if (top3Call && top3Call.length > 0) {
      // Slide: Call Team Intro
      list.push({
        id: "call_title",
        type: "team_title",
        team: "call",
        title: "TOP 3 ON",
        subtitle: "CALL TEAM",
        durationMs: 2600
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
          durationMs: 3600
        });
      });
    }

    // Final Slide: Thank You
    list.push({
      id: "outro",
      type: "outro",
      title: "THANK YOU",
      subtitle: "FOR YOUR EFFORTS",
      durationMs: 3600
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
        audio.play().catch(() => {
          // Autoplay policy prevented immediate play without interaction
        });
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
      }, 350);
    }, 250);
  }, []);

  // Slide Advance Timer
  useEffect(() => {
    if (!isOpen || !isPlaying || isExporting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const duration = activeSlide?.durationMs || 3500;
    timerRef.current = setTimeout(() => {
      const nextIdx = (currentSlideIdx + 1) % slides.length;
      goToSlide(nextIdx);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPlaying, currentSlideIdx, slides.length, activeSlide, isExporting, goToSlide]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIdx(0);
      setIsPlaying(true);
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
      if (e.key === " ") {
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
  }, [isOpen, onClose, currentSlideIdx, slides.length, goToSlide]);

  // Canvas drawing function for high-res video export & frame snapshot (1080x1080 square format)
  const drawSlideToCanvas = useCallback((ctx: CanvasRenderingContext2D, size: number, slide: SlideItem) => {
    ctx.clearRect(0, 0, size, size);

    if (slide.type === "intro" || slide.type === "team_title" || slide.type === "outro") {
      // 1. Blue Silk Waves Background
      const grad = ctx.createRadialGradient(size * 0.5, size * 0.35, size * 0.1, size * 0.5, size * 0.5, size * 0.7);
      grad.addColorStop(0, "#0E3E6E");
      grad.addColorStop(0.5, "#062241");
      grad.addColorStop(1, "#021124");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Silk highlight wave curve
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, size * 0.6);
      ctx.bezierCurveTo(size * 0.3, size * 0.45, size * 0.7, size * 0.75, size, size * 0.55);
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.fillStyle = "rgba(16, 75, 138, 0.25)";
      ctx.fill();
      ctx.restore();

      // Top Logo: B FIB
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // FIB Glyph icon representation
      const logoY = size * 0.36;
      ctx.fillStyle = "#00D6B2";
      ctx.font = `900 ${Math.round(size * 0.045)}px 'Orbitron', system-ui, sans-serif`;
      ctx.fillText("B", size * 0.45, logoY);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(size * 0.04)}px 'Orbitron', system-ui, sans-serif`;
      ctx.fillText("FIB", size * 0.53, logoY);

      // Centered Glowing Neon Cyan Text
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${Math.round(size * 0.055)}px 'Orbitron', system-ui, sans-serif`;

      if (slide.type === "intro") {
        ctx.fillText("CONTACT CENTER", size * 0.5, size * 0.49);
        ctx.fillText("TOP STARS", size * 0.5, size * 0.56);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = `bold ${Math.round(size * 0.032)}px 'Orbitron', system-ui, sans-serif`;
        ctx.fillText(`(${selectedMonth.toUpperCase()})`, size * 0.5, size * 0.63);
      } else if (slide.type === "team_title") {
        ctx.fillText(slide.title || "TOP 3 ON", size * 0.5, size * 0.49);
        ctx.fillText(slide.subtitle || "", size * 0.5, size * 0.57);
      } else if (slide.type === "outro") {
        ctx.fillText("THANK YOU", size * 0.5, size * 0.49);
        ctx.fillText("FOR YOUR EFFORTS", size * 0.5, size * 0.57);
      }
      ctx.restore();

    } else if (slide.type === "performer") {
      // 2. Mint Seafoam Green Background
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#85E9DD");
      grad.addColorStop(0.5, "#68D8CB");
      grad.addColorStop(1, "#54C8BA");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Top Right FIB Logo Pill
      ctx.save();
      const pillW = size * 0.11;
      const pillH = size * 0.06;
      const pillX = size * 0.84;
      const pillY = size * 0.05;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 12);
      ctx.fill();

      ctx.fillStyle = "#00A991";
      ctx.font = `900 ${Math.round(size * 0.038)}px 'Orbitron', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("B", pillX + pillW / 2, pillY + pillH / 2);
      ctx.restore();

      // Portrait Center Area (3:4 ratio)
      const photoW = size * 0.46;
      const photoH = size * 0.56;
      const photoX = (size - photoW) / 2;
      const photoY = size * 0.17;

      // Draw portrait background card
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);

      ctx.fillStyle = "#1E3A34";
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // Placeholder initials or monogram
      const initials = (slide.name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = `900 ${Math.round(size * 0.12)}px 'Orbitron', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials, size * 0.5, photoY + photoH * 0.5);
      ctx.restore();

      // Bottom Info Bar
      ctx.save();
      ctx.textBaseline = "alphabetic";

      // Left: Agent Name with 4-Point Star
      ctx.fillStyle = "#093930";
      ctx.font = `900 ${Math.round(size * 0.042)}px 'Orbitron', system-ui, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(`${(slide.name || "").toUpperCase()} ✦`, size * 0.08, size * 0.86);

      // Rank Subtitle: #1 at Chat Team
      ctx.fillStyle = "rgba(9, 57, 48, 0.85)";
      ctx.font = `bold ${Math.round(size * 0.028)}px 'Rajdhani', system-ui, sans-serif`;
      ctx.fillText(`#${slide.rank} at ${slide.teamLabel}`, size * 0.08, size * 0.91);

      // Right: Huge Athletic Score
      ctx.fillStyle = "#093930";
      ctx.font = `900 ${Math.round(size * 0.13)}px 'Orbitron', system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(`${slide.score}`, size * 0.92, size * 0.91);
      ctx.restore();
    }
  }, [selectedMonth]);

  // Video Export Recorder: captures canvas stream + audio into genuine downloadable .webm video
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
        } catch (e) {
          // Audio routing or already connected
        }
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
        a.download = `TopStars_${selectedMonth}_${selectedYear}.webm`;
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
        // Hold frame according to slide duration
        await new Promise(r => setTimeout(r, sc.durationMs || 3200));
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
        text: `Watch the Top Stars celebration video for ${selectedMonth} ${selectedYear}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Background Audio Player with official music track */}
      <audio
        ref={audioRef}
        src="/audio/top_stars_theme.mp4"
        preload="auto"
        loop
        onCanPlay={() => setAudioLoaded(true)}
      />

      {/* Main Video Modal Frame */}
      <div className="relative bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-w-lg w-full">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/90 border-b border-gray-800 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#00A991] text-white flex items-center justify-center font-black shadow-xs">
              <Film size={14} />
            </div>
            <div>
              <h2 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Top Stars Video</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                  {selectedMonth} {selectedYear}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Wave / Mute Toggle */}
            <button
              onClick={() => setIsMuted(m => !m)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                isMuted 
                  ? "bg-gray-800 text-gray-400" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
              title={isMuted ? "Unmute Music" : "Mute Music"}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span className="text-[11px] hidden sm:inline">{isMuted ? "Muted" : "Music On"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage: 1:1 Aspect Ratio (Square Instagram / WhatsApp Video) */}
        <div className="relative w-full aspect-square bg-black overflow-hidden select-none flex items-center justify-center">

          {/* Cyan Wipe Transition Overlay */}
          <div 
            className={`absolute inset-0 z-40 bg-[#42DDD0] pointer-events-none transition-transform duration-300 ease-in-out ${
              isTransitioning ? "translate-x-0" : "-translate-x-full"
            }`}
          />

          {/* 1. Intro Slide */}
          {activeSlide.type === "intro" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(ellipse_at_top,_#0E3E6E_0%,_#062241_50%,_#021124_100%)] overflow-hidden">
              {/* Subtle wavy silk overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* FIB Brand Logo */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#00D6B2] text-gray-950 flex items-center justify-center font-black text-xl shadow-md">
                  B
                </div>
                <span className="font-['Orbitron',sans-serif] font-black text-xl text-white tracking-widest">
                  FIB
                </span>
              </div>

              {/* Glowing Neon Cyan Title */}
              <h1 className="font-['Orbitron',sans-serif] font-black text-2xl sm:text-3xl text-white tracking-wider leading-tight drop-shadow-[0_0_20px_rgba(0,229,255,0.7)] drop-shadow-[0_0_40px_rgba(0,229,255,0.4)] mb-2">
                CONTACT CENTER<br />TOP STARS
              </h1>

              {/* Month Pill */}
              <div className="mt-3 font-['Orbitron',sans-serif] font-bold text-sm sm:text-base text-white/80 tracking-wider">
                ({selectedMonth.toUpperCase()})
              </div>
            </div>
          )}

          {/* 2. Team Title Slide */}
          {activeSlide.type === "team_title" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(ellipse_at_top,_#0E3E6E_0%,_#062241_50%,_#021124_100%)] overflow-hidden">
              {/* FIB Brand Logo */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#00D6B2] text-gray-950 flex items-center justify-center font-black text-xl shadow-md">
                  B
                </div>
                <span className="font-['Orbitron',sans-serif] font-black text-xl text-white tracking-widest">
                  FIB
                </span>
              </div>

              {/* Glowing Neon Cyan Team Title */}
              <h1 className="font-['Orbitron',sans-serif] font-black text-2xl sm:text-3xl text-white tracking-wider leading-tight drop-shadow-[0_0_20px_rgba(0,229,255,0.7)] drop-shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                {activeSlide.title}<br />{activeSlide.subtitle}
              </h1>
            </div>
          )}

          {/* 3. Performer Slide (The Signature Mint Card Style) */}
          {activeSlide.type === "performer" && (
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-[#85E9DD] via-[#68D8CB] to-[#54C8BA] overflow-hidden">
              
              {/* Top Right FIB Logo Badge */}
              <div className="flex justify-end w-full">
                <div className="w-9 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center">
                  <span className="font-['Orbitron',sans-serif] font-black text-[#00A991] text-base leading-none">
                    B
                  </span>
                </div>
              </div>

              {/* Center Portrait Area with Blurred Silhouette in Background */}
              <div className="relative flex-1 flex items-center justify-center my-2">
                {/* Background Silhouette (Enlarged, Faded Portrait) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 mix-blend-multiply scale-125 filter grayscale contrast-125">
                  {activeSlide.photoUrl ? (
                    <img 
                      src={activeSlide.photoUrl} 
                      alt="" 
                      className="w-full h-full object-cover max-w-[280px] max-h-[360px]" 
                    />
                  ) : (
                    <div className="w-48 h-64 bg-teal-900 rounded-sm" />
                  )}
                </div>

                {/* Foreground Framed Portrait */}
                <div className="relative z-10 w-[46%] aspect-[3/4] max-w-[230px] rounded-none sm:rounded-sm overflow-hidden border-4 border-white/90 shadow-2xl bg-white/20">
                  {activeSlide.photoUrl ? (
                    <img 
                      src={activeSlide.photoUrl} 
                      alt={activeSlide.name || ""} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#18463E] flex items-center justify-center text-white font-['Orbitron',sans-serif] font-black text-3xl">
                      {(activeSlide.name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Info Bar: Name + Rank on Left, Huge Score on Right */}
              <div className="flex items-end justify-between w-full pt-2">
                {/* Left: Agent Name with Star & Rank */}
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 font-['Orbitron',sans-serif] font-black text-lg sm:text-xl md:text-2xl text-[#093930] tracking-wide leading-tight truncate">
                    <span className="truncate">{(activeSlide.name || "").toUpperCase()}</span>
                    <span className="text-[#093930] text-sm shrink-0">✦</span>
                  </div>
                  <span className="font-['Rajdhani',sans-serif] font-bold text-xs sm:text-sm text-[#093930]/85 tracking-wider mt-0.5">
                    #{activeSlide.rank} at {activeSlide.teamLabel}
                  </span>
                </div>

                {/* Right: Huge Bold Score */}
                <div className="shrink-0 text-right">
                  <span className="font-['Orbitron',sans-serif] font-black text-4xl sm:text-5xl md:text-6xl text-[#093930] tracking-tighter leading-none">
                    {activeSlide.score}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Outro Slide */}
          {activeSlide.type === "outro" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(ellipse_at_top,_#0E3E6E_0%,_#062241_50%,_#021124_100%)] overflow-hidden">
              {/* FIB Brand Logo */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#00D6B2] text-gray-950 flex items-center justify-center font-black text-xl shadow-md">
                  B
                </div>
                <span className="font-['Orbitron',sans-serif] font-black text-xl text-white tracking-widest">
                  FIB
                </span>
              </div>

              {/* Glowing Neon Cyan Outro */}
              <h1 className="font-['Orbitron',sans-serif] font-black text-2xl sm:text-3xl text-white tracking-wider leading-tight drop-shadow-[0_0_20px_rgba(0,229,255,0.7)] drop-shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                THANK YOU<br />FOR YOUR EFFORTS
              </h1>
            </div>
          )}
        </div>

        {/* Bottom Playback & Export Controls */}
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-800 flex flex-col gap-2.5 z-20">
          
          {/* Segmented Timeline Progress */}
          <div className="flex items-center gap-1 w-full">
            {slides.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlideIdx 
                    ? "bg-[#00D6B2] shadow-xs shadow-[#00D6B2]" 
                    : idx < currentSlideIdx 
                    ? "bg-[#00A991]/70" 
                    : "bg-gray-800"
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
                className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition cursor-pointer"
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
                className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition cursor-pointer"
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
                className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer ml-1"
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition cursor-pointer"
                title="Save current slide as high-resolution PNG image"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Save Slide</span>
              </button>

              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00D6B2] to-[#00A991] hover:from-[#00e3bd] hover:to-emerald-500 text-gray-950 font-black text-xs transition cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
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
                className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
                title="Share link"
              >
                {copiedLink ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
