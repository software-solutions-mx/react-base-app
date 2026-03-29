import { gtag } from './gtag'

export function updateConsent(settings) {
  gtag('consent', 'update', {
    analytics_storage: settings.analytics,
    ad_storage: settings.ads,
    ad_user_data: settings.ads,
    ad_personalization: settings.personalization,
  })

  localStorage.setItem(
    'consent_settings',
    JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString(),
    }),
  )
}

export function restoreConsent() {
  const stored = localStorage.getItem('consent_settings')
  if (!stored) return

  try {
    const settings = JSON.parse(stored)
    updateConsent(settings)
  } catch {
    localStorage.removeItem('consent_settings')
  }
}

export function grantAllConsent() {
  updateConsent({
    analytics: 'granted',
    ads: 'granted',
    personalization: 'granted',
  })
}
