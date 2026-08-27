import { NextRequest, NextResponse } from 'next/server';
import { matchIntent } from '@/lib/engine/intent-matcher';
import { selectFromResponsePool } from '@/lib/engine/response-pool';
import { evaluatePolicyRules } from '@/lib/compliance/rules';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const simulatedComment = body.simulatedComment || body.commentText || '';
    const channel = body.channel || 'INSTAGRAM';
    const mediaId = body.mediaId;

    // 1. Intent Matcher
    const intentResult = matchIntent(simulatedComment);

    // 2. Resolve Real Product from Supabase
    let product: any = null;
    if (mediaId) {
      const { data: mapping } = await supabaseServer
        .from('content_product_mappings')
        .select('product:products(*)')
        .eq('content_item_id', mediaId)
        .single();
      if (mapping?.product) product = mapping.product;
    }

    if (!product) {
      const { data: dbProd } = await supabaseServer
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();
      product = dbProd;
    }

    if (!product) {
      product = {
        product_code: 'XIN-001',
        title: 'Black Velvet Party Dress',
        category: 'Dresses',
        price: 3499.0,
        currency: 'NPR',
        image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        product_url: 'https://xinvora.com/products/black-velvet-dress',
        available_sizes: ['S', 'M', 'L'],
      };
    }

    // 3. Compliance Evaluation (1-reply limit / 24-hr window)
    const complianceResult = evaluatePolicyRules({
      channel: channel as 'INSTAGRAM' | 'FACEBOOK',
      actionType: 'COMMENT_PRIVATE_REPLY',
      commentCreatedAt: new Date(),
      previousPrivateRepliesSent: 0,
      isOptedOut: false,
    });

    // 4. Randomized Public Reply Pool
    const publicReply = selectFromResponsePool({
      responses: [
        'Sent you the details! Check your DMs 💌',
        'Just dropped the link in your inbox! ✨',
        'Check your messages for the direct product link! 🛍️',
      ],
    });

    return NextResponse.json({
      matchedIntent: intentResult.intent,
      confidence: intentResult.confidence,
      matchedKeyword: intentResult.matchedKeyword,
      resolvedProduct: product,
      complianceCheck: complianceResult,
      selectedPublicReply: publicReply.text,
      renderedPrivateCard: {
        title: product.title,
        subtitle: `${product.currency || 'NPR'} ${product.price} | Sizes: ${product.available_sizes ? product.available_sizes.join(', ') : 'All'}`,
        imageUrl: product.image_url,
        cta: 'VIEW PRICE',
        url: `${product.product_url}?utm_source=instagram&utm_medium=auto_dm`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Simulation execution failed' },
      { status: 500 }
    );
  }
}
