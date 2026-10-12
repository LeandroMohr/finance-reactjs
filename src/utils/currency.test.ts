import { describe, expect, it, vi } from "vitest";
import { formatCompactCurrency } from "./currency";

describe("formatCompactCurrency", () => {
  it.each([
    [0, "R$ 0"],
    [100, "R$ 100"],
    [250_000, "R$ 250 mil"],
    [754_800, "R$ 754,8 mil"],
    [1_000_000, "R$ 1 mi"],
    [1_250_000, "R$ 1,3 mi"],
    [2_500_000_000, "R$ 2,5 bi"],
    [1_000_000_000_000, "R$ 1 tri"],
    [-2500, "R$ -2,5 mil"],
  ])("formats %s deterministically as %s", (value, expected) => {
    expect(formatCompactCurrency(Number(value))).toBe(expected);
  });

  it("does not depend on the runtime locale data for axis labels", () => {
    const formatter = vi.spyOn(Intl, "NumberFormat").mockImplementation(() => {
      throw new Error("Runtime-specific Intl formatter");
    });
    try {
      expect(formatCompactCurrency(0)).toBe("R$ 0");
      expect(formatCompactCurrency(250_000)).toBe("R$ 250 mil");
    } finally {
      formatter.mockRestore();
    }
  });

  it.each([NaN, Infinity, -Infinity])("rejects non-finite input %s", (value) => {
    expect(() => formatCompactCurrency(value)).toThrow(RangeError);
  });
});
