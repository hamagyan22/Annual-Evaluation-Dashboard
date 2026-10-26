import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = "shireen.waisi@agent.com";
const PASSWORD = "Password@2026";

async function main() {
  let uid = null;
  try {
    console.log(`Attempting to sign in as ${EMAIL}...`);
    const cred = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    uid = cred.user.uid;
    console.log(`User already exists in Firebase Auth with UID: ${uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      console.log(`Creating new user in Firebase Auth: ${EMAIL}...`);
      try {
        const newCred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
        uid = newCred.user.uid;
        console.log(`Created user with UID: ${uid}`);
      } catch (createErr) {
        console.error("Error creating user:", createErr);
        throw createErr;
      }
    } else {
      console.log(`Error signing in: ${err.code} - ${err.message}`);
      // Try to create in case invalid-credential was thrown for non-existent user
      try {
        const newCred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
        uid = newCred.user.uid;
        console.log(`Created user with UID: ${uid}`);
      } catch (createErr2) {
        console.error("Create error fallback:", createErr2);
      }
    }
  }

  if (uid) {
    console.log(`Setting up Firestore document in 'users/${uid}'...`);
    await setDoc(doc(db, "users", uid), {
      email: EMAIL,
      name: "Shireen Waisi",
      agent_name: "Shireen Waisi",
      role: "backoffice",
      department: "Back Office",
      team: "Back Office",
      employee_id: "370",
      mustChangePassword: false,
      passwordUpdated: true,
      isAdmin: false,
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log("Firestore users doc updated successfully!");
  }

  // Pre-seed her evaluation in annual_evaluations
  const docId = "2026_Semi-Annual_shireen_waisi";
  console.log(`Seeding evaluation doc: ${docId}...`);
  await setDoc(doc(db, "annual_evaluations", docId), {
    year: "2026",
    period: "Semi-Annual",
    period_type: "Semi-Annual",
    employee_name: "Shireen Waisi",
    employee_id: "370",
    department: "Back Office",
    team: "Back Office",
    team_leader: "Jalal Burghol",
    role_type: "backoffice",
    channel_type: "backoffice",
    is_special_staff: true,
    evaluation_date: "13-Jul-26",
    self_kpis: {},
    self_competencies: {},
    self_kpi_avg: 0,
    self_competency_avg: 0,
    self_overall_score: 0,
    self_comments: "",
    manager_kpis: {},
    manager_competencies: {},
    manager_kpi_avg: 0,
    manager_competency_avg: 0,
    manager_overall_score: 0,
    manager_strengths: "",
    manager_improvements: "",
    manager_comments: "",
    status: "draft",
    updated_at: new Date().toISOString(),
    last_modified_by: "System Admin"
  }, { merge: true });
  console.log(`Annual evaluation ${docId} created successfully!`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
