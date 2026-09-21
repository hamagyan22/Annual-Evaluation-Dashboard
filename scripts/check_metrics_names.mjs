import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, updateDoc } from "firebase/firestore";
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

async function checkMetrics() {
  for (const c of ["younis_metrics", "ankido_metrics"]) {
    const snap = await getDocs(collection(db, c));
    console.log(`\n=== Collection [${c}] ===`);
    const names = new Set();
    snap.forEach(d => {
      const data = d.data();
      const n = data.agent_name || data.agent || data.name;
      if (n) names.add(n);
    });
    console.log(`Distinct names in ${c}:`, Array.from(names).sort());
  }
}

checkMetrics().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
