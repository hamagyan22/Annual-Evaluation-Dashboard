"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  X, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, 
  Download, Sparkles, Trophy, Medal, Award, Star, MessageSquare, PhoneCall, 
  Film, Maximize2, Minimize2, CheckCircle2, Share2, Layers, RefreshCw
} from "lucide-react";
import { getTopStarMotivationalQuote, normalizeName } from "@/lib/topStarUtils";

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

type DepartmentFilter = "both" | "chat" | "call";
type AspectRatio = "16:9" | "9:16";

interface VideoScene {
  id: string;
  type: "intro" | "dept_intro" | "performer" | "outro";
  department?: "chat" | "call";
  deptLabel?: string;
  performer?: Performer;
  photoUrl?: string;
  rank?: number;
  title: string;
  subtitle?: string;
  quote?: string;
  appreciation?: string;
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
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [deptFilter, setDeptFilter] = useState<DepartmentFilter>("both");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Helper to find member photo
  const getPhoto = useCallback((agentName: string) => {
    const cName = normalizeName(agentName);
    const member = allMembers.find(m => normalizeName(m.agent_name || m.name || "") === cName);
    return member?.photo_url || "";
  }, [allMembers]);

  // Construct scenes list based on department filter and data
  const scenes = useMemo<VideoScene[]>(() => {
    const list: VideoScene[] = [];
    const monthFull = selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase();

    // Scene 0: Grand Opener
    list.push({
      id: "intro",
      type: "intro",
      title: "TOP STAR EXCELLENCE AWARDS",
      subtitle: `${monthFull} ${selectedYear} • Official Recognition Ceremony`,
      quote: "Celebrating Exceptional Talent, Passion, and High-Impact Performance"
    });

    // Chat Team Scenes
    if (deptFilter === "both" || deptFilter === "chat") {
      list.push({
        id: "dept_chat_intro",
        type: "dept_intro",
        department: "chat",
        deptLabel: "Chat Operations Team",
        title: "Chat Operations Team",
        subtitle: "Mohammed Dlshad Team",
        quote: "Digital Support Champions Delivering Speed, Precision & Customer Delight"
      });

      // Show Rank 3, then Rank 2, then Rank 1 Champion
      const chatOrdered = [...top3Chat].sort((a, b) => b.rank - a.rank);
      chatOrdered.forEach(p => {
        const quote = getTopStarMotivationalQuote(p.rank, selectedMonth);
        const appreciation = p.rank === 1
          ? "Exemplary mastery, highest consistency, and relentless customer dedication. You lead the company by example!"
          : p.rank === 2
          ? "Outstanding precision, world-class agility, and continuous excellence. A phenomenal achievement!"
          : "Stellar determination, high-caliber craft, and reliable support. A proud podium finish!";

        list.push({
          id: `chat_rank_${p.rank}`,
          type: "performer",
          department: "chat",
          deptLabel: "Chat Operations Team",
          performer: p,
          rank: p.rank,
          photoUrl: getPhoto(p.name),
          title: p.name,
          subtitle: p.rank === 1 ? "Top Star Champion 🥇" : p.rank === 2 ? "1st Runner-Up 🥈" : "2nd Runner-Up 🥉",
          quote,
          appreciation
        });
      });
    }

    // Call Center Scenes
    if (deptFilter === "both" || deptFilter === "call") {
      list.push({
        id: "dept_call_intro",
        type: "dept_intro",
        department: "call",
        deptLabel: "Call Center Operations",
        title: "Call Center Operations Team",
        subtitle: "Inbound & Outbound Voice Support",
        quote: "Voice Excellence, Empathy & Outstanding Customer Service at Scale"
      });

      // Show Rank 3, then Rank 2, then Rank 1 Champion
      const callOrdered = [...top3Call].sort((a, b) => b.rank - a.rank);
      callOrdered.forEach(p => {
        const quote = getTopStarMotivationalQuote(p.rank, selectedMonth);
        const appreciation = p.rank === 1
          ? "World-class voice leadership, unparalleled quality, and genuine empathy. Setting the benchmark for the entire team!"
          : p.rank === 2
          ? "Spectacular momentum, top-tier efficiency, and steadfast customer commitment. An inspiring runner-up finish!"
          : "Passionate execution, commendable patience, and true organizational value. Proudly holding the podium!";

        list.push({
          id: `call_rank_${p.rank}`,
          type: "performer",
          department: "call",
          deptLabel: "Call Center Operations",
          performer: p,
          rank: p.rank,
          photoUrl: getPhoto(p.name),
          title: p.name,
          subtitle: p.rank === 1 ? "Top Star Champion 🥇" : p.rank === 2 ? "1st Runner-Up 🥈" : "2nd Runner-Up 🥉",
          quote,
          appreciation
        });
      });
    }

    // Closing Scene
    list.push({
      id: "outro",
      type: "outro",
      title: "THANK YOU FOR YOUR DEDICATION",
      subtitle: "Customer Experience & Service Operations",
      quote: "Together, every interaction builds trust, excellence, and shared success!"
    });

    return list;
  }, [selectedMonth, selectedYear, top3Chat, top3Call, deptFilter, getPhoto]);

