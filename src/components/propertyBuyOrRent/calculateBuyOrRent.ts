export type BuyOrRentInput = {
  propertyPrice: number;
  downPayment: number;
  loanYears: number;
  loanAnnualRate: number;
  loanRateType: "nominal" | "effective";
  amortization: "sac" | "price";
  horizonYears: number;
  monthlyRent: number;
  investmentAnnualRate: number;
  propertyAnnualGrowth: number;
  rentAnnualAdjustment: number;
  costAnnualAdjustment: number;
  itbiPercent: number;
  registrationPercent: number;
  salePercent: number;
  monthlyCondo: number;
  annualPropertyTax: number;
  monthlyRenterCondo: number;
  annualRenterPropertyTax: number;
  annualMaintenancePercent: number;
  renovationPercent: number;
  monthlyOwnerExtras: number;
  monthlyRenterExtras: number;
  rentalDeposit: number;
  depositAnnualRate: number;
  renterPaysPropertyTax: boolean;
  monthlyIncome: number;
};

export const defaultBuyOrRentInput: BuyOrRentInput = {
  propertyPrice: 300_000, downPayment: 60_000, loanYears: 20, loanAnnualRate: 4.5,
  loanRateType: "nominal", amortization: "sac", horizonYears: 20,
  monthlyRent: 1800, investmentAnnualRate: 8.731066, propertyAnnualGrowth: 4,
  rentAnnualAdjustment: 5, costAnnualAdjustment: 4,
  itbiPercent: 2.7, registrationPercent: 5, salePercent: 6,
  monthlyCondo: 500, annualPropertyTax: 350, annualMaintenancePercent: 1,
  monthlyRenterCondo: 500, annualRenterPropertyTax: 350, renovationPercent: 5,
  monthlyOwnerExtras: 0, monthlyRenterExtras: 0,
  rentalDeposit: 5400, depositAnnualRate: 6, renterPaysPropertyTax: true,
  monthlyIncome: 6500,
};

export type HousingPoint = {
  month: number;
  propertyValue: number;
  debt: number;
  installment: number;
  interest: number;
  amortized: number;
  renovation: number;
  buyMonthlyCost: number;
  rentMonthlyCost: number;
  budget: number;
  buyInvestments: number;
  rentInvestments: number;
  deposit: number;
  buyNetWorth: number;
  rentNetWorth: number;
};

export type BuyOrRentResult = {
  evolution: HousingPoint[];
  final: HousingPoint;
  acquisitionCosts: number;
  buyUpfront: number;
  initialCapital: number;
  monthlyLoanRate: number;
  firstInstallment: number;
  firstBuyCost: number;
  firstRentCost: number;
  maximumBudget: number;
  totalInterest: number;
  totalRenovations: number;
  totalBuyHousingCosts: number;
  totalRentHousingCosts: number;
  difference: number;
};

export function validateBuyOrRent(input: BuyOrRentInput): Partial<Record<keyof BuyOrRentInput, string>> {
  const errors: Partial<Record<keyof BuyOrRentInput, string>> = {};
  const range = (key: keyof BuyOrRentInput, min: number, max: number, integer = false) => {
    const value = input[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max ||
      (integer && !Number.isInteger(value))) {
      errors[key] = `Informe ${integer ? "um número inteiro" : "um valor"} entre ${min} e ${max}.`;
    }
  };
  for (const key of [
    "downPayment", "monthlyRent", "monthlyCondo", "annualPropertyTax",
    "monthlyOwnerExtras", "monthlyRenterExtras", "rentalDeposit", "monthlyIncome",
    "monthlyRenterCondo", "annualRenterPropertyTax",
  ] as const) range(key, 0, 1_000_000_000);
  range("propertyPrice", 1, 1_000_000_000);
  range("loanYears", 1, 35, true);
  range("horizonYears", 1, 50, true);
  range("loanAnnualRate", 0, 30);
  for (const key of [
    "investmentAnnualRate", "propertyAnnualGrowth", "rentAnnualAdjustment", "costAnnualAdjustment",
  ] as const) range(key, -20, 30);
  range("depositAnnualRate", 0, 30);
  for (const key of ["itbiPercent", "registrationPercent", "salePercent"] as const) range(key, 0, 20);
  range("annualMaintenancePercent", 0, 10);
  range("renovationPercent", 0, 100);
  if (input.downPayment > input.propertyPrice) errors.downPayment = "A entrada não pode superar o valor do imóvel.";
  if (input.rentalDeposit > input.monthlyRent * 3) {
    errors.rentalDeposit = "A caução em dinheiro não pode superar três meses de aluguel.";
  }
  if (input.loanRateType !== "nominal" && input.loanRateType !== "effective") errors.loanRateType = "Escolha uma taxa nominal ou efetiva.";
  if (input.amortization !== "sac" && input.amortization !== "price") errors.amortization = "Escolha SAC ou Price.";
  if (typeof input.renterPaysPropertyTax !== "boolean") errors.renterPaysPropertyTax = "Informe quem paga o IPTU na locação.";
  return errors;
}

