import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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

const pairs = [
  {
    from: "2025_Q2_lara_kamil_sawin_sartib",
    to: "2025_Q2_lara_kamil_sawen",
  },
  {
    from: "2025_Q4_lara_kamil_sawin_sartib",
    to: "2025_Q4_lara_kamil_sawen",
  },
  {
    from: "2026_Q1_lara_kamil_sawin_sartib",
    to: "2026_Q1_lara_kamil_sawen",
  },
  {
    from: "2026_Q1_mohammed_dlshad_sawin_sartib",
    to: "2026_Q1_mohammed_dlshad_sawen",
  },
  {
    from: "2026_Q2_mohammed_dlshad_sawin_sartib",
    to: "2026_Q2_mohammed_dlshad_sawen",
  },
  {
    from: "2026_Q3_mohammed_dlshad_sawin_sartib",
    to: "2026_Q3_mohammed_dlshad_sawen",
  },
  {
    from: "2026_Q3_mohammed_dlshad_bonus_sawin_sartib",
    to: "2026_Q3_mohammed_dlshad_bonus_sawen",
  },
  {
    from: "2026_Q3_mohammed_azad_sawin_sartib",
    to: "2026_Q3_mohammed_azad_sawen",
  },
];

async function runMerge() {
  console.log("Starting merge of sawin_sartib -> sawen in quality_evaluations...");

  for (const { from, to } of pairs) {
    console.log(`\nProcessing ${from} -> ${to}...`);
    const fromSnap = await getDoc(doc(db, "quality_evaluations", from));
    if (!fromSnap.exists()) {
      console.log(`Source doc ${from} does not exist, skipping.`);
      continue;
    }
    const fromData = fromSnap.data();

    const toSnap = await getDoc(doc(db, "quality_evaluations", to));
    let finalData;

    if (toSnap.exists()) {
      const toData = toSnap.data();
      // Merge scores: keep toData scores if present, fallback to fromData
      const mergedScores = { ...(fromData.scores || {}), ...(toData.scores || {}) };
      const mergedNotes = { ...(fromData.notes || {}), ...(toData.notes || {}) };
      const mergedLinks = { ...(fromData.links || {}), ...(toData.links || {}) };

      finalData = {
        ...fromData,
        ...toData,
        csr_name: "Sawen",
        scores: mergedScores,
        notes: mergedNotes,
        links: mergedLinks,
        updated_at: new Date().toISOString(),
      };
      console.log(`Merged existing ${to} with ${from}. Score count: ${Object.keys(mergedScores).length}`);
    } else {
      // Just copy fromData, update csr_name to Sawen
      finalData = {
        ...fromData,
        csr_name: "Sawen",
        updated_at: new Date().toISOString(),
      };
      console.log(`Created new ${to} from ${from}. Score count: ${Object.keys(finalData.scores || {}).length}`);
    }

    // Save target doc
    await setDoc(doc(db, "quality_evaluations", to), finalData);
    console.log(`Successfully written ${to}`);

    // Delete source doc
    await deleteDoc(doc(db, "quality_evaluations", from));
    console.log(`Successfully deleted ${from}`);
  }

  console.log("\nAll sawin_sartib documents successfully merged and cleaned up!");
}

runMerge().then(() => process.exit(0)).catch(err => {
  console.error("Error during merge:", err);
  process.exit(1);
});
