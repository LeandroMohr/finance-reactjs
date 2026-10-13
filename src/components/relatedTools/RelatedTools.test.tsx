import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RelatedTools from "./RelatedTools";

describe("RelatedTools", () => {
  it("links available tools and marks upcoming suggestions", () => {
    render(<RelatedTools slugs={["conversor-de-taxas", "primeiro-milhao", "goal-planner"]} />);

    expect(screen.getByRole("link", { name: /Conversor de Taxas/ }).getAttribute("href")).toMatch(
      /^\/conversor-de-taxas\/?$/,
    );
    expect(screen.getByRole("link", { name: /Primeiro Milhão/ }).getAttribute("href")).toMatch(/^\/primeiro-milhao\/?$/);
    expect(screen.queryByRole("link", { name: /Simulador de Metas/ })).not.toBeInTheDocument();
    expect(screen.getByText("Em breve")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveClass("interactive");
    }
    expect(screen.getByText("Em breve").closest("article")).not.toHaveClass("interactive");
  });

  it("ignores unknown slugs", () => {
    render(<RelatedTools slugs={["juros-compostos", "unknown-tool"]} />);

    expect(screen.getByRole("heading", { name: "Juros Compostos" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });
});