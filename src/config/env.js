const DEFAULT_SITE_URL = 'https://softwaresolutions.com.mx'
const DEFAULT_TRANSLATION_URL = '/locales/{{lng}}/{{ns}}.json'
const DEFAULT_API_BASE_URL = '/api'
const DEFAULT_SENTRY_TRACE_SAMPLE_RATE = 0.1
const DEFAULT_APP_VERSION = 'local'
const APP_ENV_VALUES = ['development', 'staging', 'production']

function isValidHttpUrl(value) {
  try {
    const normalized = new URL(value)
    return normalized.protocol === 'http:' || normalized.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return undefined
  }
  return String(value)
}

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') {
      return true
    }
    if (normalized === 'false') {
      return false
    }
  }

  return Boolean(value)
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  return Number(value)
}

function loadEnv() {
  const rawEnv = import.meta.env ?? {}
  const errors = []

  const mode = normalizeString(rawEnv.MODE) ?? 'development'
  const dev = toBoolean(rawEnv.DEV, false)
  const prod = toBoolean(rawEnv.PROD, false)
  const apiBaseUrl = normalizeString(rawEnv.VITE_API_BASE_URL) ?? DEFAULT_API_BASE_URL
  const translationUrl =
    normalizeString(rawEnv.VITE_TRANSLATION_URL) ?? DEFAULT_TRANSLATION_URL
  const siteUrl = normalizeString(rawEnv.VITE_SITE_URL) ?? DEFAULT_SITE_URL
  const appEnv = normalizeString(rawEnv.VITE_APP_ENV)
  const appVersion = normalizeString(rawEnv.VITE_APP_VERSION)
  const gtmId = normalizeString(rawEnv.VITE_GTM_ID)
  const ga4Id = normalizeString(rawEnv.VITE_GA4_ID)
  const gscVerificationCode = normalizeString(rawEnv.VITE_GSC_VERIFICATION_CODE)
  const analyticsDebug = normalizeString(rawEnv.VITE_ANALYTICS_DEBUG)
  const sentryDsn = normalizeString(rawEnv.VITE_SENTRY_DSN)
  const sentryEnvironment = normalizeString(rawEnv.VITE_SENTRY_ENVIRONMENT)
  const sentryRelease = normalizeString(rawEnv.VITE_SENTRY_RELEASE)
  const sentryTracesSampleRate = toNumber(rawEnv.VITE_SENTRY_TRACES_SAMPLE_RATE)

  if (!(apiBaseUrl.startsWith('/') || isValidHttpUrl(apiBaseUrl))) {
    errors.push(
      'VITE_API_BASE_URL: Must be an absolute URL or a root-relative path (starts with /)',
    )
  }

  if (translationUrl.length === 0) {
    errors.push('VITE_TRANSLATION_URL: String must contain at least 1 character')
  }

  if (!isValidHttpUrl(siteUrl)) {
    errors.push('VITE_SITE_URL: Must be a valid URL')
  }

  if (appEnv && !APP_ENV_VALUES.includes(appEnv)) {
    errors.push(
      `VITE_APP_ENV: Must be one of ${APP_ENV_VALUES.map((value) => `'${value}'`).join(', ')}`,
    )
  }

  if (appVersion !== undefined && appVersion.length === 0) {
    errors.push('VITE_APP_VERSION: String must contain at least 1 character')
  }

  if (sentryDsn !== undefined && sentryDsn !== '' && !isValidHttpUrl(sentryDsn)) {
    errors.push('VITE_SENTRY_DSN: Must be a valid URL or an empty string')
  }

  if (sentryEnvironment && !APP_ENV_VALUES.includes(sentryEnvironment)) {
    errors.push(
      `VITE_SENTRY_ENVIRONMENT: Must be one of ${APP_ENV_VALUES.map((value) => `'${value}'`).join(', ')}`,
    )
  }

  if (
    sentryTracesSampleRate !== undefined &&
    (Number.isNaN(sentryTracesSampleRate) ||
      sentryTracesSampleRate < 0 ||
      sentryTracesSampleRate > 1)
  ) {
    errors.push('VITE_SENTRY_TRACES_SAMPLE_RATE: Must be a number between 0 and 1')
  }

  if (errors.length > 0) {
    const details = errors.map((issue) => `  - ${issue}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }

  return {
    MODE: mode,
    DEV: dev,
    PROD: prod,
    VITE_API_BASE_URL: apiBaseUrl,
    VITE_TRANSLATION_URL: translationUrl,
    VITE_SITE_URL: siteUrl,
    VITE_APP_ENV: appEnv,
    VITE_APP_VERSION: appVersion,
    VITE_GTM_ID: gtmId,
    VITE_GA4_ID: ga4Id,
    VITE_GSC_VERIFICATION_CODE: gscVerificationCode,
    VITE_ANALYTICS_DEBUG:
      analyticsDebug === undefined ? undefined : analyticsDebug.toLowerCase() === 'true',
    VITE_SENTRY_DSN: sentryDsn,
    VITE_SENTRY_ENVIRONMENT: sentryEnvironment,
    VITE_SENTRY_RELEASE: sentryRelease,
    VITE_SENTRY_TRACES_SAMPLE_RATE: sentryTracesSampleRate,
  }
}

const env = loadEnv()

export const ENV_MODE = env.MODE
export const IS_DEV = env.DEV
export const IS_PROD = env.PROD
export const APP_ENV = env.VITE_APP_ENV ?? ENV_MODE
export const APP_VERSION = env.VITE_APP_VERSION ?? DEFAULT_APP_VERSION
export const SITE_URL = env.VITE_SITE_URL
export const API_BASE_URL = env.VITE_API_BASE_URL.endsWith('/')
  ? env.VITE_API_BASE_URL.slice(0, -1)
  : env.VITE_API_BASE_URL
export const TRANSLATION_URL = env.VITE_TRANSLATION_URL
export const GSC_VERIFICATION_CODE = env.VITE_GSC_VERIFICATION_CODE
export const ANALYTICS_DEBUG = env.VITE_ANALYTICS_DEBUG ?? false
export const GTM_ID_ENV = env.VITE_GTM_ID
export const GA4_MEASUREMENT_ID_ENV = env.VITE_GA4_ID
export const SENTRY_DSN = env.VITE_SENTRY_DSN ?? ''
export const SENTRY_ENVIRONMENT = env.VITE_SENTRY_ENVIRONMENT ?? APP_ENV
export const SENTRY_RELEASE = env.VITE_SENTRY_RELEASE ?? DEFAULT_APP_VERSION
export const SENTRY_TRACES_SAMPLE_RATE =
  env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? DEFAULT_SENTRY_TRACE_SAMPLE_RATE
