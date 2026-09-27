import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where } from "firebase/firestore";
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

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function getMonthWeekRange(mIdx) {
  const qIdx = Math.floor(mIdx / 3);
  const quarter = ["Q1", "Q2", "Q3", "Q4"][qIdx];
  const monthInQ = mIdx % 3;
  const weekStart = monthInQ * 4 + 1;
  const weekEnd = monthInQ === 2 ? 12 : monthInQ * 4 + 4;
  return { quarter, weekStart, weekEnd };
}

const SECTIONS = [
  { id: "mohammed_dlshad", team: "Mohammed Dlshad Team", table: "mohammed_metrics" },
  { id: "mohammed_jihad", team: "Younis Kamal Team", table: "younis_metrics" },
  { id: "lara_kamil", team: "Ankido Buya Team", table: "ankido_metrics" },
];

async function syncAll() {
  console.log("Starting full sync of completed months from quality_evaluations to team metrics...");

  const evalSnap = await getDocs(collection(db, "quality_evaluations"));
  const evalData = {};
  evalSnap.forEach((d) => { evalData[d.id] = d.data(); });

  let totalSynced = 0;
  const year = "2026";

  for (const sec of SECTIONS) {
    console.log(`\n--- Processing section: ${sec.id} (${sec.team}) ---`);
    const prefix = `${year}_`;
    
    // Find all agents who have evaluations in this section
    const sectionAgents = new Set();
    for (const [docId, d] of Object.entries(evalData)) {
      if (docId.includes(`_${sec.id}_`) && !docId.includes("_bonus_") && !docId.includes("_c_shift_") && d.csr_name) {
        sectionAgents.add(d.csr_name.trim());
      }
    }

    console.log(`Found ${sectionAgents.size} agents for ${sec.id}`);

    for (const agentName of sectionAgents) {
      const slug = agentName.toLowerCase().replace(/[^a-z0-9]/g, "_");

      // Sync only from Month 9 (SEP, index 8) onwards for 2026; JAN-AUG retain manual data
      for (let mIdx = 8; mIdx < MONTHS.length; mIdx++) {
        const mName = MONTHS[mIdx];
        const { quarter, weekStart, weekEnd } = getMonthWeekRange(mIdx);
        const docId = `${year}_${quarter}_${sec.id}_${slug}`;
        const docData = evalData[docId];
        if (!docData) continue;

        const scores = docData.scores || {};
        let allWeeksFilled = true;
        let sumQ = 0;
        let cntQ = 0;
        let hasV = false;

        for (let w = weekStart; w <= weekEnd; w++) {
          let weekHasEntry = false;
          const weekPrefix = `w${w}_`;
          for (const [k, v] of Object.entries(scores)) {
            if (k.startsWith(weekPrefix) && v !== undefined && v !== null) {
              const s = String(v).trim();
              if (s !== "" && s !== "-") {
                weekHasEntry = true;
                const upper = s.toUpperCase();
                if (upper === "V") {
                  hasV = true;
                } else if (upper !== "S" && !upper.includes("N/A") && upper !== "NA") {
                  const n = parseFloat(s);
                  if (!isNaN(n)) {
                    sumQ += n;
                    cntQ++;
                  }
                }
              }
            }
          }
          if (!weekHasEntry) {
            allWeeksFilled = false;
            break;
          }
        }

        if (allWeeksFilled) {
          const verifiedAvg = cntQ > 0 ? (sumQ / cntQ).toFixed(1) : (hasV ? "V" : "");
          if (verifiedAvg) {
            const q = query(
              collection(db, sec.table),
              where("agent_name", "==", agentName),
              where("month", "==", mName),
              where("year", "==", year)
            );
            const mSnap = await getDocs(q);
            if (!mSnap.empty) {
              const existingDoc = mSnap.docs[0];
              if (existingDoc.data().quality !== verifiedAvg) {
                await updateDoc(doc(db, sec.table, existingDoc.id), { quality: verifiedAvg });
                console.log(`Updated ${sec.table} for ${agentName} [${mName}]: ${existingDoc.data().quality} -> ${verifiedAvg}`);
                totalSynced++;
              }
            } else {
              await addDoc(collection(db, sec.table), {
                agent_name: agentName,
                team: sec.team,
                month: mName,
                year,
                quality: verifiedAvg,
                display_name: agentName,
              });
              console.log(`Created new ${sec.table} entry for ${agentName} [${mName}]: ${verifiedAvg}`);
              totalSynced++;
            }
          }
        }
      }
    }
  }

  console.log(`\nSync complete! Total records updated/created: ${totalSynced}`);
}

syncAll()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error syncing:", err);
    process.exit(1);
  });
