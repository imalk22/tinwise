import { describe, expect, it } from "vitest";
import { annualEstimate, annualTax, cgt, interestWht, monthlyApit } from "./tax";

describe("annualTax", () => {
  it("is zero at or below the Rs. 1.8M relief", () => {
    expect(annualTax(0).tax).toBe(0);
    expect(annualTax(1_800_000).tax).toBe(0);
  });
  it("applies 6% to the first band", () => {
    expect(annualTax(2_400_000).tax).toBeCloseTo(36_000);
  });
  it("spans multiple bands", () => {
    expect(annualTax(3_600_000).tax).toBeCloseTo(222_000);
  });
  it("reaches the 36% band above Rs. 4.3M", () => {
    const r = annualTax(6_000_000);
    expect(r.tax).toBeCloseTo(1_032_000);
    expect(r.marginalRate).toBe(0.36);
    expect(r.slices).toHaveLength(5);
  });
});

describe("monthlyApit", () => {
  it("is zero up to Rs. 150,000 a month", () => {
    expect(monthlyApit(150_000).apit).toBe(0);
  });
  it("matches annualised tax", () => {
    expect(monthlyApit(200_000).apit).toBeCloseTo(3_000);
    expect(monthlyApit(300_000).apit).toBeCloseTo(18_500);
  });
});

describe("annualEstimate", () => {
  it("credits APIT and interest WHT, and gives rent relief", () => {
    const r = annualEstimate({
      employment: 2_400_000, business: 0, rent: 400_000, interest: 100_000,
      dividends: 0, foreign: 0, apitPaid: 36_000,
    });
    // assessable = 2.4M + 300k + 100k = 2.8M → taxable 1M → 60k
    expect(r.assessable).toBe(2_800_000);
    expect(r.tax).toBeCloseTo(60_000);
    expect(r.credits).toBeCloseTo(46_000);
    expect(r.balance).toBeCloseTo(14_000);
  });
});

describe("interestWht", () => {
  it("flags self-declaration eligibility below relief", () => {
    const r = interestWht(200_000, 1_000_000);
    expect(r.wht).toBeCloseTo(20_000);
    expect(r.belowRelief).toBe(true);
    expect(r.actualTax).toBe(0);
  });
});

describe("cgt", () => {
  it("switches from 10% to 15% on 3 June 2026", () => {
    expect(cgt(1_000_000, "2026-06-02").rate).toBe(0.1);
    expect(cgt(1_000_000, "2026-06-03").tax).toBeCloseTo(150_000);
  });
});
