import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "./calculateCompoundInterest";

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

  it("keeps the balance consistent with contributions and interest on every month", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      annualRate: 12,
      years: 1,
    });

    result.monthlyBreakdown.reduce((previousBalance, month) => {
      expect(month.balance).toBeCloseTo(previousBalance + month.contribution + month.interest, 6);
      return month.balance;
    }, 1000);
  });

  it("falls back to a single month when the period is zero", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 0,
      annualRate: 12,
      years: 0,
    });

    expect(result.monthlyBreakdown).toHaveLength(1);
  });

  it("returns only contributions when the rate is zero", () => {
    const result = calculateCompoundInterest({
      initialAmount: 500,
      monthlyContribution: 250,
      annualRate: 0,
      years: 2,
    });

    expect(result.totalReturns).toBe(0);
    expect(result.finalAmount).toBe(result.totalContributed);
  });
});
