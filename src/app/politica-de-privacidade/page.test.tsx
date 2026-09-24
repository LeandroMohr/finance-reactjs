import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import PrivacyPolicyPage from "./page";

describe("PrivacyPolicyPage", () => {
  it("explains the site's current data practices", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("heading", { name: "Política de privacidade" })).toBeInTheDocument();
    expect(screen.getByText(/processados no próprio navegador/)).toBeInTheDocument();
    expect(screen.getByText(/não utiliza cookies de publicidade ou de análise/)).toBeInTheDocument();
  });

  it("provides a channel for privacy requests", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("link", { name: siteConfig.contactEmail })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.contactEmail}`,
    );
  });
});