export function sortDates(
  a: string | number | Date | undefined,
  b: string | number | Date | undefined,
) {
  const dateA = a ? new Date(a) : undefined
  const dateB = b ? new Date(b) : undefined
  if (dateA === dateB) return 0
  if (dateA === undefined) return -1
  if (dateB === undefined) return -1
  return +dateA - +dateB
}
