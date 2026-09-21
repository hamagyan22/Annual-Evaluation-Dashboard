import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs } from "firebase/firestore";
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

async function run() {
  console.log("Starting database cleanup and name unification...");

  // 1. Delete CSR / Mohammad Dlshad from Mohammed Jihad
  const dlshadDocId = "2026_Q3_mohammed_jihad_bonus_csr_mohammad_dlshad";
  const dlshadRef = doc(db, "quality_evaluations", dlshadDocId);
  const dlshadSnap = await getDoc(dlshadRef);
  if (dlshadSnap.exists()) {
    await deleteDoc(dlshadRef);
    console.log(`✓ Deleted ${dlshadDocId}`);
  } else {
    console.log(`Notice: ${dlshadDocId} already does not exist`);
  }

  // 2. Helper to migrate/rename a quality_evaluations doc
  async function migrateDoc(oldId, newId, newCsrName) {
    const oldRef = doc(db, "quality_evaluations", oldId);
    const oldSnap = await getDoc(oldRef);
    if (!oldSnap.exists()) {
      console.log(`Old doc ${oldId} not found, skipping migration`);
      return;
    }
    const data = oldSnap.data();
    data.csr_name = newCsrName;

    // Check if new doc already exists, merge scores
    const newRef = doc(db, "quality_evaluations", newId);
    const newSnap = await getDoc(newRef);
    if (newSnap.exists()) {
      const existingData = newSnap.data();
      const mergedScores = { ...(data.scores || {}), ...(existingData.scores || {}) };
      const mergedNotes = { ...(data.notes || {}), ...(existingData.notes || {}) };
      const mergedLinks = { ...(data.links || {}), ...(existingData.links || {}) };
      await setDoc(newRef, {
        ...existingData,
        ...data,
        csr_name: newCsrName,
        scores: mergedScores,
        notes: mergedNotes,
        links: mergedLinks
      }, { merge: true });
      console.log(`✓ Merged ${oldId} into existing ${newId} with csr_name: "${newCsrName}"`);
    } else {
      await setDoc(newRef, data);
      console.log(`✓ Created ${newId} from ${oldId} with csr_name: "${newCsrName}"`);
    }
    await deleteDoc(oldRef);
    console.log(`✓ Deleted old doc ${oldId}`);
  }

  // Helper to update csr_name in place
  async function updateCsrName(docId, newCsrName) {
    const dRef = doc(db, "quality_evaluations", docId);
    const s = await getDoc(dRef);
    if (s.exists()) {
      await updateDoc(dRef, { csr_name: newCsrName });
      console.log(`✓ Updated ${docId} csr_name to "${newCsrName}"`);
    }
  }

  // 3. Shahab Ahmed -> Shahab Ahmed Muhammed
  await migrateDoc(
    "2026_Q3_mohammed_dlshad_c_shift_shahab_ahmed",
    "2026_Q3_mohammed_dlshad_c_shift_shahab_ahmed_muhammed",
    "Shahab Ahmed Muhammed"
  );
  await migrateDoc(
    "2026_Q1_mohammed_dlshad_c_shift_shahab_ahmed",
    "2026_Q1_mohammed_dlshad_c_shift_shahab_ahmed_muhammed",
    "Shahab Ahmed Muhammed"
  );
  await migrateDoc(
    "2026_Q2_mohammed_dlshad_c_shift_shahab_ahmed",
    "2026_Q2_mohammed_dlshad_c_shift_shahab_ahmed_muhammed",
    "Shahab Ahmed Muhammed"
  );
  await migrateDoc(
    "2026_Q3_mohammed_jihad_bonus_shahab_ahmed",
    "2026_Q3_mohammed_jihad_bonus_shahab_ahmed_muhammed",
    "Shahab Ahmed Muhammed"
  );

  // 4. Haneen Abd-Al Kareem (hannen iskandar -> Haneen Abd-Al Kareem)
  await migrateDoc(
    "2026_Q3_lara_kamil_bonus_hannen_iskandar",
    "2026_Q3_lara_kamil_bonus_haneen_abd_al_kareem",
    "Haneen Abd-Al Kareem"
  );

  // 5. Marwa Khaleel -> Marwa Khalil
  await migrateDoc(
    "2026_Q3_lara_kamil_bonus_marwa_khaleel",
    "2026_Q3_lara_kamil_bonus_marwa_khalil",
    "Marwa Khalil"
  );

  // 6. Mohammed Saman -> Mohammed Salem
  await migrateDoc(
    "2026_Q3_mohammed_jihad_bonus_mohammed_saman",
    "2026_Q3_mohammed_jihad_bonus_mohammed_salem",
    "Mohammed Salem"
  );

  // 7. Kazhvan wirya -> Kazhvan Wirya
  await updateCsrName("2026_Q3_mohammed_jihad_bonus_kazhvan_wirya", "Kazhvan Wirya");

  // 8. Zhalla Sherzad (unify Zhala Sherzad -> Zhalla Sherzad across all quarters)
  const zhalaDocs = [
    ["2026_Q1_lara_kamil_zhala_sherzad", "2026_Q1_lara_kamil_zhalla_sherzad"],
    ["2026_Q2_lara_kamil_zhala_sherzad", "2026_Q2_lara_kamil_zhalla_sherzad"],
    ["2026_Q3_lara_kamil_zhala_sherzad", "2026_Q3_lara_kamil_zhalla_sherzad"],
    ["2026_Q4_lara_kamil_zhala_sherzad", "2026_Q4_lara_kamil_zhalla_sherzad"],
  ];
  for (const [oldId, newId] of zhalaDocs) {
    await migrateDoc(oldId, newId, "Zhalla Sherzad");
  }

  // 9. Update team_members collection
  console.log("\nUpdating team_members...");
  const tmSnap = await getDocs(collection(db, "team_members"));
  for (const d of tmSnap.docs) {
    const data = d.data();
    const name = data.agent_name || data.name || "";
    let updatedName = null;

    if (name === "Zhala Sherzad") updatedName = "Zhalla Sherzad";
    else if (name === "Marwa Khaleel") updatedName = "Marwa Khalil";
    else if (name === "Shahab Ahmed") updatedName = "Shahab Ahmed Muhammed";
    else if (name === "Mohammed Saman") updatedName = "Mohammed Salem";
    else if (name.toLowerCase() === "kazhvan wirya" && name !== "Kazhvan Wirya") updatedName = "Kazhvan Wirya";
    else if (name === "kani sami") updatedName = "Kani Sami";
    else if (name === "Azad muhammad") updatedName = "Azad Muhammad";
    else if (name === "Dhuha khanjer") updatedName = "Dhuha Khanjer";

    if (updatedName) {
      await updateDoc(doc(db, "team_members", d.id), { agent_name: updatedName });
      console.log(`✓ Updated team_members doc ${d.id}: "${name}" -> "${updatedName}"`);
    }
  }

  // 10. Update users collection
  console.log("\nUpdating users collection...");
  const usersSnap = await getDocs(collection(db, "users"));
  for (const d of usersSnap.docs) {
    const data = d.data();
    const agentName = data.agent_name || data.name || "";
    let newAgentName = null;

    if (agentName === "Zhala Sherzad") newAgentName = "Zhalla Sherzad";
    else if (agentName === "Marwa Khaleel") newAgentName = "Marwa Khalil";
    else if (agentName === "Shahab Ahmed") newAgentName = "Shahab Ahmed Muhammed";
    else if (agentName === "Mohammed Saman") newAgentName = "Mohammed Salem";
    else if (agentName === "kani sami") newAgentName = "Kani Sami";
    else if (agentName === "Azad muhammad") newAgentName = "Azad Muhammad";
    else if (agentName === "Dhuha khanjer") newAgentName = "Dhuha Khanjer";

    if (newAgentName) {
      await updateDoc(doc(db, "users", d.id), { agent_name: newAgentName });
      console.log(`✓ Updated user ${d.id} (${data.email}): "${agentName}" -> "${newAgentName}"`);
    }
  }

  console.log("\nAll name unifications and cleanups completed successfully!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
