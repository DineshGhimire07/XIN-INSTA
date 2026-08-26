import crypto from 'crypto';

/**
 * Validates Meta X-Hub-Signature-256 HMAC against the raw request body
 */
export function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.warn('[Security] META_APP_SECRET is not configured.');
    return false;
  }

  const expectedHash = signatureHeader.replace('sha256=', '');
  const calculatedHash = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(calculatedHash, 'hex')
    );
  } catch {
    return false;
  }
}
