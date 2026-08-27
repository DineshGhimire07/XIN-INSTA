import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET: Initiates official Meta OAuth 2.0 Flow
 * Redirects the user to Meta Login dialog with all required permissions for Instagram & Facebook Commerce Automation.
 */
export async function GET(req: NextRequest) {
  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/callback`;

  if (!appId) {
    return NextResponse.json(
      { error: 'META_APP_ID is not configured in environment variables' },
      { status: 500 }
    );
  }

  // Mandatory permissions for Meta Graph API Instagram & Facebook Automation
  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'pages_messaging',
    'instagram_basic',
    'instagram_manage_comments',
    'instagram_manage_messages',
    'public_profile',
  ].join(',');

  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

  // If request accepts JSON or has `format=json`, return the URL directly
  const { searchParams } = new URL(req.url);
  if (searchParams.get('format') === 'json') {
    return NextResponse.json({ authUrl });
  }

  return NextResponse.redirect(authUrl);
}
