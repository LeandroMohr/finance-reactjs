import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CompoundInterestCalculator, { calculateCompoundInterest } from "./CompoundInterestCalculator";

function getInput(label: string): HTMLInputElement {
  return screen.getByLabelText(label) as HTMLInputElement;
}

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

describe("CompoundInterestCalculator", () => {
  it("renders the heading and every simulation field", () => {
    render(<CompoundInterestCalculator />);

    expect(
      screen.getByRole("heading", {
        name: "Juros compostos: como o dinheiro cresce com o tempo",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Descubra seu crescimento" })).toBeInTheDocument();

    for (const label of ["Aporte inicial", "Aporte mensal", "Taxa anual (%)", "Tempo (anos)"]) {
      expect(getInput(label)).toBeInTheDocument();
    }
  });

  it("renders the monthly breakdown limited to the last twelve months", () => {
    render(<CompoundInterestCalculator />);

    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(rows).toHaveLength(13); // header + 12 months
  });

  it("shows the default result before any interaction", () => {
    render(<CompoundInterestCalculator />);

    expect(screen.getByText("R$ 35.000,00 aportados em 5 ano(s)")).toBeInTheDocument();
  });

  it("recalculates the result when the user changes a field", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const years = getInput("Tempo (anos)");
    await user.clear(years);
    await user.type(years, "1");

    expect(screen.getByText("R$ 11.000,00 aportados em 1 ano(s)")).toBeInTheDocument();
  });

  it("treats an emptied field as zero without breaking the calculation", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    await user.clear(getInput("Aporte inicial"));

    expect(screen.getByText("R$ 30.000,00 aportados em 5 ano(s)")).toBeInTheDocument();
  });
});
