export const COMPARISON_CHART = {
  width: 760, height: 340, left: 110, right: 30, top: 25, baseline: 285,
};

export function buildComparisonChart(evolution: { month: number; first: number; second: number }[]) {
  if (!evolution.length || evolution.some((point) =>
    !Number.isFinite(point.month) || !Number.isFinite(point.first) || !Number.isFinite(point.second))) {
    throw new RangeError("O gráfico precisa de uma evolução com valores finitos.");
  }
  const months = evolution[evolution.length - 1].month;
  const values = evolution.flatMap((point) => [point.first, point.second]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const x = (month: number) => Number((COMPARISON_CHART.left +
    month / Math.max(1, months) * (COMPARISON_CHART.width - COMPARISON_CHART.left - COMPARISON_CHART.right)).toFixed(2));
  const y = (value: number) => Number((COMPARISON_CHART.baseline -
    (value - minimum) / (maximum - minimum) * (COMPARISON_CHART.baseline - COMPARISON_CHART.top)).toFixed(2));
  const step = Math.max(12, Math.ceil(months / 120) * 12);
  const tickMonths = [0];
  for (let month = step; month < months; month += step) {
    if (months - month >= step / 2) tickMonths.push(month);
  }
  if (months > 0) tickMonths.push(months);
  return {
    x, y,
    firstLine: evolution.map((point) => `${x(point.month).toFixed(2)},${y(point.first).toFixed(2)}`).join(" "),
    secondLine: evolution.map((point) => `${x(point.month).toFixed(2)},${y(point.second).toFixed(2)}`).join(" "),
    ticks: tickMonths.map((month) => ({ month, x: x(month) })),
    valueTicks: Array.from({ length: 5 }, (_, index) => {
      const value = minimum + (maximum - minimum) * index / 4;
      return { value, y: y(value) };
    }),
  };
}
