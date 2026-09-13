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

  it("renders a section for every navigation group", () => {
    render(<Home />);

    for (const group of navGroups) {
      expect(screen.getByRole("heading", { name: group.label })).toBeInTheDocument();
    }
  });

  it("lists every registered item", () => {
    render(<Home />);

    for (const group of navGroups) {
      for (const item of group.items) {
        expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
      }
    }
  });

  it("links available items and keeps unavailable ones without a link", () => {
    render(<Home />);

    const items = navGroups.flatMap((group) => group.items);
    const available = items.find((item) => item.available)!;
    const unavailable = items.find((item) => !item.available)!;

    // Next normalizes the trailing slash at build time via the `trailingSlash` config.
    expect(
      screen.getByRole("link", { name: new RegExp(available.title) }).getAttribute("href"),
    ).toMatch(new RegExp(`^/${available.slug}/?$`));
    expect(
      screen.queryByRole("link", { name: new RegExp(unavailable.title) }),
    ).not.toBeInTheDocument();
  });
});