function monthlyRate(annualPercent: number) {
  return Math.expm1(Math.log1p(annualPercent / 100) / 12);
}

export function calculateBuyOrRent(input: BuyOrRentInput): BuyOrRentResult {
  const errors = validateBuyOrRent(input);
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors).join(" "));
  const acquisitionCosts = input.propertyPrice * (input.itbiPercent + input.registrationPercent) / 100;
  const buyUpfront = input.downPayment + acquisitionCosts;
  const initialCapital = Math.max(buyUpfront, input.rentalDeposit);
  const principal = input.propertyPrice - input.downPayment;
  const loanMonths = input.loanYears * 12;
  const loanRate = input.loanRateType === "nominal" ? input.loanAnnualRate / 1200 : monthlyRate(input.loanAnnualRate);
  const pricePayment = loanRate === 0 ? principal / loanMonths
    : principal * loanRate / -Math.expm1(-loanMonths * Math.log1p(loanRate));
  const investmentRate = monthlyRate(input.investmentAnnualRate);
  const growthRate = monthlyRate(input.propertyAnnualGrowth);
  const depositRate = monthlyRate(input.depositAnnualRate);
  let debt = principal;
  let propertyValue = input.propertyPrice;
  let buyInvestments = initialCapital - buyUpfront;
  let rentInvestments = initialCapital - input.rentalDeposit;
  let deposit = input.rentalDeposit;
  let totalInterest = 0;
  let totalRenovations = 0;
  let totalBuyHousingCosts = buyUpfront;
  let totalRentHousingCosts = 0;
  let maximumBudget = 0;
  const netWorth = () => ({
    buyNetWorth: propertyValue * (1 - input.salePercent / 100) - debt + buyInvestments,
    rentNetWorth: rentInvestments + deposit,
  });
  const evolution: HousingPoint[] = [{
    month: 0, propertyValue, debt, installment: 0, interest: 0, amortized: 0, renovation: 0,
    buyMonthlyCost: 0, rentMonthlyCost: 0, budget: 0, buyInvestments, rentInvestments,
    deposit, ...netWorth(),
  }];
  for (let month = 1; month <= input.horizonYears * 12; month += 1) {
    const interest = month <= loanMonths ? debt * loanRate : 0;
    const amortized = month <= loanMonths
      ? month === loanMonths ? debt : Math.min(debt, Math.max(0,
        input.amortization === "sac" ? principal / loanMonths : pricePayment - interest))
      : 0;
    const installment = interest + amortized;
    debt = Math.max(0, debt - amortized);
    const elapsedYears = Math.floor((month - 1) / 12);
    const costFactor = (1 + input.costAnnualAdjustment / 100) ** elapsedYears;
    const condo = input.monthlyCondo * costFactor;
    const propertyTax = input.annualPropertyTax / 12 * costFactor;
    const maintenance = input.propertyPrice * input.annualMaintenancePercent / 1200 * costFactor;
    propertyValue *= 1 + growthRate;
    const renovation = month % 60 === 0 ? propertyValue * input.renovationPercent / 100 : 0;
    const buyMonthlyCost = installment + condo + propertyTax + maintenance + input.monthlyOwnerExtras * costFactor + renovation;
    const rentMonthlyCost = input.monthlyRent * (1 + input.rentAnnualAdjustment / 100) ** elapsedYears +
      input.monthlyRenterCondo * costFactor +
      (input.renterPaysPropertyTax ? input.annualRenterPropertyTax / 12 * costFactor : 0) +
      input.monthlyRenterExtras * costFactor;
    const budget = Math.max(buyMonthlyCost, rentMonthlyCost);
    maximumBudget = Math.max(maximumBudget, budget);
    buyInvestments = buyInvestments * (1 + investmentRate) + budget - buyMonthlyCost;
    rentInvestments = rentInvestments * (1 + investmentRate) + budget - rentMonthlyCost;
    deposit *= 1 + depositRate;
    totalInterest += interest;
    totalRenovations += renovation;
    totalBuyHousingCosts += buyMonthlyCost;
    totalRentHousingCosts += rentMonthlyCost;
    evolution.push({
      month, propertyValue, debt, installment, interest, amortized, renovation, buyMonthlyCost,
      rentMonthlyCost, budget, buyInvestments, rentInvestments, deposit, ...netWorth(),
    });
  }
  const first = evolution[1];
  const final = evolution[evolution.length - 1];
  return {
    evolution, final, acquisitionCosts, buyUpfront, initialCapital, monthlyLoanRate: loanRate,
    firstInstallment: first.installment, firstBuyCost: first.buyMonthlyCost, firstRentCost: first.rentMonthlyCost,
    maximumBudget, totalInterest, totalRenovations, totalBuyHousingCosts, totalRentHousingCosts,
    difference: final.buyNetWorth - final.rentNetWorth,
  };
}
