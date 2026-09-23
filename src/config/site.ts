export const siteConfig = {
  name: "Lemo Finance",
  url: "https://calc.lemohr.com.br",
  description:
    "Simuladores e calculadoras financeiras eficientes para planejamento e tomadas de decisão.",
  author: "Leandro Mohr",
} as const;

export type NavItem = {
  slug: string;
  title: string;
  description: string;
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
        available: true,
      },
      {
        slug: "simple-interest",
        title: "Juros Simples",
        description: "Compare o rendimento linear com o rendimento composto.",
        available: false,
      },
      {
        slug: "goal-planner",
        title: "Simulador de Metas",
        description:
          "Descubra quanto guardar por mês para atingir um objetivo em determinado prazo.",
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
        available: true,
      },
      {
        slug: "inflation-adjuster",
        title: "Correção pela Inflação",
        description: "Atualize valores do passado para o poder de compra de hoje.",
        available: false,
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((group) => group.items);

export function findToolGroup(slug: string): NavGroup | undefined {
  return navGroups.find((group) => group.items.some((item) => item.slug === slug));
}
