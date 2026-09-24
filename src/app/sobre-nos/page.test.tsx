import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("presents the project purpose and author", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: `Sobre o ${siteConfig.name}` }),
    ).toBeInTheDocument();
    expect(screen.getByText(/projeto independente/)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.author, { exact: true })).toBeInTheDocument();
  });

  it("makes the project's independence explicit", () => {
    render(<AboutPage />);

    expect(screen.getByText(/não é banco, corretora ou consultoria/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Calculadoras" })).toHaveAttribute(
      "href",
      "/calculadoras/",
    );
  });
});