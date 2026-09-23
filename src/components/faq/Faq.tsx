import Accordion from "@/components/accordion/Accordion";
import styles from "./Faq.module.scss";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqProps = {
  items: FaqItem[];
};

export default function Faq({ items }: FaqProps) {
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
    <section className={styles.section} aria-labelledby="faq-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Tire suas dúvidas</p>
        <h2 id="faq-title" className={styles.title}>
          Perguntas frequentes
        </h2>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <Accordion key={item.question} summary={item.question}>
            <p className={styles.answer}>{item.answer}</p>
          </Accordion>
        ))}
      </div>

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </section>
  );
}