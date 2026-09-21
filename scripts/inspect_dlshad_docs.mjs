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

async function inspect() {
  const snap = await getDocs(collection(db, "quality_evaluations"));
  snap.forEach(d => {
    if (d.id.includes("mohammed_dlshad")) {
      console.log(d.id, "=> csr_name:", d.data().csr_name, "section:", d.data().section, "sheet_name:", d.data().sheet_name);
    }
  });
}
inspect().then(() => process.exit(0));
