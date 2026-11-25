import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

// Hash function matching app/evaluation/page.tsx
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "_fib_salt_2026").digest("hex");
}

async function seed() {
  console.log("Reading generated data...");
  const deptsPath = path.resolve("C:/Users/fib/.gemini/antigravity/brain/08bc48dc-ac0e-4cfa-b66f-52dbbdc7b5e5/scratch/generated_departments.json");
  const empsPath = path.resolve("C:/Users/fib/.gemini/antigravity/brain/08bc48dc-ac0e-4cfa-b66f-52dbbdc7b5e5/scratch/generated_employees.json");

  const departments = JSON.parse(fs.readFileSync(deptsPath, "utf-8"));
  const employees = JSON.parse(fs.readFileSync(empsPath, "utf-8"));

  console.log(`Loaded ${departments.length} departments and ${employees.length} employees.`);

  // 1. Seed annual_evaluations/config_roster_and_criteria
  const configRef = doc(db, "annual_evaluations", "config_roster_and_criteria");
  const existingConfig = await getDoc(configRef);
  let criteria = [];
  if (existingConfig.exists()) {
    criteria = existingConfig.data().criteria || [];
  }

  const DEFAULT_SECTIONS = [
    {
      id: "kpi",
      title: "Department KPI Evaluation",
      titleAr: "تقييم مؤشرات الأداء للقسم (KPIs)",
      description: "Department operational and performance metrics evaluation (Rate 1 to 5).",
      order: 1
    },
    {
      id: "competencies",
      title: "Bank Core Competencies Evaluation",
      titleAr: "تقييم الكفاءات الجوهرية للمصرف",
      description: "Assessment of bank core competencies and institutional behaviors (Rate 1 to 5).",
      order: 2
    }
  ];

  console.log("Writing config document to Firestore...");
  await setDoc(configRef, {
    is_clean_slate_v5: true,
    departments,
    employees,
    criteria,
    sections: DEFAULT_SECTIONS,
    deletedEmployeeNames: [],
    deletedDepartmentIds: [],
    deletedCriteriaIds: [],
    updatedAt: new Date().toISOString()
  });
  console.log("Successfully seeded annual_evaluations/config_roster_and_criteria!");

  // 2. Seed manager users accounts
  console.log("Creating/updating manager accounts in 'users' collection...");
  const defaultPasswordHash = hashPassword("FIB@2026");

  const managers = [
    { name: "عمر اياد حمدي", email: "omar.ayad@fib.iq", role: "admin", dept: "الموارد البشرية" },
    { name: "عمر اياد حمدي", email: "omer.ayad@fib.iq", role: "admin", dept: "الموارد البشرية" },
    { name: "علي محمد حسن العاملي", email: "ali.al-ameli@fib.iq", role: "chief", dept: "الادارة" },
    { name: "رافد محمد رضا", email: "rafid.mohammed@fib.iq", role: "manager", dept: "أمن المعلومات" },
    { name: "محمد سيروان محمد", email: "mohammed.sirwan@fib.iq", role: "tl", dept: "أمن المعلومات" },
    { name: "جلال محمود صالح برغل", email: "jalal.burghol@fib.iq", role: "manager", dept: "مركز الاتصال" },
    { name: "ادريس صالح محمد امين", email: "idris.salih@fib.iq", role: "manager", dept: "التجاري" },
    { name: "عدنان احمد عبده زكريا", email: "adnan.ahmed@fib.iq", role: "manager", dept: "العمليات" },
    { name: "عبدالرحمن طاهر عبدالله", email: "abdulrahman.tahir@fib.iq", role: "manager", dept: "تقنية المعلومات" },
    { name: "نور الدين علي عباس", email: "nouraldeen.ali@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "احمد علي حسين", email: "ahmed.ali@fib.iq", role: "manager", dept: "المبيعات" },
    { name: "ريم مهدي علي", email: "reem.mehdi@fib.iq", role: "manager", dept: "الابلاغ عن غسل الاموال وتمويل الارهاب" },
    { name: "يوسف نزار طارق", email: "yousif.nizar@fib.iq", role: "manager", dept: "الهندسية والادارية" },
    { name: "حازم التميمي", email: "hazim.altamimi@fib.iq", role: "manager", dept: "المالية" },
    { name: "ليهات عطار صدر الدين", email: "lihat.attar@fib.iq", role: "manager", dept: "الدفع الالكتروني" },
    { name: "عبدالرحمن هشام عدنان الحايك", email: "abdulrahman.alhayek@fib.iq", role: "manager", dept: "الامتثال الشرعي ومراقبة الامتثال" },
    { name: "ديدن دلير علي", email: "dedan.diler@fib.iq", role: "manager", dept: "القانوني" },
    { name: "احمد عبدالرحمن القواعلة", email: "ahmed.alqawaela@fib.iq", role: "manager", dept: "الرقابة والتدقيق الشرعي الداخلي" },
    { name: "وائل عباس فرمان القاضي", email: "wael.alqadi@fib.iq", role: "manager", dept: "ادارة المشاريع" },
    { name: "سيبان عادل مصطفى", email: "sepan.adil@fib.iq", role: "manager", dept: "التسويق" },
    { name: "رؤى موفق طالب", email: "ruaa.mowafaq@fib.iq", role: "manager", dept: "الشمول المالي" },
    { name: "محمد عادل هاشم", email: "mohammed.adil@fib.iq", role: "manager", dept: "الخزينة والاستثمار والمؤسسات المالية" },
    { name: "انفال سلمان داود", email: "anfal.salman@fib.iq", role: "manager", dept: "ادارة المخاطر" },
    { name: "نسرين ستار باراني", email: "nisreen.sattar@fib.iq", role: "manager", dept: "ادارة الجودة والتطوير المؤسسي" },
    { name: "زينب عبدالامير كاظم", email: "zainab.abdalamir@fib.iq", role: "manager", dept: "الائتمان" },
    { name: "لينه ياسين عبد", email: "leena.yaseen@fib.iq", role: "manager", dept: "العلاقات العامة وخدمة كبار العملاء" },
    { name: "يسار عبدالقادر حمد الشواوره", email: "yasar.alshawawreh@fib.iq", role: "manager", dept: "الشركات" },
    // Branch Managers
    { name: "مصطفى خضر عباس", email: "mustafa.khodr@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "محمد اكرم سليم", email: "mohammed.akram@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "كاروان سالم محمد سليم", email: "karwan.salim@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "روژ منصور انور", email: "rozh.mansoor@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "اسماء سمير محمود", email: "asmaa.samir@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "منى عبدالحسن جبر", email: "muna.abdulhassan@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "زينب رعد حنون", email: "zainab.raad@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "شهد كريم كامل", email: "shahad.kareem@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "ولاء حسن علي", email: "walaa.hassan@fib.iq", role: "manager", dept: "ادارة الفروع" },
    { name: "علي عباس مكي", email: "ali.abbas@fib.iq", role: "manager", dept: "ادارة الفروع" },
  ];

  for (const m of managers) {
    const cleanEmail = m.email.toLowerCase().trim();
    const docId = "user_" + cleanEmail.replace(/[^a-z0-9]/gi, "_");
    await setDoc(doc(db, "users", docId), {
      email: cleanEmail,
      name: m.name,
      agent_name: m.name,
      role: m.role,
      department: m.dept,
      team: m.dept,
      passwordHash: defaultPasswordHash,
      passwordSetAt: new Date().toISOString(),
      status: "active",
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`  Created/updated user: ${m.name} (${cleanEmail}) [${m.role}]`);
  }

  console.log("All Firestore seeding completed successfully!");
}

seed().then(() => process.exit(0)).catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
