# 10. API Reference & Internal Interface Contracts

## 1. Overview & Base Conventions

All internal endpoints follow RESTful conventions and JSON payload standards. When deployed on Next.js, these are implemented via Route Handlers (`app/api/**/route.ts`) and Server Actions.

- **Base URL:** `${NEXT_PUBLIC_APP_URL}/api` (e.g., `https://<your-app-name>.vercel.app/api` in production, or `http://localhost:3000/api` locally)
- **Content-Type:** `application/json`
- **Authentication:** Bearer JWT session token for Admin endpoints; `X-Hub-Signature-256` HMAC for Meta webhooks.

---

## 2. Webhook Ingestion API

### `GET /api/webhooks/meta`
> **Purpose:** Meta Webhook Subscription Verification (Hub Challenge).

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `hub.mode` | `string` | Yes | Always `"subscribe"` |
| `hub.verify_token` | `string` | Yes | Secret configured in XINVORA & Meta App settings |
| `hub.challenge` | `string` | Yes | Numeric string echoed back to Meta |

**Response:**
- `HTTP 200 OK`: Returns the raw `hub.challenge` integer string.
- `HTTP 403 Forbidden`: If `hub.verify_token` does not match environment configuration.

---

### `POST /api/webhooks/meta`
> **Purpose:** Ingests live comments, direct messages, and engagement events from Instagram & Facebook.

**Headers:**
- `X-Hub-Signature-256`: `sha256={hmac_sha256_hex_hash}`

**Sample Inbound Comment Payload:**
```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "17841400000000000",
      "time": 1772098800,
      "changes": [
        {
          "field": "comments",
          "value": {
            "id": "179238491823901",
            "text": "LINK please kati ho price?",
            "from": {
              "id": "17841400238491",
              "username": "anita_shrestha"
            },
            "media": {
              "id": "17999888777666",
              "media_product_type": "REELS"
            }
          }
        }
      ]
    }
  ]
}
```

**Responses:**
- `HTTP 200 OK`: `{"status": "RECEIVED", "idempotency_key": "sha256_hash"}`
- `HTTP 401 Unauthorized`: Invalid or missing signature.

---

## 3. Product Catalog APIs

### `GET /api/products`
> **Purpose:** List products with pagination, category filter, and keyword search.

**Query Parameters:**
- `page` (default: 1), `limit` (default: 20), `search` (query string), `status` (`ACTIVE`/`ARCHIVED`).

**Response `HTTP 200 OK`:**
```json
{
  "data": [
    {
      "id": "c1f7b8e2-4d2a-4f51-b841-8319f046e01a",
      "productCode": "DRESS-001",
      "title": "Black Velvet Party Dress",
      "category": "Dresses",
      "price": 3499.00,
      "currency": "NPR",
      "productUrl": "https://your-store.com/products/black-velvet-dress",
      "imageUrl": "https://your-store.com/cdn/dress-001.jpg",
      "availableSizes": ["S", "M", "L"],
      "keywords": ["black dress", "party dress", "velvet", "cocktail"],
      "inventoryStatus": "IN_STOCK",
      "isActive": true
    }
  ],
  "pagination": { "total": 48, "page": 1, "totalPages": 3 }
}
```

### `POST /api/products`
> **Purpose:** Create a new product SKU in the catalog.

**Request Body:**
```json
{
  "productCode": "TEE-003",
  "title": "Graphic Oversized Crop Tee",
  "category": "Tees",
  "price": 1850.00,
  "currency": "NPR",
  "productUrl": "https://your-store.com/products/crop-tee-03",
  "imageUrl": "https://your-store.com/cdn/tee-03.jpg",
  "availableSizes": ["XS", "S", "M", "L"],
  "keywords": ["tee", "crop", "oversized", "graphic"],
  "inventoryStatus": "IN_STOCK"
}
```

---

## 4. Content-to-Product Mapping APIs

### `POST /api/content-mapping`
> **Purpose:** Bind an Instagram Reel or Facebook Post to a product.

**Request Body:**
```json
{
  "contentPlatformId": "17999888777666",
  "contentType": "REEL",
  "channelId": "ch_instagram_01",
  "productId": "c1f7b8e2-4d2a-4f51-b841-8319f046e01a",
  "isPrimary": true
}
```

---

## 5. Automation Rules APIs

### `GET /api/automations`
> **Purpose:** Retrieve all configured automation triggers and attached response pools.

### `POST /api/automations`
> **Purpose:** Create or update an automation rule.

**Request Body:**
```json
{
  "name": "Global Reel Comment Product Link",
  "isGlobal": true,
  "triggerType": "COMMENT",
  "conditions": {
    "intentTypes": ["PRODUCT_INQUIRY"],
    "keywords": ["link", "price", "kati", "buy", "details"]
  },
  "actions": [
    {
      "type": "PUBLIC_REPLY",
      "responsePoolId": "pool_general_comments_01"
    },
    {
      "type": "PRIVATE_PRODUCT_REPLY",
      "ctaButtonText": "VIEW PRICE",
      "includeSizeGuide": false
    }
  ]
}
```

---

## 6. Inbox & Human Handoff APIs

### `GET /api/inbox/conversations`
> **Purpose:** List conversations filtered by state (`NEEDS_ATTENTION`, `AUTOMATED`, `ALL`).

### `POST /api/inbox/conversations/:id/handoff`
> **Purpose:** Toggle between automated bot handling and human agent control.

**Request Body:**
```json
{
  "status": "HUMAN_HANDLED",
  "agentNotes": "Customer requested red color variation"
}
```

### `POST /api/inbox/conversations/:id/send`
> **Purpose:** Dispatch a manual agent message via the official Meta Messaging API.

**Request Body:**
```json
{
  "text": "Hi Anita! We also have this dress in Crimson Red here: https://your-store.com/products/red-velvet-dress"
}
```

---

## 7. Dry-Run Simulator API

### `POST /api/simulator/execute`
> **Purpose:** Simulate an end-to-end inbound event and view the resulting execution plan without calling Meta APIs.

**Request Body:**
```json
{
  "channel": "instagram",
  "simulatedComment": "link please kati parcha?",
  "contentId": "17999888777666"
}
```

**Response `HTTP 200 OK`:**
```json
{
  "matchedIntent": "PRODUCT_INQUIRY",
  "confidence": 0.94,
  "resolvedProduct": {
    "code": "DRESS-001",
    "title": "Black Velvet Party Dress",
    "price": 3499.00
  },
  "complianceCheck": {
    "status": "PASSED",
    "ruleEvaluated": "INSTAGRAM_PRIVATE_REPLY_7_DAY_WINDOW",
    "details": "Simulated interaction within 7 days. Single message constraint met."
  },
  "selectedPublicReply": "Details sent to your inbox! ✨",
  "renderedPrivateCard": {
    "title": "Black Velvet Party Dress",
    "subtitle": "NPR 3,499 | Sizes: S, M, L",
    "cta": "VIEW PRICE",
    "url": "https://your-store.com/products/black-velvet-dress?utm_source=instagram&utm_medium=auto_dm"
  }
}
```
