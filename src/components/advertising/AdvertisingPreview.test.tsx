// @vitest-environment-options {"url":"https://finance-reactjs.pages.dev/"}
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { advertisingConfig } from "@/config/advertising";
import AdvertisingProvider, { AdvertisingPreferencesButton } from "./AdvertisingProvider";
import AdSlot from "./AdSlot";

vi.mock("next/script", () => ({
  default: ({ id }: { id: string }) => <div data-testid={id} />,
}));

afterEach(() => localStorage.clear());

describe("Advertising in preview deployments", () => {
  it("does not load ads or analytics even with stored consent and allows reviewing preferences", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    render(<AdvertisingProvider><AdSlot /><AdvertisingPreferencesButton /></AdvertisingProvider>);
    expect(window.location.origin).not.toBe(advertisingConfig.productionOrigin);
    expect(screen.queryByTestId("google-adsense")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics-init")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Publicidade" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preferências de privacidade" }));
    expect(screen.getByRole("button", { name: "Recusar publicidade e análise" })).toBeVisible();
  });
});
