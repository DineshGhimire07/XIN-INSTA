# XINVORA Social Commerce Automation Platform
## Product Specification, Architecture, Feature Plan, Meta Compliance & Anti-Ban Requirements

**Project:** XINVORA  
**Document type:** Product + technical specification  
**Status:** Pre-development planning  
**Primary channels:** Instagram Professional Account + Facebook Page  
**Primary goal:** Build a first-party XINVORA social-commerce automation system using official Meta APIs.

---

# 1. Executive Summary

XINVORA will have its own social-commerce automation platform instead of depending on ManyChat or another third-party automation SaaS.

The platform will connect:

- XINVORA Instagram Professional account
- XINVORA Facebook Page
- XINVORA product catalog
- Instagram/Facebook comments and conversations
- Automation rules
- Customer/contact records
- Campaigns
- Analytics

The central idea is:

**Content → Comment/Interaction → Product → Automated Response → Product Page → Conversation → Customer**

The platform is not intended to imitate human activity through browser bots. It will use Meta's official APIs, webhooks, authentication and messaging capabilities.

The system will have **no artificial ManyChat-style contact quota imposed by our application**, but it will always respect Meta's own API rate limits, messaging windows, permissions, policies and feature eligibility.

---

# 2. Core Business Objective

The system should help XINVORA turn Instagram and Facebook engagement into product discovery and sales.

Primary example:

1. XINVORA publishes a Reel showing a dress.
2. Someone comments `LINK`.
3. The system receives the comment through Meta's webhook.
4. The system identifies the product associated with the Reel.
5. It sends a private reply containing the product information.
6. The message contains a product button such as `VIEW PRICE`.
7. The button opens the XINVORA product page.
8. The system records the interaction.
9. If the person later interacts in a way that makes further messaging permissible, the automation can continue the conversation.
10. Eligible marketing campaigns can later communicate new collections, new dresses, restocks and other XINVORA updates using Meta-supported mechanisms.

---

# 3. Product Philosophy

This should NOT be built as a random chatbot.

The core object is the **product**.

The system should understand:

- what content is being discussed,
- which product is associated with that content,
- what the user is asking,
- what response is appropriate,
- whether the person can legally/technically be messaged,
- and what happened afterward.

The conceptual model is:

**Content → Product → Intent → Customer → Conversation → Conversion**

---

# 4. Platforms

## 4.1 Instagram

The system should support, where the relevant Meta API capability and account eligibility allow it:

- Instagram Posts
- Instagram Reels
- Instagram Stories
- Instagram Live interactions
- Comments
- Private replies
- Instagram messaging
- Story interactions
- Mentions where supported
- Follow-related messaging features where Meta makes them available
- Marketing messaging features where the account and recipient are eligible

Meta's current Instagram Messaging API documentation is specifically designed for Instagram Professional accounts. Meta documents private replies to Instagram commenters, including a one-message limit for the private reply and a seven-day window from the comment for that private reply.

## 4.2 Facebook

The system should support:

- XINVORA Facebook Page
- Page posts
- Page comments
- Private replies
- Messenger conversations
- Messenger automation
- Marketing messaging where eligible
- Page-related webhook events

Facebook and Instagram should share the same internal automation engine while remaining separate channel adapters at the API layer.

---

# 5. Account Architecture

The user should connect:

```text
Meta Account
    |
    +-- Instagram Professional Account
    |
    +-- XINVORA Facebook Page
```

The application should use Meta authentication and tokens.

The application must NEVER request or store:

- Instagram password
- Facebook password

The application should store only the necessary OAuth/access tokens and related identifiers securely.

---

# 6. Single Brain, Multiple Channels

The internal architecture should be:

```text
                    XINVORA AUTOMATION ENGINE
                              |
             +----------------+----------------+
             |                                 |
        Instagram                         Facebook
        Channel Adapter                  Channel Adapter
             |                                 |
       Instagram API                    Page/Messenger API
```

The automation rules, product database, contact model and analytics remain shared.

A single rule can therefore conceptually mean:

> When someone comments LINK on XINVORA content, send the appropriate product response.

The channel adapter decides whether the delivery is an Instagram private reply or a Facebook Messenger private reply.

---

# 7. Product Database

Products are first-class objects.

Each product should have:

- Product ID
- Product name
- Category
- Price
- Currency
- Sizes
- Description
- Product URL
- Image URL
- Status
- Keywords
- Optional inventory status
- Optional SKU
- Optional associated collection
- Created date
- Updated date

