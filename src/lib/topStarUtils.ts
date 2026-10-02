import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export const CANONICAL_NAMES: Record<string, string> = {
  // Chat Team
  "dhuha khanjer noori": "Dhuha Khanjer",
  "dhuha khanjer": "Dhuha Khanjer",
  "rasan ismail musa": "Rassan Ismail",
  "rasan ismail": "Rassan Ismail",
  "rassan ismail": "Rassan Ismail",
  "sawin sartib": "Sawen",
  "sawen sartib": "Sawen",
  "sawen": "Sawen",
  "soma muhammed": "Soma Sherko",
  "soma sherko": "Soma Sherko",
  "yousif rashid darwesh": "Yousif Rashid",
  "yousif rashid": "Yousif Rashid",
  "ahmed rustam": "Ahmed Rustam",
  "akar omer": "Akar Omer",
  "bana ahmed": "Bana Ahmed",
  "ismail ahmed": "Ismail Ahmed",
  "nawen maadh": "Nawen Maadh",
  "ossama saadi": "Ossama Saadi",
  "sana dler": "Sana Dler",
  "zahra yousif": "Zahra Yousif",

  // Call Team
  "shahab ahmed": "Shahab Ahmed",
  "shahab ahmed muhammed": "Shahab Ahmed",
  "zhalla sherzad": "Zhalla Sherzad",
  "zhala sherzad": "Zhalla Sherzad",
  "marwa khaleel": "Marwa Khaleel",
  "marwa khalil": "Marwa Khaleel",
  "haneen abd-al kareem": "Haneen Abd-Al Kareem",
  "haneen abdulkarim": "Haneen Abd-Al Kareem",
  "hannen iskandar": "Haneen Abd-Al Kareem",
  "azad muhammad abdullah": "Azad muhammad abdullah",
  "azad muhammad": "Azad muhammad abdullah",
  "alla satar": "Alla Satar",
  "alla sattar": "Alla Satar",
  "amar hussein salih": "Amar Hussein Salih",
  "amar hussein": "Amar Hussein Salih",
  "kazhvan wirya": "Kazhvan Wirya",
  "kani sami": "Kani Sami",
  "lana halmat rafeeq": "Lana Halmat Rafeeq",
  "lana halmat": "Lana Halmat Rafeeq",
  "laveen khaleel": "Laveen Khaleel",
  "mokhalad ali": "Mokhalad Ali",
  "muzhda omar ali": "Muzhda Omar Ali",
  "muzhda omar": "Muzhda Omar Ali",
  "rabar mohammed": "Rabar Mohammed",
  "saja bashar anwar": "Saja Bashar Anwar",
  "saja bashar": "Saja Bashar Anwar",
  "salam sadam muhammad": "Salam Sadam Muhammad",
  "salam sadam": "Salam Sadam Muhammad",
  "sarbaz namiq hasan": "Sarbaz Namiq Hasan",
  "sarbaz namiq": "Sarbaz Namiq Hasan",
  "taban sirwan": "Taban Sirwan",
  "zainab khalid rasheed": "Zainab Khalid Rasheed",
  "zainab khalid": "Zainab Khalid Rasheed",
  "zhalla salam": "Zhalla Salam",
  "frmesk younis": "Frmesk Younis",
  "haseeb adeeb": "Haseeb Adeeb",
  "hewr adnan": "Hewr Adnan",
  "aya yasin": "Aya Yasin",
  "ahmed jalil": "Ahmed Jalil"
};

export const DEFAULT_CHAT_AGENTS = [
  "Ahmed Rustam", "Akar Omer", "Bana Ahmed", "Dhuha Khanjer", "Ismail Ahmed",
  "Nawen Maadh", "Ossama Saadi", "Rassan Ismail", "Sana Dler", "Sawen",
  "Soma Sherko", "Yousif Rashid", "Zahra Yousif"
];

export const DEFAULT_CALL_AGENTS = [
  "Ahmed Jalil", "Alla Satar", "Amar Hussein Salih", "Aya Yasin", "Azad muhammad abdullah",
  "Frmesk Younis", "Haneen Abd-Al Kareem", "Haseeb Adeeb", "Hewr Adnan", "Kani Sami",
  "Kazhvan Wirya", "Lana Halmat Rafeeq", "Laveen Khaleel", "Marwa Khaleel", "Mokhalad Ali",
  "Muzhda Omar Ali", "Rabar Mohammed", "Saja Bashar Anwar", "Salam Sadam Muhammad",
  "Sarbaz Namiq Hasan", "Shahab Ahmed", "Taban Sirwan", "Zainab Khalid Rasheed",
  "Zhalla Sherzad", "Zhalla Salam"
];

