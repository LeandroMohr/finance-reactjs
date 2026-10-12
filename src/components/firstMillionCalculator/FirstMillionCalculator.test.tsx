import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FirstMillionCalculator, { formatDuration } from "./FirstMillionCalculator";
import { currency } from "@/utils/currency";

describe("FirstMillionCalculator", () => {
  it("renders the default simulation, chart, milestones and related tools", () => {
    render(<FirstMillionCalculator />);
    expect(screen.getByRole("heading", { level: 1, name: /primeiro milhão/ })).toBeVisible();
    expect(screen.getByRole("img", { name: /Patrimônio projetado/ })).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
    expect(screen.getByRole("link", { name: /Juros Compostos/ }).getAttribute("href")).toMatch(/^\/compound-interest\/?$/);
    expect(screen.getByRole("button", { name: /Copiar link/ })).toBeInTheDocument();
  });

  it("updates the time with masked currency and decimal comma", () => {
    render(<FirstMillionCalculator />);
    fireEvent.change(screen.getByLabelText("Aporte mensal"), { target: { value: "10000000" } });
    fireEvent.change(screen.getByLabelText("Taxa de juros (%)"), { target: { value: "0,0" } });
    expect(screen.getByLabelText("Aporte mensal")).toHaveValue(currency.format(100_000));
    expect(within(screen.getByRole("complementary")).getByText("10 meses")).toBeVisible();
  });

  it("calculates the required contribution and converts the deadline unit", () => {
    render(<FirstMillionCalculator />);
    fireEvent.click(screen.getByLabelText("Descobrir o aporte mensal"));
    fireEvent.change(screen.getByLabelText("Taxa de juros (%)"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Prazo desejado"), { target: { value: "10" } });
    expect(within(screen.getByRole("complementary")).getByText(/R\$\s8\.333,34/)).toBeVisible();
    fireEvent.change(screen.getByLabelText("Unidade do prazo"), { target: { value: "months" } });
    expect(within(screen.getByRole("complementary")).getByText(/R\$\s100\.000,00/)).toBeVisible();
    expect(screen.queryByLabelText("Aporte mensal")).not.toBeInTheDocument();
  });

  it("recognizes existing wealth and does not render an empty chart", () => {
    render(<FirstMillionCalculator />);
    fireEvent.change(screen.getByLabelText("Patrimônio inicial"), { target: { value: "100000000" } });
    expect(screen.getByText("Meta já alcançada")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("reports impossible scenarios instead of a success-shaped result", () => {
    render(<FirstMillionCalculator />);
    fireEvent.change(screen.getByLabelText("Aporte mensal"), { target: { value: "0" } });
    expect(screen.getByText("Meta não alcançável neste cenário")).toBeVisible();
  });

  it.each(["", "-1", "abc", "101", "Infinity"])("hides the result for an invalid rate: %s", (rate) => {
    render(<FirstMillionCalculator />);
    fireEvent.change(screen.getByLabelText("Taxa de juros (%)"), { target: { value: rate } });
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByLabelText("Taxa de juros (%)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Corrija os campos indicados para ver o resultado.")).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("validates deadlines only when needed", () => {
    render(<FirstMillionCalculator />);
    fireEvent.click(screen.getByLabelText("Descobrir o aporte mensal"));
    fireEvent.change(screen.getByLabelText("Prazo desejado"), { target: { value: "101" } });
    expect(screen.getByRole("alert")).toHaveTextContent("1 a 100 anos");
    fireEvent.click(screen.getByLabelText("Descobrir o tempo"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("reports the 100-year projection limit", () => {
    render(<FirstMillionCalculator />);
    fireEvent.change(screen.getByLabelText("Aporte mensal"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Taxa de juros (%)"), { target: { value: "0" } });
    expect(screen.getByText("Meta não atingida em 100 anos")).toBeVisible();
  });

});

describe("formatDuration", () => {
  it.each([[0, "Meta já alcançada"], [1, "1 mês"], [12, "1 ano"], [13, "1 ano e 1 mês"], [26, "2 anos e 2 meses"]])(
    "formats %s months", (months, expected) => expect(formatDuration(Number(months))).toBe(expected),
  );
});