Example:

```text
Product:
Black Party Dress

Product ID:
DRESS-001

Price:
Rs. XXXX

URL:
https://xinvora.com/...

Keywords:
dress, black dress, party dress
```

Automations should reference the product ID rather than hard-code URLs.

This allows the product URL to be changed once without editing every automation.

---

# 8. Content-to-Product Mapping

Each eligible XINVORA content item can be associated with a product.

Example:

```text
Instagram Reel #42
        |
        +-- Product: Black Party Dress

Instagram Reel #43
        |
        +-- Product: Crop Tee #03

Facebook Post #12
        |
        +-- Product: Black Party Dress
```

The system should support:

- explicit product mapping,
- collection mapping,
- optional manual override,
- optional future AI-assisted product detection.

Explicit mapping should be the reliable default.

---

# 9. Global Automation

The user should not need to manually create an automation for every Reel.

The system should support global rules.

Example:

```text
ANY eligible XINVORA content
        |
        +-- Comment contains product intent
                    |
                    +-- Identify product
                    |
                    +-- Send appropriate response
```

Content-specific mappings override global defaults when necessary.

---

# 10. Comment-to-DM Workflow

## Basic workflow

```text
User comments LINK
        |
        v
Meta webhook
        |
        v
Event processor
        |
        v
Duplicate check
        |
        v
Intent/keyword detection
        |
        v
Product identification
        |
        v
Eligibility/compliance check
        |
        v
Private reply
```

Example private message:

> Here's the dress you asked about.

Button:

**VIEW PRICE**

The button should point to the associated XINVORA product URL.

---

# 11. Keyword and Intent System

The system should not require exact matching.

Example keyword pool:

- link
- price
- buy
- shop
- details
- where
- cost
- how much
- send me
- interested

These can map to a common intent:

`PRODUCT_REQUEST`

Later, natural-language intent classification can recognize:

- "How much is this?"
- "Can you send the link?"
- "Where can I buy this?"
- "I want this one."

AI should be an optional intelligence layer, not the foundation of the first release.

---

# 12. Response Types

The automation engine should support different response intents.

## Product request

> Here's the dress you asked about.

**VIEW PRICE**

## Collection request

> Here's our latest XINVORA collection.

**VIEW COLLECTION**

## Size question

> Here are the available sizes.

**VIEW SIZES**

## Availability

> This product is currently available.

**SHOP NOW**

## Human-support request

Stop automated replies and flag the conversation for manual handling.

---

# 13. Public Reply + Private Reply

Public comments and private messages should be separate automation actions.

Example:

```text
Trigger:
Comment contains LINK

Action 1:
Public reply

Action 2:
Private reply
```

Public:

> Sent you the details.

Private:

> Here's the dress you asked about.

**VIEW PRICE**

This modular structure is important for future workflows.

---

# 14. Randomized Public Response Pools

The system should support multiple saved public replies.

Example pool:

1. `Check your DM!`
2. `Sent it to your inbox.`
3. `Just sent you the details.`
4. `Check your messages.`
5. `It's in your DMs now.`

The automation selects one response.

Future options:

- weighted randomness,
- prevent immediate repetition,
- separate pools per automation,
- separate pools per platform,
- separate pools for product/collection campaigns.

This makes public responses less repetitive.

---

# 15. Automation Engine

The core engine should be based on:

**Trigger → Condition → Action → Wait → Branch → Action**

## Triggers

Potential triggers include:

- Instagram comment
- Facebook Page comment
- Instagram DM
- Story interaction where supported
- Story mention where supported
- Live comment where supported
- New follower features where Meta makes them available
- User response
- Campaign trigger

## Conditions

- Keyword
- Intent
- Product
- Content
- Platform
- Contact tag
- Previous interaction
- Time
- Conversation state
- Meta messaging eligibility
- Campaign eligibility

## Actions

- Public reply
- Private reply
- Send message
- Send product
- Send collection
- Button
- Quick reply
- Wait
- Branch
- Add tag
- Remove tag
- Assign to human
- Stop automation
- Log event

---

# 16. Wait and Follow-up System

The user wants workflows such as:

```text
Product message
    |
    v
Wait 5 minutes
    |
    v
Check eligibility
    |
    +-- allowed --> send follow-up
    |
    +-- not allowed --> stop/log
```

