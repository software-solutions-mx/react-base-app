export {
  GTM_ID,
  GA4_MEASUREMENT_ID,
  IS_ANALYTICS_ENABLED,
  IS_GA4_CONFIGURED,
  IS_GTM_CONFIGURED,
} from './config'
export { pushToDataLayer, gtag } from './gtag'
export { trackEvent, trackPageView, identifyUser, clearUser } from './service'
export { updateConsent, restoreConsent, grantAllConsent } from './consent'
export { reportWebVitals } from './webVitals'
export { initAnalyticsDebugger } from './debug'
export { useAnalytics } from './hooks/useAnalytics'
