import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const SAMPLE_REELS = [
  {
    id: 'reel_42',
    platform_content_id: 'reel_42',
    content_type: 'REEL',
    permalink: 'https://instagram.com/reel/C8jKl2xM91',
    caption: 'Our viral Black Velvet Party Dress is back in stock! ✨ Drop LINK or PRICE below for instant priority checkout access 🛍️',
    media_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    views: '48.2K',
    comments_count: 142,
    bound_product: 'Black Velvet Party Dress (DRESS-001 - NPR 3,499)',
  },
  {
    id: 'reel_43',
    platform_content_id: 'reel_43',
    content_type: 'REEL',
    permalink: 'https://instagram.com/reel/C8lNx54P32',
    caption: 'Pure Cashmere Oversized Winter Knit ❄️ Comment KATI to get the price and sizing card in your DMs!',
    media_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    views: '29.5K',
    comments_count: 86,
    bound_product: 'Cashmere Oversized Knit (KNIT-002 - NPR 4,200)',
  },
  {
    id: 'reel_44',
    platform_content_id: 'reel_44',
    content_type: 'REEL',
    permalink: 'https://instagram.com/reel/C8qYz99K11',
    caption: 'Emerald Satin Evening Gown — hand-tailored luxury for your wedding season ✨ Comment SHOP for link!',
    media_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    views: '63.1K',
    comments_count: 219,
    bound_product: 'Emerald Satin Evening Gown (GOWN-004 - NPR 5,800)',
  },
  {
    id: 'post_101',
    platform_content_id: 'post_101',
    content_type: 'POST',
    permalink: 'https://instagram.com/p/C8uRt12J99',
    caption: 'Weekend Outfit Inspiration 👗 Tap our bio link or comment LOOK for the whole set breakdown!',
    media_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    views: '15.4K',
    comments_count: 42,
    bound_product: 'Organic Cotton Graphic Tee (TEE-003 - NPR 1,850)',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ reels: SAMPLE_REELS });
    }

    return NextResponse.json({ reels: data });
  } catch (err: any) {
    return NextResponse.json({ reels: SAMPLE_REELS });
  }
}
