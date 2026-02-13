# attend-me

Vue 3 + TypeScript app built with Vite. The project includes testing (Vitest), CI (GitHub Actions), automated releases (semantic-release), and production-ready Docker packaging (Nginx serving SPA).

## Table of Contents

- Overview
- Requirements
- Getting Started
- Scripts
- Testing
- Linting & Formatting
- Build (Production)
- CI (GitHub Actions)
- Releases (semantic-release)
- Conventional Commits
- Docker (Containerization)

## Overview

- Framework: Vue 3 + Vite + TypeScript
- State/Router: Pinia, Vue Router
- Testing: Vitest
- CI: build and tests on Pull Requests; test summary + artifact upload
- Releases: semantic-release with Conventional Commits
- Docker: multi-stage build (Node) + Nginx runtime with SPA fallback

## Requirements

- Node: 20.19+ or 22.12+ (see `engines` in package.json)
- NPM for scripts and installs (`npm ci`, `npm run ...`)
- Recommended IDE: VS Code with the official Vue extension (Volar)

## Getting Started

Install dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm run dev
```

## Scripts

- `dev` — Vite dev server
- `build` — type-check + production build
- `type-check` — TypeScript check via `vue-tsc`
- `lint` — ESLint (with cache and auto-fix)
- `format` — Prettier formatting for `src/`
- `test` — run Vitest in interactive mode
- `test:ci` — run Vitest once and emit JSON report to `vitest-results.json`
- `release` — run semantic-release (used by CI)

## Testing

Interactive tests:

```sh
npm run test
```

CI-style (single run with JSON output):

```sh
npm run test:ci
```

The JSON report is written to `vitest-results.json`.

## Linting & Formatting

Run ESLint:

```sh
npm run lint
```

Format sources with Prettier:

```sh
npm run format
```

## Build (Production)

```sh
npm run build
```

Output is generated in `dist/`.

## CI (GitHub Actions)

- Workflow: `.github/workflows/ci.yml`
  - Job `build`: type-check, lint, and Vite build
  - Job `test`: `npm run test:ci`, uploads `vitest-results.json` and publishes a short summary
- Triggers: `pull_request` and manual `workflow_dispatch`

## Releases (semantic-release)

- Config: `.releaserc.json`
- Workflow: `.github/workflows/release.yml`
  - `main`: stable releases (SemVer tag, GitHub Release, `CHANGELOG.md` update)
  - `dev`: pre-releases (GitHub pre-release)

Run locally (preview only):

```sh
npm run release
```

Note: releases are computed from Conventional Commits.

## Conventional Commits

Use these prefixes in commit messages so changes are categorized and versions are bumped correctly:

- `feat: ...` — new features (minor)
- `fix: ...` — bug fixes (patch)
- `perf: ...` — performance improvements (patch)
- `refactor: ...`, `chore: ...`, `docs: ...`, `style: ...`, `test: ...` — no version bump by default
- Breaking changes: add `!` (e.g. `feat!: ...`) or include a `BREAKING CHANGE:` footer (major)

## Docker (Containerization)

Production-ready image using a multi-stage build: Node for building assets and Nginx for serving the SPA.

Files:

- `Dockerfile` — builds the app and serves `dist/` via Nginx
- `nginx.conf` — SPA routing fallback (`try_files ... /index.html`), gzip, basic caching
- `.dockerignore` — excludes unnecessary files from build context
- `docker-compose.yml` — simple local run

Run with Docker Compose:

```sh
docker compose up --build
```

Or manually:

```sh
docker build -t attend-me .
docker run --rm -p 8080:80 attend-me
```

App will be available at http://localhost:8080

---

See also: [Vite Configuration Reference](https://vite.dev/config/).
