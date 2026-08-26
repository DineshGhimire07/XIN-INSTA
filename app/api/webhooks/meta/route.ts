import { NextRequest, NextResponse } from 'next/server';
import { verifyMetaWebhookSignature } from '@/lib/crypto/signature';
import { generateIdempotencyKey } from '@/lib/queue/idempotency';
import { matchIntent } from '@/lib/engine/intent-matcher';
import { selectFromResponsePool } from '@/lib/engine/response-pool';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * GET: Meta Webhook Subscription Verification (Hub Challenge Handshake)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    console.log('[Meta Webhook] Verification challenge passed successfully.');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[Meta Webhook] Verification challenge rejected (token mismatch).');
  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST: Ingests real-time comments & direct messages from Meta
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256');
  const rawBody = await req.text();

  // 1. Signature Verification
  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    console.error('[Meta Webhook] Signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const entries = (body.entry as Array<Record<string, unknown>>) || [];

  for (const entry of entries) {
    const changes = (entry.changes as Array<Record<string, unknown>>) || [];

    for (const change of changes) {
      if (change.field === 'comments') {
        const commentValue = change.value as {
          id: string;
          text: string;
          from?: { id: string; username?: string };
          media?: { id: string; media_product_type?: string };
        };

        if (!commentValue?.id || !commentValue?.text) continue;

        const mediaId = commentValue.media?.id;
        const commentId = commentValue.id;
        const commentText = commentValue.text;
        const userId = commentValue.from?.id || 'unknown';

        // 2. Resolve Intent
        const intentResult = matchIntent(commentText);

        // 3. Resolve Mapped Product for this Reel/Post
        let product: Record<string, unknown> | null = null;
        if (mediaId) {
          const { data: mapping } = await supabaseServer
            .from('content_product_mappings')
            .select('product:products(*)')
            .eq('content_item_id', mediaId)
            .single();

          if (mapping?.product) {
            product = mapping.product as unknown as Record<string, unknown>;
          }
        }

        // Fallback: If no direct mapping, resolve primary active product
        if (!product) {
          const { data: fallbackProduct } = await supabaseServer
            .from('products')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .single();
          product = fallbackProduct as unknown as Record<string, unknown>;
        }

        // 4. Compute Idempotency Key
        const idempotencyKey = generateIdempotencyKey([
          'INSTAGRAM',
          'COMMENT',
          mediaId,
          commentId,
          'PRIVATE_REPLY',
        ]);

        // 5. Select Public Reply from Pool
        const publicReply = selectFromResponsePool({
          responses: [
            'Sent you the details! Check your DMs 💌',
            'Just dropped the link in your inbox! ✨',
            'Check your messages for the product link! 🛍️',
          ],
        });

        // 6. Enqueue Inbound Message Job
        if (product) {
          const { error: insertError } = await supabaseServer.from('message_jobs').insert({
            account_id: (product.account_id as string) || 'a0000000-0000-0000-0000-000000000001',
            channel_id: 'c0000000-0000-0000-0000-000000000001',
            recipient_id: commentId,
            job_type: 'COMMENT_PRIVATE_REPLY',
            idempotency_key: idempotencyKey,
            payload: {
              commentId,
              commentText,
              matchedIntent: intentResult.intent,
              commentCreatedAt: new Date().toISOString(),
              productCard: {
                title: product.title,
                subtitle: `${product.currency} ${product.price}`,
                imageUrl: product.image_url,
                productUrl: `${product.product_url}?utm_source=instagram&utm_medium=auto_dm`,
                buttonText: 'VIEW PRICE',
              },
              publicReplyText: publicReply.text,
            },
          });

          if (insertError && insertError.code === '23505') {
            console.log(`[Meta Webhook] Duplicate event dropped: ${idempotencyKey}`);
          }
        }
      }
    }
  }

  // Meta requires fast HTTP 200 response (< 500ms)
  return NextResponse.json({ status: 'PROCESSED' }, { status: 200 });
}
