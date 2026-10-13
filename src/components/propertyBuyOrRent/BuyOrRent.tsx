"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import AdSlot from "@/components/advertising/AdSlot";
import FieldLabel from "@/components/fieldLabel/FieldLabel";
import Faq from "@/components/faq/Faq";
import RelatedTools from "@/components/relatedTools/RelatedTools";
import ShareContent from "@/components/share/ShareContent";
import useCalculation from "@/hooks/useCalculation";
import { buyOrRentFaqItems } from "@/config/faq";
import { currency, formatCompactCurrency, maskCurrency, parseCurrency } from "@/utils/currency";
import { calculateBuyOrRent, defaultBuyOrRentInput, validateBuyOrRent } from "./calculateBuyOrRent";
import { buildHousingChart, HOUSING_CHART } from "./housingChart";
import styles from "./BuyOrRent.module.scss";

type NumericField = {
  [K in keyof typeof defaultBuyOrRentInput]: typeof defaultBuyOrRentInput[K] extends number ? K : never
}[keyof typeof defaultBuyOrRentInput];

type Field = { key: NumericField; label: string; help: string; money?: boolean };

const purchaseFields: Field[] = [
  { key: "propertyPrice", label: "Valor do imóvel", money: true, help: "Exemplo inicial: R$ 300.000. É a base dos percentuais de ITBI, cartório e manutenção, além da valorização. Entrada e aluguel são valores independentes e não mudam automaticamente quando você altera o preço. Limite de R$ 1 bilhão." },
  { key: "downPayment", label: "Entrada", money: true, help: "No exemplo, 20% de R$ 300.000 = R$ 60.000; os 80% restantes (R$ 240.000) são financiados. Edite o valor conforme a proposta. 20% não é uma regra universal. Informe o preço total para compra à vista." },
  { key: "loanYears", label: "Prazo do financiamento (anos)", help: "Exemplo: 20 anos × 12 = 240 parcelas. No SAC, R$ 240.000 ÷ 240 = R$ 1.000 de amortização mensal, além dos juros. Edite entre 1 e 35 anos inteiros; a comparação pode terminar antes ou depois da quitação." },
  { key: "loanAnnualRate", label: "Juros do financiamento (% ao ano)", help: "Exemplo: 4,5% nominal ao ano ÷ 12 = 0,375% ao mês. Sobre R$ 240.000, os primeiros juros são R$ 900; com R$ 1.000 de amortização SAC, a primeira prestação é R$ 1.900, sem extras. Não presume elegibilidade ao MCMV. Não usamos 1,5% do preço como regra de prestação. Confira a taxa do banco; CET e indexadores não são a mesma coisa." },
  { key: "propertyAnnualGrowth", label: "Valorização do imóvel (% ao ano)", help: "Hipótese adicional editável de 4% ao ano: R$ 300.000 × 1,04 = R$ 312.000 após um ano. A evolução mensal usa a taxa equivalente. Aceita de −20% a 30%, inclusive desvalorização; não é previsão nem garantia." },
];

