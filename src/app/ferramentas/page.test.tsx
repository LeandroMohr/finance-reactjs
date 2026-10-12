import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { navGroups } from "@/config/site";
import FerramentasPage from "./page";

const group = navGroups.find((item) => item.id === "ferramentas")!;

describe("FerramentasPage", () => {
  it("renders the group label as the heading", () => {
    render(<FerramentasPage />);

    expect(screen.getByRole("heading", { level: 1, name: group.label })).toBeInTheDocument();
  });

  it("renders a breadcrumb trail ending on the current page", () => {
    render(<FerramentasPage />);

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(within(breadcrumb).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText(group.label)).toHaveAttribute("aria-current", "page");
  });

  it("lists every tool from the group", () => {
    render(<FerramentasPage />);

    for (const item of group.items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Simulador de Metas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Investir em Imóvel x FII de Tijolo/ }).getAttribute("href")).toMatch(/^\/imovel-ou-fii\/?$/);
    expect(screen.getByRole("link", { name: /Primeiro Milhão/ }).getAttribute("href")).toMatch(/^\/primeiro-milhao\/?$/);
    expect(screen.queryByRole("heading", { name: "Conversor de Taxas" })).not.toBeInTheDocument();
  });
});
