<!--
┌──────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
│  ──────────────────────────────────────────────────────────────────   │
│  File      : infra/README.md                                        │
│  Purpose   : Readme                                                 │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
│  GitHub    : https://github.com/setuju                            │
│  Website   : https://saturumah.net                              │
│  Created   : 10-11-2026                                             │
│  License   : MIT                                                  │
└──────────────────────────────────────────────────────────────────────┘
-->

# Infra — Financial OS

Local PostgreSQL 16 + Redis 7 untuk development.

## Prasyarat
- Docker 29.x (daemon running)
- `infra/.env` sudah diisi (lihat `.env.example`)

## Lifecycle

### Start
```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d
```

Tunggu sampai healthcheck `healthy`:
```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env ps
```

### Stop (data tetap)
```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env down
```

### Stop + hapus volume (DATA HILANG)
```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env down -v
```
> PERINGATAN: `-v` menghapus named volume `financial_os_pgdata` dan `financial_os_redisdata`. Semua data transaksi & cache hilang permanen.

### Logs
```bash
docker compose -f infra/docker-compose.yml logs -f postgres
docker compose -f infra/docker-compose.yml logs -f redis
```

## Connection Strings

| Service | Host | Port | Connection String |
|---|---|---|---|
| PostgreSQL | `localhost` | `5433` | `postgres://financial_os:<PASSWORD>@localhost:5433/financial_os` |
| Redis | `localhost` | `6380` | `redis://:<PASSWORD>@localhost:6380` |

Nilai password ada di `infra/.env` (gitignored).

## Verifikasi Manual
```bash
# Postgres
docker exec -it financial_os_postgres psql -U financial_os -d financial_os -c "SELECT version();"

# Redis
docker exec -it financial_os_redis sh -c 'redis-cli -a "$REDIS_PASSWORD" ping'
# -> PONG
```
