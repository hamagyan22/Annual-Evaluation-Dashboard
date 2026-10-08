import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, query, where } from "firebase/firestore";
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

async function testQuery() {
  const qUpper = query(collection(db, "younis_metrics"), where("year", "==", "2026"), where("month", "==", "SEP"));
  const snapUpper = await getDocs(qUpper);
  console.log(`younis_metrics with month='SEP': ${snapUpper.size} docs`);

  const qTitle = query(collection(db, "younis_metrics"), where("year", "==", "2026"), where("month", "==", "Sep"));
  const snapTitle = await getDocs(qTitle);
  console.log(`younis_metrics with month='Sep': ${snapTitle.size} docs`);

  const qLower = query(collection(db, "younis_metrics"), where("year", "==", "2026"), where("month", "==", "sep"));
  const snapLower = await getDocs(qLower);
  console.log(`younis_metrics with month='sep': ${snapLower.size} docs`);
}

testQuery().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
