import crypto from 'crypto';

/**
 * Computes deterministic SHA-256 idempotency key for inbound webhook events
 */
export function generateIdempotencyKey(parts: (string | number | undefined | null)[]): string {
  const content = parts.map(p => (p !== undefined && p !== null ? String(p) : '')).join(':');
  return crypto.createHash('sha256').update(content).digest('hex');
}
