# Identidade Visual — Lemo (finance-reactjs)

Este documento define paleta de cores, tipografia e diretrizes de identidade/mascote para as calculadoras financeiras, com temas **claro e escuro** e conformidade **WCAG AA**.

> **Tema padrão: escuro.** O toggle claro/escuro existe para conforto e alcance (algumas pessoas preferem/precisam de tema claro por ambiente, iluminação ou preferência pessoal), mas a marca "nasce" e é vendida visualmente como dark+verde+limão — o claro é uma variação de acessibilidade/conforto, não uma reformulação de marca.

## Por que tema escuro + verde faz sentido aqui

- **Verde já é o significante universal de dinheiro/positivo** (saldo positivo, "no verde", crescimento) — reforça o significado sem precisar de explicação.
- **Dark mode é o padrão de facto em ferramentas financeiras modernas** (ex: apps de investimento, dashboards, corretoras) — percebido como "sério"/"tech", reduz fadiga visual em sessões longas de simulação (o usuário fica testando vários cenários, mexendo em inputs).
- Menor OLED/consumo de bateria em mobile, relevante já que o objetivo é acesso pelo celular.
- Combinação abre espaço para o **verde-limão** como acento vibrante sobre um fundo escuro neutro — conecta direto com o mascote (limão) sem o verde "gritar" 100% da UI.

## Paleta de cores (verificada AA/AAA)

Todos os pares abaixo foram calculados pela fórmula oficial de contraste do WCAG 2.1 (luminância relativa). Mínimo exigido AA: **4.5:1** para texto normal, **3:1** para texto grande (≥18pt ou 14pt bold) e para componentes de UI/gráficos.

### Neutros (fundo e superfícies)

| Token | Hex | Uso |
|---|---|---|
| `bg-base` | `#0B1710` | Fundo principal da aplicação (verde-preto bem escuro, não é preto puro — mais orgânico/menos "modo terminal") |
| `bg-surface` | `#0F1712` | Fundo de seções/hero |
| `bg-card` | `#16211A` | Cards, inputs, containers elevados |
| `border` | `#233026` | Bordas sutis entre cards e fundo |
| `text-primary` | `#F5F7F6` | Texto principal (quase branco, levemente esverdeado para não destoar do fundo) |
| `text-muted` | `#A8B3AE` | Texto secundário, labels, legendas |

### Verde (marca / ações principais)

| Token | Hex | Uso |
|---|---|---|
| `brand-emerald-500` | `#10B981` | Cor primária da marca (ícones, links, destaques) |
| `brand-emerald-400` | `#34D399` | Hover/estado ativo, gráficos (linha de crescimento) |
| `brand-lime-400` | `#A3E635` | Acento "limão" — CTA principal (botão calcular), mascote, detalhes de destaque |

### Semânticas (feedback)

| Token | Hex | Uso |
|---|---|---|
| `success` | `#34D399` | Reaproveita o emerald-400 (mensagens de sucesso/positivo) |
| `warning` | `#FBBF24` | Alertas (ex: taxa irreal, campo preenchido incorretamente) |
| `error` | `#F87171` | Erros de validação de formulário |

### Contraste verificado (sobre fundo escuro `#0B1710` / `#0F1712` / cards `#16211A`)

