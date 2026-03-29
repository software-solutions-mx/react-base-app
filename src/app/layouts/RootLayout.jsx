import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { trackPageView } from '../../analytics'
import SEOHead from '../../components/SEO/SEOHead'
import { organizationSchema, websiteSchema } from '../../data/schemas'
import i18n from '../../i18n/config'
import { DEFAULT_LOCALE, isSupportedLocale, normalizeLocale } from '../../i18n/locales'
import { stripLocaleFromPath, toLocalizedPath } from '../../seo/siteConfig'

function RootLayout() {
  const location = useLocation()
  const { locale } = useParams()
  const lastTrackedPathRef = useRef(null)
  const mainContentRef = useRef(null)
  const normalizedLocale = locale ? normalizeLocale(locale) : DEFAULT_LOCALE
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
      setRouteAnnouncement(document.title || 'Pagina actualizada')
    }, 0)

    return () => {
      window.clearTimeout(announcementTimeout)
    }
  }, [location.pathname, location.search])

  if (hasLocalePrefix && !isSupportedLocale(normalizedLocale)) {
    throw new Response('Locale not found', { status: 404 })
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
        Saltar al contenido principal
      </a>
      <header aria-label="Encabezado del sitio">
        <span className="sr-only">Encabezado del sitio</span>
      </header>
      <main
        ref={mainContentRef}
        id="main-content"
        tabIndex={-1}
        aria-label="Contenido principal"
      >
        <Outlet />
      </main>
      <footer aria-label="Pie del sitio">
        <span className="sr-only">Pie del sitio</span>
      </footer>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {routeAnnouncement}
      </p>
    </>
  )
}

export default RootLayout
