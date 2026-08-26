# 17. Project File Structure & Blueprint

## 1. Directory Tree Overview

```text
/
├── AGENTS.md                          # Master AI assistant coding rules & invariants
├── .cursorrules                       # AI IDE rule declarations (Cursor, Windsurf)
├── .env.example                       # Environment variable template
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # Strict TypeScript compiler options
├── tailwind.config.ts                 # Design tokens & color palette
├── next.config.mjs                    # Next.js server configuration
│
├── app/                               # Next.js App Router (UI & APIs)
│   ├── layout.tsx                     # Root layout & theme wrapper
│   ├── page.tsx                       # Landing page / redirection to /overview
│   ├── (admin)/                       # Authenticated Admin Dashboard Layout
│   │   ├── layout.tsx                 # Sidebar, header & navigation bar
│   │   ├── overview/page.tsx          # Real-time analytics & funnel metrics
│   │   ├── automations/page.tsx       # Automation rule builder & response pools
│   │   ├── products/page.tsx          # Product catalog (CRUD, SKUs, pricing)
│   │   ├── content-map/page.tsx       # Instagram Reels sync & product binding
│   │   ├── inbox/page.tsx             # Omnichannel live chat & human handoff
│   │   ├── campaigns/page.tsx         # Social marketing drops & restock alerts
│   │   ├── simulator/page.tsx         # Interactive dry-run testing simulator
│   │   ├── logs/page.tsx              # Webhook telemetry & compliance audit logs
│   │   └── settings/page.tsx          # Meta OAuth & token health management
│   │
│   └── api/                           # Backend API Route Handlers
│       ├── webhooks/meta/route.ts     # Meta Webhook verification & ingestion
│       ├── auth/meta/callback/route.ts# Meta OAuth 2.0 exchange & encryption
│       ├── worker/process/route.ts    # Background queue batch dispatcher
│       └── compliance/data-deletion/route.ts # Meta User Data Deletion Callback
│
├── components/                        # React UI Components
│   ├── ui/                            # Base Design System Atoms
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── toast.tsx
│   ├── dashboard/                     # Analytics widgets & activity stream
│   ├── inbox/                         # Chat thread, message bubble, handoff switch
│   ├── automations/                   # Rule editor, condition builder, pool editor
│   ├── products/                      # Product modal, SKU card, mapping selector
│   └── layout/                        # Sidebar, topbar, mobile nav
│
├── lib/                               # Core Logic & Shared Services
│   ├── adapters/                      # Channel Adapters (Meta Graph API)
│   │   ├── instagram.adapter.ts       # IG Graph API v19.0 client
│   │   └── facebook.adapter.ts        # FB Messenger / Pages API client
│   ├── compliance/                    # Central Policy Enforcement
│   │   ├── gatekeeper.ts              # ComplianceGatekeeper evaluation service
│   │   └── rules.ts                   # 24h window, 7-day rule, rate limit checkers
│   ├── engine/                        # Automation & Intent Engine
│   │   ├── intent-matcher.ts          # Keyword & intent classification
│   │   ├── response-pool.ts           # Anti-repetition pool selector
│   │   └── workflow-runner.ts         # Trigger → Condition → Action pipeline
│   ├── crypto/                        # Cryptographic Utilities
│   │   ├── encryption.ts              # AES-256-GCM token encryption/decryption
│   │   └── signature.ts               # HMAC-SHA256 signature verification
│   ├── queue/                         # Queue & Dispatch System
│   │   ├── dispatcher.ts              # Queue consumer & rate-governed worker
│   │   └── idempotency.ts             # SHA-256 idempotency key formulation
│   └── supabase/                      # Supabase / PostgreSQL Client
│       ├── server.ts                  # Server-side Supabase client (Server Actions)
│       └── client.ts                  # Browser-side Supabase client
│
├── types/                             # Domain TypeScript Interfaces
│   ├── account.ts                     # Account & Channel models
│   ├── product.ts                     # Product & Content Mapping models
│   ├── automation.ts                  # Rules, Triggers, Conditions & Actions
│   ├── conversation.ts                # Contacts, Conversations & Messages
│   ├── queue.ts                       # MessageJob & Outbound payload interfaces
│   └── compliance.ts                  # ComplianceDecision & Audit types
│
├── supabase/                          # Database Migrations & Seeds
│   ├── migrations/
│   │   └── 20260827_initial_schema.sql # 20+ core tables & indexes DDL
│   └── seed.sql                       # Initial sample products & test pools
│
└── docs/                              # Complete 17-Module Documentation Suite
    ├── 01-product-philosophy-and-objectives.md
    ├── 02-meta-compliance-and-anti-ban.md
    ├── 03-system-architecture-and-tech-stack.md
    ├── 04-database-schema-and-entities.md
    ├── 05-event-pipeline-queues-and-reliability.md
    ├── 06-automation-engine-and-workflows.md
    ├── 07-marketing-campaigns-and-crm.md
    ├── 08-analytics-and-admin-dashboard.md
    ├── 09-future-roadmap-ai-and-integrations.md
    ├── 10-api-reference-and-contracts.md
    ├── 11-meta-app-review-and-permissions-guide.md
    ├── 12-deployment-environment-and-security.md
    ├── 13-testing-qa-and-simulation-guide.md
    ├── 14-troubleshooting-and-runbook.md
    ├── 15-quickstart-and-dev-setup.md
    ├── 16-ai-prompting-and-vibe-coding-guide.md
    └── 17-project-file-structure.md
```