| Combinação | Contraste | Resultado |
|---|---|---|
| `text-primary` (#F5F7F6) sobre `bg-base` (#0B1710) | 17.06:1 | AAA |
| `text-muted` (#A8B3AE) sobre `bg-base` (#0B1710) | 8.50:1 | AAA |
| `brand-emerald-400` (#34D399) sobre `bg-surface` (#0F1712) | 9.49:1 | AAA |
| `brand-emerald-500` (#10B981) sobre `bg-surface` (#0F1712) | 7.19:1 | AAA |
| `brand-lime-400` (#A3E635) sobre `bg-surface` (#0F1712) | 12.09:1 | AAA |
| `warning` (#FBBF24) sobre `bg-base` (#0B1710) | 10.99:1 | AAA |
| `error` (#F87171) sobre `bg-base` (#0B1710) | 6.63:1 | AA (texto normal) |
| `text-primary` (#F5F7F6) sobre `bg-card` (#16211A) | 15.41:1 | AAA |
| `text-muted` (#A8B3AE) sobre `bg-card` (#16211A) | 7.68:1 | AAA |

### Botões (texto escuro sobre fundo verde/limão vibrante)

Quando o botão usa uma cor vibrante como fundo (ex: CTA "Calcular"), o texto deve ser **escuro**, não branco — dá mais contraste e é o padrão usado por apps financeiros com botões verde/limão:

| Combinação | Contraste | Resultado |
|---|---|---|
| Texto `#08110C` sobre botão `brand-emerald-500` (#10B981) | 7.55:1 | AAA |
| Texto `#08110C` sobre botão `brand-emerald-400` (#34D399) | 9.97:1 | AAA |
| Texto `#08110C` sobre botão `brand-lime-400` (#A3E635) | 12.71:1 | AAA |

**Recomendação de CTA**: usar `brand-lime-400` como cor do botão principal ("Calcular", "Simular") — é a cor de maior contraste e a que mais remete ao mascote limão; usar `brand-emerald-500`/`400` para links, ícones e elementos de menor destaque (evita cansar o olho com 2 verdes vibrantes competindo).

---

## Tema claro (mesma identidade, versão clara)

Como o site é estático, o toggle claro/escuro é **só CSS + um atributo salvo em `localStorage`** — não exige lógica de servidor nem afeta SEO (o conteúdo/HTML é o mesmo nos dois temas, só mudam variáveis de cor). Vale oferecer por conforto/acessibilidade (ambientes muito claros, preferência pessoal, ou usuários que simplesmente preferem light), mantendo a mesma linguagem visual: fundo levemente esverdeado (não branco puro/frio), verde como cor de marca, limão como acento do CTA/mascote.

### Paleta do tema claro (contraste verificado)

| Token | Hex | Uso |
|---|---|---|
| `bg-base` (light) | `#F7FAF7` | Fundo principal — branco levemente esverdeado, não branco puro (mantém a "temperatura" verde da marca) |
| `bg-card` (light) | `#FFFFFF` | Cards/superfícies elevadas |
| `border` (light) | `#D8E3D9` | Bordas sutis |
| `text-primary` (light) | `#10241A` | Texto principal (verde muito escuro, não preto puro — reforça marca mesmo no texto) |
| `text-muted` (light) | `#4B5A52` | Texto secundário |
| `brand-emerald-700` (light) | `#047857` | Links/ícones no tema claro (o emerald-500/400 do dark ficam claros demais em fundo branco) |
| `brand-lime-500` (light) | `#84CC16` | Botão principal/CTA no tema claro (com texto escuro) |

### Contraste verificado — tema claro

| Combinação | Contraste | Resultado |
|---|---|---|
| `text-primary` (#10241A) sobre `bg-base` (#F7FAF7) | 15.49:1 | AAA |
| `text-muted` (#4B5A52) sobre `bg-base` (#F7FAF7) | 6.93:1 | AAA |
| `brand-emerald-700` (#047857) sobre `bg-base` (#F7FAF7) | 5.22:1 | AA |
| Botão `brand-lime-500` (#84CC16) com texto `#10241A` | 8.24:1 | AAA |
| Botão `brand-emerald-800` (#065F46) com texto branco | 7.68:1 | AAA |
| `error` `#DC2626` sobre `bg-base` (#F7FAF7) | 4.59:1 | AA |
| `warning` `#B45309` sobre `bg-base` (#F7FAF7) | 4.78:1 | AA |

> Atenção: os tons de verde/limão do tema escuro (`#10B981`, `#34D399`, `#A3E635`) **não** devem ser reaproveitados como texto/link no tema claro — ficam claros demais sobre fundo branco (contraste abaixo de AA). Use os tons mais escuros (`#047857`, `#065F46`) só no tema claro; os tons vibrantes ficam reservados para preenchimentos de botão, ícones grandes e elementos decorativos onde 3:1 (não 4.5:1) já é suficiente.

### Como implementar o toggle num site estático (Next.js export)

1. Modelar as cores como **CSS variables** (ex: `--bg-base`, `--text-primary`) em vez de hardcoded no Tailwind config — o tema é uma troca de valores de variável, não de classe por elemento.
2. Definir 2 blocos: `:root { ... }` (dark, padrão) e `[data-theme="light"] { ... }` (sobrescreve as variáveis).
3. Tailwind consome as variáveis (`background-color: var(--bg-base)`), então os componentes não sabem qual tema está ativo — só a variável muda.
4. Toggle: um pequeno script inline no `<head>` (antes do CSS carregar) lê `localStorage.theme` e aplica `data-theme` no `<html>` **antes do primeiro paint**, evitando o "flash" de tema errado (FOUC) — padrão usado por sites estáticos com dark mode (ex: documentações Next.js/Tailwind).
5. Sem preferência salva: seguir o padrão da marca (dark) em vez de `prefers-color-scheme` do sistema — reforça identidade; o usuário pode alternar manualmente e a escolha fica salva.
6. Ícone do toggle: usar o mascote como parte do controle é uma boa oportunidade de charme — ex: "Lemo" com óculos de sol no tema claro e "Lemo" à noite/com uma folha brilhando no escuro (detalhe pequeno, não obrigatório no MVP).

---

### Acessibilidade além do contraste de cor

- **Nunca comunicar só por cor**: erros de validação devem ter ícone + texto, não só borda vermelha (usuários com daltonismo, ~8% dos homens têm dificuldade em diferenciar vermelho/verde — relevante justamente por usarmos verde como cor central).
- **Foco visível**: outline de foco com `brand-lime-400` (dark) / `brand-lime-500` (light) em 2px mínimo, nunca remover `:focus` sem substituir por alternativa visível (navegação por teclado).
- **Tamanho mínimo de fonte**: 16px para texto de corpo (evita zoom automático em iOS e melhora legibilidade).
- **Área de toque**: mínimo 44x44px para botões/inputs em mobile.
- **Padrão de tema**: sem preferência salva do usuário, usar **dark** como padrão (reforça a identidade "nascida" no escuro) em vez de seguir `prefers-color-scheme` do sistema automaticamente — o toggle manual continua disponível e a escolha é lembrada via `localStorage`. Ambos os temas já estão validados AA/AAA acima, então não há prejuízo de acessibilidade nessa escolha de padrão.
- **Ferramentas para validar durante o desenvolvimento**: WebAIM Contrast Checker, extensão Stark (Figma/Chrome), `axe DevTools` (Chrome extension) rodando no site publicado, nos dois temas.

## Tipografia

Fontes gratuitas (Google Fonts / open source), boas para leitura de números e PT-BR:

- **Títulos/Headings**: **Sora** ou **Space Grotesk** — geométricas, modernas, comum em produtos fintech/SaaS (dão o tom "tech" sem parecer corporativo/frio).
- **Corpo de texto**: **Inter** — altíssima legibilidade em telas, suporte completo a acentuação PT-BR, é o padrão de fato em produtos digitais atuais (usado por Linear, GitHub, Figma, etc.), gratuita via Google Fonts/`next/font`.
- **Números/resultados da calculadora**: uma fonte com **tabular figures** (números de largura fixa, essencial para alinhar valores em tabelas/resultados) — **IBM Plex Mono** ou **JetBrains Mono**. Alternativa sem trocar de fonte: manter Inter e ativar `font-variant-numeric: tabular-nums` nos números (Inter já suporta tabular figures nativamente, o que simplifica — só 1 família de fonte no projeto todo).

**Recomendação final**: usar **apenas Inter** (headings + corpo + números com `tabular-nums`) para manter o bundle leve (menos fontes = menos requisições, melhor Core Web Vitals) e simplificar manutenção; caso queira diferenciar mais os títulos visualmente, usar **Sora** só nos headings principais (H1/H2 da página).

Carregar via `next/font/google` (self-hosted automaticamente pelo Next.js, sem chamada externa ao Google Fonts em runtime — melhor performance e privacidade).

## Logo / mascote (Lemo, o limão)

- **Conceito**: um limão estilizado como mascote, reforçando o trocadilho com "lemo" (de `lemohr.com.br`) e a cor verde (casca do limão) já usada na marca — cria uma identidade única e memorável, versus calculadoras financeiras genéricas do mercado.
- **Nome de marca sugerido**: **Lemo** (ex: "Lemo Calculadoras", "Lemo Finanças") — mais forte que as opções genéricas cogitadas antes ("Grana Clara", "FinSimples"), porque já nasce conectado ao domínio e ao mascote, e funciona bem como subdomínio (`calc.lemohr.com.br`, com o mascote "Lemo" aparecendo no cabeçalho/favicon).
- **Estilo visual recomendado**: flat/vetorial, contornos arredondados, expressão simpática (não corporativo demais) — remete a mascotes de apps financeiros descontraídos (ex: estilo usado por bancos digitais/fintechs para humanizar um tema "sério").
- **Paleta do mascote**: corpo em `brand-lime-400` (#A3E635), sombra/detalhes em `brand-emerald-500` (#10B981), sobre fundo escuro (`bg-base`/`bg-surface`) — o próprio mascote já é o "teste vivo" de contraste AA da marca.
- **Usos**:
  - Favicon/ícone do app: só a "cabeça" do limão simplificada (precisa funcionar em 16x16px).
  - Header do site: mascote + wordmark "Lemo".
  - Estados vazios/erro (empty states, 404): mascote com expressões diferentes (ex: limão "confuso" na página 404) — humaniza a ferramenta e é leve de produzir (poucas variações de um SVG).
- **Formato técnico**: SVG (escalável, leve, fácil de recolorir via CSS `currentColor` se o design permitir monocromático em certos contextos).
- Ferramentas gratuitas para produzir/gerar um primeiro rascunho: Figma (vetor manual) ou geração assistida por IA para o conceito inicial, refinado depois em vetor.

## Essa conexão (limão + verde + "lemo") faz sentido? E ajuda em SEO/orgânico?

**Faz sentido, sim** — é uma identidade coerente e rara de se ver nesse nicho (a maioria das calculadoras financeiras usa visual genérico de banco: azul corporativo, ícones de gráfico/moeda sem personalidade). Ter um mascote nomeado, com trocadilho no próprio domínio, é o tipo de detalhe que separa um projeto de portfólio "mais um clone de calculadora" de algo com marca própria — o que importa tanto para o objetivo de repertório quanto para as próximas ferramentas (o mascote/paleta se repete em todas, dando consistência de "produto" e não de "página avulsa").

**Sobre SEO especificamente, importante ser direto:** identidade visual (cor, logo, mascote) **não é um fator de ranqueamento** do algoritmo de busca — Google não lê "isso é um limão verde, então rankeia melhor". O impacto em SEO/orgânico é **indireto**, mas real, por estes caminhos:

1. **Busca de marca (branded search)**: com o tempo, se "Lemo" virar reconhecível, pessoas passam a buscar diretamente "calculadora Lemo" ou "Lemo juros compostos" — esse tipo de busca tem CTR (taxa de clique) muito mais alto que busca genérica, e o Google interpreta alto CTR/baixo *bounce* como sinal de relevância, ajudando indiretamente o ranking também para termos genéricos.
2. **Memorabilidade → retorno e compartilhamento**: uma marca com identidade (mascote, nome curto) é mais fácil de lembrar e indicar ("usa aquele Lemo lá") do que "calculadora de juros compostos genérica" — isso gera mais tráfego direto/de indicação, o que o Google também valoriza como sinal de autoridade.
3. **Backlinks e menções**: conteúdo com identidade visual definida (mascote, nome próprio) tem mais chance de ser citado/linkado por blogs, redes sociais e listas de "ferramentas úteis" do que uma página sem marca — links externos são um dos fatores de ranking mais fortes que existem.
4. **Tempo de permanência e engajamento (dwell time)**: uma UI com identidade cuidada (incluindo o mascote em empty states, 404, etc.) tende a reter mais o usuário e reduzir abandono imediato — sinais de engajamento que o Google usa como proxy de qualidade.
5. **Diferenciação em nicho saturado**: "calculadora de juros compostos" é um termo competitivo (muitos sites de bancos/corretoras já rankeiam bem). Ter uma marca única não muda o algoritmo, mas ajuda a se diferenciar o suficiente na SERP (com um favicon/nome reconhecível) para ganhar clique mesmo não sendo o #1 resultado.

**Resumo**: a conexão limão/verde/Lemo não move a agulha do algoritmo de SEO diretamente, mas **ajuda indiretamente** via marca, retenção, backlinks e diferenciação — o que, especialmente para as próximas ferramentas do "ecossistema Lemo", é mais valioso a médio prazo do que só otimizar meta tags. O trabalho técnico de SEO (conteúdo, performance, sitemap, dados estruturados, já cobertos na seção de SEO do plano) continua sendo o que efetivamente move o ranking — a marca é o que faz esse tráfego querer voltar e se lembrar de você.

## Resumo de tokens (pronto para Tailwind config)

```js
colors: {
  bg: {
    base: '#0B1710',
    surface: '#0F1712',
    card: '#16211A',
  },
  border: '#233026',
  text: {
    primary: '#F5F7F6',
    muted: '#A8B3AE',
  },
  brand: {
    emerald500: '#10B981',
    emerald400: '#34D399',
    lime400: '#A3E635',
  },
  feedback: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
}
```

### CSS variables para suportar os 2 temas (dark padrão + light via toggle)

```css
:root {
  --bg-base: #0B1710;
  --bg-surface: #0F1712;
  --bg-card: #16211A;
  --border: #233026;
  --text-primary: #F5F7F6;
  --text-muted: #A8B3AE;
  --brand-primary: #10B981;   /* emerald-500 */
  --brand-accent: #34D399;    /* emerald-400 */
  --brand-cta: #A3E635;       /* lime-400 */
  --feedback-success: #34D399;
  --feedback-warning: #FBBF24;
  --feedback-error: #F87171;
}

[data-theme='light'] {
  --bg-base: #F7FAF7;
  --bg-surface: #FFFFFF;
  --bg-card: #FFFFFF;
  --border: #D8E3D9;
  --text-primary: #10241A;
  --text-muted: #4B5A52;
  --brand-primary: #047857;   /* emerald-700 */
  --brand-accent: #065F46;    /* emerald-800 */
  --brand-cta: #84CC16;       /* lime-500 */
  --feedback-success: #047857;
  --feedback-warning: #B45309;
  --feedback-error: #DC2626;
}
```

No Tailwind, mapear as cores para essas variáveis (`bg-base: 'var(--bg-base)'`, etc.) em vez de valores fixos — assim o mesmo `className="bg-bg-base text-text-primary"` funciona nos dois temas sem duplicar markup.
