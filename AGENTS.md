# AI Coding Assistant Rules & Architectural Guidelines (`AGENTS.md`)

> **CRITICAL INSTRUCTIONS FOR AI AGENTS & CODING ASSISTANTS**  
> You are building the **XINVORA Social Commerce Automation Platform**. Follow every rule in this document unconditionally.

---

## 🏛️ 1. Core Architectural Invariants (Non-Negotiable)

### 1.1 "Single Brain, Multiple Channels" Pattern
- **Never call Instagram or Facebook APIs directly from UI components, server actions, or business logic.**
- All business logic lives in `lib/services/` and `lib/engine/`.
- Platform-specific API calls must be made strictly through the Channel Adapters:
  - `lib/adapters/instagram.adapter.ts`
  - `lib/adapters/facebook.adapter.ts`

### 1.2 Mandatory Compliance Gatekeeper
- **No outbound message may ever be dispatched without first passing through `ComplianceGatekeeper.validate()` (`lib/compliance/gatekeeper.ts`).**
- The gatekeeper strictly enforces:
  1. **Instagram Comment Private Reply Rule:** Maximum **1 private reply** per comment within **7 days** of comment creation.
  2. **Standard Messaging Window:** Outbound conversational DMs only allowed within **24 hours** of the user's latest message.
  3. **Marketing Broadcasts:** Strictly require valid Meta recurring notification tokens or active opt-in.
  4. **Opt-Out Check:** Never message contacts with `is_opted_out = true`.
- Every decision (allowed or blocked) MUST be logged to the `compliance_decisions` table.

### 1.3 Strict Official Meta APIs Only
- **Zero Scraping & Zero Browser Automation:** Never generate Puppeteer, Selenium, or unofficial private endpoint code.
- **Never collect or store passwords:** Authenticate solely via Meta OAuth 2.0.
- **Token Security:** Meta Page and Instagram Access Tokens must be encrypted using AES-256-GCM (`lib/crypto/encryption.ts`) before saving to PostgreSQL.

---

## 🛠️ 2. Technology Stack & Coding Standards

| Layer | Standard | Rule |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Use Server Components for data fetching; Client Components (`'use client'`) only for interactivity. |
| **Language** | **TypeScript (Strict Mode)** | No `any` types. All domain models must use types defined in `types/`. |
| **Database** | **PostgreSQL (Supabase)** | Use Supabase TypeScript client (`@supabase/supabase-js`) with typed schemas. |
| **Styling** | **Custom CSS / Tailwind** | Rich, modern dark-mode aesthetic with glassmorphism, smooth gradients, and micro-animations. |
| **Queue** | **Postgres Job Queue (`message_jobs`)** | Every outbound message is enqueued with a SHA-256 idempotency key before dispatch. |

---

## 📁 3. Canonical Project Structure

When creating new files, strictly adhere to this folder layout:

```text
/
├── app/
│   ├── (admin)/                    # Authenticated admin dashboard layout
│   │   ├── overview/page.tsx       # Analytics & funnel overview
│   │   ├── automations/page.tsx    # Automation rules & response pools
│   │   ├── products/page.tsx       # Product catalog & SKU management
│   │   ├── content-map/page.tsx    # Reels/Posts sync & product binding
│   │   ├── inbox/page.tsx          # Real-time omnichannel chat & handoff
│   │   ├── campaigns/page.tsx      # Social marketing drops & restocks
│   │   ├── simulator/page.tsx      # Dry-run test simulator
│   │   └── settings/page.tsx       # Meta OAuth & Webhook keys
│   ├── api/
│   │   ├── webhooks/meta/route.ts  # Webhook challenge & event ingestion
│   │   ├── auth/callback/route.ts  # Meta OAuth token exchange & encryption
│   │   └── worker/process/route.ts # Background queue processor
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                         # Base design system components (Button, Card, Modal, Badge)
│   ├── inbox/                      # Live chat window, contact drawer, handoff controls
│   ├── automations/                # Rule builder, response pool editor, simulator view
│   └── products/                   # Product modal, SKU card, content mapping picker
├── lib/
│   ├── adapters/                   # Instagram & Facebook API adapters
│   ├── compliance/                 # ComplianceGatekeeper & policy evaluators
│   ├── engine/                     # Intent matcher, rule executor, randomizer pool
│   ├── crypto/                     # AES-256-GCM token encryption & HMAC signature checks
│   ├── queue/                      # Postgres-backed message job dispatcher & retry backoff
│   └── supabase/                   # Typed Supabase client (browser & server)
├── types/                          # Domain TypeScript interfaces (Product, Contact, Job, Rule)
└── supabase/
    └── migrations/                 # PostgreSQL DDL migration scripts
```

---

## ⚡ 4. Implementation Rules for Common Features

### 4.1 Ingesting Webhooks (`app/api/webhooks/meta/route.ts`)
1. Verify `X-Hub-Signature-256` header against `process.env.META_APP_SECRET` using `crypto.timingSafeEqual`.
2. Compute SHA-256 Idempotency Key: `SHA256(channel + eventType + contentId + commentId)`.
3. Insert into `message_jobs` table. On duplicate key constraint (`23505`), immediately return `HTTP 200 OK` and drop duplicate.
4. Always respond to Meta with `HTTP 200 OK` in `< 500ms`.

### 4.2 Handling Inbound Comments
1. Look up mapped product from `content_product_mappings`.
2. Evaluate keyword/intent (`lib/engine/intent-matcher.ts`).
3. Pick a public reply from `response_pools` using `RANDOM_AVOID_REPEAT`.
4. Validate private reply via `ComplianceGatekeeper.validate()`.
5. Enqueue outbound private reply with generic template card (`title`, `subtitle`, `image_url`, `VIEW PRICE` button).

### 4.3 Human Handoff Toggle
1. When status is `NEEDS_ATTENTION` or `HUMAN_HANDLED`, all automated rule executions for that `contact_id` MUST return early and do nothing.
2. Only manual agent messages from the dashboard may be dispatched.
