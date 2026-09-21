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

async function inspect() {
  const snap = await getDocs(collection(db, "quality_evaluations"));
  const bySection = {};
  snap.forEach(d => {
    const data = d.data();
    const sec = data.section || data.sheet_name || "unknown";
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push({ id: d.id, csr_name: data.csr_name, quarter: data.quarter, year: data.year });
  });
  for (const [sec, list] of Object.entries(bySection)) {
    console.log(`=== SECTION: ${sec} (${list.length} docs) ===`);
    const csrs = [...new Set(list.map(x => x.csr_name))];
    console.log("CSRs (" + csrs.length + "):", csrs.join(", "));
  }

  console.log("\n=== TEAM MEMBERS ===");
  const tmSnap = await getDocs(collection(db, "team_members"));
  tmSnap.forEach(d => {
    console.log(d.id, "=>", JSON.stringify(d.data()));
  });

  console.log("\n=== USERS (TLs and QA) ===");
  const uSnap = await getDocs(collection(db, "users"));
  uSnap.forEach(d => {
    const u = d.data();
    if (u.role === "team_leader" || u.role === "qa" || u.name?.toLowerCase().includes("dlshad") || u.name?.toLowerCase().includes("jihad")) {
      console.log(d.id, "=>", u.name, "| role:", u.role, "| shift:", u.shift, "| team:", u.team);
    }
  });
}
inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
