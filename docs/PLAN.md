# Plano — Ferramentas Financeiras Simples (finance-reactjs)

## Objetivo

Criar ferramentas financeiras simples, estáticas e abertas (calculadoras), começando pelo MVP de **juros compostos**, hospedadas a custo mínimo e monetizadas com anúncios (Google AdSense). Serve também como repertório técnico (portfólio).

- Repositório: `github.com/LeandroMohr/finance-reactjs`.
- Domínio: `lemohr.com.br` (já registrado, expira 18/08/2030), com subdomínio dedicado `calc.lemohr.com.br` para as ferramentas.
- Cada calculadora vive em um path com a palavra-chave, ex: `calc.lemohr.com.br/juros-compostos`, `calc.lemohr.com.br/conversor-de-taxas`.

## Escopo do MVP

- Uma única página: calculadora de juros compostos (aporte inicial, aporte mensal, taxa, período → gráfico/tabela de evolução).
- Toda lógica em código, sem backend, sem banco de dados, sem login.
- Anúncios (Google AdSense) inseridos sem prejudicar UX/Core Web Vitals.
- SEO básico funcionando desde o início.

---

## Domínio e estrutura de URL (decisão)

Você já tem o domínio **`lemohr.com.br`** (registrado, expira em 18/08/2030), hoje com uma configuração na AWS (Route 53 + algo servindo um "hello world" na raiz). Vamos usar:

- **Subdomínio do produto**: `calc.lemohr.com.br` — agrupa todas as calculadoras num único subdomínio (concentra autoridade de domínio/SEO num só lugar, em vez de espalhar por vários subdomínios).
- **Path por ferramenta** dentro do subdomínio, com a palavra-chave no nome, por exemplo:
  - `calc.lemohr.com.br/juros-compostos` (MVP)
  - `calc.lemohr.com.br/conversor-de-taxas` (futuro)
  - `calc.lemohr.com.br/calculadora-de-metas` (futuro)

Isso resolve a dúvida subdomínio vs. path: o subdomínio identifica o "produto" (calc.), e o path carrega a keyword de cada ferramenta — bom para SEO e organizado para adicionar novas calculadoras sem precisar de DNS novo a cada lançamento.

### Sobre o conflito de DNS com a AWS

**Boa notícia: você não precisa remover nem migrar a configuração atual da AWS/Route 53.** Isso só seria necessário se fôssemos delegar o domínio inteiro para os nameservers do Cloudflare (troca de NS no registrador) — não é o caso aqui.

Para o Cloudflare Pages, o processo padrão de "custom domain" funciona assim: você cria o projeto no Cloudflare Pages, ele te dá um alvo do tipo `<projeto>.pages.dev`, e você só **adiciona um novo registro CNAME** (`calc` → `<projeto>.pages.dev`) na zona que já existe no seu Route 53 atual. O Cloudflare valida a propriedade do subdomínio por esse CNAME e emite o certificado SSL automaticamente — sem tocar nos registros existentes da raiz do domínio (o "hello world" continua intacto).

Ou seja: a conta do Cloudflare que vamos criar é **só para o produto Cloudflare Pages** (hospedagem + analytics), não para gerenciar DNS do domínio inteiro. O Route 53 continua sendo a fonte de verdade do DNS; só ganha 1 registro CNAME novo para `calc`.

> Se no futuro você quiser desligar de vez a AWS (para não pagar Route 53 + o que estiver rodando o "hello world"), aí sim faria sentido migrar a zona inteira para o Cloudflare (DNS grátis lá). Isso fica como uma otimização de custo futura, não é bloqueante para lançar o Projeto A.

---

## 1. Sugestões de nome (produto/marca — o repo já se chama `finance-reactjs`)

O nome do repo não precisa ser o nome público da marca/site. Sugestões para o produto que vai aparecer no subdomínio/título do site:

| Nome | Por quê |
|---|---|
| **Grana Clara** | Transmite clareza/simplicidade, bom para SEO em PT-BR |
| **Calcula Fácil** | Descritivo, direto, fácil de lembrar e de ranquear para "calculadora fácil de X" |
| **FinSimples** | Curto, remete a "finanças simples", funciona bem como subdomínio |
| **Bolso Certo** | Tom pessoal/próximo, bom para conteúdo educativo |
| **Meu Juros** | Foca na primeira calculadora (juros compostos), pode limitar se expandir escopo depois |
| **Calculador.dev** ou **Calculadoras.dev** | Tom "dev/portfólio", já comunica "sou eu que fiz" |
| **Simula Grana** | Nome leve, sugere simulação financeira |

Recomendação: **Grana Clara** ou **FinSimples** — curtos, funcionam como subdomínio, e não amarram o nome a uma única calculadora (importante já que o plano é expandir para metas e conversor de taxas depois).

---

## 2. Stack técnica

Você já usa CRA/Vite — Next.js muda pouco no dia a dia de React, a diferença principal é o roteamento por arquivos (`app/` directory) e a config de build. Aqui vai só o que for necessário para este projeto (sem usar recursos de servidor, já que o site será 100% estático):

