import { SITE_URL as ENV_SITE_URL } from '../config/env'
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  getLocaleMeta,
  normalizeLocale,
} from '../i18n/locales'

export const SITE_NAME = 'React Base App'
export const SITE_URL = ENV_SITE_URL
export const SITE_LOCALE = LOCALE_META[DEFAULT_LOCALE].ogLocale

const SEO_DEFAULTS_BY_LOCALE = {
  es: {
    title: 'React Base App',
    description: 'Aplicacion base React.',
  },
  en: {
    title: 'React Base App',
    description: 'React base application.',
  },
  fr: {
    title: 'React Base App',
    description: 'Application de base React.',
  },
  pt: {
    title: 'React Base App',
    description: 'Aplicacao base React.',
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
    ogImage: null,
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
