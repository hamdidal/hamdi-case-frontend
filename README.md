# VeriPass DPP Frontend

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

Custom forest-green brand (`#2D6A4F`) derived from the VeriPass Claude Design files.

- **CSS custom properties** — all design tokens live in `src/index.css` (`--brand-*`, `--bg-*`, `--text-*`, `--semantic-*`, `--shadow-*`, `--radius-*`)
- **Dark / Light mode** — toggled via a `data-theme` attribute on `<html>`; Ant Design algorithm switches via `ConfigProvider`
- **Typography** — Plus Jakarta Sans (UI), Newsreader (editorial), JetBrains Mono (code/diff)
- **Sidebar** — always dark (`#102A20` light / `#0A1813` dark) regardless of app theme

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL — e.g. `http://51.102.69.153:8080/api/v1` |
| `VITE_PUBLIC_BASE_URL` | ✅ | Public base URL used for QR code deep links — e.g. `http://51.102.69.153:3001` |

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

## Docker

Build and run a production image (nginx serving the static bundle):

```bash
docker build -t veripass-frontend .
docker run -p 3001:80 veripass-frontend
```

The image uses a two-stage build — Node 20 Alpine for the build, nginx Alpine for serving. The nginx config handles SPA routing (`try_files … /index.html`) and enables gzip compression.

> **Note:** environment variables are baked in at build time by Vite. Pass them as build args if you need runtime-configurable values:
> ```bash
> docker build \
>   --build-arg VITE_API_BASE_URL=http://your-api:8080/api/v1 \
>   --build-arg VITE_PUBLIC_BASE_URL=http://your-host:3001 \
>   -t veripass-frontend .
> ```

## Port Reference

| Service | Port |
|---|---|
| Frontend (Docker) | 3001 |
| Backend API | 8080 |
| Grafana | 3000 |

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
Zustand `persist` middleware serialises `{ token, user, isAuthenticated }` to `localStorage` under the key `dpp-auth`. The Axios request interceptor reads the same key to attach `Authorization: Bearer <token>` on every request.

**Theme & language persistence**
Theme and language preference are stored in `localStorage` (`dpp-theme`) via Zustand persist. The `data-theme` attribute is synced on mount in `AppLayout` and on change in `SettingsPage`. i18next `LanguageDetector` reads from the same `dpp-lang` key on cold start.

**QR / PDF asset fetching**
The QR image and PDF download both require an auth header that `<img src>` and `<a href>` tags cannot provide. Both are fetched via `fetch()` with a `Bearer` header, converted to a blob URL via `URL.createObjectURL`, then rendered or triggered as a download. Blob URLs are revoked on unmount to avoid memory leaks.

**Recharts**
All charts use `ResponsiveContainer` so they resize with the layout. The system metrics network chart uses a `useRef`-backed rolling 20-point buffer to avoid re-allocating state on every 15-second tick while keeping the chart reactive.
