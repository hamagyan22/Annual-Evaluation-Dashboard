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
  const byTeam = {};
  tmSnap.forEach(d => {
    const data = d.data();
    const team = data.team || "No Team";
    if (!byTeam[team]) byTeam[team] = [];
    byTeam[team].push(data.agent_name || data.name || data.display_name);
  });
  for (const [team, members] of Object.entries(byTeam)) {
    console.log(`=== ${team} (${members.length}) ===`);
    console.log(members.sort().join(", "));
  }
}
check().then(() => process.exit(0));
