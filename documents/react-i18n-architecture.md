# React i18n Architecture Guide

### Production-ready internationalization for React with Rails API awareness

> **Stack:** `react-i18next` · `i18next` · TypeScript · Vite · Future Rails 8 API

---

## Table of Contents

1. [Library Recommendation](#1-library-recommendation)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Installation & Configuration](#3-installation--configuration)
4. [Multi-Source Translation Strategy](#4-multi-source-translation-strategy)
5. [Rails API Awareness](#5-rails-api-awareness)
6. [Feature Implementation Examples](#6-feature-implementation-examples)
7. [Project Structure](#7-project-structure)
8. [Best Practices & Pitfalls](#8-best-practices--pitfalls)
9. [Agent Guardrails](#9-agent-guardrails)

---

## 1. Library Recommendation

### Verdict: `react-i18next` + `i18next`

This combination is the clear winner for a production-grade, multi-source, Rails-aware i18n setup.

`i18next` is the underlying engine — framework-agnostic, battle-tested, and extensible via plugins. `react-i18next` is the official React binding. Together they power 10M+ npm downloads per week and cover every use case you will face, including lazy loading, backend adapters, and runtime translation injection.

### Library Comparison

| Library               | Multi-Source   | Backend Plugin | Lazy Load       | Pluralization | TypeScript     | Ecosystem       |
| --------------------- | -------------- | -------------- | --------------- | ------------- | -------------- | --------------- |
| **react-i18next** ✦   | ✅ Yes         | ✅ Official    | ✅ Built-in     | ✅ ICU/CLDR   | ✅ First-class | ✅ Massive      |
| react-intl (FormatJS) | ⚠️ Limited     | ❌ None        | ⚠️ Manual       | ✅ ICU native | ✅ Good        | ⚠️ Medium       |
| Lingui                | ⚠️ Limited     | ❌ None        | ⚠️ Manual       | ✅ Good       | ✅ Good        | ⚠️ Growing      |
| next-intl             | ❌ Static only | ❌ None        | ⚠️ Next.js only | ✅ Good       | ✅ Good        | ⚠️ Next.js only |

### Why react-i18next wins for this use case

**Backend-agnostic plugins.** The `i18next-http-backend` plugin can load translations from any URL — your current static files today, your Rails API tomorrow. Zero refactoring required to make the switch.

**Namespace isolation.** Namespaces map perfectly to Rails controllers, models, and concerns. Each domain loads independently and lazily — a critical pattern for large apps like `wallet_pro`.

**Runtime resource injection.** `i18n.addResources()` lets you push translations received from any source (API, WebSocket, user input) into the active store at any time without a page reload.

**React Suspense integration.** Supports React Suspense for lazy namespace loading out of the box. No custom async wrappers — just Suspense boundaries at your route level.

---

## 9. Agent Guardrails

These rules are mandatory for all AI/code agents working in this repository:

- Never ship user-facing hardcoded text in JSX/TS/JS components.
- Always add user-facing copy to i18n JSON resources and render it with `t('...')`.
- This includes: UI labels, empty states, loading states, error messages, retry/back actions, aria labels, and SEO titles/descriptions.
- The active language must default to the browser language (`navigator`) whenever available.
- If browser language cannot be detected or is unsupported, fallback locale must be Spanish (`es`).
- Do not rely on cookies/localStorage/query params for default locale selection.
- Route locale params (for example `/:locale`) are explicit overrides and may still be honored.

---

## 2. Frontend Architecture

The architecture is built around three core principles:

- **Namespace isolation** — each domain's translations are independent and lazy-loaded
- **Source abstraction** — the app never knows or cares where translations come from
- **Lazy loading** — translations load when needed, not at boot

### Namespace Design: Mirror Rails Domain Boundaries

Map namespaces to your Rails controller domains. When the API comes online, each namespace can independently switch its source without touching any other namespace.

```typescript
// src/i18n/types.ts

// ─── Namespace registry ─────────────────────────────────────────────────────
// Each entry maps 1:1 to a Rails controller domain or concern.
// Adding a namespace here automatically enables lazy loading for it.

export const NAMESPACES = {
  // Always bundled — tiny, used everywhere, never lazy-loaded
  common: 'common',

  // Feature namespaces — lazy loaded on first use
  auth: 'auth', // → Rails: SessionsController, RegistrationsController
  dashboard: 'dashboard', // → Rails: DashboardController
  wallet: 'wallet', // → Rails: WalletController, TransactionsController
  profile: 'profile', // → Rails: UsersController, ProfilesController
  errors: 'errors', // → Rails: model error messages, validations
  admin: 'admin', // → Rails: Admin:: namespace
} as const

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES]
export type SupportedLocale = 'en' | 'es' | 'fr' | 'pt'

// Type-safe translation key helper (used with useTranslation hook)
export interface I18nResources {
  common: typeof import('./locales/en/common.json')
  auth: typeof import('./locales/en/auth.json')
  wallet: typeof import('./locales/en/wallet.json')
}

// Augment i18next to get full autocomplete on t() keys
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nResources
  }
}
```

---

## 3. Installation & Configuration

### Step 1 — Install packages

```bash
npm install i18next react-i18next \
  i18next-http-backend \
  i18next-browser-languagedetector
```

### Step 2 — Master configuration

```typescript
// src/i18n/config.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { DEFAULT_LOCALE } from './locales'
import { NAMESPACES } from './types'

// ─── Environment-based backend URL ──────────────────────────────────────────
// Phase 1: static JSON files (current)
// Phase 2: swap VITE_TRANSLATION_URL to your Rails API — zero code changes
const TRANSLATION_URL =
  import.meta.env.VITE_TRANSLATION_URL ?? '/locales/{{lng}}/{{ns}}.json'

i18n
  // ① Language detection: reads sources in priority order
  .use(LanguageDetector)
  // ② HTTP backend: fetches namespace files on demand
  .use(HttpBackend)
  // ③ React binding
  .use(initReactI18next)
  .init({
    // ─── Locale strategy ────────────────────────────────────────────────────
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ['en', 'es', 'fr', 'pt'],
    nonExplicitSupportedLngs: true, // 'en-US' → 'en'

    // ─── Namespace strategy ─────────────────────────────────────────────────
    ns: [NAMESPACES.common], // Only 'common' loads at boot
    defaultNS: NAMESPACES.common,
    partialBundledLanguages: true, // Static 'en' + remote others

    // ─── Backend (HTTP) ─────────────────────────────────────────────────────
    backend: {
      loadPath: TRANSLATION_URL,
      // Future Rails API: add headers, credentials, auth tokens here
      customHeaders: () => ({
        'Accept-Language': i18n.language,
      }),
      requestOptions: {
        cache: 'default',
        credentials: 'same-origin', // Sends Rails session cookie
      },
    },

    // ─── Detection order ────────────────────────────────────────────────────
    // 1. ?lng= param  (useful for testing/previewing locales)
    // 2. Cookie       (set by Rails: locale cookie — must match lookupCookie below)
    // 3. localStorage (user preference persisted client-side)
    // 4. navigator.languages (browser Accept-Language)
    // 5. htmlTag lang attribute
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },

    // ─── Behaviour ──────────────────────────────────────────────────────────
    react: {
      useSuspense: true, // Namespace loading via React.Suspense
    },
    interpolation: {
      escapeValue: false, // React handles XSS
    },
    saveMissing: import.meta.env.DEV, // Log missing keys in development
    missingKeyHandler: (lngs, ns, key) => {
      console.warn(`[i18n] Missing key: ${ns}:${key} (${lngs.join(', ')})`)
    },
  })

export default i18n
```

### Step 3 — Provider setup

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'
import App from './App'

// Import config side-effect to initialize i18next before first render
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n} defaultNS="common">
      {/* Suspense boundary: shows fallback while namespaces load */}
      <React.Suspense fallback={<div>Loading…</div>}>
        <App />
      </React.Suspense>
    </I18nextProvider>
  </React.StrictMode>,
)
```

---

## 4. Multi-Source Translation Strategy

The key insight is to build a **translation source abstraction layer** early. The app never knows or cares whether a translation came from a JSON file, a Rails API, or a database — it only calls `t('key')`. The source is an implementation detail of the backend configuration.

### Source Type Map

| Source              | Mechanism                                  | When to use                                |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| Static JSON files   | `HttpBackend` + `/locales/` path           | Core UI strings, bootstrapped with app     |
| Rails API response  | `injectTranslations()` after fetch         | Server-controlled copy, A/B-tested strings |
| Database content    | Rails serializes to `i18n` key in response | CMS content, user-generated labels         |
| User-generated text | Pass raw string directly — never translate | Names, addresses, free-form input          |
| Remote CDN          | Change `VITE_TRANSLATION_URL` env var      | High-scale deployments with CDN caching    |

### Universal Translation Injector

```typescript
// src/i18n/utils/namespaceLoader.ts
import i18n from '../config'
import type { Namespace, SupportedLocale } from '../types'

type TranslationRecord = Record<string, unknown>

/**
 * Universal translation injector.
 *
 * Accepts translations from ANY source and merges them into the active
 * i18next resource store. This is the single point of integration for:
 * API responses, WebSocket events, user content, A/B test variants.
 *
 * Deep-merges into existing resources, so partial updates work.
 */
export function injectTranslations(
  locale: SupportedLocale,
  namespace: Namespace,
  translations: TranslationRecord,
): void {
  i18n.addResources(locale, namespace, translations)
}

/**
 * Lazy namespace loader with deduplication.
 * Safe to call multiple times — tracks loaded namespaces.
 */
const loaded = new Set<string>()

export async function loadNamespace(
  namespace: Namespace,
  locale?: string,
): Promise<void> {
  const lng = locale ?? i18n.language
  const key = `${lng}:${namespace}`
  if (loaded.has(key)) return
  await i18n.loadNamespaces(namespace)
  loaded.add(key)
}
```

### API Response Integration Hook

```typescript
// src/i18n/hooks/useApiTranslation.ts
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { injectTranslations } from '../utils/namespaceLoader'
import type { Namespace, SupportedLocale } from '../types'

interface UseApiTranslationProps {
  namespace: Namespace
  locale: SupportedLocale
  /** Translations received from any async source */
  translations?: Record<string, unknown>
}

/**
 * Feeds translations from any async source (API, DB, WebSocket) directly
 * into the i18next store. The component calls t() identically regardless
 * of whether strings came from a JSON file or a Rails serializer.
 *
 * Usage:
 *   const { t } = useApiTranslation({
 *     namespace: 'wallet',
 *     locale: 'es',
 *     translations: data?.i18n?.translations,  // ← straight from Rails response
 *   })
 */
export function useApiTranslation({
  namespace,
  locale,
  translations,
}: UseApiTranslationProps) {
  const { t, i18n } = useTranslation(namespace)

  useEffect(() => {
    if (!translations) return
    injectTranslations(locale, namespace, translations)
  }, [locale, namespace, translations])

  return { t, i18n }
}
```

---

## 5. Rails API Awareness

Design the React app today with the Rails contract in mind. When Rails comes online, the integration should be a **configuration change**, not a refactor.

### The Rails i18n API Contract

Rails API responses should embed localized strings under a top-level `i18n` key. This allows the React app to inject translations received alongside data.

```ruby
# app/controllers/api/v1/wallets_controller.rb
module Api
  module V1
    class WalletsController < ApplicationController
      def show
        @wallet = current_user.wallet

        render json: {
          # ─── Business data ────────────────────────────────────────────────
          data: WalletSerializer.new(@wallet).as_json,

          # ─── Translation bundle ───────────────────────────────────────────
          # React injects this into i18next on receipt.
          # Only send strings for the current locale — I18n.locale is set
          # per-request via the Accept-Language header middleware below.
          i18n: {
            locale: I18n.locale.to_s,
            namespace: 'wallet',
            translations: I18n.t('wallet', locale: I18n.locale),
          },
        }
      end
    end
  end
end
```

**Example response shape:**

```json
{
  "data": {
    "id": "w_abc123",
    "balance_cents": 15025,
    "currency": "MXN"
  },
  "i18n": {
    "locale": "es",
    "namespace": "wallet",
    "translations": {
      "balance": "Saldo disponible",
      "transactions": "Movimientos",
      "withdraw": "Retirar fondos"
    }
  }
}
```

### React Side — Consuming the Contract

```tsx
// src/features/wallet/WalletView.tsx
import { useApiTranslation } from '@/i18n/hooks/useApiTranslation'
import { useWallet } from './hooks/useWallet'

export function WalletView() {
  const { data, isLoading } = useWallet()

  // When data arrives, its i18n bundle is injected automatically.
  // The t() function will use the freshly injected strings immediately.
  const { t } = useApiTranslation({
    namespace: 'wallet',
    locale: data?.i18n?.locale ?? 'en',
    translations: data?.i18n?.translations,
  })

  if (isLoading) return <Skeleton />

  return (
    <section>
      <h2>{t('balance')}</h2>
      <p>{t('transactions')}</p>
    </section>
  )
}
```

### Rails Locale Middleware — Set Once, Forget It

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :set_locale

  private

  def set_locale
    # Priority: explicit param → Accept-Language header → default
    I18n.locale = resolve_locale
  end

  def resolve_locale
    requested =
      params[:locale] ||
      parse_accept_language(request.env['HTTP_ACCEPT_LANGUAGE']) ||
      I18n.default_locale

    I18n.available_locales.include?(requested.to_sym) ?
      requested : I18n.default_locale
  end

  def parse_accept_language(header)
    return nil unless header
    header.split(',').first&.split(';').first&.strip&.split('-').first
  end
end
```

### Coordinating Locale Between React and Rails

| Concern          | React                                                    | Rails                                                        |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| Locale detection | `LanguageDetector` reads cookie/localStorage/navigator   | `before_action :set_locale` reads `Accept-Language` + params |
| Locale storage   | `localStorage` + cookie                                  | Session + cookie                                             |
| Cookie name      | `lookupCookie: 'locale'`                                 | `cookies[:locale]`                                           |
| Locale switch    | `changeLocale()` + PATCH to `/api/v1/preferences/locale` | Updates session + sets cookie                                |
| API header       | `Accept-Language: es` sent with every request            | Read by `parse_accept_language`                              |

---

## 6. Feature Implementation Examples

### Locale Hook — Switch and Sync

```typescript
// src/i18n/hooks/useLocale.ts
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { SupportedLocale } from '../types'

export function useLocale() {
  const { i18n } = useTranslation()

  const changeLocale = useCallback(
    async (locale: SupportedLocale) => {
      await i18n.changeLanguage(locale)

      // Sync with Rails: send locale preference to API so the server
      // can set the locale cookie and sync session state
      await fetch('/api/v1/preferences/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locale }),
      })

      // Update HTML lang attribute for accessibility + SEO
      document.documentElement.lang = locale
    },
    [i18n],
  )

  return {
    locale: i18n.language as SupportedLocale,
    changeLocale,
    isRTL: ['ar', 'he', 'fa'].includes(i18n.language),
  }
}
```

### Translation File — Interpolation, Pluralization, Nesting

```json
// src/i18n/locales/en/wallet.json
{
  "balance": "Available balance",
  "greeting": "Welcome back, {{name}}",
  "transaction_count": "{{count}} transaction",
  "transaction_count_plural": "{{count}} transactions",
  "transfer": {
    "title": "Transfer funds",
    "confirm": "Send {{amount}} to {{recipient}}",
    "success": "Transfer complete!"
  }
}
```

### All Features in One Component

```tsx
// src/features/wallet/WalletCard.tsx
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/i18n/hooks/useLocale'
import { formatCurrency, formatDate } from '@/i18n/utils/formatters'

export function WalletCard({ user, balance, txCount, lastActivity }: Props) {
  // Scoped to 'wallet' namespace — only loads wallet.json
  const { t } = useTranslation('wallet')
  const { locale, changeLocale } = useLocale()

  return (
    <div>
      {/* Interpolation */}
      <p>{t('greeting', { name: user.firstName })}</p>

      {/* Currency formatting — uses Intl.NumberFormat internally */}
      <p>
        {t('balance')}: {formatCurrency(balance, 'MXN', locale)}
      </p>

      {/* Pluralization — i18next selects _plural variant automatically */}
      <p>{t('transaction_count', { count: txCount })}</p>

      {/* Date formatting */}
      <p>{formatDate(lastActivity, locale)}</p>

      {/* Nested key */}
      <button>{t('transfer.title')}</button>

      {/* Locale switcher */}
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value as SupportedLocale)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  )
}
```

### Formatters — Intl-Powered, No External Library

```typescript
// src/i18n/utils/formatters.ts

/**
 * All formatters use the native Intl API.
 * Monetary values stay as integer cents (never store floats) and are
 * converted to decimals only at display time — wallet_pro rule.
 */

export function formatCurrency(
  cents: number, // Always integer cents — never floats
  currencyCode: string, // ISO 4217: 'MXN', 'USD', 'EUR'
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(cents / 100) // cents → display only, never stored
}

export function formatDate(
  date: Date | string,
  locale: string,
  opts?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string, locale: string): string {
  const diff = (new Date(date).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second')
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(n)
}
```

### Lazy Loading with Suspense Boundaries

```tsx
// react-i18next loads the namespace automatically when useTranslation('admin')
// is called for the first time. The Suspense boundary shows the fallback during
// that load — the JS chunk and the translations load together.

import React, { lazy, Suspense } from 'react'

const AdminPanel = lazy(() => import('./AdminPanel'))

export function AdminRoute() {
  return (
    <Suspense fallback={<div>Loading admin…</div>}>
      <AdminPanel /> {/* Code + translations load together */}
    </Suspense>
  )
}

// Inside AdminPanel.tsx — the hook triggers namespace loading
function AdminPanel() {
  const { t } = useTranslation('admin') // Triggers lazy load of admin.json
  return <h1>{t('title')}</h1>
}
```

---

## 7. Project Structure

```
src/
│
├── i18n/                               ← All i18n infrastructure lives here
│   ├── config.ts                       ← init + plugin assembly
│   ├── index.ts                        ← re-exports (single import surface)
│   ├── types.ts                        ← NAMESPACES, SupportedLocale, I18nResources
│   │
│   ├── backends/
│   │   ├── static.backend.ts           ← imports JSON statically (SSR-safe)
│   │   ├── http.backend.ts             ← fetches from URL (static or Rails)
│   │   └── multi.backend.ts            ← static → HTTP fallback chain
│   │
│   ├── detectors/
│   │   └── railsLocaleDetector.ts      ← reads Rails-set cookie/header
│   │
│   ├── hooks/
│   │   ├── useLocale.ts                ← locale + changeLocale + isRTL
│   │   ├── useNamespace.ts             ← load namespace imperatively
│   │   └── useApiTranslation.ts        ← inject API translations + return t()
│   │
│   ├── utils/
│   │   ├── formatters.ts               ← currency, date, number (Intl-based)
│   │   ├── inject.ts                   ← low-level i18n.addResources wrapper
│   │   └── namespaceLoader.ts          ← loadNamespace() with deduplication
│   │
│   └── locales/                        ← bundled fallback translations
│       ├── en/                         ← English always bundled (fallback)
│       │   ├── common.json             ← nav, buttons, errors — always loaded
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   ├── wallet.json
│       │   ├── profile.json
│       │   ├── errors.json
│       │   └── admin.json
│       ├── es/
│       │   ├── common.json
│       │   └── auth.json               ← others served by Rails API
│       └── fr/
│           └── common.json
│
├── features/                           ← Feature-sliced structure
│   ├── auth/
│   │   └── LoginPage.tsx               ← useTranslation('auth')
│   ├── wallet/
│   │   └── WalletView.tsx              ← useApiTranslation({ ns: 'wallet' })
│   └── admin/
│       └── AdminPanel.tsx              ← lazy loaded + useTranslation('admin')
│
├── main.tsx                            ← I18nextProvider + root Suspense
└── App.tsx
```

### Example Locale Files

```json
// src/i18n/locales/en/common.json
{
  "app": "WalletPro",
  "loading": "Loading...",
  "error": "Something went wrong",
  "save": "Save",
  "cancel": "Cancel",
  "confirm": "Confirm",
  "nav": {
    "dashboard": "Dashboard",
    "wallet": "Wallet",
    "profile": "Profile"
  }
}
```

```json
// src/i18n/locales/es/common.json
{
  "app": "WalletPro",
  "loading": "Cargando...",
  "error": "Algo salió mal",
  "save": "Guardar",
  "cancel": "Cancelar",
  "confirm": "Confirmar",
  "nav": {
    "dashboard": "Panel",
    "wallet": "Billetera",
    "profile": "Perfil"
  }
}
```

### `.env` Configuration

```bash
# .env.development
VITE_TRANSLATION_URL=/locales/{{lng}}/{{ns}}.json

# .env.production (Phase 2 — switch to Rails with one line)
VITE_TRANSLATION_URL=https://api.walletpro.com/v1/translations/{{lng}}/{{ns}}
```

---

## 8. Best Practices & Pitfalls

### Common Mistakes to Avoid

**Calling `useTranslation()` without a namespace argument.**
Without a namespace, every component uses `'common'`. This loads the wrong file, causes cache misses, and defeats lazy loading entirely. Always pass the explicit namespace: `useTranslation('wallet')`.

**Translating user-generated content.**
Never pass user names, addresses, or free-form text through `t()`. Only translate UI strings. User content is passed as interpolation values: `t('greeting', { name: user.name })`. The `name` value is never looked up in a locale file.

**Storing monetary values as floats for display.**
Keep monetary values as integer cents everywhere in the application. Only convert to decimals at the final formatting step inside `formatCurrency()`. Never store `150.25` — store `15025`.

**One massive translation file per locale.**
A single `en.json` file loads everything upfront, kills performance, and couples all features. Use namespaces so a user visiting only the wallet never downloads the admin translations.

**Hardcoding locale in Intl formatters.**
Never write `new Intl.NumberFormat('en-US')`. Always pass the active locale from `useLocale()`. Hardcoded locales break for non-English users and are invisible during testing.

**Mismatching cookie names between React and Rails.**
The `lookupCookie` in i18next detection must match the Rails cookie name exactly. A mismatch causes locale detection to fall back to `navigator` on every page load, ignoring any locale the user set via the Rails session.

**Not versioning the translation API endpoint.**
Use `/api/v1/translations/{{lng}}/{{ns}}`. Versioning lets you ship breaking translation schema changes without coordinating frontend and backend deployments simultaneously.

### Performance Checklist

| Rule                                               | Reason                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Never preload all namespaces                       | Let Suspense + `useTranslation` handle loading on demand                                   |
| Bundle only `common.json` in the JS bundle         | Everything else is a network request with HTTP cache                                       |
| Set `Cache-Control` on Rails translation responses | `public, max-age=3600, stale-while-revalidate=86400` eliminates round-trips                |
| Memoize Intl constructors                          | `Intl.NumberFormat` is expensive to construct — cache at module level                      |
| Keep key nesting to two levels                     | Deeper nesting makes keys verbose; prefer `wallet.balance` over `wallet.card.info.balance` |
| Deduplicate namespace loads                        | The `loaded` Set in `namespaceLoader.ts` prevents re-fetching on re-renders                |

### TypeScript Key Safety

The `I18nResources` augmentation in `types.ts` gives full TypeScript autocomplete on `t('wallet.balance')`. Typos in translation keys become compile errors, not silent runtime fallbacks. This is especially valuable as the namespace count grows during the `wallet` → `wallet_pro` migration.

```typescript
// ✅ TypeScript error if 'wallet.balence' doesn't exist in wallet.json
const label = t('wallet.balence') // Compile error: typo caught at build time
```

### Matching Rails YAML Structure

Your Rails locale files should mirror the namespace JSON structure:

```yaml
# config/locales/wallet.es.yml
es:
  wallet:
    balance: 'Saldo disponible'
    transactions: 'Movimientos'
    transfer:
      title: 'Transferir fondos'
```

When Rails serializes `I18n.t('wallet', locale: :es)`, it returns the same key structure as your `locales/es/wallet.json`. This means you can serve the same data from either source with no React-side changes — the switch from static files to the Rails API is entirely transparent to components.

### Migration Path: `wallet` → `wallet_pro`

When pulling translations from the legacy `wallet` application:

1. Export each Rails locale YAML namespace as a separate JSON file matching the namespace map above.
2. Use `injectTranslations()` to merge legacy strings — existing static strings won't be overwritten, only supplemented by deeper keys from the legacy source.
3. Switch namespaces one at a time via the `VITE_TRANSLATION_URL` env var — no big-bang migration required.

---

_Guide covers react-i18next v14+, i18next v23+, React 18+, Rails 8 API._
