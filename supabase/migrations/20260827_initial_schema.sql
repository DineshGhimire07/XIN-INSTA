-- XINVORA Social Commerce Automation Initial Database Migration
-- PostgreSQL DDL for Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Accounts & Channels
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'SUSPENDED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('INSTAGRAM', 'FACEBOOK')),
    platform_account_id VARCHAR(100) NOT NULL,
    platform_username VARCHAR(100),
    encrypted_access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'CONNECTED' CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_type, platform_account_id)
);

-- 2. Products & Content Items
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NPR',
    product_url TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    available_sizes TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    inventory_status VARCHAR(20) DEFAULT 'IN_STOCK' CHECK (inventory_status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, product_code)
);

CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    platform_content_id VARCHAR(100) NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('POST', 'REEL', 'STORY', 'LIVE')),
    permalink TEXT,
    caption TEXT,
    media_url TEXT,
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, platform_content_id)
);

CREATE TABLE IF NOT EXISTS content_product_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_item_id, product_id)
);

-- 3. Automations & Response Pools
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('COMMENT', 'DM', 'STORY_MENTION')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'DRAFT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS response_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    responses TEXT[] NOT NULL,
    selection_strategy VARCHAR(30) DEFAULT 'RANDOM_AVOID_REPEAT',
    last_chosen_index INT DEFAULT -1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contacts & Conversations (CRM)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    platform_user_id VARCHAR(100) NOT NULL,
    username VARCHAR(100),
    full_name VARCHAR(150),
    tags TEXT[] DEFAULT '{}',
    is_opted_out BOOLEAN DEFAULT FALSE,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, platform_user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'AUTOMATED' CHECK (status IN ('AUTOMATED', 'NEEDS_ATTENTION', 'HUMAN_HANDLED', 'CLOSED')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    active_product_id UUID REFERENCES products(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('USER', 'BOT', 'HUMAN_AGENT')),
    message_type VARCHAR(30) NOT NULL CHECK (message_type IN ('PRIVATE_REPLY', 'DIRECT_MESSAGE', 'PUBLIC_COMMENT')),
    text TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outbound Queue & Compliance Decisions
CREATE TABLE IF NOT EXISTS message_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    recipient_id VARCHAR(100) NOT NULL,
    job_type VARCHAR(30) NOT NULL CHECK (job_type IN ('COMMENT_PRIVATE_REPLY', 'PUBLIC_REPLY', 'DM_SEND')),
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'BLOCKED')),
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_log TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_job_id UUID REFERENCES message_jobs(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    recipient_id VARCHAR(100) NOT NULL,
    evaluation_result VARCHAR(20) NOT NULL CHECK (evaluation_result IN ('APPROVED', 'REJECTED', 'THROTTLED')),
    reason VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_jobs_status_scheduled ON message_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_contacts_lookup ON contacts(channel_id, platform_user_id);
CREATE INDEX IF NOT EXISTS idx_content_lookup ON content_items(channel_id, platform_content_id);
