import { supabaseServer } from '@/lib/supabase/server';
import { ComplianceGatekeeper } from '@/lib/compliance/gatekeeper';
import { InstagramAdapter, ProductCardPayload } from '@/lib/adapters/instagram.adapter';
import { FacebookAdapter } from '@/lib/adapters/facebook.adapter';
import { decryptToken } from '@/lib/crypto/encryption';
import { MessageJob, OutboundResult } from '@/types';

export class QueueDispatcher {
  private igAdapter: InstagramAdapter;
  private fbAdapter: FacebookAdapter;

  constructor() {
    this.igAdapter = new InstagramAdapter();
    this.fbAdapter = new FacebookAdapter();
  }

  /**
   * Processes a batch of pending message jobs from PostgreSQL
   */
  public async processBatch(limit: number = 10): Promise<{ processed: number; errors: number }> {
    const { data: jobs, error } = await supabaseServer
      .from('message_jobs')
      .select('*, channel:channels(*)')
      .eq('status', 'PENDING')
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !jobs || jobs.length === 0) {
      return { processed: 0, errors: 0 };
    }

    let processed = 0;
    let errors = 0;

    for (const job of jobs as (MessageJob & { channel: { encrypted_access_token: string; channel_type: 'INSTAGRAM' | 'FACEBOOK' } })[]) {
      try {
        // Mark job as PROCESSING
        await supabaseServer
          .from('message_jobs')
          .update({ status: 'PROCESSING' })
          .eq('id', job.id);

        const payload = job.payload as {
          commentId?: string;
          productCard?: ProductCardPayload;
          publicReplyText?: string;
          commentCreatedAt?: string;
        };

        // 1. Mandatory Compliance Check before ANY API call
        const compliance = await ComplianceGatekeeper.validate({
          accountId: job.account_id,
          recipientId: job.recipient_id,
          messageJobId: job.id,
          channel: job.channel.channel_type,
          actionType: job.job_type === 'COMMENT_PRIVATE_REPLY' ? 'COMMENT_PRIVATE_REPLY' : 'DIRECT_MESSAGE',
          commentCreatedAt: payload.commentCreatedAt,
          previousPrivateRepliesSent: 0,
        });

        if (!compliance.allowed) {
          // Blocked by Meta compliance gatekeeper
          await supabaseServer
            .from('message_jobs')
            .update({
              status: 'BLOCKED',
              error_log: `Compliance Blocked: ${compliance.reason}`,
              processed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          continue;
        }

        // 2. Decrypt Channel OAuth Token
        const accessToken = decryptToken(job.channel.encrypted_access_token);

        // 3. Dispatch via Channel Adapter
        let result: OutboundResult = { success: false, errorMessage: 'Unsupported job type' };

        if (job.channel.channel_type === 'INSTAGRAM') {
          if (job.job_type === 'COMMENT_PRIVATE_REPLY' && payload.commentId && payload.productCard) {
            result = await this.igAdapter.sendCommentPrivateReply(
              accessToken,
              payload.commentId,
              payload.productCard
            );
          } else if (job.job_type === 'PUBLIC_REPLY' && payload.commentId && payload.publicReplyText) {
            result = await this.igAdapter.sendPublicCommentReply(
              accessToken,
              payload.commentId,
              payload.publicReplyText
            );
          }
        } else if (job.channel.channel_type === 'FACEBOOK') {
          if (job.job_type === 'COMMENT_PRIVATE_REPLY' && payload.commentId && payload.productCard) {
            result = await this.fbAdapter.sendCommentPrivateReply(
              accessToken,
              payload.commentId,
              payload.productCard
            );
          }
        }

        // 4. Update Job Status
        if (result.success) {
          await supabaseServer
            .from('message_jobs')
            .update({
              status: 'COMPLETED',
              processed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          processed++;
        } else {
          const nextRetry = job.retry_count + 1;
          const isFailed = nextRetry >= job.max_retries;

          await supabaseServer
            .from('message_jobs')
            .update({
              status: isFailed ? 'FAILED' : 'PENDING',
              retry_count: nextRetry,
              error_log: result.errorMessage || 'Unknown Meta API error',
              scheduled_for: new Date(Date.now() + Math.pow(4, nextRetry) * 1000).toISOString(),
            })
            .eq('id', job.id);
          errors++;
        }
      } catch (err) {
        errors++;
        console.error(`[QueueDispatcher] Error processing job ${job.id}:`, err);
      }
    }

    return { processed, errors };
  }
}
