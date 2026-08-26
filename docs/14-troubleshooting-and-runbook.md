# 14. Operational Runbook & Troubleshooting

## 1. Incident Severity Classification

| Severity Level | Definition | Response SLA | Action Triggered |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Outbound messages failing globally / Meta token revoked / Ingestion halted. | `< 15 minutes` | Pager alert, Circuit breaker opened, Admin SMS. |
| **SEV-2 (Major)** | Rate limit spikes / Webhook queue delay $> 5$ minutes / Handoff notifications delayed. | `< 1 hour` | Slack alert, Queue throttling activated. |
| **SEV-3 (Minor)** | Single customer delivery error / Minor intent classification misfire. | `< 24 hours` | Logged to compliance audit table for triage. |

---

## 2. Emergency Global Kill-Switch

If unexpected behavior occurs (e.g. infinite reply loop or bad marketing broadcast), execute the emergency automation freeze:

### Admin Dashboard Method:
Navigate to **Settings $\to$ Emergency Controls $\to$ Freeze All Automations**.

### Direct Database Method (SQL Emergency Halt):
```sql
-- Instantly pause all active automations
UPDATE automations SET status = 'PAUSED' WHERE status = 'ACTIVE';

-- Cancel all pending queued outbound jobs
UPDATE message_jobs SET status = 'BLOCKED', error_log = 'EMERGENCY_HALT_TRIGGERED' 
WHERE status = 'PENDING';
```

---

## 3. Common Error Runbooks

### 3.1 Error: `OAuthException (Code 190) - Invalid OAuth Access Token`
- **Cause:** Meta password changed, permissions revoked by admin, or 60-day token expired.
- **Impact:** System cannot read webhooks or send outbound messages for the channel.
- **Resolution Runbook:**
  1. Open XINVORA Admin $\to$ **Settings $\to$ Social Accounts**.
  2. Click **"Reconnect Account"** for the affected Instagram / Facebook channel.
  3. Re-authorize all required permissions in the Meta consent window.
  4. The system will securely encrypt and save the new 60-day token and re-enable active automations.

---

### 3.2 Error: `Rate Limit Exceeded (Code 4 / 17 / 32)`
- **Cause:** Outbound message volume exceeded Meta's rolling call budget.
- **Resolution Runbook:**
  1. The automated circuit breaker will delay queue workers for $120\text{ seconds}$.
  2. Check **Admin $\to$ Logs** to identify if a single Reel or campaign triggered an excessive burst.
  3. Increase dispatch jitter from $1.5\text{s}$ to $4.0\text{s}$ in queue settings.
  4. Verify that background workers are respecting per-channel concurrency caps.

---

### 3.3 Error: `Webhook Signature Verification Failed (401 Unauthorized)`
- **Cause:** `META_APP_SECRET` mismatch between the environment config and the Meta Developer App Dashboard.
- **Resolution Runbook:**
  1. Verify the App Secret in Meta Developer Portal under **App Settings $\to$ Basic**.
  2. Cross-reference with `process.env.META_APP_SECRET` on Vercel / hosting environment.
  3. Redeploy after updating the secret.

---

### 3.4 Issue: High Number of `BLOCKED_BY_POLICY` Audit Logs
- **Cause:** Commenters replying after 7 days, or users attempting to trigger follow-up DMs outside the 24-hour window.
- **Resolution Runbook:**
  1. Review `compliance_decisions` table to inspect the `rejection_reason`.
  2. Confirm this is normal expected operation (the Compliance Gatekeeper is protecting the account).
  3. If users complain about missed links, ensure marketing copy instructs them to comment within 7 days.
