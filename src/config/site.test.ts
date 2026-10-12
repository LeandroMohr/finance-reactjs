import { describe, expect, it } from "vitest";
import { faqSections } from "./faq";
import { allNavItems, findToolGroup, navGroups } from "./site";

const expectedGroups = {
  calculadoras: [
    "juros-compostos", "present-future-value", "dividend-income", "net-salary",
    "project-analysis", "investment-tax", "average-stock-price", "monthly-income",
    "conversor-de-taxas", "inflation-adjuster", "loan-total-cost", "real-interest-rate",
    "card-machine-fee",
  ],
  ferramentas: [
    "goal-planner", "primeiro-milhao", "emergency-fund", "financial-independence",
    "retirement-planner", "buy-or-rent", "fixed-income-comparison", "financing-sac-price",
    "amortize-or-invest", "debt-payoff-strategy", "clt-vs-pj", "cash-vs-installments",
  ],
};

describe("product catalog", () => {
  it.each(Object.entries(expectedGroups))("classifies every product in %s", (id, slugs) => {
    const group = navGroups.find((entry) => entry.id === id);
    expect(group?.items.map((item) => item.slug).sort()).toEqual([...slugs].sort());
    for (const slug of slugs) expect(findToolGroup(slug)?.id).toBe(id);
  });

  it("keeps all 25 products unique and preserves availability", () => {
    expect(allNavItems).toHaveLength(25);
    expect(new Set(allNavItems.map((item) => item.slug)).size).toBe(25);
    expect(allNavItems.filter((item) => item.available).map((item) => item.slug).sort()).toEqual([
      "conversor-de-taxas", "juros-compostos", "primeiro-milhao",
    ]);
    expect(findToolGroup("not-a-product")).toBeUndefined();
  });

  it("uses consistent subject sections across categories", () => {
    expect(allNavItems.find((item) => item.slug === "primeiro-milhao")?.section).toBe("Planejamento financeiro");
    expect(allNavItems.find((item) => item.slug === "monthly-income")?.section).toBe("Investimentos");
    expect(allNavItems.find((item) => item.slug === "loan-total-cost")?.section).toBe("Crédito e financiamento");
    expect(allNavItems.find((item) => item.slug === "card-machine-fee")?.section).toBe("Negócios");
    expect(allNavItems.find((item) => item.slug === "cash-vs-installments")?.section).toBe("Compras e pagamentos");
  });

  it("keeps published product FAQ categories aligned with navigation", () => {
    for (const [itemsSlug, faqTitle] of [
      ["juros-compostos", "Juros compostos"],
      ["primeiro-milhao", "Primeiro milhão"],
      ["conversor-de-taxas", "Conversor de taxas"],
    ]) {
      expect(faqSections.find((section) => section.title === faqTitle)?.category).toBe(
        findToolGroup(itemsSlug)?.label,
      );
    }
  });
});
