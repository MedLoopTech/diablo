export const DEFAULT_CURRENCY = "PKR";

/** Formats a whole-number amount in the given currency, e.g. "PKR 2,000". Falls back to a plain code+number for codes Intl doesn't recognize. */
export function formatMoney(amount: number, code: string = DEFAULT_CURRENCY): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
}
