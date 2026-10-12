export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  category: string;
  title: string;
  items: FaqItem[];
};

export const generalFaqItems: FaqItem[] = [
  {
    question: "As calculadoras e ferramentas são gratuitas?",
    answer:
      "Sim. Todas as ferramentas disponíveis no Lemo Finance podem ser usadas gratuitamente e sem cadastro.",
  },
  {
    question: "Os valores informados ficam salvos?",
    answer:
      "Não. Os valores são processados no seu navegador para realizar os cálculos e não ficam salvos pelo Lemo Finance.",
  },
  {
    question: "Posso confiar nos resultados das simulações?",
    answer:
      "As ferramentas usam as fórmulas e premissas explicadas em cada página, mas os resultados são estimativas. Confirme taxas, impostos, tarifas e regras do produto antes de tomar uma decisão.",
  },
  {
    question: "Por que o resultado pode ser diferente do cálculo do banco?",
    answer:
      "Instituições podem adotar convenções de dias, arredondamentos, datas de aporte, impostos e tarifas diferentes. Confira as condições do contrato e compare-as com as premissas mostradas na ferramenta.",
  },
  {
    question: "As ferramentas substituem orientação financeira profissional?",
    answer:
      "Não. O conteúdo tem finalidade educativa e ajuda a comparar cenários, mas não constitui recomendação de investimento, crédito ou contratação de produtos financeiros.",
  },
];

export const compoundInterestFaqItems: FaqItem[] = [
  {
    question: "O que são juros compostos?",
    answer:
      "São os juros calculados sobre o saldo acumulado, e não apenas sobre o valor inicial. Como cada rendimento passa a render nos períodos seguintes, o crescimento é exponencial — o chamado juros sobre juros.",
  },
  {
    question: "Qual é a fórmula dos juros compostos?",
    answer:
      "Para um capital único, o montante é M = C x (1 + i)^n, em que C é o capital inicial, i a taxa do período e n a quantidade de períodos. Com aportes mensais, soma-se a parcela PMT x ((1 + i)^n - 1) / i.",
  },
  {
    question: "Qual é a diferença entre juros simples e compostos?",
    answer:
      "Nos juros simples, a taxa incide sempre sobre o valor inicial. Nos juros compostos, cada rendimento passa a integrar o saldo e também rende nos períodos seguintes.",
  },
  {
    question: "Como a taxa anual é usada na simulação?",
    answer:
      "Quando a taxa é anual, a calculadora a divide por 12 para obter a taxa mensal aplicada à evolução do saldo. Para reproduzir outra convenção contratual, informe diretamente a taxa mensal correspondente.",
  },
  {
    question: "Quando o aporte mensal entra no cálculo?",
    answer:
      "A simulação calcula os juros sobre o saldo existente no início do mês e adiciona o aporte ao final do período. Por isso, o primeiro aporte mensal começa a render no mês seguinte.",
  },
  {
    question: "O valor final é uma garantia de rendimento?",
    answer:
      "Não. O resultado é uma projeção matemática com taxa constante e não considera impostos, inflação, taxas, oscilações de mercado nem mudanças futuras nos aportes.",
  },
  {
    question: "Em quanto tempo o dinheiro investido dobra?",
    answer:
      "Sem novos aportes, o prazo aproximado sai da regra de 72: divida 72 pela taxa em porcentagem do período. A 1% ao mês, o capital dobra em cerca de 72 meses; a 10% ao ano, em cerca de 7 anos.",
  },
];

export const firstMillionFaqItems: FaqItem[] = [
  {
    question: "Quanto tempo leva para juntar o primeiro milhão?",
    answer:
      "Depende do patrimônio inicial, dos aportes e da rentabilidade. A simulação encontra o primeiro mês em que o saldo alcança R$ 1 milhão, mantendo os aportes e a taxa constantes por até 100 anos.",
  },
  {
    question: "Quanto preciso investir por mês para alcançar R$ 1 milhão?",
    answer:
      "Escolha Descobrir o aporte mensal e informe seu capital, taxa e prazo. A ferramenta calcula o aporte fixo no fim do mês e arredonda para cima em centavos. Se o capital inicial sozinho for suficiente, o aporte necessário é zero.",
  },
  {
    question: "Posso simular sem juros ou sem aportes?",
    answer:
      "Sim. Com juros zero, o patrimônio cresce apenas pelos aportes. Sem aportes, é preciso capital inicial e rendimento positivo, a menos que você já tenha R$ 1 milhão. Sem capital e sem aportes, a meta não pode ser alcançada.",
  },
  {
    question: "A taxa anual é dividida por 12?",
    answer:
      "Não nesta ferramenta. Usamos a taxa mensal equivalente: (1 + taxa anual / 100)^(1/12) − 1. Ela preserva a rentabilidade anual informada após 12 meses de capitalização.",
  },
  {
    question: "O primeiro milhão considera inflação e impostos?",
    answer:
      "Não. A meta é nominal e a simulação não desconta inflação, impostos ou custos. O poder de compra pode diminuir com o tempo. Os rendimentos são estimativas, não garantias nem recomendações de investimento.",
  },
];

export const rateConverterFaqItems: FaqItem[] = [
  {
    question: "Qual é a diferença entre taxa proporcional e taxa equivalente?",
    answer:
      "A taxa proporcional divide ou multiplica a taxa pelo número de períodos, sem capitalização. A taxa equivalente considera os juros sobre juros e gera o mesmo montante final ao ser aplicada no período convertido — é ela que o conversor calcula.",
  },
  {
    question: "Como transformar uma taxa anual em mensal?",
    answer:
      "Use a taxa equivalente: i_mensal = (1 + i_anual)^(1/12) - 1. Uma taxa de 12% ao ano equivale a cerca de 0,949% ao mês, e não a 1% ao mês como sugere a simples divisão por 12.",
  },
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

export const faqSections: FaqSection[] = [
  {
    id: "geral",
    category: "Geral",
    title: "Sobre o Lemo Finance",
    items: generalFaqItems,
  },
  {
    id: "calculadoras",
    category: "Calculadoras",
    title: "Juros compostos",
    items: compoundInterestFaqItems,
  },
  {
    id: "first-million",
    category: "Calculadoras",
    title: "Primeiro milhão",
    items: firstMillionFaqItems,
  },
  {
    id: "ferramentas",
    category: "Ferramentas",
    title: "Conversor de taxas",
    items: rateConverterFaqItems,
  },
];