"use client";

import { useMemo, useState, type PointerEvent } from "react";
import styles from "./CompoundInterestCalculator.module.scss";

type CompoundInterestInput = {
  initialAmount: number;
  monthlyContribution: number;
  interestRate: number;
  ratePeriod: "monthly" | "annual";
  duration: number;
  durationUnit: "months" | "years";
};

type MonthlyBreakdown = {
  month: number;
  contribution: number;
  interest: number;
  balance: number;
};

type CompoundInterestResult = {
  finalAmount: number;
  totalContributed: number;
  totalReturns: number;
  monthlyBreakdown: MonthlyBreakdown[];
};

const MONTHS_PER_YEAR = 12;

export function calculateCompoundInterest({
  initialAmount,
  monthlyContribution,
  interestRate,
  ratePeriod,
  duration,
  durationUnit,
}: CompoundInterestInput): CompoundInterestResult {
  const monthlyRate = interestRate / 100 / (ratePeriod === "annual" ? MONTHS_PER_YEAR : 1);
  const totalMonths = Math.max(
    0,
    Math.round(duration * (durationUnit === "years" ? MONTHS_PER_YEAR : 1)),
  );

  let balance = initialAmount;
  let totalContribution = initialAmount;
  const monthlyBreakdown: MonthlyBreakdown[] = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const contribution = monthlyContribution;
    totalContribution += contribution;

    const interest = balance * monthlyRate;
    balance += contribution + interest;

    monthlyBreakdown.push({ month, contribution, interest, balance });
  }

  return {
    finalAmount: Number(balance.toFixed(2)),
    totalContributed: Number(totalContribution.toFixed(2)),
    totalReturns: Number((balance - totalContribution).toFixed(2)),
    monthlyBreakdown,
  };
}

type FormValues = {
  initialAmount: string;
  monthlyContribution: string;
  interestRate: string;
  duration: string;
  ratePeriod: CompoundInterestInput["ratePeriod"];
  durationUnit: CompoundInterestInput["durationUnit"];
};

type AmountKey = "initialAmount" | "monthlyContribution" | "interestRate" | "duration";
type UnitKey = "ratePeriod" | "durationUnit";
type DecimalKey = "interestRate" | "duration";
type FieldType = "currency" | "decimal";
type FieldErrors = Partial<Record<DecimalKey, string>>;

type ParsedDecimal =
  | { ok: true; value: number }
  | { ok: false; reason: "empty" | "negative" | "format" };

const MAX_YEARS = 100;
const MAX_MONTHS = MAX_YEARS * MONTHS_PER_YEAR;
const DECIMAL_PATTERN = /^\d+(?:[.,]\d{1,6})?$/;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const compactCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const CHART = {
  width: 640,
  height: 240,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 36,
  paddingLeft: 92,
};

type ChartPoint = { month: number; balance: number; x: number; y: number };

function buildChart(months: MonthlyBreakdown[]) {
  const innerWidth = CHART.width - CHART.paddingLeft - CHART.paddingRight;
  const innerHeight = CHART.height - CHART.paddingTop - CHART.paddingBottom;
  const baseline = CHART.paddingTop + innerHeight;
  const maxBalance = Math.max(...months.map((item) => item.balance), 1);

  const points = months.map((item, index) => ({
    month: item.month,
    balance: item.balance,
    x: CHART.paddingLeft + (months.length > 1 ? index / (months.length - 1) : 1) * innerWidth,
    y: baseline - (item.balance / maxBalance) * innerHeight,
  }));

  const line = points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const lastPoint = points[points.length - 1];
  const area = lastPoint
    ? `${CHART.paddingLeft},${baseline} ${line} ${lastPoint.x.toFixed(2)},${baseline}`
    : "";

  const valueTicks = [0, 0.5, 1].map((ratio) => ({
    ratio,
    value: maxBalance * ratio,
    y: baseline - ratio * innerHeight,
  }));

  return { points, line, area, valueTicks, timeAxis: buildTimeAxis(points), baseline };
}

function buildTimeAxis(points: ChartPoint[]) {
  if (points.length < MONTHS_PER_YEAR) {
    const indexes = points.length
      ? [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])]
      : [];

    return {
      unit: "meses",
      ticks: indexes.map((index) => ({ ...points[index], label: String(points[index].month) })),
    };
  }

  const totalYears = Math.floor(points.length / MONTHS_PER_YEAR);
  const step = totalYears <= 10 ? 1 : totalYears <= 25 ? 2 : 5;
  const ticks = [];

  for (let year = step; year <= totalYears; year += step) {
    const point = points[year * MONTHS_PER_YEAR - 1];

    if (point) ticks.push({ ...point, label: String(year) });
  }

  return { unit: "anos", ticks };
}

function maskCurrency(raw: string) {
  const digitsAsCents = raw.replace(/\D/g, "").slice(0, 13);

  return currency.format(Number(digitsAsCents) / 100);
}

function parseCurrency(masked: string) {
  return Number(masked.replace(/\D/g, "")) / 100;
}

