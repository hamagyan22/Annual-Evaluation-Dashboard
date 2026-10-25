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

  // 4. Muzhda Omar Ali (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 1 & 2 (ID: 358)
  const muzhdaData = {
    employee_name: "Muzhda Omar Ali",
    employee_id: "358",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 3,
      productivity: 5,
      attendance: 5,
      aht: 1,
      knowledge: 5,
      exam: 5
    },
    self_competencies: {
      communication: 4,
      problem_solving: 4,
      accountability: 4,
      initiative: 3,
      responsibility: 5,
      team_work: 4
    },
    manager_kpis: {
      qa: 3,
      productivity: 4,
      attendance: 3,
      aht: 2,
      knowledge: 5,
      exam: 5
    },
    manager_competencies: {
      communication: 3,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 3,
      team_work: 3
    },
    self_kpi_score: 3.80,
    self_comp_avg: 4.00,
    self_overall_score: 3.90,
    manager_kpi_score: 3.40,
    manager_comp_avg: 2.83,
    manager_overall_score: 3.12,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_muzhda_omar_ali"), muzhdaData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_muzhda_omar"), muzhdaData, { merge: true });
  console.log(`Saved evaluation for Muzhda Omar Ali -> 2026_Semi-Annual_muzhda_omar_ali & muzhda_omar`);

  // 5. Rasan Ismail Musa (Chat Agent - Semi-Annual 2026 / H1 2026)
  // Images 3 & 4 (ID: 365)
  const rasanData = {
    employee_name: "Rasan Ismail Musa",
    employee_id: "365",
    team: "Mohammed Dlshad Team",
    team_leader: "Mohammed Dilshad",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 5,
      art: 5,
      attendance: 4,
      aht: 5,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 4,
      initiative: 1,
      responsibility: 4,
      team_work: 5
    },
    manager_kpis: {
      qa: 5,
      art: 5,
      attendance: 4,
      aht: 5,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 4,
      problem_solving: 3,
      accountability: 4,
      initiative: 1,
      responsibility: 4,
      team_work: 5
    },
    self_kpi_score: 4.60,
    self_comp_avg: 4.00,
    self_overall_score: 4.30,
    manager_kpi_score: 4.60,
    manager_comp_avg: 3.50,
    manager_overall_score: 4.05,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_rassan_ismail"), rasanData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_rasan_ismail"), rasanData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_rasan_ismail_musa"), rasanData, { merge: true });
  console.log(`Saved evaluation for Rasan Ismail Musa -> 2026_Semi-Annual_rassan_ismail, rasan_ismail, rasan_ismail_musa`);

  // 6. Aya Yasin (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 1 & 2 (ID: 341)
  const ayaData = {
    employee_name: "Aya Yasin",
    employee_id: "341",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 5,
      productivity: 4,
      attendance: 4,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 3,
      problem_solving: 4,
      accountability: 3,
      initiative: 1,
      responsibility: 4,
      team_work: 3
    },
    manager_kpis: {
      qa: 5,
      productivity: 4,
      attendance: 3,
      aht: 4,
      knowledge: 5,
      exam: 5
    },
    manager_competencies: {
      communication: 5,
      problem_solving: 4,
      accountability: 3,
      initiative: 1,
      responsibility: 4,
      team_work: 4
    },
    self_kpi_score: 4.20,
    self_comp_avg: 3.00,
    self_overall_score: 3.60,
    manager_kpi_score: 4.20,
    manager_comp_avg: 3.50,
    manager_overall_score: 3.85,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_aya_yasin"), ayaData, { merge: true });
  console.log(`Saved evaluation for Aya Yasin -> 2026_Semi-Annual_aya_yasin`);

  // 7. Lana Halmat Rafeeq (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 3 & 4 (ID: 350)
  const lanaData = {
    employee_name: "Lana Halmat Rafeeq",
    employee_id: "350",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 4,
      productivity: 3,
      attendance: 5,
      aht: 5,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 5,
      initiative: 5,
      responsibility: 5,
      team_work: 5
    },
    manager_kpis: {
      qa: 4,
      productivity: 3,
      attendance: 3,
      aht: 5,
      knowledge: 3,
      exam: 3
    },
    manager_competencies: {
      communication: 3,
      problem_solving: 5,
      accountability: 3,
      initiative: 2,
      responsibility: 3,
      team_work: 5
    },
    self_kpi_score: 4.20,
    self_comp_avg: 5.00,
    self_overall_score: 4.60,
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

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_lana_halmat_rafeeq"), lanaData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_lana_halmat"), lanaData, { merge: true });
  console.log(`Saved evaluation for Lana Halmat Rafeeq -> 2026_Semi-Annual_lana_halmat_rafeeq & lana_halmat`);

  // 8. Zainab Khalid Rasheed (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 2 & 3 (ID: 376)
  const zainabData = {
    employee_name: "Zainab Khalid Rasheed",
    employee_id: "376",
    team: "Ankido Buya Team",
    team_leader: "Ankido Buya",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 4,
      productivity: 3,
      attendance: 5,
      aht: 2,
      knowledge: 3,
      exam: 3
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 3,
      initiative: 5,
      responsibility: 4,
      team_work: 5
    },
    manager_kpis: {
      qa: 4,
      productivity: 3,
      attendance: 2,
      aht: 2,
      knowledge: 5,
      exam: 5
    },
    manager_competencies: {
      communication: 5,
      problem_solving: 3,
      accountability: 3,
      initiative: 2,
      responsibility: 4,
      team_work: 5
    },
    self_kpi_score: 3.40,
    self_comp_avg: 4.50,
    self_overall_score: 3.95,
    manager_kpi_score: 3.20,
    manager_comp_avg: 3.67,
    manager_overall_score: 3.43,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_zainab_khalid_rasheed"), zainabData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_zainab_khalid"), zainabData, { merge: true });
  console.log(`Saved evaluation for Zainab Khalid Rasheed -> 2026_Semi-Annual_zainab_khalid_rasheed & zainab_khalid`);

  // 9. Mokhalad Ali (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 4 & 5 (ID: 507)
  const mokhaladData = {
    employee_name: "Mokhalad Ali",
    employee_id: "507",
    team: "Younis Kamal Team",
    team_leader: "Younis Kamal",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "17/7/2026",
    status: "manager_finalized",
    self_kpis: {
      qa: 4,
      productivity: 1,
      attendance: 5,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 5,
      initiative: 5,
      responsibility: 5,
      team_work: 5
    },
    manager_kpis: {
      qa: 4,
      productivity: 2,
      attendance: 5,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 5,
      problem_solving: 3,
      accountability: 5,
      initiative: 4,
      responsibility: 5,
      team_work: 5
    },
    self_kpi_score: 3.60,
    self_comp_avg: 5.00,
    self_overall_score: 4.30,
    manager_kpi_score: 3.80,
    manager_comp_avg: 4.50,
    manager_overall_score: 4.15,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_mokhalad_ali"), mokhaladData, { merge: true });
  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_mukhalad_ali"), mokhaladData, { merge: true });
  console.log(`Saved evaluation for Mokhalad Ali -> 2026_Semi-Annual_mokhalad_ali & mukhalad_ali`);

  // 10. Akar Omer (Chat Agent - Semi-Annual 2026 / H1 2026)
  // Images 1 & 2 (ID: 337)
  const akarData = {
    employee_name: "Akar Omer",
    employee_id: "337",
    team: "Mohammed Dlshad Team",
    team_leader: "Mohammed Dilshad",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "",
    status: "manager_finalized",
    self_kpis: {
      qa: 5,
      art: 4,
      attendance: 4,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 4,
      problem_solving: 4,
      accountability: 4,
      initiative: 4,
      responsibility: 4,
      team_work: 5
    },
    manager_kpis: {
      qa: 5,
      art: 4,
      attendance: 4,
      aht: 3,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 5,
      problem_solving: 5,
      accountability: 5,
      initiative: 5,
      responsibility: 5,
      team_work: 5
    },
    self_kpi_score: 4.20,
    self_comp_avg: 4.17,
    self_overall_score: 4.18,
    manager_kpi_score: 4.00,
    manager_comp_avg: 5.00,
    manager_overall_score: 4.50,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_akar_omer"), akarData, { merge: true });
  console.log(`Saved evaluation for Akar Omer -> 2026_Semi-Annual_akar_omer`);

  // 11. Kazhvan Wirya (Call Agent - Semi-Annual 2026 / H1 2026)
  // Images 3 & 4 (ID: 575)
  const kazhvanData = {
    employee_name: "Kazhvan Wirya",
    employee_id: "575",
    team: "Younis Kamal Team",
    team_leader: "Younis Kamal",
    department: "Contact Center",
    review_period: "H1 2026",
    evaluation_date: "17/7/2026",
    status: "manager_finalized",
    self_kpis: {
      qa: 3,
      productivity: 1,
      attendance: 5,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    self_competencies: {
      communication: 4,
      problem_solving: 5,
      accountability: 5,
      initiative: 3,
      responsibility: 5,
      team_work: 5
    },
    manager_kpis: {
      qa: 2,
      productivity: 1,
      attendance: 4,
      aht: 4,
      knowledge: 4,
      exam: 4
    },
    manager_competencies: {
      communication: 4,
      problem_solving: 3,
      accountability: 3,
      initiative: 3,
      responsibility: 3,
      team_work: 5
    },
    self_kpi_score: 3.40,
    self_comp_avg: 4.50,
    self_overall_score: 3.95,
    manager_kpi_score: 3.00,
    manager_comp_avg: 3.50,
    manager_overall_score: 3.25,
    manager_comments: "",
    self_comments: "",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Official Import (H1 2026)",
    manager_submitted_at: new Date().toISOString(),
    self_submitted_at: new Date().toISOString()
  };

  await setDoc(doc(db, "annual_evaluations", "2026_Semi-Annual_kazhvan_wirya"), kazhvanData, { merge: true });
  console.log(`Saved evaluation for Kazhvan Wirya -> 2026_Semi-Annual_kazhvan_wirya`);

  console.log("Seeding complete successfully!");
  process.exit(0);
}

seedEvaluations().catch(err => {
  console.error("Error seeding evaluations:", err);
  process.exit(1);
});
