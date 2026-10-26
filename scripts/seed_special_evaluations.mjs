import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCRf_IlW8ryvFHD3cA7jcfWHjm-Uxt3Tg",
  authDomain: "cc-team-leader---agent-db.firebaseapp.com",
  projectId: "cc-team-leader---agent-db",
  storageBucket: "cc-team-leader---agent-db.firebasestorage.app",
  messagingSenderId: "672512704857",
  appId: "1:672512704857:web:977137dae7eede7b490c48",
  measurementId: "G-VZYDL73W1G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const evaluations = [
  {
    docId: "2026_Semi-Annual_mohammed_azad",
    data: {
      year: "2026",
      period: "Semi-Annual",
      employee_name: "Mohammed Azad",
      employee_id: "353",
      department: "Training",
      team: "Training Team",
      team_leader: "Jalal Burghol",
      role_type: "trainer",
      evaluation_date: "2026-07-25",
      self_kpis: {
        training_delivery: 3,
        knowledge_assessment: 4,
        training_materials: 3,
        jira_reporting: 4,
        attendance_engagement: 4
      },
      self_kpi_avg: 3.6,
      self_competencies: {
        communication: 4,
        problem_solving: 4,
        accountability: 4,
        initiative: 4,
        responsibility: 4,
        team_work: 4
      },
      self_competency_avg: 4.0,
      self_overall_score: 3.8,
      self_comments: "",
      manager_kpis: {},
      manager_competencies: {},
      manager_kpi_avg: 0,
      manager_competency_avg: 0,
      manager_overall_score: 0,
      manager_strengths: "",
      manager_improvements: "",
      manager_comments: "",
      status: "self_submitted",
      self_submitted_at: "2026-07-25T10:00:00.000Z",
      updated_at: new Date().toISOString(),
      last_modified_by: "Mohammed Azad"
    }
  },
  {
    docId: "2026_Semi-Annual_mohammed_jihad",
    data: {
      year: "2026",
      period: "Semi-Annual",
      employee_name: "Mohammed Jihad",
      employee_id: "356",
      department: "Call center - Quality",
      team: "Quality Assurance Team",
      team_leader: "Jalal Burghol",
      role_type: "qa",
      evaluation_date: "25/7/2026",
      self_kpis: {
        evaluation_accuracy: 4,
        team_improvement: 5,
        reporting: 5,
        session: 4,
        attendance: 4
      },
      self_kpi_avg: 4.4,
      self_competencies: {
        communication: 4,
        problem_solving: 5,
        accountability: 5,
        customer_focus: 5,
        responsibility: 5,
        team_work: 5,
        digitalization: 5
      },
      self_competency_avg: 4.86,
      self_overall_score: 4.63,
      self_comments: "",
      manager_kpis: {},
      manager_competencies: {},
      manager_kpi_avg: 0,
      manager_competency_avg: 0,
      manager_overall_score: 0,
      manager_strengths: "",
      manager_improvements: "",
      manager_comments: "",
      status: "self_submitted",
      self_submitted_at: "2026-07-25T11:00:00.000Z",
      updated_at: new Date().toISOString(),
      last_modified_by: "Mohammed Jihad"
    }
  },
  {
    docId: "2026_Semi-Annual_lara_kamil",
    data: {
      year: "2026",
      period: "Semi-Annual",
      employee_name: "Lara Kamil",
      employee_id: "351",
      department: "Quality",
      team: "Quality Assurance Team",
      team_leader: "Jalal Burghol",
      role_type: "qa",
      evaluation_date: "13/7/2026",
      self_kpis: {
        evaluation_accuracy: 3,
        team_improvement: 4,
        reporting: 3,
        session: 4,
        attendance: 5
      },
      self_kpi_avg: 3.8,
      self_competencies: {
        communication: 5,
        problem_solving: 5,
        accountability: 3,
        responsibility: 4,
        initiative: 2,
        team_work: 5,
        digitalization: 1
      },
      self_competency_avg: 3.57,
      self_overall_score: 3.69,
      self_comments: "",
      manager_kpis: {},
      manager_competencies: {},
      manager_kpi_avg: 0,
      manager_competency_avg: 0,
      manager_overall_score: 0,
      manager_strengths: "",
      manager_improvements: "",
      manager_comments: "",
      status: "self_submitted",
      self_submitted_at: "2026-07-13T10:00:00.000Z",
      updated_at: new Date().toISOString(),
      last_modified_by: "Lara Kamil"
    }
  },
  {
    docId: "2026_Semi-Annual_ankido_buya",
    data: {
      year: "2026",
      period: "Semi-Annual",
      employee_name: "Ankido Buya",
      employee_id: "340",
      department: "Contact Center",
      team: "Ankido Buya Team",
      team_leader: "Jalal Burghol",
      role_type: "tl",
      evaluation_date: "2026-07-20",
      self_kpis: {
        leadership: 4,
        team_kpi: 3,
        reporting: 4,
        attendance: 2,
        team_improvement: 4
      },
      self_kpi_avg: 3.4,
      self_competencies: {
        communication: 5,
        problem_solving: 4,
        accountability: 4,
        responsibility: 4,
        initiative: 3,
        team_work: 4,
        digitalization: 3
      },
      self_competency_avg: 3.86,
      self_overall_score: 3.63,
      self_comments: "",
      manager_kpis: {},
      manager_competencies: {},
      manager_kpi_avg: 0,
      manager_competency_avg: 0,
      manager_overall_score: 0,
      manager_strengths: "",
      manager_improvements: "",
      manager_comments: "",
      status: "self_submitted",
      self_submitted_at: "2026-07-20T10:00:00.000Z",
      updated_at: new Date().toISOString(),
      last_modified_by: "Ankido Buya"
    }
  },
  {
    docId: "2026_Semi-Annual_younis_kamal",
    data: {
      year: "2026",
      period: "Semi-Annual",
      employee_name: "Younis Kamal",
      employee_id: "373",
      department: "Contact Center",
      team: "Younis Kamal Team",
      team_leader: "Jalal Burghol",
      role_type: "tl",
      evaluation_date: "18/7/2026",
      self_kpis: {
        leadership: 4,
        team_kpi: 4,
        reporting: 5,
        attendance: 5,
        team_improvement: 4
      },
      self_kpi_avg: 4.4,
      self_competencies: {
        communication: 5,
        problem_solving: 4,
        accountability: 4,
        responsibility: 5,
        initiative: 4,
        team_work: 5,
        digitalization: 4
      },
      self_competency_avg: 4.43,
      self_overall_score: 4.42,
      self_comments: "",
      manager_kpis: {},
      manager_competencies: {},
      manager_kpi_avg: 0,
      manager_competency_avg: 0,
      manager_overall_score: 0,
      manager_strengths: "",
      manager_improvements: "",
      manager_comments: "",
      status: "self_submitted",
      self_submitted_at: "2026-07-18T10:00:00.000Z",
      updated_at: new Date().toISOString(),
      last_modified_by: "Younis Kamal"
    }
  }
];

async function run() {
  for (const ev of evaluations) {
    await setDoc(doc(db, "annual_evaluations", ev.docId), ev.data, { merge: true });
    console.log("Seeded:", ev.docId, "-", ev.data.employee_name);
  }
  console.log("SUCCESS: All 5 evaluations seeded successfully!");
  process.exit(0);
}

run().catch(e => {
  console.error("FAIL:", e);
  process.exit(1);
});
