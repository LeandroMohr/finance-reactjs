import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import CompoundInterestCalculator from "./CompoundInterestCalculator";

function getInput(label: string): HTMLInputElement {
  return screen.getByLabelText(label) as HTMLInputElement;
}

describe("CompoundInterestCalculator", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the heading and every simulation field", () => {
    render(<CompoundInterestCalculator />);

    expect(
      screen.getByRole("heading", { name: "Calculadora de juros compostos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Descubra seu crescimento" })).toBeInTheDocument();

    for (const label of ["Aporte inicial", "Aporte mensal", "Taxa anual (%)", "Tempo (anos)"]) {
      expect(getInput(label)).toBeInTheDocument();
    }
  });

  it("links back to the tools hub", () => {
    render(<CompoundInterestCalculator />);

    expect(screen.getByRole("link", { name: /Lemo Finance/ })).toHaveAttribute("href", "/");
  });

  it("renders the monthly breakdown limited to the last twelve months", () => {
    render(<CompoundInterestCalculator />);

    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(rows).toHaveLength(13); // header + 12 months
  });

  it("recalculates the result when the user changes a field", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    expect(screen.getByText("R$ 35.000,00 aportados em 5 ano(s)")).toBeInTheDocument();

    const years = getInput("Tempo (anos)");
    await user.clear(years);
    await user.type(years, "1");

    expect(screen.getByText("R$ 11.000,00 aportados em 1 ano(s)")).toBeInTheDocument();
  });

  it("toggles the theme and persists the choice", async () => {
    const user = userEvent.setup();
    render(<CompoundInterestCalculator />);

    const toggle = screen.getByRole("button", { name: "Alternar tema" });
    expect(toggle).toHaveTextContent("Modo claro");

    await user.click(toggle);

    expect(toggle).toHaveTextContent("Modo escuro");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
