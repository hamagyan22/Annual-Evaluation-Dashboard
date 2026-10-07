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
  // Azad Muhammad
  [/_azad_muhammad_abdullah$/, "_azad_muhammad", "Azad Muhammad"],
  // Sawen
  [/_sawin_sartib$/, "_sawen", "Sawen"],
  [/_sawen_sartib$/, "_sawen", "Sawen"],
  // Dhuha Khanjer
  [/_dhuha_khanjer_noori$/, "_dhuha_khanjer", "Dhuha Khanjer"],
  // Rassan Ismail
  [/_rasan_ismail$/, "_rassan_ismail", "Rassan Ismail"],
  // Yousif Rashid
  [/_yousif_rashid_darwesh$/, "_yousif_rashid", "Yousif Rashid"],
  // Soma Sherko
  [/_soma_muhammed$/, "_soma_sherko", "Soma Sherko"],
];

export function expandQualityDocAliases(dataMap: Record<string, any>): void {
  const entries = Object.entries(dataMap);
  for (const [key, val] of entries) {
    if (!val || typeof val !== "object") continue;
    for (const [regex, replacement, canonicalName] of SLUG_ALIASES) {
      if (regex.test(key)) {
        const aliasKey = key.replace(regex, replacement);
        if (!dataMap[aliasKey]) {
          dataMap[aliasKey] = {
            ...val,
            id: aliasKey,
            csr_name: canonicalName || val.csr_name,
          };
        }
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
