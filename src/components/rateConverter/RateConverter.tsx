"use client";

import { useMemo, useState, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import Faq, { type FaqItem } from "@/components/faq/Faq";
import RelatedTools from "@/components/relatedTools/RelatedTools";
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

const faqItems: FaqItem[] = [
  {
    question: "Posso multiplicar uma taxa mensal por 12 para obter a anual?",
    answer:
      "Não quando você precisa da taxa efetiva equivalente. A multiplicação produz uma taxa proporcional e ignora os juros sobre juros acumulados ao longo dos meses.",
  },
  {
    question: "Qual é a diferença entre taxa nominal e taxa efetiva?",
    answer:
      "A taxa nominal é uma referência declarada e pode não incorporar a capitalização dentro do período. A taxa efetiva representa o rendimento ou custo realmente acumulado após essa capitalização.",
  },
  {
    question: "Por que o conversor usa meses de 30 dias e anos de 360 dias?",
    answer:
      "A ferramenta adota a convenção comercial 30/360 para manter uma base consistente entre taxas diárias, mensais e anuais. Um contrato pode usar outra convenção, que deve prevalecer na análise.",
  },
  {
    question: "Quando é útil converter taxas equivalentes?",
    answer:
      "A conversão ajuda a comparar investimentos, empréstimos e financiamentos divulgados em períodos diferentes, desde que as taxas tenham a mesma natureza e condições comparáveis.",
  },
];

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

      <Accordion summary="Entenda como funciona o cálculo">
        <div className={styles.introText}>
          <p>
            Taxas equivalentes produzem o mesmo crescimento acumulado quando comparadas no mesmo
            intervalo. Elas são diferentes das taxas proporcionais, obtidas apenas ao multiplicar
            ou dividir uma taxa, porque consideram a capitalização dos juros entre os períodos.
          </p>
          <div>
            <p>A conversão usa a fórmula:</p>
            <p className={styles.formula}>
              i<sub>destino</sub> = (1 + i<sub>origem</sub>)<sup>d<sub>destino</sub> ÷ d<sub>origem</sub></sup> − 1
            </p>
            <ul className={styles.definitionList}>
              <li><strong>i origem</strong>: taxa informada, convertida para decimal.</li>
              <li><strong>i destino</strong>: taxa equivalente que será calculada.</li>
              <li><strong>d origem</strong>: número de dias do período da taxa informada.</li>
              <li><strong>d destino</strong>: número de dias do período desejado.</li>
            </ul>
          </div>
          <p>
            A ferramenta usa a convenção comercial 30/360: um dia vale 1 dia, um mês vale 30 dias e
            um ano vale 360 dias. Assim, uma conversão mensal para anual eleva o fator mensal à 12ª
            potência. Compare sempre taxas com condições equivalentes e confira a convenção prevista
            no contrato ou produto financeiro.
          </p>
          <div className={styles.example}>
            <h3>Exemplo prático</h3>
            <p>
              Uma taxa de 2,8% ao mês equivale a aproximadamente 39,29% ao ano, pois
              (1 + 0,028)¹² − 1 = 0,3929. Sobre R$ 1.000, isso representa R$ 28,00 de juros no mês
              e R$ 392,89 no ano equivalente, sem considerar impostos ou custos.
            </p>
          </div>
        </div>
      </Accordion>

      <RelatedTools slugs={["compound-interest", "real-interest-rate", "loan-total-cost"]} />
      <Faq items={faqItems} />
    </main>
  );
}
