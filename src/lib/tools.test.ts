import { describe, expect, it } from "vitest";
import { capitalGains, foreignIncome, gratuity, grossForTakeHome, latePenalties, payslip, realChange, vatPrice, vatSscl } from "./tools";

describe("capitalGains", () => {
  const base = { salePrice: 20_000_000, cost: 12_000_000, costs: 1_000_000, principalResidence: false };
  it("uses 15% from 3 June 2026", () => {
    const r = capitalGains({ ...base, saleDate: "2026-07-01" });
    expect(r.gain).toBe(7_000_000);
    expect(r.tax).toBeCloseTo(1_050_000);
  });
  it("uses 10% before", () => {
    expect(capitalGains({ ...base, saleDate: "2026-06-02" }).tax).toBeCloseTo(700_000);
  });
  it("is zero for a loss or a principal residence", () => {
    expect(capitalGains({ ...base, salePrice: 10_000_000, saleDate: "2026-07-01" }).tax).toBe(0);
    expect(capitalGains({ ...base, saleDate: "2026-07-01", principalResidence: true }).tax).toBe(0);
  });
});

describe("vatSscl", () => {
  it("applies liable share before the SSCL threshold", () => {
    const retail = vatSscl(50_000_000, "retail"); // liable 25M < 36M
    expect(retail.ssclRequired).toBe(false);
    expect(retail.vatRequired).toBe(false);
    const services = vatSscl(50_000_000, "services"); // liable 50M
    expect(services.ssclRequired).toBe(true);
    expect(services.sscl).toBeCloseTo(1_250_000);
  });
  it("requires VAT from Rs. 60M", () => {
    expect(vatSscl(60_000_000, "retail").vatRequired).toBe(true);
  });
  it("adds and removes 18% VAT", () => {
    expect(vatPrice(1000, "add").gross).toBeCloseTo(1180);
    expect(vatPrice(1180, "remove").net).toBeCloseTo(1000);
  });
});

describe("foreignIncome", () => {
  it("converts and taxes only the extra", () => {
    const r = foreignIncome(1000, 300, 0); // Rs 3.6M a year
    expect(r.annualLkr).toBe(3_600_000);
    expect(r.extraTax).toBeCloseTo(222_000);
  });
});

describe("realChange", () => {
  it("adjusts a raise for inflation", () => {
    const r = realChange(100_000, 110_000, 0.1);
    expect(r.nominal).toBeCloseTo(0.1);
    expect(r.real).toBeCloseTo(0);
    expect(r.keepUp).toBeCloseTo(110_000);
  });
});

describe("latePenalties", () => {
  it("adds interest and the 20% penalty for late payment", () => {
    const r = latePenalties(100_000, 3, 0);
    expect(r.interest).toBeCloseTo(4_500);
    expect(r.paymentPenalty).toBeCloseTo(20_000);
  });
  it("uses the larger late-filing amount", () => {
    expect(latePenalties(100_000, 0, 2).filingPenalty).toBeCloseTo(70_000); // fixed beats 7%
    expect(latePenalties(10_000_000, 0, 2).filingPenalty).toBeCloseTo(700_000); // 7% beats fixed
  });
  it("caps the fixed late-filing amount", () => {
    expect(latePenalties(0, 0, 60).filingPenalty).toBe(400_000);
  });
});

describe("payslip", () => {
  it("deducts 8% EPF and APIT", () => {
    const r = payslip(200_000);
    expect(r.epf).toBeCloseTo(16_000);
    expect(r.apit).toBeCloseTo(3_000);
    expect(r.takeHome).toBeCloseTo(181_000);
    expect(r.employerCost).toBeCloseTo(230_000); // + 12% EPF + 3% ETF
  });
  it("uses a smaller EPF base when given", () => {
    expect(payslip(200_000, 150_000).epf).toBeCloseTo(12_000);
  });
});

describe("grossForTakeHome", () => {
  it("inverts the payslip", () => {
    const g = grossForTakeHome(181_000, true);
    expect(Math.abs(g - 200_000)).toBeLessThan(2);
  });
});

describe("gratuity", () => {
  it("pays half a month per completed year after 5 years", () => {
    expect(gratuity(100_000, 10.7).amount).toBe(500_000);
    expect(gratuity(100_000, 4.9).eligible).toBe(false);
  });
});
