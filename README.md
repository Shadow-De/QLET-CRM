# QLET CRM — Malta Lettings Platform

A bespoke, production-ready lettings CRM built specifically for a solo rental specialist in Malta. Replaces paper and disorganized notes with an automated, dark-mode pipeline, keyboard-first property database, secure public intake wizard, and growth metrics.

---

## Key Features

- **Agent Dashboard (`/dashboard`)**:
  - Live metric cards: Deals Won This Month, Month-over-Month Growth %, New Leads This Month, and Active Pipeline count.
  - Interactive 6-month deals-won performance chart with dynamic peak highlighting.
- **Leads Pipeline (`/dashboard/leads`)**:
  - 6-stage Kanban board (`New` → `Contacted` → `Viewing` → `Negotiating` → `Won` → `Lost`).
  - Color-coded status badges, group composition badges, and origin tags ("From form").
  - Click-to-inspect slide-over drawer for updating status, editing notes, or initiating GDPR-compliant soft erasure.
- **Client Intake System (`/apply/[token]`)**:
  - Token-gated, 4-step tenant intake wizard (Group details, Situation/Visa, Property preferences, Review & Submit).
  - Built-in honeypot bot trap and Cloudflare Turnstile bot challenge.
  - Submissions instantly create leads on the agent's board without requiring tenant registration.
  - Links have configurable expiration windows and automatic usage counters.
- **Property Management (`/dashboard/properties`)**:
  - Rapid data-entry table optimized for cold-calling landlords.
  - Sortable columns (Reference, City, Type, Price, Owner, Status, Mobile).
  - Single-click toggle between "Available" and "Let".
- **Interactive Onboarding Tour**:
  - Built with `driver.js`, guiding new agents through the dashboard, pipeline, property entry, and client link generation.
  - Can be replayed on demand from `/settings`.
- **Hardened Security Architecture**:
  - Authenticated via Auth.js v5 with credentials provider, bcrypt (cost factor 14), and automatic 15-minute account lockout after 5 failed login attempts.
  - Strict Content Security Policy (CSP), security response headers, and crawler disallow in `robots.txt`.
  - Rate limiting via Upstash Redis (sliding window for IP and tokens).
  - Server-side input sanitization via DOMPurify to prevent XSS.
  - Parameterized raw SQL for MoM growth aggregation to prevent SQL injection.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling**: Tailwind CSS v4 (Custom dark neon palette, glassmorphism surfaces)
- **Database & ORM**: PostgreSQL (Neon-ready) with Prisma ORM v6.5.0
- **Authentication**: Auth.js v5 (NextAuth beta) with JWT session cookies (`SameSite=Strict`, `HttpOnly`, `Secure`)
- **Bot Protection & Rate Limiting**: Cloudflare Turnstile & Upstash Redis
- **Data Visualization**: Recharts v3
- **Guided Tour**: Driver.js

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.x or 20.x (Node 20+ recommended)
- PostgreSQL database instance (local or hosted on Neon)

### 2. Clone and Install Dependencies
```bash
cd qlet-crm
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in the required variables:
```env
# PostgreSQL Connection (Neon or local)
DATABASE_URL="postgresql://user:password@ep-sample-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-32-character-secret-key-here"

# Application URLs
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# Upstash Redis (Optional for local dev, recommended for production rate-limiting)
UPSTASH_REDIS_REST_URL="https://example.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Cloudflare Turnstile (Optional for local dev, recommended for production bot protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAA..."

# Initial Agent Credentials (for db:seed)
AGENT_SEED_EMAIL="agent@qlet.mt"
AGENT_SEED_PASSWORD="AStrongPassword123!"
```

### 4. Push Schema & Seed Initial Agent Account
```bash
# Push schema to database
npx prisma db push

# Seed the primary agent account
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`. You will be redirected to `/login`. Sign in using the credentials configured in `AGENT_SEED_EMAIL` and `AGENT_SEED_PASSWORD`.

---

## Production Deployment (Vercel + Neon)

1. **Database Setup (Neon)**:
   - Create a free serverless Postgres database on [neon.tech](https://neon.tech).
   - Copy the connection string to both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct connection).
2. **Deploy to Vercel**:
   - Push your code to GitHub/GitLab.
   - Import the repository in Vercel.
   - In the Vercel Project Settings, add all environment variables defined in `.env.example`.
   - Set `APP_URL` and `NEXTAUTH_URL` to your production domain (e.g. `https://qlet-crm.vercel.app`).
3. **Database Migration on Deploy**:
   - In your local terminal (or via CI), run:
     ```bash
     npx prisma db push
     npx tsx prisma/seed.ts
     ```
4. **Security Configuration**:
   - Configure your Cloudflare Turnstile widget with your Vercel production domain.
   - Configure Upstash Redis REST credentials in Vercel environment variables.

---

## Architecture & Security Compliance

- **No Public API Exposure**: No GET endpoints exist for leads, properties, or stats without a valid JWT session cookie.
- **GDPR Soft Erasure**: Deleting a lead flags `deletedAt = NOW()`, excluding all personal records from all active pipelines, views, and metrics.
- **Audit Logging**: All auth failures, lockouts, token errors, and rate limit triggers are recorded to the `AuditLog` table with IP addresses (no PII logged).
