#!/usr/bin/env node
// Crawls public reference pages (headings, explanatory copy and FAQ blocks) into .research/
// so the content can be studied while writing our own original copy. Never publish the output
// verbatim: it belongs to the source site.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// Default references for any research/benchmark of calculators and their explanatory copy.
const REFERENCE_INDEXES = [
  "https://investidor10.com.br/calculadoras/",
  "https://investidorsardinha.r7.com/calculadoras",
  "https://www.mobills.com.br/calculadoras/",
];
const USER_AGENT = "LemoFinanceResearchBot/1.0 (+https://calc.lemohr.com.br)";
const REQUEST_DELAY_MS = 1500;

function parseArgs(argv) {
  const options = { indexes: [], limit: 25, out: ".research", urls: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--index") options.indexes.push(argv[++i]);
    else if (arg === "--limit") options.limit = Number(argv[++i]);
    else if (arg === "--out") options.out = argv[++i];
    else if (arg.startsWith("http")) options.urls.push(arg);
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }

  if (options.indexes.length === 0 && options.urls.length === 0) {
    options.indexes = REFERENCE_INDEXES;
  }

  return options;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html,text/plain" },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

// Minimal robots.txt reader: collects the Disallow rules that apply to every user-agent.
async function loadDisallowRules(origin) {
  try {
    const body = await fetchText(new URL("/robots.txt", origin).toString());
    const rules = [];
    let applies = false;

    for (const rawLine of body.split("\n")) {
      const line = rawLine.split("#")[0].trim();
      if (!line) continue;

      const [field, ...rest] = line.split(":");
      const value = rest.join(":").trim();

      if (/^user-agent$/i.test(field)) applies = value === "*";
      else if (applies && /^disallow$/i.test(field) && value) rules.push(value);
    }

    return rules;
  } catch {
    return [];
  }
}

function isAllowed(url, rules) {
  const { pathname } = new URL(url);
  return !rules.some((rule) => pathname.startsWith(rule));
}

// Combining marks let one rule cover every accented entity (&eacute;, &Ccedil;, &atilde;, ...).
const DIACRITICS = {
  acute: "\u0301",
  grave: "\u0300",
  circ: "\u0302",
  tilde: "\u0303",
  uml: "\u0308",
  ring: "\u030a",
  cedil: "\u0327",
};

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  minus: "-",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
  deg: "°",
  ordm: "º",
  ordf: "ª",
  sup2: "²",
  sup3: "³",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  times: "×",
  divide: "÷",
  euro: "€",
  copy: "©",
  reg: "®",
  trade: "™",
  szlig: "ß",
};

// Single pass so escaped entities (&amp;eacute;) are not decoded twice.
function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const code =
        entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number(entity.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }

    const key = Object.hasOwn(NAMED_ENTITIES, entity) ? entity : entity.toLowerCase();
    if (Object.hasOwn(NAMED_ENTITIES, key)) return NAMED_ENTITIES[key];

    const accented = entity.match(/^([a-z])(acute|grave|circ|tilde|uml|ring|cedil)$/i);
    if (accented) return (accented[1] + DIACRITICS[accented[2].toLowerCase()]).normalize("NFC");

    return match;
  });
}

function toText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function stripNoise(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|iframe)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(nav|header|footer|form)\b[\s\S]*?<\/\1>/gi, "");
}

function extractFaq(html) {
  const items = [];

  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let data;
    try {
      data = JSON.parse(match[1].trim());
    } catch {
      continue;
    }

    const graph = Array.isArray(data) ? data : (data["@graph"] ?? [data]);
    for (const node of graph) {
      if (node?.["@type"] !== "FAQPage" || !Array.isArray(node.mainEntity)) continue;
      for (const question of node.mainEntity) {
        items.push({
          question: toText(String(question?.name ?? "")),
          answer: toText(String(question?.acceptedAnswer?.text ?? "")),
        });
      }
    }
  }

  return items;
}

function extractOutline(html) {
  const body = stripNoise(html);
  const sections = [];
  let current = { level: 1, heading: "(introdução)", blocks: [] };

  for (const match of body.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const tag = match[1].toLowerCase();
    const text = toText(match[2]);
    if (!text || text.length < 3) continue;

    if (tag.startsWith("h")) {
      if (current.blocks.length > 0 || sections.length === 0) sections.push(current);
      current = { level: Number(tag[1]), heading: text, blocks: [] };
    } else if (!current.blocks.includes(text)) {
      current.blocks.push(text);
    }
  }

  sections.push(current);
  return sections.filter((section) => section.blocks.length > 0);
}