The system MUST NOT blindly send a second message simply because five minutes have elapsed.

Meta's messaging policies determine whether a follow-up is allowed.

For Instagram private replies to comments, Meta documents that only one private reply can be sent to the commenter for the comment-triggered private-reply feature. Further conversation requires a qualifying interaction/messaging context and must comply with the applicable messaging window.

Therefore, the scheduler must always run a compliance/eligibility check before sending.

---

# 17. Marketing Campaign Engine

Email marketing is intentionally excluded.

Marketing is focused on Instagram/Facebook.

Example campaigns:

## New Collection

> New XINVORA collection is here.

**VIEW COLLECTION**

## New Dress

> A new dress just arrived.

**VIEW DRESS**

## Restock

> Your favorite is back.

**SHOP NOW**

Each campaign should contain:

- Campaign name
- Channel
- Audience definition
- Message
- Button
- Product/collection
- Schedule
- Status
- Analytics
- Eligibility requirements

The system should send only through Meta-supported messaging mechanisms.

---

# 18. Audience Strategy

Do NOT design the application around:

> DM every Instagram follower whenever we want.

That is not the correct API model.

Instead, maintain separate audience concepts:

- Followers
- People who commented
- People who messaged
- People who interacted with a product
- People who interacted with a campaign
- People who joined a supported broadcast mechanism
- People eligible for a Meta-supported marketing message
- Customers
- Contacts requiring human attention

A person's presence in the database does not automatically mean the person is eligible for any arbitrary promotional DM.

---

# 19. Contact/CRM Layer

A contact record can contain:

- Platform
- Platform user ID
- Username where available
- Interaction history
- Products of interest
- Tags
- Conversation status
- Last interaction
- Campaign interactions
- Click events
- Customer status

Example:

```text
Contact: @example

Platform:
Instagram

Interactions:
- Commented Reel #42
- Requested Product #07
- Clicked Product #07
- Sent DM

Tags:
PRODUCT_INTEREST
DRESS_INTEREST

Status:
Active conversation
```

Only store information that is necessary for the application's legitimate purpose and that Meta's terms/API permit us to retain.

---

# 20. Human Handoff

The system must be able to stop automation when a human should take over.

Examples:

- Customer asks for a custom color.
- Customer has a delivery issue.
- Customer asks an unusual question.
- Customer appears confused.
- Automated intent confidence is low.

Workflow:

```text
User message
    |
    v
Intent detection
    |
    +-- normal automation --> continue
    |
    +-- support/uncertain --> pause automation
                              |
                              v
                         Needs attention
```

---

# 21. Conversations Inbox

Dashboard should eventually show:

- Instagram conversations
- Facebook Messenger conversations
- Automated messages
- Customer messages
- Product association
- Tags
- Status
- Human takeover
- Automation state

Example:

```text
@customer1
Black Party Dress
Needs attention

@customer2
Crop Tee
Automation active

@customer3
Collection
Human handled
```

---

# 22. Analytics

The platform should measure the entire social-commerce funnel.

```text
Content
  |
  v
Comments
  |
  v
Automation triggers
  |
  v
Private replies
  |
  v
Button clicks
  |
  v
Product page
  |
  v
Purchase
```

Metrics:

- Comments
- Triggered automations
- Private replies sent
- Failed messages
- Button clicks
- Product interest
- Conversations
- Campaign performance
- Human handoffs
- Conversions when website purchase data is integrated

The important question is not merely:

> How many DMs did we send?

It is:

> Which content generated useful product interest and sales?

---

# 23. Event System

Meta webhooks should be the primary event mechanism rather than constantly polling APIs.

Core event model:

```text
Meta event
    |
    v
Webhook endpoint
    |
    v
Validate event
    |
    v
Create internal event
    |
    v
Queue
    |
    v
Automation engine
```

Each event should contain enough information to:

- identify platform,
- identify account/page,
- identify content,
- identify comment/message,
- identify user,
- identify timestamp,
- prevent duplicates.

---

# 24. Duplicate Protection

Every event must have an idempotency strategy.

Example:

```text
event_id
comment_id
automation_id
```

Before processing:

```text
Already processed?
    |
    +-- YES --> ignore
    |
    +-- NO --> process
```

This prevents duplicate DMs if Meta retries or sends duplicate webhook events.

---

# 25. Queue and Retry System

Outgoing operations should pass through a queue.

