import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, tools } from "@/config/site";
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
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-cta)] text-base font-black text-[#08110C]">
              L
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                {siteConfig.name}
              </p>
              <h1 className="text-2xl font-bold">Hub de Ferramentas Financeiras</h1>
            </div>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Simule, planeje e faça seu dinheiro render
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[var(--text-muted)]">
            Ferramentas financeiras diretas ao ponto, sem necessidade de cadastro. Escolha uma
            calculadora abaixo para começar.
          </p>
        </section>

        <section className={styles.grid} aria-label="Ferramentas disponíveis">
          {tools.map((tool) =>
            tool.available ? (
              <Link
                key={tool.slug}
                href={`/${tool.slug}/`}
                className={`${styles.card} ${styles.cardAvailable}`}
              >
                <div>
                  <span className={`${styles.badge} ${styles.badgeAvailable}`}>Disponível</span>
                  <h3 className="mt-4 text-xl font-bold">{tool.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{tool.description}</p>
                </div>
                <p className="mt-6 font-semibold text-[var(--brand-cta)]">Acessar ferramenta &rarr;</p>
              </Link>
            ) : (
              <article key={tool.slug} className={`${styles.card} ${styles.cardSoon}`}>
                <div>
                  <span className={`${styles.badge} ${styles.badgeSoon}`}>Em breve</span>
                  <h3 className="mt-4 text-xl font-bold">{tool.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{tool.description}</p>
                </div>
              </article>
            ),
          )}
        </section>
      </div>
    </main>
  );
}

