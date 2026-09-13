import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "./compoundInterest";

describe("calculateCompoundInterest", () => {
  it("returns the final amount when there is no rate and no initial investment", () => {
    const result = calculateCompoundInterest({
      initialAmount: 0,
      monthlyContribution: 100,
      annualRate: 0,
      years: 1,
    });

    expect(result.finalAmount).toBe(1200);
    expect(result.totalContributed).toBe(1200);
    expect(result.totalReturns).toBe(0);
  });

  it("returns the final amount when adding a fixed contribution with a positive rate", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      annualRate: 12,
      years: 1,
    });

    expect(result.finalAmount).toBeCloseTo(2395.08, 2);
    expect(result.totalContributed).toBe(2200);
    expect(result.totalReturns).toBeCloseTo(195.08, 2);
    expect(result.monthlyBreakdown.length).toBe(12);
  });
});
