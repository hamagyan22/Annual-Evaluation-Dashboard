import { BASELINE_DLSHAD } from "./baselineDlshad";
import { BASELINE_LARA } from "./baselineLara";
import { BASELINE_JIHAD } from "./baselineJihad";
import { BASELINE_AZAD } from "./baselineAzad";

export const BASELINE_QUALITY_EVALUATIONS: Record<string, any> = {
  ...BASELINE_DLSHAD,
  ...BASELINE_LARA,
  ...BASELINE_JIHAD,
  ...BASELINE_AZAD,
};
