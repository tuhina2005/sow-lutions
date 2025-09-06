# Agricultural Knowledge Base Setup Guide

This guide explains how to set up and use the domain-specific knowledge base for the AgriSmart chatbot.

## Overview

The knowledge base system provides context-aware responses by:
1. Storing agricultural knowledge, FAQs, and best practices in a structured database
2. Matching user queries to relevant content using keyword extraction and similarity scoring
3. Enhancing AI prompts with domain-specific context for more accurate responses

## Database Schema

### Tables Created

1. **agricultural_categories** - Categories for organizing knowledge
2. **agricultural_knowledge** - Detailed agricultural information
3. **agricultural_faqs** - Frequently asked questions and answers
4. **agricultural_practices** - Best practices and procedures
5. **chat_context_log** - Analytics for context usage

### Key Features

- **Tagged Content**: All content is tagged with keywords and categories
- **Regional Specificity**: Content can be tagged with regions (e.g., Tamil Nadu, India)
- **Crop-Specific**: Content can be associated with specific crops
- **Difficulty Levels**: Content categorized by beginner/intermediate/advanced
- **Soft Deletes**: Content is marked as inactive rather than deleted

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration to create the knowledge base tables
supabase db push
```

### 2. Environment Variables

Ensure these environment variables are set:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Test the Implementation

Use the test component to verify the knowledge base is working:

```tsx
import ChatbotTest from './components/test/ChatbotTest';

// Add to your app for testing
<ChatbotTest />
```

## How It Works

### 1. Query Processing

When a user asks a question:
1. Keywords are extracted from the query
2. Database is searched for relevant content
3. Similarity scores are calculated
4. Top matching content is selected

### 2. Context Enhancement

The AI prompt is enhanced with:
- Relevant knowledge articles
- Related FAQs
- Applicable best practices
- Regional and crop-specific information

### 3. Response Generation

The AI generates responses using:
- Domain-specific context from the database
- General agricultural knowledge
- Region-specific guidance (focus on Tamil Nadu/India)

## Adding Content

### Programmatically

```typescript
import { knowledgeService } from './services/knowledge.service';

// Add knowledge
await knowledgeService.addKnowledge({
  title: 'Rice Cultivation Guide',
  content: 'Detailed guide...',
  summary: 'Brief summary...',
  category_id: 'category-uuid',
  tags: ['rice', 'cultivation'],
  keywords: ['rice farming', 'paddy cultivation'],
  difficulty_level: 'intermediate',
  region: 'Tamil Nadu',
  crop_type: 'Rice'
});

// Add FAQ
await knowledgeService.addFAQ({
  question: 'When to plant rice?',
  answer: 'Rice can be planted...',
  category_id: 'category-uuid',
  tags: ['rice', 'planting'],
  keywords: ['rice planting', 'planting time'],
  region: 'Tamil Nadu',
  crop_type: 'Rice',
  difficulty_level: 'beginner'
});
```

### Using the Admin Interface

The `KnowledgeManagement` component provides a UI for managing content:

```tsx
import KnowledgeManagement from './components/admin/KnowledgeManagement';

// Add to your admin panel
<KnowledgeManagement onClose={() => setShowAdmin(false)} />
```

## Configuration

### Context Service Settings

In `src/services/ai/context.service.ts`:

- **Similarity Threshold**: Minimum score for including content (default: 0.1)
- **Max Results**: Maximum items per category (default: 3)
- **Keyword Limit**: Maximum keywords extracted (default: 10)

### AI Service Settings

In `src/services/ai/gemini.service.ts`:

- **Model**: Gemini model version
- **Temperature**: Response creativity (default: 0.7)
- **Max Tokens**: Response length limit

## Analytics

The system tracks:
- Query patterns
- Context usage
- Response effectiveness
- Category popularity

Access analytics via:

```typescript
const analytics = await knowledgeService.getAnalytics();
```

## Best Practices

### Content Creation

1. **Use Clear Titles**: Descriptive titles improve matching
2. **Add Relevant Tags**: Include common terms users might search
3. **Include Keywords**: Add synonyms and related terms
4. **Specify Regions**: Tag content with relevant regions
5. **Set Difficulty**: Help users find appropriate content

### Query Optimization

1. **Test Queries**: Use the test component to verify matching
2. **Monitor Analytics**: Track which content is most used
3. **Update Regularly**: Keep content current and relevant
4. **Regional Focus**: Prioritize Tamil Nadu and Indian agriculture

## Troubleshooting

### Common Issues

1. **No Context Found**: 
   - Check if content is marked as active
   - Verify keywords and tags are relevant
   - Lower similarity threshold if needed

2. **Poor Matching**:
   - Add more keywords to content
   - Improve query specificity
   - Check tag relevance

3. **Database Errors**:
   - Verify Supabase connection
   - Check migration status
   - Ensure proper permissions

### Debug Mode

Enable debug logging in the context service:

```typescript
// In context.service.ts
console.log('Extracted keywords:', keywords);
console.log('Context search results:', results);
```

## Future Enhancements

1. **Machine Learning**: Improve matching with ML models
2. **User Feedback**: Collect feedback on response quality
3. **Content Suggestions**: AI-generated content recommendations
4. **Multi-language**: Support for regional languages
5. **Image Context**: Include image-based knowledge

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database connectivity
3. Test with sample queries
4. Review the analytics data
