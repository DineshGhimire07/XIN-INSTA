import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export interface DMAutomationConfig {
  triggerMode: 'ANY_TEXT' | 'KEYWORDS';
  keywords: string[];
  replyText: string;
  attachProductCard: boolean;
  productId?: string;
}

/**
 * GET: Retrieves all automations or default Template 1
 */
export async function GET() {
  try {
    const { data: automations, error } = await supabaseServer
      .from('automations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ automations: automations || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Creates or updates an automation rule (e.g. Template 1 DM Auto-Reply)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, triggerType, status, flowGraph } = body;

    const { data: accounts } = await supabaseServer.from('accounts').select('id').limit(1).single();
    const accountId = accounts?.id || 'a0000000-0000-0000-0000-000000000001';

    const automationId = id || 'b0000000-0000-0000-0000-000000000001';

    const { data, error } = await supabaseServer
      .from('automations')
      .upsert(
        {
          id: automationId,
          account_id: accountId,
          name: name || 'Template 1: Custom DM Auto-Reply',
          is_global: true,
          trigger_type: triggerType || 'DM',
          status: status || 'ACTIVE',
          flow_graph: flowGraph || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, automation: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
