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

Svi su opcionalni; dok kljuc nije postavljen koristi se zamjena. Detalji su u `.env.sample`.

| Servis                                                                              | Kljucevi                                                                                                                                                              | Bez kljuca                                                                                                  |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Datoteke: S3 ili bilo koji S3-kompatibilan servis (MinIO, Garage, SeaweedFS, R2...) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`; za ne-AWS jos `AWS_ENDPOINT_URL_S3` i po potrebi `AWS_S3_URL`, `AWS_REGION`, `AWS_S3_FORCE_PATH_STYLE` | API sprema datoteke na disk (`UPLOAD_DIR`, u Dockeru volumen `uploads`) i posluzuje ih na `/blobs/file/...` |
| Mail: bilo koji SMTP server ili SendGrid                                            | `SMTP_URL` ili `SENDGRID_API_KEY`, po potrebi `MAIL_FROM`                                                                                                             | mail s aktivacijskim linkom se ispise u log API-ja                                                          |
| OpenAI (opisi, sazeci, govor u tekst)                                               | `OPENAI_API_KEY`                                                                                                                                                      | opis s Wikipedije, sazetak od prvih recenica objave, prepoznavanje govora preglednika                       |
| Google TTS (tekst u govor)                                                          | `GOOGLE_CLOUD_API_KEY`, opcionalno `S3_PATH`                                                                                                                          | preglednik cita tekst (speech synthesis)                                                                    |

## Docker

Radi bez `.env` datoteke; ako postoji, vrijednosti iz nje imaju prednost.

```sh
docker compose up -d --build   # postgres, api, web, nginx
docker compose run --rm seed   # mock podaci (brise postojece!)
```

- web: http://localhost:3000 (ili http://localhost preko nginxa)
- api: http://localhost:5500, swagger na http://localhost:5500/api
- postgres: localhost:5433
- portovi se mijenjaju preko `WEB_PORT`, `API_PORT`, `POSTGRES_PORT`, `PROXY_PORT`

Seed dodaje i korisnika za razvoj: `dev@biosfera.local` / `biosfera123` (SUPER, vlasnik prve organizacije).

Za probu maila bez pravog servera: `SMTP_URL=smtp://mailpit:1025 docker compose --profile mail up -d`, poruke su na http://localhost:8025.
