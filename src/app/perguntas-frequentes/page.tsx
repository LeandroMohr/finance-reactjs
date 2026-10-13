import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import Faq from "@/components/faq/Faq";
import ShareContent from "@/components/share/ShareContent";
import { faqSections } from "@/config/faq";
import { siteConfig } from "@/config/site";
import styles from "./page.module.scss";

const canonical = "/perguntas-frequentes/";
const description =
  "Respostas sobre o Lemohr Finance, calculadoras financeiras e ferramentas disponíveis.";

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
  const categories = [...new Set(faqSections.map((section) => section.category))];
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
        {categories.map((category) => {
          const sections = faqSections.filter((section) => section.category === category);
          const headingId = `category-${sections[0].id}`;

          return (
            <section key={category} className={styles.category} aria-labelledby={headingId}>
              <h2 id={headingId} className={styles.categoryTitle}>
                {category}
              </h2>
              {sections.map((section) => (
                <Faq
                  key={section.id}
                  items={section.items}
                  eyebrow="Dúvidas sobre"
                  title={section.title}
                  headingId={`faq-${section.id}`}
                  headingLevel={3}
                  includeStructuredData={false}
                />
              ))}
            </section>
          );
        })}
      </div>

      <ShareContent path={canonical} title="Perguntas frequentes" />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </main>
  );
}