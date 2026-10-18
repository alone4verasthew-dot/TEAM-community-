# TFY Community

TFY is a mobile-first, invite-only community concept designed for a small circle of up to 80 approved members.

## Current stage

This first commit set contains the public landing page and Next.js project foundation. Authentication, invite validation, membership approvals, database policies, messaging, and calling are **not implemented yet**.

## Stack

- Next.js App Router
- React + TypeScript
- Plain CSS with responsive dark styling
- Supabase (planned for authentication, database, and realtime features)
- Vercel (planned for hosting)

## Requirements

- Node.js 20.9 or later
- npm
- Git (optional for local development; GitHub is the source repository)

## Run locally

```bash
npm install
npm run dev
```

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
- The current invite-request links are placeholders and do not create accounts or send email.
- No login, messaging, calling, or admin functionality is active in this stage.

## Planned implementation order

1. Confirm the landing page and hosting pipeline.
2. Set up Supabase project, schema, and row-level security.
3. Implement signup, invite tokens, email verification, approval queue, and server-enforced member cap.
4. Add profiles, member directory, communities, and admin controls.
5. Add private messaging and abuse reporting.
6. Evaluate voice/video provider pricing and implement calls.
7. Test access control, mobile layout, and production deployment.
