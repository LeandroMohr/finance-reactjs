import { describe, expect, it } from "vitest";
import { calculateFirstMillion, MILLION, MAX_MONTHS, type FirstMillionInput } from "./calculateFirstMillion";

const defaults: FirstMillionInput = {
  mode: "time", initialAmount: 0, monthlyContribution: 1000,
  interestRate: 10, ratePeriod: "annual",
};

describe("calculateFirstMillion", () => {
  it("finds the first month reaching the goal without interest", () => {
    const result = calculateFirstMillion({ ...defaults, monthlyContribution: 100_000, interestRate: 0 });
    expect(result.status).toBe("reached");
    expect(result.months).toBe(10);
    expect(result.finalAmount).toBe(MILLION);
    expect(result.totalContributed).toBe(MILLION);
    expect(result.totalReturns).toBe(0);
    expect(result.evolution.at(-2)!.balance).toBeLessThan(MILLION);
  });

  it("applies interest before the monthly contribution", () => {
    const result = calculateFirstMillion({
      ...defaults, initialAmount: 900_000, monthlyContribution: 100_000,
      interestRate: 1, ratePeriod: "monthly",
    });
    expect(result.months).toBe(1);
    expect(result.finalAmount).toBe(1_009_000);
    expect(result.totalReturns).toBe(9000);
  });

  it("uses equivalent annual rates and returns a consistent monthly evolution", () => {
    const result = calculateFirstMillion({ ...defaults, initialAmount: 100_000 });
    expect(result.status).toBe("reached");
    expect(result.evolution[12].balance).toBeCloseTo(
      100_000 * 1.1 + 1000 * (1.1 - 1) / (1.1 ** (1 / 12) - 1), 5,
    );
    expect(result.evolution.at(-2)!.balance).toBeLessThan(MILLION);
    expect(result.finalAmount).toBeGreaterThanOrEqual(MILLION);
    expect(result.totalContributed + result.totalReturns).toBeCloseTo(result.finalAmount, 5);
  });

  it.each([MILLION, 2 * MILLION])("recognizes an already achieved goal of %s", (initialAmount) => {
    const result = calculateFirstMillion({ ...defaults, initialAmount });
    expect(result.months).toBe(0);
    expect(result.status).toBe("reached");
    expect(result.evolution).toHaveLength(1);
  });

  it.each([
    { initialAmount: 0, interestRate: 10 },
    { initialAmount: 50_000, interestRate: 0 },
  ])("reports unreachable scenarios explicitly", (input) => {
    const result = calculateFirstMillion({ ...defaults, ...input, monthlyContribution: 0 });
    expect(result.status).toBe("unreachable");
    expect(result.months).toBe(0);
  });

  it("allows compound growth without contributions", () => {
    const result = calculateFirstMillion({ ...defaults, initialAmount: 900_000, monthlyContribution: 0 });
    expect(result.status).toBe("reached");
    expect(result.totalContributed).toBe(900_000);
  });

  it("distinguishes the horizon limit from an impossible goal", () => {
    const result = calculateFirstMillion({ ...defaults, monthlyContribution: 1, interestRate: 0 });
    expect(result.status).toBe("limit");
    expect(result.months).toBe(MAX_MONTHS);
    expect(result.finalAmount).toBe(1200);
  });

  it("calculates and rounds up the needed contribution with zero interest", () => {
    const result = calculateFirstMillion({
      mode: "contribution", initialAmount: 0, interestRate: 0, ratePeriod: "annual", months: 120,
    });
    expect(result.monthlyContribution).toBe(8333.34);
    expect(result.status).toBe("reached");
    expect(result.months).toBe(120);
  });

  it.each([1, 12, 240, 1200])("the recommended payment reaches the goal within %s months", (months) => {
    const result = calculateFirstMillion({
      mode: "contribution", initialAmount: 10_000, interestRate: 10, ratePeriod: "annual", months,
    });
    expect(result.status).toBe("reached");
    expect(result.months).toBeLessThanOrEqual(months);
    expect(result.finalAmount).toBeGreaterThanOrEqual(MILLION);
    const lower = calculateFirstMillion({
      ...defaults, initialAmount: 10_000, monthlyContribution: Math.max(0, result.monthlyContribution - 0.01),
    });
    if (result.monthlyContribution > 0) {
      expect(lower.evolution[months]?.balance ?? lower.finalAmount).toBeLessThan(MILLION);
    }
  });

  it("does not require new contributions when the existing capital suffices", () => {
    const result = calculateFirstMillion({
      mode: "contribution", initialAmount: 900_000, interestRate: 10, ratePeriod: "annual", months: 24,
    });
    expect(result.monthlyContribution).toBe(0);
    expect(result.status).toBe("reached");
  });

  it("avoids overflow for very high rates and long horizons", () => {
    const result = calculateFirstMillion({
      mode: "contribution", initialAmount: 0, interestRate: 100, ratePeriod: "monthly", months: MAX_MONTHS,
    });
    expect(result.status).toBe("reached");
    expect(Number.isFinite(result.finalAmount)).toBe(true);
    expect(result.monthlyContribution).toBe(0.01);
  });

  it("handles very small rates without cancellation", () => {
    const result = calculateFirstMillion({
      mode: "contribution", initialAmount: 0, interestRate: 0.000001, ratePeriod: "annual", months: 120,
    });
    expect(result.monthlyContribution).toBe(8333.34);
    expect(result.status).toBe("reached");
  });

  it.each([-1, NaN, Infinity, 101])("rejects invalid rates: %s", (interestRate) => {
    expect(() => calculateFirstMillion({ ...defaults, interestRate })).toThrow(RangeError);
  });

  it.each([0, -1, 1.5, 1201, NaN, Infinity])("rejects invalid deadlines: %s", (months) => {
    expect(() => calculateFirstMillion({
      mode: "contribution", initialAmount: 0, interestRate: 0, ratePeriod: "annual", months,
    })).toThrow(RangeError);
  });

  it("rejects negative or non-finite capital and contributions", () => {
    expect(() => calculateFirstMillion({ ...defaults, initialAmount: -1 })).toThrow(RangeError);
    expect(() => calculateFirstMillion({ ...defaults, initialAmount: Infinity })).toThrow(RangeError);
    expect(() => calculateFirstMillion({ ...defaults, monthlyContribution: -1 })).toThrow(RangeError);
  });
});
