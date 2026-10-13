"use client";

import { useMemo, useState, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import AdSlot from "@/components/advertising/AdSlot";
import FieldLabel from "@/components/fieldLabel/FieldLabel";
import Faq from "@/components/faq/Faq";
import RelatedTools from "@/components/relatedTools/RelatedTools";
import ShareContent from "@/components/share/ShareContent";
import useCalculation from "@/hooks/useCalculation";
import { rateConverterFaqItems } from "@/config/faq";
import { currency, maskCurrency, parseCurrency } from "@/utils/currency";
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

const defaultValues: FormValues = {
  rate: "2,8",
  fromPeriod: "monthly",
  toPeriod: "annual",
  amount: maskCurrency("100000"),
};

function calculateConversion(input: RateConverterInput & { amount: number }) {
  return {
    convertedRate: convertRate(input),
    allPeriods: PERIOD_ORDER.map((period) => ({
      period,
      rate: convertRate({ rate: input.rate, fromPeriod: input.fromPeriod, toPeriod: period }),
    })),
  };
}

export default function RateConverter({ breadcrumb }: { breadcrumb?: ReactNode }) {
  const [values, setValues] = useState(defaultValues);

  const { error, input } = useMemo(() => validateValues(values), [values]);
  const amount = parseCurrency(values.amount);
  const { result, calculatedInput, calculationError, runCalculation } = useCalculation({
    input: { ...input, amount }, valid: !error,
    calculate: calculateConversion, toolId: "conversor-de-taxas",
    validateResult: (value) => Number.isFinite(value.convertedRate) &&
      value.allPeriods.every((row) => Number.isFinite(row.rate) && Number.isFinite(amount * (row.rate / 100))),
  });
  const { convertedRate, allPeriods } = result;
  const exampleAmount = calculatedInput.amount;
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
    <main className={styles.main} data-analytics-tool="conversor-de-taxas">
      {breadcrumb}
      <h1 className={styles.title}>Conversor de taxas</h1>

      <section className={styles.simulation}>
        <div className={styles.form} data-analytics-input>
          <p className={styles.eyebrow}>Conversão</p>
          <h2 className={styles.sectionTitle}>Informe a taxa</h2>

          <div className={styles.fields}>
            <div className={styles.field}>
              <FieldLabel htmlFor="rate" label="Taxa de juros (%)"
                tooltipText="Digite a taxa que deseja converter, sem o símbolo %. Exemplo: 12 para 12%. Ao lado, selecione o período original: Diário, Mensal ou Anual. Use 0 para uma taxa sem juros. A conversão usa juros compostos e a convenção de 30 dias por mês e 360 por ano." />
              <div className={styles.inputGroup}>
                <input
                  id="rate"
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="1,25"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={`rate-tooltip${error ? " rate-error" : ""}`}
                  value={values.rate}
                  onChange={(event) => handleRateChange(event.target.value)}
                />
                <select
                  aria-label="Periodicidade da taxa"
                  aria-describedby="rate-tooltip"
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
              <FieldLabel htmlFor="toPeriod" label="Converter para"
                tooltipText="Escolha o período em que deseja expressar a taxa equivalente: Diário, Mensal ou Anual. A taxa resultante mantém o mesmo efeito de capitalização. O botão ao lado inverte os períodos de origem e destino." />
              <div className={styles.inputGroup}>
                <select
                  id="toPeriod"
                  aria-label="Converter para"
                  aria-describedby="toPeriod-tooltip"
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
                  data-analytics-simulation-interaction
                >
                  ⇄
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <FieldLabel htmlFor="amount" label="Valor de exemplo"
                tooltipText="Quantia usada apenas para ilustrar o rendimento das taxas sobre um mesmo capital, sem aportes. Esse valor não altera a conversão da taxa. Se quiser ver apenas as porcentagens, deixe R$ 0,00." />
              <div className={styles.inputGroup}>
                <input
                  id="amount"
                  aria-describedby="amount-tooltip"
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
          <div className="form-actions">
            <button type="button" className="button-primary interactive" data-analytics-simulation-interaction
              onClick={runCalculation}>
              Calcular
            </button>
            {calculationError && <p role="alert">{calculationError}</p>}
          </div>
        </div>

        <aside className={styles.result}>
          <p className={styles.eyebrow}>Resultado</p>

          <div className={styles.highlight}>
            <FieldLabel id="converter-equivalent" label={`Taxa ${PERIOD_LABELS[calculatedInput.toPeriod].toLowerCase()} equivalente`}
              tooltipText="Taxa no período escolhido que mantém o mesmo crescimento acumulado da taxa original, considerando juros compostos e a convenção 30/360. A exibição é arredondada para duas casas decimais." />
            <p className={styles.highlightValue} aria-describedby="converter-equivalent-tooltip">{percent.format(convertedRate)}%</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <FieldLabel id="converter-day" label="Juros no dia"
                tooltipText="Rendimento do valor de exemplo durante um dia, usando a taxa diária equivalente. Não inclui novos aportes, impostos ou tarifas." />
              <p className={styles.metricValue} aria-describedby="converter-day-tooltip">{currency.format(dailyInterest)}</p>
            </div>
            <div className={styles.metric}>
              <FieldLabel id="converter-month" label="Juros no mês"
                tooltipText="Rendimento do valor de exemplo durante um mês comercial de 30 dias, usando a taxa mensal equivalente. Não inclui novos aportes, impostos ou tarifas." />
              <p className={styles.metricValue} aria-describedby="converter-month-tooltip">{currency.format(monthlyInterest)}</p>
            </div>
            <div className={styles.metric}>
              <FieldLabel id="converter-year" label="Juros no ano"
                tooltipText="Rendimento do valor de exemplo durante um ano comercial de 360 dias. Considera a capitalização contida na taxa anual equivalente, sem novos aportes, impostos ou tarifas." />
              <p className={styles.metricValue} aria-describedby="converter-year-tooltip">{currency.format(annualInterest)}</p>
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
                <th><FieldLabel id="converter-table-period" label="Período"
                  tooltipText="Periodicidade em que a taxa é expressa: um dia, um mês de 30 dias ou um ano de 360 dias." /></th>
                <th><FieldLabel id="converter-table-rate" label="Taxa equivalente"
                  tooltipText="Porcentagem equivalente à taxa original em cada período, calculada com juros compostos. Os valores exibidos são arredondados para duas casas decimais." /></th>
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

      <AdSlot />

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

      <RelatedTools slugs={["juros-compostos", "real-interest-rate", "loan-total-cost"]} />
      <Faq items={rateConverterFaqItems} />
      <ShareContent path="/conversor-de-taxas/" title="Conversor de Taxas de Juros" />
    </main>
  );
}
