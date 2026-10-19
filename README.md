# TFY Community

TFY is a mobile-first, invite-only community concept designed for a small circle of up to 80 approved members.

## Current stage

This first commit set contains the public landing page and Next.js project foundation. The Supabase database foundation, typed browser/server clients, login/signup screens, invite-only signup trigger, email-confirmation callback, and approval-aware member page are set up on the `feat/supabase-connection` branch. The initial confirmed account has been bootstrapped as admin. The admin dashboard now supports pending membership review and single-use invite code creation. Messaging and calling remain pending.

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

On macOS/Linux, use `cp .env.example .env.local` instead of the `copy` command. Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` locally. When auth is deployed later, set it to the real site URL in hosting environment variables. Never use a Supabase secret/service-role key in `NEXT_PUBLIC_*` variables.

Open http://localhost:3000.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Important security notes

- Do not add real API keys, passwords, or private member data to this repository.
- Invitation-code use and the 80-approved-member cap are enforced by database logic. End-to-end authentication and access-control testing is still required before production use.
- Member login, invitation-code signup, email-confirmation callback, and approval-aware member status screens are implemented on the feature branch. New users need a valid invitation code, confirm their email, and wait for admin approval.
- Messaging, calling, and admin UI are not implemented. The first admin must be bootstrapped securely after the initial account is verified.

## Planned implementation order

1. Confirm the landing page and hosting pipeline.
2. Set up Supabase project, schema, row-level security, and typed clients.
3. Test signup/email verification and admin member-review/invite management locally.
4. Add profiles, member directory, communities, and admin controls.
5. Add private messaging and abuse reporting.
6. Evaluate voice/video provider pricing and implement calls.
7. Test access control, mobile layout, and production deployment.


## Supabase Auth redirect setup

For local email confirmation, add `http://localhost:3000/**` to Supabase Auth's Additional Redirect URLs. Keep the Site URL set to the intended primary site (do not change it to localhost for local testing). Set `NEXT_PUBLIC_SITE_URL` to the current app origin in each environment.
