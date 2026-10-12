export const MILLION = 1_000_000;
export const MAX_MONTHS = 1200;

type CommonInput = {
  initialAmount: number;
  interestRate: number;
  ratePeriod: "monthly" | "annual";
};

export type FirstMillionInput = CommonInput & (
  | { mode: "time"; monthlyContribution: number }
  | { mode: "contribution"; months: number }
);

export type EvolutionPoint = {
  month: number;
  balance: number;
  contributed: number;
};

export type FirstMillionResult = {
  status: "reached" | "unreachable" | "limit";
  months: number;
  monthlyContribution: number;
  finalAmount: number;
  totalContributed: number;
  totalReturns: number;
  evolution: EvolutionPoint[];
};

export function calculateFirstMillion(input: FirstMillionInput): FirstMillionResult {
  const { initialAmount, interestRate, ratePeriod } = input;
  if (
    !Number.isFinite(initialAmount) || initialAmount < 0 ||
    !Number.isFinite(interestRate) || interestRate < 0 || interestRate > 100 ||
    (ratePeriod !== "annual" && ratePeriod !== "monthly")
  ) {
    throw new RangeError("Informe capital não negativo e uma taxa entre 0% e 100%.");
  }
  if (input.mode === "time") {
    if (!Number.isFinite(input.monthlyContribution) || input.monthlyContribution < 0) {
      throw new RangeError("O aporte mensal deve ser um valor não negativo.");
    }
  } else if (!Number.isInteger(input.months) || input.months < 1 || input.months > MAX_MONTHS) {
    throw new RangeError("O prazo deve ser de 1 a 1200 meses inteiros.");
  }

  const monthlyRate = ratePeriod === "annual"
    ? Math.expm1(Math.log1p(interestRate / 100) / 12)
    : interestRate / 100;
  let monthlyContribution = input.mode === "time" ? input.monthlyContribution : 0;
  if (input.mode === "contribution" && initialAmount < MILLION) {
    const logGrowth = input.months * Math.log1p(monthlyRate);
    // Discounting avoids overflow for high rates and long horizons.
    const needed = monthlyRate === 0
      ? (MILLION - initialAmount) / input.months
      : (MILLION * Math.exp(-logGrowth) - initialAmount) * monthlyRate / -Math.expm1(-logGrowth);
    // Round up to cents so the suggested payment does not undershoot the goal.
    monthlyContribution = Math.ceil(Math.max(0, needed) * 100) / 100;
    let projected = initialAmount;
    for (let month = 0; month < input.months && projected < MILLION; month += 1) {
      projected = projected * (1 + monthlyRate) + monthlyContribution;
    }
    if (projected < MILLION) monthlyContribution += 0.01;
  }

  let balance = initialAmount;
  let months = 0;
  let contributed = initialAmount;
  const evolution: EvolutionPoint[] = [{ month: 0, balance, contributed }];
  const horizon = input.mode === "contribution" ? input.months : MAX_MONTHS;
  const unreachable = initialAmount < MILLION && monthlyContribution === 0 &&
    (initialAmount === 0 || monthlyRate === 0);

  while (balance < MILLION && months < horizon && !unreachable) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    contributed += monthlyContribution;
    months += 1;
    evolution.push({ month: months, balance, contributed });
  }

  return {
    status: balance >= MILLION ? "reached" : unreachable ? "unreachable" : "limit",
    months,
    monthlyContribution,
    finalAmount: balance,
    totalContributed: contributed,
    totalReturns: balance - contributed,
    evolution,
  };
}
