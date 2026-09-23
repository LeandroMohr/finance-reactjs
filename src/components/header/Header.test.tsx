import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { navGroups } from "@/config/site";
import Header from "./Header";

describe("Header", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the brand and the home link", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: /Lemo Finance/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });

  it("renders a trigger for every navigation group", () => {
    render(<Header />);

    for (const group of navGroups) {
      expect(screen.getByRole("button", { name: new RegExp(group.label) })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
  });

  it("opens a group menu and links only the available items", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const group = navGroups.find((item) => item.items.some((entry) => entry.available))!;
    const trigger = screen.getByRole("button", { name: new RegExp(group.label) });

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const menu = within(document.getElementById(`menu-${group.id}`)!);
    const available = group.items.find((item) => item.available)!;
    const unavailable = group.items.find((item) => !item.available)!;

    expect(menu.getByRole("link", { name: new RegExp(available.title) })).toBeInTheDocument();
    expect(menu.queryByRole("link", { name: new RegExp(unavailable.title) })).not.toBeInTheDocument();
    expect(menu.getAllByText("em breve").length).toBeGreaterThan(0);
  });

  it("closes the open menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const trigger = screen.getByRole("button", { name: new RegExp(navGroups[0].label) });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles the theme and persists the choice", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggle = screen.getByRole("button", { name: "Ativar modo claro" });

    await user.click(toggle);

    expect(toggle).toHaveAccessibleName("Ativar modo escuro");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
