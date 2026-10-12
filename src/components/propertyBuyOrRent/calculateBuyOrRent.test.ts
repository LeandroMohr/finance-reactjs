import { describe, expect, it } from "vitest";
import { calculateBuyOrRent, defaultBuyOrRentInput as defaults, validateBuyOrRent } from "./calculateBuyOrRent";

describe("buy versus rent model", () => {
  it("uses editable examples with 20% down, 0.6% rent, 5% acquisition costs and 0.7% monthly returns", () => {
    expect(defaults.downPayment / defaults.propertyPrice).toBeCloseTo(0.2);
    expect(defaults.monthlyRent / defaults.propertyPrice).toBeCloseTo(0.006);
    expect(defaults.rentalDeposit).toBe(defaults.monthlyRent * 3);
    expect(defaults.registrationPercent).toBe(5);
    expect((1 + defaults.investmentAnnualRate / 100) ** (1 / 12) - 1).toBeCloseTo(0.007, 8);
  });
  it("reproduces the first SAC installment in the supplied nominal-rate example", () => {
    const result = calculateBuyOrRent(defaults);
    expect(result.firstInstallment).toBeCloseTo(1900);
    expect(result.evolution[1].interest).toBeCloseTo(900);
    expect(result.evolution[1].amortized).toBeCloseTo(1000);
    expect(result.evolution[2].installment).toBeCloseTo(1896.25);
    expect(result.final.debt).toBe(0);
    expect(result.totalInterest).toBeCloseTo(108450);
  });

  it("keeps upfront taxes separate from monthly expenses and excludes amortization from interest", () => {
    const result = calculateBuyOrRent(defaults);
    expect(result.acquisitionCosts).toBeCloseTo(23100);
    expect(result.buyUpfront).toBeCloseTo(83100);
    expect(result.firstBuyCost).toBeCloseTo(1900 + 500 + 350 / 12 + 250);
    expect(result.firstRentCost).toBeCloseTo(1800 + 500 + 350 / 12);
    expect(result.final.debt).toBe(0);
    expect(result.totalBuyHousingCosts).toBeGreaterThan(result.totalInterest + 240000);
  });

  it("converts effective annual rates instead of dividing them by 12", () => {
    const result = calculateBuyOrRent({ ...defaults, loanRateType: "effective", loanAnnualRate: 12 });
    expect((1 + result.monthlyLoanRate) ** 12).toBeCloseTo(1.12);
    expect(result.monthlyLoanRate).not.toBe(0.01);
  });

  it("keeps Price payments constant and pays off the entire debt", () => {
    const result = calculateBuyOrRent({ ...defaults, amortization: "price" });
    for (const point of result.evolution.slice(1)) {
      expect(point.installment).toBeCloseTo(result.firstInstallment, 6);
    }
    expect(result.final.debt).toBe(0);
    expect(result.evolution[2].amortized).toBeGreaterThan(result.evolution[1].amortized);
  });

  it.each(["sac", "price"] as const)("handles zero-interest financing with %s", (amortization) => {
    const result = calculateBuyOrRent({ ...defaults, amortization, loanAnnualRate: 0 });
    expect(result.firstInstallment).toBe(1000);
    expect(result.totalInterest).toBe(0);
    expect(result.final.debt).toBe(0);
  });

  it("keeps the remaining debt for a horizon shorter than the loan", () => {
    const result = calculateBuyOrRent({ ...defaults, horizonYears: 1 });
    expect(result.final.debt).toBeCloseTo(228000);
    expect(result.final.buyNetWorth).toBeCloseTo(
      result.final.propertyValue * 0.94 - 228000 + result.final.buyInvestments,
    );
  });

  it("stops installments after payoff but continues ownership costs and investments", () => {
    const result = calculateBuyOrRent({ ...defaults, loanYears: 1, horizonYears: 2 });
    expect(result.evolution[13].installment).toBe(0);
    expect(result.evolution[13].buyMonthlyCost).toBeGreaterThan(0);
    expect(result.final.buyInvestments).toBeGreaterThan(0);
  });

  it("handles an outright purchase without charging any loan interest", () => {
    const result = calculateBuyOrRent({ ...defaults, downPayment: defaults.propertyPrice });
    expect(result.firstInstallment).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.final.debt).toBe(0);
  });

  it("uses identical starting capital and invests the cheaper option's monthly surplus", () => {
    const result = calculateBuyOrRent({ ...defaults, investmentAnnualRate: 0, depositAnnualRate: 0 });
    expect(result.evolution[0].rentInvestments + defaults.rentalDeposit).toBe(result.initialCapital);
    expect(result.evolution[0].buyInvestments + result.buyUpfront).toBe(result.initialCapital);
    for (let index = 1; index < result.evolution.length; index += 1) {
      const previous = result.evolution[index - 1];
      const point = result.evolution[index];
      expect(point.buyInvestments - previous.buyInvestments + point.buyMonthlyCost).toBeCloseTo(point.budget);
      expect(point.rentInvestments - previous.rentInvestments + point.rentMonthlyCost).toBeCloseTo(point.budget);
    }
  });

  it("does not create free starting capital when the rental deposit exceeds purchase cash needs", () => {
    const result = calculateBuyOrRent({
      ...defaults, downPayment: 0, itbiPercent: 0, registrationPercent: 0,
    });
    expect(result.initialCapital).toBe(defaults.rentalDeposit);
    expect(result.evolution[0].buyInvestments).toBe(defaults.rentalDeposit);
    expect(result.evolution[0].rentInvestments).toBe(0);
  });

  it("returns the deposit with its own yield instead of treating it as rent expense", () => {
    const result = calculateBuyOrRent({ ...defaults, horizonYears: 1 });
    expect(result.final.deposit).toBeCloseTo(5400 * 1.06);
    expect(result.final.rentNetWorth).toBeCloseTo(result.final.rentInvestments + result.final.deposit);
  });

  it("applies rent and operating-cost adjustments only at annual anniversaries", () => {
    const result = calculateBuyOrRent(defaults);
    expect(result.evolution[12].rentMonthlyCost).toBeCloseTo(result.firstRentCost);
    expect(result.evolution[13].rentMonthlyCost).toBeCloseTo(1800 * 1.05 + (500 + 350 / 12) * 1.04);
    expect(result.final.propertyValue).toBeCloseTo(300000 * 1.04 ** 20);
  });

  it("honors the rental IPTU responsibility and supports negative scenario returns", () => {
    const result = calculateBuyOrRent({
      ...defaults, renterPaysPropertyTax: false, investmentAnnualRate: -5, propertyAnnualGrowth: -5,
    });
    expect(result.firstRentCost).toBe(2300);
    expect(result.final.propertyValue).toBeLessThan(defaults.propertyPrice);
    expect(Number.isFinite(result.difference)).toBe(true);
  });

  it.each([
    { propertyPrice: 0 }, { downPayment: 300001 }, { loanYears: 0 },
    { horizonYears: 51 }, { loanYears: 1.5 }, { investmentAnnualRate: -100 },
    { loanAnnualRate: Infinity }, { monthlyRent: NaN }, { rentalDeposit: 5401 },
    { itbiPercent: 21 }, { annualMaintenancePercent: -1 },
    { renovationPercent: -1 }, { renovationPercent: 101 }, { renovationPercent: NaN },
    { monthlyRenterCondo: -1 }, { annualRenterPropertyTax: Infinity },
  ])("rejects invalid inputs explicitly: %j", (patch) => {
    const input = { ...defaults, ...patch };
    expect(Object.keys(validateBuyOrRent(input)).length).toBeGreaterThan(0);
    expect(() => calculateBuyOrRent(input)).toThrow(RangeError);
  });

  it("keeps the maximum supported horizon and rates finite", () => {
    const result = calculateBuyOrRent({
      ...defaults, horizonYears: 50, investmentAnnualRate: 30, propertyAnnualGrowth: 30,
    });
    expect(result.evolution).toHaveLength(601);
    expect(Object.values(result.final).every(Number.isFinite)).toBe(true);
  });

  it("matches a hand-calculated scenario and reverses the result when hypotheses change", () => {
    const input = {
      ...defaults, propertyPrice: 1200, downPayment: 1200, horizonYears: 1,
      itbiPercent: 0, registrationPercent: 0, salePercent: 0,
      monthlyRent: 100, monthlyCondo: 0, annualPropertyTax: 0, annualMaintenancePercent: 0,
      monthlyOwnerExtras: 0, monthlyRenterExtras: 0, rentalDeposit: 0,
      investmentAnnualRate: 0, propertyAnnualGrowth: 0, rentAnnualAdjustment: 0,
      costAnnualAdjustment: 0, depositAnnualRate: 0,
      monthlyRenterCondo: 0, annualRenterPropertyTax: 0, renovationPercent: 0,
    };
    const buying = calculateBuyOrRent(input);
    expect(buying.final.buyNetWorth).toBeCloseTo(2400);
    expect(buying.final.rentNetWorth).toBeCloseTo(1200);
    expect(buying.difference).toBeCloseTo(1200);
    const renting = calculateBuyOrRent({ ...input, monthlyRent: 0, monthlyOwnerExtras: 200 });
    expect(renting.final.buyNetWorth).toBeCloseTo(1200);
    expect(renting.final.rentNetWorth).toBeCloseTo(3600);
    expect(renting.difference).toBeCloseTo(-2400);
    expect(calculateBuyOrRent({ ...input, monthlyRent: 0 }).difference).toBeCloseTo(0);
  });

  it("charges renovation exactly every 60 months on the current property value", () => {
    const result = calculateBuyOrRent({ ...defaults, horizonYears: 10, renovationPercent: 5 });
    const events = result.evolution.filter((point) => point.renovation > 0);
    expect(events.map((point) => point.month)).toEqual([60, 120]);
    expect(events[0].renovation).toBeCloseTo(300000 * 1.04 ** 5 * 0.05);
    expect(events[1].renovation).toBeCloseTo(300000 * 1.04 ** 10 * 0.05);
    expect(result.totalRenovations).toBeCloseTo(events.reduce((sum, point) => sum + point.renovation, 0));
    const without = calculateBuyOrRent({ ...defaults, horizonYears: 10, renovationPercent: 0 });
    expect(result.totalBuyHousingCosts - without.totalBuyHousingCosts).toBeCloseTo(result.totalRenovations);
    expect(result.final.rentNetWorth).toBeGreaterThan(without.final.rentNetWorth);
    expect(calculateBuyOrRent({ ...defaults, horizonYears: 4 }).totalRenovations).toBe(0);
  });

  it("allows independent condo and property tax costs in each scenario", () => {
    const original = calculateBuyOrRent(defaults);
    const owner = calculateBuyOrRent({ ...defaults, monthlyCondo: 900, annualPropertyTax: 1200 });
    expect(owner.firstRentCost).toBeCloseTo(original.firstRentCost);
    expect(owner.firstBuyCost - original.firstBuyCost).toBeCloseTo(400 + 850 / 12);
    const renter = calculateBuyOrRent({ ...defaults, monthlyRenterCondo: 800, annualRenterPropertyTax: 600 });
    expect(renter.firstBuyCost).toBeCloseTo(original.firstBuyCost);
    expect(renter.firstRentCost - original.firstRentCost).toBeCloseTo(300 + 250 / 12);
  });
});
