import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';
import { supabase } from '../../lib/supabase';
import { multilingualService, LanguageDetection } from './multilingual.service';
import { vectorSearchService, VectorDocument } from '../data/vector-search.service';

export interface ChatContext {
  user: any;
  farms: any[];
  weather: any;
  crops: any[];
  documents: VectorDocument[];
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  language: string;
  confidence: number;
  contextUsed: string[];
  processingTime: number;
  recommendations?: any[];
}

export interface UserProfile {
  user_id: number;
  name: string;
  location: string;
  preferred_language: string;
  farm_size?: number;
  farms: Array<{
    farm_id: number;
    farm_name?: string;
    soil_type?: string;
    ph?: number;
    organic_carbon?: number;
    irrigation_available: boolean;
    farm_area?: number;
    latitude?: number;
    longitude?: number;
  }>;
}

class AgritechChatbotService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  /**
   * Main chat processing function
   */
  async processChatMessage(
    userQuery: string,
    userId: number,
    sessionId: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Detect language
      const languageDetection = await multilingualService.detectLanguage(userQuery);
      const userLanguage = languageDetection.language;

      // Step 2: Get user context
      const userContext = await this.getUserContext(userId);
      
      // Step 3: Retrieve structured data
      const structuredData = await this.retrieveStructuredData(userQuery, userContext);
      
      // Step 4: Retrieve unstructured data (vector search)
      const unstructuredData = await this.retrieveUnstructuredData(userQuery, userLanguage);
      
      // Step 5: Get weather data if location-based query
      const weatherData = await this.getWeatherData(userContext);
      
      // Step 6: Package context
      const context = this.packageContext(
        userContext,
        structuredData,
        unstructuredData,
        weatherData,
        sessionId
      );
      
      // Step 7: Generate response
      const response = await this.generateResponse(userQuery, context, userLanguage);
      
      // Step 8: Store chat history
      await this.storeChatHistory(userId, sessionId, userQuery, response, userLanguage, context);
      
      const processingTime = Date.now() - startTime;

      return {
        response: response.text,
        language: userLanguage,
        confidence: response.confidence,
        contextUsed: context.contextUsed,
        processingTime,
        recommendations: structuredData.recommendations
      };
    } catch (error) {
      console.error('Error processing chat message:', error);
      const fallbackResponse = multilingualService.getFallbackResponse('en');
      
      return {
        response: fallbackResponse,
        language: 'en',
        confidence: 0.1,
        contextUsed: [],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get user context from database
   */
  private async getUserContext(userId: number): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_context', { p_user_id: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Retrieve structured data from PostgreSQL
   */
  private async retrieveStructuredData(userQuery: string, userContext: UserProfile | null): Promise<any> {
    try {
      const queryLower = userQuery.toLowerCase();
      const results: any = {
        crops: [],
        soilInfo: [],
        recommendations: []
      };

      // If user has farm data, get crop recommendations
      if (userContext?.farms && userContext.farms.length > 0) {
        const farm = userContext.farms[0]; // Use first farm for now
        
        if (farm.soil_type && farm.ph) {
          const { data: cropRecommendations, error } = await supabase
            .rpc('get_crops_by_soil_and_climate', {
              p_soil_type: farm.soil_type,
              p_ph: farm.ph,
              p_rainfall: 1000, // Default rainfall
              p_temp_min: 20,   // Default temperature
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
      return { crops: [], soilInfo: [], recommendations: [] };
    }
  }

  /**
   * Retrieve unstructured data using vector search
   */
  private async retrieveUnstructuredData(userQuery: string, language: string): Promise<VectorDocument[]> {
    try {
      const searchResults = await vectorSearchService.searchByTextSimilarity(
        userQuery,
        3,
        'agricultural_knowledge',
        language
      );

      return searchResults.documents;
    } catch (error) {
      console.error('Error retrieving unstructured data:', error);
      return [];
    }
  }

  /**
   * Get weather data for user location
   */
  private async getWeatherData(userContext: UserProfile | null): Promise<any> {
    try {
      if (!userContext?.farms || userContext.farms.length === 0) {
        return null;
      }

      const farm = userContext.farms[0];
      if (!farm.latitude || !farm.longitude) {
        return null;
      }

      // Check cache first
      const locationKey = `${farm.latitude},${farm.longitude}`;
      const { data: cachedWeather, error: cacheError } = await supabase
        .from('weather_cache')
        .select('weather_data')
        .eq('location', locationKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!cacheError && cachedWeather) {
        return cachedWeather.weather_data;
      }

      // Fetch fresh weather data (mock implementation)
      const weatherData = {
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        wind_speed: 12,
        conditions: 'Partly cloudy'
      };

      // Cache the weather data
      await supabase
        .from('weather_cache')
        .upsert({
          location: locationKey,
          latitude: farm.latitude,
          longitude: farm.longitude,
          weather_data: weatherData,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        });

      return weatherData;
    } catch (error) {
      console.error('Error getting weather data:', error);
      return null;
    }
  }

  /**
   * Package all context for AI prompt
   */
  private packageContext(
    userContext: UserProfile | null,
    structuredData: any,
    unstructuredData: VectorDocument[],
    weatherData: any,
    sessionId: string
  ): ChatContext {
    return {
      user: userContext,
      farms: userContext?.farms || [],
      weather: weatherData,
      crops: structuredData.crops,
      documents: unstructuredData,
      sessionId
    };
  }

  /**
   * Generate AI response using Gemini
   */
  private async generateResponse(
    userQuery: string,
    context: ChatContext,
    userLanguage: string
  ): Promise<{ text: string; confidence: number }> {
    try {
      const languageName = multilingualService.getLanguageName(userLanguage);
      
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

      if (context.documents.length > 0) {
        contextString += `\nAgricultural Knowledge:\n`;
        context.documents.forEach((doc, index) => {
          contextString += `${index + 1}. ${doc.title}: ${doc.content.substring(0, 200)}...\n`;
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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Calculate confidence based on context availability
      let confidence = 0.5; // Base confidence
      if (context.user) confidence += 0.2;
      if (context.farms.length > 0) confidence += 0.2;
      if (context.crops.length > 0) confidence += 0.1;
      if (context.documents.length > 0) confidence += 0.1;

      return {
        text: responseText,
        confidence: Math.min(confidence, 1.0)
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        text: multilingualService.getFallbackResponse(userLanguage),
        confidence: 0.1
      };
    }
  }

  /**
   * Store chat history in database
   */
  private async storeChatHistory(
    userId: number,
    sessionId: string,
    userQuery: string,
    response: { text: string; confidence: number },
    userLanguage: string,
    context: ChatContext
  ): Promise<void> {
    try {
      await supabase
        .from('user_history')
        .insert({
          user_id: userId,
          session_id: sessionId,
          query: userQuery,
          query_language: userLanguage,
          response: response.text,
          response_language: userLanguage,
          context_used: JSON.stringify({
            crops: context.crops.length,
            documents: context.documents.length,
            farms: context.farms.length,
            weather: !!context.weather
          }),
          confidence_score: response.confidence,
          processing_time_ms: 0 // Will be updated by caller
        });
    } catch (error) {
      console.error('Error storing chat history:', error);
    }
  }

  /**
   * Get user chat history
   */
  async getUserChatHistory(userId: number, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Create or update user profile
   */
  async createUserProfile(userData: {
    name: string;
    email?: string;
    phone?: string;
    location: string;
    state?: string;
    district?: string;
    preferred_language?: string;
    farm_size?: number;
    farming_experience_years?: number;
  }): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select('user_id')
        .single();

      if (error) throw error;
      return data.user_id;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  /**
   * Add farm to user profile
   */
  async addFarmToUser(
    userId: number,
    farmData: {
      farm_name?: string;
      soil_type?: string;
      ph?: number;
      organic_carbon?: number;
      irrigation_available?: boolean;
      irrigation_type?: string;
      farm_area?: number;
      latitude?: number;
      longitude?: number;
      elevation?: number;
    }
  ): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('user_farms')
        .insert({
          user_id: userId,
          ...farmData
        })
        .select('farm_id')
        .single();

      if (error) throw error;
      return data.farm_id;
    } catch (error) {
      console.error('Error adding farm:', error);
      return null;
    }
  }
}

export const agritechChatbotService = new AgritechChatbotService();