const purchaseCosts: Field[] = [
  { key: "itbiPercent", label: "ITBI estimado (% do imóvel)", help: "Exemplo informado para Curitiba: 2,7% × R$ 300.000 = R$ 8.100, pagos no início, não mensalmente. A base, alíquota e benefícios dependem do município e da operação; não usamos 8% como regra nacional. Edite de 0% a 20% conforme a prefeitura." },
  { key: "registrationPercent", label: "Cartório e outros custos iniciais (%)", help: "Hipótese do exemplo: 5% × R$ 300.000 = R$ 15.000 para cartório e outros custos de aquisição, sem ITBI. Não é tabela oficial nem média garantida. Substitua pelo orçamento real, de 0% a 20%; eventuais descontos devem ser considerados no valor informado." },
  { key: "salePercent", label: "Custo de venda ao final (%)", help: "Hipótese adicional de 6% do valor projetado na venda: para R$ 300.000, seriam R$ 18.000. Edite de 0% a 20% para corretagem e custos de saída. IR sobre ganho de capital não é calculado automaticamente; inclua uma estimativa se aplicável." },
  { key: "monthlyCondo", label: "Condomínio mensal da compra", money: true, help: "Exemplo: R$ 500 por mês, somados à prestação, IPTU e demais custos. É editável e não altera a locação. Despesas extraordinárias entram na manutenção ou nos extras, sem duplicar cobranças." },
  { key: "annualPropertyTax", label: "IPTU anual da compra", money: true, help: "Exemplo: R$ 350 por ano ÷ 12 = R$ 29,17 mensais para orçamento. Edite conforme o carnê. O rateio não presume parcelamento pela prefeitura nem altera o IPTU da locação." },
  { key: "annualMaintenancePercent", label: "Reserva anual para manutenção (%)", help: "Hipótese adicional de 1% ao ano sobre R$ 300.000 = R$ 3.000 anuais, ou R$ 250 por mês, com reajuste das despesas. Edite de 0% a 10% para manutenção recorrente. Não inclua aqui a mesma obra da reforma quinquenal." },
  { key: "renovationPercent", label: "Reforma a cada 5 anos (% do imóvel)", help: "Hipótese editável de 5% do valor projetado na data: sobre R$ 300.000 seriam R$ 15.000; com valorização, a base muda. Cobrada nos meses 60, 120, 180 etc., inclusive no fim da comparação. Edite de 0% a 100%; zero exclui a reforma. Não aumenta automaticamente o preço do imóvel." },
  { key: "monthlyOwnerExtras", label: "Seguros e extras mensais da compra", money: true, help: "Começa em zero porque o exemplo não informa esses encargos. Preencha seguros, tarifas e custos da proposta do banco não incluídos nos outros campos. O valor é reajustado anualmente; zero não significa que seu contrato não tenha despesas extras." },
];

const rentalFields: Field[] = [
  { key: "monthlyRent", label: "Aluguel mensal", money: true, help: "Referência aproximada fornecida: 0,5% a 1% do valor do imóvel por mês, não regra de mercado. Usamos 0,6% × R$ 300.000 = R$ 1.800, sem condomínio e IPTU. Edite livremente o valor com base numa oferta real do mesmo imóvel. Não é atualizado automaticamente pelo preço." },
  { key: "rentAnnualAdjustment", label: "Reajuste anual do aluguel (%)", help: "Hipótese adicional de 5% ao ano: R$ 1.800 × 1,05 = R$ 1.890 após 12 meses. Edite de −20% a 30%; vale o contrato e a negociação, não uma garantia dessa taxa." },
];

const rentalCosts: Field[] = [
  { key: "monthlyRenterCondo", label: "Condomínio mensal da locação", money: true, help: "Exemplo: R$ 500 mensais de despesas ordinárias, como na compra do mesmo imóvel. Edite conforme a locação. O campo é independente e não inclui despesas extraordinárias de responsabilidade do proprietário." },
  { key: "annualRenterPropertyTax", label: "IPTU anual da locação", money: true, help: "Exemplo: R$ 350 ÷ 12 = R$ 29,17 por mês. Somado a R$ 1.800 de aluguel e R$ 500 de condomínio, resulta em R$ 2.329,17 de moradia inicial. Só é cobrado do locatário quando previsto no contrato. Edite sem alterar a compra." },
  { key: "monthlyRenterExtras", label: "Extras mensais da locação", money: true, help: "Seguro, garantia locatícia ou provisão para pequenos reparos e mudanças. Não inclui aluguel, condomínio, IPTU nem caução." },
  { key: "rentalDeposit", label: "Caução em dinheiro", money: true, help: "Exemplo: três aluguéis × R$ 1.800 = R$ 5.400 bloqueados, não despesa mensal. Edite até o limite legal de três aluguéis ou use zero para outra garantia, colocando seus custos nos extras. Presumimos devolução integral, sem débitos. Não acompanha automaticamente mudanças no aluguel." },
  { key: "depositAnnualRate", label: "Rendimento da caução (% ao ano)", help: "Hipótese adicional de 6% ao ano: R$ 5.400 × 1,06 = R$ 5.724 em um ano. Edite de 0% a 30%. A caução em dinheiro deve ficar em poupança, cuja remuneração real varia; esse rendimento é separado da carteira." },
];