export function normalizeName(name: string): string {
  if (!name) return "";
  const key = name.trim().toLowerCase();
  return CANONICAL_NAMES[key] || name.trim();
}

export const num = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const str = String(v).replace(/%/g, "").replace(/s$/i, "").replace(/,/g, "").trim();
  const n = parseFloat(str);
  return isFinite(n) && n > 0 ? n : null;
};

export const formatToMinutesAndSeconds = (val: string | number | null | undefined): string => {
  if (val == null) return "";
  const str = String(val).trim();
  if (!str) return "";

  if (str.includes(":")) {
    const rawParts = str.split(":").map(p => p.trim());
    if (rawParts.length >= 3) {
      // Discard hour representation (e.g. 00:01:54 -> 01:54, 01:05:20 -> 65:20)
      const h = parseInt(rawParts[0], 10) || 0;
      const m = parseInt(rawParts[1], 10) || 0;
      const s = parseInt(rawParts[2], 10) || 0;
      const totalMinutes = h * 60 + m;
      const validSecs = Math.min(59, Math.max(0, s));
      return `${String(totalMinutes).padStart(2, "0")}:${String(validSecs).padStart(2, "0")}`;
    } else if (rawParts.length === 2) {
      const m = parseInt(rawParts[0], 10) || 0;
      const s = parseInt(rawParts[1], 10) || 0;
      const validSecs = Math.min(59, Math.max(0, s));
      return `${String(m).padStart(2, "0")}:${String(validSecs).padStart(2, "0")}`;
    }
  }

  const numVal = parseFloat(str);
  if (!isNaN(numVal) && isFinite(numVal) && numVal >= 0) {
    const m = Math.floor(numVal / 60);
    const s = Math.round(numVal % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return str;
};

export const parseSec = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const str = String(v).trim();
  if (str.includes(":")) {
    const parts = str.split(":");
    if (parts.length >= 3) {
      const h = parseInt(parts[0]) || 0;
      const m = parseInt(parts[1]) || 0;
      const s = parseInt(parts[2]) || 0;
      const total = h * 3600 + m * 60 + s;
      return total > 0 ? total : null;
    }
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    const total = mins * 60 + secs;
    return total > 0 ? total : null;
  }
  return num(str);
};

export const formatDuration = (secs: number | string | null | undefined): string => {
  if (secs == null || secs === "") return "–";
  const total = typeof secs === "number" ? secs : parseSec(secs);
  if (total == null || isNaN(total)) return String(secs);
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const TOP_STAR_MOTIVATIONAL_QUOTES: Record<number, Record<string, string>> = {
  1: {
    JAN: "Pioneering the year at the absolute peak of excellence!",
    FEB: "Setting the gold standard with championship performance!",
    MAR: "Flawless leadership driving incredible results this March!",
    APR: "Springing forward with unparalleled dedication and victory!",
    MAY: "Leading from the front with mastery, focus, and passion!",
    JUN: "Mid-year champion inspiring the entire team to greatness!",
    JUL: "Radiating excellence and unstoppable championship energy!",
    AUG: "Perfection in execution and unwavering dedication to quality!",
    SEP: "The benchmark of true mastery and Top Star championship!",
    OCT: "An inspiring triumph of consistency, skill, and leadership!",
    NOV: "World-class execution leading the team to highest heights!",
    DEC: "Finishing the year as the ultimate Top Star champion!",
  },
  2: {
    JAN: "Exceptional brilliance launching a powerhouse year!",
    FEB: "Superb execution and world-class consistency!",
    MAR: "Outstanding momentum pushing the boundaries of success!",
    APR: "Remarkable craft and relentless drive for excellence!",
    MAY: "Phenomenal dedication shining bright among the finest!",
    JUN: "Spectacular mid-year performance and top-tier agility!",
    JUL: "Blazing an inspiring trail of high-impact achievement!",
    AUG: "Tremendous focus and stellar quality day in, day out!",
    SEP: "Incredible runner-up achievement with elite precision!",
    OCT: "Remarkable perseverance and stellar craftsmanship!",
    NOV: "A powerhouse of quality and client-first excellence!",
    DEC: "Outstanding year-end performance at the highest tier!",
  },
  3: {
    JAN: "A stellar start reaching the podium with proud dedication!",
    FEB: "Passionate execution and commendable customer focus!",
    MAR: "Podium-level brilliance and remarkable tenacity!",
    APR: "Rising to the top with strong determination and skill!",
    MAY: "Impressive mastery earning a well-deserved podium finish!",
    JUN: "Mid-year excellence demonstrating true organizational value!",
    JUL: "Shining bright with great resilience and positive energy!",
    AUG: "Steadfast dedication securing an outstanding podium spot!",
    SEP: "Exceptional finalist performance driving team pride!",
    OCT: "Proud achievement showcasing great talent and grit!",
    NOV: "High-caliber performance making a real difference!",
    DEC: "Closing the year with pride on the prestigious podium!",
  }
};

export function getTopStarMotivationalQuote(rank: number, month: string): string {
  const m = (month || "").toUpperCase().slice(0, 3);
  const rankQuotes = TOP_STAR_MOTIVATIONAL_QUOTES[rank];
  if (rankQuotes && rankQuotes[m]) {
    return rankQuotes[m];
  }
  if (rank === 1) return "Setting the gold standard for championship excellence!";
  if (rank === 2) return "Outstanding brilliance and continuous momentum!";
  if (rank === 3) return "Exceptional dedication driving podium performance!";
  return "Keep striving for excellence and reaching new heights!";
}

export interface TopStarCriteria {
  chat: {
    qaMax: number; qaTarget: number;
    prodMax: number; prodTarget: number;
    ahtMax: number; ahtTarget: number;
    artMax: number; artTarget: number;
    examMax: number; examTarget: number;
  };
  call: {
    qaMax: number; qaTarget: number;
    prodMax: number; prodTarget: number;
    ahtMax: number; ahtTarget: number;
    examMax: number; examTarget: number;
    wrapupMax: number;
    holdMax: number; holdTarget: number;
  };
}

export const DEFAULT_CRITERIA: TopStarCriteria = {
  chat: {
    qaMax: 30, qaTarget: 100,
    prodMax: 15, prodTarget: 13,
    ahtMax: 15, ahtTarget: 210,
    artMax: 20, artTarget: 89,
    examMax: 20, examTarget: 100,
  },
  call: {
    qaMax: 30, qaTarget: 100,
    prodMax: 20, prodTarget: 100,
    ahtMax: 20, ahtTarget: 169,
    examMax: 20, examTarget: 100,
    wrapupMax: 5,
    holdMax: 5, holdTarget: 45,
  }
};

export function scoreAgent(
  t: "chat" | "call",
  vals: Record<string, any>,
  wrapupRange?: { min: number; max: number },
  criteria: TopStarCriteria = DEFAULT_CRITERIA
) {
  const v = vals || {};
  const qa = num(v.qa);
  const prod = num(v.prod);
  const aht = parseSec(v.aht);
  const exam = num(v.exam);

  if (t === "chat") {
    const c = criteria.chat;
    const art = parseSec(v.art);
    const parts = [
      { key: "qa",   pts: qa == null ? null : clamp01(Math.min(qa, c.qaTarget) / c.qaTarget) * c.qaMax, max: c.qaMax },
      { key: "prod", pts: prod == null ? null : Math.min(prod / c.prodTarget, 1) * c.prodMax, max: c.prodMax },
      { key: "aht",  pts: aht == null || aht <= 0 ? null : Math.min(c.ahtTarget / aht, 1) * c.ahtMax, max: c.ahtMax },
      { key: "art",  pts: art == null || art <= 0 ? null : Math.min(c.artTarget / art, 1) * c.artMax, max: c.artMax },
      { key: "exam", pts: exam == null ? null : (Math.min(exam, c.examTarget) / c.examTarget) * c.examMax, max: c.examMax }
    ];
    const any = parts.some(p => p.pts != null);
    const total = any ? parts.reduce((acc, p) => acc + (p.pts || 0), 0) : null;
    return { parts, total };
  }

  const c = criteria.call;
  const wrapup = num(v.wrapup);
  const hold = parseSec(v.hold);

  let wrapupPts: number | null = null;
  if (wrapup != null && wrapupRange) {
    wrapupPts = wrapupRange.max === wrapupRange.min 
      ? c.wrapupMax 
      : Math.max(0, Math.min(c.wrapupMax, ((wrapupRange.max - wrapup) / (wrapupRange.max - wrapupRange.min)) * c.wrapupMax));
  }

  const parts = [
    { key: "qa",     pts: qa == null ? null : (Math.min(qa, c.qaTarget) / c.qaTarget) * c.qaMax, max: c.qaMax },
    { key: "prod",   pts: prod == null ? null : (Math.min(prod, c.prodTarget) / c.prodTarget) * c.prodMax, max: c.prodMax },
    { key: "aht",    pts: aht == null || aht <= 0 ? null : Math.min(c.ahtTarget / aht, 1) * c.ahtMax, max: c.ahtMax },
    { key: "exam",   pts: exam == null ? null : (Math.min(exam, c.examTarget) / c.examTarget) * c.examMax, max: c.examMax },
    { key: "wrapup", pts: wrapupPts, max: c.wrapupMax },
    { key: "hold",   pts: hold == null || hold <= 0 ? null : Math.min(c.holdTarget / hold, 1) * c.holdMax, max: c.holdMax }
  ];

  const any = parts.some(p => p.pts != null);
  const total = any ? parts.reduce((acc, p) => acc + (p.pts || 0), 0) : null;
  return { parts, total };
}

export interface RankedAgent {
  rank: number | null;
  name: string;
  score: number | null;
  scoreStr: string;
  vals: Record<string, any>;
  parts: any[];
}

export function computeTeamRanks(
  team: "chat" | "call",
  teamData: Record<string, Record<string, any>>,
  roster: string[],
  criteria: TopStarCriteria = DEFAULT_CRITERIA
): RankedAgent[] {
  let wrapupRange: { min: number; max: number } | undefined = undefined;
  if (team === "call") {
    const wrapupVals = roster
      .map(name => num(teamData[name]?.wrapup))
      .filter((x): x is number => x != null);

    if (wrapupVals.length > 0) {
      wrapupRange = { min: Math.min(...wrapupVals), max: Math.max(...wrapupVals) };
    }
  }

  const scoredList = roster.map(name => {
    const liveVals = teamData[name] || {};
    const { parts, total } = scoreAgent(team, liveVals, wrapupRange, criteria);
    return {
      name,
      vals: liveVals,
      parts,
      total
    };
  });

  scoredList.sort((a, b) => {
    if (a.total == null && b.total == null) return a.name.localeCompare(b.name);
    if (a.total == null) return 1;
    if (b.total == null) return -1;
    return (b.total || 0) - (a.total || 0);
  });

  return scoredList.map((item, idx) => ({
    rank: item.total != null ? idx + 1 : null,
    name: item.name,
    score: item.total,
    scoreStr: item.total != null ? item.total.toFixed(1) : "–",
    vals: item.vals,
    parts: item.parts
  }));
}

export interface AgentMissingInfo {
  name: string;
  missingFields: string[];
}

export interface TeamCompleteness {
  isComplete: boolean;
  hasAnyData: boolean;
  totalAgents: number;
  completedAgents: number;
  missingAgents: AgentMissingInfo[];
}

export function checkTeamCompleteness(
  team: "chat" | "call",
  teamMap: Record<string, any>,
  roster: string[]
): TeamCompleteness {
  const missingAgents: AgentMissingInfo[] = [];
  let completedCount = 0;
  let hasAnyData = false;

  const isFieldFilled = (v: any) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    return s !== "" && s !== "-" && s !== "–";
  };

  roster.forEach(agentName => {
    const raw = teamMap[agentName] || teamMap[normalizeName(agentName)];
    if (!raw) {
      missingAgents.push({
        name: agentName,
        missingFields: team === "chat" 
          ? ["Qa", "Prod", "Aht", "Art", "Exam"] 
          : ["Qa", "Prod", "Aht", "Exam", "Wrapup", "Hold"]
      });
      return;
    }

    const missing: string[] = [];
    if (!isFieldFilled(raw.qa ?? raw.quality)) missing.push("Qa");
    if (!isFieldFilled(raw.prod ?? raw.productivity)) missing.push("Prod");
    if (!isFieldFilled(raw.aht)) missing.push("Aht");
    if (!isFieldFilled(raw.exam)) missing.push("Exam");

    if (team === "chat") {
      if (!isFieldFilled(raw.art)) missing.push("Art");
    } else {
      if (!isFieldFilled(raw.wrapup)) missing.push("Wrapup");
      if (!isFieldFilled(raw.hold)) missing.push("Hold");
    }

    const anyFilled = isFieldFilled(raw.qa ?? raw.quality) || 
                      isFieldFilled(raw.prod ?? raw.productivity) || 
                      isFieldFilled(raw.aht) || 
                      isFieldFilled(raw.exam);
    if (anyFilled) hasAnyData = true;

    if (missing.length > 0) {
      missingAgents.push({ name: agentName, missingFields: missing });
    } else {
      completedCount++;
    }
  });

  return {
    isComplete: roster.length > 0 && completedCount === roster.length,
    hasAnyData,
    totalAgents: roster.length,
    completedAgents: completedCount,
    missingAgents
  };
}

export async function fetchTopStarCriteria(): Promise<TopStarCriteria> {
  try {
    const snap = await getDoc(doc(db, "settings", "top_star_criteria"));
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.chat && data.call) {
        return data as TopStarCriteria;
      }
    }
  } catch (e) {
    console.error("Error loading criteria:", e);
  }
  return DEFAULT_CRITERIA;
}

