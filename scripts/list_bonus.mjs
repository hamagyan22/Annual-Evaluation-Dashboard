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
  console.log("=== ALL BONUS DOCS ===");
  evalSnap.forEach(d => {
    if (d.id.includes("bonus")) {
      const data = d.data();
      console.log(`[${d.id}] evaluator="${data.evaluator}" csr_name="${data.csr_name}" scores=${Object.keys(data.scores || {}).length}`);
    }
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
