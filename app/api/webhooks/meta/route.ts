import { NextRequest, NextResponse } from 'next/server';
import { verifyMetaWebhookSignature } from '@/lib/crypto/signature';
import { generateIdempotencyKey } from '@/lib/queue/idempotency';
import { matchIntent } from '@/lib/engine/intent-matcher';
import { selectFromResponsePool } from '@/lib/engine/response-pool';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

  // 1. Strict Meta X-Hub-Signature-256 Verification
  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    console.error('[Meta Webhook] Request signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const entries = (body.entry as Array<Record<string, unknown>>) || [];

  // Get active Instagram channel
  const { data: channel } = await supabaseServer
    .from('channels')
    .select('*')
    .eq('channel_type', 'INSTAGRAM')
    .limit(1)
    .single();

  const channelId = channel?.id || 'c0000000-0000-0000-0000-000000000001';
  const accountId = channel?.account_id || 'a0000000-0000-0000-0000-000000000001';

  for (const entry of entries) {
    // -------------------------------------------------------------
    // A. INBOUND DIRECT MESSAGES (DMs) — Meta Messaging Webhook
    // -------------------------------------------------------------
    const messaging = (entry.messaging as Array<Record<string, any>>) || [];
    for (const msgEvent of messaging) {
      const senderId = msgEvent.sender?.id;
      const recipientId = msgEvent.recipient?.id;
      const messageText = msgEvent.message?.text;
      const mid = msgEvent.message?.mid;

      // Ignore echoes from our own bot/page
      if (msgEvent.message?.is_echo || senderId === channel?.platform_account_id) {
        continue;
      }

      if (senderId && messageText) {
        console.log(`[Meta Webhook] Inbound DM from ${senderId}: "${messageText}"`);

        // 1. Upsert Contact
        const { data: contact } = await supabaseServer
          .from('contacts')
          .upsert(
            {
              channel_id: channelId,
              platform_user_id: senderId,
              username: `@customer_${senderId.slice(-4)}`,
              last_interaction_at: new Date().toISOString(),
            },
            { onConflict: 'channel_id,platform_user_id' }
          )
          .select()
          .single();

        if (contact) {
          // 2. Find or create active conversation
          let { data: conversation } = await supabaseServer
            .from('conversations')
            .select('*')
            .eq('contact_id', contact.id)
            .single();

          if (!conversation) {
            const { data: newConv } = await supabaseServer
              .from('conversations')
              .insert({
                contact_id: contact.id,
                status: 'AUTOMATED',
                last_message_at: new Date().toISOString(),
              })
              .select()
              .single();
            conversation = newConv;
          } else {
            await supabaseServer
              .from('conversations')
              .update({
                last_message_at: new Date().toISOString(),
              })
              .eq('id', conversation.id);
          }

          // 3. Insert Inbound Message
          if (conversation) {
            await supabaseServer.from('conversation_messages').insert({
              conversation_id: conversation.id,
              direction: 'INBOUND',
              sender_type: 'USER',
              message_type: 'DIRECT_MESSAGE',
              text: messageText,
              payload: { mid, timestamp: msgEvent.timestamp },
            });

            // 4. Intent & Safety Evaluation
            const intentResult = matchIntent(messageText);
            if (intentResult.intent === 'HUMAN_SUPPORT') {
              await supabaseServer
                .from('conversations')
                .update({ status: 'NEEDS_ATTENTION' })
                .eq('id', conversation.id);
            }
          }
        }
      }
    }

    // -------------------------------------------------------------
    // B. INBOUND COMMENTS ON REELS / POSTS
    // -------------------------------------------------------------
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
        const username = commentValue.from?.username || `customer_${userId.slice(-4)}`;

        // 1. Resolve Intent
        const intentResult = matchIntent(commentText);

        // 2. Resolve Mapped Product for this Reel/Post
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

        // 3. Record contact & conversation for inbox tracking
        if (userId && userId !== 'unknown') {
          const { data: contact } = await supabaseServer
            .from('contacts')
            .upsert(
              {
                channel_id: channelId,
                platform_user_id: userId,
                username: username.startsWith('@') ? username : `@${username}`,
                last_interaction_at: new Date().toISOString(),
              },
              { onConflict: 'channel_id,platform_user_id' }
            )
            .select()
            .single();

          if (contact) {
            let { data: conv } = await supabaseServer
              .from('conversations')
              .select('*')
              .eq('contact_id', contact.id)
              .single();

            if (!conv) {
              const { data: newConv } = await supabaseServer
                .from('conversations')
                .insert({
                  contact_id: contact.id,
                  status: 'AUTOMATED',
                  active_product_id: (product?.id as string) || null,
                  last_message_at: new Date().toISOString(),
                })
                .select()
                .single();
              conv = newConv;
            }

            if (conv) {
              await supabaseServer.from('conversation_messages').insert({
                conversation_id: conv.id,
                direction: 'INBOUND',
                sender_type: 'USER',
                message_type: 'PUBLIC_COMMENT',
                text: commentText,
                payload: { commentId, mediaId },
              });
            }
          }
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
            account_id: (product.account_id as string) || accountId,
            channel_id: channelId,
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
