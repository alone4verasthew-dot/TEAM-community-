# TFY Community

TFY is a mobile-first, invite-only community concept designed for a small circle of up to 80 approved members.

## Current stage

This first commit set contains the public landing page and Next.js project foundation. The Supabase database foundation and typed browser/server clients are set up on the `feat/supabase-connection` branch. Signup/login screens, invite-token verification, admin bootstrap, messaging, and calling are still pending.

## Stack

- Next.js App Router
- React + TypeScript
- Plain CSS with responsive dark styling
- Supabase (authentication and database foundation; member-facing flows are being built)
- Vercel (planned for hosting)

## Requirements

- Node.js 20.9 or later
- npm
- Git (optional for local development; GitHub is the source repository)

## Run locally

```bash
npm install
copy .env.example .env.local
# Edit .env.local with your Supabase project URL and publishable key
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local` instead of the `copy` command. Never use a Supabase secret/service-role key in `NEXT_PUBLIC_*` variables.

Open http://localhost:3000.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Important security notes

- Do not add real API keys, passwords, or private member data to this repository.
- The invite-only policy and 80-member limit must be enforced on the server/database before this site is used by real members.
- Member login, invitation-code signup, email-confirmation callback, and approval-aware member status screens are added on the feature branch. New users need a valid one-use invitation code, confirm their email, and wait for admin approval.
- No login, messaging, calling, or admin functionality is active in this stage.

## Planned implementation order

1. Confirm the landing page and hosting pipeline.
2. Set up Supabase project, schema, row-level security, and typed clients.
3. Implement signup/login behind invite validation, email verification, approval queue, and server-enforced member cap.
4. Add profiles, member directory, communities, and admin controls.
5. Add private messaging and abuse reporting.
6. Evaluate voice/video provider pricing and implement calls.
7. Test access control, mobile layout, and production deployment.
