import type { ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import FieldLabel from "./FieldLabel";
import CompoundInterestCalculator from "@/components/compoundInterestCalculator/CompoundInterestCalculator";
import FirstMillionCalculator from "@/components/firstMillionCalculator/FirstMillionCalculator";
import RateConverter from "@/components/rateConverter/RateConverter";
import AdvertisingProvider from "@/components/advertising/AdvertisingProvider";

function renderCalculator(ui: ReactNode) {
  return render(ui, { wrapper: AdvertisingProvider });
}

function renderField() {
  return render(
    <div>
      <FieldLabel htmlFor="capital" label="Capital inicial" tooltipText="Deixe R$ 0,00 se estiver começando do zero." />
      <input id="capital" aria-describedby="capital-tooltip" />
    </div>,
  );
}

describe("FieldLabel", () => {
  it("keeps the field name and description accessible with help initially hidden", () => {
    renderField();
    expect(screen.getByLabelText("Capital inicial")).toHaveAccessibleDescription(
      "Deixe R$ 0,00 se estiver começando do zero.",
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  describe("tool-specific field guidance", () => {
    it("explains every compound-interest field and its proportional annual rate", () => {
      renderCalculator(<CompoundInterestCalculator />);
      for (const label of ["Aporte inicial", "Aporte mensal", "Taxa de juros (%)", "Tempo"]) {
        expect(screen.getByLabelText(label)).toHaveAccessibleDescription();
        expect(screen.getByRole("button", { name: `Ajuda: ${label}` })).toBeVisible();
      }
      expect(screen.getByLabelText("Aporte inicial")).toHaveAccessibleDescription(/deixe R\$ 0,00/);
      expect(screen.getByLabelText("Taxa de juros (%)")).toHaveAccessibleDescription(/dividida por 12/);
      expect(screen.getByLabelText("Unidade do tempo")).toHaveAccessibleDescription(/100 anos/);
    });

    it("explains both first-million modes and the equivalent annual rate", () => {
      renderCalculator(<FirstMillionCalculator />);
      expect(screen.getByLabelText("Patrimônio inicial")).toHaveAccessibleDescription(/começando do zero/);
      expect(screen.getByLabelText("Aporte mensal")).toHaveAccessibleDescription(/final de cada mês/);
      expect(screen.getByLabelText("Taxa de juros (%)")).toHaveAccessibleDescription(/não dividida por 12/);
      fireEvent.click(screen.getByLabelText("Descobrir o aporte mensal"));
      expect(screen.getByLabelText("Prazo desejado")).toHaveAccessibleDescription(/1200 meses/);
      expect(screen.getByLabelText("Unidade do prazo")).toHaveAccessibleDescription(/digite 18/);
    });

    it("explains the converter's periods and optional example amount", () => {
      renderCalculator(<RateConverter />);
      expect(screen.getByLabelText("Taxa de juros (%)")).toHaveAccessibleDescription(/360 por ano/);
      expect(screen.getByLabelText("Periodicidade da taxa")).toHaveAccessibleDescription(/período original/);
      expect(screen.getByLabelText("Converter para")).toHaveAccessibleDescription(/taxa equivalente/);
      expect(screen.getByLabelText("Valor de exemplo")).toHaveAccessibleDescription(/não altera a conversão/);
    });
  });

  it("opens on hover and stays open when moving onto the tooltip", () => {
    renderField();
    const help = screen.getByRole("button", { name: "Ajuda: Capital inicial" }).parentElement!;
    fireEvent.pointerEnter(help);
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.pointerEnter(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.pointerEnter(help);
    fireEvent.pointerLeave(help);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens by keyboard and closes with Escape or blur", async () => {
    const user = userEvent.setup();
    renderField();
    await user.tab();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.tab();
    await user.tab({ shift: true });
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on tap and dismisses on an outside tap", () => {
    renderField();
    fireEvent.click(screen.getByRole("button", { name: "Ajuda: Capital inicial" }));
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it.each([
    [CompoundInterestCalculator, "Retorno", /valor final menos total aportado/],
    [RateConverter, "Juros no ano", /360 dias/],
    [FirstMillionCalculator, "Rendimentos estimados", /sem garantia de retorno/],
  ])("explains result metrics for each tool", (Calculator, label, expected) => {
    renderCalculator(<Calculator />);
    fireEvent.click(within(screen.getByRole("complementary")).getByRole("button", { name: `Ajuda: ${label}` }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(expected);
  });

  it("explains the contribution result after switching first-million modes", () => {
    renderCalculator(<FirstMillionCalculator />);
    fireEvent.click(screen.getByLabelText("Descobrir o aporte mensal"));
    fireEvent.click(screen.getByRole("button", { name: "Ajuda: Aporte mensal necessário" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(/arredondado para cima em centavos/);
  });

  it("supports help in table headers without creating form labels", () => {
    renderCalculator(<RateConverter />);
    const table = screen.getByRole("table");
    fireEvent.click(within(table).getByRole("button", { name: "Ajuda: Taxa equivalente" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(/duas casas decimais/);
    expect(table.querySelector("label")).toBeNull();
  });
});
