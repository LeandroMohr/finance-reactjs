// @vitest-environment-options {"url":"https://lemohr.com.br/"}
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { advertisingConfig } from "@/config/advertising";
import AnalyticsEvents from "./AnalyticsEvents";
import CompoundInterestCalculator from "@/components/compoundInterestCalculator/CompoundInterestCalculator";
import FirstMillionCalculator from "@/components/firstMillionCalculator/FirstMillionCalculator";
import RateConverter from "@/components/rateConverter/RateConverter";
import BuyOrRent from "@/components/propertyBuyOrRent/BuyOrRent";
import PropertyVsFii from "@/components/propertyVsFii/PropertyVsFii";
import Faq from "@/components/faq/Faq";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/components/advertising/AdSlot", () => ({ default: () => null }));

beforeEach(() => {
  pathname = "/";
  localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
  window.gtag = vi.fn();
});
afterEach(() => {
  localStorage.clear();
  delete window.gtag;
});

describe("AnalyticsEvents", () => {
  it.each([
    ["juros-compostos", CompoundInterestCalculator, "Aporte mensal"],
    ["primeiro-milhao", FirstMillionCalculator, "Aporte mensal"],
    ["conversor-de-taxas", RateConverter, "Valor de exemplo"],
    ["comprar-ou-alugar", BuyOrRent, "Entrada"],
    ["imovel-ou-fii", PropertyVsFii, "Preço da casa ou apartamento"],
  ] as const)("tracks one start and an explicit completion for %s without financial data", (toolId, Calculator, field) => {
    render(<><AnalyticsEvents enabled /><Calculator /></>);
    const button = screen.getByRole("button", { name: "Calcular" });
    expect(button).toHaveClass("button-primary", "interactive");
    expect(button.parentElement).toHaveClass("form-actions");
    expect(screen.queryByText("Os resultados só são atualizados ao clicar em Calcular.")).not.toBeInTheDocument();
    expect(screen.queryByText("Campos alterados. Clique em Calcular para atualizar os resultados.")).not.toBeInTheDocument();
    const panel = button.closest("[data-analytics-input]");
    expect(panel).not.toBeNull();
    expect(button.parentElement?.parentElement).toBe(panel);
    for (const input of panel!.querySelectorAll("input, select")) {
      expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(window.gtag).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(field), { target: { value: "1000000" } });
    fireEvent.change(screen.getByLabelText(field), { target: { value: "2000000" } });
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "simulation_start", { tool_id: toolId, page_path: "/" });
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(window.gtag).toHaveBeenLastCalledWith("event", "simulation_complete", { tool_id: toolId, page_path: "/" });
  });

  it("does not track input changes without enabled consent", () => {
    render(<><AnalyticsEvents enabled={false} /><RateConverter /></>);
    fireEvent.change(screen.getByLabelText("Valor de exemplo"), { target: { value: "200000" } });
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("resets start deduplication on route changes and does not duplicate listeners", () => {
    const content = <main data-analytics-tool="juros-compostos"><div data-analytics-input><input aria-label="Input" /></div></main>;
    const { rerender } = render(<><AnalyticsEvents enabled />{content}</>);
    fireEvent.input(screen.getByLabelText("Input"), { target: { value: "one" } });
    pathname = "/juros-compostos/";
    rerender(<><AnalyticsEvents enabled />{content}</>);
    fireEvent.input(screen.getByLabelText("Input"), { target: { value: "two" } });
    fireEvent.change(screen.getByLabelText("Input"), { target: { value: "three" } });
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it("does not mistake a result-display control for a simulation edit", () => {
    render(<><AnalyticsEvents enabled /><main data-analytics-tool="juros-compostos"><input type="checkbox" aria-label="Display" /></main></>);
    fireEvent.click(screen.getByLabelText("Display"));
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("tracks sharing, related tools and email intent without the destination URL or address", () => {
    render(<><AnalyticsEvents enabled /><div onClick={(event) => event.preventDefault()}>
      <a href="/share" data-analytics-share="whatsapp" data-analytics-item="/juros-compostos/">Share</a>
      <a href="/primeiro-milhao/" data-analytics-related-tool="primeiro-milhao">Related</a>
      <a href="mailto:private@example.com?subject=private">Contact</a>
      <a href="https://example.com">External</a>
    </div></>);
    fireEvent.click(screen.getByText("Share"));
    fireEvent.click(screen.getByText("Related"));
    fireEvent.click(screen.getByText("Contact"));
    fireEvent.click(screen.getByText("External"));
    expect(window.gtag).toHaveBeenCalledTimes(3);
    expect(window.gtag).toHaveBeenNthCalledWith(1, "event", "share", {
      method: "whatsapp", content_type: "page", item_id: "/juros-compostos/", page_path: "/",
    });
    expect(window.gtag).toHaveBeenNthCalledWith(2, "event", "related_tool_click", { target_tool_id: "primeiro-milhao", page_path: "/" });
    expect(window.gtag).toHaveBeenNthCalledWith(3, "event", "contact_click", { contact_method: "email", page_path: "/" });
  });

  it("records FAQ openings but not closings, with an identifier from authored content", async () => {
    render(<><AnalyticsEvents enabled /><Faq items={[{ question: "Como funciona?", answer: "Resposta." }]} /></>);
    fireEvent.click(screen.getByText("Como funciona?"));
    await waitFor(() => expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "faq_open", {
      faq_id: "como-funciona", page_path: "/",
    }));
    fireEvent.click(screen.getByText("Como funciona?"));
    await waitFor(() => expect(screen.getByText("Como funciona?").closest("details")).not.toHaveAttribute("open"));
    expect(window.gtag).toHaveBeenCalledTimes(1);
  });
});
