import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders a helpful financial-themed error message", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Este caminho saiu do gráfico." })).toBeInTheDocument();
    expect(screen.getByText(/Erro 404/)).toBeInTheDocument();
    expect(screen.getByText(/foi só a URL que não fechou a conta/)).toBeInTheDocument();
  });

  it("offers paths back into the site", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: /Voltar ao início/ })).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Explorar calculadoras" }).getAttribute("href"),
    ).toMatch(
      /^\/calculadoras\/?$/,
    );
  });
});