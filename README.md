# React Base App

Production-ready React + Vite baseline with:

- Bootstrap theme pipeline (SCSS)
- i18n (react-i18next)
- SEO base setup
- Analytics scaffolding (GTM/GA4)
- Routing shell + route error boundary
- TanStack Query client + API client template
- API contract validation with zod
- Architectural import boundary guardrails
- Testing (Vitest + RTL)
- Accessibility testing (vitest-axe)
- E2E testing (Playwright)
- Storybook for component visual QA
- Linting (ESLint + Stylelint)
- TypeScript typecheck baseline for incremental migration
- CI pipeline (GitHub Actions)
- Vercel deployment pipeline (staging + production)
- Sentry monitoring scaffold
- Sentry release automation workflow
- Semantic release automation (versioning + changelog)
- Security baseline (CSP headers + dependency audit workflow)
- Secret scanning workflow (TruffleHog)
- Performance budgets for built assets
- International SEO with locale-aware canonical/hreflang
- Runtime UX states (loading, empty, error, 404, 500)

## Scripts

- `npm run dev`
- `npm run storybook`
- `npm run build-storybook`
- `npm run build`
- `npm run build:sourcemap`
- `npm run format`
- `npm run format:check`
- `npm run lint`
- `npm run lint:boundaries`
- `npm run typecheck`
- `npm run test`
- `npm run test:a11y`
- `npm run test:e2e`
- `npm run ci:check`
- `npm run audit:deps`
- `npm run perf:budget`
- `npm run release`
- `npm run release:dry-run`

## Git Quality Gates

- `husky` runs local git hooks after install.
- `pre-commit`: runs `lint-staged` only for staged files.
- `commit-msg`: validates conventional commit format via `commitlint`.

## Architecture Guardrails

- Import boundaries are enforced by `scripts/check-import-boundaries.mjs`.
- Feature modules must expose a public API through `src/features/<feature>/index.js`.
- See `documents/architecture-boundaries.md` for layering rules.

## Environment Setup

1. Copy `.env.example` into `.env.local`.
2. Fill real values for analytics and monitoring variables.
3. Keep `.env.local` uncommitted.

Reference placeholders:

- `.analytics.sample`
- `.monitoring.sample`
- `.deployment.sample`

## Deployments and Releases

- Vercel deployments are automated via GitHub Actions:
  - `staging` branch -> Vercel Preview runtime (QA/staging environment)
  - `main`/`master` branch -> Vercel Production runtime
- Semantic release automation runs on `main`/`master` and publishes:
  - version tags
  - `CHANGELOG.md` updates
  - GitHub Release notes
- See `documents/DEPLOYMENT_RELEASE_PLAYBOOK.md` for setup checklist.
# react-base-app
