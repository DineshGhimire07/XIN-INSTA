import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/crypto/encryption';
import { InstagramAdapter } from '@/lib/adapters/instagram.adapter';

export const dynamic = 'force-dynamic';

interface MetaMessage {
  id: string;
  message?: string;
  created_time: string;
  from?: { id: string; username?: string; name?: string };
}

interface MetaConversation {
  id: string;
  updated_time: string;
  participants?: { data: Array<{ id: string; username?: string; name?: string }> };
  messages?: { data: MetaMessage[] };
}

/**
 * GET: Fetches live Instagram inbox conversations from Meta Graph API & Supabase
 */
export async function GET() {
  try {
    const { data: channel } = await supabaseServer
      .from('channels')
      .select('*')
      .eq('channel_type', 'INSTAGRAM')
      .eq('status', 'CONNECTED')
      .limit(1)
      .single();

    let liveConversations: any[] = [];

    if (channel?.encrypted_access_token) {
      try {
        const token = decryptToken(channel.encrypted_access_token);
        const apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';
        
        // Query Instagram conversations
        const res = await fetch(
          `https://graph.instagram.com/${apiVersion}/me/conversations?fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${encodeURIComponent(token)}`
        );
        const json = await res.json();

        if (json.data && Array.isArray(json.data)) {
          liveConversations = json.data.map((conv: MetaConversation) => {
            const lastMsg = conv.messages?.data?.[0];
            const otherUser = conv.participants?.data?.find((p) => p.id !== channel.platform_account_id) || conv.participants?.data?.[0];

            return {
              id: conv.id,
              username: otherUser?.username ? `@${otherUser.username}` : (otherUser?.name || `@user_${conv.id.slice(-4)}`),
              channel: 'INSTAGRAM',
              status: 'AUTOMATED',
              lastMessage: lastMsg?.message || 'Started a conversation',
              lastMessageTime: lastMsg?.created_time ? new Date(lastMsg.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              hoursRemaining: 24,
              messages: (conv.messages?.data || []).reverse().map((m) => ({
                sender: m.from?.id === channel.platform_account_id ? 'bot' : 'user',
                text: m.message || '',
                time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              })),
            };
          });
        }
      } catch (igErr) {
        console.warn('[Inbox Meta Fetch Warning]:', igErr);
      }
    }

    // Also fetch saved conversations from database
    const { data: dbConversations } = await supabaseServer
      .from('conversations')
      .select(`
        id,
        status,
        last_message_at,
        contact:contacts (
          id,
          username,
          full_name,
          platform_user_id
        ),
        active_product:products (
          title,
          price,
          currency,
          product_url
        ),
        messages:conversation_messages (
          id,
          direction,
          sender_type,
          text,
          payload,
          created_at
        )
      `)
      .order('last_message_at', { ascending: false });

    // Format DB conversations
    const formattedDbConvs = (dbConversations || []).map((c: any) => {
      const msgs = (c.messages || []).map((m: any) => ({
        sender: m.sender_type === 'USER' ? 'user' : m.sender_type === 'HUMAN_AGENT' ? 'agent' : 'bot',
        text: m.text || '',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        card: m.payload?.productCard ? {
          title: m.payload.productCard.title,
          price: m.payload.productCard.subtitle,
          url: m.payload.productCard.productUrl,
        } : undefined,
      }));

      const lastMsg = msgs[msgs.length - 1];

      return {
        id: c.id,
        username: c.contact?.username ? (c.contact.username.startsWith('@') ? c.contact.username : `@${c.contact.username}`) : `@customer_${c.id.slice(0, 4)}`,
        channel: 'INSTAGRAM',
        status: c.status || 'AUTOMATED',
        lastMessage: lastMsg?.text || 'New interaction',
        lastMessageTime: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        hoursRemaining: 24,
        productTitle: c.active_product?.title,
        messages: msgs,
      };
    });

    // Merge live & DB conversations (avoid duplicate IDs)
    const combined = [...liveConversations];
    for (const dbC of formattedDbConvs) {
      if (!combined.some((item) => item.id === dbC.id)) {
        combined.push(dbC);
      }
    }

    return NextResponse.json({
      conversations: combined,
      connectedAccount: channel?.platform_username || '@xinvora',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Sends an outbound human agent message or toggles handoff status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, text, newStatus, recipientId } = body;

    // 1. If updating status (e.g. Human Handoff)
    if (newStatus && conversationId) {
      await supabaseServer
        .from('conversations')
        .update({ status: newStatus })
        .eq('id', conversationId);
      return NextResponse.json({ success: true, status: newStatus });
    }

    // 2. If sending manual agent message
    if (text) {
      const { data: channel } = await supabaseServer
        .from('channels')
        .select('*')
        .eq('channel_type', 'INSTAGRAM')
        .eq('status', 'CONNECTED')
        .single();

      if (channel && recipientId) {
        const token = decryptToken(channel.encrypted_access_token);
        const adapter = new InstagramAdapter();
        await adapter.sendDirectMessage(token, recipientId, text);
      }

      // Record message in DB
      if (conversationId) {
        await supabaseServer.from('conversation_messages').insert({
          conversation_id: conversationId,
          direction: 'OUTBOUND',
          sender_type: 'HUMAN_AGENT',
          message_type: 'DIRECT_MESSAGE',
          text,
        });

        await supabaseServer
          .from('conversations')
          .update({
            status: 'HUMAN_HANDLED',
            last_message_at: new Date().toISOString(),
          })
          .eq('id', conversationId);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
