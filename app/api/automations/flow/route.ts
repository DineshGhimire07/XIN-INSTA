import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { WorkflowRunner, FlowGraph } from '@/lib/engine/workflow-runner';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('automations')
      .select('id, name, status, flow_graph')
      .limit(1)
      .single();

    if (error || !data?.flow_graph) {
      return NextResponse.json({ success: true, flow: null });
    }

    return NextResponse.json({ success: true, flow: data.flow_graph, status: data.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, flow, context } = body;

    // Action 1: Execute Flow Dry-Run / Test Simulation
    if (action === 'execute') {
      const result = await WorkflowRunner.executeFlow(flow as FlowGraph, context || {
        channel: 'INSTAGRAM',
        commentText: 'link please',
        isFollower: true,
        userHandle: '@anita_shrestha',
      });
      return NextResponse.json({ success: true, result });
    }

    // Action 2: Save / Deploy Flow to Supabase
    if (action === 'save') {
      const { data: accounts } = await supabase.from('accounts').select('id').limit(1).single();
      const accountId = accounts?.id || 'a0000000-0000-0000-0000-000000000001';

      const { data, error } = await supabase
        .from('automations')
        .upsert(
          {
            id: flow.id || 'c0000000-0000-0000-0000-000000000001',
            account_id: accountId,
            name: flow.name || 'Visual Instagram Comment-to-DM Flow',
            is_global: true,
            trigger_type: 'COMMENT',
            status: 'ACTIVE',
            flow_graph: flow,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, saved: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
