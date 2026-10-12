export const propertyVsFiiDefaults = {
  propertyPrice: 300000,
  acquisitionPercent: 7.7,
  monthlyRentPercent: 0.5,
  vacancyPercent: 8.33,
  administrationPercent: 10,
  annualMaintenancePercent: 1,
  monthlyOwnerCosts: 0,
  renovationPercent: 5,
  rentAnnualGrowth: 4,
  costAnnualGrowth: 4,
  propertyAnnualGrowth: 4,
  rentalTaxPercent: 0,
  propertySalePercent: 6,
  propertyGainTaxPercent: 15,
  fiiMonthlyYield: 0.7,
  fiiAnnualGrowth: 4,
  fiiEntryPercent: 0,
  fiiExitPercent: 0,
  fiiIncomeTaxPercent: 0,
  fiiGainTaxPercent: 20,
  reserveAnnualReturn: 8.731066,
  years: 20,
  mode: "reinvest" as "reinvest" | "withdraw",
};

export type PropertyVsFiiInput = typeof propertyVsFiiDefaults;
export type InvestmentPoint = {
  month: number;
  propertyValue: number;
  fiiValue: number;
  rentalNetIncome: number;
  fiiNetIncome: number;
  renovation: number;
  propertyReserve: number;
  fiiReserve: number;
  propertyWithdrawn: number;
  fiiWithdrawn: number;
  extraCapital: number;
  propertyNetAssets: number;
  fiiNetAssets: number;
  propertyTotal: number;
  fiiTotal: number;
};
export type PropertyVsFiiResult = {
  initialCapital: number;
  acquisitionCosts: number;
  fiiEntryCosts: number;
  firstGrossRent: number;
  evolution: InvestmentPoint[];
  final: InvestmentPoint;
  totalRenovations: number;
  propertySaleTax: number;
  fiiSaleTax: number;
};

export function validatePropertyVsFii(input: PropertyVsFiiInput) {
  const errors: Partial<Record<keyof PropertyVsFiiInput, string>> = {};
  for (const key of Object.keys(propertyVsFiiDefaults) as (keyof PropertyVsFiiInput)[]) {
    if (key === "mode") continue;
    const value = input[key];
    const min = ["rentAnnualGrowth", "costAnnualGrowth", "propertyAnnualGrowth", "fiiAnnualGrowth", "reserveAnnualReturn"].includes(key) ? -20
      : key === "propertyPrice" || key === "years" ? 1 : 0;
    const max = key === "propertyPrice" || key === "monthlyOwnerCosts" ? 1e9
      : key === "years" ? 50
      : ["rentAnnualGrowth", "costAnnualGrowth", "propertyAnnualGrowth", "fiiAnnualGrowth", "reserveAnnualReturn"].includes(key) ? 30
      : key === "monthlyRentPercent" || key === "fiiMonthlyYield" ? 5
      : key === "fiiEntryPercent" || key === "fiiExitPercent" ? 20 : 100;
    if (!Number.isFinite(value) || value < min || value > max || (key === "years" && !Number.isInteger(value))) {
      errors[key] = `Informe ${key === "years" ? "um número inteiro" : "um valor"} entre ${min} e ${max}.`;
    }
  }
  if (input.mode !== "reinvest" && input.mode !== "withdraw") errors.mode = "Escolha reinvestir ou retirar os rendimentos.";
  return errors;
}

const monthlyRate = (annual: number) => Math.expm1(Math.log1p(annual / 100) / 12);

