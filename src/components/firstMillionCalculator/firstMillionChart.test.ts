import { describe, expect, it } from "vitest";
import { buildFirstMillionChart, CHART } from "./firstMillionChart";

function chartFor(months: number) {
  return buildFirstMillionChart(Array.from({ length: months + 1 }, (_, month) => ({
    month, balance: month * 1000, contributed: month * 1000,
  })));
}

describe("first million chart", () => {
  it.each([
    [120, [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]],
    [132, [0, 24, 48, 72, 96, 120, 132]],
    [240, [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240]],
    [252, [0, 60, 120, 180, 240, 252]],
    [396, [0, 60, 120, 180, 240, 300, 360, 396]],
  ])("uses the required spacing for %s months and includes the endpoint", (months, expected) => {
    const chart = chartFor(months);
    expect(chart.ticks.map((tick) => tick.month)).toEqual(expected);
    expect(chart.ticks.at(-1)!.x).toBe(CHART.width - CHART.right);
  });

  it("shows year 33 instead of ending at 30", () => {
    expect(chartFor(396).ticks.at(-1)!.label).toBe("33");
  });

  it("includes a fractional final year and avoids crowding the endpoint", () => {
    const chart = chartFor(121);
    expect(chart.ticks.at(-1)!.label).toBe("10,08");
    expect(chart.ticks.map((tick) => tick.month)).toContain(120);
    expect(chart.ticks.at(-1)!.y).toBeGreaterThan(chart.ticks.at(-2)!.y);
  });

  it("uses months for periods shorter than a year", () => {
    const chart = chartFor(10);
    expect(chart.unit).toBe("meses");
    expect(chart.ticks.at(-1)!.label).toBe("10");
  });

  it("keeps every monthly value on the curve for hover", () => {
    const chart = chartFor(396);
    expect(chart.points).toHaveLength(397);
    expect(chart.points[1].balance).toBe(1000);
    expect(chart.valueTicks).toHaveLength(5);
    expect(chart.valueTicks[0].value).toBe(0);
    expect(chart.valueTicks.at(-1)!.value).toBe(1_000_000);
  });
});