```text
Incoming event
      |
      v
Automation engine
      |
      v
Message queue
      |
      v
Compliance check
      |
      v
Meta API
```

Failures:

```text
API failure
    |
    v
Retry with backoff
    |
    +-- success --> completed
    |
    +-- repeated failure --> failed/logged
```

Do not retry indefinitely.

Permanent errors should stop and be logged.

---

# 26. Rate Limiting

Our system must include a rate controller.

Meta currently documents Messenger Platform rate limits. Current Meta documentation indicates that message-related API calls have platform-specific limits, including an Instagram Professional account limit for messaging API calls. Meta's current rate-limit documentation should be treated as the source of truth because these values can change.

The application should therefore:

- read current API responses,
- respect rate-limit headers/errors where available,
- queue messages,
- throttle bursts,
- retry only when appropriate,
- avoid unnecessary polling,
- never attempt to bypass limits.

We must NOT create fake accounts or multiple applications to evade limits.

---

# 27. "No Artificial Limit" Policy

The XINVORA application should not impose commercial SaaS limits such as:

- 25 contacts/month
- 500 DMs/month
- 1,000 contacts/month
- 2,000 contacts/month

The application should be designed for the actual usage XINVORA needs.

However:

**No artificial limit does NOT mean unlimited Meta messaging.**

Actual limits come from:

- Meta API rate limits
- account permissions
- messaging windows
- private-reply rules
- recipient eligibility
- marketing-message eligibility
- platform policy
- API availability
- Meta enforcement

The software must always obey these constraints.

---

# 28. Meta Anti-Ban / Compliance Requirements

There is no engineering method that can guarantee that an Instagram or Facebook account can never be restricted.

The correct goal is:

**Minimize risk by using official Meta APIs and obeying Meta's policies.**

## Mandatory rules

### Rule 1: Official APIs only

Use:

- Meta OAuth
- Instagram Messaging API
- Instagram Graph/API capabilities
- Facebook Pages API
- Messenger Platform
- Meta Webhooks

Do NOT use:

- Instagram password login bots
- Browser automation to imitate humans
- Private/undocumented endpoints
- Scraping-based DM automation
- Cookie/session hijacking
- Fake client requests
- API-limit bypasses

### Rule 2: Respect messaging eligibility

Before every automated outbound message:

```text
Is this message allowed for this user,
platform, trigger and time?
```

If not:

**Do not send.**

### Rule 3: Respect message windows

The system must understand the applicable messaging window for the channel and message type.

For example, Meta's Messenger Platform and Instagram messaging policy documents a 24-hour response window for standard messaging contexts.

Instagram comment private replies have their own specific rule: Meta documents one private reply to the commenter and a seven-day period from the comment in which that private reply can be sent.

These rules are different from one another and must not be treated as one universal "DM rule."

### Rule 4: Do not spam

Avoid:

- repeated unwanted messages,
- irrelevant campaigns,
- excessive frequency,
- deceptive messages,
- misleading buttons,
- fake urgency,
- repetitive mass comments,
- unwanted follow-ups.

### Rule 5: Respect opt-outs and blocks

If a user blocks, opts out, or otherwise becomes ineligible:

- stop marketing automation for them where required,
- record the state,
- do not attempt to circumvent it.

### Rule 6: Do not bypass restrictions

Never respond to an API restriction by:

- rotating tokens,
- creating fake accounts,
- creating duplicate apps to evade limits,
- changing IP addresses to evade enforcement,
- using unofficial endpoints.

### Rule 7: Keep content legitimate

Messages should be relevant to the user's interaction.

Good:

> Here's the dress you commented about.

Bad:

> BUY OUR NEW PRODUCTS NOW!!! BUY BUY BUY!!!

The first is useful commerce automation. The second is how you make people hate your brand and potentially attract platform enforcement.

---

# 29. Private Reply Safety Rules

For Instagram:

A comment-triggered private reply should be treated as a specific API capability with its own restrictions.

Meta currently documents:

- one private reply to the commenter for this feature,
- the private reply must be sent within seven days of the comment,
- additional messaging is governed by the normal messaging rules and qualifying interactions.

Therefore our workflow engine should distinguish:

`COMMENT_PRIVATE_REPLY`

from:

`NORMAL_CONVERSATION_MESSAGE`

from:

`MARKETING_MESSAGE`

They must NOT all use the same unrestricted sender.

For Facebook, private replies to Page commenters are similarly a specific Meta-supported capability with its own rules.

