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
  const list = [];
  usersSnap.forEach(d => {
    const data = d.data();
    list.push({
      id: d.id,
      email: data.email || "",
      agent_name: data.agent_name || data.name || "",
      team: data.team || "",
      role: data.role || ""
    });
  });
  list.sort((a, b) => a.agent_name.localeCompare(b.agent_name));
  list.forEach(u => console.log(`${u.agent_name.padEnd(25)} | ${u.email.padEnd(32)} | ${u.team.padEnd(22)} | ${u.role}`));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
