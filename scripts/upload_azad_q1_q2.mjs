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

const docsToUpload = [
  // Amar Hussein - Azad Q1
  {
    id: "2026_Q1_mohammed_azad_amar_hussein",
    data: {
      year: "2026",
      quarter: "Q1",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Amar Hussein",
      scores: {
        "1": "100", "2": "100", "3": "92", "4": "97", "5": "95",
        "6": "100", "7": "100", "8": "100", "9": "89"
      },
      notes: {},
      links: {}
    }
  },
  {
    id: "2026_Q1_mohammed_azad_amar_hussein_salih",
    data: {
      year: "2026",
      quarter: "Q1",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Amar Hussein Salih",
      scores: {
        "1": "100", "2": "100", "3": "92", "4": "97", "5": "95",
        "6": "100", "7": "100", "8": "100", "9": "89"
      },
      notes: {},
      links: {}
    }
  },
  // Amar Hussein - Azad Q2
  {
    id: "2026_Q2_mohammed_azad_amar_hussein",
    data: {
      year: "2026",
      quarter: "Q2",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Amar Hussein",
      scores: {
        "1": "100", "2": "100", "3": "92", "4": "97", "5": "95",
        "6": "100", "7": "100", "8": "100", "9": "89"
      },
      notes: {},
      links: {}
    }
  },
  {
    id: "2026_Q2_mohammed_azad_amar_hussein_salih",
    data: {
      year: "2026",
      quarter: "Q2",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Amar Hussein Salih",
      scores: {
        "1": "100", "2": "100", "3": "92", "4": "97", "5": "95",
        "6": "100", "7": "100", "8": "100", "9": "89"
      },
      notes: {},
      links: {}
    }
  },
  // Salam Sadam - Azad Q1
  {
    id: "2026_Q1_mohammed_azad_salam_sadam",
    data: {
      year: "2026",
      quarter: "Q1",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Salam Sadam",
      scores: {
        "1": "100", "2": "100", "3": "100", "4": "100", "5": "100", "6": "100"
      },
      notes: {},
      links: {}
    }
  },
  {
    id: "2026_Q1_mohammed_azad_salam_sadam_muhammad",
    data: {
      year: "2026",
      quarter: "Q1",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Salam Sadam Muhammad",
      scores: {
        "1": "100", "2": "100", "3": "100", "4": "100", "5": "100", "6": "100"
      },
      notes: {},
      links: {}
    }
  },
  // Salam Sadam - Azad Q2
  {
    id: "2026_Q2_mohammed_azad_salam_sadam",
    data: {
      year: "2026",
      quarter: "Q2",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Salam Sadam",
      scores: {
        "1": "100", "2": "100", "3": "100", "4": "100", "5": "100", "6": "100"
      },
      notes: {},
      links: {}
    }
  },
  {
    id: "2026_Q2_mohammed_azad_salam_sadam_muhammad",
    data: {
      year: "2026",
      quarter: "Q2",
      evaluator: "Mohammed Azad",
      team: "All Call Teams",
      csr_name: "Salam Sadam Muhammad",
      scores: {
        "1": "100", "2": "100", "3": "100", "4": "100", "5": "100", "6": "100"
      },
      notes: {},
      links: {}
    }
  }
];

async function upload() {
  for (const item of docsToUpload) {
    await setDoc(doc(db, "quality_evaluations", item.id), item.data, { merge: true });
    console.log(`Uploaded ${item.id} successfully.`);
  }
  console.log("All Azad Q1 & Q2 evaluations for Amar & Salam uploaded successfully.");
}

upload().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
