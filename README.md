# Kobe DPP Frontend

Digital Product Passport management panel for textile products — built with React 19 + TypeScript + Ant Design v6.

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript 6 (strict) |
| Build Tool | Vite 8 |
| Component Library | Ant Design v6 |
| State Management | Zustand v5 (localStorage persistence) |
| Routing | React Router v7 |
| Internationalisation | react-i18next (TR / EN) |
| Charts | Recharts v3 |
| HTTP Client | Axios (Bearer token interceptor) |
| QR Code | qrcode.react |

## Design System

Custom forest-green brand (`#2D6A4F`) derived from the Kobe Design files.

- **CSS custom properties** — all design tokens live in `src/index.css` (`--brand-*`, `--bg-*`, `--text-*`, `--semantic-*`, `--shadow-*`, `--radius-*`)
- **Dark / Light mode** — toggled via a `data-theme` attribute on `<html>`; Ant Design algorithm switches via `ConfigProvider`
- **Typography** — Plus Jakarta Sans (UI), Newsreader (editorial), JetBrains Mono (code/diff)
- **Sidebar** — always dark (`#102A20` light / `#0A1813` dark) regardless of app theme

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL — e.g. `http://hamdi-case-backend.mindmons.com/api/v1` |
| `VITE_PUBLIC_BASE_URL` | ✅ | Public base URL used for QR code deep links — e.g. `http://hamdi-case-frontend.mindmons.com` |

## Local Development

```bash
npm install
cp .env.example .env   # then edit .env with real values
npm run dev            # starts Vite dev server on :5173 with /api proxy → :8080
```

Other scripts:

```bash
npm run build          # tsc + vite production build → dist/
npm run preview        # serve the dist/ folder locally
npm run lint           # eslint
```

## Testing

### Unit & Component Tests (Vitest + React Testing Library)

```bash
# Run the full test suite once
npm test
# or
npx vitest run

# Run in interactive watch mode (re-runs on file change)
npm run test:watch
# or
npx vitest

# Produce a V8 code-coverage report (HTML + lcov in coverage/)
npm run test:coverage
# or
npx vitest run --coverage
```

Test files follow the `*.test.ts` / `*.test.tsx` naming convention and live alongside the source files they exercise.

**What is covered:**

| Layer | File | Description |
|---|---|---|
| Store | `src/store/useThemeStore.test.ts` | Theme toggle, language switching, localStorage persistence |
| Store | `src/store/useAuthStore.test.ts` | `setAuth`/`clearAuth`, remember-me switchable storage |
| Store | `src/store/useLoadingStore.test.ts` | Increment / decrement, defensive floor at 0 |
| Component | `src/components/common/ThemeToggle.test.tsx` | Icon rendering per theme, toggle interaction |
| Component | `src/components/common/LanguageSwitcher.test.tsx` | Active state, i18n change, localStorage write |
| Page | `src/pages/dashboard/DashboardPage.test.tsx` | Loading skeletons, stat cards, error alert, empty state |

### End-to-End Tests (Playwright)

E2E tests live in `../tests/e2e/` (workspace root) and target the running Vite dev server (default `http://localhost:5173`) plus the Go API. All API calls are intercepted with `page.route()` so the suite can run offline.

```bash
# From the workspace root (hamdi-case/)

# Install Playwright browsers on first run
npx playwright install --with-deps chromium firefox

# Run the full E2E suite (Chromium + Firefox)
npx playwright test

# Run a single spec
npx playwright test tests/e2e/admin-journey.spec.ts

# Run against a live environment
BASE_URL=https://hamdi-case-frontend.mindmons.com npx playwright test

# Open the interactive HTML report after a run
npx playwright show-report

# Debug a test interactively in the browser
npx playwright test --debug tests/e2e/public-passport.spec.ts
```

**E2E suites:**

| File | Lifecycle covered |
|---|---|
| `admin-journey.spec.ts` | Login → Dashboard stats → Create product (100% material guard) → QR/PDF buttons → User role change |
| `auditor-journey.spec.ts` | Register (defaults to auditor) → Product list read-only → Blocked from edit/delete → Redirected from `/users` and `/settings` |
| `public-passport.spec.ts` | Unauthenticated `/p/:uuid` → Public fields visible → Admin metadata hidden → 404 for unknown UUID → Language switcher works |

## Docker

Build and run a production image (nginx serving the static bundle):

```bash
docker build -t kobe-frontend .
docker run -p 3000:80 kobe-frontend
```

The image uses a two-stage build — Node 20 Alpine for the build, nginx Alpine for serving. The nginx config handles SPA routing (`try_files … /index.html`) and enables gzip compression.

> **Note:** environment variables are baked in at build time by Vite. Pass them as build args if you need runtime-configurable values:
> ```bash
> docker build \
>   --build-arg VITE_API_BASE_URL=http://hamdi-case-backend.mindmons.com/api/v1 \
>   --build-arg VITE_PUBLIC_BASE_URL=http://hamdi-case-frontend.mindmons.com \
>   -t kobe-frontend .
> ```

## Port Reference

| Service | Port |
|---|---|
| Frontend (Docker) | 3000 |
| Backend API | 8080 |
| Grafana | 3100 |

## Pages & Routes

| Route | Auth | Role | Page |
|---|---|---|---|
| `/login` | Public | — | Login |
| `/register` | Public | — | Register |
| `/p/:uuid` | Public | — | Public Passport View |
| `/dashboard` | ✅ | any | Dashboard (stats + charts) |
| `/products` | ✅ | any | Product List |
| `/products/:id` | ✅ | any | Product Detail / Editor |
| `/metrics` | ✅ | any | System Metrics (Prometheus) |
| `/users` | ✅ | admin | Users & Roles |
| `/audit` | ✅ | admin | Audit Log |
| `/settings` | ✅ | admin | Settings |

## Architecture Decisions

**Ant Design + CSS custom properties**
Ant Design `ConfigProvider` handles component-level theming (color tokens, radius, font). All non-Ant-Design elements (sidebar, cards, table rows, badges, diff viewer) use CSS custom properties from `src/index.css` so they also respond to dark mode.

**Role-based routing**
`PrivateRoute` hides admin routes in the frontend, but this is UX only — the backend enforces authorization on every API call. The frontend role gate prevents accidental navigation, not malicious access.

**Auth persistence**
Zustand `persist` middleware serialises `{ token, user, isAuthenticated }` to `localStorage` under the key `dpp-auth`. When the user unchecks "Remember me", the same payload goes to `sessionStorage` instead. The Axios request interceptor reads both storages to attach `Authorization: Bearer <token>` on every request.

**Theme & language persistence**
Theme and language preference are stored in `localStorage` (`dpp-theme`) via Zustand persist. The `data-theme` attribute is synced on mount in `AppLayout` and on change in `SettingsPage`. i18next `LanguageDetector` reads from the same `dpp-lang` key on cold start.

**QR / PDF asset fetching**
The QR image and PDF download both require an auth header that `<img src>` and `<a href>` tags cannot provide. Both are fetched via `fetch()` with a `Bearer` header, converted to a blob URL via `URL.createObjectURL`, then rendered or triggered as a download. Blob URLs are revoked on unmount to avoid memory leaks.

**Recharts**
All charts use `ResponsiveContainer` so they resize with the layout. The system metrics network chart uses a `useRef`-backed rolling 20-point buffer to avoid re-allocating state on every 15-second tick while keeping the chart reactive.
