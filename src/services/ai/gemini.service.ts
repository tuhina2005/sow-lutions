import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';
import { AIResponse } from './types';

class GeminiService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error) {
      console.error('AI Response Error:', error);
      return {
        text: "I apologize, but I'm having trouble processing your request right now.",
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const aiService = new GeminiService();