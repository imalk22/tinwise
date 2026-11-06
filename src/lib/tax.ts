/**
 * Sri Lanka personal income tax engine — Year of Assessment 2025/26
 * (1 April 2025 – 31 March 2026).
 *
 * Every rate lives in TAX_YEAR so a new year is a one-object change.
 * Figures come from secondary sources (see README) — verify them against
 * official IRD notices before each release.
 */

export interface Band {
  /** Width of the band in LKR. Infinity for the top band. */
  width: number;
  rate: number;
}

export const TAX_YEAR = {
  label: "2025/26",
  personalRelief: 1_800_000,
  bands: [
    { width: 1_000_000, rate: 0.06 },
    { width: 500_000, rate: 0.18 },
    { width: 500_000, rate: 0.24 },
    { width: 500_000, rate: 0.3 },
    { width: Infinity, rate: 0.36 },
  ] as Band[],
  /** Withholding on interest paid to resident individuals. */
  interestWht: 0.1,
  /** Withholding on dividends. */
  dividendWht: 0.15,
  /** Relief on rental income from property (share of gross rent). */
  rentRelief: 0.25,
  /** Capital gains tax for individuals on realisations from 3 June 2026. */
  cgtRate: 0.15,
  cgtOldRate: 0.1,
  cgtChangeDate: "2026-06-03",
} as const;

export interface BandSlice {
  rate: number;
  from: number;
  to: number;
  amount: number;
  tax: number;
}

/** Tax on taxable income (after personal relief), split by band. */
export function taxOnTaxable(taxable: number, bands: readonly Band[] = TAX_YEAR.bands) {
  const slices: BandSlice[] = [];
  let remaining = Math.max(0, taxable);
  let from = 0;
  let total = 0;
  for (const band of bands) {
    if (remaining <= 0) break;
    const amount = Math.min(remaining, band.width);
    const tax = amount * band.rate;
    slices.push({ rate: band.rate, from, to: from + amount, amount, tax });
    total += tax;
    remaining -= amount;
    from += amount;
  }
  return { total, slices };
}

/** Annual tax on gross assessable income, applying personal relief. */
export function annualTax(assessable: number) {
  const relief = Math.min(Math.max(0, assessable), TAX_YEAR.personalRelief);
  const taxable = Math.max(0, assessable - relief);
  const { total, slices } = taxOnTaxable(taxable);
  return {
    assessable,
    relief,
    taxable,
    tax: total,
    slices,
    effectiveRate: assessable > 0 ? total / assessable : 0,
    marginalRate: slices.length ? slices[slices.length - 1].rate : 0,
  };
}

/**
 * Monthly APIT on a regular monthly salary — the annualised method
 * (monthly × 12 → annual tax → ÷ 12). The IRD's published tables give the
 * same result to within rounding.
 */
export function monthlyApit(monthlySalary: number) {
  const annual = annualTax(Math.max(0, monthlySalary) * 12);
  const apit = annual.tax / 12;
  return {
    gross: monthlySalary,
    apit,
    takeHome: monthlySalary - apit,
    annual,
  };
}

export interface IncomeInput {
  employment: number;
  business: number;
  rent: number;
  interest: number;
  dividends: number;
  foreign: number;
  /** APIT already deducted by employers during the year. */
  apitPaid: number;
}

/**
 * Annual estimate across income sources.
 * Dividends with 15% WHT are treated as final (excluded from assessable income).
 * Interest WHT (10%) is credited against tax payable.
 */
export function annualEstimate(i: IncomeInput) {
  const rentAfterRelief = i.rent * (1 - TAX_YEAR.rentRelief);
  const assessable = i.employment + i.business + rentAfterRelief + i.interest + i.foreign;
  const result = annualTax(assessable);
  const interestWht = i.interest * TAX_YEAR.interestWht;
  const dividendWht = i.dividends * TAX_YEAR.dividendWht;
  const credits = i.apitPaid + interestWht;
  const balance = result.tax - credits;
  return {
    ...result,
    rentRelief: i.rent - rentAfterRelief,
    interestWht,
    dividendWht,
    credits,
    /** Positive = still to pay. Negative = potential refund. */
    balance,
  };
}

/** Interest WHT and whether a no-taxable-income self-declaration may apply. */
export function interestWht(annualInterest: number, otherAnnualIncome: number) {
  const wht = annualInterest * TAX_YEAR.interestWht;
  const total = annualInterest + otherAnnualIncome;
  const belowRelief = total <= TAX_YEAR.personalRelief;
  return {
    wht,
    net: annualInterest - wht,
    total,
    belowRelief,
    /** Tax actually due on all income. */
    actualTax: annualTax(total).tax,
  };
}

export function cgt(gain: number, saleDate: string) {
  const rate = saleDate >= TAX_YEAR.cgtChangeDate ? TAX_YEAR.cgtRate : TAX_YEAR.cgtOldRate;
  return { rate, tax: Math.max(0, gain) * rate };
}

const lkr = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });
export const formatLKR = (n: number) => `Rs. ${lkr.format(Math.round(n))}`;
export const formatPct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
