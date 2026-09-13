import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CompoundInterestCalculator from "./CompoundInterestCalculator";

function getInput(label: string): HTMLInputElement {
  return screen.getByLabelText(label) as HTMLInputElement;
}

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
