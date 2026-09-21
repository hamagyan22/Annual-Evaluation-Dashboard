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

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function main() {
  const usersSnap = await getDocs(collection(db, "users"));
  const officialUsers = [];
  usersSnap.forEach(d => {
    const data = d.data();
    officialUsers.push({
      id: d.id,
      email: data.email || "",
      agent_name: data.agent_name || data.name || "",
      role: data.role || "",
      norm: normalize(data.agent_name || data.name || "")
    });
  });

  const tmSnap = await getDocs(collection(db, "team_members"));
  const tmNames = new Set();
  tmSnap.forEach(d => {
    const data = d.data();
    const n = data.agent_name || data.name;
    if (n) tmNames.add(n);
  });

  const evalSnap = await getDocs(collection(db, "quality_evaluations"));
  const evalNames = new Set();
  evalSnap.forEach(d => {
    if (d.id.startsWith("config_")) return;
    const n = d.data().csr_name;
    if (n) evalNames.add(n);
  });

  console.log("=== COMPARISON WITH USERS ===");
  console.log("Official user names in users collection:");
  officialUsers.forEach(u => console.log(`   ${u.agent_name.padEnd(25)} (${u.email})`));

  console.log("\nNames in team_members not EXACTLY matching a user's agent_name:");
  tmNames.forEach(tm => {
    const exact = officialUsers.find(u => u.agent_name === tm);
    if (!exact) {
      const close = officialUsers.find(u => normalize(u.agent_name) === normalize(tm) || u.norm.includes(normalize(tm)) || normalize(tm).includes(u.norm));
      console.log(`   team_member: "${tm}" -> matches user: "${close?.agent_name}" (${close?.email})`);
    }
  });

  console.log("\nNames in quality_evaluations not EXACTLY matching a user's agent_name:");
  evalNames.forEach(ev => {
    const exact = officialUsers.find(u => u.agent_name === ev);
    if (!exact) {
      const close = officialUsers.find(u => normalize(u.agent_name) === normalize(ev) || u.norm.includes(normalize(ev)) || normalize(ev).includes(u.norm));
      console.log(`   eval csr: "${ev}" -> matches user: "${close?.agent_name}" (${close?.email})`);
    }
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
