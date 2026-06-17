# Home Inventory PWA

Mobile-first shared inventory app for iPhone Safari, built with React, Vite, TypeScript, Supabase Auth, Supabase Row Level Security, and GitHub Pages.

## Features

- Supabase email/password sign in and sign up
- Approved household members only
- Shared inventory list with search
- Add, edit, and delete items
- Supplier name, contact, website, and clickable supplier links
- CSV and Excel-compatible CSV export
- iPhone-friendly responsive layout
- PWA manifest, service worker, and app icon placeholders
- Static hosting on GitHub Pages

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Fill in `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BASE_PATH=/
```

4. Start the app:

```bash
npm run dev
```

5. Build locally:

```bash
npm run build
npm run preview
```

## Supabase Setup

1. Create a Supabase project.
2. In Supabase, go to **SQL Editor**.
3. Run [`supabase/schema.sql`](supabase/schema.sql).
4. In **Authentication > Providers**, enable Email.
5. Create accounts from the app for the two users who should share the inventory.
6. Edit [`supabase/seed_inventory.sql`](supabase/seed_inventory.sql) and replace:

```sql
owner@example.com
second-user@example.com
```

with the two real user emails.

7. Run [`supabase/seed_inventory.sql`](supabase/seed_inventory.sql).

The seed creates one shared household named `Home Inventory`, approves the two users, and inserts the recovered inventory records from the provided Numbers sheet.

## GitHub Pages Deployment

1. Push this project to a GitHub repository.
2. In GitHub, open **Settings > Secrets and variables > Actions**.
3. Add repository secrets:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

4. Open **Settings > Pages** and set source to **GitHub Actions**.
5. Push to `main` or run the workflow manually.

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the static app and deploys `dist` to GitHub Pages. It automatically sets `VITE_BASE_PATH` to the repository name.

## iPhone Home Screen Install

1. Open the GitHub Pages URL in Safari on iPhone.
2. Tap **Share**.
3. Tap **Add to Home Screen**.

Safari uses the web manifest, generated service worker, and `public/icons` placeholders for the installed app.

## Inventory Seed Notes

The source Numbers document could not be exported through a CLI converter, so the seed was transcribed from the document preview and internal readable table text. Missing fields were left blank. Supplier prices and supplier part numbers that do not have dedicated requested columns are preserved in `notes`.

The CSV copy of the seed data is available at [`supabase/seed_inventory.csv`](supabase/seed_inventory.csv).
