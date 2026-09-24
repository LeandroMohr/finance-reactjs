import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItem } from "@/config/site";
import HomeDashboard from "./HomeDashboard";

const items: NavItem[] = [
  {
    slug: "compound-interest",
    title: "Juros Compostos",
    description: "Simule o crescimento do seu patrimônio.",
    section: "Investimentos",
    available: true,
  },
  {
    slug: "goal-planner",
    title: "Simulador de Metas",
    description: "Descubra quanto guardar por mês.",
    section: "Planejamento financeiro",
    available: false,
  },
];

describe("HomeDashboard", () => {
  it("links available items and keeps unavailable ones without a link", () => {
    render(<HomeDashboard items={items} />);

    expect(screen.getByRole("link", { name: /Juros Compostos/ }).getAttribute("href")).toMatch(
      /^\/compound-interest\/?$/,
    );
    expect(screen.queryByRole("link", { name: /Simulador de Metas/ })).not.toBeInTheDocument();
  });

  it("renders every item title as a heading", () => {
    render(<HomeDashboard items={items} />);

    for (const item of items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
    }
  });

  it("groups tools under their catalog sections", () => {
    render(<HomeDashboard items={items} />);

    expect(screen.getByRole("heading", { level: 2, name: "Investimentos" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Planejamento financeiro" }),
    ).toBeInTheDocument();
  });
});