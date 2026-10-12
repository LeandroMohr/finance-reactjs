export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Explicit units avoid ICU compact-notation differences between Node.js and browsers.
export function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value)) {
    throw new RangeError("O valor monetário deve ser finito.");
  }
  const magnitude = Math.abs(value);
  const [divisor, suffix] = magnitude >= 1e12 ? [1e12, " tri"]
    : magnitude >= 1e9 ? [1e9, " bi"]
    : magnitude >= 1e6 ? [1e6, " mi"]
    : magnitude >= 1e3 ? [1e3, " mil"]
    : [1, ""];
  const formatted = (value / divisor).toFixed(1).replace(/\.0$/, "").replace(".", ",");
  return `R$ ${formatted}${suffix}`;
}

export function maskCurrency(raw: string) {
  const digitsAsCents = raw.replace(/\D/g, "").slice(0, 13);
  return currency.format(Number(digitsAsCents) / 100);
}

export function parseCurrency(masked: string) {
  return Number(masked.replace(/\D/g, "")) / 100;
}
