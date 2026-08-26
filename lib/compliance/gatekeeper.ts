import { evaluatePolicyRules, PolicyCheckParams, PolicyCheckResult } from './rules';
import { supabaseServer } from '@/lib/supabase/server';

export interface GatekeeperValidationInput extends PolicyCheckParams {
  accountId: string;
  recipientId: string;
  messageJobId?: string;
  metadata?: Record<string, unknown>;
}

export class ComplianceGatekeeper {
  /**
   * Evaluates compliance rules and logs decision to the audit log table
   */
  public static async validate(input: GatekeeperValidationInput): Promise<PolicyCheckResult> {
    const evaluation = evaluatePolicyRules(input);

    try {
      // Record immutable audit decision in PostgreSQL
      await supabaseServer.from('compliance_decisions').insert({
        account_id: input.accountId,
        message_job_id: input.messageJobId || null,
        recipient_id: input.recipientId,
        evaluation_result: evaluation.allowed ? 'APPROVED' : 'REJECTED',
        reason: evaluation.reason,
        metadata: {
          policyRule: evaluation.policyRule,
          channel: input.channel,
          actionType: input.actionType,
          ...input.metadata,
        },
      });
    } catch (err) {
      console.error('[ComplianceGatekeeper] Failed to write compliance log:', err);
    }

    return evaluation;
  }
}