function parseDecimal(raw: string): ParsedDecimal {
  const value = raw.replace(/\s/g, "");

  if (!value) return { ok: false, reason: "empty" };
  if (value.startsWith("-")) return { ok: false, reason: "negative" };
  if (!DECIMAL_PATTERN.test(value)) return { ok: false, reason: "format" };

  return { ok: true, value: Number(value.replace(",", ".")) };
}

const decimalErrors: Record<DecimalKey, Record<"empty" | "negative" | "format", string>> = {
  interestRate: {
    empty: "Informe a taxa de juros.",
    negative: "A taxa de juros não pode ser negativa.",
    format: "Use apenas números, com vírgula ou ponto. Ex.: 12,25",
  },
  duration: {
    empty: "Informe o tempo.",
    negative: "O tempo não pode ser negativo.",
    format: "Use apenas números, com vírgula ou ponto. Ex.: 1,8",
  },
};

function validateValues(values: FormValues) {
  const errors: FieldErrors = {};

  const rate = parseDecimal(values.interestRate);
  if (!rate.ok) errors.interestRate = decimalErrors.interestRate[rate.reason];

  const duration = parseDecimal(values.duration);
  if (!duration.ok) {
    errors.duration = decimalErrors.duration[duration.reason];
  } else if (duration.value * (values.durationUnit === "years" ? MONTHS_PER_YEAR : 1) > MAX_MONTHS) {
    errors.duration = `O tempo máximo é de ${MAX_YEARS} anos (${MAX_MONTHS} meses).`;
  }

  const isValid = Object.keys(errors).length === 0;

  const input: CompoundInterestInput = {
    initialAmount: parseCurrency(values.initialAmount),
    monthlyContribution: parseCurrency(values.monthlyContribution),
    interestRate: isValid && rate.ok ? rate.value : 0,
    ratePeriod: values.ratePeriod,
    duration: isValid && duration.ok ? duration.value : 0,
    durationUnit: values.durationUnit,
  };

  return { errors, input };
}

const defaultValues: FormValues = {
  initialAmount: maskCurrency("0"),
  monthlyContribution: maskCurrency("0"),
  interestRate: "0",
  duration: "0",
  ratePeriod: "annual",
  durationUnit: "years",
};

type Field = {
  label: string;
  key: AmountKey;
  type: FieldType;
  placeholder: string;
  unit?: {
    key: UnitKey;
    label: string;
    options: { value: string; label: string }[];
  };
};

const fields: Field[] = [
  { label: "Aporte inicial", key: "initialAmount", type: "currency", placeholder: "R$ 0,00" },
  { label: "Aporte mensal", key: "monthlyContribution", type: "currency", placeholder: "R$ 0,00" },
  {
    label: "Taxa de juros (%)",
    key: "interestRate",
    type: "decimal",
    placeholder: "12,25",
    unit: {
      key: "ratePeriod",
      label: "Periodicidade da taxa",
      options: [
        { value: "monthly", label: "Mensal" },
        { value: "annual", label: "Anual" },
      ],
    },
  },
  {
    label: "Tempo",
    key: "duration",
    type: "decimal",
    placeholder: "1,8",
    unit: {
      key: "durationUnit",
      label: "Unidade do tempo",
      options: [
        { value: "months", label: "Meses" },
        { value: "years", label: "Anos" },
      ],
    },
  },
];

