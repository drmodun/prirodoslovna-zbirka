# Biosfera

- Projekt napravljen primarno za potrebe III. gimnazije Split i za infokup
- Sastoji se od backenda i frontenda, backend je napravljen u NestJs frameworku dok je frontend napravljen u NextJs frameworku, oboje napisana preko typescripta
- Iako je funkcionalno gotov, vjeojratno cebit jos dodano novih stvari i kod ce bit uređivan

## Lokalno pokretanje

Treba Node 20+ (`.nvmrc` je na 22), Yarn 1 i Postgres.

```sh
cp .env.sample .env        # upisat DATABASE_URL i JWT_SECRET
yarn install
yarn workspace api migrate # primijeni migracije
yarn workspace api seed    # opcionalno: mock podaci (brise postojece!)
yarn dev                   # api na :5500 (swagger na /api), web na :3000, dokumentacija na :4321/docs
```

Ostalo: `yarn build`, `yarn lint`, `yarn type-check`, `yarn format`.

## Dokumentacija

Detaljna dokumentacija (arhitektura, konfiguracija, funkcionalnosti, API, testovi, poznati bugovi) je Astro Starlight stranica u `apps/docs`: `yarn workspace docs dev` pa http://localhost:4321/docs, a u Dockeru na http://localhost/docs.

## Vanjski servisi

Svi su opcionalni i zamjenjivi; dok nista nije postavljeno koristi se zamjena. Detalji su u `.env.sample`.

| Sto                                                                                 | Postavke                                                                                                                                                              | Bez postavki                                                                          |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Datoteke: S3 ili bilo koji S3-kompatibilan servis (SeaweedFS, Garage, MinIO, R2...) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`; za ne-AWS jos `AWS_ENDPOINT_URL_S3` i po potrebi `AWS_S3_URL`, `AWS_REGION`, `AWS_S3_FORCE_PATH_STYLE` | API sprema datoteke na disk (`UPLOAD_DIR`) i posluzuje ih na `/blobs/file/...`        |
| Mail: bilo koji SMTP server (i Gmail) ili SendGrid                                  | `SMTP_URL` ili `SENDGRID_API_KEY`, po potrebi `MAIL_FROM`                                                                                                             | mail s aktivacijskim linkom se ispise u log API-ja                                    |
| AI opisi, sazeci, govor u tekst: bilo koji OpenAI-kompatibilan API                  | `OPENAI_API_KEY`, po potrebi `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_TRANSCRIPTION_MODEL`                                                                          | opis s Wikipedije, sazetak od prvih recenica objave, prepoznavanje govora preglednika |
| Tekst u govor: Piper ili Google TTS                                                 | `TTS_URL` ili `GOOGLE_CLOUD_API_KEY`                                                                                                                                  | preglednik cita tekst (speech synthesis)                                              |

## Docker

Cijeli stack bez `.env` datoteke i bez vanjskih racuna; ako `.env` postoji, vrijednosti iz njega imaju prednost.

```sh
docker compose up -d --build   # pa otvori http://localhost
docker compose run --rm seed   # mock podaci (brise postojece!)
```

Sto se pokrece:

- `reverse-proxy` (Caddy): jedna adresa za sve. `/api/*` ide na API, `/files/*` na bucket, `/docs/*` na dokumentaciju, ostalo na web
- `web`, `api`, `postgres`, `docs` (staticna dokumentacija)
- `s3` (SeaweedFS): S3-kompatibilna pohrana datoteka, zamjenjiva pravim S3-em ili drugim servisom
- `piper`: tekst u govor, srpski glas (`PIPER_VOICE`)
- `mailpit` (samo uz `--profile mail`): hvata mailove za probu, `SMTP_URL=smtp://mailpit:1025`, poruke na http://localhost:8025

Datoteke: `docker-compose.yml` je zajednicka osnova bez objavljenih portova, `docker-compose.override.yml` (ucitava se sam) objavljuje portove za lokalni rad.

Direktni portovi: web 3000, api 5500 (swagger na `/api`), dokumentacija 4321 (na `/docs`), postgres 5433; mijenjaju se preko `WEB_PORT`, `API_PORT`, `DOCS_PORT`, `POSTGRES_PORT`, `PROXY_PORT`, `PROXY_TLS_PORT`. Web image zove API na `/api` i cita datoteke s `/files` na adresi s koje je stranica otvorena, pa aplikaciju treba otvarati preko proxyja (http://localhost); na portu 3000 stranice se renderiraju, ali pozivi iz preglednika ne prolaze.

Seed dodaje i korisnika za razvoj: `dev@biosfera.local` / `biosfera123` (SUPER, vlasnik prve organizacije).

Provjera stacka koji radi: `docker/smoke-test.sh http://localhost` (uz `SMOKE_EMAIL` i `SMOKE_PASSWORD` provjerava i prijavu i upload).

## Produkcija

`docker-compose.prod.yml` je samostalan: povlaci objavljene image s ghcr.io (`.github/workflows/docker-image.yml`, amd64 i arm64) i nista ne builda.

```sh
cp .env.production.sample .env.production   # PUBLIC_URL, tajne, COMPOSE_PROFILES
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Azuriranje je isti `pull` + `up -d`; API pri pokretanju primijeni migracije. `IMAGE_TAG` bira verziju (`latest` prati `master`, ili release/commit SHA).

`COMPOSE_PROFILES` bira sto se pokrece (zadano `db,s3,tts,caddy`):

- `db`, `s3`, `tts`: ugradjeni Postgres, SeaweedFS i Piper. Bez `db` postavi `DATABASE_URL`; bez `s3` postavi `AWS_*` i `FILES_UPSTREAM` (ili obrisi kljuceve pa datoteke idu na disk); bez `tts` postavi `TTS_URL=`.
- tocno jedan nacin pristupa, isti Caddy objavljen na tri nacina:
  - `caddy`: nista ispred, Caddy na 80/443 sam dobiva certifikat za `PUBLIC_URL`
  - `proxy-host`: nginx (ili drugi proxy) na hostu, Caddy na `127.0.0.1:8080` (`PROXY_PORT`)
  - `proxy-network`: proxy u Dockeru, Caddy se spaja na njegovu mrezu (`PROXY_NETWORK`) kao `biosfera` (`PROXY_ALIAS`)

Detalji i tablica za pohranu datoteka su u dokumentaciji (Getting started → Production), a vodic od praznog servera do produkcije (DNS, firewall, prvi administrator, backup, azuriranja, rjesavanje problema) u Getting started → Hosting on a server. Backup: `docker/backup.sh`.

- Primjer za glavni nginx (obje varijante): `packages/config/nginx-site.example.conf`. Bitni su `client_max_body_size` (uploadi do 200 MB) i `proxy_buffering off` (obavijesti su event stream).
- Bez `PUBLIC_URL`, `JWT_SECRET`, `INTERNAL_API_KEY` i lozinke baze (ili `DATABASE_URL`) compose se ne pokrece.
- Seed nije dio produkcijskog compose-a jer brise sve podatke.
- GitHub pakete stvara kao privatne: ili ih postavi javnima, ili se na serveru jednom prijavi s `docker login ghcr.io`.
