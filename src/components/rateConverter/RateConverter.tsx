"use client";

import { useMemo, useState, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import styles from "./RateConverter.module.scss";

type RatePeriod = "daily" | "monthly" | "annual";

type RateConverterInput = {
  rate: number;
  fromPeriod: RatePeriod;
  toPeriod: RatePeriod;
};

// Days used to express each periodicity as a fraction of a 360-day commercial year.
const PERIOD_DAYS: Record<RatePeriod, number> = {
  daily: 1,
  monthly: 30,
  annual: 360,
};

const PERIOD_LABELS: Record<RatePeriod, string> = {
  daily: "Diária",
  monthly: "Mensal",
  annual: "Anual",
};

const PERIOD_ORDER: RatePeriod[] = ["daily", "monthly", "annual"];

export function convertRate({ rate, fromPeriod, toPeriod }: RateConverterInput): number {
  const decimalRate = rate / 100;
  const ratio = PERIOD_DAYS[toPeriod] / PERIOD_DAYS[fromPeriod];

  return (Math.pow(1 + decimalRate, ratio) - 1) * 100;
}

type FormValues = {
  rate: string;
  fromPeriod: RatePeriod;
  toPeriod: RatePeriod;
  amount: string;
};

type ParsedDecimal =
  | { ok: true; value: number }
  | { ok: false; reason: "empty" | "negative" | "format" };

const DECIMAL_PATTERN = /^\d+(?:[.,]\d{1,6})?$/;

function parseDecimal(raw: string): ParsedDecimal {
  const value = raw.replace(/\s/g, "");

  if (!value) return { ok: false, reason: "empty" };
  if (value.startsWith("-")) return { ok: false, reason: "negative" };
  if (!DECIMAL_PATTERN.test(value)) return { ok: false, reason: "format" };

  return { ok: true, value: Number(value.replace(",", ".")) };
}

const rateErrors: Record<"empty" | "negative" | "format", string> = {
  empty: "Informe a taxa de juros.",
  negative: "A taxa de juros não pode ser negativa.",
  format: "Use apenas números, com vírgula ou ponto. Ex.: 1,25",
};

function validateValues(values: FormValues) {
  const parsed = parseDecimal(values.rate);
  const error = parsed.ok ? undefined : rateErrors[parsed.reason];

  const input: RateConverterInput = {
    rate: parsed.ok ? parsed.value : 0,
    fromPeriod: values.fromPeriod,
    toPeriod: values.toPeriod,
  };

  return { error, input };
}

const percent = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function maskCurrency(raw: string) {
  const digitsAsCents = raw.replace(/\D/g, "").slice(0, 13);

  return currency.format(Number(digitsAsCents) / 100);
}

function parseCurrency(masked: string) {
  return Number(masked.replace(/\D/g, "")) / 100;
}

const defaultValues: FormValues = {
  rate: "2,8",
  fromPeriod: "monthly",
  toPeriod: "annual",
  amount: maskCurrency("100000"),
};

export default function RateConverter({ breadcrumb }: { breadcrumb?: ReactNode }) {
  const [values, setValues] = useState(defaultValues);

  const { error, input } = useMemo(() => validateValues(values), [values]);
  const convertedRate = useMemo(() => convertRate(input), [input]);

  const allPeriods = useMemo(
    () =>
      PERIOD_ORDER.map((period) => ({
        period,
        rate: convertRate({ rate: input.rate, fromPeriod: input.fromPeriod, toPeriod: period }),
      })),
    [input],
  );

  const exampleAmount = parseCurrency(values.amount);
  const dailyRate = allPeriods.find((row) => row.period === "daily")!.rate;
  const monthlyRate = allPeriods.find((row) => row.period === "monthly")!.rate;
  const annualRate = allPeriods.find((row) => row.period === "annual")!.rate;
  const dailyInterest = exampleAmount * (dailyRate / 100);
  const monthlyInterest = exampleAmount * (monthlyRate / 100);
  const annualInterest = exampleAmount * (annualRate / 100);

  const handleRateChange = (value: string) => {
    setValues((current) => ({ ...current, rate: value }));
  };

  const handleAmountChange = (value: string) => {
    setValues((current) => ({ ...current, amount: maskCurrency(value) }));
  };

  const handlePeriodChange = (key: "fromPeriod" | "toPeriod", value: string) => {
    setValues((current) => ({ ...current, [key]: value as RatePeriod }));
  };

  const handleSwap = () => {
    setValues((current) => ({
      ...current,
      fromPeriod: current.toPeriod,
      toPeriod: current.fromPeriod,
    }));
  };

  return (
    <main className={styles.main}>
      {breadcrumb}
      <h1 className={styles.title}>
        Conversor de taxas: converta taxas de juros entre períodos diferentes
      </h1>

      <Accordion summary="Entenda como funciona o cálculo">
        <div className={styles.introText}>
          <p>
            Quer saber como calcular a taxa equivalente entre períodos diferentes? Taxas
            equivalentes geram o mesmo rendimento acumulado em um mesmo intervalo de tempo, ao
            contrário das taxas proporcionais, que apenas multiplicam ou dividem o valor nominal.
            Por isso, converter uma taxa mensal em anual (ou o contrário) exige uma fórmula
            exponencial, e não uma simples regra de três.
          </p>
          <p>
            Para calcular a taxa equivalente manualmente, use a fórmula
            i(destino) = (1 + i(origem))^(dias do período de destino / dias do período de origem) − 1.
            Esta calculadora adota a convenção comercial de 30 dias por mês e 360 dias por ano, a
            mesma usada por bancos e financeiras no Brasil para calcular taxas de juros.
          </p>
          <p>
            Saber como converter taxas é útil para comparar o rendimento de um CDB que paga, por
            exemplo, 1% ao mês com a rentabilidade anual de outro investimento, entender a taxa
            efetiva de um cartão de crédito rotativo ou conferir se um financiamento está cobrando a
            taxa mensal ou anual informada no contrato. Informe a taxa, o período de referência e o
            período de destino para ver a taxa equivalente, e use o valor de exemplo para entender
            quanto isso representa em juros no dia, no mês e no ano.
          </p>
        </div>
      </Accordion>

      <section className={styles.simulation}>
        <div className={styles.form}>
          <p className={styles.eyebrow}>Conversão</p>
          <h2 className={styles.sectionTitle}>Informe a taxa</h2>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="rate">
                Taxa de juros (%)
              </label>
              <div className={styles.inputGroup}>
                <input
                  id="rate"
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="1,25"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "rate-error" : undefined}
                  value={values.rate}
                  onChange={(event) => handleRateChange(event.target.value)}
                />
                <select
                  aria-label="Periodicidade da taxa"
                  className={styles.unitSelect}
                  value={values.fromPeriod}
                  onChange={(event) => handlePeriodChange("fromPeriod", event.target.value)}
                >
                  {PERIOD_ORDER.map((period) => (
                    <option key={period} value={period}>
                      {PERIOD_LABELS[period]}
                    </option>
                  ))}
                </select>
              </div>
              {error ? (
                <p id="rate-error" className={styles.errorMessage} role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="toPeriod">
                Converter para
              </label>
              <div className={styles.inputGroup}>
                <select
                  id="toPeriod"
                  aria-label="Converter para"
                  className={styles.unitSelect}
                  value={values.toPeriod}
                  onChange={(event) => handlePeriodChange("toPeriod", event.target.value)}
                >
                  {PERIOD_ORDER.map((period) => (
                    <option key={period} value={period}>
                      {PERIOD_LABELS[period]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.swapButton}
                  onClick={handleSwap}
                  aria-label="Inverter periodicidades"
                >
                  ⇄
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="amount">
                Valor de exemplo
              </label>
              <div className={styles.inputGroup}>
                <input
                  id="amount"
                  className={styles.input}
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={values.amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <aside className={styles.result}>
          <p className={styles.eyebrow}>Resultado</p>

          <div className={styles.highlight}>
            <p className={styles.metricLabel}>
              Taxa {PERIOD_LABELS[values.toPeriod].toLowerCase()} equivalente
            </p>
            <p className={styles.highlightValue}>{percent.format(convertedRate)}%</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Juros no dia</p>
              <p className={styles.metricValue}>{currency.format(dailyInterest)}</p>
            </div>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Juros no mês</p>
              <p className={styles.metricValue}>{currency.format(monthlyInterest)}</p>
            </div>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Juros no ano</p>
              <p className={styles.metricValue}>{currency.format(annualInterest)}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.comparison}>
        <p className={styles.eyebrow}>Todas as periodicidades</p>
        <h2 className={styles.sectionTitle}>Taxa equivalente em cada período</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Taxa equivalente</th>
              </tr>
            </thead>
            <tbody>
              {allPeriods.map((row) => (
                <tr key={row.period}>
                  <td>{PERIOD_LABELS[row.period]}</td>
                  <td>{percent.format(row.rate)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
