# urRoute

> Cloud-first **B2B2C loyalty platform** for bus operators and travelers. Operators
> improve retention through a gamified, four-level loyalty system; travelers earn
> discounts, perks, and badges as they ride.

Built with **Next.js 15 (App Router)**, **TypeScript everywhere**, **Prisma + Neon
PostgreSQL**, following **Clean Architecture** and **multi-tenant row-level isolation**.

---

## Architecture at a glance

```
Route Handler / Server Action     transport   — auth + parse only, no business logic
        ↓
UseCase                           orchestration — one business operation, owns the transaction
        ↓
Service / RewardEngine            domain        — business rules (RewardEngine is dependency-free)
        ↓
Repository                        data access   — the ONLY layer that touches Prisma
        ↓
Prisma → Neon PostgreSQL
```

**Dependencies point inward.** A repository never imports a use case; the reward
engine imports nothing. This keeps the loyalty logic unit-testable in isolation and
swappable without touching transport or persistence.

### Why each `src/` layer exists

| Layer            | Responsibility                                                        |
| ---------------- | --------------------------------------------------------------------- |
| `app/`           | Routes, pages, Route Handlers, Server Actions (transport)             |
| `components/`    | Reusable UI (shadcn primitives in `components/ui`)                    |
| `features/`      | Feature-scoped UI + client logic (booking, rewards, …)               |
| `actions/`       | Server Actions — mutations callable from RSC/forms                    |
| `usecases/`      | Orchestration: compose services + repos into one business operation   |
| `services/`      | Cross-cutting domain services (auth, notification, payment)           |
| `repositories/`  | Data access; tenant scoping enforced here                             |
| `lib/`           | Framework-agnostic libs (reward-engine, prisma client, jwt, redis)    |
| `validators/`    | Zod schemas — single source of truth for input shape                  |
| `dto/`           | Data transfer objects mapped from entities (never leak Prisma rows)   |
| `events/`        | Domain event definitions + dispatch                                   |
| `queues/`        | BullMQ queues, workers, processors                                    |
| `cron/`          | Scheduled jobs                                                        |
| `middlewares/`   | Reusable request guards composed by `middleware.ts`                   |
| `store/`         | Zustand client stores                                                 |
| `hooks/`         | React + TanStack Query hooks                                          |

## Tech stack

Next.js 15 · TypeScript · Tailwind + shadcn/ui · Zustand · TanStack Query ·
React Hook Form + Zod · Prisma + Neon · jose (JWT) + bcryptjs · Upstash Redis ·
BullMQ · Cloudinary · Resend · FCM · Razorpay · PostHog · Winston

## Getting started

```bash
pnpm install
cp .env.example .env          # fill in secrets
pnpm prisma:generate
pnpm prisma:migrate           # needs a Neon DATABASE_URL/DIRECT_URL
pnpm dev
```

## Deployment (free-tier for now)

| Component        | Host                                  |
| ---------------- | ------------------------------------- |
| Web + API        | Vercel (hobby)                        |
| Background worker| Render (free worker)                  |
| DB               | Neon PostgreSQL (free)                |
| Redis / queue    | Upstash Redis (free → paid as traffic grows) |

> ⚠️ Vercel is serverless and **cannot** run BullMQ workers — they run as a
> separate long-lived process (`pnpm worker`) on Render.

## Loyalty model

Four levels, cyclic: **L1 Welcome → L2 Stay (trip 4) → L3 Loyalty (trip 8) →
L4 Champion (trip 12) → back to L3**. Progress **freezes** (never resets) when a
traveler books with another operator, and resumes on return. See
`src/lib/reward-engine/`.

## Build milestones

- **M1** Foundation — scaffold + Prisma schema ✅
- **M2** Auth + RBAC + Security ✅
- M3 Operators / Routes / Bookings
- M4 Reward Engine
- M5 Events / Notifications / Payments
- M6 Analytics / Admin
- M7 Frontend dashboards
- M8 Tests / Monitoring / Docker / Deploy
