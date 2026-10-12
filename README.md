# Lemo Finance

Projeto inicial do MVP de calculadora financeira em Next.js, com foco em juros compostos e identidade visual Lemo.

## Visão geral

- Stack: Next.js + TypeScript + Sass (SCSS Modules)
- Objetivo: criar calculadora estática de juros compostos
- Branding: dark-first com tema claro opcional e paleta definida em docs/DESIGN.md
- Deploy alvo: Cloudflare Pages com export estático

## Documentação base

- [docs/DESIGN.md](docs/DESIGN.md) — identidade visual, paleta e acessibilidade
- [docs/PLAN.md](docs/PLAN.md) — arquitetura, SEO, monetização e roadmap do MVP
- [docs/ROADMAP.md](docs/ROADMAP.md) — lista de calculadoras e ferramentas planejadas

## Instalação e scripts

### npm

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

### Yarn

```bash
yarn install
yarn dev
yarn build
yarn lint
yarn test
yarn test:watch
yarn test:coverage
```

## Estrutura inicial

```text
src/
  app/                                  # rotas (App Router) + SEO
    layout.tsx                          # Header + Footer + tema
    page.tsx                            # hub de ferramentas
    page.module.scss
    page.test.tsx
    loading.tsx                         # skeleton de transição de rota
    loading.module.scss
    not-found.tsx
    not-found.module.scss
    robots.ts
    sitemap.ts                          # gerado a partir das rotas existentes
    juros-compostos/
      page.tsx
  components/
    header/
      Header.tsx / Header.module.scss / Header.test.tsx
    footer/
      Footer.tsx / Footer.module.scss / Footer.test.tsx
    compoundInterestCalculator/         # uma pasta por ferramenta
      CompoundInterestCalculator.tsx    # UI + cálculo
      CompoundInterestCalculator.module.scss
      CompoundInterestCalculator.test.tsx
  config/
    site.ts                             # domínio, nome e catálogo de ferramentas
    routes.ts                           # descoberta automática de rotas
  styles/
    global.scss                         # reset e tema (dark/light)
    variables.scss                      # tokens: cores, espaçamentos, breakpoints
    mixins.scss                         # container, card, surface, focus-ring
public/
  favicon.ico
  documents/ images/
docs/                                   # planejamento e documentação
```

## Estilos

O projeto usa **exclusivamente SCSS Modules**. Não há framework de utilitários.

- `variables.scss` — tokens em Sass (`$space-4`, `$radius-lg`, `$bp-md`)
- `global.scss` — reset e variáveis CSS de tema (`--bg-base`, `--brand-cta`), trocadas em runtime
- `mixins.scss` — blocos reutilizáveis (`@include card`, `@include container`)
- `*.module.scss` — estilo local de cada componente, com classes escopadas automaticamente

## Build e deploy

- `yarn build` roda os testes automaticamente (`prebuild`) antes de gerar o bundle.
- A saída estática é gerada em `build/` (`distDir` no [next.config.ts](next.config.ts)).
- Para pular os testes em um build pontual, use `yarn build:skip-tests`.
- As URLs públicas usam português, sem acentos: `/juros-compostos/`,
  `/primeiro-milhao/`, `/conversor-de-taxas/` e `/perguntas-frequentes/`.
  Os antigos caminhos em inglês foram removidos, sem redirecionamentos.

## Glossário financeiro

- `/glossario/` reúne conceitos de planejamento, crédito, Tesouro Direto, fundos,
  índices brasileiros e internacionais, criptoativos, metas, riscos, moradia, tributos
  e negociação em bolsa,
  com busca sem
  distinção de acentos, caixa ou siglas, índice A–Z e âncoras por letra e termo.
- Cadastre termos em [src/config/glossary.ts](src/config/glossary.ts), com `id` estável,
  definição original e, quando aplicável, fórmula, exemplo numérico e ressalvas.
- Use linguagem acessível: explique termos técnicos na própria definição, mostre o
  significado dos números e informe unidades e conversão de percentuais nas fórmulas.
  Nos exemplos de ON, PN, units, ETFs e FIIs, mantenha apenas tickers e composição.
- A busca ocorre no navegador e não envia consultas a um servidor. Todos os termos são
  renderizados no HTML inicial e a rota entra automaticamente no sitemap.
- As referências estão no fim da página. Não copie definições de terceiros.
- Mantenha os verbetes concisos, sem cotações datadas ou promessas de retorno.
  Grupos de criptoativos devem explicar sua função e incluir exemplos de moedas ou tokens.
- Em tributação e negociação, indique o escopo das regras e confira fontes oficiais:
  tabelas de renda fixa não valem para todos os ativos, e ordens não garantem execução.
- Previdência distingue PGBL/VGBL e regimes progressivo/regressivo; deduções e
  come-cotas precisam de ressalvas. Perfis de investidores e autores são educativos,
  não recomendações de produtos ou de carteiras.

## Próximo passo

Adicionar novas ferramentas ao catálogo em `src/config/site.ts` e criar a rota correspondente em `src/app/<slug>/page.tsx`.

### Critério de classificação do catálogo

- **Calculadoras:** cálculos, conversões e indicadores, como juros compostos,
  conversão de taxas, impostos e preço médio. O foco é obter um resultado numérico.
- **Ferramentas:** planejamento de objetivos e comparação de cenários, produtos
  ou estratégias, como Simulador de Metas, Primeiro Milhão e SAC x Price.
- As seções internas agrupam por assunto (investimentos, planejamento, crédito,
  trabalho, negócios e compras), não pelo formato do produto.
- Alterar a categoria não altera a URL nem a disponibilidade. Menus, contadores
  e breadcrumbs usam o catálogo; mantenha FAQ e `public/llms.txt` alinhados.
