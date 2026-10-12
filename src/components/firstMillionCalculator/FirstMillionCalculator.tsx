"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import AdSlot from "@/components/advertising/AdSlot";
import FieldLabel from "@/components/fieldLabel/FieldLabel";
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
            <div className={styles.field}>
              <FieldLabel htmlFor="million-initial" label="Patrimônio inicial"
                tooltipText="Valor que você já tem investido ou aplicará no início do plano, separado dos aportes mensais. Se estiver começando do zero, deixe R$ 0,00. Se já tiver R$ 1 milhão, a meta será considerada alcançada." />
              <input id="million-initial" className={styles.input} inputMode="decimal"
                aria-describedby="million-initial-tooltip"
                value={initialAmount} onChange={(event) => setInitialAmount(maskCurrency(event.target.value))} />
            </div>
            {mode === "time" ? (
              <div className={styles.field}>
                <FieldLabel htmlFor="million-contribution" label="Aporte mensal"
                  tooltipText="Quantia que você pretende investir ao final de cada mês até alcançar R$ 1 milhão. Informe um valor que possa manter regularmente. Deixe R$ 0,00 para simular apenas o crescimento do patrimônio inicial." />
                <input id="million-contribution" className={styles.input} inputMode="decimal"
                  aria-describedby="million-contribution-tooltip"
                  value={contribution} onChange={(event) => setContribution(maskCurrency(event.target.value))} />
              </div>
            ) : (
              <div className={styles.field}>
                <FieldLabel htmlFor="million-duration" label="Prazo desejado"
                  tooltipText="Em quanto tempo você deseja alcançar R$ 1 milhão. Informe um número inteiro e escolha Anos ou Meses. Para 1 ano e 6 meses, selecione Meses e digite 18. O limite é de 100 anos ou 1200 meses; o prazo deve ser maior que zero." />
                <div className={styles.inputGroup}>
                  <input id="million-duration" className={styles.input} inputMode="numeric"
                    value={duration} onChange={(event) => setDuration(event.target.value)}
                    aria-invalid={Boolean(durationError)} aria-describedby={`million-duration-tooltip${durationError ? " million-duration-error" : ""}`} />
                  <select className={styles.input} aria-label="Unidade do prazo" value={durationUnit}
                    aria-describedby="million-duration-tooltip"
                    onChange={(event) => setDurationUnit(event.target.value === "years" ? "years" : "months")}>
                    <option value="years">Anos</option><option value="months">Meses</option>
                  </select>
                </div>
                {durationError && <p id="million-duration-error" role="alert" className={styles.error}>{durationError}</p>}
              </div>
            )}
            <div className={styles.field}>
              <FieldLabel htmlFor="million-rate" label="Taxa de juros (%)"
                tooltipText="Rentabilidade efetiva estimada, sem o símbolo %. Exemplo: 10 para 10% ao ano, selecionando Anual. A taxa anual é convertida para a mensal equivalente, não dividida por 12. Use 0 para simular sem juros. A projeção usa taxa constante entre 0% e 100% e não desconta impostos, tarifas ou inflação." />
              <div className={styles.inputGroup}>
                <input id="million-rate" className={styles.input} inputMode="decimal" value={rate}
                  onChange={(event) => setRate(event.target.value)} aria-invalid={Boolean(rateError)}
                  aria-describedby={`million-rate-tooltip million-rate-help${rateError ? " million-rate-error" : ""}`} />
                <select className={styles.input} aria-label="Periodicidade da taxa" value={ratePeriod}
                  aria-describedby="million-rate-tooltip"
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
                <h2><FieldLabel id="million-main-result"
                  label={mode === "time" ? "Tempo até o primeiro milhão" : "Aporte mensal necessário"}
                  tooltipText={mode === "time"
                    ? "Primeiro mês em que o patrimônio chega a R$ 1 milhão ou o ultrapassa. Se a meta já foi alcançada, o tempo é zero. Cenários impossíveis ou acima do limite de 100 anos são indicados explicitamente."
                    : "Aporte fixo no fim de cada mês necessário para chegar a R$ 1 milhão dentro do prazo escolhido, arredondado para cima em centavos. Pode ser zero quando o patrimônio inicial já é suficiente ou cresce até a meta sem novos aportes."} /></h2>
                <p className={styles.highlightValue} aria-describedby="million-main-result-tooltip">
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
                <div><dt><FieldLabel id="million-final" label="Patrimônio projetado"
                  tooltipText="Saldo ao fim da simulação, somando capital, aportes e juros. Pode ultrapassar R$ 1 milhão porque o cálculo usa meses completos. Quando a meta não é atingida, mostra o saldo do cenário simulado." /></dt>
                  <dd aria-describedby="million-final-tooltip">{currency.format(result.finalAmount)}</dd></div>
                <div><dt><FieldLabel id="million-invested" label="Total investido"
                  tooltipText="Soma do patrimônio inicial com os aportes mensais até o fim da simulação. É o dinheiro investido por você, sem incluir os rendimentos." /></dt>
                  <dd aria-describedby="million-invested-tooltip">{currency.format(result.totalContributed)}</dd></div>
                <div><dt><FieldLabel id="million-returns" label="Rendimentos estimados"
                  tooltipText="Diferença entre o patrimônio projetado e o total investido. Representa os juros acumulados, sem descontar impostos, tarifas ou inflação e sem garantia de retorno." /></dt>
                  <dd aria-describedby="million-returns-tooltip">{currency.format(result.totalReturns)}</dd></div>
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
              <thead><tr>
                <th scope="col"><FieldLabel id="million-table-milestone" label="Marco"
                  tooltipText="Etapas de patrimônio de R$ 100 mil até R$ 1 milhão. Cada linha mostra quando o saldo atinge ou ultrapassa essa etapa." /></th>
                <th scope="col"><FieldLabel id="million-table-time" label="Tempo"
                  tooltipText="Primeiro mês em que o marco é alcançado. Já alcançado indica que o patrimônio inicial cobre essa etapa; Não atingido indica que ela fica fora do cenário simulado." /></th>
                <th scope="col"><FieldLabel id="million-table-invested" label="Total investido"
                  tooltipText="Capital inicial mais os aportes feitos até alcançar o marco desta linha, sem incluir os rendimentos." /></th>
              </tr></thead>
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

      <AdSlot />

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
      <RelatedTools slugs={["juros-compostos", "conversor-de-taxas", "comprar-ou-alugar", "goal-planner"]} />
      <ShareContent path="/primeiro-milhao/" title="Calculadora do primeiro milhão" />
    </main>
  );
}
