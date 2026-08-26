import { NextRequest, NextResponse } from 'next/server';
import { matchIntent } from '@/lib/engine/intent-matcher';
import { selectFromResponsePool } from '@/lib/engine/response-pool';
import { evaluatePolicyRules } from '@/lib/compliance/rules';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { simulatedComment, channel = 'INSTAGRAM' } = body;

    // 1. Intent Matcher
    const intentResult = matchIntent(simulatedComment);

    // 2. Mock Product Resolution
    const mockProduct = {
      code: 'DRESS-001',
      title: 'Black Velvet Party Dress',
      category: 'Dresses',
      price: 3499.0,
      currency: 'NPR',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      productUrl: 'https://your-store.com/products/black-velvet-dress',
      availableSizes: ['S', 'M', 'L'],
    };

    // 3. Compliance Evaluation
    const complianceResult = evaluatePolicyRules({
      channel: channel as 'INSTAGRAM' | 'FACEBOOK',
      actionType: 'COMMENT_PRIVATE_REPLY',
      commentCreatedAt: new Date(),
      previousPrivateRepliesSent: 0,
      isOptedOut: false,
    });

    // 4. Randomized Public Reply
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
      resolvedProduct: mockProduct,
      complianceCheck: complianceResult,
      selectedPublicReply: publicReply.text,
      renderedPrivateCard: {
        title: mockProduct.title,
        subtitle: `${mockProduct.currency} ${mockProduct.price} | Sizes: ${mockProduct.availableSizes.join(', ')}`,
        imageUrl: mockProduct.imageUrl,
        cta: 'VIEW PRICE',
        url: `${mockProduct.productUrl}?utm_source=instagram&utm_medium=auto_dm`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Simulation execution failed' }, { status: 500 });
  }
}
