# NextMind Academy

Marketing site, student auth, and admin dashboard for NextMind Academy
(digital arts, design & innovation workshops) — built with TanStack Start
(React 19, SSR) and Supabase.

## Stack

- **TanStack Start** — SSR React framework (file-based routing, server functions)
- **Vite 8** + **Nitro** (Vercel preset) for the server build
- **Supabase** — auth, database, and the admin/student data model
- **Tailwind CSS v4** + shadcn/ui components

## Development

```sh
npm i
npm run dev
```

Copy `.env.example` to `.env` (or just edit `.env`) with your Supabase project's
URL and publishable key before running locally.

## Deploying to Vercel

This project builds to Vercel's Build Output API via Nitro — no extra
`vercel.json` needed. Just import the repo in Vercel and set these
environment variables in the project settings:

| Variable | Where to find it |
| --- | --- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Supabase project settings → API |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API (used server-side by the admin panel — keep secret) |

## Supabase

Database schema and RLS policies live in `supabase/migrations/`. This
project only talks to Supabase over the network (no server-side Supabase CLI
step is required at deploy time) — the migrations folder is for reference /
running against your Supabase project with the Supabase CLI if you need to
recreate the schema elsewhere.
