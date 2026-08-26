# 12. Deployment, Environment Configuration & Security

## 1. Environment Configuration Reference (`.env.example`)

All secret keys and credentials must be provided via environment variables and never committed to version control.

```bash
# ==========================================
# APP & ENVIRONMENT
# ==========================================
NODE_ENV=production
# Set to your Vercel URL (e.g. https://your-project.vercel.app) or custom domain
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
APP_SECRET_KEY=your_32_byte_aes_secret_key_for_token_encryption

# ==========================================
# SUPABASE / POSTGRESQL DATABASE
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ==========================================
# META DEVELOPER APP CREDENTIALS
# ==========================================
META_APP_ID=123456789012345
META_APP_SECRET=your_meta_app_secret_hex
META_WEBHOOK_VERIFY_TOKEN=your_custom_secure_webhook_verify_token
META_GRAPH_API_VERSION=v19.0

# ==========================================
# QUEUE & WORKER CONFIGURATION
# ==========================================
MAX_OUTBOUND_RATE_PER_MIN=120
QUEUE_CONCURRENCY=5
RETRY_MAX_ATTEMPTS=3
```

---

## 2. Token Encryption at Rest (AES-256-GCM)

All Meta Page and Instagram Long-Lived Access Tokens are encrypted before insertion into the PostgreSQL `channels` table.

### Cryptographic Implementation:
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.APP_SECRET_KEY!, 'hex'); // 32 bytes

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(12); // 12-byte IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedPayload
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedString: string): string {
  const [ivHex, authTagHex, encryptedPayload] = encryptedString.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 3. Webhook Signature Verification (`X-Hub-Signature-256`)

Every request to `/api/webhooks/meta` must be verified using HMAC-SHA256 with the `META_APP_SECRET`.

```typescript
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  
  const expectedHash = signatureHeader.replace('sha256=', '');
  const calculatedHash = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(rawBody)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(calculatedHash, 'hex')
  );
}
```

---

## 4. Deployment Architecture on Vercel & Supabase

```mermaid
flowchart TD
    subgraph Vercel_Platform ["Vercel Production Edge & Serverless"]
        UI["Next.js App Router UI (SSR/Static)"]
        WH_Route["Edge /api/webhooks/meta Route Handler"]
        API_Route["Serverless API Routes (Admin / Actions)"]
        Cron_Worker["Vercel Cron / Worker Job (Queue Poller)"]
    end

    subgraph Supabase_Infra ["Supabase Managed Cloud"]
        Postgres[("PostgreSQL Database (RLS Enabled)")]
        Vault[("Encrypted Secrets & Tokens")]
        Realtime["Realtime WebSocket Engine"]
    end

    WH_Route -->|Fast Signature Verification & Enqueue| Postgres
    API_Route <--> Postgres
    Cron_Worker -->|Process Queue Batch| Postgres
    Postgres <--> Vault
    Postgres -->|Live Chat Updates| Realtime
    Realtime -->|Push to Admin Inbox UI| UI
```

### Deployment Commands:
```bash
# 1. Database Migrations
npx supabase db push

# 2. Production Build Check
npm run build

# 3. Deploy to Vercel
vercel --prod
```
