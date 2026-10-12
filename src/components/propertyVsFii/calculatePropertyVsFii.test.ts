import { describe, expect, it } from "vitest";
import { calculatePropertyVsFii, propertyVsFiiDefaults as defaults } from "./calculatePropertyVsFii";

const simple = {
  ...defaults, propertyPrice: 300000, acquisitionPercent: 0, monthlyRentPercent: 0.5,
  vacancyPercent: 0, administrationPercent: 10, annualMaintenancePercent: 0,
  renovationPercent: 0, rentAnnualGrowth: 0, costAnnualGrowth: 0, propertyAnnualGrowth: 0,
  propertySalePercent: 0, propertyGainTaxPercent: 0, fiiAnnualGrowth: 0,
  fiiGainTaxPercent: 0, reserveAnnualReturn: 0, years: 1,
};

describe("property versus brick FII", () => {
  it("reproduces the rental income example and uses the same starting capital", () => {
    const result = calculatePropertyVsFii({ ...simple, mode: "withdraw" });
    expect(result.firstGrossRent).toBe(1500);
    expect(result.evolution[1].rentalNetIncome).toBe(1350);
    expect(result.evolution[1].fiiNetIncome).toBe(2100);
    expect(result.final.propertyWithdrawn).toBe(16200);
    expect(result.final.fiiWithdrawn).toBe(25200);
    expect(result.final.propertyNetAssets).toBe(300000);
    expect(result.final.fiiNetAssets).toBe(300000);
    expect(result.final.propertyTotal).toBe(316200);
  });

  it("compounds reinvested FII distributions but holds property income in a separate liquid reserve", () => {
    const result = calculatePropertyVsFii(simple);
    expect(result.final.fiiValue).toBeCloseTo(300000 * 1.007 ** 12);
    expect(result.final.propertyReserve).toBe(16200);
    expect(result.final.propertyValue).toBe(300000);
    expect(result.final.propertyWithdrawn).toBe(0);
  });

  it("includes acquisition costs in the FII budget instead of comparing unequal investments", () => {
    const result = calculatePropertyVsFii(defaults);
    expect(result.initialCapital).toBe(323100);
    expect(result.evolution[0].fiiValue).toBe(323100);
    expect(result.acquisitionCosts).toBe(23100);
  });

  it("applies vacancy before administration and separates operational costs and tax", () => {
    const result = calculatePropertyVsFii({
      ...simple, vacancyPercent: 20, rentalTaxPercent: 10, monthlyOwnerCosts: 100,
    });
    expect(result.evolution[1].rentalNetIncome).toBe(1200 - 120 - 120 - 100);
  });

  it("models income tax separately from FII quote growth", () => {
    const result = calculatePropertyVsFii({ ...simple, fiiIncomeTaxPercent: 20 });
    expect(result.evolution[1].fiiNetIncome).toBe(1680);
  });

  it("adds a renovation only every five years, including the endpoint", () => {
    const result = calculatePropertyVsFii({ ...simple, years: 10, renovationPercent: 5, propertyAnnualGrowth: 4 });
    const events = result.evolution.filter((point) => point.renovation > 0);
    expect(events.map((point) => point.month)).toEqual([60, 120]);
    expect(events[0].renovation).toBeCloseTo(300000 * 1.04 ** 5 * 0.05);
    expect(result.totalRenovations).toBeCloseTo(events[0].renovation + events[1].renovation);
  });

  it.each(["withdraw", "reinvest"] as const)("handles deficits with equal additional capital in %s mode", (mode) => {
    const result = calculatePropertyVsFii({
      ...simple, mode, vacancyPercent: 100, monthlyOwnerCosts: 100,
      monthlyRentPercent: 0, fiiMonthlyYield: 0,
    });
    expect(result.final.extraCapital).toBe(1200);
    expect(result.final.propertyReserve).toBe(0);
    expect(result.final.propertyTotal).toBe(298800);
    expect(result.final.fiiTotal).toBe(300000);
    expect(result.evolution.every((point) => point.propertyReserve >= 0)).toBe(true);
  });

  it("does not tax losses and deducts exit fees before estimating gains", () => {
    const result = calculatePropertyVsFii({
      ...simple, propertyAnnualGrowth: -10, fiiAnnualGrowth: -10,
      propertyGainTaxPercent: 15, fiiGainTaxPercent: 20, propertySalePercent: 6,
    });
    expect(result.propertySaleTax).toBe(0);
    expect(result.fiiSaleTax).toBe(0);
    expect(result.final.propertyNetAssets).toBeCloseTo(270000 * 0.94 + 16200);
  });

  it("includes reinvestment purchases in the FII tax basis instead of taxing dividends twice", () => {
    const result = calculatePropertyVsFii({ ...simple, fiiGainTaxPercent: 20 });
    expect(result.fiiSaleTax).toBeCloseTo(0);
  });

  it("tracks taxed quote appreciation without counting it as income", () => {
    const result = calculatePropertyVsFii({
      ...simple, mode: "withdraw", fiiAnnualGrowth: 10, fiiMonthlyYield: 0, fiiGainTaxPercent: 20,
    });
    expect(result.final.fiiValue).toBeCloseTo(330000);
    expect(result.fiiSaleTax).toBeCloseTo(6000);
    expect(result.final.fiiNetAssets).toBeCloseTo(324000);
    expect(result.final.fiiWithdrawn).toBe(0);
  });

  it("deducts trading costs from the same initial budget", () => {
    const result = calculatePropertyVsFii({ ...simple, fiiEntryPercent: 1 });
    expect(result.evolution[0].fiiValue + result.fiiEntryCosts).toBeCloseTo(300000);
    expect(result.evolution[0].fiiValue).toBeCloseTo(300000 / 1.01);
  });

  it("uses accumulated rent for renovations before requiring additional money", () => {
    const result = calculatePropertyVsFii({ ...simple, years: 5, renovationPercent: 5 });
    expect(result.final.renovation).toBe(15000);
    expect(result.final.propertyReserve).toBe(1350 * 60 - 15000);
    expect(result.final.extraCapital).toBe(0);
  });

  it("requires matching additional money when withdrawn rents cannot pay a renovation", () => {
    const result = calculatePropertyVsFii({
      ...simple, mode: "withdraw", years: 5, renovationPercent: 5,
    });
    expect(result.final.propertyWithdrawn).toBe(1350 * 59);
    expect(result.final.extraCapital).toBe(15000 - 1350);
    expect(result.final.fiiReserve).toBe(result.final.extraCapital);
    expect(result.final.propertyTotal).toBe(300000 + 1350 * 60 - 15000);
  });

  it("applies entry fees to every reinvestment, preserving the acquisition tax basis", () => {
    const result = calculatePropertyVsFii({ ...simple, fiiEntryPercent: 1, fiiGainTaxPercent: 20 });
    expect(result.final.fiiValue).toBeCloseTo((300000 / 1.01) * (1 + 0.007 / 1.01) ** 12);
    expect(result.fiiSaleTax).toBe(0);
  });

  it("includes documented acquisition and renovation expenses in the hypothetical property basis", () => {
    const result = calculatePropertyVsFii({
      ...simple, years: 5, acquisitionPercent: 10, renovationPercent: 5,
      propertyAnnualGrowth: 10, propertyGainTaxPercent: 15,
    });
    expect(result.propertySaleTax).toBeCloseTo((300000 * 1.1 ** 5 - 330000 - result.totalRenovations) * 0.15);
  });

  it.each([
    { propertyPrice: 0 }, { years: 1.5 }, { years: 51 }, { monthlyRentPercent: -1 },
    { fiiAnnualGrowth: -100 }, { vacancyPercent: 101 }, { rentalTaxPercent: NaN },
    { renovationPercent: Infinity }, { fiiMonthlyYield: 6 },
  ])("rejects invalid data %j", (patch) => {
    expect(() => calculatePropertyVsFii({ ...defaults, ...patch })).toThrow(RangeError);
  });

  it("keeps long scenarios finite", () => {
    const result = calculatePropertyVsFii({ ...defaults, years: 50, fiiAnnualGrowth: 30, fiiMonthlyYield: 5 });
    expect(result.evolution).toHaveLength(601);
    expect(Object.values(result.final).every(Number.isFinite)).toBe(true);
  });
});