const comparisonFields: Field[] = [
  { key: "horizonYears", label: "Prazo da comparação (anos)", help: "Tempo de moradia comparado, de 1 a 50 anos inteiros. No fim, descontamos dívida e custos de venda do imóvel." },
  { key: "investmentAnnualRate", label: "Retorno líquido dos investimentos (% ao ano)", help: "O exemplo de 0,7% ao mês equivale a aproximadamente 8,731066% ao ano: ((1 + 0,007)^12 − 1) × 100, não 0,7 × 12. Edite a taxa anual líquida de impostos e custos, de −20% a 30%. É hipótese, não rendimento garantido, e serve só para as sobras dos cenários de moradia." },
  { key: "costAnnualAdjustment", label: "Reajuste anual das despesas (%)", help: "Hipótese adicional de 4% ao ano: uma despesa de R$ 500 passa a R$ 520 depois de 12 meses. Edite de −20% a 30% para custos recorrentes dos dois cenários. Não reajusta reforma, cuja base é o imóvel na data." },
  { key: "monthlyIncome", label: "Renda familiar mensal", money: true, help: "Usada apenas para contextualizar a primeira prestação e o custo inicial de moradia. Use zero para não comparar. Não é análise de crédito nem critério automático de aprovação." },
];

const fields = [...purchaseFields, ...purchaseCosts, ...rentalFields, ...rentalCosts, ...comparisonFields];
const initialValues = fields.reduce<Record<string, string>>((values, field) => {
  const value = defaultBuyOrRentInput[field.key];
  values[field.key] = field.money ? currency.format(value) : String(value);
  return values;
}, {});

