import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { navGroups } from "@/config/site";
import CalculadorasPage from "./page";

const group = navGroups.find((item) => item.id === "calculadoras")!;

describe("CalculadorasPage", () => {
  it("renders the group label as the heading", () => {
    render(<CalculadorasPage />);

    expect(screen.getByRole("heading", { level: 1, name: group.label })).toBeInTheDocument();
  });

  it("renders a breadcrumb trail ending on the current page", () => {
    render(<CalculadorasPage />);

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(within(breadcrumb).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText(group.label)).toHaveAttribute("aria-current", "page");
  });

  it("lists every tool from the group", () => {
    render(<CalculadorasPage />);

    for (const item of group.items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
    }
  });
});
