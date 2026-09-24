import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import ContactPage from "./page";

describe("ContactPage", () => {
  it("provides the official email channel", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "Contato" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: siteConfig.contactEmail })).toHaveAttribute(
      "href",
      expect.stringContaining(`mailto:${siteConfig.contactEmail}`),
    );
  });

  it("warns users not to send sensitive financial information", () => {
    render(<ContactPage />);

    expect(screen.getByText(/Nunca envie senhas/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Política de privacidade" })).toHaveAttribute(
      "href",
      "/politica-de-privacidade/",
    );
  });
});