export default function BuyOrRent({ breadcrumb }: { breadcrumb?: ReactNode }) {
  const [values, setValues] = useState(initialValues);
  const [amortization, setAmortization] = useState<"sac" | "price">("sac");
  const [loanRateType, setLoanRateType] = useState<"nominal" | "effective">("nominal");
  const [renterPaysPropertyTax, setRenterPaysPropertyTax] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const draftInput = fields.reduce((result, field) => {
    const raw = values[field.key];
    const value = field.money ? parseCurrency(raw)
      : /^-?\d+(?:[.,]\d{1,6})?$/.test(raw.trim()) ? Number(raw.replace(",", ".")) : NaN;
    return { ...result, [field.key]: value };
  }, { ...defaultBuyOrRentInput, amortization, loanRateType, renterPaysPropertyTax });
  const errors = validateBuyOrRent(draftInput);
  const hasErrors = Object.keys(errors).length > 0;
  const { result, calculatedInput: input, calculationError, runCalculation } = useCalculation({
    input: draftInput, valid: !hasErrors, calculate: calculateBuyOrRent, toolId: "comprar-ou-alugar",
  });
  const chart = result ? buildHousingChart(result.evolution) : null;
  const chartPoint = result?.evolution[Math.min(selectedMonth ?? result.final.month, result.final.month)];
  const selectChartMonth = (event: PointerEvent<SVGSVGElement>) => {
    if (!result) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const x = (event.clientX - bounds.left) / bounds.width * HOUSING_CHART.width;
    setSelectedMonth(Math.max(0, Math.min(result.final.month, Math.round(
      (x - HOUSING_CHART.left) / (HOUSING_CHART.width - HOUSING_CHART.left - HOUSING_CHART.right) * result.final.month,
    ))));
  };
  const renderFields = (list: Field[]) => (
    <div className={styles.fields}>
      {list.map((field) => {
        const id = `housing-${field.key}`;
        return (
          <div className={styles.field} key={field.key}>
            <FieldLabel htmlFor={id} label={field.label} tooltipText={field.help} />
            <input id={id} className={styles.input} inputMode={field.money ? "numeric" : "decimal"}
              value={values[field.key]} aria-invalid={Boolean(errors[field.key])}
              aria-describedby={`${id}-tooltip${errors[field.key] ? ` ${id}-error` : ""}`}
              onChange={(event) => setValues({ ...values,
                [field.key]: field.money ? maskCurrency(event.target.value) : event.target.value,
              })} />
            {errors[field.key] && <p id={`${id}-error`} className={styles.error}>{errors[field.key]}</p>}
          </div>
        );
      })}
    </div>
  );

  return (
    <main className={styles.main} data-analytics-tool="comprar-ou-alugar">
      {breadcrumb}
      <h1>Comprar x Alugar Imóvel</h1>
      <p>Compare morar em imóvel próprio com alugar um equivalente e investir.
        Ajuste as hipóteses à sua realidade: os valores iniciais são exemplos, não ofertas de crédito.</p>
      <section className={styles.notice} aria-labelledby="housing-personal">
        <h2 id="housing-personal">A melhor conta não é necessariamente a sua melhor escolha</h2>
        <p>Uma boa decisão matemática não é necessariamente a SUA melhor escolha.
          Realização pessoal, segurança, liberdade e flexibilidade também têm valor.</p>
        <p>Sua decisão HOJE usa as informações que você possui HOJE e o que acredita sobre o FUTURO.
          Isso não garante que ela será a melhor ou a mais importante decisão da sua vida.
          Você pode rever o plano quando suas prioridades ou as condições mudarem.</p>
      </section>

      <section className={styles.form} aria-labelledby="housing-purchase-inputs" data-analytics-input>
        <h2 id="housing-purchase-inputs">1. Compra do imóvel</h2>
        <p>Preço, financiamento e despesas de quem será proprietário.</p>
        {renderFields(purchaseFields)}
        <div className={styles.fields}>
          <div className={styles.field}>
            <FieldLabel htmlFor="housing-amortization" label="Sistema de amortização"
              tooltipText="SAC devolve uma parte constante do valor emprestado e tem prestações decrescentes. Price mantém a prestação de principal e juros constante. Seguros e outros encargos ficam separados." />
            <select id="housing-amortization" className={styles.input} value={amortization}
              aria-describedby="housing-amortization-tooltip"
              onChange={(event) => setAmortization(event.target.value === "sac" ? "sac" : "price")}>
              <option value="sac">SAC</option><option value="price">Price</option>
            </select>
          </div>
          <div className={styles.field}>
            <FieldLabel htmlFor="housing-rate-type" label="Tipo da taxa do financiamento"
              tooltipText="Nominal anual: dividimos por 12. Efetiva anual: calculamos a taxa mensal equivalente. Confira a convenção informada pelo banco; elas não produzem a mesma prestação." />
            <select id="housing-rate-type" className={styles.input} value={loanRateType}
              aria-describedby="housing-rate-type-tooltip"
              onChange={(event) => setLoanRateType(event.target.value === "nominal" ? "nominal" : "effective")}>
              <option value="nominal">Nominal anual (÷ 12)</option>
              <option value="effective">Efetiva anual (equivalente)</option>
            </select>
          </div>
        </div>
        <h3>Custos da compra</h3>
        {renderFields(purchaseCosts)}
      </section>
      <section className={styles.form} aria-labelledby="housing-rental-inputs" data-analytics-input>
        <h2 id="housing-rental-inputs">2. Aluguel do mesmo imóvel</h2>
        <p>Informe a locação de um imóvel com as mesmas características.
          Seus custos são separados dos campos da compra.</p>
        {renderFields(rentalFields)}
        <h3>Custos da locação</h3>
        {renderFields(rentalCosts)}
          <label className={styles.checkbox}><input type="checkbox" checked={renterPaysPropertyTax}
            onChange={(event) => setRenterPaysPropertyTax(event.target.checked)} />
            O contrato de locação atribui o IPTU ao locatário</label>
      </section>
      <section className={styles.form} aria-labelledby="housing-comparison-inputs" data-analytics-input>
        <h2 id="housing-comparison-inputs">3. Premissas da comparação de moradia</h2>
        {renderFields(comparisonFields)}
        <p>O retorno financeiro serve apenas para considerar as sobras do orçamento.
          Esta página não compara comprar imóvel para renda com investir em FII de tijolo.</p>
        <p className={styles.note}>Valores nominais, sem correção do poder de compra.
          Juros e retornos são constantes; reajustes de aluguel e despesas ocorrem a cada 12 meses.</p>
        <div className="form-actions">
          <button type="button" className="button-primary interactive" data-analytics-simulation-interaction
            onClick={() => {
              if (!runCalculation()) return;
              setSelectedMonth(null);
            }}>
            Calcular
          </button>
          {calculationError && <p role="alert">{calculationError}</p>}
        </div>
      </section>

      {hasErrors && <p role="alert" className={styles.error}>Revise os campos para calcular:
        {" "}{fields.filter((field) => errors[field.key]).map((field) => `${field.label}: ${errors[field.key]}`).join(" ")}</p>}
      {result && (
        <section className={styles.results} aria-labelledby="housing-results">
          <h2 id="housing-results">Comparação em {input.horizonYears} anos</h2>
          <p className={styles.highlight} role="status" aria-label="Resultado da comparação">
            {Math.abs(result.difference) < 0.01 ? "Patrimônios projetados equivalentes."
              : `Maior patrimônio projetado: ${result.difference > 0 ? "comprar" : "alugar e investir"}.`}
            {" "}Diferença: {currency.format(Math.abs(result.difference))}.
          </p>
          <p>Isso não é uma recomendação. O resultado depende das hipóteses e de investir as sobras
            com disciplina — não considera o valor emocional de cada escolha.</p>
          <div className={styles.comparison}>
            <section aria-labelledby="housing-buy">
              <h3 id="housing-buy">Comprar e investir a sobra</h3>
              <dl>
                <div><dt>Patrimônio líquido projetado</dt><dd>{currency.format(result.final.buyNetWorth)}</dd></div>
                <div><dt>Valor estimado do imóvel</dt><dd>{currency.format(result.final.propertyValue)}</dd></div>
                <div><dt>Saldo devedor ao final</dt><dd>{currency.format(result.final.debt)}</dd></div>
                <div><dt>Custo estimado de venda</dt><dd>{currency.format(result.final.propertyValue * input.salePercent / 100)}</dd></div>
                <div><dt>Carteira de investimentos ao final</dt><dd>{currency.format(result.final.buyInvestments)}</dd></div>
                <div><dt>Entrada + custos iniciais</dt><dd>{currency.format(result.buyUpfront)}</dd></div>
                <div><dt>ITBI + cartório e outros custos iniciais</dt><dd>{currency.format(result.acquisitionCosts)}</dd></div>
                <div><dt>Primeira prestação (sem extras)</dt><dd>{currency.format(result.firstInstallment)}</dd></div>
                <div><dt>Juros da primeira prestação</dt><dd>{currency.format(result.evolution[1].interest)}</dd></div>
                <div><dt>Amortização da primeira prestação</dt><dd>{currency.format(result.evolution[1].amortized)}</dd></div>
                <div><dt>Moradia no primeiro mês</dt><dd>{currency.format(result.firstBuyCost)}</dd></div>
                <div><dt>Juros pagos no período</dt><dd>{currency.format(result.totalInterest)}</dd></div>
                <div><dt>Reformas a cada 5 anos no período</dt><dd>{currency.format(result.totalRenovations)}</dd></div>
              </dl>
              <p>Patrimônio = imóvel − custo de venda − dívida + investimentos.
                A amortização reduz a dívida; não é toda uma despesa de juros.</p>
            </section>
            <section aria-labelledby="housing-rent">
              <h3 id="housing-rent">Alugar e investir a sobra</h3>
              <dl>
                <div><dt>Patrimônio líquido projetado</dt><dd>{currency.format(result.final.rentNetWorth)}</dd></div>
                <div><dt>Carteira de investimentos ao final</dt><dd>{currency.format(result.final.rentInvestments)}</dd></div>
                <div><dt>Caução corrigida a recuperar</dt><dd>{currency.format(result.final.deposit)}</dd></div>
                <div><dt>Investimento disponível no início</dt><dd>{currency.format(result.initialCapital - input.rentalDeposit)}</dd></div>
                <div><dt>Caução inicial bloqueada</dt><dd>{currency.format(input.rentalDeposit)}</dd></div>
                <div><dt>Moradia no primeiro mês</dt><dd>{currency.format(result.firstRentCost)}</dd></div>
              </dl>
              <p>Patrimônio = investimentos + caução devolvida.
                Não comprar um imóvel não impede construir patrimônio financeiro.</p>
            </section>
          </div>
          <h3>Uma comparação com recursos iguais</h3>
          <p>Os dois cenários começam com {currency.format(result.initialCapital)}.
            A cada mês, usamos como orçamento o maior custo de moradia dos dois cenários.
            Quem gasta menos investe a diferença ao final do mês, inclusive após quitar o financiamento.
            Esse orçamento varia: o maior valor mensal projetado é {currency.format(result.maximumBudget)}.
            A simulação pressupõe que você consegue disponibilizar esse orçamento; não o limita à renda informada.</p>
          <p>Reformas são desembolsos pontuais da compra a cada cinco anos, não uma parcela mensal.
            Nesses meses, o orçamento igual também aumenta na locação e a diferença é investida.
            Planeje uma reserva para essas obras; não presumimos que elas aumentem o preço do imóvel.</p>
          {input.monthlyIncome > 0 && <p>A primeira prestação, sem extras, representa
            {" "}{(result.firstInstallment / input.monthlyIncome * 100).toFixed(1).replace(".", ",")}%
            da renda informada. O custo completo inicial de compra representa
            {" "}{(result.firstBuyCost / input.monthlyIncome * 100).toFixed(1).replace(".", ",")}%.
            Não é aprovação de crédito; avalie outras dívidas e uma reserva para imprevistos.</p>}
          {chart && chartPoint && (
            <figure className={styles.chart} aria-labelledby="housing-chart-caption">
              <h3>Patrimônio projetado: compra x aluguel</h3>
              <div className={styles.legend}><span className={styles.buyLegend}>Compra</span>
                <span className={styles.rentLegend}>Aluguel</span></div>
              <div className={styles.chartCanvas}>
              <svg viewBox={`0 0 ${HOUSING_CHART.width} ${HOUSING_CHART.height}`}
                role="img" aria-label="Evolução do patrimônio líquido na compra e no aluguel"
                tabIndex={0} aria-describedby="housing-chart-caption housing-chart-values"
                onPointerMove={selectChartMonth} onPointerDown={selectChartMonth}
                onKeyDown={(event) => {
                  const next = event.key === "ArrowRight" ? chartPoint.month + 1
                    : event.key === "ArrowLeft" ? chartPoint.month - 1
                    : event.key === "Home" ? 0 : event.key === "End" ? result.final.month : null;
                  if (next === null) return;
                  event.preventDefault();
                  setSelectedMonth(Math.max(0, Math.min(result.final.month, next)));
                }}>
                {chart.valueTicks.map((tick) => (
                  <g key={tick.value}><line className={styles.axis} x1={HOUSING_CHART.left}
                    x2={HOUSING_CHART.width - HOUSING_CHART.right} y1={tick.y.toFixed(2)} y2={tick.y.toFixed(2)} />
                    <text x={HOUSING_CHART.left - 10} y={(tick.y + 4).toFixed(2)} textAnchor="end">{formatCompactCurrency(tick.value)}</text></g>
                ))}
                {chart.ticks.map((tick) => <text key={tick.month} x={tick.x}
                  y={HOUSING_CHART.baseline + 24} textAnchor="middle">{tick.month / 12}</text>)}
                <text x={HOUSING_CHART.width / 2} y={HOUSING_CHART.height - 6} textAnchor="middle">Tempo (anos)</text>
                <polyline className={styles.buyLine} points={chart.buyLine} />
                <polyline className={styles.rentLine} points={chart.rentLine} />
                <line className={styles.marker} x1={chart.x(chartPoint.month)} x2={chart.x(chartPoint.month)}
                  y1={HOUSING_CHART.top} y2={HOUSING_CHART.baseline} />
                <circle className={styles.buyMarker} cx={chart.x(chartPoint.month)}
                  cy={chart.y(chartPoint.buyNetWorth)} r="4" />
                <circle className={styles.rentMarker} cx={chart.x(chartPoint.month)}
                  cy={chart.y(chartPoint.rentNetWorth)} r="4" />
              </svg>
              <div id="housing-chart-values" className={styles.chartTooltip}
                style={chartPoint.month > result.final.month / 2 ? { left: "16%" } : { right: "4%" }}>
                <strong>Mês {chartPoint.month}</strong>
                <span className={styles.buyLegend}>Compra: {currency.format(chartPoint.buyNetWorth)}</span>
                <span className={styles.rentLegend}>Aluguel: {currency.format(chartPoint.rentNetWorth)}</span>
                {chartPoint.renovation > 0 && <span>Reforma: {currency.format(chartPoint.renovation)}</span>}
              </div>
              </div>
              <figcaption id="housing-chart-caption">Patrimônio nominal líquido de dívida e custo de venda,
                incluindo sobras investidas, sem descontar a perda de poder de compra pela inflação.
                Passe o ponteiro ou toque para consultar os valores no gráfico.
                Com foco no gráfico, use as setas para mudar o mês e Home/End para início/fim.
                A tabela abaixo oferece os valores anuais.</figcaption>
            </figure>
          )}
          <Accordion summary="Evolução anual e saldo devedor">
            <div className={styles.tableWrapper}>
              <table>
                <caption>Patrimônio e despesas nominais; valores mensais são do último mês de cada ano.</caption>
                <thead><tr><th scope="col">Ano</th><th scope="col">Patrimônio: comprar</th>
                  <th scope="col">Patrimônio: alugar</th><th scope="col">Dívida</th>
                  <th scope="col">Moradia: comprar/mês</th><th scope="col">Moradia: alugar/mês</th>
                  <th scope="col">Reforma no mês</th></tr></thead>
                <tbody>{result.evolution.filter((point) => point.month % 12 === 0).map((point) => (
                  <tr key={point.month}><th scope="row">{point.month / 12}</th>
                    <td>{currency.format(point.buyNetWorth)}</td><td>{currency.format(point.rentNetWorth)}</td>
                    <td>{currency.format(point.debt)}</td>
                    <td>{point.month ? currency.format(point.buyMonthlyCost) : "—"}</td>
                    <td>{point.month ? currency.format(point.rentMonthlyCost) : "—"}</td>
                    <td>{currency.format(point.renovation)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Accordion>
        </section>
      )}

      <AdSlot />

      <section className={styles.content} aria-labelledby="housing-tradeoffs">
        <h2 id="housing-tradeoffs">Além da matemática: o que pesa para você?</h2>
        <div className={styles.comparison}>
          <section><h3>Alugar</h3><h4>Pontos favoráveis</h4>
            <ul><li>Mais flexibilidade para mudar de localização, trabalho e estilo de vida.</li>
              <li>Em geral, menor desembolso inicial e mais capital disponível.</li>
              <li>O proprietário responde por problemas estruturais e despesas extraordinárias, conforme a lei e a responsabilidade pelo dano.</li></ul>
            <h4>Pontos de atenção</h4><ul><li>O aluguel não gera propriedade, mas investir a diferença pode formar patrimônio.</li>
              <li>Reajustes, encerramento do contrato e mudanças podem gerar custos e insegurança; mudar constantemente não é inevitável.</li>
              <li>Reformas e uso do imóvel dependem do contrato e das regras legais e condominiais. Restrições não são ilimitadas.</li></ul>
          </section>
          <section><h3>Comprar</h3><h4>Pontos favoráveis</h4>
            <ul><li>Construção de patrimônio imobiliário à medida que a dívida é amortizada.</li>
              <li>Senso de pertencimento, realização pessoal e maior estabilidade de moradia.</li>
              <li>Mais liberdade para adaptar o espaço, respeitando legislação, condomínio e segurança.</li></ul>
            <h4>Pontos de atenção</h4><ul><li>Entrada, tributos e aquisição exigem recursos iniciais.</li>
              <li>Manutenção e reformas são responsabilidade do proprietário.</li>
              <li>Capital fica imobilizado; a venda pode demorar e o financiamento compromete renda por muitos anos.</li></ul>
          </section>
        </div>
        <p>Pense no tempo que pretende permanecer, na família, nos planos de carreira e no conforto
          com uma dívida. Comprar pode fazer sentido pessoal mesmo sem liderar a simulação.
          Alugar pode ser uma escolha consciente, não um fracasso.</p>
      </section>
      <section className={styles.content} aria-labelledby="housing-checklist">
        <h2 id="housing-checklist">Custos e regras que merecem conferência</h2>
        <ul>
          <li>Entrada, juros e limite de comprometimento de renda dependem do banco e do programa.
            Nem 20% de entrada, nem 30% da renda são condições universais. A prestação não é um percentual fixo do preço do imóvel.</li>
          <li>Minha Casa, Minha Vida tem critérios de elegibilidade, taxas e subsídios próprios.
            A hipótese de juros de 4,5% não presume que você tenha acesso a essa condição.</li>
          <li>ITBI é municipal. Consulte a prefeitura, a base de cálculo e eventuais benefícios.
            Cartório e avaliação são custos separados; não há percentual nacional de 5%.</li>
          <li>O art. 290 da Lei 6.015/1973 prevê redução de 50% dos emolumentos relacionados à
            primeira aquisição imobiliária residencial financiada pelo SFH. É regra federal, não exclusiva de Curitiba.
            Confirme os atos abrangidos e os requisitos no cartório; não é desconto automático em ITBI ou em toda despesa.</li>
          <li>Confira condomínio, atas e fundo de reserva. Despesas ordinárias e extraordinárias têm responsabilidades diferentes na locação.</li>
          <li>Em imóvel na planta, confira entrega das chaves, posse, contrato e regras aplicáveis a condomínio e IPTU.
            A cobrança não depende apenas de já estar morando no imóvel.</li>
          <li>Caução em dinheiro é limitada a três meses de aluguel e deve ser depositada em poupança,
            com os benefícios para o locatário. Aqui supomos restituição integral, sem dívidas ou danos.</li>
        </ul>
        <Accordion summary="Premissas, limitações e referências">
          <p>Financiamento sem indexação do saldo, subsídios, FGTS, amortizações extras ou renegociação.
            Seguros e tarifas são estimativas em campo separado. Manutenção recorrente é uma provisão com reajuste.
            A reforma quinquenal é adicional, calculada sobre o valor projetado do imóvel no mês da obra,
            inclusive se coincidir com o fim da comparação. IPTU anual é rateado para planejamento.</p>
          <p>O retorno dos investimentos deve ser líquido. A eventual tributação da venda não é
            calculada por legislação, pois depende de custo de aquisição, isenções e outras condições.
            O percentual de saída é apenas uma estimativa. Valores são nominais; os imóveis comparados
            são considerados equivalentes. Não modelamos vacância ou aluguel recebido: o objetivo é moradia.</p>
          <p>Taxas e crescimento constantes não reproduzem todas as condições futuras. Investimentos
            podem perder valor; imóvel não tem liquidez imediata. O capital projetado exige poupar as sobras.</p>
          <ul>
            <li><a href="https://www.planalto.gov.br/ccivil_03/leis/l8245.htm" target="_blank" rel="noopener noreferrer">Lei do Inquilinato: encargos e caução</a></li>
            <li><a href="https://www.planalto.gov.br/ccivil_03/leis/l6015compilada.htm" target="_blank" rel="noopener noreferrer">Lei de Registros Públicos: art. 290</a></li>
            <li><a href="https://www.curitiba.pr.gov.br/servicos/itbi-base-de-calculo-e-aliquotas/administracao-regional-pinheirinho/512" target="_blank" rel="noopener noreferrer">Prefeitura de Curitiba: ITBI, base e alíquotas</a></li>
            <li><a href="https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida" target="_blank" rel="noopener noreferrer">Ministério das Cidades: Minha Casa, Minha Vida</a></li>
          </ul>
        </Accordion>
      </section>
      <Faq items={buyOrRentFaqItems} />
      <RelatedTools slugs={["imovel-ou-fii", "juros-compostos", "primeiro-milhao", "conversor-de-taxas"]} />
      <ShareContent path="/comprar-ou-alugar/" title="Comprar x Alugar Imóvel" />
    </main>
  );
}
