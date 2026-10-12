"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import Accordion from "@/components/accordion/Accordion";
import FieldLabel from "@/components/fieldLabel/FieldLabel";
import Faq from "@/components/faq/Faq";
import RelatedTools from "@/components/relatedTools/RelatedTools";
import ShareContent from "@/components/share/ShareContent";
import { propertyVsFiiFaqItems } from "@/config/faq";
import { currency, formatCompactCurrency, maskCurrency, parseCurrency } from "@/utils/currency";
import { buildComparisonChart, COMPARISON_CHART as CHART } from "@/utils/comparisonChart";
import { calculatePropertyVsFii, propertyVsFiiDefaults, validatePropertyVsFii, type PropertyVsFiiInput } from "./calculatePropertyVsFii";
import styles from "./PropertyVsFii.module.scss";

type Field = { key: Exclude<keyof PropertyVsFiiInput, "mode">; label: string; help: string; money?: boolean };
const propertyFields: Field[] = [
  { key: "propertyPrice", label: "Preço da casa ou apartamento", money: true, help: "Compra à vista. Exemplo: R$ 300.000. O capital total inclui esse preço e os custos de aquisição; o FII recebe o mesmo orçamento." },
  { key: "acquisitionPercent", label: "Custos de aquisição do imóvel (%)", help: "Exemplo: 2,7% de ITBI + 5% estimados de cartório e outros custos = 7,7%, ou R$ 23.100. Edite com o orçamento real. Não é uma regra nacional; o capital inicial seria R$ 323.100." },
  { key: "monthlyRentPercent", label: "Aluguel bruto mensal (% do preço)", help: "Exemplo de imóvel para renda: 0,5% × R$ 300.000 = R$ 1.500 mensais antes de custos. Edite de 0% a 5%; não é renda garantida. O aluguel segue seu próprio reajuste, não a valorização do imóvel." },
  { key: "vacancyPercent", label: "Vacância e inadimplência média (%)", help: "Exemplo de 8,33% aproxima um mês sem receita por ano. Reduz o aluguel esperado, de 0% a 100%, sem eliminar os custos. É uma média mensal, não calendário de ocupação real." },
  { key: "administrationPercent", label: "Administração da imobiliária (%)", help: "Referência do exemplo: 5% a 10% do aluguel recebido. Usamos 10%: R$ 1.500 − R$ 150 = R$ 1.350 antes de vacância, despesas e imposto. A taxa só incide na receita após vacância." },
  { key: "annualMaintenancePercent", label: "Manutenção anual (% do preço)", help: "Hipótese de 1% do preço inicial por ano: R$ 3.000, distribuídos em R$ 250 mensais e reajustados anualmente. Reforma quinquenal é adicional; não duplique a mesma obra." },
  { key: "monthlyOwnerCosts", label: "Condomínio, IPTU e extras do proprietário", money: true, help: "Custo médio mensal que fica com o proprietário, inclusive na vacância. Começa em zero: preencha despesas extraordinárias, tributos não repassados, seguro e outros custos. Não confunda com valores pagos pelo inquilino." },
  { key: "renovationPercent", label: "Reforma a cada 5 anos (% do imóvel)", help: "Hipótese de 5% sobre o valor projetado nos meses 60, 120 etc., inclusive no término. Pode ser zerada. Não gera valorização extra; despesas de reforma não são deduzidas automaticamente do imposto do aluguel." },
  { key: "rentAnnualGrowth", label: "Reajuste anual do aluguel (%)", help: "Hipótese de 4% ao ano: R$ 1.500 passam a R$ 1.560 após 12 meses. Aceita −20% a 30%. Use condições reais do contrato e cenários conservadores." },
  { key: "costAnnualGrowth", label: "Reajuste anual das despesas (%)", help: "Hipótese de 4%, aplicada à manutenção recorrente e extras a cada 12 meses. Reforma usa o valor do imóvel na data e não recebe esse reajuste novamente." },
  { key: "propertyAnnualGrowth", label: "Valorização anual do imóvel (%)", help: "Hipótese de 4%: imóvel de R$ 300.000 seria R$ 312.000 após um ano. Não é renda recebida. Aceita desvalorização; não garante comprador nem venda nesse preço." },
  { key: "rentalTaxPercent", label: "IR efetivo estimado sobre aluguel recebido (%)", help: "Estimativa de imposto total dividida pelo aluguel recebido após vacância. Zero só se aplicável ao seu caso. Não é a alíquota marginal nem cálculo do Carnê-Leão: renda, deduções e regras vigentes alteram o imposto. Reforma/manutenção não são deduzidas automaticamente." },
  { key: "propertySalePercent", label: "Custos de venda do imóvel (%)", help: "Exemplo de 6% do valor projetado para corretagem e despesas. Edite conforme a operação; é separado do IR sobre eventual ganho." },
  { key: "propertyGainTaxPercent", label: "IR estimado sobre ganho na venda do imóvel (%)", help: "Exemplo simplificado de 15% sobre ganho positivo após custos de venda, considerando aquisição e reformas no custo. Não calcula faixas legais, isenções ou documentação de benfeitorias. Use zero apenas se aplicável e confirme com profissional." },
];
const fiiFields: Field[] = [
  { key: "fiiMonthlyYield", label: "Rendimento distribuído pelo FII (% ao mês)", help: "Hipótese de 0,7% ao mês sobre o valor das cotas. Para R$ 300.000, R$ 2.100 antes de imposto. Aqui o FII recebe também o orçamento dos custos do imóvel, portanto sua aplicação inicial pode ser maior. Vacância e taxas do fundo já devem estar refletidas nesse rendimento; não são descontadas de novo." },
  { key: "fiiAnnualGrowth", label: "Valorização anual das cotas (%)", help: "Hipótese de 4% ao ano, separada dos rendimentos distribuídos. Informe apenas a variação do preço, não retorno total, para evitar dupla contagem. Aceita −20% a 30%; cotas podem perder valor." },
  { key: "fiiEntryPercent", label: "Custos de compra das cotas (%)", help: "Percentual sobre o valor comprado, retirado do orçamento disponível, inclusive em reinvestimentos. Zero é hipótese: considere corretagem e emolumentos reais. Taxas internas do fundo já devem estar refletidas no rendimento." },
  { key: "fiiExitPercent", label: "Custos de venda das cotas (%)", help: "Custos estimados de negociação, descontados dos recursos da venda final. Não incluem IR sobre ganho, calculado separadamente." },
  { key: "fiiIncomeTaxPercent", label: "IR sobre rendimentos do FII (%)", help: "Zero representa uma hipótese de isenção aplicável à pessoa física quando os requisitos legais são cumpridos. Não é isenção universal. Informe tributação quando aplicável; a ferramenta não verifica enquadramento, cotistas ou participação." },
  { key: "fiiGainTaxPercent", label: "IR sobre ganho na venda das cotas (%)", help: "Exemplo de 20% sobre ganho positivo após custos de venda. O custo inclui compras iniciais e reinvestimentos, evitando tributar novamente dividendos. Não compensa prejuízos de outras operações nem simula amortizações do fundo." },
];
const commonFields: Field[] = [
  { key: "years", label: "Prazo da comparação (anos)", help: "De 1 a 50 anos inteiros. Inclui venda hipotética dos ativos ao final, sem afirmar que haverá liquidez ou esse preço." },
  { key: "reserveAnnualReturn", label: "Retorno líquido da reserva financeira (% ao ano)", help: "0,7% ao mês equivale a 8,731066% ao ano. Esta taxa remunera a reserva de aluguéis reinvestidos, pois não se compra uma fração física de outro imóvel todo mês. Nos FIIs, os rendimentos reinvestidos compram cotas. Aceita −20% a 30% e deve ser líquida de custos e impostos." },
];
const fields = [...propertyFields, ...fiiFields, ...commonFields];
const initialValues = Object.fromEntries(fields.map((field) => [
  field.key, field.money ? currency.format(propertyVsFiiDefaults[field.key]) : String(propertyVsFiiDefaults[field.key]),
]));

