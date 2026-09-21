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
  const snap = await getDocs(collection(db, "team_members"));
  console.log(`Found ${snap.size} team_members docs:`);
  const members = [];
  snap.forEach(d => {
    const data = d.data();
    members.push({ id: d.id, name: data.agent_name || data.name, team: data.team });
  });
  members.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  members.forEach(m => console.log(`${m.id} | "${m.name}" | team: "${m.team}"`));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
