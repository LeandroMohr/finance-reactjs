import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { tools } from "@/config/site";
import Home from "./page";

describe("Home", () => {
  it("renders the hub heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Hub de Ferramentas Financeiras" }),
    ).toBeInTheDocument();
  });

  it("lists every registered tool", () => {
    render(<Home />);

    for (const tool of tools) {
      expect(screen.getByRole("heading", { name: tool.title })).toBeInTheDocument();
    }
  });

  it("links available tools to their route and keeps unavailable ones without a link", () => {
    render(<Home />);

    const availableTool = tools.find((tool) => tool.available)!;
    const unavailableTool = tools.find((tool) => !tool.available)!;

    // Next normalizes the trailing slash at build time via the `trailingSlash` config.
    expect(
      screen.getByRole("link", { name: new RegExp(availableTool.title) }).getAttribute("href"),
    ).toMatch(new RegExp(`^/${availableTool.slug}/?$`));
    expect(
      screen.queryByRole("link", { name: new RegExp(unavailableTool.title) }),
    ).not.toBeInTheDocument();
  });
});
