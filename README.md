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
yarn dev                   # api na :5500 (swagger na /api), web na :3000
```

Ostalo: `yarn build`, `yarn lint`, `yarn type-check`, `yarn format`.

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

- `reverse-proxy` (Caddy): jedna adresa za sve. `/api/*` ide na API, `/files/*` na bucket, ostalo na web
- `web`, `api`, `postgres`
- `s3` (SeaweedFS): S3-kompatibilna pohrana datoteka, zamjenjiva pravim S3-em ili drugim servisom
- `piper`: tekst u govor, srpski glas (`PIPER_VOICE`)
- `mailpit` (samo uz `--profile mail`): hvata mailove za probu, `SMTP_URL=smtp://mailpit:1025`, poruke na http://localhost:8025

Na vlastitoj domeni: `PUBLIC_URL=https://biosfera.example.com` i `SITE_ADDRESS=biosfera.example.com`, pa `docker compose up -d --build` (web image ima adrese ugradjene). Caddy sam uzima certifikat. Tada postavi i `JWT_SECRET`, `AWS_ACCESS_KEY_ID` i `AWS_SECRET_ACCESS_KEY`, jer su zadane vrijednosti javne.

Direktni portovi: web 3000, api 5500 (swagger na `/api`), postgres 5433; mijenjaju se preko `WEB_PORT`, `API_PORT`, `POSTGRES_PORT`, `PROXY_PORT`, `PROXY_TLS_PORT`.

Seed dodaje i korisnika za razvoj: `dev@biosfera.local` / `biosfera123` (SUPER, vlasnik prve organizacije).
