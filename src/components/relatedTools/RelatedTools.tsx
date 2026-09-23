import Link from "next/link";
import { allNavItems } from "@/config/site";
import styles from "./RelatedTools.module.scss";

type RelatedToolsProps = {
  slugs: string[];
};

export default function RelatedTools({ slugs }: RelatedToolsProps) {
  const items = slugs.map((slug) => allNavItems.find((item) => item.slug === slug)).filter(Boolean);

  return (
    <section className={styles.section} aria-labelledby="related-tools-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Continue planejando</p>
        <h2 id="related-tools-title" className={styles.title}>
          Ferramentas relacionadas
        </h2>
      </div>

      <div className={styles.grid}>
        {items.map((item) =>
          item.available ? (
            <Link key={item.slug} href={`/${item.slug}/`} className={styles.card}>
              <span className={styles.status}>Disponível</span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
              <span className={styles.action}>Abrir ferramenta &rarr;</span>
            </Link>
          ) : (
            <article key={item.slug} className={`${styles.card} ${styles.cardSoon}`}>
              <span className={`${styles.status} ${styles.statusSoon}`}>Em breve</span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </article>
          ),
        )}
      </div>
    </section>
  );
}