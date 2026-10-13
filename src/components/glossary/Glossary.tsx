"use client";

import { useEffect, useState } from "react";
import Accordion from "@/components/accordion/Accordion";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import ShareContent from "@/components/share/ShareContent";
import { alphabet, getGlossaryGroups, glossaryTerms } from "@/config/glossary";
import { trackEvent } from "@/utils/analytics";
import styles from "./Glossary.module.scss";

export default function Glossary() {
  const [query, setQuery] = useState("");
  const groups = getGlossaryGroups(query);
  const count = groups.reduce((total, group) => total + group.terms.length, 0);
  const availableLetters = new Set(groups.map((group) => group.letter));

  useEffect(() => {
    if (!query.trim()) return;
    const timer = window.setTimeout(() => {
      trackEvent("glossary_search", { result_count: count, query_length: query.trim().length });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [query, count]);

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: "Glossário financeiro" }]} />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Aprenda para planejar</p>
        <h1>Glossário financeiro</h1>
        <p>Entenda os termos usados em planejamento, crédito, Tesouro, fundos, índices e criptoativos.
          Consulte definições, fórmulas e exemplos. Valores de cálculo são fictícios;
          ativos citados servem apenas para ilustrar os conceitos, sem recomendação de compra.</p>
      </header>
      <div className={styles.search}>
        <label htmlFor="glossary-search">Buscar termo, sigla ou descrição</label>
        <div className={styles.searchRow}>
          <input id="glossary-search" type="search" placeholder="Ex.: juros, P/VP, dividendos"
            value={query} onChange={(event) => setQuery(event.target.value)}
            aria-describedby="glossary-count" />
          {query && <button type="button" onClick={() => setQuery("")}>Limpar busca</button>}
        </div>
        <p id="glossary-count" role="status" aria-label="Resultados da busca">
          {count} {count === 1 ? "termo encontrado" : "termos encontrados"} de {glossaryTerms.length}.
        </p>
      </div>
      <nav className={styles.alphabet} aria-label="Índice alfabético do glossário">
        {alphabet.map((letter) => availableLetters.has(letter)
          ? <a key={letter} href={`#letra-${letter.toLowerCase()}`} aria-label={`Ir para letra ${letter}`}>{letter}</a>
          : <span key={letter} aria-label={`Letra ${letter} sem resultados`} aria-disabled="true">{letter}</span>)}
      </nav>
      <p className={styles.notice}>
        Conteúdo educativo, não recomendação de investimento. Indicadores isolados não determinam
        se um ativo é bom ou barato. Confira período, metodologia e condições de cada produto.
      </p>
      {groups.length === 0
        ? <p className={styles.empty}>Nenhum termo encontrado. Tente outra palavra, sigla ou limpe a busca.</p>
        : groups.map((group) => (
          <section key={group.letter} id={`letra-${group.letter.toLowerCase()}`}
            className={styles.letterSection} aria-labelledby={`titulo-letra-${group.letter.toLowerCase()}`}>
            <h2 id={`titulo-letra-${group.letter.toLowerCase()}`}>{group.letter}</h2>
            <div className={styles.terms}>
              {group.terms.map((term) => (
                <article key={term.id} id={`termo-${term.id}`} className={styles.term}
                  aria-labelledby={`titulo-${term.id}`}>
                  <h3 id={`titulo-${term.id}`}>
                    <a href={`#termo-${term.id}`}>{term.name}</a>
                  </h3>
                  {term.aliases && <p className={styles.aliases}>Também conhecido como: {term.aliases.join(", ")}.</p>}
                  <p>{term.description}</p>
                  {term.formula && <p className={styles.formula}><strong>Como calcular:</strong> {term.formula}</p>}
                  {term.example && <p className={styles.example}><strong>Exemplo:</strong> {term.example}</p>}
                  {term.caution && <p className={styles.caution}><strong>Atenção:</strong> {term.caution}</p>}
                </article>
              ))}
            </div>
          </section>
        ))}
      <section className={styles.sources} aria-labelledby="glossary-sources">
        <Accordion summary={<h2 id="glossary-sources">Referências e critérios</h2>}>
        <p>Textos redigidos para o Lemo Finance. As referências orientam os temas e conceitos,
          sem reprodução literal. Exemplos são simplificados e não usam cotações atuais.</p>
        <ul>
          <li><a href="https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Informacoes_gerais/glossario_cidadania_financeira.pdf"
            target="_blank" rel="noopener noreferrer">Banco Central: glossário de cidadania financeira (PDF)</a></li>
          <li><a href="https://statusinvest.com.br/acoes/busca-avancada" target="_blank" rel="noopener noreferrer">Status Invest: indicadores de ações</a></li>
          <li><a href="https://statusinvest.com.br/fundos-imobiliarios/busca-avancada" target="_blank" rel="noopener noreferrer">Status Invest: indicadores de FIIs</a></li>
          <li><a href="https://www.b3.com.br/pt_br/market-data-e-indices/indices/" target="_blank" rel="noopener noreferrer">B3: índices de mercado</a></li>
          <li><a href="https://portalibre.fgv.br/indices-de-precos" target="_blank" rel="noopener noreferrer">FGV IBRE: índices de preços</a></li>
          <li><a href="https://www.ibge.gov.br/explica/inflacao.php" target="_blank" rel="noopener noreferrer">IBGE: inflação, IPCA e INPC</a></li>
          <li><a href="https://www.anbima.com.br/pt_br/informar/indices/ima.htm" target="_blank" rel="noopener noreferrer">ANBIMA: índices de títulos públicos</a></li>
          <li><a href="https://www.tesourodireto.com.br/" target="_blank" rel="noopener noreferrer">Tesouro Direto: títulos públicos</a></li>
          <li><a href="https://www.gov.br/investidor/pt-br/investir/tipos-de-investimentos/fundos-de-investimentos" target="_blank" rel="noopener noreferrer">Portal do Investidor (CVM): fundos de investimento</a></li>
          <li><a href="https://www.gov.br/susep/pt-br/assuntos/meu-futuro-seguro/seguros-previdencia-e-capitalizacao/providencia-complementar-aberta/pgbl-vgbl" target="_blank" rel="noopener noreferrer">SUSEP: PGBL, VGBL e portabilidade</a></li>
          <li><a href="https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/imposto-de-renda/dirpf/declaracao/pgvl-vgbl" target="_blank" rel="noopener noreferrer">Receita Federal: tributação de PGBL e VGBL</a></li>
          <li><a href="https://www.stern.nyu.edu/faculty/bio/aswath-damodaran" target="_blank" rel="noopener noreferrer">NYU Stern: Aswath Damodaran</a></li>
          <li><a href="https://www.investopedia.com/terms/g/gordongrowthmodel.asp" target="_blank" rel="noopener noreferrer">Investopedia: modelo de Gordon</a></li>
          <li><a href="https://conteudos.xpi.com.br/fundos-imobiliarios/relatorios/indices-de-fundos-imobiliarios-xpfi-xpft-xpfp/" target="_blank" rel="noopener noreferrer">XP: índices de fundos imobiliários</a></li>
          <li><a href="https://www.suno.com.br/noticias/kisu11-fundo-investimento-suno30-fiis/" target="_blank" rel="noopener noreferrer">Suno: índice Suno 30</a></li>
          <li><a href="https://www.spglobal.com/spdji/en/indices/equity/sp-500/" target="_blank" rel="noopener noreferrer">S&amp;P Dow Jones Indices: índices americanos</a></li>
          <li><a href="https://bitcoin.org/pt_BR/faq" target="_blank" rel="noopener noreferrer">Bitcoin: conceitos e funcionamento</a></li>
          <li><a href="https://ethereum.org/pt-br/learn/" target="_blank" rel="noopener noreferrer">Ethereum: rede e conceitos de criptoativos</a></li>
          <li><a href="https://tether.to/en/transparency/" target="_blank" rel="noopener noreferrer">Tether: informações sobre reservas</a></li>
          <li><a href="https://litecoin.org/" target="_blank" rel="noopener noreferrer">Litecoin: projeto e funcionamento</a></li>
          <li><a href="https://cardano.org/" target="_blank" rel="noopener noreferrer">Cardano: rede e participação</a></li>
          <li><a href="https://www.bcb.gov.br/controleinflacao/relatoriofocus" target="_blank" rel="noopener noreferrer">Banco Central: Boletim Focus</a></li>
          <li><a href="https://www.bcb.gov.br/controleinflacao/taxaselic" target="_blank" rel="noopener noreferrer">Banco Central: taxa Selic</a></li>
          <li><a href="https://www.planalto.gov.br/ccivil_03/leis/l8245.htm" target="_blank" rel="noopener noreferrer">Lei do Inquilinato: regras de caução</a></li>
          <li><a href="https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida" target="_blank" rel="noopener noreferrer">Ministério das Cidades: Minha Casa, Minha Vida</a></li>
          <li><a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noopener noreferrer">Receita Federal: tributos e Imposto de Renda</a></li>
          <li><a href="https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026" target="_blank" rel="noopener noreferrer">Receita Federal: tabelas de tributação de 2026</a></li>
          <li><a href="https://www.gov.br/investidor/pt-br/investir/como-investir/ofertas-publicas-de-distribuicao/oferta-primaria-x-secundaria" target="_blank" rel="noopener noreferrer">CVM: ofertas primárias e secundárias</a></li>
          <li><a href="https://conteudo.cvm.gov.br/legislacao/resolucoes/resol030.html" target="_blank" rel="noopener noreferrer">CVM: perfil e classificação de investidores</a></li>
          <li><a href="https://borainvestir.b3.com.br/glossario/data-de-liquidacao/" target="_blank" rel="noopener noreferrer">B3: prazos de liquidação</a></li>
        </ul>
        </Accordion>
      </section>
      <ShareContent path="/glossario/" title="Glossário financeiro" />
    </main>
  );
}
