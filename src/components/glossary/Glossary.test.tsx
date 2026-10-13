import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Glossary from "./Glossary";
import { glossaryTerms } from "@/config/glossary";
import * as analytics from "@/utils/analytics";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Glossary", () => {
  it("renders all definitions and examples with unique anchors", () => {
    const { container } = render(<Glossary />);
    expect(screen.getByRole("heading", { level: 1, name: "Glossário financeiro" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(glossaryTerms.length);
    expect(screen.getByRole("status", { name: "Resultados da busca" })).toHaveTextContent(`${glossaryTerms.length} termos encontrados`);
    for (const term of glossaryTerms) {
      const article = container.querySelector(`#termo-${term.id}`)!;
      expect(article).toHaveTextContent(term.description);
      if (term.example) expect(article).toHaveTextContent(term.example);
    }
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("offers letter anchors only for nonempty groups", () => {
    const { container } = render(<Glossary />);
    const index = screen.getByRole("navigation", { name: "Índice alfabético do glossário" });
    for (const link of within(index).getAllByRole("link")) {
      expect(container.querySelector(link.getAttribute("href")!)).toBeInTheDocument();
    }
    expect(within(index).queryByRole("link", { name: "Ir para letra Z" })).not.toBeInTheDocument();
    expect(within(index).getByLabelText("Letra Z sem resultados")).toHaveAttribute("aria-disabled", "true");
  });

  it("filters by an acronym and updates the letter ruler", () => {
    render(<Glossary />);
    fireEvent.change(screen.getByLabelText("Buscar termo, sigla ou descrição"), { target: { value: "LPA" } });
    expect(screen.getByRole("heading", { level: 3, name: "Lucro por ação" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Risco de vacância" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("status", { name: "Resultados da busca" })).toHaveTextContent("2 termos encontrados");
    expect(screen.getByRole("link", { name: "Ir para letra L" })).toHaveAttribute("href", "#letra-l");
    expect(screen.queryByRole("link", { name: "Ir para letra A" })).not.toBeInTheDocument();
  });

  it("handles empty results and clears the search", () => {
    render(<Glossary />);
    fireEvent.change(screen.getByLabelText("Buscar termo, sigla ou descrição"), { target: { value: "xyz-inexistente" } });
    expect(screen.getByText(/Nenhum termo encontrado/)).toBeVisible();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getAllByRole("article")).toHaveLength(glossaryTerms.length);
    expect(screen.getByLabelText("Buscar termo, sigla ou descrição")).toHaveValue("");
  });

  it("includes financial caveats, source links and canonical sharing", () => {
    render(<Glossary />);
    expect(screen.getByText(/Conteúdo educativo, não recomendação/)).toBeVisible();
    const sources = screen.getByRole("region", { name: "Referências e critérios" });
    const accordion = sources.querySelector("details")!;
    expect(accordion).not.toHaveAttribute("open");
    expect(within(sources).getByText(/Textos redigidos para/)).not.toBeVisible();
    expect(within(sources).getByRole("link", { name: "Banco Central: glossário de cidadania financeira (PDF)", hidden: true })).toHaveAttribute("rel", "noopener noreferrer");
    expect(within(sources).getByRole("link", { name: "Banco Central: Boletim Focus", hidden: true })).toHaveAttribute("href", "https://www.bcb.gov.br/controleinflacao/relatoriofocus");
    expect(screen.getByRole("link", { name: "Compartilhar no WhatsApp" }).getAttribute("href")).toContain(
      encodeURIComponent("https://lemohr.com.br/glossario/"),
    );
  });

  it("debounces search metadata without sending the visitor's search text", () => {
    vi.useFakeTimers();
    const track = vi.spyOn(analytics, "trackEvent").mockReturnValue(true);
    const { unmount } = render(<Glossary />);
    const input = screen.getByLabelText("Buscar termo, sigla ou descrição");
    fireEvent.change(input, { target: { value: "LP" } });
    act(() => vi.advanceTimersByTime(1499));
    expect(track).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "LPA" } });
    act(() => vi.advanceTimersByTime(1500));
    expect(track).toHaveBeenCalledExactlyOnceWith("glossary_search", { result_count: 2, query_length: 3 });
    fireEvent.change(input, { target: { value: "new query" } });
    unmount();
    act(() => vi.advanceTimersByTime(1500));
    expect(track).toHaveBeenCalledTimes(1);
  });
});
