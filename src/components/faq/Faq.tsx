import Accordion from "@/components/accordion/Accordion";
import type { FaqItem } from "@/config/faq";
import styles from "./Faq.module.scss";

type FaqProps = {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
  headingId?: string;
  headingLevel?: 2 | 3;
  includeStructuredData?: boolean;
};

export default function Faq({
  items,
  eyebrow = "Tire suas dúvidas",
  title = "Perguntas frequentes",
  headingId = "faq-title",
  headingLevel = 2,
  includeStructuredData = true,
}: FaqProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
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
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <Heading id={headingId} className={styles.title}>
          {title}
        </Heading>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <Accordion key={item.question} summary={item.question}>
            <p className={styles.answer}>{item.answer}</p>
          </Accordion>
        ))}
      </div>

      {includeStructuredData ? (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      ) : null}
    </section>
  );
}