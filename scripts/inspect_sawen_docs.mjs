import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

const ids = [
  "2026_Q1_mohammed_dlshad_sawen",
  "2026_Q1_mohammed_dlshad_sawin_sartib",
  "2026_Q2_mohammed_dlshad_sawen",
  "2026_Q2_mohammed_dlshad_sawin_sartib",
  "2026_Q3_mohammed_dlshad_bonus_sawen",
  "2026_Q3_mohammed_dlshad_bonus_sawin_sartib",
  "2026_Q3_mohammed_dlshad_sawen",
  "2026_Q3_mohammed_dlshad_sawin_sartib",
  "2026_Q3_mohammed_azad_sawin_sartib",
];

async function inspectDocs() {
  for (const id of ids) {
    const s = await getDoc(doc(db, "quality_evaluations", id));
    if (s.exists()) {
      console.log(`\n=== ${id} ===`);
      console.log("scores:", JSON.stringify(s.data().scores));
      console.log("notes:", JSON.stringify(s.data().notes));
    } else {
      console.log(`\n=== ${id} (DOES NOT EXIST) ===`);
    }
  }
}
inspectDocs().then(() => process.exit(0));
