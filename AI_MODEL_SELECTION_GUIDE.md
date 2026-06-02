# AI Model Selection Guide

## Overview

All AI-powered tools in ezLegal.ai now support AI model selection, allowing you to choose the best model for your specific needs. Different models offer varying levels of sophistication, speed, and cost-effectiveness.

## Where Model Selection is Available

### Chat Interface (`/chat`)
- Choose your AI model before starting a conversation
- Located prominently in the empty state before your first message
- Change models between conversations for different use cases

### Document Generator (`/documents`)
- Select the AI model when creating custom documents
- Premium models provide more comprehensive and sophisticated legal documents
- Located in the custom document creation form

### All AI-Powered Tools
The model selector is integrated across all features that use AI:
- Legal chat and Q&A
- Document generation and drafting
- Case analysis and predictions
- Negotiation strategy planning
- Research and citations

## Available AI Models

### Free Tier Models

**ChatGPT (GPT-3.5 Turbo)**
- Fast and efficient for general legal questions
- 4,096 token context window
- Best for: Quick questions, general information

**ChatGPT Plus (GPT-3.5 Turbo 16k)**
- Extended context for longer documents
- 16,384 token context window
- Best for: Longer conversations, document review

**ChatGPT 4o mini**
- Cost-effective version of GPT-4o
- 128,000 token context window
- Best for: Balanced performance and cost

**ChatGPT 5 mini & ChatGPT 5 nano**
- Efficient reasoning models
- 128,000+ token context window
- Best for: Quick responses with good quality

### Premium Tier Models

**ChatGPT 4 & ChatGPT 4o**
- Advanced reasoning for complex legal analysis
- Multimodal capabilities (text + images)
- 8,192 - 128,000 token context window
- Best for: Complex legal analysis, document interpretation

**ChatGPT o1 & ChatGPT o3-mini**
- Advanced reasoning models for complex legal problems
- 200,000 token context window
- Deep analysis capabilities
- Best for: Complex legal strategy, multi-issue cases

**ChatGPT 5.x Series (5.2, 5.1)**
- Latest and most sophisticated models
- Premium legal reasoning capabilities
- Enhanced document drafting
- 128,000+ token context window
- **Best for: Sophisticated legal documents, complex analysis, comprehensive research**

## When to Use Which Model

### General Legal Questions
→ **ChatGPT 4o mini** or **ChatGPT Plus**
- Fast responses
- Cost-effective
- Good for straightforward questions

### Complex Legal Analysis
→ **ChatGPT 4o** or **ChatGPT o1**
- Deep reasoning
- Multiple considerations
- Jurisdiction-specific nuances

### Sophisticated Document Drafting
→ **ChatGPT 5.2** or **ChatGPT 5.1**
- Comprehensive documents
- All necessary clauses
- Professional-grade output
- Best for deeds, contracts, agreements

### Document Review & Analysis
→ **ChatGPT 4o** with image support
- Can analyze document images
- Extract key terms
- Identify issues

### Quick Follow-up Questions
→ **ChatGPT 4o mini** or **ChatGPT 5 nano**
- Fast responses
- Lower cost
- Still high quality

## Model Selection UI

### Compact View (Chat)
- Dropdown selector at top of chat
- Shows current model
- Click to see all available models
- Models you can't access are marked with tier requirement

### Full View (Settings)
- Grid layout showing all models
- Detailed descriptions
- Token limits and costs
- Tier requirements clearly marked

## Access Tiers

### Free Tier
Access to:
- ChatGPT
- ChatGPT Plus
- ChatGPT 4o mini
- ChatGPT 5 mini
- ChatGPT 5 nano

### Premium Tier
Access to all Free Tier models plus:
- ChatGPT 4
- ChatGPT 4o
- ChatGPT o1
- ChatGPT o3-mini
- ChatGPT 5.2
- ChatGPT 5.1

### Enterprise Tier
Access to all models plus:
- Priority processing
- Higher rate limits
- Custom model configurations

## Best Practices

### 1. Start with Free Models
Try free models first for most questions. Upgrade to premium only when you need advanced features.

### 2. Use Premium Models for Documents
When generating legal documents, use GPT-5 series models for the most comprehensive output.

### 3. Match Model to Task Complexity
- Simple question? → Free model
- Complex analysis? → Premium model
- Document drafting? → GPT-5 series

### 4. Consider Token Limits
Longer documents and conversations need models with larger context windows:
- Short questions: 4k-16k tokens fine
- Long documents: 128k+ tokens recommended

### 5. Cost vs. Quality Trade-off
Premium models cost more but provide:
- More thorough analysis
- Better document quality
- More nuanced legal reasoning
- Case citations and precedents

## Tips for Document Generation

### For Best Results with GPT-5 Models:
1. Be specific about document requirements
2. Include all relevant details upfront
3. Specify jurisdiction clearly
4. Mention any special clauses needed
5. Review and customize the output

### Expected Output Quality:
- **Free models**: Good basic documents, may need expansion
- **Premium models**: Comprehensive documents with standard clauses
- **GPT-5 series**: Sophisticated documents approaching attorney-drafted quality

## Technical Details

### Token Limits
- Tokens are roughly 4 characters or 0.75 words
- Includes both your input and AI response
- Larger limits allow for longer documents

### Response Times
- Free models: 1-3 seconds typical
- Premium models: 3-8 seconds typical
- GPT-5 models: 5-15 seconds (worth the wait!)

### Cost Tracking
- Usage is tracked per user
- Costs vary by model
- Premium subscribers get allocated usage

## Troubleshooting

### Model Not Available
**Issue**: Model shows as "Premium Required"

**Solution**:
- Upgrade to Premium tier
- Or use a free tier model

### Response Too Short
**Issue**: Document not comprehensive enough

**Solution**:
- Switch to GPT-5 series model
- Add more details in your request
- Specify you need "comprehensive" or "complete" document

### Response Too Long/Cut Off
**Issue**: Response exceeds token limit

**Solution**:
- Use model with larger context window
- Break request into smaller parts
- Use GPT-4o or GPT-5 models (128k+ tokens)

## Admin Configuration

Administrators can manage available models at `/admin` → "AI Model Config":
- Enable/disable specific models
- Set default model
- Adjust tier requirements
- Configure pricing
- Monitor usage

## Frequently Asked Questions

**Q: Will my past conversations work with new models?**
A: Yes, but changing models mid-conversation may affect consistency.

**Q: Can I use different models in the same conversation?**
A: Yes, but not recommended. Each model has different capabilities and "personality."

**Q: Which model is best for my specific legal issue?**
A: For most users: Start with ChatGPT 4o mini. Upgrade to GPT-5 series for documents and complex analysis.

**Q: Are premium models really worth it?**
A: For complex legal work and document drafting, absolutely. The quality difference is significant.

**Q: How do I know which model was used?**
A: The model name is displayed with each AI response.

## Support

Need help choosing the right model?
- Contact support at support@ezlegal.ai
- See examples at `/features`
- Try different models and compare results

## Future Enhancements

Coming soon:
- Model comparison view
- Suggested model per query type
- Usage analytics per model
- Custom model preferences
- Fine-tuned legal models
