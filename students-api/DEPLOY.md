# Deploy — Students API

## Traefik / Dokploy (produktion)

API og media eksponeres via Traefik-labels i `docker-compose.yml` (samme mønster som UptimeDaddy).

| Miljøvariabel | Standard | Service |
|---------------|----------|---------|
| `STUDENTS_API_DOMAIN` | `api-students.mercantec.tech` | ASP.NET API (port 4041) |
| `STUDENTS_MEDIA_DOMAIN` | `media-students.mercantec.tech` | MinIO (port 9000) |

**Krav:**
- Eksternt Docker-netværk `dokploy-network` på hosten
- Cloudflare wildcard `*.mercantec.tech` → tunnel → Traefik (port 80)

**Verificér efter deploy:**

```bash
curl https://api-students.mercantec.tech/health
curl "https://api-students.mercantec.tech/api/student-projects"
```

Frontend skal bygges med:

```env
PUBLIC_STUDENTS_API_URL=https://api-students.mercantec.tech
```

## Selvstændig deploy (kun API-stack)

Hvis API deployes separat fra mercantec.tech-web:

```bash
cd students-api
cp .env.example .env
docker compose up -d --build
```

Se `students-api/docker-compose.yml` for Traefik-labels.
