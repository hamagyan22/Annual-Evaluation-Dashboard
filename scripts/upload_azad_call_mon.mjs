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

async function runUpload() {
  const jsonPath = "C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b\\scratch\\extracted_azad_call_mon.json";
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const { agents, evaluations } = raw;

  console.log("=== 1. UPLOADING CONFIG_CALL_MON_ROSTER ===");
  await setDoc(
    doc(db, "quality_evaluations", "config_call_mon_roster"),
    {
      year: "2026",
      agents: agents,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log(`Saved config_call_mon_roster with ${agents.length} agents.`);

  console.log("\n=== 2. UPLOADING EVALUATIONS FOR MOHAMMED AZAD CALL MON ===");
  let count = 0;
  for (const [canonicalName, data] of Object.entries(evaluations)) {
    const slug = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const docId = `2026_Q3_mohammed_azad_call_mon_${slug}`;

    const scores = {};
    const notes = {};

    for (const [cNum, val] of Object.entries(data.scores || {})) {
      scores[`m8_eval_${cNum}`] = String(val);
      scores[`m7_eval_${cNum}`] = String(val);
      scores[`m6_eval_${cNum}`] = String(val);
    }

    for (const [cNum, noteText] of Object.entries(data.notes || {})) {
      notes[`m8_eval_${cNum}`] = String(noteText);
      notes[`m7_eval_${cNum}`] = String(noteText);
      notes[`m6_eval_${cNum}`] = String(noteText);
    }

    const payload = {
      year: "2026",
      quarter: "Q3",
      section: "mohammed_azad_call_mon",
      evaluator: "Mohammed Azad",
      csr_name: canonicalName,
      scores,
      notes,
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, "quality_evaluations", docId), payload, { merge: true });
    count++;
    console.log(`Saved doc ${docId} for ${canonicalName} (${Object.keys(data.scores || {}).length} calls, ${Object.keys(data.notes || {}).length} notes)`);
  }

  console.log(`\nUpload complete! Total docs saved: ${count}`);
}

runUpload()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error during upload:", err);
    process.exit(1);
  });
