import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TermsOfUsePage from "./page";

describe("TermsOfUsePage", () => {
  it("states that simulations are educational estimates", () => {
    render(<TermsOfUsePage />);

    expect(screen.getByRole("heading", { name: "Termos de uso" })).toBeInTheDocument();
    expect(screen.getByText(/Os resultados são estimativas/)).toBeInTheDocument();
    expect(screen.getByText(/não presta consultoria individualizada/)).toBeInTheDocument();
  });

  it("links to the privacy policy", () => {
    render(<TermsOfUsePage />);

    expect(screen.getByRole("link", { name: "Política de privacidade" })).toHaveAttribute(
      "href",
      "/politica-de-privacidade/",
    );
  });
});