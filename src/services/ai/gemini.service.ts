import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';
import { AIResponse } from './types';
import { contextService, ContextResult } from './context.service';

class GeminiService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    try {
      // Get relevant context from database
      const context = await contextService.getRelevantContext(prompt);
      
      // Create enhanced prompt with domain context
      const enhancedPrompt = this.createEnhancedPrompt(prompt, context);
      
      console.log('Enhanced prompt created with context confidence:', context.confidenceScore);
      
      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Log the context usage for analytics
      await contextService.logContextUsage(
        prompt,
        [
          ...context.knowledge.map(k => k.title),
          ...context.faqs.map(f => f.question),
          ...context.practices.map(p => p.practice_name)
        ],
        responseText,
        context.matchedCategories.join(', '),
        context.confidenceScore
      );
      
      return { text: responseText };
    } catch (error) {
      console.error('AI Response Error:', error);
      return {
        text: "I apologize, but I'm having trouble processing your request right now.",
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create enhanced prompt with domain-specific context
   */
  private createEnhancedPrompt(userPrompt: string, context: ContextResult): string {
    const basePrompt = `You are AgriSmart Assistant, an expert agricultural advisor specializing in Indian farming practices, particularly Tamil Nadu agriculture. You provide accurate, practical, and region-specific agricultural guidance.

IMPORTANT INSTRUCTIONS:
- Only provide responses related to agriculture, farming, crop management, soil health, pest control, irrigation, and related topics
- Focus on Indian agricultural practices, especially Tamil Nadu
- Provide practical, actionable advice
- Use the provided context to give accurate and specific information
- If the question is not agriculture-related, politely redirect to agricultural topics
- Always cite relevant practices, techniques, or knowledge when applicable

USER QUESTION: ${userPrompt}`;

    // Add context if available
    if (context.confidenceScore > 0.1) {
      const contextString = contextService.formatContextForPrompt(context);
      return basePrompt + contextString + '\n\nPlease provide a comprehensive answer based on the above context and your agricultural expertise.';
    } else {
      return basePrompt + '\n\nPlease provide a helpful agricultural response based on your expertise.';
    }
  }

  async isAgriculturalPrompt(prompt: string): Promise<boolean> {
    try {
      const classificationPrompt = `Is the following text related to agriculture, farming, crop management, soil health, pest control, irrigation, livestock, or any agricultural topic? Answer only with "yes" or "no".\n\nText: "${prompt}"`;
      const result = await this.model.generateContent(classificationPrompt);
      const response = await result.response;
      const text = response.text().trim().toLowerCase();
      console.log('Raw AI classification response:', text);
      return text.includes('yes');
    } catch (error) {
      console.error('Agricultural Prompt Classification Error:', error);
      return false; // Default to false if there's an error
    }
  }
}

export const aiService = new GeminiService();