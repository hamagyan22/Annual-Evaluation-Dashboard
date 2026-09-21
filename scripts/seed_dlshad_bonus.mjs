import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
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

const dlshadBonusAgents = [
  { name: "Ahmed Rustam", scores: {} },
  { name: "Akar Omer", scores: {} },
  { name: "Bana Ahmed", scores: {} },
  { name: "Dhuha Khanjer", scores: {} },
  { name: "Nawen Maadh", scores: {} },
  { name: "Ismail Ahmed", scores: {} },
  { name: "Soma Sherko", scores: {} },
  { name: "Rassan Ismail", scores: {} },
  { name: "Zahra Yousif", scores: {} },
  { name: "Ossama Saadi", scores: {} },
  { name: "Yousif Rashid", scores: { call_1: "100", chat_1: "100" } },
  { name: "Sawin Sartib", scores: { call_1: "94", chat_1: "94" } },
  { name: "Sana Dler", scores: {} },
  { name: "Sawen", scores: {} }
];

async function seed() {
  console.log("Seeding Mohammed Dlshad Bonus in Q3 2026...");
  for (const agent of dlshadBonusAgents) {
    const slug = agent.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const docId = `2026_Q3_mohammed_dlshad_bonus_${slug}`;
    await setDoc(doc(db, "quality_evaluations", docId), {
      year: "2026",
      quarter: "Q3",
      evaluator: "Mohammed Dlshad",
      team: "Mohammed Dlshad Team",
      csr_name: agent.name,
      scores: agent.scores,
      notes: {},
      links: {},
      updated_at: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Seeded ${docId}`);
  }
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
