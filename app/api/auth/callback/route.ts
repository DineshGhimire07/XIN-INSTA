import { NextRequest, NextResponse } from 'next/server';
import { encryptToken } from '@/lib/crypto/encryption';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username: string;
    name?: string;
  };
}

/**
 * GET: Handles Meta OAuth Callback
 * Exchanges code for access tokens, discovers Pages & Instagram accounts, encrypts tokens, and stores them in PostgreSQL.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    console.error('[Meta OAuth Error]:', error, errorDescription);
    return NextResponse.redirect(
      `${appUrl}/settings?error=${encodeURIComponent(errorDescription || error || 'OAuth Authorization Failed')}`
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';
  const redirectUri = `${appUrl}/api/auth/callback`;

  if (!appId || !appSecret) {
    return NextResponse.redirect(
      `${appUrl}/settings?error=${encodeURIComponent('Missing Meta App ID or Secret in environment')}`
    );
  }

  try {
    // 1. Exchange authorization code for short-lived user token
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange authorization code for access token');
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived 60-day token
    const longLivedUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const userAccessToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch user's Facebook Pages and linked Instagram Business accounts
    const accountsUrl = `https://graph.facebook.com/${apiVersion}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${userAccessToken}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok || !accountsData.data) {
      throw new Error(accountsData.error?.message || 'Failed to retrieve Facebook Pages from Meta API');
    }

    const pages: MetaPage[] = accountsData.data;

    // 4. Ensure a default account exists in database
    let accountId = 'a0000000-0000-0000-0000-000000000001';
    const { data: existingAccount } = await supabaseServer
      .from('accounts')
      .select('id')
      .limit(1)
      .single();

    if (existingAccount?.id) {
      accountId = existingAccount.id;
    } else {
      const { data: newAccount } = await supabaseServer
        .from('accounts')
        .insert({
          id: accountId,
          name: 'XINVORA Main Store',
          status: 'ACTIVE',
        })
        .select('id')
        .single();
      if (newAccount?.id) accountId = newAccount.id;
    }

    // 5. Process and securely save each Facebook Page & Instagram account
    let connectedPagesCount = 0;
    let connectedIgCount = 0;

    for (const page of pages) {
      const encryptedPageToken = encryptToken(page.access_token);
      const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days

      // 5a. Upsert Facebook Page Channel
      await supabaseServer.from('channels').upsert(
        {
          account_id: accountId,
          channel_type: 'FACEBOOK',
          platform_account_id: page.id,
          platform_username: page.name,
          encrypted_access_token: encryptedPageToken,
          token_expires_at: tokenExpiresAt,
          status: 'CONNECTED',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'channel_type,platform_account_id' }
      );
      connectedPagesCount++;

      // 5b. Automatically subscribe Facebook Page to Webhooks
      try {
        await fetch(
          `https://graph.facebook.com/${apiVersion}/${page.id}/subscribed_apps?subscribed_fields=feed,messages,messaging_postbacks,message_reactions&access_token=${page.access_token}`,
          { method: 'POST' }
        );
      } catch (subErr) {
        console.warn(`[Meta Webhook Sub] Failed for Page ${page.id}:`, subErr);
      }

      // 5c. Check for linked Instagram Business Account
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        // Instagram uses the Page Access Token for Graph API calls
        const encryptedIgToken = encryptToken(page.access_token);

        await supabaseServer.from('channels').upsert(
          {
            account_id: accountId,
            channel_type: 'INSTAGRAM',
            platform_account_id: ig.id,
            platform_username: ig.username ? `@${ig.username}` : (ig.name || `@ig_${ig.id}`),
            encrypted_access_token: encryptedIgToken,
            token_expires_at: tokenExpiresAt,
            status: 'CONNECTED',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'channel_type,platform_account_id' }
        );
        connectedIgCount++;

        // Subscribe Instagram to Webhooks
        try {
          await fetch(
            `https://graph.facebook.com/${apiVersion}/${page.id}/subscribed_apps?subscribed_fields=feed,messages,messaging_postbacks,message_reactions,comments&access_token=${page.access_token}`,
            { method: 'POST' }
          );
        } catch (igSubErr) {
          console.warn(`[Meta Webhook Sub] Failed for IG ${ig.id}:`, igSubErr);
        }
      }
    }

    return NextResponse.redirect(
      `${appUrl}/settings?status=success&pages=${connectedPagesCount}&instagram=${connectedIgCount}`
    );
  } catch (err) {
    console.error('[Meta OAuth Callback Exception]:', err);
    return NextResponse.redirect(
      `${appUrl}/settings?error=${encodeURIComponent(
        err instanceof Error ? err.message : 'Failed to complete Meta authentication'
      )}`
    );
  }
}
