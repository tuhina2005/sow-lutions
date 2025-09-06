import { supabase } from '../../lib/supabase';

export interface AgriculturalKnowledge {
  id: string;
  title: string;
  content: string;
  summary: string;
  category_id: string;
  tags: string[];
  keywords: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  region?: string;
  crop_type?: string;
  season?: string;
}

export interface AgriculturalFAQ {
  id: string;
  question: string;
  answer: string;
  category_id: string;
  tags: string[];
  keywords: string[];
  region?: string;
  crop_type?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

export interface AgriculturalPractice {
  id: string;
  practice_name: string;
  description: string;
  steps: string[];
  benefits: string[];
  requirements: string[];
  category_id: string;
  crop_type?: string;
  season?: string;
  region?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  keywords: string[];
}

export interface ContextResult {
  knowledge: AgriculturalKnowledge[];
  faqs: AgriculturalFAQ[];
  practices: AgriculturalPractice[];
  matchedCategories: string[];
  confidenceScore: number;
}

class AgriculturalContextService {
  /**
   * Extract keywords from user query for context matching
   */
  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
      'its', 'our', 'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
      'whose', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just', 'now'
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Calculate similarity score between query keywords and content keywords/tags
   */
  private calculateSimilarity(queryKeywords: string[], contentKeywords: string[]): number {
    if (contentKeywords.length === 0) return 0;
    
    const intersection = queryKeywords.filter(keyword => 
      contentKeywords.some(contentKeyword => 
        contentKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(contentKeyword.toLowerCase())
      )
    );
    
    return intersection.length / Math.max(queryKeywords.length, contentKeywords.length);
  }

  /**
   * Fetch relevant agricultural knowledge based on user query
   */
  async getRelevantContext(userQuery: string): Promise<ContextResult> {
    try {
      const keywords = this.extractKeywords(userQuery);
      const queryLower = userQuery.toLowerCase();
      
      console.log('Extracted keywords:', keywords);
      console.log('User query:', userQuery);

      // Build search conditions
      const searchConditions = keywords.map(keyword => 
        `(title ILIKE '%${keyword}%' OR content ILIKE '%${keyword}%' OR summary ILIKE '%${keyword}%')`
      ).join(' OR ');

      // Fetch relevant knowledge
      const { data: knowledge, error: knowledgeError } = await supabase
        .from('agricultural_knowledge')
        .select('*')
        .eq('is_active', true)
        .or(searchConditions || 'false')
        .limit(5);

      if (knowledgeError) {
        console.error('Error fetching knowledge:', knowledgeError);
      }

      // Fetch relevant FAQs
      const { data: faqs, error: faqsError } = await supabase
        .from('agricultural_faqs')
        .select('*')
        .eq('is_active', true)
        .or(searchConditions || 'false')
        .limit(5);

      if (faqsError) {
        console.error('Error fetching FAQs:', faqsError);
      }

      // Fetch relevant practices
      const { data: practices, error: practicesError } = await supabase
        .from('agricultural_practices')
        .select('*')
        .eq('is_active', true)
        .or(searchConditions || 'false')
        .limit(5);

      if (practicesError) {
        console.error('Error fetching practices:', practicesError);
      }

      // Calculate confidence scores and filter results
      const scoredKnowledge = (knowledge || []).map(item => ({
        ...item,
        similarityScore: this.calculateSimilarity(keywords, [...item.tags, ...item.keywords])
      })).filter(item => item.similarityScore > 0.1)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3);

      const scoredFAQs = (faqs || []).map(item => ({
        ...item,
        similarityScore: this.calculateSimilarity(keywords, [...item.tags, ...item.keywords])
      })).filter(item => item.similarityScore > 0.1)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3);

      const scoredPractices = (practices || []).map(item => ({
        ...item,
        similarityScore: this.calculateSimilarity(keywords, [...item.tags, ...item.keywords])
      })).filter(item => item.similarityScore > 0.1)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3);

      // Get matched categories
      const matchedCategories = [
        ...new Set([
          ...scoredKnowledge.map(k => k.category_id),
          ...scoredFAQs.map(f => f.category_id),
          ...scoredPractices.map(p => p.category_id)
        ])
      ];

      // Calculate overall confidence score
      const allScores = [
        ...scoredKnowledge.map(k => k.similarityScore),
        ...scoredFAQs.map(f => f.similarityScore),
        ...scoredPractices.map(p => p.similarityScore)
      ];
      const confidenceScore = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      console.log('Context search results:', {
        knowledgeCount: scoredKnowledge.length,
        faqsCount: scoredFAQs.length,
        practicesCount: scoredPractices.length,
        confidenceScore
      });

      return {
        knowledge: scoredKnowledge,
        faqs: scoredFAQs,
        practices: scoredPractices,
        matchedCategories,
        confidenceScore
      };

    } catch (error) {
      console.error('Error in getRelevantContext:', error);
      return {
        knowledge: [],
        faqs: [],
        practices: [],
        matchedCategories: [],
        confidenceScore: 0
      };
    }
  }

  /**
   * Log chat context usage for analytics
   */
  async logContextUsage(
    userQuery: string, 
    contextUsed: string[], 
    responseGenerated: string,
    categoryMatched: string,
    confidenceScore: number
  ): Promise<void> {
    try {
      await supabase
        .from('chat_context_log')
        .insert({
          user_query: userQuery,
          context_used: contextUsed,
          response_generated: responseGenerated,
          category_matched: categoryMatched,
          confidence_score: confidenceScore
        });
    } catch (error) {
      console.error('Error logging context usage:', error);
    }
  }

  /**
   * Format context for AI prompt
   */
  formatContextForPrompt(context: ContextResult): string {
    let contextString = '';

    if (context.knowledge.length > 0) {
      contextString += '\n\nRELEVANT AGRICULTURAL KNOWLEDGE:\n';
      context.knowledge.forEach((item, index) => {
        contextString += `${index + 1}. ${item.title}\n`;
        contextString += `   Summary: ${item.summary}\n`;
        contextString += `   Content: ${item.content.substring(0, 200)}...\n`;
        if (item.region) contextString += `   Region: ${item.region}\n`;
        if (item.crop_type) contextString += `   Crop: ${item.crop_type}\n`;
        contextString += '\n';
      });
    }

    if (context.faqs.length > 0) {
      contextString += '\n\nRELEVANT FREQUENTLY ASKED QUESTIONS:\n';
      context.faqs.forEach((item, index) => {
        contextString += `${index + 1}. Q: ${item.question}\n`;
        contextString += `   A: ${item.answer}\n`;
        if (item.region) contextString += `   Region: ${item.region}\n`;
        if (item.crop_type) contextString += `   Crop: ${item.crop_type}\n`;
        contextString += '\n';
      });
    }

    if (context.practices.length > 0) {
      contextString += '\n\nRELEVANT AGRICULTURAL PRACTICES:\n';
      context.practices.forEach((item, index) => {
        contextString += `${index + 1}. ${item.practice_name}\n`;
        contextString += `   Description: ${item.description}\n`;
        if (item.steps.length > 0) {
          contextString += `   Steps: ${item.steps.slice(0, 3).join(', ')}\n`;
        }
        if (item.benefits.length > 0) {
          contextString += `   Benefits: ${item.benefits.slice(0, 3).join(', ')}\n`;
        }
        if (item.region) contextString += `   Region: ${item.region}\n`;
        if (item.crop_type) contextString += `   Crop: ${item.crop_type}\n`;
        contextString += '\n';
      });
    }

    return contextString;
  }
}

export const contextService = new AgriculturalContextService();
