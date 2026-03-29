import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { trackPageView } from '../../analytics'
import SEOHead from '../../components/SEO/SEOHead'
import { HELP_PHONE_LABEL, HELP_PHONE_URI } from '../../config/env'
import { organizationSchema, websiteSchema } from '../../data/schemas'
import i18n from '../../i18n/config'
import { DEFAULT_LOCALE, isSupportedLocale, normalizeLocale } from '../../i18n/locales'
import { stripLocaleFromPath, toLocalizedPath } from '../../seo/siteConfig'

function RootLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const { locale } = useParams()
  const lastTrackedPathRef = useRef(null)
  const mainContentRef = useRef(null)
  const detectedLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language)
  const normalizedLocale = locale
    ? normalizeLocale(locale)
    : isSupportedLocale(detectedLocale)
      ? detectedLocale
      : DEFAULT_LOCALE
  const hasLocalePrefix = typeof locale === 'string' && locale.length > 0
  const [routeAnnouncement, setRouteAnnouncement] = useState('')

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}`

    if (lastTrackedPathRef.current === currentPath) {
      return
    }

    lastTrackedPathRef.current = currentPath
    trackPageView(currentPath, document.title)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (i18n.resolvedLanguage !== normalizedLocale) {
      i18n.changeLanguage(normalizedLocale)
    }
  }, [normalizedLocale])

  useEffect(() => {
    if (!mainContentRef.current) {
      return
    }

    mainContentRef.current.focus()
    const announcementTimeout = window.setTimeout(() => {
      setRouteAnnouncement(document.title || t('a11y.routeUpdated'))
    }, 0)

    return () => {
      window.clearTimeout(announcementTimeout)
    }
  }, [location.pathname, location.search, t])

  if (hasLocalePrefix && !isSupportedLocale(normalizedLocale)) {
    throw new Response(t('errors.notFound.message'), { status: 404 })
  }

  if (
    normalizedLocale === DEFAULT_LOCALE &&
    location.pathname.startsWith(`/${DEFAULT_LOCALE}`)
  ) {
    const redirectedPath = location.pathname.replace(`/${DEFAULT_LOCALE}`, '') || '/'
    return <Navigate replace to={`${redirectedPath}${location.search}${location.hash}`} />
  }

  const routePath = stripLocaleFromPath(location.pathname)
  const localizedSeoPath = toLocalizedPath(routePath, normalizedLocale)

  return (
    <>
      <SEOHead
        locale={normalizedLocale}
        path={localizedSeoPath}
        alternatePath={routePath}
        schema={[organizationSchema, websiteSchema]}
      />
      <a className="skip-link" href="#main-content">
        {t('a11y.skipToMainContent')}
      </a>
      <header aria-label={t('a11y.siteHeader')}>
        <span className="sr-only">{t('a11y.siteHeader')}</span>
      </header>
      <main
        ref={mainContentRef}
        id="main-content"
        tabIndex={-1}
        aria-label={t('a11y.mainContent')}
      >
        <Outlet />
      </main>
      <footer aria-label={t('a11y.siteFooter')}>
        <span className="sr-only">{t('a11y.siteFooter')}</span>
      </footer>
      {HELP_PHONE_URI ? (
        <a className="mobile-help-bar" href={HELP_PHONE_URI}>
          <span className="mobile-help-bar-label">{t('help.immediate')}</span>
          <span className="mobile-help-bar-value">{HELP_PHONE_LABEL}</span>
        </a>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {routeAnnouncement}
      </p>
    </>
  )
}

export default RootLayout
