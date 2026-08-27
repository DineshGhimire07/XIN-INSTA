import crypto from 'crypto';

/**
 * Validates Meta X-Hub-Signature-256 HMAC against the raw request body
 * Strictly enforces official Meta HMAC SHA-256 signature verification with safe diagnostics.
 */
export function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET?.trim();
  const header = signatureHeader?.trim();

  const appSecretConfigured = Boolean(appSecret && appSecret.length > 0);
  const appSecretLength = appSecret?.length ?? 0;
  const headerPresent = Boolean(header && header.length > 0);
  const rawBodyLength = Buffer.byteLength(rawBody || '', 'utf8');

  console.log(`[Meta Webhook][Diagnostic] META_APP_SECRET configured: ${appSecretConfigured}`);
  console.log(`[Meta Webhook][Diagnostic] META_APP_SECRET length: ${appSecretLength}`);
  console.log(`[Meta Webhook][Diagnostic] x-hub-signature-256 header present: ${headerPresent}`);

  if (!appSecretConfigured || !headerPresent) {
    console.log(`[Meta Webhook][Diagnostic] received signature hex length: 0`);
    console.log(`[Meta Webhook][Diagnostic] calculated signature hex length: 0`);
    console.log(`[Meta Webhook][Diagnostic] raw request body byte length: ${rawBodyLength}`);
    console.log(`[Meta Webhook][Diagnostic] signature match: false`);
    return false;
  }

  try {
    const isSha256Prefixed = header!.toLowerCase().startsWith('sha256=');
    const receivedHex = isSha256Prefixed ? header!.slice(7).trim() : header!.trim();

    const calculatedHex = crypto
      .createHmac('sha256', appSecret!)
      .update(rawBody, 'utf8')
      .digest('hex');

    console.log(`[Meta Webhook][Diagnostic] received signature hex length: ${receivedHex.length}`);
    console.log(`[Meta Webhook][Diagnostic] calculated signature hex length: ${calculatedHex.length}`);
    console.log(`[Meta Webhook][Diagnostic] raw request body byte length: ${rawBodyLength}`);

    const receivedBuf = Buffer.from(receivedHex, 'hex');
    const calculatedBuf = Buffer.from(calculatedHex, 'hex');

    const validLength = receivedBuf.length === 32 && calculatedBuf.length === 32;
    const isMatch = validLength && crypto.timingSafeEqual(receivedBuf, calculatedBuf);

    console.log(`[Meta Webhook][Diagnostic] signature match: ${isMatch}`);

    return isMatch;
  } catch (err) {
    console.error('[Meta Webhook][Diagnostic] error:', err instanceof Error ? err.message : err);
    return false;
  }
}
