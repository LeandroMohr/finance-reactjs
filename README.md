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

## Comprar x Alugar Imóvel

- `/comprar-ou-alugar/` compara moradia própria (à vista ou SAC/Price) com aluguel.
  O catálogo a classifica como Ferramenta de planejamento financeiro.
- Ambos os cenários usam o mesmo capital inicial e orçamento mensal: o maior custo
  de moradia define o orçamento e a diferença é investida em qualquer dos cenários.
- Compra: imóvel menos dívida e custo estimado de venda, mais investimentos.
  Aluguel: investimentos mais caução restituída, com rendimento separado.
- ITBI e aquisição são custos iniciais; juros, amortização, seguros, condomínio,
  IPTU e reserva de manutenção são separados. Juros podem ser nominais ou efetivos.
- O formulário separa Compra, Aluguel do mesmo imóvel e Premissas. Condomínio e
  IPTU têm campos independentes por cenário, sem copiar alterações entre eles.
- Reforma adicional a cada 5 anos: percentual editável (exemplo inicial de 5%)
  do valor projetado do imóvel no mês 60, 120 etc., inclusive no término.
  Não gera valorização extra automática. Use zero para excluir e evite duplicar
  a obra na manutenção recorrente. O orçamento igual contempla esse desembolso.
- Gráfico com duas séries mensais de patrimônio líquido, incluindo valores
  negativos e valores no próprio gráfico. Consulta por ponteiro/toque ou setas,
  Home/End com foco no SVG, sem barra de meses. Coordenadas têm precisão fixa
  para evitar diferenças de hidratação entre servidor e navegador.
- Exemplos editáveis: entrada de 20%, aluguel de 0,6% do preço, caução de três
  aluguéis, juros nominais de 4,5%, ITBI de 2,7% e custos iniciais adicionais de 5%.
  O retorno de 0,7% mensal equivale a aproximadamente 8,731066% anual.
  Tooltips explicam bases e cálculos, distinguindo hipóteses de regras;
  valores em reais não mudam automaticamente ao editar o preço do imóvel.
- Prazos: financiamento de 1 a 35 anos, comparação de 1 a 50 anos. Reajustes de
  aluguel e despesas são anuais; rendimentos e valorização usam taxas mensais equivalentes.
- Não calcula TR, FGTS, subsídios ou IR da venda automaticamente. Retorno da carteira
  deve ser informado líquido; custos de saída são estimados. Valores são nominais.
- Os resultados não são recomendações: realização pessoal, estabilidade e
  flexibilidade são parte da decisão. A análise de imóvel para renda não faz parte
  desta ferramenta. Testes cobrem recursos iguais, quitação, taxas zero, custos,
  prazos distintos, validação e preservação do conteúdo educativo.

## Investir em Imóvel x FII de Tijolo

- `/imovel-ou-fii/` compara aquisição à vista de casa/apartamento para aluguel
  com cotas de FII de tijolo, sem misturar essa análise com moradia.
- Capital inicial igual: preço do imóvel mais custos da aquisição. FII desconta
  custos de negociação desse orçamento. Nenhum fundo ou oferta real é recomendado.
- Renda líquida e valorização são separadas. Vacância média reduz o aluguel;
  administração, manutenção, custos do proprietário, reformas e IR são explícitos.
- Reinvestir: aluguel líquido compõe uma reserva financeira; rendimentos de FII
  compram cotas. Retirar: acumula rendas positivas sem capitalização posterior.
- Déficits usam a reserva do imóvel e depois capital adicional. O mesmo aporte
  externo vai às cotas ou à reserva no cenário FII e é subtraído do resultado
  econômico de ambos. Não há empréstimo implícito nem patrimônio fictício.
- Resultado econômico: ativos líquidos de venda e impostos estimados, mais
  renda retirada, menos capital adicional. Retirada gasta não é patrimônio atual.
- IR é parametrizado e simplificado: não apura Carnê-Leão/DARF, faixas, isenções
  nem compensação de perdas externas. Zero de IR nos rendimentos do FII é apenas
  hipótese de enquadramento legal. Valores nominais e taxas constantes.
