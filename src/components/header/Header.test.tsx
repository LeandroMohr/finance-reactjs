import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { navGroups } from "@/config/site";
import Header from "./Header";

type User = ReturnType<typeof userEvent.setup>;

// jsdom skips media queries, so the rendered header is always the mobile layout.
// A hidden element has no accessible name, so the panel itself is read from the DOM.
function getNav() {
  return document.getElementById("main-nav")!;
}

async function openNav(user: User) {
  await user.click(screen.getByRole("button", { name: "Abrir menu" }));

  return getNav();
}

describe("Header", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the brand and the home link", async () => {
    const user = userEvent.setup();
    render(<Header />);

    expect(screen.getByRole("link", { name: /Lemo Finance/ })).toHaveAttribute("href", "/");

    const nav = await openNav(user);

    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });

  it("keeps the navigation hidden until the hamburger is used", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const nav = getNav();
    const toggle = screen.getByRole("button", { name: "Abrir menu" });

    expect(nav).not.toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", nav.id);

    await user.click(toggle);

    expect(nav).toBeVisible();
    expect(toggle).toHaveAccessibleName("Fechar menu");

    await user.click(within(nav).getByRole("link", { name: "Home" }));

    expect(nav).not.toBeVisible();
  });

  it("renders a trigger for every navigation group", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const nav = await openNav(user);

    for (const group of navGroups) {
      expect(within(nav).getByRole("button", { name: new RegExp(group.label) })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
  });

  it("opens a compact group menu with the dashboard and available items", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const nav = await openNav(user);
    const group = navGroups.find((item) => item.items.some((entry) => entry.available))!;
    const trigger = within(nav).getByRole("button", { name: new RegExp(group.label) });
    const list = document.getElementById(`menu-${group.id}`)!;

    expect(list).not.toBeVisible();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(list).toBeVisible();

    const menu = within(list);
    const available = group.items.find((item) => item.available)!;
    const unavailable = group.items.find((item) => !item.available)!;

    expect(
      menu.getByRole("link", { name: `Ver todas as ${group.label.toLowerCase()}` }).getAttribute(
        "href",
      ),
    ).toMatch(new RegExp(`^/${group.id}/?$`));
    expect(menu.getByRole("link", { name: new RegExp(available.title) })).toBeVisible();
    expect(menu.queryByText(unavailable.title)).not.toBeInTheDocument();
    expect(menu.getByText("em breve")).toBeVisible();
  });

  it("closes the open menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const nav = await openNav(user);
    const trigger = within(nav).getByRole("button", { name: new RegExp(navGroups[0].label) });

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(nav).not.toBeVisible();
  });

  it("toggles the theme and persists the choice", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggle = screen.getByRole("button", { name: "Ativar modo claro" });

    expect(toggle).toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAccessibleName("Ativar modo escuro");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
