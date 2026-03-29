# Frontend Architecture Boundaries

This project enforces import boundaries using `npm run lint:boundaries`.

## Layering Rules

1. Feature modules (`src/features/*`) cannot import app layer modules (`src/app/*`).
2. Shared layers (`src/components`, `src/lib`, `src/config`, `src/seo`, `src/i18n`, `src/analytics`) cannot import from app or features.
3. Cross-feature imports must use the target feature public API (`src/features/<feature>/index.js` or `index.jsx`).
4. Direct imports to another feature's internal files are blocked.

## Recommended Structure

- `src/app`: routing, app shell, high-level composition.
- `src/features/<feature>`: feature-specific logic and UI.
- `src/components`: reusable presentational components shared across features.
- `src/lib`: framework-agnostic utilities and integrations.
- `src/config`: runtime/env configuration.

## Why

- Reduces hidden coupling.
- Keeps shared code reusable.
- Makes refactors safer as the app grows.
