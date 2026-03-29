import { SITE_URL as ENV_SITE_URL } from '../config/env'
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  getLocaleMeta,
  normalizeLocale,
} from '../i18n/locales'

export const SITE_NAME = 'Software Solutions'
export const SITE_URL = ENV_SITE_URL
export const SITE_LOCALE = LOCALE_META[DEFAULT_LOCALE].ogLocale

const SEO_DEFAULTS_BY_LOCALE = {
  es: {
    title: 'Desarrollo de Software a la Medida en México | Software Solutions',
    description:
      'Software Solutions: desarrollamos aplicaciones web, sistemas empresariales y software personalizado para empresas en México. Cotización sin costo.',
  },
  en: {
    title: 'Custom Software Development in Mexico | Software Solutions',
    description:
      'Software Solutions builds custom business systems, web applications, and scalable digital products for companies operating in Mexico.',
  },
  fr: {
    title: 'Developpement Logiciel Sur Mesure au Mexique | Software Solutions',
    description:
      'Software Solutions developpe des applications web et des logiciels metier sur mesure pour les entreprises au Mexique.',
  },
  pt: {
    title: 'Desenvolvimento de Software Sob Medida no Mexico | Software Solutions',
    description:
      'A Software Solutions desenvolve sistemas empresariais e aplicacoes web sob medida para empresas no Mexico.',
  },
}

export function toAbsoluteUrl(path = '/') {
  try {
    return new URL(path, SITE_URL).toString()
  } catch {
    return SITE_URL
  }
}

export function normalizePath(path = '/') {
  if (typeof path !== 'string' || path.length === 0) {
    return '/'
  }

  const ensuredLeadingSlash = path.startsWith('/') ? path : `/${path}`
  return ensuredLeadingSlash.replace(/\/{2,}/g, '/')
}

export function stripLocaleFromPath(path = '/') {
  const normalizedPath = normalizePath(path)
  const firstSegment = normalizedPath.split('/').filter(Boolean)[0]
  const normalizedLocale = normalizeLocale(firstSegment)

  if (firstSegment && normalizedLocale in LOCALE_META) {
    const strippedPath = normalizedPath.replace(`/${firstSegment}`, '') || '/'
    return normalizePath(strippedPath)
  }

  return normalizedPath
}

export function toLocalizedPath(path = '/', locale = DEFAULT_LOCALE) {
  const normalizedPath = stripLocaleFromPath(path)
  const normalizedLocale = normalizeLocale(locale)

  if (normalizedLocale === DEFAULT_LOCALE) {
    return normalizedPath
  }

  return normalizePath(
    `/${normalizedLocale}${normalizedPath === '/' ? '' : normalizedPath}`,
  )
}

export function getSeoDefaults(locale = DEFAULT_LOCALE) {
  const normalizedLocale = normalizeLocale(locale)
  const localizedDefaults =
    SEO_DEFAULTS_BY_LOCALE[normalizedLocale] ?? SEO_DEFAULTS_BY_LOCALE[DEFAULT_LOCALE]

  return {
    ...localizedDefaults,
    ogImage: `${SITE_URL}/og/og-default.svg`,
    twitterCard: 'summary_large_image',
  }
}

export const SEO_DEFAULTS = getSeoDefaults(DEFAULT_LOCALE)

export function getAlternateLocaleUrls(path = '/') {
  const normalizedBasePath = stripLocaleFromPath(path)
  const locales = Object.keys(LOCALE_META)

  const links = locales.map((locale) => {
    const localeMeta = getLocaleMeta(locale)
    const localePath = toLocalizedPath(normalizedBasePath, locale)
    return {
      locale,
      hrefLang: localeMeta.hreflang,
      href: toAbsoluteUrl(localePath),
      ogLocale: localeMeta.ogLocale,
    }
  })

  return {
    links,
    xDefault: toAbsoluteUrl(toLocalizedPath(normalizedBasePath, DEFAULT_LOCALE)),
  }
}
