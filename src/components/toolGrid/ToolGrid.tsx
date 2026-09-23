import Link from "next/link";
import type { NavItem } from "@/config/site";
import styles from "./ToolGrid.module.scss";

type ToolGridProps = {
  items: NavItem[];
};

export default function ToolGrid({ items }: ToolGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) =>
        item.available ? (
          <Link key={item.slug} href={`/${item.slug}/`} className={styles.card}>
            <span className={`${styles.badge} ${styles.badgeAvailable}`}>Disponível</span>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardDescription}>{item.description}</p>
            <span className={styles.cardAction}>Acessar ferramenta &rarr;</span>
          </Link>
        ) : (
          <article key={item.slug} className={`${styles.card} ${styles.cardSoon}`}>
            <span className={`${styles.badge} ${styles.badgeSoon}`}>Em breve</span>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardDescription}>{item.description}</p>
          </article>
        ),
      )}
    </div>
  );
}
