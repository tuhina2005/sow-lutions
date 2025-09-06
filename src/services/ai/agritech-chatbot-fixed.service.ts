import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';

interface ChatContext {
  user: any;
  farms: any[];
  crops: any[];
  soilInfo: any[];
  documents: any[];
  weather: any;
  sessionId: string;
}

interface ChatResponse {
  response: string;
  language: string;
  confidence: number;
  processingTime: number;
  contextUsed: any;
}

class AgritechChatbotFixedService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  /**
   * Main function to generate AI response with database context
   */
  async generateResponse(
    userQuery: string,
    userLanguage: string = 'en',
    userId: number = 1,
    sessionId: string = 'default-session'
  ): Promise<{ success: boolean; text?: string; confidence?: number; error?: string; processingTime?: number; contextUsed?: any }> {
    const startTime = Date.now();

    try {
      console.log('🔍 Starting AI response generation...');
      console.log('Query:', userQuery);
      console.log('User ID:', userId);
      console.log('Language:', userLanguage);

      // Step 1: Get user context
      const userContext = await this.getUserContext(userId);
      console.log('User context:', userContext);

      // Step 2: Retrieve structured data
      const structuredData = await this.retrieveStructuredData(userQuery, userContext);
      console.log('Structured data:', structuredData);

      // Step 3: Get weather data
      const weatherData = await this.getWeatherData(userContext);
      console.log('Weather data:', weatherData);

      // Step 4: Package context
      const context = this.packageContext(userContext, structuredData, [], weatherData, sessionId);
      console.log('Packaged context:', context);

      // Step 5: Generate response
      const response = await this.generateAIResponse(userQuery, context, userLanguage);
      console.log('AI response:', response);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        text: response.text,
        confidence: response.confidence,
        processingTime,
        contextUsed: {
          user: !!context.user,
          farms: context.farms.length,
          crops: context.crops.length,
          soilInfo: context.soilInfo.length,
          weather: !!context.weather
        }
      };

    } catch (error) {
      console.error('❌ AI response generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user context from database
   */
  private async getUserContext(userId: number): Promise<any> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.log('No user found, using default context');
        return null;
      }

      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId);

      return {
        user,
        farms: farms || []
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Retrieve structured data based on query
   */
  private async retrieveStructuredData(userQuery: string, userContext: any): Promise<any> {
    const results = {
      crops: [],
      soilInfo: [],
      recommendations: []
    };

    try {
      const queryLower = userQuery.toLowerCase();

      // If user has farm data, get personalized recommendations
      if (userContext?.farms && userContext.farms.length > 0) {
        const farm = userContext.farms[0];
        if (farm.soil_type && farm.ph) {
          const { data: cropRecommendations, error } = await supabase
            .rpc('get_crops_by_soil_and_climate', {
              p_soil_type: farm.soil_type,
              p_ph: farm.ph,
              p_rainfall: 1000,
              p_temp_min: 20,
              p_temp_max: 35
            });

          if (!error && cropRecommendations) {
            results.crops = cropRecommendations;
          }
        }
      }

      // Search for crops based on query keywords
      if (queryLower.includes('crop') || queryLower.includes('बीज') || queryLower.includes('பயிர்')) {
        const { data: crops, error } = await supabase
          .from('crops')
          .select('*')
          .limit(5);

        if (!error && crops) {
          results.crops = [...results.crops, ...crops];
        }
      }

      // Search for soil information
      if (queryLower.includes('soil') || queryLower.includes('मिट्टी') || queryLower.includes('மண்')) {
        const { data: soilInfo, error } = await supabase
          .from('soil_properties')
          .select('*')
          .limit(3);

        if (!error && soilInfo) {
          results.soilInfo = soilInfo;
        }
      }

      return results;
    } catch (error) {
      console.error('Error retrieving structured data:', error);
      return results;
    }
  }

  /**
   * Get weather data for user location
   */
  private async getWeatherData(userContext: any): Promise<any> {
    try {
      if (!userContext?.farms || userContext.farms.length === 0) {
        return null;
      }

      const farm = userContext.farms[0];
      if (!farm.latitude || !farm.longitude) {
        return null;
      }

      // Mock weather data for now
      return {
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        wind_speed: 12,
        conditions: 'Partly cloudy'
      };
    } catch (error) {
      console.error('Error getting weather data:', error);
      return null;
    }
  }

  /**
   * Package context for AI
   */
  private packageContext(
    userContext: any,
    structuredData: any,
    unstructuredData: any[],
    weatherData: any,
    sessionId: string
  ): ChatContext {
    return {
      user: userContext?.user || null,
      farms: userContext?.farms || [],
      crops: structuredData.crops || [],
      soilInfo: structuredData.soilInfo || [],
      documents: unstructuredData || [],
      weather: weatherData,
      sessionId
    };
  }

  /**
   * Generate AI response using Gemini
   */
  private async generateAIResponse(userQuery: string, context: ChatContext, userLanguage: string): Promise<{ text: string; confidence: number }> {
    try {
      const languageName = userLanguage === 'en' ? 'English' : 
                          userLanguage === 'hi' ? 'Hindi' : 
                          userLanguage === 'ta' ? 'Tamil' : 'English';

      // Build context string
      let contextString = '';
      
      if (context.user) {
        contextString += `User Profile:\n`;
        contextString += `- Name: ${context.user.name}\n`;
        contextString += `- Location: ${context.user.location}\n`;
        contextString += `- Farm Size: ${context.user.farm_size || 'Not specified'}\n`;
      }

      if (context.farms.length > 0) {
        contextString += `\nFarm Information:\n`;
        context.farms.forEach((farm, index) => {
          contextString += `- Farm ${index + 1}: ${farm.farm_name || 'Unnamed'}\n`;
          contextString += `  Soil Type: ${farm.soil_type || 'Not specified'}\n`;
          contextString += `  pH: ${farm.ph || 'Not specified'}\n`;
          contextString += `  Irrigation: ${farm.irrigation_available ? 'Available' : 'Not available'}\n`;
        });
      }

      if (context.weather) {
        contextString += `\nCurrent Weather:\n`;
        contextString += `- Temperature: ${context.weather.temperature}°C\n`;
        contextString += `- Humidity: ${context.weather.humidity}%\n`;
        contextString += `- Rainfall: ${context.weather.rainfall}mm\n`;
        contextString += `- Conditions: ${context.weather.conditions}\n`;
      }

      if (context.crops.length > 0) {
        contextString += `\nRelevant Crops:\n`;
        context.crops.slice(0, 3).forEach(crop => {
          contextString += `- ${crop.crop_name} (${crop.crop_name_hindi || ''}): ${crop.season} season, ${crop.soil_type} soil\n`;
        });
      }

      if (context.soilInfo.length > 0) {
        contextString += `\nSoil Information:\n`;
        context.soilInfo.forEach(soil => {
          contextString += `- ${soil.soil_name}: ${soil.texture} texture, ${soil.fertility} fertility\n`;
        });
      }

      const prompt = `You are an expert agricultural advisor specializing in Indian farming practices. Respond to the user's question in ${languageName}. Use the provided context to give accurate, practical agricultural advice.

IMPORTANT INSTRUCTIONS:
- Answer ONLY in ${languageName}
- Use appropriate agricultural terminology in ${languageName}
- Provide specific, actionable advice based on the context
- Include relevant local practices and examples
- If the question is not agriculture-related, politely redirect to agricultural topics
- Be concise but comprehensive
- Always consider the user's location and farm conditions

Context Information:
${contextString}

User Question: ${userQuery}

Response in ${languageName}:`;

      console.log('🔍 Sending prompt to Gemini:', prompt);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Calculate confidence based on context availability
      let confidence = 0.5; // Base confidence
      if (context.user) confidence += 0.2;
      if (context.farms.length > 0) confidence += 0.2;
      if (context.crops.length > 0) confidence += 0.1;
      if (context.soilInfo.length > 0) confidence += 0.1;

      return {
        text: responseText,
        confidence: Math.min(confidence, 1.0)
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        text: `I apologize, but I'm having trouble processing your request right now. Error: ${error}`,
        confidence: 0.1
      };
    }
  }
}

export const agritechChatbotFixedService = new AgritechChatbotFixedService();
