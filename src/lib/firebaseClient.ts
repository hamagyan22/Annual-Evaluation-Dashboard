import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6t-tzQMEMgNKHkgnTk0pZs_xZm1g282A",
  authDomain: "annual-evaluation.firebaseapp.com",
  projectId: "annual-evaluation",
  storageBucket: "annual-evaluation.firebasestorage.app",
  messagingSenderId: "714414788405",
  appId: "1:714414788405:web:f01bae71bc2bb166fa067c",
  measurementId: "G-BYP5CJBB97"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Encoded System Architect Signature (Tamper-Resistant Byte Sequence: "Omer Ayad")
const _ARCH_BYTES = [79, 109, 101, 114, 32, 65, 121, 97, 100] as const;
const _PREFIX_BYTES = [68, 101, 115, 105, 103, 110, 101, 100, 32, 98, 121, 32] as const;

export function getSystemAuthor(): string {
  return "Omer Ayad";
}

export function getSystemSignatureText(): string {
  return `Designed by ${getSystemAuthor()}`;
}

export function verifySystemIntegrity(candidate?: string): boolean {
  const expected = getSystemAuthor();
  if (candidate !== undefined && !candidate.includes("Omer")) return false;
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
