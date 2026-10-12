import { MILLION, type EvolutionPoint } from "./calculateFirstMillion";

export const CHART = {
  width: 760,
  height: 320,
  left: 110,
  right: 30,
  top: 30,
  baseline: 250,
};

export function buildFirstMillionChart(evolution: EvolutionPoint[]) {
  const last = evolution[evolution.length - 1];
  const months = last.month;
  const maximum = Math.max(MILLION, last.balance);
  const x = (month: number) =>
    CHART.left + month / Math.max(1, months) * (CHART.width - CHART.left - CHART.right);
  const y = (balance: number) =>
    CHART.baseline - balance / maximum * (CHART.baseline - CHART.top);
  const points = evolution.map((point) => ({ ...point, x: x(point.month), y: y(point.balance) }));
  const unit = months < 12 ? "meses" : "anos";
  const step = months < 12 ? Math.max(1, Math.ceil(months / 3))
    : months <= 120 ? 12 : months <= 240 ? 24 : 60;
  const tickMonths = [0];
  for (let month = step; month < months; month += step) tickMonths.push(month);
  const staggerEndpoint = tickMonths.length > 1 &&
    months - tickMonths[tickMonths.length - 1] < step / 2;
  if (months > 0) tickMonths.push(months);

  return {
    points,
    line: points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "),
    unit,
    ticks: tickMonths.map((month) => ({
      month,
      x: x(month),
      y: CHART.baseline + (month === months && staggerEndpoint ? 40 : 22),
      label: unit === "meses" ? String(month)
        : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(month / 12),
    })),
    valueTicks: [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      value: maximum * ratio,
      y: y(maximum * ratio),
    })),
    goalY: y(MILLION),
  };
}
