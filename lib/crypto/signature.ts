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
  const prefixValid = Boolean(header && header.toLowerCase().startsWith('sha256='));
  const rawBodyLength = Buffer.byteLength(rawBody || '', 'utf8');

  if (!appSecretConfigured || !headerPresent || !prefixValid) {
    console.warn(
      `[Meta Webhook][Signature] appSecretConfigured=${appSecretConfigured} headerPresent=${headerPresent} prefixValid=${prefixValid} receivedSignatureLength=0 rawBodyLength=${rawBodyLength} verificationResult=false`
    );
    return false;
  }

  try {
    // Extract hex digest after "sha256="
    const receivedHex = header!.slice(7).trim();
    const calculatedHex = crypto
      .createHmac('sha256', appSecret!)
      .update(rawBody, 'utf8')
      .digest('hex');

    const receivedBuf = Buffer.from(receivedHex, 'hex');
    const calculatedBuf = Buffer.from(calculatedHex, 'hex');

    // Buffer length check to prevent timingSafeEqual RangeError
    const validLength = receivedBuf.length === 32 && calculatedBuf.length === 32;
    const isMatch = validLength && crypto.timingSafeEqual(receivedBuf, calculatedBuf);

    console.log(
      `[Meta Webhook][Signature] appSecretConfigured=${appSecretConfigured} headerPresent=${headerPresent} prefixValid=${prefixValid} receivedSignatureLength=${receivedHex.length} rawBodyLength=${rawBodyLength} verificationResult=${isMatch}`
    );

    return isMatch;
  } catch (err) {
    console.error('[Meta Webhook][Signature] Verification error occurred:', err instanceof Error ? err.message : err);
    return false;
  }
}
