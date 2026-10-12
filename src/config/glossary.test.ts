import { describe, expect, it } from "vitest";
import { alphabet, getGlossaryGroups, glossaryTerms, normalizeGlossarySearch } from "./glossary";

describe("glossary catalog", () => {
  it("has unique stable IDs and complete original definitions", () => {
    expect(new Set(glossaryTerms.map((term) => term.id)).size).toBe(glossaryTerms.length);
    for (const term of glossaryTerms) {
      expect(term.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(term.description.length).toBeGreaterThan(50);
      if (term.formula) expect(term.example).toBeTruthy();
    }
  });

  it("groups every term once and orders letters and names", () => {
    const groups = getGlossaryGroups("");
    expect(groups.flatMap((group) => group.terms)).toHaveLength(glossaryTerms.length);
    expect(groups.map((group) => group.letter)).toEqual(
      alphabet.filter((letter) => groups.some((group) => group.letter === letter)),
    );
    for (const group of groups) {
      expect(group.terms.map((term) => term.name)).toEqual(
        group.terms.map((term) => term.name).sort((a, b) => a.localeCompare(b, "pt-BR")),
      );
    }
  });

  it("includes examples for ON, PN and units, with units grouped under U", () => {
    for (const id of ["acao-ordinaria", "acao-preferencial", "unit"]) {
      expect(glossaryTerms.find((term) => term.id === id)?.example).toBeTruthy();
    }
    expect(getGlossaryGroups("unit").find((group) => group.letter === "U")?.terms.map((term) => term.id)).toContain("unit");
    expect(getGlossaryGroups("certificado de depósito de ações").flatMap((group) => group.terms).map((term) => term.id)).toContain("unit");
  });

  it("includes Brazilian tickers in examples and makes them searchable", () => {
    for (const [ticker, id] of [
      ["BBAS3", "acao-ordinaria"], ["VALE3", "acao-ordinaria"],
      ["PETR4", "acao-preferencial"], ["ITUB4", "acao-preferencial"],
      ["TAEE11", "unit"], ["TAEE3", "unit"], ["TAEE4", "unit"],
      ["BOVA11", "etf"], ["HGLG11", "fii"],
    ]) {
      expect(glossaryTerms.find((term) => term.id === id)?.example).toContain(ticker);
      expect(getGlossaryGroups(ticker).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
    }
    expect(glossaryTerms.find((term) => term.id === "unit")?.example).toBe("TAEE11 (1 TAEE3 + 2 TAEE4).");
    expect(getGlossaryGroups("código de negociação").flatMap((group) => group.terms).map((term) => term.id)).toContain("ticker");
  });

  it.each(["AÇÃO", "acao", "  ação  "])("ignores accents, casing and whitespace: %s", (query) => {
    expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain("acao");
  });

  it("searches aliases, definitions, formulas and examples", () => {
    for (const [query, id] of [
      ["LPA", "lucro-por-acao"], ["resgate", "cdb"], ["preço sobre lucro", "p-l"],
      ["0,9489", "taxa-equivalente"], ["P/VP", "p-vp"],
    ]) {
      expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
    }
  });

  it("matches all search words and handles no results", () => {
    expect(getGlossaryGroups("capital JUROS").flatMap((group) => group.terms).map((term) => term.id)).toContain("juros-compostos");
    expect(getGlossaryGroups("xyz-inexistente")).toEqual([]);
    expect(normalizeGlossarySearch("Inflação")).toBe("inflacao");
  });

  it("keeps ticker examples concise", () => {
    for (const [id, example] of [
      ["acao-ordinaria", "BBAS3, VALE3."],
      ["acao-preferencial", "PETR4, ITUB4."],
      ["unit", "TAEE11 (1 TAEE3 + 2 TAEE4)."],
      ["etf", "BOVA11."],
      ["fii", "HGLG11."],
    ]) {
      expect(glossaryTerms.find((term) => term.id === id)?.example).toBe(example);
    }
  });

  it.each([
    ["IGPM", "igp-m"], ["IGP-DI", "igp-di"], ["INCC", "incc"],
    ["INPC", "inpc"], ["IBOV", "ibovespa"], ["small caps", "smll"],
    ["IBrX 100", "ibrx-100"], ["IFIX", "ifix"], ["IDIV", "idiv"],
    ["IMA-B", "ima-b"],
  ])("finds the index %s", (query, id) => {
    expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
  });

  it("separates bank credit letters from receivables certificates", () => {
    expect(glossaryTerms.some((term) => term.id === "lci-lca")).toBe(false);
    for (const id of ["lci", "lca", "cri", "cra"]) {
      const term = glossaryTerms.find((term) => term.id === id);
      expect(term?.name).toBe(id.toUpperCase());
      expect(getGlossaryGroups(term!.aliases![0]).flatMap((group) => group.terms).map((item) => item.id)).toContain(id);
      expect(term?.caution).toContain("FGC");
    }
    for (const id of ["cri", "cra"]) {
      expect(glossaryTerms.find((term) => term.id === id)?.caution).toContain("Não tem garantia do FGC");
    }
  });

  it("explains technical vocabulary and distinguishes IFIX return from prices alone", () => {
    expect(glossaryTerms.find((term) => term.id === "patrimonio-liquido")?.description).toContain("chamado de ativos");
    expect(glossaryTerms.find((term) => term.id === "ebitda")?.description).toContain("não são o pagamento de uma dívida");
    expect(glossaryTerms.find((term) => term.id === "ifix")?.description).toContain("rendimentos distribuídos");
    expect(glossaryTerms.find((term) => term.id === "smll")?.description).toContain("preço das ações multiplicado");
  });

  it("covers all requested investment families with individual entries", () => {
    const ids = glossaryTerms.map((term) => term.id);
    expect(ids).toEqual(expect.arrayContaining([
      "tesouro-selic", "tesouro-ipca", "tesouro-educa", "tesouro-renda", "tesouro-prefixado",
      "indexador", "igp-m", "ipca", "cdi", "selic",
      "ibovespa", "idiv", "smll", "ibra", "ibrx-100", "ibrx-50", "ico2", "icon",
      "iee", "ifnc", "igct", "igc", "ignm", "imat", "imob", "indx", "ise", "itag",
      "ivbx-2", "mlcx", "util", "ifix", "suno-30", "xpfi", "xpfp", "xpft", "bdrx",
      "sp-midcap-400", "sp-100", "sp-500",
      "fundo-investimento", "fiagro", "fia", "fidc", "fip", "fi-infra",
      "criptomoeda", "bitcoin", "ethereum", "tether", "litecoin", "cardano",
    ]));
  });

  it.each([
    ["Tesouro IPCA+", "tesouro-ipca"], ["Tesouro Educa+", "tesouro-educa"],
    ["Tesouro RendA+", "tesouro-renda"], ["IBXL", "ibrx-50"], ["IEEX", "iee"],
    ["IGCX", "igc"], ["ISEE", "ise"], ["IVBX", "ivbx-2"], ["SNFI", "suno-30"],
    ["XPFP", "xpfp"], ["XPFT", "xpft"], ["BDRX", "bdrx"],
    ["S&P MIDCAP", "sp-midcap-400"], ["OEX", "sp-100"], ["SPX", "sp-500"],
    ["FIAGRO", "fiagro"], ["Fundo de Investimento em Direitos Creditórios", "fidc"],
    ["FI-Infra", "fi-infra"], ["BTC", "bitcoin"], ["ETH", "ethereum"],
    ["USDT", "tether"], ["LTC", "litecoin"], ["ADA", "cardano"],
    ["smart contract", "contrato-inteligente"], ["wallet", "carteira-cripto"],
    ["proof of stake", "proof-of-stake"],
  ])("finds the expanded catalog entry %s", (query, id) => {
    expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
  });

  it("provides examples for crypto groups without promising safety", () => {
    for (const [id, examples] of [
      ["stablecoin", ["USDT", "USDC"]],
      ["memecoin", ["DOGE", "SHIB"]],
      ["altcoin", ["ETH", "LTC", "ADA"]],
      ["token-governanca", ["UNI", "AAVE"]],
      ["token-utilidade", ["BAT"]],
      ["defi", ["Uniswap", "Aave"]],
    ] as const) {
      const term = glossaryTerms.find((item) => item.id === id);
      for (const example of examples) expect(term?.example).toContain(example);
      expect(term?.caution).toBeTruthy();
    }
    expect(glossaryTerms.find((term) => term.id === "stablecoin")?.caution).toContain("Pode perder");
    expect(glossaryTerms.find((term) => term.id === "ethereum")?.description).toContain("Ether (ETH)");
  });

  it("distinguishes Treasury monthly payments from lifelong income", () => {
    expect(glossaryTerms.find((term) => term.id === "tesouro-educa")?.description).toContain("60 pagamentos mensais");
    expect(glossaryTerms.find((term) => term.id === "tesouro-renda")?.description).toContain("240 pagamentos mensais");
    expect(glossaryTerms.find((term) => term.id === "tesouro-renda")?.caution).toContain("Não é renda vitalícia");
    for (const id of ["tesouro-ipca", "tesouro-educa", "tesouro-renda", "tesouro-prefixado"]) {
      expect(glossaryTerms.find((term) => term.id === id)?.caution?.toLowerCase()).toContain("perdas");
    }
  });

  it("includes planning, economic, risk, housing and valuation terms", () => {
    expect(glossaryTerms.map((term) => term.id)).toEqual(expect.arrayContaining([
      "fomo", "meta", "objetivo", "sonho", "milestone", "ativos", "passivos", "smart", "roadmap",
      "boletim-focus", "pib", "copom", "selic-meta", "selic-over", "taxa-juros",
      "risco-sistematico", "risco-nao-sistematico", "diversificacao", "risco-credito",
      "risco-mercado", "risco-liquidez", "risco-operacional", "risco-legal", "risco-vacancia",
      "curto-prazo", "medio-prazo", "longo-prazo", "juro-nominal", "taxa-real",
      "iptu", "itbi", "minha-casa-minha-vida", "caucao", "receita-federal", "imposto-renda",
      "sac", "price", "consorcio", "valor-presente", "valor-futuro", "fluxo-caixa",
      "custo-oportunidade", "tma", "tir", "vpl",
    ]));
    expect(glossaryTerms.some((term) => term.id === "juros-simples")).toBe(false);
  });

  it.each([
    ["Fear of missing out", "fomo"], ["S.M.A.R.T", "smart"], ["Marco", "milestone"],
    ["Juro real", "taxa-real"], ["Juros real", "taxa-real"], ["Juros nominais", "juro-nominal"],
    ["Relatório Focus", "boletim-focus"], ["Selic (Meta)", "selic-meta"],
    ["Selic (Over)", "selic-over"], ["Risco específico", "risco-nao-sistematico"],
    ["MCMV", "minha-casa-minha-vida"], ["RF", "receita-federal"], ["Leão", "receita-federal"],
    ["IR", "imposto-renda"], ["PV", "valor-presente"], ["FV", "valor-futuro"],
    ["Taxa Interna de Retorno", "tir"], ["Valor Presente Líquido", "vpl"],
  ])("finds the planning and finance term %s", (query, id) => {
    expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
  });

  it("keeps real interest under one entry and avoids misleading financial guarantees", () => {
    expect(glossaryTerms.filter((term) => term.aliases?.includes("Juro real"))).toHaveLength(1);
    expect(glossaryTerms.find((term) => term.id === "tir")?.caution).toContain("não significa necessariamente prejuízo");
    expect(glossaryTerms.find((term) => term.id === "diversificacao")?.caution).toContain("Não existe um número universal");
    expect(glossaryTerms.find((term) => term.id === "boletim-focus")?.caution).toContain("não previsões garantidas");
    expect(glossaryTerms.find((term) => term.id === "caucao")?.description).toContain("até três meses");
    expect(glossaryTerms.find((term) => term.id === "cet")?.caution).toContain("prazos forem diferentes");
  });

  it("uses correctly rounded values in interest and present-value examples", () => {
    const realPercent = ((1 + 0.14) / (1 + 0.10) - 1) * 100;
    expect(realPercent.toFixed(2)).toBe("3.64");
    expect(glossaryTerms.find((term) => term.id === "taxa-real")?.example).toContain("3,64%");
    const nominalPercent = ((2853.12 - 1000) / 1000) * 100;
    expect(nominalPercent.toFixed(2)).toBe("185.31");
    expect(glossaryTerms.find((term) => term.id === "juro-nominal")?.example).toContain("185,31%");
    expect(1100 / 1.1).toBeCloseTo(1000);
    expect(1000 * 1.1 ** 2).toBeCloseTo(1210);
    expect(-1000 + 1100 / 1.1).toBeCloseTo(0);
  });

  it("covers exchange mechanics, taxation, rates and order types", () => {
    expect(glossaryTerms.map((term) => term.id)).toEqual(expect.arrayContaining([
      "b3", "corretora-valores", "investidor", "investidor-qualificado",
      "mercado-primario", "mercado-secundario", "ipo", "mercado-balcao",
      "d-mais", "liquidez-diaria", "iof", "ir-regressivo",
      "taxa-prefixada", "taxa-pos-fixada", "taxa-hibrida",
      "commodities", "cotacao", "lote-padrao", "mercado-fracionario", "prazo-liquidacao",
      "ordem-limitada", "ordem-mercado", "ordem-agendada", "ordem-stop", "stop-movel",
      "ordem-oco", "validade-ordem", "ordem-dia", "ordem-datada", "ordem-vac",
      "ordem-eoc", "ordem-fok",
    ]));
  });

  it.each([
    ["Bovespa", "b3"], ["Brasil Bolsa e Balcão", "b3"], ["Corretoras de valores", "corretora-valores"],
    ["Oferta Pública Inicial", "ipo"], ["D+0", "d-mais"], ["D+15", "d-mais"],
    ["IOF", "iof"], ["IR regressivo", "ir-regressivo"], ["Pós-fixada", "taxa-pos-fixada"],
    ["Híbrida", "taxa-hibrida"], ["Commodity", "commodities"], ["BBAS3F", "mercado-fracionario"],
    ["Stop loss", "ordem-stop"], ["Trailing stop", "stop-movel"], ["OCO", "ordem-oco"],
    ["VAC", "ordem-vac"], ["EOC", "ordem-eoc"], ["IOC", "ordem-eoc"], ["FOK", "ordem-fok"],
    ["Exchange Traded Fund", "etf"], ["Brazilian Depositary Receipts", "bdr"],
  ])("finds the trading term %s", (query, id) => {
    expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
  });

  it("distinguishes partial immediate execution from full immediate execution", () => {
    expect(glossaryTerms.find((term) => term.id === "ordem-eoc")?.example).toContain("executa 50 e cancela as outras 50");
    expect(glossaryTerms.find((term) => term.id === "ordem-fok")?.example).toContain("não executa nenhuma");
    expect(glossaryTerms.find((term) => term.id === "ordem-fok")?.caution).toContain("Não espera até o fim do dia");
    expect(glossaryTerms.find((term) => term.id === "ordem-stop")?.caution).toContain("não garante execução");
    expect(glossaryTerms.find((term) => term.id === "ordem-limitada")?.caution).toContain("não garante execução");
  });

  it("covers funds, pension plans, investor profiles, authors and financial statements", () => {
    expect(glossaryTerms.map((term) => term.id)).toEqual(expect.arrayContaining([
      "fundo-aberto", "fundo-fechado", "fundo-passivo", "fundo-ativo",
      "perfil-risco", "perfil-conservador", "perfil-moderado", "perfil-arrojado",
      "previdencia-privada", "vgbl", "pgbl", "tributacao-progressiva-previdencia",
      "tributacao-regressiva-previdencia", "portabilidade-previdencia", "sucessao-patrimonial",
      "come-cotas", "fii-hibrido", "fii-hedge-fund", "hedge-fund", "fundo-multimercado",
      "fundo-fundos", "empresa-ciclica", "empresa-nao-ciclica",
      "aswath-damodaran", "benjamin-graham", "decio-bazin", "myron-gordon", "modelo-gordon",
      "luiz-barsi", "peter-lynch", "warren-buffett", "george-soros", "ray-dalio", "dre", "dfc",
    ]));
  });

  it.each([
    ["Fundos abertos", "fundo-aberto"], ["Fundos fechados", "fundo-fechado"],
    ["Fundos indexados", "fundo-passivo"], ["Gestão ativa", "fundo-ativo"],
    ["Suitability", "perfil-risco"], ["Tabela progressiva", "tributacao-progressiva-previdencia"],
    ["Tabela regressiva da previdência", "tributacao-regressiva-previdencia"],
    ["PGBL", "pgbl"], ["VGBL", "vgbl"], ["Portabilidade", "portabilidade-previdencia"],
    ["Fundos híbridos", "fii-hibrido"], ["FOF", "fundo-fundos"],
    ["Damodaram", "aswath-damodaran"], ["Graham", "benjamin-graham"],
    ["Bazin", "decio-bazin"], ["Gordon-Shapiro", "modelo-gordon"], ["Barsi", "luiz-barsi"],
    ["Demonstração do Resultado do Exercício", "dre"], ["Fluxos de Caixa", "dfc"],
  ])("finds the fund, pension or analysis term %s", (query, id) => {
    expect(getGlossaryGroups(query).flatMap((group) => group.terms).map((term) => term.id)).toContain(id);
  });

  it("distinguishes pension tax bases, deduction limits and regimes", () => {
    expect(glossaryTerms.find((term) => term.id === "vgbl")?.description).toContain("rendimentos, não sobre todo");
    expect(glossaryTerms.find((term) => term.id === "vgbl")?.caution).toContain("não são dedutíveis");
    expect(glossaryTerms.find((term) => term.id === "pgbl")?.description).toContain("12% dos rendimentos tributáveis");
    expect(glossaryTerms.find((term) => term.id === "pgbl")?.description).toContain("valor total");
    expect(glossaryTerms.find((term) => term.id === "pgbl")?.caution).toContain("previdência oficial");
    expect(glossaryTerms.find((term) => term.id === "pgbl")?.example).toContain("R$ 12.000");
    expect(glossaryTerms.find((term) => term.id === "tributacao-progressiva-previdencia")?.caution).toContain("antecipação");
    expect(glossaryTerms.find((term) => term.id === "tributacao-regressiva-previdencia")?.description).toContain("cada aporte");
    expect(glossaryTerms.find((term) => term.id === "tributacao-regressiva-previdencia")?.example).toBe(
      "Até 2 anos: 35%; acima de 2 até 4: 30%; acima de 4 até 6: 25%; acima de 6 até 8: 20%; acima de 8 até 10: 15%; acima de 10 anos: 10%.",
    );
    expect(glossaryTerms.find((term) => term.id === "tributacao-regressiva-previdencia")?.caution).toContain("Não é a tabela regressiva de CDBs");
    expect(glossaryTerms.find((term) => term.id === "portabilidade-previdencia")?.caution).toContain("PGBL não pode ser convertido em VGBL");
  });

  it("explains fund rules without universal access, allocation or tax claims", () => {
    expect(glossaryTerms.find((term) => term.id === "fundo-aberto")?.caution).toContain("não significa saque imediato");
    expect(glossaryTerms.find((term) => term.id === "fundo-fechado")?.caution).toContain("novas emissões");
    expect(glossaryTerms.find((term) => term.id === "fundo-passivo")?.caution).toContain("necessariamente exata");
    expect(glossaryTerms.find((term) => term.id === "fundo-ativo")?.caution).toContain("Não precisa assumir sempre mais risco");
    expect(glossaryTerms.find((term) => term.id === "fii-hibrido")?.caution).toContain("Não há obrigação geral");
    expect(glossaryTerms.find((term) => term.id === "fii-hedge-fund")?.caution).toContain("Não é sinônimo");
    expect(glossaryTerms.find((term) => term.id === "come-cotas")?.example).toContain("curto prazo 20%");
    expect(glossaryTerms.find((term) => term.id === "come-cotas")?.caution).toContain("PGBL e VGBL não sofrem");
  });

  it("uses the next dividend in Gordon's example and separates earnings from cash", () => {
    expect(3 / (0.10 - 0.04)).toBeCloseTo(50);
    expect(glossaryTerms.find((term) => term.id === "modelo-gordon")?.formula).toContain("próximo período");
    expect(glossaryTerms.find((term) => term.id === "modelo-gordon")?.example).toContain("R$ 50");
    expect(glossaryTerms.find((term) => term.id === "modelo-gordon")?.caution).toContain("precisa superar");
    expect(glossaryTerms.find((term) => term.id === "dre")?.caution).toContain("não significam necessariamente dinheiro recebido");
    expect(glossaryTerms.find((term) => term.id === "dfc")?.example).toContain("operacional");
    expect(glossaryTerms.find((term) => term.id === "dfc")?.example).toContain("investimento");
    expect(glossaryTerms.find((term) => term.id === "dfc")?.example).toContain("financiamento");
  });

  it("scopes tax and liquidity rules without universal safety claims", () => {
    expect(glossaryTerms.find((term) => term.id === "ir-regressivo")?.example).toContain("a partir de 721 dias: 15%");
    expect(glossaryTerms.find((term) => term.id === "ir-regressivo")?.caution).toContain("Não é a regra de todos");
    expect(glossaryTerms.find((term) => term.id === "iof")?.caution).toContain("não vale para todo IOF");
    expect(glossaryTerms.find((term) => term.id === "liquidez-diaria")?.description).toContain("Não significa necessariamente receber no mesmo dia");
    expect(glossaryTerms.find((term) => term.id === "taxa-pos-fixada")?.caution).toContain("não significa baixo risco");
    expect(glossaryTerms.find((term) => term.id === "investidor-qualificado")?.description).toContain("declaração escrita");
    expect(glossaryTerms.find((term) => term.id === "mercado-primario")?.caution).toContain("Não se limita ao IPO");
  });
});
