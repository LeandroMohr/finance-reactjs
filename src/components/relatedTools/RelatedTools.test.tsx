import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RelatedTools from "./RelatedTools";

describe("RelatedTools", () => {
  it("links available tools and marks upcoming suggestions", () => {
    render(<RelatedTools slugs={["rate-converter", "simple-interest"]} />);

    expect(screen.getByRole("link", { name: /Conversor de Taxas/ }).getAttribute("href")).toMatch(
      /^\/rate-converter\/?$/,
    );
    expect(screen.queryByRole("link", { name: /Juros Simples/ })).not.toBeInTheDocument();
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });

  it("ignores unknown slugs", () => {
    render(<RelatedTools slugs={["compound-interest", "unknown-tool"]} />);

    expect(screen.getByRole("heading", { name: "Juros Compostos" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });
});