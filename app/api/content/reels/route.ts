import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/crypto/encryption';

export const dynamic = 'force-dynamic';

interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink: string;
  timestamp: string;
}

/**
 * GET: Fetches live Instagram Reels/Posts from Graph API and Supabase mappings
 */
export async function GET() {
  try {
    // 1. Check for active Instagram channel
    const { data: channel } = await supabaseServer
      .from('channels')
      .select('*')
      .eq('channel_type', 'INSTAGRAM')
      .eq('status', 'CONNECTED')
      .limit(1)
      .single();

    if (channel?.encrypted_access_token) {
      try {
        const token = decryptToken(channel.encrypted_access_token);
        const res = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${encodeURIComponent(token)}`
        );
        const json = await res.json();

        if (json.data && Array.isArray(json.data)) {
          // Upsert fresh items to Supabase content_items
          for (const item of json.data as InstagramMediaItem[]) {
            await supabaseServer.from('content_items').upsert(
              {
                channel_id: channel.id,
                platform_content_id: item.id,
                content_type: item.media_type === 'VIDEO' ? 'REEL' : 'POST',
                permalink: item.permalink,
                caption: item.caption || 'Official Post',
                media_url: item.media_url || item.permalink,
                posted_at: item.timestamp,
              },
              { onConflict: 'channel_id,platform_content_id' }
            );
          }
        }
      } catch (igErr) {
        console.warn('[IG Graph API fetch warning]:', igErr);
      }
    }

    // 2. Fetch all content items joined with product mappings
    const { data: contentItems, error } = await supabaseServer
      .from('content_items')
      .select(`
        id,
        channel_id,
        platform_content_id,
        content_type,
        permalink,
        caption,
        media_url,
        posted_at,
        created_at,
        content_product_mappings (
          id,
          is_primary,
          product:products (
            id,
            product_code,
            title,
            price,
            currency
          )
        )
      `)
      .order('posted_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      reels: contentItems || [],
      connectedAccount: channel?.platform_username || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Maps a Content Item (Reel/Post) to a Product SKU
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentItemId, productCode } = body;

    if (!contentItemId) {
      return NextResponse.json({ error: 'contentItemId is required' }, { status: 400 });
    }

    if (!productCode || productCode === 'NONE') {
      // Remove mapping
      await supabaseServer
        .from('content_product_mappings')
        .delete()
        .eq('content_item_id', contentItemId);
      return NextResponse.json({ success: true, mapped: null });
    }

    // Find product
    const { data: product } = await supabaseServer
      .from('products')
      .select('id')
      .eq('product_code', productCode)
      .single();

    if (!product) {
      return NextResponse.json({ error: `Product SKU ${productCode} not found` }, { status: 404 });
    }

    // Upsert mapping
    const { data: mapping, error } = await supabaseServer
      .from('content_product_mappings')
      .upsert(
        {
          content_item_id: contentItemId,
          product_id: product.id,
          is_primary: true,
        },
        { onConflict: 'content_item_id,product_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, mapping });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
