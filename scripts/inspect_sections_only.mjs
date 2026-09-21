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
    if (!bySection[sec]) bySection[sec] = new Set();
    bySection[sec].add(data.csr_name);
  });
  for (const [sec, setCsrs] of Object.entries(bySection)) {
    console.log(`SECTION [${sec}]: (${setCsrs.size} agents)`);
    console.log(Array.from(setCsrs).sort().join(", "));
    console.log("-----------------------------------------");
  }
}
inspect().then(() => process.exit(0));
