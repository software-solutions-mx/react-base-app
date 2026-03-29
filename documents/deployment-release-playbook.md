# Deployment and Release Playbook (GitHub Actions + Vercel)

## Target environment model

- `development`: local only (`npm run dev`)
- `staging`: QA + preview environment (branch: `staging`)
- `production`: live environment (branch: `main`/`master`)

## Workflows included

- `.github/workflows/deploy-vercel.yml`
  - Push to `staging` => deploy to Vercel Preview runtime
  - Push to `main`/`master` => deploy to Vercel Production runtime
  - Manual deploy available via `workflow_dispatch`
- `.github/workflows/release.yml`
  - Push to `main`/`master` => semantic versioning + changelog + GitHub Release

## Required GitHub setup

1. Create GitHub environments:

- `staging`
- `production`

2. Add these secrets to each environment:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

3. Protect `production` environment:

- Require reviewers for deployment approval
- Restrict deployment branches to `main`/`master`

4. Repository Actions permissions:

- Set workflow permissions to **Read and write** (semantic-release needs this for tags/changelog commit)

## Required Vercel setup

1. Link this repository to a Vercel project.
2. Configure environment variables in Vercel:

- `Preview` variables are used by `staging` deployments.
- `Production` variables are used by production deployments.

3. Keep `VITE_APP_ENV` aligned with runtime:

- Preview: `staging`
- Production: `production`

## Branch strategy

- Open PRs into `staging` for QA validation.
- Promote tested changes from `staging` into `main`.
- Every merge to `main` deploys to production and triggers release automation.

## Release strategy (semantic-release)

- Uses Conventional Commits to infer version bumps.
- Generates/updates `CHANGELOG.md`.
- Creates Git tags (`vX.Y.Z`) and GitHub Releases.
- Release commits use `[skip ci]` to avoid workflow loops.

## Local verification commands

- `npm run ci:check`
- `npm run release:dry-run`
