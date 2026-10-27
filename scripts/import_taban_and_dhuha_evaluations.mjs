import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDCRf_IlW8ryvFHD3cA7jcfWHjm-Uxt3Tg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cc-team-leader---agent-db.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cc-team-leader---agent-db",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cc-team-leader---agent-db.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "672512704857",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:672512704857:web:977137dae7eede7b490c48",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VZYDL73W1G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runImport() {
  console.log("Importing official evaluations for Taban Sirwan & Dhuha Khanjer...");

  const nowIso = new Date().toISOString();

  // 1. Taban Sirwan (Call Agent - Semi-Annual 2026)
  const tabanData = {
    year: "2026",
    period: "Semi-Annual",
    review_period: "H1 2026",
    employee_name: "Taban Sirwan",
    employee_id: "372",
    department: "Contact Center",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    channel_type: "calls",
    role_type: "agent",
    is_special_staff: false,
    evaluation_date: "19/7/2026",
    status: "manager_finalized",

    self_kpis: {
      qa: 5,
      productivity: 3,
      attendance: 3,
      aht: 4,
      knowledge: 3,
      exam: 3
    },
    self_competencies: {
      communication: 3,
      problem_solving: 3,
      accountability: 5,
      initiative: 2,
      responsibility: 5,
      team_work: 3
    },
    self_kpi_avg: 3.60,
    self_competency_avg: 3.50,
    self_overall_score: 3.55,
    self_comments: "",

    manager_kpis: {
      qa: 5,
      productivity: 3,
      attendance: 3,
      aht: 4,
      knowledge: 3,
      exam: 3
    },
    manager_competencies: {
      communication: 3,
      problem_solving: 3,
      accountability: 5,
      initiative: 2,
      responsibility: 5,
      team_work: 3
    },
    manager_kpi_avg: 3.60,
    manager_competency_avg: 3.50,
    manager_overall_score: 3.55,
    manager_strengths: "",
    manager_improvements: "",
    manager_comments: "",

    manager_submitted_at: nowIso,
    self_submitted_at: nowIso,
    updated_at: nowIso,
    last_modified_by: "Official Import (H1 2026 Excel Sheet)"
  };

  const tabanDocId = "2026_Semi-Annual_taban_sirwan";
  await setDoc(doc(db, "annual_evaluations", tabanDocId), tabanData, { merge: true });
  console.log(`Successfully saved Taban Sirwan to: annual_evaluations/${tabanDocId}`);

  // 2. Dhuha Khanjer Noori (Chat Agent - Semi-Annual 2026)
  const dhuhaData = {
    year: "2026",
    period: "Semi-Annual",
    review_period: "H1 2026",
    employee_name: "Dhuha Khanjer",
    employee_id: "344",
    department: "Contact Center",
    team: "Mohammed Dlshad Team",
    team_leader: "Mohammed Dilshad",
    channel_type: "chat",
    role_type: "agent",
    is_special_staff: false,
    evaluation_date: "19/7/2026",
    status: "manager_finalized",

    self_kpis: {
      qa: 4,
      art: 3,
      attendance: 3,
      aht: 1,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 3,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 4,
      team_work: 4
    },
    self_kpi_avg: 3.00,
    self_competency_avg: 3.17,
    self_overall_score: 3.08,
    self_comments: "",

    manager_kpis: {
      qa: 4,
      art: 3,
      attendance: 3,
      aht: 1,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 3,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 4,
      team_work: 4
    },
    manager_kpi_avg: 3.00,
    manager_competency_avg: 3.17,
    manager_overall_score: 3.08,
    manager_strengths: "",
    manager_improvements: "",
    manager_comments: "",

    manager_submitted_at: nowIso,
    self_submitted_at: nowIso,
    updated_at: nowIso,
    last_modified_by: "Official Import (H1 2026 Excel Sheet)"
  };

  const dhuhaDocId = "2026_Semi-Annual_dhuha_khanjer";
  await setDoc(doc(db, "annual_evaluations", dhuhaDocId), dhuhaData, { merge: true });
  console.log(`Successfully saved Dhuha Khanjer to: annual_evaluations/${dhuhaDocId}`);

  // Alias for Dhuha Khanjer Noori
  const dhuhaNooriDocId = "2026_Semi-Annual_dhuha_khanjer_noori";
  await setDoc(doc(db, "annual_evaluations", dhuhaNooriDocId), {
    ...dhuhaData,
    employee_name: "Dhuha khanjer noori"
  }, { merge: true });
  console.log(`Successfully saved Dhuha Khanjer Noori alias to: annual_evaluations/${dhuhaNooriDocId}`);

  // 3. Rabar Mohammed (Call Agent - Semi-Annual 2026)
  const rabarData = {
    year: "2026",
    period: "Semi-Annual",
    review_period: "H1 2026",
    employee_name: "Rabar Mohammed",
    employee_id: "364",
    department: "Contact Center",
    team: "Younis Kamal Team",
    team_leader: "Younis Kamal",
    channel_type: "calls",
    role_type: "agent",
    is_special_staff: false,
    evaluation_date: "19/7/2026",
    status: "manager_finalized",

    self_kpis: {
      qa: 3,
      productivity: 2,
      attendance: 4,
      aht: 5,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 5,
      problem_solving: 3,
      accountability: 3,
      initiative: 4,
      responsibility: 3,
      team_work: 5
    },
    self_kpi_avg: 3.60,
    self_competency_avg: 3.83,
    self_overall_score: 3.72,
    self_comments: "",

    manager_kpis: {
      qa: 3,
      productivity: 2,
      attendance: 5,
      aht: 5,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 5,
      problem_solving: 4,
      accountability: 5,
      initiative: 5,
      responsibility: 4,
      team_work: 5
    },
    manager_kpi_avg: 3.80,
    manager_competency_avg: 4.67,
    manager_overall_score: 4.24,
    manager_strengths: "",
    manager_improvements: "",
    manager_comments: "",

    manager_submitted_at: nowIso,
    self_submitted_at: nowIso,
    updated_at: nowIso,
    last_modified_by: "Official Import (H1 2026 Excel Sheet)"
  };

  const rabarDocId = "2026_Semi-Annual_rabar_mohammed";
  await setDoc(doc(db, "annual_evaluations", rabarDocId), rabarData, { merge: true });
  console.log(`Successfully saved Rabar Mohammed to: annual_evaluations/${rabarDocId}`);

  // 4. Alla Satar (Call Agent - Semi-Annual 2026)
  const allaData = {
    year: "2026",
    period: "Semi-Annual",
    review_period: "H1 2026",
    employee_name: "Alla Satar",
    employee_id: "339",
    department: "Contact Center",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    channel_type: "calls",
    role_type: "agent",
    is_special_staff: false,
    evaluation_date: "19/7/2026",
    status: "manager_finalized",

    self_kpis: {
      qa: 3,
      productivity: 2,
      attendance: 3,
      aht: 5,
      knowledge: 2,
      exam: 2
    },
    self_competencies: {
      communication: 4,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 5,
      team_work: 5
    },
    self_kpi_avg: 3.00,
    self_competency_avg: 3.67,
    self_overall_score: 3.33,
    self_comments: "",

    manager_kpis: {
      qa: 3,
      productivity: 2,
      attendance: 3,
      aht: 5,
      knowledge: 2,
      exam: 2
    },
    manager_competencies: {
      communication: 4,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 5,
      team_work: 5
    },
    manager_kpi_avg: 3.00,
    manager_competency_avg: 3.67,
    manager_overall_score: 3.33,
    manager_strengths: "",
    manager_improvements: "",
    manager_comments: "",

    manager_submitted_at: nowIso,
    self_submitted_at: nowIso,
    updated_at: nowIso,
    last_modified_by: "Official Import (H1 2026 Excel Sheet)"
  };

  const allaDocId = "2026_Semi-Annual_alla_satar";
  await setDoc(doc(db, "annual_evaluations", allaDocId), allaData, { merge: true });
  console.log(`Successfully saved Alla Satar to: annual_evaluations/${allaDocId}`);

  // 5. Zhalla Salam (Call Agent - Semi-Annual 2026)
  const zhallaData = {
    year: "2026",
    period: "Semi-Annual",
    review_period: "H1 2026",
    employee_name: "Zhalla Salam",
    employee_id: "377",
    department: "Contact Center",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    channel_type: "calls",
    role_type: "agent",
    is_special_staff: false,
    evaluation_date: "19/7/2026",
    status: "manager_finalized",

    self_kpis: {
      qa: 5,
      productivity: 3,
      attendance: 3,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 5,
      initiative: 2,
      responsibility: 5,
      team_work: 5
    },
    self_kpi_avg: 3.70,
    self_competency_avg: 4.50,
    self_overall_score: 4.10,
    self_comments: "",

    manager_kpis: {
      qa: 4,
      productivity: 4,
      attendance: 5,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 5,
      problem_solving: 3.5,
      accountability: 3.5,
      initiative: 4,
      responsibility: 4,
      team_work: 5
    },
    manager_kpi_avg: 4.00,
    manager_competency_avg: 4.17,
    manager_overall_score: 4.08,
    manager_strengths: "",
    manager_improvements: "",
    manager_comments: "",

    manager_submitted_at: nowIso,
    self_submitted_at: nowIso,
    updated_at: nowIso,
    last_modified_by: "Official Import (H1 2026 Excel Sheet)"
  };

  const zhallaDocId = "2026_Semi-Annual_zhalla_salam";
  await setDoc(doc(db, "annual_evaluations", zhallaDocId), zhallaData, { merge: true });
  console.log(`Successfully saved Zhalla Salam to: annual_evaluations/${zhallaDocId}`);

  console.log("All evaluations imported successfully!");
  process.exit(0);
}

runImport().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
