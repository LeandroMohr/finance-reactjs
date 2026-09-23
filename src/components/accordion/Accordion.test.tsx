import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Accordion from "./Accordion";

describe("Accordion", () => {
  it("renders collapsed by default while keeping content in the DOM", () => {
    render(
      <Accordion title="Entenda a fórmula">
        <p>Texto explicativo para SEO.</p>
      </Accordion>,
    );

    const details = screen.getByText("Entenda a fórmula").closest("details")!;

    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Texto explicativo para SEO.")).toBeInTheDocument();
  });

  it("expands when the summary is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Entenda a fórmula">
        <p>Texto explicativo para SEO.</p>
      </Accordion>,
    );

    await user.click(screen.getByText("Entenda a fórmula"));

    expect(screen.getByText("Entenda a fórmula").closest("details")).toHaveAttribute("open");
  });

  it("renders open by default when defaultOpen is set", () => {
    render(
      <Accordion title="Entenda a fórmula" defaultOpen>
        <p>Texto explicativo para SEO.</p>
      </Accordion>,
    );

    expect(screen.getByText("Entenda a fórmula").closest("details")).toHaveAttribute("open");
  });
});
