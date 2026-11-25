export interface CompanyEmployee {
  id: string;
  agent_name: string;
  name: string;
  team: string;
  direct_manager?: string;
}

import { INITIAL_COMPANY_ROSTER } from "./initialBankRoster";

// Complete official bank roster (552 employees across 26 departments)
// Guaranteed immediate zero-latency availability across all components
export const DEFAULT_COMPANY_EMPLOYEES: CompanyEmployee[] = INITIAL_COMPANY_ROSTER;

export const ROSTER_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const AGG_MONTH_MAP: Record<string, string[]> = {
  "Q1": ["JAN", "FEB", "MAR"],
  "Q2": ["APR", "MAY", "JUN"],
  "Q3": ["JUL", "AUG", "SEP"],
  "Q4": ["OCT", "NOV", "DEC"],
  "H1": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
  "H2": ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  "YEAR - AVG": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
};

/**
 * Determines if an employee was active in a given period.
 * Strictly preserves 100% of historical metrics and evaluation data for months prior to resignation.
 */
export function isMemberActiveInPeriod(
  member: any,
  periodMonth?: string,
  periodYear?: string
): boolean {
  if (!member) return false;
  
  if (!member.resigned_month || !member.resigned_year) {
    if (member.is_deleted === true || member.is_active === false) {
      return false;
    }
    return true;
  }

  const pYear = parseInt(String(periodYear || "2026"), 10);
  const rYear = parseInt(String(member.resigned_year), 10);
  if (isNaN(pYear) || isNaN(rYear)) return true;

  if (pYear < rYear) return true; // Prior year: definitely active
  if (pYear > rYear) return false; // Subsequent year: resigned

  const rMonthIdx = ROSTER_MONTHS.indexOf(member.resigned_month.toUpperCase());
  if (rMonthIdx === -1) return true;

  const pMonthUpper = (periodMonth || "").toUpperCase();
  const aggMonths = AGG_MONTH_MAP[pMonthUpper];
  if (aggMonths) {
    return aggMonths.some(m => {
      const idx = ROSTER_MONTHS.indexOf(m.toUpperCase());
      return idx < rMonthIdx;
    });
  }

  const pMonthIdx = ROSTER_MONTHS.indexOf(pMonthUpper);
  if (pMonthIdx === -1) return true;

  return pMonthIdx < rMonthIdx;
}

/**
 * Computes next month and year relative to the current selected period.
 */
export function getNextMonthAndYear(month?: string, year?: string): { month: string; year: string; displayLabel: string } {
  const mUpper = (month || "").toUpperCase();
  const mIdx = ROSTER_MONTHS.indexOf(mUpper);
  const yNum = parseInt(year || String(new Date().getFullYear()), 10);

  if (mIdx >= 0 && mIdx < 11) {
    const nextM = ROSTER_MONTHS[mIdx + 1];
    return {
      month: nextM,
      year: String(yNum),
      displayLabel: `${nextM.charAt(0) + nextM.slice(1).toLowerCase()} ${yNum}`
    };
  } else if (mIdx === 11) {
    const nextM = ROSTER_MONTHS[0];
    const nextY = String(yNum + 1);
    return {
      month: nextM,
      year: nextY,
      displayLabel: `${nextM.charAt(0) + nextM.slice(1).toLowerCase()} ${nextY}`
    };
  }

  const now = new Date();
  const curIdx = now.getMonth();
  if (curIdx < 11) {
    const nextM = ROSTER_MONTHS[curIdx + 1];
    return {
      month: nextM,
      year: String(now.getFullYear()),
      displayLabel: `${nextM.charAt(0) + nextM.slice(1).toLowerCase()} ${now.getFullYear()}`
    };
  } else {
    const nextM = ROSTER_MONTHS[0];
    const nextY = String(now.getFullYear() + 1);
    return {
      month: nextM,
      year: nextY,
      displayLabel: `${nextM.charAt(0) + nextM.slice(1).toLowerCase()} ${nextY}`
    };
  }
}

/**
 * Computes current effective month and year for removal actions.
 */
export function getCurrentEffectiveMonth(month?: string, year?: string): { month: string; year: string; displayLabel: string } {
  const mUpper = (month || "").toUpperCase();
  const yNum = year || String(new Date().getFullYear());
  if (ROSTER_MONTHS.includes(mUpper)) {
    return {
      month: mUpper,
      year: yNum,
      displayLabel: `${mUpper.charAt(0) + mUpper.slice(1).toLowerCase()} ${yNum}`
    };
  }
  const now = new Date();
  const curM = ROSTER_MONTHS[now.getMonth()];
  return {
    month: curM,
    year: yNum,
    displayLabel: `${curM.charAt(0) + curM.slice(1).toLowerCase()} ${yNum}`
  };
}

