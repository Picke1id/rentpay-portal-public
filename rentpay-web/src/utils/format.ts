export const formatMoney = (amount: number) =>
  `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDisplayDate = (value?: string | null) => {
  if (!value) return '—'
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${month}/${day}/${year}`
  }
  const mdYMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (mdYMatch) {
    const [, month, day, year] = mdYMatch
    return `${month}/${day}/${year}`
  }
  const mdYSlashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (mdYSlashMatch) return value
  return value
}

export const normalizeCurrencyInput = (value: string) => value.replace(/,/g, '').trim()

export const formatCurrencyInput = (value: string) => {
  const numeric = Number.parseFloat(normalizeCurrencyInput(value))
  if (Number.isNaN(numeric)) return value
  return numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
