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
      </section>

      <section className={styles.hubs} aria-label="Categorias">
        <div className={styles.hubGrid}>
          {navGroups.map((group) => {
            const availableCount = group.items.filter((item) => item.available).length;

            return (
              <Link key={group.id} href={`/${group.id}/`} className={styles.hubCard}>
                <h2 className={styles.hubTitle}>{group.label}</h2>
                <p className={styles.hubDescription}>{group.description}</p>
                <span className={styles.hubMeta}>
                  {availableCount} de {group.items.length} dispon{availableCount === 1 ? "ível" : "íveis"}
                </span>
                <span className={styles.hubAction}>
                  Ver {group.label.toLowerCase()} &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
