# React Mobile-First Super Guide
### The Complete Standard for App-Like Mobile Web Experiences in React

> **Scope:** React web applications only. Not React Native. Not Expo.
> **Goal:** A mobile web experience so fluid, responsive, and native-feeling that users forget they're in a browser.
> **Baseline:** WCAG 2.2 AA · web.dev PWA Checklist · MDN mobile guidance · WAI mobile application guidance

---

## Table of Contents

1. [Mobile-First Principles](#1-mobile-first-principles)
2. [Responsive Layout Strategy](#2-responsive-layout-strategy)
3. [Viewport, Safe Areas, and Scroll Behavior](#3-viewport-safe-areas-and-scroll-behavior)
4. [App-Like UX Patterns](#4-app-like-ux-patterns)
5. [Mobile Navigation Patterns](#5-mobile-navigation-patterns)
6. [Touch Interactions and Gesture-Friendly UI](#6-touch-interactions-and-gesture-friendly-ui)
7. [Forms and Input UX on Mobile](#7-forms-and-input-ux-on-mobile)
8. [Performance Optimization for Mobile](#8-performance-optimization-for-mobile)
9. [Accessibility for Mobile Users](#9-accessibility-for-mobile-users)
10. [PWA Features for Native-Like Feel](#10-pwa-features-for-native-like-feel)
11. [React Implementation Patterns](#11-react-implementation-patterns)
12. [Common Mistakes to Avoid](#12-common-mistakes-to-avoid)
13. [Mobile-First QA Checklist](#13-mobile-first-qa-checklist)

---

## 1. Mobile-First Principles

### The Mobile-First Mindset

Mobile-first is not a media query strategy. It is a design philosophy: start with the smallest, most constrained environment and scale up. A desktop layout shrunk to mobile is always worse than a mobile layout expanded to desktop. Responsive design adapts to device capabilities and screen sizes — it is not about shrinking a desktop UI. The goal is **app-like feel** on the web, not pretending the browser does not exist. Overly fake-native web apps fight the browser and feel worse as a result.

**The six mobile realities every implementation must respect:**

**1. Thumb reach is the design grid.** The lower-center of the screen is the natural thumb zone. Primary actions belong there. Destructive actions belong at the top or behind confirmation flows.

**2. Touch has no hover state.** Any interaction that depends on `:hover` for discoverability is invisible on touch. UI must communicate affordance through shape, color, and label — not hover effects.

**3. Network is intermittent and slow.** Assume the worst. Cache aggressively. Load progressively. Never block the UI on network.

**4. The keyboard reshinks the viewport.** When a virtual keyboard opens, the visible area shrinks by 30–60%. MDN documents that the visual viewport is what is actually visible, and the on-screen keyboard can shrink it without changing the layout viewport. Layouts must account for this.

**5. Tap targets must be large.** A finger is 44–57px wide. WCAG 2.2 AA requires a minimum of 24×24 CSS px with exceptions; aim for 44–48px for all primary actions. The WAI mobile guidance recommends larger targets for touch surfaces.

**6. Battery and CPU are shared.** Heavy JavaScript, constant repaints, and background timers drain battery. Animations must be GPU-composited. The main thread must stay free.

### Core Engineering Principles

- One-column layout first; layer up for larger screens
- Compressed information density on mobile
- Thumb-friendly actions placed in the natural reach zone
- Minimal chrome — content over navigation decoration
- Progressive enhancement for larger screens
- Performance is UX — users expect instant responses; every millisecond matters
- Context-aware loading — adapt to network conditions and device capability

### Mobile-First CSS — The Baseline Rule

```css
/* ✅ Mobile-first — start with mobile, layer up */
.card {
  display:        flex;
  flex-direction: column;
  padding:        1rem;
  width:          100%;
}

@media (min-width: 768px) {
  .card {
    flex-direction: row;
    padding:        1.5rem;
  }
}

/* ❌ Desktop-first — fighting against mobile */
.card {
  display:        flex;
  flex-direction: row;
  max-width:      960px;
}

@media (max-width: 768px) {
  .card { flex-direction: column; }
}
```

### Breakpoints

```typescript
// src/lib/breakpoints.ts
export const breakpoints = {
  sm:   '480px',   // Large phones
  md:   '768px',   // Tablets
  lg:   '1024px',  // Small laptops
  xl:   '1280px',  // Desktop
  '2xl': '1536px',
} as const
```

---

## 2. Responsive Layout Strategy

### The App Shell — Mobile-First Grid

This shell is the foundation every screen is built on. It uses `min-height: 100dvh` (not `100vh`), safe-area insets for notched devices, and sticky header/footer positioning.

```css
/* src/styles/layout.css */
:root {
  --header-h:       56px;
  --bottom-nav-h:   64px;
  --page-max:       72rem;
  --space:          16px;
  --safe-top:       env(safe-area-inset-top,    0px);
  --safe-right:     env(safe-area-inset-right,  0px);
  --safe-bottom:    env(safe-area-inset-bottom, 0px);
  --safe-left:      env(safe-area-inset-left,   0px);
}

html, body, #root {
  min-height: 100%;
}

body {
  margin:     0;
  font:       400 16px/1.5 system-ui, sans-serif;
  background: #fff;
  color:      #111;
}

/* App shell grid — 3 rows: header / content / bottom nav */
.app {
  min-height: 100dvh;           /* Dynamic viewport height — not 100vh */
  display:    grid;
  grid-template-rows: auto 1fr auto;
  padding-top:    var(--safe-top);
  padding-bottom: var(--safe-bottom);
}

/* Sticky header — frosted glass native feel */
.app__header {
  position:         sticky;
  top:              0;
  z-index:          20;
  min-height:       var(--header-h);
  background:       rgba(255, 255, 255, 0.92);
  backdrop-filter:  blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom:    1px solid rgba(0, 0, 0, 0.08);
  /* GPU layer — no layout thrashing on scroll */
  transform:        translateZ(0);
  will-change:      transform;
}

/* Content area */
.app__main {
  width:          min(100%, var(--page-max));
  margin-inline:  auto;
  padding:        var(--space);
  /* Account for bottom nav */
  padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + var(--space));
}

/* Bottom navigation — always accounts for home indicator */
.app__bottom-nav {
  position:       sticky;
  bottom:         0;
  min-height:     calc(var(--bottom-nav-h) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background:     rgba(255, 255, 255, 0.96);
  border-top:     1px solid rgba(0, 0, 0, 0.08);
  transform:      translateZ(0);  /* Compositor layer */
}

/* On tablet+: hide bottom nav, show sidebar/top nav */
@media (min-width: 768px) {
  .app {
    grid-template-rows: auto 1fr;
  }
  .app__bottom-nav {
    display: none;
  }
  .app__main {
    padding-bottom: var(--space);
  }
}
```

### CSS Grid — Responsive Column Layouts

```css
/* 1 → 2 → 3 column grid */
.grid-responsive {
  display:               grid;
  grid-template-columns: 1fr;
  gap:                   1rem;
}

@media (min-width: 640px)  { .grid-responsive { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } }
@media (min-width: 1024px) { .grid-responsive { grid-template-columns: repeat(3, 1fr); gap: 2rem;   } }

/* Stack-to-side pattern */
.stack-to-side {
  display:        flex;
  flex-direction: column;
  gap:            1rem;
}

@media (min-width: 768px) {
  .stack-to-side              { flex-direction: row; align-items: center; }
  .stack-to-side .sidebar     { width: 280px; flex-shrink: 0; }
  .stack-to-side .content     { flex: 1; min-width: 0; }
}
```

### Fluid Typography — Smooth Scaling with clamp()

```css
:root {
  /* Fluid scale: min size at 320px → max size at 1200px */
  --text-xs:   clamp(0.694rem, 0.66rem + 0.17vw,  0.8rem);
  --text-sm:   clamp(0.833rem, 0.79rem + 0.22vw,  0.95rem);
  --text-base: clamp(1rem,     0.95rem + 0.26vw,   1.125rem);
  --text-lg:   clamp(1.2rem,   1.14rem + 0.31vw,   1.35rem);
  --text-xl:   clamp(1.44rem,  1.36rem + 0.39vw,   1.625rem);
  --text-2xl:  clamp(1.728rem, 1.63rem + 0.47vw,   1.95rem);
  --text-3xl:  clamp(2.074rem, 1.96rem + 0.57vw,   2.35rem);
}

/* Reading text */
p, li {
  font-size:   var(--text-base);
  line-height: 1.6;
  max-width:   65ch;  /* Optimal characters per line for readability */
}
```

### Responsive Images — Mobile Downloads Less

```tsx
// src/shared/components/ui/OptimizedImage.tsx
// AVIF → WebP → JPEG fallback + native lazy loading

interface OptimizedImageProps {
  src:       string
  alt:       string
  width:     number
  height:    number
  priority?: boolean   // LCP image — never lazy load
  sizes?:    string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes    = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
}: OptimizedImageProps) {
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/, '.avif')
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp')

  return (
    <picture>
      <source type="image/avif" srcSet={avifSrc} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrc} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        // Explicit dimensions prevent CLS — browser reserves space before load
        style={{ width: '100%', height: 'auto', aspectRatio: `${width}/${height}` }}
        loading={priority ? 'eager'  : 'lazy'}
        decoding={priority ? 'sync'  : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  )
}
```

### useBreakpoint Hook

```typescript
// src/shared/hooks/useBreakpoint.ts
// For React-level rendering decisions — use CSS media queries for styling

import { useState, useEffect } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useBreakpoint(): Breakpoint {
  const get = (): Breakpoint => {
    if (typeof window === 'undefined') return 'mobile'
    if (window.innerWidth >= 1024) return 'desktop'
    if (window.innerWidth >= 768)  return 'tablet'
    return 'mobile'
  }

  const [bp, setBp] = useState<Breakpoint>(get)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handler = () => { clearTimeout(timer); timer = setTimeout(() => setBp(get()), 100) }
    window.addEventListener('resize', handler, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('resize', handler) }
  }, [])

  return bp
}

// Coarse pointer detection — MDN: distinguishes fine (mouse) from coarse (finger)
export function useIsCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setIsCoarse(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isCoarse
}
```

---

## 3. Viewport, Safe Areas, and Scroll Behavior

### The Viewport Meta Tag — Exact Configuration

```html
<!-- index.html — this exact tag, no deviations -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
<!--
  width=device-width, initial-scale=1  — use device width, not virtual 980px viewport
  viewport-fit=cover                   — draw edge-to-edge for notch/Dynamic Island
  user-scalable=no is intentionally OMITTED — disabling zoom harms accessibility
-->

<!-- Theme color — browser chrome and status bar -->
<meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#1e3a6e" media="(prefers-color-scheme: dark)" />

<!-- iOS PWA meta tags -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="WalletPro" />
```

### Safe Area Insets — Required for iPhone Notch, Dynamic Island, Android Edge-to-Edge

Chrome's edge-to-edge guidance explains that safe-area insets define the rectangle where content will not be obstructed by hardware like the Android gesture navigation bar or iPhone Dynamic Island.

```css
/* src/styles/global.css */

/* Safe area utilities */
.safe-top    { padding-top:    max(12px, var(--safe-top)); }
.safe-bottom { padding-bottom: max(12px, var(--safe-bottom)); }
.safe-left   { padding-left:   max(16px, var(--safe-left)); }
.safe-right  { padding-right:  max(16px, var(--safe-right)); }

/* Fixed header — must clear the notch/Dynamic Island */
.app-header {
  position:   fixed;
  top:        0; left: 0; right: 0;
  padding-top: max(var(--space-3), var(--safe-top));
  z-index:    100;
}

/* Bottom nav — must clear the home indicator bar */
.bottom-nav {
  position:        fixed;
  bottom:          0; left: 0; right: 0;
  padding-bottom:  max(var(--space-2), var(--safe-bottom));
  z-index:         100;
}
```

### Dynamic Viewport Height — The 100vh Problem

On mobile browsers, `100vh` includes the browser's address bar. Content gets clipped. Use `dvh` (dynamic viewport height) with a `100vh` fallback.

```css
/* ❌ 100vh includes browser chrome on mobile — content clips */
.full-height { height: 100vh; }

/* ✅ dvh — responds to browser chrome visibility */
.full-height {
  height: 100vh;    /* Fallback for older browsers */
  height: 100dvh;   /* Dynamic viewport height — the correct value */
}

/* Full-page wrappers */
.page-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
}

/* Hero sections — svh gives the smallest stable height */
.hero {
  min-height: 100svh;  /* Small viewport height — won't be cut off by browser chrome */
}

/* Fallback for browsers without dvh support */
@supports not (height: 100dvh) {
  .full-height { height: 100vh; }
  .page-wrapper { min-height: 100vh; }
}
```

### Scroll Behavior — Native Feel

```css
/* src/styles/global.css */

html {
  scroll-behavior: smooth;
}

/* Scrollable containers */
.scroll-container {
  height:                   100%;
  overflow-y:               auto;
  -webkit-overflow-scrolling: touch;  /* iOS momentum scrolling */
  scroll-behavior:          smooth;
  overscroll-behavior:      contain;  /* Prevent scroll chaining to parent */
}

/* Hide scrollbar on WebKit but keep momentum */
.scroll-container::-webkit-scrollbar { display: none; }
.scroll-container { scrollbar-width: none; }

/* Snap scrolling — carousels and swipeable lists */
.snap-x-container {
  display:                  flex;
  overflow-x:               auto;
  scroll-snap-type:         x mandatory;
  -webkit-overflow-scrolling: touch;
  gap:                      1rem;
  padding:                  0 1rem;
}

.snap-x-item {
  scroll-snap-align: start;
  flex-shrink:       0;
  width:             calc(100% - 2rem);
}

/* Nested scrollable panels — prevent chaining */
.sheet__body,
.modal__body,
.drawer__body {
  overflow:           auto;
  overscroll-behavior: contain;
}

/* Prevent pull-to-refresh on root (handle yourself or disable) */
body {
  overscroll-behavior-y: none;
}
```

### Scroll Lock — Modals and Bottom Sheets

```typescript
// src/shared/hooks/useScrollLock.ts
import { useEffect } from 'react'

/**
 * Locks body scroll when a modal or bottom sheet is open.
 * The position:fixed trick is required for iOS — without it,
 * momentum scrolling bleeds through the overlay.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY       = window.scrollY
    const body          = document.body
    const originalStyle = body.style.cssText

    body.style.cssText = `
      position: fixed;
      top: -${scrollY}px;
      left: 0; right: 0;
      overflow: hidden;
    `

    return () => {
      body.style.cssText = originalStyle
      window.scrollTo(0, scrollY)  // Restore position
    }
  }, [isLocked])
}
```

### Sticky Headers with IntersectionObserver

```tsx
// src/shared/components/layout/StickyHeader.tsx
// Uses IntersectionObserver — no scroll event listeners, no jank

import { useEffect, useRef, useState } from 'react'

export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [isSticky, setIsSticky]  = useState(false)
  const sentinelRef              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Sentinel sits at the top of the scrollable area */}
      <div ref={sentinelRef} style={{ position: 'absolute', top: 0, height: 1 }} />
      <header className={`sticky-header ${isSticky ? 'sticky-header--stuck' : ''}`}>
        {children}
      </header>
    </>
  )
}
```

```css
.sticky-header {
  position:             sticky;
  top:                  0;
  z-index:              100;
  background:           white;
  transition:           box-shadow 200ms ease;
}

.sticky-header--stuck {
  backdrop-filter:      blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background:           rgba(255, 255, 255, 0.9);
  box-shadow:           0 1px 0 rgba(0, 0, 0, 0.08);
}
```

---

## 4. App-Like UX Patterns

### Instant Tap Feedback

```css
/* Every interactive element — immediate visual response, no delay */
button, a, [role="button"], .tap-target {
  /* Eliminate 300ms tap delay */
  touch-action:              manipulation;
  /* Remove iOS/Android default gray flash */
  -webkit-tap-highlight-color: transparent;
  cursor:                    pointer;
  transition:                transform 80ms ease, opacity 80ms ease;
}

button:active,
.tap-target:active {
  transform: scale(0.97);
  opacity:   0.85;
}

/* Coarse-pointer specific: larger targets and more spacing */
@media (pointer: coarse) {
  .tap-target       { min-height: 44px; min-width: 44px; }
  .toolbar button + button { margin-left: 8px; }
}
```

### Skeleton Screens — Shimmer Animation

```tsx
// src/shared/components/feedback/Skeleton.tsx

export function TransactionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading transactions">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-row" aria-hidden="true">
          <div className="skeleton-circle" />
          <div className="skeleton-lines">
            <div className="skeleton-line skeleton-line--wide" />
            <div className="skeleton-line skeleton-line--narrow" />
          </div>
          <div className="skeleton-line skeleton-line--amount" />
        </div>
      ))}
      <span className="sr-only">Loading transactions...</span>
    </div>
  )
}
```

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton-line,
.skeleton-circle {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e8e8e8 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation:       shimmer 1.4s ease-in-out infinite;
  border-radius:   4px;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line, .skeleton-circle {
    animation:  none;
    background: #f0f0f0;
  }
}
```

### Optimistic Updates — Immediate UI Response

```tsx
// src/features/wallet/hooks/useOptimisticFavorite.ts
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

export function useOptimisticFavorite(transactionId: string, initialIsFavorite: boolean) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  const { mutate } = useMutation({
    mutationFn: () => walletApi.toggleFavorite(transactionId),
    onMutate:   () => setIsFavorite(prev => !prev),  // Flip immediately
    onError:    () => setIsFavorite(initialIsFavorite), // Revert on failure
  })

  return { isFavorite, toggle: () => mutate() }
}
```

### Pull-to-Refresh

```tsx
// src/shared/hooks/usePullToRefresh.ts
import { useRef, useState, useCallback } from 'react'

interface UsePullToRefreshOptions {
  onRefresh:    () => Promise<void>
  threshold?:   number
  containerRef: React.RefObject<HTMLElement>
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  containerRef,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY      = useRef(0)
  const isPulling   = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el || el.scrollTop > 0) return
    startY.current   = e.touches[0].clientY
    isPulling.current = true
  }, [containerRef])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) { isPulling.current = false; return }
    // Resistance formula — harder to pull as you go further
    setPullDistance(Math.min(threshold * 1.5, delta * 0.4))
    if (delta > 5) e.preventDefault()
  }, [threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      setPullDistance(threshold)
      if ('vibrate' in navigator) navigator.vibrate(30)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, threshold, onRefresh])

  return { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd }
}
```

### Bottom Sheet — Native-Like Drawer with Snap Points

```tsx
// src/shared/components/ui/BottomSheet.tsx
import { useEffect, useRef } from 'react'
import { useFocusTrap }      from '@shared/hooks/useFocusTrap'
import { usePreviousFocus }  from '@shared/hooks/usePreviousFocus'
import { useScrollLock }     from '@shared/hooks/useScrollLock'

interface BottomSheetProps {
  isOpen:      boolean
  onClose:     () => void
  title?:      string
  snapPoints?: string[]   // CSS heights: ['25%', '50%', '90%']
  children:    React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, snapPoints = ['50%', '90%'], children }: BottomSheetProps) {
  const sheetRef   = useRef<HTMLDivElement>(null)
  const startYRef  = useRef(0)
  const currentYRef = useRef(0)

  useFocusTrap(sheetRef, isOpen)
  usePreviousFocus(isOpen)
  useScrollLock(isOpen)

  // Drag-to-snap behavior
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return
    const sheet = sheetRef.current

    // Set initial position to first snap point
    const vh = window.innerHeight
    const initialHeight = (parseFloat(snapPoints[0]) / 100) * vh
    sheet.style.transform = `translateY(${vh - initialHeight}px)`
    currentYRef.current   = vh - initialHeight

    let touchStart = 0

    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY
      startYRef.current = currentYRef.current
    }

    const onTouchMove = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - touchStart
      const newY  = startYRef.current + delta
      const maxY  = vh * (1 - parseFloat(snapPoints[0]) / 100)
      const minY  = vh * (1 - parseFloat(snapPoints[snapPoints.length - 1]) / 100)
      currentYRef.current = Math.min(maxY, Math.max(minY, newY))
      sheet.style.transform = `translateY(${currentYRef.current}px)`
    }

    const onTouchEnd = () => {
      const currentHeight = vh - currentYRef.current
      const snapValues    = snapPoints.map(p => (parseFloat(p) / 100) * vh)
      let   closest       = snapValues[0]
      let   minDiff       = Math.abs(currentHeight - closest)

      snapValues.forEach(snap => {
        const diff = Math.abs(currentHeight - snap)
        if (diff < minDiff) { minDiff = diff; closest = snap }
      })

      // If dragged past shortest snap point, close
      if (currentHeight < parseFloat(snapPoints[0]) * vh / 100 * 0.4) {
        onClose(); return
      }

      sheet.style.transition = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'
      sheet.style.transform  = `translateY(${vh - closest}px)`
      currentYRef.current    = vh - closest
      setTimeout(() => { if (sheet) sheet.style.transition = '' }, 300)
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true })
    sheet.addEventListener('touchmove',  onTouchMove,  { passive: true })
    sheet.addEventListener('touchend',   onTouchEnd)

    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart)
      sheet.removeEventListener('touchmove',  onTouchMove)
      sheet.removeEventListener('touchend',   onTouchEnd)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, snapPoints, onClose])

  return (
    <>
      <div
        className={`sheet-backdrop ${isOpen ? 'sheet-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Options'}
        className={`bottom-sheet ${isOpen ? 'bottom-sheet--open' : ''}`}
      >
        <div className="bottom-sheet__handle" aria-hidden="true" />
        {title && (
          <div className="bottom-sheet__header">
            <h2 className="bottom-sheet__title">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="bottom-sheet__close">✕</button>
          </div>
        )}
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </>
  )
}
```

```css
.sheet-backdrop {
  position:       fixed;
  inset:          0;
  background:     rgba(0, 0, 0, 0);
  z-index:        200;
  pointer-events: none;
  transition:     background 300ms ease;
}

.sheet-backdrop--visible {
  background:     rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.bottom-sheet {
  position:        fixed;
  bottom:          0; left: 0; right: 0;
  background:      white;
  border-radius:   20px 20px 0 0;
  padding-bottom:  max(1rem, var(--safe-bottom));
  z-index:         201;
  max-height:      90dvh;
  overflow-y:      auto;
  -webkit-overflow-scrolling: touch;
  /* Start off-screen; position set by JS */
  transform:       translateY(100%);
}

.bottom-sheet--open {
  animation: sheet-slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

@keyframes sheet-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(calc(100% - 50vh)); } /* Overridden by JS */
}

.bottom-sheet__handle {
  width:         40px;
  height:        4px;
  border-radius: 2px;
  background:    #d1d5db;
  margin:        12px auto 8px;
}
```

---

## 5. Mobile Navigation Patterns

### Bottom Tab Navigation — The Primary Mobile Pattern

On mobile, primary navigation belongs at the bottom — thumb-reachable, persistent, always visible. Bottom nav for 3–5 top-level destinations is the standard for installed apps on both iOS and Android. Use a drawer for infrequent sections; tabs only for peer-level content within one page context.

```tsx
// src/shared/components/layout/BottomTabNav.tsx
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation }       from 'react-i18next'
import { useKeyboardVisible }   from '@shared/hooks/useKeyboardVisible'

interface TabItem {
  path:  string
  label: string
  icon:  React.ComponentType<{ isActive: boolean }>
}

export function BottomTabNav({ tabs }: { tabs: TabItem[] }) {
  const { t }              = useTranslation('navigation')
  const location           = useLocation()
  const { isKeyboardVisible } = useKeyboardVisible()

  // Hide nav when keyboard is open — gives form fields full space
  if (isKeyboardVisible) return null

  return (
    <nav className="bottom-tab-nav" aria-label={t('bottom_nav_label')}>
      <ul className="bottom-tab-nav__list">
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.path)
          return (
            <li key={tab.path} className="bottom-tab-nav__item">
              <NavLink
                to={tab.path}
                aria-current={isActive ? 'page' : undefined}
                className={`bottom-tab ${isActive ? 'bottom-tab--active' : ''}`}
              >
                <tab.icon isActive={isActive} aria-hidden={true} />
                <span className="bottom-tab__label">{tab.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

```css
.bottom-tab-nav {
  position:        fixed;
  bottom:          0; left: 0; right: 0;
  display:         flex;
  background:      rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-top:      1px solid rgba(0, 0, 0, 0.08);
  padding-bottom:  max(0.5rem, var(--safe-bottom));
  padding-top:     0.5rem;
  z-index:         100;
  transform:       translateZ(0);
}

.bottom-tab-nav__list {
  display: flex;
  width:   100%;
  margin:  0; padding: 0;
  list-style: none;
}

.bottom-tab {
  flex:             1;
  display:          flex;
  flex-direction:   column;
  align-items:      center;
  gap:              3px;
  text-decoration:  none;
  color:            #9ca3af;
  font-size:        10px;
  font-weight:      500;
  min-height:       44px;
  justify-content:  center;
  border-radius:    8px;
  transition:       color 150ms ease, background 150ms ease;
  -webkit-tap-highlight-color: transparent;
  touch-action:     manipulation;
}

.bottom-tab--active        { color: var(--color-brand-primary); }
.bottom-tab:active         { background: rgba(37, 99, 235, 0.08); transform: scale(0.95); }

/* Hide on tablet+ — use top nav or sidebar instead */
@media (min-width: 768px) {
  .bottom-tab-nav { display: none; }
}
```

### Top App Bar

```tsx
// src/shared/components/layout/AppBar.tsx
interface AppBarProps {
  title:        string
  showBack?:    boolean
  onBack?:      () => void
  actions?:     React.ReactNode
  transparent?: boolean
}

export function AppBar({ title, showBack, onBack, actions, transparent }: AppBarProps) {
  const { t } = useTranslation('navigation')

  return (
    <header className={`app-bar ${transparent ? 'app-bar--transparent' : ''}`}>
      <div className="app-bar__leading">
        {showBack && (
          <button type="button" onClick={onBack} aria-label={t('go_back')} className="app-bar__back">
            <ChevronLeftIcon aria-hidden="true" />
          </button>
        )}
      </div>
      <h1 className="app-bar__title">{title}</h1>
      <div className="app-bar__trailing">{actions}</div>
    </header>
  )
}
```

```css
.app-bar {
  position:              sticky;
  top:                   0;
  display:               grid;
  grid-template-columns: 44px 1fr 44px;
  align-items:           center;
  height:                56px;
  padding-top:           var(--safe-top);
  padding:               0 4px;
  background:            white;
  border-bottom:         1px solid rgba(0, 0, 0, 0.08);
  z-index:               100;
  transform:             translateZ(0);
}

.app-bar--transparent { background: transparent; border-bottom: none; }

.app-bar__title {
  text-align:    center;
  font-size:     var(--text-base);
  font-weight:   600;
  overflow:      hidden;
  text-overflow: ellipsis;
  white-space:   nowrap;
}

.app-bar__back {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           44px; height: 44px;
  border:          none;
  background:      transparent;
  -webkit-tap-highlight-color: transparent;
  touch-action:    manipulation;
}
```

### Slide-In Drawer Navigation

```tsx
// src/shared/components/layout/DrawerNav.tsx
export function DrawerNav({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const drawerRef = useRef<HTMLElement>(null)
  useFocusTrap(drawerRef, isOpen)
  usePreviousFocus(isOpen)
  useScrollLock(isOpen)

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'drawer-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        ref={drawerRef}
        aria-label="Navigation menu"
        aria-hidden={!isOpen}
        className={`drawer ${isOpen ? 'drawer--open' : ''}`}
      >
        {children}
      </nav>
    </>
  )
}
```

```css
.drawer {
  position:   fixed;
  top: 0; left: 0; bottom: 0;
  width:      min(280px, 85vw);
  background: white;
  z-index:    300;
  transform:  translateX(-100%);
  transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  padding-top:    var(--safe-top);
  padding-bottom: var(--safe-bottom);
}

.drawer--open { transform: translateX(0); }

.drawer-overlay {
  position:       fixed;
  inset:          0;
  background:     rgba(0, 0, 0, 0);
  z-index:        299;
  pointer-events: none;
  transition:     background 280ms ease;
}

.drawer-overlay--visible {
  background:     rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}
```

---

## 6. Touch Interactions and Gesture-Friendly UI

### Touch Targets — Non-Negotiable Sizes

WCAG 2.2 AA requires a minimum of 24×24 CSS px (with spacing exceptions); the WAI mobile guidance and iOS HIG both recommend 44–48px as the practical standard for touch-heavy UIs. Use 44px as your minimum for all primary actions.

```css
/* Expand the element itself */
.action-btn {
  min-width:  44px;
  min-height: 44px;
  display:    flex;
  align-items: center;
  justify-content: center;
}

/* Expand only the tap area — visual stays small */
.small-action {
  position: relative;
}
.small-action::before {
  content:  '';
  position: absolute;
  /* Minimum 44px tap target in each dimension */
  inset:    min(0px, calc((44px - 100%) / -2));
}

/* Apply to all interactive elements */
button, a, [role="button"] {
  touch-action:              manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

### Swipe to Dismiss

```tsx
// src/shared/components/ui/SwipeableListItem.tsx
import { useRef, useState, useCallback } from 'react'

interface SwipeableListItemProps {
  children:     React.ReactNode
  onDelete:     () => void
  deleteLabel?: string
}

export function SwipeableListItem({ children, onDelete, deleteLabel = 'Delete' }: SwipeableListItemProps) {
  const [offset, setOffset]     = useState(0)
  const [revealed, setRevealed] = useState(false)
  const startX      = useRef(0)
  const isDragging  = useRef(false)
  const THRESHOLD   = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current   = e.touches[0].clientX
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const delta = startX.current - e.touches[0].clientX
    if (delta < 0) return
    setOffset(Math.min(delta, THRESHOLD * 1.2))
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    if (offset > THRESHOLD * 0.6) {
      setOffset(THRESHOLD)
      setRevealed(true)
    } else {
      setOffset(0)
      setRevealed(false)
    }
  }, [offset])

  return (
    <div className="swipeable-item">
      <div className="swipeable-item__action">
        <button
          type="button"
          onClick={onDelete}
          aria-label={deleteLabel}
          tabIndex={revealed ? 0 : -1}
          className="swipeable-item__delete-btn"
        >
          {deleteLabel}
        </button>
      </div>
      <div
        className="swipeable-item__content"
        style={{ transform: `translateX(-${offset}px)`, transition: isDragging.current ? 'none' : 'transform 200ms ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
```

### Swipe to Dismiss Cards — react-swipeable + framer-motion

For card dismissal (notifications, feed items, onboarding cards), `react-swipeable` + `framer-motion` together give you cross-browser gesture normalization plus spring physics:

```tsx
// src/shared/components/ui/SwipeableCard.tsx
import { useState }                 from 'react'
import { useSwipeable }             from 'react-swipeable'
import { motion }                   from 'framer-motion'

interface SwipeableCardProps {
  children:   React.ReactNode
  onDismiss:  () => void
}

export function SwipeableCard({ children, onDismiss }: SwipeableCardProps) {
  const [offsetX, setOffsetX]       = useState(0)
  const [isRemoving, setIsRemoving] = useState(false)
  const DISMISS_THRESHOLD = 100

  const handlers = useSwipeable({
    onSwiping: ({ dir, absX }) => {
      if (dir === 'Left') setOffsetX(-absX)
      if (dir === 'Left' && absX >= DISMISS_THRESHOLD) {
        setIsRemoving(true)
        onDismiss()
      }
    },
    onSwipedLeft: () => {
      if (Math.abs(offsetX) >= DISMISS_THRESHOLD) {
        setIsRemoving(true)
        onDismiss()
      } else {
        setOffsetX(0)
      }
    },
    trackMouse: true,  // Allows dev testing on desktop
  })

  return (
    <motion.div
      {...handlers}
      animate={{ x: offsetX, opacity: isRemoving ? 0 : 1 }}
      transition={{ type: 'spring', damping: 20 }}
      // pan-y: browser handles vertical scroll, we handle horizontal
      style={{ touchAction: 'pan-y pinch-zoom' }}
      className="swipeable-card"
    >
      {children}
    </motion.div>
  )
}
```

### useHapticFeedback Hook

A named hook makes haptic patterns reusable and testable rather than scattered `navigator.vibrate()` calls:

```typescript
// src/shared/hooks/useHapticFeedback.ts

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

const PATTERNS: Record<HapticType, number | number[]> = {
  light:   10,
  medium:  20,
  heavy:   [30, 20, 30],
  success: [30, 20, 50],
  warning: [50, 30, 50],
  error:   [100, 50, 100],
}

export function useHapticFeedback() {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }

  return {
    light:   () => vibrate(PATTERNS.light),
    medium:  () => vibrate(PATTERNS.medium),
    heavy:   () => vibrate(PATTERNS.heavy),
    success: () => vibrate(PATTERNS.success),
    warning: () => vibrate(PATTERNS.warning),
    error:   () => vibrate(PATTERNS.error),
  }
}

// Usage — attach to any interactive element:
function ActionButton({ onClick, children, hapticType = 'light' }: ButtonProps) {
  const haptic = useHapticFeedback()
  return (
    <button
      onClick={() => { haptic[hapticType](); onClick?.() }}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </button>
  )
}
```

### Animated Carousel with react-swipeable

For production swipe carousels, `react-swipeable` handles the cross-browser touch/pointer event normalization so you don't have to:

```bash
npm install react-swipeable framer-motion
```

```tsx
// src/shared/components/ui/TouchCarousel.tsx
import { useState }                 from 'react'
import { useSwipeable }             from 'react-swipeable'
import { motion, AnimatePresence }  from 'framer-motion'

interface TouchCarouselProps {
  items:   React.ReactNode[]
  label?:  string
}

export function TouchCarousel({ items, label = 'Image carousel' }: TouchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection]       = useState(0)
  const total = items.length

  const go = (newIndex: number, dir: number) => {
    setDirection(dir)
    setCurrentIndex((newIndex + total) % total)
    if ('vibrate' in navigator) navigator.vibrate(10)
  }

  const handlers = useSwipeable({
    onSwipedLeft:  () => go(currentIndex + 1,  1),
    onSwipedRight: () => go(currentIndex - 1, -1),
    trackMouse:    true,  // Enables dev testing on desktop
    preventScrollOnSwipe: true,
  })

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  }

  return (
    <div
      aria-label={label}
      aria-roledescription="carousel"
      className="carousel"
    >
      <div {...handlers} className="carousel__viewport" style={{ touchAction: 'pan-y' }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            aria-label={`Item ${currentIndex + 1} of ${total}`}
            aria-roledescription="slide"
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="carousel__dots" aria-label="Carousel navigation">
        {items.map((_, i) => (
          <button
            key={i}
            className={`carousel__dot ${i === currentIndex ? 'carousel__dot--active' : ''}`}
            onClick={() => go(i, i > currentIndex ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex}
          />
        ))}
      </div>
    </div>
  )
}
```

### Long Press Detection

```typescript
// src/shared/hooks/useLongPress.ts
import { useRef, useCallback } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  onPress?:    () => void
  threshold?:  number
}

export function useLongPress({ onLongPress, onPress, threshold = 500 }: UseLongPressOptions) {
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPress   = useRef(false)

  const start = useCallback(() => {
    isLongPress.current = false
    timerRef.current    = setTimeout(() => {
      isLongPress.current = true
      if ('vibrate' in navigator) navigator.vibrate(50)
      onLongPress()
    }, threshold)
  }, [onLongPress, threshold])

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isLongPress.current && onPress) onPress()
  }, [onPress])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd:   stop,
    onTouchMove:  cancel,   // Cancel if finger moves (user is scrolling)
    onMouseDown:  start,
    onMouseUp:    stop,
    onMouseLeave: cancel,
  }
}
```

### useSwipe Hook — Directional Swipe Navigation

```typescript
// src/shared/hooks/useSwipe.ts
import { useRef, useCallback } from 'react'
import { haptic }              from '@shared/utils/haptics'

interface UseSwipeOptions {
  onSwipeLeft?:  () => void
  onSwipeRight?: () => void
  onSwipeUp?:    () => void
  onSwipeDown?:  () => void
  threshold?:    number
  maxDeviation?: number
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold    = 50,
  maxDeviation = 30,
}: UseSwipeOptions) {
  const startX = useRef(0)
  const startY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    const isH = Math.abs(dx) > Math.abs(dy)

    if (isH) {
      if (Math.abs(dy) > maxDeviation) return
      if (dx < -threshold && onSwipeLeft)  { haptic('light'); onSwipeLeft()  }
      if (dx >  threshold && onSwipeRight) { haptic('light'); onSwipeRight() }
    } else {
      if (Math.abs(dx) > maxDeviation) return
      if (dy < -threshold && onSwipeUp)   { haptic('light'); onSwipeUp()   }
      if (dy >  threshold && onSwipeDown) { haptic('light'); onSwipeDown() }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, maxDeviation])

  return { handleTouchStart, handleTouchEnd }
}
```

### Haptic Feedback

```typescript
// src/shared/utils/haptics.ts
// Vibration API — Android Chrome. iOS supports only Web Notifications vibration.

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light:   10,
  medium:  25,
  heavy:   50,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error:   [50, 25, 50, 25, 50],
}

export function haptic(pattern: HapticPattern = 'light'): void {
  if (!('vibrate' in navigator)) return
  navigator.vibrate(PATTERNS[pattern])
}

// Usage:
// On successful transfer: haptic('success')
// On button press: haptic('light')
// On error: haptic('error')
```

---

## 7. Forms and Input UX on Mobile

### Input Types — Trigger the Right Keyboard

The correct `type` attribute is the single highest-impact mobile form improvement. `inputMode` optimizes the keyboard without changing validation behavior. `enterKeyHint` customizes the action button on the virtual keyboard.

```tsx
// src/features/wallet/components/TransferForm.tsx

export function MobileFormInputs() {
  return (
    <form>
      {/* Email — shows email keyboard with @ */}
      <input type="email"  name="email"    autoComplete="username"         inputMode="email"    enterKeyHint="next" />

      {/* Phone — shows phone keypad */}
      <input type="tel"    name="phone"    autoComplete="tel"              inputMode="tel"      enterKeyHint="next" />

      {/* OTP / PIN — numeric only */}
      <input type="text"   name="otp"      autoComplete="one-time-code"    inputMode="numeric"  enterKeyHint="done" pattern="[0-9]*" />

      {/* Currency amount — decimal keyboard */}
      <input type="text"   name="amount"   autoComplete="off"              inputMode="decimal"  enterKeyHint="next" pattern="[0-9]*\.?[0-9]+" />

      {/* URL */}
      <input type="url"    name="website"  autoComplete="url"              inputMode="url" />

      {/* Search */}
      <input type="search" name="query"    autoComplete="off"              inputMode="search"   enterKeyHint="search" />

      {/* Password */}
      <input type="password" name="password" autoComplete="current-password" enterKeyHint="done" />
      <input type="password" name="newPass"  autoComplete="new-password"      enterKeyHint="next" />

      {/* Payment — card number shows numeric pad */}
      <input type="text"   name="card"     autoComplete="cc-number"        inputMode="numeric" />
      <input type="text"   name="expiry"   autoComplete="cc-exp" />
      <input type="text"   name="cvv"      autoComplete="cc-csc"           inputMode="numeric" />

      {/* Native date — better than custom pickers on mobile */}
      <input type="date"   name="birthday" autoComplete="bday" />
    </form>
  )
}
```

### AutoCapitalize and AutoCorrect

```tsx
// Mobile text field with complete attributes
const MobileTextField = ({ type = 'text', label, name, ...props }) => {
  const isEmailOrUrl = type === 'email' || type === 'url'

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        // Disable autocorrect for email/url — don't "fix" user@gmail.com
        autoCapitalize={isEmailOrUrl ? 'off'       : 'sentences'}
        autoCorrect={   isEmailOrUrl ? 'off'       : 'on'}
        spellCheck={    isEmailOrUrl ? false        : true}
        // Critical: prevents iOS auto-zoom on focus
        style={{ fontSize: 'max(1rem, 16px)' }}
        {...props}
      />
    </div>
  )
}
```

### Preventing iOS Auto-Zoom

```css
/* iOS Safari zooms in when an input font-size is below 16px */
/* Apply to ALL inputs, textareas, and selects */
input, textarea, select {
  font-size: max(1rem, 16px) !important;
}
```

### Keyboard Visibility Detection

```typescript
// src/shared/hooks/useKeyboardVisible.ts
import { useState, useEffect } from 'react'

/**
 * Detects virtual keyboard using the Visual Viewport API.
 * MDN: VisualViewport exists to position elements relative to
 * what is actually visible on screen.
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [keyboardHeight,    setKeyboardHeight]    = useState(0)

  useEffect(() => {
    if (!window.visualViewport) return

    function handler() {
      const vvHeight = window.visualViewport!.height
      const wHeight  = window.screen.height
      const diff     = wHeight - vvHeight

      if (diff > 150) {
        setIsKeyboardVisible(true)
        setKeyboardHeight(diff)
      } else {
        setIsKeyboardVisible(false)
        setKeyboardHeight(0)
      }
    }

    window.visualViewport.addEventListener('resize', handler)
    return () => window.visualViewport?.removeEventListener('resize', handler)
  }, [])

  return { isKeyboardVisible, keyboardHeight }
}
```

### Scroll Input Into View on Focus

```typescript
// src/shared/hooks/useScrollInputIntoView.ts
import { useCallback } from 'react'

export function useScrollInputIntoView() {
  return useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const element = e.currentTarget
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)  // Delay allows keyboard to fully open first
  }, [])
}
```

### Mobile-Optimized Form Layout

```css
/* Thumb-friendly field heights */
.mobile-form input,
.mobile-form textarea,
.mobile-form select {
  font-size:     max(1rem, 16px);   /* Never below 16px — prevents iOS zoom */
  min-height:    48px;              /* Comfortable touch target */
  padding:       12px 16px;
  border-radius: 12px;
  width:         100%;
  box-sizing:    border-box;
  border:        1px solid #d1d5db;
  background:    white;
  transition:    border-color 150ms, box-shadow 150ms;
  -webkit-appearance: none;   /* Remove iOS/Safari default styling */
}

.mobile-form input:focus,
.mobile-form textarea:focus {
  outline:    none;
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

/* Submit button anchored above keyboard */
.form-submit-sticky {
  position:   sticky;
  bottom:     calc(1rem + var(--safe-bottom));
  padding:    0.75rem 0;
  background: linear-gradient(transparent, white 30%);
}
```

### MobileSelect — Bottom Sheet–Backed Select

Native `<select>` looks inconsistent across platforms. For a polished app feel, a `<select>` trigger that opens a `BottomSheet` matches iOS and Android picker conventions:

```tsx
// src/shared/components/ui/MobileSelect.tsx
import { useState }     from 'react'
import { BottomSheet }  from './BottomSheet'
import { useId }        from 'react'

interface SelectOption { value: string; label: string }

interface MobileSelectProps {
  label:    string
  options:  SelectOption[]
  value:    string
  onChange: (value: string) => void
  required?: boolean
}

export function MobileSelect({ label, options, value, onChange, required }: MobileSelectProps) {
  const [isOpen, setIsOpen]  = useState(false)
  const id                   = useId()
  const selectedLabel        = options.find(o => o.value === value)?.label ?? 'Select an option'

  return (
    <>
      <div className="field">
        <label id={id} className="field__label">
          {label}
          {required && <span className="sr-only">(required)</span>}
        </label>
        <button
          type="button"
          aria-labelledby={id}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          className="mobile-select-trigger"
        >
          <span className="mobile-select-trigger__value">{selectedLabel}</span>
          <span aria-hidden="true" className="mobile-select-trigger__chevron">›</span>
        </button>
      </div>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
      >
        <ul role="listbox" aria-label={label} className="select-options">
          {options.map(option => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`select-option ${option.value === value ? 'select-option--selected' : ''}`}
              >
                {option.label}
                {option.value === value && <span aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  )
}
```

```css
.mobile-select-trigger {
  width:           100%;
  display:         flex;
  justify-content: space-between;
  align-items:     center;
  min-height:      48px;
  padding:         12px 16px;
  border:          1px solid #d1d5db;
  border-radius:   12px;
  background:      white;
  font-size:       max(1rem, 16px);
  text-align:      left;
  -webkit-tap-highlight-color: transparent;
  touch-action:    manipulation;
}

.select-options {
  padding:    0.5rem 0;
  list-style: none;
  margin:     0;
}

.select-option {
  display:     flex;
  justify-content: space-between;
  align-items: center;
  width:       100%;
  padding:     14px 20px;
  font-size:   1rem;
  min-height:  48px;
  background:  transparent;
  border:      none;
  text-align:  left;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.select-option--selected { color: var(--color-brand-primary); font-weight: 600; }
.select-option:active     { background: rgba(0, 0, 0, 0.04); }
```

### KeyboardAvoidingView — Pad Content Above Keyboard

For chat inputs, comment fields, or any UI that must sit above the virtual keyboard:

```tsx
// src/shared/components/layout/KeyboardAvoidingView.tsx
import { useState, useEffect } from 'react'

interface KeyboardAvoidingViewProps {
  children: React.ReactNode
  offset?:  number   // Extra padding beyond keyboard height
}

/**
 * Pads its children up when the virtual keyboard opens.
 * Uses the Visual Viewport API — MDN documents this as the way to
 * track what is actually visible when the keyboard reshapes the screen.
 */
export function KeyboardAvoidingView({ children, offset = 0 }: KeyboardAvoidingViewProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!window.visualViewport) return

    function handleResize() {
      const vvHeight = window.visualViewport!.height
      const wHeight  = window.innerHeight
      const diff     = wHeight - vvHeight
      setKeyboardHeight(diff > 150 ? diff + offset : 0)
    }

    window.visualViewport.addEventListener('resize', handleResize, { passive: true })
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [offset])

  return (
    <div
      style={{ paddingBottom: keyboardHeight, transition: 'padding-bottom 200ms ease' }}
      className="keyboard-avoiding"
    >
      {children}
    </div>
  )
}

// Usage — wrap a chat composer or sticky form footer:
function ChatPage() {
  return (
    <div className="chat-layout">
      <MessageList />
      <KeyboardAvoidingView offset={8}>
        <MessageComposer />
      </KeyboardAvoidingView>
    </div>
  )
}
```

---

## 8. Performance Optimization for Mobile

### Mobile Performance Budget

| Metric | Target | Critical threshold |
|---|---|---|
| First Contentful Paint (FCP) | < 1.8s | < 3s |
| Largest Contentful Paint (LCP) | < 2.5s | < 4s |
| Interaction to Next Paint (INP) | < 200ms | < 500ms |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.25 |
| Initial JS bundle | < 150kb gzipped | < 300kb |

### Route-Based Code Splitting — Mobile Downloads Less

```tsx
// src/app/router.tsx
import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const HomePage    = lazy(() => import('./pages/HomePage'))
const SearchPage  = lazy(() => import('./pages/SearchPage'))
const WalletPage  = lazy(() => import('./pages/WalletPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// Heavy components — loaded only when route renders
const QRScanner       = lazy(() => import('@/features/wallet/components/QRScanner'))
const TransactionChart = lazy(() => import('@/features/dashboard/components/TransactionChart'))

// Preload on hover/touch — user intent detected before they tap
function PreloadLink({ to, children, preload }: { to: string; children: React.ReactNode; preload: () => Promise<unknown> }) {
  const preloadOnce = useRef(false)
  const handle = () => {
    if (preloadOnce.current) return
    preloadOnce.current = true
    preload()
  }
  return (
    <Link to={to} onMouseEnter={handle} onTouchStart={handle}>
      {children}
    </Link>
  )
}

const router = createBrowserRouter([
  {
    path:    '/',
    element: <AppShell />,
    children: [
      { index: true,      element: <Suspense fallback={<PageSkeleton />}><HomePage /></Suspense> },
      { path: 'search',   element: <Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense> },
      { path: 'wallet',   element: <Suspense fallback={<PageSkeleton />}><WalletPage /></Suspense> },
      { path: 'profile',  element: <Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense> },
    ],
  },
])

export function AppRouter() { return <RouterProvider router={router} /> }
```

### GPU-Composited Animations — No Layout Thrashing

```css
/* ✅ Only animate transform and opacity — GPU composited, no layout recalculation */
.slide-up {
  transform:  translateY(100%);
  opacity:    0;
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity   300ms ease;
  will-change: transform, opacity;
}
.slide-up--visible {
  transform: translateY(0);
  opacity:   1;
}

/* ❌ NEVER animate these on mobile — trigger layout on every frame */
/* height, width, top, left, margin, padding, border-width */

/* ✅ Use transform instead of position-based animation */
.notification {
  position:   fixed;
  top:        1rem; right: 1rem;
  transform:  translateY(-120%);   /* Start off-screen */
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.notification--visible {
  transform: translateY(0);        /* GPU composited */
}
```

### Virtualization — Essential for Long Lists

```tsx
// src/features/wallet/components/TransactionVirtualList.tsx
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export function TransactionVirtualList({ transactions }: { transactions: Transaction[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count:            transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize:     () => 72,
    overscan:         3,    // Fewer off-screen renders on mobile = less battery
  })

  return (
    <div
      ref={parentRef}
      style={{ height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <ul
        role="list"
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map(vRow => (
          <li
            key={vRow.key}
            style={{
              position:  'absolute',
              top: 0, left: 0, width: '100%',
              height:    `${vRow.size}px`,
              transform: `translateY(${vRow.start}px)`,
            }}
          >
            <TransactionRow {...transactions[vRow.index]} />
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Infinite Scroll with Virtualization — Load-More Trigger

For paginated feeds, combine `@tanstack/react-virtual` with an end-of-list observer. This avoids loading all pages at once while keeping scroll performance native-smooth:

```tsx
// src/shared/components/ui/InfiniteScrollList.tsx
import { useRef, useEffect } from 'react'
import { useVirtualizer }    from '@tanstack/react-virtual'

interface InfiniteScrollListProps<T> {
  items:      T[]
  renderItem: (item: T, index: number) => React.ReactNode
  loadMore:   () => void
  hasMore:    boolean
  estimateSize?: number
  isLoading?:  boolean
}

export function InfiniteScrollList<T>({
  items, renderItem, loadMore, hasMore, estimateSize = 72, isLoading,
}: InfiniteScrollListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count:            items.length,
    getScrollElement: () => parentRef.current,
    estimateSize:     () => estimateSize,
    overscan:         3,   // Low overscan on mobile — less work, less battery
  })

  const virtualItems    = virtualizer.getVirtualItems()
  const lastVirtualItem = virtualItems.at(-1)

  // Trigger loadMore when the last item becomes visible
  useEffect(() => {
    if (!lastVirtualItem) return
    if (lastVirtualItem.index === items.length - 1 && hasMore && !isLoading) {
      loadMore()
    }
  }, [lastVirtualItem?.index, items.length, hasMore, isLoading, loadMore])

  return (
    <div
      ref={parentRef}
      style={{ height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' as const }}
    >
      <ul
        role="list"
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualItems.map(vRow => (
          <li
            key={vRow.key}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              height:    `${vRow.size}px`,
              transform: `translateY(${vRow.start}px)`,
            }}
          >
            {renderItem(items[vRow.index], vRow.index)}
          </li>
        ))}
      </ul>

      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading more items"
          style={{ textAlign: 'center', padding: '1rem' }}
        >
          <Spinner size="sm" label="Loading more" />
        </div>
      )}
    </div>
  )
}
```

### Network-Aware and Adaptive Loading

```typescript
// src/shared/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react'

