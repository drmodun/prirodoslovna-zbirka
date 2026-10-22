---
title: Hosting on a server
description: Step by step from an empty VPS to a running, backed-up Biosfera, plus updates and troubleshooting.
sidebar:
  order: 4
---

This walks through a first deployment on one Linux server with
`docker-compose.prod.yml`. [Production](/docs/getting-started/production/) is
the reference for every option used here.

## What you need

- **A server** with a recent Ubuntu or Debian, x86 or ARM (the images are
  built for both).
  - **Memory**: the idle stack uses about 350 MB. Text-to-speech and busy
    pages add to that, so take **2 GB** as the minimum and **4 GB** to be
    comfortable.
  - **Disk**: the images take about 2 GB. Uploads (images, PDFs, 3D models,
    videos up to 200 MB) grow from there, so start with **20 GB** or more, or
    keep files in an external bucket.
- **A domain name** whose DNS you can edit.
- **Mail**: an SMTP account (your mail provider, Gmail with an app password,
  or a transactional service) or a SendGrid key, for activation and password
  reset messages.

## 1. Prepare the server

Install Docker with the official script and let your user run it:

```sh
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out and back in afterwards
docker compose version          # needs 2.20 or newer
```

Open only SSH and the web ports:

```sh
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp          # HTTP/3, optional
sudo ufw enable
```

:::caution[Docker and the firewall]
Ports Docker publishes bypass `ufw`. The production file only publishes
ports with the `caddy` profile (80 and 443, on purpose) and the `proxy-host`
profile (bound to `127.0.0.1`). Keep it that way: do not add a public `ports:`
entry for Postgres or the S3 store.
:::

On a 2 GB server, a swap file avoids the kernel killing a container during a
memory spike:

```sh
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Point the domain at the server

Create an `A` record (and `AAAA` for IPv6) for the name people will open,
e.g. `biosfera.example.com`, pointing at the server's address. With the
`caddy` profile the certificate is requested on the first start, so the record
has to resolve before then: check with `dig +short biosfera.example.com`.

## 3. Get the files

The server needs the production compose file, the Caddyfile and the env
file. Cloning the repository is the simplest way:

```sh
sudo mkdir -p /opt/biosfera && sudo chown $USER /opt/biosfera
git clone https://github.com/drmodun/prirodoslovna-zbirka.git /opt/biosfera
cd /opt/biosfera
cp .env.production.sample .env.production
chmod 600 .env.production
```

`git pull` later updates the compose file and the docs; the application
itself comes from the images.

## 4. Fill in the env file

Open `.env.production` and set:

```sh
PUBLIC_URL=https://biosfera.example.com
JWT_SECRET=...            # openssl rand -hex 32
INTERNAL_API_KEY=...      # openssl rand -hex 32, a different one
POSTGRES_PASSWORD=...     # openssl rand -hex 24 (hex needs no URL escaping)
AWS_ACCESS_KEY_ID=...     # openssl rand -hex 12
AWS_SECRET_ACCESS_KEY=... # openssl rand -hex 32
SMTP_URL=smtps://user:password@mail.example.com:465
MAIL_FROM=biosfera@example.com
```

Then choose `COMPOSE_PROFILES`. Answer two questions:

**What should run on this server?** Keep `db`, `s3` and `tts` for the
self-contained setup. Leave one out to use an outside service instead:

- without `db`: `DATABASE_URL=postgresql://user:password@host:5432/biosfera`
  (a managed Postgres 15 or newer)
