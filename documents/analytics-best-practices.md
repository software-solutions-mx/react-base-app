# Analytics & Tracking Best Practices Guide

### Google Analytics 4 · GTM · Search Console · Tag Manager · React SPA

> **Stack:** React 18+ · Vite · React Router v6+ · Ruby on Rails 8 API · GA4 · GTM · Google Search Console · Core Web Vitals

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Google Tag Manager (GTM) — Install First](#2-google-tag-manager-gtm--install-first)
3. [Google Analytics 4 (GA4)](#3-google-analytics-4-ga4)
4. [Event Tracking Architecture](#4-event-tracking-architecture)
5. [Click & Interaction Tracking](#5-click--interaction-tracking)
6. [SPA Page View Tracking](#6-spa-page-view-tracking)
7. [E-commerce & Conversion Tracking](#7-e-commerce--conversion-tracking)
8. [SEO Tooling](#8-seo-tooling)
9. [Google Search Console](#9-google-search-console)
10. [Core Web Vitals](#10-core-web-vitals)
11. [User & Session Tracking](#11-user--session-tracking)
12. [Privacy, Consent & GDPR](#12-privacy-consent--gdpr)
13. [Rails API Integration](#13-rails-api-integration)
14. [Testing & Debugging](#14-testing--debugging)
15. [Project Structure](#15-project-structure)
16. [Best Practices & Pitfalls](#16-best-practices--pitfalls)

---

## 1. Architecture Overview

### The Golden Rule: GTM Owns All Third-Party Scripts

Never install Google Analytics, Meta Pixel, Hotjar, or any tracking script directly into your HTML `<head>`. Install **Google Tag Manager once**, then deploy everything else through GTM's interface. This means:

- Adding a new analytics tool = zero code deployments
- Updating tracking logic = GTM publish, no release cycle
- Non-engineers can manage tags without touching source code
- A single consent block can gate all tags simultaneously

### Tool Stack & Responsibilities

| Tool                         | Role                             | Install method                           |
| ---------------------------- | -------------------------------- | ---------------------------------------- |
| **Google Tag Manager (GTM)** | Container for all tags           | Direct in HTML — the only direct install |
| **Google Analytics 4 (GA4)** | Traffic, sessions, user behavior | Via GTM tag                              |
| **Google Search Console**    | SEO, indexing, queries           | DNS/HTML verification                    |
| **Google Looker Studio**     | Dashboards, reporting            | Web UI — no code                         |
| **Core Web Vitals**          | Performance tracking             | `web-vitals` npm package + GA4           |
| **Consent Mode v2**          | GDPR/privacy gating              | Via GTM + consent library                |

### Data Flow

```
User action
    ↓
dataLayer.push({ event: '...', ... })   ← your React code writes here
    ↓
GTM container                           ← listens to dataLayer, fires tags
    ↓
GA4 / Meta Pixel / Hotjar / etc.       ← tags send data to their endpoints
    ↓
GA4 → BigQuery (optional export)        ← for advanced analysis
    ↓
Looker Studio dashboards
```

Your React application **only ever writes to `window.dataLayer`**. It never calls `gtag()`, `fbq()`, or any third-party SDK directly. This is the abstraction that makes your analytics stack swappable.

---

## 2. Google Tag Manager (GTM) — Install First

GTM is the only tool you install directly in your source code. Everything else goes through it.

### Step 1 — Create a GTM Account

1. Go to [tagmanager.google.com](https://tagmanager.google.com)
2. Create an **Account** (your company name)
3. Create a **Container** (your app/domain) — select **Web**
4. Copy your Container ID: `GTM-XXXXXXX`

### Step 2 — Install GTM Snippets

GTM requires two snippets: one in `<head>`, one immediately after `<body>`.

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- ─── Google Tag Manager ──────────────────────────────────────────────
       MUST be as high in <head> as possible.
       Replace GTM-XXXXXXX with your actual container ID.
  ──────────────────────────────────────────────────────────────────────── -->
    <script>
      // Initialize dataLayer BEFORE GTM loads — critical for SPA tracking
      window.dataLayer = window.dataLayer || []

      // Initialize consent defaults BEFORE GTM (Consent Mode v2)
      // Users who haven't consented won't have their data sent to GA4
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      })
    </script>

    <script>
      ;(function (w, d, s, l, i) {
        w[l] = w[l] || []
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : ''
        j.async = true
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
        f.parentNode.insertBefore(j, f)
      })(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX')
    </script>

    <title>WalletPro</title>
  </head>

  <body>
    <!-- ─── GTM No-Script Fallback ──────────────────────────────────────────
       Required for users with JavaScript disabled.
       Place immediately after opening <body> tag.
  ──────────────────────────────────────────────────────────────────────── -->
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
        height="0"
        width="0"
        style="display:none;visibility:hidden"
      >
      </iframe>
    </noscript>

    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 3 — Environment-Specific Container IDs

Use different GTM containers per environment to avoid polluting production data with development events.

```bash
# .env.development
VITE_GTM_ID=GTM-XXXXXXX   # dev container — preview mode always on

# .env.production
VITE_GTM_ID=GTM-YYYYYYY   # production container
```

```typescript
// src/analytics/config.ts
export const GTM_ID = import.meta.env.VITE_GTM_ID
export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_ID
export const IS_ANALYTICS_ENABLED = import.meta.env.PROD && !!GTM_ID
```

### Step 4 — GTM Workspace Setup

Inside GTM, create these **Variables** first (Admin → Variables → New):

| Variable name        | Type                | Value                        |
| -------------------- | ------------------- | ---------------------------- |
| `GA4 Measurement ID` | Constant            | `G-XXXXXXXXXX`               |
| `Page Path`          | Data Layer Variable | `pagePath`                   |
| `Event Category`     | Data Layer Variable | `eventCategory`              |
| `Event Label`        | Data Layer Variable | `eventLabel`                 |
| `User ID`            | Data Layer Variable | `userId`                     |
| `Environment`        | JavaScript Variable | `() => import.meta.env.MODE` |

---

## 3. Google Analytics 4 (GA4)

### Step 1 — Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Admin → Create Property → **Google Analytics 4**
3. Copy your Measurement ID: `G-XXXXXXXXXX`
4. Link to your GTM container (Admin → Data Streams → Add stream → Web)

### Step 2 — GA4 Tag in GTM

In GTM, create a new **Tag**:

- Tag type: **Google Analytics: GA4 Configuration**
- Measurement ID: `{{GA4 Measurement ID}}` (your GTM variable)
- Trigger: **All Pages** — but note: for SPAs this fires only on initial load. Page views are handled separately (see Section 6).
- Enable **Send a page view event when this configuration loads**: **OFF** for SPAs (you control page views manually)

### Step 3 — Install the gtag Utility in React

```typescript
// src/analytics/gtag.ts

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Low-level dataLayer push.
 * All analytics calls ultimately flow through here.
 * Components and hooks never call this directly — use the higher-level
 * trackEvent(), trackPageView() functions instead.
 */
export function pushToDataLayer(data: Record<string, unknown>): void {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

/**
 * Typed gtag() wrapper — only used for Consent Mode and GA4 config.
 * For custom events, always use pushToDataLayer() instead.
 */
export function gtag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}
```

---

## 4. Event Tracking Architecture

### The Analytics Service — One Interface, Swappable Backend

Never scatter `dataLayer.push()` calls throughout your components. Build a single analytics service that components call. This means you can swap GA4 for another tool by editing one file.

```typescript
// src/analytics/service.ts
import { pushToDataLayer } from './gtag'
import { IS_ANALYTICS_ENABLED } from './config'

// ─── Event type registry ────────────────────────────────────────────────────
// Add every event your app fires here. This gives you autocomplete and
// prevents typos in event names that cause missing data in GA4.

export type AnalyticsEvent =
  // Navigation
  | 'page_view'
  | 'navigation_click'
  // Auth
  | 'sign_up'
  | 'login'
  | 'logout'
  // Wallet
  | 'wallet_view'
  | 'transfer_initiated'
  | 'transfer_completed'
  | 'transfer_failed'
  | 'deposit_initiated'
  | 'withdraw_initiated'
  // UI interactions
  | 'button_click'
  | 'form_submit'
  | 'form_error'
  | 'modal_open'
  | 'modal_close'
  | 'tab_change'
  | 'search'
  // Errors
  | 'js_error'
  | 'api_error'

export interface EventPayload {
  event: AnalyticsEvent
  // GA4 standard parameters
  category?: string
  label?: string
  value?: number
  // Custom dimensions
  userId?: string
  sessionId?: string
  locale?: string
  // Allow arbitrary additional parameters
  [key: string]: unknown
}

/**
 * Track a custom event.
 * This is the primary function components and hooks call.
 */
export function trackEvent(payload: EventPayload): void {
  if (!IS_ANALYTICS_ENABLED) {
    // Log to console in development for visibility
    console.debug('[Analytics]', payload)
    return
  }
  pushToDataLayer({
    ...payload,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track a page view — for SPA route changes.
 */
export function trackPageView(path: string, title: string): void {
  trackEvent({
    event: 'page_view',
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  })
}

/**
 * Set user properties that persist across all subsequent events.
 * Call after login — GA4 associates these with the session.
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  pushToDataLayer({
    event: 'user_identified',
    userId, // GA4 User-ID — enables cross-device tracking
    user_properties: {
      user_id: userId,
      ...properties,
    },
  })
}

/**
 * Clear user identity on logout.
 */
export function clearUser(): void {
  pushToDataLayer({
    event: 'user_cleared',
    userId: undefined,
    user_properties: null,
  })
}
```

### useAnalytics Hook

```typescript
// src/analytics/hooks/useAnalytics.ts
import { useCallback } from 'react'
import { trackEvent, type EventPayload } from '../service'
import { useLocale } from '@/i18n/hooks/useLocale'

/**
 * Component-level analytics hook.
 * Automatically attaches locale and any other ambient context to events.
 */
export function useAnalytics() {
  const { locale } = useLocale()

  const track = useCallback(
    (payload: Omit<EventPayload, 'locale'>) => {
      trackEvent({ ...payload, locale })
    },
    [locale],
  )

  return { track }
}
```

---

## 5. Click & Interaction Tracking

### useTrackClick Hook

```typescript
// src/analytics/hooks/useTrackClick.ts
import { useCallback } from 'react'
import { useAnalytics } from './useAnalytics'
import type { AnalyticsEvent } from '../service'

interface TrackClickOptions {
  event?: AnalyticsEvent
  category: string
  label: string
  value?: number
  metadata?: Record<string, unknown>
}

/**
 * Returns an onClick handler that tracks the click before calling
 * any existing onClick handler. Attach to any interactive element.
 *
 * Usage:
 *   const trackClick = useTrackClick()
 *   <button onClick={trackClick({ category: 'wallet', label: 'transfer_button' })}>
 *     Transfer
 *   </button>
 */
export function useTrackClick() {
  const { track } = useAnalytics()

  return useCallback(
    (options: TrackClickOptions, originalHandler?: () => void) => () => {
      track({
        event: options.event ?? 'button_click',
        category: options.category,
        label: options.label,
        value: options.value,
        ...options.metadata,
      })
      originalHandler?.()
    },
    [track],
  )
}
```

### useTrackForm Hook

```typescript
// src/analytics/hooks/useTrackForm.ts
import { useCallback } from 'react'
import { useAnalytics } from './useAnalytics'

/**
 * Tracks form submissions and validation errors.
 * Attach to form submit handlers and validation results.
 */
export function useTrackForm(formName: string) {
  const { track } = useAnalytics()

  const trackSubmit = useCallback(() => {
    track({ event: 'form_submit', category: 'form', label: formName })
  }, [track, formName])

  const trackError = useCallback(
    (errorField: string, errorMessage: string) => {
      track({
        event: 'form_error',
        category: 'form',
        label: formName,
        error_field: errorField,
        error_message: errorMessage,
      })
    },
    [track, formName],
  )

  return { trackSubmit, trackError }
}
```

### Usage in Components

```tsx
// src/features/wallet/TransferForm.tsx
import { useTrackClick } from '@/analytics/hooks/useTrackClick'
import { useTrackForm } from '@/analytics/hooks/useTrackForm'

export function TransferForm() {
  const trackClick = useTrackClick()
  const { trackSubmit, trackError } = useTrackForm('transfer_form')

  const handleSubmit = async (data: TransferData) => {
    trackSubmit()
    try {
      await submitTransfer(data)
      trackClick({
        event: 'transfer_completed',
        category: 'wallet',
        label: 'transfer_success',
        value: data.amountCents / 100, // GA4 value is decimal display amount
      })()
    } catch (err) {
      trackError('submit', err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="button"
        onClick={trackClick({
          event: 'transfer_initiated',
          category: 'wallet',
          label: 'transfer_button',
        })}
      >
        Transfer Funds
      </button>
    </form>
  )
}
```

### GTM — Click Trigger Setup

In GTM, create these **Triggers** for automatic click capture (no code required for standard links):

1. **All Clicks** — Type: Click - All Elements, Fire on: All Clicks
2. **Outbound Link Clicks** — Type: Click - Just Links, Fire on: Click URL does not contain your domain
3. **CTA Button Clicks** — Type: Click - All Elements, Fire on: Click Classes contains `btn-primary`
4. **File Downloads** — Type: Click - Just Links, Fire on: Click URL matches RegEx `\.(pdf|xlsx|csv|zip)$`

---

## 6. SPA Page View Tracking

React Router doesn't trigger full page loads on navigation — GTM's default All Pages trigger fires only once. You must manually push page view events on every route change.

### Route Change Tracker

```typescript
// src/analytics/RouteChangeTracker.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from './service'

/**
 * Mounts once at the app root. Tracks every React Router navigation
 * as a GA4 page_view event, which GTM picks up via a custom event trigger.
 *
 * Place inside <BrowserRouter> but outside route definitions.
 */
export function RouteChangeTracker() {
  const location = useLocation()

  useEffect(() => {
    // Defer slightly to allow <title> to update before capturing page_title
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title)
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  return null
}
```

```tsx
// src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import { RouteChangeTracker } from './analytics/RouteChangeTracker'

export function App() {
  return (
    <BrowserRouter>
      <RouteChangeTracker /> {/* ← mounts once, tracks all route changes */}
      {/* ...routes */}
    </BrowserRouter>
  )
}
```

### GTM — Custom Event Trigger for Page Views

In GTM, create a **Trigger**:

- Type: Custom Event
- Event name: `page_view`
- This trigger: All Custom Events

Then create a **Tag** (GA4 Event):

- Tag type: Google Analytics: GA4 Event
- Configuration tag: your GA4 Config tag
- Event name: `page_view`
- Parameters: `page_path` → `{{Page Path}}`, `page_title` → `{{Page Title}}`
- Trigger: the custom event trigger above

---

## 7. E-commerce & Conversion Tracking

GA4 has a built-in e-commerce schema. Using the standard event names ensures GA4's funnel reports and conversion tracking work without custom configuration.

### Wallet-Specific E-commerce Events

```typescript
// src/analytics/ecommerce.ts
import { pushToDataLayer } from './gtag'

interface TransactionItem {
  item_id: string
  item_name: string
  item_category: string
  price: number // decimal display value, NOT cents
  quantity: number
}

/**
 * GA4 standard e-commerce events.
 * Use these names exactly — GA4 recognizes them and populates
 * Monetization reports automatically.
 */

// User views wallet balance / transaction history
export function trackViewItem(itemId: string, itemName: string, valueCents: number) {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'MXN',
      value: valueCents / 100,
      items: [
        { item_id: itemId, item_name: itemName, price: valueCents / 100, quantity: 1 },
      ],
    },
  })
}

// User initiates a transfer / deposit / withdrawal
export function trackBeginCheckout(
  amountCents: number,
  type: 'transfer' | 'deposit' | 'withdrawal',
) {
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'MXN',
      value: amountCents / 100,
      items: [{ item_id: type, item_name: type, price: amountCents / 100, quantity: 1 }],
    },
  })
}

// User completes a transaction
export function trackPurchase(
  transactionId: string,
  amountCents: number,
  type: string,
  feeCents = 0,
) {
  // IMPORTANT: clear ecommerce object before each purchase event
  // to prevent data from previous events bleeding in
  pushToDataLayer({ ecommerce: null })

  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      value: amountCents / 100,
      tax: feeCents / 100,
      currency: 'MXN',
      items: [{ item_id: type, item_name: type, price: amountCents / 100, quantity: 1 }],
    },
  })
}

// User abandons mid-flow
export function trackCheckoutAbandoned(amountCents: number, step: string) {
  pushToDataLayer({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'MXN',
      value: amountCents / 100,
      checkout_step: step,
    },
  })
}
```

### GTM — E-commerce Tag Setup

In GTM, for each e-commerce event create a **Tag**:

- Tag type: Google Analytics: GA4 Event
- Event name: use `{{Event}}` (reads from dataLayer)
- Parameters: add `ecommerce` → `{{ecommerce}}` (Data Layer Variable)
- Trigger: Custom Event matching `purchase|begin_checkout|view_item`

---

## 8. SEO Tooling

### react-helmet-async — Document Head Management

```bash
npm install react-helmet-async
```

```tsx
// src/main.tsx
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
)
```

### SEO Component — Reusable Head Tags

```tsx
// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

const SITE_NAME = 'WalletPro'
const SITE_URL = 'https://walletpro.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`

/**
 * Drop this into every route-level component.
 * Handles: title, meta description, Open Graph, Twitter Card,
 * canonical URL, robots, and structured data.
 */
export function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ?? window.location.href

  return (
    <Helmet>
      {/* ─── Primary ──────────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ─── Open Graph (Facebook, LinkedIn, WhatsApp) ────────────────── */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* ─── Twitter Card ─────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
```

### JSON-LD Structured Data

```tsx
// src/components/StructuredData.tsx

interface OrganizationSchemaProps {
  name: string
  url: string
  logo: string
  sameAs?: string[]
}

/**
 * JSON-LD structured data for Google Search rich results.
 * Add to your root layout or home page.
 */
export function OrganizationSchema({
  name,
  url,
  logo,
  sameAs = [],
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Use in pages:
// <SEO title="Dashboard" description="Manage your wallet" />
// <OrganizationSchema name="WalletPro" url="https://walletpro.com" logo="..." />
```

### Usage on Route-Level Components

```tsx
// src/features/dashboard/DashboardPage.tsx
import { SEO } from '@/components/SEO'

export function DashboardPage() {
  return (
    <>
      <SEO
        title="Dashboard"
        description="Manage your WalletPro wallet, view transactions, and transfer funds."
        noIndex={true} // Authenticated pages should not be indexed
      />
      {/* page content */}
    </>
  )
}
```

### Sitemap Generation — Rails Side

```ruby
# Gemfile
gem 'sitemap_generator'

# config/sitemap.rb
SitemapGenerator::Sitemap.default_host = 'https://walletpro.com'

SitemapGenerator::Sitemap.create do
  # Public marketing pages only — never authenticated routes
  add '/',          changefreq: 'weekly',  priority: 1.0
  add '/about',     changefreq: 'monthly', priority: 0.6
  add '/pricing',   changefreq: 'weekly',  priority: 0.8
  add '/blog',      changefreq: 'daily',   priority: 0.7

  # Dynamic blog posts from database
  Post.published.find_each do |post|
    add post_path(post), lastmod: post.updated_at, priority: 0.5
  end
end
```

```bash
# Generate and ping Google
rails sitemap:refresh
```

---

## 9. Google Search Console

### Verification Methods (choose one)

**Method A — HTML meta tag (recommended for React):**

```tsx
// src/components/SEO.tsx — add inside <Helmet>
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
```

**Method B — DNS TXT record (most reliable, no code required):**

Add to your DNS provider:

```
Type: TXT
Name: @
Value: google-site-verification=YOUR_CODE
```

**Method C — Rails route serving the verification file:**

```ruby
# config/routes.rb
get 'google:code.html', to: proc { [200, {}, ['google-site-verification: YOUR_CODE']] }
```

### Search Console Setup Checklist

After verification:

1. **Submit sitemap:** Sitemaps → Add sitemap → `https://yourdomain.com/sitemap.xml`
2. **Set preferred domain:** Settings → Domain → confirm www vs non-www
3. **Link to GA4:** Admin → Search Console links → Add link → select your GA4 property
4. **Enable URL Inspection:** use regularly to check individual pages are indexed
5. **Monitor Core Web Vitals report:** Experience → Core Web Vitals

### Key Search Console Reports to Monitor Weekly

| Report           | Location         | What to watch                          |
| ---------------- | ---------------- | -------------------------------------- |
| Performance      | Search results   | Impressions, clicks, CTR, avg position |
| Coverage         | Indexing → Pages | Errors, excluded pages                 |
| Core Web Vitals  | Experience       | LCP, INP, CLS — must be "Good"         |
| Links            | Links            | Top linked pages, anchor text          |
| Mobile usability | Experience       | Touch target issues, font size         |

---

## 10. Core Web Vitals

### Install the web-vitals Package

```bash
npm install web-vitals
```

### Report Vitals to GA4

```typescript
// src/analytics/webVitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'
import { pushToDataLayer } from './gtag'

/**
 * Reports Core Web Vitals to GA4 via GTM.
 * GA4 surfaces these in the "Tech" reports automatically.
 *
 * Metric definitions:
 *   LCP  — Largest Contentful Paint  (target < 2.5s)
 *   INP  — Interaction to Next Paint  (target < 200ms) — replaces FID in 2024
 *   CLS  — Cumulative Layout Shift   (target < 0.1)
 *   FCP  — First Contentful Paint    (target < 1.8s)
 *   TTFB — Time to First Byte        (target < 800ms)
 */
function sendVitalToGA4({
  name,
  value,
  rating,
  id,
}: {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
}) {
  pushToDataLayer({
    event: 'web_vitals',
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_rating: rating,
    metric_id: id,
    // non_interaction prevents this from affecting bounce rate
    non_interaction: true,
  })
}

export function reportWebVitals(): void {
  onCLS(sendVitalToGA4)
  onINP(sendVitalToGA4)
  onLCP(sendVitalToGA4)
  onFCP(sendVitalToGA4)
  onTTFB(sendVitalToGA4)
}
```

```typescript
// src/main.tsx
import { reportWebVitals } from './analytics/webVitals'

// Call after React mounts — measurement begins after first render
reportWebVitals()
```

### GTM — Web Vitals Tag

Create a **Tag** in GTM:

- Tag type: GA4 Event
- Event name: `web_vitals`
- Parameters:
  - `metric_name` → `{{dlv - metric_name}}`
  - `metric_value` → `{{dlv - metric_value}}`
  - `metric_rating` → `{{dlv - metric_rating}}`
- Trigger: Custom Event — event name `web_vitals`

---

## 11. User & Session Tracking

### Identify Users After Login

```typescript
// src/features/auth/hooks/useAuth.ts
import { identifyUser, clearUser } from '@/analytics/service'

export function useAuth() {
  const login = async (credentials: Credentials) => {
    const user = await authApi.login(credentials)

    // Identify user in analytics immediately after successful login
    identifyUser(user.id, {
      plan: user.planName,
      created_at: user.createdAt,
      locale: user.locale,
    })

    return user
  }

  const logout = async () => {
    clearUser() // Clear analytics identity before session ends
    await authApi.logout()
  }

  return { login, logout }
}
```

### Session Enrichment — Rails API Headers

Send user context from Rails in API responses so the frontend can enrich analytics events:

```ruby
# app/controllers/application_controller.rb
after_action :set_analytics_headers

def set_analytics_headers
  return unless current_user
  # The React app reads these headers to enrich analytics events
  response.set_header('X-User-Id', current_user.id)
  response.set_header('X-User-Plan', current_user.plan_name)
  response.set_header('X-Session-Id', current_user.current_sign_in_at.to_i.to_s)
end
```

### Custom Dimensions in GA4

In GA4 Admin → Custom Definitions → Custom Dimensions, create:

| Dimension name | Scope | Description                |
| -------------- | ----- | -------------------------- |
| `user_id`      | User  | Internal user ID           |
| `plan`         | User  | Subscription plan name     |
| `locale`       | Event | App locale at event time   |
| `environment`  | Event | dev / staging / production |

---

## 12. Privacy, Consent & GDPR

### Consent Mode v2 Implementation

Consent Mode v2 is required for EU users from March 2024. GTM will not fire analytics tags until consent is granted.

```typescript
// src/analytics/consent.ts
import { gtag } from './gtag'

export type ConsentState = 'granted' | 'denied'

export interface ConsentSettings {
  analytics: ConsentState
  ads: ConsentState
  personalization: ConsentState
}

/**
 * Update consent state — call this from your cookie banner
 * when the user makes a choice.
 */
export function updateConsent(settings: ConsentSettings): void {
  gtag('consent', 'update', {
    analytics_storage: settings.analytics,
    ad_storage: settings.ads,
    ad_user_data: settings.ads,
    ad_personalization: settings.personalization,
  })

  // Persist consent decision
  localStorage.setItem(
    'consent_settings',
    JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString(),
    }),
  )
}

/**
 * Restore consent from previous session.
 * Call before GTM initializes.
 */
export function restoreConsent(): void {
  const stored = localStorage.getItem('consent_settings')
  if (!stored) return
  const settings: ConsentSettings = JSON.parse(stored)
  updateConsent(settings)
}

/**
 * Grant all consent — for regions that don't require explicit consent.
 */
export function grantAllConsent(): void {
  updateConsent({ analytics: 'granted', ads: 'granted', personalization: 'granted' })
}
```

### Cookie Banner Component

```tsx
// src/components/CookieBanner.tsx
import { useState, useEffect } from 'react'
import { updateConsent, restoreConsent } from '@/analytics/consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('consent_settings')
    if (!stored) {
      setVisible(true)
    } else {
      restoreConsent()
    }
  }, [])

  const acceptAll = () => {
    updateConsent({ analytics: 'granted', ads: 'granted', personalization: 'granted' })
    setVisible(false)
  }

  const rejectAll = () => {
    updateConsent({ analytics: 'denied', ads: 'denied', personalization: 'denied' })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div role="dialog" aria-label="Cookie consent">
      <p>We use cookies to analyze traffic and improve your experience.</p>
      <button onClick={rejectAll}>Reject non-essential</button>
      <button onClick={acceptAll}>Accept all</button>
    </div>
  )
}
```

### PII Rules — Never Send to Analytics

```typescript
// src/analytics/sanitize.ts

const PII_FIELDS = ['email', 'password', 'phone', 'ssn', 'card_number', 'cvv', 'name']

/**
 * Strip PII fields from any object before sending to analytics.
 * Wrap all event payloads through this function if the source
 * includes user-provided data.
 */
export function sanitizePayload<T extends Record<string, unknown>>(payload: T): T {
  const result = { ...payload }
  for (const field of PII_FIELDS) {
    if (field in result) {
      delete result[field]
    }
  }
  return result
}
```

---

## 13. Rails API Integration

### Server-Side Events — Measurement Protocol

For critical business events (transactions, refunds, subscription changes), send events from Rails directly to GA4 using the Measurement Protocol. This is more reliable than client-side tracking — it fires even if the user closes the browser.

```ruby
# app/services/analytics_service.rb
require 'net/http'
require 'json'

class AnalyticsService
  GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect'
  MEASUREMENT_ID = ENV['GA4_MEASUREMENT_ID']  # G-XXXXXXXXXX
  API_SECRET = ENV['GA4_API_SECRET']           # from GA4 Admin → Data Streams → Measurement Protocol API secrets

  # Track a server-side event directly to GA4
  # Use for: payment confirmations, subscription changes, refunds
  def self.track_event(client_id:, event_name:, params: {})
    return unless Rails.env.production?

    payload = {
      client_id: client_id,   # Must match the GA4 client ID from the browser cookie
      events: [{
        name: event_name,
        params: {
          engagement_time_msec: 100,
          session_id: params[:session_id],
          **params.except(:session_id),
        },
      }],
    }

    uri = URI("#{GA4_ENDPOINT}?measurement_id=#{MEASUREMENT_ID}&api_secret=#{API_SECRET}")
    Net::HTTP.post(uri, payload.to_json, 'Content-Type' => 'application/json')
  rescue => e
    Rails.logger.error("[Analytics] Failed to send event #{event_name}: #{e.message}")
  end
end

# Usage in controller/job:
# AnalyticsService.track_event(
#   client_id: cookies[:_ga],
#   event_name: 'purchase',
#   params: { transaction_id: transfer.id, value: transfer.amount_cents / 100.0, currency: 'MXN' }
# )
```

---

## 14. Testing & Debugging

### GTM Preview Mode

Before publishing any GTM changes:

1. In GTM → Preview (top right) → enter your site URL
2. GTM opens your site with the Tag Assistant overlay
3. Verify each tag fires on the correct trigger
4. Check Variables panel to confirm dataLayer values are correct
5. Only publish after preview validates

### GA4 DebugView

1. Install the **Google Analytics Debugger** Chrome extension
2. Open your app → the extension sends events to GA4 DebugView
3. In GA4: Admin → DebugView — see events in real time with all parameters
4. Verify event names, parameter names, and values match your spec

### dataLayer Inspector — Development

```typescript
// src/analytics/debug.ts

/**
 * Intercepts all dataLayer pushes in development and logs them
 * with clear formatting. Shows event name, parameters, and timestamp.
 *
 * Auto-disabled in production.
 */
export function initAnalyticsDebugger(): void {
  if (!import.meta.env.DEV) return

  const originalPush = window.dataLayer?.push?.bind(window.dataLayer)

  window.dataLayer = new Proxy(window.dataLayer || [], {
    get(target, prop) {
      if (prop !== 'push') return Reflect.get(target, prop)
      return (...args: unknown[]) => {
        const [payload] = args
        if (payload && typeof payload === 'object' && 'event' in payload) {
          console.group(
            `%c[Analytics] ${(payload as Record<string, unknown>).event}`,
            'color: #6c8fff; font-weight: bold',
          )
          console.table(payload)
          console.groupEnd()
        }
        return originalPush?.(...args)
      }
    },
  })
}
```

```typescript
// src/main.tsx
import { initAnalyticsDebugger } from './analytics/debug'
initAnalyticsDebugger()
```

### Unit Testing Analytics Calls

```typescript
// src/analytics/__tests__/service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { trackEvent } from '../service'

describe('Analytics service', () => {
  beforeEach(() => {
    window.dataLayer = []
    vi.stubEnv('PROD', 'true')
  })

  it('pushes event to dataLayer with correct shape', () => {
    trackEvent({
      event: 'transfer_initiated',
      category: 'wallet',
      label: 'transfer_button',
      value: 150,
    })

    expect(window.dataLayer).toHaveLength(1)
    expect(window.dataLayer[0]).toMatchObject({
      event: 'transfer_initiated',
      category: 'wallet',
      label: 'transfer_button',
      value: 150,
    })
  })

  it('includes timestamp on every event', () => {
    trackEvent({ event: 'button_click', category: 'ui', label: 'test' })
    expect(window.dataLayer[0]).toHaveProperty('timestamp')
  })
})
```

---

## 15. Project Structure

```
src/
│
├── analytics/                          ← All analytics infrastructure
│   ├── config.ts                       ← GTM_ID, GA4_ID, IS_ANALYTICS_ENABLED
│   ├── gtag.ts                         ← pushToDataLayer(), gtag() wrapper
│   ├── service.ts                      ← trackEvent(), trackPageView(), identifyUser()
│   ├── ecommerce.ts                    ← GA4 e-commerce event helpers
│   ├── consent.ts                      ← Consent Mode v2 management
│   ├── webVitals.ts                    ← Core Web Vitals reporting
│   ├── sanitize.ts                     ← PII stripping utilities
│   ├── debug.ts                        ← Development dataLayer debugger
│   ├── RouteChangeTracker.tsx          ← SPA page view tracking component
│   │
│   └── hooks/
│       ├── useAnalytics.ts             ← Primary component hook
│       ├── useTrackClick.ts            ← Click tracking hook
│       └── useTrackForm.ts             ← Form submit/error tracking hook
│
├── components/
│   ├── SEO.tsx                         ← react-helmet-async head management
│   ├── StructuredData.tsx              ← JSON-LD structured data
│   └── CookieBanner.tsx               ← GDPR consent UI
│
└── index.html                          ← GTM snippet + consent defaults
```

### Environment Variables

```bash
# .env.development
VITE_GTM_ID=GTM-XXXXXXX
VITE_GA4_ID=G-XXXXXXXXXX

# .env.production
VITE_GTM_ID=GTM-YYYYYYY
VITE_GA4_ID=G-YYYYYYYYYY

# Rails — server-side Measurement Protocol
GA4_MEASUREMENT_ID=G-YYYYYYYYYY
GA4_API_SECRET=your_api_secret_here
```

---

## 16. Best Practices & Pitfalls

### Critical Mistakes to Avoid

**Installing GA4 directly in HTML, bypassing GTM.**
The only script that belongs in your HTML is the GTM snippet. Everything else — GA4, Meta Pixel, Hotjar, Clarity — goes through GTM. Adding scripts directly creates an ungoverned mess that requires code deploys to change.

**Tracking PII in event parameters.**
Never send email addresses, names, phone numbers, or any personally identifiable information in event parameters. GA4's terms of service prohibit this, and it creates GDPR liability. Use `sanitizePayload()` on any user-provided data before pushing to the dataLayer.

**Not clearing the ecommerce object between events.**
GA4's e-commerce schema accumulates across events in the same page session. Always push `{ ecommerce: null }` before a purchase or refund event to prevent data from previous events contaminating the new one.

**Using page view trigger instead of custom event trigger for SPA.**
GTM's default page view trigger fires on the initial HTML load only. In a React SPA, all subsequent navigations are JavaScript route changes. You must use a Custom Event trigger listening for `page_view` pushed from your `RouteChangeTracker`.

**Not using separate GTM containers per environment.**
Development events will pollute your production GA4 data. Use a development container, enable Preview Mode on it permanently, and only publish the production container after full validation.

**Sending monetary values in cents to GA4.**
GA4's `value` parameter expects a decimal number (150.25), not integer cents (15025). Convert in your analytics helpers, never in business logic. The rule is: store as cents everywhere, convert to decimal only at the analytics boundary.

**Tracking every click indiscriminately.**
Raw click volume without meaning creates noise, not insight. Track clicks that represent user intent: CTA buttons, navigation decisions, form submissions, error states. Tracking every mouse event fills GA4 with unactionable data.

### Naming Conventions — Stick to Them

GA4 event names are permanent once data is collected. Changing them means losing historical continuity.

```
# Event names: snake_case, descriptive verb_noun pairs
✅  transfer_completed
✅  form_error
✅  page_view
❌  TransferCompleted
❌  click
❌  btn1

# Category: the feature domain
✅  wallet
✅  auth
✅  navigation
❌  page
❌  misc

# Label: the specific element or action
✅  transfer_button
✅  email_field
✅  logout_link
❌  button
❌  link
```

### GA4 Event Limit Awareness

| Limit                                | Value          |
| ------------------------------------ | -------------- |
| Max event parameters per event       | 25             |
| Max parameter name length            | 40 characters  |
| Max parameter value length           | 100 characters |
| Max custom dimensions (user-scoped)  | 25             |
| Max custom dimensions (event-scoped) | 50             |
| Max events per session               | 500            |

### SEO Checklist for React SPAs

React apps are client-rendered by default, which creates challenges for search engine indexing. Address these:

**Server-Side Rendering or Static Pre-rendering.** Google can execute JavaScript but it's slower and less reliable than static HTML. For public-facing marketing pages, consider SSR via a Rails-rendered view, or use a static site generator for the marketing shell and React only for the authenticated app.

**Unique `<title>` and `<meta name="description">` per route.** Use the `SEO` component on every route-level component. Never leave the default Vite placeholder title in production.

**Canonical URLs.** Always set `<link rel="canonical">`. Without it, Google may index query string variants of your pages as duplicate content.

**`noindex` on authenticated routes.** Any page behind login should have `<meta name="robots" content="noindex, nofollow">`. There is no value in indexing dashboard, profile, or transaction pages.

**Structured data.** Add JSON-LD Organization schema to your homepage. If you have a blog or content pages, add Article schema. This enables Google's rich results and improves click-through rates from search.

**Sitemap.** Submit a sitemap to Search Console. Only include public, indexable URLs — never include authenticated routes, API endpoints, or paginated duplicates.

---

_Guide covers GTM (web containers) · GA4 (4th generation) · Google Search Console · web-vitals v4 · react-helmet-async v2 · Consent Mode v2 · GA4 Measurement Protocol v2._
