import { NextRequest, NextResponse } from 'next/server';
import { verifyMetaWebhookSignature } from '@/lib/crypto/signature';
import { generateIdempotencyKey } from '@/lib/queue/idempotency';
import { matchIntent } from '@/lib/engine/intent-matcher';
import { selectFromResponsePool } from '@/lib/engine/response-pool';
import { supabaseServer } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/crypto/encryption';
import { InstagramAdapter } from '@/lib/adapters/instagram.adapter';

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
    console.log('[Meta Webhook] Inbound entry keys:', Object.keys(entry));

    // Normalize all possible Meta DM formats (messaging, standby, changes.messages)
    const dmEvents: Array<Record<string, any>> = [];

    if (Array.isArray(entry.messaging)) {
      dmEvents.push(...(entry.messaging as Array<Record<string, any>>));
    }
    if (Array.isArray(entry.standby)) {
      dmEvents.push(...(entry.standby as Array<Record<string, any>>));
    }
    if (Array.isArray(entry.changes)) {
      for (const ch of entry.changes as Array<Record<string, any>>) {
        if (ch.field === 'messages' && ch.value) {
          dmEvents.push(ch.value);
        }
      }
    }

    // -------------------------------------------------------------
    // A. INBOUND DIRECT MESSAGES (DMs) — Template 1 & Custom Auto-Replies
    // -------------------------------------------------------------
    for (const msgEvent of dmEvents) {
      const senderId = msgEvent.sender?.id || msgEvent.from?.id;
      const recipientId = msgEvent.recipient?.id || msgEvent.to?.id;
      const messageText = msgEvent.message?.text || msgEvent.postback?.title || msgEvent.text || '';
      const quickReplyPayload = msgEvent.message?.quick_reply?.payload || msgEvent.postback?.payload || '';
      const mid = msgEvent.message?.mid || msgEvent.mid || msgEvent.id;
      const isEcho = Boolean(msgEvent.message?.is_echo || msgEvent.is_echo);

      console.log(`[Meta Webhook] Event detail: sender=${senderId}, recipient=${recipientId}, text="${messageText}", isEcho=${isEcho}`);

      // Ignore echoes sent by the bot itself to prevent infinite loops
      if (isEcho) {
        console.log('[Meta Webhook] Echo event ignored.');
        continue;
      }

      if (senderId && (messageText || quickReplyPayload)) {
        console.log(`[Meta Webhook] Inbound DM from ${senderId}: "${messageText}" (Payload: ${quickReplyPayload})`);

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
          let isNewConversation = false;
          let { data: conversation } = await supabaseServer
            .from('conversations')
            .select('*')
            .eq('contact_id', contact.id)
            .single();

          if (!conversation) {
            isNewConversation = true;
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
              payload: { mid, timestamp: msgEvent.timestamp || Date.now(), quickReplyPayload },
            });

            // 4. Evaluate Automation Rules (Template 1 & Custom DM Rules)
            if (conversation.status === 'AUTOMATED' && channel?.encrypted_access_token) {
              try {
                const accessToken = decryptToken(channel.encrypted_access_token);
                const adapter = new InstagramAdapter();
                const textLower = (messageText + ' ' + quickReplyPayload).toLowerCase();

                // Check human handoff
                const intentResult = matchIntent(messageText);
                if (intentResult.intent === 'HUMAN_SUPPORT') {
                  await supabaseServer
                    .from('conversations')
                    .update({ status: 'NEEDS_ATTENTION' })
                    .eq('id', conversation.id);

                  const handoffText = '👩‍💼 A human support agent from XINVORA has been notified and will take over this chat shortly!';
                  const res = await adapter.sendDirectMessage(accessToken, senderId, handoffText);
                  console.log('[Meta Webhook] Handoff DM dispatch result:', res);

                  await supabaseServer.from('conversation_messages').insert({
                    conversation_id: conversation.id,
                    direction: 'OUTBOUND',
                    sender_type: 'BOT',
                    message_type: 'DIRECT_MESSAGE',
                    text: handoffText,
                  });
                } 
                // Branch: Delivery Info
                else if (
                  quickReplyPayload === 'FAQ_DELIVERY' ||
                  textLower.includes('delivery') ||
                  textLower.includes('ship') ||
                  textLower.includes('courier') ||
                  textLower.includes('valley')
                ) {
                  const deliveryText = `📦 Delivery Information:\n\n• Inside Kathmandu Valley: 24 Hours (Free Delivery 🚚)\n• Outside Valley / Across Nepal: 2-3 Business Days ⚡\n\nAll orders are securely packaged with doorstep tracking!`;
                  const res = await adapter.sendDirectMessage(accessToken, senderId, deliveryText);
                  console.log('[Meta Webhook] Delivery DM dispatch result:', res);

                  await supabaseServer.from('conversation_messages').insert({
                    conversation_id: conversation.id,
                    direction: 'OUTBOUND',
                    sender_type: 'BOT',
                    message_type: 'DIRECT_MESSAGE',
                    text: deliveryText,
                  });
                }
                // Branch: Cash on Delivery (COD)
                else if (
                  quickReplyPayload === 'FAQ_COD' ||
                  textLower.includes('cod') ||
                  textLower.includes('cash on delivery') ||
                  textLower.includes('pay on delivery')
                ) {
                  const codText = `💵 Cash on Delivery (COD):\n\nYes! 100% Cash on Delivery is available across all 77 districts in Nepal! 🇳🇵\nYou pay only when your order arrives safely at your doorstep.`;
                  const res = await adapter.sendDirectMessage(accessToken, senderId, codText);
                  console.log('[Meta Webhook] COD DM dispatch result:', res);

                  await supabaseServer.from('conversation_messages').insert({
                    conversation_id: conversation.id,
                    direction: 'OUTBOUND',
                    sender_type: 'BOT',
                    message_type: 'DIRECT_MESSAGE',
                    text: codText,
                  });
                }
                // Branch: Custom DM Automation (Template 1 / Keyword / Any-Text Auto-Reply)
                else {
                  // Fetch active DM automation from database
                  const { data: dmAutomation } = await supabaseServer
                    .from('automations')
                    .select('*')
                    .eq('trigger_type', 'DM')
                    .eq('status', 'ACTIVE')
                    .limit(1)
                    .single();

                  const flowData = (dmAutomation?.flow_graph as Record<string, any>) || {};
                  const triggerMode = flowData.triggerMode || 'ANY_TEXT';
                  const keywords: string[] = flowData.keywords || ['hi', 'hello', 'hey', 'price', 'kati'];
                  const replyText =
                    flowData.replyText ||
                    '👋 Hello! Welcome to XINVORA ✨\nThank you for reaching out to us. How can we help you today? Let us know what you are looking for!';
                  const attachProductCard = flowData.attachProductCard ?? true;

                  let shouldTrigger = false;
                  if (triggerMode === 'ANY_TEXT') {
                    shouldTrigger = true;
                  } else if (triggerMode === 'KEYWORDS') {
                    shouldTrigger = keywords.some((k) =>
                      textLower.includes(k.toLowerCase().trim())
                    );
                  }

                  if (shouldTrigger) {
                    console.log(`[Meta Webhook] Triggering custom DM reply to ${senderId}: "${replyText}"`);

                    // Send custom reply text
                    const textRes = await adapter.sendDirectMessage(accessToken, senderId, replyText);
                    console.log('[Meta Webhook] Text DM dispatch result:', textRes);

                    await supabaseServer.from('conversation_messages').insert({
                      conversation_id: conversation.id,
                      direction: 'OUTBOUND',
                      sender_type: 'BOT',
                      message_type: 'DIRECT_MESSAGE',
                      text: replyText,
                    });

                    // If enabled, attach product card
                    if (attachProductCard) {
                      const { data: activeProduct } = await supabaseServer
                        .from('products')
                        .select('*')
                        .eq('is_active', true)
                        .limit(1)
                        .single();

                      const product = activeProduct || {
                        title: 'Black Velvet Party Dress',
                        price: 3499,
                        currency: 'NPR',
                        image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
                        product_url: 'https://xin-insta.vercel.app',
                      };

                      const cardRes = await adapter.sendGenericCardDirectMessage(accessToken, senderId, {
                        title: product.title,
                        subtitle: `${product.currency || 'NPR'} ${product.price}`,
                        imageUrl: product.image_url,
                        productUrl: product.product_url,
                        buttonText: 'VIEW PRICE',
                      });
                      console.log('[Meta Webhook] Card DM dispatch result:', cardRes);

                      await supabaseServer.from('conversation_messages').insert({
                        conversation_id: conversation.id,
                        direction: 'OUTBOUND',
                        sender_type: 'BOT',
                        message_type: 'DIRECT_MESSAGE',
                        text: `${product.title} - ${product.currency || 'NPR'} ${product.price}`,
                      });
                    }
                  }
                }
              } catch (dispatchErr) {
                console.error('[Meta Webhook] Failed to auto-dispatch reply:', dispatchErr);
              }
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
