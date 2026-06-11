# GharSeva — Trusted Home Helpers Near You

A domestic-services marketplace (maids, cooks, nannies, drivers & more). Service
providers register and get discovered; customers search verified helpers in their
area and unlock contact details after a free sign-up.

> Inspired by myhappymaid / Sulekha — built cleaner and area-first.

## Features

- **Two roles** — register as a **customer** (needs help) or a **helper/provider**.
- **Area-based search** — filter providers by service, city, locality and pincode.
- **Verified badge** — providers are marked *Verified* once email + mobile are on file
  (MVP policy; pluggable for real document/OTP verification later).
- **Gated contact** — a provider's phone/email is hidden until a visitor registers or
  logs in (each reveal is recorded as a lead).
- **Provider dashboard** — helpers edit their services, area, rate, experience & availability.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma · Neon Postgres ·
JWT auth (jose) + bcrypt · deployed on Vercel.

```
gharseva/
├── prisma/schema.prisma     # User, ProviderProfile, ContactView
├── prisma/seed.ts           # sample providers (password: password123)
├── src/lib/                 # db, auth, services, validation
├── src/app/api/             # auth + providers + profile routes
├── src/app/                 # landing, providers, register, login, dashboard
└── src/components/          # Navbar, ProviderCard, forms, browser
```

## Local development

> Requires Node 22 and a Neon (or any Postgres) database.

```bash
cp .env.example .env        # fill DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm install
npm run db:push             # create tables
npm run db:seed             # optional: sample providers
npm run dev                 # http://localhost:3000
```

Demo logins after seeding (password `password123`): any seeded provider email, or
`customer@example.com`.

## Environment variables

| Var | What |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string (`…-pooler…`) |
| `DIRECT_URL` | Neon **direct** connection string (for migrations) |
| `AUTH_SECRET` | long random string for signing session JWTs |
| `NEXT_PUBLIC_SITE_URL` | site URL for metadata |

## Deploy (Vercel + Neon)

1. Create a Neon project → copy the pooled + direct connection strings.
2. Import this repo on Vercel; set the env vars above.
3. `npm run db:push` against the Neon DB to create tables (once).
4. Deploy. Every push to `main` redeploys.

A `Dockerfile` + GitHub Actions workflow also build and push a container image to
Docker Hub for self-hosting on Kubernetes if desired.

## Roadmap

- Real verification (ID upload + admin review, SMS/email OTP)
- Ratings & reviews, in-app chat / booking requests
- Geolocation + map radius search
- Admin panel
