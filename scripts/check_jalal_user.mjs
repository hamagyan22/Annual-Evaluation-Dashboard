import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

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
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.forEach(d => {
    if (d.id.includes("jalal") || JSON.stringify(d.data()).includes("جلال") || JSON.stringify(d.data()).includes("Jalal")) {
      console.log(d.id, JSON.stringify(d.data(), null, 2));
    }
  });
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
