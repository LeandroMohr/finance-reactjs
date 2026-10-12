import type { HousingPoint } from "./calculateBuyOrRent";

export const HOUSING_CHART = {
  width: 760, height: 340, left: 110, right: 30, top: 25, baseline: 285,
};

export function buildHousingChart(evolution: HousingPoint[]) {
  if (!evolution.length || evolution.some((point) =>
    !Number.isFinite(point.month) || !Number.isFinite(point.buyNetWorth) || !Number.isFinite(point.rentNetWorth))) {
    throw new RangeError("O gráfico precisa de uma evolução com valores finitos.");
  }
  const months = evolution[evolution.length - 1].month;
  const values = evolution.flatMap((point) => [point.buyNetWorth, point.rentNetWorth]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const x = (month: number) => Number((HOUSING_CHART.left +
    month / Math.max(1, months) * (HOUSING_CHART.width - HOUSING_CHART.left - HOUSING_CHART.right)).toFixed(2));
  const y = (value: number) => Number((HOUSING_CHART.baseline -
    (value - minimum) / (maximum - minimum) * (HOUSING_CHART.baseline - HOUSING_CHART.top)).toFixed(2));
  const step = Math.max(12, Math.ceil(months / 120) * 12);
  const tickMonths = [0];
  for (let month = step; month < months; month += step) {
    if (months - month >= step / 2) tickMonths.push(month);
  }
  if (months > 0) tickMonths.push(months);
  return {
    x,
    y,
    buyLine: evolution.map((point) => `${x(point.month).toFixed(2)},${y(point.buyNetWorth).toFixed(2)}`).join(" "),
    rentLine: evolution.map((point) => `${x(point.month).toFixed(2)},${y(point.rentNetWorth).toFixed(2)}`).join(" "),
    ticks: tickMonths.map((month) => ({ month, x: x(month) })),
    valueTicks: Array.from({ length: 5 }, (_, index) => {
      const value = minimum + (maximum - minimum) * index / 4;
      return { value, y: y(value) };
    }),
  };
}
