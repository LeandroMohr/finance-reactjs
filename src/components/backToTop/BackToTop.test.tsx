import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BackToTop from "./BackToTop";

function scrollTo(y: number) {
  window.scrollY = y;
  window.dispatchEvent(new Event("scroll"));
}

describe("BackToTop", () => {
  it("stays hidden from assistive tech and keyboard until the page is scrolled", async () => {
    render(<BackToTop />);

    const button = screen.getByTitle("Voltar ao topo");
    expect(button).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAttribute("tabindex", "-1");

    scrollTo(800);

    expect(await screen.findByRole("button", { name: "Voltar ao topo" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("scrolls back to the top when clicked", async () => {
    const scrollToSpy = vi.fn();
    vi.stubGlobal("scrollTo", scrollToSpy);

    render(<BackToTop />);
    scrollTo(800);
    await userEvent.click(await screen.findByRole("button", { name: "Voltar ao topo" }));

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    vi.unstubAllGlobals();
  });
});
