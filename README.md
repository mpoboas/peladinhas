# Peladinhas da Invicta

Next.js app for football sessions, games, and standings — Porto · ISEP.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- [PocketBase](https://pocketbase.io) (self-hosted)

## Setup

1. **PocketBase** — run locally on port 8090 and create collections per [pocketbase/SCHEMA.md](pocketbase/SCHEMA.md). Create an admin user.

2. **Environment**

   ```bash
   cp .env.example .env.local
   ```

   Set `NEXT_PUBLIC_POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`.

3. **Install & run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/login](http://localhost:3000/login).

4. **Migrate legacy HTML data** (optional)

   PocketBase tem de estar acessível no URL do `.env.local` (testa com `curl $NEXT_PUBLIC_POCKETBASE_URL/api/health`).

   ```bash
   npm run migrate
   ```

   Se vires `ENOTFOUND` ou `fetch failed`, o hostname não resolve ou o servidor está offline — para local usa `http://127.0.0.1:8090` com `./pocketbase serve`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run migrate` | Import `scripts/legacy-data.json` into PocketBase |

Legacy static site: [legacy/index.html](legacy/index.html).
