import { NextResponse } from 'next/server';
import { QueueDispatcher } from '@/lib/queue/dispatcher';

/**
 * Worker endpoint to process background message jobs
 */
export async function POST() {
  const dispatcher = new QueueDispatcher();
  const result = await dispatcher.processBatch(20);

  return NextResponse.json({
    status: 'COMPLETED',
    processed: result.processed,
    errors: result.errors,
    timestamp: new Date().toISOString(),
  });
}
