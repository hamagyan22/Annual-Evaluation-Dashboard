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
  const evalSnap = await getDocs(collection(db, "quality_evaluations"));
  const cases = ["haneen", "zhal", "marwa", "shahab", "saman", "salem", "kazhvan", "dlshad"];
  
  console.log("=== EVALUATION DOCS ===");
  evalSnap.forEach(d => {
    const id = d.id;
    if (id.startsWith("config_")) return;
    const data = d.data();
    const csr = data.csr_name || "";
    const lower = (csr + " " + id).toLowerCase();
    for (const c of cases) {
      if (lower.includes(c)) {
        console.log(`[${d.id}] csr_name="${csr}" evaluator="${data.evaluator}" yr=${data.year} q=${data.quarter}`);
        break;
      }
    }
  });

  console.log("\n=== TEAM_MEMBERS ===");
  const tmSnap = await getDocs(collection(db, "team_members"));
  tmSnap.forEach(d => {
    const data = d.data();
    const name = data.agent_name || data.name || "";
    const lower = name.toLowerCase();
    for (const c of cases) {
      if (lower.includes(c)) {
        console.log(`[${d.id}] name="${name}" team="${data.team}"`);
        break;
      }
    }
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
