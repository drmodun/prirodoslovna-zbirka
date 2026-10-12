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

S3, SendGrid, OpenAI i Google TTS su opcionalni. Bez SendGrid kljuca aktivacijski mail se samo ispise u log API-ja.

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
