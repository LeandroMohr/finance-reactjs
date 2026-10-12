import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import PrivacyPolicyPage from "./page";

describe("PrivacyPolicyPage", () => {
  it("explains the site's current data practices", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("heading", { name: "Política de privacidade" })).toBeInTheDocument();
    expect(screen.getByText(/processados no próprio navegador/)).toBeInTheDocument();
    expect(screen.getByText(/só é carregado no domínio de produção após você aceitar/)).toBeInTheDocument();
    expect(screen.getByText(/não instala Google Analytics/)).toBeInTheDocument();
    expect(screen.getByText(/não envia os valores das simulações como eventos/)).toBeInTheDocument();
    expect(screen.getByText(/valores preenchidos nas calculadoras/)).toHaveTextContent(/reiniciados/);
    expect(screen.getByRole("link", { name: "como o Google usa informações de sites parceiros" }))
      .toHaveAttribute("href", "https://policies.google.com/technologies/partner-sites");
  });

  it("provides a channel for privacy requests", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("link", { name: siteConfig.contactEmail })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.contactEmail}`,
    );
  });
});