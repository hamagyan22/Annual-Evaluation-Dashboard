import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
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

async function seedEvaluations() {
  console.log("Seeding real evaluations from user screenshots...");

  // 1. Kani Sami (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 1 & 2
  const kaniDocId = "2026_Semi-Annual_kani_sami";
  const kaniData = {
    employee_name: "Kani Sami",
    employee_id: "349",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 4,
      productivity: 3,
      attendance: 3,
      aht: 3,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 3,
      problem_solving: 4,
      accountability: 3,
      initiative: 2,
      responsibility: 4,
      team_work: 4
    },
    manager_kpis: {
      qa: 2,
      productivity: 2,
      attendance: 3,
      aht: 3,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 3,
      problem_solving: 3,
      accountability: 3,
      initiative: 3,
      responsibility: 4,
      team_work: 3
    },
    self_kpi_score: 3.40,
    self_comp_avg: 3.33,
    self_overall_score: 3.37,
    manager_kpi_score: 2.80,
    manager_comp_avg: 3.17,
    manager_overall_score: 2.98,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", kaniDocId), kaniData, { merge: true });
  console.log(`Saved evaluation for Kani Sami -> ${kaniDocId}`);

  // 2. Soma Muhammed (Chat Agent - Semi-Annual 2026 / H1 2026)
  // Images 3 & 4
  const somaData = {
    employee_name: "Soma Muhammed",
    employee_id: "371",
    team: "Mohammed Dlshad Team",
    team_leader: "Mohammed Dilshad",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "14/7/2026",
    status: "manager_finalized",
    self_kpis: {
      qa: 5,
      art: 3,
      attendance: 4,
      aht: 3,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 5,
      initiative: 3,
      responsibility: 4,
      team_work: 5
    },
    manager_kpis: {
      qa: 4,
      art: 4,
      attendance: 4,
      aht: 2,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 4,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 4,
      team_work: 5
    },
    self_kpi_score: 3.80,
    self_comp_avg: 4.50,
    self_overall_score: 4.15,
    manager_kpi_score: 3.60,
    manager_comp_avg: 3.50,
    manager_overall_score: 3.55,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  // Save under both soma_sherko and soma_muhammed for 100% slug compatibility
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_soma_sherko"), somaData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_soma_muhammed"), somaData, { merge: true });
  console.log(`Saved evaluation for Soma Muhammed -> 2026_Semi-Annual_soma_sherko and 2026_Semi-Annual_soma_muhammed`);

  // 3. Frmesk Younis (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 4 & 5
  const frmeskData = {
    employee_name: "Frmesk Younis",
    employee_id: "345",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 5,
      productivity: 5,
      attendance: 5,
      aht: 4,
      knowledge: 5,
      exam: 5
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 5,
      initiative: 4,
      responsibility: 4,
      team_work: 5
    },
    manager_kpis: {
      qa: 5,
      productivity: 3,
      attendance: 3,
      aht: 4,
      knowledge: 5,
      exam: 5
    },
    manager_competencies: {
      communication: 3,
      problem_solving: 4,
      accountability: 3,
      initiative: 5,
      responsibility: 3,
      team_work: 5
    },
    self_kpi_score: 4.80,
    self_comp_avg: 4.67,
    self_overall_score: 4.74,
    manager_kpi_score: 4.00,
    manager_comp_avg: 3.83,
    manager_overall_score: 3.92,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_frmesk_younis"), frmeskData, { merge: true });
  console.log(`Saved evaluation for Frmesk Younis -> 2026_Semi-Annual_frmesk_younis`);

  console.log("Seeding complete successfully!");
  process.exit(0);
}

seedEvaluations().catch(err => {
  console.error("Error seeding evaluations:", err);
  process.exit(1);
});
