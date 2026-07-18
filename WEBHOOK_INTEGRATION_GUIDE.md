# 🔗 Webhook Integration Guide

**System:** Multi-Tenant Notification System  
**Version:** 1.0  
**Last Updated:** April 2026

---

## What is a Webhook?

A **webhook** is an automated message that your system sends to an external website or application whenever a specific event occurs. Think of it like a phone call — instead of the other website repeatedly asking *"Did something happen?"*, your system **calls them immediately** when it does.

```
Your System  ──────[ Event Fired ]──────▶  HTTP POST  ──────▶  External Website
                 (e.g. Order Placed)          (JSON)         (e.g. Slack, Shopify, CRM)
```

---

## How It Works in This System

### Step-by-Step Flow

```
1. Admin registers a Webhook Endpoint in the UI
   (URL, HTTP Method, Secret, Template ID)
        │
        ▼
2. An event is triggered in the system
   (e.g., a notification is sent for templateId = "order_placed")
        │
        ▼
3. The WebhookChannel looks up all active endpoints
   that match this tenant + templateId
        │
        ▼
4. The system POSTs a JSON payload to each matching endpoint URL
        │
        ▼
5. The external website receives the payload and acts on it
   (e.g., create a task in Trello, send a Slack alert, update a CRM)
```

---

## Setting Up a Webhook Endpoint

### In the Admin UI

Navigate to **Website Integration → Webhook Config → Add Endpoint**.

| Field                   | Description                                                                 | Example                              |
|-------------------------|-----------------------------------------------------------------------------|--------------------------------------|
| **Friendly Name**       | A human-readable label for this webhook                                      | `Slack Order Alert`                  |
| **HTTP Method**         | The HTTP verb your external server expects                                   | `POST` (most common)                 |
| **Target URL**          | The full URL where the POST request will be sent                             | `https://hooks.slack.com/services/…` |
| **Signing Secret**      | An optional secret used to verify that the request came from your system     | `mySecretKey123`                     |
| **Associated Template** | Only fire this webhook for a specific notification template ID               | `order_placed`                       |
| **Custom Headers**      | Additional HTTP headers to include in the request (JSON format)             | `{"X-Api-Key": "abc123"}`            |
| **Active**              | Toggle to enable/disable this endpoint without deleting it                  | ✅ Enabled                            |

---

## The JSON Payload

When a webhook fires, your system sends a `POST` request with a JSON body to the target URL. Here is a typical example:

```json
{
  "tenantId": 5,
  "recipient": "customer@example.com",
  "subject": "Your Order Has Been Placed",
  "body": "Hello Sajid, your order #1042 has been confirmed.",
  "templateId": "order_placed",
  "referenceType": "ORDER",
  "referenceId": 1042,
  "metadata": {
    "orderId": "1042",
    "customerName": "Sajid Ali"
  }
}
```

---

## Verifying Webhook Authenticity (Signing Secret)

To prevent fake requests from malicious third parties, you can use a **Signing Secret**. When configured, your system includes an `X-Webhook-Signature` header in each request.

### How to Verify on Your External Server

```javascript
// Node.js / Express Example
const crypto = require('crypto');

app.post('/my-webhook', (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const secret = 'mySecretKey123'; // Same secret set in the UI

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // ✅ Request is verified — process it!
    console.log('Webhook received:', req.body);
    res.status(200).send('OK');
});
```

```python
# Python / Flask Example
import hmac
import hashlib
import json
from flask import Flask, request, abort

app = Flask(__name__)

@app.route('/my-webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = b'mySecretKey123'
    
    body = json.dumps(request.get_json(), separators=(',', ':'))
    expected = hmac.new(secret, body.encode(), hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(signature, expected):
        abort(401)
    
    # ✅ Process the event
    data = request.get_json()
    print(f"Event received: {data['templateId']} for {data['recipient']}")
    return 'OK', 200
```

---

## Common Integration Examples

### 1. 🔔 Slack Notification
Trigger a Slack message when a new order is placed.

**Target URL:** `https://hooks.slack.com/services/T00/B00/XXXX`  
**HTTP Method:** `POST`  
**Template ID:** `order_placed`  
**Custom Headers:** *(none required)*

Your Slack webhook receives the payload, and you can use a Slack **Incoming Webhooks** app to format it into a channel message.

