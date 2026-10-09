import { BASELINE_DLSHAD } from "./baselineDlshad";
import { BASELINE_LARA } from "./baselineLara";
import { BASELINE_JIHAD } from "./baselineJihad";
import { BASELINE_AZAD } from "./baselineAzad";

// Known slug aliases: maps alternative slugs to each other and provides canonical agent display name
export const SLUG_ALIASES: [RegExp, string, string][] = [
  // Amar Hussein Salih
  [/_amar_hussein$/, "_amar_hussein_salih", "Amar Hussein Salih"],
  [/_amar_hussein_salih$/, "_amar_hussein", "Amar Hussein Salih"],
  // Salam Sadam Muhammad
  [/_salam_sadam$/, "_salam_sadam_muhammad", "Salam Sadam Muhammad"],
  [/_salam_sadam_muhammad$/, "_salam_sadam", "Salam Sadam Muhammad"],
  // Shahab Ahmed Muhammed
  [/_shahab_ahmed$/, "_shahab_ahmed_muhammed", "Shahab Ahmed Muhammed"],
  [/_shahab_ahmed_muhammed$/, "_shahab_ahmed", "Shahab Ahmed Muhammed"],
  // Zhalla Sherzad
  [/_zhala_sherzad$/, "_zhalla_sherzad", "Zhalla Sherzad"],
  [/_zhalla_sherzad$/, "_zhala_sherzad", "Zhalla Sherzad"],
  // Marwa Khalil
  [/_marwa_khaleel$/, "_marwa_khalil", "Marwa Khalil"],
  [/_marwa_khalil$/, "_marwa_khaleel", "Marwa Khalil"],
  // Haneen Abd-Al Kareem
  [/_hannen_iskandar$/, "_haneen_abd_al_kareem", "Haneen Abd-Al Kareem"],
  [/_haneen_abdulkarim$/, "_haneen_abd_al_kareem", "Haneen Abd-Al Kareem"],
  [/_haneen_abd_al_kareem$/, "_hannen_iskandar", "Haneen Abd-Al Kareem"],
  [/_haneen_abd_al_kareem$/, "_haneen_abdulkarim", "Haneen Abd-Al Kareem"],
  // Azad Muhammad
  [/_azad_muhammad_abdullah$/, "_azad_muhammad", "Azad Muhammad"],
  [/_azad_muhammad$/, "_azad_muhammad_abdullah", "Azad Muhammad"],
  // Sawen
  [/_sawin_sartib$/, "_sawen", "Sawen"],
  [/_sawen_sartib$/, "_sawen", "Sawen"],
  [/_sawen$/, "_sawin_sartib", "Sawen"],
  [/_sawen$/, "_sawen_sartib", "Sawen"],
  // Dhuha Khanjer
  [/_dhuha_khanjer_noori$/, "_dhuha_khanjer", "Dhuha Khanjer"],
  [/_dhuha_khanjer$/, "_dhuha_khanjer_noori", "Dhuha Khanjer"],
  // Rassan Ismail
  [/_rasan_ismail$/, "_rassan_ismail", "Rassan Ismail"],
  [/_rassan_ismail$/, "_rasan_ismail", "Rassan Ismail"],
  // Yousif Rashid
  [/_yousif_rashid_darwesh$/, "_yousif_rashid", "Yousif Rashid"],
  [/_yousif_rashid$/, "_yousif_rashid_darwesh", "Yousif Rashid"],
  // Soma Sherko
  [/_soma_muhammed$/, "_soma_sherko", "Soma Sherko"],
  [/_soma_sherko$/, "_soma_muhammed", "Soma Sherko"],
  // Alla Satar
  [/_alla_sattar$/, "_alla_satar", "Alla Satar"],
  [/_alla_satar$/, "_alla_sattar", "Alla Satar"],
  // Zhalla Salam
  [/_zhala_salam$/, "_zhalla_salam", "Zhalla Salam"],
  [/_zhalla_salam$/, "_zhala_salam", "Zhalla Salam"],
  // Sarbaz Namiq Hasan
  [/_sarbaz_namiq$/, "_sarbaz_namiq_hasan", "Sarbaz Namiq Hasan"],
  [/_sarbaz_namiq_hasan$/, "_sarbaz_namiq", "Sarbaz Namiq Hasan"],
  // Saja Bashar Anwar
  [/_saja_bashar$/, "_saja_bashar_anwar", "Saja Bashar Anwar"],
  [/_saja_bashar_anwar$/, "_saja_bashar", "Saja Bashar Anwar"],
  // Lana Halmat Rafeeq
  [/_lana_halmat$/, "_lana_halmat_rafeeq", "Lana Halmat Rafeeq"],
  [/_lana_halmat_rafeeq$/, "_lana_halmat", "Lana Halmat Rafeeq"],
  // Muzhda Omar Ali
  [/_muzhda_omar$/, "_muzhda_omar_ali", "Muzhda Omar Ali"],
  [/_muzhda_omar_ali$/, "_muzhda_omar", "Muzhda Omar Ali"],
  // Zainab Khalid Rasheed
  [/_zainab_khalid$/, "_zainab_khalid_rasheed", "Zainab Khalid Rasheed"],
  [/_zainab_khalid_rasheed$/, "_zainab_khalid", "Zainab Khalid Rasheed"],
];

