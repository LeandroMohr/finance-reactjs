import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { navGroups } from "@/config/site";
import Home from "./page";

describe("Home", () => {
  it("renders the hero heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Simule, planeje e faça seu dinheiro render" }),
    ).toBeInTheDocument();
  });

  it("links to every category dashboard instead of listing individual tools", () => {
    render(<Home />);

    for (const group of navGroups) {
      const link = screen.getByRole("link", { name: new RegExp(group.label) });

      // Next normalizes the trailing slash at build time via the `trailingSlash` config.
      expect(link.getAttribute("href")).toMatch(new RegExp(`^/${group.id}/?$`));

      for (const item of group.items) {
        expect(screen.queryByText(item.title)).not.toBeInTheDocument();
      }
    }
  });
});
