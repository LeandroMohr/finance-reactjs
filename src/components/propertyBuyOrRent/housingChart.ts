import type { HousingPoint } from "./calculateBuyOrRent";
import { buildComparisonChart, COMPARISON_CHART } from "@/utils/comparisonChart";

export const HOUSING_CHART = COMPARISON_CHART;

export function buildHousingChart(evolution: HousingPoint[]) {
  const chart = buildComparisonChart(evolution.map((point) => ({
    month: point.month, first: point.buyNetWorth, second: point.rentNetWorth,
  })));
  return {
    ...chart, buyLine: chart.firstLine, rentLine: chart.secondLine,
  };
}
