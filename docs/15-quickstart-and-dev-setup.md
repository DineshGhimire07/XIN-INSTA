# 15. Developer Quickstart & Local Setup Guide

## 1. Prerequisites

Before setting up XINVORA locally, ensure you have the following installed:
- **Node.js 18.x LTS** or higher
- **npm** / **pnpm**
- **Git**
- **Supabase CLI** (for local Postgres development or cloud instance link)
- **ngrok** or **cloudflared** (for exposing local webhook endpoints to Meta)
- A registered **Meta Developer Account** with a test Facebook Page & Instagram Business account

---

## 2. Step-by-Step Setup

### Step 1: Initialize Workspace & Dependencies
```bash
# Clone repository and enter directory
cd "INSTA XIN"

# Install project dependencies
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` and populate keys:
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `META_APP_ID`, `META_APP_SECRET`, and `META_WEBHOOK_VERIFY_TOKEN`
- `APP_SECRET_KEY` (Generate with `openssl rand -hex 32`)

### Step 3: Run Database Migrations
```bash
# Apply initial schema & tables to Supabase / PostgreSQL
npx supabase db push
```

### Step 4: Start Local Development Server
```bash
npm run dev
# Server running at http://localhost:3000
```

---

## 3. Webhook Tunneling for Meta Developer Testing

Meta requires a public HTTPS URL to deliver real-time webhooks.

### Using ngrok:
```bash
# In a separate terminal tab:
ngrok http 3000
```
Copy the generated forwarding URL (e.g. `https://a1b2-c3d4.ngrok-free.app`).

### Configure in Meta Developer Portal:
1. Navigate to **Meta Developer Portal $\to$ Webhooks $\to$ Instagram**.
2. Set **Callback URL** to: `https://a1b2-c3d4.ngrok-free.app/api/webhooks/meta`
3. Set **Verify Token** to match `META_WEBHOOK_VERIFY_TOKEN` from `.env.local`.
4. Click **Verify and Save**.
5. Subscribe to the `comments` and `messages` fields.

---

## 4. Validating Local Installation

### 1. Test Dry-Run Simulator:
Navigate to `http://localhost:3000/admin/simulator` in your browser. Enter a test comment (`"link please"`) and verify that the product resolver and compliance checks execute and return a simulated card.

### 2. Run Test Suite:
```bash
npm test
```

### 3. Check Webhook Ingestion:
Post a comment from a test Instagram account on a test post, and observe the terminal logs for:
```text
[Webhook] Received comment from @test_user on Media #17999888
[Compliance] PASS: Instagram private reply eligible (0 previous replies, within 7 days)
[Queue] Job #e91b2 enqueued for dispatch
```

---

## 5. Development Guidelines & Best Practices

1. **Never commit `.env.local` or raw Meta tokens to Git.**
2. **Always test automations in Dry-Run mode before enabling them on live social pages.**
3. **Verify all new outbound features against [`02-meta-compliance-and-anti-ban.md`](file:///Users/nagarro/Desktop/INSTA%20XIN/docs/02-meta-compliance-and-anti-ban.md).**