- without `s3`: the bucket settings and `FILES_UPSTREAM`, see
  [file storage options](/docs/getting-started/production/#file-storage-options)
- without `tts`: `TTS_URL=` (the browser reads text aloud instead)

**What is in front of it?** Exactly one of:

| Situation                                       | Profile         | Then                                                                                  |
| ----------------------------------------------- | --------------- | ------------------------------------------------------------------------------------- |
| Nothing, the server is only for Biosfera        | `caddy`         | Nothing else; Caddy gets the certificate                                              |
| nginx (or Apache, Caddy…) installed on the host | `proxy-host`    | Add a site forwarding to `http://127.0.0.1:8080` (step 6)                             |
| nginx, Traefik or nginx-proxy-manager in Docker | `proxy-network` | Set `PROXY_NETWORK` to its network and forward to `http://biosfera:80` (step 6)       |

For example, a whole stack behind nginx on the host:

```sh
COMPOSE_PROFILES=db,s3,tts,proxy-host
```

## 5. Allow the server to pull the images

The images live at `ghcr.io/drmodun/prirodoslovna-zbirka-{api,web,docs,piper}`
and are published by CI from `master`. GitHub creates them as private
packages. Either make each one public (on GitHub: the package → *Package
settings* → *Change visibility*), or log the server in once with a personal
access token that has the `read:packages` scope:

```sh
echo <token> | docker login ghcr.io -u <github-user> --password-stdin
```

## 6. Start it

Every command below runs in `/opt/biosfera`. A shell alias saves typing:

```sh
alias bio='docker compose -f docker-compose.prod.yml --env-file .env.production'
bio pull
bio up -d
bio ps        # all services "Up", api/web/docs "(healthy)" after a minute
```

**Behind a proxy**, add its site now. For nginx on the host: get the
certificate first (the example site refers to its files), then install
`packages/config/nginx-site.example.conf` with the `127.0.0.1:8080` line it
describes:

```sh
sudo certbot certonly --nginx -d biosfera.example.com
sudo cp packages/config/nginx-site.example.conf /etc/nginx/sites-available/biosfera
sudo nano /etc/nginx/sites-available/biosfera   # server_name, cert paths, proxy_pass
sudo ln -s /etc/nginx/sites-available/biosfera /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Certbot's timer renews the certificate; add
`--deploy-hook "systemctl reload nginx"` to the first command so nginx picks
up each renewal.

Then check the whole path from outside, the way a browser sees it:

```sh
docker/smoke-test.sh https://biosfera.example.com
```

It checks the home page, the API at `/api` and the docs at `/docs`. With
`SMOKE_EMAIL` and `SMOKE_PASSWORD` set to an account, it also signs in and
uploads a small image that has to come back through `/files`.

## 7. Create the first administrator

The production stack has no seed and no accounts.

1. Register on the site as yourself.
2. Open the activation link from the e-mail. Without mail settings, the
   message is in the API log: `bio logs api | grep -A4 "Email to"`.
3. Make the account a platform administrator (`SUPER`):

   ```sh
   bio exec postgres psql -U postgres -d biosfera \
     -c "UPDATE \"User\" SET role = 'SUPER' WHERE email = 'you@example.com';"
   ```

   With your own database, run the same `UPDATE` there.
4. Sign out and back in: the role is read from the login token.

What each role may do is listed in
[Roles and permissions](/docs/reference/roles-and-permissions/).

## 8. Back up

`docker/backup.sh` dumps the bundled database and archives the uploaded
files (the bundled S3 store, or the API's uploads volume), and deletes
backups older than `KEEP_DAYS` (14):

```sh
docker/backup.sh /srv/biosfera-backups
```

Run it nightly from cron (`crontab -e`):

```cron
30 3 * * * cd /opt/biosfera && docker/backup.sh /srv/biosfera-backups >> /var/log/biosfera-backup.log 2>&1
```

A backup on the same disk does not survive losing the server. Copy the
directory elsewhere as well, e.g. with `rclone sync` to object storage or
`restic` to another machine. A managed database or bucket is backed up by its
provider; the script skips what does not run on this server.

**Restoring.** Stop the apps first so nothing writes during the restore:

```sh
bio stop web api
# database
bio exec -T postgres pg_restore -U postgres -d biosfera --clean --if-exists \
  < /srv/biosfera-backups/db-<date>.dump
# files in the bundled S3 store
bio stop s3
bio run --rm --no-deps -T --entrypoint sh s3 -c 'rm -rf /data/* && tar xzf - -C /data' \
  < /srv/biosfera-backups/files-<date>.tar.gz
bio up -d
```

For files kept on the API's disk instead (before `bio up -d`):

```sh
bio run --rm --no-deps -T --entrypoint sh api \
  -c 'rm -rf /app/apps/api/uploads/* && tar xzf - -C /app/apps/api/uploads' \
  < /srv/biosfera-backups/files-<date>.tar.gz
```

Try a restore once on a spare machine or a copy of the server: an untested
backup is a guess.

## 9. Update

```sh
cd /opt/biosfera
git pull                 # newer compose file and docs, if any
docker/backup.sh /srv/biosfera-backups
bio pull && bio up -d
docker image prune -f    # removes the replaced images
```

The API applies new database migrations when it starts.

**Choosing when to update.** `IMAGE_TAG=latest` follows `master`. To update
only on purpose, set `IMAGE_TAG` to a release (`1.4.0`) or a commit SHA in
`.env.production`, and change it when you want the next version.

**Rolling back** is setting `IMAGE_TAG` to the previous version and
`bio up -d`. Migrations only go forward, though: if the newer version changed
the database, the older one may not run against it. Then restore the backup
taken before the update as well.

## 10. Keep an eye on it

- `bio ps`: state and health of every container.
- `bio logs -f api` (or `web`, `reverse-proxy-*`): logs, capped at 30 MB per
  container.
- `docker stats`: memory and CPU per container.
- `df -h` and `docker system df`: disk space, mostly uploads and images.
- An external uptime check (Uptime Kuma on another machine, or a hosted
  service) on `https://biosfera.example.com/api/api-json` notices outages
  you would otherwise hear about from users.

## Troubleshooting

| Symptom | Likely cause and fix |
| ------- | -------------------- |
| `required variable ... is missing a value` on `up` | A required value is empty in `.env.production`; the message names it |
| `pull access denied` / `manifest unknown` | The packages are private (step 5), or `IMAGE_TAG` names a version that was never published |
| `network proxy declared as external, but could not be found` | `proxy-network` profile, but the main proxy's network has another name: set `PROXY_NETWORK`, or `docker network create proxy` |
| `s3` keeps restarting, log says it needs the keys | `s3` profile without `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| Browser shows a certificate error (`caddy` profile) | DNS did not point at the server, or 80/443 were blocked, when Caddy asked for the certificate. Fix that and `bio restart reverse-proxy`; `bio logs reverse-proxy` shows the attempts |
| `502 Bad Gateway` from the main nginx | The stack is down or still starting (`bio ps`), or the upstream does not match the profile: `127.0.0.1:PROXY_PORT` for `proxy-host`, `biosfera:80` on the shared network for `proxy-network` |
| Uploads over 1 MB fail behind nginx | `client_max_body_size 200m;` is missing from the site |
| Notifications only arrive after a reload | The main proxy buffers responses: `proxy_buffering off;` |
| Images and files 404 | `/files` points at the wrong place: check `FILES_UPSTREAM` / `FILES_PREFIX` against the storage table |
| No activation e-mails | No mail settings (the links are in `bio logs api`), or the provider rejects `MAIL_FROM` |
| Login works, but links in e-mails go to the wrong address | `PUBLIC_URL` is not the address people open |
| The API keeps restarting after an update | Read `bio logs api`; a failed migration is reported there. Roll back and restore (step 9) |

## Other ways to host

- **A PaaS that runs Docker Compose** (Coolify, Dokploy, CapRover with
  compose support) can run `docker-compose.prod.yml` with the `proxy-network`
  profile pointed at the platform's proxy network.
- **Vercel and other serverless hosts** are not a fit: the API keeps
  long-lived event streams, runs migrations on start and stores files, and the
  web app expects the API on the same origin.
- **Several servers**: the stack is built for one. Moving Postgres and file
  storage to managed services (leave out `db` and `s3`) is the first step if
  the server gets too small, before anything else.
