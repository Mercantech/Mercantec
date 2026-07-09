# Deploy — Students API

## 1. Miljø på serveren

```bash
cd students-api
cp .env.example .env
# Rediger POSTGRES_PASSWORD, MINIO_ROOT_PASSWORD
```

Produktion `.env`:

```env
API_PORT=4041
STORAGE_PUBLIC_URL=https://media.mercantec.tech/student-projects
```

## 2. Start stack

```bash
docker compose up -d --build
curl http://127.0.0.1:4041/health
```

## 3. Cloudflare Tunnel routes

| Hostname | Service |
|----------|---------|
| `students-api.mercantec.tech` | `http://127.0.0.1:4041` |
| `media.mercantec.tech` | `http://127.0.0.1:9000` |

## 4. Frontend build-arg

I Mercantec web-deploy (`docker-compose.yml`):

```env
PUBLIC_STUDENTS_API_URL=https://students-api.mercantec.tech
```

Genbyg web-containeren efter ændring.

## 5. Auth / CORS

- API CORS skal inkludere `https://mercantec.tech`
- JWT audience: `mercantec-apps` (samme som frontend)
- Roller: `Student` (indsend), `Teacher` / `Admin` (moderation)

## 6. Verificering

1. `GET https://students-api.mercantec.tech/health` → `{ "status": "ok" }`
2. Log ind på mercantec.tech → `/students/indsend`
3. Opret kladde → indsend → godkend via `/students/admin`