export default function PropertyVsFii({ breadcrumb }: { breadcrumb?: ReactNode }) {
  const [values, setValues] = useState(initialValues);
  const [mode, setMode] = useState<PropertyVsFiiInput["mode"]>("reinvest");
  const [month, setMonth] = useState<number | null>(null);
  const input = fields.reduce((result, field) => {
    const raw = values[field.key];
    return { ...result, [field.key]: field.money ? parseCurrency(raw)
      : /^-?\d+(?:[.,]\d{1,6})?$/.test(raw.trim()) ? Number(raw.replace(",", ".")) : NaN };
  }, { ...propertyVsFiiDefaults, mode });
  const errors = validatePropertyVsFii(input);
  const result = Object.keys(errors).length ? null : calculatePropertyVsFii(input);
  const chart = result ? buildComparisonChart(result.evolution.map((point) => ({
    month: point.month, first: point.propertyTotal, second: point.fiiTotal,
  }))) : null;
  const point = result?.evolution[Math.min(month ?? result.final.month, result.final.month)];
  const inspect = (event: PointerEvent<SVGSVGElement>) => {
    if (!result) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width) return;
    const x = (event.clientX - box.left) / box.width * CHART.width;
    setMonth(Math.max(0, Math.min(result.final.month, Math.round(
      (x - CHART.left) / (CHART.width - CHART.left - CHART.right) * result.final.month,
    ))));
  };
  const renderFields = (list: Field[]) => <div className={styles.fields}>{list.map((field) => {
    const id = `investment-${field.key}`;
    return <div className={styles.field} key={field.key}>
      <FieldLabel htmlFor={id} label={field.label} tooltipText={field.help} />
      <input id={id} className={styles.input} inputMode={field.money ? "numeric" : "decimal"}
        value={values[field.key]} aria-invalid={Boolean(errors[field.key])}
        aria-describedby={`${id}-tooltip${errors[field.key] ? ` ${id}-error` : ""}`}
        onChange={(event) => setValues({ ...values, [field.key]: field.money
          ? maskCurrency(event.target.value) : event.target.value })} />
      {errors[field.key] && <p className={styles.error} id={`${id}-error`}>{errors[field.key]}</p>}
    </div>;
  })}</div>;
  return <main className={styles.main}>
    {breadcrumb}
    <h1>Investir em Imóvel x FII de Tijolo</h1>
    <p>Compare comprar uma casa ou apartamento à vista para receber aluguel com investir em cotas
      de FII de tijolo. Esta não é uma comparação de moradia nem indicação de um fundo específico.</p>
    <section className={styles.notice} aria-labelledby="investment-warning">
      <h2 id="investment-warning">Renda, patrimônio e risco são coisas diferentes</h2>
      <p>Aluguel e rendimentos de FII não são garantidos. Valorização não é dinheiro recebido.
        Uma projeção matemática favorável não determina a SUA melhor escolha: considere liquidez,
        trabalho de administrar, concentração, objetivos e conforto com o risco.</p>
    </section>
    <section className={styles.card} aria-labelledby="investment-property">
      <h2 id="investment-property">1. Casa ou apartamento para renda</h2>
      {renderFields(propertyFields)}
    </section>
    <section className={styles.card} aria-labelledby="investment-fii">
      <h2 id="investment-fii">2. FII de tijolo</h2>
      <p>Usamos o mesmo capital total da compra, incluindo os custos de aquisição do imóvel.
        O rendimento informado deve refletir custos internos e riscos do fundo.</p>
      {renderFields(fiiFields)}
    </section>
    <section className={styles.card} aria-labelledby="investment-common">
      <h2 id="investment-common">3. Destino dos rendimentos e prazo</h2>
      <fieldset className={styles.mode}><legend>O que fazer com os rendimentos líquidos?</legend>
        <label><input type="radio" name="income-mode" checked={mode === "reinvest"}
          onChange={() => setMode("reinvest")} /> Reinvestir</label>
        <label><input type="radio" name="income-mode" checked={mode === "withdraw"}
          onChange={() => setMode("withdraw")} /> Retirar para usar</label>
      </fieldset>
      {renderFields(commonFields)}
      <p>Reinvestir: aluguéis vão para uma reserva financeira; rendimentos do FII compram cotas.
        Retirar: receitas positivas são acumuladas como valores retirados, sem rendimento posterior.
        Déficits do imóvel são cobertos pela reserva ou por capital adicional.</p>
    </section>
    {Object.keys(errors).length > 0 && <p role="alert" className={styles.error}>Revise os campos:
      {" "}{fields.filter((field) => errors[field.key]).map((field) => `${field.label}: ${errors[field.key]}`).join(" ")}</p>}
    {result && chart && point && <section className={styles.card} aria-labelledby="investment-results">
      <h2 id="investment-results">Comparação em {input.years} anos</h2>
      <p>Capital inicial em cada cenário: <strong>{currency.format(result.initialCapital)}</strong>.
        Custos de aquisição do imóvel: {currency.format(result.acquisitionCosts)};
        custos iniciais das cotas: {currency.format(result.fiiEntryCosts)}.</p>
      <p className={styles.highlight} role="status" aria-label="Resultado do investimento">
        {Math.abs(result.final.propertyTotal - result.final.fiiTotal) < 0.01 ? "Resultados projetados equivalentes."
          : `Maior resultado econômico projetado: ${result.final.propertyTotal > result.final.fiiTotal ? "imóvel" : "FII de tijolo"}.`}
        {" "}Não é recomendação de investimento.
      </p>
      <div className={styles.comparison}>
        <section aria-labelledby="investment-property-results"><h3 id="investment-property-results">Imóvel para renda</h3>
          <dl>
            <div><dt>Primeiro aluguel bruto</dt><dd>{currency.format(result.firstGrossRent)}</dd></div>
            <div><dt>Primeiro fluxo mensal líquido</dt><dd>{currency.format(result.evolution[1].rentalNetIncome)}</dd></div>
            <div><dt>Valor projetado do imóvel</dt><dd>{currency.format(result.final.propertyValue)}</dd></div>
            <div><dt>Reserva financeira final</dt><dd>{currency.format(result.final.propertyReserve)}</dd></div>
            <div><dt>Patrimônio líquido após venda hipotética</dt><dd>{currency.format(result.final.propertyNetAssets)}</dd></div>
            <div><dt>Renda retirada acumulada</dt><dd>{currency.format(result.final.propertyWithdrawn)}</dd></div>
            <div><dt>Total de reformas quinquenais</dt><dd>{currency.format(result.totalRenovations)}</dd></div>
            <div><dt>IR estimado da venda</dt><dd>{currency.format(result.propertySaleTax)}</dd></div>
            <div><dt>Resultado econômico total</dt><dd>{currency.format(result.final.propertyTotal)}</dd></div>
          </dl>
        </section>
        <section aria-labelledby="investment-fii-results"><h3 id="investment-fii-results">FII de tijolo</h3>
          <dl>
            <div><dt>Primeiro rendimento líquido</dt><dd>{currency.format(result.evolution[1].fiiNetIncome)}</dd></div>
            <div><dt>Valor projetado das cotas</dt><dd>{currency.format(result.final.fiiValue)}</dd></div>
            <div><dt>Reserva financeira final</dt><dd>{currency.format(result.final.fiiReserve)}</dd></div>
            <div><dt>Patrimônio líquido após venda hipotética</dt><dd>{currency.format(result.final.fiiNetAssets)}</dd></div>
            <div><dt>Renda retirada acumulada</dt><dd>{currency.format(result.final.fiiWithdrawn)}</dd></div>
            <div><dt>IR estimado da venda</dt><dd>{currency.format(result.fiiSaleTax)}</dd></div>
            <div><dt>Resultado econômico total</dt><dd>{currency.format(result.final.fiiTotal)}</dd></div>
          </dl>
        </section>
      </div>
      <p>Resultado econômico = patrimônio após venda + renda retirada − capital adicional.
        As retiradas não são patrimônio disponível se já foram gastas. Ganho sobre o capital inicial:
        imóvel {currency.format(result.final.propertyTotal - result.initialCapital)} e
        {" "}FII {currency.format(result.final.fiiTotal - result.initialCapital)}.</p>
      <p>Capital adicional acumulado em cada cenário: {currency.format(result.final.extraCapital)}.
        Quando falta dinheiro para custos do imóvel, o modelo exige aporte externo; o mesmo valor
        é destinado às cotas no reinvestimento ou à reserva do FII na retirada. Esse capital é
        descontado do resultado econômico dos dois cenários para não aparecer como lucro.</p>
      <figure className={styles.chart} aria-labelledby="investment-chart-caption">
        <h3>Evolução do resultado econômico</h3>
        <div className={styles.legend}><span className={styles.first}>Imóvel</span><span className={styles.second}>FII de tijolo</span></div>
        <div className={styles.canvas}>
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img"
            aria-label="Comparação do resultado econômico de imóvel e FII de tijolo" tabIndex={0}
            aria-describedby="investment-chart-values investment-chart-caption"
            onPointerMove={inspect} onPointerDown={inspect} onKeyDown={(event) => {
              const next = event.key === "ArrowRight" ? point.month + 1 : event.key === "ArrowLeft" ? point.month - 1
                : event.key === "Home" ? 0 : event.key === "End" ? result.final.month : null;
              if (next !== null) { event.preventDefault(); setMonth(Math.max(0, Math.min(result.final.month, next))); }
            }}>
            {chart.valueTicks.map((tick) => <g key={tick.value}>
              <line className={styles.axis} x1={CHART.left} x2={CHART.width - CHART.right} y1={tick.y.toFixed(2)} y2={tick.y.toFixed(2)} />
              <text x={CHART.left - 10} y={(tick.y + 4).toFixed(2)} textAnchor="end">{formatCompactCurrency(tick.value)}</text>
            </g>)}
            {chart.ticks.map((tick) => <text key={tick.month} x={tick.x} y={CHART.baseline + 24} textAnchor="middle">{tick.month / 12}</text>)}
            <text x={CHART.width / 2} y={CHART.height - 6} textAnchor="middle">Tempo (anos)</text>
            <polyline className={styles.firstLine} points={chart.firstLine} />
            <polyline className={styles.secondLine} points={chart.secondLine} />
            <line className={styles.marker} x1={chart.x(point.month)} x2={chart.x(point.month)} y1={CHART.top} y2={CHART.baseline} />
          </svg>
          <div id="investment-chart-values" className={styles.tooltip}
            style={point.month > result.final.month / 2 ? { left: "16%" } : { right: "4%" }}>
            <strong>Mês {point.month}</strong><span className={styles.first}>Imóvel: {currency.format(point.propertyTotal)}</span>
            <span className={styles.second}>FII: {currency.format(point.fiiTotal)}</span>
          </div>
        </div>
        <figcaption id="investment-chart-caption">Valores nominais, sem descontar inflação: patrimônio
          após venda, mais retiradas e menos capital adicional. Passe o ponteiro, toque ou use setas
          e Home/End com foco no gráfico. Retorno projetado não é promessa.</figcaption>
      </figure>
      <Accordion summary="Evolução anual e aportes adicionais">
        <div className={styles.table}><table><caption>Posição no último mês de cada ano; fluxo pode ser negativo no mês de reforma.</caption>
          <thead><tr><th scope="col">Ano</th><th scope="col">Resultado: imóvel</th><th scope="col">Resultado: FII</th>
            <th scope="col">Aluguel líquido/mês</th><th scope="col">FII líquido/mês</th><th scope="col">Capital adicional acumulado</th></tr></thead>
          <tbody>{result.evolution.filter((item) => item.month % 12 === 0).map((item) => <tr key={item.month}>
            <th scope="row">{item.month / 12}</th><td>{currency.format(item.propertyTotal)}</td><td>{currency.format(item.fiiTotal)}</td>
            <td>{currency.format(item.rentalNetIncome)}</td><td>{currency.format(item.fiiNetIncome)}</td><td>{currency.format(item.extraCapital)}</td>
          </tr>)}</tbody>
        </table></div>
      </Accordion>
    </section>}
    <section className={styles.card} aria-labelledby="investment-risks"><h2 id="investment-risks">O que o número não mostra</h2>
      <div className={styles.comparison}><section><h3>Imóvel direto</h3>
        <ul><li>Controle do imóvel e decisões de locação, mas trabalho de administrar contratos, reformas e cobranças.</li>
          <li>Concentração em um endereço e um inquilino; vacância ou inadimplência podem interromper a renda.</li>
          <li>Venda costuma exigir tempo, negociação, documentação e custos elevados.</li></ul></section>
        <section><h3>FII de tijolo</h3><ul><li>Acesso fracionado a uma carteira e gestão profissional, sem controlar diretamente cada imóvel.</li>
          <li>Cotas oscilam em bolsa. Há riscos de vacância, concentração, gestão e liquidez; diversificação não é automática.</li>
          <li>Distribuições podem mudar ou cessar; gestão e despesas do fundo reduzem o resultado.</li></ul></section></div>
      <Accordion summary="Premissas, tributação e referências">
        <p>Taxas constantes, compra à vista e cotas fracionadas matematicamente: não modelamos lotes,
          preço de cada cota, novas emissões, amortizações, financiamento ou dados de um fundo real.
          Vacância é uma média e a reforma não cria valorização extra.</p>
        <p>O IR do aluguel é uma taxa efetiva estimada sobre receita recebida, não uma tabela progressiva.
          O cálculo real depende da renda, deduções e situação fiscal. Não deduzimos manutenção ou
          reforma automaticamente do aluguel. Rendimentos de FII podem ser isentos para pessoa física
          apenas cumpridos os requisitos legais; o exemplo de zero não verifica esses requisitos.</p>
        <p>Imposto da venda é estimado linearmente sobre ganho positivo. Para imóvel, aquisição e
          reformas compõem a base hipotética; o tratamento real exige despesas admitidas e comprovadas,
          faixas e possíveis isenções. FII considera custo das compras e reinvestimentos, sem compensar
          prejuízos de outras operações. Consulte a Receita ou profissional, não use esta simulação para apurar DARF.</p>
        <ul><li><a href="https://www.gov.br/investidor/pt-br/investir/tipos-de-investimentos/fundos-de-investimentos-imobiliarios-fii" target="_blank" rel="noopener noreferrer">CVM: fundos imobiliários e riscos</a></li>
          <li><a href="https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/renda-variavel/fundos-de-investimento-no-brasil" target="_blank" rel="noopener noreferrer">Receita Federal: fundos de investimento</a></li>
          <li><a href="https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda" target="_blank" rel="noopener noreferrer">Receita Federal: aluguel, ganho de capital e declaração</a></li></ul>
      </Accordion>
    </section>
    <Faq items={propertyVsFiiFaqItems} />
    <RelatedTools slugs={["comprar-ou-alugar", "juros-compostos", "primeiro-milhao"]} />
    <ShareContent path="/imovel-ou-fii/" title="Investir em Imóvel x FII de Tijolo" />
  </main>;
}
