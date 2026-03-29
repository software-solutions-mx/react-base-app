import { Helmet } from 'react-helmet-async'
import { GSC_VERIFICATION_CODE } from '../../config/env'
import { DEFAULT_LOCALE, getLocaleMeta } from '../../i18n/locales'
import {
  getAlternateLocaleUrls,
  getSeoDefaults,
  SITE_NAME,
  toAbsoluteUrl,
} from '../../seo/siteConfig'

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
  const resolvedSchemas = Array.isArray(schema) ? schema : [schema]
  const robotsContent = noindex ? 'noindex,nofollow' : 'index,follow'
  const googleSiteVerification = GSC_VERIFICATION_CODE
  const alternateUrls = getAlternateLocaleUrls(alternatePath ?? path)

  return (
    <Helmet prioritizeSeoTags>
      <html lang={localeMeta.htmlLang} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={alternateUrls.xDefault} />
      {alternateUrls.links.map((link) => (
        <link
          key={link.locale}
          rel="alternate"
          hrefLang={link.hrefLang}
          href={link.href}
        />
      ))}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={localeMeta.ogLocale} />
      {alternateUrls.links
        .filter((link) => link.locale !== locale)
        .map((link) => (
          <meta
            key={link.locale}
            property="og:locale:alternate"
            content={link.ogLocale}
          />
        ))}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content={localeDefaults.twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      {googleSiteVerification ? (
        <meta name="google-site-verification" content={googleSiteVerification} />
      ) : null}

      {resolvedSchemas.filter(Boolean).map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}

export default SEOHead
