// @vitest-environment-options {"url":"https://lemohr.com.br/"}
import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { advertisingConfig } from "@/config/advertising";
import CompoundInterestCalculator from "@/components/compoundInterestCalculator/CompoundInterestCalculator";
import FirstMillionCalculator from "@/components/firstMillionCalculator/FirstMillionCalculator";
import RateConverter from "@/components/rateConverter/RateConverter";
import BuyOrRent from "@/components/propertyBuyOrRent/BuyOrRent";
import PropertyVsFii from "@/components/propertyVsFii/PropertyVsFii";
import AdvertisingProvider, { AdvertisingPreferencesButton } from "./AdvertisingProvider";
import AdSlot from "./AdSlot";

vi.mock("next/script", () => ({
  default: ({ id, src, children, crossOrigin, strategy, onReady, onError }: {
    id: string;
    src?: string;
    children?: string;
    crossOrigin?: string;
    strategy: string;
    onReady?: () => void;
    onError?: (error: Error) => void;
  }) => (
    <button
      type="button"
      data-testid={id === "google-adsense" ? "adsense-script" : id}
      data-src={src}
      data-cross-origin={crossOrigin}
      data-strategy={strategy}
      onClick={onReady}
      onDoubleClick={() => onError?.(new Error("blocked"))}
    >
      {children ?? `Simular carregamento de ${id}`}
    </button>
  ),
}));

const push = vi.fn();
let resizeCallback: () => void;
let width = 640;
const disconnect = vi.fn();

beforeEach(() => {
  localStorage.clear();
  width = 640;
  push.mockReset();
  disconnect.mockReset();
  window.adsbygoogle = { push };
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ width, height: 280, x: 0, y: 0, top: 0, left: 0, right: width, bottom: 280, toJSON() {} }),
  );
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resizeCallback = callback; }
    observe() {}
    disconnect = disconnect;
  });
});

afterEach(() => {
  localStorage.clear();
  delete window.adsbygoogle;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderAdvertising() {
  return render(
    <AdvertisingProvider>
      <p>A calculadora continua disponível.</p>
      <AdSlot />
      <AdvertisingPreferencesButton />
    </AdvertisingProvider>,
  );
}

function accept() {
  fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));
}

function loadScript() {
  fireEvent.click(screen.getByTestId("adsense-script"));
}

