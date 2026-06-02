# ezLegal.ai Edge Functions API Reference

> **Base URL**: `https://qwzpcswjlhxbsghbnkrn.supabase.co/functions/v1`
> **All functions include CORS support**

---

## Authentication

Most functions require a Bearer token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};
```

Functions marked "No Auth" can be called without authentication.

---

## 1. OpenAI Chat (`/openai-chat`)

**Auth Required**: No (but userId enhances functionality)

The main AI chatbot endpoint. Provides legal guidance with jurisdiction-aware responses, automatic document detection, and thinking details.

### Request

```http
POST /functions/v1/openai-chat
Content-Type: application/json
```

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are my tenant rights in Arizona?"
    }
  ],
  "sessionId": "unique-session-id",
  "userId": "optional-user-uuid",
  "jurisdiction": "Arizona",
  "category": "housing",
  "modelOverride": "chatgpt-4o",
  "maxTokens": 4096,
  "temperature": 0.7,
  "documentAttachments": []
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| messages | array | Yes | Array of chat messages |
| sessionId | string | Yes | Unique session identifier |
| userId | string | No | User UUID for authenticated users |
| jurisdiction | string | No | Legal jurisdiction (default: "Arizona") |
| category | string | No | Legal category for specialized prompts |
| modelOverride | string | No | Specific AI model to use |
| maxTokens | number | No | Max response tokens |
| temperature | number | No | Response creativity (0-1) |
| documentAttachments | array | No | Attached document images |

### Message Format

```json
{
  "role": "user" | "assistant" | "system",
  "content": "Message text"
}
```

### Document Attachment Format

```json
{
  "type": "image" | "pdf_page",
  "data": "base64-encoded-data",
  "mimeType": "image/png",
  "filename": "document.pdf",
  "pageNumber": 1
}
```

### Response

```json
{
  "response": "AI-generated legal response with citations...",
  "modelUsed": "chatgpt-4o",
  "modelDisplayName": "ChatGPT 4o",
  "usage": {
    "promptTokens": 1250,
    "completionTokens": 2340,
    "totalTokens": 3590
  },
  "jurisdiction": "Arizona",
  "responseTimeMs": 4523,
  "isDocumentRequest": false
}
```

### Response Features

The AI response includes:
- **Thinking Details Block**: Shows legal analysis reasoning
- **Hyperlinked Citations**: All statutes are clickable links
- **Follow-up Questions**: 3 contextual follow-up questions
- **Legal Disclaimer**: Standard disclaimer at the end

### Example Usage

```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/openai-chat`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'What are my tenant rights?' }],
      sessionId: crypto.randomUUID(),
      jurisdiction: 'Arizona',
    }),
  }
);

const data = await response.json();
console.log(data.response);
```

---

## 2. LegalBreeze RAG (`/legalbreeze-rag`)

**Auth Required**: Yes

Retrieval-Augmented Generation for legal research. Searches vector embeddings to find relevant legal sources.

### Request

```http
POST /functions/v1/legalbreeze-rag
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "query": "tenant rights eviction notice",
  "jurisdiction": "Arizona",
  "practiceArea": "housing",
  "maxResults": 5,
  "includeStatutes": true,
  "includeCaseLaw": true
}
```

### Response

```json
{
  "results": [
    {
      "sourceType": "statute",
      "sourceId": "ARS-33-1368",
      "title": "A.R.S. Section 33-1368",
      "content": "Statute text...",
      "relevanceScore": 0.92,
      "url": "https://www.azleg.gov/ars/33/01368.htm"
    }
  ],
  "query": "tenant rights eviction notice",
  "jurisdiction": "Arizona",
  "totalResults": 5
}
```

---

## 3. Outcome Prediction (`/outcome-prediction`)

**Auth Required**: Yes

AI-powered case outcome prediction based on case details.

### Request

```http
POST /functions/v1/outcome-prediction
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "caseType": "eviction",
  "jurisdiction": "Arizona",
  "facts": {
    "rentPaid": false,
    "monthsBehind": 2,
    "noticeServed": true,
    "noticeType": "5-day",
    "leaseViolation": false
  },
  "userRole": "tenant"
}
```

