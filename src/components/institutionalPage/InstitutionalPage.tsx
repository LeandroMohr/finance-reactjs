import type { ReactNode } from "react";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import styles from "./InstitutionalPage.module.scss";

export type InstitutionalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type InstitutionalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt?: string;
  sections: InstitutionalSection[];
};

export default function InstitutionalPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: InstitutionalPageProps) {
  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: title }]} />

      <header className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {updatedAt ? <p className={styles.updatedAt}>Última atualização: {updatedAt}</p> : null}
      </header>

      <div className={styles.layout}>
        <nav className={styles.index} aria-label={`Nesta página: ${title}`}>
          <p className={styles.indexTitle}>Nesta página</p>
          <ol className={styles.indexList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a className={styles.indexLink} href={`#${section.id}`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className={styles.article}>
          {sections.map((section) => (
            <section key={section.id} id={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <div className={styles.sectionContent}>{section.content}</div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}