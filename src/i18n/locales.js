import { SUPPORTED_LOCALES } from './types'

export const DEFAULT_LOCALE = 'es'

export const LOCALE_META = {
  es: {
    htmlLang: 'es-MX',
    hreflang: 'es-MX',
    ogLocale: 'es_MX',
  },
  en: {
    htmlLang: 'en-US',
    hreflang: 'en-US',
    ogLocale: 'en_US',
  },
  fr: {
    htmlLang: 'fr-FR',
    hreflang: 'fr-FR',
    ogLocale: 'fr_FR',
  },
  pt: {
    htmlLang: 'pt-BR',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
  },
}

export function normalizeLocale(locale) {
  if (typeof locale !== 'string' || locale.length === 0) {
    return DEFAULT_LOCALE
  }

  return locale.toLowerCase().split(/[-_]/)[0]
}

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(normalizeLocale(locale))
}

export function getLocaleMeta(locale) {
  const normalizedLocale = normalizeLocale(locale)
  return LOCALE_META[normalizedLocale] ?? LOCALE_META[DEFAULT_LOCALE]
}
