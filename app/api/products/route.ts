import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieves all products from Supabase
 */
export async function GET() {
  try {
    const { data: products, error } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Inserts a new product into Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productCode, title, category, price, currency, imageUrl, productUrl, sizes, keywords, status } = body;

    let accountId = 'a0000000-0000-0000-0000-000000000001';
    const { data: acc } = await supabaseServer.from('accounts').select('id').limit(1).single();
    if (acc?.id) accountId = acc.id;

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        account_id: accountId,
        product_code: productCode,
        title,
        category: category || 'General',
        price: parseFloat(price),
        currency: currency || 'NPR',
        image_url: imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        product_url: productUrl || 'https://xinvora.com',
        available_sizes: sizes || ['S', 'M', 'L'],
        keywords: keywords || [],
        inventory_status: status || 'IN_STOCK',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
