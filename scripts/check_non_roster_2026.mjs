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

async function check() {
  const tmSnap = await getDocs(collection(db, "team_members"));
  const teamMap = {};
  tmSnap.forEach(d => {
    const data = d.data();
    teamMap[(data.agent_name || data.name || "").trim().toLowerCase()] = data.team;
  });

  const qSnap = await getDocs(collection(db, "quality_evaluations"));
  const nonRoster = new Set();
  qSnap.forEach(d => {
    if (d.id.startsWith("2026_")) {
      const data = d.data();
      const name = (data.csr_name || "").trim();
      const lower = name.toLowerCase();
      if (name && !teamMap[lower]) {
        nonRoster.add(`${d.id} => csr: "${name}"`);
      }
    }
  });

  console.log("2026 docs with CSR not in team_members:", nonRoster.size);
  Array.from(nonRoster).slice(0, 30).forEach(x => console.log(x));
}
check().then(() => process.exit(0));
