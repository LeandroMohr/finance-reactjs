import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Faq from "./Faq";

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
});