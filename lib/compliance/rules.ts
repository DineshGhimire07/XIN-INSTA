export interface PolicyCheckParams {
  channel: 'INSTAGRAM' | 'FACEBOOK';
  actionType: 'COMMENT_PRIVATE_REPLY' | 'DIRECT_MESSAGE' | 'CAMPAIGN_BROADCAST';
  commentCreatedAt?: Date | string;
  lastUserInteractionAt?: Date | string;
  previousPrivateRepliesSent?: number;
  isOptedOut?: boolean;
  hasMarketingConsent?: boolean;
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason: string;
  policyRule: string;
}

/**
 * Validates Meta Policy Constraints before calling Meta APIs
 */
export function evaluatePolicyRules(params: PolicyCheckParams): PolicyCheckResult {
  // Rule 1: Contact Opt-out Check
  if (params.isOptedOut) {
    return {
      allowed: false,
      reason: 'RECIPIENT_OPTED_OUT',
      policyRule: 'META_PRIVACY_OPT_OUT',
    };
  }

  // Rule 2: Instagram Comment Private Reply Constraints (7 Days + 1 Message Max)
  if (params.channel === 'INSTAGRAM' && params.actionType === 'COMMENT_PRIVATE_REPLY') {
    if (params.previousPrivateRepliesSent && params.previousPrivateRepliesSent >= 1) {
      return {
        allowed: false,
        reason: 'DUPLICATE_PRIVATE_REPLY_PROHIBITED',
        policyRule: 'META_IG_PRIVATE_REPLY_1_MSG_LIMIT',
      };
    }

    if (params.commentCreatedAt) {
      const commentTime = new Date(params.commentCreatedAt).getTime();
      const now = Date.now();
      const diffHours = (now - commentTime) / (1000 * 60 * 60);

      // Meta documents maximum 7 days (168 hours) for private replies
      if (diffHours > 168) {
        return {
          allowed: false,
          reason: 'COMMENT_OLDER_THAN_7_DAYS',
          policyRule: 'META_IG_PRIVATE_REPLY_7_DAY_WINDOW',
        };
      }
    }
  }

  // Rule 3: Standard Messaging Window (24-Hour Customer Care Window)
  if (params.actionType === 'DIRECT_MESSAGE') {
    if (params.lastUserInteractionAt) {
      const interactionTime = new Date(params.lastUserInteractionAt).getTime();
      const now = Date.now();
      const diffHours = (now - interactionTime) / (1000 * 60 * 60);

      if (diffHours > 24) {
        return {
          allowed: false,
          reason: 'EXPIRED_24_HOUR_WINDOW',
          policyRule: 'META_STANDARD_MESSAGING_24H_WINDOW',
        };
      }
    }
  }

  // Rule 4: Marketing Broadcasts require explicit opt-in
  if (params.actionType === 'CAMPAIGN_BROADCAST' && !params.hasMarketingConsent) {
    return {
      allowed: false,
      reason: 'MISSING_RECURRING_NOTIFICATION_OPT_IN',
      policyRule: 'META_RECURRING_NOTIFICATIONS_POLICY',
    };
  }

  return {
    allowed: true,
    reason: 'COMPLIANCE_PASSED',
    policyRule: 'META_OFFICIAL_POLICY_APPROVED',
  };
}
