# Mercantec Students API

Backend til elevprojekt-showcase på [mercantec.tech/students](https://mercantec.tech/students).

## Stack

- ASP.NET Core 8 Minimal API
- PostgreSQL 16
- MinIO (S3-kompatibelt fillager)
- JWT auth via Mercantec Auth

## Lokal kørsel (Docker)

```bash
cp .env.example .env
docker compose up --build -d
```

- API: http://localhost:4041/health
- MinIO konsol: http://localhost:9001

## Endpoints

| Metode | Sti | Auth |
|--------|-----|------|
| GET | `/api/student-projects` | Offentlig |
| GET | `/api/student-projects/{id}` | Offentlig |
| GET | `/api/student-projects/mine` | Elev |
| POST | `/api/student-projects` | Elev |
| PUT | `/api/student-projects/{id}` | Elev |
| POST | `/api/student-projects/{id}/submit` | Elev |
| POST | `/api/student-projects/{id}/media` | Elev (multipart) |
| POST | `/api/student-projects/{id}/media/embed` | Elev |
| DELETE | `/api/student-projects/{id}/media/{mediaId}` | Elev |
| GET | `/api/admin/student-projects?status=pending` | Teacher/Admin |
| POST | `/api/admin/student-projects/{id}/approve` | Teacher/Admin |
| POST | `/api/admin/student-projects/{id}/reject` | Teacher/Admin |

## Produktion (Dokploy)

1. Deploy stack med `docker compose up -d --build`
2. Cloudflare Tunnel routes:
   - `students-api.mercantec.tech` → `http://127.0.0.1:4041`
   - `media.mercantec.tech` → `http://127.0.0.1:9000` (MinIO public bucket)
3. Sæt `STORAGE_PUBLIC_URL=https://media.mercantec.tech/student-projects`
4. Tilføj CORS-origin `https://mercantec.tech`

## Miljøvariabler

Se `.env.example`.