type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g'

export function useNetworkStatus() {
  const [isOnline,      setIsOnline]      = useState(navigator.onLine)
  const [effectiveType, setEffectiveType] = useState<EffectiveType>('4g')

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    const conn = (navigator as Navigator & {
      connection?: { effectiveType?: EffectiveType; addEventListener: Function }
    }).connection

    if (conn) {
      setEffectiveType(conn.effectiveType ?? '4g')
      const update = () => setEffectiveType(conn.effectiveType ?? '4g')
      conn.addEventListener('change', update)
      return () => {
        window.removeEventListener('online',  handleOnline)
        window.removeEventListener('offline', handleOffline)
        conn.removeEventListener('change', update)
      }
    }

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g'
  return { isOnline, effectiveType, isSlowConnection }
}

// Usage: lower image quality on slow connections
function ProductCard({ product }) {
  const { isSlowConnection } = useNetworkStatus()
  const quality = isSlowConnection ? '?q=40&w=400' : '?q=80&w=800'
  return <img src={`${product.imageUrl}${quality}`} alt={product.name} loading="lazy" />
}
```

### Throttle Scroll Handlers and Debounce Search

```typescript
// src/shared/utils/throttle.ts
export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, wait: number) {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) { lastTime = now; fn(...args) }
  }
}

