# React Accessibility Super Guide
### The Complete Mandatory Engineering Standard for Inclusive UI

> **This guide is an enforcement standard, not a suggestion document.**
> Every component, page, view, form, and interactive element must satisfy this standard before it is considered complete.
> **Inaccessible code is incomplete code.**

> **Baseline:** WCAG 2.2 Level AA minimum. Level AAA for critical flows (auth, payments, forms).
> **References:** WAI-ARIA Authoring Practices Guide · W3C WCAG 2.2 · MDN Web Docs · React Accessibility Docs

---

## Table of Contents

1. [Accessibility Principles](#1-accessibility-principles)
2. [Mandatory Rules for All New UI](#2-mandatory-rules-for-all-new-ui)
3. [Semantic HTML and Document Structure](#3-semantic-html-and-document-structure)
4. [Keyboard Navigation](#4-keyboard-navigation)
5. [Focus Management](#5-focus-management)
6. [Screen Reader Support](#6-screen-reader-support)
7. [Forms, Labels, and Validation](#7-forms-labels-and-validation)
8. [Buttons, Links, and Interactive Controls](#8-buttons-links-and-interactive-controls)
9. [ARIA — Usage and Restraint](#9-aria--usage-and-restraint)
10. [Interactive UI Patterns](#10-interactive-ui-patterns)
11. [Images, Icons, and SVGs](#11-images-icons-and-svgs)
12. [Color, Contrast, and Visual Design](#12-color-contrast-and-visual-design)
13. [Text Resizing, Zoom, and Reflow](#13-text-resizing-zoom-and-reflow)
14. [Dynamic States — Loading, Error, Empty, Success](#14-dynamic-states--loading-error-empty-success)
15. [Notifications and Live Regions](#15-notifications-and-live-regions)
16. [React-Specific Patterns and Hooks](#16-react-specific-patterns-and-hooks)
17. [Reusable Component Library](#17-reusable-component-library)
18. [Testing and Validation Workflow](#18-testing-and-validation-workflow)
19. [Common Mistakes to Avoid](#19-common-mistakes-to-avoid)
20. [Mandatory Enforcement Checklist](#20-mandatory-enforcement-checklist)

---

## 1. Accessibility Principles

### The Engineering Mandate

Accessibility is not a feature, a sprint task, or a compliance checkbox. It is a baseline engineering quality requirement — in the same category as type safety, test coverage, and security. A component that renders visually but is unusable by someone relying on a screen reader, keyboard, voice control, or zoom is a broken component.

Accessible sites are not parallel experiences. They are the same experience, built correctly. Users with disabilities deserve equal functionality, not a stripped-down alternative.

**The strict rule: if the UI is not accessible, it is not done.**

Every pull request that touches UI must include accessibility verification. Accessibility violations are blocking issues. All components must pass automated tests and a keyboard pass before merging. Screen reader testing is required for new patterns and critical flows.

### The POUR Foundation

Every user interface must be:

**Perceivable** — Nothing important can be invisible to all the senses a user has available. Information communicated only by color, only by position, or only by visual animation will be invisible to many users.

**Operable** — Nothing should require an interaction a user cannot perform. Full keyboard operability, sufficient time, no seizure-triggering content, adequate target sizes.

**Understandable** — Language is declared, errors are explained in words, behavior is predictable across pages and components.

**Robust** — Content must be interpretable by a wide variety of assistive technologies, both current and future. This means valid, semantic HTML and correct ARIA usage — not just visual correctness.

### Who Is Affected

Accessibility engineering serves users with:

- **Visual impairments** — blindness (screen readers), low vision (zoom, high contrast, large text), color blindness
- **Motor impairments** — no mouse use, switch access, voice control, limited fine motor control, tremor
- **Cognitive impairments** — reading disabilities, attention disorders, memory impairments, learning differences
- **Hearing impairments** — captions, transcripts for audio content
- **Vestibular disorders** — motion sensitivity
- **Temporary impairments** — broken arm, post-surgery, bright sunlight on a phone screen

Designing for these users produces UI that is more usable for everyone.

### The Core Mindset

- Use **native HTML first** — native semantics are more reliable and require less maintenance than ARIA recreations
- Preserve **meaning, structure, and operability** — not just visual appearance
- Never hide state changes from assistive technology
- Do not trade accessibility for aesthetics
- Test with real assistive technology — not only automated scanners
- Automated tools catch approximately 30–40% of issues; manual keyboard and screen reader testing are non-optional

---

## 2. Mandatory Rules for All New UI

These rules apply to every React component, page, view, form, and interactive element without exception.

**R1 — Use the correct native element first.**
Use `<button>` for actions, `<a href>` for navigation, real headings, real lists, real tables, real form controls. Native semantics are more reliable and require less effort than recreating them with `div` + ARIA. If a native element exists for the purpose, use it.

**R2 — Everything interactive must be fully keyboard operable.**
No mouse-only interactions. No hover-only disclosure. No keyboard traps. Every action reachable by pointer must be reachable by keyboard alone.

**R3 — Focus must always be visible.**
Never remove `outline` without a clearly visible custom `:focus-visible` replacement. WCAG 2.2 has stricter focus visibility requirements than previous versions. A focused element that is invisible to keyboard users is as broken as a button with no click handler.

**R4 — Every form control must have a programmatically associated label.**
Placeholder text is supplemental, not a label. Every `<input>`, `<select>`, and `<textarea>` needs a `<label>` with matching `htmlFor`/`id`, or `aria-labelledby`/`aria-label`. `useId()` generates stable, SSR-safe IDs.

**R5 — Error messages must be programmatically associated and announced.**
Validation errors use `aria-describedby` to link to the input. They use `role="alert"` or `aria-live="polite"` so screen reader users hear them without manually searching the page.

**R6 — Color is never the only means of conveying information.**
Status, validation state, chart data, and any meaning communicated by color must have a secondary indicator: text, icon, pattern, or shape.

**R7 — Color contrast meets WCAG 2.2 AA minimums.**
Normal text: 4.5:1. Large text (18pt+ or 14pt+ bold): 3:1. UI components and graphical elements: 3:1. Focus indicators: 3:1 against adjacent background.

**R8 — Modals trap focus.**
When a dialog opens, focus moves inside. Tab and Shift+Tab cycle only within the dialog. Focus returns to the trigger when it closes. No exceptions.

**R9 — Dynamic content changes are announced.**
Status updates, loading states, error messages, and success notifications that appear without a full page load must reach screen reader users via `aria-live` regions or `role="alert"`.

**R10 — Page titles are unique, descriptive, and updated on route change.**
Every route has a unique `<title>`. It is updated on every client-side navigation. SPA route changes are otherwise invisible to screen reader users.

**R11 — Heading structure is logical and sequential.**
One `<h1>` per page. No skipped heading levels. Levels reflect document structure, not visual styling.

**R12 — Motion and animation respect `prefers-reduced-motion`.**
Any animation or motion effect must be suppressed or replaced with an instant alternative when this media query matches.

**R13 — Semantic HTML is always the first choice.**
Ask: does a native element exist for this purpose? If yes, use it. `<button>` over `<div role="button">`. `<nav>` over `<div aria-label="navigation">`.

**R14 — Touch and click targets meet size requirements.**
WCAG 2.2 requires a minimum 24×24 CSS px target size (AA) with exceptions. Aim for 44×44 px for mobile touch targets.

**R15 — Every new component must pass the checklist in Section 20.**

---

## 3. Semantic HTML and Document Structure

### Use Elements for Their Intended Purpose

Native semantic HTML gives assistive technologies the information they need without extra ARIA. Before reaching for any ARIA attribute, ask whether a native HTML element already communicates the same meaning.

```tsx
// ❌ Div soup — no semantic information for assistive technology
<div className="page">
  <div className="top-bar">
    <div className="brand">WalletPro</div>
    <div className="menu">...</div>
  </div>
  <div className="main">
    <div className="sidebar">...</div>
    <div className="content">
      <div className="section-title">Recent Transactions</div>
    </div>
  </div>
</div>

// ✅ Semantic structure — screen reader users navigate by landmarks
<>
  <SkipLink />
  <header>
    <a href="/" aria-label="WalletPro home">WalletPro</a>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main id="main-content" tabIndex={-1}>
    <h1>Recent Transactions</h1>
    <aside aria-label="Account summary">...</aside>
  </main>
  <footer>...</footer>
</>
```

### Landmark Regions

Every page must define these so screen reader users can jump directly to content:

| HTML Element | ARIA Role | Rule |
|---|---|---|
| `<header>` | `banner` | One per page, not inside `<article>` or `<section>` |
| `<nav>` | `navigation` | Label with `aria-label` when multiple exist |
| `<main>` | `main` | Exactly one per page. Give it `id="main-content"` |
| `<footer>` | `contentinfo` | One per page |
| `<aside>` | `complementary` | Supplementary content |
| `<section>` | `region` | Only with a heading; use `aria-labelledby` |
| `<form>` | `form` | With `aria-label` or `aria-labelledby` |

Do not add redundant ARIA to native landmarks:

```tsx
// ❌ Redundant — <nav> already has role="navigation"
<nav role="navigation">

// ❌ Redundant — <main> already has role="main"
<main role="main">

// ✅ Add label when multiple of the same landmark exist
<nav aria-label="Main navigation">
<nav aria-label="Breadcrumb">
<nav aria-label="Footer links">
```

### Heading Structure

Headings are the primary navigation mechanism for screen reader users. Use CSS to control visual size; use heading levels to communicate structure.

```tsx
// ❌ Headings chosen for visual size, not structure
<h3>Dashboard</h3>       // page title styled as h3
<h1>Recent Activity</h1> // section title styled as h1
<h3>Balance</h3>         // skipped h2

// ✅ Headings reflect document hierarchy
<h1>Dashboard</h1>
  <h2>Recent Activity</h2>
    <h3>This Month</h3>
  <h2>Account Balance</h2>
    <h3>Available Funds</h3>

// Control visual size with CSS, not heading level
<h2 className="text-xl font-bold">Account Balance</h2>
```

### Skip Link

The first focusable element on every page must be a skip link. Without it, keyboard users tab through every navigation item on every page.

```tsx
// src/shared/components/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  )
}

// src/shared/components/layout/AppLayout.tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />    {/* Always the first focusable element */}
      <header>...</header>
      <main id="main-content" tabIndex={-1}>
        {/* tabIndex={-1} allows programmatic focus without adding a tab stop */}
        {children}
      </main>
      <footer>...</footer>
    </>
  )
}
```

```css
/* src/styles/global.css */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--color-brand-primary);
  color: white;
  padding: 0.5rem 1rem;
  z-index: 9999;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0 0 var(--radius-md) 0;
}
.skip-link:focus { top: 0; }

/* Visually hidden utility — still read by screen readers */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.sr-only.focusable:focus {
  position: static;
  width: auto; height: auto;
  padding: initial; margin: initial;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Page Titles on Route Change

```tsx
// Every route-level component must update the document title
// Use the SEO component pattern from the master engineering guide:
<SEO title="Dashboard" description="..." noIndex />

// For dynamic content, update when data loads:
<SEO title={data ? `Transaction ${data.id}` : 'Loading transaction'} description="..." />
```

---

## 4. Keyboard Navigation

### The Keyboard Contract

Every user action achievable with a mouse must be achievable with the keyboard alone. No exceptions.

| Key | Expected behavior |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift+Tab` | Move focus to previous interactive element |
| `Enter` | Activate button or link; submit form |
| `Space` | Activate button; toggle checkbox |
| `Arrow keys` | Navigate within a widget (radio group, listbox, tabs, menu) |
| `Escape` | Close modal, dropdown, tooltip; cancel action |
| `Home` / `End` | Move to first/last item in a list or widget |
| `Page Up` / `Page Down` | Scroll or navigate long lists |

### Tab Order Rules

Tab order must follow the visual reading order (LTR: left-to-right, top-to-bottom). Never use positive `tabIndex` values — they break natural tab order and create unpredictable navigation.

```tsx
// ❌ Positive tabIndex — breaks natural order globally
<button tabIndex={3}>Third visually, first in tab</button>
<button tabIndex={1}>First in tab, third visually</button>

// ✅ Rely on DOM order; use tabIndex only for these two cases:
tabIndex={0}   // Add non-interactive element to tab order (rare — prefer native elements)
tabIndex={-1}  // Programmatic focus only, not in tab sequence
```

### Visible Focus — Never Remove, Always Enhance

```css
/* ❌ Forbidden — removes all focus indication */
*:focus { outline: none; }
button:focus { outline: 0; }

/* ✅ Correct — keyboard focus visible, click focus suppressed */
:focus-visible {
  outline: 3px solid var(--color-brand-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
:focus:not(:focus-visible) {
  outline: none;
}

/* Custom focus for buttons */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}

/* High contrast mode */
@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid ButtonText;
    outline-offset: 2px;
  }
}
```

### Custom Widget Keyboard Patterns

When you must build a custom widget, implement the complete keyboard contract. The WAI-ARIA Authoring Practices Guide defines the keyboard patterns for every widget type.

```tsx
// Custom expandable toggle — implementing keyboard for a disclosure widget
// (Prefer native <button> which handles Enter and Space automatically)

interface DisclosureProps {
  isOpen:   boolean
  onToggle: () => void
  label:    string
  children: React.ReactNode
}

export function Disclosure({ isOpen, onToggle, label, children }: DisclosureProps) {
  return (
    <div>
      {/* Native <button> handles Enter and Space automatically */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="disclosure-panel"
        onClick={onToggle}
      >
        {label}
        <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>
      <div id="disclosure-panel" hidden={!isOpen}>
        {children}
      </div>
    </div>
  )
}
```

---

## 5. Focus Management

### When to Manage Focus

| Trigger | Where focus should go |
|---|---|
| Modal opens | First focusable element inside, or the modal heading |
| Modal closes | The element that triggered the modal |
| Route change (SPA) | The page `<h1>` or `<main>` element |
| Inline validation fails | Error summary (if present) or first invalid field |
| Form submits successfully | Success confirmation, or first field if form resets |
| List item deleted | Previous item, next item, or status message if list empties |
| Section expands (accordion) | Stay on trigger button — don't move focus |
| Toast/notification appears | Stay at current position; content announced via live region |

### Focus Management Hooks

```typescript
// src/shared/hooks/useFocusRef.ts
import { useEffect, useRef } from 'react'

/**
 * Focuses the referenced element when `shouldFocus` becomes true.
 * Use for: modals, panels, error summaries, route changes.
 */
export function useFocusRef<T extends HTMLElement>(shouldFocus: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (shouldFocus && ref.current) ref.current.focus()
  }, [shouldFocus])
  return ref
}
```

```typescript
// src/shared/hooks/usePreviousFocus.ts
import { useEffect, useRef } from 'react'

/**
 * Saves the focused element when isOpen becomes true.
 * Restores focus to that element when isOpen becomes false.
 * Essential for: modals, drawers, dropdowns.
 */
export function usePreviousFocus(isOpen: boolean) {
  const previousRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (isOpen) {
      previousRef.current = document.activeElement as HTMLElement
    } else {
      if (previousRef.current) {
        previousRef.current.focus()
        previousRef.current = null
      }
    }
  }, [isOpen])
}
```

```typescript
// src/shared/hooks/useFocusTrap.ts
import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])', 'details > summary',
].join(', ')

/**
 * Traps Tab and Shift+Tab focus within the referenced container.
 * Required for modals, dialogs, and any overlay covering the page.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean,
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    const container = containerRef.current

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(el => !el.closest('[hidden]'))
      if (!focusable.length) { e.preventDefault(); return }

      const first = focusable[0]
      const last  = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef])
}
```

```typescript
// src/shared/hooks/useListKeyboardNavigation.ts
import { useState, useCallback } from 'react'

/**
 * Arrow key navigation for listboxes, menus, and custom list widgets.
 * Implements the WAI-ARIA keyboard pattern for lists.
 */
export function useListKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
) {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => (i + 1) % itemCount)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + itemCount) % itemCount)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(itemCount - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) onSelect(focusedIndex)
        break
    }
  }, [itemCount, focusedIndex, onSelect])

  return { focusedIndex, setFocusedIndex, handleKeyDown }
}
```

### Route Change Focus — SPA Requirement

```tsx
// src/analytics/RouteChangeTracker.tsx
// Extend existing RouteChangeTracker to handle focus

import { useEffect, useRef } from 'react'
import { useLocation }       from 'react-router-dom'

/**
 * On SPA route change:
 * 1. Moves focus to <main> so screen reader users know a new page loaded
 * 2. Updates document title (via SEO component on each page)
 *
 * Without this, SPA navigation is invisible to screen reader and keyboard users.
 */
export function RouteChangeTracker() {
  const location  = useLocation()
  const isInitial = useRef(true)

  useEffect(() => {
    if (isInitial.current) { isInitial.current = false; return }
    // <main id="main-content" tabIndex={-1}> must exist in AppLayout
    const main = document.getElementById('main-content')
    if (main) main.focus()
  }, [location.pathname])

  return null
}

// Alternative: AccessiblePage wrapper per route (from WAI guidance)
export function AccessiblePage({ title, children }: { title: string; children: React.ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const location   = useLocation()

  useEffect(() => {
    document.title = title
    headingRef.current?.focus()
  }, [location.pathname, title])

  return (
    <main id="main-content">
      <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
      {children}
    </main>
  )
}
```

---

## 6. Screen Reader Support

### How Screen Readers Compute Information

Screen readers announce element **role**, **name**, **state**, and **value** from the accessibility tree. What matters is the accessibility tree, not the visual rendering.

- Text hidden with `.sr-only` CSS is still read
- Text hidden with `display: none` or `visibility: hidden` is NOT read
- `aria-hidden="true"` hides from screen readers but not visually
- The accessible name computation order: `aria-labelledby` → `aria-label` → native label → `title`

### VisuallyHidden Component

```tsx
// src/shared/components/ui/VisuallyHidden.tsx
// Visually hidden but available to screen readers

interface VisuallyHiddenProps {
  children: React.ReactNode
  as?: React.ElementType
  focusable?: boolean  // Becomes visible when focused (skip links)
}

export function VisuallyHidden({
  children,
  as: Tag = 'span',
  focusable = false,
}: VisuallyHiddenProps) {
  return (
    <Tag className={focusable ? 'sr-only focusable' : 'sr-only'}>
      {children}
    </Tag>
  )
}

// Usage examples:
// Icon button — screen reader reads the label, sighted users see the icon
<button type="button" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

// Providing additional context without cluttering the visual layout
<button type="button" onClick={() => delete(tx.id)}>
  Delete
  <VisuallyHidden>transaction {tx.description}</VisuallyHidden>
</button>
// Screen reader: "Delete transaction Transfer to savings, button"
```

### Accessible Names — Computed in This Order

```tsx
// 1. aria-labelledby — best when a visible label element exists
<section aria-labelledby="balance-heading">
  <h2 id="balance-heading">Available Balance</h2>
  <p>$150.25</p>
</section>

// 2. aria-label — for elements without visible text
<button aria-label="Close dialog" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
</button>

// 3. Native label (inputs) — preferred for form fields
<label htmlFor="email-input">Email address</label>
<input id="email-input" type="email" />

// 4. alt text (images) — the native label mechanism for images
<img src="chart.png" alt="Sales up 12% in Q4" />
```

---

## 7. Forms, Labels, and Validation

### Non-Negotiable Form Rules

- Every field has a `<label>` with `htmlFor` matching the input's `id`
- Placeholder text is supplemental — never a label replacement
- Required fields: `aria-required="true"` AND visible indicator
- Error messages: `aria-describedby` on input + `role="alert"` on message container
- Groups of related inputs: `<fieldset>` + `<legend>`
- Common fields: correct `autocomplete` attribute
- All `id` values: generated with `useId()` — never hardcoded

### Complete TextField Component

```tsx
// src/shared/components/ui/TextField.tsx
import { useId, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label:     string
  hint?:     string
  error?:    string
  hideLabel?: boolean  // Hides label visually but keeps it for screen readers
}

export function TextField({
  label,
  hint,
  error,
  id,
  className,
  required,
  hideLabel = false,
  ...rest
}: TextFieldProps) {
  const generatedId = useId()
  const inputId     = id ?? generatedId
  const hintId      = hint  ? `${inputId}-hint`  : undefined
  const errorId     = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label
        htmlFor={inputId}
        className={clsx('field__label', hideLabel && 'sr-only')}
      >
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="field__required">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>

      {hint && (
        <p id={hintId} className="field__hint">{hint}</p>
      )}

      <input
        id={inputId}
        className={clsx('field__input', error && 'field__input--error', className)}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      />

      {error && (
        <p id={errorId} role="alert" className="field__error">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  )
}
```

### Fieldset — Radio and Checkbox Groups

```tsx
// src/shared/components/ui/Fieldset.tsx
interface FieldsetProps {
  legend:   string
  error?:   string
  required?: boolean
  children: React.ReactNode
}

export function Fieldset({ legend, error, required, children }: FieldsetProps) {
  const errorId = useId()
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend>
        {legend}
        {required && (
          <>
            <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </legend>
      {children}
      {error && (
        <p id={errorId} role="alert" className="field__error">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </fieldset>
  )
}

// src/shared/components/ui/RadioGroup.tsx
interface RadioOption { value: string; label: string; hint?: string }

interface RadioGroupProps {
  legend:    string
  name:      string
  options:   RadioOption[]
  value:     string
  onChange:  (value: string) => void
  error?:    string
  required?: boolean
}

export function RadioGroup({ legend, name, options, value, onChange, error, required }: RadioGroupProps) {
  // Arrow keys cycle through radio options (WAI keyboard pattern)
  function handleKeyDown(e: React.KeyboardEvent, current: string) {
    const idx  = options.findIndex(o => o.value === current)
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(options[(idx + 1) % options.length].value)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(options[(idx - 1 + options.length) % options.length].value)
    }
  }

  return (
    <Fieldset legend={legend} error={error} required={required}>
      {options.map(option => (
        <label key={option.value} className="radio-option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            onKeyDown={e => handleKeyDown(e, option.value)}
            aria-required={required || undefined}
          />
          {option.label}
          {option.hint && (
            <span className="radio-option__hint">{option.hint}</span>
          )}
        </label>
      ))}
    </Fieldset>
  )
}
```

### Error Summary — Focus Management for Multi-Field Validation

```tsx
// src/shared/components/feedback/ErrorSummary.tsx
import { useEffect, useRef } from 'react'

interface ErrorSummaryProps {
  errors: string[]
  fieldLinks?: Array<{ id: string; message: string }>
}

/**
 * Renders all form errors in one place and moves focus to it
 * when errors appear. Screen reader users hear all errors at once.
 * Link each error to its field for quick navigation.
 */
export function ErrorSummary({ errors, fieldLinks }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (errors.length > 0 && ref.current) {
      ref.current.focus()
    }
  }, [errors])

  if (errors.length === 0) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="error-summary"
    >
      <h2 id="error-summary-title">
        {errors.length} error{errors.length !== 1 ? 's' : ''} found. Please correct the following:
      </h2>
      <ul>
        {fieldLinks
          ? fieldLinks.map(f => (
              <li key={f.id}>
                <a href={`#${f.id}`}>{f.message}</a>
              </li>
            ))
          : errors.map(error => <li key={error}>{error}</li>)
        }
      </ul>
    </div>
  )
}
```

### Complete Login Form — All Patterns Together

```tsx
// src/features/auth/components/LoginForm.tsx
import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { useRef, useEffect } from 'react'
import { TextField }   from '@shared/components/ui/TextField'
import { Button }      from '@shared/components/ui/Button'
import { ErrorSummary } from '@shared/components/feedback/ErrorSummary'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const errorList = [
    errors.email?.message,
    errors.password?.message,
  ].filter(Boolean) as string[]

  const fieldLinks = [
    errors.email    && { id: 'email-input',    message: `Email: ${errors.email.message}` },
    errors.password && { id: 'password-input', message: `Password: ${errors.password.message}` },
  ].filter(Boolean) as Array<{ id: string; message: string }>

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Sign in">
      <ErrorSummary errors={errorList} fieldLinks={fieldLinks} />

      <TextField
        label="Email address"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        hint="Must be at least 8 characters"
        required
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        aria-describedby={isSubmitting ? 'submit-status' : undefined}
      >
        Sign in
      </Button>

      {isSubmitting && (
        <span id="submit-status" className="sr-only" aria-live="polite">
          Signing in, please wait
        </span>
      )}
    </form>
  )
}
```

---

## 8. Buttons, Links, and Interactive Controls

### The Hard Rule

| Element | Use for | Keyboard |
|---|---|---|
| `<button>` | Actions (open, delete, submit, toggle) | Enter and Space |
| `<a href>` | Navigation to a URL | Enter only |

Never use a `<div>` or `<span>` as a clickable element. Never use a `<button>` to navigate. Never use an `<a>` without an `href` attribute.

```tsx
// ❌ Wrong element for the purpose
<a href="#" onClick={openModal}>Open</a>     // Link used as action
<div onClick={save} className="btn">Save</div> // Div used as button
<button onClick={() => navigate('/dashboard')}>Dashboard</button> // Button used as link

// ✅ Correct element
<button type="button" onClick={openModal}>Open settings</button>
<button type="submit">Save</button>
<Link to="/dashboard">Dashboard</Link>
<a href="https://example.com" rel="noopener noreferrer">External resource</a>
```

### Button Component — Accessible Reference Implementation

```tsx
// src/shared/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  isLoading?: boolean
  icon?:      React.ReactNode  // Decorative icon — hidden from screen readers
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type      = 'button',
      variant   = 'primary',
      size      = 'md',
      isLoading = false,
      disabled,
      icon,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)}
      {...rest}
    >
      {icon && <span aria-hidden="true" className="btn__icon">{icon}</span>}
      {isLoading && <Spinner aria-hidden="true" className="btn__spinner" />}
      <span className="btn__label">{children}</span>
    </button>
  ),
)
Button.displayName = 'Button'
```

### Icon-Only Buttons

```tsx
// ❌ No accessible name
<button onClick={onClose}><XIcon /></button>

// ✅ aria-label provides the accessible name
<button type="button" onClick={onClose} aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// ✅ Visually hidden text — accessible AND visible at high zoom
<button type="button" onClick={onClose}>
  <XIcon aria-hidden="true" />
  <span className="sr-only">Close dialog</span>
</button>
```

### Toggle Buttons

```tsx
// src/shared/components/ui/ToggleButton.tsx
export function ToggleButton({ isPressed, onToggle, label, pressedLabel }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isPressed}  // Communicates toggle state to screen readers
      className={clsx('toggle-btn', isPressed && 'toggle-btn--pressed')}
    >
      {isPressed && pressedLabel ? pressedLabel : label}
    </button>
  )
}
// Screen reader: "Mute notifications, toggle button" → "Unmute notifications, toggle button, pressed"
```

### Disabled States

Prefer `aria-disabled` over `disabled` when the reason for unavailability needs to be communicated. `disabled` removes focus entirely — users cannot discover why.

```tsx
// ❌ disabled removes focus — keyboard user cannot find out why
<button disabled>Transfer</button>

// ✅ aria-disabled keeps focus so users can read the explanation
<button
  aria-disabled={!canTransfer}
  aria-describedby={!canTransfer ? 'transfer-reason' : undefined}
  onClick={canTransfer ? handleTransfer : undefined}
  className={clsx('btn', !canTransfer && 'btn--disabled')}
>
  Transfer
</button>
{!canTransfer && (
  <p id="transfer-reason" className="sr-only">
    Transfers are unavailable until your account is verified
  </p>
)}
```

---

## 9. ARIA — Usage and Restraint

### The Four ARIA Rules

**Rule 1: Don't use ARIA if a native HTML element or attribute already provides the same semantics.**

```tsx
// ❌ Redundant ARIA on native elements
<button role="button">Submit</button>     // role redundant
<nav role="navigation">...</nav>          // role redundant
<h2 role="heading" aria-level="2">...</h2> // both redundant

// ✅ Trust native semantics
<button>Submit</button>
<nav>...</nav>
<h2>...</h2>
```

**Rule 2: Don't change native semantics without very good reason.**

```tsx
// ❌ Overriding semantics confuses screen readers
<button role="link">Go to settings</button>

// ✅ Use the right element
<a href="/settings">Go to settings</a>
```

**Rule 3: All interactive ARIA widgets must be keyboard accessible.**

```tsx
// ❌ role="button" without keyboard handler
<span role="button" onClick={open}>Open</span>

// ✅ role="button" needs keyboard (but prefer real <button>)
<span
  role="button"
  tabIndex={0}
  onClick={open}
  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && open()}
>
  Open
</span>
// Seriously, just use <button type="button" onClick={open}>Open</button>
```

**Rule 4: Don't use `aria-hidden="true"` on focusable elements.**

```tsx
// ❌ Creates "ghost focus" — focus lands but screen reader says nothing
<button aria-hidden="true">Settings</button>

// ✅ If hiding, also remove from tab order (or don't render at all)
<button aria-hidden="true" tabIndex={-1}>Settings</button>
{isVisible && <button>Settings</button>}
```

### Correct ARIA Usage Reference

```tsx
// Expanded/collapsed state
<button aria-expanded={isOpen} aria-controls="panel-id">Show details</button>
<div id="panel-id">...</div>

// Current page in navigation
<nav aria-label="Main">
  <a href="/dashboard" aria-current="page">Dashboard</a>
  <a href="/wallet">Wallet</a>
</nav>

// Sort direction in tables
<th scope="col" aria-sort="ascending">Amount</th>
<th scope="col" aria-sort="none">Date</th>

// Loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Invalid input
<input aria-invalid={!!error} aria-describedby={errorId} />

// Live regions
<div role="status" aria-live="polite" aria-atomic="true">{statusMessage}</div>
<div role="alert" aria-live="assertive">{errorMessage}</div>

// Selected state (tabs, listboxes, tree items)
<button role="tab" aria-selected={isActive}>Profile</button>

// Popup/menu button
<button aria-haspopup="menu" aria-expanded={isMenuOpen}>Options</button>
```

---

## 10. Interactive UI Patterns

All patterns follow the WAI-ARIA Authoring Practices Guide (APG). Do not invent custom keyboard or ARIA patterns for widgets that the APG already defines.

### Modal / Dialog

```tsx
// src/shared/components/ui/Modal.tsx
import { useEffect, useRef } from 'react'
import { useFocusTrap }      from '@shared/hooks/useFocusTrap'
import { usePreviousFocus }  from '@shared/hooks/usePreviousFocus'
import { useFocusRef }       from '@shared/hooks/useFocusRef'

interface ModalProps {
  isOpen:       boolean
  onClose:      () => void
  title:        string
  description?: string
  children:     React.ReactNode
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  const titleId       = 'modal-title'
  const descId        = description ? 'modal-desc' : undefined
  const containerRef  = useRef<HTMLDivElement>(null)
  const headingRef    = useFocusRef<HTMLHeadingElement>(isOpen)

  useFocusTrap(containerRef, isOpen)
  usePreviousFocus(isOpen)

  // Escape closes the dialog
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="modal"
      >
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="modal__title">
          {title}
        </h2>
        {description && <p id={descId} className="modal__description">{description}</p>}
        <div className="modal__body">{children}</div>
        <button type="button" onClick={onClose} aria-label="Close dialog" className="modal__close">
          <CloseIcon aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
```

### Tabs — APG Pattern

```tsx
// src/shared/components/ui/Tabs.tsx
// WAI-ARIA Tabs pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

interface Tab { id: string; label: string; content: React.ReactNode }

export function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const tablistRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(e: React.KeyboardEvent, currentId: string) {
    const idx = tabs.findIndex(t => t.id === currentId)
    let next: number | null = null
    if (e.key === 'ArrowRight')  next = (idx + 1) % tabs.length
    else if (e.key === 'ArrowLeft')  next = (idx - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home')   next = 0
    else if (e.key === 'End')    next = tabs.length - 1
    if (next !== null) {
      e.preventDefault()
      setActiveTab(tabs[next].id)
      tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next].focus()
    }
  }

  return (
    <div>
      <div role="tablist" aria-label={label} ref={tablistRef}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={e => handleKeyDown(e, tab.id)}
            className={clsx('tab', activeTab === tab.id && 'tab--active')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

### Accordion — APG Pattern

```tsx
// src/shared/components/ui/Accordion.tsx
interface AccordionItem { id: string; heading: string; content: React.ReactNode }

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setOpen(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <div>
      {items.map(item => {
        const isOpen  = open.has(item.id)
        const btnId   = `acc-btn-${item.id}`
        const panelId = `acc-panel-${item.id}`
        return (
          <div key={item.id} className="accordion-item">
            {/* Heading wraps the button — correct for document outline */}
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="accordion-trigger"
              >
                {item.heading}
                <span aria-hidden="true" className="accordion-icon">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="accordion-panel"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### Dropdown Menu — APG Menu Button Pattern

```tsx
// src/shared/components/ui/DropdownMenu.tsx
interface MenuItem { label: string; onSelect: () => void; disabled?: boolean }

export function DropdownMenu({ trigger, items }: { trigger: string; items: MenuItem[] }) {
  const [isOpen, setIsOpen]   = useState(false)
  const [focused, setFocused] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef    = useRef<HTMLUListElement>(null)

  usePreviousFocus(isOpen)

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); setIsOpen(true); setFocused(0) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIsOpen(true); setFocused(items.length - 1) }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape')     { setIsOpen(false); triggerRef.current?.focus() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(i => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Home')  setFocused(0)
    else if (e.key === 'End')   setFocused(items.length - 1)
    else if (e.key === 'Tab')   setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen && focused >= 0) {
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[focused]?.focus()
    }
  }, [focused, isOpen])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        onClick={() => setIsOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </button>
      {isOpen && (
        <ul
          ref={menuRef}
          id="dropdown-menu"
          role="menu"
          aria-label={trigger}
          onKeyDown={handleMenuKeyDown}
          className="dropdown-menu"
        >
          {items.map((item, i) => (
            <li key={i} role="none">
              <button
                role="menuitem"
                type="button"
                aria-disabled={item.disabled || undefined}
                tabIndex={-1}
                onClick={() => { if (!item.disabled) { item.onSelect(); setIsOpen(false) } }}
                className="dropdown-item"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Compound Tabs with Context Pattern

```tsx
// src/shared/components/ui/CompoundTabs.tsx
// Alternative Tabs implementation using compound component pattern

interface TabsContextValue {
  activeTab:    string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

function TabsRoot({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

function TabList({ children, label }: { children: React.ReactNode; label: string }) {
  return <div role="tablist" aria-label={label} className="tab-list">{children}</div>
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabs()
  const selected = activeTab === id
  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`panel-${id}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActiveTab(id)}
      className={clsx('tab', selected && 'tab--active')}
    >
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab } = useTabs()
  if (activeTab !== id) return null
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="tab-panel"
    >
      {children}
    </div>
  )
}

export const CompoundTabs = Object.assign(TabsRoot, { TabList, Tab, TabPanel })

// Usage:
// <CompoundTabs defaultTab="profile">
//   <CompoundTabs.TabList label="Account settings">
//     <CompoundTabs.Tab id="profile">Profile</CompoundTabs.Tab>
//     <CompoundTabs.Tab id="security">Security</CompoundTabs.Tab>
//   </CompoundTabs.TabList>
//   <CompoundTabs.TabPanel id="profile">Profile content</CompoundTabs.TabPanel>
//   <CompoundTabs.TabPanel id="security">Security content</CompoundTabs.TabPanel>
// </CompoundTabs>
```

### Data Table with Sort

```tsx
// src/shared/components/ui/DataTable.tsx
interface Column<T> { key: keyof T; label: string; sortable?: boolean }

export function DataTable<T extends Record<string, unknown>>({
  caption, columns, rows, sortKey, sortDir, onSort,
}: DataTableProps<T>) {
  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={String(col.key)}
              scope="col"
              aria-sort={
                sortKey === col.key
                  ? sortDir === 'asc' ? 'ascending' : 'descending'
                  : col.sortable ? 'none' : undefined
              }
            >
              {col.sortable ? (
                <button type="button" onClick={() => onSort(col.key)}>
                  {col.label}
                  <span aria-hidden="true">
                    {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </span>
                  <span className="sr-only">
                    {sortKey === col.key
                      ? `, sorted ${sortDir === 'asc' ? 'ascending' : 'descending'}`
                      : ', not sorted, click to sort'}
                  </span>
                </button>
              ) : col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map(col => <td key={String(col.key)}>{String(row[col.key])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 11. Images, Icons, and SVGs

### The Alt Text Decision Tree

```
Is the image purely decorative?
  YES → alt=""  or aria-hidden="true"
  NO  → Does it contain text?
          YES → alt reproduces that text exactly
          NO  → Does it convey meaning?
                  YES → alt describes the meaning (not just the literal subject)
                  NO  → alt=""
```

```tsx
// ✅ Meaningful — alt describes the conclusion, not the image itself
<img src="/balance-chart.png"
  alt="Balance trend for 30 days, up 12% to $1,250.00" />

// ✅ Decorative — skipped entirely by screen readers
<img src="/background-texture.png" alt="" role="presentation" />

// ✅ Image of text — alt reproduces the text
<img src="/promo-banner.png" alt="50% off premium plans — ends Friday" />

// ✅ Complex image — alt describes the conclusion; full data in table below
<img src="/sales-chart.png"
  alt="Monthly sales chart. Full data in the table below." />
<table aria-label="Monthly sales data">...</table>

// ❌ Missing alt — screen reader reads file path or nothing
<img src="product.jpg" />

// ❌ Redundant alt — repeats nearby text without adding information
<p>Our logo <img src="logo.png" alt="logo" /></p>
```

### SVG Patterns

```tsx
// ✅ Decorative SVG icon inside a labeled button
<button aria-label="Delete transaction">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="M..." />
  </svg>
</button>

// ✅ Meaningful standalone SVG
<svg role="img" aria-labelledby="logo-title" viewBox="0 0 200 60" focusable="false">
  <title id="logo-title">WalletPro</title>
  <path d="M..." />
</svg>

// ✅ SVG with both title and description (complex graphics)
<svg role="img" aria-labelledby="chart-title chart-desc" focusable="false">
  <title id="chart-title">Monthly Sales 2024</title>
  <desc id="chart-desc">Bar chart. January: $10k, February: $12k, March: $15k</desc>
  {/* chart paths */}
</svg>

// ❌ SVG in a button with visible text — icon is purely decorative
// Duplicate labeling confuses screen readers
<button>
  <svg aria-label="Add funds">...</svg>   {/* ❌ aria-label on decorative icon */}
  Add funds
</button>

// ✅ Correct — icon decorative when button has visible text
<button>
  <svg aria-hidden="true" focusable="false">...</svg>
  Add funds
</button>
```

### Icon Component

```tsx
// src/shared/components/ui/Icon.tsx
interface IconProps {
  icon:       React.ComponentType<React.SVGProps<SVGSVGElement>>
  label?:     string    // Meaningful icon — gets accessible name
  size?:      number
  className?: string
}

export function Icon({ icon: IconComponent, label, size = 20, className }: IconProps) {
  if (label) {
    return (
      <IconComponent
        role="img"
        aria-label={label}
        width={size}
        height={size}
        focusable="false"
        className={className}
      />
    )
  }
  return (
    <IconComponent
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      className={className}
    />
  )
}
```

---

## 12. Color, Contrast, and Visual Design

### Minimum Contrast Requirements

| Context | Minimum | Target |
|---|---|---|
| Body text (< 18pt or < 14pt bold) | 4.5:1 | 7:1 |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1 | 4.5:1 |
| UI components (borders, icons) | 3:1 | 4.5:1 |
| Placeholder text | 4.5:1 | 7:1 |
| Focus indicators | 3:1 against adjacent | — |

### Color Must Never Be the Only Indicator

```tsx
// ❌ Color alone distinguishes types
<li style={{ color: tx.type === 'credit' ? 'green' : 'red' }}>
  {tx.description}
</li>

// ✅ Color + icon + visually hidden text = redundant coding
<li className={`tx tx--${tx.type}`}>
  {tx.type === 'credit'
    ? <ArrowDownIcon aria-hidden="true" />
    : <ArrowUpIcon aria-hidden="true" />
  }
  <span className="sr-only">{tx.type === 'credit' ? 'Credit: ' : 'Debit: '}</span>
  {tx.description}
</li>

// ❌ Error state shown only by red border
<input style={{ borderColor: hasError ? 'red' : 'gray' }} />

// ✅ Error state: border + icon + text
<input aria-invalid={hasError} className={hasError ? 'input input--error' : 'input'} />
{hasError && (
  <p role="alert" className="error-message">
    <ErrorIcon aria-hidden="true" />
    <span className="sr-only">Error: </span>
    {errorMessage}
  </p>
)}
```

### Design Tokens — Contrast Built In

```css
/* src/styles/tokens.css — all contrast ratios verified */
--color-text-primary:   #1a1a2e;  /* 16.8:1 on white */
--color-text-secondary: #4a5568;  /* 7.4:1  on white */
--color-text-muted:     #718096;  /* 4.6:1  on white */
--color-border:         #9ca3af;  /* 3.0:1  on white (UI component) */
--color-border-focus:   #2563eb;  /* 3.7:1  on white */
--color-brand-primary:  #1d4ed8;  /* 7.1:1  on white */
--color-success-text:   #065f46;  /* 8.9:1  on white */
--color-error-text:     #991b1b;  /* 7.6:1  on white */
--color-warning-text:   #92400e;  /* 6.7:1  on white */
```

### Forced Colors / High Contrast Mode

```css
@media (forced-colors: active) {
  .btn          { border: 1px solid ButtonText; }
  .input        { border: 1px solid ButtonText; }
  .card         { border: 1px solid CanvasText; }
  :focus-visible {
    outline: 2px solid ButtonText;
    outline-offset: 2px;
  }
}
```

---

## 13. Text Resizing, Zoom, and Reflow

### Requirements

- All text readable and functional at **200% browser zoom** (WCAG 1.4.4)
- No two-dimensional scrolling at **400% zoom** for single-column content (WCAG 1.4.10 Reflow)
- Use `rem` for font sizes — respects user browser font-size preferences
- No fixed heights that clip text when font size increases

### Font Sizes in rem

```css
/* ❌ px font sizes — ignore browser preference */
body { font-size: 14px; }
h1   { font-size: 24px; }

/* ✅ rem font sizes — respect user preferences */
html  { font-size: 100%; }  /* Inherits browser default ~16px */
body  { font-size: 1rem; }
h1    { font-size: 2rem; }

/* Token-based scale */
:root {
  --text-xs:   0.75rem;   /* 12px at default */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */
}
```

### Reflow Rules

```css
/* ❌ Fixed widths break at high zoom */
.card { width: 400px; }
.form { width: 600px; }

/* ✅ Fluid widths reflow correctly */
.card { width: 100%; max-width: 400px; }
.form { width: 100%; max-width: 600px; }

/* ❌ Fixed height clips content at larger text size */
.description { height: 60px; overflow: hidden; }

/* ✅ Min-height allows content to grow */
.description { min-height: 60px; }

/* ❌ nowrap on long strings prevents reflow */
.label { white-space: nowrap; }

/* ✅ Allow wrapping unless explicitly needed */
.label { white-space: normal; }

/* Spacing and line-height that scales with font */
.body-text  { line-height: 1.5; }       /* unitless — relative to font-size */
.spaced     { letter-spacing: 0.05em; } /* scales with text */
```

### Reduced Motion

```css
/* src/styles/global.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto   !important;
  }
}
```

```typescript
// src/shared/hooks/usePrefersReducedMotion.ts
import { useState, useEffect } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return prefers
}

// Usage
function AnimatedValue({ value }: { value: number }) {
  const reduced = usePrefersReducedMotion()
  return (
    <span style={{ transition: reduced ? 'none' : 'all 0.3s ease' }}>
      {value}
    </span>
  )
}
```

---

## 14. Dynamic States — Loading, Error, Empty, Success

### Accessible DataLoader Pattern

```tsx
// src/shared/components/feedback/DataLoader.tsx
// Wraps async data sections with appropriate state announcements

interface DataLoaderProps {
  isLoading: boolean
  error?:    Error | null
  isEmpty?:  boolean
  loadingLabel?: string
  emptyTitle?:   string
  emptyMessage?: string
  errorTitle?:   string
  onRetry?:      () => void
  children:      React.ReactNode
}

export function DataLoader({
  isLoading,
  error,
  isEmpty,
  loadingLabel = 'Loading content',
  emptyTitle   = 'No results',
  emptyMessage = 'There is nothing to show here yet.',
  errorTitle   = 'Something went wrong',
  onRetry,
  children,
}: DataLoaderProps) {
  if (isLoading) {
    return (
      <div role="status" aria-label={loadingLabel} aria-busy="true">
        <Skeleton count={3} label={loadingLabel} />
      </div>
    )
  }
  if (error) {
    return <ErrorState title={errorTitle} message={error.message} onRetry={onRetry} />
  }
  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />
  }
  return <>{children}</>
}
```

### Loading — Skeleton and Spinner

```tsx
// src/shared/components/feedback/Skeleton.tsx
export function Skeleton({ count = 1, height = 20, label = 'Loading content' }: SkeletonProps) {
  return (
    <div role="status" aria-label={label} aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height }} aria-hidden="true" />
      ))}
      <span className="sr-only">{label}...</span>
    </div>
  )
}

// src/shared/components/feedback/Spinner.tsx
export function Spinner({ label = 'Loading', size = 'md' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={`spinner spinner--${size}`}>
      <span className="sr-only">{label}...</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="spinner__icon">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </span>
  )
}
```

### Error State — Focus Management

```tsx
// src/shared/components/feedback/ErrorState.tsx
export function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  return (
    <div role="alert" className="error-state">
      <h2 ref={headingRef} tabIndex={-1}>{title}</h2>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>{retryLabel}</button>}
    </div>
  )
}
```

### Empty State

```tsx
export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section aria-label={title} className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn btn--primary">
          {actionLabel}
        </button>
      )}
    </section>
  )
}
```

### Success State — Focus After Mutation

```tsx
export function TransferSuccess({ transferId, amount, onNewTransfer }: SuccessProps) {
  const confirmRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { confirmRef.current?.focus() }, [])

  return (
    <div role="status" aria-live="polite">
      <h2 ref={confirmRef} tabIndex={-1}>
        <CheckIcon aria-hidden="true" />
        Transfer successful
      </h2>
      <p>
        <span className="sr-only">Amount: </span>{amount}
      </p>
      <p>
        <span className="sr-only">Reference: </span>{transferId}
      </p>
      <button type="button" onClick={onNewTransfer}>Make another transfer</button>
    </div>
  )
}
```

---

## 15. Notifications and Live Regions

### aria-live Decision Table

| Scenario | Use | Behavior |
|---|---|---|
| Error messages | `role="alert"` | Interrupts immediately |
| Success / confirmation | `aria-live="polite"` | Waits for user to finish |
| Status updates (save, sync) | `aria-live="polite"` | Non-urgent |
| Upload progress | `aria-live="polite"` + `aria-atomic="false"` | Only changed text announced |
| Chat messages | `aria-live="polite"` | Non-urgent stream |

**Critical rule: Live regions must exist in the DOM from initial page load.** Dynamically mounting a new element with `aria-live` after the fact does not work reliably in all screen readers.

```tsx
// src/shared/components/feedback/LiveRegion.tsx
// Mount once in AppLayout — never conditionally render

interface LiveRegionProps {
  message:     string
  politeness?: 'polite' | 'assertive'
  atomic?:     boolean
  clearDelay?: number
}

export function LiveRegion({
  message,
  politeness = 'polite',
  atomic = true,
  clearDelay = 3000,
}: LiveRegionProps) {
  const [displayed, setDisplayed] = useState(message)

  useEffect(() => {
    setDisplayed(message)
    if (clearDelay && message) {
      const t = setTimeout(() => setDisplayed(''), clearDelay)
      return () => clearTimeout(t)
    }
  }, [message, clearDelay])

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {displayed}
    </div>
  )
}

// AppLayout — live region always present
function AppLayout({ children }) {
  const { globalMessage } = useGlobalMessages()
  return (
    <>
      <LiveRegion message={globalMessage} />   {/* Always mounted */}
      {children}
    </>
  )
}
```

### Alert Component

```tsx
// src/shared/components/feedback/Alert.tsx
type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export function Alert({ variant = 'info', title, children, onDismiss }: AlertProps) {
  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`alert alert--${variant}`}
    >
      <span className="sr-only">{variant}: </span>
      {title && <p className="alert__title">{title}</p>}
      <div className="alert__content">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss alert">
          <CloseIcon aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
```

### Toast Region

```tsx
// src/shared/components/feedback/ToastRegion.tsx
// The region container is always in the DOM
export function ToastRegion() {
  const { toasts, dismiss } = useToasts()
  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions removals"
      aria-label="Notifications"
      className="toast-region"
    >
      {toasts.map(toast => (
        <div key={toast.id} role="status" className={`toast toast--${toast.variant}`}>
          <span className="sr-only">{toast.variant}: </span>
          {toast.message}
          <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 16. React-Specific Patterns and Hooks

### Conditional Rendering — Visibility vs Presence

```tsx
// ❌ CSS opacity/visibility still in accessibility tree
<div style={{ opacity: 0 }}>Screen readers read this even though invisible</div>

// ✅ Options for hiding from accessibility tree
{isVisible && <div>Removed from tree entirely when false</div>}
<div hidden={!isVisible}>HTML hidden attribute — correctly removed</div>
<div style={{ visibility: 'hidden' }}>Hidden from screen readers AND visually</div>
<div aria-hidden="true">Hidden from screen readers, visible sighted users</div>
```

### useId — Stable IDs Always

```tsx
// ❌ Manual IDs — duplicate risk, hydration mismatch in SSR
<label htmlFor="email-field">Email</label>
<input id="email-field" />

// ✅ useId — stable, unique, SSR-safe (React 18+)
function FormField({ label, children }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children as React.ReactElement, { id })}
    </>
  )
}
```

### forwardRef for Focus Management

```tsx
// When a parent needs to direct focus into a child component
const FocusableCard = forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => (
    <div ref={ref} tabIndex={-1} className="card" {...props}>
      {children}
    </div>
  )
)

// Parent manages focus:
const cardRef = useRef<HTMLDivElement>(null)
// After some action:
cardRef.current?.focus()
```

### Portal Focus

When using `ReactDOM.createPortal` for modals, focus trap hooks work correctly because they attach to `document`, not the React component tree. The portal container must be accessible.

```tsx
import { createPortal } from 'react-dom'

export function Modal({ isOpen, children, ...props }: ModalProps) {
  if (!isOpen) return null
  // Focus trap still works — useFocusTrap attaches to document
  return createPortal(
    <ModalContent {...props}>{children}</ModalContent>,
    document.body,
  )
}
```

### StrictMode Idempotency

React StrictMode double-invokes effects in development. Live regions and focus management must be idempotent — calling twice must not cause double announcements.

```tsx
// ❌ Fires twice in StrictMode dev — double announcement
useEffect(() => {
  setAnnouncement('Transfer successful')
}, [])

// ✅ Tied to state change — idempotent
useEffect(() => {
  if (isSuccess) setAnnouncement('Transfer successful')
}, [isSuccess])
```

### Page Announcement Hook

```typescript
// src/shared/hooks/usePageAnnouncement.ts
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function usePageAnnouncement(): string {
  const location = useLocation()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement(`Navigated to ${document.title}`)
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return announcement
}
```

---

## 17. Reusable Component Library

This section provides the complete accessible starter components every project needs.

### Accessible Pagination

```tsx
export function Pagination({ currentPage, totalPages, onPageChange, label = 'Pagination' }: PaginationProps) {
  return (
    <nav aria-label={label} className="pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon aria-hidden="true" />
        <span className="sr-only">Previous</span>
      </button>

      <ol className="pagination__pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li key={page}>
            <button
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}${page === currentPage ? ', current page' : ''}`}
              className={clsx('pagination__page', page === currentPage && 'pagination__page--current')}
            >
              {page}
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon aria-hidden="true" />
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        Page {currentPage} of {totalPages}
      </p>
    </nav>
  )
}
```

### Accessible Progress Bar

```tsx
export function ProgressBar({ value, label, showValue = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="progress-bar">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${clamped}% complete`}
        aria-label={label}
        className="progress-bar__track"
      >
        <div className="progress-bar__fill" style={{ width: `${clamped}%` }} />
      </div>
      {showValue && <span aria-hidden="true">{clamped}%</span>}
      {clamped === 100 && (
        <span role="status" aria-live="polite" className="sr-only">{label} complete</span>
      )}
    </div>
  )
}
```

### Accessible Search Field

```tsx
export function SearchField({ label, placeholder, onSearch, resultCount, isLoading }: SearchFieldProps) {
  const inputId  = useId()
  const statusId = useId()
  const [value, setValue] = useState('')

  const announcement = isLoading
    ? 'Searching...'
    : resultCount !== undefined
    ? `${resultCount} result${resultCount !== 1 ? 's' : ''} found`
    : ''

  return (
    <div className="search-field" role="search">
      <label htmlFor={inputId} className="search-field__label">{label}</label>
      <div className="search-field__wrapper">
        <SearchIcon aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch(value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-describedby={statusId}
          aria-busy={isLoading}
        />
        {value && (
          <button type="button" onClick={() => { setValue(''); onSearch('') }} aria-label="Clear search">
            <CloseIcon aria-hidden="true" />
          </button>
        )}
      </div>
      <p id={statusId} role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}
```

---

## 18. Testing and Validation Workflow

### Three Required Test Methods

Every component must pass all three before being considered accessible. Automated tools catch ~30–40% of issues. Manual testing is non-optional.

1. **Automated scan** — catches structural and attribute issues
2. **Keyboard-only navigation** — catches focus, interaction, and trapping issues
3. **Screen reader testing** — catches announcement, labeling, and flow issues

### Install Testing Tools

```bash
npm install -D jest-axe @axe-core/react axe-core \
  eslint-plugin-jsx-a11y \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event \
  @axe-core/playwright
```

### Automated axe Tests — One Per Component

```typescript
// src/test/setup.ts — add to existing setup
import { toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)
```

```typescript
// src/shared/components/ui/__tests__/Button.a11y.test.tsx
import { render }               from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

describe('Button accessibility', () => {
  it('has no violations with text label', async () => {
    const { container } = render(<Button>Submit</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations as icon button with aria-label', async () => {
    const { container } = render(
      <Button aria-label="Close dialog"><XIcon aria-hidden="true" /></Button>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations in loading state', async () => {
    const { container } = render(<Button isLoading>Submit</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// src/features/auth/components/__tests__/LoginForm.a11y.test.tsx
it('LoginForm has no accessibility violations', async () => {
  const { container } = render(
    <MemoryRouter><LoginForm /></MemoryRouter>,
    { wrapper: createWrapper() }
  )
  expect(await axe(container)).toHaveNoViolations()
})
```

### React Testing Library — Accessibility-Oriented Queries

Prefer queries that mirror how users and assistive technology find elements. This enforces accessible naming as a byproduct of testing.

```typescript
// Query priority order (most to least accessible)
// 1. getByRole — reflects the accessibility tree
screen.getByRole('button', { name: /sign in/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('checkbox', { name: /remember me/i })
screen.getByRole('dialog', { name: /confirm transfer/i })

// 2. getByLabelText — finds by associated label
screen.getByLabelText(/email address/i)

// 3. getByText — text content
screen.getByText(/available balance/i)

// 4. getByTestId — last resort, not accessible-tree-based
screen.getByTestId('wallet-card')  // Only when nothing else works
```

```typescript
// Full form interaction test with accessibility-oriented queries
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('login form shows accessible error messages', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><LoginForm /></MemoryRouter>)

  // Submit without filling in fields
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  // Error summary should appear and receive focus
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  // Individual field errors should be associated via aria-describedby
  const emailInput = screen.getByRole('textbox', { name: /email/i })
  expect(emailInput).toHaveAttribute('aria-invalid', 'true')

  // Errors must have text content (not color-only)
  expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
})

test('password field clears after submit', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><LoginForm /></MemoryRouter>)
  const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
  await user.type(passwordInput, 'mysecret')
  await user.click(screen.getByRole('button', { name: /sign in/i }))
  await waitFor(() => expect(passwordInput.value).toBe(''))
})
```

### Development Runtime Checking

```typescript
// src/main.tsx — only in development
if (process.env.NODE_ENV !== 'production') {
  const ReactDOM = await import('react-dom')
  const axe      = await import('@axe-core/react')
  // Reports violations to the browser console 1s after render
  axe.default(React, ReactDOM, 1000)
}
```

### Playwright E2E Accessibility Tests

```typescript
// e2e/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder       from '@axe-core/playwright'

const PUBLIC_PAGES = [
  { path: '/',         name: 'Home' },
  { path: '/login',    name: 'Login' },
  { path: '/register', name: 'Register' },
]

for (const page of PUBLIC_PAGES) {
  test(`${page.name} has no WCAG 2.2 AA violations`, async ({ page: pw }) => {
    await pw.goto(page.path)
    const results = await new AxeBuilder({ page: pw })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze()
    const critical = results.violations.filter(v =>
      v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toEqual([])
  })

  test(`${page.name} skip link is first focusable and functional`, async ({ page: pw }) => {
    await pw.goto(page.path)
    await pw.keyboard.press('Tab')
    const focused = pw.locator(':focus')
    await expect(focused).toContainText(/skip/i)
    await pw.keyboard.press('Enter')
    await expect(pw.locator('#main-content')).toBeFocused()
  })
}

test('modal traps focus', async ({ page }) => {
  await page.goto('/dashboard')
  await page.getByRole('button', { name: /open settings/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  // Tab 20 times — focus must never leave the dialog
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() =>
      document.querySelector('[role="dialog"]')?.contains(document.activeElement)
    )
    expect(inside).toBe(true)
  }
  // Escape closes and returns focus
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('form announces validation errors', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByRole('alert')).toBeVisible()
})
```

### Keyboard-Only Testing Checklist

Execute this with mouse disconnected or disabled:

```
□ Press Tab — does focus land on the skip link first?
□ Tab through the page — is every button, link, and input reachable?
□ Is a visible focus indicator present on every focused element?
□ Can you activate buttons with Enter and Space?
□ Can you follow links with Enter?
□ Can you open modals with Enter? Does focus move inside?
□ Can you Tab through modal content? Does Escape close it?
□ Does focus return to the trigger when modal closes?
□ Can you navigate dropdowns with arrow keys?
□ Can you navigate tabs with arrow keys?
□ Can you expand/collapse accordions with Enter?
□ Can you submit forms with Enter?
□ Are validation errors announced and visible without a mouse?
□ Can you check/uncheck checkboxes with Space?
□ Is there a skip link that moves focus to main content?
□ Is there no keyboard trap anywhere in the page?
```

### Screen Reader Testing Procedure

**Recommended setups:**
- macOS: VoiceOver — `Cmd+F5` to enable. Use Safari.
- Windows: NVDA (free) — most common among screen reader users. Use Chrome or Firefox.
- iOS: VoiceOver — built-in
- Android: TalkBack — built-in

**Testing steps (listen — don't watch the screen):**

```
□ Does the page title announce on load?
□ Navigate by headings (VO+Cmd+H / H on NVDA) — does the outline make sense?
□ Navigate by landmarks (VO+Cmd+L / D on NVDA) — are all regions labeled?
□ Do form fields announce: label, type, required status, hint text?
□ Do errors announce when form submits incorrectly?
□ Do icon-only buttons have meaningful names?
□ Are decorative images silently skipped?
□ Do loading states announce themselves?
□ Do success and error states announce automatically?
□ Do modals announce as dialogs when they open?
□ Does focus move inside modals? Back to trigger when closed?
□ Do links describe their destination (not just "click here" or "read more")?
□ Do tables have captions? Are column headers meaningful?
□ Does the page make sense navigated non-linearly?
```

---

## 19. Common Mistakes to Avoid

### Structural Mistakes

**`<div>` and `<span>` as interactive elements.** Every `div` with an `onClick` handler is a screen reader and keyboard failure. Use `<button>` for actions, `<a href>` for navigation. There is almost never a legitimate reason to use `<div role="button">`.

**Skipping heading levels for visual reasons.** `h1 → h3` because "h2 looked too big" is not acceptable. Use CSS to control size. Heading levels communicate document structure — they are navigational landmarks for screen reader users.

**Multiple `<h1>` elements.** One `<h1>` per page describes the page's primary topic.

**Missing landmark regions.** Without `<main>`, `<nav>`, `<header>`, and `<footer>`, screen reader users cannot jump directly to content. Every page needs the full landmark structure.

**No skip link.** The first focusable element on every page must be a skip link to `#main-content`. Without it, keyboard users must traverse every navigation item on every page load.

### Form Mistakes

**Placeholder as label.** Placeholders disappear during input. People with cognitive disabilities, limited short-term memory, or who need to verify their work before submitting cannot see the label. A visible, persistent `<label>` is mandatory.

**`<label>` not programmatically associated.** Visually positioned near the input is not enough. `htmlFor` must match the input's `id`. Screen readers only read the associated label, not the visually adjacent text.

**Error messages not linked to fields.** An error below a field is useless to a screen reader unless `aria-describedby` on the input points to the error's `id`.

**Error communicated only by color.** A red border alone is invisible to color-blind users and provides no information to screen reader users. Always include text.

**IDs generated with Math.random() or counters.** Use React's `useId()`. Manual IDs produce duplicates in lists and fail SSR hydration.

### Focus Mistakes

**Removing focus styles without replacement.** `outline: none` without `:focus-visible` replacement is one of the most disabling accessibility failures possible. Keyboard users have no visual indication of where they are on the page.

**Not returning focus when a modal closes.** Focus drops to `<body>`. Screen reader and keyboard users are completely disoriented. Use `usePreviousFocus()`.

**Not moving focus into modals when they open.** Focus stays behind the overlay. Screen reader users don't know a dialog appeared. Use `useFocusRef()` or `useFocusTrap()`.

**Focus disappears when an item is deleted.** The focused element unmounts and focus goes to `<body>`. Move focus to the previous item, the next item, or a status message.

**Not managing focus on SPA route changes.** React Router navigation is invisible to screen reader users. `RouteChangeTracker` or `AccessiblePage` is required on every route change.

### ARIA Mistakes

**Redundant ARIA on native elements.** `<button role="button">`, `<nav role="navigation">`, `<h2 role="heading" aria-level="2">` — all redundant. Trust native semantics.

**`aria-hidden="true"` on focusable elements.** Creates ghost focus where Tab lands but the screen reader says nothing. If hiding, also add `tabIndex={-1}` or don't render.

**Conditionally mounting live regions.** Live regions must be in the DOM from initial page load. Mounting a new `aria-live` element dynamically does not trigger announcements in all screen readers.

**Using `role="menu"` for site navigation.** `role="menu"` is for application-level menus (like a File menu), not for site navigation links. Use `<nav>` for site navigation.

**Over-describing with aria-label.** Adding `aria-label` to every container creates noise. Only add it to interactive elements, landmark regions, and form fields that lack visible labels.

### Dynamic Content Mistakes

**Loading states with no screen reader feedback.** A spinner with no `role="status"` means screen reader users don't know if the page is loading or broken.

**Animations and transitions that don't respect `prefers-reduced-motion`.** Some users experience nausea, disorientation, or seizures from motion. The CSS media query is mandatory.

**Assuming automated tools catch everything.** ESLint and axe catch structural issues. They cannot detect: poor label quality ("click here"), illogical focus order, live region content that doesn't make sense when read in isolation, or screen reader announcement flow problems. Manual testing is non-negotiable.

---

## 20. Mandatory Enforcement Checklist

This checklist must be reviewed before any component, page, view, or interactive element is considered complete. An AI coding agent must apply every item by default when generating or reviewing React UI code.

### Structure and Semantics
- [ ] Page has `<header>`, `<main id="main-content" tabIndex={-1}>`, and `<footer>` landmarks
- [ ] Exactly one `<h1>` per page; no skipped heading levels
- [ ] Skip link is the first focusable element and targets `#main-content`
- [ ] Multiple `<nav>` elements are labeled with unique `aria-label`
- [ ] `<section>` elements use `aria-labelledby` pointing to their heading
- [ ] Page `<title>` is unique, descriptive, and updated on route change
- [ ] `document.documentElement.lang` is set to the current locale

### Keyboard Navigation
- [ ] Every interactive element is reachable by Tab
- [ ] No `tabIndex` values greater than 0
- [ ] Custom widgets implement arrow key navigation (tabs, menus, listboxes)
- [ ] Escape closes modals, dropdowns, and tooltips
- [ ] Enter and Space activate buttons (native `<button>` handles this automatically)
- [ ] Focus never becomes trapped outside of intentional modal dialogs
- [ ] Tested keyboard-only: all actions are reachable without a mouse

### Focus
- [ ] All interactive elements have a visible `:focus-visible` style
- [ ] `outline: none` is never used without an immediate `:focus-visible` replacement
- [ ] Modal focus moves inside on open via `useFocusRef` or equivalent
- [ ] Modal focus returns to trigger on close via `usePreviousFocus`
- [ ] Focus is trapped inside open modals via `useFocusTrap`
- [ ] Focus is managed on SPA route changes (`RouteChangeTracker` or `AccessiblePage`)
- [ ] When a list item is deleted, focus moves to a logical adjacent element

### Images, Icons, and SVGs
- [ ] All `<img>` elements have `alt` (descriptive for meaningful, `""` for decorative)
- [ ] All SVG icons inside labeled buttons are `aria-hidden="true"` + `focusable="false"`
- [ ] Standalone meaningful SVGs have `role="img"` and `aria-label` or `<title>`
- [ ] Icon-only buttons have `aria-label` or visually hidden text
- [ ] No image or icon conveys information without a text alternative

### Forms
- [ ] Every field has `<label>` with `htmlFor` matching the input `id`
- [ ] No placeholder text used as a label replacement
- [ ] Required fields have `aria-required="true"` and a visible indicator
- [ ] Error messages use `aria-describedby` on the input
- [ ] Error messages use `role="alert"` for immediate announcement
- [ ] Groups of related inputs use `<fieldset>` + `<legend>`
- [ ] Common fields have correct `autocomplete` values
- [ ] All `id` values generated with `useId()` — never hardcoded

### Color and Contrast
- [ ] Normal text: 4.5:1 contrast against background
- [ ] Large text: 3:1 contrast against background
- [ ] UI components (borders, focus rings): 3:1 contrast
- [ ] Color is never the sole indicator of status, error, or meaning
- [ ] Status, error, and success have text/icon in addition to color

### ARIA
- [ ] No ARIA used where a native element provides the same semantics
- [ ] `aria-label` on interactive elements without visible text
- [ ] `aria-expanded` on disclosure triggers
- [ ] `aria-controls` linking triggers to controlled regions
- [ ] `aria-selected` on tabs and listbox options
- [ ] `aria-pressed` on toggle buttons
- [ ] `aria-current="page"` on active navigation item
- [ ] `aria-busy="true"` on loading containers
- [ ] `aria-hidden="true"` never set on focusable elements
- [ ] `aria-live` regions present from initial page load — not conditionally mounted

### Dynamic States
- [ ] Loading states use `role="status"`, `aria-busy="true"`, accessible text
- [ ] Error states use `role="alert"` and receive focus programmatically
- [ ] Success states use `role="status"` and are announced via live region
- [ ] Empty states have descriptive headings and clear calls-to-action
- [ ] Toasts and notifications in `aria-live` regions

### Interactive Patterns
- [ ] Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, arrow keys, `aria-selected`
- [ ] Accordion: `aria-expanded` on trigger, `aria-controls` to panel, trigger is `<button>` inside heading
- [ ] Dropdown menus: `aria-haspopup="menu"`, `role="menu"`, arrow keys
- [ ] Tables: `<caption>`, `scope="col"` on `<th>`, `aria-sort` on sortable headers
- [ ] Progress: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### Text, Zoom, and Motion
- [ ] Font sizes in `rem` — not `px`
- [ ] UI functional at 200% zoom, no horizontal scroll at 400%
- [ ] No fixed heights that clip text at larger sizes
- [ ] All animations respect `prefers-reduced-motion`
- [ ] High contrast mode tested (`forced-colors: active`)

### Testing
- [ ] `jest-axe` automated scan passes with zero violations
- [ ] Component tested keyboard-only — all actions reachable
- [ ] Component tested with VoiceOver (macOS) or NVDA (Windows)
- [ ] Screen reader announces: roles, names, states, and values correctly
- [ ] Playwright a11y test in `e2e/accessibility/`

### AI Agent Enforcement Rules

When generating any React UI code, the following rules apply automatically — without needing to be asked:

1. **Use semantic HTML first.** `<button>`, `<nav>`, `<main>`, `<table>`, `<ul>` before any `<div>` with ARIA.
2. **Never output `outline: none` or `outline: 0`** without an immediate `:focus-visible` replacement in the same code block.
3. **Never output `<img>` without `alt`.** Decorative: `alt=""`. Meaningful: descriptive text.
4. **Never output an icon-only `<button>`** without `aria-label` or visually hidden text.
5. **Never output `<label>` without `htmlFor`**, or a form field without a label.
6. **Always include `aria-describedby` on form fields** when an error message is present.
7. **Always include `role="alert"`** on error messages that appear dynamically.
8. **Never output `aria-hidden="true"` on focusable elements.**
9. **Always mount `aria-live` regions in initial DOM** — never conditionally render them.
10. **Always include focus management** when building modals, drawers, dialogs, or route-level changes.
11. **Never add redundant ARIA** to native semantic HTML elements.
12. **Run the full checklist above** before marking any component complete.

---

*WCAG 2.2 Level AA · WAI-ARIA 1.2 · APG (ARIA Authoring Practices Guide) · React 18 · @axe-core/react · jest-axe · @axe-core/playwright · eslint-plugin-jsx-a11y · NVDA · VoiceOver*
