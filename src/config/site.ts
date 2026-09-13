export const siteConfig = {
  name: "Lemo Finance",
  url: "https://calc.lemohr.com.br",
  description:
    "Simuladores e calculadoras financeiras simples, rápidas e gratuitas para planejamento e investimentos.",
} as const;

export type Tool = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  available: boolean;
};

export const tools: Tool[] = [
  {
    slug: "compound-interest",
    title: "Calculadora de Juros Compostos",
    shortTitle: "Juros Compostos",
    description:
      "Simule o crescimento do seu patrimônio com aportes iniciais, aportes mensais e taxas de juros ao longo do tempo.",
    available: true,
  },
  {
    slug: "rate-converter",
    title: "Conversor de Taxas",
    shortTitle: "Conversor de Taxas",
    description:
      "Converta taxas anuais para mensais (e vice-versa) com precisão para análises de crédito e investimentos.",
    available: false,
  },
  {
    slug: "goal-planner",
    title: "Simulador de Metas",
    shortTitle: "Simulador de Metas",
    description:
      "Descubra quanto você precisa guardar por mês para atingir seus objetivos em determinado prazo.",
    available: false,
  },
];
