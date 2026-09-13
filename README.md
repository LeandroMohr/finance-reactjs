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
    page.test.tsx
    loading.tsx                         # skeleton de transição de rota
    not-found.tsx
    robots.ts
    sitemap.ts                          # gerado a partir das rotas existentes
    _styles/                            # estilos das páginas (pasta privada)
      home.module.scss
      loading.module.scss
      not-found.module.scss
    compound-interest/
      page.tsx
  components/
    layout/                             # Header, Footer e hook de tema
      Header.tsx / Header.module.scss / Header.test.tsx
      Footer.tsx / Footer.module.scss / Footer.test.tsx
      useTheme.ts
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

## Próximo passo

Adicionar novas ferramentas ao catálogo em `src/config/site.ts` e criar a rota correspondente em `src/app/<slug>/page.tsx`.
