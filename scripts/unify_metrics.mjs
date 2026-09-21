import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, updateDoc } from "firebase/firestore";
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

const NAME_MAP = {
  "Zhala Sherzad": "Zhalla Sherzad",
  "kani sami": "Kani Sami",
  "Azad muhammad": "Azad Muhammad",
  "Dhuha khanjer": "Dhuha Khanjer"
};

async function updateMetrics() {
  for (const c of ["younis_metrics", "ankido_metrics"]) {
    const snap = await getDocs(collection(db, c));
    for (const d of snap.docs) {
      const data = d.data();
      const n = data.agent_name || data.agent || data.name;
      if (NAME_MAP[n]) {
        await updateDoc(doc(db, c, d.id), {
          agent_name: NAME_MAP[n],
          ...(data.agent ? { agent: NAME_MAP[n] } : {}),
          ...(data.name ? { name: NAME_MAP[n] } : {})
        });
        console.log(`Updated ${c}/${d.id}: "${n}" -> "${NAME_MAP[n]}"`);
      }
    }
  }
}

updateMetrics().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
