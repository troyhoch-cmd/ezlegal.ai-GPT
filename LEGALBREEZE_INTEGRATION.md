# ezLegal.ai + Legalbreeze Integration Guide

## Architecture Overview

ezLegal.ai is designed to integrate with Legalbreeze's backend infrastructure as a white-label frontend. The integration leverages:

- **Legalbreeze RAG Pipeline**: FAISS vector store with per-tenant isolation
- **Multi-tier LLM**: GPT-4/Reasoning models with admin-configurable selection
- **Jurisdictional Validation Suite**: Arizona-focused legal compliance
- **Ethical Ingestion Framework**: Compliance metadata and provenance tracking

## Integration Components

### 1. API Bridge (`src/lib/legalbreeze-api.ts`)

Connects to the Legalbreeze Slim API at `/slim-api/data/`:

```typescript
import { legalbreezeAPI } from './lib/legalbreeze-api';

// Send a chat message through the RAG pipeline
const response = await legalbreezeAPI.sendChatMessage({
  query: "What are my tenant rights in Arizona?",
  sessionId: "session-123",
  tenantId: "ezlegal",
  jurisdiction: "Arizona",
  includeCompliance: true
});

// Analyze a document
const analysis = await legalbreezeAPI.analyzeDocument({
  document: file,
  analysisType: 'check_enforceability',
  tenantId: "ezlegal",
  jurisdiction: "Arizona"
});
```

### 2. Tenant Configuration (`src/lib/tenant-config.ts`)

Supports multi-tenant white-labeling with domain detection:

```typescript
import { tenantManager } from './lib/tenant-config';

// Get current tenant
const tenantId = tenantManager.getTenantId();

// Get branding
const { name, primaryColor, logo } = tenantManager.getBranding();

// Check features
if (tenantManager.isFeatureEnabled('enableDocumentAnalysis')) {
  // Show document analysis UI
}
```

### 3. Chat Service (`src/services/chat-service.ts`)

Unified chat interface with optional RAG pipeline:

```typescript
import { chatService } from './services/chat-service';

// Enable RAG pipeline
chatService.setConfig({
  useRAGPipeline: true,
  jurisdiction: 'Arizona',
  includeCompliance: true
});

// Send message
const response = await chatService.sendMessage("What are eviction notice requirements?");
```

## Environment Variables

Add to `.env`:

```env
# Legalbreeze API Configuration
VITE_LEGALBREEZE_API_URL=https://legalbreeze.com/slim-api/data
VITE_ENABLE_RAG_PIPELINE=true

# Tenant Configuration (optional - auto-detected from domain)
VITE_TENANT_ID=ezlegal
```

## Deployment Options

### Option 1: Subdomain Integration

Deploy ezLegal.ai on a subdomain of legalbreeze.com:
- `app.legalbreeze.com` - Main application
- `ezlegal.legalbreeze.com` - ezLegal white-label

The tenant system auto-detects based on hostname.

### Option 2: Standalone Domain

Deploy on ezlegal.ai with API calls to legalbreeze.com:
1. Configure CORS on Legalbreeze API to allow ezlegal.ai
2. Set `VITE_LEGALBREEZE_API_URL` in environment
3. Enable `useRAGPipeline` in chat service config

### Option 3: Iframe Embedding

Embed specific components in Legalbreeze WordPress:

```html
<!-- In WordPress page/post -->
<iframe
  src="https://ezlegal.ai/chatbot?embed=true&tenant=legalbreeze"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

## API Endpoints Required from Legalbreeze

The integration expects these endpoints on the Slim API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send message to RAG pipeline |
| `/document/analyze` | POST | Analyze uploaded documents |
| `/taxonomy` | GET | Get prompt categories/subcategories |
| `/validate/jurisdiction` | POST | Validate query jurisdiction |
| `/compliance/report/{id}` | GET | Get compliance audit report |

### Chat Request Schema

```json
{
  "query": "string",
  "sessionId": "string",
  "tenantId": "string",
  "jurisdiction": "string",
  "category": "string",
  "subcategory": "string",
  "includeCompliance": true
}
```

### Chat Response Schema

```json
{
  "response": "string",
  "citations": [
    {
      "source": "string",
      "title": "string",
      "authorityType": "statute|case_law|regulation|secondary",
      "jurisdiction": "string",
      "url": "string",
      "excerpt": "string"
    }
  ],
  "complianceManifest": {
    "jurisdictionValidated": true,
    "citationComplete": true,
    "biasScreened": true,
    "provenanceHash": "string",
    "enforcementScore": 85,
    "auditTrailId": "string"
  },
  "modelUsed": "gpt-4"
}
```

## Compliance Flow

Based on the Legalbreeze architecture diagram:

1. **Query Analysis**: Categorize user query by practice area
2. **Jurisdiction Validation**: Check against Arizona legal standards
3. **RAG Retrieval**: Search FAISS vectors with compliance facets
4. **Enforceability Check**: Score response against jurisdictional rules
5. **Citation Verification**: Validate provenance and recency
6. **Bias Screening**: Run through ethical content filters
7. **Response Generation**: Multi-tier LLM with inline citations
8. **Audit Trail**: Append-only log with cryptographic hash chain

## Security Considerations

- All API calls should include `X-Tenant-ID` header
- Use HTTPS for all communications
- JWT tokens for authenticated endpoints
- Rate limiting per tenant/user
- AWS WAF protection on Legalbreeze side

## Monitoring & Analytics

Track these metrics for integration health:

- API response times
- RAG pipeline hit rates
- Compliance score distributions
- Citation quality metrics
- User engagement by tenant

## Next Steps

1. Confirm API endpoint availability with Legalbreeze backend team
2. Set up CORS configuration for cross-domain requests
3. Configure tenant-specific branding assets
4. Enable RAG pipeline in production environment
5. Set up monitoring for compliance scores