- **Framework**: Next.js (App Router), com `output: 'export'` no `next.config.js` → gera HTML/CSS/JS estático puro, sem precisar de servidor Node — compatível com Cloudflare Pages/GitHub Pages.
- **Linguagem**: TypeScript (ajuda a evitar bugs na lógica de cálculo, e é esperado em portfólio).
- **Estilo**: **Tailwind CSS** — utilitários de grid, espaçamento e cores, sem trazer componentes prontos (bate com o pedido: não faz sentido MUI/Bootstrap para um site pequeno e sem muitos componentes de UI complexos). Se algum dia precisar de componentes acessíveis prontos (modal, dropdown), dá para adicionar **Radix UI** (headless, sem estilo, só comportamento) — mas não faz parte do MVP.
- **Gráfico** (evolução do investimento): Recharts (leve, boa integração com React/Tailwind).
- **Formulários**: React Hook Form + Zod (validação dos inputs numéricos) — mantém a lógica de validação simples e testável.

## 3. Qualidade de código e automação

- **ESLint**: `eslint-config-next` (já vem com o create-next-app) + regras de TypeScript.
- **Prettier**: formatação automática, integrado ao ESLint (`eslint-config-prettier`).
- **Husky + lint-staged**:
  - `pre-commit`: roda `lint-staged` (ESLint --fix + Prettier) só nos arquivos staged.
  - `commit-msg` (opcional, mas recomendado para portfólio): `commitlint` com Conventional Commits (`feat:`, `fix:`, `chore:`...) — mostra maturidade de processo.
- **Testes**:
  - **Vitest** (mais rápido que Jest, boa integração com Vite/Next e TypeScript) + **@testing-library/react** para testar a função de cálculo de juros compostos e o comportamento do formulário/resultado.
  - Cobertura mínima: 100% da função de cálculo (é a parte crítica — erro ali é erro de conta, inaceitável numa calculadora financeira).

## 4. Esteira de CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):
- Trigger: `pull_request` e `push` na `main`.
- Steps: install deps → lint → typecheck → test (com coverage) → build (`next build` com export estático, valida que o site gera corretamente).
- **Branch protection** na `main`: exigir que o workflow passe antes de permitir merge (evita quebrar produção).

**Deploy**:
- **Cloudflare Pages** conectado diretamente ao repositório GitHub (integração nativa, sem precisar de Action extra para deploy): a cada push/merge na `main`, Cloudflare builda e publica automaticamente; PRs geram preview deployments automáticos (bom para revisar visualmente antes de mergear).
- Resultado: CI (lint/test/build) garante qualidade antes do merge; Cloudflare Pages cuida do deploy — sem necessidade de secrets de deploy no GitHub Actions.

## 5. Estrutura de pastas sugerida (pensando em replicar para novas calculadoras)

```
finance-reactjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # home / calculadora de juros compostos
│   │   ├── privacidade/page.tsx
│   │   └── termos/page.tsx
│   ├── components/
│   │   ├── ui/                     # botão, input, card (poucos, simples — sem lib de componentes)
│   │   └── calculators/
│   │       └── CompoundInterest/
│   │           ├── CompoundInterestForm.tsx
│   │           ├── CompoundInterestChart.tsx
│   │           └── index.tsx
│   └── lib/
│       └── calculators/
│           ├── compoundInterest.ts       # lógica pura, sem UI
│           └── compoundInterest.test.ts
├── .github/workflows/ci.yml
├── .husky/
├── next.config.js
├── tailwind.config.ts
└── PLAN.md                          # este documento
```

Esse padrão (`lib/calculators/<nome>.ts` + `components/calculators/<Nome>/`) é o que será replicado quando você adicionar a calculadora de metas e o conversor de taxas.

## 6. SEO e conteúdo

### Conteúdo e código
- Página com: formulário + resultado + gráfico, **mais** texto explicativo real (o que é juros compostos, exemplo prático, FAQ) — necessário tanto para SEO quanto para aprovação no AdSense.
- `metadata` do Next.js (title, description, Open Graph) por página.
- `sitemap.xml` e `robots.txt` (Next.js gera isso facilmente via `app/sitemap.ts` e `app/robots.ts`).
- JSON-LD (`schema.org/FAQPage` ou `WebApplication`) na página.
- URL da ferramenta com a keyword: `calc.lemohr.com.br/juros-compostos`.
- Meta de performance: Lighthouse ≥ 90 mobile antes de considerar "pronto para lançar".

### Contas/configurações a criar (SEO)
1. **Google Search Console** (gratuito, login com conta Google):
   - Acessar `search.google.com/search-console`.
   - Adicionar propriedade do tipo "prefixo de URL": `https://calc.lemohr.com.br`.
   - Verificar propriedade via registro **TXT** no DNS (adicionar no Route 53, na zona `lemohr.com.br`) — método recomendado pois não depende do site já estar no ar.
   - Após o site publicado: submeter o `sitemap.xml` (`https://calc.lemohr.com.br/sitemap.xml`) dentro do Search Console.
2. (Opcional, complementar) **Bing Webmaster Tools** — pode importar direto do Google Search Console com poucos cliques, dá alcance no Bing/ChatGPT-search sem esforço extra.

