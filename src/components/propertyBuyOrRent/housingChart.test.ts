import { describe, expect, it } from "vitest";
import { calculateBuyOrRent, defaultBuyOrRentInput } from "./calculateBuyOrRent";
import { buildHousingChart, HOUSING_CHART } from "./housingChart";

describe("housing comparison chart", () => {
  it("uses all monthly points for both scenarios and includes the final year", () => {
    const result = calculateBuyOrRent(defaultBuyOrRentInput);
    const chart = buildHousingChart(result.evolution);
    expect(chart.buyLine.split(" ")).toHaveLength(241);
    expect(chart.rentLine.split(" ")).toHaveLength(241);
    expect(chart.buyLine).not.toBe(chart.rentLine);
    expect(chart.ticks[0].month).toBe(0);
    expect(chart.ticks.at(-1)?.month).toBe(240);
    expect(chart.x(240)).toBe(HOUSING_CHART.width - HOUSING_CHART.right);
  });

  it("keeps negative net worth inside the chart instead of clipping it", () => {
    const result = calculateBuyOrRent({ ...defaultBuyOrRentInput, downPayment: 0 });
    const chart = buildHousingChart(result.evolution);
    expect(chart.valueTicks[0].value).toBeLessThan(0);
    for (const line of [chart.buyLine, chart.rentLine]) {
      for (const pair of line.split(" ")) {
        const [x, y] = pair.split(",").map(Number);
        expect(x).toBeGreaterThanOrEqual(HOUSING_CHART.left);
        expect(y).toBeGreaterThanOrEqual(HOUSING_CHART.top);
        expect(y).toBeLessThanOrEqual(HOUSING_CHART.baseline);
      }
    }
  });

  it("handles flat zero values without dividing by zero and rejects empty data", () => {
    const point = { ...calculateBuyOrRent(defaultBuyOrRentInput).evolution[0], buyNetWorth: 0, rentNetWorth: 0 };
    const chart = buildHousingChart([point]);
    expect(chart.buyLine).not.toMatch(/NaN|Infinity/);
    expect(() => buildHousingChart([])).toThrow(RangeError);
  });

  it("rounds SVG coordinates to stable precision for server/client hydration", () => {
    const chart = buildHousingChart(calculateBuyOrRent(defaultBuyOrRentInput).evolution);
    for (const tick of chart.valueTicks) {
      expect(String(tick.y)).toMatch(/^\d+(?:\.\d{1,2})?$/);
    }
    for (const tick of chart.ticks) {
      expect(String(tick.x)).toMatch(/^\d+(?:\.\d{1,2})?$/);
    }
    expect(chart.y(chart.valueTicks[3].value)).toBe(90);
  });
});
