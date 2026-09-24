<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pesquisa e comparativo de ferramentas

Toda pesquisa, benchmark ou levantamento de FAQ/textos explicativos de calculadoras deve partir
destas três referências:

1. https://investidor10.com.br/calculadoras/
2. https://investidorsardinha.r7.com/calculadoras
3. https://www.mobills.com.br/calculadoras/

Use `npm run research:crawl` ([scripts/crawl-reference.mjs](scripts/crawl-reference.mjs)) — elas já são
o padrão do script. Flags: `--limit N`, `--index <url>`, `--out <dir>` ou URLs avulsas. A saída vai para
`.research/<host>/` (fora do Git).

O material coletado é de terceiros e protegido por direitos autorais: serve como referência de estrutura
e de pauta, nunca para publicação literal. Todo texto publicado deve ser reescrito com palavras próprias.

