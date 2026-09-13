import styles from "./_styles/loading.module.scss";

export default function Loading() {
  return (
    <main className={styles.main} aria-busy="true" aria-label="Carregando conteúdo">
      <div className={`${styles.bar} ${styles.title}`} />
      <div className={`${styles.bar} ${styles.subtitle}`} />

      <div className={styles.grid}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.bar} />
            <div className={styles.bar} />
          </div>
        ))}
      </div>
    </main>
  );
}
