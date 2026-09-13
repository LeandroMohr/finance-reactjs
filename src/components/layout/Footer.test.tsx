import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { navGroups, siteConfig } from "@/config/site";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders a navigation column for every group", () => {
    render(<Footer />);

    for (const group of navGroups) {
      expect(screen.getByRole("navigation", { name: group.label })).toBeInTheDocument();
    }
  });

  it("links available items and marks unavailable ones as disabled", () => {
    render(<Footer />);

    const items = navGroups.flatMap((group) => group.items);
    const available = items.find((item) => item.available)!;
    const unavailable = items.find((item) => !item.available)!;

    expect(
      screen.getByRole("link", { name: new RegExp(available.title) }).getAttribute("href"),
    ).toMatch(new RegExp(`^/${available.slug}/?$`));
    expect(
      screen.queryByRole("link", { name: new RegExp(unavailable.title) }),
    ).not.toBeInTheDocument();
  });

  it("shows the current year and the author", () => {
    render(<Footer />);

    expect(
      screen.getByText(new RegExp(`${new Date().getFullYear()}.*${siteConfig.author}`)),
    ).toBeInTheDocument();
  });
});
