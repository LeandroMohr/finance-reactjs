import type { Metadata } from "next";
import InstitutionalPage, {
  type InstitutionalSection,
} from "@/components/institutionalPage/InstitutionalPage";
import { siteConfig } from "@/config/site";

const canonical = "/sobre-nos/";
const description =
  "Conheça o propósito, os princípios e a autoria do Lemo Finance, um projeto de ferramentas financeiras gratuitas.";

export const metadata: Metadata = {
  title: "Sobre nós",
  description,
  alternates: { canonical },
  openGraph: {
    title: `${siteConfig.name} | Sobre nós`,
    description,
    url: new URL(canonical, siteConfig.url).toString(),
    type: "website",
  },
};

const sections: InstitutionalSection[] = [
  {
    id: "projeto",
    title: "Um projeto para decisões mais claras",
    content: (
      <>
        <p>
          O {siteConfig.name} é um projeto independente que reúne calculadoras e ferramentas para
          ajudar no planejamento financeiro. A proposta é transformar fórmulas e comparações em
          experiências simples de usar e fáceis de conferir.
        </p>
        <p>
          Todas as ferramentas publicadas podem ser acessadas gratuitamente e sem cadastro. Os
          valores informados nas simulações permanecem no navegador do usuário.
        </p>
      </>
    ),
  },
  {
    id: "proposito",
    title: "Por que o Lemo Finance existe",
    content: (
      <>
        <p>
          Decisões financeiras costumam envolver taxas, prazos e hipóteses difíceis de comparar. O
          projeto existe para reduzir essa fricção, apresentando resultados objetivos sem esconder as
          premissas usadas no cálculo.
        </p>
        <p>
          A ferramenta não decide pelo usuário. Ela organiza cenários para que cada pessoa possa
          investigar possibilidades, fazer perguntas melhores e confirmar condições antes de agir.
        </p>
      </>
    ),
  },
  {
    id: "principios",
    title: "Como construímos",
    content: (
      <ul>
        <li>
          <strong>Clareza:</strong> explicar fórmulas, premissas e limitações em linguagem direta.
        </li>
        <li>
          <strong>Privacidade:</strong> evitar cadastro e processar as simulações localmente sempre
          que possível.
        </li>
        <li>
          <strong>Acessibilidade:</strong> criar páginas responsivas, navegáveis e legíveis em
          diferentes dispositivos.
        </li>
        <li>
          <strong>Confiabilidade:</strong> testar os cálculos e sinalizar onde uma estimativa pode
          divergir da prática.
        </li>
      </ul>
    ),
  },
  {
    id: "independencia",
    title: "Informação, não recomendação",
    content: (
      <>
        <p>
          O {siteConfig.name} não é banco, corretora ou consultoria de investimentos. Não intermedia
          produtos financeiros nem oferece recomendações personalizadas de compra, venda, crédito ou
          investimento.
        </p>
        <p>
          O conteúdo tem finalidade educativa. Antes de uma decisão, é importante conferir taxas,
          impostos, contratos e regras junto às instituições envolvidas e, quando necessário, buscar
          orientação profissional.
        </p>
      </>
    ),
  },
  {
    id: "autoria",
    title: "Quem faz",
    content: (
      <>
        <p>
          O {siteConfig.name} é criado e mantido por <strong>{siteConfig.author}</strong>, com foco em
          desenvolvimento de software útil, transparente e cuidadoso com os dados de quem utiliza.
        </p>
        <p>
          Sugestões, correções e dúvidas ajudam o projeto a evoluir. O canal oficial é{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: "explore",
    title: "Explore as ferramentas",
    content: (
      <ul>
        <li>
          <a href="/calculadoras/">Calculadoras</a> para simular cenários financeiros.
        </li>
        <li>
          <a href="/ferramentas/">Ferramentas</a> para converter e comparar informações.
        </li>
        <li>
          <a href="/faq/">Perguntas frequentes</a> sobre funcionamento e resultados.
        </li>
      </ul>
    ),
  },
];

export default function AboutPage() {
  return (
    <InstitutionalPage
      eyebrow="Sobre nós"
      title={`Sobre o ${siteConfig.name}`}
      description="Ferramentas financeiras gratuitas, transparentes e construídas para informar sem decidir por você."
      sections={sections}
    />
  );
}