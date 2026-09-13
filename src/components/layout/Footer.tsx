import Link from "next/link";
import { navGroups, siteConfig } from "@/config/site";
import styles from "./Footer.module.scss";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandColumn}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              L
            </span>
            <span className={styles.brandName}>{siteConfig.name}</span>
          </Link>
          <p className={styles.tagline}>{siteConfig.description}</p>
        </div>

        {navGroups.map((group) => (
          <nav key={group.id} className={styles.column} aria-label={group.label}>
            <h2 className={styles.columnTitle}>{group.label}</h2>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item.slug}>
                  {item.available ? (
                    <Link href={`/${item.slug}/`} className={styles.link}>
                      {item.title}
                    </Link>
                  ) : (
                    <span className={styles.linkDisabled} aria-disabled="true">
                      {item.title}
                      <span className={styles.soonBadge}>em breve</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={styles.bottom}>
        <p>
          &copy; {currentYear} {siteConfig.name}. Feito por {siteConfig.author}.
        </p>
        <p className={styles.disclaimer}>
          As simulações têm caráter educacional e não constituem recomendação de investimento.
        </p>
      </div>
    </footer>
  );
}
