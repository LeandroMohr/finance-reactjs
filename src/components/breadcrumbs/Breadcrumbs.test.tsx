import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Breadcrumbs from "./Breadcrumbs";

describe("Breadcrumbs", () => {
  it("always prepends a link to the home page", () => {
    render(<Breadcrumbs items={[{ label: "Calculadoras" }]} />);

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
  });

  it("renders intermediate items as links and the last item as the current page", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Calculadoras", href: "/calculadoras/" },
          { label: "Juros Compostos" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Calculadoras" }).getAttribute("href")).toMatch(
      /^\/calculadoras\/?$/,
    );
    expect(screen.queryByRole("link", { name: "Juros Compostos" })).not.toBeInTheDocument();
    expect(screen.getByText("Juros Compostos")).toHaveAttribute("aria-current", "page");
  });

  it("outputs a matching BreadcrumbList json-ld script", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "Calculadoras", href: "/calculadoras/" },
          { label: "Juros Compostos" },
        ]}
      />,
    );

    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.innerHTML);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[2]).toMatchObject({ position: 3, name: "Juros Compostos" });
    expect(jsonLd.itemListElement[2].item).toBeUndefined();
  });
});
