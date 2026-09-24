export const siteConfig = {
  name: "Lemo Finance",
  url: "https://calc.lemohr.com.br",
  description:
    "Simuladores e calculadoras financeiras eficientes para planejamento e tomadas de decisão.",
  author: "Leandro Mohr",
  contactEmail: "contato@lemohr.com.br",
} as const;

export const institutionalLinks = [
  { href: "/sobre-nos/", label: "Sobre nós" },
  { href: "/contato/", label: "Contato" },
  { href: "/politica-de-privacidade/", label: "Política de privacidade" },
  { href: "/termos-de-uso/", label: "Termos de uso" },
] as const;

export type NavItem = {
  slug: string;
  title: string;
  description: string;
  section: string;
  available: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  description: string;
  emptyMessage: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "calculadoras",
    label: "Calculadoras",
    description:
      "Simule cálculos financeiros completos — aportes, taxas e prazos — para planejar suas decisões com mais segurança.",
    emptyMessage: "Novas calculadoras em breve.",
    items: [
      {
        slug: "compound-interest",
        title: "Juros Compostos",
        description:
          "Simule o crescimento do seu patrimônio com aportes iniciais, aportes mensais e taxa de juros ao longo do tempo.",
        section: "Investimentos",
        available: true,
      },
      {
        slug: "goal-planner",
        title: "Simulador de Metas",
        description:
          "Descubra quanto guardar por mês para atingir um objetivo em determinado prazo.",
        section: "Planejamento financeiro",
        available: false,
      },
      {
        slug: "financing-sac-price",
        title: "Financiamento SAC x Price",
        description:
          "Compare parcelas, juros e saldo devedor nos dois principais sistemas de amortização.",
        section: "Crédito e financiamento",
        available: false,
      },
      {
        slug: "fixed-income-comparison",
        title: "Comparador de Renda Fixa",
        description:
          "Compare CDB, LCI, LCA, Tesouro Direto e poupança considerando prazo, taxas e impostos.",
        section: "Investimentos",
        available: false,
      },
      {
        slug: "emergency-fund",
        title: "Reserva de Emergência",
        description:
          "Calcule o valor ideal da sua reserva e quanto guardar por mês para construí-la.",
        section: "Planejamento financeiro",
        available: false,
      },
      {
        slug: "first-million",
        title: "Primeiro Milhão",
        description:
          "Descubra quanto investir por mês e por quanto tempo para alcançar seu primeiro milhão.",
        section: "Investimentos",
        available: false,
      },
      {
        slug: "present-future-value",
        title: "Valor Presente e Valor Futuro",
        description:
          "Compare o valor do dinheiro hoje e no futuro considerando juros e prazo.",
        section: "Investimentos",
        available: false,
      },
      {
        slug: "financial-independence",
        title: "Independência Financeira",
        description:
          "Estime o patrimônio necessário para sustentar seu custo de vida com renda dos investimentos.",
        section: "Planejamento financeiro",
        available: false,
      },
      {
        slug: "dividend-income",
        title: "Renda Passiva com Dividendos",
        description:
          "Calcule quanto investir para buscar uma renda mensal por meio de dividendos.",
        section: "Investimentos",
        available: false,
      },
      {
        slug: "net-salary",
        title: "Salário Líquido",
        description:
          "Estime o salário após descontos de INSS, IRRF e outros valores recorrentes.",
        section: "Trabalho e renda",
        available: false,
      },
      {
        slug: "clt-vs-pj",
        title: "CLT x PJ",
        description:
          "Compare salário, benefícios, impostos e custos para avaliar os dois regimes de contratação.",
        section: "Trabalho e renda",
        available: false,
      },
      {
        slug: "buy-or-rent",
        title: "Comprar ou Alugar Imóvel",
        description:
          "Compare o custo de financiar um imóvel com o aluguel e o investimento da diferença.",
        section: "Planejamento financeiro",
        available: false,
      },
      {
        slug: "amortize-or-invest",
        title: "Amortizar ou Investir",
        description:
          "Compare a economia ao antecipar uma dívida com o retorno potencial de um investimento.",
        section: "Crédito e financiamento",
        available: false,
      },
      {
        slug: "project-analysis",
        title: "VPL, TIR, ROI e Payback",
        description:
          "Analise a viabilidade e o prazo de retorno de projetos e investimentos.",
        section: "Negócios",
        available: false,
      },
      {
        slug: "investment-tax",
        title: "IR sobre Investimentos",
        description:
          "Estime o Imposto de Renda sobre aplicações considerando produto e prazo.",
        section: "Investimentos",
        available: false,
      },
      {
        slug: "average-stock-price",
        title: "Preço Médio de Ações",
        description:
          "Calcule o custo médio das suas compras de ações para acompanhar posição e tributação.",
        section: "Investimentos",
        available: false,
      },
      {
        slug: "debt-payoff-strategy",
        title: "Bola de Neve x Avalanche de Dívidas",
        description:
          "Compare estratégias de quitação por menor saldo ou maior taxa de juros.",
        section: "Crédito e financiamento",
        available: false,
      },
      {
        slug: "monthly-income",
        title: "Calculadora de Renda Mensal",
        description:
          "Descubra quanto precisa ter investido para buscar a renda mensal desejada.",
        section: "Planejamento financeiro",
        available: false,
      },
      {
        slug: "retirement-planner",
        title: "Planejador de Aposentadoria",
        description:
          "Projete patrimônio, aportes e renda para planejar sua aposentadoria.",
        section: "Planejamento financeiro",
        available: false,
      },
    ],
  },
  {
    id: "ferramentas",
    label: "Ferramentas",
    description:
      "Converta taxas, ajuste valores e resolva outros cálculos financeiros pontuais, direto no navegador.",
    emptyMessage: "Ferramentas em desenvolvimento.",
    items: [
      {
        slug: "rate-converter",
        title: "Conversor de Taxas",
        description: "Converta taxas anuais em mensais (e vice-versa) com precisão.",
        section: "Taxas e correções",
        available: true,
      },
      {
        slug: "inflation-adjuster",
        title: "Correção pela Inflação",
        description: "Atualize valores do passado para o poder de compra de hoje.",
        section: "Taxas e correções",
        available: false,
      },
      {
        slug: "cash-vs-installments",
        title: "À Vista ou Parcelado",
        description:
          "Compare desconto à vista, parcelamento e rendimento possível do dinheiro no período.",
        section: "Comparações financeiras",
        available: false,
      },
      {
        slug: "loan-total-cost",
        title: "Custo Efetivo Total (CET)",
        description:
          "Calcule o custo real de um empréstimo incluindo juros, tarifas, seguros e encargos.",
        section: "Crédito e vendas",
        available: false,
      },
      {
        slug: "real-interest-rate",
        title: "Taxa Real de Juros",
        description:
          "Desconte a inflação para descobrir o ganho ou custo real de uma taxa de juros.",
        section: "Taxas e correções",
        available: false,
      },
      {
        slug: "card-machine-fee",
        title: "Taxa de Maquininha de Cartão",
        description:
          "Calcule taxas, antecipação e preço de venda para preservar sua margem no cartão.",
        section: "Crédito e vendas",
        available: false,
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((group) => group.items);

export function findToolGroup(slug: string): NavGroup | undefined {
  return navGroups.find((group) => group.items.some((item) => item.slug === slug));
}
