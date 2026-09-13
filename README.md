# Lemo Finance

Projeto inicial do MVP de calculadora financeira em Next.js, com foco em juros compostos e identidade visual Lemo.

## Visão geral

- Stack: Next.js + TypeScript + Tailwind
- Objetivo: criar calculadora estática de juros compostos
- Branding: dark-first com tema claro opcional e paleta definida em DESIGN.md
- Deploy alvo: Cloudflare Pages com export estático

## Documentação base

- DESIGN.md — identidade visual, paleta e acessibilidade
- PLAN.md — arquitetura, SEO, monetização e roadmap do MVP

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
  app/
    globals.css
    layout.tsx
    page.tsx
    not-found.tsx
    robots.ts
    sitemap.ts
  lib/
    calculators/
      compoundInterest.ts
      compoundInterest.test.ts
```

## Próximo passo

Implementar a página principal com formulário interativo, resultado financeiro e gráfico de evolução do investimento, seguindo o plano do projeto e a identidade do design.
