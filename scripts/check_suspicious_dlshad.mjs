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
  const jihadAgents = new Set();
  tmSnap.forEach(d => {
    const data = d.data();
    if ((data.team || "").includes("Younis")) {
      jihadAgents.add((data.agent_name || data.name || "").trim().toLowerCase());
    }
  });
  console.log("Jihad/Younis agents count:", jihadAgents.size);

  const qSnap = await getDocs(collection(db, "quality_evaluations"));
  const suspicious = [];
  qSnap.forEach(d => {
    const data = d.data();
    const id = d.id;
    if (id.includes("mohammed_dlshad")) {
      const name = (data.csr_name || "").trim().toLowerCase();
      if (jihadAgents.has(name)) {
        suspicious.push({ id, csr_name: data.csr_name, is_c_shift: id.includes("c_shift") });
      }
    }
  });

  console.log("Found in mohammed_dlshad:", suspicious.length);
  suspicious.forEach(s => console.log(s.id, "=> is_c_shift:", s.is_c_shift, "csr_name:", s.csr_name));
}
check().then(() => process.exit(0));
