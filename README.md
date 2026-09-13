# Lemo Finance

Projeto inicial do MVP de calculadora financeira em Next.js, com foco em juros compostos e identidade visual Lemo.

## Visão geral

- Stack: Next.js + TypeScript + Tailwind + Sass (CSS Modules)
- Objetivo: criar calculadora estática de juros compostos
- Branding: dark-first com tema claro opcional e paleta definida em docs/DESIGN.md
- Deploy alvo: Cloudflare Pages com export estático

## Documentação base

- [docs/DESIGN.md](docs/DESIGN.md) — identidade visual, paleta e acessibilidade
- [docs/PLAN.md](docs/PLAN.md) — arquitetura, SEO, monetização e roadmap do MVP

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
    layout.tsx
    globals.css
    page.tsx                            # hub de ferramentas
    page.module.scss
    page.test.tsx
    not-found.tsx
    robots.ts
    sitemap.ts                          # gerado a partir das rotas existentes
    compound-interest/
      page.tsx
  components/                           # uma pasta por ferramenta
    compoundInterestCalculator/
      CompoundInterestCalculator.tsx
      CompoundInterestCalculator.module.scss
      CompoundInterestCalculator.test.tsx
      calculateCompoundInterest.ts      # lógica pura
      calculateCompoundInterest.test.ts
  config/
    site.ts                             # domínio, nome e catálogo de ferramentas
    routes.ts                           # descoberta automática de rotas
  styles/
    global.scss
    variables.scss
public/
  documents/ images/
docs/                                   # planejamento e documentação
```

## Build e deploy

- `yarn build` roda os testes automaticamente (`prebuild`) antes de gerar o bundle.
- A saída estática é gerada em `build/` (`distDir` no [next.config.ts](next.config.ts)).
- Para pular os testes em um build pontual, use `yarn build:skip-tests`.

## Próximo passo

Adicionar novas ferramentas ao catálogo em `src/config/site.ts` e criar a rota correspondente em `src/app/<slug>/page.tsx`.
