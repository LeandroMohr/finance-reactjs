// @vitest-environment-options {"url":"https://lemohr.com.br/conversor-de-taxas/?amount=12345"}
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { advertisingConfig } from "@/config/advertising";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import AnalyticsEvents from "./AnalyticsEvents";

let pathname = "/conversor-de-taxas/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("./AdvertisingProvider", () => ({
  AdvertisingPreferencesButton: () => <button type="button">Preferências de privacidade</button>,
}));

beforeEach(() => {
  pathname = "/conversor-de-taxas/";
  localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
  window.gtag = vi.fn();
});
afterEach(() => {
  localStorage.clear();
  delete window.gtag;
});

describe("menu navigation analytics", () => {
  it("records a header destination, but not menu expansion or closing", () => {
    render(<div onClick={(event) => event.preventDefault()}><AnalyticsEvents enabled /><Header /></div>);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Calculadoras" }));
    expect(window.gtag).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Juros Compostos"));
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "menu_click", {
      menu_location: "header", target_path: expect.stringMatching(/^\/juros-compostos\/?$/), page_path: "/conversor-de-taxas/",
    });
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("records footer tool, help and institutional links without tracking privacy controls or upcoming items", () => {
    render(<div onClick={(event) => event.preventDefault()}><AnalyticsEvents enabled /><Footer /></div>);
    fireEvent.click(screen.getByRole("link", { name: /Juros Compostos/ }));
    fireEvent.click(screen.getByRole("link", { name: "Perguntas frequentes" }));
    fireEvent.click(screen.getByRole("link", { name: "Política de privacidade" }));
    fireEvent.click(screen.getByRole("button", { name: "Preferências de privacidade" }));
    fireEvent.click(screen.getAllByText("em breve")[0]);
    expect(window.gtag).toHaveBeenCalledTimes(3);
    for (const [index, target] of ["/juros-compostos", "/perguntas-frequentes", "/politica-de-privacidade"].entries()) {
      expect(window.gtag).toHaveBeenNthCalledWith(index + 1, "event", "menu_click", {
        menu_location: "footer", target_path: expect.stringMatching(new RegExp(`^${target}/?$`)), page_path: "/conversor-de-taxas/",
      });
    }
  });

  it.each(["header", "footer"] as const)("records the %s brand link once when activated by keyboard", async (location) => {
    const user = userEvent.setup();
    render(<div onClick={(event) => event.preventDefault()}><AnalyticsEvents enabled />
      {location === "header" ? <Header /> : <Footer />}
    </div>);
    const menu = screen.getByRole(location === "header" ? "banner" : "contentinfo");
    within(menu).getByRole("link", { name: /Lemohr Finance/ }).focus();
    await user.keyboard("{Enter}");
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "menu_click", {
      menu_location: location, target_path: "/", page_path: "/conversor-de-taxas/",
    });
  });

  it.each(["header", "footer"] as const)("sends only the internal pathname for %s links", (location) => {
    render(<div onClick={(event) => event.preventDefault()}><AnalyticsEvents enabled />
      <nav data-analytics-menu={location}>
        <a href="/primeiro-milhao/?amount=99999#private"><span>Internal</span></a>
        <a href="https://example.com/private?amount=99999">External</a>
      </nav>
      <a href="/glossario/">Outside menu</a>
    </div>);
    fireEvent.click(screen.getByText("Internal"));
    fireEvent.click(screen.getByText("External"));
    fireEvent.click(screen.getByText("Outside menu"));
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "menu_click", {
      menu_location: location, target_path: "/primeiro-milhao/", page_path: "/conversor-de-taxas/",
    });
  });

  it.each([false, true])("blocks menu events without consent when listeners are enabled=%s", (enabled) => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "denied");
    render(<div onClick={(event) => event.preventDefault()}><AnalyticsEvents enabled={enabled} /><Footer /></div>);
    fireEvent.click(screen.getByRole("link", { name: /Juros Compostos/ }));
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("does not accumulate menu listeners after route changes", () => {
    const menu = <nav data-analytics-menu="header" onClick={(event) => event.preventDefault()}>
      <a href="/glossario/">Glossary</a>
    </nav>;
    const { rerender } = render(<><AnalyticsEvents enabled />{menu}</>);
    pathname = "/glossario/";
    rerender(<><AnalyticsEvents enabled />{menu}</>);
    pathname = "/conversor-de-taxas/";
    rerender(<><AnalyticsEvents enabled />{menu}</>);
    fireEvent.click(screen.getByText("Glossary"));
    expect(window.gtag).toHaveBeenCalledTimes(1);
  });
});
