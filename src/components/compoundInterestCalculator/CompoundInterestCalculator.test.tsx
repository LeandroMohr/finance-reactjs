import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CompoundInterestCalculator, { calculateCompoundInterest } from "./CompoundInterestCalculator";

function getInput(label: string): HTMLInputElement {
  return screen.getByLabelText(label) as HTMLInputElement;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

describe("calculateCompoundInterest", () => {
  it("returns the final amount when there is no rate and no initial investment", () => {
    const result = calculateCompoundInterest({
      initialAmount: 0,
      monthlyContribution: 100,
      interestRate: 0,
      ratePeriod: "annual",
      duration: 1,
      durationUnit: "years",
    });

    expect(result.finalAmount).toBe(1200);
    expect(result.totalContributed).toBe(1200);
    expect(result.totalReturns).toBe(0);
  });

  it("returns the final amount when adding a fixed contribution with a positive rate", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      interestRate: 12,
      ratePeriod: "annual",
      duration: 1,
      durationUnit: "years",
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
      interestRate: 12,
      ratePeriod: "annual",
      duration: 1,
      durationUnit: "years",
    });

    result.monthlyBreakdown.reduce((previousBalance, month) => {
      expect(month.balance).toBeCloseTo(previousBalance + month.contribution + month.interest, 6);
      return month.balance;
    }, 1000);
  });

  it("does not create monthly entries when the period is zero", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 0,
      interestRate: 12,
      ratePeriod: "annual",
      duration: 0,
      durationUnit: "years",
    });

    expect(result.monthlyBreakdown).toHaveLength(0);
    expect(result.finalAmount).toBe(1000);
  });

  it("returns only contributions when the rate is zero", () => {
    const result = calculateCompoundInterest({
      initialAmount: 500,
      monthlyContribution: 250,
      interestRate: 0,
      ratePeriod: "annual",
      duration: 2,
      durationUnit: "years",
    });

    expect(result.totalReturns).toBe(0);
    expect(result.finalAmount).toBe(result.totalContributed);
  });

  it("accepts a monthly rate and a duration in months", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      interestRate: 1,
      ratePeriod: "monthly",
      duration: 18,
      durationUnit: "months",
    });

    expect(result.monthlyBreakdown).toHaveLength(18);
    expect(result.finalAmount).toBeCloseTo(3157.62, 2);
    expect(result.totalContributed).toBe(2800);
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

    for (const label of ["Aporte inicial", "Aporte mensal", "Taxa de juros (%)", "Tempo"]) {
      expect(getInput(label)).toBeInTheDocument();
    }

    expect(screen.getByLabelText("Periodicidade da taxa")).toHaveValue("annual");
    expect(screen.getByLabelText("Unidade do tempo")).toHaveValue("years");
  });

  it("renders no monthly rows before the user informs a period", () => {
    render(<CompoundInterestCalculator />);

    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(rows).toHaveLength(1); // header only
  });

  it("renders the monthly breakdown limited to the last twelve months", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    await user.type(getInput("Aporte mensal"), "10000");

    const duration = getInput("Tempo");
    await user.clear(duration);
    await user.type(duration, "18");
    await user.selectOptions(screen.getByLabelText("Unidade do tempo"), "months");

    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(rows).toHaveLength(13); // header + 12 months
  });

  it("masks currency fields as BRL while the user types", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const initialAmount = getInput("Aporte inicial");

    expect(initialAmount).toHaveValue(currency.format(0));

    await user.type(initialAmount, "123456");

    expect(initialAmount).toHaveValue(currency.format(1234.56));
  });

  it("accepts comma or dot as the decimal separator", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const rate = getInput("Taxa de juros (%)");
    await user.clear(rate);
    await user.type(rate, "12,25");

    const duration = getInput("Tempo");
    await user.clear(duration);
    await user.type(duration, "1.5");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(13);
  });

  it("shows an error when the interest rate is negative", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const rate = getInput("Taxa de juros (%)");
    await user.clear(rate);
    await user.type(rate, "-5");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A taxa de juros não pode ser negativa.",
    );
    expect(rate).toHaveAttribute("aria-invalid", "true");
  });

  it("shows an error when a decimal field has an invalid format", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const duration = getInput("Tempo");
    await user.clear(duration);
    await user.type(duration, "dois anos");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use apenas números, com vírgula ou ponto. Ex.: 1,8",
    );
  });

  it("shows an error when a required decimal field is empty", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    await user.clear(getInput("Taxa de juros (%)"));

    expect(screen.getByRole("alert")).toHaveTextContent("Informe a taxa de juros.");
  });

  it("shows an error when the period exceeds the supported limit", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const duration = getInput("Tempo");
    await user.clear(duration);
    await user.type(duration, "101");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O tempo máximo é de 100 anos (1200 meses).",
    );
  });

  it("shows the value of the hovered point on the chart", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    await user.type(getInput("Aporte mensal"), "10000");

    const duration = getInput("Tempo");
    await user.clear(duration);
    await user.type(duration, "3");
    await user.selectOptions(screen.getByLabelText("Unidade do tempo"), "months");

    const chart = screen.getByRole("img");
    // jsdom não calcula layout, então o tamanho do gráfico precisa ser simulado.
    vi.spyOn(chart, "getBoundingClientRect").mockReturnValue({
      ...new DOMRect(),
      left: 0,
      width: 640,
    });

    fireEvent.pointerMove(chart, { clientX: 640 });

    const tooltip = screen.getByText("3º mês").parentElement as HTMLElement;

    expect(tooltip).toHaveTextContent("3º mês");
    expect(tooltip).toHaveTextContent(currency.format(300).replace(/\u00a0/g, " "));

    fireEvent.pointerLeave(chart);

    expect(screen.queryByText("3º mês")).not.toBeInTheDocument();
  });

  it("recalculates the result when the user changes a field", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    await user.type(getInput("Aporte mensal"), "50000");

    const rate = getInput("Taxa de juros (%)");
    await user.clear(rate);
    await user.type(rate, "1");
    await user.selectOptions(screen.getByLabelText("Periodicidade da taxa"), "monthly");

    const duration = getInput("Tempo");
    await user.clear(duration);
    await user.type(duration, "18");
    await user.selectOptions(screen.getByLabelText("Unidade do tempo"), "months");

    // getByText normaliza o espaço não separável usado pelo Intl.
    expect(screen.getByText(currency.format(9000).replace(/\u00a0/g, " "))).toBeInTheDocument();
    expect(screen.getByText(currency.format(807.37).replace(/\u00a0/g, " "))).toBeInTheDocument();
  });

  it("treats an emptied currency field as zero without breaking the calculation", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const initialAmount = getInput("Aporte inicial");
    await user.clear(initialAmount);

    expect(initialAmount).toHaveValue(currency.format(0));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
