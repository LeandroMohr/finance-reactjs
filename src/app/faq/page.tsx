import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import Faq from "@/components/faq/Faq";
import { faqSections } from "@/config/faq";
import { siteConfig } from "@/config/site";
import styles from "./page.module.scss";

const canonical = "/faq/";
const description =
  "Respostas sobre o Lemo Finance, calculadoras financeiras e ferramentas disponíveis.";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description,
  alternates: { canonical },
  openGraph: {
    title: `${siteConfig.name} | Perguntas frequentes`,
    description,
    url: new URL(canonical, siteConfig.url).toString(),
    type: "website",
  },
};

export default function FaqPage() {
  const items = faqSections.flatMap((section) => section.items);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: "Perguntas frequentes" }]} />

      <header className={styles.hero}>
        <h1 className={styles.title}>Perguntas frequentes</h1>
        <p className={styles.description}>
          Encontre respostas sobre o site e sobre as calculadoras e ferramentas publicadas.
        </p>
      </header>

      <div className={styles.sections}>
        {faqSections.map((section) => (
          <section
            key={section.id}
            className={styles.category}
            aria-labelledby={`category-${section.id}`}
          >
            <h2 id={`category-${section.id}`} className={styles.categoryTitle}>
              {section.category}
            </h2>
            <Faq
              items={section.items}
              eyebrow="Dúvidas sobre"
              title={section.title}
              headingId={`faq-${section.id}`}
              headingLevel={3}
              includeStructuredData={false}
            />
          </section>
        ))}
      </div>

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </main>
  );
}