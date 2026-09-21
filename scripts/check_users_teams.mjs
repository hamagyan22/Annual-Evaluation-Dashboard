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
  const uSnap = await getDocs(collection(db, "users"));
  console.log("=== USERS WITH DLSHAD OR JIHAD OR YOUNIS ===");
  uSnap.forEach(d => {
    const u = d.data();
    const str = JSON.stringify(u);
    if (str.toLowerCase().includes("dlshad") || str.toLowerCase().includes("jihad") || str.toLowerCase().includes("younis")) {
      console.log(d.id, "=>", u.name || u.display_name, "| team:", u.team, "| role:", u.role);
    }
  });
}
check().then(() => process.exit(0));
