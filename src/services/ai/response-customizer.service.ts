/**
 * Response Customizer Service
 * Handles formatting, word limits, and markdown for AI responses
 */

export interface ResponseConfig {
  maxWords: number;
  useMarkdown: boolean;
  includeEmojis: boolean;
  responseStyle: 'concise' | 'detailed' | 'conversational';
  language: string;
}

export interface CustomizedResponse {
  text: string;
  wordCount: number;
  formatted: boolean;
  originalLength: number;
}

export class ResponseCustomizerService {
  private defaultConfig: ResponseConfig = {
    maxWords: 200,
    useMarkdown: true,
    includeEmojis: true,
    responseStyle: 'conversational',
    language: 'en'
  };

  /**
   * Customize AI response with formatting and limits
   */
  customizeResponse(
    response: string, 
    config: Partial<ResponseConfig> = {}
  ): CustomizedResponse {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Clean the response
    let cleanedResponse = this.cleanResponse(response);
    
    // Apply word limit
    const wordLimitedResponse = this.applyWordLimit(cleanedResponse, finalConfig.maxWords);
    
    // Apply markdown formatting
    const formattedResponse = finalConfig.useMarkdown 
      ? this.applyMarkdownFormatting(wordLimitedResponse, finalConfig)
      : wordLimitedResponse;
    
    // Add emojis if enabled
    const finalResponse = finalConfig.includeEmojis 
      ? this.addEmojis(formattedResponse, finalConfig.language)
      : formattedResponse;
    
    return {
      text: finalResponse,
      wordCount: this.countWords(finalResponse),
      formatted: finalConfig.useMarkdown,
      originalLength: response.length
    };
  }

  /**
   * Clean and normalize the response
   */
  private cleanResponse(response: string): string {
    return response
      .trim()
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^\s*[-•]\s*/gm, '• ') // Normalize bullet points
      .replace(/\*\*\s+/g, '**') // Clean bold formatting
      .replace(/\s+\*\*/g, '**') // Clean bold formatting
      .replace(/\*\s+/g, '*') // Clean italic formatting
      .replace(/\s+\*/g, '*'); // Clean italic formatting
  }

  /**
   * Apply word limit to response
   */
  private applyWordLimit(response: string, maxWords: number): string {
    const words = response.split(' ');
    
    if (words.length <= maxWords) {
      return response;
    }
    
    // Truncate to word limit
    const truncatedWords = words.slice(0, maxWords);
    let truncatedResponse = truncatedWords.join(' ');
    
    // Try to end at a complete sentence
    const lastSentenceEnd = Math.max(
      truncatedResponse.lastIndexOf('.'),
      truncatedResponse.lastIndexOf('!'),
      truncatedResponse.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > maxWords * 0.7) { // If we can end at a sentence
      truncatedResponse = truncatedResponse.substring(0, lastSentenceEnd + 1);
    } else {
      // Add ellipsis if we had to cut mid-sentence
      truncatedResponse += '...';
    }
    
    return truncatedResponse;
  }

  /**
   * Apply markdown formatting based on content
   */
  private applyMarkdownFormatting(response: string, config: ResponseConfig): string {
    let formatted = response;
    
    // Format headers
    formatted = formatted.replace(/^([A-Z][^.!?]*[.!?])$/gm, (match) => {
      if (match.length > 50) return `## ${match}`;
      return `### ${match}`;
    });
    
    // Format lists
    formatted = formatted.replace(/^•\s+/gm, '- ');
    formatted = formatted.replace(/^(\d+\.)\s+/gm, '$1 ');
    
    // Format important points
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    formatted = formatted.replace(/\*([^*]+)\*/g, '*$1*');
    
    // Format code/technical terms
    formatted = formatted.replace(/\b(pH|kg|hectare|acres?|°C|mm)\b/g, '`$1`');
    
    // Format crop names and technical terms
    const technicalTerms = [
      'rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'soybean', 'potato', 'tomato',
      'irrigation', 'fertilizer', 'pesticide', 'soil', 'crop', 'yield', 'harvest'
    ];
    
    technicalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      formatted = formatted.replace(regex, `**${term}**`);
    });
    
    return formatted;
  }

  /**
   * Add emojis based on content and language
   */
  private addEmojis(response: string, language: string): string {
    let emojiResponse = response;
    
    // Add emojis for different sections
    emojiResponse = emojiResponse.replace(/^### (.*crop.*)/gim, '🌱 $1');
    emojiResponse = emojiResponse.replace(/^### (.*soil.*)/gim, '🌍 $1');
    emojiResponse = emojiResponse.replace(/^### (.*irrigation.*)/gim, '💧 $1');
    emojiResponse = emojiResponse.replace(/^### (.*fertilizer.*)/gim, '🌿 $1');
    emojiResponse = emojiResponse.replace(/^### (.*weather.*)/gim, '🌤️ $1');
    emojiResponse = emojiResponse.replace(/^### (.*recommendation.*)/gim, '💡 $1');
    emojiResponse = emojiResponse.replace(/^### (.*warning.*)/gim, '⚠️ $1');
    emojiResponse = emojiResponse.replace(/^### (.*tip.*)/gim, '💡 $1');
    
    // Add emojis for lists
    emojiResponse = emojiResponse.replace(/^- /gm, '• ');
    
    // Add emojis for important points
    emojiResponse = emojiResponse.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    
    // Add language-specific emojis
    if (language === 'hi') {
      emojiResponse = emojiResponse.replace(/भारत/g, '🇮🇳 भारत');
      emojiResponse = emojiResponse.replace(/किसान/g, '👨‍🌾 किसान');
    }
    
    return emojiResponse;
  }

  /**
   * Count words in response
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get response statistics
   */
  getResponseStats(response: string): {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
  } {
    const words = response.split(/\s+/).filter(word => word.length > 0);
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = response.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      wordCount: words.length,
      characterCount: response.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length
    };
  }

  /**
   * Create a prompt template with response guidelines
   */
  createResponsePrompt(config: Partial<ResponseConfig> = {}): string {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    let guidelines = `\n\nRESPONSE GUIDELINES:
- Keep response under ${finalConfig.maxWords} words
- Use ${finalConfig.useMarkdown ? 'markdown formatting' : 'plain text'}
- ${finalConfig.includeEmojis ? 'Include relevant emojis' : 'No emojis'}
- Style: ${finalConfig.responseStyle}
- Language: ${finalConfig.language}`;

    if (finalConfig.useMarkdown) {
      guidelines += `\n- Use **bold** for important terms
- Use *italics* for emphasis
- Use ### for section headers
- Use - for bullet points
- Use \`code\` for technical terms`;
    }

    if (finalConfig.includeEmojis) {
      guidelines += `\n- Use 🌱 for crops, 🌍 for soil, 💧 for water
- Use 💡 for tips, ⚠️ for warnings
- Use • for list items`;
    }

    return guidelines;
  }
}

export const responseCustomizerService = new ResponseCustomizerService();
