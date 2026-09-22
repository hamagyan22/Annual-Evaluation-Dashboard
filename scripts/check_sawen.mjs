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
  console.log("=== CHECKING USERS ===");
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.forEach(d => {
    const data = d.data();
    const str = JSON.stringify(data).toLowerCase();
    if (str.includes("sawen") || str.includes("sawin")) {
      console.log("User:", d.id, data);
    }
  });

  console.log("\n=== CHECKING TEAM_MEMBERS ===");
  const tmSnap = await getDocs(collection(db, "team_members"));
  tmSnap.forEach(d => {
    const data = d.data();
    const str = JSON.stringify(data).toLowerCase();
    if (str.includes("sawen") || str.includes("sawin")) {
      console.log("Team Member:", d.id, data);
    }
  });

  console.log("\n=== CHECKING QUALITY_EVALUATIONS ===");
  const qeSnap = await getDocs(collection(db, "quality_evaluations"));
  qeSnap.forEach(d => {
    const data = d.data();
    const str = (d.id + " " + JSON.stringify(data)).toLowerCase();
    if (str.includes("sawen") || str.includes("sawin")) {
      console.log("Quality Eval:", d.id, "csr_name:", data.csr_name);
    }
  });
}
check().then(() => process.exit(0));
