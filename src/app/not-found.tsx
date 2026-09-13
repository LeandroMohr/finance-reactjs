import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>{siteConfig.name}</p>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.text}>O caminho solicitado não existe neste site.</p>
        <Link href="/" className={styles.link}>
          Voltar para a home
        </Link>
      </div>
    </main>
  );
}
