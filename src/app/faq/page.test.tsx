import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { faqSections } from "@/config/faq";
import FaqPage from "./page";

describe("FaqPage", () => {
  it("groups every published question by category", () => {
    render(<FaqPage />);

    expect(screen.getByRole("heading", { name: "Perguntas frequentes" })).toBeInTheDocument();

    for (const section of faqSections) {
      expect(screen.getByRole("heading", { name: section.category })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: section.title })).toBeInTheDocument();

      for (const item of section.items) {
        expect(screen.getByText(item.question)).toBeInTheDocument();
        expect(screen.getByText(item.answer)).toBeInTheDocument();
      }
    }
  });

  it("emits one FAQPage schema with every question", () => {
    const { container } = render(<FaqPage />);
    const schemas = container.querySelectorAll('script[type="application/ld+json"]');
    const faqSchema = Array.from(schemas)
      .map((script) => JSON.parse(script.textContent ?? "{}"))
      .find((schema) => schema["@type"] === "FAQPage");
    const questionCount = faqSections.reduce((total, section) => total + section.items.length, 0);

    expect(faqSchema.mainEntity).toHaveLength(questionCount);
  });
});