### Response

```json
{
  "prediction": {
    "likelyOutcome": "eviction_granted",
    "confidence": 0.78,
    "factors": [
      {
        "factor": "Rent non-payment",
        "impact": "negative",
        "weight": 0.4
      },
      {
        "factor": "Proper notice served",
        "impact": "negative",
        "weight": 0.3
      }
    ],
    "recommendations": [
      "Negotiate payment plan with landlord",
      "Seek rental assistance programs",
      "Respond to eviction complaint within 5 days"
    ]
  },
  "disclaimer": "This prediction is for informational purposes only..."
}
```

---

## 4. Grant Report (`/grant-report`)

**Auth Required**: Yes

Generate compliance reports for Legal Services Organizations.

### Request

```http
POST /functions/v1/grant-report
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "organizationId": "org-uuid",
  "grantName": "LSC Basic Field Grant",
  "reportingPeriodStart": "2026-01-01",
  "reportingPeriodEnd": "2026-03-31",
  "reportType": "quarterly",
  "includeMetrics": [
    "cases_opened",
    "cases_closed",
    "pro_bono_hours",
    "client_demographics"
  ]
}
```

### Response

```json
{
  "report": {
    "organizationName": "Arizona Legal Aid",
    "grantName": "LSC Basic Field Grant",
    "period": "Q1 2026",
    "metrics": {
      "casesOpened": 145,
      "casesClosed": 132,
      "proBonoHours": 423,
      "clientsServed": 198
    },
    "demographics": {...},
    "narrativeSummary": "AI-generated summary..."
  },
  "generatedAt": "2026-01-23T12:00:00Z"
}
```

---

## 5. Embed Widget (`/embed-widget`)

**Auth Required**: No

Serves the embeddable chat widget for partner websites.

### Request

```http
GET /functions/v1/embed-widget?widgetId={widget-id}
```

### Response

Returns HTML/JavaScript for the embeddable widget.

### Widget Configuration

Widgets are configured in the `embed_widgets` table with:
- Custom branding/colors
- Allowed domains
- Rate limiting
- Feature toggles

---

## 6. Send Legal Guide (`/send-legal-guide`)

**Auth Required**: Yes

Send legal education guides via email.

### Request

```http
POST /functions/v1/send-legal-guide
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "guideType": "tenant_rights",
  "jurisdiction": "Arizona",
  "language": "en"
}
```

### Response

```json
{
  "success": true,
  "message": "Legal guide sent successfully",
  "guideId": "guide-uuid"
}
```

---

## 7. ARS Scraper (`/ars-scraper`)

**Auth Required**: Yes (Admin only)

Scrapes Arizona Revised Statutes and generates embeddings.

### Request

```http
POST /functions/v1/ars-scraper
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "titleNumber": "33",
  "chapters": ["10", "11"],
  "generateEmbeddings": true
}
```

### Response

```json
{
  "success": true,
  "sectionsProcessed": 45,
  "embeddingsGenerated": 45,
  "errors": []
}
```

---

## Error Handling

All functions return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid auth token |
| `INVALID_REQUEST` | 400 | Missing required parameters |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `OPENAI_ERROR` | 502 | OpenAI API failure |

---

## Rate Limiting

- **Free tier**: 3 questions per session
- **Authenticated users**: Based on subscription tier
- **Enterprise**: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706000000
```

---

## CORS Configuration

All functions accept requests from any origin (`Access-Control-Allow-Origin: *`).

Required headers for cross-origin requests:
```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info, Apikey
```

---

## Testing with cURL

```bash
# Test OpenAI Chat
curl -X POST \
  'https://qwzpcswjlhxbsghbnkrn.supabase.co/functions/v1/openai-chat' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "messages": [{"role": "user", "content": "What are tenant rights?"}],
    "sessionId": "test-session-123",
    "jurisdiction": "Arizona"
  }'
```

---

## Local Development

Edge Functions source code is in `supabase/functions/`.

To test locally:
1. Install Supabase CLI
2. Run `supabase functions serve`
3. Access at `http://localhost:54321/functions/v1/{function-name}`

Note: Local development requires secrets to be set in `.env.local`.
