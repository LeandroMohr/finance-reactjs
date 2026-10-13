// @vitest-environment-options {"url":"https://lemohr.com.br/juros-compostos/?amount=12345"}
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { advertisingConfig } from "@/config/advertising";
import { trackEvent } from "./analytics";

beforeEach(() => {
  localStorage.clear();
  window.gtag = vi.fn();
});
afterEach(() => {
  localStorage.clear();
  delete window.gtag;
  vi.restoreAllMocks();
});

describe("trackEvent", () => {
  it.each([null, "denied", "invalid"])("blocks events without current consent: %s", (choice) => {
    if (choice !== null) localStorage.setItem(advertisingConfig.consentStorageKey, choice);
    expect(trackEvent("simulation_complete", { tool_id: "juros-compostos" })).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("sends only event metadata and the pathname, never query strings", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    expect(trackEvent("simulation_complete", { tool_id: "juros-compostos" })).toBe(true);
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "simulation_complete", {
      tool_id: "juros-compostos", page_path: "/juros-compostos/",
    });
  });

  it("checks consent again after revocation", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    trackEvent("contact_click", { contact_method: "email" });
    localStorage.setItem(advertisingConfig.consentStorageKey, "denied");
    trackEvent("contact_click", { contact_method: "email" });
    expect(window.gtag).toHaveBeenCalledTimes(1);
  });

  it("fails closed and logs unreadable storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(trackEvent("contact_click", { contact_method: "email" })).toBe(false);
    expect(error).toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("reports a missing tag without breaking the action", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    delete window.gtag;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(trackEvent("contact_click", { contact_method: "email" })).toBe(false);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining("not ready"), "contact_click");
  });

  it("isolates and logs failures from the analytics library", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    window.gtag = vi.fn(() => { throw new Error("tag failure"); });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(trackEvent("contact_click", { contact_method: "email" })).toBe(false);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("Unable to send"), "contact_click", expect.any(Error));
  });
});
