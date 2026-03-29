# Front-End Asset Performance Guide

## React + Vite + Bootstrap — Production Implementation

> **Philosophy:** Optimize by omission first, then optimize delivery second. Fewer Bootstrap imports, fewer JS dependencies, fewer fonts, fewer third-party tags, fewer image bytes — then smart caching, compression, and CDN on top. This produces the best real-user metrics and the least brittle build.

---

## Table of Contents

1. [Architecture Strategy](#1-architecture-strategy)
2. [CSS Optimization](#2-css-optimization)
3. [JavaScript Optimization](#3-javascript-optimization)
4. [Image and Media Optimization](#4-image-and-media-optimization)
5. [Font and Icon Optimization](#5-font-and-icon-optimization)
6. [Delivery and Caching](#6-delivery-and-caching)
7. [Security Best Practices](#7-security-best-practices)
8. [Vite Implementation](#8-vite-implementation)
9. [Code Examples](#9-code-examples)
10. [Final Validation Checklist](#10-final-validation-checklist)

---

## 1. Architecture Strategy

### Asset Ownership Rule

Use `src/` for anything that benefits from bundling, hashing, transforms, tree-shaking, or code ownership. Use `public/` only for assets that must keep a fixed URL or exact name — `robots.txt`, `favicon.ico`, web app manifests, and platform verification files.

Vite serves `public/` files as-is and copies them without transform. Imported assets in source code get rewritten correctly for production, receive content hashes, and benefit from dead-code elimination.

### Recommended Project Structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── assets/
│   ├── fonts/
│   │   └── inter-latin-var.woff2        # Subsetted, self-hosted WOFF2 only
│   ├── icons/
│   │   ├── ui/                          # SVG sprites or React SVG components
│   │   └── brands/
│   ├── images/
│   │   ├── hero/
│   │   ├── content/
│   │   └── placeholders/
│   └── scss/
│       ├── abstracts/
│       │   ├── _tokens.scss             # Design tokens (no CSS output)
│       │   └── _mixins.scss
│       ├── base/
│       │   ├── _reset.scss
│       │   └── _typography.scss
│       ├── components/
│       │   ├── _buttons.scss
│       │   ├── _cards.scss
│       │   └── _navbar.scss
│       ├── layouts/
│       │   └── _grid.scss
│       ├── utilities/
│       │   └── _helpers.scss
│       ├── vendor/
│       │   └── _bootstrap.scss          # Selective Bootstrap partials only
│       └── theme.scss                   # Single SCSS entry point
├── components/
│   ├── common/
│   └── layout/
├── features/                            # Route-colocated feature assets
│   ├── home/
│   ├── pricing/
│   └── dashboard/
├── routes/                              # Route entry points (code-split here)
│   ├── HomePage.tsx
│   ├── PricingPage.tsx
│   └── DashboardPage.tsx
├── hooks/
├── lib/
│   ├── bootstrap.ts                     # Per-component Bootstrap JS imports
│   ├── analytics.ts
│   └── security.ts
└── main.tsx
public/
├── favicon.ico
├── robots.txt
└── site.webmanifest
```

### Key Architectural Principles

**Treat Bootstrap as a dependency, not a framework.** Import only the SCSS partials and JS modules your project actually uses. This enables tree-shaking at both the CSS and JS levels.

**One clear asset owner per file.** Your global design system lives in `assets/scss` and `assets/fonts`. Route-specific or feature-specific styles, images, and JS stay colocated with the feature — this allows lazy-loading to pull them together and makes deletions safe.

**Pages are the natural code-split boundary.** Each route-level component becomes a dynamic import, giving Vite a clean chunking boundary that aligns CSS and JS splitting.

---

## 2. CSS Optimization

### Best Default Approach

Ship one main theme stylesheet for the global shell and design system. Let route- or feature-specific CSS load with async JS chunks via Vite's automatic CSS code splitting. Vite keeps CSS imported by async JS chunks in separate CSS files and fetches them alongside those chunks — exactly the right behavior for non-critical page styles.

### Bootstrap Selective Import Strategy

**Never** import the full compiled Bootstrap CSS unless you genuinely use most of it. Import only the Sass partials you need and override variables _before_ any component imports.

```scss
/* src/assets/scss/vendor/_bootstrap.scss */

/* 1. Required Bootstrap foundations */
@import 'bootstrap/scss/functions';

/* 2. Override variables BEFORE importing the rest */
$primary: #0d6efd;
$border-radius: 0.625rem;
$enable-dark-mode: false;
$enable-rounded: true;
$enable-shadows: false;
$enable-gradients: false;

/* 3. Required configuration — always needed */
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/variables-dark';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/root';

/* 4. Include only what you actually use */
@import 'bootstrap/scss/reboot';
@import 'bootstrap/scss/type';
@import 'bootstrap/scss/containers';
@import 'bootstrap/scss/grid';
@import 'bootstrap/scss/helpers';
@import 'bootstrap/scss/utilities';

@import 'bootstrap/scss/buttons';
@import 'bootstrap/scss/forms';
@import 'bootstrap/scss/navbar';
@import 'bootstrap/scss/dropdown';
@import 'bootstrap/scss/card';
@import 'bootstrap/scss/modal';
/* Add further partials only as needed */

/* 5. Generate utility classes — must come last */
@import 'bootstrap/scss/utilities/api';
```

```scss
/* src/assets/scss/theme.scss — single entry point */
@import './vendor/bootstrap';
@import './abstracts/tokens';
@import './base/reset';
@import './base/typography';
@import './components/buttons';
@import './components/cards';
@import './components/navbar';
@import './utilities/helpers';
```

### Removing Unused CSS

The safest approach to removing unused CSS is **not generating it in the first place**. Start with selective Sass imports and keep feature-specific CSS colocated with lazy routes.

If you add a PurgeCSS step for app-specific CSS, always safelist dynamically generated classes — aggressive purging can silently break conditional Bootstrap utility classes and CMS-driven markup.

```javascript
// postcss.config.js
export default {
  plugins: {
    '@fullhuman/postcss-purgecss': {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [/^col-/, /^btn-/, /^modal/, /^collapse/, /^show/, /^fade/, /^d-/],
        deep: [/^tooltip/, /^popover/],
      },
    },
    autoprefixer: {},
  },
}
```

> **Trade-off:** PurgeCSS can remove dynamically generated classes (e.g., `col-${size}`, classes added via JS). Always test with E2E tests after enabling it, and maintain a thorough safelist.

### Critical CSS

Inline only a **tiny** amount of critical CSS — enough for the shell, header, hero layout, and skeleton states. Keep it small: large inline CSS is uncached and bloats every HTML response.

```html
<!-- index.html -->
<head>
  <style>
    /* Minimal shell — aim for < 2KB */
    :root {
      --header-h: 72px;
      --brand: #0d6efd;
    }
    html {
      font-family: system-ui, sans-serif;
    }
    body {
      margin: 0;
    }
    .app-shell {
      min-height: 100vh;
    }
    .site-header {
      min-height: var(--header-h);
    }
    .hero {
      min-height: 60vh;
      display: grid;
      place-items: center;
    }
    .page-skeleton {
      min-height: 100vh;
      background: #fff;
    }
  </style>
</head>
```

For automation, use `vite-plugin-critters` to extract and inline critical CSS at build time:

```javascript
// vite.config.ts
import { critters } from 'vite-plugin-critters';
plugins: [react(), critters({ preload: 'swap' })],
```

### Preventing Render-Blocking CSS

For your main theme stylesheet, the best default is still a **normal stylesheet link** — your core CSS is render-critical, so treat it as such. Reserve async-loading tricks for clearly non-critical CSS: marketing widgets, below-fold carousels, or admin sections users rarely visit.

```html
<!-- For truly non-critical stylesheets only -->
<link
  rel="preload"
  href="/assets/non-critical.[hash].css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="/assets/non-critical.[hash].css" /></noscript>
```

> **Common mistake:** Async-loading your main stylesheet just to improve a synthetic Lighthouse score. The score may improve in one audit while real users experience worse first paint or flash-of-unstyled-content.

### Minification

Use Lightning CSS for the fastest, smallest CSS output:

```javascript
// vite.config.ts
build: {
  cssMinify: 'lightningcss',
},
css: {
  transformer: 'lightningcss',
  lightningcss: {
    drafts: { customMedia: true },
  },
},
```

---

## 3. JavaScript Optimization

### Entry Point Setup

Import the main theme once from your app entry and let Vite emit the correct stylesheet link in production:

```tsx
// src/app/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/assets/scss/theme.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Bootstrap JS — Tree Shaking

Import only the Bootstrap JS plugins you actually use. Never import the full `bootstrap` package unless you need every component.

```typescript
// src/lib/bootstrap.ts
import Collapse from 'bootstrap/js/dist/collapse'
import Dropdown from 'bootstrap/js/dist/dropdown'
import Modal from 'bootstrap/js/dist/modal'

export function initBootstrap() {
  document
    .querySelectorAll('[data-bs-toggle="dropdown"]')
    .forEach((el) => Dropdown.getOrCreateInstance(el))

  document.querySelectorAll('.collapse').forEach((el) => Collapse.getOrCreateInstance(el))

  document.querySelectorAll('.modal').forEach((el) => Modal.getOrCreateInstance(el))
}
```

### Code Splitting and Lazy Loading

Declare lazy components at **module scope** — never inside render functions. Wrap every lazy component in a `Suspense` boundary with a meaningful fallback.

```tsx
// src/app/router.tsx
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import PageSkeleton from '@/components/common/PageSkeleton'

const HomePage = lazy(() => import('@/routes/HomePage'))
const PricingPage = lazy(() => import('@/routes/PricingPage'))
const DashboardPage = lazy(() => import('@/routes/DashboardPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'pricing',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <PricingPage />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <DashboardPage />
          </Suspense>
        ),
      },
    ],
  },
])
```

### General Tree-Shaking Rules

- Use named imports: `import { debounce } from 'lodash-es'` not `import _ from 'lodash'`
- Prefer `date-fns` over `moment.js` — built for tree-shaking
- Prefer `lodash-es` over `lodash` — ESM build is fully tree-shakeable
- Check that dependencies declare `"sideEffects": false` in their `package.json`
- Ensure your own packages also declare `"sideEffects": false`

### Dynamic Imports for Heavy Features

```typescript
// src/lib/featureLoader.ts
export async function loadMapsFeature() {
  const [{ initMap }, { default: mapboxgl }] = await Promise.all([
    import('@/features/maps/initMap'),
    import('mapbox-gl'),
  ])
  return { initMap, mapboxgl }
}
```

### Deferring Non-Critical Scripts

Module scripts (`type="module"`) are deferred automatically by the browser. For analytics and third-party tags, defer until after consent, after idle, or after first interaction:

```typescript
// src/lib/analytics.ts
export async function loadAnalytics() {
  if (!import.meta.env.PROD) return

  requestIdleCallback?.(
    async () => {
      await import('@/vendor/analytics')
    },
    { timeout: 2000 },
  )
}
```

For classic third-party tags:

```html
<!-- Independent scripts with no ordering dependency -->
<script src="https://third-party.example.com/widget.js" async></script>

<!-- Scripts that depend on DOM being ready -->
<script src="https://third-party.example.com/tag.js" defer></script>
```

### Reducing Bundle Size

- Analyze bundles in CI — regressions are far cheaper to catch before deployment
- Prefer native browser APIs over libraries where the API surface is small
- Keep route-local dependencies inside route files so Vite can split them out
- Avoid over-fragmenting with `manualChunks` — a few stable splits are useful, but too many create excessive requests and dependency edges

```bash
# Add to package.json scripts
"analyse": "vite build --mode analyse"
```

---

## 4. Image and Media Optimization

### Format Decision

| Format   | Use case                              | Notes                                                              |
| -------- | ------------------------------------- | ------------------------------------------------------------------ |
| **AVIF** | Photos, hero images                   | ~50% smaller than WebP. 95%+ browser support (2025). First choice. |
| **WebP** | Photos, fallback                      | ~30% smaller than JPEG/PNG. Universal fallback for AVIF.           |
| **SVG**  | Icons, logos, illustrations           | Inline in HTML for critical icons — eliminates HTTP request.       |
| **PNG**  | Screenshots, transparency-critical UI | Only when SVG is not suitable.                                     |
| **JPEG** | Legacy fallback                       | Only as `<img src>` last resort inside `<picture>`.                |

> **Rule:** Never ship the original upload to the browser. Always compress and resize at source or via CDN.

### Responsive Image Implementation

```tsx
// src/components/common/HeroImage.tsx — LCP candidate
export function HeroImage() {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet="
          /images/hero/hero-640.avif   640w,
          /images/hero/hero-960.avif   960w,
          /images/hero/hero-1280.avif 1280w,
          /images/hero/hero-1920.avif 1920w
        "
        sizes="100vw"
      />
      <source
        type="image/webp"
        srcSet="
          /images/hero/hero-640.webp   640w,
          /images/hero/hero-960.webp   960w,
          /images/hero/hero-1280.webp 1280w,
          /images/hero/hero-1920.webp 1920w
        "
        sizes="100vw"
      />
      <img
        src="/images/hero/hero-1280.jpg"
        alt="Product hero"
        width="1920"
        height="1080"
        fetchPriority="high"
        decoding="async"
        className="img-fluid"
        /* Never use loading="lazy" on your LCP image */
      />
    </picture>
  )
}
```

```tsx
// src/components/common/ContentImage.tsx — below-fold image
export function ContentImage() {
  return (
    <img
      src="/images/content/article-960.webp"
      srcSet="
        /images/content/article-480.webp  480w,
        /images/content/article-960.webp  960w,
        /images/content/article-1440.webp 1440w
      "
      sizes="(min-width: 1200px) 960px, 100vw"
      alt="Article illustration"
      width="1440"
      height="810"
      loading="lazy"
      decoding="async"
      className="img-fluid rounded-3"
    />
  )
}
```

### Lazy Loading Rules

- **Never** lazy-load your LCP image — it delays the metric Lighthouse weights most heavily
- For the hero/LCP image: `fetchpriority="high"` with no `loading` attribute (defaults to eager)
- For all below-fold images: `loading="lazy"` + `decoding="async"`
- Always provide `width` and `height` attributes — this reserves layout space and prevents CLS

### Placeholder Techniques

Best default: a simple aspect-ratio box with a dominant-color background or a tiny blur placeholder. Fancy placeholder systems are often more code than value on small- to medium-sized sites.

```tsx
// Simple blur-up pattern
import { useState } from 'react'

const LazyImage = ({ src, placeholder, alt, width, height }) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ aspectRatio: `${width}/${height}`, background: '#f0f0f0' }}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
          backgroundImage: `url(${placeholder})`,
          backgroundSize: 'cover',
        }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
```

### Build-Time Image Compression

```typescript
// vite.config.ts — vite-plugin-imagemin
import viteImagemin from 'vite-plugin-imagemin';

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    mozjpeg:  { quality: 80 },
    optipng:  { optimizationLevel: 7 },
    pngquant: { quality: [0.8, 0.9], speed: 4 },
    svgo: {
      plugins: [{ name: 'removeViewBox', active: false }],
    },
    webp: { quality: 80 },
    avif: { quality: 70 },
  }),
],
```

### CDN Recommendations

For most projects, a CDN with on-the-fly AVIF/WebP conversion (Cloudflare Images, Imgix, Bunny.net) replaces manual compression entirely — request format and size via URL parameters. For static sites, Cloudflare's free CDN tier provides Brotli, HTTP/3, and global PoPs with zero configuration.

---

## 5. Font and Icon Optimization

### Font Loading Best Practices

1. **Self-host** fonts to eliminate third-party DNS lookups, preconnect overhead, and GDPR concerns
2. **Subset** fonts to only the scripts and characters you actually use — full Inter is ~500KB; Latin subset is ~30KB
3. Use a **variable font** (one WOFF2 file covers all weights) when available
4. **Preload only the font used in above-the-fold text** — preloading too many fonts wastes bandwidth

### Preload Strategy

```html
<!-- index.html — in <head>, before any CSS -->

<!-- Step 1: Warm connections to any external font origin (if not self-hosting) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Step 2: Preload your critical self-hosted WOFF2 — crossorigin is required even for same-origin -->
<link
  rel="preload"
  href="/fonts/inter-latin-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
```

> **Important:** Always include `crossorigin` when preloading fonts, even for self-hosted fonts. Fonts are CORS resources and the browser will make a second request without this attribute.

### Font-Face Declaration

```scss
/* src/assets/scss/base/_typography.scss */

@font-face {
  font-family: 'InterVariable';
  src: url('/fonts/inter-latin-var.woff2') format('woff2');
  font-weight: 100 900; /* Variable font — covers all weights */
  font-style: normal;
  font-display: swap; /* Show fallback immediately; swap when loaded */
  unicode-range: U+0000-00FF; /* Latin only — skip ranges you don't need */
}

:root {
  --font-sans:
    'InterVariable', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

### Font-Display Recommendations

| Value      | Best for                               | Trade-off                                             |
| ---------- | -------------------------------------- | ----------------------------------------------------- |
| `swap`     | **Default for body text**              | Eliminates invisible text; may cause brief FOUT       |
| `optional` | Performance-first / brand not critical | No layout jank; users may stay on fallback fonts      |
| `block`    | Icon fonts only                        | Invisible text for up to 3s — never use for body text |

### Eliminating Layout Shift from Font Swap

Use `size-adjust` and metric overrides so the fallback font dimensions match your custom font exactly:

```scss
/* Declare a size-adjusted fallback to match InterVariable metrics */
@font-face {
  font-family: 'InterVariable Fallback';
  src: local('Arial');
  ascent-override: 90.2%;
  descent-override: 22.48%;
  line-gap-override: 0%;
  size-adjust: 107.4%;
}

body {
  font-family: 'InterVariable', 'InterVariable Fallback', system-ui, sans-serif;
}
```

### Font Subsetting

```bash
# Install glyphhanger
npm i -g glyphhanger

# Subset for Latin + common numerals/punctuation
glyphhanger https://yoursite.com \
  --subset=*.ttf \
  --formats=woff2 \
  --whitelist=U+0020-007E
```

### Icon Strategy

| Approach                        | When to use                            | Notes                                                                   |
| ------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| **Inline SVG React components** | Critical UI icons (nav, buttons, CTAs) | Zero HTTP request; full CSS control; best for above-fold                |
| **SVG sprite**                  | Repeated icons across many components  | One cacheable file; reference via `<use href="#icon-name">`             |
| **`lucide-react`**              | General icon library                   | Tree-shakeable; only imported icons appear in bundle                    |
| **Icon fonts**                  | Never for new builds                   | Cause layout shift, accessibility issues, and unnecessary HTTP requests |

---

## 6. Delivery and Caching

### Cache Header Strategy

The key insight: HTML must revalidate frequently so deploys show up immediately, while hashed subresources can be cached forever.

```nginx
# Nginx configuration

location /assets/ {
  # Vite outputs content-hashed filenames — safe to cache forever
  add_header Cache-Control "public, max-age=31536000, immutable";
  gzip_static  on;
  brotli_static on;
}

location / {
  # HTML must always revalidate — this forces the browser to fetch fresh HTML
  # which then references the correct new hashed asset filenames
  add_header Cache-Control "no-cache";
  add_header ETag "...";
}
```

```http
# Summary of recommended headers per asset type

# HTML documents
Cache-Control: no-cache
ETag: "abc123"

# Hashed JS, CSS, fonts, images (/assets/* path)
Cache-Control: public, max-age=31536000, immutable

# Compression
Content-Encoding: br
Vary: Accept-Encoding
```

> **Critical mistake:** Never set long cache headers on `index.html`. If you do, users get stale HTML pointing to old asset hashes — breaking the app silently until their cache expires.

### Content-Hashed Filenames

Vite outputs hashed filenames automatically in production. Configure explicit output patterns:

```typescript
// vite.config.ts
rollupOptions: {
  output: {
    entryFileNames: 'assets/js/[name]-[hash].js',
    chunkFileNames: 'assets/js/[name]-[hash].js',
    assetFileNames: ({ name }) => {
      if (!name) return 'assets/misc/[name]-[hash][extname]';
      if (/\.(css)$/i.test(name))           return 'assets/css/[name]-[hash][extname]';
      if (/\.(woff2?|ttf|otf)$/i.test(name)) return 'assets/fonts/[name]-[hash][extname]';
      if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(name)) return 'assets/images/[name]-[hash][extname]';
      return 'assets/misc/[name]-[hash][extname]';
    },
  },
},
```

### Compression

Serve Brotli for all modern browsers, gzip as fallback. Never compress already-compressed formats (most images, audio, video).

```typescript
// vite.config.ts — pre-compress at build time
import compression from 'vite-plugin-compression';

plugins: [
  compression({ algorithm: 'brotliCompress', ext: '.br', deleteOriginFile: false, filter: /\.(js|mjs|json|css|html|svg)$/i }),
  compression({ algorithm: 'gzip',           ext: '.gz', deleteOriginFile: false, filter: /\.(js|mjs|json|css|html|svg)$/i }),
],
```

> Brotli typically compresses text assets 15–25% smaller than gzip. Enable it at the CDN or server layer — your platform needs to serve the `.br` file when the browser sends `Accept-Encoding: br`.

### Resource Hints

Use sparingly — overusing connection hints steals bandwidth from actually critical resources.

```html
<!-- index.html -->

<!-- Preconnect: warm DNS + TLS for known critical third-party origins -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://api.example.com" />

<!-- Preload: fetch truly critical late-discovered resources -->
<!-- Use only for: critical font, LCP image, main JS module (Vite does this automatically) -->
<link
  rel="preload"
  href="/fonts/inter-latin-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>

<!-- Prefetch: download likely next-page chunks during browser idle -->
<link rel="prefetch" href="/assets/js/dashboard-[hash].js" />

<!-- DNS-prefetch: low-cost hint for lower-priority origins -->
<link rel="dns-prefetch" href="https://cdn.example.com" />
```

---

## 7. Security Best Practices

### Asset Loading Philosophy

Self-host first-party CSS, JS, fonts, and icons whenever licensing allows. Every third-party asset adds supply-chain, privacy, performance, and outage risk. CSP exists specifically to restrict where code and resources may load from.

### Content Security Policy (CSP)

```http
Content-Security-Policy:
  default-src    'self';
  base-uri       'self';
  object-src     'none';
  script-src     'self' 'nonce-{RANDOM_NONCE}' 'strict-dynamic';
  style-src      'self' 'nonce-{RANDOM_NONCE}';
  img-src        'self' data: https:;
  font-src       'self';
  connect-src    'self' https://api.example.com;
  frame-src      https://www.youtube-nocookie.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

**Nonce implementation:** Generate a fresh cryptographically random nonce per request server-side. Inject it into `index.html` and the CSP header simultaneously. This is the only safe way to allow inline scripts without `'unsafe-inline'`.

> **Trade-off:** If you inline critical CSS, `style-src` must allow it via a nonce or hash. Runtime style injection (heavy CSS-in-JS) makes CSP significantly harder — plain Sass/CSS is a cleaner fit for performance-sensitive sites.

### Subresource Integrity (SRI)

Use SRI only for assets loaded from third-party CDN origins. If you self-host all assets (the recommended approach), SRI is unnecessary — same-origin delivery and your deployment pipeline already control integrity.

```html
<!-- Only when loading from external CDNs -->
<script
  src="https://cdn.example.com/widget.min.js"
  integrity="sha384-BASE64_HASH_HERE"
  crossorigin="anonymous"
  async
></script>
```

Generate SRI hashes:

```bash
openssl dgst -sha384 -binary file.js | openssl base64 -A
# Or use https://www.srihash.org
```

Use `vite-plugin-sri` to automate hash injection for any CDN-loaded assets.

### Reducing Third-Party Script Risk

- Load third-party scripts only when they create clear, measurable business value
- Prefer `async` for truly independent scripts with no ordering dependency
- Use facade components for video embeds, chat widgets, and maps — load the real script only on user interaction
- Sandbox third-party iframes with the `sandbox` attribute
- Proxy analytics through your own domain to enforce CSP and reduce adblocker interference

```html
<!-- Facade pattern for third-party embeds -->
<div id="chat-facade" onclick="loadChat()" style="cursor:pointer">Chat with us →</div>
<script>
  function loadChat() {
    // Load the real chat widget only on click
    import('@/vendor/chat-widget').then((m) => m.init())
  }
</script>
```

### General Front-End Hardening

```http
# Additional security headers

Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=()
```

```tsx
// Avoid dangerouslySetInnerHTML with untrusted content — React docs warn explicitly
// If you must use it, sanitize first:
import DOMPurify from 'dompurify'
;<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

- Add `rel="noopener noreferrer"` to all `target="_blank"` links
- Never ship public source maps unless needed for error reporting — use `sourcemap: 'hidden'` and private upload to your error tracker
- Disable MIME sniffing with `X-Content-Type-Options: nosniff`

---

## 8. Vite Implementation

### Complete Production `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import { critters } from 'vite-plugin-critters'
import viteImagemin from 'vite-plugin-imagemin'

const analyze = process.env.ANALYZE === 'true'

export default defineConfig({
  plugins: [
    // React Fast Refresh + JSX transform
    react(),

    // Critical CSS inlining — inlines above-fold CSS, async-loads the rest
    critters({ preload: 'swap' }),

    // Pre-compress text assets at build time
    // Your server/CDN serves .br when browser sends Accept-Encoding: br
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
    }),

    // Build-time image optimisation
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      optipng: { optimizationLevel: 7 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [{ name: 'removeViewBox', active: false }],
      },
      webp: { quality: 80 },
      avif: { quality: 70 },
    }),

    // Bundle analyser — only in analyse mode (ANALYZE=true npm run build)
    analyze &&
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': '/src' },
  },

  css: {
    devSourcemap: false,

    // Use Lightning CSS for faster builds and smaller output
    transformer: 'lightningcss',
    lightningcss: {
      drafts: { customMedia: true },
    },

    preprocessorOptions: {
      scss: {
        // Inject design tokens into every SCSS file automatically
        additionalData: `@use "@/assets/scss/abstracts/tokens" as *;`,
      },
    },
  },

  build: {
    target: 'es2020', // Modern browsers — smaller transpilation output
    minify: 'oxc', // Fastest; use 'terser' for marginally smaller output
    cssMinify: 'lightningcss',
    cssCodeSplit: true, // Per-chunk CSS — critical for lazy-loaded routes
    sourcemap: false, // Use 'hidden' if your error pipeline needs it
    manifest: true, // For backend-rendered HTML integrations
    assetsInlineLimit: 4096, // Keep small — don't raise casually
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Content-hashed filenames enable long-term caching
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (!name) return 'assets/misc/[name]-[hash][extname]'
          if (/\.(css)$/i.test(name)) return 'assets/css/[name]-[hash][extname]'
          if (/\.(woff2?|ttf|otf)$/i.test(name))
            return 'assets/fonts/[name]-[hash][extname]'
          if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(name))
            return 'assets/images/[name]-[hash][extname]'
          return 'assets/misc/[name]-[hash][extname]'
        },

        // Stable vendor splits — do not over-fragment
        manualChunks(id) {
          if (/node_modules\/(react|react-dom)/.test(id)) return 'react-vendor'
          if (id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/bootstrap')) return 'bootstrap'
          if (id.includes('/src/features/dashboard/')) return 'dashboard'
          if (id.includes('/src/vendor/analytics')) return 'analytics'
        },
      },
    },
  },
})
```

### Plugin Reference

| Plugin                     | Purpose                       | Notes                                     |
| -------------------------- | ----------------------------- | ----------------------------------------- |
| `@vitejs/plugin-react`     | React Fast Refresh, JSX       | Default React integration                 |
| `vite-plugin-critters`     | Critical CSS inlining         | Extracts and inlines above-fold CSS       |
| `vite-plugin-compression`  | Brotli + gzip pre-compression | Serve `.br`/`.gz` from CDN/server         |
| `vite-plugin-imagemin`     | Build-time image compression  | Runs only on `vite build`                 |
| `rollup-plugin-visualizer` | Bundle analysis treemap       | Always gate behind env flag               |
| `vite-plugin-sri`          | SRI hash injection            | Only needed if loading from external CDNs |

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "analyse": "ANALYZE=true vite build"
  }
}
```

---

## 9. Code Examples

### Optimised `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- 1. Minimal inline critical CSS (shell only, < 2KB) -->
    <style>
      :root {
        --header-h: 72px;
      }
      html {
        font-family: system-ui, sans-serif;
      }
      body {
        margin: 0;
      }
      .app-shell {
        min-height: 100vh;
      }
      .site-header {
        min-height: var(--header-h);
      }
      .page-skeleton {
        min-height: 100vh;
        background: #fff;
      }
    </style>

    <!-- 2. Preload critical font BEFORE any stylesheet -->
    <link
      rel="preload"
      href="/fonts/inter-latin-var.woff2"
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    />

    <!-- 3. Warm connections to critical third-party origins -->
    <link rel="preconnect" href="https://api.example.com" />
    <link rel="dns-prefetch" href="https://cdn.example.com" />

    <!-- 4. Main CSS — Vite injects this with hashed filename automatically -->
    <!-- critters plugin will inline critical CSS above and async-load the rest -->

    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <!--
    Vite injects: <script type="module" src="/assets/js/main-[hash].js">
    type="module" is deferred automatically — no defer attribute needed
  --></body>
</html>
```

### Lazy-Loaded React Component with Error Boundary

```tsx
// src/components/common/LazyWrapper.tsx
import { lazy, Suspense, Component, ReactNode } from 'react'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-danger" role="alert">
          Failed to load this section. Please refresh the page.
        </div>
      )
    }
    return this.props.children
  }
}

