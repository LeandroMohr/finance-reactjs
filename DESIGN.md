# Identidade Visual — Lemo (finance-reactjs)

Este documento define paleta de cores, tipografia e diretrizes de identidade/mascote para as calculadoras financeiras, com foco em tema escuro + verde e conformidade **WCAG AA**.

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

### Acessibilidade além do contraste de cor

- **Nunca comunicar só por cor**: erros de validação devem ter ícone + texto, não só borda vermelha (usuários com daltonismo, ~8% dos homens têm dificuldade em diferenciar vermelho/verde — relevante justamente por usarmos verde como cor central).
- **Foco visível**: outline de foco com `brand-lime-400` em 2px mínimo, nunca remover `:focus` sem substituir por alternativa visível (navegação por teclado).
- **Tamanho mínimo de fonte**: 16px para texto de corpo (evita zoom automático em iOS e melhora legibilidade).
- **Área de toque**: mínimo 44x44px para botões/inputs em mobile.
- **`prefers-color-scheme`**: como o tema escuro é a identidade da marca, manter dark como padrão fixo (não alternar automaticamente para light) reforça consistência de marca — mas garantir que o dark mode em si já está AA/AAA (validado acima), então não há prejuízo de acessibilidade em fixá-lo.
- **Ferramentas para validar durante o desenvolvimento**: WebAIM Contrast Checker, extensão Stark (Figma/Chrome), `axe DevTools` (Chrome extension) rodando no site publicado.

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
