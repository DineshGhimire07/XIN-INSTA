import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { encryptToken, decryptToken } from '@/lib/crypto/encryption';

export const dynamic = 'force-dynamic';

/**
 * GET: Lists all connected Meta Channels (Instagram & Facebook)
 */
export async function GET() {
  try {
    const { data: channels, error } = await supabaseServer
      .from('channels')
      .select('id, channel_type, platform_account_id, platform_username, token_expires_at, status, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ channels: channels || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Manual connect or token verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, channelId, rawToken, platformAccountId, platformUsername, channelType } = body;

    // Action 1: Test existing channel token against Meta Graph API
    if (action === 'test_token' && channelId) {
      const { data: channel, error } = await supabaseServer
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();

      if (error || !channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      const decryptedToken = decryptToken(channel.encrypted_access_token);
      const apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';
      const verifyRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/me?access_token=${encodeURIComponent(decryptedToken)}`
      );
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        return NextResponse.json({
          valid: false,
          error: verifyData.error?.message || 'Token is invalid or expired',
        });
      }

      return NextResponse.json({
        valid: true,
        accountName: verifyData.name,
        accountId: verifyData.id,
      });
    }

    // Action 2: Manual Direct Token Connection
    if (action === 'manual_connect' && rawToken && channelType && platformAccountId) {
      let accountId = 'a0000000-0000-0000-0000-000000000001';
      const { data: existingAccount } = await supabaseServer
        .from('accounts')
        .select('id')
        .limit(1)
        .single();

      if (existingAccount?.id) accountId = existingAccount.id;

      const encrypted = encryptToken(rawToken);
      const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabaseServer
        .from('channels')
        .upsert(
          {
            account_id: accountId,
            channel_type: channelType,
            platform_account_id: platformAccountId,
            platform_username: platformUsername || `${channelType}_${platformAccountId}`,
            encrypted_access_token: encrypted,
            token_expires_at: tokenExpiresAt,
            status: 'CONNECTED',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'channel_type,platform_account_id' }
        )
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, channel: data });
    }

    return NextResponse.json({ error: 'Invalid action or parameters' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Disconnects a channel
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('channels').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
