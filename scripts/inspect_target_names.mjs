import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import dotenv from "dotenv";

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

async function main() {
  const usersSnap = await getDocs(collection(db, "users"));
  console.log("=== USERS IN SYSTEM ===");
  const users = [];
  usersSnap.forEach(d => {
    const data = d.data();
    users.push({ id: d.id, name: data.name, email: data.email, username: data.username, role: data.role });
  });
  users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  users.forEach(u => console.log(`${u.id} | name: "${u.name}" | username: "${u.username}" | email: "${u.email}" | role: "${u.role}"`));

  const targetNames = [
    "haneen", "zhalla", "zhala", "marwa", "shahab", "saman", "kazhvan", "kazhwan", "dlshad"
  ];

  console.log("\n=== MATCHING DOCS IN QUALITY_EVALUATIONS ===");
  const evalSnap = await getDocs(collection(db, "quality_evaluations"));
  const matches = [];
  evalSnap.forEach(d => {
    if (d.id.startsWith("config_")) return;
    const data = d.data();
    const csr = data.csr_name || "";
    const lower = csr.toLowerCase();
    for (const t of targetNames) {
      if (lower.includes(t)) {
        matches.push({ id: d.id, csr_name: csr, evaluator: data.evaluator, year: data.year, quarter: data.quarter });
        break;
      }
    }
  });

  const distinctCsrs = [...new Set(matches.map(m => m.csr_name))];
  console.log("Distinct matching CSR names in quality_evaluations:", distinctCsrs);

  console.log("\nSample documents:");
  matches.forEach(m => console.log(`[${m.evaluator}] [${m.year} ${m.quarter}] csr: "${m.csr_name}" (id: ${m.id})`));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
