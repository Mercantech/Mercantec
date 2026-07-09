# Mercantec.tech

Landing page for [mercantec.tech](https://mercantec.tech) — central hub for Mercantec's digitale platforme.

## Tech stack

- [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript (strict)
- Docker + nginx (produktion via Dokploy/Traefik)

## Lokal udvikling

```bash
npm install
npm run dev
```

Åbn [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

## Docker (lokal)

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Åbn [http://localhost:5173](http://localhost:5173).

## Dokploy (produktion)

Routing følger samme mønster som UptimeDaddy:

1. Cloudflare: `mercantec.tech` (CNAME → tunnel)
2. Tunnel ingress: `*.mercantec.tech` → `http://localhost:80`
3. Traefik (Dokploy): `Host(mercantec.tech)` → container port 5173

| Felt | Værdi |
|------|--------|
| Compose-fil | `docker-compose.yml` |
| Arbejdsmappe | repo-roden |
| Deploy-kommando | `docker compose up -d --build` |

Miljøvariabler (`.env`):

```env
FRONTEND_DOMAIN=mercantec.tech
PUBLIC_AUTH_CLIENT_ID=demo
```

## Mercantec Auth (login)

Siden integrerer med [Mercantec Auth](https://auth.mercantec.tech) via OAuth 2.0 authorization code + PKCE (S256).

**Flow:**
1. "Log ind" genererer PKCE-par + state og sender brugeren til `/oauth/authorize`
2. Callback på `/auth/callback` bytter code til tokens (sessionStorage)
3. "Log ud" rydder tokens og navigerer til `/signout?returnUrl=...`

**Før login virker i produktion skal følgende registreres hos auth-admin:**

| Indstilling | Værdi |
|-------------|--------|
| `client_id` | `demo` (dev) eller jeres produktions-klient |
| Redirect URI | `https://mercantec.tech/auth/callback` |
| Redirect URI (dev) | `http://localhost:4321/auth/callback` |
| Redirect URI (docker) | `http://localhost:5173/auth/callback` |
| CORS (`Cors:SpaOrigins`) | `https://mercantec.tech` (+ dev-origins) |

Kontakt: mags@mercantec.dk

Manifest: https://auth.mercantec.tech/.well-known/mercantec-auth.json

**Auth-modul** (`src/lib/auth/`):
- `startLogin()` / `logout()` — login og logout
- `mercantecFetch()` — fetch med Bearer-header og auto-refresh ved 401
- Tokens i `sessionStorage` (ikke localStorage)

## Projekter

Tilføj nye projekter i `src/data/projects.ts` — ingen komponent-ændringer nødvendige.

## Struktur

```
src/
├── components/     # UI-komponenter (inkl. AuthBar)
├── data/           # Projekter og økosystem-data
├── lib/auth/       # OAuth 2.0 + PKCE, JWT, fetch-wrapper
├── layouts/        # Side-layout
├── pages/          # Astro-sider (inkl. /auth/callback)
└── styles/         # Global CSS + design tokens
public/
├── brand/          # Mercantec-logo og favicons
├── projects/       # Projektlogoer
└── tech/           # Tech stack-ikoner
docker/
├── Dockerfile      # node build → nginx runtime
└── nginx.conf      # Statisk serving
```
