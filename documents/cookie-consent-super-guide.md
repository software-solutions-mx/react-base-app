# Cookie Consent & Storage Super Guide
### The Complete Implementation Standard for React + Ruby on Rails
#### Public App · Admin App · Software Solutions Frontend Agent · Software Solutions Admin Agent

> **Integrations covered:** Vercel Analytics · Google Analytics 4 · Google Tag Manager · All future tools
> **Stack:** React 18 · TypeScript · Ruby on Rails API · Two separate React applications
> **Legal baseline:** GDPR · CCPA · LGPD
> **Note:** This guide provides technical architecture and best practices. Final consent wording, retention periods, and regional defaults must be validated with legal counsel before release.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Recommended Architecture](#2-recommended-architecture)
3. [Cookie Storage and Consent Best Practices](#3-cookie-storage-and-consent-best-practices)
4. [Frontend Implementation — React](#4-frontend-implementation--react)
5. [Backend/API — Ruby on Rails](#5-backendapi--ruby-on-rails)
6. [Public React App Guidance](#6-public-react-app-guidance)
7. [Admin React App Guidance](#7-admin-react-app-guidance)
8. [Instructions: Software Solutions Frontend Agent](#8-instructions-software-solutions-frontend-agent)
9. [Instructions: Software Solutions Admin Agent](#9-instructions-software-solutions-admin-agent)
10. [UI/UX — Cookie Settings Panel with Base Theme](#10-uiux--cookie-settings-panel-with-base-theme)
11. [Future-Proofing for Additional Tools](#11-future-proofing-for-additional-tools)
12. [Risks, Anti-Patterns, and Things to Avoid](#12-risks-anti-patterns-and-things-to-avoid)
13. [Final Implementation Checklist](#13-final-implementation-checklist)

---

## 1. Executive Summary

### The Problem

Cookie consent is not a UI feature — it is a legal requirement and a trust contract with users. GDPR (EU), CCPA (California), LGPD (Brazil), and equivalent regulations require users have meaningful control over non-essential cookies before they are set. Violations carry fines up to €20 million or 4% of global annual revenue under GDPR.

The current stack — Vercel Analytics, Google Analytics 4, and Google Tag Manager — sets cookies and collects data qualifying as "analytics" and potentially "marketing" under every major privacy regulation. Without a compliant consent system, every page load is a potential violation.

### The Solution in One Sentence

**Build one shared consent architecture used by both React apps, gate all non-essential script loading behind category-based consent, store consent state in a versioned first-party cookie, synchronize to Rails for authenticated users, and use a centralized tool registry so adding future tools requires only one file change.**

### Core Principles

- **Consent First** — No tracking cookies without explicit user consent
- **Default Deny** — All non-essential tools blocked until consent permits them
- **Category-Based Control** — Users choose which cookie categories to accept
- **Tool Registry** — Single source of truth for every tool, its category, load logic, and cleanup
- **Centralized Engine** — One consent engine controls all tool initialization
- **Security by Default** — HttpOnly for session cookies, Secure flags everywhere, SameSite on all cookies
- **Future-Proof** — Adding new tools requires one registry entry, nothing else
- **Versioned Consent** — Re-consent triggered automatically when policy changes

### Two Apps, Two Approaches

**Public React App** — Full GDPR consent banner, granular category controls, all analytics blocked until explicit consent, 180-day cookie expiry, re-consent on policy version change.

**Admin React App** — Simplified flow. Staff users operate under different legal basis (legitimate interest / employment). No public banner required. Settings panel provided for transparency and opt-out capability.

### Key Decisions

| Decision | Rationale |
|---|---|
| Consent gates ALL script loading | Legal compliance — no cookies set before consent |
| Tool registry + adapters | One-file extension for any new tool |
| GTM Consent Mode v2 | Google's official consent signal — required for GA4 compliance |
| First-party consent cookie | Works without login; persists across sessions |
| Rails API sync for auth users | Cross-device preference persistence |
| Category-based (not one boolean) | Required by GDPR; future-proof for new tool types |
| Version field on consent record | Re-consent triggered automatically when policy changes |
| Admin auto-grant analytics | Staff legal basis; no public banner needed |

---

## 2. Recommended Architecture

### Cookie Categories (IAB TCF v2.2 Aligned)

```typescript
// shared/consent/consentTypes.ts

export type ConsentCategory =
  | 'necessary'
  | 'preferences'
  | 'analytics'
  | 'marketing';

export type AppKind = 'public' | 'admin';

export const COOKIE_CATEGORIES = {
  necessary: {
    id:          'necessary',
    label:       'Strictly Necessary',
    description: 'Required for the website to function. Cannot be disabled.',
    required:    true,
    defaultOn:   true,
  },
  analytics: {
    id:          'analytics',
    label:       'Analytics & Performance',
    description: 'Help us understand how visitors use the website. Data is anonymized.',
    required:    false,
    defaultOn:   false,   // Off until consent — GDPR requirement
  },
  marketing: {
    id:          'marketing',
    label:       'Marketing & Advertising',
    description: 'Used to deliver relevant ads and track campaign effectiveness.',
    required:    false,
    defaultOn:   false,
  },
  preferences: {
    id:          'preferences',
    label:       'Preferences & Personalization',
    description: 'Remember your settings and personalize your experience.',
    required:    false,
    defaultOn:   false,
  },
} as const

export interface ConsentState {
  version:     string        // Policy version — triggers re-consent when changed
  app:         AppKind
  categories: {
    necessary:   true        // Always true — legally cannot be disabled
    preferences: boolean
    analytics:   boolean
    marketing:   boolean
  }
  source:      'banner' | 'modal' | 'settings' | 'server' | 'auto'
  updatedAt:   string        // ISO timestamp
  region?:     string        // For future region-aware behavior
}

export const DEFAULT_CONSENT = (app: AppKind): ConsentState => ({
  version:    '2026-04-07',
  app,
  categories: { necessary: true, preferences: false, analytics: false, marketing: false },
  source:     'banner',
  updatedAt:  new Date().toISOString(),
})

export interface ToolDefinition {
  id:              string
  name:            string
  category:        ConsentCategory
  environments:    AppKind[]
  requiresConsent: boolean
  description:     string
  cookies?:        string[]      // Cookies this tool may create
  load:   () => Promise<void> | void
  unload?: () => Promise<void> | void
  cleanup?: () => Promise<void> | void   // Runs on consent withdrawal
}
```

### Project File Structure

```
shared/consent/           ← Used by both React apps
  consentTypes.ts
  consentSchema.ts
  consentStorage.ts       ← Cookie read/write
  consentRegistry.ts      ← All tools registered here
  consentEngine.ts        ← Applies consent to tools
  adapters/
    gtmAdapter.ts
    gaAdapter.ts
    vercelAnalyticsAdapter.ts
  ConsentProvider.tsx
  useConsent.ts
  CookieBanner.tsx
  CookiePreferencesModal.tsx
  CookieSettingsPanel.tsx

public-react-app/
  App.tsx                 ← Mounts ConsentProvider with isAdminApp=false

admin-react-app/
  App.tsx                 ← Mounts ConsentProvider with isAdminApp=true, autoGrant

rails-api/
  app/models/cookie_consent.rb
  app/controllers/api/v1/consent_controller.rb
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│               React Frontend Apps                        │
│  ┌──────────────────┐       ┌──────────────────┐        │
│  │  Public App      │       │  Admin App        │        │
│  │  - Banner        │       │  - Settings Page  │        │
│  │  - Modal         │       │  - Audit Log      │        │
│  │  - Footer Link   │       │  - Auto-granted   │        │
│  └────────┬─────────┘       └────────┬──────────┘        │
│           └──────────┬───────────────┘                   │
│                      ▼                                    │
│              ┌────────────────┐                          │
│              │ ConsentProvider│  ← single source of truth│
│              │ + useConsent() │                          │
│              └───────┬────────┘                          │
│                      ▼                                    │
│              ┌────────────────┐                          │
│              │ ConsentEngine  │  ← applies consent       │
│              │  (Tool Registry│    to all tools          │
│              │   + Adapters)  │                          │
│              └───────┬────────┘                          │
│         ┌────────────┼────────────┐                      │
│         ▼            ▼            ▼                      │
│      GTM/GA4    Vercel Ana    Future tools               │
└─────────────────────┼───────────────────────────────────┘
                       │ HTTPS (auth users only)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Ruby on Rails API                           │
│  GET  /api/v1/consent-config   ← policy version/cats    │
│  GET  /api/v1/cookie-consent   ← load user prefs        │
│  PUT  /api/v1/cookie-consent   ← save user prefs        │
│  CookieConsent model + audit log                        │
└─────────────────────────────────────────────────────────┘
```

### Consent Decision Flow

```
Page Load
    │
    ▼
Read ss_cookie_consent cookie
    │
    ├── Found + version matches
    │       │
    │       └── Apply consent state → load permitted tools
    │
    └── Not found / version mismatch
            │
            ├── Public App  → Show ConsentBanner
            │                 Block all non-necessary tools
            │
            └── Admin App   → Auto-grant analytics + preferences
                              No banner shown

User Action (Public)
    │
    ├── Accept All             → Grant all, save, load all tools
    ├── Reject Non-Essential   → Necessary only, save, no extra tools
    └── Manage Settings        → Open PreferencesModal
            │
            └── Per-category toggles → Save
                    │
                    ├── Write ss_cookie_consent cookie
                    ├── Update GTM Consent Mode v2 signals
                    ├── Load tools for granted categories
                    ├── Run cleaners for denied categories
                    └── Sync to Rails API (if authenticated)
```

---

## 3. Cookie Storage and Consent Best Practices

### A. Separate Cookie Types — Never Mix These Concerns

**1. Necessary security/session cookies** (no consent toggle — ever)
- Authentication session cookie
- CSRF cookie / `authenticity_token`
- MFA state
- Admin session security
- These are set by Rails with `HttpOnly: true`

**2. Consent preference cookie** (`ss_cookie_consent`)
- First-party, JavaScript-readable
- Stores the versioned consent state JSON
- No PII
- See specification below

**3. Vendor/analytics cookies**
- `_ga`, `_gid`, `_ga_*` (Google Analytics)
- GTM-managed tag cookies
- Marketing pixel cookies
- These are governed by the consent engine

### B. Consent Cookie Specification

| Attribute | Value | Reason |
|---|---|---|
| Name | `ss_cookie_consent` | Namespaced, descriptive |
| Value | JSON-serialized `ConsentState` | Versioned, machine-readable |
| Expiry | 180 days | Conservative; GDPR allows up to 12 months |
| Path | `/` | All routes must read it |
| Secure | `true` (production) | HTTPS only |
| SameSite | `Lax` | CSRF protection without breaking navigation |
| HttpOnly | `false` | JavaScript must read it — by design |

Example payload:

```json
{
  "version": "2026-04-07",
  "app": "public",
  "categories": {
    "necessary": true,
    "preferences": false,
    "analytics": false,
    "marketing": false
  },
  "source": "banner",
  "updatedAt": "2026-04-07T10:15:00Z",
  "region": "unknown"
}
```

### C. Cookie Security Attributes — Mandatory

```typescript
// shared/consent/consentStorage.ts
import Cookies from 'js-cookie'  // js-cookie handles encoding and security
import { ConsentState }          from './consentTypes'

const COOKIE_NAME    = 'ss_cookie_consent'
const IS_PRODUCTION  = import.meta.env.PROD

export function readConsent(): ConsentState | null {
  const raw = Cookies.get(COOKIE_NAME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConsentState
  } catch {
    return null
  }
}

export function writeConsent(state: ConsentState): void {
  Cookies.set(COOKIE_NAME, JSON.stringify(state), {
    secure:   IS_PRODUCTION,  // HTTPS only in production
    sameSite: 'Lax',
    expires:  180,            // Days
    path:     '/',
  })
}

export function clearConsent(): void {
  Cookies.remove(COOKIE_NAME, { path: '/' })
}

export function hasValidConsent(currentVersion: string): boolean {
  const stored = readConsent()
  return stored !== null && stored.version === currentVersion
}
```

For cases where `js-cookie` is not used, the raw implementation:

```typescript
// Raw cookie utilities (no library dependency)
const PROD = import.meta.env.PROD

export function setCookie(name: string, value: string, days: number): void {
  const maxAge  = days * 24 * 60 * 60
  let str       = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  str          += `; max-age=${maxAge}`
  str          += '; path=/'
  if (PROD)  str += '; Secure'
  str          += '; SameSite=Lax'
  document.cookie = str
}

export function getCookie(name: string): string | null {
  const key  = `; ${encodeURIComponent(name)}=`
  const pair = `; ${document.cookie}`.split(key)
  return pair.length === 2
    ? decodeURIComponent(pair[1].split(';')[0])
    : null
}

export function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Lax${PROD ? '; Secure' : ''}`
}
```

### D. Use Category-Based Consent — Never a Single Boolean

```typescript
// ❌ Single boolean — breaks when new tool types are added
{ "accepted": true }

// ✅ Category-based — survives any new tool
{
  "necessary":   true,
  "preferences": true,
  "analytics":   false,
  "marketing":   false
}
```

### E. Consent Must Gate Initialization, Not Just Data Sending

The most critical implementation rule:

```typescript
// ❌ Wrong — loads GA at boot, tries to suppress later
useEffect(() => {
  initializeGA()    // Fires regardless of consent
}, [])

// ✅ Correct — GA never initializes until consent granted
useEffect(() => {
  if (consent.categories.analytics) {
    initializeGA()
  }
}, [consent.categories.analytics])
```

For GTM, the Consent Mode v2 default-deny block must run **before** the GTM script loads:

```html
<!-- index.html — MUST come before any analytics scripts -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    analytics_storage:     'denied',
    ad_storage:            'denied',
    ad_user_data:          'denied',
    ad_personalization:    'denied',
    functionality_storage: 'denied',
    security_storage:      'granted',
    wait_for_update:       500
  });
</script>
<!-- GTM is loaded DYNAMICALLY after consent — never here -->
```

### F. Deleting Cookies Is Part of Consent Withdrawal

When a user withdraws consent, the system must:

1. Stop future loading of the tool
2. Disable future event sending
3. Delete first-party vendor cookies where possible
4. Document which third-party cookies cannot be removed client-side

Each tool in the registry defines its `cleanup()` function for this purpose.

### G. Version Your Consent for Re-consent Flows

```typescript
// consentStorage.ts — bump when policy changes materially
export const CONSENT_POLICY_VERSION = '2026-04-07'

// hasValidConsent() returns false for all users with old version
// → Banner shows again → Re-consent captured
```

Trigger re-consent when:
- New tool categories are added
- Existing tool behavior changes materially
- Policy wording changes significantly
- Regional legal requirements change

### H. Do Not Rely on a Single Storage Layer

| Layer | Purpose | Primary? |
|---|---|---|
| First-party cookie (`ss_cookie_consent`) | Runtime gating, persists without login | **Yes** |
| Rails database (`cookie_consents` table) | Cross-device persistence, audit trail | Authenticated users |
| In-memory React context | Fast access within session | Cache only |

Avoid using `localStorage` as the only consent store. It is domain-scoped (not subdomain), cleared by privacy browsers, and not readable by Rails middleware.

---

## 4. Frontend Implementation — React

### Tool Registry — Every Tool Declared in One File

```typescript
// shared/consent/consentRegistry.ts
import { ToolDefinition }            from './consentTypes'
import { loadGTM, cleanupGTM }       from './adapters/gtmAdapter'
import { loadGA, cleanupGA }         from './adapters/gaAdapter'
import { loadVercelAnalytics }       from './adapters/vercelAnalyticsAdapter'

export const toolRegistry: ToolDefinition[] = [
  {
    id:              'google-tag-manager',
    name:            'Google Tag Manager',
    category:        'analytics',
    environments:    ['public'],
    requiresConsent: true,
    description:     'Loads your tag container after analytics consent. Individual GTM tags inherit consent signals.',
    cookies:         [],           // GTM itself sets no cookies; individual tags may
    load:            loadGTM,
    cleanup:         cleanupGTM,
  },
  {
    id:              'google-analytics-4',
    name:            'Google Analytics 4',
    category:        'analytics',
    environments:    ['public'],
    requiresConsent: true,
    description:     'Measures aggregate usage after analytics consent.',
    cookies:         ['_ga', '_gid', '_ga_*'],
    load:            loadGA,
    cleanup:         cleanupGA,
  },
  {
    id:              'vercel-analytics',
    name:            'Vercel Analytics',
    category:        'analytics',
    environments:    ['public', 'admin'],
    requiresConsent: true,
    description:     'Privacy-friendly usage analytics. Gated to analytics consent category.',
    cookies:         [],
    load:            loadVercelAnalytics,
    cleanup:         () => { window.__VA_ENABLED__ = false },
  },
  // Add future tools here — zero other code changes needed
]
```

### Tool Adapters — One Per Tool

```typescript
// shared/consent/adapters/gtmAdapter.ts
const GTM_ID  = import.meta.env.VITE_GTM_ID
let gtmLoaded = false

export function loadGTM(): void {
  if (gtmLoaded || !GTM_ID) return
  gtmLoaded = true

  // Update Consent Mode v2 signals BEFORE loading GTM
  updateConsentModeSignals({ analytics: true })

  const s    = document.createElement('script')
  s.async    = true
  s.src      = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(s)

  const ns   = document.createElement('noscript')
  const ifr  = document.createElement('iframe')
  ifr.src    = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`
  ifr.height = ifr.width = '0'
  ifr.style.display = ifr.style.visibility = 'hidden' as never
  ns.appendChild(ifr)
  document.body.insertBefore(ns, document.body.firstChild)
}

export function cleanupGTM(): void {
  // Update Consent Mode to deny — GTM stops firing optional tags
  updateConsentModeSignals({ analytics: false })
}

function updateConsentModeSignals(granted: { analytics: boolean; marketing?: boolean }): void {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'consent_update',
    analytics_storage:     granted.analytics   ? 'granted' : 'denied',
    ad_storage:            granted.marketing   ? 'granted' : 'denied',
    ad_user_data:          granted.marketing   ? 'granted' : 'denied',
    ad_personalization:    granted.marketing   ? 'granted' : 'denied',
    functionality_storage: 'denied',
    security_storage:      'granted',
  })
}
```

```typescript
// shared/consent/adapters/gaAdapter.ts
const GA_ID = import.meta.env.VITE_GA4_ID

export function loadGA(): void {
  if (!GA_ID) return

  const s    = document.createElement('script')
  s.async    = true
  s.src      = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
  }
  window.gtag('js', new Date())
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  window.gtag('config', GA_ID)
}

export function cleanupGA(): void {
  if (window.gtag) {
    window.gtag('consent', 'update', { analytics_storage: 'denied' })
  }
  // Delete GA cookies
  const gaCookies = ['_ga', '_gid']
  gaCookies.forEach(name => deleteCookie(name))
  // Delete _ga_* measurement ID cookies
  document.cookie.split(';').forEach(c => {
    const [k] = c.trim().split('=')
    if (k?.trim().startsWith('_ga_')) deleteCookie(k.trim())
  })
}
```

```typescript
// shared/consent/adapters/vercelAnalyticsAdapter.ts
import { Analytics } from '@vercel/analytics/react'

export function loadVercelAnalytics(): void {
  window.__VA_ENABLED__ = true
}
```

### Consent Engine — Central Tool Orchestrator

```typescript
// shared/consent/consentEngine.ts
import { ConsentState, AppKind, ToolDefinition } from './consentTypes'
import { toolRegistry }                           from './consentRegistry'

const initialized = new Set<string>()

/**
 * Applies consent state to all registered tools.
 * Called on init and every time consent changes.
 */
export async function applyConsent(state: ConsentState, app: AppKind): Promise<void> {
  const relevantTools = toolRegistry.filter(t => t.environments.includes(app))

  for (const tool of relevantTools) {
    const allowed = !tool.requiresConsent || state.categories[tool.category] === true

    if (allowed && !initialized.has(tool.id)) {
      await tool.load()
      initialized.add(tool.id)
    }

    if (!allowed && initialized.has(tool.id)) {
      await tool.cleanup?.()
      initialized.delete(tool.id)
    }
  }
}
```

### ConsentProvider — Single Source of Truth

```tsx
// shared/consent/ConsentProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { ConsentState, ConsentCategory, AppKind, DEFAULT_CONSENT } from './consentTypes'
import { readConsent, writeConsent, clearConsent }                  from './consentStorage'
import { applyConsent }                                             from './consentEngine'
import { syncConsentToApi }                                        from './consentApi'

const CURRENT_VERSION = '2026-04-07'

interface ConsentContextValue {
  consent:         ConsentState | null
  hasDecided:      boolean
  showBanner:      boolean
  showModal:       boolean
  isCategory:      (cat: ConsentCategory) => boolean
  acceptAll:       () => void
  rejectAll:       () => void
  updateCategory:  (cat: ConsentCategory, value: boolean) => void
  savePreferences: () => void
  openModal:       () => void
  closeModal:      () => void
  resetConsent:    () => void
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

interface ConsentProviderProps {
  children:    React.ReactNode
  app:         AppKind
  autoGrant?:  ConsentCategory[]   // Admin: categories to auto-grant
}

export function ConsentProvider({ children, app, autoGrant = [] }: ConsentProviderProps) {
  const [consent,    setConsent]    = useState<ConsentState | null>(null)
  const [pendingState, setPending]  = useState<ConsentState>(DEFAULT_CONSENT(app))
  const [hasDecided, setHasDecided] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showModal,  setShowModal]  = useState(false)

  useEffect(() => {
    const stored = readConsent()
    const validStored = stored?.version === CURRENT_VERSION ? stored : null

    if (app === 'admin') {
      // Admin: auto-grant specified categories, merge with stored
      const adminBase: ConsentState = {
        ...DEFAULT_CONSENT(app),
        categories: {
          ...DEFAULT_CONSENT(app).categories,
          ...Object.fromEntries(autoGrant.map(c => [c, true])),
        } as ConsentState['categories'],
        source:    'auto',
        updatedAt: new Date().toISOString(),
      }
      const final = validStored
        ? { ...adminBase, categories: { ...adminBase.categories, ...validStored.categories, necessary: true as const } }
        : adminBase
      setConsent(final)
      setPending(final)
      setHasDecided(true)
      void applyConsent(final, app)
      return
    }

    if (validStored) {
      setConsent(validStored)
      setPending(validStored)
      setHasDecided(true)
      void applyConsent(validStored, app)
    } else {
      setShowBanner(true)   // First visit or version mismatch
    }
  }, [app, autoGrant])

  const persist = useCallback((state: ConsentState) => {
    const final: ConsentState = {
      ...state,
      categories: { ...state.categories, necessary: true },
      version:    CURRENT_VERSION,
      updatedAt:  new Date().toISOString(),
    }
    setConsent(final)
    setPending(final)
    setHasDecided(true)
    setShowBanner(false)
    setShowModal(false)
    writeConsent(final)
    void applyConsent(final, app)
    syncConsentToApi(final).catch(console.warn)  // Best-effort, non-blocking
  }, [app])

  const base = DEFAULT_CONSENT(app)

  const acceptAll = useCallback(() => {
    persist({
      ...base,
      categories: { necessary: true, preferences: true, analytics: true, marketing: true },
      source:     'banner',
    })
  }, [base, persist])

  const rejectAll = useCallback(() => {
    persist({ ...base, source: 'banner' })
  }, [base, persist])

  const updateCategory = useCallback((cat: ConsentCategory, value: boolean) => {
    if (cat === 'necessary') return
    setPending(prev => ({
      ...prev,
      categories: { ...prev.categories, [cat]: value },
    }))
  }, [])

  const savePreferences = useCallback(() => {
    persist({ ...pendingState, source: 'modal' })
  }, [pendingState, persist])

  const resetConsent = useCallback(() => {
    clearConsent()
    setConsent(null)
    setPending(DEFAULT_CONSENT(app))
    setHasDecided(false)
    if (app !== 'admin') setShowBanner(true)
  }, [app])

  const isCategory = useCallback(
    (cat: ConsentCategory) => consent?.categories[cat] ?? false,
    [consent]
  )

  const value = useMemo<ConsentContextValue>(() => ({
    consent,
    hasDecided,
    showBanner,
    showModal,
    isCategory,
    acceptAll,
    rejectAll,
    updateCategory,
    savePreferences,
    openModal:    () => setShowModal(true),
    closeModal:   () => setShowModal(false),
    resetConsent,
  }), [consent, hasDecided, showBanner, showModal, isCategory, acceptAll, rejectAll,
      updateCategory, savePreferences, resetConsent])

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider')
  return ctx
}

export function useConsentGate(category: ConsentCategory): boolean {
  const { isCategory } = useConsent()
  return isCategory(category)
}
```

### Conditional Vercel Analytics

```tsx
// shared/consent/ConditionalVercelAnalytics.tsx
import { Analytics }       from '@vercel/analytics/react'
import { useConsentGate }  from './ConsentProvider'

export function ConditionalVercelAnalytics() {
  return useConsentGate('analytics') ? <Analytics /> : null
}
```

### Rails API Sync

```typescript
// shared/consent/consentApi.ts
import { http }         from '@/lib/http/client'
import { ConsentState } from './consentTypes'

export async function syncConsentToApi(consent: ConsentState): Promise<void> {
  await http.put('/api/v1/cookie-consent', {
    appKind:         consent.app,
    version:         consent.version,
    categories:      consent.categories,
    source:          consent.source,
    updatedAtClient: consent.updatedAt,
    region:          consent.region,
  })
}

export async function loadConsentFromApi(): Promise<ConsentState | null> {
  try {
    const res = await http.get('/api/v1/cookie-consent')
    return res.data?.consent ?? null
  } catch {
    return null
  }
}
```

### App.tsx Integration

```tsx
// public-react-app/src/App.tsx
import { ConsentProvider }            from 'shared/consent/ConsentProvider'
import { CookieBanner }               from 'shared/consent/CookieBanner'
import { CookiePreferencesModal }     from 'shared/consent/CookiePreferencesModal'
import { ConditionalVercelAnalytics } from 'shared/consent/ConditionalVercelAnalytics'

export default function App() {
  return (
    <ConsentProvider app="public">
      <CookieBanner />
      <CookiePreferencesModal />
      <ConditionalVercelAnalytics />
      <RouterProvider router={router} />
    </ConsentProvider>
  )
}

// admin-react-app/src/App.tsx
export default function AdminApp() {
  return (
    <ConsentProvider app="admin" autoGrant={['analytics', 'preferences']}>
      {/* No CookieBanner — admin auto-grants */}
      <CookiePreferencesModal />   {/* Still available from Settings */}
      <ConditionalVercelAnalytics />
      <RouterProvider router={adminRouter} />
    </ConsentProvider>
  )
}
```

### Do Not Track Respect (Public App)

```tsx
// CookieBanner.tsx — check DNT on mount
useEffect(() => {
  if (navigator.doNotTrack === '1' || (window as Window & { doNotTrack?: string }).doNotTrack === '1') {
    rejectAll()    // Automatically reject non-essential when DNT is enabled
  }
}, [rejectAll])
```

### Route-Level Analytics Gating

```tsx
// Route tracking must only fire AFTER analytics consent
import { useEffect }       from 'react'
import { useLocation }     from 'react-router-dom'
import { useConsentGate }  from 'shared/consent/ConsentProvider'

export function RouteChangeTracker() {
  const location        = useLocation()
  const analyticsAllowed = useConsentGate('analytics')

  useEffect(() => {
    if (!analyticsAllowed) return   // ← Guard: don't track without consent

    window.gtag?.('event', 'page_view', {
      page_path:  location.pathname,
      page_title: document.title,
    })
  }, [location.pathname, analyticsAllowed])

  return null
}
```
---

## 5. Backend/API — Ruby on Rails

### A. Rails Should Coordinate, Not Replace, Frontend Gating

The frontend decides what to initialize in real time based on the consent cookie. Rails helps by:

- Persisting preferences for authenticated users (cross-device)
- Serving policy version and optional registry metadata via `consent-config`
- Recording consent changes for auditing
- Returning app-specific defaults

**Critical rule:** Backend should never trust client consent for security decisions. Consent governs optional tools — not authorization, CSRF protection, fraud detection, or audit logging.

### B. Models

```ruby
# db/migrate/YYYYMMDDHHMMSS_create_cookie_consents.rb
class CreateCookieConsents < ActiveRecord::Migration[7.2]
  def change
    create_table :cookie_consents do |t|
      t.references  :user,             null: true, foreign_key: true, index: true
      t.string      :app_kind,         null: false                # 'public' or 'admin'
      t.string      :version,          null: false
      t.jsonb       :categories,       null: false, default: {}
      t.string      :source,           null: false
      t.string      :region
      t.datetime    :updated_at_client, null: false
      t.string      :ip_hash                                      # Hashed, not raw IP
      t.string      :user_agent_hash
      t.timestamps
    end
    add_index :cookie_consents, [:user_id, :app_kind, :version]
  end
end
```

```ruby
# app/models/cookie_consent.rb
class CookieConsent < ApplicationRecord
  belongs_to :user, optional: true

  VALID_APP_KINDS = %w[public admin].freeze
  VALID_SOURCES   = %w[banner modal settings server auto].freeze

  validates :app_kind,         inclusion: { in: VALID_APP_KINDS }
  validates :version,          presence: true
  validates :categories,       presence: true
  validates :source,           inclusion: { in: VALID_SOURCES }
  validates :updated_at_client, presence: true

  validate :necessary_always_true

  before_create :hash_identifying_data

  scope :latest_for_user, ->(user_id, app_kind) {
    where(user_id: user_id, app_kind: app_kind).order(created_at: :desc).limit(1)
  }

  private

  def necessary_always_true
    if categories.is_a?(Hash) && categories['necessary'] == false
      errors.add(:categories, 'necessary must always be true')
    end
  end

  def hash_identifying_data
    # Hash for audit without storing raw PII
    salt = ENV.fetch('CONSENT_HASH_SALT', SecureRandom.hex(16))
    self.ip_hash         = Digest::SHA256.hexdigest("#{Current.request&.remote_ip}#{salt}") if Current.request&.remote_ip
    self.user_agent_hash = Digest::SHA256.hexdigest(Current.request&.user_agent.to_s[0..500]) if Current.request&.user_agent
  end
end
```

```ruby
# app/models/cookie_consent_log.rb
# Keep full history — required for GDPR Art. 7 demonstration of consent
class CookieConsentLog < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :cookie_consent

  validates :action, inclusion: { in: %w[create update withdraw] }

  # NEVER delete audit records
  def self.record(consent, action:, categories_before: {})
    create!(
      user: consent.user,
      cookie_consent: consent,
      action: action,
      categories_before: categories_before,
      categories_after:  consent.categories,
      recorded_at:       Time.current
    )
  end
end
```

### C. Controllers

```ruby
# app/controllers/api/v1/consent_config_controller.rb
module Api
  module V1
    class ConsentConfigController < ApplicationController
      skip_before_action :authenticate_user!

      # GET /api/v1/consent-config
      # Returns policy version, available categories, app-specific defaults
      def show
        render json: {
          version:    Rails.application.config.consent_policy_version,
          categories: category_definitions,
          defaults:   default_categories,
          policy_url: '/privacy-policy',
          updated_at: Rails.application.config.consent_policy_date,
        }
      end

      private

      def category_definitions
        {
          necessary:   { label: 'Strictly Necessary', required: true },
          analytics:   { label: 'Analytics & Performance', required: false },
          marketing:   { label: 'Marketing & Advertising', required: false },
          preferences: { label: 'Preferences & Personalization', required: false },
        }
      end

      def default_categories
        { necessary: true, preferences: false, analytics: false, marketing: false }
      end
    end
  end
end
```

```ruby
# app/controllers/api/v1/cookie_consent_controller.rb
module Api
  module V1
    class CookieConsentController < ApplicationController
      before_action :authenticate_user!, only: [:show]
      # create/update allows unauthenticated (captures pre-login consent)

      # GET /api/v1/cookie-consent
      def show
        record = CookieConsent.latest_for_user(current_user.id, app_kind_param).first
        render json: { consent: record ? serialize(record) : nil }
      end

      # PUT /api/v1/cookie-consent
      def create
        # Always create a new record (audit trail — never update in place)
        prev_record = CookieConsent.latest_for_user(current_user&.id, consent_params[:app_kind]).first
        record      = CookieConsent.new(consent_params)
        record.user = current_user if current_user

        if record.save
          CookieConsentLog.record(record,
            action: prev_record ? 'update' : 'create',
            categories_before: prev_record&.categories || {}
          )
          render json: { consent: serialize(record) }, status: :created
        else
          render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # Admin audit log
      # GET /api/v1/admin/cookie-consents/audit-log
      def audit_log
        authorize! :read_audit_log, CookieConsentLog
        logs = CookieConsentLog
          .includes(:user, :cookie_consent)
          .order(created_at: :desc)
          .page(params[:page]).per(50)
        render json: { audit_log: logs.map { |l| serialize_log(l) }, meta: pagination_meta(logs) }
      end

      private

      def consent_params
        params.require(:consent).permit(:app_kind, :version, :source, :updated_at_client, :region,
          categories: [:necessary, :preferences, :analytics, :marketing])
      end

      def app_kind_param
        params[:app_kind].presence_in(%w[public admin]) || 'public'
      end

      def serialize(r)
        { necessary:   r.categories['necessary'],
          preferences: r.categories['preferences'],
          analytics:   r.categories['analytics'],
          marketing:   r.categories['marketing'],
          version:     r.version,
          source:      r.source,
          app_kind:    r.app_kind,
          updated_at:  r.updated_at_client&.iso8601 }
      end

      def serialize_log(l)
        { id: l.id, action: l.action, user_email: l.user&.email,
          categories_before: l.categories_before, categories_after: l.categories_after,
          recorded_at: l.recorded_at.iso8601 }
      end
    end
  end
end
```

### D. Routes

```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    get  'consent-config',   to: 'consent_config#show'
    get  'cookie-consent',   to: 'cookie_consent#show'
    put  'cookie-consent',   to: 'cookie_consent#create'

    namespace :admin do
      get 'cookie-consents/audit-log', to: 'cookie_consent#audit_log'
    end
  end
end
```

### E. Rails Security Configuration

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key:          '_ss_session',
  secure:       Rails.env.production?,
  httponly:     true,           # JavaScript cannot read session cookie
  same_site:    :lax,
  expire_after: 8.hours         # Shorter for admin security

# config/initializers/content_security_policy.rb
Rails.application.config.content_security_policy do |policy|
  policy.default_src :self
  policy.script_src  :self,
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://vercel.live'
  policy.connect_src :self,
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://stats.g.doubleclick.net',
    'https://vitals.vercel-insights.com'
  policy.img_src     :self, :data,
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  policy.frame_src   'https://www.googletagmanager.com'
end

# config/initializers/consent_policy.rb
Rails.application.config.consent_policy_version = '2026-04-07'
Rails.application.config.consent_policy_date    = '2026-04-07'
```

---

## 6. Public React App Guidance

**Agent:** Software Solutions Frontend Agent
**Context:** Public-facing application — full GDPR compliance required

### Non-Negotiable Rules

1. **Never load GTM, GA4, or Vercel Analytics before analytics consent is granted**
2. **Banner must appear on first visit** for users without a stored consent cookie
3. **"Reject Non-Essential" must be equally prominent as "Accept All"** — refusing must be as easy as accepting (GDPR Art. 7)
4. **No pre-ticked analytics or marketing checkboxes** — pre-ticked = invalid consent under GDPR
5. **Footer must always have a "Cookie Settings" link** on every page, every visit
6. **On opt-out, run tool cleaners** to delete existing analytics cookies immediately
7. **Respect Do Not Track** — auto-reject non-essential if DNT header detected

### ConsentProvider Configuration

```tsx
<ConsentProvider app="public">
  <CookieBanner />
  <CookiePreferencesModal />
  <ConditionalVercelAnalytics />
  {children}
</ConsentProvider>
```

### Footer — Persistent Cookie Settings Link

```tsx
// Every page layout component must include this
import { useConsent } from 'shared/consent/ConsentProvider'

export function Footer() {
  const { openModal } = useConsent()
  return (
    <footer>
      {/* ... */}
      <nav aria-label="Legal">
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <button type="button" onClick={openModal} className="cookie-settings-link">
          Cookie Settings
        </button>
      </nav>
    </footer>
  )
}
```

### Re-consent on Policy Version Change

```typescript
// consentStorage.ts — bump this when policy changes materially
export const CURRENT_VERSION = '2026-05-01'  // Was '2026-04-07'
// All existing users see the banner again on next visit (version mismatch)
```

---

## 7. Admin React App Guidance

**Agent:** Software Solutions Admin Agent
**Context:** Internal admin application — staff users, different legal basis

### Why Admin Is Different

Staff using internal tools are not "public users" under GDPR. The legal basis is typically "legitimate interest" (Art. 6(1)(f)) or the employment contract. A pop-up consent banner is not required. A settings panel is still required for transparency.

**Important:** If your admin app is accessible to external partners, treat it like the public app.

### Key Differences

| Concern | Public App | Admin App |
|---|---|---|
| Consent banner | Required | Not shown |
| Analytics | User choice | Auto-granted |
| Marketing | User choice | Not auto-granted |
| Legal basis | Consent (Art. 6(1)(a)) | Legitimate interest / employment |
| Cookie settings | Footer link | User Settings page |
| Audit log | Client only | Server + admin UI view |

### ConsentProvider Configuration

```tsx
<ConsentProvider
  app="admin"
  autoGrant={['analytics', 'preferences']}  // Marketing NEVER auto-granted
>
  {/* No CookieBanner here */}
  <CookiePreferencesModal />
  <ConditionalVercelAnalytics />
  {children}
</ConsentProvider>
```

### Admin Cookie Settings Page

```tsx
// admin-app/src/pages/settings/CookiePreferencesPage.tsx
import { CookieSettingsPanel } from 'shared/consent/CookieSettingsPanel'
import { useQuery }            from '@tanstack/react-query'

export function CookiePreferencesPage() {
  // Admin-only: fetch audit log
  const { data: auditLog } = useQuery({
    queryKey: ['cookie-audit-log'],
    queryFn:  () => http.get('/api/v1/admin/cookie-consents/audit-log').then(r => r.data),
  })

  return (
    <div className="settings-page">
      <h1>Cookie & Privacy Preferences</h1>
      <p>Analytics cookies are enabled by default for staff. Adjust below if needed.</p>

      <CookieSettingsPanel inline />

      {/* Audit log — admin only */}
      {auditLog && (
        <section className="audit-log-section">
          <h2>Consent Change History</h2>
          <table className="audit-table">
            <thead>
              <tr><th>Date</th><th>User</th><th>Action</th><th>Categories After</th></tr>
            </thead>
            <tbody>
              {auditLog.audit_log?.map((entry: AuditLogEntry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.recorded_at).toLocaleString()}</td>
                  <td>{entry.user_email ?? 'Anonymous'}</td>
                  <td>{entry.action}</td>
                  <td>{Object.entries(entry.categories_after)
                    .filter(([, v]) => v).map(([k]) => k).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
```

---

## 8. Instructions: Software Solutions Frontend Agent

> **These instructions must be added to the agent's system prompt / behavior configuration under a section titled "Cookie & Consent Standards."**

---

### AGENT BEHAVIOR — COOKIE & CONSENT STANDARDS
#### Software Solutions Frontend Agent (Public React App)

**RULE 1: Default deny all non-essential scripts.**
Treat all non-essential scripts and tracking tools as blocked by default until category consent explicitly allows them. Never initialize GTM, GA4, marketing pixels, session replay tools, or embedded third-party trackers before consent allows them.

**RULE 2: All new tools go through the tool registry.**
```typescript
// Pattern for adding any new tool to consentRegistry.ts:
{
  id:              'new-tool-id',
  name:            'New Tool Name',
  category:        'analytics',    // 'analytics' | 'marketing' | 'preferences'
  environments:    ['public'],
  requiresConsent: true,
  description:     'What this tool does and what data it collects.',
  cookies:         ['cookie_name_1', 'cookie_name_2'],
  load:    () => { /* script injection here */ },
  cleanup: () => { /* cookie deletion here */ },
}
```
Never add one-off `<script>` tags to `index.html` for any third-party tool. The only script allowed in `index.html` is the GTM Consent Mode defaults block.

**RULE 3: Cookie security attributes are mandatory.**
Every `document.cookie` write (or `js-cookie` call) must include:
- `Secure` — in production, always
- `SameSite=Lax` — minimum CSRF protection
- `path=/` — applies to all routes
- Reasonable `max-age` or `expires` — nothing indefinite without justification

**RULE 4: Consent state only from `useConsent()`.**
Never read the `ss_cookie_consent` cookie directly in a component. Always: `const { isCategory } = useConsent()`.

**RULE 5: Banner must be accessible.**
- `role="dialog"` and `aria-label` on banner container
- All actions (`Accept All`, `Reject Non-Essential`, `Manage Settings`) are `<button>` elements
- Focus moves into banner when it appears
- Tab order works correctly within the banner
- Escape key closes the preferences modal

**RULE 6: Footer cookie settings link is mandatory.**
Every page layout must include a "Cookie Settings" button calling `openModal()` from `useConsent()`. This link must never be removed or hidden.

**RULE 7: Respect Do Not Track.**
Check `navigator.doNotTrack === '1'` on mount in `CookieBanner`. Auto-reject non-essential if DNT is set.

**RULE 8: Version bumps trigger automatic re-consent.**
When `CURRENT_VERSION` in `consentStorage.ts` changes, the mismatch logic handles re-consent automatically. No other code change needed.

**RULE 9: Route analytics only after consent.**
React Router tracking must be wrapped in `useConsentGate('analytics')`. Never attach route listeners globally at boot.

**RULE 10: Every new tracking integration requires:**
- Category assignment in the registry
- Description in the settings UI copy
- Cleanup function that deletes the tool's cookies
- PR review that confirms no scripts load before consent in test

---

## 9. Instructions: Software Solutions Admin Agent

> **These instructions must be added to the agent's system prompt / behavior configuration under a section titled "Cookie & Consent Standards — Admin App."**

---

### AGENT BEHAVIOR — COOKIE & CONSENT STANDARDS
#### Software Solutions Admin Agent (Admin React App)

**RULE 1: No consent banner in the admin app.**
The admin app uses `app="admin"` in `ConsentProvider`. Never add `<CookieBanner />` to the admin layout.

**RULE 2: Analytics are auto-granted; marketing is never auto-granted.**
`autoGrant={['analytics', 'preferences']}` is the correct admin config. Marketing cookies are for advertising — the admin app has no need for them. Never add `'marketing'` to `autoGrant`.

**RULE 3: Security cookies are separate from consent — always.**
Authentication session cookies, CSRF tokens, MFA state, and fraud detection required for platform security are necessary cookies and must never appear in optional consent toggles. Do not let consent settings interfere with these.

**RULE 4: Tool registry applies identically in admin.**
Every new admin-side analytics or preference tool must be added to the shared `consentRegistry.ts` with `environments: ['admin']`. Never bypass the registry in the admin app.

**RULE 5: CookieSettingsPanel must be accessible from Settings.**
Admin users must be able to opt out of analytics from their user profile or Settings page. The `CookieSettingsPanel` component must be present in the admin Settings/Profile section.

**RULE 6: All consent changes sync to Rails for admin users.**
Admin users are always authenticated. `syncConsentToApi()` must fire on every consent change. This creates an audit trail that may be required for compliance.

**RULE 7: Admin app requires a minimal tool surface area.**
Before adding any third-party tool to the admin app, verify:
- Why it is needed
- Whether it is truly optional or necessary
- Its security/privacy impact
- That it has a cleanup path

Default posture: no marketing tools, minimal analytics, strong CSP.

**RULE 8: Audit log must be maintained.**
The admin Settings page must display the consent change history. The Rails audit log (`CookieConsentLog`) must not be deleted. Every consent change in admin must be logged with action, timestamp, and categories before/after.

**RULE 9: Do not scatter cookie logic.**
Keep all cookie/consent logic in the shared consent system. Do not create one-off cookie reads or writes in admin views.

**RULE 10: Every tool added to admin must be reviewed for necessity.**
Optional analytics must default to off unless the approved policy requires otherwise. Prefer internal operational telemetry over broad third-party tracking.

---

## 10. UI/UX — Cookie Settings Panel with Base Theme

### Design Principles

All cookie consent UI must use Base theme design tokens exclusively. Do not create a parallel visual language for cookie components.

```css
/* Map Base theme tokens to consent-specific custom properties */
:root {
  --consent-bg:           var(--color-surface, #ffffff);
  --consent-border:       var(--color-border, #e5e7eb);
  --consent-text:         var(--color-text-primary, #111827);
  --consent-text-muted:   var(--color-text-secondary, #6b7280);
  --consent-accent:       var(--color-brand-primary, #2563eb);
  --consent-success:      var(--color-success, #059669);
  --consent-overlay:      rgba(0, 0, 0, 0.5);
  --consent-radius:       var(--radius-lg, 12px);
  --consent-shadow:       0 4px 24px rgba(0, 0, 0, 0.12);
}
```

### CookieBanner

**Public app — bottom of viewport, persistent until choice made:**

```tsx
// shared/consent/CookieBanner.tsx
import { useEffect }  from 'react'
import { useConsent } from './ConsentProvider'

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openModal } = useConsent()

  // Respect Do Not Track
  useEffect(() => {
    const dnt = navigator.doNotTrack === '1' ||
      (window as Window & { doNotTrack?: string }).doNotTrack === '1'
    if (dnt) rejectAll()
  }, [rejectAll])

  if (!showBanner) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="cookie-banner"
    >
      <div className="cookie-banner__content">
        <div className="cookie-banner__text">
          <strong>We use cookies</strong>
          <p>
            We use cookies to improve your experience and analyze site traffic.
            You can accept all, reject non-essential, or manage your preferences.{' '}
            <a href="/privacy-policy">Privacy Policy</a>
          </p>
        </div>

        <div className="cookie-banner__actions">
          {/* Reject must be equally easy — GDPR requirement */}
          <button type="button" onClick={rejectAll}  className="btn btn--ghost">
            Reject Non-Essential
          </button>
          <button type="button" onClick={openModal}  className="btn btn--secondary">
            Manage Preferences
          </button>
          <button type="button" onClick={acceptAll}  className="btn btn--primary">
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
```

```css
/* CookieBanner.css — Base theme aligned */
.cookie-banner {
  position:    fixed;
  bottom:      0;
  left:        0;
  right:       0;
  z-index:     9999;
  background:  var(--consent-bg);
  border-top:  1px solid var(--consent-border);
  box-shadow:  0 -2px 12px rgba(0, 0, 0, 0.08);
  padding:     1.25rem 1.5rem;
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
}

.cookie-banner__content {
  max-width:    1200px;
  margin:       0 auto;
  display:      flex;
  align-items:  center;
  gap:          1.5rem;
  flex-wrap:    wrap;
}

.cookie-banner__text {
  flex:         1;
  min-width:    280px;
  font-size:    var(--text-sm);
  color:        var(--consent-text-muted);
  line-height:  1.5;
}

.cookie-banner__text strong {
  display:      block;
  font-size:    var(--text-base);
  font-weight:  600;
  color:        var(--consent-text);
  margin-bottom: 0.25rem;
}

.cookie-banner__actions {
  display:     flex;
  gap:         0.75rem;
  flex-wrap:   wrap;
  align-items: center;
}

@media (max-width: 640px) {
  .cookie-banner__content { flex-direction: column; align-items: stretch; }
  .cookie-banner__actions { flex-direction: column; }
  .cookie-banner__actions button { width: 100%; }
}
```

### CookiePreferencesModal — With Tabs

```tsx
// shared/consent/CookiePreferencesModal.tsx
import { useRef, useEffect, useState } from 'react'
import { useConsent }                  from './ConsentProvider'
import { COOKIE_CATEGORIES }           from './consentTypes'
import { toolRegistry }                from './consentRegistry'

type Tab = 'categories' | 'details' | 'about'

export function CookiePreferencesModal() {
  const { showModal, consent, closeModal, updateCategory, savePreferences, acceptAll, rejectAll } = useConsent()
  const [activeTab, setActiveTab] = useState<Tab>('categories')
  const modalRef                  = useRef<HTMLDivElement>(null)

  // Focus trap
  useEffect(() => {
    if (!showModal) return
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [showModal, closeModal])

  if (!showModal) return null

  return (
    <>
      <div className="consent-overlay" onClick={closeModal} aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-modal-title"
        className="consent-modal"
      >
        {/* Header */}
        <div className="consent-modal__header">
          <div>
            <h2 id="consent-modal-title">Cookie Preferences</h2>
            <p>Manage how cookies are used on this website</p>
          </div>
          <button type="button" onClick={closeModal} aria-label="Close cookie preferences" className="consent-modal__close">✕</button>
        </div>

        {/* Tabs */}
        <div className="consent-tabs" role="tablist" aria-label="Cookie settings tabs">
          {(['categories', 'details', 'about'] as Tab[]).map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tab-panel-${tab}`}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={`consent-tab ${activeTab === tab ? 'consent-tab--active' : ''}`}
            >
              {tab === 'categories' ? 'Cookie Categories' :
               tab === 'details'    ? 'Tool Details'      : 'About Cookies'}
            </button>
          ))}
        </div>

        {/* Categories Tab */}
        <div id="tab-panel-categories" role="tabpanel" aria-labelledby="tab-categories"
          hidden={activeTab !== 'categories'} className="consent-modal__body">
          {Object.values(COOKIE_CATEGORIES).map(cat => (
            <div key={cat.id} className="consent-category">
              <div className="consent-category__info">
                <div className="consent-category__header">
                  <span className="consent-category__label">{cat.label}</span>
                  {cat.required && <span className="consent-category__badge">Always Active</span>}
                </div>
                <p className="consent-category__description">{cat.description}</p>
              </div>
              <label className={`consent-toggle ${cat.required ? 'consent-toggle--disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={consent?.categories[cat.id as keyof typeof consent.categories] ?? cat.defaultOn}
                  disabled={cat.required}
                  onChange={e => updateCategory(cat.id as never, e.target.checked)}
                  aria-label={`${cat.required ? 'Always active: ' : ''}${cat.label}`}
                  className="consent-toggle__input"
                />
                <span className="consent-toggle__track" aria-hidden="true">
                  <span className="consent-toggle__thumb" />
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* Details Tab — shows tools per category */}
        <div id="tab-panel-details" role="tabpanel" hidden={activeTab !== 'details'} className="consent-modal__body">
          {Object.values(COOKIE_CATEGORIES).map(cat => {
            const tools = toolRegistry.filter(t => t.category === cat.id)
            if (!tools.length) return null
            return (
              <div key={cat.id} className="consent-category">
                <h3 className="consent-category__label">{cat.label}</h3>
                {tools.map(tool => (
                  <div key={tool.id} className="consent-tool">
                    <strong>{tool.name}</strong>
                    <p>{tool.description}</p>
                    {tool.cookies?.length ? (
                      <p className="consent-tool__cookies">
                        Cookies: {tool.cookies.join(', ')}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* About Tab */}
        <div id="tab-panel-about" role="tabpanel" hidden={activeTab !== 'about'} className="consent-modal__body consent-modal__body--prose">
          <h3>What are cookies?</h3>
          <p>Cookies are small text files stored on your device that help websites remember information about your visit, such as your preferences and login status.</p>
          <h3>Your rights</h3>
          <p>Under GDPR and CCPA, you have the right to know what data is collected, to opt out of non-essential cookies at any time, and to request deletion of your data.</p>
          <p><a href="/privacy-policy">Read our full privacy policy →</a></p>
        </div>

        {/* Footer */}
        <div className="consent-modal__footer">
          <button type="button" onClick={rejectAll}       className="btn btn--ghost">Reject All</button>
          <button type="button" onClick={acceptAll}       className="btn btn--secondary">Accept All</button>
          <button type="button" onClick={savePreferences} className="btn btn--primary">Save Preferences</button>
        </div>
      </div>
    </>
  )
}
```

### CookieSettingsPanel — Inline Version (Admin Settings Page)

```tsx
// shared/consent/CookieSettingsPanel.tsx
import { useConsent }        from './ConsentProvider'
import { COOKIE_CATEGORIES } from './consentTypes'
import { toolRegistry }      from './consentRegistry'

interface CookieSettingsPanelProps {
  inline?: boolean   // true = inline admin panel, false = footer button (opens modal)
}

export function CookieSettingsPanel({ inline = false }: CookieSettingsPanelProps) {
  const { openModal, consent, updateCategory, savePreferences, resetConsent } = useConsent()

  if (!inline) {
    return (
      <button type="button" onClick={openModal} className="cookie-settings-link">
        Cookie Settings
      </button>
    )
  }

  return (
    <section className="cookie-settings-panel">
      <div className="cookie-settings-panel__header">
        <h2>Cookie & Privacy Settings</h2>
        {consent?.updatedAt && (
          <p className="cookie-settings-panel__meta">
            Last updated: {new Date(consent.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {Object.values(COOKIE_CATEGORIES).map(cat => {
        const tools = toolRegistry.filter(t => t.category === cat.id)
        return (
          <div key={cat.id} className="consent-category">
            <div className="consent-category__info">
              <div className="consent-category__header">
                <span className="consent-category__label">{cat.label}</span>
                {cat.required && <span className="consent-category__badge">Always Active</span>}
              </div>
              <p className="consent-category__description">{cat.description}</p>

              {tools.length > 0 && (
                <details className="consent-category__tools">
                  <summary>{tools.length} tool{tools.length !== 1 ? 's' : ''}</summary>
                  <ul>
                    {tools.map(t => (
                      <li key={t.id}>{t.name} — {t.description}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <label className={`consent-toggle ${cat.required ? 'consent-toggle--disabled' : ''}`}>
              <input
                type="checkbox"
                checked={consent?.categories[cat.id as keyof typeof consent.categories] ?? cat.defaultOn}
                disabled={cat.required}
                onChange={e => updateCategory(cat.id as never, e.target.checked)}
                aria-label={`${cat.required ? 'Always active: ' : ''}${cat.label}`}
                className="consent-toggle__input"
              />
              <span className="consent-toggle__track" aria-hidden="true">
                <span className="consent-toggle__thumb" />
              </span>
            </label>
          </div>
        )
      })}

      <div className="cookie-settings-panel__actions">
        <button type="button" onClick={savePreferences} className="btn btn--primary">Save Preferences</button>
        <button type="button" onClick={resetConsent}    className="btn btn--ghost">Reset to Defaults</button>
      </div>
    </section>
  )
}
```

### Toggle Switch CSS (Base Theme)

```css
/* Shared toggle — used in both modal and panel */
.consent-toggle { position: relative; display: inline-flex; cursor: pointer; }
.consent-toggle--disabled { opacity: 0.5; cursor: not-allowed; }
.consent-toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }

.consent-toggle__track {
  width:         44px;
  height:        24px;
  border-radius: 12px;
  background:    var(--consent-border);
  transition:    background 200ms;
  position:      relative;
}

.consent-toggle__input:checked + .consent-toggle__track {
  background: var(--consent-accent);
}

.consent-toggle__thumb {
  position:      absolute;
  top:           2px;
  left:          2px;
  width:         20px;
  height:        20px;
  border-radius: 50%;
  background:    white;
  box-shadow:    0 1px 3px rgba(0, 0, 0, 0.2);
  transition:    transform 200ms;
}

.consent-toggle__input:checked ~ .consent-toggle__track .consent-toggle__thumb {
  transform: translateX(20px);
}

/* Focus visible on the label */
.consent-toggle__input:focus-visible + .consent-toggle__track {
  outline:        2px solid var(--consent-accent);
  outline-offset: 2px;
}
```

### Accessibility Requirements

- Banner: `role="dialog"`, `aria-label`, keyboard navigable, visible focus states
- Modal: focus trap, Escape closes, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tabs: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Toggles: labeled with `aria-label`, keyboard operable, visible focus ring
- No auto-dismiss — banner stays until user makes a choice
---

## 11. Future-Proofing for Additional Tools

### The One-Entry Extension Pattern

Adding any future tool requires exactly **one entry in `consentRegistry.ts`** and **one adapter file**. Nothing else changes.

```typescript
// Future tools follow the same pattern — no other code changes

// Example: Hotjar (analytics)
{
  id:              'hotjar',
  name:            'Hotjar',
  category:        'analytics',
  environments:    ['public'],
  requiresConsent: true,
  description:     'Session recording and heatmaps to understand user behavior.',
  cookies:         ['_hjSession*', '_hjSessionUser*', '_hjid'],
  load: () => {
    const s    = document.createElement('script')
    s.async    = true
    s.innerHTML = `(function(h,o,t,j){h.hj=h.hj||function(){...};
      h._hjSettings={hjid:${import.meta.env.VITE_HOTJAR_ID},hjsv:6};
      const a=o.getElementsByTagName('head')[0];
      const r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`
    document.head.appendChild(s)
  },
  cleanup: () => {
    document.cookie.split(';').forEach(c => {
      const [k] = c.trim().split('=')
      if (k?.trim().match(/^_hj/)) deleteCookie(k.trim())
    })
  },
},

// Example: Intercom (preferences)
{
  id:              'intercom',
  name:            'Intercom',
  category:        'preferences',
  environments:    ['public'],
  requiresConsent: true,
  description:     'Customer support chat widget.',
  cookies:         ['intercom-*'],
  load: () => {
    window.intercomSettings = { app_id: import.meta.env.VITE_INTERCOM_APP_ID }
    const s    = document.createElement('script')
    s.async    = true
    s.src      = `https://widget.intercom.io/widget/${import.meta.env.VITE_INTERCOM_APP_ID}`
    document.head.appendChild(s)
  },
  cleanup: () => {
    window.Intercom?.('shutdown')
    document.cookie.split(';').forEach(c => {
      const [k] = c.trim().split('=')
      if (k?.trim().startsWith('intercom-')) deleteCookie(k.trim())
    })
  },
},

// Example: HubSpot (marketing)
{
  id:              'hubspot',
  name:            'HubSpot',
  category:        'marketing',
  environments:    ['public'],
  requiresConsent: true,
  description:     'CRM and marketing automation.',
  cookies:         ['hubspotutk', '__hstc', '__hssc', '__hssrc'],
  load: () => {
    const s    = document.createElement('script')
    s.async    = true
    s.src      = `//js.hs-scripts.com/${import.meta.env.VITE_HUBSPOT_PORTAL_ID}.js`
    document.head.appendChild(s)
  },
  cleanup: () => {
    ['hubspotutk', '__hstc', '__hssc', '__hssrc'].forEach(n => deleteCookie(n))
  },
},
```

### Adding a New Category

If a new category becomes necessary (e.g., `personalization`, `embedded_content`):

1. Add the category to `COOKIE_CATEGORIES` in `consentTypes.ts`
2. Add it to the `ConsentState.categories` type
3. Set it to `false` in `DEFAULT_CONSENT`
4. Map relevant tools to the new category in `consentRegistry.ts`
5. Bump `CURRENT_VERSION` — all existing users re-consent

```typescript
// consentTypes.ts — extend with new category
export type ConsentCategory =
  | 'necessary'
  | 'preferences'
  | 'analytics'
  | 'marketing'
  | 'personalization'    // ← new
  | 'embedded_content'   // ← new
```

### GTM-Only Tool Addition (Zero Frontend Code)

Tools natively supported by GTM require zero frontend changes:
1. Add the tag in GTM console
2. Set the tag's trigger to fire on consent update (GTM's built-in consent settings)
3. GTM Consent Mode v2 signals (`analytics_storage: granted`) control the tag automatically
4. Update the tool registry description in `consentRegistry.ts` for settings UI transparency

### Policy Version Strategy

```typescript
// consentStorage.ts
export const CURRENT_VERSION = '2026-05-01'  // Semantic date-based versioning

// Version should be bumped when:
// - New tool categories are added
// - Existing tool behavior changes materially (e.g., GA4 starts cross-site tracking)
// - Policy wording changes significantly
// - Regional legal requirements change (new jurisdiction)
// - A new marketing/personalization feature is enabled

// Version strategy: ISO date format makes auditing easy — "which policy version
// did this user consent to on which date?"
```

### Region-Aware Capability

The schema includes a `region` field for future region-specific behavior:

```typescript
// Future region-aware logic (not required now — infrastructure ready)
function getRegionDefaults(region: string): Partial<ConsentState['categories']> {
  // Example: stricter defaults in EU
  if (['DE', 'FR', 'ES', 'IT', 'NL'].includes(region)) {
    return { analytics: false, marketing: false, preferences: false }
  }
  // Example: CCPA — right to opt out rather than opt in
  if (region === 'US-CA') {
    return { analytics: true, preferences: true, marketing: false }
  }
  return {}
}
```

---

## 12. Risks, Anti-Patterns, and Things to Avoid

### Legal Risks

**Pre-ticked consent checkboxes** — GDPR Art. 7(2) explicitly states consent must be a clear affirmative act. Pre-ticked analytics or marketing boxes are invalid consent. Every optional category must default to `false`.

**Bundling optional tools as "necessary"** — Classifying GA or GTM as "necessary" is legally indefensible and has resulted in regulatory action (Austrian DPA, CNIL). These are analytics tools, not required for site functionality.

**Hiding the rejection path** — Making "Reject" visually harder than "Accept" (smaller button, lower contrast, extra clicks) is a dark pattern. French CNIL and other regulators have issued fines specifically for this.

**No withdrawal mechanism** — GDPR Art. 7(3) requires users to withdraw consent as easily as they gave it. The "Cookie Settings" link must always be visible. Hiding it after the initial banner is a violation.

**Not running tool cleaners on opt-out** — After a user opts out, existing analytics cookies must be deleted. Simply stopping future loading while leaving `_ga` cookies in place is insufficient.

**Storing consent records without timestamps** — GDPR requires demonstrating when and how consent was obtained. `version`, `updatedAt`, and `source` fields are legally important audit fields.

### Technical Anti-Patterns

```typescript
// ❌ Loading GTM in index.html — bypasses consent entirely
// <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-XXX"></script>

// ❌ One boolean — breaks when new tool types are added
{ "accepted": true }

// ❌ Reading the consent cookie directly in a component
const raw = document.cookie  // Bypasses ConsentContext
const { analytics } = JSON.parse(raw)

// ✅ Always use the hook
const { isCategory } = useConsent()
if (isCategory('analytics')) { ... }

// ❌ Initializing GA at app boot without consent check
useEffect(() => {
  initGA()   // Fires before user consents
}, [])

// ✅ Gate initialization
useEffect(() => {
  if (consent?.categories.analytics) initGA()
}, [consent?.categories.analytics])

// ❌ Using localStorage as the only consent store
localStorage.setItem('consent', JSON.stringify(state))
// localStorage is cleared by privacy browsers, not readable by Rails middleware

// ✅ First-party cookie as primary, localStorage as secondary cache only
writeConsent(state)   // Cookie is primary
localStorage.setItem('ss_consent_cache', JSON.stringify(state))   // Optional cache

// ❌ Setting cookies without security attributes
document.cookie = 'my_pref=value'

// ✅ Always use the utility function or js-cookie
setCookie('my_pref', 'value', 30)
// or: Cookies.set('my_pref', 'value', { secure: true, sameSite: 'Lax', expires: 30 })

// ❌ Storing auth tokens in JavaScript-readable cookies
document.cookie = 'auth_token=eyJ...'   // XSS vulnerability

// ✅ Auth tokens must be HttpOnly — set by Rails, never by JavaScript
# Rails: cookies.encrypted[:auth_token] = { value: token, httponly: true, secure: true }

// ❌ Scattering cookie logic across components
// In ComponentA.tsx:  document.cookie = 'theme=dark'
// In ComponentB.tsx:  const consent = JSON.parse(getCookie('consent'))
// In ComponentC.tsx:  window.gtag('event', ...)  // No consent check

// ✅ All cookie and consent logic flows through the shared system
```

### Admin-Specific Anti-Patterns

- Installing marketing pixels in the admin app without a documented business reason
- Exposing session cookie controls in the preferences UI (session cookies are not optional)
- Sending admin user activity to third-party trackers by default
- Letting optional analytics weaken CSP directives
- Using different consent cookie names in admin vs public (creates confusion and dual-storage bugs)

### UX Anti-Patterns

- Giant unreadable legal text walls in the banner
- Modal-only access to settings with no persistent footer link after the initial visit
- Non-descriptive category labels ("Enhanced Experience" instead of "Analytics Cookies")
- Auto-dismissing the banner on scroll or page change before user decides
- Cookie banner that blocks core page usage when it is not legally required to do so
- No explanation of what changes when a category is toggled

### Copywriting Anti-Patterns

```
❌ "We use cookies to enhance your experience."
   (Vague — what does "enhance" mean? What data is collected?)

✅ "Analytics cookies help us understand how the site is used so we can improve it.
   All data is anonymized. You can opt out at any time."

❌ "Accept All" (large, primary) vs "Options" (tiny, gray link in corner)
   (Dark pattern — rejection artificially harder)

✅ "Accept All" | "Reject Non-Essential" | "Manage Settings"
   (All three equally discoverable)
```

---

## 13. Final Implementation Checklist

Use this checklist before release for both apps.

### Architecture
- [ ] Shared consent schema exists in `shared/consent/consentTypes.ts` used by both React apps
- [ ] Tool registry exists in `shared/consent/consentRegistry.ts` with category, environment, load, and cleanup for every tool
- [ ] Consent engine centrally controls tool initialization via `applyConsent()`
- [ ] Policy version is defined as `CURRENT_VERSION` in `consentStorage.ts`
- [ ] Public and admin apps share the core architecture with app-specific config (`app` prop)

### Cookie Storage
- [ ] First-party consent cookie `ss_cookie_consent` is implemented
- [ ] Consent cookie contains no PII
- [ ] Consent cookie uses `Secure` (production) and `SameSite=Lax`
- [ ] Session/security cookies are `HttpOnly` — set by Rails, not JavaScript
- [ ] Rails persistence exists for authenticated users (`cookie_consents` table)
- [ ] Version mismatch correctly triggers re-consent (returns `null` from `readConsent()`)

### GTM Consent Mode v2
- [ ] Default-deny GTM Consent Mode block in `index.html` **before** any analytics scripts
- [ ] GTM script loads **dynamically** (in `gtmAdapter.ts`) only after analytics consent
- [ ] Consent Mode update fires when consent changes (`dataLayer.push` with `consent_update` event)
- [ ] `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` all correctly mapped

### Frontend Behavior
- [ ] Banner appears only when no valid consent exists (`hasDecided === false`)
- [ ] Banner includes `Accept All`, `Reject Non-Essential`, and `Manage Preferences`
- [ ] All three banner options are equally visible and reachable (no dark patterns)
- [ ] Preferences modal is accessible: focus trap, Escape closes, ARIA attributes correct
- [ ] Category toggles work correctly in both modal and inline panel
- [ ] `necessary` category is always `true` and non-editable
- [ ] Consent changes apply immediately (tools load/unload on `applyConsent()` call)
- [ ] Route analytics only run when analytics consent is enabled
- [ ] Do Not Track browser setting triggers automatic `rejectAll()`

### Tooling
- [ ] Vercel Analytics renders only via `ConditionalVercelAnalytics` (consent-gated)
- [ ] GA4 is not initialized before analytics consent (`gaAdapter.ts` only loads on consent)
- [ ] GTM tag container loads only after analytics consent
- [ ] Every tool in registry has a `cleanup()` function that deletes its cookies
- [ ] Tool removal paths tested: withdraw consent → cookies deleted, tool stops

### Rails/API
- [ ] `cookie_consents` table migrated with all required fields
- [ ] `CookieConsent` model validates `necessary: true`, source enum, version enum
- [ ] `CookieConsentLog` records every consent change (never deleted)
- [ ] `GET /api/v1/consent-config` returns current version and category definitions
- [ ] `GET /api/v1/cookie-consent` returns user's stored preferences
- [ ] `PUT /api/v1/cookie-consent` saves new consent record (not update-in-place)
- [ ] IP and user agent are hashed before storage
- [ ] Session cookie: `httponly: true`, `secure: true`, `same_site: :lax`
- [ ] CSP headers configured for GTM, GA4, Vercel domains

### Public App Specific
- [ ] `ConsentProvider` configured with `app="public"` (no `autoGrant`)
- [ ] `CookieBanner` component included in `App.tsx`
- [ ] `CookiePreferencesModal` included in `App.tsx`
- [ ] Footer contains "Cookie Settings" button on every page, every visit
- [ ] Privacy Policy link accessible from banner and modal
- [ ] Analytics and marketing categories default to `false` on first visit
- [ ] Existing analytics cookies deleted when user opts out

### Admin App Specific
- [ ] `ConsentProvider` configured with `app="admin"` and `autoGrant={['analytics', 'preferences']}`
- [ ] No `CookieBanner` component in admin layout
- [ ] `CookieSettingsPanel` accessible from user Settings page (inline panel)
- [ ] Audit log view present in admin Settings (fetches from Rails API)
- [ ] Marketing category NOT in `autoGrant`
- [ ] Consent synced to Rails API on every change (admin always authenticated)

### UI/UX and Accessibility
- [ ] All consent UI uses Base theme CSS tokens (`--color-brand-primary`, `--color-surface`, etc.)
- [ ] Banner, modal, and settings panel match Base theme patterns and typography
- [ ] No dark patterns: reject as easy as accept, no pre-ticked boxes, no hidden rejection
- [ ] Banner: `role="dialog"`, `aria-label`, keyboard navigable
- [ ] Modal: focus trap active, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Tabs in modal: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- [ ] Toggle switches: labeled, keyboard operable, visible focus ring (`:focus-visible`)
- [ ] Mobile responsive: banner stacks vertically, modal becomes bottom sheet on small screens

### Agent Instructions Updated
- [ ] Software Solutions Frontend Agent system prompt updated with RULES 1–10
- [ ] Software Solutions Admin Agent system prompt updated with RULES 1–10
- [ ] Both agents confirmed: no analytics scripts load before consent in public app test
- [ ] Both agents confirmed: admin auto-grants correctly without showing banner

### QA Scenarios — Manual Test Each Before Release
- [ ] **Public — First visit:** banner appears, zero analytics scripts in network tab
- [ ] **Public — Accept All:** GTM loads, GA cookies appear, Vercel Analytics renders
- [ ] **Public — Reject Non-Essential:** no third-party scripts in network tab
- [ ] **Public — Manage Preferences:** modal opens with correct tab, all category toggles work
- [ ] **Public — Save Preferences (partial):** only consented tools load
- [ ] **Public — Footer Cookie Settings link:** opens modal from any page
- [ ] **Public — Opt-out after acceptance:** GA cookies deleted, `cleanupGA()` confirmed called
- [ ] **Public — Return visit with stored consent:** banner does not reappear, correct tools load
- [ ] **Public — Version bump:** banner reappears for all existing users on next visit
- [ ] **Public — DNT header:** non-essential automatically rejected
- [ ] **Admin — Page load:** no banner, analytics auto-granted, GTM and Vercel Analytics load
- [ ] **Admin — Settings page:** inline CookieSettingsPanel renders with current state
- [ ] **Admin — Opt out analytics:** preference saved, `cleanupGA()` runs, Vercel Analytics unmounts
- [ ] **Admin — Audit log:** consent changes appear in the audit log table

---

*Consent policy version: 2026-04-07 — bump `CURRENT_VERSION` in `consentStorage.ts` when policy changes materially*
*Legal basis: GDPR Art. 6(1)(a) consent · Art. 7 conditions for consent · Art. 13 transparency*
*References: ICO Cookie Guidance · CNIL Cookie Guidelines · IAB TCF v2.2 · Google Consent Mode v2 · W3C DNT spec*