describe("AdvertisingProvider", () => {
  it("blocks all advertising before a choice and keeps the tools accessible", () => {
    renderAdvertising();
    expect(screen.getByRole("region", { name: "Publicidade, análise e sua privacidade" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Aceitar" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Recusar" })).toBeVisible();
    expect(screen.getByText("A calculadora continua disponível.")).toBeVisible();
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics-init")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Publicidade" })).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("saves refusal without requesting the script or an ad", () => {
    renderAdvertising();
    fireEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(localStorage.getItem(advertisingConfig.consentStorageKey)).toBe("denied");
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics-init")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Publicidade, análise e sua privacidade" })).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("loads the shared script after acceptance and waits for it before requesting the unit", () => {
    const { container, rerender } = renderAdvertising();
    accept();
    expect(localStorage.getItem(advertisingConfig.consentStorageKey)).toBe("granted");
    expect(screen.getByTestId("adsense-script")).toHaveAttribute(
      "data-src",
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${advertisingConfig.clientId}`,
    );
    expect(screen.getByTestId("adsense-script")).toHaveAttribute("data-cross-origin", "anonymous");
    expect(screen.getByTestId("adsense-script")).toHaveAttribute("data-strategy", "afterInteractive");
    const unit = container.querySelector("ins.adsbygoogle");
    expect(unit).toHaveAttribute("data-ad-client", advertisingConfig.clientId);
    expect(unit).toHaveAttribute("data-ad-slot", advertisingConfig.calculatorSlotId);
    expect(unit).toHaveAttribute("data-ad-format", "auto");
    expect(unit).toHaveAttribute("data-full-width-responsive", "true");
    expect(push).not.toHaveBeenCalled();
    loadScript();
    expect(push).toHaveBeenCalledExactlyOnceWith({});
    act(() => resizeCallback());
    rerender(
      <AdvertisingProvider>
        <p>A calculadora continua disponível.</p>
        <AdSlot />
        <AdvertisingPreferencesButton />
      </AdvertisingProvider>,
    );
    expect(push).toHaveBeenCalledTimes(1);
  });

  it.each(["granted", "denied"] as const)("restores a saved %s choice", (choice) => {
    localStorage.setItem(advertisingConfig.consentStorageKey, choice);
    renderAdvertising();
    expect(screen.queryByRole("region", { name: "Publicidade, análise e sua privacidade" })).not.toBeInTheDocument();
    expect(Boolean(screen.queryByTestId("adsense-script"))).toBe(choice === "granted");
    expect(Boolean(screen.queryByTestId("google-analytics"))).toBe(choice === "granted");
    expect(Boolean(screen.queryByTestId("google-analytics-init"))).toBe(choice === "granted");
  });

  it("opens preferences from the footer and returns keyboard focus when closed", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "denied");
    renderAdvertising();
    const trigger = screen.getByRole("button", { name: "Preferências de privacidade" });
    trigger.focus();
    fireEvent.click(trigger);
    const preferences = screen.getByRole("region", { name: "Publicidade, análise e sua privacidade" });
    expect(preferences).toHaveFocus();
    fireEvent.keyDown(preferences, { key: "Escape" });
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("region", { name: "Publicidade, análise e sua privacidade" })).not.toBeInTheDocument();
  });

  it("warns that revoking even an in-flight script reloads the page and resets simulation inputs", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    renderAdvertising();
    fireEvent.click(screen.getByRole("button", { name: "Preferências de privacidade" }));
    expect(screen.getByRole("button", { name: "Recusar" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Aceitar" })).toBeVisible();
    expect(screen.getByText(/Os valores preenchidos serão reiniciados/)).toBeVisible();
    expect(screen.getByText(/interromper os scripts de/)).toHaveTextContent("publicidade e análise de uso");
  });

  it("fails closed for invalid stored preferences", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "yes");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderAdvertising();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining("Invalid advertising consent"));
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recusar" })).toBeVisible();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("surfaces storage read errors without loading advertisements", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderAdvertising();
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível ler suas preferências");
    expect(error).toHaveBeenCalled();
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("does not accept consent if it cannot save the choice", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    renderAdvertising();
    accept();
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível salvar sua escolha");
    expect(error).toHaveBeenCalled();
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("reports a blocked script without initializing a unit or disrupting the tools", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderAdvertising();
    accept();
    fireEvent.doubleClick(screen.getByTestId("adsense-script"));
    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível carregar a publicidade");
    expect(screen.getByText("A calculadora continua disponível.")).toBeVisible();
    expect(error).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("synchronizes a choice made in another tab", () => {
    renderAdvertising();
    localStorage.setItem(advertisingConfig.consentStorageKey, "denied");
    fireEvent(window, new StorageEvent("storage", {
      key: advertisingConfig.consentStorageKey,
      newValue: "denied",
    }));
    expect(screen.queryByRole("region", { name: "Publicidade, análise e sua privacidade" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("requests fresh combined consent instead of reusing an advertising-only choice", () => {
    localStorage.setItem("lemo-finance:advertising-consent:v1", "granted");
    renderAdvertising();
    expect(screen.getByRole("button", { name: "Aceitar" })).toBeVisible();
    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("loads one GA4 tag and initializes the supplied property after combined acceptance", () => {
    const { rerender } = renderAdvertising();
    accept();
    expect(screen.getByTestId("google-analytics")).toHaveAttribute(
      "data-src",
      "https://www.googletagmanager.com/gtag/js?id=G-NJ1DY9YD2D",
    );
    expect(screen.getByTestId("google-analytics")).toHaveAttribute("data-strategy", "afterInteractive");
    const script = screen.getByTestId("google-analytics-init").textContent!;
    const dataLayer: IArguments[] = [];
    new Function("window", "dataLayer", script)({ dataLayer }, dataLayer);
    expect(dataLayer.map((command) => Array.from(command))).toEqual([
      ["consent", "default", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      }],
      ["js", expect.any(Date)],
      ["config", "G-NJ1DY9YD2D", {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      }],
    ]);
    rerender(<AdvertisingProvider><p>Outra página</p></AdvertisingProvider>);
    expect(screen.getAllByTestId("google-analytics")).toHaveLength(1);
    expect(screen.getAllByTestId("google-analytics-init")).toHaveLength(1);
  });

  it("logs an Analytics loading error without disrupting advertising or calculators", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderAdvertising();
    accept();
    fireEvent.doubleClick(screen.getByTestId("google-analytics"));
    expect(error).toHaveBeenCalledWith("Unable to load Google Analytics.", expect.any(Error));
    expect(screen.getByText("A calculadora continua disponível.")).toBeVisible();
    loadScript();
    expect(push).toHaveBeenCalledExactlyOnceWith({});
  });
});

describe("AdSlot", () => {
  it("waits for positive width and never initializes again after resizing", () => {
    width = 0;
    renderAdvertising();
    accept();
    loadScript();
    expect(push).not.toHaveBeenCalled();
    width = 320;
    act(() => resizeCallback());
    act(() => resizeCallback());
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("initializes once under StrictMode and creates a fresh unit after route remount", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    const { rerender } = render(
      <StrictMode><AdvertisingProvider><AdSlot key="first-route" /></AdvertisingProvider></StrictMode>,
    );
    loadScript();
    expect(push).toHaveBeenCalledTimes(1);
    rerender(
      <StrictMode><AdvertisingProvider><AdSlot key="second-route" /></AdvertisingProvider></StrictMode>,
    );
    expect(push).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalled();
  });

  it("creates a queue when Google has not supplied one yet", () => {
    delete window.adsbygoogle;
    renderAdvertising();
    accept();
    loadScript();
    expect(window.adsbygoogle).toEqual([{}]);
  });

  it("reports initialization errors and does not loop on subsequent resizes", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    push.mockImplementation(() => { throw new Error("ad error"); });
    renderAdvertising();
    accept();
    loadScript();
    act(() => resizeCallback());
    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível carregar a publicidade");
    expect(error).toHaveBeenCalled();
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("supports browsers without ResizeObserver", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    width = 0;
    renderAdvertising();
    accept();
    loadScript();
    width = 320;
    fireEvent.resize(window);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["juros compostos", CompoundInterestCalculator, "Entenda como funciona o cálculo"],
    ["primeiro milhão", FirstMillionCalculator, "Como calculamos o primeiro milhão?"],
    ["conversor de taxas", RateConverter, "Entenda como funciona o cálculo"],
    ["comprar ou alugar", BuyOrRent, "Além da matemática: o que pesa para você?"],
    ["imóvel ou FII", PropertyVsFii, "O que o número não mostra"],
  ] as const)("places one unit inside %s after result tables and before education", (_, Calculator, explanation) => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    const { container } = render(<AdvertisingProvider><Calculator /></AdvertisingProvider>);
    const ad = screen.getByRole("region", { name: "Publicidade" });
    expect(ad.closest("main")).toBeInTheDocument();
    expect(container.querySelectorAll("ins.adsbygoogle")).toHaveLength(1);
    expect(ad.previousElementSibling?.querySelector("table")).not.toBeNull();
    expect(ad.nextElementSibling).toHaveTextContent(explanation);
    loadScript();
    expect(push).toHaveBeenCalledTimes(1);
  });
});
