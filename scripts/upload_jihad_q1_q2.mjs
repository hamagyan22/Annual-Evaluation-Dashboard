import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
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

// Jihad call keys mapping for Q1 and Q2 (weeks 1-12)
// w1: call_1..call_6, w2: call_7..call_12, w3: call_13..call_18, w4: call_19..call_24, etc.
const amarScoresQ1 = {
  "w1_call_1": "100", "w1_call_2": "100", "w1_outbound": "92",
  "w2_call_7": "97", "w2_call_8": "95", "w2_outbound": "100",
  "w3_call_13": "100", "w3_call_14": "100", "w3_outbound": "89"
};
const amarScoresQ2 = {
  "w4_call_19": "100", "w4_call_20": "100", "w4_outbound": "92",
  "w5_call_25": "97", "w5_call_26": "95", "w5_outbound": "100",
  "w6_call_31": "100", "w6_call_32": "100", "w6_outbound": "89"
};
const salamScoresQ1 = {
  "w1_call_1": "100", "w1_call_2": "100", "w1_outbound": "100",
  "w2_call_7": "100", "w2_call_8": "100", "w2_outbound": "100"
};
const salamScoresQ2 = {
  "w4_call_19": "100", "w4_call_20": "100", "w4_outbound": "100",
  "w5_call_25": "100", "w5_call_26": "100", "w5_outbound": "100"
};

const jihadDocs = [
  {
    id: "2026_Q1_mohammed_jihad_amar_hussein",
    data: { year: "2026", quarter: "Q1", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Amar Hussein", scores: amarScoresQ1 }
  },
  {
    id: "2026_Q1_mohammed_jihad_amar_hussein_salih",
    data: { year: "2026", quarter: "Q1", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Amar Hussein Salih", scores: amarScoresQ1 }
  },
  {
    id: "2026_Q2_mohammed_jihad_amar_hussein",
    data: { year: "2026", quarter: "Q2", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Amar Hussein", scores: amarScoresQ2 }
  },
  {
    id: "2026_Q2_mohammed_jihad_amar_hussein_salih",
    data: { year: "2026", quarter: "Q2", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Amar Hussein Salih", scores: amarScoresQ2 }
  },
  {
    id: "2026_Q1_mohammed_jihad_salam_sadam",
    data: { year: "2026", quarter: "Q1", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Salam Sadam", scores: salamScoresQ1 }
  },
  {
    id: "2026_Q1_mohammed_jihad_salam_sadam_muhammad",
    data: { year: "2026", quarter: "Q1", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Salam Sadam Muhammad", scores: salamScoresQ1 }
  },
  {
    id: "2026_Q2_mohammed_jihad_salam_sadam",
    data: { year: "2026", quarter: "Q2", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Salam Sadam", scores: salamScoresQ2 }
  },
  {
    id: "2026_Q2_mohammed_jihad_salam_sadam_muhammad",
    data: { year: "2026", quarter: "Q2", evaluator: "Mohammed Jihad", team: "Younis Kamal Team", csr_name: "Salam Sadam Muhammad", scores: salamScoresQ2 }
  }
];

async function uploadJihad() {
  for (const item of jihadDocs) {
    await setDoc(doc(db, "quality_evaluations", item.id), item.data, { merge: true });
    console.log(`Uploaded Jihad ${item.id} successfully.`);
  }
}

uploadJihad().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
