import crypto from 'crypto';

/**
 * Empirical Diagnostic Signature Verification:
 * Evaluates the real incoming Meta request against candidate secrets:
 * 1. Current META_APP_SECRET (from environment)
 * 2. Instagram App Secret (from Instagram App product)
 */
export function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const currentMetaSecret = process.env.META_APP_SECRET?.trim();
  const instagramAppSecret = '11e7adfd7ec6fd939aae9635deaf82ce';

  const header = signatureHeader?.trim();
  const headerPresent = Boolean(header && header.length > 0);
  const rawBodyLength = Buffer.byteLength(rawBody || '', 'utf8');

  if (!headerPresent) {
    console.log('[Meta Webhook][Diagnostic] current META_APP_SECRET matches Meta: false');
    console.log('[Meta Webhook][Diagnostic] Instagram App Secret matches Meta: false');
    console.log(`[Meta Webhook][Diagnostic] raw body byte length: ${rawBodyLength}`);
    console.log('[Meta Webhook][Diagnostic] received signature format/length: not-present');
    return false;
  }

  try {
    const isSha256Prefixed = header!.toLowerCase().startsWith('sha256=');
    const receivedHex = isSha256Prefixed ? header!.slice(7).trim() : header!.trim();
    const receivedBuf = Buffer.from(receivedHex, 'hex');

    const signatureFormat = `sha256_prefix=${isSha256Prefixed}, total_len=${header!.length}, hex_len=${receivedHex.length}`;

    // 1. Candidate 1: Current META_APP_SECRET
    let currentMetaMatches = false;
    if (currentMetaSecret) {
      const calculatedCurrentHex = crypto
        .createHmac('sha256', currentMetaSecret)
        .update(rawBody, 'utf8')
        .digest('hex');
      const calculatedCurrentBuf = Buffer.from(calculatedCurrentHex, 'hex');
      currentMetaMatches =
        receivedBuf.length === 32 &&
        calculatedCurrentBuf.length === 32 &&
        crypto.timingSafeEqual(receivedBuf, calculatedCurrentBuf);
    }

    // 2. Candidate 2: Instagram App Secret
    const calculatedInstaHex = crypto
      .createHmac('sha256', instagramAppSecret)
      .update(rawBody, 'utf8')
      .digest('hex');
    const calculatedInstaBuf = Buffer.from(calculatedInstaHex, 'hex');
    const instagramMatches =
      receivedBuf.length === 32 &&
      calculatedInstaBuf.length === 32 &&
      crypto.timingSafeEqual(receivedBuf, calculatedInstaBuf);

    // Strictly log only the empirical comparison results
    console.log(`[Meta Webhook][Diagnostic] current META_APP_SECRET matches Meta: ${currentMetaMatches}`);
    console.log(`[Meta Webhook][Diagnostic] Instagram App Secret matches Meta: ${instagramMatches}`);
    console.log(`[Meta Webhook][Diagnostic] raw body byte length: ${rawBodyLength}`);
    console.log(`[Meta Webhook][Diagnostic] received signature format/length: ${signatureFormat}`);

    return currentMetaMatches || instagramMatches;
  } catch (err) {
    console.error('[Meta Webhook][Diagnostic] error:', err instanceof Error ? err.message : err);
    return false;
  }
}
