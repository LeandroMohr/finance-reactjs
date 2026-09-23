import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Accordion from "./Accordion";

describe("Accordion", () => {
  it("renders collapsed by default while keeping content in the DOM", () => {
    render(
      <Accordion summary={<h1>Conversor de taxas</h1>}>
        <p>Texto explicativo para SEO.</p>
      </Accordion>,
    );

    const details = screen.getByRole("heading", { name: "Conversor de taxas" }).closest("details")!;

    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Texto explicativo para SEO.")).toBeInTheDocument();
  });

  it("expands when clicking the summary (title included)", async () => {
    const user = userEvent.setup();
    render(
      <Accordion summary={<h1>Conversor de taxas</h1>}>
        <p>Texto explicativo para SEO.</p>
      </Accordion>,
    );

    await user.click(screen.getByRole("heading", { name: "Conversor de taxas" }));

    expect(
      screen.getByRole("heading", { name: "Conversor de taxas" }).closest("details"),
    ).toHaveAttribute("open");
  });

  it("renders open by default when defaultOpen is set", () => {
    render(
      <Accordion summary={<h1>Conversor de taxas</h1>} defaultOpen>
        <p>Texto explicativo para SEO.</p>
      </Accordion>,
    );

    expect(
      screen.getByRole("heading", { name: "Conversor de taxas" }).closest("details"),
    ).toHaveAttribute("open");
  });
});