/**
 * Merges two quality documents safely, ensuring:
 * 1. Live Firestore data (_fromFirestore or presence of updated_at/cell_timestamps) strictly takes precedence over static baseline.
 * 2. When two versions have a score for the same cell, the one with the latest timestamp or Firestore status strictly wins.
 * 3. Notes and links are preserved without losing evaluator notes.
 */
export function mergeQualityDocs(targetDoc: any, sourceDoc: any): any {
  if (!targetDoc && !sourceDoc) return {};
  if (!targetDoc) return { ...sourceDoc };
  if (!sourceDoc) return { ...targetDoc };

  const targetFromFs = Boolean(targetDoc._fromFirestore);
  const sourceFromFs = Boolean(sourceDoc._fromFirestore);

  const mergedScores: Record<string, any> = { ...(targetDoc.scores || {}) };
  const mergedTimestamps: Record<string, string> = { ...(targetDoc.cell_timestamps || {}) };

  const targetNotes: Record<string, any> = { ...(targetDoc.notes || {}) };
  const targetLinks: Record<string, any> = { ...(targetDoc.links || {}) };
  const sourceNotes: Record<string, any> = { ...(sourceDoc.notes || {}) };
  const sourceLinks: Record<string, any> = { ...(sourceDoc.links || {}) };

  // Unflatten any legacy dot keys from targetDoc
  Object.keys(targetDoc).forEach(k => {
    if (k.startsWith("notes.")) {
      const sub = k.slice(6);
      if (targetDoc[k]) targetNotes[sub] = targetDoc[k];
    } else if (k.startsWith("links.")) {
      const sub = k.slice(6);
      if (targetDoc[k]) targetLinks[sub] = targetDoc[k];
    } else if (k.startsWith("cell_timestamps.")) {
      const sub = k.slice(16);
      if (targetDoc[k]) mergedTimestamps[sub] = targetDoc[k];
    }
  });

  // Unflatten any legacy dot keys from sourceDoc
  Object.keys(sourceDoc).forEach(k => {
    if (k.startsWith("notes.")) {
      const sub = k.slice(6);
      if (sourceDoc[k]) sourceNotes[sub] = sourceDoc[k];
    } else if (k.startsWith("links.")) {
      const sub = k.slice(6);
      if (sourceDoc[k]) sourceLinks[sub] = sourceDoc[k];
    } else if (k.startsWith("cell_timestamps.")) {
      const sub = k.slice(16);
      if (sourceDoc[k]) mergedTimestamps[sub] = sourceDoc[k];
    }
  });

  const sourceScores = sourceDoc.scores || {};
  for (const [col, sVal] of Object.entries(sourceScores)) {
    const tVal = mergedScores[col];
    // If target has no value, source takes it
    if (tVal === undefined || tVal === "") {
      mergedScores[col] = sVal;
      if (sourceDoc.cell_timestamps?.[col]) {
        mergedTimestamps[col] = sourceDoc.cell_timestamps[col];
      }
      continue;
    }

    // Both have values: determine which wins
    if (sourceFromFs && !targetFromFs) {
      // Source is Firestore, target is baseline -> source wins!
      mergedScores[col] = sVal;
      if (sourceDoc.cell_timestamps?.[col]) {
        mergedTimestamps[col] = sourceDoc.cell_timestamps[col];
      }
    } else if (!sourceFromFs && targetFromFs) {
      // Target is Firestore, source is baseline -> target stays!
      continue;
    } else {
      // Both from Firestore or both baseline: compare cell timestamps or doc updated_at
      const sTs = sourceDoc.cell_timestamps?.[col] || sourceDoc.updated_at || "";
      const tTs = targetDoc.cell_timestamps?.[col] || targetDoc.updated_at || "";
      if (sTs && (!tTs || sTs >= tTs)) {
        mergedScores[col] = sVal;
        mergedTimestamps[col] = sTs;
      }
    }
  }

  // Merge notes & links: live Firestore doc takes absolute precedence so deleted notes are not revived
  let mergedNotes: Record<string, any>;
  let mergedLinks: Record<string, any>;

  if (sourceFromFs && !targetFromFs) {
    mergedNotes = { ...sourceNotes };
    mergedLinks = { ...sourceLinks };
  } else if (!sourceFromFs && targetFromFs) {
    mergedNotes = { ...targetNotes };
    mergedLinks = { ...targetLinks };
  } else if (sourceFromFs && targetFromFs) {
    const sUp = sourceDoc.updated_at || "";
    const tUp = targetDoc.updated_at || "";
    if (sUp && (!tUp || sUp >= tUp)) {
      mergedNotes = { ...sourceNotes };
      mergedLinks = { ...sourceLinks };
    } else {
      mergedNotes = { ...targetNotes };
      mergedLinks = { ...targetLinks };
    }
  } else {
    mergedNotes = { ...targetNotes, ...sourceNotes };
    mergedLinks = { ...targetLinks, ...sourceLinks };
  }

  return {
    ...targetDoc,
    ...sourceDoc,
    scores: mergedScores,
    cell_timestamps: mergedTimestamps,
    notes: mergedNotes,
    links: mergedLinks,
    _fromFirestore: Boolean(targetFromFs || sourceFromFs),
    updated_at: (sourceDoc.updated_at && (!targetDoc.updated_at || sourceDoc.updated_at >= targetDoc.updated_at))
      ? sourceDoc.updated_at
      : targetDoc.updated_at
  };
}