## 7. Monetização

- Páginas de **Política de Privacidade** e **Termos de Uso** (obrigatórias antes de submeter ao AdSense e por conta de analytics/LGPD).
- Submissão ao Google AdSense só depois do site estar no ar com conteúdo real.
- Blocos de anúncio carregados de forma assíncrona/lazy (não bloquear o carregamento da calculadora).

### Contas/configurações a criar (Monetização)
1. **Google AdSense** (`adsense.google.com`):
   - Criar conta com o mesmo e-mail Google usado no Search Console (facilita vincular depois).
   - Adicionar o site `calc.lemohr.com.br` para revisão.
   - Colar o snippet de verificação do AdSense no `<head>` (Next.js: em `app/layout.tsx`, via `metadata` ou script).
   - Aguardar aprovação (pode levar alguns dias e exige conteúdo real publicado, política de privacidade visível e tráfego mínimo indexado).
   - Após aprovado: criar os "blocos de anúncio" (ad units) no painel e inserir os componentes/scripts nas posições definidas (topo e junto ao resultado), carregados via lazy-load.

## 8. BI / Métricas

- Cloudflare Web Analytics (gratuito, sem cookies, sem impacto de performance).
- Google Search Console (indexação, cliques, posição média de busca).
- Painel do AdSense (impressões, RPM, cliques).

### Contas/configurações a criar (BI + Hospedagem Cloudflare)
1. **Criar conta no Cloudflare** (`dash.cloudflare.com/sign-up`) — gratuita.
2. **Cloudflare Pages**:
   - No dashboard, ir em "Workers & Pages" → "Create application" → "Pages" → "Connect to Git".
   - Autorizar o Cloudflare a acessar sua conta GitHub e selecionar o repositório `finance-reactjs`.
   - Configurar build: framework preset "Next.js (Static HTML Export)", comando `next build`, diretório de saída `out`.
   - Cloudflare vai gerar uma URL tipo `finance-reactjs.pages.dev` — usar para validar antes de configurar o domínio próprio.
3. **Domínio customizado no Cloudflare Pages**:
   - Na aba "Custom domains" do projeto, adicionar `calc.lemohr.com.br`.
   - Cloudflare mostra o registro CNAME a criar (algo como `calc` → `finance-reactjs.pages.dev`).
   - Criar esse registro **no Route 53** (zona `lemohr.com.br` já existente), sem alterar nenhum outro registro. SSL é emitido automaticamente pelo Cloudflare após a validação do CNAME.
4. **Cloudflare Web Analytics** (dentro do mesmo dashboard, gratuito):
   - Ir em "Analytics & Logs" → "Web Analytics" → adicionar o hostname `calc.lemohr.com.br`.
   - Cloudflare Pages já injeta o analytics automaticamente em projetos hospedados nele mesmo (não precisa nem colar script manual), ou fornece um snippet caso precise.
5. Conferir que os 3 paineis (Search Console, Cloudflare Analytics, AdSense) estão recebendo dados após o primeiro deploy.

## 9. Passo a passo de execução

1. `create-next-app` (TypeScript, App Router, Tailwind já incluso no scaffold oficial) dentro de `/var/www/finance-reactjs`.
2. Configurar `next.config.js` com `output: 'export'` e validar que `next build` gera a pasta estática (`out/`).
3. Configurar ESLint + Prettier + Husky + lint-staged (+ commitlint opcional).
4. Configurar Vitest + Testing Library.
5. Implementar `lib/calculators/compoundInterest.ts` com testes unitários primeiro.
6. Construir a UI da calculadora (form + resultado + gráfico) consumindo a lib, na rota `/juros-compostos`.
7. Escrever o conteúdo de SEO (texto explicativo, FAQ, metadata, sitemap, robots, JSON-LD).
8. Criar páginas de Política de Privacidade e Termos de Uso.
9. Criar `.github/workflows/ci.yml` (lint, typecheck, test, build) e configurar branch protection na `main`.
10. Criar conta no Cloudflare e um projeto Cloudflare Pages conectado ao repositório GitHub.
11. Adicionar o domínio customizado `calc.lemohr.com.br` no Cloudflare Pages e criar o CNAME correspondente no Route 53 (sem mexer nos demais registros do domínio).
12. Habilitar Cloudflare Web Analytics para o hostname.
13. Criar propriedade no Google Search Console (verificação via TXT no Route 53) e submeter o sitemap.
14. Criar conta no Google AdSense, adicionar o site, colar o snippet de verificação, aguardar aprovação.
15. Após aprovação do AdSense: criar os blocos de anúncio e inserir nas posições definidas (lazy-load).
16. Publicar, divulgar, acompanhar métricas nos 3 painéis (Search Console, Cloudflare Analytics, AdSense).
17. Documentar como adicionar uma nova calculadora (atualizar este PLAN.md), para acelerar as próximas (metas, conversor de taxas).

## Notas gerais

- Sem estimativas de prazo — o ritmo de execução é seu.
- As demais ideias (app familiar de finanças, agregador de ativos) ficam fora deste plano por ora.
