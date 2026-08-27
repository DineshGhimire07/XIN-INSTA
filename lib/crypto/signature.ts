import crypto from 'crypto';

/**
 * Validates Meta X-Hub-Signature-256 HMAC against the raw request body
 * Strictly enforces official Meta HMAC SHA-256 signature verification with safe diagnostics.
 */
export function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET?.trim();
  const header = signatureHeader?.trim();

  const appSecretConfigured = Boolean(appSecret && appSecret.length > 0);
  const headerPresent = Boolean(header && header.length > 0);

  if (!appSecretConfigured || !headerPresent) {
    console.log('[Meta Webhook][Diagnostic] raw-body HMAC matches Meta: false');
    console.log('[Meta Webhook][Diagnostic] unicode-escaped HMAC matches Meta: false');
    return false;
  }

  try {
    const isSha256Prefixed = header!.toLowerCase().startsWith('sha256=');
    const receivedHex = isSha256Prefixed ? header!.slice(7).trim() : header!.trim();
    const receivedBuf = Buffer.from(receivedHex, 'hex');

    // 1. Raw Body HMAC Calculation
    const calculatedRawHex = crypto
      .createHmac('sha256', appSecret!)
      .update(rawBody, 'utf8')
      .digest('hex');
    const calculatedRawBuf = Buffer.from(calculatedRawHex, 'hex');
    const rawMatches =
      receivedBuf.length === 32 &&
      calculatedRawBuf.length === 32 &&
      crypto.timingSafeEqual(receivedBuf, calculatedRawBuf);

    // 2. Unicode-escaped representation HMAC Calculation
    const unicodeEscapedBody = rawBody.replace(
      /[^\x00-\x7F]/g,
      (c) => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
    );
    const calculatedUnicodeHex = crypto
      .createHmac('sha256', appSecret!)
      .update(unicodeEscapedBody, 'utf8')
      .digest('hex');
    const calculatedUnicodeBuf = Buffer.from(calculatedUnicodeHex, 'hex');
    const unicodeMatches =
      receivedBuf.length === 32 &&
      calculatedUnicodeBuf.length === 32 &&
      crypto.timingSafeEqual(receivedBuf, calculatedUnicodeBuf);

    // Log ONLY the two requested diagnostic comparisons
    console.log(`[Meta Webhook][Diagnostic] raw-body HMAC matches Meta: ${rawMatches}`);
    console.log(`[Meta Webhook][Diagnostic] unicode-escaped HMAC matches Meta: ${unicodeMatches}`);

    return rawMatches || unicodeMatches;
  } catch (err) {
    console.error('[Meta Webhook][Diagnostic] error:', err instanceof Error ? err.message : err);
    return false;
  }
}