export function calculatePropertyVsFii(input: PropertyVsFiiInput): PropertyVsFiiResult {
  const errors = validatePropertyVsFii(input);
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors).join(" "));
  const acquisitionCosts = input.propertyPrice * input.acquisitionPercent / 100;
  const initialCapital = input.propertyPrice + acquisitionCosts;
  // Entry fees apply to the amount purchased, not to the total budget.
  const initialFiiValue = initialCapital / (1 + input.fiiEntryPercent / 100);
  const fiiEntryCosts = initialCapital - initialFiiValue;
  const firstGrossRent = input.propertyPrice * input.monthlyRentPercent / 100;
  let propertyValue = input.propertyPrice;
  let fiiValue = initialFiiValue;
  let fiiCostBasis = initialCapital;
  let propertyCostBasis = initialCapital;
  let propertyReserve = 0;
  let fiiReserve = 0;
  let propertyWithdrawn = 0;
  let fiiWithdrawn = 0;
  let extraCapital = 0;
  let totalRenovations = 0;
  const propertyGrowth = monthlyRate(input.propertyAnnualGrowth);
  const fiiGrowth = monthlyRate(input.fiiAnnualGrowth);
  const reserveGrowth = monthlyRate(input.reserveAnnualReturn);
  const liquidation = () => {
    const propertyProceeds = propertyValue * (1 - input.propertySalePercent / 100);
    const fiiProceeds = fiiValue * (1 - input.fiiExitPercent / 100);
    const propertySaleTax = Math.max(0, propertyProceeds - propertyCostBasis) * input.propertyGainTaxPercent / 100;
    const fiiSaleTax = Math.max(0, fiiProceeds - fiiCostBasis) * input.fiiGainTaxPercent / 100;
    const propertyNetAssets = propertyProceeds - propertySaleTax + propertyReserve;
    const fiiNetAssets = fiiProceeds - fiiSaleTax + fiiReserve;
    return {
      propertySaleTax, fiiSaleTax, propertyNetAssets, fiiNetAssets,
      propertyTotal: propertyNetAssets + propertyWithdrawn - extraCapital,
      fiiTotal: fiiNetAssets + fiiWithdrawn - extraCapital,
    };
  };
  const evolution: InvestmentPoint[] = [{
    month: 0, propertyValue, fiiValue, rentalNetIncome: 0, fiiNetIncome: 0, renovation: 0,
    propertyReserve, fiiReserve, propertyWithdrawn, fiiWithdrawn, extraCapital, ...liquidation(),
  }];
  for (let month = 1; month <= input.years * 12; month += 1) {
    const year = Math.floor((month - 1) / 12);
    const receivedRent = firstGrossRent * (1 + input.rentAnnualGrowth / 100) ** year *
      (1 - input.vacancyPercent / 100);
    const administration = receivedRent * input.administrationPercent / 100;
    const rentalTax = receivedRent * input.rentalTaxPercent / 100;
    const recurringCosts = (input.propertyPrice * input.annualMaintenancePercent / 1200 +
      input.monthlyOwnerCosts) * (1 + input.costAnnualGrowth / 100) ** year;
    const fiiNetIncome = fiiValue * input.fiiMonthlyYield / 100 * (1 - input.fiiIncomeTaxPercent / 100);
    propertyValue *= 1 + propertyGrowth;
    fiiValue *= 1 + fiiGrowth;
    const renovation = month % 60 === 0 ? propertyValue * input.renovationPercent / 100 : 0;
    totalRenovations += renovation;
    propertyCostBasis += renovation;
    const rentalNetIncome = receivedRent - administration - rentalTax - recurringCosts - renovation;
    propertyReserve *= 1 + reserveGrowth;
    fiiReserve *= 1 + reserveGrowth;
    const extra = Math.max(0, -rentalNetIncome - propertyReserve);
    extraCapital += extra;
    if (input.mode === "reinvest") {
      propertyReserve = Math.max(0, propertyReserve + rentalNetIncome + extra);
      const purchaseBudget = fiiNetIncome + extra;
      fiiValue += purchaseBudget / (1 + input.fiiEntryPercent / 100);
      fiiCostBasis += purchaseBudget;
    } else {
      propertyReserve = Math.max(0, propertyReserve + Math.min(0, rentalNetIncome) + extra);
      fiiReserve += extra;
      propertyWithdrawn += Math.max(0, rentalNetIncome);
      fiiWithdrawn += fiiNetIncome;
    }
    evolution.push({
      month, propertyValue, fiiValue, rentalNetIncome, fiiNetIncome, renovation,
      propertyReserve, fiiReserve, propertyWithdrawn, fiiWithdrawn, extraCapital, ...liquidation(),
    });
  }
  const final = evolution[evolution.length - 1];
  return {
    initialCapital, acquisitionCosts, fiiEntryCosts, firstGrossRent, evolution, final, totalRenovations,
    propertySaleTax: liquidation().propertySaleTax, fiiSaleTax: liquidation().fiiSaleTax,
  };
}
