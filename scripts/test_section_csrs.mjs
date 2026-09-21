import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const DEFAULT_SECTIONS = [
  { id: "mohammed_jihad", evaluator: "Mohammed Jihad", team: "Younis Kamal Team" },
  { id: "lara_kamil", evaluator: "Lara Kamil", team: "Ankido Buya Team" },
  { id: "mohammed_dlshad", evaluator: "Mohammed Dlshad", team: "Mohammed Dlshad Team" },
  { id: "mohammed_azad", evaluator: "Mohammed Azad", team: "All Call Teams (Morning & Evening)" }
];

const CANONICAL_AGENT_NAMES = {
  "shahab ahmed": "Shahab Ahmed Muhammed",
  "shahab ahmed muhammed": "Shahab Ahmed Muhammed",
  "zhala sherzad": "Zhalla Sherzad",
  "zhalla sherzad": "Zhalla Sherzad",
  "marwa khaleel": "Marwa Khalil",
  "marwa khalil": "Marwa Khalil",
  "mohammed saman": "Mohammed Salem",
  "mohammed saleem": "Mohammed Salem",
  "mohammed salem": "Mohammed Salem",
  "hannen iskandar": "Haneen Abd-Al Kareem",
  "haneen abdulkarim": "Haneen Abd-Al Kareem",
  "haneen abd-al kareem": "Haneen Abd-Al Kareem",
  "kazhvan wirya": "Kazhvan Wirya",
  "kani sami": "Kani Sami",
  "azad muhammad": "Azad Muhammad",
  "dhuha khanjer": "Dhuha Khanjer"
};

function getCanonicalAgentName(name) {
  const trimmed = (name || "").trim();
  const lower = trimmed.toLowerCase();
  return CANONICAL_AGENT_NAMES[lower] || trimmed;
}

function isValidAgentName(name) {
  const lower = (name || "").toLowerCase().trim();
  if (!lower) return false;
  if (lower.includes("csr /") || lower.includes("csr/")) return false;
  return true;
}

async function testSectionCSRs() {
  const tmSnap = await getDocs(collection(db, "team_members"));
  const rosterMembers = [];
  tmSnap.forEach(d => rosterMembers.push({ id: d.id, ...d.data() }));

  const qSnap = await getDocs(collection(db, "quality_evaluations"));
  const evalData = {};
  qSnap.forEach(d => evalData[d.id] = d.data());

  const selectedYear = "2026";
  const selectedQuarter = "Q3";

  const result = {};

  DEFAULT_SECTIONS.forEach(sec => {
    let teamAgents = [];
    if (sec.id === "mohammed_azad") {
      teamAgents = rosterMembers
        .filter(m => m.team === "Younis Kamal Team" || m.team === "Ankido Buya Team")
        .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
        .filter(isValidAgentName);
    } else {
      teamAgents = rosterMembers
        .filter(m => m.team === sec.team)
        .map(m => getCanonicalAgentName((m.agent_name || m.name || "").trim()))
        .filter(isValidAgentName);
    }

    const secSlug = sec.id;
    const prefix = `${selectedYear}_${selectedQuarter}_${secSlug}_`;
    Object.entries(evalData).forEach(([docId, docData]) => {
      // Exclude sub-shift documents
      if (docId.includes("_c_shift_") || docId.includes("_bonus_") || docId.includes("_call_mon_")) {
        return;
      }
      if (docId.startsWith(prefix) && docData?.csr_name) {
        const cName = getCanonicalAgentName(docData.csr_name.trim());
        if (isValidAgentName(cName)) {
          const isFromOtherTeam = rosterMembers.some(m => {
            const mName = getCanonicalAgentName((m.agent_name || m.name || "").trim()).toLowerCase();
            return mName === cName.toLowerCase() && m.team && m.team !== sec.team;
          });
          if (!isFromOtherTeam) {
            teamAgents.push(cName);
          }
        }
      }
    });

    const nameMap = new Map();
    teamAgents.forEach(n => {
      const k = n.toLowerCase();
      if (!nameMap.has(k)) nameMap.set(k, n);
    });
    result[sec.id] = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));
  });

  for (const [secId, agents] of Object.entries(result)) {
    console.log(`=== ${secId} (${agents.length} agents) ===`);
    console.log(agents.join(", "));
  }
}

testSectionCSRs().then(() => process.exit(0));
