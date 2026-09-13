export type CompoundInterestInput = {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
};

export type MonthlyBreakdown = {
  month: number;
  contribution: number;
  interest: number;
  balance: number;
};

export type CompoundInterestResult = {
  finalAmount: number;
  totalContributed: number;
  totalReturns: number;
  monthlyBreakdown: MonthlyBreakdown[];
};

const MONTHS_PER_YEAR = 12;

export function calculateCompoundInterest({
  initialAmount,
  monthlyContribution,
  annualRate,
  years,
}: CompoundInterestInput): CompoundInterestResult {
  const monthlyRate = annualRate / 100 / MONTHS_PER_YEAR;
  const totalMonths = Math.max(1, years * MONTHS_PER_YEAR);

  let balance = initialAmount;
  let totalContribution = initialAmount;
  const monthlyBreakdown: MonthlyBreakdown[] = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const contribution = monthlyContribution;
    totalContribution += contribution;

    const interest = balance * monthlyRate;
    balance += contribution + interest;

    monthlyBreakdown.push({
      month,
      contribution,
      interest,
      balance,
    });
  }

  return {
    finalAmount: Number(balance.toFixed(2)),
    totalContributed: Number(totalContribution.toFixed(2)),
    totalReturns: Number((balance - totalContribution).toFixed(2)),
    monthlyBreakdown,
  };
}
