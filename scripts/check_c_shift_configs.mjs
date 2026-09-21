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

async function check() {
  const r1 = await getDoc(doc(db, "quality_evaluations", "config_c_shift_roster"));
  console.log("config_c_shift_roster:", JSON.stringify(r1.data()));

  const r2 = await getDoc(doc(db, "quality_evaluations", "config_c_shift_weekly"));
  console.log("config_c_shift_weekly:", JSON.stringify(r2.data()));
}
check().then(() => process.exit(0));