---

# 30. Compliance Engine

Every outbound message should pass through a central compliance service.

Conceptually:

```text
Automation wants to send
          |
          v
     COMPLIANCE ENGINE
          |
    +-----+------+------+
    |            |      |
 Platform     Trigger  Time
    |            |      |
    +-----+------+------+
          |
          v
Eligibility?
    |
    +-- YES --> send
    |
    +-- NO --> block + log
```

The log should record:

- attempted message,
- platform,
- recipient,
- trigger,
- automation,
- reason allowed/blocked,
- timestamp,
- API result.

This gives us an audit trail.

---

# 31. Meta Policy Monitoring

Meta changes API capabilities and restrictions.

Therefore the project should have a documented process:

1. Check official Meta developer documentation before implementing new messaging functionality.
2. Record the relevant API capability.
3. Record permissions required.
4. Record messaging restrictions.
5. Record rate limits.
6. Implement the restriction in the compliance engine.
7. Re-check documentation when Meta changes versions or announces a relevant update.

Do not rely on old third-party tutorials as the final authority.

---

# 32. Security Architecture

Never expose:

- App secret
- Access tokens
- Refresh credentials
- Database service keys

to the browser.

Use server-side environment variables/secret storage.

Database security should use proper authorization.

Webhook endpoints should verify Meta's webhook signatures/verification requirements.

All outgoing Meta requests should originate from trusted server-side code.

---

# 33. Test Mode

Before activating an automation:

```text
AUTOMATION TEST

Trigger:
LINK

Product:
Black Party Dress

Public reply:
Random response pool

Private message:
Here's the dress you asked about.

Button:
VIEW PRICE

[TEST]
```

Test mode should verify:

- product lookup,
- URL,
- message rendering,
- button,
- random reply selection,
- compliance decision,
- logging.

Only then activate.

---

# 34. Automation Templates

Initial templates:

## Product Link

```text
Trigger:
Comment contains product request

Actions:
1. Identify product
2. Public random reply
3. Private product message
4. Product button
5. Log interaction
```

## Collection

```text
Trigger:
Collection keyword

Actions:
1. Public response
2. Private collection message
3. Collection button
```

## Restock

```text
Trigger:
Eligible campaign/contact

Actions:
1. Eligibility check
2. Restock message
3. Product button
4. Analytics
```

---

# 35. Visual Workflow Builder

A future builder should represent:

```text
[COMMENT]
    |
    v
[KEYWORD?]
    |
    +-- LINK --> [PRODUCT LOOKUP]
                    |
                    v
              [PRIVATE REPLY]
                    |
                    v
                [BUTTON]
                    |
                    v
                 [WAIT]
                    |
                    v
             [ELIGIBILITY?]
                /       \
              YES        NO
               |          |
               v          v
          [FOLLOW-UP]   [END]
```

The first release can use structured forms instead of a full drag-and-drop editor.

The backend should nevertheless be designed so a visual editor can be added later.

---

# 36. AI Layer

AI should be added after deterministic automation is reliable.

Potential AI uses:

- intent classification,
- product identification,
- natural-language question classification,
- size question detection,
- support escalation,
- product recommendation,
- response drafting.

AI should NOT be allowed to bypass compliance.

The correct flow is:

```text
User message
    |
    v
AI classifies intent
    |
    v
Deterministic automation
    |
    v
Compliance engine
    |
    v
Meta API
```

Not:

```text
AI decides everything
    |
    v
send whatever it wants
```

---

# 37. Human Handoff

Automation should have a hard stop.

If:

- intent confidence is low,
- customer support is detected,
- customer explicitly requests a human,
- automation fails repeatedly,

then:

```text
Pause automation
    |
    v
Needs Attention
    |
    v
Human handles conversation
```

---

# 38. Analytics Architecture

Every important action becomes an event.

Examples:

- COMMENT_RECEIVED
- AUTOMATION_TRIGGERED
- PRODUCT_IDENTIFIED
- PUBLIC_REPLY_SENT
- PRIVATE_REPLY_SENT
- MESSAGE_FAILED
- BUTTON_CLICKED
- CONVERSATION_STARTED
- HUMAN_HANDOFF
- CAMPAIGN_SENT
- CAMPAIGN_BLOCKED

These events can later power analytics without redesigning the database.

---

# 39. Dashboard

## Main dashboard

Show:

