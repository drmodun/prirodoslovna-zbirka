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

Direktni portovi: web 3000, api 5500 (swagger na `/api`), dokumentacija 4321 (na `/docs`), postgres 5433; mijenjaju se preko `WEB_PORT`, `API_PORT`, `DOCS_PORT`, `POSTGRES_PORT`, `PROXY_PORT`, `PROXY_TLS_PORT`.

Seed dodaje i korisnika za razvoj: `dev@biosfera.local` / `biosfera123` (SUPER, vlasnik prve organizacije).

## Produkcija

Za server na kojem vec radi glavni reverse proxy u Dockeru (nginx, nginx-proxy-manager, Traefik...). Stack ne objavljuje nijedan port: njegov Caddy se spaja na mrezu glavnog proxyja pod imenom `biosfera`, a glavni proxy drzi certifikat i prosljedjuje stranicu na `http://biosfera:80`.

```sh
cp .env.production.sample .env.production   # PUBLIC_URL, JWT_SECRET, lozinke, PROXY_NETWORK
docker network create proxy                 # samo ako mreza glavnog proxyja jos ne postoji
docker compose --env-file .env.production \
  -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- Primjer konfiguracije za glavni nginx: `packages/config/nginx-site.example.conf`. Bitni su `client_max_body_size` (uploadi do 200 MB) i `proxy_buffering off` (obavijesti su event stream).
- Bez obaveznih vrijednosti (`PUBLIC_URL`, `JWT_SECRET`, `POSTGRES_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) compose se ne pokrece.
- Seed je u produkciji iskljucen jer brise sve podatke.
- Ako glavni nginx nije u Dockeru nego na hostu, mreza mu nije dostupna: tada objavi Caddy na lokalnom portu (`ports: ["127.0.0.1:8080:80"]` na `reverse-proxy`) i u nginxu koristi `proxy_pass http://127.0.0.1:8080`.
- Bez glavnog proxyja, da Caddy sam drzi certifikat: lokalni compose uz `PUBLIC_URL=https://domena` i `SITE_ADDRESS=domena`.
