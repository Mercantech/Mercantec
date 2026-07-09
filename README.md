# Mercantec.tech

Landing page for [mercantec.tech](https://mercantec.tech) — central hub for Mercantec's digitale platforme.

## Tech stack

- [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript (strict)
- Docker + nginx (produktion via Dokploy + Cloudflare-tunnel)

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

## Docker

```bash
cp .env.example .env
docker compose up --build -d
```

Åbn [http://localhost:4040](http://localhost:4040).

## Dokploy (produktion)

Samme mønster som **mags.dk** — direkte Cloudflare Tunnel til host-port (ikke Traefik).

### 1. Docker (host-port 4040)

Container eksponerer `4040:4040` på host — som mags marketing på `3000:3000`.

### 2. Cloudflare Tunnel — Published application route

I **Zero Trust → Networks → Tunnels → MAGS-OLC → Published application routes** (samme tunnel som mags.dk), tilføj:

| Felt | Værdi |
|------|--------|
| Hostname | `mercantec.tech` |
| Service | `http://127.0.0.1:4040` |

Det er **denne** skærm (ikke kun DNS → Records). mags.dk virker fordi den har en published route til `127.0.0.1:3000`.

DNS-posten (`mercantec.tech` CNAME → `*.cfargotunnel.com`) oprettes typisk automatisk når du tilføjer hostname i tunnelen.

### 3. Verificér på serveren

```bash
curl -I http://127.0.0.1:4040
```

Forventet: `HTTP/1.1 200 OK`

| Felt | Værdi |
|------|--------|
| Compose-fil | `docker-compose.yml` |
| Deploy-kommando | `docker compose up -d --build` |
| Host-port | `4040` |
| Tunnel service | `http://127.0.0.1:4040` |

Miljøvariabler (`.env` — valgfrit):

```env
WEB_PORT=4040
PUBLIC_AUTH_CLIENT_ID=demo
```

## Mercantec Auth (login)

Siden integrerer med [Mercantec Auth](https://auth.mercantec.tech) via OAuth 2.0 authorization code + PKCE (S256).

**Flow:**
1. "Log ind" genererer PKCE-par + state og sender brugeren til `/oauth/authorize`
2. Callback på `/auth/callback` bytter code til tokens (sessionStorage)
3. "Log ud" rydder tokens og navigerer til `/signout?returnUrl=...`

**Før login virker skal følgende registreres hos auth-admin:**

| Indstilling | Værdi |
|-------------|--------|
| `client_id` | `demo` (dev) eller jeres produktions-klient |
| Redirect URI | `https://mercantec.tech/auth/callback` |
| Redirect URI (lokal dev) | `http://localhost:4321/auth/callback` |
| CORS (`Cors:SpaOrigins`) | `https://mercantec.tech` — kun nødvendig uden token-proxy |

**Bemærk:** Port `4040` er kun intern (Docker/tunnel). Login testes via **https://mercantec.tech** — ikke `http://mercantec.tech:4040`.

**Token-proxy:** Browseren kalder `POST /api/oauth/token` på samme origin (nginx/Vite proxy → auth.mercantec.tech). Det undgår CORS-problemer.

Efter ændringer i auth-kode eller nginx: `docker compose up -d --build`

Kontakt: mags@mercantec.dk

Manifest: https://auth.mercantec.tech/.well-known/mercantec-auth.json

**Auth-modul** (`src/lib/auth/`):
- `startLogin()` / `logout()` — login og logout
- `mercantecFetch()` — fetch med Bearer-header og auto-refresh ved 401
- Tokens i `sessionStorage` (ikke localStorage)

## Projekter

Tilføj nye platforme i `src/data/projects.ts` — ingen komponent-ændringer nødvendige.

## Elevprojekter (`/students`)

Elever kan indsende projekter med billeder, video, GitHub- og live-links. Data håndteres af en separat API-service med PostgreSQL og MinIO.

**Frontend-ruter:**

| Rute | Formål |
|------|--------|
| `/students` | Offentligt galleri (godkendte projekter) |
| `/students/indsend` | Indsendelsesformular (kræver login) |
| `/students/mine` | Egne projekter og status |
| `/students/admin` | Moderation (Teacher/Admin) |

**API** (`students-api/`):

```bash
cd students-api
cp .env.example .env
docker compose up --build -d
```

- API: http://localhost:4041/health
- MinIO: http://localhost:9001

Sæt `PUBLIC_STUDENTS_API_URL` i `.env` (frontend) til API'ens URL.

**Produktion (Dokploy):**

1. Deploy `students-api/docker-compose.yml` (API + PostgreSQL + MinIO)
2. Cloudflare Tunnel:
   - `students-api.mercantec.tech` → port `4041`
   - `media.mercantec.tech` → MinIO port `9000`
3. Sæt `PUBLIC_STUDENTS_API_URL=https://students-api.mercantec.tech` ved web-build
4. Sæt `STORAGE_PUBLIC_URL=https://media.mercantec.tech/student-projects` i API-miljø

## Struktur

```
src/
├── components/     # UI-komponenter (inkl. AuthBar, StudentProjectCard)
├── data/           # Projekter og økosystem-data
├── lib/
│   ├── auth/       # OAuth 2.0 + PKCE, JWT, fetch-wrapper
│   ├── students-api.ts
│   ├── students-auth.ts
│   └── student-project-ui.ts
├── layouts/        # Side-layout
├── pages/
│   ├── auth/callback.astro
│   └── students/   # Elevprojekt-showcase
└── styles/         # Global CSS + design tokens
students-api/       # ASP.NET Core API + PostgreSQL + MinIO
public/
├── brand/          # Mercantec-logo og favicons
├── projects/       # Projektlogoer
└── tech/           # Tech stack-ikoner
docker/
├── Dockerfile      # node build → nginx runtime
└── nginx.conf      # Statisk serving på port 4040
```