- comments today,
- automation triggers,
- messages sent,
- messages blocked,
- link clicks,
- active conversations,
- needs attention,
- top products,
- top-performing content.

## Automations

- Active
- Paused
- Draft
- Trigger
- Conditions
- Actions
- Usage
- Errors

## Products

- Products
- Prices
- URLs
- Keywords
- Associated content

## Content

- Instagram Posts
- Instagram Reels
- Stories where available
- Facebook posts

## Conversations

- Instagram
- Facebook
- Human handoff
- Automation state

## Contacts

- Interaction history
- Tags
- Product interests

## Campaigns

- Draft
- Scheduled
- Running
- Completed
- Blocked

## Logs

- Webhook events
- Automation events
- API calls/results
- Compliance decisions
- Errors

---

# 40. First Major Release Scope

The first serious release should be useful, not a three-button demo.

## Account

- Meta OAuth
- Instagram connection
- Facebook Page connection
- Connection health

## Products

- Product CRUD
- Product URL
- Price
- Keywords
- Status
- Content mapping

## Content

- Instagram posts/Reels
- Facebook Page posts
- Product association

## Automation

- Global comment trigger
- Keyword matching
- Product mapping
- Public response
- Random response pool
- Private reply
- Product button
- Conditions
- Eligibility checks
- Duplicate protection

## Conversations

- Instagram
- Facebook
- Automated messages
- User messages
- Human handoff

## Contacts

- Platform
- Interaction history
- Product interests
- Tags
- Last interaction

## Campaigns

- New product
- New collection
- Restock
- Scheduling
- Eligibility

## Infrastructure

- Webhooks
- Queue
- Retry
- Rate handling
- Event logging
- Error handling

## Analytics

- Comments
- Triggers
- Messages
- Clicks
- Product interest
- Campaign performance

## Admin

- Automation ON/OFF
- Test mode
- Logs
- Settings

---

# 41. Features Intentionally Deferred

Do not build these into the first release unless needed:

- Email marketing
- Billing
- Subscription plans
- Public SaaS user registration
- Agency accounts
- White-labeling
- Full ERP/inventory system
- Large integration marketplace
- Complex ad-management automation
- Huge visual flow builder
- Multi-tenant architecture
- Advanced AI customer support

The architecture should leave room for them later.

---

# 42. Recommended Technology Stack

## Frontend

Next.js

## Backend

Next.js server-side API/server functions initially.

If processing volume grows, split into dedicated workers/services.

## Database

PostgreSQL through Supabase.

## Hosting

Vercel initially.

## Authentication

Meta OAuth for social account connection.

Application/admin authentication can use Supabase Auth or another secure mechanism.

## Messaging

Official Meta APIs.

## Events

Meta Webhooks.

## Queue

Start with a reliable database-backed queue or Supabase-supported queue pattern.

Introduce a dedicated queue system if volume requires it.

---

# 43. Suggested Database Entities

Core tables:

```text
accounts
channels
products
content_items
automations
automation_triggers
automation_conditions
automation_actions
response_pools
contacts
contact_tags
conversations
conversation_messages
events
campaigns
campaign_recipients
message_jobs
message_attempts
compliance_decisions
analytics_events
webhook_events
```

The exact schema should be finalized before implementation.

---

# 44. Important Architecture Rule

Never couple business logic directly to Instagram-specific API calls.

Instead:

```text
Automation Engine
       |
       v
Channel Interface
       |
   +---+---+
   |       |
Instagram Facebook
Adapter   Adapter
```

The automation engine should say:

`send_private_product_message()`

The Instagram adapter knows how to implement that through Meta's Instagram API.

The Facebook adapter knows how to implement the equivalent through Messenger/Page APIs.

This makes the system maintainable.

---

# 45. Error Handling

Every API operation should have:

- success state,
- retryable failure,
- permanent failure,
- compliance block,
- authentication error,
- rate-limit error,
- permission error.

Example:

```text
MESSAGE_JOB
    |
    +-- SUCCESS
    |
    +-- RATE_LIMITED -> queue/retry
    |
    +-- TEMPORARY_ERROR -> retry
    |
    +-- PERMISSION_ERROR -> stop + alert
    |
    +-- POLICY/ELIGIBILITY_BLOCK -> stop + log
```

---

# 46. Account Safety Philosophy

There is NO guarantee that an account can never be banned or restricted.

Even compliant API usage can encounter:

