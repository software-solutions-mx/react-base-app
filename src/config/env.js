import { z } from 'zod'

const DEFAULT_SITE_URL = 'https://softwaresolutions.com.mx'
const DEFAULT_TRANSLATION_URL = '/locales/{{lng}}/{{ns}}.json'
const DEFAULT_API_BASE_URL = '/api'
const DEFAULT_SENTRY_TRACE_SAMPLE_RATE = 0.1
const DEFAULT_APP_VERSION = 'local'

function isValidHttpUrl(value) {
  try {
    const normalized = new URL(value)
    return normalized.protocol === 'http:' || normalized.protocol === 'https:'
  } catch {
    return false
  }
}

const UrlOrRootRelativePathSchema = z
  .string()
  .refine(
    (value) => value.startsWith('/') || isValidHttpUrl(value),
    'Must be an absolute URL or a root-relative path (starts with /)',
  )

const EnvSchema = z.object({
  MODE: z.string().default('development'),
  DEV: z.coerce.boolean().default(false),
  PROD: z.coerce.boolean().default(false),
  VITE_API_BASE_URL: UrlOrRootRelativePathSchema.default(DEFAULT_API_BASE_URL),
  VITE_TRANSLATION_URL: z.string().min(1).default(DEFAULT_TRANSLATION_URL),
  VITE_SITE_URL: z.string().url().default(DEFAULT_SITE_URL),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  VITE_APP_VERSION: z.string().min(1).optional(),
  VITE_GTM_ID: z.string().optional(),
  VITE_GA4_ID: z.string().optional(),
  VITE_GSC_VERIFICATION_CODE: z.string().optional(),
  VITE_ANALYTICS_DEBUG: z
    .string()
    .transform((value) => value.toLowerCase() === 'true')
    .optional(),
  VITE_SENTRY_DSN: z.string().url().or(z.literal('')).optional(),
  VITE_SENTRY_ENVIRONMENT: z.enum(['development', 'staging', 'production']).optional(),
  VITE_SENTRY_RELEASE: z.string().optional(),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
})

function loadEnv() {
  const parsed = EnvSchema.safeParse(import.meta.env)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }

  return parsed.data
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
