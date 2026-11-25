import { DEFAULT_COMPANY_EMPLOYEES, CompanyEmployee } from "./companyRoster";

/**
 * Single Canonical Authority for Agent Names across the entire application.
 * Solves and permanently prevents name-mismatch issues (short names, father/grandfather names,
 * transliteration variations, typos, trailing spaces, case sensitivity).
 */

// Explicit dictionary of all known variations to their official canonical roster name
const EXACT_ALIASES: Record<string, string> = {
  // --- Younis Kamal Team ---
  "amar hussein": "Amar Hussein Salih",
  "amar hussein salih": "Amar Hussein Salih",
  "amar husen": "Amar Hussein Salih",
  "amar hussien": "Amar Hussein Salih",

  "salam sadam": "Salam Sadam Muhammad",
  "salam sadam muhammad": "Salam Sadam Muhammad",
  "salam saddam": "Salam Sadam Muhammad",
  "salam sadam mohammed": "Salam Sadam Muhammad",

  "shahab ahmed": "Shahab Ahmed Muhammed",
  "shahab ahmed muhammed": "Shahab Ahmed Muhammed",
  "shahab ahmed mohammed": "Shahab Ahmed Muhammed",

  "azad muhammad": "Azad Muhammad",
  "azad muhammad abdullah": "Azad Muhammad",
  "azad mohammed": "Azad Muhammad",
  "azad mohammed abdullah": "Azad Muhammad",

  "ahmed jalil": "Ahmed Jalil",
  "haseeb adeeb": "Haseeb Adeeb",
  "hewr adnan": "Hewr Adnan",
  "kazhvan wirya": "Kazhvan Wirya",
  "kazhwan wirya": "Kazhvan Wirya",
  "laveen khaleel": "Laveen Khaleel",
  "laveen khalil": "Laveen Khaleel",
  "mokhalad ali": "Mokhalad Ali",
  "mukhalad ali": "Mokhalad Ali",
  "rabar mohammed": "Rabar Mohammed",
  "rabar muhammad": "Rabar Mohammed",
  "sarbaz namiq": "Sarbaz Namiq Hasan",
  "sarbaz namiq hasan": "Sarbaz Namiq Hasan",
  "sarbaz namiql": "Sarbaz Namiq Hasan",

  "mohammed saleem": "Mohammed Salem",
  "mohammed salem": "Mohammed Salem",
  "mohammad saleem": "Mohammed Salem",
  "mohammad salem": "Mohammed Salem",
  "mohammed saman": "Mohammed Salem",

  // --- Ankido Buya Team ---
  "alla satar": "Alla Satar",
  "alla sattar": "Alla Satar",
  "aya yasin": "Aya Yasin",
  "aya yaseen": "Aya Yasin",
  "aya yassin": "Aya Yasin",
  "frmesk younis": "Frmesk Younis",
  "frmesk yunis": "Frmesk Younis",

  "haneen abd-al kareem": "Haneen Abd-Al Kareem",
  "haneen abd al kareem": "Haneen Abd-Al Kareem",
  "haneen abdelkareem": "Haneen Abd-Al Kareem",
  "haneen abdulkarim": "Haneen Abd-Al Kareem",
  "hannen iskandar": "Haneen Abd-Al Kareem",
  "haneen iskandar": "Haneen Abd-Al Kareem",

  "kani sami": "Kani Sami",
  "lana halmat": "Lana Halmat Rafeeq",
  "lana halmat rafeeq": "Lana Halmat Rafeeq",
  "lana halmat rafiq": "Lana Halmat Rafeeq",

  "marwa khalil": "Marwa Khalil",
  "marwa khaleel": "Marwa Khalil",
  "marwa shalaan": "Marwa Shalaan",
  "marwa shaalan": "Marwa Shalaan",
  "marwa shalan": "Marwa Shalaan",

  "muzhda omar": "Muzhda Omar Ali",
  "muzhda omar ali": "Muzhda Omar Ali",

  "saja bashar": "Saja Bashar Anwar",
  "saja bashar anwar": "Saja Bashar Anwar",

  "taban sirwan": "Taban Sirwan",
  "zainab khalid": "Zainab Khalid Rasheed",
  "zainab khalid rasheed": "Zainab Khalid Rasheed",
  "zhalla salam": "Zhalla Salam",
  "zhala salam": "Zhalla Salam",

  "zhalla sherzad": "Zhalla Sherzad",
  "zhala sherzad": "Zhalla Sherzad",

  // --- Mohammed Dlshad Team ---
  "ahmed rustam": "Ahmed Rustam",
  "akar omer": "Akar Omer",
  "akar omar": "Akar Omer",
  "bana ahmed": "Bana Ahmed",

  "dhuha khanjer": "Dhuha Khanjer",
  "dhuha khanjer noori": "Dhuha Khanjer",
  "dhuha khanjar": "Dhuha Khanjer",

  "ismail ahmed": "Ismail Ahmed",
  "nawen maadh": "Nawen Maadh",
  "ossama saadi": "Ossama Saadi",
  "osama saadi": "Ossama Saadi",

  "rassan ismail": "Rassan Ismail",
  "rasan ismail": "Rassan Ismail",
  "rasan ismail musa": "Rassan Ismail",

  "sana dler": "Sana Dler",
  "sawen": "Sawen",
  "sawen sartib": "Sawen",
  "sawin sartib": "Sawen",

  "soma sherko": "Soma Sherko",
  "soma muhammed": "Soma Sherko",
  "soma mohammed": "Soma Sherko",

  "yousif rashid": "Yousif Rashid",
  "yousif rashid darwesh": "Yousif Rashid",
  "zahra yousif": "Zahra Yousif",
};