// Throttle scroll to 16ms (60fps) — critical on mobile
const handleScroll = throttle(() => {
  const opacity = Math.min(1, window.scrollY / 100)
  headerRef.current!.style.opacity = String(opacity)
}, 16)

// src/shared/utils/debounce.ts
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}
```

### Preloading Critical Assets

```html
<!-- index.html — browser discovers these immediately on parse -->

<!-- LCP image — preload so it starts loading before CSS parses -->
<link rel="preload" as="image" href="/images/hero.webp"
  imagesrcset="/images/hero-480.webp 480w, /images/hero-800.webp 800w"
  imagesizes="100vw" />

<!-- Primary font — prevents FOIT (Flash of Invisible Text) -->
<link rel="preload" as="font" type="font/woff2"
  href="/fonts/inter-variable.woff2" crossorigin />

<!-- API origin — reduces first-request latency -->
<link rel="dns-prefetch" href="https://api.walletpro.com" />
<link rel="preconnect"   href="https://api.walletpro.com" crossorigin />
```

---

## 9. Accessibility for Mobile Users

Mobile-first does not mean touch-only. WCAG 2.2 and the W3C's mobile guidance both emphasize orientation support, reflow, pointer gesture alternatives, and target sizes that work on touch devices. Mobile web users also include people using external keyboards, switch access, screen readers (VoiceOver on iOS, TalkBack on Android), and voice control.

### Do Not Disable Zoom

`user-scalable=no` in the viewport meta tag harms accessibility for low-vision users and is prohibited by WCAG 1.4.4. Never include it.

### Touchable — Accessible, Large-Target Button Primitive

A shared `Touchable` component enforces minimum target sizing across the entire app:

```tsx
// src/shared/components/ui/Touchable.tsx
import { type ButtonHTMLAttributes } from 'react'