---

### 2. 📋 Trello Card Creation
Automatically create a Trello card when a support ticket arrives.

**Target URL:** `https://api.trello.com/1/cards?key=XXX&token=YYY&idList=ZZZ`  
**HTTP Method:** `POST`  
**Template ID:** `support_ticket`  
**Custom Headers:**
```json
{ "Content-Type": "application/json" }
```

---

### 3. 🛒 Shopify / E-Commerce Sync
Notify your fulfilment centre whenever an order is confirmed.

**Target URL:** `https://your-fulfilment-system.com/api/orders/incoming`  
**HTTP Method:** `POST`  
**Signing Secret:** `fulfil_secret_2025`  
**Template ID:** `order_confirmed`

---

### 4. 📊 Google Sheets / Zapier / Make.com
Use **Zapier** or **Make.com** to forward webhook data to Google Sheets, HubSpot, or any 3,000+ apps.

1. Create a new Zap → Trigger: **Webhooks by Zapier → Catch Hook**
2. Copy the generated Zapier URL
3. Paste it as the **Target URL** in your Webhook Config

---

## Template ID Routing

The `Associated Template ID` field is powerful — it lets you send different webhooks for different events:

| Template ID         | Webhook Endpoint              | Use Case                           |
|---------------------|-------------------------------|------------------------------------|
| `order_placed`      | Slack #orders channel         | Notify the team of new orders      |
| `otp_email`         | *(none — skip webhook)*       | OTPs don't need external routing   |
| `low_stock_alert`   | Inventory management system   | Trigger restocking workflow         |
| `payment_failed`    | Finance team CRM webhook      | Log and escalate payment issues     |

> **Tip:** If no Template ID is set on an endpoint, it will fire for **all** notifications from that tenant.

---

## API Reference

### Endpoints

| Method   | URL                                  | Description                   | Auth Required        |
|----------|--------------------------------------|-------------------------------|----------------------|
| `GET`    | `/api/notification/webhooks`         | List all webhook endpoints    | Any authenticated user |
| `POST`   | `/api/notification/webhooks`         | Create or update an endpoint  | `SUPER_ADMIN` / `POS_ADMIN` |
| `DELETE` | `/api/notification/webhooks/{id}`    | Delete an endpoint            | `SUPER_ADMIN` / `POS_ADMIN` |

### Create/Update Endpoint — Request Body

```json
{
  "id": null,
  "name": "My Slack Hook",
  "url": "https://hooks.slack.com/services/...",
  "httpMethod": "POST",
  "secret": "optional-signing-secret",
  "templateId": "order_placed",
  "customHeaders": "{\"X-Source\": \"MyApp\"}",
  "active": true
}
```

---

## Troubleshooting

| Problem                            | Likely Cause                                      | Fix                                                                         |
|------------------------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| Webhook not firing                 | Endpoint marked as inactive                       | Enable the "Active" toggle in the UI                                        |
| Wrong endpoint receiving events    | `templateId` mismatch                             | Make sure the template ID on the endpoint matches the event's template ID   |
| External site returning `401`      | Signature verification failing                    | Ensure the signing secret matches and body is not modified before hashing   |
| External site returning `404`      | Wrong target URL                                  | Double-check the URL in the Webhook Config                                  |
| Delivery Logs showing no entries   | WebhookChannel logging not yet persisted          | Check server logs for `"Dispatching WEBHOOKS"` entries                      |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Your Backend (Spring Boot)                  │
│                                                                │
│   NotificationService                                          │
│        │                                                        │
│        ├──▶ EmailChannel    ──▶ SMTP Server                    │
│        ├──▶ SmsChannel      ──▶ SMS Gateway                    │
│        ├──▶ WhatsAppChannel ──▶ WhatsApp API                   │
│        └──▶ WebhookChannel  ──▶ External URLs (your endpoints) │
│                  │                                              │
│                  └── Reads from: notif_webhook_endpoints table │
└──────────────────────────────────────────────────────────────┘
                                │
                        HTTP POST (JSON)
                                │
                ┌───────────────▼──────────────────┐
                │         External Website           │
                │  (Slack / Zapier / Your CRM / etc) │
                └───────────────────────────────────┘
```

---

*This guide was generated for the Multi-Tenant Notification System. For support, refer to the project's main README or contact the development team.*
