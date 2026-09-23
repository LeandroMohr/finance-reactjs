import Link from "next/link";
import type { NavItem } from "@/config/site";
import styles from "./ToolGrid.module.scss";

type ToolGridProps = {
  items: NavItem[];
};

export default function ToolGrid({ items }: ToolGridProps) {
  const sections = items.reduce<{ title: string; items: NavItem[] }[]>((groups, item) => {
    const existing = groups.find((group) => group.title === item.section);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ title: item.section, items: [item] });
    }

    return groups;
  }, []);

  return (
    <div className={styles.sections}>
      {sections.map((section, sectionIndex) => {
        const headingId = `tool-section-${sectionIndex}`;

        return (
          <section key={section.title} className={styles.section} aria-labelledby={headingId}>
            <h2 id={headingId} className={styles.sectionTitle}>
              {section.title}
            </h2>
            <div className={styles.grid}>
              {section.items.map((item) =>
                item.available ? (
                  <Link key={item.slug} href={`/${item.slug}/`} className={styles.card}>
                    <span className={`${styles.badge} ${styles.badgeAvailable}`}>Disponível</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDescription}>{item.description}</p>
                    <span className={styles.cardAction}>Acessar ferramenta &rarr;</span>
                  </Link>
                ) : (
                  <article key={item.slug} className={`${styles.card} ${styles.cardSoon}`}>
                    <span className={`${styles.badge} ${styles.badgeSoon}`}>Em breve</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDescription}>{item.description}</p>
                  </article>
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