interface TouchableProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function Touchable({ children, style, ...rest }: TouchableProps) {
  return (
    <button
      style={{
        minHeight: 44,
        minWidth:  44,
        padding:   12,
        // Coarse-pointer: match the device's primary input type
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
```

```html
<!-- ✅ Correct -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

<!-- ❌ Harms accessibility — violates WCAG 1.4.4 -->
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
```

### Hover-Only Interactions Must Not Exist

```css
/* Remove hover-only UI on touch devices */
@media (hover: none) and (pointer: coarse) {
  /* Tooltips, dropdown reveals, and underline-on-hover affordances
     are invisible on touch — remove or replace them */
  .tooltip-trigger::after  { display: none; }
  .hover-reveal            { display: block; }  /* Always show on touch */

  /* Simplify hover-heavy patterns for touch surfaces */
  .nav-item:hover .submenu { display: none; }   /* Hover submenu → use tap/bottom sheet */
}
```

### Screen Reader Support on Mobile

Mobile screen reader users swipe to navigate, not Tab. Semantic HTML is the foundation — `role`, `aria-label`, `aria-live`, and focus management follow from it.

```tsx
// Dynamic content — announced on change
function SearchResults({ results, query }: { results: Result[]; query: string }) {
  return (
    <>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {results.length === 0
          ? `No results for "${query}"`
          : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
        }
      </p>
      <ul role="list" aria-label={`Search results for ${query}`}>
        {results.map(r => (
          <li key={r.id}>
            <a href={r.url}>
              {r.title}
              <span className="sr-only">, {r.category}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
```

### Gesture Alternatives — Every Gesture Needs a Button

```tsx
// Every swipe-only interaction must have a non-gesture alternative
// Swipe-to-delete → Delete button
// Long-press → Context menu button
// Pinch-to-zoom → +/- zoom buttons

function SwipeableCard({ item, onDelete }: CardProps) {
  return (
    <SwipeableListItem onDelete={onDelete}>
      <div className="card-content">
        <span>{item.title}</span>
        {/* Non-gesture alternative — always visible */}
        <button
          type="button"
          aria-label={`Delete ${item.title}`}
          onClick={onDelete}
          className="delete-btn"
        >
          <TrashIcon aria-hidden="true" />
        </button>
      </div>
    </SwipeableListItem>
  )
}
```

### Orientation — Support Both Directions

```css
@media (orientation: landscape) and (max-height: 500px) {
  /* Phone in landscape — minimal vertical space */
  .app-bar         { height: 44px; }
  .bottom-tab-nav  { display: none; }   /* Switch to compact nav in landscape */
  .main-content {
    padding-top:   44px;
    padding-bottom: 0;
    padding-left:  max(1rem, var(--safe-left));
    padding-right: max(1rem, var(--safe-right));
  }
}
```

---

## 10. PWA Features for Native-Like Feel

PWA features are the highest-leverage tools for closing the gap between web and native. The web.dev PWA checklist defines installability, offline behavior, and a custom offline page as core to an app-like experience. Installed PWAs launch from the home screen, run in their own window, and feel like first-class apps.

### Web App Manifest

```json
// public/manifest.json
{
  "name":             "WalletPro",
  "short_name":       "WalletPro",
  "description":      "Your digital wallet",
  "start_url":        "/dashboard",
  "display":          "standalone",
  "background_color": "#ffffff",
  "theme_color":      "#2563eb",
  "orientation":      "portrait-primary",
  "scope":            "/",
  "categories":       ["finance"],
  "icons": [
    { "src": "/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    {
      "name":       "Send Money",
      "short_name": "Send",
      "url":        "/transfer",
      "icons":      [{ "src": "/icons/shortcut-send.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow", "label": "Dashboard" }
  ]
}
```

### Service Worker with vite-plugin-pwa

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType:  'autoUpdate',
      includeAssets: ['fonts/**', 'icons/**'],

      workbox: {
        runtimeCaching: [
          {
            // API responses — network first, fall back to cache
            urlPattern:    /^https:\/\/api\.walletpro\.com\/api\/v1\//,
            handler:       'NetworkFirst',
            options: {
              cacheName:            'api-cache',
              expiration:           { maxEntries: 50, maxAgeSeconds: 5 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Images — cache first
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler:    'CacheFirst',
            options: {
              cacheName:  'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
        navigateFallback:      '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
```

### Add to Home Screen Prompt

```typescript
// src/shared/hooks/useInstallPrompt.ts

interface BeforeInstallPromptEvent extends Event {
  prompt:     () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled,   setIsInstalled]   = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  )

  useEffect(() => {
    if (isInstalled) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isInstalled])

  const promptInstall = async () => {
    if (!installPrompt) return false
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
    return outcome === 'accepted'
  }

  return { canInstall: !!installPrompt, isInstalled, promptInstall }
}
```

```tsx
// src/shared/components/ui/InstallBanner.tsx
export function InstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed]    = useState(
    () => localStorage.getItem('install-banner-dismissed') === 'true'
  )

  if (!canInstall || dismissed) return null

  return (
    <div className="install-banner" role="banner">
      <div className="install-banner__icon"><AppIcon aria-hidden="true" /></div>
      <div className="install-banner__text">
        <strong>Add WalletPro to your home screen</strong>
        <span>Faster access, works offline</span>
      </div>
      <button type="button" onClick={promptInstall} className="install-banner__cta">Install</button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => { setDismissed(true); localStorage.setItem('install-banner-dismissed', 'true') }}
        className="install-banner__dismiss"
      >
        ✕
      </button>
    </div>
  )
}
```

### Background Sync — Queue Actions When Offline

```typescript
// src/shared/hooks/useOfflineQueue.ts

interface QueuedAction { id: string; type: string; payload: unknown; timestamp: number }
const QUEUE_KEY = 'offline-action-queue'

export function useOfflineQueue() {
  const getQueue = (): QueuedAction[] => {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') }
    catch { return [] }
  }

  const enqueue = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const queue = getQueue()
    queue.push({ ...action, id: crypto.randomUUID(), timestamp: Date.now() })
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    // Register background sync if available
    navigator.serviceWorker?.ready.then(reg => {
      (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } })
        .sync?.register('process-queue')
    })
  }, [])

  useEffect(() => {
    window.addEventListener('online', () =>
      window.dispatchEvent(new CustomEvent('process-offline-queue'))
    )
  }, [])

  return { enqueue, queueLength: getQueue().length }
}
```

---

## 11. React Implementation Patterns

### MobileProvider — Centralized Mobile State

```tsx
// src/app/providers/MobileProvider.tsx

interface MobileContextValue {
  isMobile:             boolean
  isTablet:             boolean
  isCoarsePointer:      boolean
  isStandalone:         boolean   // Installed PWA
  isOnline:             boolean
  isSlowConnection:     boolean
  prefersReducedMotion: boolean
  isKeyboardVisible:    boolean
}

const MobileContext = createContext<MobileContextValue | null>(null)

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MobileContextValue>(() => ({
    isMobile:             window.innerWidth < 768,
    isTablet:             window.innerWidth >= 768 && window.innerWidth < 1024,
    isCoarsePointer:      window.matchMedia('(pointer: coarse)').matches,
    isStandalone:         window.matchMedia('(display-mode: standalone)').matches,
    isOnline:             navigator.onLine,
    isSlowConnection:     false,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isKeyboardVisible:    false,
  }))

  useEffect(() => {
    const updateSize = () => setState(s => ({
      ...s,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    }))

    const updateKeyboard = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      setState(s => ({ ...s, isKeyboardVisible: (window.screen.height - vh) > 150 }))
    }

    window.addEventListener('resize',  updateSize,    { passive: true })
    window.addEventListener('online',  () => setState(s => ({ ...s, isOnline: true  })))
    window.addEventListener('offline', () => setState(s => ({ ...s, isOnline: false })))
    window.visualViewport?.addEventListener('resize', updateKeyboard)

    return () => {
      window.removeEventListener('resize',  updateSize)
      window.visualViewport?.removeEventListener('resize', updateKeyboard)
    }
  }, [])

  return (
    <MobileContext.Provider value={state}>
      {children}
    </MobileContext.Provider>
  )
}

export const useMobile = () => {
  const ctx = useContext(MobileContext)
  if (!ctx) throw new Error('useMobile requires MobileProvider')
  return ctx
}
```

### Offline Banner

```tsx
// src/shared/components/feedback/OfflineBanner.tsx
export function OfflineBanner() {
  const { isOnline }   = useMobile()
  const [showBack, setShowBack] = useState(false)
  const prevOnline     = useRef(isOnline)

  useEffect(() => {
    if (!prevOnline.current && isOnline) {
      setShowBack(true)
      const t = setTimeout(() => setShowBack(false), 3000)
      return () => clearTimeout(t)
    }
    prevOnline.current = isOnline
  }, [isOnline])

  if (isOnline && !showBack) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`offline-banner ${!isOnline ? 'offline-banner--offline' : 'offline-banner--online'}`}
    >
      {!isOnline ? '📡 No internet — some features may be unavailable' : '✓ Back online'}
    </div>
  )
}
```

### Adaptive Components

```tsx
// Render different components for mobile vs desktop
function WalletPage() {
  const { isMobile } = useMobile()
  return isMobile
    ? <MobileWalletLayout />   // Bottom sheet, FAB, bottom nav
    : <DesktopWalletLayout />  // Sidebar, data table, persistent nav
}

// Same component, adaptive behavior
function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const { isMobile } = useMobile()
  return isMobile
    ? <TransactionVirtualList transactions={transactions} />
    : <TransactionDataTable   transactions={transactions} />
}
```

### AppShell Composer

```tsx
// src/app/AppShell.tsx
import { Outlet }         from 'react-router-dom'
import { BottomTabNav }   from '@shared/components/layout/BottomTabNav'
import { OfflineBanner }  from '@shared/components/feedback/OfflineBanner'
import { InstallBanner }  from '@shared/components/ui/InstallBanner'
import { SkipLink }       from '@shared/components/layout/SkipLink'
import { AppBar }         from '@shared/components/layout/AppBar'

export function AppShell() {
  return (
    <div className="app">
      <SkipLink />
      <OfflineBanner />
      <InstallBanner />

      <header className="app__header safe-top">
        <AppBar title="WalletPro" />
      </header>

      <main id="main-content" className="app__main" tabIndex={-1}>
        <Outlet />
      </main>

      <BottomTabNav tabs={PRIMARY_TABS} />
    </div>
  )
}
```

---

## 12. Common Mistakes to Avoid

### Viewport and Layout

**Using `100vh` for full-height layouts.** On mobile browsers, `100vh` includes the browser chrome (address bar, toolbars). Content clips. Use `height: 100vh; height: 100dvh;` — the `dvh` overrides the `100vh` on browsers that support it. The `@supports not (height: 100dvh)` fallback covers older browsers.

**Ignoring safe area insets.** Fixed headers and bottom navigation on iPhones without `env(safe-area-inset-*)` padding render behind the notch, Dynamic Island, or home indicator bar. `viewport-fit=cover` must be in the viewport meta tag for insets to be available.

**Not testing at 320px.** The iPhone SE and many Android phones are 320px wide. Fixed-width elements without fluid sizing create horizontal scroll. Always test at this width.

**Building for desktop, shrinking for mobile.** Design the mobile layout first. Every medium-query override you write is debt. The mobile layout should be the natural default, not an afterthought.

### Input and Forms

**Input `font-size` below 16px.** iOS Safari zooms the entire page when an input is focused if `font-size < 16px`. The zoom persists after tap-away. Apply `font-size: max(1rem, 16px)` to all inputs.

**Not setting `inputMode`.** The correct keyboard for the task can halve form completion time on mobile. A numeric field without `inputMode="numeric"` shows the full QWERTY keyboard. A currency field without `inputMode="decimal"` does the same.

**Not using `autoComplete`.** Mobile users rely heavily on autofill. Incorrect or missing `autocomplete` attributes prevent browsers, password managers, and biometric autofill from working. This single omission can double form completion time.

**Not using `enterKeyHint`.** The Enter key label on the virtual keyboard ("Next", "Done", "Search", "Go") provides critical navigation context in multi-step forms. Adding `enterKeyHint` costs zero effort and meaningfully improves flow.

**Submit button behind the keyboard.** When the keyboard opens, it covers the lower viewport. Submit buttons at the bottom of a form become inaccessible without `position: sticky` anchoring.

### Touch and Interaction

**The 300ms tap delay.** Older mobile browsers add a 300ms delay to detect double-taps. Eliminate with `touch-action: manipulation` on all interactive elements — or apply it globally on `html`.

**`-webkit-tap-highlight-color` not removed.** The default gray flash on tap in iOS is removed with `-webkit-tap-highlight-color: transparent`. Without this, all interactive elements flash on tap. Always pair with your own `:active` state feedback.

**Hover-only interactions.** Tooltips, dropdown reveals, and affordances that only appear on `:hover` are completely invisible on touch devices. All interactive affordances must be visible without hover.

**No `:active` state feedback.** On desktop, `:hover` provides continuous feedback. On mobile, the only feedback is `:active`. Without it, the UI feels unresponsive and dead. Add `transform: scale(0.97)` and/or `opacity: 0.85` to all tappable elements.

**Tiny tap targets.** Primary actions under 44×44px cause mis-taps, frustration, and accessibility failures. Use `min-height: 44px; min-width: 44px` universally.

### Performance

**Loading all JavaScript upfront.** On 4G, a 1MB bundle takes 2–4 seconds to parse on a mid-range phone. Split at route boundaries. The initial load must be the shell plus the current route only.

**Animating layout properties.** `height`, `top`, `width`, `margin` trigger layout recalculation on every animation frame. Only animate `transform` and `opacity`. Use `transform: translateY()` instead of `top`.

**Not virtualizing long lists.** Rendering 500 DOM nodes for a transaction feed is a guaranteed frame-rate regression on mobile. Any dynamic list over ~50 items needs `@tanstack/react-virtual`.

**`will-change` on everything.** Each `will-change: transform` promotes an element to its own GPU layer, consuming RAM. Applied broadly, it causes its own performance problems. Only use it immediately before a known animation.

**Not setting passive scroll listeners.** Touch and scroll event listeners that don't declare `{ passive: true }` block the browser's scroll optimization and cause jank. Always use `{ passive: true }` unless you must call `preventDefault()`.

### Navigation and UX

**Desktop navigation on mobile.** Header nav bars, hover dropdowns, and mega menus don't work on touch. Use bottom tab navigation for 3–5 primary destinations, drawers for secondary navigation, and bottom sheets for contextual actions.

**No loading state on route transitions.** SPA transitions can take 200–2000ms on mobile networks. Show a skeleton or spinner immediately on navigation — without it, the app appears frozen.

**No scroll restoration.** When users navigate away from a list and return, they expect their scroll position. React Router 6 has scroll restoration — enable it.

**Disabling zoom.** `user-scalable=no` violates WCAG 1.4.4 and harms accessibility for low-vision users. Never include it.

---

## 13. Mobile-First QA Checklist

**Test on real physical devices.** Browser DevTools mobile simulation does not replicate CPU throttling, real touch behavior, virtual keyboard interactions, hardware-level performance, safe area rendering, or momentum scrolling. Use real devices or BrowserStack.

### Devices to Test On

```
□ iPhone SE (320px — smallest common phone)
□ iPhone 14/15 (390px — current standard)
□ iPhone 14/15 Pro Max (430px — large phone with Dynamic Island)
□ Mid-range Android (Samsung Galaxy A series — represents median real-world performance)
□ iPad (768px portrait, 1024px landscape)
```

### Viewport and Layout
- [ ] No horizontal scroll at 320px, 375px, or 390px viewport widths
- [ ] Layout works correctly in both portrait and landscape
- [ ] `height: 100vh; height: 100dvh;` used for full-height layouts (not `100vh` alone)
- [ ] `viewport-fit=cover` in viewport meta; `env(safe-area-inset-*)` applied to fixed header and bottom nav
- [ ] Fixed header does not cover notch or Dynamic Island
- [ ] Bottom navigation clears the home indicator bar on iPhone
- [ ] Browser address bar show/hide does not cause CLS (layout shift)
- [ ] Content visible and usable at 320px without horizontal scroll

### Typography
- [ ] All body text minimum 16px on mobile
- [ ] All input, textarea, select `font-size` minimum 16px (no iOS auto-zoom)
- [ ] Line height at least 1.5 on body text
- [ ] Max 65 characters per line for reading comfort

### Touch Interactions
- [ ] All primary actions minimum 44×44px touch target
- [ ] No hover-only interactions (all affordances visible without `:hover`)
- [ ] `-webkit-tap-highlight-color: transparent` applied to all interactive elements
- [ ] `touch-action: manipulation` applied to remove 300ms tap delay
- [ ] Visible `:active` state on all tappable elements (scale + opacity)
- [ ] Scroll event listeners use `{ passive: true }`

### Forms
- [ ] Correct `type` on all inputs (email, tel, number, search, etc.)
- [ ] Correct `inputMode` on all inputs (numeric, decimal, email, tel)
- [ ] Correct `autoComplete` on all form fields
- [ ] `enterKeyHint` set on multi-step form inputs
- [ ] Active input scrolls into view when keyboard opens
- [ ] Submit button accessible when keyboard is open (sticky positioning)
- [ ] No layout shifts when keyboard opens or closes
- [ ] Password manager and biometric autofill works correctly

### Navigation
- [ ] Primary navigation uses bottom tab bar on mobile
- [ ] Browser back button and swipe-back work correctly
- [ ] Scroll position restored when navigating back to a list
- [ ] Route transitions show loading state immediately (no frozen-app feel)
- [ ] Deep links resolve correctly to the correct route

### Performance (test on mid-range Android with DevTools CPU 4× throttle)
- [ ] LCP < 2.5s on simulated 4G
- [ ] INP < 200ms on all interactions
- [ ] CLS < 0.1
- [ ] Initial JS bundle < 200kb gzipped
- [ ] Only `transform` and `opacity` animated (no height, top, width, margin)
- [ ] Long lists (> 50 items) virtualized with `@tanstack/react-virtual`
- [ ] LCP image has `loading="eager"` and is preloaded in `<head>`
- [ ] Below-fold images use `loading="lazy"`
- [ ] Fonts preloaded with `font-display: swap`

### Scroll and Sticky Elements
- [ ] Momentum scrolling on iOS (`-webkit-overflow-scrolling: touch`)
- [ ] `overscroll-behavior: contain` on panels, modals, drawers
- [ ] Sticky headers don't obscure content on scroll
- [ ] Body scroll locked while modal/bottom sheet is open (no bleed-through on iOS)

### Modals and Bottom Sheets
- [ ] Focus moves inside modal/sheet when opened
- [ ] Focus returns to trigger when modal/sheet closes
- [ ] Focus trapped inside (Tab cycles within)
- [ ] Escape key closes modal/sheet
- [ ] Backdrop tap closes modal/sheet
- [ ] Bottom sheet respects `env(safe-area-inset-bottom)`

### Accessibility on Mobile
- [ ] Zoom not disabled (`user-scalable=no` is absent from viewport meta)
- [ ] All touch targets minimum 44×44px
- [ ] No information conveyed by color alone
- [ ] Dynamic content changes announced via `aria-live`
- [ ] All gesture interactions have non-gesture button alternatives
- [ ] Tested with VoiceOver (iOS) — swipe navigation, form labels, live regions
- [ ] Tested with TalkBack (Android) — same criteria
- [ ] Both portrait and landscape orientations tested

### PWA
- [ ] `manifest.json` present, linked in `<head>`, valid
- [ ] All icon sizes present: 72, 96, 128, 144, 152, 192 (maskable), 384, 512 (maskable)
- [ ] App installs from browser prompt and launches to `start_url`
- [ ] Status bar/theme color matches app branding
- [ ] App functions correctly in standalone mode (no browser chrome)
- [ ] Offline state handled gracefully (custom offline page, not browser generic error)
- [ ] Core routes work offline via service worker cache
- [ ] App recovers automatically when connection returns

### Dark Mode and Visual
- [ ] `prefers-color-scheme: dark` respected
- [ ] Theme color meta tag correct in both modes
- [ ] No flash of wrong color on load
- [ ] Images sharp on Retina/high-DPI screens
- [ ] Animations disabled when `prefers-reduced-motion` matches

---

*React 18 · Vite 5 · react-router-dom v6 · @tanstack/react-virtual · react-swipeable · framer-motion · vite-plugin-pwa · TypeScript 5*
*WCAG 2.2 AA · W3C Mobile Guidance · web.dev PWA Checklist · MDN Visual Viewport API · CSS dvh · CSS safe-area-inset env() · Pointer Events API · Vibration API*
