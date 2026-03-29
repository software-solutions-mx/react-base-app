import {
  APP_ENV,
  APP_VERSION,
  IS_DEV,
  IS_PROD,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  SENTRY_TRACES_SAMPLE_RATE,
} from '../config/env'

const HAS_BUILD_SENTRY_DSN = Boolean(import.meta.env.VITE_SENTRY_DSN)
const IS_SENTRY_CONFIGURED =
  HAS_BUILD_SENTRY_DSN &&
  typeof SENTRY_DSN === 'string' && SENTRY_DSN.trim().length > 0

let sentryModulePromise = null
let hasInitializedSentry = false

function getSentryConfig() {
  return {
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT ?? APP_ENV,
    release: SENTRY_RELEASE || APP_VERSION,
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.Authorization
        delete event.request.headers['X-Client-Secret']
        delete event.request.headers['X-CSRF-Token']
      }

      return event
    },
  }
}

async function loadSentryModule() {
  if (!HAS_BUILD_SENTRY_DSN || !IS_PROD || !IS_SENTRY_CONFIGURED) {
    return null
  }

  if (!sentryModulePromise) {
    sentryModulePromise = import('@sentry/browser').catch((error) => {
      sentryModulePromise = null

      if (IS_DEV) {
        console.error('[monitoring] Failed to load Sentry module', error)
      }

      return null
    })
  }

  return sentryModulePromise
}

async function ensureSentryInitialized() {
  const Sentry = await loadSentryModule()

  if (!Sentry || hasInitializedSentry) {
    return Sentry
  }

  Sentry.init(getSentryConfig())
  hasInitializedSentry = true

  return Sentry
}

export function initErrorMonitoring() {
  void ensureSentryInitialized()
}

export function captureException(error, context = {}) {
  if (!IS_SENTRY_CONFIGURED || !IS_PROD) {
    if (IS_DEV) {
      console.error('[monitoring] Exception captured', error, context)
    }
    return
  }

  void ensureSentryInitialized().then((Sentry) => {
    Sentry?.captureException(error, {
      tags: context.tags,
      extra: context.extra,
    })
  })
}

export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.__PRO_LIFE_GLOBAL_ERROR_HANDLERS_INSTALLED__) {
    return
  }
  window.__PRO_LIFE_GLOBAL_ERROR_HANDLERS_INSTALLED__ = true

  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message)

    captureException(error, {
      tags: { scope: 'window.error' },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason =
      event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    captureException(reason, {
      tags: { scope: 'window.unhandledrejection' },
    })
  })
}
