import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const collectionsToCheck = [
  'users',
  'team_members',
  'quality_evaluations',
  'daily_metrics',
  'kpi_metrics',
  'monthly_metrics',
  'agent_metrics',
  'shift_roster'
];

async function checkAll() {
  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      const found = [];
      snap.forEach(d => {
        const str = JSON.stringify(d.data()).toLowerCase();
        if (str.includes('sawin') || d.id.toLowerCase().includes('sawin')) {
          found.push(d.id);
        }
      });
      if (found.length > 0) {
        console.log(`Collection ${colName}: found ${found.length} docs:`, found);
      } else {
        console.log(`Collection ${colName}: 0 matches`);
      }
    } catch (e) {
      console.log(`Collection ${colName}: error or not found`, e.message);
    }
  }
}
checkAll().then(() => process.exit(0));
