# Pro-Life Informational Organization Website

# Complete Branding & Visual Design Super Guide

**Document type:** Brand Strategy · Visual Identity · UI Design System · Implementation Handoff
**Stack target:** React + Vite + Bootstrap 5
**Audience:** AI designers, frontend developers, design system maintainers
**Version:** Super Guide 1.0 — Consolidated from three expert sources

> **How to use this document:** This is the single source of truth for the brand. Every design decision — from hex codes to button radius to photography tone — is defined here. Hand it directly to any AI designer or frontend developer. No interpretation needed.

---

## Table of Contents

1. [Brand Foundation & Strategy](#1-brand-foundation--strategy)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Logo Direction](#4-logo-direction)
5. [UI Design System](#5-ui-design-system)
6. [Imagery & Illustration Direction](#6-imagery--illustration-direction)
7. [Page-Level Branding Guidance](#7-page-level-branding-guidance)
8. [Bootstrap Adaptation & Component Notes](#8-bootstrap-adaptation--component-notes)
9. [Design Tokens & CSS Variables](#9-design-tokens--css-variables)
10. [Handoff Summary](#10-handoff-summary)

---

## 1. Brand Foundation & Strategy

### 1.1 Brand Purpose

Create a compassionate, trustworthy, organization-style website that supports women facing unexpected pregnancies, presents a clear pro-life perspective, and helps visitors find guidance, hope, testimonies, and practical resources. The site must feel like a real organization — not a political campaign, not a clinical institution, not a charity fundraiser.

### 1.2 Brand Archetypes

The brand channels two complementary archetypes working together:

**The Caregiver** — deeply empathetic, supportive, present. Prioritizes the visitor's wellbeing above all else. Listens before speaking. Meets people where they are.

**The Sage** — credible, researched, measured. Offers honest information clearly labeled by type. Builds trust through transparency, not persuasion pressure.

### 1.3 Brand Personality

| Trait             | What It Looks Like in Practice                          |
| ----------------- | ------------------------------------------------------- |
| **Compassionate** | Leads with empathy before any argument or information   |
| **Calm**          | Stable, unhurried, never reactive or urgent-feeling     |
| **Credible**      | Grounded, accurate, sources labeled, claims measured    |
| **Dignified**     | Respects the visitor, the subject, and all perspectives |
| **Hopeful**       | Forward-looking, life-affirming, focused on possibility |
| **Serious**       | Treats the mission with weight — not casual, not cold   |
| **Human**         | Warm enough that a frightened woman stays on the page   |
| **Approachable**  | Gentle but confident — not pushy, not pleading          |

### 1.4 What the Brand Must Never Feel Like

- Angry, aggressive, or condemning
- Politically combative or campaign-like
- Overly preachy or guilt-based
- Cheap, amateur, or clip-art
- Too corporate and cold
- Too soft and childlike
- Graphic or exploitative
- Sensational or manipulative

### 1.5 Emotional Balance

The ideal emotional register across the entire site:

| Dimension           | Weight | Expression                                            |
| ------------------- | ------ | ----------------------------------------------------- |
| Compassion          | 35%    | Warmth, empathy, non-judgment                         |
| Trust & credibility | 25%    | Sourced content, transparency, professionalism        |
| Hope                | 20%    | Forward focus, possibility, life-affirming language   |
| Clarity             | 10%    | Plain language, organized structure, clear next steps |
| Moral seriousness   | 10%    | Weight, dignity, honest conviction                    |

### 1.6 Emotional Tone by Page Type

The emotional register shifts appropriately as visitors move through the site:

| Page Type                 | Tone                             | Key Message                            |
| ------------------------- | -------------------------------- | -------------------------------------- |
| Home / Crisis pages       | Warm, calm, unhurried            | "You are safe here."                   |
| Options / Education pages | Clear, thoughtful, measured      | "Here is what we know and believe."    |
| Testimonials              | Human, personal, quietly hopeful | "You are not alone."                   |
| Resources                 | Practical, organized, reassuring | "Help is closer than you think."       |
| Legal pages               | Professional, plain, honest      | "We are transparent about who we are." |

### 1.7 Brand Values

1. **Empathy** — We listen before we speak
2. **Integrity** — We are truthful, transparent, and cite our sources
3. **Dignity** — Every person and every life is treated with inherent worth
4. **Support** — We are a practical resource, not just an ideology
5. **Clarity** — We communicate complex topics with simplicity and care
6. **Protection** — We safeguard both the visitor's privacy and their emotional safety

### 1.8 Communication Style

- Write at a **7th–8th grade reading level** — accessible without being condescending
- Use **short sentences and short paragraphs** throughout
- **Active voice**: "We believe…" not "It is believed that…"
- **First and second person**: "we" for the org, "you" for the visitor
- **Label perspectives explicitly**: biological, philosophical, faith-based, personal testimony
- **Never guarantee outcomes** — offer support, community, and hope instead
- **No inflammatory language** on either side of any debate

### 1.9 Trust Signals the Brand Must Convey

- Clearly identified non-profit, non-commercial, non-political mission
- Named leadership and transparent team pages
- Claims labeled clearly: fact, ethical perspective, or faith-based belief
- Visible plain-language legal pages linked from every footer
- Crisis resources accessible on every page, every viewport
- No manipulative design patterns: no countdown timers, no dark patterns, no aggressive pop-ups on load
- HTTPS, secure forms, clear privacy policy
- Professional, polished visual design that signals "this organization takes you seriously"

### 1.10 Brand Essence & Positioning Lines

**Internal brand essence:** _"Protect life with truth, compassion, and support."_

**Possible external positioning lines:**

- _Compassion, guidance, and hope for every life_
- _Support for women. Protection for life._
- _Truth, care, and practical help in difficult moments_
- _Every life matters. Every woman deserves support._

---

## 2. Color System

### 2.1 Design Philosophy

The palette is built on **deep, muted blue** as the primary identity anchor — conveying trust, seriousness, stability, and calm without the political associations of bright red or the clinical coldness of pure teal. It is warmed by a **soft apricot/gold accent** for hope-forward moments, and grounded in **warm ivory and stone neutrals** that feel human and inviting.

This is a "Warm Stone" palette: stable like bedrock, warm like natural light, trustworthy like a safe room.

### 2.2 Primary Palette

| Token                   | Color Name     | Hex       | Usage                                                          |
| ----------------------- | -------------- | --------- | -------------------------------------------------------------- |
| `--color-primary`       | Deep Life Blue | `#2E5B8A` | Navbars, primary headings, strong CTA text, key trust UI areas |
| `--color-primary-dark`  | Deep Navy      | `#1E3D5C` | Hover states, footer headers, high-contrast heading moments    |
| `--color-primary-mid`   | Stone Blue     | `#3E5A6C` | Card headers, secondary navigation, info blocks                |
| `--color-primary-light` | Soft Horizon   | `#5C8AAA` | Borders, decorative accents, icon fills                        |
| `--color-primary-pale`  | Mist           | `#EFF3F5` | Section backgrounds, card fills, alternate rows                |
| `--color-primary-mist`  | Cloud Ivory    | `#F4F7F9` | Page alt backgrounds, hero overlays                            |

### 2.3 Accent / Hope Colors

| Token                 | Color Name    | Hex       | Usage                                                                                      |
| --------------------- | ------------- | --------- | ------------------------------------------------------------------------------------------ |
| `--color-accent`      | Warm Apricot  | `#F4A261` | Primary "I Need Help Now" CTAs, hover icons, hope highlights — use sparingly (5–10% of UI) |
| `--color-accent-dark` | Amber Glow    | `#D4843F` | Hover states for accent elements                                                           |
| `--color-accent-pale` | Apricot Blush | `#FDF0E4` | Callout box backgrounds, note backgrounds                                                  |
| `--color-warm-gold`   | Gentle Gold   | `#C8A030` | Pull quotes, section highlights, featured badge accents                                    |
| `--color-rose-sand`   | Rose Sand     | `#D8B4A0` | Section breaks, testimony highlights, warmth accents                                       |
| `--color-warm-cream`  | Warm Ivory    | `#FAF7F2` | Page backgrounds, hero background overlays                                                 |

### 2.4 Neutral Colors

| Token                  | Color Name    | Hex       | Usage                                         |
| ---------------------- | ------------- | --------- | --------------------------------------------- |
| `--color-charcoal`     | Charcoal Navy | `#26313C` | Primary body text, footer text                |
| `--color-text-dark`    | Rich Charcoal | `#2C3E42` | Headings, high-contrast content               |
| `--color-text-mid`     | Slate         | `#5A6E74` | Subheadings, meta information, helper text    |
| `--color-text-muted`   | Muted Stone   | `#8E98A3` | Borders, helper text, disabled labels         |
| `--color-border`       | Pebble        | `#D4DCDE` | Input borders, dividers, card borders         |
| `--color-border-light` | Cloud Gray    | `#E8ECEF` | Section separators, table lines, subtle rules |

### 2.5 Background Colors

| Token                     | Color Name    | Hex       | Usage                                         |
| ------------------------- | ------------- | --------- | --------------------------------------------- |
| `--color-bg-body`         | Off-White     | `#FDFCF9` | Main page background — softer than pure white |
| `--color-bg-card`         | Pure White    | `#FFFFFF` | Card and modal backgrounds                    |
| `--color-bg-section-alt`  | Mist          | `#EFF3F5` | Alternate section backgrounds                 |
| `--color-bg-section-warm` | Warm Ivory    | `#FAF7F2` | Warm section backgrounds                      |
| `--color-bg-hero-dark`    | Deep Navy     | `#1E3D5C` | Dark hero backgrounds                         |
| `--color-bg-footer`       | Charcoal Navy | `#26313C` | Footer background                             |

### 2.6 Semantic / State Colors

| Token             | Color Name   | Hex       | Bootstrap Override | Usage                                           |
| ----------------- | ------------ | --------- | ------------------ | ----------------------------------------------- |
| `--color-success` | Sage         | `#4D8B5F` | `$success`         | Confirmations, verified resource badges         |
| `--color-warning` | Golden Amber | `#C9902F` | `$warning`         | Caution notices, content advisories             |
| `--color-danger`  | Terracotta   | `#B85C5C` | `$danger`          | Errors, critical disclaimers, crisis alerts     |
| `--color-info`    | Sky          | `#4B7EA8` | `$info`            | Educational callouts, fact boxes, legal notices |

### 2.7 Color Usage Rules

1. **Deep Life Blue is the primary anchor** — use for navbars, headings, primary buttons, and key trust areas
2. **Warm Apricot is the hope/action accent** — reserve exclusively for the most critical CTAs ("I Need Help Now", "Find Support") and interactive hover moments. Maximum 5–10% of any screen
3. **Ivory and Off-White are the default backgrounds** — most sections live in light, airy space
4. **Rose Sand and Gold are warmth accents** — used sparingly for testimony highlights and pull quotes, not as dominant UI colors
5. **Never use red** except for danger/crisis semantic contexts — red carries political and alarm associations on this subject
6. **Never use pure black** (`#000000`) — use `--color-charcoal` instead, which reads as serious without being harsh
7. **Backgrounds alternate** between body, section-alt, and section-warm to create visual rhythm without requiring borders
8. **Dark hero sections used sparingly** — home page hero and major landing moments only

### 2.8 Accessibility — Contrast Requirements (WCAG 2.1 AA)

All text/background combinations must meet 4.5:1 minimum for normal text, 3:1 for large text.

| Combination                | Ratio  | WCAG AA       | Notes                                            |
| -------------------------- | ------ | ------------- | ------------------------------------------------ |
| Charcoal on Off-White body | 13.8:1 | ✅ Pass       | Primary body text                                |
| White on Deep Life Blue    | 8.1:1  | ✅ Pass       | Navbar and button text                           |
| White on Deep Navy (dark)  | 11.2:1 | ✅ Pass       | Hero and footer text                             |
| Stone Blue on Off-White    | 5.2:1  | ✅ Pass       | Heading text at body size                        |
| Warm Apricot on Off-White  | 3.0:1  | ⚠️ Large only | **Never use for body text** — buttons/icons only |
| Golden Amber on Off-White  | 3.4:1  | ⚠️ Large only | Decorative/display use only                      |
| Slate on Off-White         | 5.8:1  | ✅ Pass       | Secondary text and captions                      |

> **Critical rule:** Warm Apricot fails WCAG AA at body text size. It must **only** appear as a background fill for buttons or as decorative icons — never as text color at small sizes.

---

## 3. Typography System

### 3.1 Pairing Rationale

The typography pairing balances editorial authority with human readability. The display font brings classical dignity and warmth to headings; the body font maximizes clarity and legibility at small sizes — especially important for users reading in stressful emotional moments.

### 3.2 Primary Recommended Font Stack

| Role                | Font           | Fallback                             | Source       | Why                                                                                          |
| ------------------- | -------------- | ------------------------------------ | ------------ | -------------------------------------------------------------------------------------------- |
| **Display / H1–H3** | `Merriweather` | Georgia, serif                       | Google Fonts | Moral seriousness, editorial credibility, nonprofit gravitas. Highly legible at large sizes. |
| **Body / UI / H4+** | `Inter`        | system-ui, -apple-system, sans-serif | Google Fonts | Designed for screen UI legibility. Clean, humanist, works at all sizes.                      |
| **Monospace**       | `Fira Mono`    | Courier New, monospace               | Google Fonts | Code blocks, URLs, technical legal references — optional                                     |

### 3.3 Alternative Font Pairing (Classic Nonprofit)

| Role                   | Font                 | Fallback              | Notes                                                                     |
| ---------------------- | -------------------- | --------------------- | ------------------------------------------------------------------------- |
| **Display / Headings** | `Cormorant Garamond` | Georgia, serif        | More refined, slightly more elegant — excellent for editorial-heavy pages |
| **Body / UI**          | `Source Sans 3`      | system-ui, sans-serif | Warm, humanist, slightly softer than Inter                                |

> **Recommendation:** Use **Merriweather + Inter** as the primary pairing. Use **Cormorant Garamond + Source Sans 3** if the organization wants a more refined editorial feel.

### 3.4 Google Fonts Import

```html
<!-- Primary pairing -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### 3.5 Type Scale

| Style          | Element          | Font                | Size            | Weight     | Line Height | Letter Spacing   |
| -------------- | ---------------- | ------------------- | --------------- | ---------- | ----------- | ---------------- |
| **Display**    | Hero headline    | Merriweather        | 3.5rem / 56px   | 700        | 1.2         | -0.5px           |
| **H1**         | Page title       | Merriweather        | 3rem / 48px     | 700        | 1.2         | -0.3px           |
| **H2**         | Section title    | Merriweather        | 2.25rem / 36px  | 700        | 1.25        | -0.3px           |
| **H3**         | Subsection       | Merriweather        | 1.75rem / 28px  | 400        | 1.3         | 0                |
| **H4**         | Card title       | Inter               | 1.25rem / 20px  | 600        | 1.4         | 0                |
| **H5**         | Label heading    | Inter               | 1rem / 16px     | 700        | 1.4         | 0.08em UPPERCASE |
| **H6**         | Micro label      | Inter               | 0.875rem / 14px | 700        | 1.4         | 0.1em UPPERCASE  |
| **Body Large** | Lead paragraph   | Inter               | 1.125rem / 18px | 400        | 1.75        | 0                |
| **Body**       | Default text     | Inter               | 1rem / 16px     | 400        | 1.75        | 0                |
| **Body Small** | Captions, meta   | Inter               | 0.875rem / 14px | 400        | 1.6         | 0                |
| **Caption**    | Legal, footnotes | Inter               | 0.75rem / 12px  | 300        | 1.4         | 0                |
| **Pull Quote** | Testimonials     | Merriweather italic | 1.375rem / 22px | 400 italic | 1.6         | 0                |

### 3.6 Typography Rules

1. **H1–H3 use the serif display font** — all other text uses Inter
2. **H5–H6 labels are always uppercase** with generous letter-spacing
3. **Body text line length never exceeds 72 characters** — use `max-width` on text blocks
4. **Pull quotes and testimonials always use Merriweather italic** — this is the brand's most emotionally resonant typographic moment
5. **Line height for body is always 1.75** — generous leading aids readability for stressed visitors
6. **Never use font weights below 300** in running text — light is only for legal/caption text
7. **Avoid center-aligned body text blocks** — reserve centering for short headlines and CTAs only
8. **Paragraph spacing:** Add `margin-bottom: 1.25rem` between paragraphs in editorial content

### 3.7 Bootstrap Typography SCSS Overrides

```scss
$font-family-sans-serif:
  'Inter',
  system-ui,
  -apple-system,
  sans-serif;
$font-family-serif: 'Merriweather', Georgia, serif;
$font-size-base: 1rem;
$line-height-base: 1.75;
$headings-font-family: 'Merriweather', Georgia, serif;
$headings-font-weight: 700;
$headings-color: #26313c;
$lead-font-size: 1.125rem;
$lead-font-weight: 400;
```

---

## 4. Logo Direction

### 4.1 What the Logo Must Communicate

- Life, growth, protection, and possibility
- Warmth, care, and support — approachable by a frightened visitor
- Organizational credibility — not a campaign, not a political movement
- Universal enough to feel welcoming to visitors of all backgrounds

### 4.2 What the Logo Must Avoid

| Avoid                                             | Why                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| Fetuses, embryos, clinical medical imagery        | Too graphic, alienates vulnerable visitors                                |
| Baby footprints                                   | Feels like a campaign bumper sticker unless extremely refined             |
| Crosses or religious symbols                      | Excludes non-religious visitors unless brand is explicitly faith-centered |
| Hearts in commercial/Valentine style              | Feels cheap or sentimental rather than credible                           |
| Bright red or black as dominant colors            | Politically coded and alarming on this topic                              |
| Overly complex or thin details                    | Fails at favicon and small-icon sizes                                     |
| Anything that resembles a political campaign logo | Undermines organizational credibility                                     |
| Cartoon or clip-art style                         | Destroys trust for an organization-level site                             |

### 4.3 Logo Concept Directions

**Concept A — The Sheltering Leaf / Embrace**
A single, gently curved leaf or pair of flowing lines suggesting protection around something small and precious — an embrace without depicting a human form literally. Clean linework, soft edges.
_Emotional message:_ Growth, protection, nature, life, gentle strength.
_Best for:_ Non-denominational identity, broadest appeal.

**Concept B — The Sprout of Life**
A minimal seedling — two small leaves emerging from a single stem — rendered in confident, slightly hand-drawn linework. Not a logo-generator seedling; carefully proportioned.
_Emotional message:_ New life, potential, hope, growth from small beginnings.
_Best for:_ Organizations wanting a universally readable, nature-forward symbol.

**Concept C — The Embrace / Circle of Support**
A stylized flowing line or three interlocking soft curves forming a circle — suggesting community, togetherness, or a figure gently cradling something without depicting it literally.
_Emotional message:_ Connection, care, community, holistic support.
_Best for:_ Organizations emphasizing community and relational support.

**Concept D — The Open Door / Threshold / Light**
A simple arch — open at the top — or an abstract radiating shape suggesting a doorway, threshold, dawn, or the beginning of something. No hardware details.
_Emotional message:_ Welcome, refuge, hope, renewal, a way forward.
_Best for:_ Organizations whose primary message is "you are welcome here."

### 4.4 Logo Versions Required

| Version               | Format | Usage                                    |
| --------------------- | ------ | ---------------------------------------- |
| Horizontal (primary)  | SVG    | Navigation bar, email headers, documents |
| Stacked (secondary)   | SVG    | Footer, social profiles, print           |
| Icon only (mark)      | SVG    | Favicon, app icon, loading spinner       |
| Wordmark only         | SVG    | Contexts where mark is too small         |
| Reversed (white)      | SVG    | Dark hero and footer backgrounds         |
| Single color (dark)   | SVG    | Monochrome (letterhead, fax)             |
| Small-size simplified | SVG    | Sub-32px contexts — reduce detail        |

### 4.5 Logo Color Versions

| Variant         | Mark                         | Wordmark  | Background          |
| --------------- | ---------------------------- | --------- | ------------------- |
| Primary         | `#2E5B8A`                    | `#26313C` | White or light      |
| Reversed        | `#FFFFFF`                    | `#FFFFFF` | Dark navy `#1E3D5C` |
| Warm accent     | `#2E5B8A` + `#F4A261` accent | `#26313C` | White               |
| Monochrome dark | `#26313C`                    | `#26313C` | White               |

### 4.6 Logo Style Guidance

- Clean, simple geometry with soft rounded edges
- Not too thin (minimum 2px stroke at standard display size)
- Not too intricate — must be readable at 32×32px favicon
- Emotionally warm, not aggressive or angular
- Clear space: minimum 1× cap-height of wordmark on all sides
- Minimum display size: 120px wide for horizontal, 32px for icon-only

---

## 5. UI Design System

### 5.1 Spacing Scale

| Token             | Value   | Bootstrap | Usage                            |
| ----------------- | ------- | --------- | -------------------------------- |
| `--space-1`       | 0.25rem | `p-1`     | Micro spacing                    |
| `--space-2`       | 0.5rem  | `p-2`     | Tight UI gaps                    |
| `--space-3`       | 1rem    | `p-3`     | Default component padding        |
| `--space-4`       | 1.5rem  | `p-4`     | Card padding, section gaps       |
| `--space-5`       | 2rem    | custom    | Medium section spacing           |
| `--space-6`       | 3rem    | `p-5`     | Large section padding            |
| `--space-7`       | 5rem    | custom    | Major section separators         |
| `--space-8`       | 7rem    | custom    | Hero vertical padding            |
| `--section-pad-y` | 5rem    | custom    | Standard section vertical rhythm |

### 5.2 Border Radius

| Token           | Value | Usage                                |
| --------------- | ----- | ------------------------------------ |
| `--radius-sm`   | 4px   | Badges, pills, small tags            |
| `--radius-md`   | 10px  | Inputs, form controls                |
| `--radius-lg`   | 16px  | Standard cards, content blocks       |
| `--radius-xl`   | 24px  | Featured cards, image containers     |
| `--radius-pill` | 40px  | CTA buttons (approachability signal) |

### 5.3 Shadows

Shadows are subtle and warm (not cool gray).

```css
--shadow-sm: 0 2px 4px rgba(38, 49, 60, 0.04);
--shadow-md: 0 4px 12px rgba(38, 49, 60, 0.08);
--shadow-lg: 0 8px 24px rgba(38, 49, 60, 0.1);
--shadow-hover: 0 8px 24px rgba(38, 49, 60, 0.12);
--shadow-focus: 0 0 0 3px rgba(46, 91, 138, 0.28);
```

### 5.4 Buttons

#### Primary Action Button

- Background: `--color-primary` (`#2E5B8A`)
- Text: White
- Border-radius: `--radius-pill` (40px) — signals approachability
- Padding: 12px 32px
- Font: Inter, 16px, weight 600
- Hover: `--color-primary-dark` + slight scale (1.02)
- Focus: `--shadow-focus` ring
- Use for: Read Resources, Contact Us, Explore Stories

#### Critical CTA / Help Now Button

- Background: `--color-accent` (`#F4A261`)
- Text: `--color-charcoal` (`#26313C`)
- Border-radius: `--radius-pill` (40px)
- Font: Inter, 16px, weight 700
- Hover: `--color-accent-dark` (`#D4843F`)
- **Use exclusively for:** "I Need Help Now", "Find Support", "Get Help Today"
- Must be visually the most prominent element in its section

#### Secondary Button (Outline)

- Background: transparent
- Border: 2px solid `--color-primary`
- Text: `--color-primary`
- Border-radius: `--radius-pill` (40px)
- Hover: `--color-primary-pale` background
- Use for: "Learn More", "Read Our Story", secondary navigation actions

#### Ghost / Text Button

- Background: transparent, no border
- Text: `--color-primary`
- Underline on hover
- Use for: inline text CTAs, "Read more" within content

#### Danger / Crisis Button

- Background: `--color-danger` (`#B85C5C`)
- Text: White
- Use exclusively for: crisis resource links, emergency hotline CTAs
- Must be visually distinct from all other buttons on the page

#### Button Rules

- **One primary button per visual section maximum**
- Always pair primary with secondary or ghost to reduce pressure
- All buttons must have visible focus state (the focus-ring shadow)
- All touch targets minimum 44×44px
- Never place more than two button styles side-by-side

### 5.5 Form Styles

#### Input Fields

- Border: 1.5px solid `--color-border` (`#D4DCDE`)
- Border-radius: `--radius-md` (10px)
- Background: white
- Padding: 12px 16px
- Font: Inter, 16px
- Focus border: `--color-primary` with `--shadow-focus` ring
- Error border: `--color-danger` with error message below
- Placeholder: `--color-text-muted` (`#8E98A3`)
- Checked state accent: `--color-accent` (`#F4A261`) for checkboxes and radio buttons

#### Labels

- Font: Inter, 14px, weight 500
- Color: `--color-text-mid` (`#5A6E74`)
- Margin-bottom: 6px
- **Always use a visible `<label>` element** — never use placeholder as the sole label

#### Form Layout Rules

- Single-column on mobile; max two columns for related field pairs on desktop
- Error messages directly below the affected field
- Required fields marked clearly with asterisk, explained at form top
- All forms include a privacy notice above the submit button
- Forms should feel **calm and safe** — this site receives emotional testimony and help requests

#### Consent Checkboxes

- Styled with `accent-color: var(--color-accent)` for the checked state
- Label text minimum 14px, always readable
- Minimum 20px touch target for the checkbox itself

### 5.6 Cards

#### Standard Content Card

- Background: `--color-bg-card` (white)
- Border: 1px solid `--color-border-light` (`#E8ECEF`) or none
- Border-radius: `--radius-lg` (16px)
- Padding: 28px 24px (generous — never cramped)
- Shadow: `--shadow-sm`
- Hover: shadow upgrades to `--shadow-hover`, subtle 2px upward translate

#### Resource Directory Card

- Background: white
- Left border accent: 4px solid `--color-primary`
- Border-radius: `--radius-md` (10px)
- Padding: 20px 20px 20px 24px
- Contains: name (H4), service type badge, description, phone/address, external CTA link
- Verified resource badge: `--color-success` (`#4D8B5F`) background, white text

#### Featured / Highlighted Card

- Background: `--color-primary-pale` (`#EFF3F5`)
- No border
- Border-radius: `--radius-xl` (24px)
- Padding: 36px 32px
- Accent bar: 4px `--color-accent` at top for "featured" status
- Use sparingly — key resource highlights or featured stories only

#### Stat / Impact Card

- Background: `--color-bg-section-warm` (`#FAF7F2`)
- Large number: Merriweather, `--color-primary`, 3rem
- Label below: Inter, `--color-text-muted`, 13px uppercase
- No border, subtle or no shadow

### 5.7 Testimonial Blocks

These are among the most important UI elements on the site. Design them with exceptional care.

```
Layout structure:
┌─────────────────────────────────────────────┐
│  " (decorative quote mark, large, pale)      │
│                                              │
│  Quote text in Merriweather italic, 1.375rem │
│  "--color-text-dark, max-width 640px"        │
│                                              │
│  — First Name, [optional: age range / city] │
│    Inter 14px, --color-text-mid             │
│                                              │
│  [STORY TYPE BADGE]  [Read Full Story →]     │
│                                              │
│  Personal experience. Not a typical result. │
│  Inter 12px italic, --color-text-muted      │
└─────────────────────────────────────────────┘
```

- Opening quotation mark: Merriweather, 5rem, `--color-primary-pale` — purely decorative
- Quote text: Merriweather italic, 1.375rem, `--color-text-dark`, max-width 640px
- Attribution: Inter, 14px, `--color-text-mid` — format: `— [Name], [context]`
- Story type badge: "Stories of Hope" = `--color-success` border-left 4px; "Stories of Healing" = `--color-danger` border-left 4px
- Disclaimer: Inter, 12px, `--color-text-muted`, italic — always present
- Large quote marks as background (opacity 0.06–0.10) are acceptable as a decorative layer
- **Never sensationalize** — design must give emotional breathing room

#### Pull Quote (Inline)

- Merriweather italic, 1.25rem, `--color-primary-dark`
- Left border: 4px solid `--color-warm-gold` (`#C8A030`)
- Padding-left: 24px
- Use within long-form content to highlight key passages

### 5.8 Navigation Bar

#### Structure

```
[ Logo (left) ]  [ Home  About  Help  Resources  Stories  FAQ  Contact ]  [ Get Support → ]
```

- Background: `--color-primary` (`#2E5B8A`) — dark navbar signals organizational weight and trust
- Text / Links: White with slight opacity (`rgba(255,255,255,0.85)`)
- Active link: White, fully opaque + `--color-accent` underline or bottom border
- Hover: White, fully opaque
- Right-aligned CTA: "Get Help Now" — accent button, small size
- Height: 72px
- Sticky on scroll: yes, with `--shadow-md` added on scroll
- Slim shadow below on scroll to lift it from the page

#### Mobile Navigation

- Hamburger icon (white, 24px) collapses to `<Offcanvas>` or full-screen drawer
- "Get Help Now" and crisis hotline number pinned to bottom of mobile nav — always visible
- Font size 18px for easy tapping in mobile nav

### 5.9 Footer

#### Structure (3-column desktop → stacked mobile)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo reversed]        │  Quick Links      │  Get Help Now  │
│  Short mission line     │  About            │  [Hotline #]   │
│  (2 sentences max)      │  Resources        │                │
│                         │  Stories          │  Legal Links   │
│                         │  FAQ              │  Privacy       │
│                         │  Contact          │  Terms         │
├─────────────────────────────────────────────────────────────┤
│  © 2024 [Org Name]  ·  Privacy Policy  ·  Terms  ·  Disclaimer  ·  Cookies  │
│  Short informational-only notice, 12px, muted                               │
└─────────────────────────────────────────────────────────────┘
```

- Background: `--color-bg-footer` (`#26313C`)
- Text: white at 75% opacity for secondary content, 100% for key links
- Link hover: `--color-accent` or `--color-primary-light`
- Logo: white/reversed version
- Crisis hotline number: white, Inter bold, 18px — **most prominent element in the footer**
- Short disclaimer: 12px, italic, 55% opacity

### 5.10 Hero Sections

#### Primary Dark Hero (Home Page)

- Background: gradient `#1E3D5C` → `#2E5B8A` at 150°, or a warm photograph with 55% dark overlay
- Headline: Merriweather, 3.5rem, white, max-width 640px, left-aligned
- Subheadline: Inter, 1.25rem, white at 85% opacity
- CTA group: Accent button ("I Need Help Now") + Ghost white button ("Learn About Your Options")
- Optional trust line below buttons: Inter, 14px, white at 60% opacity
- Optional subtle wave or curved section divider at bottom

**Example headline tone:**

> _"You are not alone. Find compassionate guidance, practical resources, and stories of hope."_

#### Light Hero (Interior Pages)

- Background: `--color-bg-section-alt` or `--color-bg-section-warm`
- Headline: Merriweather, 2.5rem, `--color-text-dark`
- Breadcrumb above: Inter, 13px, `--color-text-muted`
- Description: Inter, 1.125rem, `--color-text-mid`
- Optional image: right-aligned, `--radius-xl`, `--shadow-md`

### 5.11 Alert and Informational Boxes

| Box Type                  | Background | Left Border   | Label                   | Use For                          |
| ------------------------- | ---------- | ------------- | ----------------------- | -------------------------------- |
| Disclaimer (Gold)         | `#FDF8E8`  | 4px `#C8A030` | "Note:"                 | Legal caveats, context notes     |
| Warning (Amber)           | `#FFF8E1`  | 4px `#C9902F` | "Important:"            | Content advisories, disclaimers  |
| Crisis (Red)              | `#FDF0F0`  | 4px `#B85C5C` | "If you need help now:" | Emergency resources only         |
| Info / Educational (Blue) | `#EFF4FB`  | 4px `#4B7EA8` | "Did you know:"         | Fact boxes, educational callouts |
| Support (Green)           | `#EDF5EF`  | 4px `#4D8B5F` | "Support available:"    | Compassionate encouragement      |

All boxes:

- Border-radius: `--radius-md` (10px)
- Padding: 16px 20px
- Label: Inter, 11px, uppercase, letter-spacing 0.8px, bold, in the accent color
- Body: Inter, 13.5px, `--color-text-dark`, italic

### 5.12 CTA Sections

#### Full-Width CTA Band

- Background: `--color-primary` (dark) or `--color-bg-section-warm` (warm)
- Headline: Merriweather, 2rem, white (dark) or `--color-text-dark` (warm)
- Sub-text: Inter, 1rem
- One primary + one secondary button, centered
- Padding: 80px vertical

#### Inline CTA Block (End of Content Pages)

- Background: `--color-primary-pale`
- Border-radius: `--radius-xl`
- Padding: 40px
- One button, one short sentence
- Used at bottom of educational pages to redirect toward resources

### 5.13 Resource Directory Layout

#### Filter / Category Bar

- Horizontal toggle buttons (Bootstrap `.btn-group`) for service type filtering
- Active filter: `--color-primary` background, white text
- Inactive: white background, `--color-primary` border and text
- Active filter badge count: `--color-accent` pill

#### Grid Layout

- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column
- Each card: Resource Directory Card format (see 5.6)
- "Verified" badge: `--color-success`, small, top-right of card
- "External link" icon on all links to third-party resources

#### Search Input

- Full-width on mobile, max 420px on desktop
- Left search icon (16px, `--color-text-muted`)
- Styled per standard input field

### 5.14 Content Section Layouts

#### Text + Image (50/50)

- Desktop: image right, text left (alternate each section for visual rhythm)
- Mobile: image above text, full width
- Image: `--radius-xl`, `--shadow-md`
- Text: max 65 characters per line

#### Full Editorial (Text-Only)

- Max-width: 720px, centered
- Used for: About pages, educational arguments, in-depth editorial content
- Optional drop cap for opening paragraphs on long reads

#### Three-Column Feature Grid

- Icon (32px, SVG, `--color-primary`) + H4 title + body description
- Cards or borderless depending on section background
- Used for: "How We Help" sections, support categories, value props

### 5.15 Mobile Responsiveness Rules

- All touch targets: minimum 44×44px
- Body font: never below 16px on any screen
- Navigation: hamburger at `md` breakpoint (768px)
- Crisis hotline: always accessible, pinned or always-visible on mobile
- Cards: stack to full-width single column at `sm` breakpoint (576px)
- Hero text: `clamp(1.75rem, 5vw, 3.5rem)` for fluid scaling
- No horizontal scroll at any standard viewport width
- CTA buttons: full-width on mobile where helpful
- Reduce decorative visuals on mobile — content first

---

## 6. Imagery & Illustration Direction

### 6.1 Photography Style

**Overall aesthetic:** Natural light, real people, quiet moments. The photography sits between editorial documentary and warm lifestyle — not stock photo perfection, not clinical imagery.

**Color treatment:**

- Images should lean slightly warm (soft golden-hour quality)
- Subtle warmth grading — no heavy Instagram filters
- Accurate, diverse skin tones — no whitewashing or homogenization
- Soft focus backgrounds (natural bokeh) to center the subject

### 6.2 Subject Matter — What to Show

- Women in moments of quiet reflection or gentle connection
- Women in supportive conversations with counselors, friends, or family
- Mothers and children in natural, unposed interaction
- Hands (holding, touching gently) — a universal symbol of care
- Natural environments: light through leaves, water, open fields, soft morning light
- Community spaces: counseling rooms, living rooms, support groups (diverse)
- Pregnancy-related gentle lifestyle moments
- Faces showing strength, contemplation, and gentle hope — not despair

**Composition principles:**

- Eye-level or slightly above to empower the subject (not diminish)
- Subject at 1/3 or 2/3 — not stiff portrait centering
- Generous negative space — images should breathe
- Natural, candid quality — not stiff or over-staged

### 6.3 What to Avoid in Imagery

- Graphic medical imagery of any kind (clinical procedures, ultrasound in manipulative framing)
- Protest imagery, political gatherings, or rally photography
- Depictions of women appearing ashamed, desperate, or exploited
- Images that feel shaming or designed to provoke guilt
- Stock-photo "perfect family" clichés — diversity must be genuine
- Babies posed in manipulative or sentimental ways intended to trigger rather than connect
- Harsh or dramatic lighting that creates dread
- Red as a dominant color in any photography

### 6.4 Illustration Style (If Used)

If original illustration is needed for icons, empty states, or educational sections:

- **Style:** Line-based or flat-fill editorial illustration, organic shapes, no hard geometric edges
- **Weight:** Slightly thicker lines (2–3pt), rounded end caps (`stroke-linecap: round`)
- **Color palette:** Drawn only from the brand palette — navy, apricot, warm ivory
- **Subjects:** Abstract representations — leaves, gentle circular forms, soft gestures, light
- **Not:** Cartoon/childlike illustration, clinical diagram style, activist-poster style
- **Consistency:** All illustrations from a single illustrator or illustration system

### 6.5 Icon Style

- **Style:** Outlined icons, consistent 2pt stroke weight, rounded end caps
- **Size:** 20–24px for UI icons; 32px for feature/section icons; 48px for landing/hero icons
- **Color:** `--color-primary` default; white on dark backgrounds; `--color-accent` for interactive/hover states
- **Recommended libraries:** Feather Icons, Lucide Icons, or Heroicons — all have consistent stroke weight and open licenses
- **No filled icons** for standard UI — outline only; filled acceptable for active/selected nav states

### 6.6 Image Accessibility

- Every image must have meaningful `alt` text
- Decorative images: `alt=""` and `role="presentation"`
- All hero text remains legible without the image (test with image disabled)
- Dark overlay on hero images must ensure 4.5:1 text contrast minimum

---

## 7. Page-Level Branding Guidance

### 7.1 Home Page

**Visual priority:** Emotional safety and orientation in the first 3 seconds.

| Section             | Content                                       | Key Design Element                                              |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| Hero                | Calm headline, two CTAs, serene image         | Accent button ("I Need Help Now") is THE most prominent element |
| Mission snapshot    | 2–3 sentence statement of purpose             | Merriweather, editorial, centered, max 640px                    |
| Three support paths | Parenting, Adoption, Resources — equal weight | Three-column feature grid, no hierarchy implied                 |
| Featured testimony  | Single pull quote, warm background            | Merriweather italic, gold quotation mark accent                 |
| Resource spotlight  | 3 highlighted resources                       | Resource cards with primary border-left                         |
| FAQ preview         | 3–4 key questions in accordion                | Bootstrap accordion, lightly styled                             |
| Final CTA band      | "We're here whenever you're ready"            | Warm background, gentle single CTA                              |

**Critical rules for the Home page:**

- Do not lead with arguments or perspectives — lead with support and welcome
- The accent-colored "I Need Help Now" button must be immediately visible on load
- No overcrowding the hero with information — warmth and clarity above all

### 7.2 About Us Page

**Visual priority:** Trust through transparency and human connection.

- Light interior hero with team photograph or organizational image
- Leadership: circular portrait photos (or silhouettes), name H4, title as label
- Mission text: editorial layout, Merriweather for opening paragraph
- "Who We Are / Who We Are Not" section — essential for credibility
- Organizational transparency section: non-commercial, non-donation-seeking statement
- Optional: founder or origin story in warm editorial layout

### 7.3 Resources / Help Page

**Visual priority:** Speed and clarity — get people to help as fast as possible.

- **No decorative hero** — begin immediately with category filter bar and search
- Category tabs: "Pregnancy Support" / "Parenting" / "Adoption" / "Emotional Support" / "Financial Help" / "Faith-Based"
- Crisis / hotline band: full-width, `--color-danger` accent, **pinned above the filter bar and always visible**
- Resource grid: 3-column desktop, cards with prominent phone numbers
- Sticky sidebar (desktop): "Need immediate help?" panel with hotline numbers always visible
- Verified resource badges on vetted listings

### 7.4 Testimonials Page

**Visual priority:** Human dignity and emotional authenticity.

- Light section hero: simple headline — _"Real Stories. Real Women."_
- Prominent testimonial disclaimer in a Gold/Amber info box at the very top
- Story cards in 2-column grid or masonry, alternating subtle backgrounds
- Story type badges: "Stories of Hope" (success green) / "Stories of Healing" (danger accent)
- Load more pattern (not pagination) for additional stories
- "Share Your Story" CTA band at bottom — dark blue background, warm language, soft button

### 7.5 Contact Page

**Visual priority:** Warmth, low pressure, emotional safety.

- Interior hero: _"We'd love to hear from you."_
- Crisis disclaimer box at the very top — prominent, before the form
- Single-column form, max 560px centered
- Prominent response time expectation statement
- Full-width submit button on mobile
- Success state: checkmark + warm confirmation message
- Do not require more data than necessary — privacy-forward design

### 7.6 FAQ Page

**Visual priority:** Speed and accessibility — users are often anxious and scanning.

- Bootstrap Accordion (`<Accordion>`) for question/answer pairs
- Category jump links at top for navigation across question groups
- Search input at top of page
- Accordion styling: `--color-primary-pale` header on open state
- Answers: body text, no heading within the answer, relevant resource links included

**FAQ categories:**

- About the organization
- Your pregnancy and options
- Emotional support
- Resources and services
- Privacy and data
- Testimonials and submission

### 7.7 Legal Pages

**Visual priority:** Clarity, professionalism, and plain language.

- No hero image — just the page title (H1) and "Last updated: [date]" in label style
- Full editorial layout: max-width 720px, centered
- Section headings: H2 in Merriweather, clear hierarchy
- No promotional elements, no callout boxes — clean, readable text only
- Table of contents (jump links) at top for long pages (Privacy Policy, Terms)
- Footer disclaimer: same as all pages

---

## 8. Bootstrap Adaptation & Component Notes

### 8.1 Component Fit Assessment

| Component       | Fit              | Customization Needed                                                         |
| --------------- | ---------------- | ---------------------------------------------------------------------------- |
| `.btn`          | ✅ Good          | Override `$primary` and add `.btn-accent` custom class                       |
| `.card`         | ✅ Good          | Override border-radius, shadow, border-color                                 |
| `.navbar`       | ✅ Good          | Set dark blue background, customize link colors                              |
| `.accordion`    | ✅ Good          | Override header bg for active state                                          |
| `.form-control` | ✅ Good          | Override border-radius, focus ring color                                     |
| `.alert`        | ⚠️ Customize     | Use as base for info/disclaimer boxes; override colors and left-border style |
| `.modal`        | ✅ Good          | Override border-radius; use for story submission forms                       |
| `.offcanvas`    | ✅ Good          | Mobile navigation drawer                                                     |
| `.badge`        | ✅ Good          | Override for category tags and verified badges                               |
| `.carousel`     | ⚠️ Use carefully | Testimonial carousels only; must have keyboard nav and pause-on-hover        |
| `.breadcrumb`   | ✅ Good          | Minor color override                                                         |
| `.tab`          | ✅ Good          | Override active state for resource category filters                          |
| `.list-group`   | ⚠️ Customize     | Override for resource list view                                              |
| `.spinner`      | ✅ Good          | Use `--color-primary` for loading states                                     |
| `.progress`     | ❌ Avoid         | Creates pressure-based UX — do not use                                       |

### 8.2 Bootstrap Theme SCSS Overrides

Load order: `_variables.scss` → `bootstrap/scss/bootstrap` → `_tokens.css` → `_typography.scss` → `_components.scss`

```scss
// _variables.scss — load BEFORE Bootstrap
$primary: #2e5b8a;
$secondary: #5c8aaa;
$success: #4d8b5f;
$info: #4b7ea8;
$warning: #c9902f;
$danger: #b85c5c;
$light: #eff3f5;
$dark: #26313c;

$font-family-sans-serif:
  'Inter',
  system-ui,
  -apple-system,
  sans-serif;
$font-size-base: 1rem;
$line-height-base: 1.75;
$headings-font-family: 'Merriweather', Georgia, serif;
$headings-font-weight: 700;
$headings-color: #26313c;

$border-radius: 10px;
$border-radius-lg: 16px;
$border-radius-sm: 4px;

$box-shadow-sm: 0 2px 4px rgba(38, 49, 60, 0.04);
$box-shadow: 0 4px 12px rgba(38, 49, 60, 0.08);
$box-shadow-lg: 0 8px 24px rgba(38, 49, 60, 0.1);

$link-color: #2e5b8a;
$link-hover-color: #1e3d5c;
$link-decoration: none;
$link-hover-decoration: underline;
```

### 8.3 Custom `.btn-accent` Class

Bootstrap does not have a built-in apricot/accent button. Add this to your component styles:

```css
.btn-accent {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-charcoal);
  font-weight: 700;
}
.btn-accent:hover {
  background-color: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
  color: var(--color-charcoal);
}
.btn-accent:focus-visible {
  box-shadow: var(--shadow-focus);
}
```

### 8.4 Custom Theme Class Naming Convention

Use a consistent `org-` prefix for all brand-specific custom classes to avoid conflicts with Bootstrap:

```
Layout & Sections:
  .org-hero           .org-hero--dark      .org-hero--light
  .org-section        .org-section--warm   .org-section--alt

Cards:
  .org-card           .org-card--resource  .org-card--featured  .org-card--stat

Content:
  .org-testimonial    .org-pull-quote
  .org-disclaimer     .org-disclaimer--warning
  .org-disclaimer--crisis  .org-disclaimer--info  .org-disclaimer--support

Navigation & Layout:
  .org-nav            .org-footer          .org-footer-legal

CTA:
  .org-cta-band       .org-cta-band--dark  .org-cta-band--warm
```

### 8.5 Recommended Vite + React File Structure

```
src/
├── assets/
│   ├── fonts/        (if self-hosting)
│   ├── images/
│   └── icons/
├── styles/
│   ├── _variables.scss    (Bootstrap overrides — loads FIRST)
│   ├── _tokens.css        (CSS custom properties)
│   ├── _typography.scss   (type system)
│   ├── _components.scss   (org- class definitions)
│   └── main.scss          (imports all → imports Bootstrap)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── PageHero.jsx
│   ├── ui/
│   │   ├── Card.jsx
│   │   ├── TestimonialBlock.jsx
│   │   ├── DisclaimerBox.jsx
│   │   ├── ResourceCard.jsx
│   │   └── CTABand.jsx
│   └── pages/
│       ├── Home/
│       ├── About/
│       ├── Resources/
│       ├── Testimonials/
│       ├── Contact/
│       └── Legal/
```

---

## 9. Design Tokens & CSS Variables

Complete `:root` definition — paste into `src/styles/_tokens.css`:

```css
:root {
  /* ── PRIMARY PALETTE ── */
  --color-primary: #2e5b8a;
  --color-primary-dark: #1e3d5c;
  --color-primary-mid: #3e5a6c;
  --color-primary-light: #5c8aaa;
  --color-primary-pale: #eff3f5;
  --color-primary-mist: #f4f7f9;

  /* ── ACCENT / HOPE PALETTE ── */
  --color-accent: #f4a261;
  --color-accent-dark: #d4843f;
  --color-accent-pale: #fdf0e4;
  --color-warm-gold: #c8a030;
  --color-rose-sand: #d8b4a0;
  --color-warm-cream: #faf7f2;

  /* ── NEUTRAL PALETTE ── */
  --color-charcoal: #26313c;
  --color-text-dark: #2c3e42;
  --color-text-mid: #5a6e74;
  --color-text-muted: #8e98a3;
  --color-border: #d4dcde;
  --color-border-light: #e8ecef;

  /* ── BACKGROUNDS ── */
  --color-bg-body: #fdfcf9;
  --color-bg-card: #ffffff;
  --color-bg-section-alt: #eff3f5;
  --color-bg-section-warm: #faf7f2;
  --color-bg-hero-dark: #1e3d5c;
  --color-bg-footer: #26313c;

  /* ── SEMANTIC COLORS ── */
  --color-success: #4d8b5f;
  --color-warning: #c9902f;
  --color-danger: #b85c5c;
  --color-info: #4b7ea8;

  /* ── TYPOGRAPHY ── */
  --font-heading: 'Merriweather', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Mono', 'Courier New', monospace;

  --text-xs: 0.75rem; /*  12px */
  --text-sm: 0.875rem; /*  14px */
  --text-base: 1rem; /*  16px */
  --text-lg: 1.125rem; /*  18px */
  --text-xl: 1.375rem; /*  22px */
  --text-2xl: 1.75rem; /*  28px */
  --text-3xl: 2.25rem; /*  36px */
  --text-4xl: 3rem; /*  48px */
  --text-5xl: 3.5rem; /*  56px */

  --leading-tight: 1.2;
  --leading-snug: 1.3;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  /* ── SPACING ── */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
  --space-7: 5rem;
  --space-8: 7rem;
  --section-pad-y: 5rem;

  /* ── BORDER RADIUS ── */
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 40px;

  /* ── SHADOWS ── */
  --shadow-sm: 0 2px 4px rgba(38, 49, 60, 0.04);
  --shadow-md: 0 4px 12px rgba(38, 49, 60, 0.08);
  --shadow-lg: 0 8px 24px rgba(38, 49, 60, 0.1);
  --shadow-hover: 0 8px 24px rgba(38, 49, 60, 0.14);
  --shadow-focus: 0 0 0 3px rgba(46, 91, 138, 0.28);

  /* ── TRANSITIONS ── */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* ── LAYOUT ── */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1200px;
  --content-max: 720px; /* editorial text max-width */
  --nav-height: 72px;

  /* ── BOOTSTRAP OVERRIDES via CSS Variables ── */
  --bs-primary: #2e5b8a;
  --bs-primary-rgb: 46, 91, 138;
  --bs-body-bg: #fdfcf9;
  --bs-body-color: #26313c;
  --bs-font-sans-serif: 'Inter', system-ui;
  --bs-link-color: #2e5b8a;
  --bs-link-hover-color: #1e3d5c;
  --bs-border-radius: 10px;
  --bs-border-radius-lg: 16px;
}
```

---

## 10. Handoff Summary

> **This section is the direct, concise handoff for any AI designer or frontend developer. Everything needed to start building immediately is below.**

### 10.1 In One Paragraph

Design a modern, compassionate, organization-style website for a pro-life informational mission. The brand should feel trustworthy, calm, warm, serious, and hopeful — never aggressive, political, exploitative, or guilt-based. Use a clean nonprofit aesthetic with soft editorial warmth built around a deep blue primary, warm apricot accent, ivory backgrounds, and highly readable typography (Merriweather for headings, Inter for body). The UI is built in React + Vite + Bootstrap 5 using reusable cards, simple hero sections, clean forms, soft alert boxes, pill-shaped buttons, and accessible navigation with a dark blue navbar.

### 10.2 Color Quick Reference

| Purpose              | Token                     | Hex       |
| -------------------- | ------------------------- | --------- |
| Primary brand        | `--color-primary`         | `#2E5B8A` |
| Primary dark (hover) | `--color-primary-dark`    | `#1E3D5C` |
| Help Now CTA accent  | `--color-accent`          | `#F4A261` |
| Accent hover         | `--color-accent-dark`     | `#D4843F` |
| Body background      | `--color-bg-body`         | `#FDFCF9` |
| Card background      | `--color-bg-card`         | `#FFFFFF` |
| Alt section bg       | `--color-bg-section-alt`  | `#EFF3F5` |
| Warm section bg      | `--color-bg-section-warm` | `#FAF7F2` |
| Footer               | `--color-bg-footer`       | `#26313C` |
| Body text            | `--color-charcoal`        | `#26313C` |
| Secondary text       | `--color-text-mid`        | `#5A6E74` |
| Muted / meta         | `--color-text-muted`      | `#8E98A3` |
| Pull quote gold      | `--color-warm-gold`       | `#C8A030` |
| Crisis / danger      | `--color-danger`          | `#B85C5C` |
| Success / verified   | `--color-success`         | `#4D8B5F` |

### 10.3 Typography Quick Reference

| Use               | Font                | Weight        | Size     |
| ----------------- | ------------------- | ------------- | -------- |
| Hero              | Merriweather        | 700           | 3.5rem   |
| H1                | Merriweather        | 700           | 3rem     |
| H2                | Merriweather        | 700           | 2.25rem  |
| H3                | Merriweather        | 400           | 1.75rem  |
| H4                | Inter               | 600           | 1.25rem  |
| H5 (label)        | Inter               | 700 UPPERCASE | 1rem     |
| Body large (lead) | Inter               | 400           | 1.125rem |
| Body              | Inter               | 400           | 1rem     |
| Small / meta      | Inter               | 400           | 0.875rem |
| Caption / legal   | Inter               | 300           | 0.75rem  |
| Pull quote        | Merriweather italic | 400           | 1.375rem |

### 10.4 Key Design Rules — The Non-Negotiables

1. **One "I Need Help Now" accent button per hero section** — always in `--color-accent`
2. **Headings always Merriweather; body always Inter** — no mixing
3. **Pull quotes and testimonials always in Merriweather italic**
4. **Crisis resources accessible on every page, every viewport**
5. **Warm Apricot is never used as body text color** — buttons and icons only (fails WCAG at text size)
6. **No red except for `--color-danger` semantic contexts**
7. **No manipulative design patterns** — no countdown timers, no load-on-open pop-ups, no dark patterns
8. **WCAG 2.1 AA on all text/background combinations**
9. **Body text never below 16px; line-height always 1.75**
10. **All touch targets minimum 44×44px**
11. **Navbar background is dark blue** — signals organizational weight and trust
12. **Forms feel calm and safe** — this site receives emotionally vulnerable submissions
13. **Footer always includes crisis hotline number** — prominent, Inter bold, 18px minimum
14. **All testimonials carry their disclaimer** — always present, never omitted

### 10.5 Technical Stack Checklist

- [ ] React + Vite project initialized
- [ ] Bootstrap 5 installed
- [ ] `_variables.scss` created with all overrides, loading BEFORE Bootstrap
- [ ] `_tokens.css` created with full `:root` CSS variables block
- [ ] Google Fonts: Merriweather + Inter loaded in `index.html`
- [ ] Icon library installed: Lucide Icons or Feather Icons
- [ ] `.btn-accent` custom class defined
- [ ] All `org-` prefixed component classes defined in `_components.scss`
- [ ] Crisis hotline number visible on every page (header or footer)
- [ ] Footer legal links verified: Privacy, Terms, Disclaimer, Cookies
- [ ] HTTPS configured
- [ ] All images have meaningful `alt` attributes

---

_End of Branding & Visual Design Super Guide_
_Version 1.0 — Consolidated from three expert source documents_
_Ready for direct handoff to AI designer or frontend developer_