- Meta policy changes,
- account-level restrictions,
- content enforcement,
- unusual activity detection,
- permission changes,
- API changes,
- user reports,
- security events.

Therefore the goal is **risk minimization**, not a fake "100% ban-proof" promise.

The safest architecture is:

**Official API + normal business behavior + relevant messages + correct permissions + conservative rate handling + compliance checks + no circumvention.**

---

# 47. What We Will Never Implement

The application must never contain functionality intended to:

- bypass Meta API limits,
- evade Meta enforcement,
- scrape private user data,
- collect passwords,
- imitate browser users,
- use unofficial Instagram endpoints,
- mass-DM people without a valid Meta-supported basis,
- bypass messaging windows,
- create fake engagement,
- create fake accounts to increase messaging limits,
- rotate accounts/tokens to evade restrictions,
- spam users who have not interacted appropriately.

This is a hard architectural boundary.

---

# 48. Practical "Anti-Ban" Operating Limits

There is no single universal number we should call a "safe daily DM limit."

The correct limit depends on:

- Meta's current API limit,
- message type,
- platform,
- account eligibility,
- messaging context,
- recipient eligibility,
- API response headers/errors,
- Meta policy.

Therefore the application should NOT use a hard-coded fake number such as:

> "Never send more than 500 DMs/day and you're safe."

That would be misleading.

Instead, the system should use:

**Dynamic rate limiting + API feedback + eligibility checks + queueing.**

The current Meta documentation provides actual API rate-limit information, including messaging API limits, and these values can change. The official documentation must be checked before each major implementation/update.

---

# 49. Current Verified Meta Constraints

As of the current documentation checked for this specification:

## Instagram private replies

Meta documents that:

- private replies are supported for Instagram comments,
- only one private reply can be sent to the commenter through this feature,
- the private reply must be sent within seven days of the comment,
- Instagram Live has specific behavior,
- additional messaging is subject to the normal messaging rules.

Source:
Meta for Developers, Instagram Private Replies.

## Standard messaging

Meta's Messenger Platform/Instagram messaging policy documents a 24-hour response window for standard business responses.

Source:
Meta for Developers, Messenger Platform and IG Messaging API policy.

## Rate limits

Meta documents rate limits for Messenger Platform/Instagram messaging APIs.

The application must dynamically respect these limits rather than assuming an unlimited sender.

## Webhooks

Meta provides real-time notifications for messaging events, which should be used instead of excessive polling.

---

# 50. Product Marketing Strategy

The social automation system should support three main customer journeys.

## Journey A: Product discovery

```text
Reel
 ↓
Comment LINK
 ↓
Private product reply
 ↓
VIEW PRICE
 ↓
Website
```

## Journey B: Conversation

```text
Comment/DM
 ↓
Product response
 ↓
Customer responds
 ↓
Eligibility check
 ↓
Relevant follow-up
 ↓
Human handoff if needed
```

## Journey C: Marketing

```text
Eligible audience
 ↓
New collection campaign
 ↓
Meta-supported message/broadcast mechanism
 ↓
Collection page
 ↓
Analytics
```

No email system.

---

# 51. Randomized Response System

Response pools should be a reusable system.

Structure:

```text
Response Pool
    |
    +-- Pool Name
    +-- Channel
    +-- Automation
    +-- Responses[]
    +-- Selection Strategy
    +-- Enabled
```

Selection strategies:

- random,
- weighted random,
- round robin,
- avoid immediate repeat.

Initial implementation:

**random + avoid immediate repeat.**

---

# 52. Future AI Product Matching

Later, AI can assist with:

```text
Content
  |
  v
Caption/image/product context
  |
  v
Candidate products
  |
  v
Confidence score
  |
  +-- high confidence --> automatic mapping
  |
  +-- low confidence --> manual confirmation
```

Never automatically send a confidently wrong product link just because an AI model guessed.

---

# 53. Future Inventory Integration

Potential later integration:

```text
Product
  |
  +-- Price
  +-- Sizes
  +-- Stock
  +-- URL
```

Then automated answers can become inventory-aware.

This is intentionally later because incorrect stock information is worse than no automation.

---

# 54. Future Customer Support AI

Possible future categories:

- price
- size
- color
- availability
- shipping
- return policy
- order status
- product comparison

AI should retrieve authoritative XINVORA data rather than inventing answers.

---

# 55. Success Criteria

The first major release is successful when:

