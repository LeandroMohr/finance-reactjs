import type { Metadata } from "next";
import Link from "next/link";
import Faq, { type FaqItem } from "@/components/faq/Faq";
import { navGroups, siteConfig } from "@/config/site";
import styles from "./page.module.scss";

const faqItems: FaqItem[] = [
  {
    question: "As calculadoras e ferramentas são gratuitas?",
    answer:
      "Sim. Todas as ferramentas disponíveis no Lemo Finance podem ser usadas gratuitamente e sem cadastro.",
  },
  {
    question: "Os valores informados ficam salvos?",
    answer:
      "Não. Os valores são processados no seu navegador para realizar os cálculos e não ficam salvos pelo Lemo Finance.",
  },
  {
    question: "Posso confiar nos resultados das simulações?",
    answer:
      "As ferramentas usam as fórmulas e premissas explicadas em cada página, mas os resultados são estimativas. Confirme taxas, impostos, tarifas e regras do produto antes de tomar uma decisão.",
  },
  {
    question: "Por que o resultado pode ser diferente do cálculo do banco?",
    answer:
      "Instituições podem adotar convenções de dias, arredondamentos, datas de aporte, impostos e tarifas diferentes. Confira as condições do contrato e compare-as com as premissas mostradas na ferramenta.",
  },
  {
    question: "As ferramentas substituem orientação financeira profissional?",
    answer:
      "Não. O conteúdo tem finalidade educativa e ajuda a comparar cenários, mas não constitui recomendação de investimento, crédito ou contratação de produtos financeiros.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${siteConfig.name} | Calculadoras e Ferramentas Financeiras`,
    description: siteConfig.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: `${siteConfig.name} | Ferramentas Financeiras`,
      description: siteConfig.description,
      url: siteConfig.url,
      type: "website",
    },
  };
}

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{siteConfig.name}</p>
        <h1 className={styles.title}>Simule, planeje e faça seu dinheiro render</h1>
      </section>

      <section className={styles.hubs} aria-label="Categorias">
        <div className={styles.hubGrid}>
          {navGroups.map((group) => {
            const availableCount = group.items.filter((item) => item.available).length;

            return (
              <Link key={group.id} href={`/${group.id}/`} className={styles.hubCard}>
                <h2 className={styles.hubTitle}>{group.label}</h2>
                <p className={styles.hubDescription}>{group.description}</p>
                <span className={styles.hubMeta}>
                  {availableCount} de {group.items.length} dispon{availableCount === 1 ? "ível" : "íveis"}
                </span>
                <span className={styles.hubAction}>
                  Ver {group.label.toLowerCase()} &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <Faq items={faqItems} />
    </main>
  );
}
