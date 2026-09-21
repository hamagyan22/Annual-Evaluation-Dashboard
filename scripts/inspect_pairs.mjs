import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, getDoc } from "firebase/firestore";
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

async function inspectPairs() {
  console.log("=== SHAHAB AHMED DOCS ===");
  const snap = await getDocs(collection(db, "quality_evaluations"));
  snap.forEach(d => {
    if (d.id.includes("shahab")) {
      const data = d.data();
      console.log(d.id, "csr_name:", data.csr_name, "scores count:", Object.keys(data.scores || {}).length, "scores:", data.scores);
    }
  });

  console.log("\n=== ZHALA / ZHALLA SHERZAD DOCS ===");
  snap.forEach(d => {
    if (d.id.includes("zhala_sherzad") || d.id.includes("zhalla_sherzad")) {
      const data = d.data();
      console.log(d.id, "csr_name:", data.csr_name, "scores count:", Object.keys(data.scores || {}).length, "scores:", data.scores);
    }
  });

  console.log("\n=== MARWA KHALEEL / KHALIL DOCS ===");
  snap.forEach(d => {
    if (d.id.includes("marwa_khaleel") || d.id.includes("marwa_khalil")) {
      const data = d.data();
      console.log(d.id, "csr_name:", data.csr_name, "scores count:", Object.keys(data.scores || {}).length);
    }
  });

  console.log("\n=== MOHAMMED SAMAN / SALEM DOCS ===");
  snap.forEach(d => {
    if (d.id.includes("saman") || d.id.includes("salem")) {
      const data = d.data();
      console.log(d.id, "csr_name:", data.csr_name, "scores count:", Object.keys(data.scores || {}).length);
    }
  });

  console.log("\n=== HANEEN / HANNEN DOCS ===");
  snap.forEach(d => {
    if (d.id.includes("haneen") || d.id.includes("hannen")) {
      const data = d.data();
      console.log(d.id, "csr_name:", data.csr_name, "scores count:", Object.keys(data.scores || {}).length);
    }
  });

  console.log("\n=== KAZHVAN WIRYA DOCS ===");
  snap.forEach(d => {
    if (d.id.includes("kazhvan")) {
      const data = d.data();
      console.log(d.id, "csr_name:", data.csr_name, "scores count:", Object.keys(data.scores || {}).length);
    }
  });
}

inspectPairs().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
