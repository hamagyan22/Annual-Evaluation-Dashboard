import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkCe1NSF5yJw0-OCDaU6tcI3otd7qkux0",
  authDomain: "fib-annual-evaluation.firebaseapp.com",
  projectId: "fib-annual-evaluation",
  storageBucket: "fib-annual-evaluation.firebasestorage.app",
  messagingSenderId: "867325856122",
  appId: "1:867325856122:web:1e25ebdbfd0bcd0973aec3",
  measurementId: "G-MQZCTTP85R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    const configSnap = await getDoc(doc(db, "annual_evaluations", "config_roster_and_criteria"));
    if (configSnap.exists()) {
      const data = configSnap.data();
      console.log("Config doc exists! is_clean_slate_v5:", data.is_clean_slate_v5);
      console.log("Departments count:", (data.departments || []).length);
      console.log("Employees count:", (data.employees || []).length);
    } else {
      console.log("Config doc does not exist yet.");
    }
  } catch (e) {
    console.error("Firestore test error:", e);
  }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
