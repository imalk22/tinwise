/**
 * Phase 2 calculators: capital gains, VAT/SSCL, foreign income,
 * inflation and late penalties. Every rule figure lives in RULES so it
 * can be checked against IRD notices in one place.
 */
import { TAX_YEAR, annualTax, monthlyApit } from "./tax";

export const RULES = {
  vatRate: 0.18,
  /** Annual turnover that requires VAT registration (Rs. 60M; a proposed cut to 36M was reportedly dropped). */
  vatThreshold: 60_000_000,
  ssclRate: 0.025,
  /** Annual liable turnover that triggers SSCL from 1 July 2026 (Rs. 9M a quarter). */
  ssclThreshold: 36_000_000,
  /** Share of turnover that counts as SSCL liable turnover, by activity. */
  ssclLiableShare: {
    services: 1,
    manufacturing: 0.85,
    retail: 0.5,
    distributor: 0.25,
  },
  /** Late payment. */
  latePaymentPenalty: 0.2,
  latePaymentGraceDays: 14,
  lateInterestPerMonth: 0.015,
  /** Late filing: greater of (5% of tax + 1% a month) or (Rs. 50,000 + Rs. 10,000 a month, capped). */
  lateFilingPct: 0.05,
  lateFilingPctPerMonth: 0.01,
  lateFilingFixed: 50_000,
  lateFilingFixedPerMonth: 10_000,
  lateFilingFixedCap: 400_000,
  /** Latest CCPI headline inflation, year on year (CBSL, August 2026). */
  latestCcpi: 0.08,
  latestCcpiLabel: "Aug 2026",
} as const;

export type Activity = keyof typeof RULES.ssclLiableShare;

/* ---------- Capital gains ---------- */

export interface CgtInput {
  salePrice: number;
  cost: number;
  /** Improvements, stamp duty, legal and broker fees. */
  costs: number;
  saleDate: string; // YYYY-MM-DD
  principalResidence: boolean;
}

export function capitalGains(i: CgtInput) {
  const gain = i.salePrice - i.cost - i.costs;
  const rate = i.saleDate >= TAX_YEAR.cgtChangeDate ? TAX_YEAR.cgtRate : TAX_YEAR.cgtOldRate;
  const exempt = i.principalResidence;
  const tax = exempt ? 0 : Math.max(0, gain) * rate;
  return { gain, rate, exempt, tax, net: i.salePrice - i.costs - tax };
}

/* ---------- VAT and SSCL ---------- */

export function vatSscl(annualTurnover: number, activity: Activity) {
  const liable = annualTurnover * RULES.ssclLiableShare[activity];
  const ssclRequired = liable >= RULES.ssclThreshold;
  const vatRequired = annualTurnover >= RULES.vatThreshold;
  return {
    liable,
    ssclRequired,
    sscl: ssclRequired ? liable * RULES.ssclRate : 0,
    ssclQuarterly: ssclRequired ? (liable * RULES.ssclRate) / 4 : 0,
    vatRequired,
    /** How close the business is to each threshold, 0–1+. */
    ssclProgress: liable / RULES.ssclThreshold,
    vatProgress: annualTurnover / RULES.vatThreshold,
  };
}

/** Add VAT to a net price, or extract it from a VAT-inclusive price. */
export function vatPrice(amount: number, mode: "add" | "remove") {
  if (mode === "add") {
    const vat = amount * RULES.vatRate;
    return { net: amount, vat, gross: amount + vat };
  }
  const net = amount / (1 + RULES.vatRate);
  return { net, vat: amount - net, gross: amount };
}

/* ---------- Foreign income ---------- */

export function foreignIncome(monthlyForeign: number, rate: number, otherAnnual: number) {
  const monthlyLkr = monthlyForeign * rate;
  const annualLkr = monthlyLkr * 12;
  const withOther = annualTax(annualLkr + otherAnnual);
  const otherOnly = annualTax(otherAnnual);
  return {
    monthlyLkr,
    annualLkr,
    /** Extra tax caused by the foreign income. */
    extraTax: withOther.tax - otherOnly.tax,
    totalTax: withOther.tax,
    marginalRate: withOther.marginalRate,
  };
}

/* ---------- Inflation ---------- */

export function realChange(before: number, after: number, inflation: number) {
  const nominal = before > 0 ? after / before - 1 : 0;
  const real = before > 0 ? after / (before * (1 + inflation)) - 1 : 0;
  return {
    nominal,
    real,
    /** Salary needed now to match last year's buying power. */
    keepUp: before * (1 + inflation),
    gap: after - before * (1 + inflation),
  };
}

/* ---------- Late penalties ---------- */

export function latePenalties(tax: number, monthsLatePaying: number, monthsLateFiling: number) {
  const m = Math.max(0, Math.ceil(monthsLatePaying));
  const interest = tax * RULES.lateInterestPerMonth * m;
  // Any month late is past the 14-day grace period.
  const paymentPenalty = m > 0 ? tax * RULES.latePaymentPenalty : 0;

  const f = Math.max(0, Math.ceil(monthsLateFiling));
  const filingPct = tax * (RULES.lateFilingPct + RULES.lateFilingPctPerMonth * f);
  const filingFixed = Math.min(RULES.lateFilingFixed + RULES.lateFilingFixedPerMonth * f, RULES.lateFilingFixedCap);
  const filingPenalty = f > 0 ? Math.max(filingPct, filingFixed) : 0;

  return {
    interest,
    paymentPenalty,
    filingPenalty,
    total: interest + paymentPenalty + filingPenalty,
    grandTotal: tax + interest + paymentPenalty + filingPenalty,
  };
}

/* ---------- Payroll: EPF / ETF ---------- */

export const PAYROLL = {
  epfEmployee: 0.08,
  epfEmployer: 0.12,
  etfEmployer: 0.03,
  /** Gratuity: half a month's salary for each completed year, after 5 years' service. */
  gratuityMinYears: 5,
  gratuityMonthsPerYear: 0.5,
} as const;

/**
 * Monthly payslip. EPF/ETF apply to the EPF-liable earnings (basic plus most fixed allowances);
 * APIT applies to the full gross salary.
 */
export function payslip(gross: number, epfBase: number = gross) {
  const base = Math.min(Math.max(0, epfBase), Math.max(0, gross));
  const epf = base * PAYROLL.epfEmployee;
  const apit = monthlyApit(gross).apit;
  const employerEpf = base * PAYROLL.epfEmployer;
  const etf = base * PAYROLL.etfEmployer;
  return {
    gross,
    epf,
    apit,
    takeHome: gross - epf - apit,
    employerEpf,
    etf,
    employerCost: gross + employerEpf + etf,
    /** Goes into your EPF account each month (yours + employer's). */
    epfSaved: epf + employerEpf,
  };
}

/** Gross salary needed to take home a target amount (binary search on the payslip). */
export function grossForTakeHome(target: number, withEpf: boolean) {
  if (target <= 0) return 0;
  const net = (g: number) => (withEpf ? payslip(g).takeHome : g - monthlyApit(g).apit);
  let lo = target;
  let hi = target * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (net(mid) < target) lo = mid;
    else hi = mid;
  }
  return Math.ceil(hi);
}

export function gratuity(lastMonthlySalary: number, years: number) {
  const completed = Math.floor(Math.max(0, years));
  const eligible = completed >= PAYROLL.gratuityMinYears;
  return {
    eligible,
    completed,
    amount: eligible ? lastMonthlySalary * PAYROLL.gratuityMonthsPerYear * completed : 0,
    yearsToGo: eligible ? 0 : PAYROLL.gratuityMinYears - completed,
  };
}
