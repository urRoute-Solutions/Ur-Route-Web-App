# urRoute — B2B2C Bus Loyalty Platform

urRoute is a full-stack web application that connects **bus operators** (B2B) with **travellers** (B2C) through a gamified loyalty engine. Operators configure loyalty offers per level; travellers earn discounts and perks automatically with every booking they make.

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema](#5-database-schema)
6. [Loyalty Engine](#6-loyalty-engine)
7. [Authentication & Security](#7-authentication--security)
8. [API Routes](#8-api-routes)
9. [Background Jobs & Queues](#9-background-jobs--queues)
10. [Local Setup — Step by Step](#10-local-setup--step-by-step)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Useful Commands](#12-useful-commands)
13. [Design System & UI](#13-design-system--ui)

---

## 1. What This App Does

### For Travellers
- Search buses across multiple verified operators
- Select seats, enter passenger details, and pay via Razorpay
- Earn loyalty rewards (discounts, flat cashback, perks) per operator automatically
- Progress through **4 loyalty levels**: Welcome → Stay → Loyalty → Champion
- View bookings, cancel trips, and check reward history
- Refer friends with a unique referral code to earn bonus points

### For Bus Operators
- Register their fleet and get a dedicated multi-tenant workspace
- Create routes (origin → destination with boarding/dropping points)
- Schedule trips with seat maps, pricing, and amenities
- Configure loyalty offers per level (percentage discount, flat discount, group bonuses)
- View real-time dashboards: bookings, revenue, reward redemptions

### For Platform Admins
- Approve or suspend operators
- View platform-wide analytics
- Monitor all bookings and revenue

---

## 2. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack with RSC + API routes in one repo |
| **Language** | TypeScript 5 | Type safety across frontend and backend |
| **Database** | PostgreSQL on Neon | Serverless-friendly, supports PgBouncer pooling |
| **ORM** | Prisma 6 | Schema-first, type-safe DB access |
| **Auth** | JWT (jose) + HTTP-only cookies | Access token (15m) + refresh token (14d) rotation |
| **UI** | shadcn/ui + Tailwind CSS | Accessible components with design token theming |
| **Icons** | Lucide React | Consistent icon set |
| **Forms** | React Hook Form + Zod | Schema-validated forms with TypeScript inference |
| **Payments** | Razorpay | Indian payment gateway with webhook verification |
| **Email** | Resend + React Email | Transactional emails with JSX templates |
| **Push Notifications** | Firebase Cloud Messaging | Mobile-style push in the browser |
| **Background Jobs** | BullMQ + Redis (ioredis) | Async notification and reward processing |
| **Rate Limiting** | Upstash Redis + @upstash/ratelimit | Serverless-compatible sliding window |
| **Analytics** | PostHog | Product analytics and feature flags |
| **File Storage** | Cloudinary | Operator logo uploads |
| **State (client)** | Zustand | Lightweight global state where needed |
| **Data Fetching** | TanStack Query | Cache, revalidation, and optimistic updates |
| **Testing** | Vitest | Fast unit tests (reward engine logic) |
| **Theme** | next-themes | Dark / light mode toggle |
| **Logging** | Winston | Structured server-side logs |

---

## 3. Architecture Overview

The app uses **Clean Architecture** layering inside a single Next.js monorepo:

```
HTTP Request
    │
    ▼
API Route Handler  (src/app/api/**/route.ts)
    │  validates request with Zod, calls use-case
    ▼
Use Case           (src/usecases/**)
    │  orchestrates business logic, no framework code
    ▼
Repository         (src/repositories/**)
    │  talks only to Prisma; always filters by operatorId (multi-tenant)
    ▼
Prisma Client      (src/lib/prisma.ts)
    │
    ▼
PostgreSQL (Neon)
```

### Multi-Tenancy

Every operator-owned database row has an `operatorId` column. The `TenantRepository` base class enforces that all queries always include a tenant filter — operators can never see each other's data. Travellers (Users) are global entities that ride many operators; their per-operator loyalty state lives in the `RewardProgress` table.

### Money

All monetary values are stored as **integer paise** (₹1 = 100 paise) to prevent floating-point drift. Field names always end in `Minor` (e.g. `basePriceMinor`, `totalFareMinor`). The UI divides by 100 to display rupee amounts.

### Server vs Client Components

- **RSC (React Server Components)**: Data-fetching pages, dashboards, lists. They run on the server and have direct access to repositories.
- **Client Components** (`"use client"`): Forms, interactive seat selection, payment flow, anything that needs `useState` or `useEffect`.

---

## 4. Folder Structure

```
urRoute/
├── prisma/
│   ├── schema.prisma          # Single source of truth for the database
│   ├── migrations/            # Auto-generated SQL migration files
│   └── seed.ts                # Seed script for local development data
│
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── (auth)/            # Route group — login, register, forgot password
│   │   ├── (traveler)/        # Route group — traveller-facing pages (auth required)
│   │   │   ├── dashboard/     # Home dashboard with stats and upcoming trips
│   │   │   ├── search/        # Bus search with filters
│   │   │   ├── book/[tripId]/ # Seat selection and passenger form
│   │   │   ├── bookings/      # My bookings list + detail + payment
│   │   │   ├── rewards/       # Loyalty progress per operator
│   │   │   └── profile/       # Edit name, phone
│   │   ├── (operator)/        # Route group — operator portal (OPERATOR role)
│   │   │   └── operator/
│   │   │       ├── dashboard/ # Revenue and booking stats
│   │   │       ├── routes/    # Create and list routes
│   │   │       ├── trips/     # Schedule trips
│   │   │       ├── bookings/  # View all customer bookings
│   │   │       └── offers/    # Configure loyalty offers per level
│   │   ├── (admin-area)/      # Route group — admin panel (ADMIN role)
│   │   │   └── admin/
│   │   │       ├── page.tsx   # Platform overview
│   │   │       ├── operators/ # Approve / suspend operators
│   │   │       └── analytics/ # Platform-wide revenue and usage
│   │   ├── api/               # All REST API endpoints
│   │   │   ├── auth/          # Login, register, refresh, logout, reset-password
│   │   │   ├── bookings/      # CRUD + cancel
│   │   │   ├── operators/     # Operator CRUD + sub-resources
│   │   │   ├── payments/      # Razorpay order creation + webhook
│   │   │   ├── trips/         # Trip search
│   │   │   ├── rewards/       # Progress and history
│   │   │   ├── profile/       # GET / PATCH current user
│   │   │   └── admin/         # Admin-only endpoints
│   │   ├── globals.css        # Tailwind base + CSS design tokens
│   │   ├── layout.tsx         # Root layout (ThemeProvider + Toaster)
│   │   └── page.tsx           # Public landing page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── traveler-nav.tsx   # Dark navy sidebar for travellers
│   │   │   ├── operator-nav.tsx   # Dark navy sidebar for operators
│   │   │   └── nav-user.tsx       # User avatar dropdown (logout, profile)
│   │   ├── providers.tsx          # next-themes ThemeProvider wrapper
│   │   └── ui/                    # shadcn/ui component library
│   │       ├── button.tsx         # Includes custom "action" (green) variant
│   │       ├── theme-toggle.tsx   # Sun/moon dark-mode switch
│   │       └── ...                # All other shadcn components
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── session.ts     # requireRole(), requireAuth(), getPrincipal() for RSC
│   │   │   ├── tokens.ts      # JWT sign/verify with jose
│   │   │   ├── cookies.ts     # HTTP-only cookie helpers
│   │   │   ├── hash.ts        # SHA-256 for refresh token storage
│   │   │   └── password.ts    # bcrypt wrapper
│   │   ├── reward-engine/
│   │   │   ├── index.ts       # Main entry — computeDiscount(), advanceProgress()
│   │   │   ├── discount.ts    # Discount calculation logic (%, flat, group bonus)
│   │   │   ├── progress.ts    # Level advance and freeze logic
│   │   │   ├── types.ts       # Shared types for the engine
│   │   │   └── __tests__/     # Vitest unit tests
│   │   ├── prisma.ts          # Singleton Prisma client (avoids hot-reload leaks)
│   │   ├── redis.ts           # ioredis client for BullMQ
│   │   ├── rate-limit.ts      # Upstash rate limiter helpers
│   │   ├── http.ts            # JSON response helpers (ok(), err())
│   │   ├── errors.ts          # AppError class with HTTP status codes
│   │   └── logger.ts          # Winston logger config
│   │
│   ├── repositories/          # Database access layer (Prisma queries)
│   │   ├── tenant.repository.ts       # Base class enforcing operatorId filter
│   │   ├── user.repository.ts
│   │   ├── operator.repository.ts
│   │   ├── booking.repository.ts
│   │   ├── trip.repository.ts
│   │   ├── route.repository.ts
│   │   ├── offer-template.repository.ts
│   │   ├── reward-progress.repository.ts
│   │   ├── reward-history.repository.ts
│   │   ├── refresh-token.repository.ts
│   │   └── audit.repository.ts
│   │
│   ├── usecases/              # One file per business operation
│   │   ├── auth/              # Login, register, refresh, logout, reset-password
│   │   ├── bookings/          # Create, get, list, cancel
│   │   ├── payments/          # Create Razorpay order, verify signature
│   │   ├── rewards/           # Compute progress, freeze/unfreeze
│   │   ├── routes/            # CRUD routes
│   │   ├── trips/             # Create, search, update trips
│   │   ├── offers/            # Create and update offer templates
│   │   ├── operator/          # Register, approve, update operator
│   │   └── analytics/         # Pre-aggregate analytics
│   │
│   ├── dto/                   # Data Transfer Objects (API response shapes)
│   │   ├── trip.dto.ts        # TripDTO — fields the frontend can rely on
│   │   ├── booking.dto.ts
│   │   ├── operator.dto.ts
│   │   ├── reward.dto.ts
│   │   ├── route.dto.ts
│   │   └── user.dto.ts
│   │
│   ├── validators/            # Zod schemas for API request validation
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── trip.ts
│   │   ├── route.ts
│   │   ├── operator.ts
│   │   └── offer-template.ts
│   │
│   ├── services/              # Thin wrappers for external services
│   │   ├── payment.service.ts      # Razorpay order + verification
│   │   ├── notification.service.ts # Resend email + Firebase push
│   │   ├── token.service.ts        # JWT lifecycle
│   │   └── audit.service.ts        # AuditLog writes
│   │
│   ├── queues/
│   │   ├── index.ts           # BullMQ queue definitions
│   │   ├── processors.ts      # Job handlers (email, push, reward)
│   │   └── worker.ts          # Worker process entry point
│   │
│   ├── emails/
│   │   └── booking-confirmation.tsx  # React Email JSX template
│   │
│   ├── middleware.ts          # Next.js edge middleware (JWT check, role guard)
│   ├── config/env.ts          # Typed env variable access
│   ├── constants/auth.ts      # Cookie names, token TTLs
│   └── types/auth.ts          # JWTPayload, Principal interfaces
│
├── .env.example               # Template for all required environment variables
├── tailwind.config.ts         # Design tokens (brand, action, reward, sidebar)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Database Schema

The database has **26 models**. Here are the most important ones:

### Users & Operators

- **`User`** — Global entity. One user can book with many operators. Has a `role`: ADMIN, OPERATOR, or TRAVELER. Has a `referralCode` for the refer-and-earn system.
- **`Operator`** — The tenant (bus company). Linked 1-to-1 with its owner `User`. Every operator-owned table has an `operatorId` column for isolation.

### Inventory

- **`Route`** — A named path: origin → destination, with optional distance/duration and JSON arrays of boarding and dropping points.
- **`Trip`** — A scheduled departure on a route. Has `basePriceMinor` (paise), `departureAt`, `arrivalAt`, seat layout, amenities.
- **`Seat`** — Individual seats for a trip. `isBooked` flips to `true` when a booking is confirmed. Labels follow the "L1", "U3" format (Lower/Upper deck, number).

### Bookings & Payments

- **`Booking`** — Created when a traveller chooses seats. Starts as `PENDING`. Transitions to `CONFIRMED` (paid) → `COMPLETED` (trip done, triggers loyalty). Stores full fare breakdown: `baseFareMinor`, `discountMinor`, `groupBonusMinor`, `taxMinor`, `totalFareMinor`.
- **`Payment`** — One-to-one with Booking. Stores Razorpay order ID, payment ID, and verified signature. Status flows: CREATED → PAID → (optionally) REFUNDED.

### Loyalty

- **`OfferTemplate`** — Operator-configured reward per loyalty level. Defines discount type (PERCENTAGE or FLAT), the value, max cap, and group bonus rules. The reward engine reads these — it never hardcodes discount values.
- **`RewardProgress`** — Per `(userId, operatorId)` pair. Tracks `currentLevel`, `completedTrips`, and `status` (ACTIVE or FROZEN). This is where the freeze/resume cycle lives.
- **`RewardHistory`** — Append-only ledger of every reward lifecycle event: UNLOCKED, REDEEMED, EXPIRED. Never updated, only inserted.

### Infrastructure

- **`RefreshToken`** — Stored as SHA-256 hash. Uses a `familyId` system: reusing a revoked token nukes the whole family, preventing token theft replay attacks.
- **`AuditLog`** — Append-only record of every significant action (login, booking, offer update) with actor, IP, and metadata.
- **`AnalyticsDaily`** — Pre-aggregated per-operator daily stats. A cron job writes to this table; dashboards read from it instead of scanning the bookings table directly.

---

## 6. Loyalty Engine

The loyalty engine lives in `src/lib/reward-engine/`. It is **pure TypeScript with no side effects** — no database calls, no API calls. This makes it fully unit-testable with Vitest.

### The Four Levels

| Level | Name | Trips Required | Typical Perk |
|---|---|---|---|
| L1 | Welcome | Start | Flat 11% off every ride |
| L2 | Stay | Trip 4 | 10% off + group bonuses |
| L3 | Loyalty | Trip 8 | ₹150 flat reward |
| L4 | Champion | Trip 12 | 15% off + priority perks |

After L4, the cycle continues back to L3 (never back to L1). Progress never fully resets — it only freezes.

### Freeze / Resume Rule

If a traveller books with **Operator A**, their `RewardProgress` for Operator A is ACTIVE and `completedTrips` increments. The moment they book with **Operator B**, Operator A's progress is **FROZEN** (not deleted). When they return to Operator A, it **resumes** from exactly where it left off. This incentivises loyalty to a single operator.

### Discount Calculation Flow

```
POST /api/bookings
  → createBookingUsecase
    → reward-engine.computeDiscount(progress, offerTemplate, passengerCount)
      → if PERCENTAGE: discount = baseFare × (percentage / 100), capped at maxCap
      → if FLAT: discount = flatAmountMinor, capped at maxCap
      → groupBonus = (passengerCount - 1) × groupBonusPerHead, capped at groupBonusMaxHeads
    → totalFare = baseFare − discount − groupBonus + tax
  → booking created with full fare breakdown recorded
```

### Level Advancement

When a booking status changes to `COMPLETED`:

```
reward-engine.advanceProgress(currentProgress)
  → increment completedTrips
  → check if new total crosses the next level's threshold
  → if yes: update currentLevel, record RewardHistory(UNLOCKED)
  → if at L4 and trip count wraps: cycle back to L3, increment cycleCount
```

---

## 7. Authentication & Security

### JWT Flow

1. **Login** — server issues an **access token** (15 min, signed with `JWT_ACCESS_SECRET`) and a **refresh token** (14 days, signed with `JWT_REFRESH_SECRET`)
2. Both tokens are stored in **HTTP-only, Secure, SameSite=Strict cookies** — never accessible to JavaScript on the client
3. When the access token expires, the client calls `POST /api/auth/refresh` automatically
4. The refresh token is stored in the database **as a SHA-256 hash only** — the plaintext never persists
5. Every refresh **rotates** the token: old one is revoked, new one is issued. If a revoked token is reused (possible token theft), the entire token family is invalidated immediately

### Role Guard (Server Components)

```typescript
// In any RSC page — throws 401/403 and redirects if the role is wrong:
const principal = await requireRole("TRAVELER");
const principal = await requireRole("OPERATOR");
const principal = await requireRole("ADMIN");
const principal = await requireOperator(); // also checks operatorId exists on principal
```

### Middleware (Edge)

`src/middleware.ts` runs on every request at the CDN edge before the page renders. It reads the JWT cookie and redirects unauthenticated users to `/login`. Role-based path guards (e.g. `/operator/*` requires OPERATOR role) are also enforced here, before any server component runs.

### Rate Limiting

Sensitive endpoints (login, register, password reset) use Upstash Redis sliding-window rate limiting. Exceeding the limit returns `429 Too Many Requests`.

### Payment Verification

After Razorpay processes a payment, the client receives a `razorpay_signature`. The server re-computes `HMAC-SHA256(orderId + "|" + paymentId, RAZORPAY_KEY_SECRET)` and compares it against the received signature. The booking is only confirmed if the signatures match exactly.

---

## 8. API Routes

All routes are under `src/app/api/`. They return `{ data: ... }` on success or `{ error: { message, code } }` on failure.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a TRAVELER account |
| POST | `/api/auth/login` | Login and set JWT cookies |
| POST | `/api/auth/logout` | Clear cookies and revoke refresh token |
| POST | `/api/auth/refresh` | Rotate refresh token and issue new access token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Consume token and update password |
| GET | `/api/auth/me` | Get current user profile |

### Trips

| Method | Path | Description |
|---|---|---|
| GET | `/api/trips?origin=&destination=&date=` | Search available trips |
| GET | `/api/trips/[id]` | Get single trip with full seat map |

### Bookings

| Method | Path | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking (selects seats, computes fare with loyalty discount) |
| GET | `/api/bookings` | List current user's bookings |
| GET | `/api/bookings/[id]` | Get single booking with fare breakdown |
| POST | `/api/bookings/[id]/cancel` | Cancel a PENDING or CONFIRMED booking |

### Payments

| Method | Path | Description |
|---|---|---|
| POST | `/api/payments` | Create a Razorpay order for a booking |
| POST | `/api/payments/verify` | Verify Razorpay signature and confirm booking |
| POST | `/api/payments/webhook` | Razorpay server-to-server event webhook |

### Operators (tenant sub-resources)

| Method | Path | Description |
|---|---|---|
| POST | `/api/operators` | Register a new operator |
| GET | `/api/operators/[id]` | Get operator details |
| PATCH | `/api/operators/[id]` | Update operator profile |
| GET / POST | `/api/operators/[id]/routes` | List or create routes |
| GET / POST | `/api/operators/[id]/trips` | List or create trips |
| GET / POST | `/api/operators/[id]/offer-templates` | List or create loyalty offers |
| POST | `/api/operators/[id]/approve` | Admin only — approve an operator |

### Rewards

| Method | Path | Description |
|---|---|---|
| GET | `/api/rewards/progress` | My loyalty progress per operator |
| GET | `/api/rewards/history` | My reward history ledger |

### Admin

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/operators` | List all operators (ADMIN role only) |
| GET | `/api/admin/analytics` | Platform analytics (ADMIN role only) |

---

## 9. Background Jobs & Queues

The worker runs as a **separate process** (`pnpm worker`) using BullMQ backed by Redis (ioredis).

### Queues

| Queue | Jobs | Triggered When |
|---|---|---|
| `notifications` | Send email via Resend, send push via FCM | Booking confirmed, reward unlocked |
| `rewards` | Advance loyalty progress, freeze inactive tracks | Booking status changes to COMPLETED |
| `analytics` | Aggregate daily stats into `AnalyticsDaily` | Cron job at midnight |

### Running the Worker Locally

```bash
# In a second terminal alongside pnpm dev
pnpm worker
```

The worker is optional for basic UI development. It is required for emails, push notifications, and automated reward processing to fire.

---

## 10. Local Setup — Step by Step

Follow these steps **exactly in order**. Each step must succeed before moving to the next.

### Step 1 — Prerequisites

Make sure you have these installed on your machine:

```bash
# Node.js — must be version 18.17 or higher
node --version

# pnpm — if not installed, run: npm install -g pnpm
pnpm --version

# git
git --version
```

If Node.js is too old, download and install the LTS version from [nodejs.org](https://nodejs.org).

---

### Step 2 — Clone the Repository

```bash
git clone https://github.com/urRoute/Ur-Route-Web-App.git

# Move into the project folder
cd Ur-Route-Web-App
```

---

### Step 3 — Install All Dependencies

```bash
pnpm install
```

This downloads all packages into `node_modules/`. It may take 1–2 minutes the first time.

---

### Step 4 — Set Up the Database (Neon PostgreSQL)

The app uses **Neon** — a free serverless PostgreSQL provider.

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Click **"New Project"**, give it any name (e.g. `urroute`)
3. Once the project is created, click **"Connect"** or **"Connection Details"**
4. You will see two connection strings:
   - **Pooled connection** — has `pgbouncer=true` in the URL (used at runtime)
   - **Direct connection** — no pgbouncer (used only for running migrations)
5. Copy both connection strings — you will need them in Step 6

---

### Step 5 — Set Up Redis (Upstash)

The app uses **Upstash** — a free serverless Redis provider.

1. Go to [upstash.com](https://upstash.com) and create a free account
2. Click **"Create Database"**, select your nearest region, then click **"Create"**
3. In your database page, open the **"REST API"** tab:
   - Copy the **UPSTASH_REDIS_REST_URL**
   - Copy the **UPSTASH_REDIS_REST_TOKEN**
4. In the **"Details"** tab, copy the **Redis connection string** (starts with `rediss://`) — this is used by the BullMQ worker

---

### Step 6 — Create Your Environment File

Copy the provided example:

```bash
cp .env.example .env
```

Open `.env` in your code editor and fill in each value:

```env
# App
NODE_ENV=development
APP_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Auth — generate secrets in Step 7 below
JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_ACCESS_TTL="900"
JWT_REFRESH_TTL="1209600"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"

# Payments (Razorpay) — use test keys from razorpay.com/dashboard
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="xxxx"
RAZORPAY_WEBHOOK_SECRET="xxxx"

# Email (Resend) — sign up at resend.com
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="urRoute <noreply@yourdomain.com>"

# Optional — Firebase push notifications
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# Optional — Cloudinary file storage
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Optional — PostHog analytics
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

> **Important:** Never commit `.env` to git. It is already listed in `.gitignore`.

---

### Step 7 — Generate Secure JWT Secrets

Run this command **twice** in your terminal. Each run gives you one unique secret string:

```bash
openssl rand -base64 48
```

- Paste the **first output** as `JWT_ACCESS_SECRET` in your `.env`
- Paste the **second output** as `JWT_REFRESH_SECRET` in your `.env`

These two values must be different from each other.

---

### Step 8 — Set Up Razorpay (Test Mode)

1. Go to [razorpay.com](https://razorpay.com) and create a free account
2. In the dashboard, go to **Settings → API Keys**
3. Click **"Generate Test Mode API Keys"**
4. Copy the **Key ID** into `RAZORPAY_KEY_ID` in your `.env`
5. Copy the **Key Secret** into `RAZORPAY_KEY_SECRET` in your `.env`
6. For the webhook secret, you can use any random string for local development

---

### Step 9 — Set Up Resend (Email)

1. Go to [resend.com](https://resend.com) and create a free account
2. Go to **API Keys** and click **"Create API Key"**
3. Copy the key into `RESEND_API_KEY` in your `.env`
4. For `EMAIL_FROM`, you can use `urRoute <onboarding@resend.dev>` for testing (Resend provides this default sender for free accounts)

---

### Step 10 — Run Database Migrations

This creates all 26 database tables in your Neon project:

```bash
pnpm prisma:migrate
```

When it asks for a migration name, type `init` and press Enter.

You should see output ending with:
```
✔ Generated Prisma Client
✔ Applied 1 migration
```

If you see an SSL error, double-check your `DATABASE_URL` and `DIRECT_URL` in `.env` — make sure they both include `sslmode=require`.

---

### Step 11 — Generate Prisma Client

```bash
pnpm prisma:generate
```

This generates TypeScript types from your schema so your code editor can autocomplete every database field.

---

### Step 12 — (Optional) Seed the Database with Test Data

```bash
pnpm db:seed
```

This inserts sample data so you can immediately explore all features:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@urroute.in` | `Admin@1234` |
| Operator | `operator@test.com` | `Operator@1234` |
| Traveller | `traveller@test.com` | `Traveller@1234` |

It also creates 2 sample routes (Chennai → Coimbatore, etc.) and 5 scheduled trips.

---

### Step 13 — Start the Development Server

```bash
pnpm dev
```

You should see:

```
▲ Next.js 15.1.3
  - Local:   http://localhost:3000
✓ Ready in ~1s
```

Open **http://localhost:3000** in your browser. The landing page should load immediately.

---

### Step 14 — (Optional) Start the Background Worker

Open a **second terminal** in the same project folder and run:

```bash
pnpm worker
```

This is needed for:
- Booking confirmation emails (via Resend)
- Push notifications (via Firebase)
- Automatic loyalty reward processing after trips complete

You can skip this step if you only want to test the UI.

---

### Verifying Everything Works

| What to check | How |
|---|---|
| Landing page loads | Open `http://localhost:3000` |
| Registration works | Go to `/register`, create an account |
| Login works | Go to `/login`, use your credentials or seed data |
| Database connected | If login succeeds, the database connection is working |
| Search works | Go to `/search`, enter any city name |
| Seat selection works | Click "Book now" on any search result |
| Dark / light mode | Click the sun/moon icon in the sidebar header |
| Operator portal | Login as operator, go to `/operator/dashboard` |
| Admin panel | Login as admin, go to `/admin` |

---

### Common Problems and Fixes

**Problem:** `Error: P1001 — Can't reach database server`

**Fix:** Your `DATABASE_URL` or `DIRECT_URL` in `.env` is wrong. Go back to Neon, click Connect, and copy the exact strings again. Also check that your Neon project is not paused — free-tier projects pause after a period of inactivity. Opening the Neon dashboard wakes them up.

---

**Problem:** `Invalid environment variables` on startup

**Fix:** You have a missing or misspelled variable in your `.env` file. Compare your file line by line with `.env.example` to find what is missing.

---

**Problem:** `Cannot find module '@/components/...'`

**Fix:** Run `pnpm install` again. The `@/` path alias maps to `src/` and is configured in `tsconfig.json`. If that does not help, delete `node_modules/` and `.next/` then run `pnpm install` again.

---

**Problem:** Prisma error: `The table 'public.users' does not exist`

**Fix:** Your migrations have not been applied. Run `pnpm prisma:migrate`. If that fails with a connection error, check your `DIRECT_URL` in `.env`.

---

**Problem:** Login returns 401 even with the right password

**Fix:** Make sure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set in `.env` and are not empty strings. Restart the dev server after editing `.env`.

---

**Problem:** Payments not working

**Fix:** Make sure you are using **test mode** keys from Razorpay (they start with `rzp_test_`). In test mode, Razorpay shows a fake payment screen — use card number `4111 1111 1111 1111`, any future expiry date, and any CVV.

---

## 11. Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `APP_URL` | Yes | Full URL of the app, e.g. `http://localhost:3000` |
| `DATABASE_URL` | Yes | Neon pooled connection string (runtime queries) |
| `DIRECT_URL` | Yes | Neon direct connection string (migrations only) |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing 15-minute access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing 14-day refresh tokens |
| `JWT_ACCESS_TTL` | Yes | Access token lifetime in seconds — default `900` |
| `JWT_REFRESH_TTL` | Yes | Refresh token lifetime in seconds — default `1209600` |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST endpoint (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `REDIS_URL` | Yes | Raw Redis connection string for BullMQ worker |
| `RAZORPAY_KEY_ID` | Yes | Razorpay publishable key (safe to show in browser) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret key (server only, never expose) |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | For verifying Razorpay webhook event signatures |
| `RESEND_API_KEY` | Yes | Resend API key for transactional emails |
| `EMAIL_FROM` | Yes | Sender name and address, e.g. `urRoute <noreply@...>` |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID for push notifications |
| `FIREBASE_CLIENT_EMAIL` | No | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | No | Firebase service account private key |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for operator logo uploads |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key for analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host, usually `https://app.posthog.com` |

---

## 12. Useful Commands

```bash
# Start the development server
pnpm dev

# Check TypeScript types without building
pnpm typecheck

# Run unit tests (reward engine logic)
pnpm test

# Run tests in watch mode — re-runs when files change
pnpm test:watch

# Build for production
pnpm build

# Start the production server (run pnpm build first)
pnpm start

# Open Prisma Studio — a visual browser for your database
pnpm prisma:studio

# Create a new migration after editing schema.prisma
pnpm prisma:migrate

# Apply existing migrations without prompts (use in CI or production)
pnpm prisma:deploy

# Regenerate Prisma client after a schema change
pnpm prisma:generate

# Seed the database with test accounts and sample data
pnpm db:seed

# Start the BullMQ background worker (second terminal)
pnpm worker

# Format all files with Prettier
pnpm format

# Run ESLint
pnpm lint
```

---

## 13. Design System & UI

### Colour Tokens

The entire colour system is driven by CSS custom properties defined in `src/app/globals.css` and mapped to Tailwind utility classes in `tailwind.config.ts`.

| Token | Light Mode Value | Usage |
|---|---|---|
| `--primary` | `hsl(228, 62%, 26%)` deep navy | Logo, links, structural elements |
| `--action` | `hsl(134, 62%, 41%)` vivid green | All CTA buttons: Search, Book, Pay |
| `--reward` | `hsl(38, 92%, 52%)` warm gold | Loyalty coins, points, reward badges |
| `--sidebar` | `hsl(228, 68%, 16%)` dark navy | Sidebar background — always dark in both themes |

### Dark / Light Mode

The app uses `next-themes`. Dark mode works by toggling the `dark` class on the `<html>` element — Tailwind's `dark:` variants respond to it. The user's chosen theme is saved automatically in `localStorage`.

The **sun/moon toggle button** (`src/components/ui/theme-toggle.tsx`) appears in the top-right corner of every sidebar. The main content area switches between light and dark. The sidebar always stays dark navy regardless of the chosen theme.

### Button Variants

The `Button` component (`src/components/ui/button.tsx`) has all standard shadcn variants plus one custom one:

| Variant | Appearance | When to use |
|---|---|---|
| `default` | Navy blue | Secondary actions |
| `action` | Green | Primary CTAs — Search, Book, Pay, Proceed |
| `outline` | Bordered, transparent | Ghost actions on light backgrounds |
| `ghost` | No background | Toolbar buttons, links |
| `destructive` | Red | Cancel, delete |

### Route Groups

Next.js route groups (folders in parentheses) share layouts without affecting URLs:

| Folder | Resolves to URLs | Who accesses it |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/forgot-password` | Public — no login required |
| `(traveler)` | `/dashboard`, `/search`, `/bookings`, `/rewards`, `/profile` | Logged-in TRAVELER role |
| `(operator)` | `/operator/*` | Logged-in OPERATOR role |
| `(admin-area)` | `/admin`, `/admin/operators`, `/admin/analytics` | ADMIN role only |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run `pnpm typecheck` and `pnpm test` — both must pass with zero errors
5. Commit with a descriptive message
6. Push and open a Pull Request against `main`

---

## License

MIT — free to use, modify, and distribute.
