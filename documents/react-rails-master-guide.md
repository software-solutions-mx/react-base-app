# React × Rails — The Complete Production Engineering Master Guide
### Architecture · TypeScript · Routing · API · Auth · Performance · Security · Error Handling · Observability · SEO · i18n · Analytics · Branding · Accessibility · Testing · E2E · CI/CD · Pre-commit · Environment · Checklist

> **Rails API contract:** All requests authenticate using `VITE_API_BASE_URL`, `VITE_API_CLIENT_ID`, and `VITE_API_CLIENT_SECRET`. Cross-origin session cookies are managed by Rails.
> **Non-negotiable:** Every implementation ships with tests. Every PR passes lint, typecheck, and tests before merge. Every component is accessible by default — inaccessible code is incomplete code.
> **Stack:** React 18 · TypeScript 5 · Vite 5 · TanStack Query v5 · react-i18next v14 · Zod v3 · Axios · react-router-dom v6.4 · Sentry · Playwright · Vitest · ESLint · Husky · Rails 8
> **Companion document:** Full accessibility implementation details, mandatory rules, interactive patterns, hooks, testing, and enforcement checklist live in [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md). Section 27 of this guide is the integration bridge.

---

## Table of Contents

1. [TypeScript Baseline](#1-typescript-baseline)
2. [Architecture Principles](#2-architecture-principles)
3. [Routing Architecture](#3-routing-architecture)
4. [Reusable Components](#4-reusable-components)
5. [Rails API Client — Cross-Origin + Client Auth](#5-rails-api-client--cross-origin--client-auth)
6. [Zod Runtime Validation](#6-zod-runtime-validation)
7. [Data Layer — TanStack Query](#7-data-layer--tanstack-query)
8. [Auth & Session Scaffold](#8-auth--session-scaffold)
9. [Performance Optimization](#9-performance-optimization)
10. [Caching Strategy](#10-caching-strategy)
11. [Global Error Handling](#11-global-error-handling)
12. [Observability — Sentry + Structured Logging](#12-observability--sentry--structured-logging)
13. [Security Best Practices](#13-security-best-practices)
14. [SEO Implementation](#14-seo-implementation)
15. [i18n Readiness](#15-i18n-readiness)
16. [Branding and Design Consistency](#16-branding-and-design-consistency)
17. [Analytics and Tracking](#17-analytics-and-tracking)
18. [Unit & Integration Testing](#18-unit--integration-testing)
19. [End-to-End Tests — Playwright](#19-end-to-end-tests--playwright)
20. [Linting and Code Quality](#20-linting-and-code-quality)
21. [Pre-commit Quality Gates](#21-pre-commit-quality-gates)
22. [CI Pipeline](#22-ci-pipeline)
23. [Environment Hygiene](#23-environment-hygiene)
24. [Code Examples](#24-code-examples)
25. [Common Mistakes to Avoid](#25-common-mistakes-to-avoid)
26. [Final Production Checklist](#26-final-production-checklist)
27. [Accessibility — Integration with react-accessibility-super-guide.md](#27-accessibility--integration-with-react-accessibility-super-guidemd)

---

## 1. TypeScript Baseline

TypeScript is not optional and is not a linter. It is the specification layer of the application. Every configuration decision here is intentional.

### tsconfig.json — Full Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "target":            "ES2022",
    "lib":               ["ES2022", "DOM", "DOM.Iterable"],
    "module":            "ESNext",
    "moduleResolution":  "Bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules":   true,
    "noEmit":            true,
    "jsx":               "react-jsx",

    "baseUrl": ".",
    "paths": {
      "@/*":          ["src/*"],
      "@features/*":  ["src/features/*"],
      "@shared/*":    ["src/shared/*"],
      "@lib/*":       ["src/lib/*"],
      "@analytics/*": ["src/analytics/*"],
      "@test/*":      ["src/test/*"]
    },

    "strict":                          true,
    "noImplicitAny":                   true,
    "strictNullChecks":                true,
    "strictFunctionTypes":             true,
    "strictBindCallApply":             true,
    "strictPropertyInitialization":    true,
    "noImplicitThis":                  true,
    "alwaysStrict":                    true,
    "noUncheckedIndexedAccess":        true,
    "exactOptionalPropertyTypes":      true,
    "noImplicitReturns":               true,
    "noFallthroughCasesInSwitch":      true,
    "noUnusedLocals":                  true,
    "noUnusedParameters":              true,
    "forceConsistentCasingInFileNames": true,
    "useUnknownInCatchVariables":      true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

```json
// tsconfig.node.json — for vite.config.ts, vitest.config.ts, playwright.config.ts
{
  "compilerOptions": {
    "target":           "ES2022",
    "module":           "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

### vite.config.ts — Aliases Must Match tsconfig Exactly

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':          path.resolve(__dirname, 'src'),
      '@features':  path.resolve(__dirname, 'src/features'),
      '@shared':    path.resolve(__dirname, 'src/shared'),
      '@lib':       path.resolve(__dirname, 'src/lib'),
      '@analytics': path.resolve(__dirname, 'src/analytics'),
      '@test':      path.resolve(__dirname, 'src/test'),
    },
  },
  build: {
    target:    'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'query':      ['@tanstack/react-query'],
          'i18n':       ['i18next', 'react-i18next'],
        },
      },
    },
  },
})
```

**Critical rule:** `tsconfig.json` `paths` and `vite.config.ts` `alias` must be **identical**. A mismatch means TypeScript resolves correctly but Vite fails at runtime — or vice versa — with no obvious error.

### npm Scripts

```json
// package.json
{
  "scripts": {
    "dev":              "vite",
    "build":            "vite build",
    "preview":          "vite preview",

    "typecheck":        "tsc --noEmit",
    "typecheck:watch":  "tsc --noEmit --watch",

    "test":             "vitest run",
    "test:watch":       "vitest",
    "test:coverage":    "vitest run --coverage",
    "test:ui":          "vitest --ui",

    "lint":             "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix":         "eslint . --ext .ts,.tsx --fix",
    "format":           "prettier --write .",
    "format:check":     "prettier --check .",

    "e2e":              "playwright test",
    "e2e:ui":           "playwright test --ui",
    "e2e:report":       "playwright show-report",

    "audit":            "npm audit --audit-level=high",

    "validate":         "npm run typecheck && npm run lint && npm run format:check && npm run test:coverage",
    "prepare":          "husky",
    "analyze":          "npx vite-bundle-analyzer"
  }
}
```

`vite build` does **not** type-check. `tsc --noEmit` is the only command that validates types. Both must run in CI.

---

## 2. Architecture Principles

### The Governing Rule

Every structural decision answers one question: **what changes independently of everything else?** Routing changes; layouts don't. Data changes; UI structure doesn't. Locale changes; markup doesn't. The Rails API contract changes; components must not know.

### Feature-Sliced Folder Structure

Organize by **domain**, not file type. The structure mirrors Rails controller namespaces.

```
src/
│
├── app/
│   ├── App.tsx
│   ├── router.tsx                       ← Centralized route definitions
│   └── providers/
│       ├── index.tsx                    ← Composes all providers
│       ├── QueryProvider.tsx
│       ├── I18nProvider.tsx
│       ├── HelmetProvider.tsx
│       └── AnalyticsProvider.tsx
│
├── features/                            ← One dir per domain = one Rails controller namespace
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/                    ← authApi.ts — Rails SessionsController
│   │   ├── schemas/                     ← Zod schemas for request + response
│   │   ├── guards/                      ← checkRole.ts — loader-level guards
│   │   ├── store/                       ← tokenStore.ts — in-memory token
│   │   └── index.ts                     ← Public barrel export
│   ├── wallet/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── index.ts
│   └── dashboard/
│
├── shared/
│   ├── components/
│   │   ├── ui/                          ← Button, Input, Badge, Spinner
│   │   ├── feedback/                    ← Alert, Toast, Skeleton, ErrorBoundary
│   │   └── layout/                      ← Card, Stack, PageContainer
│   ├── hooks/                           ← useDebounce, useOutsideClick
│   ├── utils/                           ← formatDate, cn, sanitize
│   └── types/                           ← AppError, PaginationMeta
│
├── lib/
│   ├── http/
│   │   ├── client.ts                    ← Axios instance — single HTTP client
│   │   ├── interceptors.ts
│   │   ├── errors.ts                    ← AppError + normalizeError
│   │   └── validate.ts                  ← validateResponse() using Zod
│   ├── env/
│   │   └── validate.ts                  ← Zod env schema — fails fast on startup
│   ├── observability/
│   │   ├── sentry.ts
│   │   └── logger.ts
│   ├── queryClient.ts
│   └── i18n/
│
├── analytics/
│   ├── events.ts
│   ├── service.ts
│   ├── ecommerce.ts
│   ├── consent.ts
│   ├── webVitals.ts
│   └── RouteChangeTracker.tsx
│
├── styles/
│   ├── tokens.css
│   └── global.css
│
└── pages/                               ← Thin route-level shells only
    ├── DashboardPage.tsx
    ├── WalletPage.tsx
    ├── LoginPage.tsx
    └── NotFoundPage.tsx
```

### Three Non-Negotiable Layers

```
Data layer    → services/   ← Rails API calls only. No JSX, no DOM, no analytics.
State layer   → hooks/      ← TanStack Query, useState. No fetch, no JSX.
View layer    → components/ ← Pure rendering from props. No business logic.
```

### Provider Composition — Order Matters

```typescript
// src/app/providers/index.tsx
import { HelmetProvider }    from 'react-helmet-async'
import { I18nProvider }      from './I18nProvider'
import { QueryProvider }     from './QueryProvider'
import { AnalyticsProvider } from './AnalyticsProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // I18n before Query: locale header must be ready before first API call
    // Analytics last: may read user identity from Query cache
    <HelmetProvider>
      <I18nProvider>
        <QueryProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </QueryProvider>
      </I18nProvider>
    </HelmetProvider>
  )
}
```

### Barrel Export Rule

Every feature exports through `index.ts`. External code never imports from internal paths.

```typescript
// ✅ External code imports the public API
import { WalletCard, useWallet } from '@features/wallet'

// ❌ Never leak internals
import { WalletCard } from '@features/wallet/components/WalletCard'
```

---

## 3. Routing Architecture

### Public / Private Shell Pattern

The router has two shells. `PublicShell` wraps unauthenticated routes (login, register, marketing). `PrivateShell` wraps authenticated routes and enforces the session guard. The guard lives at the shell level, not scattered per-page.

```typescript
// src/app/router.tsx
import { lazy, Suspense }           from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { PrivateShell }  from './shells/PrivateShell'
import { PublicShell }   from './shells/PublicShell'
import { RouteError }    from './RouteError'
import { PageLoader }    from '@shared/components/feedback/PageLoader'
import { NotFoundPage }  from '@/pages/NotFoundPage'

const wrap = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
)

const LoginPage     = lazy(() => import('@/pages/LoginPage'))
const RegisterPage  = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const WalletPage    = lazy(() => import('@/pages/WalletPage'))
const ProfilePage   = lazy(() => import('@/pages/ProfilePage'))
const AdminPage     = lazy(() => import('@/pages/AdminPage'))

export const router = createBrowserRouter([
  // ─── Public (no auth required) ──────────────────────────────────────────
  {
    element:      <PublicShell />,
    errorElement: <RouteError />,
    children: [
      { path: '/login',    element: wrap(<LoginPage />) },
      { path: '/register', element: wrap(<RegisterPage />) },
      { path: '/',         element: <Navigate to="/dashboard" replace /> },
    ],
  },

  // ─── Private (auth required) ────────────────────────────────────────────
  {
    element:      <PrivateShell />,
    errorElement: <RouteError />,
    children: [
      { path: '/dashboard', element: wrap(<DashboardPage />) },
      { path: '/wallet',    element: wrap(<WalletPage />) },
      { path: '/profile',   element: wrap(<ProfilePage />) },
      {
        path: '/admin',
        element: wrap(<AdminPage />),
        loader: async () => {
          // Role check happens in the loader — before the component renders
          const { checkRole } = await import('@features/auth/guards/checkRole')
          return checkRole('admin')
        },
      },
    ],
  },

  // ─── 404 ────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
```

### PrivateShell — Auth Guard

```typescript
// src/app/shells/PrivateShell.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession }  from '@features/auth/hooks/useSession'
import { AppLayout }   from '@shared/components/layout/AppLayout'
import { PageLoader }  from '@shared/components/feedback/PageLoader'

/**
 * Guards all authenticated routes.
 * On 401 / no session: redirects to /login preserving the
 * intended destination in location.state.from so LoginPage
 * can redirect back after a successful login.
 */
export function PrivateShell() {
  const location = useLocation()
  const { data, isLoading, isError } = useSession()

  if (isLoading) return <PageLoader />

  if (isError || !data?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <AppLayout user={data.user}>
      <Outlet />
    </AppLayout>
  )
}
```

### PublicShell — Redirect When Already Authenticated

```typescript
// src/app/shells/PublicShell.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@features/auth/hooks/useSession'
import { PageLoader } from '@shared/components/feedback/PageLoader'

export function PublicShell() {
  const location = useLocation()
  const returnTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
  const { data, isLoading } = useSession()

  if (isLoading) return <PageLoader />
  if (data?.user) return <Navigate to={returnTo} replace />

  return <Outlet />
}
```

### 404 Page

```typescript
// src/pages/NotFoundPage.tsx
import { useNavigate }    from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO }    from '@shared/components/SEO'
import { Button } from '@shared/components/ui/Button'

export function NotFoundPage() {
  const { t }    = useTranslation('common')
  const navigate = useNavigate()

  return (
    <>
      <SEO title={t('not_found.title')} description={t('not_found.description')} noIndex />
      <main role="main" aria-labelledby="nf-heading">
        <h1 id="nf-heading">{t('not_found.heading')}</h1>
        <p>{t('not_found.body')}</p>
        <Button onClick={() => navigate(-1)}>{t('not_found.go_back')}</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>{t('not_found.go_home')}</Button>
      </main>
    </>
  )
}
```

### Route-Level Error Boundary

```typescript
// src/app/RouteError.tsx
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom'
import { useEffect } from 'react'
import { captureException } from '@lib/observability/sentry'

export function RouteError() {
  const error    = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isRouteErrorResponse(error) || error.status !== 404) {
      captureException(error)
    }
  }, [error])

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main role="main">
        <h1>Page not found</h1>
        <button onClick={() => navigate('/')}>Go home</button>
      </main>
    )
  }

  return (
    <main role="main" aria-live="assertive">
      <h1>Something went wrong</h1>
      <p>We have been notified and are looking into it.</p>
      <button onClick={() => navigate(0)}>Reload</button>
      <button onClick={() => navigate('/')}>Go home</button>
    </main>
  )
}
```

### Role Guard for Loader-Level Authorization

```typescript
// src/features/auth/guards/checkRole.ts
import { redirect }    from 'react-router-dom'
import { queryClient } from '@lib/queryClient'
import { sessionKeys } from '../hooks/useSession'
import type { Session } from '../schemas/auth.schemas'

export async function checkRole(required: 'admin' | 'user'): Promise<null> {
  const session = queryClient.getQueryData<Session>(sessionKeys.current())

  if (!session?.user) throw redirect('/login')

  if (required === 'admin' && session.user.role !== 'admin') {
    throw redirect('/dashboard')
  }

  return null
}
```

### Routing Tests

```typescript
// src/app/__tests__/PrivateShell.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http }          from '@lib/http/client'
import { createWrapper } from '@test/utils/queryWrapper'
import { PrivateShell }  from '../shells/PrivateShell'

const mock = new MockAdapter(http)

function buildRouter(path: string) {
  return createMemoryRouter([
    { path: '/login',     element: <div>Login page</div> },
    { path: '/dashboard', element: <PrivateShell />,
      children: [{ index: true, element: <div>Dashboard</div> }] },
  ], { initialEntries: [path] })
}

describe('PrivateShell', () => {
  afterEach(() => mock.reset())

  it('redirects to /login when session returns 401', async () => {
    mock.onGet('/api/v1/auth/sessions').reply(401)
    render(<RouterProvider router={buildRouter('/dashboard')} />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument())
  })

  it('renders children when session is valid', async () => {
    mock.onGet('/api/v1/auth/sessions').reply(200, { user: { id: '1', role: 'user' } })
    render(<RouterProvider router={buildRouter('/dashboard')} />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })
})
```

---

## 4. Reusable Components

### The Five-Property Contract

A component qualifies for `shared/components/` only when it satisfies all five:

1. **No side effects** — no API calls, no analytics, no navigation
2. **Controlled by props** — no internal business decisions
3. **Accessible** — ARIA roles, keyboard operability, focus management, screen reader support. See [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) for the full enforcement standard
4. **i18n-transparent** — receives translated strings as props, never calls `t()` itself
5. **Token-compliant** — uses CSS custom properties from `tokens.css`, never raw values

> **Accessibility is a gate, not a goal.** A component that fails keyboard navigation, has no ARIA labels, or cannot be used by a screen reader does not pass property #3 and is not shippable. Refer to [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) Section 20 (Mandatory Enforcement Checklist) before marking any component complete.

### Button — The Reference Implementation

The Button component below demonstrates the baseline pattern. For the full accessible Button spec (icon-only buttons, toggle buttons, `aria-disabled` patterns, disabled state reasoning), see [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) Section 8.

```typescript
// src/shared/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@shared/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = 'button', variant = 'primary', size = 'md', isLoading = false,
     disabled, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn('btn', `btn--${variant}`, `btn--${size}`, className)}
      {...rest}
    >
      {isLoading && <Spinner aria-hidden="true" className="btn__spinner" />}
      <span className="btn__label">{children}</span>
    </button>
  ),
)
Button.displayName = 'Button'
```

### Accessible FormField

The FormField below is the baseline pattern. The full implementation — including `Fieldset` for radio/checkbox groups, `ErrorSummary` with focus management, `RadioGroup` with arrow key cycling, and `VisuallyHidden` — is in [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) Section 7.

```typescript
// src/shared/components/ui/FormField.tsx
import { useId } from 'react'

interface FormFieldProps {
  label:     string
  required?: boolean
  error?:    string
  hint?:     string
  children:  React.ReactElement
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  const id      = useId()
  const errorId = `${id}-error`
  const hintId  = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean).join(' ') || undefined

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      {hint && <p id={hintId} className="form-field__hint">{hint}</p>}
      {React.cloneElement(children, {
        id,
        'aria-required':    required,
        'aria-invalid':     !!error,
        'aria-describedby': describedBy,
      })}
      {error && <p id={errorId} role="alert" className="form-field__error">{error}</p>}
    </div>
  )
}
```

### Smart vs Presentational

```typescript
// Presentational — pure, no side effects, fully testable
export const TransactionRow = React.memo(function TransactionRow({
  id, description, amountCents, currency, date, status, onSelect,
}: TransactionRowProps) {
  return (
    <li role="row" className={`tx-row tx-row--${status}`} onClick={() => onSelect?.(id)}>
      <span>{description}</span>
      <MoneyDisplay amountCents={amountCents} currency={currency} />
      <time dateTime={date}>{formatDate(date)}</time>
    </li>
  )
})

// Smart — orchestrates data, delegates rendering, owns analytics
export function TransactionList() {
  const { data, isLoading, isError } = useTransactions()
  const { trackTransactionSelected } = useWalletAnalytics()
  const { t } = useTranslation('wallet')

  const handleSelect = useCallback((id: string) => {
    trackTransactionSelected(id)
  }, [trackTransactionSelected])

  if (isLoading) return <Skeleton count={5} height={64} />
  if (isError)   return <Alert variant="error">{t('errors.load_failed')}</Alert>

  return (
    <ul role="list" aria-label={t('transactions.list_label')}>
      {data?.map(tx => <TransactionRow key={tx.id} {...tx} onSelect={handleSelect} />)}
    </ul>
  )
}
```

### Props Anti-patterns

```typescript
// ❌ Boolean prop explosion
<Button isPrimary isLarge isRounded isDisabled isLoading />

// ✅ Variant + size enum
<Button variant="primary" size="lg" isLoading />

// ❌ Configuration-heavy — fights composition
<Card title="Balance" subtitle="Available" icon="wallet" actions={[...]} footer={...} />

// ✅ Composition — each slot is independently replaceable
<Card>
  <Card.Header><Card.Title>Balance</Card.Title></Card.Header>
  <Card.Body>{children}</Card.Body>
  <Card.Footer>{actions}</Card.Footer>
</Card>
```

---

## 5. Rails API Client — Cross-Origin + Client Auth

### Environment Variables

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_API_CLIENT_ID=wallet_pro_web_dev
VITE_API_CLIENT_SECRET=dev_secret_not_privileged

# .env.production
VITE_API_BASE_URL=https://api.walletpro.com
VITE_API_CLIENT_ID=wallet_pro_web
VITE_API_CLIENT_SECRET=managed_by_vault

# .env.test
VITE_API_BASE_URL=http://localhost:3001
VITE_API_CLIENT_ID=wallet_pro_web_test
VITE_API_CLIENT_SECRET=test_secret
```

> `VITE_API_CLIENT_SECRET` is embedded in the browser bundle. It identifies the client for rate-limiting and source verification. It is not a privileged secret. True secrets (DB, signing keys) live only in Rails env vars and GitHub Secrets.

### The HTTP Client

```typescript
// src/lib/http/client.ts
import axios, { type AxiosInstance } from 'axios'
import { env }              from '@lib/env/validate'
import { setupInterceptors } from './interceptors'

export const http: AxiosInstance = axios.create({
  baseURL:         env.VITE_API_BASE_URL,
  timeout:         20_000,
  withCredentials: true,          // Required for cross-origin Rails session cookies
  headers: {
    'Content-Type':     'application/json',
    'Accept':           'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // Rails: marks request as XHR
    'X-Client-Id':      env.VITE_API_CLIENT_ID,
    'X-Client-Secret':  env.VITE_API_CLIENT_SECRET,
  },
})

setupInterceptors(http)
```

### Interceptors

```typescript
// src/lib/http/interceptors.ts
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { normalizeError } from './errors'
import { tokenStore }     from '@features/auth/store/tokenStore'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function setupInterceptors(http: AxiosInstance): void {
  // ─── Request ──────────────────────────────────────────────────────────────
  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Locale — Rails before_action :set_locale reads Accept-Language
    const lang = document.documentElement.lang || 'en'
    config.headers['Accept-Language'] = lang
    config.headers['X-Locale']        = lang

    // CSRF — Rails requires X-CSRF-Token on all mutating requests
    const method = config.method?.toUpperCase() ?? ''
    if (MUTATING_METHODS.has(method)) {
      const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      if (csrf) config.headers['X-CSRF-Token'] = csrf
    }

    // JWT — only when using token-based auth instead of cookies
    const token = tokenStore.get()
    if (token) config.headers['Authorization'] = `Bearer ${token}`

    return config
  })

  // ─── Response ─────────────────────────────────────────────────────────────
  http.interceptors.response.use(
    response => response,

    async error => {
      const original = error.config

      // 401 — one token refresh attempt, then hard redirect
      if (error.response?.status === 401 && !original._retried) {
        original._retried = true
        try {
          await http.post('/api/v1/auth/token/refresh')
          return http(original)
        } catch {
          tokenStore.clear()
          window.location.replace('/login')
          return
        }
      }

      // 419 — Rails CSRF token expired; reload to get a fresh token
      if (error.response?.status === 419) {
        window.location.reload()
        return
      }

      return Promise.reject(normalizeError(error))
    },
  )
}
```

### Error Normalization

```typescript
// src/lib/http/errors.ts
import axios from 'axios'

export interface AppError {
  message: string
  code:    string
  status:  number
  /** Rails validation errors: { field: ['message', ...] } */
  details?: Record<string, string[]>
}

export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const res = error.response
    return {
      message: res?.data?.error ?? res?.data?.message ?? 'An error occurred',
      code:    res?.data?.code  ?? 'UNKNOWN',
      status:  res?.status      ?? 0,
      details: res?.data?.errors,
    }
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'CLIENT_ERROR', status: 0 }
  }
  return { message: 'Unknown error', code: 'UNKNOWN', status: 0 }
}
```

### Rails CORS and Client Verification (reference)

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('ALLOWED_ORIGINS').split(',')
    resource '/api/*',
      headers:     :any,
      methods:     [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,          # Required — matches withCredentials: true
      expose:      ['X-CSRF-Token']
  end
end

# app/controllers/application_controller.rb
before_action :verify_client_credentials
before_action :set_locale

def verify_client_credentials
  return if request.headers['X-Client-Id']     == ENV['API_CLIENT_ID'] &&
            request.headers['X-Client-Secret'] == ENV['API_CLIENT_SECRET']
  render json: { error: 'Unauthorized client' }, status: :unauthorized
end

def set_locale
  I18n.locale = params[:locale] ||
                request.headers['Accept-Language']&.split(',')&.first&.split(';')&.first&.strip&.split('-')&.first ||
                I18n.default_locale
end
```

### HTTP Client Tests

```typescript
// src/lib/http/__tests__/client.test.ts
import { describe, it, expect, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { http } from '../client'
import { env }  from '@lib/env/validate'

const mock = new MockAdapter(http)

describe('HTTP client', () => {
  afterEach(() => mock.reset())

  it('attaches X-Client-Id and X-Client-Secret on every request', async () => {
    mock.onGet('/test').reply(200, {})
    await http.get('/test')
    expect(mock.history.get[0].headers?.['X-Client-Id']).toBe(env.VITE_API_CLIENT_ID)
    expect(mock.history.get[0].headers?.['X-Client-Secret']).toBe(env.VITE_API_CLIENT_SECRET)
  })

  it('sends Accept-Language matching document.documentElement.lang', async () => {
    document.documentElement.lang = 'es'
    mock.onGet('/test').reply(200, {})
    await http.get('/test')
    expect(mock.history.get[0].headers?.['Accept-Language']).toBe('es')
    document.documentElement.lang = 'en'
  })

  it('normalizes 422 Rails validation errors into AppError.details', async () => {
    mock.onPost('/api/v1/transfers').reply(422, {
      error:  'Unprocessable',
      errors: { amount: ['is too large'] },
    })
    await expect(http.post('/api/v1/transfers', {})).rejects.toMatchObject({
      status:  422,
      details: { amount: ['is too large'] },
    })
  })

  it('retries on 401 with refreshed token then succeeds', async () => {
    mock.onPost('/api/v1/auth/token/refresh').reply(200)
    mock.onGet('/api/v1/wallet/balance')
      .replyOnce(401)
      .replyOnce(200, { data: { availableCents: 5000 } })
    const result = await http.get('/api/v1/wallet/balance')
    expect(result.data.data.availableCents).toBe(5000)
  })
})
```

---

## 6. Zod Runtime Validation

TypeScript types vanish at runtime. Zod validates that what the Rails API actually returns matches what you expect, before that data enters your state layer.

### validateResponse Utility

```typescript
// src/lib/http/validate.ts
import { z, type ZodSchema } from 'zod'
import type { AxiosResponse } from 'axios'
import { captureException }   from '@lib/observability/sentry'
import { logger }             from '@lib/observability/logger'

export function validateResponse<T>(
  response: AxiosResponse,
  schema: ZodSchema<T>,
): T | null {
  const result = schema.safeParse(response.data)
  if (result.success) return result.data

  logger.error('API response validation failed', {
    url:    response.config?.url,
    errors: result.error.format(),
  })

  captureException(new Error('API response validation failed'), {
    extra: { url: response.config?.url, errors: result.error.format() },
  })

  return null
}
```

### Wallet Schemas — Complete Example

```typescript
// src/features/wallet/schemas/wallet.schemas.ts
import { z } from 'zod'

const CentsSchema    = z.number().int().nonnegative()
const CurrencySchema = z.string().length(3)
const UuidSchema     = z.string().uuid()
const IsoDateSchema  = z.string().datetime()

export const RailsI18nBundleSchema = z.object({
  locale:       z.string(),
  namespace:    z.string(),
  translations: z.record(z.unknown()),
}).nullable()

export const WalletBalanceSchema = z.object({
  availableCents: CentsSchema,
  pendingCents:   CentsSchema,
  currency:       CurrencySchema,
})
export type WalletBalance = z.infer<typeof WalletBalanceSchema>

export const TransactionSchema = z.object({
  id:          UuidSchema,
  description: z.string(),
  amountCents: CentsSchema,
  currency:    CurrencySchema,
  date:        IsoDateSchema,
  status:      z.enum(['completed', 'pending', 'failed', 'cancelled']),
  type:        z.enum(['transfer', 'deposit', 'withdrawal', 'fee']),
})
export type Transaction = z.infer<typeof TransactionSchema>

export const TransferRequestSchema = z.object({
  amountCents: CentsSchema.min(100, 'Minimum transfer is 1.00'),
  recipientId: UuidSchema,
  note:        z.string().max(200).optional(),
})
export type TransferRequest = z.infer<typeof TransferRequestSchema>

export const BalanceResponseSchema = z.object({
  data: WalletBalanceSchema,
  i18n: RailsI18nBundleSchema,
})

export const TransactionsResponseSchema = z.object({
  data: z.array(TransactionSchema),
  meta: z.object({
    currentPage: z.number().int(),
    totalPages:  z.number().int(),
    totalCount:  z.number().int(),
    perPage:     z.number().int(),
  }),
})
```

### Auth Schemas

```typescript
// src/features/auth/schemas/auth.schemas.ts
import { z } from 'zod'

export const UserSchema = z.object({
  id:        z.string().uuid(),
  email:     z.string().email(),
  firstName: z.string(),
  lastName:  z.string(),
  plan:      z.enum(['free', 'pro', 'enterprise']),
  locale:    z.string(),
  role:      z.enum(['user', 'admin']),
})
export type User = z.infer<typeof UserSchema>

export const SessionSchema      = z.object({ user: UserSchema })
export type Session             = z.infer<typeof SessionSchema>

export const LoginCredentialsSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
```

### Schema Tests

```typescript
// src/features/wallet/schemas/__tests__/wallet.schemas.test.ts
import { describe, it, expect } from 'vitest'
import { WalletBalanceSchema, TransferRequestSchema } from '../wallet.schemas'

describe('WalletBalanceSchema', () => {
  it('accepts a valid balance', () => {
    expect(WalletBalanceSchema.safeParse({ availableCents: 15025, pendingCents: 0, currency: 'MXN' }).success).toBe(true)
  })
  it('rejects negative cents', () => {
    expect(WalletBalanceSchema.safeParse({ availableCents: -1, pendingCents: 0, currency: 'MXN' }).success).toBe(false)
  })
  it('rejects non-3-char currency', () => {
    expect(WalletBalanceSchema.safeParse({ availableCents: 0, pendingCents: 0, currency: 'MXNN' }).success).toBe(false)
  })
})

describe('TransferRequestSchema', () => {
  it('rejects amount below minimum', () => {
    const r = TransferRequestSchema.safeParse({ amountCents: 50, recipientId: crypto.randomUUID() })
    expect(r.success).toBe(false)
  })
  it('rejects non-UUID recipient', () => {
    expect(TransferRequestSchema.safeParse({ amountCents: 500, recipientId: 'bad' }).success).toBe(false)
  })
  it('accepts a valid request', () => {
    expect(TransferRequestSchema.safeParse({ amountCents: 1000, recipientId: crypto.randomUUID() }).success).toBe(true)
  })
})
```

---

## 7. Data Layer — TanStack Query

### QueryClient — Intentional Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'
import type { AppError } from './http/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            60 * 1000,
      gcTime:               5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect:   true,
      retry: (failureCount, error) => {
        const e = error as AppError
        if (e.status >= 400 && e.status < 500) return false  // Never retry 4xx
        return failureCount < 3
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: { retry: false },
  },
})
```

### Query Key Factory

```typescript
// src/features/wallet/services/walletKeys.ts
export const walletKeys = {
  all:          ['wallet']                                        as const,
  balance:      ()           => [...walletKeys.all, 'balance']   as const,
  transactions: (p?: object) => [...walletKeys.all, 'txs', p]   as const,
  transaction:  (id: string) => [...walletKeys.all, 'tx', id]   as const,
}
```

### Service with Zod Validation

```typescript
// src/features/wallet/services/walletApi.ts
import { http }             from '@lib/http/client'
import { validateResponse } from '@lib/http/validate'
import { injectTranslations } from '@lib/i18n/utils/namespaceLoader'
import {
  BalanceResponseSchema,
  TransactionsResponseSchema,
  type WalletBalance,
  type Transaction,
} from '../schemas/wallet.schemas'

export const walletApi = {
  getBalance: async () => {
    const res       = await http.get('/api/v1/wallet/balance')
    const validated = validateResponse(res, BalanceResponseSchema)
    if (!validated) throw new Error('Invalid balance response')
    // Inject i18n bundle from Rails response (per react-i18n-architecture.md)
    if (validated.i18n) {
      injectTranslations(validated.i18n.locale as SupportedLocale, 'wallet', validated.i18n.translations)
    }
    return validated.data
  },

  getTransactions: async (params: { page?: number; per_page?: number }, signal?: AbortSignal) => {
    const res       = await http.get('/api/v1/transactions', { params, signal })
    const validated = validateResponse(res, TransactionsResponseSchema)
    if (!validated) throw new Error('Invalid transactions response')
    return validated
  },

  createTransfer: async (payload: TransferRequest, signal?: AbortSignal) => {
    const res = await http.post('/api/v1/transfers', payload, { signal })
    return res.data as { data: Transfer }
  },
}
```

### Hooks

```typescript
// src/features/wallet/hooks/useWallet.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletApi }  from '../services/walletApi'
import { walletKeys } from '../services/walletKeys'
import { trackEvent } from '@analytics/service'

export function useWalletBalance() {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn:  walletApi.getBalance,
  })
}

export function useTransactions(params?: { page?: number }) {
  return useQuery({
    queryKey: walletKeys.transactions(params),
    queryFn:  ({ signal }) => walletApi.getTransactions(params ?? {}, signal),
    placeholderData: prev => prev,
  })
}

export function useCreateTransfer() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: walletApi.createTransfer,

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: walletKeys.balance() })
      const prev = qc.getQueryData(walletKeys.balance())
      qc.setQueryData(walletKeys.balance(), (old: WalletBalance | undefined) =>
        old ? { ...old, availableCents: old.availableCents - payload.amountCents } : old,
      )
      return { prev }
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) qc.setQueryData(walletKeys.balance(), ctx.prev)
    },

    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: walletKeys.balance() })
      qc.invalidateQueries({ queryKey: walletKeys.transactions() })
      trackEvent({ event: 'transfer_completed', category: 'wallet',
        label: data.data.id, value: data.data.amountCents / 100 })
    },
  })
}
```

---

## 8. Auth & Session Scaffold

### Session Hook — Single Source of Truth

```typescript
// src/features/auth/hooks/useSession.ts
import { useQuery } from '@tanstack/react-query'
import { authApi }  from '../services/authApi'
import { validateResponse } from '@lib/http/validate'
import { SessionSchema, type Session } from '../schemas/auth.schemas'

export const sessionKeys = {
  all:     ['session']              as const,
  current: () => ['session', 'me'] as const,
}

export function useSession() {
  return useQuery({
    queryKey:  sessionKeys.current(),
    queryFn:   async ({ signal }) => {
      const res       = await http.get('/api/v1/auth/sessions', { signal })
      const validated = validateResponse(res, SessionSchema)
      if (!validated) throw new Error('Invalid session response')
      return validated
    },
    retry:     false,
    staleTime: 5 * 60 * 1000,
  })
}
```

### Login Hook

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation }    from 'react-router-dom'
import { authApi }         from '../services/authApi'
import { sessionKeys }     from './useSession'
import { identifyUser }    from '@analytics/service'
import { setUserContext }  from '@lib/observability/sentry'

export function useLogin() {
  const qc       = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      // Populate cache immediately — PrivateShell won't refetch
      qc.setQueryData(sessionKeys.current(), session)
      identifyUser(session.user.id, { plan: session.user.plan })
      setUserContext({ id: session.user.id, email: session.user.email })
      navigate(returnTo, { replace: true })
    },
  })
}
```

### Logout Hook — Complete Cleanup in Order

```typescript
// src/features/auth/hooks/useLogout.ts
import { useQueryClient }   from '@tanstack/react-query'
import { authApi }          from '../services/authApi'
import { tokenStore }       from '../store/tokenStore'
import { clearUser }        from '@analytics/service'
import { clearUserContext } from '@lib/observability/sentry'

/**
 * Cleanup order is critical:
 * 1. Clear analytics identity
 * 2. Clear Sentry identity
 * 3. Clear in-memory JWT
 * 4. Purge ALL query cache (prevents data leaking to next user)
 * 5. Clear session storage
 * 6. Call Rails to invalidate server session cookie
 * 7. Hard redirect — creates fresh JS context
 */
export function useLogout() {
  const qc = useQueryClient()

  return async () => {
    try {
      clearUser()
      clearUserContext()
      tokenStore.clear()
      qc.clear()
      sessionStorage.clear()
      await authApi.logout()
    } finally {
      window.location.replace('/login')
    }
  }
}
```

### Token Store — Memory Only

```typescript
// src/features/auth/store/tokenStore.ts
class TokenStore {
  #token: string | null = null
  get():   string | null { return this.#token }
  set(t:   string): void  { this.#token = t    }
  clear(): void           { this.#token = null }
  has():   boolean        { return this.#token !== null }
}
export const tokenStore = new TokenStore()
```

---

## 9. Performance Optimization

### Memoization Decision Framework

| Scenario | Tool | Apply? |
|---|---|---|
| Expensive sort/filter/transform (measured >1ms) | `useMemo` | Yes |
| Callback passed to `React.memo` child | `useCallback` | Yes |
| Component receiving same complex props frequently | `React.memo` | Yes |
| Simple arithmetic, string interpolation | none | No |
| Component that always gets new props anyway | none | No |
| "Just to be safe" without profiler evidence | none | Never |

```typescript
// ✅ useMemo — expensive, measured
const sorted = useMemo(
  () => [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(tx => tx.status !== 'cancelled'),
  [transactions],
)

// ✅ useCallback — passed to React.memo child
const handleSelect = useCallback((id: string) => {
  setSelected(id)
  track({ event: 'transaction_selected', label: id })
}, [track])

// ✅ React.memo — row component receives stable props
const TransactionRow = React.memo(function TransactionRow({ ...props }: TransactionRowProps) {
  return <li onClick={() => props.onSelect(props.id)}>{props.description}</li>
})
```

### Unstable References — Primary Re-render Cause

```typescript
// ❌ New object on every render — breaks React.memo children
<TransactionList filters={{ status: 'completed' }} />

// ✅ Stable constant or memoized
const COMPLETED = { status: 'completed' } as const
<TransactionList filters={COMPLETED} />
```

### Route-Level Code Splitting

```typescript
// Every route lazy-loaded — code splits at route boundaries
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const WalletPage    = lazy(() => import('@/pages/WalletPage'))
const AdminPage     = lazy(() => import('@/pages/AdminPage'))
```

### Virtualization for Long Lists

```typescript
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export function TransactionVirtualList({ transactions }: { transactions: Transaction[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const virtualizer  = useVirtualizer({
    count:            transactions.length,
    getScrollElement: () => containerRef.current,
    estimateSize:     () => 64,
    overscan:         5,
  })

  return (
    <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
      <ul style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vRow => (
          <li key={vRow.key} style={{
            position: 'absolute', top: 0, left: 0, width: '100%',
            height: `${vRow.size}px`, transform: `translateY(${vRow.start}px)`,
          }}>
            <TransactionRow {...transactions[vRow.index]} />
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Bundle Hygiene

```typescript
// ✅ Named imports only — tree-shakeable
import { groupBy, sortBy } from 'lodash-es'

// ❌ Default import — bundles entire library
import _ from 'lodash'
```

---

## 10. Caching Strategy

### Three Layers

| Layer | Tool | Lifetime |
|---|---|---|
| In-memory | TanStack Query `gcTime` | Tab session |
| Browser HTTP | `Cache-Control` header | Per config |
| Persistent | IndexedDB (rare) | Explicit TTL |

### staleTime per Resource Type

```typescript
// Reference data — infrequently changing
useQuery({ staleTime: 24 * 60 * 60 * 1000, gcTime: Infinity })  // 24h

// Financial data — frequently changing
useQuery({ staleTime: 30 * 1000, refetchInterval: 60 * 1000 })  // 30s + polling

// Session — moderate change rate
useQuery({ staleTime: 5 * 60 * 1000, retry: false })             // 5 min
```

### Surgical Cache Invalidation

```typescript
// ✅ Invalidate exactly what changed
onSuccess: () => {
  qc.invalidateQueries({ queryKey: walletKeys.balance() })
  qc.invalidateQueries({ queryKey: walletKeys.transactions() })
}

// ❌ Nuclear — avoid
onSuccess: () => { qc.invalidateQueries() }
```

### Asset Cache Headers (Vite build + Rails/Nginx)

```
# Hashed JS/CSS/images — content-addressed, safe to cache forever
Cache-Control: public, max-age=31536000, immutable

# HTML — must revalidate so users get new deploy
Cache-Control: no-cache

# Translation files — aggressive caching, safe to stale-while-revalidate
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

---

## 11. Global Error Handling

### React ErrorBoundary

```typescript
// src/shared/components/feedback/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { captureException } from '@lib/observability/sentry'

interface Props  { children: ReactNode; fallback?: ReactNode; onError?: (e: Error, i: ErrorInfo) => void }
interface State  { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, { extra: { componentStack: info.componentStack } })
    this.props.onError?.(error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return this.props.fallback ?? (
      <div role="alert" aria-live="assertive" className="error-boundary">
        <h2>Something went wrong</h2>
        <p>We have been notified and are looking into it.</p>
        <button onClick={() => this.setState({ hasError: false, error: null })}>
          Try again
        </button>
      </div>
    )
  }
}
```

### Usage — Wrap Feature Sections Independently

```typescript
// Every major section gets its own boundary — one crash doesn't kill the page
export function WalletSection() {
  const { t } = useTranslation('wallet')
  return (
    <ErrorBoundary fallback={<div role="alert">{t('errors.section_crashed')}</div>}>
      <TransactionList />
    </ErrorBoundary>
  )
}
```

### Global Unhandled Rejection Handler

```typescript
// src/shared/utils/reportError.ts
import { captureException } from '@lib/observability/sentry'

export function installGlobalErrorHandlers(): void {
  window.addEventListener('unhandledrejection', (event) => {
    captureException(event.reason, { extra: { type: 'unhandledrejection' } })
  })
  window.addEventListener('error', (event) => {
    captureException(event.error ?? event.message, {
      extra: { type: 'globalerror', source: event.filename, line: event.lineno },
    })
  })
}
```

```typescript
// src/main.tsx — call before ReactDOM.createRoot
import { installGlobalErrorHandlers } from '@shared/utils/reportError'
installGlobalErrorHandlers()
```

---

## 12. Observability — Sentry + Structured Logging

### Sentry Initialization

```typescript
// src/lib/observability/sentry.ts
import * as Sentry from '@sentry/react'
import { env } from '@lib/env/validate'

export function initSentry(): void {
  if (!env.VITE_SENTRY_DSN) return

  Sentry.init({
    dsn:         env.VITE_SENTRY_DSN,
    environment: env.VITE_APP_ENV,
    release:     env.VITE_APP_VERSION,

    tracesSampleRate:          env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate:  0.01,
    replaysOnErrorSampleRate:  1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Strip sensitive headers before sending to Sentry
    beforeSend: (event) => {
      if (event.request?.headers) {
        delete event.request.headers['Authorization']
        delete event.request.headers['X-Client-Secret']
        delete event.request.headers['X-CSRF-Token']
      }
      return event
    },
  })
}

export const { captureException, captureMessage, addBreadcrumb, setTag } = Sentry

export function setUserContext(user: { id: string; email?: string }): void {
  Sentry.setUser({ id: user.id, email: user.email })
}

export function clearUserContext(): void {
  Sentry.setUser(null)
}
```

```typescript
// src/main.tsx — first lines, before React renders
import '@lib/env/validate'             // Env validation — fails fast if misconfigured
import { initSentry }                  from '@lib/observability/sentry'
import { installGlobalErrorHandlers }  from '@shared/utils/reportError'
import { reportWebVitals }             from '@analytics/webVitals'

initSentry()
installGlobalErrorHandlers()

// ... ReactDOM.createRoot(...)

reportWebVitals()  // After render — measures real user performance
```

### Structured Logger

```typescript
// src/lib/observability/logger.ts
import { addBreadcrumb, captureMessage } from './sentry'

type Level = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  #emit(level: Level, message: string, context?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'
      console[method](`[${level.toUpperCase()}] ${message}`, context ?? '')
    }
    addBreadcrumb({ message, level, data: context, category: 'app' })
    if (level === 'warn' || level === 'error') captureMessage(message, level)
  }

  debug(msg: string, ctx?: Record<string, unknown>) { this.#emit('debug', msg, ctx) }
  info (msg: string, ctx?: Record<string, unknown>) { this.#emit('info',  msg, ctx) }
  warn (msg: string, ctx?: Record<string, unknown>) { this.#emit('warn',  msg, ctx) }
  error(msg: string, ctx?: Record<string, unknown>) { this.#emit('error', msg, ctx) }
}

export const logger = new Logger()
```

---

## 13. Security Best Practices

### XSS Prevention

```typescript
// src/shared/lib/security/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS:  ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR:  ['href', 'rel', 'target'],
  })
}

// Use ONLY when HTML is genuinely required (CMS content, rich text editor)
export function RichText({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
}
```

### Safe External Links

```typescript
const SAFE_PROTOCOLS = /^https?:\/\//

export function SafeLink({ href, children, ...rest }: SafeLinkProps) {
  const safeHref = SAFE_PROTOCOLS.test(href) ? href : '#'
  return <a href={safeHref} rel="noopener noreferrer" target="_blank" {...rest}>{children}</a>
}
```

### Secure Form Pattern

```typescript
// Passwords never in React state — read from DOM, cleared after submit
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const form     = e.currentTarget
  const email    = (form.elements.namedItem('email')    as HTMLInputElement).value.trim()
  const password = (form.elements.namedItem('password') as HTMLInputElement).value

  login({ email, password })

  // Clear password field immediately — win or lose
  ;(form.elements.namedItem('password') as HTMLInputElement).value = ''
}
```

### Content Security Policy — Three-Phase Rollout

```ruby
# Phase 1 (first 2 weeks): Report-Only — no breakage, collect violations
Rails.application.config.content_security_policy_report_only = true

# Phase 2: Enforce after clean reports
Rails.application.config.content_security_policy_report_only = false

Rails.application.config.content_security_policy do |policy|
  policy.default_src :self
  policy.script_src  :self, 'https://www.googletagmanager.com', 'https://www.google-analytics.com'
  policy.connect_src :self, ENV['VITE_API_BASE_URL'], 'https://www.google-analytics.com', 'https://sentry.io'
  policy.img_src     :self, :data, 'https://www.google-analytics.com'
  policy.style_src   :self, :unsafe_inline
  policy.font_src    :self, :data
  policy.object_src  :none
  policy.frame_src   :none
  policy.report_uri  '/api/v1/csp_reports'
end
```

### Security Headers

```ruby
# app/controllers/application_controller.rb
before_action :set_security_headers

def set_security_headers
  response.headers['X-Content-Type-Options']  = 'nosniff'
  response.headers['X-Frame-Options']          = 'DENY'
  response.headers['Referrer-Policy']          = 'strict-origin-when-cross-origin'
  response.headers['Permissions-Policy']       = 'geolocation=(), microphone=(), camera=(), payment=()'
  if Rails.env.production?
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  end
end
```

---

## 14. SEO Implementation

### SEO Component — Every Indexable Route

```typescript
// src/shared/components/SEO.tsx
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title:           string
  description:     string
  canonical?:      string
  image?:          string
  type?:           'website' | 'article'
  noIndex?:        boolean
  structuredData?: object
}

const SITE_NAME = 'WalletPro'
const SITE_URL  = import.meta.env.VITE_SITE_URL ?? 'https://walletpro.com'

export function SEO({ title, description, canonical, image = `${SITE_URL}/og-default.png`,
  type = 'website', noIndex = false, structuredData }: SEOProps) {
  const fullTitle    = `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ?? (typeof window !== 'undefined' ? window.location.href : SITE_URL)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description"  content={description} />
      <link rel="canonical"     href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={image} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  )
}
```

### Authenticated Pages Are Always noIndex

```typescript
// Every page behind login must have noIndex
export function DashboardPage() {
  const { t } = useTranslation('dashboard')
  return (
    <>
      <SEO title={t('meta.title')} description={t('meta.description')} noIndex />
      <DashboardFeature />
    </>
  )
}
```

---

## 15. i18n Readiness

Per `react-i18n-architecture.md`. The core rule: **components never contain strings**.

### i18n-Transparent Components

```typescript
// ✅ Component receives translated strings — it never calls t() itself
interface EmptyStateProps {
  title:        string
  description:  string
  actionLabel?: string
  onAction?:    () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div role="status" className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}

// Feature component owns the translation
function WalletEmptyState() {
  const { t } = useTranslation('wallet')
  return (
    <EmptyState
      title={t('empty.title')}
      description={t('empty.description')}
      actionLabel={t('empty.action')}
      onAction={handleDeposit}
    />
  )
}
```

### Locale-Aware Money and Dates

```typescript
// src/shared/components/ui/MoneyDisplay.tsx
import { formatCurrency } from '@lib/i18n/utils/formatters'
import { useLocale }      from '@lib/i18n/hooks/useLocale'

export function MoneyDisplay({
  amountCents,   // Always integer cents — NEVER decimal floats
  currency,
  as: Tag = 'span',
}: { amountCents: number; currency: string; as?: 'span' | 'p' | 'td' }) {
  const { locale } = useLocale()
  return <Tag>{formatCurrency(amountCents, currency, locale)}</Tag>
}
```

### Locale + Rails Cookie Alignment

```typescript
// src/lib/i18n/config.ts — lookupCookie MUST match Rails cookie name
detection: {
  order:             ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
  lookupCookie:      'locale',       // Must match Rails: cookies[:locale]
  lookupLocalStorage: 'i18n_lang',
  caches:            ['localStorage', 'cookie'],
},
```

---

## 16. Branding and Design Consistency

### Design Tokens — Single Source

```css
/* src/styles/tokens.css */
:root {
  --color-brand-primary:       #2563eb;
  --color-brand-primary-hover: #1d4ed8;
  --color-brand-accent:        #7c3aed;
  --color-success:             #059669;
  --color-warning:             #d97706;
  --color-error:               #dc2626;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-2xl:  1.5rem;

  --space-1: 0.25rem;  --space-2: 0.5rem;
  --space-4: 1rem;     --space-6: 1.5rem;
  --space-8: 2rem;

  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;
  --transition-fast: 100ms ease;  --transition-base: 150ms ease;
}
```

Components reference tokens only — never raw values:

```css
/* ✅ Survives a rebrand */
.btn--primary { background-color: var(--color-brand-primary); }

/* ❌ Requires touching every component on rebrand */
.btn--primary { background-color: #2563eb; }
```

---

## 17. Analytics and Tracking

Per `analytics-best-practices.md`: GTM is the only direct install. React writes to `window.dataLayer`. Components never call vendor SDKs.

### Typed Event Registry

```typescript
// src/analytics/events.ts
export type AnalyticsEvent =
  | { event: 'page_view';          category: 'navigation'; label: string }
  | { event: 'login';              category: 'auth'; label: string }
  | { event: 'logout';             category: 'auth'; label: string }
  | { event: 'transfer_initiated'; category: 'wallet'; value?: number }
  | { event: 'transfer_completed'; category: 'wallet'; label: string; value: number }
  | { event: 'transfer_failed';    category: 'wallet'; label: string }
  | { event: 'button_click';       category: string; label: string }
  | { event: 'form_submit';        category: 'form'; label: string }
  | { event: 'form_error';         category: 'form'; label: string; error_field?: string }
  | { event: 'web_vitals';         category: 'performance'; metric_name: string; metric_value: number; metric_rating: string }
```

### Analytics Service

```typescript
// src/analytics/service.ts
import type { AnalyticsEvent } from './events'

declare global { interface Window { dataLayer: Record<string, unknown>[] } }

const IS_ENABLED = import.meta.env.PROD

export function pushToDataLayer(data: Record<string, unknown>): void {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

export function trackEvent(payload: AnalyticsEvent & Record<string, unknown>): void {
  if (!IS_ENABLED) { console.debug('[Analytics]', payload); return }
  pushToDataLayer({ ...payload, timestamp: new Date().toISOString() })
}

export function identifyUser(userId: string, props?: Record<string, unknown>): void {
  pushToDataLayer({ event: 'user_identified', userId, user_properties: { user_id: userId, ...props } })
}

export function clearUser(): void {
  pushToDataLayer({ event: 'user_cleared', userId: undefined, user_properties: null })
}
```

### SPA Page View Tracking

```typescript
// src/analytics/RouteChangeTracker.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from './service'

export function RouteChangeTracker() {
  const location = useLocation()
  useEffect(() => {
    const timer = setTimeout(() => {
      trackEvent({ event: 'page_view', category: 'navigation',
        label: location.pathname, page_path: location.pathname + location.search,
        page_title: document.title } as never)
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])
  return null
}
```

### Core Web Vitals Reporting

```typescript
// src/analytics/webVitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'
import { pushToDataLayer } from './service'

function report({ name, value, rating, id }: { name: string; value: number; rating: string; id: string }) {
  pushToDataLayer({
    event:          'web_vitals',
    metric_name:    name,
    metric_value:   Math.round(name === 'CLS' ? value * 1000 : value),
    metric_rating:  rating,
    metric_id:      id,
    non_interaction: true,
  })
}

export function reportWebVitals(): void {
  onCLS(report); onINP(report); onLCP(report); onFCP(report); onTTFB(report)
}
```

---

## 18. Unit & Integration Testing

### The Mandate

**Every feature implementation ships with tests. Every bug fix ships with a regression test. No PR merges without passing tests.** This is enforced by CI — a failing test blocks the merge exactly like a failing lint check.

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals:     true,
    setupFiles:  ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/app/router.tsx', 'src/styles/**'],
    },
  },
  resolve: {
    alias: {
      '@':          path.resolve(__dirname, 'src'),
      '@features':  path.resolve(__dirname, 'src/features'),
      '@shared':    path.resolve(__dirname, 'src/shared'),
      '@lib':       path.resolve(__dirname, 'src/lib'),
      '@analytics': path.resolve(__dirname, 'src/analytics'),
      '@test':      path.resolve(__dirname, 'src/test'),
    },
  },
})
```

### Global Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  window.dataLayer = []
})

// Mock i18next — components get real-looking key strings, not broken UI
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t:    (key: string, opts?: object) => opts ? `${key}(${JSON.stringify(opts)})` : key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  Trans: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock IntersectionObserver (used by virtualization)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}))
```

### Test Utilities

```typescript
// src/test/utils/queryWrapper.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** Fresh QueryClient per test — prevents cache bleeding */
export function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}
```

### Component Tests

```typescript
// src/shared/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('is disabled and aria-busy when isLoading', () => {
    render(<Button isLoading>Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('calls onClick when not loading or disabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant and size classes', () => {
    render(<Button variant="danger" size="lg">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--danger', 'btn--lg')
  })
})
```

### Hook Tests

```typescript
// src/features/wallet/hooks/__tests__/useCreateTransfer.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { http }          from '@lib/http/client'
import { createWrapper } from '@test/utils/queryWrapper'
import { useCreateTransfer } from '../useWallet'

const mock = new MockAdapter(http)

describe('useCreateTransfer', () => {
  afterEach(() => mock.reset())

  it('calls POST /api/v1/transfers with payload', async () => {
    mock.onPost('/api/v1/transfers').reply(200, { data: { id: 'tf-1', amountCents: 5000 } })
    const { result } = renderHook(() => useCreateTransfer(), { wrapper: createWrapper() })
    act(() => result.current.mutate({ amountCents: 5000, recipientId: crypto.randomUUID() }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(JSON.parse(mock.history.post[0].data).amountCents).toBe(5000)
  })

  it('enters error state on 422', async () => {
    mock.onPost('/api/v1/transfers').reply(422, {
      error: 'Unprocessable', errors: { amount: ['exceeds daily limit'] },
    })
    const { result } = renderHook(() => useCreateTransfer(), { wrapper: createWrapper() })
    act(() => result.current.mutate({ amountCents: 999999, recipientId: crypto.randomUUID() }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as AppError).details?.amount).toContain('exceeds daily limit')
  })
})
```

### Form Integration Tests

```typescript
// src/features/auth/components/__tests__/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter } from 'react-router-dom'
import { http }           from '@lib/http/client'
import { createWrapper }  from '@test/utils/queryWrapper'
import { LoginForm }      from '../LoginForm'

const mock = new MockAdapter(http)

function renderForm() {
  const Wrapper = createWrapper()
  return render(
    <Wrapper><MemoryRouter><LoginForm /></MemoryRouter></Wrapper>
  )
}

describe('LoginForm', () => {
  afterEach(() => mock.reset())

  it('shows error alert on 401', async () => {
    const user = userEvent.setup()
    mock.onPost('/api/v1/auth/sessions').reply(401)

    renderForm()
    await user.type(screen.getByLabelText('auth:email'), 'wrong@example.com')
    await user.type(screen.getByLabelText('auth:password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'auth:sign_in' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })

  it('clears password field after submit', async () => {
    const user = userEvent.setup()
    mock.onPost('/api/v1/auth/sessions').reply(401)

    renderForm()
    const passwordInput = screen.getByLabelText('auth:password') as HTMLInputElement
    await user.type(passwordInput, 'mypassword')
    await user.click(screen.getByRole('button', { name: 'auth:sign_in' }))

    await waitFor(() => expect(passwordInput.value).toBe(''))
  })
})
```

### Analytics Tests

```typescript
// src/analytics/__tests__/service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { trackEvent, identifyUser, clearUser } from '../service'

describe('Analytics service', () => {
  beforeEach(() => { window.dataLayer = []; vi.stubEnv('PROD', 'true') })

  it('pushes event with timestamp', () => {
    trackEvent({ event: 'transfer_initiated', category: 'wallet' })
    expect(window.dataLayer[0]).toMatchObject({ event: 'transfer_initiated' })
    expect(window.dataLayer[0]).toHaveProperty('timestamp')
  })

  it('does not push in development', () => {
    vi.stubEnv('PROD', 'false')
    trackEvent({ event: 'button_click', category: 'ui', label: 'test' })
    expect(window.dataLayer).toHaveLength(0)
  })

  it('identifyUser pushes correct shape', () => {
    identifyUser('user-1', { plan: 'pro' })
    expect(window.dataLayer[0]).toMatchObject({
      event: 'user_identified', userId: 'user-1',
      user_properties: { user_id: 'user-1', plan: 'pro' },
    })
  })
})
```

---

## 19. End-to-End Tests — Playwright

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir:       './e2e',
  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 1 : undefined,
  reporter:      process.env.CI ? 'github' : 'html',
  use: {
    baseURL:    BASE_URL,
    trace:      'on-first-retry',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command:             'npm run preview',
    url:                 BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Auth Fixture

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, type Page } from '@playwright/test'

export const test = base.extend<{ authenticatedPage: Page; adminPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_USER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/dashboard')
    await use(page)
  },
  adminPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_ADMIN_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/dashboard')
    await use(page)
  },
})
export { expect } from '@playwright/test'
```

### Critical Flow Tests

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '../fixtures/auth.fixture'
import { test as base }  from '@playwright/test'

base.describe('Login flow', () => {
  base.beforeEach(async ({ page }) => { await page.goto('/login') })

  base.test('redirects to dashboard on valid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill(process.env.E2E_USER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  base.test('shows error on invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})

// e2e/auth/auth-guard.spec.ts
base.test('unauthenticated user redirected from /dashboard to /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

// e2e/wallet/transfer.spec.ts
test.describe('Transfer flow', () => {
  test('completes a transfer end-to-end', async ({ authenticatedPage: page }) => {
    await page.goto('/wallet')
    await page.getByRole('button', { name: /transfer/i }).click()
    await page.getByLabel(/amount/i).fill('100')
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.getByText(/confirm/i)).toBeVisible()
    await page.getByRole('button', { name: /confirm/i }).click()
    await expect(page.getByRole('status')).toContainText(/success/i)
  })
})

// e2e/accessibility/a11y.spec.ts
import AxeBuilder from '@axe-core/playwright'

for (const path of ['/', '/login', '/register']) {
  base.test(`${path} has no critical a11y violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}
```

---

## 20. Linting and Code Quality

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env:  { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', project: './tsconfig.json', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import', 'vitest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:vitest/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any':          'error',
    '@typescript-eslint/no-unused-vars':           ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports':  ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-floating-promises':     'error',
    '@typescript-eslint/await-thenable':           'error',
    '@typescript-eslint/no-misused-promises':      'error',

    'react-hooks/rules-of-hooks':  'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types':            'off',
    'react/display-name':          'error',
    'react/no-danger':             'error',
    'react/no-array-index-key':    'warn',

    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
    'import/no-default-export': 'warn',
    'import/no-cycle':          'error',

    'jsx-a11y/alt-text':                         'error',
    'jsx-a11y/interactive-supports-focus':        'error',
    'jsx-a11y/click-events-have-key-events':      'error',

    'no-console':   ['error', { allow: ['warn', 'error', 'debug'] }],
    'no-debugger':  'error',
    'prefer-const': 'error',
    'no-var':       'error',
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': { typescript: { alwaysTryTypes: true } },
  },
  overrides: [{
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', 'src/test/**', 'e2e/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-default-export':           'off',
    },
  }],
}
```

### Prettier

```json
// .prettierrc
{
  "semi": false, "singleQuote": true, "trailingComma": "all",
  "tabWidth": 2, "printWidth": 100
}
```

---

## 21. Pre-commit Quality Gates

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}":            ["eslint --max-warnings 0 --fix", "prettier --write"],
  "*.{css,json,md,yml}":   ["prettier --write"]
}
```

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf', 'ci', 'revert']],
    'subject-empty':     [2, 'never'],
    'header-max-length': [2, 'always', 100],
  },
}
```

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged
gitleaks protect --staged --redact   # Secret scanning on staged files
```

```bash
# .husky/commit-msg
#!/bin/sh
npx commitlint --edit "$1"
```

```bash
# .husky/pre-push
#!/bin/sh
npm run typecheck && npm run lint && npm run test
```

---

## 22. CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'

jobs:
  static-analysis:
    name: Typecheck · Lint · Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check

  unit-tests:
    name: Unit + Integration Tests
    runs-on: ubuntu-latest
    env:
      VITE_API_BASE_URL:      ${{ vars.VITE_API_BASE_URL_TEST }}
      VITE_API_CLIENT_ID:     ${{ vars.VITE_API_CLIENT_ID_TEST }}
      VITE_API_CLIENT_SECRET: ${{ secrets.VITE_API_CLIENT_SECRET_TEST }}
      VITE_SITE_URL:          http://localhost:5173
      VITE_APP_ENV:           test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: npm }
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage/ }

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [static-analysis]
    env:
      VITE_API_BASE_URL:      ${{ vars.VITE_API_BASE_URL_PROD }}
      VITE_API_CLIENT_ID:     ${{ vars.VITE_API_CLIENT_ID_PROD }}
      VITE_API_CLIENT_SECRET: ${{ secrets.VITE_API_CLIENT_SECRET_PROD }}
      VITE_GTM_ID:            ${{ vars.VITE_GTM_ID }}
      VITE_SENTRY_DSN:        ${{ secrets.VITE_SENTRY_DSN }}
      VITE_APP_ENV:           production
      VITE_APP_VERSION:       ${{ github.sha }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/, retention-days: 7 }

  e2e:
    name: E2E — Playwright
    runs-on: ubuntu-latest
    needs: [build]
    env:
      E2E_USER_EMAIL:     ${{ secrets.E2E_USER_EMAIL }}
      E2E_USER_PASSWORD:  ${{ secrets.E2E_USER_PASSWORD }}
      E2E_ADMIN_EMAIL:    ${{ secrets.E2E_ADMIN_EMAIL }}
      E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist/ }
      - run: npm run e2e
        env:
          PLAYWRIGHT_BASE_URL: ${{ vars.E2E_BASE_URL }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }

  security-audit:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: npm }
      - run: npm ci
      - run: npm audit --audit-level=high --omit=dev
```

```yaml
# .github/workflows/dependency-review.yml — on every PR
name: Dependency Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with: { fail-on-severity: high, deny-licenses: GPL-3.0, AGPL-3.0 }
```

```yaml
# .github/workflows/secret-scan.yml
name: Secret Scanning
on: [push, pull_request]
jobs:
  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: trufflesecurity/trufflehog@main
        with: { path: './', base: '${{ github.event.repository.default_branch }}', head: HEAD, extra_args: '--only-verified' }
```

```yaml
# .github/workflows/scheduled-audit.yml
name: Weekly Security Audit
on:
  schedule: [{ cron: '0 9 * * 1' }]
  workflow_dispatch:
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: npm }
      - run: npm ci
      - run: npm audit --audit-level=high
```

---

## 23. Environment Hygiene

### .env.example — Every Variable Documented

```bash
# .env.example — commit this file. Never commit .env.local or .env.*.local

# ─── API ─────────────────────────────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:3000
VITE_API_CLIENT_ID=wallet_pro_web_dev
VITE_API_CLIENT_SECRET=dev_secret_not_privileged

# ─── Application ─────────────────────────────────────────────────────────────
VITE_SITE_URL=http://localhost:5173
VITE_APP_ENV=development       # development | staging | production
VITE_APP_VERSION=              # Injected by CI as git SHA — leave blank locally

# ─── Analytics ───────────────────────────────────────────────────────────────
VITE_GTM_ID=GTM-XXXXXXX
VITE_GA4_ID=G-XXXXXXXXXX

# ─── Observability ───────────────────────────────────────────────────────────
VITE_SENTRY_DSN=              # Leave blank to disable Sentry locally

# ─── E2E (Playwright) ────────────────────────────────────────────────────────
E2E_USER_EMAIL=testuser@walletpro.dev
E2E_USER_PASSWORD=
E2E_ADMIN_EMAIL=testadmin@walletpro.dev
E2E_ADMIN_PASSWORD=
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

### Startup Env Validation with Zod

```typescript
// src/lib/env/validate.ts
import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_BASE_URL:      z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_API_CLIENT_ID:     z.string().min(1),
  VITE_API_CLIENT_SECRET: z.string().min(1),
  VITE_SITE_URL:          z.string().url(),
  VITE_GTM_ID:            z.string().optional(),
  VITE_GA4_ID:            z.string().optional(),
  VITE_SENTRY_DSN:        z.string().url().optional().or(z.literal('')),
  VITE_APP_ENV:           z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_VERSION:       z.string().optional(),
})

function loadEnv() {
  const result = EnvSchema.safeParse({
    VITE_API_BASE_URL:      import.meta.env.VITE_API_BASE_URL,
    VITE_API_CLIENT_ID:     import.meta.env.VITE_API_CLIENT_ID,
    VITE_API_CLIENT_SECRET: import.meta.env.VITE_API_CLIENT_SECRET,
    VITE_SITE_URL:          import.meta.env.VITE_SITE_URL,
    VITE_GTM_ID:            import.meta.env.VITE_GTM_ID,
    VITE_GA4_ID:            import.meta.env.VITE_GA4_ID,
    VITE_SENTRY_DSN:        import.meta.env.VITE_SENTRY_DSN,
    VITE_APP_ENV:           import.meta.env.VITE_APP_ENV,
    VITE_APP_VERSION:       import.meta.env.VITE_APP_VERSION,
  })

  if (!result.success) {
    const issues = result.error.issues
      .map(i => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Environment configuration invalid:\n${issues}`)
  }

  return result.data
}

export const env = loadEnv()
```

---

## 24. Code Examples

### Complete Transfer Flow — All Concerns Integrated

```typescript
// src/features/wallet/hooks/useTransferFlow.ts
import { useState } from 'react'
import { useCreateTransfer }  from './useWallet'
import { useWalletAnalytics } from './useWalletAnalytics'
import { trackBeginCheckout, trackPurchase } from '@analytics/ecommerce'

type Step = 'amount' | 'confirm' | 'complete'

export function useTransferFlow() {
  const [step, setStep]             = useState<Step>('amount')
  const [amountCents, setAmountCents] = useState(0)
  const analytics                   = useWalletAnalytics()
  const { mutate, isPending, error, reset } = useCreateTransfer()

  const goToConfirm = (cents: number) => {
    setAmountCents(cents)
    setStep('confirm')
    trackBeginCheckout(cents, 'transfer')
    analytics.trackTransferInitiated(cents)
  }

  const confirm = (recipientId: string) => {
    mutate({ amountCents, recipientId }, {
      onSuccess: transfer => {
        setStep('complete')
        trackPurchase(transfer.data.id, transfer.data.amountCents, 'transfer')
        analytics.trackTransferCompleted(transfer.data.id, transfer.data.amountCents)
      },
    })
  }

  return { step, amountCents, isPending, error, goToConfirm, confirm, restart: () => { setStep('amount'); reset() } }
}
```

---

## 25. Common Mistakes to Avoid

### Architecture
- Organizing by file type (`/components/`, `/hooks/`) instead of feature domain — breaks at scale
- Importing across feature internals — use barrel exports only
- Putting business logic in JSX components — it belongs in hooks and services
- Using global state for everything — TanStack Query for server state, local state for UI, global only for the thin slice that is truly global

### API & Rails Integration
- Missing `withCredentials: true` — Rails session cookies never sent cross-origin
- Not normalizing errors in the interceptor — each component reinvents error handling inconsistently
- Missing AbortSignal — orphaned requests update unmounted components
- Using raw `response.data` without Zod validation — silent data corruption when Rails schema changes

### Auth
- Storing auth tokens in localStorage — XSS can steal them; use httpOnly cookies or memory
- Not clearing query cache on logout — previous user's data visible to the next user
- UI-only role guards — loader-level `checkRole()` is the only reliable guard

### Performance
- Blanket `React.memo` without profiler evidence — allocation overhead with no benefit
- Lazy-loading the LCP image — directly harms Core Web Vitals
- No virtualization on long lists — 500 DOM nodes for a 10-visible-item list is guaranteed regression
- Default-importing `lodash` — bundles the entire 70kb library

### Security
- `dangerouslySetInnerHTML` without DOMPurify — XSS vector
- Treating `VITE_API_CLIENT_SECRET` as a true secret — it's in the bundle; use it for identification only
- Not stripping sensitive headers before Sentry sends events — PII leak

### Testing
- Not resetting mock adapter between tests — responses bleed across test cases
- Using global queryClient in tests — cache bleeds across test cases
- Skipping tests to meet a deadline — `vitest/no-disabled-tests` ESLint rule prevents this
- Testing implementation details instead of user-observable behavior

### Analytics
- Scattering `dataLayer.push()` in components — goes through `trackEvent()` only
- Tracking PII in event parameters — GA4 terms prohibit it, GDPR requires against it
- Not clearing `{ ecommerce: null }` before purchase events — previous event data bleeds in

### Accessibility
- Using `<div>` or `<span>` as buttons or links — no keyboard support, no screen reader role
- Removing `outline` without a `:focus-visible` replacement — keyboard users lose all position awareness
- Using placeholder text as the sole form label — disappears during input, breaks screen readers
- Not associating error messages to inputs with `aria-describedby` — screen reader users never hear the error
- Not moving focus into modals when they open, or not returning it when they close
- Conditionally mounting `aria-live` regions — they must exist in the DOM from initial page load
- Not managing focus on SPA route changes — React Router navigation is invisible to screen reader users
- Using color alone to communicate state (error, success, status)
- Setting `aria-hidden="true"` on focusable elements — creates ghost focus with no announcement
- Skipping heading levels for visual styling reasons — breaks screen reader heading navigation

> See [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) Section 19 for the complete common mistakes reference.

---

## 26. Final Production Checklist

All items must be green before production promotion.

### TypeScript Baseline
- [ ] `tsconfig.json` has `strict: true` with ALL flags explicit: `noUncheckedIndexedAccess`, `useUnknownInCatchVariables`, `noUnusedLocals`, `noUnusedParameters`
- [ ] `tsconfig.json` paths match `vite.config.ts` aliases exactly
- [ ] `npm run typecheck` (`tsc --noEmit`) is separate from `npm run build`
- [ ] CI runs `typecheck` as a standalone step before build — not inferred from build

### Architecture & Code Quality
- [ ] Feature-sliced structure — no cross-feature internal imports
- [ ] All features export through `index.ts` barrel files only
- [ ] Presentation / state / data layers never cross-contaminate
- [ ] `npm run validate` (typecheck → lint → format → test:coverage) passes clean

### Routing
- [ ] `PublicShell` redirects authenticated users away from login/register
- [ ] `PrivateShell` redirects unauthenticated users to `/login` with `state.from`
- [ ] Login redirects to `state.from` after success
- [ ] `errorElement: <RouteError />` on all route groups
- [ ] `path: '*'` renders `<NotFoundPage />` with `noIndex`
- [ ] Role-gated routes use loader-based `checkRole()` — not UI-level hiding
- [ ] All lazy routes wrapped in `<Suspense fallback={<PageLoader />}>`

### Rails API Client
- [ ] Single Axios instance — all requests flow through it
- [ ] `X-Client-Id` + `X-Client-Secret` in default headers on every request
- [ ] `withCredentials: true` — cross-origin session cookies sent
- [ ] `Accept-Language` header synced with `document.documentElement.lang`
- [ ] CSRF token on all mutating requests (POST/PUT/PATCH/DELETE)
- [ ] 401 interceptor: one refresh → redirect to `/login` on failure
- [ ] 419 interceptor: reload to refresh CSRF token
- [ ] All errors normalized to `AppError` via `normalizeError()`
- [ ] `AbortSignal` passed from TanStack Query `queryFn` to all services

### Zod Validation
- [ ] Zod schemas defined for **all API responses** — no unvalidated `response.data`
- [ ] `validateResponse()` used in all service functions; failures reported to Sentry
- [ ] TypeScript types derived from schemas via `z.infer<>` — no duplicate interfaces
- [ ] Form schemas in `*.schemas.ts` — used by both react-hook-form and API layer

### TanStack Query
- [ ] `QueryClient` configured centrally with intentional `staleTime` and `gcTime`
- [ ] `retry: false` for 4xx errors
- [ ] Query key factory (`*Keys`) per resource — no raw string keys
- [ ] Mutations invalidate related queries on success
- [ ] Fresh `QueryClient` per test via `createWrapper()`

### Auth & Session
- [ ] `useSession()` is the single source of session truth
- [ ] `useLogin()` populates query cache on success — no extra round-trip
- [ ] `useLogout()` cleanup order: analytics → Sentry → token → query cache → Rails API → hard redirect
- [ ] Tokens in memory only — not localStorage
- [ ] Role guard via route loader — not only UI-level

### Global Error Handling
- [ ] `ErrorBoundary` wraps all major feature sections
- [ ] `RouteError` catches loader and component errors; reports to Sentry
- [ ] `installGlobalErrorHandlers()` in `main.tsx` — catches unhandled rejections
- [ ] Error fallbacks are user-safe: no stack traces, no raw error messages
- [ ] Error fallback UIs have `role="alert"` + `aria-live="assertive"`

### Observability
- [ ] `initSentry()` is the first call in `main.tsx` — before React renders
- [ ] `VITE_SENTRY_DSN`, `VITE_APP_ENV`, `VITE_APP_VERSION` set per environment
- [ ] `VITE_APP_VERSION: ${{ github.sha }}` injected in CI build step
- [ ] `setUserContext()` called after login — errors tied to user in Sentry
- [ ] `clearUserContext()` called in logout — no cross-user data in Sentry
- [ ] `beforeSend` strips `Authorization`, `X-Client-Secret`, `X-CSRF-Token`
- [ ] `logger` used instead of `console.log` — all logs become Sentry breadcrumbs
- [ ] `tracesSampleRate: 0.1` in production — not 1.0

### Performance
- [ ] All routes lazy-loaded via `React.lazy()` + `<Suspense>`
- [ ] Lists over 100 items use `@tanstack/react-virtual`
- [ ] `React.memo`, `useMemo`, `useCallback` applied only with profiler evidence
- [ ] Bundle analyzed — no unexpected large chunks (`npm run analyze`)
- [ ] LCP image is NOT lazy-loaded
- [ ] Assets content-hashed (immutable caching)
- [ ] Web Vitals reported to GA4 via `web-vitals` package

### Security
- [ ] No `dangerouslySetInnerHTML` without `DOMPurify.sanitize()`
- [ ] All external URLs validated — `javascript:` and `data:` protocols rejected
- [ ] Auth tokens in memory — not localStorage
- [ ] Query cache, token store, sessionStorage cleared on logout
- [ ] CSP started in report-only mode; violations monitored before enforcement
- [ ] `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` set
- [ ] `Strict-Transport-Security` with `preload` in production
- [ ] `npm audit --audit-level=high` clean in CI
- [ ] No `VITE_` env var contains a true privileged secret

### SEO
- [ ] `react-helmet-async` + `<HelmetProvider>` wrapping app
- [ ] Every public route: unique `<title>`, `<meta name="description">`, canonical URL
- [ ] All authenticated routes: `noIndex={true}`
- [ ] JSON-LD Organization schema on homepage
- [ ] Google Search Console verified + sitemap submitted
- [ ] `RouteChangeTracker` mounted — SPA page views tracked

### i18n
- [ ] `lookupCookie: 'locale'` matches Rails cookie name exactly
- [ ] Only `common` namespace at boot — all others lazy-loaded
- [ ] English bundled statically as fallback (`partialBundledLanguages: true`)
- [ ] All money via `formatCurrency(cents, currency, locale)` — never `toFixed(2)`
- [ ] All dates via `formatDate(date, locale)` — never `toLocaleDateString()` without locale
- [ ] `document.documentElement.lang` + `dir` updated on locale change
- [ ] Rails API `i18n` response bundles injected via `injectTranslations()`

### Analytics
- [ ] GTM snippet is the only direct install in `index.html`
- [ ] Separate GTM containers for dev and production
- [ ] Consent Mode v2 initialized before GTM snippet
- [ ] `RouteChangeTracker` tracking SPA page views correctly
- [ ] `web-vitals` reporting LCP, INP, CLS, FCP, TTFB
- [ ] `identifyUser()` called after login; `clearUser()` before logout API call
- [ ] No PII in any event parameters
- [ ] `{ ecommerce: null }` flushed before every purchase event

### Unit & Integration Tests
- [ ] Every component has `__tests__/*.test.tsx`
- [ ] Every hook has `__tests__/*.test.ts`
- [ ] Every service has `__tests__/*.test.ts`
- [ ] Every bug fix has a regression test
- [ ] No `it.skip` or `describe.skip` without a linked issue
- [ ] Coverage meets thresholds: 80% lines, 80% functions, 75% branches
- [ ] Tests assert user-observable behavior — not implementation details

### E2E Tests
- [ ] Playwright configured for Chromium + Firefox
- [ ] Auth fixture reusable across all authenticated flow tests
- [ ] Critical flows covered: login, logout, auth guard, primary business flow
- [ ] Accessibility test with `@axe-core/playwright` on all public pages
- [ ] `forbidOnly: !!process.env.CI` — test.only blocks CI
- [ ] E2E credentials in GitHub Secrets — not in `.env.example`
- [ ] E2E tests run against built `dist/` artifact

### CI Pipeline
- [ ] 5 jobs: static-analysis, unit-tests, build, e2e, security-audit
- [ ] `concurrency` cancels superseded runs on same branch
- [ ] `dependency-review` workflow on every PR
- [ ] `VITE_APP_VERSION: ${{ github.sha }}` at build time
- [ ] All secrets in GitHub Secrets; non-secret config in GitHub vars
- [ ] `npm audit --audit-level=high` clean in CI

### Pre-commit Gates
- [ ] Husky via `prepare` script — hooks auto-install after `npm install`
- [ ] `pre-commit`: lint-staged (ESLint + Prettier on staged files) + gitleaks secret scan
- [ ] `commit-msg`: commitlint enforces Conventional Commits
- [ ] `pre-push`: full typecheck + lint + test pipeline

### Environment Hygiene
- [ ] `.env.example` committed — every variable documented with description
- [ ] `.env.local` and `.env.*.local` in `.gitignore`
- [ ] `loadEnv()` validates env at startup via Zod — app throws immediately on misconfiguration
- [ ] `VITE_API_CLIENT_SECRET` documented as client identifier, not a privileged secret

### Branding
- [ ] `tokens.css` is the single source for all design values
- [ ] No raw hex, pixel, or font values in component styles
- [ ] Logo imported from one canonical location — never ad-hoc `<img src="logo.png" />`
- [ ] Color contrast: 4.5:1 normal text, 3:1 large text (verified)

### Accessibility
> Full 60-item checklist in [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) Section 20. Mandatory items summarized here.

- [ ] Skip link is the first focusable element on every page; targets `#main-content`
- [ ] Page has `<header>`, `<main id="main-content" tabIndex={-1}>`, and `<footer>` landmark regions
- [ ] Exactly one `<h1>` per page; heading levels are sequential with no skips
- [ ] Every interactive element is reachable and operable via keyboard alone
- [ ] All interactive elements have a visible `:focus-visible` style — `outline: none` never used without replacement
- [ ] Modal/dialog: focus moves inside on open, returns to trigger on close, Tab is trapped within
- [ ] SPA route changes: focus moves to `<main>` and page title updates (`RouteChangeTracker` in place)
- [ ] Every `<img>` has `alt` (descriptive for meaningful images, `""` for decorative)
- [ ] Every SVG icon inside a button is `aria-hidden="true"` and `focusable="false"`
- [ ] Icon-only buttons have `aria-label` or visually hidden text
- [ ] Every form field has a `<label>` with `htmlFor`; no placeholder-only labels
- [ ] Required fields have `aria-required="true"` and a visible indicator
- [ ] Error messages use `aria-describedby` on the input and `role="alert"` for announcement
- [ ] `aria-live` regions mounted from initial page load — never conditionally rendered
- [ ] Loading states use `role="status"` and `aria-busy="true"` with accessible text
- [ ] Error states use `role="alert"` and receive programmatic focus
- [ ] Color is never the sole indicator of status, error, or type
- [ ] Normal text meets 4.5:1 contrast; large text meets 3:1; UI components meet 3:1
- [ ] Font sizes use `rem` — not `px`; UI functional at 200% zoom
- [ ] Animations respect `prefers-reduced-motion`
- [ ] `axe` automated scan passes with zero violations (`jest-axe` in unit tests)
- [ ] Component tested keyboard-only — all actions reachable without a mouse
- [ ] Playwright a11y test present in `e2e/accessibility/`
- [ ] Key flows tested with VoiceOver (macOS) or NVDA (Windows)

---

*React 18 · TypeScript 5 strict · Vite 5 · TanStack Query v5 · react-i18next v14 · Zod v3 · Axios · React Router v6.4 · @sentry/react v8 · web-vitals v4 · react-helmet-async v2 · Playwright v1.44 · Vitest · ESLint · Husky v9 · commitlint · gitleaks · TruffleHog · Rails 8 CORS + Rack::Cors*

*Accessibility: WCAG 2.2 AA · WAI-ARIA 1.2 · APG · jest-axe · @axe-core/playwright · eslint-plugin-jsx-a11y — see [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md)*

---

## 27. Accessibility — Integration with react-accessibility-super-guide.md

### What the Companion Document Covers

Accessibility for users with disabilities is a mandatory engineering requirement of equal standing with type safety, security, and test coverage. The full implementation standard lives in [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) and must be read, understood, and applied by every engineer working on UI in this project.

**The principle is non-negotiable: inaccessible code is incomplete code.**

### What's in the Companion Document

The accessibility guide covers 20 sections with complete React implementations, hooks, patterns, and a 60-item enforcement checklist:

| Section | Content |
|---|---|
| 1–2 | Accessibility principles, POUR model, 15 mandatory rules for all new UI |
| 3 | Semantic HTML, landmark regions, skip links, heading hierarchy |
| 4 | Keyboard navigation contracts, tab order, visible focus, custom widget patterns |
| 5 | Focus management hooks: `useFocusRef`, `usePreviousFocus`, `useFocusTrap`, `useListKeyboardNavigation` |
| 6 | Screen reader support, `VisuallyHidden` component, accessible name computation |
| 7 | Forms — `TextField`, `Fieldset`, `RadioGroup`, `ErrorSummary`, complete login form |
| 8 | Buttons, links, icon buttons, toggle buttons, `aria-disabled` patterns |
| 9 | ARIA rules — usage and restraint, common correct/incorrect patterns |
| 10 | Complete implementations: Modal, Tabs (flat + compound context), Accordion, DropdownMenu, DataTable |
| 11 | Images, icons, SVGs — alt text decision tree, `Icon` component |
| 12 | Color contrast requirements, token values, forced-colors/high-contrast mode |
| 13 | Text resizing in `rem`, reflow rules, `usePrefersReducedMotion` hook |
| 14 | Loading, error, empty, success states — `DataLoader`, `Skeleton`, `ErrorState`, `EmptyState` |
| 15 | Live regions, `LiveRegion` component, `Alert`, `ToastRegion`, page announcements |
| 16 | React-specific patterns: `useId`, `forwardRef`, portal focus, StrictMode idempotency |
| 17 | Reusable component library: Pagination, ProgressBar, SearchField |
| 18 | Testing — `jest-axe`, Testing Library query priority, Playwright a11y tests, screen reader procedure |
| 19 | 30+ common mistakes by category with explanations |
| 20 | Mandatory enforcement checklist + 12 AI agent enforcement rules |

### How This Guide and the Accessibility Guide Work Together

This master guide owns: architecture, API, data layer, auth, performance, observability, SEO, i18n, analytics, branding, testing infrastructure, CI, and environment.

The accessibility guide owns: the complete WCAG 2.2 AA standard, every ARIA pattern, every focus management hook, keyboard contracts, screen reader testing, and the enforcement checklist for individual components and pages.

They share: the same components (`Button`, `FormField`), the same testing stack (`Vitest`, `jest-axe`, `Playwright`), the same ESLint config (`eslint-plugin-jsx-a11y` is already in the master `.eslintrc.cjs`), and the same CI pipeline (accessibility tests run in the same `e2e` job).

### How to Apply Accessibility in Daily Development

**When building a new component:**
1. Start with a native HTML element — ask "does `<button>`, `<a>`, `<input>`, `<select>`, or `<table>` already do this?"
2. Apply the Five-Property Contract from Section 4 of this guide
3. Before marking the component done, run the [Section 20 checklist](./documents/react-accessibility-super-guide.md#20-mandatory-enforcement-checklist)

**When building a new page or route:**
1. Include `<SEO>` with `noIndex` correctly set (Section 14 of this guide)
2. Ensure `<SkipLink>` is first focusable element (accessibility guide Section 3)
3. Ensure `<h1>` is present and heading levels are logical
4. Ensure `RouteChangeTracker` or `AccessiblePage` moves focus on navigation (accessibility guide Section 5)

**When building a form:**
1. Use `TextField`, `Fieldset`, `RadioGroup` from the accessibility guide Section 7
2. Use `ErrorSummary` for multi-field validation
3. Never use placeholder as a label

**When building a modal, dialog, or overlay:**
1. Use `useFocusTrap` + `usePreviousFocus` + `useFocusRef` (accessibility guide Section 5)
2. Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
3. Handle Escape key to close

**Before any PR is merged:**
- `jest-axe` passes: zero violations
- Keyboard pass completed: all interactions work without a mouse
- Screen reader tested for new patterns

### Quick Reference — The 12 AI Agent Enforcement Rules

From [`documents/react-accessibility-super-guide.md`](./documents/react-accessibility-super-guide.md) Section 20, these apply to every generated React component:

1. **Use semantic HTML first.** `<button>`, `<nav>`, `<main>`, `<table>` before any `<div>` with ARIA.
2. **Never output `outline: none`** without an immediate `:focus-visible` replacement.
3. **Never output `<img>` without `alt`.** Decorative: `alt=""`. Meaningful: descriptive text.
4. **Never output an icon-only `<button>`** without `aria-label` or visually hidden text.
5. **Never output `<label>` without `htmlFor`**, or a form field without a label.
6. **Always include `aria-describedby` on form fields** when an error message is present.
7. **Always include `role="alert"`** on error messages that appear dynamically.
8. **Never output `aria-hidden="true"` on focusable elements.**
9. **Always mount `aria-live` regions in the initial DOM** — never conditionally render them.
10. **Always include focus management** when building modals, drawers, dialogs, or route-level changes.
11. **Never add redundant ARIA** to native semantic HTML elements.
12. **Run the enforcement checklist** before marking any component complete.
