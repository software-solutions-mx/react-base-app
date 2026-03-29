import { ANALYTICS_ENV, IS_ANALYTICS_ENABLED } from './config'
import { IS_DEV } from '../config/env'
import { pushToDataLayer } from './gtag'
import { sanitizePayload } from './sanitize'

export function trackEvent(payload) {
  const safePayload = sanitizePayload(payload)

  if (!IS_ANALYTICS_ENABLED) {
    if (IS_DEV) {
      console.debug('[Analytics disabled]', safePayload)
    }
    return
  }

  pushToDataLayer({
    ...safePayload,
    environment: ANALYTICS_ENV,
    timestamp: new Date().toISOString(),
  })
}

export function trackPageView(path, title) {
  trackEvent({
    event: 'page_view',
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  })
}

export function identifyUser(userId, properties = {}) {
  if (!IS_ANALYTICS_ENABLED) return

  pushToDataLayer({
    event: 'user_identified',
    userId,
    user_properties: sanitizePayload({
      user_id: userId,
      ...properties,
    }),
  })
}

export function clearUser() {
  if (!IS_ANALYTICS_ENABLED) return

  pushToDataLayer({
    event: 'user_cleared',
    userId: undefined,
    user_properties: null,
  })
}
