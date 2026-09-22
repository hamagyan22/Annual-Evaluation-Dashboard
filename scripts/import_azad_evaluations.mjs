import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";
import fs from "fs";

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

const CANONICAL_AGENT_NAMES = {
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

function getCanonicalName(name) {
  const trimmed = (name || "").trim();
  const lower = trimmed.toLowerCase();
  return CANONICAL_AGENT_NAMES[lower] || trimmed;
}

function getSlug(name) {
  return getCanonicalName(name).toLowerCase().replace(/[^a-z0-9]/g, "_");
}

async function runImport() {
  const rawData = JSON.parse(
    fs.readFileSync(
      "C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b\\scratch\\parsed_azad_data.json",
      "utf-8"
    )
  );

  const { monitoring, training } = rawData;

  console.log("=== 1. IMPORTING MONITORING DATA (Call Mon) ===");
  const monAgents = [];

  for (const [agentName, mData] of Object.entries(monitoring)) {
    const canonicalName = getCanonicalName(agentName);
    const slug = getSlug(agentName);
    const docId = `2026_Q3_mohammed_azad_call_mon_${slug}`;

    const mergedScores = {};
    const mergedNotes = {};

    let hasAnyData = false;
    for (const [mIdx, d] of Object.entries(mData)) {
      for (const [k, v] of Object.entries(d.scores)) {
        mergedScores[k] = v;
        hasAnyData = true;
      }
      for (const [k, v] of Object.entries(d.notes)) {
        mergedNotes[k] = v;
        hasAnyData = true;
      }
    }

    if (!hasAnyData) {
      console.log(`Skipping empty monitoring agent: ${agentName}`);
      continue;
    }

    monAgents.push(canonicalName);

    const docPayload = {
      year: "2026",
      quarter: "Q3",
      section: "mohammed_azad_call_mon",
      evaluator: "Mohammed Azad",
      csr_name: canonicalName,
      scores: mergedScores,
      notes: mergedNotes,
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, "quality_evaluations", docId), docPayload, { merge: true });
    console.log(`Saved monitoring doc: ${docId} (${Object.keys(mergedScores).length} scores, ${Object.keys(mergedNotes).length} notes)`);
  }

  // Save config_call_mon_roster
  const uniqueMonAgents = Array.from(new Set(monAgents)).sort((a, b) => a.localeCompare(b));
  await setDoc(
    doc(db, "quality_evaluations", "config_call_mon_roster"),
    {
      year: "2026",
      agents: uniqueMonAgents,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log("Saved config_call_mon_roster with agents:", uniqueMonAgents);

  console.log("\n=== 2. IMPORTING TRAINING DATA (Brown Section) ===");
  let trainingCount = 0;

  for (const [agentName, d] of Object.entries(training)) {
    if (!d.scores || Object.keys(d.scores).length === 0) continue;

    const canonicalName = getCanonicalName(agentName);
    const slug = getSlug(agentName);
    const docId = `2026_Q3_mohammed_azad_${slug}`;

    // Populate m8 (September) as primary active month, and also m6 (July) & m7 (August)
    // so evaluations are accessible across the entire Q3 period
    const scores = {};
    const notes = {};

    for (const [evalIdx, val] of Object.entries(d.scores)) {
      scores[`m8_eval_${evalIdx}`] = val;
      scores[`m7_eval_${evalIdx}`] = val;
      scores[`m6_eval_${evalIdx}`] = val;
    }

    for (const [evalIdx, noteText] of Object.entries(d.notes)) {
      notes[`m8_eval_${evalIdx}`] = noteText;
      notes[`m7_eval_${evalIdx}`] = noteText;
      notes[`m6_eval_${evalIdx}`] = noteText;
    }

    const docPayload = {
      year: "2026",
      quarter: "Q3",
      section: "mohammed_azad",
      evaluator: "Mohammed Azad",
      csr_name: canonicalName,
      scores,
      notes,
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, "quality_evaluations", docId), docPayload, { merge: true });
    trainingCount++;
    console.log(`Saved training doc: ${docId} for ${canonicalName} (${Object.keys(d.scores).length} calls, ${Object.keys(d.notes).length} notes)`);
  }

  console.log(`\nImport complete! Total training docs saved: ${trainingCount}`);
}

runImport()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error during import:", err);
    process.exit(1);
  });