// Normalized lookup map by lowercase stripped name
const CANONICAL_MAP: Map<string, CompanyEmployee> = new Map();
const CANONICAL_NAME_SET: Set<string> = new Set();

DEFAULT_COMPANY_EMPLOYEES.forEach(emp => {
  const name = emp.agent_name || emp.name || "";
  const norm = cleanStr(name);
  if (norm) {
    CANONICAL_MAP.set(norm, { ...emp, agent_name: name });
    CANONICAL_NAME_SET.add(name);
  }
});

// Also register all aliases into the map
Object.entries(EXACT_ALIASES).forEach(([alias, canonicalName]) => {
  const emp = DEFAULT_COMPANY_EMPLOYEES.find(e => (e.agent_name || e.name) === canonicalName);
  if (emp) {
    const name = emp.agent_name || emp.name;
    CANONICAL_MAP.set(cleanStr(alias), { ...emp, agent_name: name });
  }
});

function cleanStr(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns the official canonical agent name (e.g. "Amar Hussein Salih")
 * or the cleaned original name if not matched.
 */
export function getCanonicalAgentName(rawName: string): string {
  if (!rawName) return "";
  const cleaned = cleanStr(rawName);
  if (!cleaned) return "";

  // 1. Direct match in dictionary
  const direct = CANONICAL_MAP.get(cleaned);
  if (direct) return direct.agent_name;

  // 2. Token-based matching (e.g., first and second word matching)
  const tokens = cleaned.split(" ").filter(Boolean);
  if (tokens.length >= 2) {
    const firstTwo = `${tokens[0]} ${tokens[1]}`;
    const tokenMatch = CANONICAL_MAP.get(firstTwo);
    if (tokenMatch) return tokenMatch.agent_name;

    // Check if tokens start with any roster employee's first tokens
    for (const emp of DEFAULT_COMPANY_EMPLOYEES) {
      const empName = emp.agent_name || emp.name || "";
      const empTokens = cleanStr(empName).split(" ").filter(Boolean);
      if (empTokens.length >= 2 && empTokens[0] === tokens[0] && empTokens[1] === tokens[1]) {
        return empName;
      }
    }
  } else if (tokens.length === 1) {
    // Single-word names like "Sawen"
    for (const emp of DEFAULT_COMPANY_EMPLOYEES) {
      const empName = emp.agent_name || emp.name || "";
      const empClean = cleanStr(empName);
      if (empClean === tokens[0]) return empName;
    }
  }

  // 3. Fallback: check if rawName matches any canonical name ignoring case
  const lowerRaw = rawName.trim().toLowerCase();
  for (const emp of DEFAULT_COMPANY_EMPLOYEES) {
    const empName = emp.agent_name || emp.name || "";
    if (empName.toLowerCase() === lowerRaw) {
      return empName;
    }
  }

  return rawName.trim();
}

/**
 * Returns the full CompanyEmployee object if found.
 */
export function getCanonicalAgent(rawName: string): CompanyEmployee | null {
  const canonicalName = getCanonicalAgentName(rawName);
  const found = DEFAULT_COMPANY_EMPLOYEES.find(e => (e.agent_name || e.name) === canonicalName) || null;
  if (found) {
    return { ...found, agent_name: found.agent_name || found.name || "" };
  }
  return null;
}

/**
 * Returns the canonical slug used for document IDs (e.g., "amar_hussein_salih").
 */
export function getCanonicalSlug(rawName: string): string {
  const canonicalName = getCanonicalAgentName(rawName);
  return canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/**
 * Returns an array of all known slugs for this agent (canonical + short alias slugs).
 * Guarantees that whether Firestore has a short or long ID, it is found instantly.
 */
export function getAllAgentSlugs(rawName: string): string[] {
  const canonicalName = getCanonicalAgentName(rawName);
  const canonSlug = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const slugs = new Set<string>([canonSlug]);

  // Add short slug (first two tokens)
  const tokens = cleanStr(canonicalName).split(" ").filter(Boolean);
  if (tokens.length >= 2) {
    slugs.add(`${tokens[0]}_${tokens[1]}`);
  }
  if (tokens.length === 1) {
    slugs.add(tokens[0]);
  }

  // Add explicit aliases
  Object.entries(EXACT_ALIASES).forEach(([alias, targetName]) => {
    if (targetName === canonicalName) {
      slugs.add(alias.replace(/[^a-z0-9]/g, "_"));
    }
  });

  return Array.from(slugs);
}

/**
 * Check if two names refer to the same agent.
 */
export function isSameAgent(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  return getCanonicalAgentName(nameA) === getCanonicalAgentName(nameB);
}
