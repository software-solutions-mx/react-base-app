import { useEffect, useMemo } from 'react'
import { GSC_VERIFICATION_CODE } from '../../config/env'
import { DEFAULT_LOCALE, getLocaleMeta } from '../../i18n/locales'
import {
  getAlternateLocaleUrls,
  getSeoDefaults,
  SITE_NAME,
  toAbsoluteUrl,
} from '../../seo/siteConfig'

const SEO_KEY_ATTRIBUTE = 'data-seo-key'

function upsertHeadTag(tagName, key, applyAttributes) {
  const selector = `${tagName}[${SEO_KEY_ATTRIBUTE}="${key}"]`
  let node = document.head.querySelector(selector)

  if (!node) {
    node = document.createElement(tagName)
    node.setAttribute(SEO_KEY_ATTRIBUTE, key)
    document.head.appendChild(node)
  }

  applyAttributes(node)
}

function setMetaByName(name, content) {
  upsertHeadTag('meta', `meta:name:${name}`, (node) => {
    node.setAttribute('name', name)
    node.setAttribute('content', content)
  })
}

function setMetaByProperty(property, content, suffix = '') {
  const key = suffix ? `meta:property:${property}:${suffix}` : `meta:property:${property}`

  upsertHeadTag('meta', key, (node) => {
    node.setAttribute('property', property)
    node.setAttribute('content', content)
  })
}

function setCanonical(url) {
  upsertHeadTag('link', 'link:canonical', (node) => {
    node.setAttribute('rel', 'canonical')
    node.setAttribute('href', url)
  })
}

function setAlternateLink(hrefLang, href) {
  upsertHeadTag('link', `link:alternate:${hrefLang}`, (node) => {
    node.setAttribute('rel', 'alternate')
    node.setAttribute('hrefLang', hrefLang)
    node.setAttribute('href', href)
  })
}

function removeByPrefix(prefix) {
  document.head
    .querySelectorAll(`[${SEO_KEY_ATTRIBUTE}^="${prefix}"]`)
    .forEach((node) => {
      node.remove()
    })
}

function removeByKey(key) {
  document.head.querySelectorAll(`[${SEO_KEY_ATTRIBUTE}="${key}"]`).forEach((node) => {
    node.remove()
  })
}

function SEOHead({
  title,
  description,
  locale = DEFAULT_LOCALE,
  path = '/',
  alternatePath,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  schema = [],
}) {
  const localeMeta = getLocaleMeta(locale)
  const localeDefaults = getSeoDefaults(locale)
  const resolvedTitle = title ?? localeDefaults.title
  const resolvedDescription = description ?? localeDefaults.description
  const resolvedOgImage = ogImage ?? localeDefaults.ogImage
  const canonicalUrl = toAbsoluteUrl(canonical ?? path)
  const resolvedSchemas = useMemo(
    () => (Array.isArray(schema) ? schema : [schema]),
    [schema],
  )
  const robotsContent = noindex ? 'noindex,nofollow' : 'index,follow'
  const googleSiteVerification = GSC_VERIFICATION_CODE
  const alternateUrls = getAlternateLocaleUrls(alternatePath ?? path)

  useEffect(() => {
    document.documentElement.lang = localeMeta.htmlLang
    document.title = resolvedTitle

    setMetaByName('description', resolvedDescription)
    setMetaByName('robots', robotsContent)
    setCanonical(canonicalUrl)

    removeByPrefix('link:alternate:')
    setAlternateLink('x-default', alternateUrls.xDefault)
    alternateUrls.links.forEach((link) => {
      setAlternateLink(link.hrefLang, link.href)
    })

    setMetaByProperty('og:type', ogType)
    setMetaByProperty('og:site_name', SITE_NAME)
    setMetaByProperty('og:locale', localeMeta.ogLocale)
    setMetaByProperty('og:title', resolvedTitle)
    setMetaByProperty('og:description', resolvedDescription)
    setMetaByProperty('og:url', canonicalUrl)
    setMetaByProperty('og:image', resolvedOgImage)
    setMetaByProperty('og:image:width', '1200')
    setMetaByProperty('og:image:height', '630')

    removeByPrefix('meta:property:og:locale:alternate:')
    alternateUrls.links
      .filter((link) => link.locale !== locale)
      .forEach((link) => {
        setMetaByProperty('og:locale:alternate', link.ogLocale, link.locale)
      })

    setMetaByName('twitter:card', localeDefaults.twitterCard)
    setMetaByName('twitter:title', resolvedTitle)
    setMetaByName('twitter:description', resolvedDescription)
    setMetaByName('twitter:image', resolvedOgImage)

    if (googleSiteVerification) {
      setMetaByName('google-site-verification', googleSiteVerification)
    } else {
      removeByKey('meta:name:google-site-verification')
    }

    removeByPrefix('script:ldjson:')
    resolvedSchemas.filter(Boolean).forEach((item, index) => {
      upsertHeadTag('script', `script:ldjson:${index}`, (node) => {
        node.setAttribute('type', 'application/ld+json')
        node.textContent = JSON.stringify(item)
      })
    })
  }, [
    alternateUrls.links,
    alternateUrls.xDefault,
    canonicalUrl,
    googleSiteVerification,
    locale,
    localeDefaults.twitterCard,
    localeMeta.htmlLang,
    localeMeta.ogLocale,
    noindex,
    ogType,
    resolvedDescription,
    resolvedOgImage,
    resolvedSchemas,
    resolvedTitle,
    robotsContent,
  ])

  return null
}

export default SEOHead
