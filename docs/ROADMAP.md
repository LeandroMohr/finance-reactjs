# Roadmap de Calculadoras e Ferramentas

Lista de referência para novas ferramentas, levantada a partir de sites consolidados do nicho
(Calculator.net, Omni Calculator, Calculadora do Cidadão / Banco Central).

Cada item já traz o `slug` sugerido para virar a rota em `src/app/<slug>/page.tsx` e a entrada
correspondente em `src/config/site.ts`.

## Status atual

| Ferramenta | Slug | Status |
| --- | --- | --- |
| Juros Compostos | `compound-interest` | ✅ Implementada |
| Conversor de Taxas | `rate-converter` | ✅ Implementada |

---

## Prioridade alta (alto volume de busca + baixa complexidade)

| Ferramenta | Slug sugerido | Observação |
| --- | --- | --- |
| Juros Simples | `simple-interest` | Reaproveita quase toda a UI de juros compostos |
| Simulador de Metas | `goal-planner` | "Quanto guardar por mês para chegar em X" |
| Conversor de Taxas | `rate-converter` | Anual ↔ mensal ↔ diária; base para as demais |
| Correção pela Inflação | `inflation-adjuster` | Requer série do IPCA |
| Calculadora de Poupança | `savings-calculator` | Muito buscada no Brasil |
| Rendimento do CDI | `cdi-yield` | % do CDI, líquido de IR |

## Prioridade média (financiamento e crédito)

| Ferramenta | Slug sugerido | Observação |
| --- | --- | --- |
| Financiamento Imobiliário | `mortgage` | Comparar SAC × Price é um diferencial forte |
| Tabela de Amortização | `amortization` | Saída em tabela, ótimo para SEO |
| Financiamento de Veículo | `auto-loan` | |
| Quitação Antecipada | `loan-payoff` | Economia ao antecipar parcelas |
| Calculadora de CET | `effective-cost-rate` | Custo Efetivo Total, exigido por lei no Brasil |
| Cartão de Crédito / Rotativo | `credit-card-payoff` | Alto apelo educacional |
| Consolidação de Dívidas | `debt-consolidation` | |
| Empréstimo Genérico | `loan-calculator` | Parcela, prazo ou taxa |

## Prioridade média (investimentos)

| Ferramenta | Slug sugerido | Observação |
| --- | --- | --- |
| Renda Fixa (CDB/LCI/LCA) | `fixed-income` | Comparar isento × tributado |
| Tesouro Direto | `treasury-bonds` | Selic, IPCA+, Prefixado |
| ROI | `roi` | |
| TIR / IRR | `irr` | |
| Valor Presente e Futuro | `present-future-value` | |
| Payback | `payback` | |
| Dividend Yield | `dividend-yield` | |
| Preço Médio de Ações | `average-price` | |
| Juros sobre Capital Próprio | `jcp` | |

## Prioridade média (impostos e salário)

| Ferramenta | Slug sugerido | Observação |
| --- | --- | --- |
| IR sobre Investimentos | `investment-tax` | Tabela regressiva |
| Salário Líquido | `net-salary` | INSS + IRRF |
| Rescisão Trabalhista | `severance-pay` | Alto volume de busca |
| Férias e 13º | `vacation-13th` | Sazonal, picos previsíveis |
| Horas Extras | `overtime` | |
| INSS / Aposentadoria | `retirement-inss` | |
| Simples Nacional / MEI | `mei-taxes` | Nicho com pouca concorrência boa |

## Prioridade baixa (utilitários e nicho)

| Ferramenta | Slug sugerido | Observação |
| --- | --- | --- |
| Conversor de Moedas | `currency-converter` | Exige API externa (quebra o modelo estático) |
| Regra de Três / Porcentagem | `percentage` | Volume altíssimo, concorrência altíssima |
| Divisão de Conta | `bill-split` | |
| Reserva de Emergência | `emergency-fund` | |
| Independência Financeira (FIRE) | `financial-independence` | |
| Aluguel × Compra | `rent-vs-buy` | Ótimo conteúdo, cálculo mais complexo |
| Custo por Quilômetro | `cost-per-km` | Útil para motoristas de app |

---

## Notas de implementação

- Ferramentas que dependem de dados externos (IPCA, CDI, Selic, câmbio) precisam de decisão
  prévia: embutir série histórica no build ou consumir API em runtime. A segunda opção conflita
  com `output: "export"`.
- Itens trabalhistas e tributários mudam de regra todo ano — vale registrar a vigência da tabela
  usada na própria página.
- Cada nova ferramenta entra automaticamente no `sitemap.xml` ao criar a rota, conforme
  `src/config/routes.ts`.
