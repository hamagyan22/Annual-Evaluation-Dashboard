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
  const groups = {};
  snap.forEach(d => {
    const id = d.id;
    // Extract prefix before csr_name or pattern
    const parts = id.split("_");
    const prefix = parts.slice(0, 4).join("_");
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push({ id, csr_name: d.data().csr_name });
  });

  for (const [prefix, list] of Object.entries(groups)) {
    console.log(`PREFIX: ${prefix} (${list.length} docs)`);
    const names = list.map(x => x.csr_name);
    console.log("Names:", names.join(", "));
    console.log("-----------------------------------------");
  }
}
inspect().then(() => process.exit(0));
