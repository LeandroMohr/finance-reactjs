import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Faq from "./Faq";
import { faqSections } from "@/config/faq";

const items = [
  {
    question: "Como o cálculo funciona?",
    answer: "O saldo de cada período se torna a base do período seguinte.",
  },
  {
    question: "O resultado é uma garantia?",
    answer: "Não. A simulação usa os valores informados como uma projeção.",
  },
];

describe("Faq", () => {
  it("renders every answer collapsed but available in the document", () => {
    render(<Faq items={items} />);

    for (const item of items) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }

    expect(screen.getAllByRole("group")).toHaveLength(items.length);
  });

  it("emits matching FAQPage structured data", () => {
    const { container } = render(<Faq items={items} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? "{}");

    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(items.length);
    expect(data.mainEntity[0].name).toBe(items[0].question);
  });

  it("keeps FAQ identifiers stable when questions are reordered", () => {
    const { rerender } = render(<Faq items={items} />);
    const identifier = screen.getByText(items[0].question).closest("details")?.dataset.analyticsFaqId;
    rerender(<Faq items={[...items].reverse()} />);
    expect(screen.getByText(items[0].question).closest("details")?.dataset.analyticsFaqId).toBe(identifier);
    expect(identifier).toBe("como-o-calculo-funciona");
  });

  it("uses unique identifiers within the GA4 string limit for the published questions", () => {
    const allItems = faqSections.flatMap((section) => section.items);
    const { container } = render(<Faq items={allItems} />);
    const identifiers = [...container.querySelectorAll<HTMLElement>("[data-analytics-faq-id]")]
      .map((element) => element.dataset.analyticsFaqId!);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    for (const identifier of identifiers) {
      expect(identifier).toMatch(/^[a-z0-9-]+$/);
      expect(identifier.length).toBeLessThanOrEqual(100);
    }
  });
});