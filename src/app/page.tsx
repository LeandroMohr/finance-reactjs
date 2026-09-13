import type { Metadata } from "next";
import Link from "next/link";
import { navGroups, siteConfig } from "@/config/site";
import styles from "./page.module.scss";

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
        <p className={styles.subtitle}>
          Ferramentas financeiras diretas ao ponto, sem cadastro e sem custo. Escolha uma opção
          abaixo para começar.
        </p>
      </section>

      {navGroups.map((group) => (
        <section key={group.id} className={styles.group} aria-labelledby={`group-${group.id}`}>
          <h2 id={`group-${group.id}`} className={styles.groupTitle}>
            {group.label}
          </h2>

          <div className={styles.grid}>
            {group.items.map((item) =>
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
      ))}
    </main>
  );
}
