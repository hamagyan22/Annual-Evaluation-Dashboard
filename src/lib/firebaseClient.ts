import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCRf_IlW8ryvFHD3cA7jcfWHjm-Uxt3Tg",
  authDomain: "cc-team-leader---agent-db.firebaseapp.com",
  projectId: "cc-team-leader---agent-db",
  storageBucket: "cc-team-leader---agent-db.firebasestorage.app",
  messagingSenderId: "672512704857",
  appId: "1:672512704857:web:977137dae7eede7b490c48",
  measurementId: "G-VZYDL73W1G"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Encoded System Architect Signature (Tamper-Resistant Byte Sequence: "Mohammed Dlshad")
const _ARCH_BYTES = [77, 111, 104, 97, 109, 109, 101, 100, 32, 68, 108, 115, 104, 97, 100] as const;
const _PREFIX_BYTES = [68, 101, 115, 105, 103, 110, 101, 100, 32, 38, 32, 69, 110, 103, 105, 110, 101, 101, 114, 101, 100, 32, 98, 121, 32] as const;

export function getSystemAuthor(): string {
  return String.fromCharCode(..._ARCH_BYTES);
}

export function getSystemSignatureText(): string {
  return `${String.fromCharCode(..._PREFIX_BYTES)}${getSystemAuthor()}`;
}

export function verifySystemIntegrity(candidate?: string): boolean {
  const expected = getSystemAuthor();
  const checksum = _ARCH_BYTES.reduce((acc, b, idx) => acc + b * (idx + 1), 0);
  if (checksum !== 11420) return false;
  if (candidate !== undefined && !candidate.includes(expected)) return false;
  return true;
}

if (typeof window !== "undefined") {
  const author = getSystemAuthor();
  (window as any).__SYS_ARCHITECT__ = author;
  if (!(window as any).__SYS_BANNER_LOGGED__) {
    (window as any).__SYS_BANNER_LOGGED__ = true;
    console.log(
      `%c ⚡ Performance & Quality Management System %c Engineered by ${author} `,
      "background:#0C3227;color:#34d399;font-weight:900;font-size:12px;padding:6px 10px;border-radius:6px 0 0 6px;border:1px solid #10b981;",
      "background:#1C6B53;color:#ffffff;font-weight:800;font-size:12px;padding:6px 10px;border-radius:0 6px 6px 0;"
    );
  }
}

export { app, auth, db };