export function lazyLoad<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
) {
  const LazyComponent = lazy(importFn)

  return function LazyWrapper(props: T) {
    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="d-flex justify-content-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// Usage
const Dashboard = lazyLoad(() => import('@/routes/DashboardPage'))
const Testimonials = lazyLoad(() => import('@/features/home/Testimonials'))
```

### Prefetch on Hover Pattern

```tsx
// src/components/layout/NavLink.tsx
import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'

const PricingPage = lazy(() => import('@/routes/PricingPage'))

export function NavLink() {
  // Trigger the dynamic import on hover — the chunk starts downloading
  // before the user clicks, so navigation feels instant
  const prefetch = () => {
    import('@/routes/PricingPage')
  }

  return (
    <Link to="/pricing" onMouseEnter={prefetch} onFocus={prefetch}>
      Pricing
    </Link>
  )
}
```

### Dynamic Import for Heavy Features

```tsx
// src/features/analytics/AnalyticsChart.tsx
import { useState } from 'react'

export function AnalyticsChart({ data }) {
  const [Chart, setChart] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(false)

  const loadChart = async () => {
    setLoading(true)
    const { default: ChartComponent } = await import('./ChartComponent')
    setChart(() => ChartComponent)
    setLoading(false)
  }

  return (
    <div>
      {!Chart && (
        <button className="btn btn-primary" onClick={loadChart} disabled={loading}>
          {loading ? 'Loading…' : 'Show Chart'}
        </button>
      )}
      {Chart && <Chart data={data} />}
    </div>
  )
}
```

### Complete Font Loading (SCSS + HTML)

```scss
/* src/assets/scss/base/_typography.scss */

/* 1. Size-adjusted fallback — eliminates CLS during font swap */
@font-face {
  font-family: 'InterVariable Fallback';
  src: local('Arial');
  ascent-override: 90.2%;
  descent-override: 22.48%;
  line-gap-override: 0%;
  size-adjust: 107.4%;
}

/* 2. Custom font declaration */
@font-face {
  font-family: 'InterVariable';
  src: url('/fonts/inter-latin-var.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF;
}

/* 3. Apply with full fallback chain */
:root {
  --font-sans:
    'InterVariable', 'InterVariable Fallback', system-ui, -apple-system, sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

### Optimised Responsive Image Component

```tsx
// src/components/common/OptimisedImage.tsx
interface OptimisedImageProps {
  src: string
  avifSrcSet?: string
  webpSrcSet?: string
  sizes?: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}

export function OptimisedImage({
  src,
  avifSrcSet,
  webpSrcSet,
  sizes = '100vw',
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimisedImageProps) {
  return (
    <picture>
      {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    </picture>
  )
}

// LCP hero — priority flag prevents lazy loading
// <OptimisedImage
//   src="/images/hero/hero-1280.jpg"
//   avifSrcSet="/images/hero/hero-640.avif 640w, /images/hero/hero-1280.avif 1280w"
//   webpSrcSet="/images/hero/hero-640.webp 640w, /images/hero/hero-1280.webp 1280w"
//   sizes="100vw"
//   alt="Hero"
//   width={1280} height={720}
//   priority
// />
```

### Non-Critical Analytics Loader

```typescript
// src/lib/analytics.ts
export async function loadAnalytics(): Promise<void> {
  // Never load in development
  if (!import.meta.env.PROD) return

  // Load after consent check (implement your own consent logic)
  const hasConsent = document.cookie.includes('analytics_consent=true')
  if (!hasConsent) return

  // Wait for browser idle — do not compete with critical rendering
  const load = async () => {
    await import('@/vendor/analytics')
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 2000 })
  } else {
    setTimeout(load, 1000)
  }
}
```

---

## 10. Final Validation Checklist

Run through this checklist before every production deployment. Use Lighthouse on your deployed URL via PageSpeed Insights — not the DevTools panel — for real-world scores.

### Architecture

- [ ] All first-party CSS, JS, images, fonts, and icons are imported from `src/` (not linked from `public/`) unless they need fixed URLs
- [ ] Feature-specific assets are colocated with their feature directory, not in global `assets/`
- [ ] `public/` contains only `favicon.ico`, `robots.txt`, `site.webmanifest`, and platform verification files

### CSS

- [ ] Bootstrap CSS is built from selective Sass partials — not the full compiled bundle
- [ ] Bootstrap variables overridden **before** any component `@import`
- [ ] PurgeCSS configured with a correct and tested safelist
- [ ] Critical CSS is minimal (< 2KB) and inlined via plugin
- [ ] Main theme CSS not async-loaded — treated as render-critical
- [ ] CSS minified via Lightning CSS
- [ ] No render-blocking external CSS `<link>` tags

### JavaScript

- [ ] All routes lazy-loaded with `React.lazy()` + `Suspense` + `ErrorBoundary`
- [ ] Lazy components declared at module scope — not inside render functions
- [ ] `react-vendor` chunk separated from application code in `manualChunks`
- [ ] Bootstrap JS uses per-component ESM imports — not `import 'bootstrap'`
- [ ] No full lodash/moment imports — named imports from ESM builds only
- [ ] Main entry chunk < 50KB gzipped
- [ ] Third-party analytics/tags loaded after idle, not in critical path
- [ ] Bundle analysis reviewed — no unexpected large packages
- [ ] `rollup-plugin-visualizer` gated behind env flag (not in standard build)

### Images

- [ ] Hero/LCP image uses `<picture>` with AVIF → WebP → JPEG fallback
- [ ] LCP image: `fetchpriority="high"`, no `loading="lazy"`, `decoding="async"`
- [ ] All below-fold images: `loading="lazy"` + `decoding="async"`
- [ ] Every `<img>` has explicit `width` and `height` attributes (prevents CLS)
- [ ] All raster images compressed and resized at source (or via CDN transform)
- [ ] No original uncompressed uploads served to the browser

### Fonts and Icons

- [ ] Fonts are self-hosted WOFF2 — not loaded from Google Fonts or other third parties
- [ ] Font files are subsetted to the unicode ranges actually used
- [ ] Variable font used where available (one file for all weights)
- [ ] Critical font preloaded in `<head>` with `crossorigin="anonymous"`
- [ ] `font-display: swap` set on all `@font-face` declarations
- [ ] Size-adjusted fallback font declared to minimise CLS during swap
- [ ] No icon fonts — SVG icons used instead
- [ ] Icon library tree-shaken (only imported icons in bundle)

### Delivery and Caching

- [ ] Vite outputs content-hashed filenames for all assets
- [ ] `/assets/*` served with `Cache-Control: public, max-age=31536000, immutable`
- [ ] HTML served with `Cache-Control: no-cache`
- [ ] Brotli compression enabled on server or CDN for all text assets
- [ ] Gzip available as Brotli fallback
- [ ] `preconnect` only to the 1–2 most critical third-party origins
- [ ] `dns-prefetch` for lower-priority external origins
- [ ] Route chunks prefetched on hover for key navigation links
- [ ] CDN configured with origin shielding and proper `Vary: Accept-Encoding`

### Security

- [ ] CSP header configured and tested — no `'unsafe-inline'` without nonce/hash
- [ ] Nonces are unique per request (not hardcoded)
- [ ] SRI hashes on any assets loaded from external CDNs
- [ ] No assets loaded from unnecessary third-party origins
- [ ] `dangerouslySetInnerHTML` only used with sanitized, trusted content
- [ ] All `target="_blank"` links include `rel="noopener noreferrer"`
- [ ] HSTS header configured: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `X-Content-Type-Options: nosniff` header present
- [ ] `X-Frame-Options: DENY` or `frame-ancestors 'none'` in CSP
- [ ] Source maps not publicly accessible (use `hidden` + private error tracker)

### Lighthouse / PageSpeed Validation

- [ ] Run PageSpeed Insights against deployed production URL (not localhost)
- [ ] Performance score ≥ 90 on mobile
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Total Blocking Time (TBT) < 200ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Accessibility score ≥ 95
- [ ] Best Practices score ≥ 95
- [ ] SEO score ≥ 90
- [ ] No "Eliminate render-blocking resources" warnings for first-party assets
- [ ] No "Unused JavaScript" warnings > 50KB
- [ ] No "Unused CSS" warnings > 20KB

### CI / Ongoing

- [ ] Bundle analysis (`ANALYZE=true npm run build`) reviewed before each release
- [ ] Lighthouse CI or `unlighthouse` integrated into CI pipeline
- [ ] E2E tests run after PurgeCSS to catch missing safelist entries
- [ ] No new third-party scripts added without security and performance review

---

## Common Mistakes Reference

| Mistake                                   | Impact                | Fix                                        |
| ----------------------------------------- | --------------------- | ------------------------------------------ |
| Importing full Bootstrap CSS              | +200KB CSS            | Selective Sass partial imports             |
| Importing full Bootstrap JS               | +50KB JS              | Per-component ESM imports                  |
| Lazy-loading the LCP image                | LCP penalty           | `fetchpriority="high"` + no `loading` attr |
| Missing `width`/`height` on images        | High CLS              | Always set intrinsic dimensions            |
| Long cache on `index.html`                | Stale deploys         | `no-cache` on HTML, `immutable` on assets  |
| Forgetting Brotli/gzip                    | +70% payload          | Enable on server and CDN                   |
| Not purging CSS in production             | Top Lighthouse killer | PurgeCSS with tested safelist              |
| Icon fonts                                | Layout shift + a11y   | Inline SVG or `lucide-react`               |
| Loading analytics in critical path        | TBT penalty           | `requestIdleCallback` after consent        |
| Over-fragmenting `manualChunks`           | Too many requests     | 3–5 stable splits maximum                  |
| Public source maps                        | Security risk         | `sourcemap: 'hidden'` + private upload     |
| `'unsafe-inline'` in CSP                  | XSS risk              | Nonce-based or hash-based allowlist        |
| Preloading too many fonts                 | Bandwidth contention  | Preload only the above-fold critical font  |
| Importing `lodash` instead of `lodash-es` | Full 70KB library     | Named imports from `lodash-es`             |

---

_Last updated: 2025 — React 18+, Vite 5+, Bootstrap 5.3+_