export function expandQualityDocAliases(dataMap: Record<string, any>): void {
  const entries = Object.entries(dataMap);
  for (const [key, val] of entries) {
    if (!val || typeof val !== "object") continue;
    for (const [regex, replacement, canonicalName] of SLUG_ALIASES) {
      if (regex.test(key)) {
        const aliasKey = key.replace(regex, replacement);
        const existing = dataMap[aliasKey];
        const merged = mergeQualityDocs(existing, val);
        dataMap[aliasKey] = {
          ...merged,
          id: aliasKey,
          csr_name: canonicalName || val.csr_name || existing?.csr_name
        };
      }
    }
  }
}

function buildBaselineEvaluations(): Record<string, any> {
  const base: Record<string, any> = {
    ...BASELINE_DLSHAD,
    ...BASELINE_LARA,
    ...BASELINE_JIHAD,
    ...BASELINE_AZAD,
  };

  expandQualityDocAliases(base);
  return base;
}

export const BASELINE_QUALITY_EVALUATIONS: Record<string, any> = buildBaselineEvaluations();

export function getQualityEvalDoc(dataMap: Record<string, any>, docId: string): any {
  if (!dataMap) return null;
  if (dataMap[docId]) return dataMap[docId];

  for (const [regex, replacement] of SLUG_ALIASES) {
    if (regex.test(docId)) {
      const aliasKey = docId.replace(regex, replacement);
      if (dataMap[aliasKey]) return dataMap[aliasKey];
    }
  }

  return null;
}
