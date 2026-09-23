import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItem } from "@/config/site";
import ToolGrid from "./ToolGrid";

const items: NavItem[] = [
  {
    slug: "compound-interest",
    title: "Juros Compostos",
    description: "Simule o crescimento do seu patrimônio.",
    section: "Investimentos",
    available: true,
  },
  {
    slug: "simple-interest",
    title: "Juros Simples",
    description: "Compare o rendimento linear com o composto.",
    section: "Crédito e financiamento",
    available: false,
  },
];

describe("ToolGrid", () => {
  it("links available items and keeps unavailable ones without a link", () => {
    render(<ToolGrid items={items} />);

    expect(screen.getByRole("link", { name: /Juros Compostos/ }).getAttribute("href")).toMatch(
      /^\/compound-interest\/?$/,
    );
    expect(screen.queryByRole("link", { name: /Juros Simples/ })).not.toBeInTheDocument();
  });

  it("renders every item title as a heading", () => {
    render(<ToolGrid items={items} />);

    for (const item of items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
    }
  });

  it("groups tools under their catalog sections", () => {
    render(<ToolGrid items={items} />);

    expect(screen.getByRole("heading", { level: 2, name: "Investimentos" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Crédito e financiamento" }),
    ).toBeInTheDocument();
  });
});
