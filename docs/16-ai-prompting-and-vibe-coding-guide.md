# 16. AI Prompting & Vibe Coding Playbook

> **How to Vibe Code the XINVORA Platform using AI Assistants (Antigravity, Cursor, Windsurf, Claude Code, GitHub Copilot).**

---

## 🎯 Vibe Coding Strategy

When building with AI coding models, break development into sequential, self-contained prompts. Do not try to generate the entire application in a single prompt.

Follow the **8 Step-by-Step Vibe Coding Prompts** below:

---

## 📝 Step 1: Project Initialization & Design Tokens

```text
PROMPT:
Initialize a Next.js 14+ App Router project with TypeScript and Tailwind CSS for the XINVORA Social Commerce Automation Platform.
Reference AGENTS.md and docs/03-system-architecture-and-tech-stack.md.

Create:
1. app/layout.tsx with a sleek, dark-mode glassmorphic theme (slate-950 background, violet/fuchsia accents, Inter font).
2. components/ui/ with reusable components: Button, Card, Badge, Modal, Input, and Toast.
3. types/index.ts with domain types for Account, Channel, Product, ContentItem, Automation, MessageJob, and ComplianceDecision.
```

---

## 📝 Step 2: Supabase Database Schema & Migrations

```text
PROMPT:
Implement the complete PostgreSQL database schema for XINVORA using Supabase.
Reference docs/04-database-schema-and-entities.md.

Create:
1. supabase/migrations/20260827_initial_schema.sql with all tables, constraints, foreign keys, and indexes (accounts, channels, products, content_items, content_product_mappings, automations, response_pools, contacts, conversations, conversation_messages, message_jobs, compliance_decisions).
2. lib/supabase/server.ts and lib/supabase/client.ts with typed client instances.
```

---

## 📝 Step 3: Crypto, Security & Meta Webhook Ingestion

```text
PROMPT:
Build the cryptographic utilities and Meta Webhook ingestion endpoint.
Reference docs/05-event-pipeline-queues-and-reliability.md and docs/12-deployment-environment-and-security.md.

Implement:
1. lib/crypto/encryption.ts (AES-256-GCM token encrypt/decrypt functions).
2. lib/crypto/signature.ts (X-Hub-Signature-256 verification using crypto.timingSafeEqual).
3. app/api/webhooks/meta/route.ts handling GET (hub.challenge verification) and POST (ingesting Instagram/Facebook comment & message events, computing SHA-256 idempotency key, and saving to message_jobs).
```

---

## 📝 Step 4: Central Compliance Gatekeeper

```text
PROMPT:
Create the Central Compliance Gatekeeper service.
Reference docs/02-meta-compliance-and-anti-ban.md.

Implement lib/compliance/gatekeeper.ts:
1. Method ComplianceGatekeeper.validate(jobPayload): Promise<ComplianceResult>.
2. Enforce:
   - Instagram Comment Private Reply: <= 7 days old, maximum 1 private reply.
   - Standard DM: <= 24 hours from user's latest interaction.
   - Opt-out verification (reject if contact is opted out).
3. Record all evaluations to compliance_decisions table.
```

---

## 📝 Step 5: Channel Adapters & Outbound Queue Worker

```text
PROMPT:
Implement the Channel Adapters and the background queue worker.
Reference docs/03-system-architecture-and-tech-stack.md and docs/05-event-pipeline-queues-and-reliability.md.

Create:
1. lib/adapters/instagram.adapter.ts (sending private replies with product cards & CTA buttons via Meta Graph API v19.0).
2. lib/adapters/facebook.adapter.ts (Messenger API integration).
3. lib/queue/dispatcher.ts (dequeue pending jobs, pass through ComplianceGatekeeper, throttle bursts with jitter, dispatch via appropriate adapter, handle retries and exponential backoff).
4. app/api/worker/process/route.ts (triggerable endpoint for Vercel Cron or webhook workers).
```

---

## 📝 Step 6: Product Catalog & Content-to-Product Binding UI

```text
PROMPT:
Build the Product Management and Content-to-Product Mapping admin pages.
Reference docs/04-database-schema-and-entities.md and docs/08-analytics-and-admin-dashboard.md.

Create:
1. app/(admin)/products/page.tsx (CRUD product cards, pricing, SKU, keyword tags, direct product URL).
2. app/(admin)/content-map/page.tsx (visual list of synced Instagram Reels with a dropdown to bind a Reel to a specific Product SKU).
```

---

## 📝 Step 7: Automation Engine, Response Pools & Dry-Run Simulator

```text
PROMPT:
Implement the Automation Rules engine, anti-repetition Response Pools, and the Dry-Run Simulator.
Reference docs/06-automation-engine-and-workflows.md.

Create:
1. lib/engine/intent-matcher.ts (keyword & intent matching for 'PRODUCT_INQUIRY', 'SIZING_INQUIRY', etc.).
2. lib/engine/response-pool.ts (RANDOM_AVOID_REPEAT selector).
3. app/(admin)/automations/page.tsx (rule builder UI and response pool manager).
4. app/(admin)/simulator/page.tsx (interactive test simulator to test simulated comments and preview rendered private DM cards and compliance logs).
```

---

## 📝 Step 8: Unified Omnichannel Inbox & Human Handoff

```text
PROMPT:
Build the Unified Real-Time Inbox with instant Human Handoff controls.
Reference docs/07-marketing-campaigns-and-crm.md.

Create:
1. app/(admin)/inbox/page.tsx with two-pane layout (conversation list on left, live chat thread on right).
2. Visual indicator for 24h messaging window countdown.
3. One-click "Human Handoff" toggle that pauses automation and lets support agents reply manually via official Meta APIs.
4. Contact detail drawer with customer tags and interaction history.
```