- Gráfico mensal acessível, consulta direta por ponteiro/toque ou teclado e
  tabela anual. Matemática SVG compartilhada com a comparação de moradia.

## Publicidade e Google Analytics

- A conta AdSense é verificada pela metatag no layout e por [public/ads.txt](public/ads.txt).
- [src/config/advertising.ts](src/config/advertising.ts) centraliza a conta, o bloco
  responsivo usado depois dos resultados das cinco ferramentas disponíveis e o
  ID de medição do GA4 `G-NJ1DY9YD2D`.
- Os scripts só carregam em `https://lemohr.com.br` após aceitar publicidade e
  análise de uso em um clique. Localhost e previews não carregam nenhum deles.
  A recusa não limita as calculadoras.
- A chave de consentimento foi versionada para `lemo-finance:advertising-analytics-consent:v2`;
  visitantes que autorizaram apenas publicidade precisam fazer uma nova escolha.
- O rodapé permite revisar a escolha em **Preferências de privacidade**. Revogar recarrega a página
  para interromper scripts já executados, reiniciando os valores da simulação.
- O GA4 usa visualizações automáticas, sem eventos manuais duplicados nem envio de valores
  das calculadoras. No painel, mantenha habilitada a medição de alterações de página pelo
  histórico do navegador e desative medição automática de formulários.
- Google Signals e sinais de personalização publicitária estão desativados na tag do GA4.
- As cinco calculadoras mantêm um exemplo inicial e atualizam os resultados somente ao clicar
  em **Calcular**. Entradas inválidas preservam o último cálculo, com validação visível.
- O botão **Calcular** fica abaixo dos inputs, alinhado à direita do painel, com texto
  semibold (`600`), fundo verde escuro, texto claro e borda adaptada ao tema.
  Não há mensagens instrutivas abaixo do botão.
  Botões **Calcular**, atalhos grandes da home e cards disponíveis (catálogo e
  ferramentas relacionadas) compartilham o hover com borda destacada, sombra e
  elevação de 2 px, e o clique com sombra interna e deslocamento de 1 px para baixo.
  O fundo verde escuro do botão é preservado. Cards **Em breve** não recebem efeitos
  de interação. A preferência por movimento reduzido desativa as transições e o
  deslocamento, preservando o feedback de borda e sombra.
  Os efeitos são definidos pela classe global `interactive` em
  [src/styles/global.scss](src/styles/global.scss), sem componente React para estilos.
  Cada ferramenta define diretamente o texto e a ação de seu botão; `button-primary`
  fornece a aparência e `form-actions` o alinhamento.
- Os tooltips de campos e resultados abrem acima do ícone de ajuda, com largura
  adaptada à tela e suporte a hover, teclado e toque.
- [src/utils/analytics.ts](src/utils/analytics.ts) protege os eventos de simulação, busca do
  glossário, compartilhamento, FAQ, contato, ferramentas relacionadas e menus. Não envia valores
  financeiros, texto pesquisado nem o endereço de e-mail do contato.
- Cliques nos links internos do menu superior e do rodapé registram `menu_click`, com
  `menu_location` (`header`/`footer`) e `target_path` sem query string ou fragmento.
  Abrir menus, alterar tema e abrir preferências de privacidade não contam como navegação.
- A busca registra apenas quantidade de resultados e caracteres após 1,5 segundo sem digitação.
  Confirmações repetidas do mesmo cálculo são deduplicadas até uma nova simulação diferente.
- Cadastre as dimensões e métricas no GA4 conforme
  [o guia de eventos](docs/OPERACAO-E-MONETIZACAO.md#36-eventos-implementados).
- O controle local não substitui uma CMP certificada para regiões que a exigem.
  Aprovação e consentimento no painel ainda precisam ser configurados.
- Mantenha anúncios automáticos desativados para preservar as posições manuais.

Veja o fluxo de publicação e as pendências em
[docs/OPERACAO-E-MONETIZACAO.md](docs/OPERACAO-E-MONETIZACAO.md#57-integracao-implementada-e-pendencias-do-painel).

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