  // Audio Fanfare Synth using Web Audio API
  const playSoundEffect = useCallback((type: "champ" | "podium" | "transition") => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "champ") {
        // Grand fanfare arpeggio (C5 - E5 - G5 - C6)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(783.99, now + 0.24);
        osc.frequency.setValueAtTime(1046.50, now + 0.36);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (type === "podium") {
        // Cheerful chime (E5 - A5)
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880.00, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        // Soft click / whoosh
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio autoplay policy or unavailable
    }
  }, [isMuted]);

  // Handle scene advance & audio triggers
  useEffect(() => {
    if (!isOpen) return;
    const scene = scenes[currentSceneIdx];
    if (scene) {
      if (scene.type === "performer" && scene.rank === 1) {
        playSoundEffect("champ");
      } else if (scene.type === "performer") {
        playSoundEffect("podium");
      } else {
        playSoundEffect("transition");
      }
    }
  }, [currentSceneIdx, isOpen, scenes, playSoundEffect]);

  // Auto-play timer (4.5s per scene)
  useEffect(() => {
    if (!isOpen || !isPlaying || isExporting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentSceneIdx(prev => (prev + 1) % scenes.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, scenes.length, isExporting]);

  // Reset scene on filter change or open
  useEffect(() => {
    if (isOpen) {
      setCurrentSceneIdx(0);
      setIsPlaying(true);
    }
  }, [isOpen, deptFilter]);

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
        setCurrentSceneIdx(prev => (prev + 1) % scenes.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSceneIdx(prev => (prev - 1 + scenes.length) % scenes.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, scenes.length]);

  const activeScene = scenes[currentSceneIdx] || scenes[0];

  // Helper for rendering high-res canvas frame for video export & snapshot
  const drawSceneToCanvas = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, scene: VideoScene) => {
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#061A14");
    bgGrad.addColorStop(0.5, "#0E382B");
    bgGrad.addColorStop(1, "#051610");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative ambient circles
    ctx.save();
    ctx.fillStyle = "rgba(0, 169, 145, 0.15)";
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.2, width * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.8, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Top Header Badge
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Header Pill
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    const pillW = width * 0.45;
    const pillH = height * 0.05;
    const pillX = width / 2 - pillW / 2;
    const pillY = height * 0.06;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();

    ctx.fillStyle = "#F59E0B";
    ctx.font = `bold ${Math.round(height * 0.022)}px system-ui, sans-serif`;
    ctx.fillText(`★ TOP STAR • ${selectedMonth.toUpperCase()} ${selectedYear} ★`, width / 2, pillY + pillH / 2);

    if (scene.type === "intro") {
      // Grand Opener
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${Math.round(height * 0.065)}px system-ui, sans-serif`;
      ctx.fillText("TOP STAR EXCELLENCE AWARDS", width / 2, height * 0.35);

      ctx.fillStyle = "#A7F3D0";
      ctx.font = `bold ${Math.round(height * 0.032)}px system-ui, sans-serif`;
      ctx.fillText(scene.subtitle || "", width / 2, height * 0.45);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = `italic 500 ${Math.round(height * 0.026)}px system-ui, sans-serif`;
      ctx.fillText(`"${scene.quote || ""}"`, width / 2, height * 0.58);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = `bold ${Math.round(height * 0.02)}px system-ui, sans-serif`;
      ctx.fillText("Customer Experience Operations • First Iraqi Bank", width / 2, height * 0.8);
    } else if (scene.type === "dept_intro") {
      // Department Intro
      ctx.fillStyle = "#F59E0B";
      ctx.font = `bold ${Math.round(height * 0.028)}px system-ui, sans-serif`;
      ctx.fillText(scene.subtitle || "", width / 2, height * 0.33);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${Math.round(height * 0.06)}px system-ui, sans-serif`;
      ctx.fillText(scene.title, width / 2, height * 0.44);

      ctx.fillStyle = "#D1FAE5";
      ctx.font = `italic 500 ${Math.round(height * 0.028)}px system-ui, sans-serif`;
      ctx.fillText(`"${scene.quote || ""}"`, width / 2, height * 0.58);
    } else if (scene.type === "performer" && scene.performer) {
      // Performer Showcase Card
      const p = scene.performer;
      const rank = scene.rank || 1;
      const rankColor = rank === 1 ? "#F59E0B" : rank === 2 ? "#CBD5E1" : "#D97706";
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

      // Department tag
      ctx.fillStyle = "#A7F3D0";
      ctx.font = `bold ${Math.round(height * 0.022)}px system-ui, sans-serif`;
      ctx.fillText(scene.deptLabel || "", width / 2, height * 0.16);

      // Rank Medal & Label
      ctx.fillStyle = rankColor;
      ctx.font = `bold ${Math.round(height * 0.038)}px system-ui, sans-serif`;
      ctx.fillText(`${medal} ${scene.subtitle}`, width / 2, height * 0.23);

      // Avatar circle representation
      const avatarR = height * 0.11;
      const avatarY = height * 0.4;
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fillStyle = rank === 1 ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.15)";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = rankColor;
      ctx.stroke();

      // Initials inside circle
      const initials = p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${Math.round(avatarR * 0.8)}px system-ui, sans-serif`;
      ctx.fillText(initials, width / 2, avatarY + 4);
      ctx.restore();

      // Performer Name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${Math.round(height * 0.048)}px system-ui, sans-serif`;
      ctx.fillText(p.name, width / 2, height * 0.58);

      // Score Pill
      ctx.fillStyle = "rgba(0, 169, 145, 0.35)";
      const scoreW = width * 0.24;
      const scoreH = height * 0.055;
      ctx.beginPath();
      ctx.roundRect(width / 2 - scoreW / 2, height * 0.63 - scoreH / 2, scoreW, scoreH, 12);
      ctx.fill();
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#6EE7B7";
      ctx.font = `900 ${Math.round(height * 0.026)}px system-ui, sans-serif`;
      ctx.fillText(`SCORE: ${p.score} PTS`, width / 2, height * 0.63);

      // Motivational Quote
      if (scene.quote) {
        ctx.fillStyle = "#FDE68A";
        ctx.font = `italic bold ${Math.round(height * 0.024)}px system-ui, sans-serif`;
        ctx.fillText(`"${scene.quote}"`, width / 2, height * 0.73);
      }

      // Appreciation Note
      if (scene.appreciation) {
        ctx.fillStyle = "#E2E8F0";
        ctx.font = `500 ${Math.round(height * 0.02)}px system-ui, sans-serif`;
        ctx.fillText(scene.appreciation, width / 2, height * 0.82);
      }
    } else if (scene.type === "outro") {
      // Outro
      ctx.fillStyle = "#F59E0B";
      ctx.font = `bold ${Math.round(height * 0.03)}px system-ui, sans-serif`;
      ctx.fillText(scene.subtitle || "", width / 2, height * 0.33);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${Math.round(height * 0.06)}px system-ui, sans-serif`;
      ctx.fillText(scene.title, width / 2, height * 0.44);

      ctx.fillStyle = "#D1FAE5";
      ctx.font = `italic 500 ${Math.round(height * 0.028)}px system-ui, sans-serif`;
      ctx.fillText(`"${scene.quote || ""}"`, width / 2, height * 0.58);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = `bold ${Math.round(height * 0.022)}px system-ui, sans-serif`;
      ctx.fillText("Customer Experience Leadership • First Iraqi Bank", width / 2, height * 0.8);
    }

    ctx.restore();
  }, [selectedMonth, selectedYear]);

  // Video Export Recorder using Canvas + MediaRecorder
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setIsPlaying(false);
    setExportProgress(0);

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      alert("Canvas 2D context not available");
      setIsExporting(false);
      return;
    }

    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_000_000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TopStar_Celebration_${selectedMonth}_${selectedYear}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      recorder.start();

      // Render each scene sequentially
      const totalScenes = scenes.length;
      for (let i = 0; i < totalScenes; i++) {
        const sc = scenes[i];
        drawSceneToCanvas(ctx, 1280, 720, sc);
        setExportProgress(Math.round(((i + 1) / totalScenes) * 100));
        // Hold frame for 2.2 seconds during export
        await new Promise(r => setTimeout(r, 2200));
      }

      recorder.stop();
    } catch (err: any) {
      console.error("Video recording failed:", err);
      alert("Failed to export video: " + err.message);
      setIsExporting(false);
    }
  };

  // Download Current Slide as High-Res PNG Image
  const handleDownloadSnapshot = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSceneToCanvas(ctx, 1920, 1080, activeScene);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `TopStar_${activeScene.id}_${selectedMonth}_${selectedYear}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Top Star Celebration - ${selectedMonth} ${selectedYear}`,
        text: `Celebrating our Top Star Winners for ${selectedMonth} ${selectedYear}!`,
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Main Video Studio Card */}
      <div className={`relative bg-gradient-to-br from-[#061e17] via-[#092920] to-[#04120e] text-white border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh] w-full ${
        aspectRatio === "9:16" ? "max-w-md h-[92vh]" : "max-w-4xl"
      }`}>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Film size={15} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Top Star Celebration Reel</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {selectedMonth.slice(0, 3)} {selectedYear}
                </span>
              </h2>
            </div>
          </div>

          {/* Department Filter Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-md">
            <button
              onClick={() => setDeptFilter("both")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                deptFilter === "both" ? "bg-[#00A991] text-white shadow-xs" : "text-white/70 hover:text-white"
              }`}
            >
              All Teams
            </button>
            <button
              onClick={() => setDeptFilter("chat")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                deptFilter === "chat" ? "bg-[#00A991] text-white shadow-xs" : "text-white/70 hover:text-white"
              }`}
            >
              Chat Team
            </button>
            <button
              onClick={() => setDeptFilter("call")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                deptFilter === "call" ? "bg-[#00A991] text-white shadow-xs" : "text-white/70 hover:text-white"
              }`}
            >
              Call Center
            </button>
          </div>

          {/* Right Actions: Sound, Aspect Ratio, Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(m => !m)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                isMuted ? "bg-white/10 text-white/50" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={() => setAspectRatio(r => r === "16:9" ? "9:16" : "16:9")}
              className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-[11px] font-bold transition cursor-pointer"
              title="Toggle Aspect Ratio (16:9 Widescreen vs 9:16 Story Reel)"
            >
              {aspectRatio}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Close Celebration Studio"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video Stage / Cinematic Screen */}
        <div className={`relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8 select-none ${
          aspectRatio === "9:16" ? "min-h-[500px]" : "min-h-[400px] sm:min-h-[460px]"
        }`}>
          
          {/* Shimmering particle stars in background */}
          <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
            <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            <div className="absolute top-1/3 right-12 w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>

          {/* Scene 1: Grand Opener */}
          {activeScene.type === "intro" && (
            <div className="flex flex-col items-center text-center max-w-xl animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-gray-950 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl shadow-amber-500/30 ring-4 ring-amber-300/40 mb-5 animate-bounce" style={{ animationDuration: '2.5s' }}>
                🏆
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-3 backdrop-blur-md">
                <Sparkles size={12} className="text-amber-400" />
                <span>First Iraqi Bank • Recognition Ceremony</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-md">
                TOP STAR EXCELLENCE AWARDS
              </h1>

              <p className="text-sm sm:text-base text-emerald-100 font-bold mb-4">
                {activeScene.subtitle}
              </p>

              <blockquote className="text-xs sm:text-sm text-gray-300 italic max-w-md bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
                "{activeScene.quote}"
              </blockquote>
            </div>
          )}

          {/* Scene 2: Department Intro */}
          {activeScene.type === "dept_intro" && (
            <div className="flex flex-col items-center text-center max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl mb-5 ${
                activeScene.department === "chat" 
                  ? "bg-gradient-to-tr from-[#1C6B53] to-emerald-400 text-white ring-4 ring-emerald-400/40" 
                  : "bg-gradient-to-tr from-[#00A991] to-teal-400 text-white ring-4 ring-teal-400/40"
              }`}>
                {activeScene.department === "chat" ? <MessageSquare size={36} /> : <PhoneCall size={36} />}
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
                Department Showcase
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                {activeScene.title}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-200/90 font-bold mb-4">
                {activeScene.subtitle}
              </p>

              <blockquote className="text-xs sm:text-sm text-gray-200 italic max-w-md bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
                "{activeScene.quote}"
              </blockquote>
            </div>
          )}

          {/* Scene 3: Performer Showcase */}
          {activeScene.type === "performer" && activeScene.performer && (
            <div className="flex flex-col items-center text-center max-w-xl animate-in zoom-in-95 duration-500">
              
              {/* Department Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-bold tracking-wider uppercase mb-3 backdrop-blur-md">
                {activeScene.department === "chat" ? <MessageSquare size={12} /> : <PhoneCall size={12} />}
                <span>{activeScene.deptLabel}</span>
              </div>

              {/* Avatar with Medal Ring */}
              <div className="relative mb-3 group">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 shadow-2xl flex items-center justify-center ${
                  activeScene.rank === 1
                    ? "bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 ring-4 ring-amber-400/50 shadow-amber-500/30"
                    : activeScene.rank === 2
                    ? "bg-gradient-to-tr from-slate-200 via-gray-100 to-slate-400 ring-4 ring-slate-300/40 shadow-slate-500/20"
                    : "bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 ring-4 ring-amber-600/40 shadow-amber-700/20"
                }`}>
                  <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden flex items-center justify-center text-2xl font-black text-white relative">
                    {activeScene.photoUrl ? (
                      <img src={activeScene.photoUrl} alt={activeScene.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-2xl tracking-tighter">
                        {activeScene.title.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Floating Rank Medal Badge */}
                <div className={`absolute -bottom-2 -right-1 w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-lg ring-2 ring-white/50 ${
                  activeScene.rank === 1 ? "bg-amber-400 text-gray-950" : activeScene.rank === 2 ? "bg-slate-200 text-gray-950" : "bg-amber-700 text-white"
                }`}>
                  {activeScene.rank === 1 ? "🥇" : activeScene.rank === 2 ? "🥈" : "🥉"}
                </div>
              </div>

              {/* Subtitle / Rank Name */}
              <div className={`text-xs font-black uppercase tracking-wider mb-1 ${
                activeScene.rank === 1 ? "text-amber-400" : activeScene.rank === 2 ? "text-slate-300" : "text-amber-500"
              }`}>
                {activeScene.subtitle}
              </div>

              {/* Performer Name */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                {activeScene.title}
              </h1>

              {/* Score Chip */}
              <div className="inline-flex items-baseline gap-1 px-3 py-1 rounded-xl bg-white/10 border border-emerald-400/30 text-emerald-300 font-mono font-bold text-sm mb-3">
                <span className="text-white text-base font-black">{activeScene.performer.score}</span>
                <span className="text-[10px] uppercase font-sans tracking-wider opacity-75">pts</span>
              </div>

              {/* Motivational Quote */}
              {activeScene.quote && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-200 italic mb-2 max-w-md bg-amber-500/10 border border-amber-400/20 px-3.5 py-2 rounded-xl">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span>"{activeScene.quote}"</span>
                </div>
              )}

              {/* Appreciation Note */}
              {activeScene.appreciation && (
                <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                  {activeScene.appreciation}
                </p>
              )}
            </div>
          )}

          {/* Scene 4: Outro */}
          {activeScene.type === "outro" && (
            <div className="flex flex-col items-center text-center max-w-xl animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-400/30 mb-5">
                🌟
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-3">
                <span>Together We Excel</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                THANK YOU FOR YOUR DEDICATION
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 mb-4 max-w-md">
                Every conversation, call, and customer interaction elevates our quality and builds long-lasting trust. Congratulations to all our stars!
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setCurrentSceneIdx(0)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/15"
                >
                  <RotateCcw size={14} />
                  <span>Replay Reel</span>
                </button>
                <button
                  onClick={handleExportVideo}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download size={14} />
                  <span>Download Video</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Timeline & Controls Bar */}
        <div className="relative z-20 px-4 sm:px-6 py-3 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col gap-2.5">
          
          {/* Progress Bar with Scene Segments */}
          <div className="flex items-center gap-1 w-full">
            {scenes.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => setCurrentSceneIdx(idx)}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSceneIdx 
                    ? "bg-amber-400 shadow-xs shadow-amber-400" 
                    : idx < currentSceneIdx 
                    ? "bg-emerald-400/70" 
                    : "bg-white/20"
                }`}
                title={`Scene ${idx + 1}: ${sc.title}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Left: Previous / Play / Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSceneIdx(prev => (prev - 1 + scenes.length) % scenes.length)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                title="Previous Scene (Left Arrow)"
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={() => setIsPlaying(p => !p)}
                className="w-9 h-9 rounded-xl bg-[#00A991] hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer shadow-md shadow-emerald-500/20"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentSceneIdx(prev => (prev + 1) % scenes.length)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                title="Next Scene (Right Arrow)"
              >
                <SkipForward size={14} />
              </button>

              <span className="text-[11px] font-bold text-gray-400 ml-1">
                {currentSceneIdx + 1} / {scenes.length}
              </span>
            </div>

            {/* Right: Export & Download Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                title="Download this slide as high-resolution PNG image"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Save Image</span>
              </button>

              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-xs transition cursor-pointer shadow-md shadow-amber-500/25 disabled:opacity-50"
                title="Export entire celebration as .webm video file"
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
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
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
