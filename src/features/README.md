# Features Directory

Create one folder per domain feature:

- `src/features/<feature-name>/index.js` (public API)
- `src/features/<feature-name>/components/*`
- `src/features/<feature-name>/hooks/*`
- `src/features/<feature-name>/services/*`

Cross-feature usage should import from the public `index.js` entry only.
