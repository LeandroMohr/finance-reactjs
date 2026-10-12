import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { currency } from "@/utils/currency";
import PropertyVsFii from "./PropertyVsFii";

vi.mock("@/components/advertising/AdSlot", () => ({ default: () => null }));

describe("PropertyVsFii", () => {
  it("renders separate investment scenarios with an equal initial budget and risk caveats", () => {
    render(<PropertyVsFii />);
    expect(screen.getByRole("heading", { level: 1, name: "Investir em Imóvel x FII de Tijolo" })).toBeVisible();
    expect(screen.getByRole("region", { name: "1. Casa ou apartamento para renda" })).toBeVisible();
    expect(screen.getByRole("region", { name: "2. FII de tijolo" })).toBeVisible();
    expect(screen.getByRole("status", { name: "Resultado do investimento" })).toHaveTextContent("Não é recomendação");
    expect(screen.getByText(/Capital inicial em cada cenário/)).toHaveTextContent(/R\$\s323\.100,00/);
    expect(screen.getByText(/Uma projeção matemática favorável/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Copiar link/ })).toBeInTheDocument();
  });

  it("switches to withdrawal and shows accumulated cash separately from assets", () => {
    render(<PropertyVsFii />);
    fireEvent.click(screen.getByLabelText("Retirar para usar"));
    const property = screen.getByRole("region", { name: "Imóvel para renda" });
    const values = within(property).getByText("Renda retirada acumulada").parentElement;
    expect(values?.textContent).not.toMatch(/R\$\s0,00$/);
    expect(screen.getByText(/As retiradas não são patrimônio disponível/)).toBeVisible();
    fireEvent.click(screen.getByLabelText("Reinvestir"));
    expect(values?.textContent).toMatch(/R\$\s0,00$/);
  });

  it("keeps FII cash income distinct from quote appreciation", () => {
    render(<PropertyVsFii />);
    const before = screen.getByRole("status", { name: "Resultado do investimento" }).textContent;
    fireEvent.change(screen.getByLabelText("Valorização anual das cotas (%)"), { target: { value: "-20" } });
    expect(screen.getByRole("status", { name: "Resultado do investimento" }).textContent).not.toBe(before);
    expect(screen.getByLabelText("Rendimento distribuído pelo FII (% ao mês)")).toHaveValue("0.7");
    fireEvent.change(screen.getByLabelText("Rendimento distribuído pelo FII (% ao mês)"), { target: { value: "0,5" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each(["", "0", "1.5", "51", "abc"])("rejects invalid deadlines without rendering successful results: %s", (value) => {
    render(<PropertyVsFii />);
    fireEvent.change(screen.getByLabelText("Prazo da comparação (anos)"), { target: { value } });
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByLabelText("Prazo da comparação (anos)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("status", { name: "Resultado do investimento" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O que o número não mostra" })).toBeVisible();
  });

  it("uses chart inspection without a month slider and includes annual values", () => {
    render(<PropertyVsFii />);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    const chart = screen.getByRole("img", { name: "Comparação do resultado econômico de imóvel e FII de tijolo" });
    fireEvent.keyDown(chart, { key: "Home" });
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(document.getElementById("investment-chart-values")).toHaveTextContent("Mês 1");
    fireEvent.keyDown(chart, { key: "End" });
    expect(document.getElementById("investment-chart-values")).toHaveTextContent("Mês 240");
    vi.spyOn(chart, "getBoundingClientRect").mockReturnValue({ ...new DOMRect(), left: 0, width: 760 });
    fireEvent.pointerMove(chart, { clientX: 265 });
    expect(document.getElementById("investment-chart-values")).toHaveTextContent("Mês 60");
    expect(within(screen.getByRole("table", { hidden: true })).getAllByRole("row", { hidden: true })).toHaveLength(22);
  });

  it("explains that FII income exemption is conditional and permits editable tax estimates", () => {
    render(<PropertyVsFii />);
    fireEvent.click(screen.getByRole("button", { name: "Ajuda: IR sobre rendimentos do FII (%)" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Não é isenção universal");
    fireEvent.change(screen.getByLabelText("IR sobre rendimentos do FII (%)"), { target: { value: "20" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("IR sobre rendimentos do FII (%)")).toHaveValue("20");
  });

  it("masks purchase currency and links back to the separate housing comparison", () => {
    render(<PropertyVsFii />);
    fireEvent.change(screen.getByLabelText("Preço da casa ou apartamento"), { target: { value: "40000000" } });
    expect(screen.getByLabelText("Preço da casa ou apartamento")).toHaveValue(currency.format(400000));
    expect(screen.getByRole("link", { name: /Comprar x Alugar Imóvel/ }).getAttribute("href")).toMatch(/^\/comprar-ou-alugar\/?$/);
  });

  it("discloses additional money needed to cover losses instead of silently dropping costs", () => {
    render(<PropertyVsFii />);
    fireEvent.change(screen.getByLabelText("Prazo da comparação (anos)"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Vacância e inadimplência média (%)"), { target: { value: "100" } });
    expect(screen.getByText(/Capital adicional acumulado em cada cenário/)).toHaveTextContent(/R\$\s3\.000,00/);
    expect(screen.getByText(/Capital adicional acumulado em cada cenário/)).toHaveTextContent("descontado do resultado econômico dos dois cenários");
    expect(within(screen.getByRole("region", { name: "Imóvel para renda" })).getByText("Primeiro fluxo mensal líquido").parentElement).toHaveTextContent(/-R\$\s250,00/);
  });
});
