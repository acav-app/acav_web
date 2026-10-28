import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function validarTelefonoArgentino(value: string) {
  const explicitInternationalMobile = /^\s*\+549/.test(value)
  if (explicitInternationalMobile) {
    const parsed = parsePhoneNumberFromString(value.trim(), 'AR')
    return !!parsed?.isValid() && parsed.number.startsWith('+549')
  }
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('54')) digits = digits.slice(2)
  if (digits.length !== 10 || digits.startsWith('0') || digits.startsWith('15')) return false
  const parsed = parsePhoneNumberFromString(value.trim(), 'AR') ?? parsePhoneNumberFromString(digits, 'AR')
  if (!parsed?.isValid()) return false
  const groups = parsed.formatNational().replace(/^0/, '').split(/[ -]/).filter(Boolean)
  // In Argentina, the legacy mobile prefix "15" follows the area code and must not be entered.
  return !groups[1]?.replace(/\D/g, '').startsWith('15')
}

export function esUrlValida(value: string) {
  try {
    const url = new URL(normalizarUrl(value))
    return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname && url.hostname.includes('.')
  } catch {
    return false
  }
}

export function normalizarUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function normalizarUrls(value: string) {
  return value.split(',').map((part) => normalizarUrl(part)).join(', ')
}

export function validarUrls(value: string) {
  const items = value.split(',').map((part) => part.trim()).filter(Boolean)
  return items.length > 0 && items.every(esUrlValida)
}

export function validarFechaNacimiento(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  const today = new Date().toISOString().slice(0, 10)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value < today
}
