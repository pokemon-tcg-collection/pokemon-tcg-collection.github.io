export function getSeparator(
  locale: string | undefined = undefined,
  separatorType: 'group' | 'decimal' | undefined = undefined,
) {
  // credit: https://stackoverflow.com/a/51411310/9360161

  const numberWithGroupAndDecimalSeparator = 1000.1

  return Intl.NumberFormat(locale)!
    .formatToParts(numberWithGroupAndDecimalSeparator)
    .find((part) => part.type === separatorType)?.value
}

export function formatCurrencyNumber(value: number, locale: string | undefined = undefined) {
  return Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    // style: 'currency',
    // currency: 'EUR',
  }).format(value)
}