export async function fetchTopStarSyncStatus(): Promise<Record<string, any>> {
  try {
    const snap = await getDoc(doc(db, "settings", "top_star_status"));
    if (snap.exists()) {
      return snap.data()?.synced_months || {};
    }
  } catch (e) {
    console.error("Error loading top star sync status:", e);
  }
  return {};
}

export async function fetchTopStarData(
  year: string,
  month: string,
  criteria: TopStarCriteria = DEFAULT_CRITERIA
) {
  const [mohammedSnap, younisSnap, ankidoSnap, syncStatus] = await Promise.all([
    getDocs(query(collection(db, "mohammed_metrics"), where("year", "==", year), where("month", "==", month))),
    getDocs(query(collection(db, "younis_metrics"), where("year", "==", year), where("month", "==", month))),
    getDocs(query(collection(db, "ankido_metrics"), where("year", "==", year), where("month", "==", month))),
    fetchTopStarSyncStatus()
  ]);

  const chatMap: Record<string, any> = {};
  mohammedSnap.docs.forEach(docSnap => {
    const d = docSnap.data();
    const cName = normalizeName(d.agent_name || "");
    if (cName) chatMap[cName] = d;
  });

  const callMap: Record<string, any> = {};
  [...younisSnap.docs, ...ankidoSnap.docs].forEach(docSnap => {
    const d = docSnap.data();
    const cName = normalizeName(d.agent_name || "");
    if (cName) callMap[cName] = d;
  });

  const finalChat: Record<string, any> = {};
  DEFAULT_CHAT_AGENTS.forEach(name => {
    const raw = chatMap[name] || {};
    finalChat[name] = {
      qa: raw.quality ?? null,
      prod: raw.productivity ?? null,
      aht: raw.aht ? parseSec(raw.aht) : null,
      art: raw.art ? parseSec(raw.art) : null,
      exam: raw.exam ?? null
    };
  });

  const finalCall: Record<string, any> = {};
  DEFAULT_CALL_AGENTS.forEach(name => {
    const raw = callMap[name] || {};
    finalCall[name] = {
      qa: raw.quality ?? null,
      prod: raw.productivity ?? null,
      aht: raw.aht ? parseSec(raw.aht) : null,
      exam: raw.exam ?? null,
      wrapup: raw.wrapup ? parseSec(raw.wrapup) : null,
      hold: raw.hold ? parseSec(raw.hold) : null
    };
  });

  const chatCompleteness = checkTeamCompleteness("chat", finalChat, DEFAULT_CHAT_AGENTS);
  const callCompleteness = checkTeamCompleteness("call", finalCall, DEFAULT_CALL_AGENTS);

  const rankedChat = computeTeamRanks("chat", finalChat, DEFAULT_CHAT_AGENTS, criteria);
  const rankedCall = computeTeamRanks("call", finalCall, DEFAULT_CALL_AGENTS, criteria);

  const top3Chat = rankedChat.filter(r => r.rank != null && r.rank <= 3).slice(0, 3);
  const top3Call = rankedCall.filter(r => r.rank != null && r.rank <= 3).slice(0, 3);

  return {
    rawChat: finalChat,
    rawCall: finalCall,
    rankedChat,
    rankedCall,
    top3Chat,
    top3Call,
    chatCompleteness,
    callCompleteness,
    syncStatus
  };
}
