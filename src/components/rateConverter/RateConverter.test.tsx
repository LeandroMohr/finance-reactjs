import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import RateConverter, { convertRate } from "./RateConverter";

describe("convertRate", () => {
  it("converts a monthly rate into the equivalent annual rate", () => {
    const result = convertRate({ rate: 1, fromPeriod: "monthly", toPeriod: "annual" });

    expect(result).toBeCloseTo(12.68250301, 5);
  });

  it("converts an annual rate into the equivalent monthly rate", () => {
    const result = convertRate({ rate: 12.6825, fromPeriod: "annual", toPeriod: "monthly" });

    expect(result).toBeCloseTo(1, 4);
  });

  it("returns the same rate when converting to the same period", () => {
    const result = convertRate({ rate: 5, fromPeriod: "monthly", toPeriod: "monthly" });

    expect(result).toBeCloseTo(5, 6);
  });

  it("returns zero when the rate is zero regardless of the periods", () => {
    const result = convertRate({ rate: 0, fromPeriod: "daily", toPeriod: "annual" });

    expect(result).toBe(0);
  });
});

describe("RateConverter", () => {
  it("renders the heading and every field", () => {
    render(<RateConverter />);

    expect(
      screen.getByRole("heading", { name: "Conversor de taxas: converta taxas de juros entre períodos diferentes" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Taxa de juros (%)")).toHaveValue("2,8");
    expect(screen.getByLabelText("Periodicidade da taxa")).toHaveValue("monthly");
    expect(screen.getByLabelText("Converter para")).toHaveValue("annual");
    expect(screen.getByLabelText("Valor de exemplo")).toHaveValue("R$ 1.000,00");
  });

  it("recommends related tools", () => {
    render(<RateConverter />);

    const related = screen.getByRole("heading", { name: "Ferramentas relacionadas" });
    const faq = screen.getByRole("heading", { name: "Perguntas frequentes" });

    expect(related.closest("section")!.compareDocumentPosition(faq.closest("section")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("link", { name: /Juros Compostos/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Taxa Real de Juros" })).toBeInTheDocument();
  });

  it("explains equivalent rates and answers conversion questions", () => {
    render(<RateConverter />);

    expect(screen.getByText(/39,29% ao ano/)).toBeInTheDocument();
    expect(screen.getByText(/Posso multiplicar uma taxa mensal por 12/)).toBeInTheDocument();
    expect(screen.getAllByText(/convenção comercial 30\/360/)).toHaveLength(2);
  });

  it("shows the equivalent rate for the default inputs", () => {
    render(<RateConverter />);

    expect(
      within(screen.getByText("Resultado").closest("aside")!).getByText("39,29%"),
    ).toBeInTheDocument();
  });

  it("shows the example interest amounts for the day, the month and the year", () => {
    render(<RateConverter />);

    const aside = screen.getByText("Resultado").closest("aside")!;

    expect(within(aside).getByText("Juros no dia")).toBeInTheDocument();
    expect(within(aside).getByText("R$ 0,92")).toBeInTheDocument();
    expect(within(aside).getByText("Juros no mês")).toBeInTheDocument();
    expect(within(aside).getByText("R$ 28,00")).toBeInTheDocument();
    expect(within(aside).getByText("Juros no ano")).toBeInTheDocument();
    expect(within(aside).getByText("R$ 392,89")).toBeInTheDocument();
  });

  it("updates the example interest amounts when the example amount changes", async () => {
    const user = userEvent.setup();
    render(<RateConverter />);

    const amount = screen.getByLabelText("Valor de exemplo");
    await user.clear(amount);
    await user.type(amount, "200000");

    const aside = screen.getByText("Resultado").closest("aside")!;

    expect(within(aside).getByText("R$ 785,78")).toBeInTheDocument();
  });

  it("swaps the source and target periods", async () => {
    const user = userEvent.setup();
    render(<RateConverter />);

    await user.click(screen.getByRole("button", { name: "Inverter periodicidades" }));

    expect(screen.getByLabelText("Periodicidade da taxa")).toHaveValue("annual");
    expect(screen.getByLabelText("Converter para")).toHaveValue("monthly");
  });

  it("shows a validation error for an empty rate", async () => {
    const user = userEvent.setup();
    render(<RateConverter />);

    await user.clear(screen.getByLabelText("Taxa de juros (%)"));

    expect(screen.getByRole("alert")).toHaveTextContent("Informe a taxa de juros.");
  });

  it("lists the equivalent rate for daily, monthly and annual periods only", () => {
    render(<RateConverter />);

    const table = screen.getByRole("table");

    expect(table).toHaveTextContent("Diária");
    expect(table).toHaveTextContent("Mensal");
    expect(table).toHaveTextContent("Anual");
    expect(table).not.toHaveTextContent("Bimestral");
    expect(table).not.toHaveTextContent("Trimestral");
    expect(table).not.toHaveTextContent("Semestral");
  });
});
