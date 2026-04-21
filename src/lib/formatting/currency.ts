export function formatCurrency(
  value: number,
  locale = 'en-IN',
  currency = 'INR',
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