export default function CompoundInterestCalculator() {
  const [values, setValues] = useState(defaultValues);

  const { errors, input } = useMemo(() => validateValues(values), [values]);
  const result = useMemo(() => calculateCompoundInterest(input), [input]);

  const chart = useMemo(() => buildChart(result.monthlyBreakdown), [result]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredPoint = hoveredIndex === null ? null : (chart.points[hoveredIndex] ?? null);

  const visibleMonths = result.monthlyBreakdown.slice(-12);

  const handleChartPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();

    if (chart.points.length === 0 || width === 0) return;

    const innerWidth = CHART.width - CHART.paddingLeft - CHART.paddingRight;
    const x = ((event.clientX - left) / width) * CHART.width;
    const position = ((x - CHART.paddingLeft) / innerWidth) * (chart.points.length - 1);

    setHoveredIndex(Math.min(chart.points.length - 1, Math.max(0, Math.round(position))));
  };

  const handleChange = (key: AmountKey, type: FieldType, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: type === "currency" ? maskCurrency(value) : value,
    }));
  };

  const handleUnitChange = (key: UnitKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }) as FormValues);
  };

  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Entenda a fórmula</p>
        <h1 className={styles.title}>Juros compostos: como o dinheiro cresce com o tempo</h1>
        <div className={styles.introText}>
          <p>
            Juros compostos são os juros calculados sobre o valor inicial mais os rendimentos
            acumulados. Em outras palavras, o dinheiro rende sobre o dinheiro que já foi gerado,
            criando crescimento exponencial ao longo do tempo.
          </p>
          <p>
            Essa calculadora ajuda a simular cenários de investimento com aporte inicial, aporte
            mensal, taxa anual e período. Ao ajustar os valores, você vê o impacto real do tempo e da
            consistência no crescimento do patrimônio.
          </p>
        </div>
      </section>

      <section className={styles.simulation}>
        <div className={styles.form}>
          <p className={styles.eyebrow}>Simulação</p>
          <h2 className={styles.sectionTitle}>Descubra seu crescimento</h2>

          <div className={styles.fields}>
            {fields.map(({ label, key, type, placeholder, unit }) => {
              const error = key === "interestRate" || key === "duration" ? errors[key] : undefined;

              return (
                <div key={key} className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor={key}>
                    {label}
                  </label>
                  <div className={styles.inputGroup}>
                    <input
                      id={key}
                      className={`${styles.input} ${error ? styles.inputError : ""}`}
                      type="text"
                      inputMode="decimal"
                      placeholder={placeholder}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${key}-error` : undefined}
                      value={values[key]}
                      onChange={(event) => handleChange(key, type, event.target.value)}
                    />
                    {unit ? (
                      <select
                        aria-label={unit.label}
                        className={styles.unitSelect}
                        value={values[unit.key]}
                        onChange={(event) => handleUnitChange(unit.key, event.target.value)}
                      >
                        {unit.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                  {error ? (
                    <p id={`${key}-error`} className={styles.errorMessage} role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <aside className={styles.result}>
          <p className={styles.eyebrow}>Resultado</p>

          <div className={styles.highlight}>
            <p className={styles.metricLabel}>Valor final</p>
            <p className={styles.highlightValue}>{currency.format(result.finalAmount)}</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Total aportado</p>
              <p className={styles.metricValue}>{currency.format(result.totalContributed)}</p>
            </div>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Retorno</p>
              <p className={`${styles.metricValue} ${styles.metricPositive}`}>
                {currency.format(result.totalReturns)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.evolution}>
        <p className={styles.eyebrow}>Evolução mensal</p>
        <h2 className={styles.sectionTitle}>Valor x Tempo</h2>

        {chart.points.length > 0 ? (
          <figure className={styles.chart}>
            <div className={styles.chartCanvas}>
              <svg
                className={styles.chartSvg}
                viewBox={`0 0 ${CHART.width} ${CHART.height}`}
                role="img"
                aria-label={`Evolução do valor ao longo de ${chart.points.length} mês(es), chegando a ${currency.format(result.finalAmount)}`}
                onPointerMove={handleChartPointerMove}
                onPointerLeave={() => setHoveredIndex(null)}
              >
                {chart.valueTicks.map((tick) => (
                  <g key={tick.ratio}>
                    <line
                      className={styles.chartGrid}
                      x1={CHART.paddingLeft}
                      x2={CHART.width - CHART.paddingRight}
                      y1={tick.y}
                      y2={tick.y}
                    />
                    <text
                      className={styles.chartTick}
                      x={CHART.paddingLeft - 10}
                      y={tick.y + 4}
                      textAnchor="end"
                    >
                      {compactCurrency.format(tick.value)}
                    </text>
                  </g>
                ))}

                <polygon className={styles.chartArea} points={chart.area} />
                <polyline className={styles.chartLine} points={chart.line} />

                {hoveredPoint ? (
                  <g>
                    <line
                      className={styles.chartGuide}
                      x1={hoveredPoint.x}
                      x2={hoveredPoint.x}
                      y1={CHART.paddingTop}
                      y2={chart.baseline}
                    />
                    <circle className={styles.chartMarker} cx={hoveredPoint.x} cy={hoveredPoint.y} r={5} />
                  </g>
                ) : null}

                {chart.timeAxis.ticks.map((tick) => (
                  <text
                    key={tick.month}
                    className={styles.chartTick}
                    x={tick.x}
                    y={chart.baseline + 22}
                    textAnchor="middle"
                  >
                    {tick.label}
                  </text>
                ))}
              </svg>

              {hoveredPoint ? (
                <div
                  className={styles.chartTooltip}
                  style={{
                    left: `${(hoveredPoint.x / CHART.width) * 100}%`,
                    top: `${(hoveredPoint.y / CHART.height) * 100}%`,
                  }}
                >
                  <span className={styles.chartTooltipMonth}>{hoveredPoint.month}º mês</span>
                  <span className={styles.chartTooltipValue}>
                    {currency.format(hoveredPoint.balance)}
                  </span>
                </div>
              ) : null}
            </div>
            <figcaption className={styles.chartCaption}>
              Valor (R$) x Tempo ({chart.timeAxis.unit})
            </figcaption>
          </figure>
        ) : (
          <p className={styles.chartEmpty}>Informe um tempo maior que zero para ver a evolução.</p>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Aporte</th>
                <th>Juros</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {visibleMonths.map((item) => (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>{currency.format(item.contribution)}</td>
                  <td className={styles.interest}>{currency.format(item.interest)}</td>
                  <td className={styles.balance}>{currency.format(item.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
