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

async function inspect() {
  console.log("=== USERS COLLECTION ===");
  const usersSnap = await getDocs(collection(db, "users"));
  const users = [];
  usersSnap.forEach(d => {
    const data = d.data();
    users.push({
      id: d.id,
      name: data.name || data.displayName || data.username || "",
      email: data.email || "",
      role: data.role || "",
      username: data.username || ""
    });
  });
  users.sort((a, b) => a.name.localeCompare(b.name));
  users.forEach(u => console.log(`User: [${u.name}] (email: ${u.email}, username: ${u.username}, role: ${u.role})`));

  console.log("\n=== QUALITY EVALUATIONS CSR NAMES ===");
  const evalSnap = await getDocs(collection(db, "quality_evaluations"));
  const byEvaluatorCsrs = {};
  const allCsrNames = new Set();
  const suspiciousDocs = [];

  evalSnap.forEach(d => {
    const id = d.id;
    if (id.startsWith("config_")) return;
    const data = d.data();
    const ev = data.evaluator || "Unknown";
    const csr = data.csr_name || "Unknown";
    allCsrNames.add(csr);

    if (!byEvaluatorCsrs[ev]) byEvaluatorCsrs[ev] = new Set();
    byEvaluatorCsrs[ev].add(csr);

    if (csr.toLowerCase().includes("dlshad") || csr.toLowerCase().includes("csr /") || id.toLowerCase().includes("dlshad")) {
      suspiciousDocs.push({ id, ev, csr, year: data.year, quarter: data.quarter });
    }
  });

  console.log(`\nUnique CSR names (${allCsrNames.size}) in quality_evaluations:`);
  Array.from(allCsrNames).sort().forEach(c => console.log(` - ${c}`));

  console.log("\nCSR names by evaluator:");
  for (const [ev, csrs] of Object.entries(byEvaluatorCsrs)) {
    console.log(`Evaluator [${ev}]:`);
    Array.from(csrs).sort().forEach(c => console.log(`   - ${c}`));
  }

  console.log("\nDocs matching Dlshad / CSR / :");
  suspiciousDocs.forEach(s => console.log(`   Doc: ${s.id} (evaluator: ${s.ev}, csr: ${s.csr}, yr: ${s.year}, q: ${s.quarter})`));
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
