"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calculateCompoundInterest } from "./calculateCompoundInterest";
import styles from "./CompoundInterestCalculator.module.scss";

const defaultValues = {
  initialAmount: 5000,
  monthlyContribution: 500,
  annualRate: 12,
  years: 5,
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CompoundInterestCalculator() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const nextTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
  };

  const result = useMemo(
    () =>
      calculateCompoundInterest({
        initialAmount: Number(values.initialAmount) || 0,
        monthlyContribution: Number(values.monthlyContribution) || 0,
        annualRate: Number(values.annualRate) || 0,
        years: Number(values.years) || 0,
      }),
    [values],
  );

  const visibleMonths = result.monthlyBreakdown.slice(-12);
  const maxBalance = Math.max(...result.monthlyBreakdown.map((item) => item.balance), 1);

  const handleChange = (key: keyof typeof defaultValues, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  };

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              title="Voltar para a página inicial"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-cta)] text-sm font-black text-[#08110C] transition hover:opacity-80"
            >
              L
            </Link>
            <div>
              <Link href="/" className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] hover:text-[var(--brand-cta)]">
                &larr; Lemo Finance
              </Link>
              <h1 className="text-xl font-semibold">Calculadora de juros compostos</h1>
            </div>
          </div>

          <button
            type="button"
            aria-label="Alternar tema"
            onClick={toggleTheme}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-accent)]"
          >
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
        </header>

        <section className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-[var(--text-primary)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Entenda a fórmula
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Juros compostos: como o dinheiro cresce com o tempo
          </h2>
          <div className="mt-4 space-y-4 text-[var(--text-muted)]">
            <p>
              Juros compostos são os juros calculados sobre o valor inicial mais os rendimentos acumulados.
              Em outras palavras, o dinheiro rende sobre o dinheiro que já foi gerado, criando crescimento
              exponencial ao longo do tempo.
            </p>
            <p>
              Essa calculadora ajuda a simular cenários de investimento com aporte inicial, aporte mensal,
              taxa anual e período. Ao ajustar os valores, você vê o impacto real do tempo e da consistência no
              crescimento do patrimônio.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Simulação
              </p>
              <h2 className="mt-2 text-2xl font-bold">Descubra seu crescimento</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Aporte inicial", "initialAmount"],
                ["Aporte mensal", "monthlyContribution"],
                ["Taxa anual (%)", "annualRate"],
                ["Tempo (anos)", "years"],
              ].map(([label, key]) => (
                <label key={key} className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                  <span>{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={values[key as keyof typeof defaultValues]}
                    onChange={(event) => handleChange(key as keyof typeof defaultValues, event.target.value)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-base text-[var(--text-primary)] outline-none ring-0 transition focus:border-[var(--brand-cta)]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-sm text-[var(--text-muted)]">Resumo de investimento</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {currency.format(result.totalContributed)} aportados em {values.years || 0} ano(s)
              </p>
            </div>
          </div>

          <aside className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Resultado
            </p>
            <div className="mt-6 rounded-2xl bg-[var(--bg-card)] p-4">
              <p className="text-sm text-[var(--text-muted)]">Valor final</p>
              <p className="mt-2 text-3xl font-bold text-[var(--brand-primary)]">
                {currency.format(result.finalAmount)}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <p className="text-sm text-[var(--text-muted)]">Total aportado</p>
                <p className="mt-2 text-xl font-semibold">{currency.format(result.totalContributed)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <p className="text-sm text-[var(--text-muted)]">Retorno</p>
                <p className="mt-2 text-xl font-semibold text-[var(--feedback-success)]">
                  {currency.format(result.totalReturns)}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <div className="mb-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Evolução mensal
            </p>
            <h3 className="mt-2 text-2xl font-bold">Projeção do patrimônio</h3>
          </div>

          <div className="mb-6 grid h-36 grid-cols-12 items-end gap-2">
            {visibleMonths.map((item) => (
              <div key={item.month} className="flex h-full flex-col justify-end gap-2">
                <div
                  className={styles.chartBar}
                  style={{ height: `${(item.balance / maxBalance) * 100}%` }}
                  title={`${item.month}º mês: ${currency.format(item.balance)}`}
                />
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">Mês</th>
                  <th className="px-4 py-3">Aporte</th>
                  <th className="px-4 py-3">Juros</th>
                  <th className="px-4 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {visibleMonths.map((item) => (
                  <tr key={item.month} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">{item.month}</td>
                    <td className="px-4 py-3">{currency.format(item.contribution)}</td>
                    <td className="px-4 py-3 text-[var(--feedback-success)]">
                      {currency.format(item.interest)}
                    </td>
                    <td className="px-4 py-3 font-medium">{currency.format(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