1. Instagram can be connected through Meta authentication.
2. Facebook Page can be connected.
3. Meta webhook events arrive reliably.
4. A real XINVORA Reel/Post comment can trigger an automation.
5. Product mapping works.
6. Private reply can be sent through the supported Meta API.
7. Public randomized reply works.
8. Product button opens the correct URL.
9. Duplicate events do not cause duplicate messages.
10. API errors are logged and retried correctly where appropriate.
11. Compliance checks can block an ineligible message.
12. Contact history is stored.
13. Conversations can be viewed.
14. Human handoff works.
15. Basic analytics work.
16. The system does not rely on browser automation or Instagram passwords.

---

# 56. Development Order

## Phase 0: Documentation

Finalize:

- product requirements,
- Meta capabilities,
- permissions,
- database,
- architecture,
- security,
- compliance.

## Phase 1: Meta connection

- Meta developer app
- OAuth
- Instagram
- Facebook Page
- token storage

## Phase 2: Webhooks

- webhook verification
- comment events
- messaging events
- event persistence

## Phase 3: Product engine

- product CRUD
- URLs
- keywords
- content mapping

## Phase 4: First automation

- comment trigger
- keyword detection
- product lookup
- private reply
- button

## Phase 5: Public response engine

- response pools
- random selection
- duplicate prevention

## Phase 6: Reliability

- queues
- retries
- rate limiting
- idempotency
- logging

## Phase 7: Dashboard

- products
- automations
- logs
- content
- settings

## Phase 8: CRM/conversations

- contacts
- conversations
- tags
- human handoff

## Phase 9: Campaigns

- collection campaigns
- product campaigns
- restocks
- eligibility
- scheduling

## Phase 10: Analytics

- events
- clicks
- conversion integration

## Phase 11: Advanced automation

- wait
- branches
- workflow templates
- visual builder

## Phase 12: AI

- intent
- product matching
- support classification
- recommendations

---

# 57. Final Product Definition

The final XINVORA platform should be:

> **A private, first-party social-commerce automation engine for XINVORA that connects Instagram and Facebook through official Meta APIs, maps content to products, automatically handles eligible customer interactions, sends product-specific responses, manages conversations and campaigns, tracks interactions and performance, and enforces Meta messaging/rate-limit rules before every outbound action.**

The most important engineering principle is:

> **Build the automation engine once. Build Instagram and Facebook as channel adapters. Make products first-class objects. Put Meta compliance between every automation and every outbound message.**

This gives XINVORA a real foundation rather than a fragile collection of scripts.

---

# 58. Official Sources to Re-check During Development

The official Meta documentation should be treated as the authoritative source because API rules and capabilities change.

- Instagram Messaging API overview
- Instagram Private Replies
- Instagram Send Message
- Messenger Platform and Instagram Messaging API policy
- Messenger Private Replies
- Messenger Platform rate limits
- Messenger Platform webhooks
- Facebook Pages API

Third-party tools such as ManyChat and HighLevel can be used for product-design inspiration, but their behavior should never override Meta's official documentation.

---

# 59. Final Non-Negotiable Rules

1. Official Meta APIs only.
2. No Instagram/Facebook passwords.
3. No unofficial endpoints.
4. No browser automation.
5. No scraping private information.
6. No API-limit bypass.
7. No fake accounts for limit evasion.
8. No arbitrary follower mass-DM system.
9. No message sent without an eligibility check.
10. Respect message windows.
11. Respect private-reply rules.
12. Respect rate limits.
13. Respect opt-outs/blocks.
14. Log compliance decisions.
15. Queue and retry safely.
16. Protect tokens and secrets.
17. Test automations before activation.
18. Keep marketing relevant to legitimate interactions/eligible audiences.
19. Re-check Meta documentation before adding new messaging capabilities.
20. Never claim the system is "ban-proof."

---

# 60. Final Direction

The objective is NOT to build the smallest possible MVP.

The objective is to build a **useful first release with the correct architecture**, containing the features that directly matter to XINVORA:

**Instagram + Facebook + Products + Comments + Private Replies + Random Public Replies + Conversations + Contacts + Campaigns + Analytics + Queue + Compliance.**

Advanced features such as AI, inventory intelligence and visual workflow editing can then be added without rebuilding the foundation.

The first coding milestone is:

**Connect XINVORA Instagram → receive a real comment webhook → identify a mapped product → pass the message through the compliance engine → send the correct private product reply → log everything.**

That single workflow proves the core architecture.
