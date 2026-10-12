"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import Faq from "@/components/faq/Faq";
import RelatedTools from "@/components/relatedTools/RelatedTools";
import ShareContent from "@/components/share/ShareContent";
import { firstMillionFaqItems } from "@/config/faq";
import { currency, formatCompactCurrency, maskCurrency, parseCurrency } from "@/utils/currency";
import { calculateFirstMillion, MILLION, MAX_MONTHS, type FirstMillionInput } from "./calculateFirstMillion";
import styles from "./FirstMillionCalculator.module.scss";
import { buildFirstMillionChart, CHART } from "./firstMillionChart";

export function formatDuration(months: number) {
  if (months === 0) return "Meta já alcançada";
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return [
    years ? `${years} ${years === 1 ? "ano" : "anos"}` : "",
    remaining ? `${remaining} ${remaining === 1 ? "mês" : "meses"}` : "",
  ].filter(Boolean).join(" e ");
}

export default function FirstMillionCalculator({ breadcrumb }: { breadcrumb?: ReactNode }) {
  const [mode, setMode] = useState<FirstMillionInput["mode"]>("time");
  const [initialAmount, setInitialAmount] = useState(maskCurrency("0"));
  const [contribution, setContribution] = useState(maskCurrency("100000"));
  const [rate, setRate] = useState("10");
  const [ratePeriod, setRatePeriod] = useState<"annual" | "monthly">("annual");
  const [duration, setDuration] = useState("20");
  const [durationUnit, setDurationUnit] = useState<"years" | "months">("years");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const rateValue = Number(rate.replace(",", "."));
  const rateError = !/^\d+(?:[.,]\d{1,6})?$/.test(rate.trim()) || !Number.isFinite(rateValue) ||
    rateValue < 0 || rateValue > 100
    ? "Informe uma taxa entre 0% e 100%, com até 6 casas decimais." : undefined;
  const months = Number(duration) * (durationUnit === "years" ? 12 : 1);
  const durationError = mode === "contribution" &&
    (!/^\d+$/.test(duration) || !Number.isInteger(months) || months < 1 || months > MAX_MONTHS)
    ? "Informe um prazo inteiro de 1 a 100 anos ou de 1 a 1200 meses." : undefined;
  const common = { initialAmount: parseCurrency(initialAmount), interestRate: rateValue, ratePeriod };
  const result = rateError || durationError ? null : calculateFirstMillion(
    mode === "time"
      ? { ...common, mode, monthlyContribution: parseCurrency(contribution) }
      : { ...common, mode, months },
  );
  const chart = result ? buildFirstMillionChart(result.evolution) : null;
  const hoveredPoint = hoveredMonth === null ? null : chart?.points[hoveredMonth];
  const handleChartPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (!result || width === 0) return;
    const x = (event.clientX - left) / width * CHART.width;
    const month = Math.round((x - CHART.left) /
      (CHART.width - CHART.left - CHART.right) * result.months);
    setHoveredMonth(Math.min(result.months, Math.max(0, month)));
  };

  return (
    <main className={styles.main}>
      {breadcrumb}
      <h1 className={styles.title}>Calculadora do primeiro milhão</h1>
      <p className={styles.description}>
        Planeje o caminho até R$ 1 milhão: estime o tempo com seus aportes ou descubra
        quanto investir por mês para atingir essa meta.
      </p>

      <section className={styles.simulation} aria-label="Simulação do primeiro milhão">
        <div className={styles.form} onChange={() => setHoveredMonth(null)}>
          <p className={styles.eyebrow}>Sua estratégia</p>
          <h2>Como você quer planejar?</h2>
          <fieldset className={styles.mode}>
            <legend>Objetivo da simulação</legend>
            <label><input type="radio" name="mode" checked={mode === "time"}
              onChange={() => setMode("time")} /> Descobrir o tempo</label>
            <label><input type="radio" name="mode" checked={mode === "contribution"}
              onChange={() => setMode("contribution")} /> Descobrir o aporte mensal</label>
          </fieldset>
          <div className={styles.fields}>
            <label className={styles.field} htmlFor="million-initial">Patrimônio inicial
              <input id="million-initial" className={styles.input} inputMode="decimal"
                value={initialAmount} onChange={(event) => setInitialAmount(maskCurrency(event.target.value))} />
            </label>
            {mode === "time" ? (
              <label className={styles.field} htmlFor="million-contribution">Aporte mensal
                <input id="million-contribution" className={styles.input} inputMode="decimal"
                  value={contribution} onChange={(event) => setContribution(maskCurrency(event.target.value))} />
              </label>
            ) : (
              <div className={styles.field}>
                <label htmlFor="million-duration">Prazo desejado</label>
                <div className={styles.inputGroup}>
                  <input id="million-duration" className={styles.input} inputMode="numeric"
                    value={duration} onChange={(event) => setDuration(event.target.value)}
                    aria-invalid={Boolean(durationError)} aria-describedby={durationError ? "million-duration-error" : undefined} />
                  <select className={styles.input} aria-label="Unidade do prazo" value={durationUnit}
                    onChange={(event) => setDurationUnit(event.target.value === "years" ? "years" : "months")}>
                    <option value="years">Anos</option><option value="months">Meses</option>
                  </select>
                </div>
                {durationError && <p id="million-duration-error" role="alert" className={styles.error}>{durationError}</p>}
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="million-rate">Taxa de juros (%)</label>
              <div className={styles.inputGroup}>
                <input id="million-rate" className={styles.input} inputMode="decimal" value={rate}
                  onChange={(event) => setRate(event.target.value)} aria-invalid={Boolean(rateError)}
                  aria-describedby={rateError ? "million-rate-error" : "million-rate-help"} />
                <select className={styles.input} aria-label="Periodicidade da taxa" value={ratePeriod}
                  onChange={(event) => setRatePeriod(event.target.value === "annual" ? "annual" : "monthly")}>
                  <option value="annual">Anual</option><option value="monthly">Mensal</option>
                </select>
              </div>
              {rateError && <p id="million-rate-error" role="alert" className={styles.error}>{rateError}</p>}
              <p id="million-rate-help">Taxa efetiva constante. A anual é convertida para a mensal equivalente.</p>
            </div>
          </div>
          <p className={styles.note}>
            Aportes no fim de cada mês. Limite de projeção: 100 anos.
            Valores nominais, sem impostos, tarifas ou inflação.
          </p>
        </div>
        <aside className={styles.result} aria-label="Resultado da simulação" aria-live="polite">
          <p className={styles.eyebrow}>Meta: {currency.format(MILLION)}</p>
          {!result ? <p>Corrija os campos indicados para ver o resultado.</p> : (
            <>
              <div className={styles.highlight}>
                <h2>{mode === "time" ? "Tempo até o primeiro milhão" : "Aporte mensal necessário"}</h2>
                <p className={styles.highlightValue}>
                  {result.status === "reached"
                    ? mode === "time" ? formatDuration(result.months) : currency.format(result.monthlyContribution)
                    : result.status === "unreachable" ? "Meta não alcançável neste cenário" : "Meta não atingida em 100 anos"}
                </p>
                {result.status === "reached" && mode === "contribution" &&
                  <p>{formatDuration(result.months)}. O aporte é arredondado para cima em centavos.</p>}
                {result.status === "unreachable" && <p>Adicione aportes ou um capital inicial com rendimento positivo.</p>}
                {result.status === "limit" && <p>Aumente o aporte ou revise a taxa estimada para alcançar a meta no limite simulado.</p>}
              </div>
              <dl className={styles.metrics}>
                <div><dt>Patrimônio projetado</dt><dd>{currency.format(result.finalAmount)}</dd></div>
                <div><dt>Total investido</dt><dd>{currency.format(result.totalContributed)}</dd></div>
                <div><dt>Rendimentos estimados</dt><dd>{currency.format(result.totalReturns)}</dd></div>
              </dl>
            </>
          )}
        </aside>
      </section>

      {result && chart && result.months > 0 && (
        <section className={styles.evolution} aria-labelledby="million-evolution">
          <p className={styles.eyebrow}>Evolução do patrimônio</p>
          <h2 id="million-evolution">Montante x Tempo</h2>
          <figure className={styles.chart}>
            <div className={styles.chartCanvas}>
              <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img"
                aria-label={`Patrimônio projetado ao longo de ${result.months} meses: ${currency.format(result.finalAmount)}`}
                onPointerMove={handleChartPointerMove} onPointerLeave={() => setHoveredMonth(null)}>
                {chart.valueTicks.map((tick) => (
                  <g key={tick.value}>
                    <line className={styles.axis} x1={CHART.left} x2={CHART.width - CHART.right}
                      y1={tick.y} y2={tick.y} />
                    <text x={CHART.left - 10} y={tick.y + 4} textAnchor="end">
                      {formatCompactCurrency(tick.value)}
                    </text>
                  </g>
                ))}
                <line className={styles.goalLine} x1={CHART.left} x2={CHART.width - CHART.right}
                  y1={chart.goalY} y2={chart.goalY} />
                <text x={CHART.left} y="18">Meta: R$ 1 milhão</text>
                <polyline className={styles.chartLine} points={chart.line} />
                {hoveredPoint && (
                  <g>
                    <line className={styles.goalLine} x1={hoveredPoint.x} x2={hoveredPoint.x}
                      y1={CHART.top} y2={CHART.baseline} />
                    <circle className={styles.chartMarker} cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" />
                  </g>
                )}
                {chart.ticks.map((tick) => (
                  <text key={tick.month} x={tick.x} y={tick.y}
                    textAnchor={tick.month === result.months ? "end" : tick.month === 0 ? "start" : "middle"}>
                    {tick.label}
                  </text>
                ))}
                <text x="18" y="145" textAnchor="middle" transform="rotate(-90 18 145)">Montante (R$)</text>
                <text x={(CHART.left + CHART.width - CHART.right) / 2} y="310" textAnchor="middle">
                  Tempo ({chart.unit})
                </text>
              </svg>
              {hoveredPoint && (
                <div role="tooltip" className={styles.chartTooltip}
                  style={{
                    left: `${hoveredPoint.x / CHART.width * 100}%`,
                    top: `${hoveredPoint.y / CHART.height * 100}%`,
                    transform: `translate(${hoveredPoint.month > result.months / 2 ? "-100%" : "0"}, -110%)`,
                  }}>
                  <span>{hoveredPoint.month === 0 ? "Início" : formatDuration(hoveredPoint.month)}</span>
                  <strong>Montante: {currency.format(hoveredPoint.balance)}</strong>
                  <span>Total investido: {currency.format(hoveredPoint.contributed)}</span>
                </div>
              )}
            </div>
            <figcaption>
              Montante (R$) x Tempo ({chart.unit}). Passe o mouse sobre a curva para ver os valores mensais.
              Projeção com taxa e aportes constantes, não uma garantia de retorno.
            </figcaption>
          </figure>
          <div className={styles.tableWrapper}>
            <table>
              <caption>Marcos do patrimônio no cenário simulado</caption>
              <thead><tr><th scope="col">Marco</th><th scope="col">Tempo</th><th scope="col">Total investido</th></tr></thead>
              <tbody>{Array.from({ length: 10 }, (_, index) => (index + 1) * 100_000).map((target) => {
                const point = result.evolution.find((entry) => entry.balance >= target);
                return <tr key={target}><th scope="row">{currency.format(target)}</th>
                  <td>{point ? point.month === 0 ? "Já alcançado" : formatDuration(point.month) : "Não atingido"}</td>
                  <td>{point ? currency.format(point.contributed) : "—"}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </section>
      )}

      <section className={styles.explanation} aria-labelledby="million-how">
        <h2 id="million-how">Como calculamos o primeiro milhão?</h2>
        <Accordion summary="Entenda as fórmulas e as premissas">
          <p>A cada mês, o saldo anterior rende e o aporte é adicionado ao final:
            saldo novo = saldo anterior × (1 + taxa mensal) + aporte.</p>
          <p>A taxa anual efetiva é convertida por i = (1 + taxa anual / 100)^(1/12) − 1.
            Por isso, 12% ao ano não significa 1% ao mês nesta calculadora.</p>
          <p>Para calcular o aporte em n meses, usamos:
            aporte = [1.000.000 − capital inicial × (1 + i)^n] / [((1 + i)^n − 1) / i].
            Com taxa zero, dividimos o valor que falta pelo número de meses.</p>
          <p>Se o patrimônio inicial já alcança a meta, o tempo e o aporte necessário são zero.
            Se ele sozinho atingir a meta dentro do prazo, o aporte necessário também será zero.</p>
        </Accordion>
        <p>R$ 1 milhão no futuro não terá necessariamente o poder de compra de R$ 1 milhão hoje.
          Reavalie seu plano periodicamente. Esta ferramenta é educativa e não recomenda investimentos.</p>
      </section>
      <Faq items={firstMillionFaqItems} />
      <RelatedTools slugs={["juros-compostos", "conversor-de-taxas", "goal-planner"]} />
      <ShareContent path="/primeiro-milhao/" title="Calculadora do primeiro milhão" />
    </main>
  );
}
