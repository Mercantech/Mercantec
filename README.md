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
```

## Projekter

Tilføj nye projekter i `src/data/projects.ts` — ingen komponent-ændringer nødvendige.

## Struktur

```
src/
├── components/     # UI-komponenter
├── data/           # Projekter og økosystem-data
├── layouts/        # Side-layout
├── pages/          # Astro-sider
└── styles/         # Global CSS + design tokens
public/
├── brand/          # Mercantec-logo og favicons
├── projects/       # Projektlogoer
└── tech/           # Tech stack-ikoner
docker/
├── Dockerfile      # node build → nginx runtime
└── nginx.conf      # Statisk serving
```
