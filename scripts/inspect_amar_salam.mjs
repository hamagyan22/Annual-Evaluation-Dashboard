import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectAmarSalam() {
  console.log("=== 1. FIRESTORE quality_evaluations ===");
  const qaSnap = await getDocs(collection(db, "quality_evaluations"));
  const amarDocs = [];
  const salamDocs = [];
  qaSnap.forEach(d => {
    const id = d.id;
    const data = d.data();
    const csr = (data.csr_name || "").toLowerCase();
    if (id.includes("amar") || csr.includes("amar")) {
      amarDocs.push({ id, ...data });
    }
    if (id.includes("salam") || csr.includes("salam")) {
      salamDocs.push({ id, ...data });
    }
  });

  console.log(`Amar QA docs found in Firestore: ${amarDocs.length}`);
  amarDocs.forEach(d => {
    const scoreKeys = Object.keys(d.scores || {});
    console.log(`  ID: ${d.id} | csr_name: ${d.csr_name} | scores count: ${scoreKeys.length} | weeks with scores:`, Array.from(new Set(scoreKeys.map(k => k.split('_')[0]))));
  });

  console.log(`\nSalam QA docs found in Firestore: ${salamDocs.length}`);
  salamDocs.forEach(d => {
    const scoreKeys = Object.keys(d.scores || {});
    console.log(`  ID: ${d.id} | csr_name: ${d.csr_name} | scores count: ${scoreKeys.length} | weeks with scores:`, Array.from(new Set(scoreKeys.map(k => k.split('_')[0]))));
  });

  console.log("\n=== 2. FIRESTORE younis_metrics ===");
  const metricsSnap = await getDocs(collection(db, "younis_metrics"));
  const amarMetrics = [];
  const salamMetrics = [];
  metricsSnap.forEach(d => {
    const data = d.data();
    const name = (data.agent_name || "").toLowerCase();
    if (name.includes("amar")) amarMetrics.push({ id: d.id, ...data });
    if (name.includes("salam")) salamMetrics.push({ id: d.id, ...data });
  });

  console.log(`Amar metrics rows in Firestore: ${amarMetrics.length}`);
  amarMetrics.forEach(d => {
    console.log(`  ID: ${d.id} | Month: ${d.month} | Year: ${d.year} | Quality: ${d.quality} | Handled: ${d.handled || d.call_handled} | Exam: ${d.exam} | AHT: ${d.aht}`);
  });

  console.log(`\nSalam metrics rows in Firestore: ${salamMetrics.length}`);
  salamMetrics.forEach(d => {
    console.log(`  ID: ${d.id} | Month: ${d.month} | Year: ${d.year} | Quality: ${d.quality} | Handled: ${d.handled || d.call_handled} | Exam: ${d.exam} | AHT: ${d.aht}`);
  });

  console.log("\n=== 3. BASELINE JIHAD / DLSHAD / LARA / AZAD files ===");
  ['baselineJihad.ts', 'baselineDlshad.ts', 'baselineLara.ts', 'baselineAzad.ts'].forEach(file => {
    const content = fs.readFileSync(`src/lib/${file}`, 'utf8');
    const amarOccur = (content.match(/amar_hussein/gi) || []).length;
    const salamOccur = (content.match(/salam_sadam/gi) || []).length;
    console.log(`[${file}] amar matches: ${amarOccur}, salam matches: ${salamOccur}`);

    // Print matching document IDs
    const docIdRegex = /"((202[4-7]_Q[1-4]_[^"]*(amar|salam)[^"]*))"/gi;
    let m;
    const foundIds = new Set();
    while ((m = docIdRegex.exec(content)) !== null) {
      foundIds.add(m[1]);
    }
    if (foundIds.size > 0) {
      console.log(`  Found doc IDs in ${file}:`, Array.from(foundIds));
    }
  });
}

inspectAmarSalam().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
