import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <section className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{siteConfig.name} · Erro 404</p>
          <h1 className={styles.title}>Este caminho saiu do gráfico.</h1>
          <p className={styles.text}>
            A página que você procurou não fechou a conta. Talvez o endereço tenha mudado ou nunca
            tenha existido.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryLink}>
              Voltar ao início <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/calculadoras/" className={styles.secondaryLink}>
              Explorar calculadoras
            </Link>
          </div>

          <p className={styles.note}>Sem prejuízo: foi só a URL que não fechou a conta.</p>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.errorCode}>
            <span>4</span>
            <span className={styles.coin}>0</span>
            <span>4</span>
          </div>

          <div className={styles.chart}>
            <span className={`${styles.bar} ${styles.barOne}`} />
            <span className={`${styles.bar} ${styles.barTwo}`} />
            <span className={`${styles.bar} ${styles.barThree}`} />
            <span className={`${styles.bar} ${styles.barFour}`} />
            <span className={styles.plotLine} />
            <span className={styles.lostPoint}>?</span>
          </div>

          <div className={styles.chartCaption}>
            <span>Rota esperada</span>
            <span className={styles.status}>Não encontrada</span>
          </div>
        </div>
      </section>
    </main>
  );
}