function extractPage(html, url) {
  const title = toText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const description = decodeEntities(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "",
  );

  return {
    url,
    title,
    description,
    crawledAt: new Date().toISOString(),
    faq: extractFaq(html),
    sections: extractOutline(html),
  };
}

function discoverLinks(html, indexUrl) {
  const base = new URL(indexUrl);
  const found = new Set();

  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    let candidate;
    try {
      candidate = new URL(decodeEntities(match[1]), base);
    } catch {
      continue;
    }

    const isSamePage = candidate.pathname === base.pathname;
    if (candidate.host !== base.host || isSamePage) continue;
    if (!candidate.pathname.startsWith(base.pathname)) continue;

    candidate.search = "";
    candidate.hash = "";
    found.add(candidate.toString());
  }

  return [...found];
}

function slugify(url) {
  const { pathname } = new URL(url);
  return pathname.replace(/^\/|\/$/g, "").replace(/\//g, "__") || "index";
}

function toMarkdown(page) {
  const lines = [
    `# ${page.title || slugify(page.url)}`,
    "",
    `> Fonte: ${page.url}`,
    `> Coletado em: ${page.crawledAt}`,
    "> Material de referência. Reescreva com palavras próprias antes de publicar.",
    "",
  ];

  if (page.description) lines.push(`**Meta description:** ${page.description}`, "");

  for (const section of page.sections) {
    lines.push(`${"#".repeat(Math.min(section.level + 1, 6))} ${section.heading}`, "");
    for (const block of section.blocks) lines.push(`- ${block}`);
    lines.push("");
  }

  if (page.faq.length > 0) {
    lines.push("## FAQ", "");
    for (const item of page.faq) lines.push(`### ${item.question}`, "", item.answer, "");
  }

  return lines.join("\n");
}

async function crawlSite(origin, targets, options) {
  const rules = await loadDisallowRules(origin);
  const allowed = targets.filter((url) => isAllowed(url, rules));
  const blocked = targets.length - allowed.length;
  if (blocked > 0) console.log(`${blocked} url(s) ignoradas por robots.txt`);

  const outDir = path.resolve(process.cwd(), options.out, new URL(origin).host);
  await mkdir(outDir, { recursive: true });

  const summary = [];
  for (const [index, url] of allowed.entries()) {
    try {
      const page = extractPage(await fetchText(url), url);
      const slug = slugify(url);
      await writeFile(path.join(outDir, `${slug}.json`), JSON.stringify(page, null, 2));
      await writeFile(path.join(outDir, `${slug}.md`), toMarkdown(page));
      summary.push({ url, title: page.title, faq: page.faq.length, sections: page.sections.length });
      console.log(`[${index + 1}/${allowed.length}] ${slug} - ${page.faq.length} faq`);
    } catch (error) {
      console.warn(`[${index + 1}/${allowed.length}] falhou ${url}: ${error.message}`);
    }

    if (index < allowed.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  await writeFile(path.join(outDir, "_index.json"), JSON.stringify(summary, null, 2));
  console.log(`${summary.length} página(s) salvas em ${outDir}\n`);
  return summary.length;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sites = new Map();

  for (const url of options.urls) {
    const { origin } = new URL(url);
    sites.set(origin, [...(sites.get(origin) ?? []), url]);
  }

  for (const indexUrl of options.indexes) {
    console.log(`Descobrindo páginas em ${indexUrl}`);
    const { origin } = new URL(indexUrl);
    let discovered = [];
    try {
      discovered = discoverLinks(await fetchText(indexUrl), indexUrl).slice(0, options.limit);
    } catch (error) {
      console.warn(`falhou ${indexUrl}: ${error.message}`);
      continue;
    }
    sites.set(origin, [...(sites.get(origin) ?? []), ...discovered]);
  }

  let total = 0;
  for (const [origin, targets] of sites) {
    total += await crawlSite(origin, [...new Set(targets)], options);
  }

  console.log(`Total: ${total} página(s) de ${sites.size} site(s)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
