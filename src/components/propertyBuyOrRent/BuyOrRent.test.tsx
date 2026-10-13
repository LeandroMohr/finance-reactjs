import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { currency } from "@/utils/currency";
import BuyOrRent from "./BuyOrRent";

vi.mock("@/components/advertising/AdSlot", () => ({ default: () => null }));

describe("BuyOrRent", () => {
  it("renders the example, personal decision warning, annual evolution and sharing", () => {
    render(<BuyOrRent />);
    expect(screen.getByRole("heading", { level: 1, name: "Comprar x Alugar Imóvel" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "A melhor conta não é necessariamente a sua melhor escolha" })).toBeVisible();
    expect(screen.getByText(/Realização pessoal, segurança, liberdade e flexibilidade/)).toBeVisible();
    expect(screen.getByText(/Sua decisão HOJE usa as informações/)).toBeVisible();
    expect(screen.getByRole("status", { name: "Resultado da comparação" })).toHaveTextContent("Maior patrimônio projetado");
    expect(screen.getByText(/R\$\s1\.900,00/)).toBeVisible();
    expect(screen.getByText(/R\$\s900,00/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Copiar link/ })).toBeInTheDocument();
    expect(within(screen.getByRole("table", { hidden: true })).getAllByRole("row", { hidden: true })).toHaveLength(22);
  });

  it("changes from SAC to Price and preserves currency masking", () => {
    render(<BuyOrRent />);
    fireEvent.change(screen.getByLabelText("Sistema de amortização"), { target: { value: "price" } });
    expect(screen.getByText(/R\$\s1\.900,00/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(screen.queryByText(/R\$\s1\.900,00/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Entrada"), { target: { value: "30000000" } });
    expect(screen.getByLabelText("Entrada")).toHaveValue(currency.format(300000));
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    const buy = screen.getByRole("region", { name: "Comprar e investir a sobra" });
    expect(within(buy).getAllByText(/R\$\s0,00/).length).toBeGreaterThan(0);
  });

  it("accepts decimal commas and negative scenario growth", () => {
    render(<BuyOrRent />);
    fireEvent.change(screen.getByLabelText("Valorização do imóvel (% ao ano)"), { target: { value: "-2,5" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Resultado da comparação" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("Tipo da taxa do financiamento"), { target: { value: "effective" } });
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(screen.queryByText(/R\$\s1\.900,00/)).not.toBeInTheDocument();
  });

  it.each(["", "abc", "Infinity", "51", "1.5"])("keeps the last calculation for an invalid comparison horizon: %s", (value) => {
    render(<BuyOrRent />);
    fireEvent.change(screen.getByLabelText("Prazo da comparação (anos)"), { target: { value } });
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByLabelText("Prazo da comparação (anos)")).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(screen.getByRole("status", { name: "Resultado da comparação" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Comparação em 20 anos" })).toBeVisible();
    expect(screen.queryByText(/Campos alterados/)).not.toBeInTheDocument();
  });

  it("reports an invalid cash deposit in the rental scenario", () => {
    render(<BuyOrRent />);
    fireEvent.change(screen.getByLabelText("Aluguel mensal"), { target: { value: "100000" } });
    expect(screen.getByRole("alert")).toHaveTextContent("Caução em dinheiro");
    expect(screen.getByRole("alert")).toHaveTextContent("três meses de aluguel");
    fireEvent.change(screen.getByLabelText("Caução em dinheiro"), { target: { value: "300000" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps costs separated and changes rental IPTU responsibility", () => {
    render(<BuyOrRent />);
    const purchase = screen.getByRole("region", { name: "1. Compra do imóvel" });
    const rental = screen.getByRole("region", { name: "2. Aluguel do mesmo imóvel" });
    expect(within(purchase).getByLabelText("IPTU anual da compra")).toBeVisible();
    expect(within(rental).getByLabelText("IPTU anual da locação")).toBeVisible();
    expect(within(purchase).queryByLabelText("Aluguel mensal")).not.toBeInTheDocument();
    expect(within(rental).queryByLabelText("Entrada")).not.toBeInTheDocument();
    fireEvent.change(within(purchase).getByLabelText("Condomínio mensal da compra"), { target: { value: "90000" } });
    expect(within(rental).getByLabelText("Condomínio mensal da locação")).toHaveValue(currency.format(500));
    const checkbox = screen.getByRole("checkbox", { name: /contrato de locação atribui o IPTU/ });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(checkbox).not.toBeChecked();
    const rent = screen.getByRole("region", { name: "Alugar e investir a sobra" });
    expect(within(rent).getByText(/R\$\s2\.300,00/)).toBeVisible();
  });

  it("shows a two-series chart and allows keyboard-compatible monthly inspection", () => {
    render(<BuyOrRent />);
    expect(screen.getByRole("img", { name: "Evolução do patrimônio líquido na compra e no aluguel" })).toBeVisible();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    const chart = screen.getByRole("img", { name: "Evolução do patrimônio líquido na compra e no aluguel" });
    fireEvent.keyDown(chart, { key: "Home" });
    for (let month = 0; month < 60; month += 1) fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(document.getElementById("housing-chart-values")).toHaveTextContent("Mês 60");
    expect(document.getElementById("housing-chart-values")).toHaveTextContent("Reforma:");
    fireEvent.change(screen.getByLabelText("Reforma a cada 5 anos (% do imóvel)"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(document.getElementById("housing-chart-values")).not.toHaveTextContent("Reforma:");
    fireEvent.change(screen.getByLabelText("Prazo da comparação (anos)"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(document.getElementById("housing-chart-values")).toHaveTextContent("Mês 12");
  });

  it("inspects graph values directly with a pointer and explains editable percentage examples", () => {
    render(<BuyOrRent />);
    const chart = screen.getByRole("img", { name: "Evolução do patrimônio líquido na compra e no aluguel" });
    vi.spyOn(chart, "getBoundingClientRect").mockReturnValue({ ...new DOMRect(), left: 0, width: 760 });
    fireEvent.pointerMove(chart, { clientX: 265 });
    expect(document.getElementById("housing-chart-values")).toHaveTextContent("Mês 60");
    fireEvent.pointerDown(chart, { clientX: 730 });
    expect(document.getElementById("housing-chart-values")).toHaveTextContent("Mês 240");
    fireEvent.click(screen.getByRole("button", { name: "Ajuda: Aluguel mensal" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("0,6% × R$ 300.000 = R$ 1.800");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Edite livremente");
    fireEvent.change(screen.getByLabelText("Aluguel mensal"), { target: { value: "210000" } });
    expect(screen.getByLabelText("Aluguel mensal")).toHaveValue(currency.format(2100));
    expect(screen.getByLabelText("Cartório e outros custos iniciais (%)")).toHaveValue("5");
  });

  it("preserves the caution, pros and cons even when the calculation is invalid", () => {
    render(<BuyOrRent />);
    fireEvent.change(screen.getByLabelText("Entrada"), { target: { value: "40000000" } });
    expect(screen.getByRole("alert")).toHaveTextContent("não pode superar");
    expect(screen.getByRole("heading", { name: "Além da matemática: o que pesa para você?" })).toBeVisible();
    expect(screen.getByText(/Alugar pode ser uma escolha consciente, não um fracasso/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Juros Compostos/ }).getAttribute("href")).toMatch(/^\/juros-compostos\/?$/);
  });
});
