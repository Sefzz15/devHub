# devHub deployment

Runs the whole devHub stack as Docker containers on the home server and exposes it
through the **existing Cloudflare Tunnel** at `https://app.sefzz.com`. Existing services on that tunnel are not
touched — they keep running on their own hostnames.

```
Cloudflare edge (HTTPS) ──► Cloudflare Tunnel ──► 127.0.0.1:8088 (caddy)
                                                      ├─ /          Angular static site
                                                      ├─ /api/*   → backend   :8080  (.NET 10)
                                                      └─ /chatHub → websocket :5001  (.NET 9 SignalR)
                                                   mysql :3306 (internal only, persistent volume)
```

Everything is one Docker network. The browser only ever talks to `app.sefzz.com`, so there
are no cross-origin (CORS) issues and the frontend uses relative URLs (`/api`, `/chatHub`).

## 1. Prerequisites

- Docker Desktop running (Windows + WSL2).
- An existing Cloudflare Tunnel you can add a hostname to.

## 2. Configure secrets

```sh
cd devHub/deploy
cp .env.example .env
```

Edit `.env` and set a strong `MYSQL_ROOT_PASSWORD`, a long random `JWT_SECRET`, and your
Spotify credentials. `.env` is git-ignored — never commit it.

## 3. Build and run

```sh
docker compose up -d --build
```

Or use the launchers in [`../scripts`](../scripts) (Windows, double-clickable):

| Script | Does |
|---|---|
| `start-devhub.cmd` | build + start the stack |
| `start-devhub-scrape.cmd` | refresh the cinema listings first, then build + start |

Both `cd` into this folder themselves, so they work from anywhere.

First build pulls the .NET SDK + Node images and compiles everything (a few minutes).
On startup the backend automatically applies its EF Core migrations, creating the schema
in the fresh MySQL container.

Check it locally before wiring the tunnel:

```sh
curl http://localhost:8088/            # Angular index.html
curl http://localhost:8088/api/products  # backend JSON
docker compose ps                      # all services "running"/"healthy"
```

## 4. Point the Cloudflare Tunnel at it

Add **one** public hostname to your existing tunnel.

**Dashboard-managed tunnel** (Zero Trust → Networks → Tunnels → your tunnel → Public Hostname → Add):

| Field | Value |
|-------|-------|
| Subdomain | `app` |
| Domain | `sefzz.com` |
| Service | `http://localhost:8088` |

**`config.yml`-managed tunnel** — add an ingress rule above the catch-all (keep your
existing rules):

```yaml
ingress:
  - hostname: existing.example.com
    service: http://localhost:9000
  - hostname: app.sefzz.com
    service: http://localhost:8088
  - service: http_status:404
```

Then restart cloudflared. WebSockets work through Cloudflare automatically; SignalR will use
the websocket transport, which is exempt from Cloudflare's 100s proxy timeout.

Visit `https://app.sefzz.com` — done.

## 5. Local development (unchanged)

The frontend now uses relative URLs. `proxy.conf.json` (wired into `angular.json`) forwards
them during `ng serve`, so local dev still works once your backend (`:5000`) and websocket
(`:5001`) are running:

```sh
cd .. && npm start   # proxies /api -> :5000 and /chatHub -> :5001
```

## 6. Redeploy after changes

```sh
docker compose up -d --build        # rebuild + restart changed services
docker compose logs -f backend      # follow a service's logs
docker compose down                 # stop (keeps the DB volume)
```

## Troubleshooting

- **Frontend build fails on a bundle-size budget** — three.js/p5/apexcharts can push the
  initial bundle over the 2 MB error budget in `angular.json`. Raise `maximumError` there if so.
- **Backend can't reach the DB** — it retries for ~30s on boot; if it still fails, check
  `MYSQL_ROOT_PASSWORD` matches in `.env` and `docker compose logs mysql`.
- **Need existing data** — the DB starts empty. See *Spotify data* below.

## Spotify data: which database am I hitting?

There are **two** MySQL instances and the command you run decides the target:

| | Local / native | Dockerized |
|---|---|---|
| Conn string | `Server=localhost` (`../../backend/appsettings.Development.json`) | `Server=mysql` (this folder's `.env`) |
| Used by | `dotnet run` on your host | the `backend` container |
| Spotify creds | `appsettings.Development.json` | `.env` (`SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`) |

> The dockerized backend has **no published port of its own** — it's only reachable
> through Caddy at `127.0.0.1:8088`. So `localhost:5000` always means the *local* dotnet
> process, never the container.

**Local DB** (host `dotnet run`):

```sh
dotnet run -- --import-spotify                                                    # import
Invoke-RestMethod -Method Post -Uri https://localhost:5000/api/spotify/enrich/backfill   # enrich
```

**Dockerized DB** (run from this `deploy/` folder so `.env` is loaded):

The container is headless Linux — it can't open the Windows folder picker and can't see
your Windows folders. So the host folder is set **once** in `.env`
(`SPOTIFY_IMPORT_HOST_DIR`) and mounted read-only by the `backend-import` service. The
command itself carries no path:

```powershell
# import (reads SPOTIFY_IMPORT_HOST_DIR from .env)
docker compose run --rm backend-import

# enrich (or https://app.sefzz.com/...)
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8088/api/spotify/enrich/backfill
```

`backend-import` has a Compose profile, so a normal `docker compose up -d` never starts it
— it only runs when you invoke it explicitly. Re-running is safe; the importer de-dupes.

> After changing backend code, rebuild first: `docker compose up -d --build backend`.

Inspect the dockerized DB directly:

```sh
docker compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"
```

> Before importing/enriching against Docker, make sure `SPOTIFY_CLIENT_ID` /
> `SPOTIFY_CLIENT_SECRET` in `.env` are real (not the `.env.example` placeholders),
> then `docker compose up -d backend` to restart the running container with them.
