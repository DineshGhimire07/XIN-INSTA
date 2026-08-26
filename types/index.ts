export type ChannelType = 'INSTAGRAM' | 'FACEBOOK';
export type ContentType = 'POST' | 'REEL' | 'STORY' | 'LIVE';
export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
export type ConversationStatus = 'AUTOMATED' | 'NEEDS_ATTENTION' | 'HUMAN_HANDLED' | 'CLOSED';
export type EvaluationResult = 'APPROVED' | 'REJECTED' | 'THROTTLED';
export type SelectionStrategy = 'RANDOM_AVOID_REPEAT' | 'WEIGHTED_RANDOM' | 'ROUND_ROBIN';

export interface Account {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  account_id: string;
  channel_type: ChannelType;
  platform_account_id: string;
  platform_username: string | null;
  encrypted_access_token: string;
  token_expires_at: string | null;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  account_id: string;
  product_code: string;
  title: string;
  category: string | null;
  price: number;
  currency: string;
  product_url: string;
  image_url: string | null;
  description: string | null;
  available_sizes: string[];
  keywords: string[];
  inventory_status: InventoryStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  channel_id: string;
  platform_content_id: string;
  content_type: ContentType;
  permalink: string | null;
  caption: string | null;
  media_url: string | null;
  posted_at: string | null;
  created_at: string;
}

export interface ContentProductMapping {
  id: string;
  content_item_id: string;
  product_id: string;
  is_primary: boolean;
  created_at: string;
  product?: Product;
  content_item?: ContentItem;
}

export interface AutomationRule {
  id: string;
  account_id: string;
  name: string;
  is_global: boolean;
  trigger_type: 'COMMENT' | 'DM' | 'STORY_MENTION';
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  created_at: string;
  updated_at: string;
}

export interface ResponsePool {
  id: string;
  automation_id: string | null;
  name: string;
  responses: string[];
  selection_strategy: SelectionStrategy;
  last_chosen_index: number;
  created_at: string;
}

export interface Contact {
  id: string;
  channel_id: string;
  platform_user_id: string;
  username: string | null;
  full_name: string | null;
  tags: string[];
  is_opted_out: boolean;
  last_interaction_at: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  contact_id: string;
  status: ConversationStatus;
  last_message_at: string;
  active_product_id: string | null;
  created_at: string;
  contact?: Contact;
  active_product?: Product;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  sender_type: 'USER' | 'BOT' | 'HUMAN_AGENT';
  message_type: 'PRIVATE_REPLY' | 'DIRECT_MESSAGE' | 'PUBLIC_COMMENT';
  text: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface MessageJob {
  id: string;
  account_id: string;
  channel_id: string;
  recipient_id: string;
  job_type: 'COMMENT_PRIVATE_REPLY' | 'PUBLIC_REPLY' | 'DM_SEND';
  payload: Record<string, unknown>;
  status: JobStatus;
  retry_count: number;
  max_retries: number;
  scheduled_for: string;
  processed_at: string | null;
  error_log: string | null;
  idempotency_key: string;
  created_at: string;
}

export interface ComplianceDecision {
  id: string;
  message_job_id: string | null;
  account_id: string;
  recipient_id: string;
  evaluation_result: EvaluationResult;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NormalizedInboundEvent {
  eventId: string;
  channel: ChannelType;
  eventType: 'comment' | 'message' | 'story_mention';
  accountId: string;
  channelId: string;
  actor: {
    platformUserId: string;
    username?: string;
  };
  content: {
    contentId: string;
    contentType: ContentType;
    text: string;
    commentId?: string;
  };
  timestamp: string;
}

export interface OutboundResult {
  success: boolean;
  platformMessageId?: string;
  errorCode?: number;
  errorMessage?: string;
  isRetryable?: boolean;
}
