"use client";

import { useMemo, useState } from "react";
import { calculateCompoundInterest } from "./calculateCompoundInterest";
import styles from "./CompoundInterestCalculator.module.scss";

const defaultValues = {
  initialAmount: 5000,
  monthlyContribution: 500,
  annualRate: 12,
  years: 5,
};

const fields: [label: string, key: keyof typeof defaultValues][] = [
  ["Aporte inicial", "initialAmount"],
  ["Aporte mensal", "monthlyContribution"],
  ["Taxa anual (%)", "annualRate"],
  ["Tempo (anos)", "years"],
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CompoundInterestCalculator() {
  const [values, setValues] = useState(defaultValues);

  const result = useMemo(() => calculateCompoundInterest(values), [values]);

  const visibleMonths = result.monthlyBreakdown.slice(-12);
  const maxBalance = Math.max(...result.monthlyBreakdown.map((item) => item.balance), 1);

  const handleChange = (key: keyof typeof defaultValues, value: string) => {
    setValues((current) => ({ ...current, [key]: Number(value) || 0 }));
  };

  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Entenda a fórmula</p>
        <h1 className={styles.title}>Juros compostos: como o dinheiro cresce com o tempo</h1>
        <div className={styles.introText}>
          <p>
            Juros compostos são os juros calculados sobre o valor inicial mais os rendimentos
            acumulados. Em outras palavras, o dinheiro rende sobre o dinheiro que já foi gerado,
            criando crescimento exponencial ao longo do tempo.
          </p>
          <p>
            Essa calculadora ajuda a simular cenários de investimento com aporte inicial, aporte
            mensal, taxa anual e período. Ao ajustar os valores, você vê o impacto real do tempo e da
            consistência no crescimento do patrimônio.
          </p>
        </div>
      </section>

      <section className={styles.simulation}>
        <div className={styles.form}>
          <p className={styles.eyebrow}>Simulação</p>
          <h2 className={styles.sectionTitle}>Descubra seu crescimento</h2>

          <div className={styles.fields}>
            {fields.map(([label, key]) => (
              <label key={key} className={styles.field}>
                <span>{label}</span>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  value={values[key]}
                  onChange={(event) => handleChange(key, event.target.value)}
                />
              </label>
            ))}
          </div>

          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Resumo de investimento</p>
            <p className={styles.summaryValue}>
              {currency.format(result.totalContributed)} aportados em {values.years || 0} ano(s)
            </p>
          </div>
        </div>

        <aside className={styles.result}>
          <p className={styles.eyebrow}>Resultado</p>

          <div className={styles.highlight}>
            <p className={styles.metricLabel}>Valor final</p>
            <p className={styles.highlightValue}>{currency.format(result.finalAmount)}</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Total aportado</p>
              <p className={styles.metricValue}>{currency.format(result.totalContributed)}</p>
            </div>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Retorno</p>
              <p className={`${styles.metricValue} ${styles.metricPositive}`}>
                {currency.format(result.totalReturns)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.evolution}>
        <p className={styles.eyebrow}>Evolução mensal</p>
        <h2 className={styles.sectionTitle}>Projeção do patrimônio</h2>

        <div className={styles.chart}>
          {visibleMonths.map((item) => (
            <div key={item.month} className={styles.chartColumn}>
              <div
                className={styles.chartBar}
                style={{ height: `${(item.balance / maxBalance) * 100}%` }}
                title={`${item.month}º mês: ${currency.format(item.balance)}`}
              />
            </div>
          ))}
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Aporte</th>
                <th>Juros</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {visibleMonths.map((item) => (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>{currency.format(item.contribution)}</td>
                  <td className={styles.interest}>{currency.format(item.interest)}</td>
                  <td className={styles.balance}>{currency.format(item.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
