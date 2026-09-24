import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site";
import ShareContent from "./ShareContent";

const path = "/compound-interest/";
const title = "Calculadora de Juros Compostos";
const url = `${siteConfig.url}${path}`;

describe("ShareContent", () => {
  it("builds absolute share links for each network", () => {
    render(<ShareContent path={path} title={title} />);

    const whatsapp = screen.getByRole("link", { name: "Compartilhar no WhatsApp" });
    expect(whatsapp).toHaveAttribute(
      "href",
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${siteConfig.name} - ${title} - ${url}`)}`,
    );
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    expect(whatsapp).toHaveAttribute("target", "_blank");

    expect(screen.getByRole("link", { name: "Compartilhar no Facebook" })).toHaveAttribute(
      "href",
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    );
    expect(screen.getByRole("link", { name: "Compartilhar no X" }).getAttribute("href")).toContain(
      encodeURIComponent(url),
    );
    expect(
      screen.getByRole("link", { name: "Compartilhar no LinkedIn" }).getAttribute("href"),
    ).toContain(encodeURIComponent(url));
    expect(
      screen.getByRole("link", { name: "Compartilhar no Telegram" }).getAttribute("href"),
    ).toContain(encodeURIComponent(url));
  });

  it("copies the canonical url and confirms the action", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });

    render(<ShareContent path={path} title={title} />);
    await userEvent.click(screen.getByRole("button", { name: "Copiar link" }));

    expect(writeText).toHaveBeenCalledWith(url);
    expect(await screen.findByText("Link copiado!")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("stays silent when the clipboard is unavailable", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    render(<ShareContent path={path} title={title} />);
    await userEvent.click(screen.getByRole("button", { name: "Copiar link" }));

    expect(screen.queryByText("Link copiado!")).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
